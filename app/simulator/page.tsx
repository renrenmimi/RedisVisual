"use client";

// Stop 8 - the Redis fault simulator (UI shell).
//
// All simulation math lives in the pure engine at lib/simulator/engine.ts.
// This component only advances the clock, feeds fault commands in, and renders
// the metrics, cache cells and metric-derived events the engine returns. Event
// copy is produced from measured numbers, so the log can never claim a fix
// worked unless the simulation state actually shows it.

import "./simulator.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useLang, t, type L, type Lang } from "@/lib/i18n";
import { RichText } from "@/lib/glossary";
import { sm } from "@/lib/simulator";
import {
  SIM,
  RANGES,
  DEFAULT_CONFIG,
  DEFAULT_SEED,
  createState,
  tick,
  type SimConfig,
  type SimState,
  type SimEvent,
  type Metrics,
  type Cell,
  type FaultKind,
} from "@/lib/simulator/engine";

// ---------- helpers ----------

// Fill {name} placeholders in a template with measured numbers.
function fmt(l: L, lang: Lang, vars: Record<string, string | number>): string {
  return t(l, lang).replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}

type Point = { hit: number; p99: number };
type LogItem = { id: number; text: L; vars: Record<string, string | number> };
type Tone = "ok" | "amber" | "red" | "neutral";

const EMPTY_METRICS: Metrics = {
  hit: 1,
  avg: SIM.hitLatency,
  p99: SIM.hitLatency,
  dbQps: 0,
  size: 0,
};

const emptyGrid = (): Cell[] =>
  Array.from({ length: SIM.gridCells }, () => ({ state: "empty", frac: 0 }) as Cell);

// Turn one engine event into a localized, measurement-backed log line.
function eventToLog(e: SimEvent): { text: L; vars: Record<string, string | number> } {
  switch (e.kind) {
    case "breakdown":
      return e.absorbed
        ? { text: sm.ev.breakdownAbsorbed, vars: { p99: e.p99 } }
        : { text: sm.ev.breakdown, vars: { db: e.dbQps, p99: e.p99 } };
    case "avalanche":
      // "Spread" wording appears only when the engine measured expiry across
      // more than one tick; otherwise it is honest synchronized expiry.
      return e.spread
        ? {
            text: sm.ev.avalancheSpread,
            vars: { n: e.cohort, span: e.spanTicks, peak: e.peak, hit: e.hit, p99: e.p99 },
          }
        : { text: sm.ev.avalancheSync, vars: { n: e.cohort, hit: e.hit, p99: e.p99 } };
    case "redisDown":
      return { text: sm.ev.redisDown, vars: {} };
    case "redisUp":
      return { text: sm.ev.redisUp, vars: {} };
    case "recovered":
      return { text: sm.ev.recovered, vars: { hit: e.hit, p99: e.p99 } };
  }
}

export default function SimulatorPage() {
  const { lang } = useLang();
  const [config, setConfig] = useState<SimConfig>(DEFAULT_CONFIG);
  const [running, setRunning] = useState(true);

  const [metrics, setMetrics] = useState<Metrics>(EMPTY_METRICS);
  const [history, setHistory] = useState<Point[]>([]);
  const [grid, setGrid] = useState<Cell[]>(emptyGrid);
  const [log, setLog] = useState<LogItem[]>([]);

  // The engine's mutable state lives in a ref; React re-renders from its output.
  const stateRef = useRef<SimState | null>(null);
  if (stateRef.current === null) stateRef.current = createState(DEFAULT_CONFIG, DEFAULT_SEED);

  const cfgRef = useRef<SimConfig>(config);
  cfgRef.current = config;
  const pendingFaultRef = useRef<FaultKind | null>(null);
  const logRef = useRef<LogItem[]>([]);
  const logSeqRef = useRef(0);

  const pushLog = useCallback((text: L, vars: Record<string, string | number>) => {
    const next = [{ id: logSeqRef.current++, text, vars }, ...logRef.current].slice(0, 8);
    logRef.current = next;
    setLog(next);
  }, []);

  const reset = useCallback(() => {
    stateRef.current = createState(cfgRef.current, DEFAULT_SEED);
    logRef.current = [];
    setLog([]);
    setHistory([]);
    setMetrics(EMPTY_METRICS);
    setGrid(emptyGrid());
  }, []);

  const trigger = useCallback(
    (f: FaultKind) => {
      pendingFaultRef.current = f;
      if (!running) setRunning(true);
    },
    [running],
  );

  // The clock: advance one engine tick per interval and render its output.
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const state = stateRef.current;
      if (!state) return;
      const fault = pendingFaultRef.current;
      pendingFaultRef.current = null;

      const out = tick(state, cfgRef.current, fault);

      setMetrics(out.metrics);
      setHistory((h) =>
        [...h, { hit: out.metrics.hit * 100, p99: out.metrics.p99 }].slice(-SIM.historyLen),
      );
      setGrid(out.cells);
      for (const e of out.events) {
        const { text, vars } = eventToLog(e);
        pushLog(text, vars);
      }
    }, SIM.tickMs);

    return () => clearInterval(id);
  }, [running, pushLog]);

  const set = useCallback(
    (patch: Partial<SimConfig>) => setConfig((c) => ({ ...c, ...patch })),
    [],
  );

  // One-click scenarios set the controls and (for faults) queue an injection.
  const runPreset = useCallback((id: string) => {
    if (id === "breakdown") {
      setConfig((c) => ({ ...c, hot: 70, singleFlight: false }));
      setRunning(true);
      window.setTimeout(() => (pendingFaultRef.current = "breakdown"), 700);
    } else if (id === "avalanche") {
      setConfig((c) => ({ ...c, jitter: false, capacity: 180 }));
      setRunning(true);
      window.setTimeout(() => (pendingFaultRef.current = "avalanche"), 700);
    } else if (id === "eviction") {
      setConfig((c) => ({ ...c, capacity: 40, hot: 25, ttl: 12 }));
      setRunning(true);
    } else if (id === "ttl") {
      setConfig((c) => ({ ...c, ttl: 1, capacity: 180, hot: 20 }));
      setRunning(true);
    }
  }, []);

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
        {/* ============ left: controls ============ */}
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

        {/* ============ right: dashboard ============ */}
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
          <Chart title={t(sm.chartLat, lang)} data={history} pick={(p) => p.p99} max={250} tone="accent" unit="ms" />

          <div className="sim8-cache">
            <div className="sim8-cache-head">
              <span>{t(sm.gridTitle, lang)}</span>
              <span className="sim8-legend">
                <i className="sim8-lg hot" />
                {t(sm.legHot, lang)}
                <i className="sim8-lg fresh" />
                {t(sm.legFresh, lang)}
                <i className="sim8-lg expiring" />
                {t(sm.legExpiring, lang)}
                <i className="sim8-lg empty" />
                {t(sm.legEmpty, lang)}
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

      {/* ============ one-click scenarios ============ */}
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

      {/* ============ event log ============ */}
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

      {/* ============ takeaways ============ */}
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

// ---------- presentational pieces ----------

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
    <button type="button" className={`sim8-toggle ${on ? "on" : ""}`} aria-pressed={on} onClick={onClick}>
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
