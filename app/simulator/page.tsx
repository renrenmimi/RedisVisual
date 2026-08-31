"use client";

// 第 8 站「故障模拟器」。
// 一个真正在跑的仿真：每个 tick 按 QPS 生成一批请求，查一个带 TTL + LRU 淘汰的
// 模拟缓存；命中快、未命中回源到 DB（回源过多会排队变慢）。命中率、延迟、DB 压力
// 实时算出来画在右边。左边调参数 / 触发故障 / 开修复开关。
// 所有教学文案在 lib/simulator.ts；这里是引擎 + 界面。

import "./simulator.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useLang, t, type L, type Lang } from "@/lib/i18n";
import { RichText } from "@/lib/glossary";
import { SIM, RANGES, DEFAULT_CONFIG, sm, type SimConfig } from "@/lib/simulator";

// ---------- 小工具 ----------

// 把模板里的 {name} 替换成数字
function fmt(l: L, lang: Lang, vars: Record<string, string | number>): string {
  return t(l, lang).replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}

type Entry = { expireAt: number; lastUsed: number };
type Cell = { state: "empty" | "fresh" | "expiring" | "hot"; frac: number };
type Metrics = { hit: number; avg: number; p99: number; dbQps: number; size: number };
type Point = { hit: number; p99: number };
type LogItem = { id: number; text: L; vars: Record<string, string | number> };
type Fault = "breakdown" | "avalanche" | "redisDown";

type SimState = {
  cache: Map<number, Entry>;
  now: number;
  redisUntil: number;
  pendingFault: Fault | null;
  badTicks: number;
  wasDown: boolean;
  lastAvalancheN: number;
  logSeq: number;
};

const EMPTY_METRICS: Metrics = { hit: 1, avg: SIM.hitLatency, p99: SIM.hitLatency, dbQps: 0, size: 0 };

function freshState(): SimState {
  return {
    cache: new Map(),
    now: 0,
    redisUntil: -1,
    pendingFault: null,
    badTicks: 0,
    wasDown: false,
    lastAvalancheN: 0,
    logSeq: 0,
  };
}

// 预热：开局就填到接近稳态，避免一上来命中率从 0 爬
function prewarm(s: SimState, cfg: SimConfig) {
  s.cache.clear();
  const n = Math.min(cfg.capacity, SIM.keyspace);
  for (let k = 0; k < n; k++) {
    s.cache.set(k, {
      expireAt: s.now + cfg.ttl * 1000 * (0.2 + Math.random() * 0.8),
      lastUsed: s.now - Math.random() * 1000,
    });
  }
  s.cache.set(0, { expireAt: s.now + cfg.ttl * 1000, lastUsed: s.now }); // 热点 key 保证在
}

function pickKey(cfg: SimConfig): number {
  if (Math.random() * 100 < cfg.hot) return 0; // 热点 key = 0
  return 1 + Math.floor(Math.random() * (SIM.keyspace - 1));
}

export default function SimulatorPage() {
  const { lang } = useLang();
  const [config, setConfig] = useState<SimConfig>(DEFAULT_CONFIG);
  const [running, setRunning] = useState(true);

  const [metrics, setMetrics] = useState<Metrics>(EMPTY_METRICS);
  const [history, setHistory] = useState<Point[]>([]);
  const [grid, setGrid] = useState<Cell[]>(() =>
    Array.from({ length: SIM.gridCells }, () => ({ state: "empty", frac: 0 }) as Cell),
  );
  const [log, setLog] = useState<LogItem[]>([]);

  const simRef = useRef<SimState>(freshState());
  const cfgRef = useRef<SimConfig>(config);
  cfgRef.current = config;
  const logRef = useRef<LogItem[]>([]);

  const pushLog = useCallback((text: L, vars: Record<string, string | number> = {}) => {
    const s = simRef.current;
    const next = [{ id: s.logSeq++, text, vars }, ...logRef.current].slice(0, 8);
    logRef.current = next;
    setLog(next);
  }, []);

  // 开局预热一次
  useEffect(() => {
    prewarm(simRef.current, cfgRef.current);
  }, []);

  const reset = useCallback(() => {
    simRef.current = freshState();
    prewarm(simRef.current, cfgRef.current);
    logRef.current = [];
    setLog([]);
    setHistory([]);
    setMetrics(EMPTY_METRICS);
    setGrid(Array.from({ length: SIM.gridCells }, () => ({ state: "empty", frac: 0 }) as Cell));
  }, []);

  const trigger = useCallback((f: Fault) => {
    simRef.current.pendingFault = f;
    if (!running) setRunning(true);
  }, [running]);

  // ---------- 主循环 ----------
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const cfg = cfgRef.current;
      const s = simRef.current;
      s.now += SIM.tickMs;

      // 1) 应用待处理故障（在 tick 开头，和仿真时钟对齐）
      const fault = s.pendingFault;
      s.pendingFault = null;
      if (fault === "redisDown") {
        s.redisUntil = s.now + SIM.redisDownMs;
      } else if (fault === "breakdown") {
        const e = s.cache.get(0);
        if (e) e.expireAt = s.now; // 让热点 key 立刻过期
      } else if (fault === "avalanche") {
        const keys = [...s.cache.keys()].filter((k) => k !== 0);
        for (let i = keys.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [keys[i], keys[j]] = [keys[j], keys[i]];
        }
        const n = Math.floor(keys.length * SIM.avalancheFrac);
        for (let i = 0; i < n; i++) {
          const e = s.cache.get(keys[i]);
          if (e) e.expireAt = s.now;
        }
        s.lastAvalancheN = n;
      }

      const down = s.now < s.redisUntil;

      // 2) 生成这一批请求，对「tick 开始时」的缓存状态做判定（并发批次，不中途回填）
      const reqs = Math.max(1, Math.round((cfg.qps * SIM.tickMs) / 1000));
      let hits = 0;
      const missedKeys = new Set<number>();
      const hitKeys = new Set<number>();
      for (let r = 0; r < reqs; r++) {
        const key = pickKey(cfg);
        const e = s.cache.get(key);
        if (!down && e && e.expireAt > s.now) {
          hits++;
          hitKeys.add(key);
        } else {
          missedKeys.add(key);
        }
      }
      const misses = reqs - hits;

      // 3) 算 DB 回源量：单飞把「同一个 key 的并发回源」压成 1 次
      const dbCalls = down ? misses : cfg.singleFlight ? missedKeys.size : misses;
      const overload = Math.max(0, dbCalls - SIM.dbCapacity) / SIM.dbCapacity;
      const dbLat = SIM.dbBaseLatency * (1 + overload * SIM.overloadK);
      const avg = (hits * SIM.hitLatency + misses * dbLat) / reqs;
      const hitRate = hits / reqs;
      const p99 = 1 - hitRate >= 0.01 ? dbLat : SIM.hitLatency;
      const dbQps = Math.round(dbCalls * (1000 / SIM.tickMs));

      // 4) 更新缓存：命中的刷新 lastUsed；未命中的回填一次；超容量按 LRU 淘汰
      for (const k of hitKeys) {
        const e = s.cache.get(k);
        if (e) e.lastUsed = s.now;
      }
      if (!down) {
        for (const k of missedKeys) {
          const jitter = cfg.jitter ? 0.6 + Math.random() * 0.8 : 1; // ±40%
          s.cache.set(k, { expireAt: s.now + cfg.ttl * 1000 * jitter, lastUsed: s.now });
        }
        while (s.cache.size > cfg.capacity) {
          let lruKey = -1;
          let lruTime = Infinity;
          for (const [k, e] of s.cache) {
            if (e.lastUsed < lruTime) {
              lruTime = e.lastUsed;
              lruKey = k;
            }
          }
          if (lruKey === -1) break;
          s.cache.delete(lruKey);
        }
      }

      // 5) 事件日志：故障后果 / 宕机恢复 / 稳态恢复
      const iHit = Math.round(hitRate * 100);
      const iP99 = Math.round(p99);
      if (fault === "breakdown") {
        pushLog(cfg.singleFlight ? sm.ev.breakdownSafe : sm.ev.breakdown, { db: dbQps, p99: iP99 });
      } else if (fault === "avalanche") {
        pushLog(cfg.jitter ? sm.ev.avalancheSafe : sm.ev.avalanche, {
          n: s.lastAvalancheN,
          hit: iHit,
          p99: iP99,
        });
      } else if (fault === "redisDown") {
        pushLog(sm.ev.redisDown, {});
      }
      if (s.wasDown && !down) pushLog(sm.ev.redisUp, {});
      s.wasDown = down;

      const bad = p99 > 60 || hitRate < 0.6;
      if (bad) {
        s.badTicks++;
      } else {
        if (s.badTicks >= 6) pushLog(sm.ev.recovered, { hit: iHit, p99: iP99 });
        s.badTicks = 0;
      }

      // 6) 输出给界面
      setMetrics({ hit: hitRate, avg, p99, dbQps, size: s.cache.size });
      setHistory((h) => [...h, { hit: hitRate * 100, p99 }].slice(-SIM.historyLen));

      const cells: Cell[] = [];
      const ttlMs = cfg.ttl * 1000;
      for (let k = 0; k < SIM.gridCells; k++) {
        const e = s.cache.get(k);
        if (!e || e.expireAt <= s.now) {
          cells.push({ state: "empty", frac: 0 });
        } else {
          const frac = Math.max(0, Math.min(1, (e.expireAt - s.now) / ttlMs));
          const state = k === 0 ? "hot" : frac < 0.25 ? "expiring" : "fresh";
          cells.push({ state, frac });
        }
      }
      setGrid(cells);
    }, SIM.tickMs);

    return () => clearInterval(id);
  }, [running, pushLog]);

  // ---------- 预设剧本 ----------
  const runPreset = useCallback(
    (id: string) => {
      if (id === "breakdown") {
        setConfig((c) => ({ ...c, hot: 70, singleFlight: false, jitter: c.jitter }));
        setRunning(true);
        window.setTimeout(() => (simRef.current.pendingFault = "breakdown"), 700);
      } else if (id === "avalanche") {
        setConfig((c) => ({ ...c, jitter: false, capacity: 180 }));
        setRunning(true);
        window.setTimeout(() => (simRef.current.pendingFault = "avalanche"), 700);
      } else if (id === "eviction") {
        setConfig((c) => ({ ...c, capacity: 40, hot: 25, ttl: 12 }));
        setRunning(true);
      } else if (id === "ttl") {
        setConfig((c) => ({ ...c, ttl: 1, capacity: 180, hot: 20 }));
        setRunning(true);
      }
    },
    [],
  );

  const set = useCallback(
    (patch: Partial<SimConfig>) => setConfig((c) => ({ ...c, ...patch })),
    [],
  );

  return (
    <main className="page">
      <header className="header">
        <div>
          <h1 className="page-title">{t(sm.title, lang)}</h1>
          <p className="subtitle">{t(sm.subtitle, lang)}</p>
        </div>
      </header>

      <section className="narration appear">
        <div className="n-head">
          <span className="n-step">SIM</span>
          <h2>{t(sm.introTitle, lang)}</h2>
        </div>
        <p className="n-body">
          <RichText text={t(sm.intro, lang)} lang={lang} />
        </p>
      </section>

      <div className="sim8-grid">
        {/* ============ 左：控制台 ============ */}
        <section className="sim8-panel sim8-controls">
          <div className="sim8-panel-title">{t(sm.ctrlTitle, lang)}</div>

          <Slider
            label={t(sm.qpsLabel, lang)}
            value={config.qps}
            display={`${config.qps.toLocaleString()}`}
            range={RANGES.qps}
            onChange={(v) => set({ qps: v })}
          />
          <Slider
            label={t(sm.ttlLabel, lang)}
            value={config.ttl}
            display={`${config.ttl}s`}
            range={RANGES.ttl}
            onChange={(v) => set({ ttl: v })}
          />
          <Slider
            label={t(sm.capLabel, lang)}
            value={config.capacity}
            display={`${config.capacity} / ${SIM.keyspace}`}
            range={RANGES.capacity}
            onChange={(v) => set({ capacity: v })}
          />
          <Slider
            label={t(sm.hotLabel, lang)}
            value={config.hot}
            display={`${config.hot}%`}
            range={RANGES.hot}
            onChange={(v) => set({ hot: v })}
          />

          <div className="sim8-sub">{t(sm.fixesTitle, lang)}</div>
          <Toggle
            on={config.jitter}
            label={t(sm.jitterLabel, lang)}
            hint={t(sm.jitterHint, lang)}
            onClick={() => set({ jitter: !config.jitter })}
          />
          <Toggle
            on={config.singleFlight}
            label={t(sm.sfLabel, lang)}
            hint={t(sm.sfHint, lang)}
            onClick={() => set({ singleFlight: !config.singleFlight })}
          />

          <div className="sim8-sub">{t(sm.faultsTitle, lang)}</div>
          <FaultBtn
            label={t(sm.faultBreakdown, lang)}
            hint={t(sm.faultBreakdownHint, lang)}
            tone="amber"
            onClick={() => trigger("breakdown")}
          />
          <FaultBtn
            label={t(sm.faultAvalanche, lang)}
            hint={t(sm.faultAvalancheHint, lang)}
            tone="red"
            onClick={() => trigger("avalanche")}
          />
          <FaultBtn
            label={t(sm.faultRedisDown, lang)}
            hint={t(sm.faultRedisDownHint, lang)}
            tone="red"
            onClick={() => trigger("redisDown")}
          />

          <div className="sim8-runbar">
            <button className="btn btn-primary" onClick={() => setRunning((r) => !r)}>
              {running ? t(sm.pause, lang) : t(sm.run, lang)}
            </button>
            <button className="btn" onClick={reset}>
              {t(sm.reset, lang)}
            </button>
          </div>
        </section>

        {/* ============ 右：仪表盘 ============ */}
        <section className="sim8-dash">
          <div className="sim8-tiles">
            <Tile label={t(sm.mHit, lang)} value={`${Math.round(metrics.hit * 100)}%`} tone={hitTone(metrics.hit)} />
            <Tile label={t(sm.mLat, lang)} value={`${Math.round(metrics.avg)}ms`} tone={latTone(metrics.avg)} />
            <Tile label={t(sm.mP99, lang)} value={`${Math.round(metrics.p99)}ms`} tone={latTone(metrics.p99)} />
            <Tile
              label={t(sm.mDb, lang)}
              value={`${metrics.dbQps.toLocaleString()}${t(sm.mDbUnit, lang)}`}
              tone={metrics.dbQps > SIM.dbCapacity * (1000 / SIM.tickMs) ? "red" : "ok"}
            />
            <Tile label={t(sm.mCache, lang)} value={`${metrics.size} / ${config.capacity}`} tone="neutral" />
          </div>

          <Chart title={t(sm.chartHit, lang)} data={history} pick={(p) => p.hit} max={100} tone="teal" unit="%" invert />
          <Chart
            title={t(sm.chartLat, lang)}
            data={history}
            pick={(p) => p.p99}
            max={250}
            tone="accent"
            unit="ms"
          />

          <div className="sim8-cache">
            <div className="sim8-cache-head">
              <span>{t(sm.gridTitle, lang)}</span>
              <span className="sim8-legend">
                <i className="sim8-lg hot" />{t(sm.legHot, lang)}
                <i className="sim8-lg fresh" />{t(sm.legFresh, lang)}
                <i className="sim8-lg expiring" />{t(sm.legExpiring, lang)}
                <i className="sim8-lg empty" />{t(sm.legEmpty, lang)}
              </span>
            </div>
            <div className="sim8-cellwrap">
              {grid.map((c, i) => (
                <span
                  key={i}
                  className={`sim8-cell ${c.state}`}
                  style={c.state === "fresh" ? { opacity: 0.4 + c.frac * 0.6 } : undefined}
                />
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ============ 预设剧本 ============ */}
      <section className="sim8-presets">
        <div className="sim8-panel-title">{t(sm.presetsTitle, lang)}</div>
        <div className="sim8-preset-grid">
          {sm.presets.map((p) => (
            <button key={p.id} className="sim8-preset" onClick={() => runPreset(p.id)}>
              <span className="sim8-preset-name">{t(p.name, lang)}</span>
              <span className="sim8-preset-desc">{t(p.desc, lang)}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ============ 事件日志 ============ */}
      <section className="sim8-log">
        <div className="sim8-panel-title">{t(sm.logTitle, lang)}</div>
        {log.length === 0 ? (
          <div className="sim8-log-empty">{t(sm.logEmpty, lang)}</div>
        ) : (
          <ul>
            {log.map((it) => (
              <li key={it.id} className="appear">
                {fmt(it.text, lang, it.vars)}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ============ 小结 ============ */}
      <section className="sim8-takeaway">
        <div className="sim8-panel-title">{t(sm.takeawayTitle, lang)}</div>
        <ul>
          {sm.takeaways.map((li, i) => (
            <li key={i}>
              <RichText text={t(li, lang)} lang={lang} />
            </li>
          ))}
        </ul>
      </section>

      <div className="sim8-next">
        <Link href="/" className="btn">
          {t(sm.backToStart, lang)}
        </Link>
      </div>
    </main>
  );
}

// ---------- 界面积木 ----------

function hitTone(hit: number): Tone {
  if (hit >= 0.9) return "ok";
  if (hit >= 0.6) return "amber";
  return "red";
}
function latTone(ms: number): Tone {
  if (ms <= 10) return "ok";
  if (ms <= 60) return "amber";
  return "red";
}

type Tone = "ok" | "amber" | "red" | "neutral";

function Tile({ label, value, tone }: { label: string; value: string; tone: Tone }) {
  return (
    <div className={`sim8-tile ${tone}`}>
      <span className="sim8-tile-val">{value}</span>
      <span className="sim8-tile-lbl">{label}</span>
    </div>
  );
}

function Slider({
  label,
  value,
  display,
  range,
  onChange,
}: {
  label: string;
  value: number;
  display: string;
  range: { min: number; max: number; step: number };
  onChange: (v: number) => void;
}) {
  return (
    <label className="sim8-slider">
      <span className="sim8-slider-top">
        <span>{label}</span>
        <span className="sim8-slider-val">{display}</span>
      </span>
      <input
        type="range"
        min={range.min}
        max={range.max}
        step={range.step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

function Toggle({
  on,
  label,
  hint,
  onClick,
}: {
  on: boolean;
  label: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`sim8-toggle ${on ? "on" : ""}`}
      aria-pressed={on}
      onClick={onClick}
    >
      <span className="sim8-toggle-knob" aria-hidden />
      <span className="sim8-toggle-text">
        <span className="sim8-toggle-label">{label}</span>
        <span className="sim8-toggle-hint">{hint}</span>
      </span>
    </button>
  );
}

function FaultBtn({
  label,
  hint,
  tone,
  onClick,
}: {
  label: string;
  hint: string;
  tone: "amber" | "red";
  onClick: () => void;
}) {
  return (
    <button type="button" className={`sim8-fault ${tone}`} onClick={onClick}>
      <span className="sim8-fault-label">{label}</span>
      <span className="sim8-fault-hint">{hint}</span>
    </button>
  );
}

function Chart({
  title,
  data,
  pick,
  max,
  tone,
  unit,
  invert,
}: {
  title: string;
  data: Point[];
  pick: (p: Point) => number;
  max: number;
  tone: "teal" | "accent";
  unit: string;
  invert?: boolean;
}) {
  const W = 100;
  const H = 40;
  const last = data.length ? pick(data[data.length - 1]) : 0;
  const points = useMemo(() => {
    if (data.length < 2) return "";
    const n = SIM.historyLen;
    return data
      .map((p, i) => {
        const x = (i / (n - 1)) * W;
        const v = Math.max(0, Math.min(max, pick(p)));
        const y = H - (v / max) * H;
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(" ");
  }, [data, max, pick]);

  // 用最新值决定线的颜色档位（红/黄/绿）
  const level = invert
    ? last >= max * 0.9
      ? "ok"
      : last >= max * 0.6
        ? "amber"
        : "red"
    : last <= max * 0.08
      ? "ok"
      : last <= max * 0.28
        ? "amber"
        : "red";

  return (
    <div className={`sim8-chart ${tone}`}>
      <div className="sim8-chart-head">
        <span>{title}</span>
        <span className={`sim8-chart-now ${level}`}>
          {Math.round(last)}
          {unit}
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="sim8-chart-svg">
        <polyline className={`sim8-line ${level}`} points={points} />
      </svg>
    </div>
  );
}
