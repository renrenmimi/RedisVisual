"use client";

// 第 2 站「我们为什么用 Redis」。
// 结构：顶部系统背景条 + 三个场景 tab（点击切换）+ 单步推进的动画走查 + 面试口径卡。
// 文案全部来自 lib/scenarios.ts；这里只负责把每一步渲染成会动的画面。
// 每步的舞台用 key 重挂载，所以流动 / 入场动画会随推进重播一次。

import { useEffect, useState } from "react";
import Link from "next/link";
import { scenarios, intro, meta, type Scenario } from "@/lib/scenarios";
import { useLang, t, type Lang } from "@/lib/i18n";
import { RichText } from "@/lib/glossary";
import "./scenarios.css";

// carrier 报价延迟（场景 A 反复用到）
const CARRIERS: { nm: string; lat: string; slow?: boolean }[] = [
  { nm: "USPS", lat: "~300ms" },
  { nm: "FedEx", lat: "~800ms" },
  { nm: "UPS", lat: ">1s", slow: true },
  { nm: "Amazon", lat: "~700ms" },
];

export default function ScenariosPage() {
  const { lang } = useLang();
  const [tab, setTab] = useState(0);
  const [cursor, setCursor] = useState(0);
  const [auto, setAuto] = useState(false);

  const scenario = scenarios[tab];
  const steps = scenario.steps;
  const step = steps[cursor];
  const atEnd = cursor >= steps.length - 1;
  const nextAction = atEnd ? null : steps[cursor + 1].action;

  const pickTab = (i: number) => {
    setTab(i);
    setCursor(0);
    setAuto(false);
  };

  // 自动播放：给足阅读时间
  useEffect(() => {
    if (!auto) return;
    if (cursor >= steps.length - 1) {
      setAuto(false);
      return;
    }
    const id = setTimeout(
      () => setCursor((c) => Math.min(c + 1, steps.length - 1)),
      5200,
    );
    return () => clearTimeout(id);
  }, [auto, cursor, steps.length]);

  // 键盘：→ / 空格推进，← 回退（本场景内）
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "BUTTON" || tag === "INPUT" || tag === "TEXTAREA" || tag === "A")
        return;
      if (e.key === " " || e.key === "ArrowRight") {
        e.preventDefault();
        setCursor((c) => Math.min(c + 1, steps.length - 1));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCursor((c) => Math.max(c - 1, 0));
        setAuto(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [steps.length]);

  const stepLabel =
    lang === "zh" ? `第 ${cursor + 1} 步` : `STEP ${cursor + 1}`;

  return (
    <main className="page">
      <header className="header">
        <div>
          <h1 className="page-title">{t(meta.title, lang)}</h1>
          <p className="subtitle">{t(meta.subtitle, lang)}</p>
        </div>
        <div
          className="progress"
          aria-label={t({ zh: "进度", en: "Progress" }, lang)}
        >
          {steps.map((s, i) => (
            <button
              key={i}
              className={`pdot ${i < cursor ? "done" : ""} ${i === cursor ? "cur" : ""}`}
              onClick={() => {
                setCursor(i);
                setAuto(false);
              }}
              title={`${i + 1}. ${t(s.title, lang)}`}
              aria-label={`${i + 1}. ${t(s.title, lang)}`}
            />
          ))}
        </div>
      </header>

      {/* 顶部系统背景 */}
      <section className="sc2-lede">
        <div className="sc2-lede-kicker">{t(intro.kicker, lang)}</div>
        <h2>{t(intro.title, lang)}</h2>
        <p>
          <RichText text={t(intro.text, lang)} lang={lang} />
        </p>
      </section>

      {/* 场景切换 tab */}
      <div
        className="sc2-tabs"
        role="tablist"
        aria-label={t({ zh: "场景", en: "Scenarios" }, lang)}
      >
        {scenarios.map((s, i) => (
          <button
            key={s.id}
            role="tab"
            aria-selected={i === tab}
            className={`sc2-tab ${i === tab ? "on" : ""}`}
            onClick={() => pickTab(i)}
          >
            <span className="sc2-tab-top">
              <span className="sc2-tab-letter">{t(s.tab, lang)}</span>
              <span className="sc2-tab-name">{t(s.name, lang)}</span>
            </span>
            <span className="sc2-tab-kicker">{t(s.kicker, lang)}</span>
          </button>
        ))}
      </div>

      {/* 讲解卡 */}
      <section className="narration appear" key={`n-${scenario.id}-${cursor}-${lang}`}>
        <div className="n-head">
          <span className="n-step">
            {stepLabel}
            <i>/{steps.length}</i>
          </span>
          <h2>{t(step.title, lang)}</h2>
        </div>
        <p className="n-body">
          <RichText text={t(step.text, lang)} lang={lang} />
        </p>
      </section>

      {/* 动画舞台 */}
      <section
        className="stage-panel appear"
        key={`s-${scenario.id}-${cursor}-${lang}`}
      >
        <div className="stage">
          <Stage id={scenario.id} phase={step.phase} lang={lang} />
          <div className="stage-caption">{t(step.caption, lang)}</div>
        </div>
      </section>

      {/* 面试口径 */}
      <section className="sc2-iv" key={`iv-${scenario.id}-${lang}`}>
        <div className="sc2-iv-col good">
          <div className="sc2-iv-title">
            <span className="sc2-iv-dot" />
            {t(meta.ivGood, lang)}
          </div>
          <ul className="sc2-iv-list">
            {scenario.interview.good.map((li, i) => (
              <li key={i}>
                <RichText text={t(li, lang)} lang={lang} />
              </li>
            ))}
          </ul>
        </div>
        <div className="sc2-iv-col honest">
          <div className="sc2-iv-title">
            <span className="sc2-iv-dot" />
            {t(meta.ivHonest, lang)}
          </div>
          <ul className="sc2-iv-list">
            {scenario.interview.honest.map((li, i) => (
              <li key={i}>
                <RichText text={t(li, lang)} lang={lang} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 控制条 */}
      <div className="controls">
        <button
          className="btn"
          onClick={() => {
            setCursor((c) => Math.max(c - 1, 0));
            setAuto(false);
          }}
          disabled={cursor === 0}
          aria-label={t({ zh: "上一步", en: "Previous step" }, lang)}
        >
          ←
        </button>
        {nextAction ? (
          <button
            className="btn btn-primary"
            onClick={() => setCursor((c) => Math.min(c + 1, steps.length - 1))}
          >
            {t(nextAction, lang)}
          </button>
        ) : (
          <span className="hint" style={{ marginLeft: 0 }}>
            {t(meta.stepDone, lang)}
          </span>
        )}
        <button
          className="btn"
          onClick={() => setAuto((a) => !a)}
          disabled={atEnd}
        >
          {auto ? t(meta.pause, lang) : t(meta.autoplay, lang)}
        </button>
        <span className="hint">
          <kbd>→</kbd> {t(meta.kbdStep, lang)} · <kbd>←</kbd> {t(meta.kbdBack, lang)}
        </span>
      </div>

      {/* 下一站 */}
      <div className="sc2-next">
        <Link className="btn btn-primary" href="/pitfalls">
          {t(meta.next, lang)}
        </Link>
      </div>
    </main>
  );
}

/* ======================= 舞台积木 ======================= */

type Pkt = { kind: "req" | "res"; label: string; delay: number };

function Lane({ packets }: { packets?: Pkt[] }) {
  return (
    <div className="sc2-lane">
      {packets?.map((p, i) => (
        <span
          key={i}
          className={`sc2-pkt sc2-${p.kind}`}
          style={{ animationDelay: `${p.delay}s` }}
        >
          {p.label}
        </span>
      ))}
    </div>
  );
}

function FlowNode(props: {
  ico: string;
  nm: string;
  sub?: string;
  state?: string;
  badge?: { text: string; kind: "ok" | "bad" };
}) {
  return (
    <div className={`sc2-node ${props.state ?? ""}`}>
      {props.badge && (
        <span className={`sc2-badge ${props.badge.kind}`}>{props.badge.text}</span>
      )}
      <span className="sc2-ico" aria-hidden>
        {props.ico}
      </span>
      <span className="sc2-nm">{props.nm}</span>
      {props.sub && <span className="sc2-sub">{props.sub}</span>}
    </div>
  );
}

function Carriers({ mode }: { mode: "idle" | "calling" | "dim" }) {
  return (
    <div className="sc2-carriers">
      {CARRIERS.map((c, i) => (
        <div
          key={c.nm}
          className={`sc2-carrier ${mode === "calling" ? "sc2-calling" : ""} ${mode === "dim" ? "sc2-dim" : ""}`}
          style={mode === "calling" ? { animationDelay: `${i * 0.15}s` } : undefined}
        >
          <span className="sc2-carrier-nm">{c.nm}</span>
          <span className={`sc2-lat ${c.slow ? "slow" : ""}`}>{c.lat}</span>
        </div>
      ))}
    </div>
  );
}

/* ======================= 舞台总入口 ======================= */

function Stage({
  id,
  phase,
  lang,
}: {
  id: Scenario["id"];
  phase: string;
  lang: Lang;
}) {
  const zh = lang === "zh";
  if (id === "rate") return <RateStage phase={phase} zh={zh} />;
  if (id === "idem") return <IdemStage phase={phase} zh={zh} />;
  return <BalanceStage phase={phase} zh={zh} />;
}

/* ---------- 场景 A：运费报价缓存 ---------- */

function RateStage({ phase, zh }: { phase: string; zh: boolean }) {
  const fe = zh ? "前端" : "Frontend";

  if (phase === "why") {
    return (
      <div className="sc2-board">
        <div className="sc2-rail">
          <FlowNode ico="🖥️" nm={fe} sub="React · Apollo" />
          <Lane />
          <FlowNode ico="🧩" nm="GraphQL BFF" />
          <Lane />
          <FlowNode ico="⚡" nm="Redis" state="sc2-redis" />
        </div>
        <div className="sc2-fan">
          <span className="sc2-fan-note">
            {zh ? "每次未命中都要问这 4 家，等最慢的 ↓" : "every miss asks all four and waits for the slowest ↓"}
          </span>
          <Carriers mode="calling" />
        </div>
      </div>
    );
  }

  if (phase === "miss") {
    return (
      <div className="sc2-board">
        <div className="sc2-rail">
          <FlowNode ico="🖥️" nm={fe} sub="React · Apollo" state="sc2-on" />
          <Lane packets={[{ kind: "req", label: zh ? "报价?" : "rate?", delay: 0 }]} />
          <FlowNode ico="🧩" nm="GraphQL BFF" state="sc2-on" />
          <Lane packets={[{ kind: "req", label: "GET", delay: 0.9 }]} />
          <FlowNode
            ico="⚡"
            nm="Redis"
            state="sc2-redis sc2-miss"
            badge={{ text: "MISS", kind: "bad" }}
          />
        </div>
        <div className="sc2-vlink">
          ↓<small>{zh ? "回源" : "fall back"}</small>
        </div>
        <div className="sc2-fan">
          <span className="sc2-fan-note">
            {zh ? "BFF 并发调 4 家 carrier，等最慢的" : "BFF calls 4 carriers in parallel and waits for the slowest"}
          </span>
          <Carriers mode="calling" />
          <span className="sc2-agg">
            {zh ? "聚合 4 份报价 ≈ 1.2s" : "aggregate 4 quotes ≈ 1.2s"}
          </span>
        </div>
      </div>
    );
  }

  if (phase === "write") {
    return (
      <div className="sc2-board">
        <div className="sc2-rail">
          <FlowNode ico="🧩" nm="GraphQL BFF" state="sc2-on" />
          <Lane packets={[{ kind: "req", label: "SET", delay: 0.2 }]} />
          <FlowNode
            ico="⚡"
            nm="Redis"
            state="sc2-redis sc2-on"
            badge={{ text: "SET ✓", kind: "ok" }}
          />
        </div>
        <div className="sc2-keybox">
          <div className="sc2-key">
            <span className="sc2-key-tk">shipping-rate</span>:
            <span className="sc2-key-hi">{"{accountId}"}</span>
            :{"{originZip}:{destZip}:{weight}:{dims}:{shipDate}"}
          </div>
          <div className="sc2-ttl">
            <div className="sc2-ttl-bar">
              <i />
            </div>
            <span>
              TTL 30s ·{" "}
              {zh ? "过期后不再被返回" : "not returned once it expires"}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "hit") {
    return (
      <div className="sc2-board">
        <div className="sc2-rail">
          <FlowNode ico="🖥️" nm={fe} sub="React · Apollo" state="sc2-on" />
          <Lane
            packets={[
              { kind: "req", label: zh ? "报价?" : "rate?", delay: 0 },
              { kind: "res", label: zh ? "报价✓" : "quote", delay: 1.9 },
            ]}
          />
          <FlowNode ico="🧩" nm="GraphQL BFF" state="sc2-on" />
          <Lane
            packets={[
              { kind: "req", label: "GET", delay: 0.5 },
              { kind: "res", label: "HIT", delay: 1.4 },
            ]}
          />
          <FlowNode
            ico="⚡"
            nm="Redis"
            state="sc2-redis sc2-hit"
            badge={{ text: "HIT", kind: "ok" }}
          />
        </div>
        <div className="sc2-fan">
          <span className="sc2-fan-note">
            {zh ? "4 家 carrier 一个都没惊动" : "none of the 4 carriers is called"}
          </span>
          <Carriers mode="dim" />
        </div>
        <div className="sc2-latcompare">
          <span className="sc2-lat slow struck">
            {zh ? "首次(未命中) ~1200ms" : "first (miss) ~1200ms"}
          </span>
          <span className="sc2-fan-note">→</span>
          <span className="sc2-lat fast">{zh ? "命中 ~1ms" : "hit ~1ms"}</span>
        </div>
      </div>
    );
  }

  if (phase === "leak") {
    return (
      <div className="sc2-leak">
        <div className="sc2-leak-row">
          <div className="sc2-cust">
            <span className="sc2-ico" aria-hidden>
              🏢
            </span>
            <b>{zh ? "客户 A" : "Customer A"}</b>
            <span className="sc2-sub">{zh ? "有大客户折扣" : "volume discount"}</span>
            <span className="sc2-price">$8.10</span>
          </div>
          <div className="sc2-leak-arrow">
            <span>{zh ? "写入" : "writes"}</span>
            <span>→</span>
          </div>
          <div className="sc2-node sc2-redis sc2-warn">
            <span className="sc2-badge bad">{zh ? "key 无 accountId" : "no accountId"}</span>
            <span className="sc2-ico" aria-hidden>
              ⚡
            </span>
            <span className="sc2-nm">Redis</span>
            <span className="sc2-sub">shipping-rate:{"{zip}:{weight}"}</span>
          </div>
          <div className="sc2-leak-arrow bad">
            <span>{zh ? "命中→泄露" : "hit → leak"}</span>
            <span>→</span>
          </div>
          <div className="sc2-cust">
            <span className="sc2-ico" aria-hidden>
              🏬
            </span>
            <b>{zh ? "客户 B" : "Customer B"}</b>
            <span className="sc2-sub">{zh ? "本应是标准价" : "should get list price"}</span>
            <span className="sc2-price leaked">$8.10 ⚠</span>
          </div>
        </div>
      </div>
    );
  }

  // phase === "layers"
  return (
    <div className="sc2-layers">
      <div className="sc2-zone browser">
        <span className="sc2-zone-tag">{zh ? "浏览器端" : "BROWSER"}</span>
        <div className="sc2-zone-body">
          <FlowNode ico="⚛️" nm="React" />
          <Lane />
          <FlowNode
            ico="🗂️"
            nm={zh ? "Apollo 缓存" : "Apollo cache"}
            sub={zh ? "只服务这个用户" : "this user only"}
          />
        </div>
        <div className="sc2-zone-note">
          {zh ? "减少重复的 GraphQL 请求" : "cuts repeated GraphQL requests"}
        </div>
      </div>
      <div className="sc2-zone server">
        <span className="sc2-zone-tag">{zh ? "服务端" : "SERVER"}</span>
        <div className="sc2-zone-body">
          <FlowNode ico="🧩" nm="BFF" />
          <Lane />
          <FlowNode
            ico="⚡"
            nm={zh ? "Redis 缓存" : "Redis cache"}
            state="sc2-redis"
            sub={zh ? "所有用户共享" : "shared by all users"}
          />
          <Lane />
          <FlowNode ico="📦" nm={zh ? "承运商" : "Carriers"} />
        </div>
        <div className="sc2-zone-note">
          {zh ? "减少重复的 carrier API 调用（只有它拦得住）" : "cuts repeated carrier API calls (only this layer can)"}
        </div>
      </div>
      <div className="sc2-degrade">
        {zh
          ? "降级：Redis 不可用就绕过它、直连 carrier（慢但仍可用）——Redis 不能是单点"
          : "Fallback: if Redis is unavailable, skip it and call the carriers directly. Slower, but the request still works, so Redis is not a single point of failure."}
      </div>
    </div>
  );
}

/* ---------- 场景 B：买标签幂等 ---------- */

function IdemStage({ phase, zh }: { phase: string; zh: boolean }) {
  if (phase === "double") {
    return (
      <div className="sc2-board">
        <div className="sc2-rail">
          <div className="sc2-clicks">
            <div className="sc2-buybtn">{zh ? "购买标签" : "Buy label"}</div>
            <span className="sc2-tap">
              {zh ? "👆 用户点了两下 / 自动重试" : "👆 double-click / auto-retry"}
            </span>
          </div>
          <Lane
            packets={[
              { kind: "req", label: "req#1", delay: 0 },
              { kind: "req", label: "req#2", delay: 0.28 },
            ]}
          />
          <FlowNode ico="🖧" nm={zh ? "服务端" : "Server"} state="sc2-on" />
        </div>
        <span className="sc2-fan-note">
          {zh
            ? "两个请求几乎同时到 → 若都执行，重复扣款 / 重复建标签"
            : "two requests arrive at once → if both run: double charge, double label"}
        </span>
      </div>
    );
  }

  if (phase === "nx") {
    return (
      <div className="sc2-board">
        <div className="sc2-key" style={{ maxWidth: 540 }}>
          <span className="sc2-key-tk">SET</span> idempotency:purchase-label:
          <span className="sc2-key-hi">{"{requestId}"}</span> processing{" "}
          <span className="sc2-key-tk">NX</span> <span className="sc2-key-tk">EX</span> 60
        </div>
        <div className="sc2-reqs">
          <div className="sc2-reqline">
            <span className="sc2-reqtag win">req#1</span>
            <Lane packets={[{ kind: "req", label: "SET NX", delay: 0 }]} />
            <span className="sc2-reqtag win">→ OK ✓ {zh ? "抢到处理权" : "claimed"}</span>
          </div>
          <div className="sc2-reqline">
            <span className="sc2-reqtag lose">req#2</span>
            <Lane packets={[{ kind: "req", label: "SET NX", delay: 0.4 }]} />
            <span className="sc2-reqtag lose">→ nil ✗ {zh ? "key 已存在" : "key exists"}</span>
          </div>
        </div>
        <span className="sc2-fan-note">
          {zh
            ? "单线程逐条执行命令 → 并发里只有第一个写成功"
            : "one thread, one command at a time → only the first write succeeds"}
        </span>
      </div>
    );
  }

  if (phase === "resolve") {
    return (
      <div className="sc2-board">
        <div className="sc2-reqs">
          <div className="sc2-reqline">
            <span className="sc2-reqtag win">req#1</span>
            <div className="sc2-outcome win">
              <span className="sc2-step-chip done" style={{ animationDelay: "0.1s" }}>
                {zh ? "建标签" : "create label"}
              </span>
              <span className="sc2-step-chip done" style={{ animationDelay: "0.35s" }}>
                {zh ? "扣款 一次" : "charge once"}
              </span>
              <span className="sc2-step-chip done" style={{ animationDelay: "0.6s" }}>
                {zh ? "发通知" : "notify"}
              </span>
            </div>
          </div>
          <div className="sc2-reqline">
            <span className="sc2-reqtag lose">req#2</span>
            <div className="sc2-outcome lose">
              <span>{zh ? "复用上次结果，不再执行" : "reuse previous result, no re-run"}</span>
              <span className="sc2-step-chip skip">{zh ? "扣款" : "charge"}</span>
            </div>
          </div>
        </div>
        <span className="sc2-fan-note">
          {zh ? "点一下和点两下，结果一样 = 幂等" : "one click or two, same result = idempotent"}
        </span>
      </div>
    );
  }

  // phase === "honest"
  return (
    <div className="sc2-board">
      <div className="sc2-gates">
        <div className="sc2-gate fast">
          <b>Redis SET NX</b>
          <small>
            {zh ? "快速拦住绝大多数重复请求" : "blocks almost every duplicate, fast"}
          </small>
          <div className="sc2-gate-warn">
            {zh
              ? "可能过期；重启或故障切换会丢"
              : "can expire; lost on restart or failover"}
          </div>
        </div>
        <div className="sc2-vlink">→</div>
        <div className="sc2-gate final">
          <b>{zh ? "数据库唯一约束" : "DB unique constraint"}</b>
          <small>
            {zh
              ? "同一 requestId 只能落一行 + 订单状态检查"
              : "one row per requestId + order-status check"}
          </small>
        </div>
      </div>
      <span className="sc2-fan-note">
        {zh
          ? "Redis 是快速过滤，数据库唯一约束才是保证"
          : "Redis is the fast filter; the database constraint is the guarantee"}
      </span>
    </div>
  );
}

/* ---------- 场景 C：余额投影 ---------- */

const LEDGER: { cn: string; en: string; amt: string; sign: "pos" | "neg" }[] = [
  { cn: "充值", en: "top-up", amt: "+ $200.00", sign: "pos" },
  { cn: "买标签", en: "buy label", amt: "− $ 42.30", sign: "neg" },
  { cn: "买标签", en: "buy label", amt: "− $ 29.30", sign: "neg" },
];

function LedgerRows({
  zh,
  summing,
  appended,
}: {
  zh: boolean;
  summing?: boolean;
  appended?: boolean;
}) {
  return (
    <>
      {LEDGER.map((r, i) => (
        <div
          key={i}
          className={`sc2-row ${summing ? "sc2-sum" : ""}`}
          style={summing ? { animationDelay: `${i * 0.3}s` } : undefined}
        >
          <span>{zh ? r.cn : r.en}</span>
          <span className={`amt ${r.sign}`}>{r.amt}</span>
        </div>
      ))}
      {appended && (
        <div className="sc2-row sc2-new">
          <span>{zh ? "新交易" : "new entry"}</span>
          <span className="amt neg">− $ 15.00</span>
        </div>
      )}
    </>
  );
}

function BalanceStage({ phase, zh }: { phase: string; zh: boolean }) {
  const balLabel = zh ? "当前余额 (Redis 投影)" : "current balance (Redis projection)";

  if (phase === "read") {
    return (
      <div className="sc2-board">
        <div className="sc2-cwrap">
          <div className="sc2-ledger sc2-off">
            <div className="sc2-ledger-head">
              📒 {zh ? "账本 (MySQL)" : "Ledger (MySQL)"}
            </div>
            <LedgerRows zh={zh} />
          </div>
          <div className="sc2-vlink">
            <small>{zh ? "读不碰它" : "read skips it"}</small>
          </div>
          <div className="sc2-bal hit">
            <span className="sc2-badge ok">HIT</span>
            <span className="sc2-bal-label">{balLabel}</span>
            <span className="sc2-bal-val">$128.40</span>
          </div>
          <Lane packets={[{ kind: "req", label: zh ? "余额" : "balance", delay: 0.3 }]} />
          <div className="sc2-user">
            <span className="sc2-ico" aria-hidden>
              🙂
            </span>
            {zh ? "用户" : "user"}
          </div>
        </div>
      </div>
    );
  }

  if (phase === "recompute") {
    return (
      <div className="sc2-board">
        <div className="sc2-cwrap">
          <div className="sc2-ledger truth">
            <div className="sc2-ledger-head">
              📒 {zh ? "账本 (MySQL)" : "Ledger (MySQL)"}
              <span className="sc2-tag-mini">{zh ? "真相" : "truth"}</span>
            </div>
            <LedgerRows zh={zh} summing />
          </div>
          <div className="sc2-vlink">
            →<small>{zh ? "从头加一遍" : "add it up"}</small>
          </div>
          <div className="sc2-bal rebuilt">
            <span className="sc2-badge bad">MISS</span>
            <span className="sc2-bal-label">{balLabel}</span>
            <span className="sc2-bal-val">$128.40</span>
          </div>
        </div>
        <span className="sc2-fan-note">
          {zh ? "未命中 → 重算 → 写回 Redis，下次命中" : "miss → recompute → write back to Redis, next read hits"}
        </span>
      </div>
    );
  }

  if (phase === "invalidate") {
    return (
      <div className="sc2-board">
        <div className="sc2-cwrap">
          <div className="sc2-ledger truth">
            <div className="sc2-ledger-head">
              📒 {zh ? "账本 (MySQL)" : "Ledger (MySQL)"}
              <span className="sc2-tag-mini">append</span>
            </div>
            <LedgerRows zh={zh} appended />
          </div>
          <div className="sc2-vlink">
            →<small>DEL</small>
          </div>
          <div className="sc2-bal deleted">
            <span className="sc2-badge bad">DEL</span>
            <span className="sc2-bal-label">{balLabel}</span>
            <span className="sc2-bal-val">$128.40</span>
          </div>
        </div>
        <span className="sc2-fan-note">
          {zh
            ? "先 append 账本，再 DEL 投影；下次读未命中 → 重算"
            : "append to the ledger, then DEL the projection; the next read misses → recompute"}
        </span>
      </div>
    );
  }

  // phase === "money"
  return (
    <div className="sc2-board">
      <div className="sc2-cwrap">
        <div className="sc2-ledger truth">
          <div className="sc2-ledger-head">
            📒 {zh ? "账本" : "Ledger"}
            <span className="sc2-tag-mini">{zh ? "真相 · append-only" : "truth · append-only"}</span>
          </div>
          <LedgerRows zh={zh} />
        </div>
        <div className="sc2-vlink">
          <span className="sc2-bolt" aria-hidden>
            ⚡️
          </span>
          <small>{zh ? "Redis 不可用" : "Redis unavailable"}</small>
        </div>
        <div className="sc2-bal miss">
          <span className="sc2-bal-label">{zh ? "读模型 (可丢弃)" : "read model (disposable)"}</span>
          <span className="sc2-bal-val">✗</span>
        </div>
        <div className="sc2-vlink">
          ↺<small>{zh ? "从账本重算恢复" : "rebuild from ledger"}</small>
        </div>
      </div>
      <span className="sc2-fan-note">
        {zh
          ? "账本是真相，Redis 只是副本——丢了能一分不差地重算回来"
          : "the ledger is the record; the Redis copy can be rebuilt from it, to the cent"}
      </span>
    </div>
  );
}
