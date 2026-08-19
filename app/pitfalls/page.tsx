"use client";

// 新站「缓存的坑与一致性」(/pitfalls)。
// 结构：开场讲解 + 5 个 tab（穿透 / 击穿 / 雪崩 / 一致性 / 热点·大key）。
// 每个 tab = 症状讲解卡 + 一张纯 CSS 动画（可重播）+ 「怎么解」卡片列表 + 「面试深挖」手风琴。
// 文案全部来自 lib/pitfalls.ts；正文用 Rich（反引号→mono，**强调**→strong，[[术语]]→弹层）。
// 动画都是纯 CSS keyframes，靠 key 重挂载来重播；prefers-reduced-motion 下由 CSS 关掉。

import { useState } from "react";
import Link from "next/link";
import { useLang, t, type Lang } from "@/lib/i18n";
import { RichText } from "@/lib/glossary";
import {
  meta,
  intro,
  pitfalls,
  type Pitfall,
  type Solution,
} from "@/lib/pitfalls";
import "./pitfalls.css";

/* 正文渲染器：先按反引号切出 `code` 段（渲成 mono），其余交给 Emph。 */
function Rich({ text, lang }: { text: string; lang: Lang }) {
  const segs = text.split("`");
  return (
    <>
      {segs.map((seg, i) =>
        i % 2 === 1 ? (
          <code className="pf6-ic" key={i}>
            {seg}
          </code>
        ) : (
          <Emph key={i} text={seg} lang={lang} />
        ),
      )}
    </>
  );
}

/* **重强调** 渲成 <strong>；剩下的交给 Ital。 */
function Emph({ text, lang }: { text: string; lang: Lang }) {
  const segs = text.split("**");
  return (
    <>
      {segs.map((seg, i) =>
        i % 2 === 1 ? (
          <strong key={i}>
            <Ital text={seg} lang={lang} />
          </strong>
        ) : (
          <Ital key={i} text={seg} lang={lang} />
        ),
      )}
    </>
  );
}

/* *轻强调* 渲成 <em>；两侧文本继续交给 RichText 处理 [[术语]]。 */
function Ital({ text, lang }: { text: string; lang: Lang }) {
  const segs = text.split("*");
  return (
    <>
      {segs.map((seg, i) =>
        i % 2 === 1 ? (
          <em key={i}>
            <RichText text={seg} lang={lang} />
          </em>
        ) : (
          <RichText key={i} text={seg} lang={lang} />
        ),
      )}
    </>
  );
}

export default function PitfallsPage() {
  const { lang } = useLang();
  const [tab, setTab] = useState(0);
  const [replay, setReplay] = useState(0);
  const [fix, setFix] = useState(false); // 仅一致性 tab：问题 / 延迟双删
  const [open, setOpen] = useState<ReadonlySet<string>>(new Set());

  const pit = pitfalls[tab];

  const pickTab = (i: number) => {
    setTab(i);
    setReplay((r) => r + 1);
    setFix(false);
    setOpen(new Set());
  };

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <main className="page pf6-root">
      <header className="header">
        <div>
          <h1 className="page-title">{t(meta.title, lang)}</h1>
          <p className="subtitle">{t(meta.subtitle, lang)}</p>
        </div>
      </header>

      {/* 开场讲解 */}
      <section className="pf6-lede">
        <div className="pf6-lede-kicker">{t(intro.kicker, lang)}</div>
        <h2>{t(intro.title, lang)}</h2>
        <p>
          <Rich text={t(intro.text, lang)} lang={lang} />
        </p>
      </section>

      {/* 5 个 tab */}
      <div
        className="pf6-tabs"
        role="tablist"
        aria-label={t({ zh: "缓存的坑", en: "cache pitfalls" }, lang)}
      >
        {pitfalls.map((p, i) => (
          <button
            key={p.id}
            role="tab"
            aria-selected={i === tab}
            className={`pf6-tab ${i === tab ? "on" : ""}`}
            onClick={() => pickTab(i)}
          >
            <span className="pf6-tab-ix">{i + 1}</span>
            <span className="pf6-tab-nm">{t(p.tab, lang)}</span>
          </button>
        ))}
      </div>

      {/* 症状讲解卡 */}
      <section className="narration appear" key={`sym-${pit.id}-${lang}`}>
        <div className="n-head">
          <span className="n-step">{t(meta.sectionSymptom, lang)}</span>
          <h2>{t(pit.symptomTitle, lang)}</h2>
        </div>
        <p className="n-body pf6-term">{t(pit.term, lang)}</p>
        <p className="n-body">
          <Rich text={t(pit.symptom, lang)} lang={lang} />
        </p>
      </section>

      {/* 动画舞台 + 工具条 */}
      <section className="stage-panel appear">
        {pit.id === "consistency" && (
          <div
            className="pf6-switch"
            role="tablist"
            aria-label={t({ zh: "切换视图", en: "switch view" }, lang)}
          >
            <button
              className={`pf6-switch-b ${!fix ? "on" : ""}`}
              onClick={() => {
                setFix(false);
                setReplay((r) => r + 1);
              }}
            >
              {t(meta.problemTab, lang)}
            </button>
            <button
              className={`pf6-switch-b ${fix ? "on" : ""}`}
              onClick={() => {
                setFix(true);
                setReplay((r) => r + 1);
              }}
            >
              {t(meta.fixTab, lang)}
            </button>
          </div>
        )}
        <div className="stage" key={`stg-${pit.id}-${fix}-${replay}-${lang}`}>
          <Stage id={pit.id} fix={fix} lang={lang} />
          <div className="stage-caption">{t(pit.caption, lang)}</div>
        </div>
        <div className="pf6-stagebar">
          <button className="btn" onClick={() => setReplay((r) => r + 1)}>
            {t(meta.replay, lang)}
          </button>
        </div>
      </section>

      {/* 怎么解 */}
      <section className="pf6-fix" key={`fix-${pit.id}-${lang}`}>
        <div className="pf6-sec-head">
          <span className="pf6-sec-dot" />
          {t(meta.sectionFix, lang)}
        </div>
        <div className="pf6-sol-grid">
          {pit.solutions.map((s, i) => (
            <SolutionCard key={i} sol={s} lang={lang} />
          ))}
        </div>
      </section>

      {/* 面试深挖手风琴 */}
      <section className="pf6-deep" key={`deep-${pit.id}-${lang}`}>
        <div className="pf6-sec-head">
          <span className="pf6-sec-dot amber" />
          {t(meta.sectionDeep, lang)}
          <span className="pf6-deep-hint">{t(meta.deepHint, lang)}</span>
        </div>
        <div className="pf6-acc">
          {pit.deep.map((d, i) => {
            const id = `${pit.id}-${i}`;
            const isOpen = open.has(id);
            return (
              <article
                key={id}
                className={`pf6-qa ${isOpen ? "open" : ""}`}
                style={{ animationDelay: `${i * 55}ms` }}
              >
                <button
                  className="pf6-q"
                  onClick={() => toggle(id)}
                  aria-expanded={isOpen}
                  type="button"
                >
                  <span className="pf6-q-ix">Q{i + 1}</span>
                  <span className="pf6-q-text">{t(d.q, lang)}</span>
                  <span className="pf6-caret" aria-hidden>
                    ▸
                  </span>
                </button>
                <div className="pf6-a">
                  <div className="pf6-a-clip">
                    <p className="pf6-a-body">
                      <Rich text={t(d.a, lang)} lang={lang} />
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 上一站 / 下一站 */}
      <div className="pf6-nav">
        <Link href="/scenarios" className="btn">
          {t(meta.prev, lang)}
        </Link>
        <Link href="/internals" className="btn btn-primary">
          {t(meta.next, lang)}
        </Link>
      </div>
    </main>
  );
}

/* ======================= 解法卡 ======================= */

function SolutionCard({ sol, lang }: { sol: Solution; lang: Lang }) {
  return (
    <div className={`pf6-sol tone-${sol.tone ?? "plain"}`}>
      <span className="pf6-sol-tag">{t(sol.tag, lang)}</span>
      <p className="pf6-sol-text">
        <Rich text={t(sol.text, lang)} lang={lang} />
      </p>
    </div>
  );
}

/* ======================= 动画舞台总入口 ======================= */

function Stage({
  id,
  fix,
  lang,
}: {
  id: Pitfall["id"];
  fix: boolean;
  lang: Lang;
}) {
  const zh = lang === "zh";
  if (id === "penetration") return <PenetrationStage zh={zh} />;
  if (id === "breakdown") return <BreakdownStage zh={zh} />;
  if (id === "avalanche") return <AvalancheStage zh={zh} />;
  if (id === "consistency") return <ConsistencyStage fix={fix} zh={zh} />;
  return <HotBigStage zh={zh} />;
}

/* ---------- Tab 1：穿透——假 id 一路穿过空缓存砸向 DB ---------- */

function PenetrationStage({ zh }: { zh: boolean }) {
  const dots = [0, 0.5, 1.0, 1.5, 2.0];
  return (
    <div className="pf6-pen">
      <div className="pf6-node pf6-client">
        <span className="pf6-node-ico" aria-hidden>
          🙅
        </span>
        <span className="pf6-node-nm">{zh ? "假 id ×N" : "fake ids ×N"}</span>
        <span className="pf6-node-sub">{zh ? "查不存在的数据" : "no such record"}</span>
      </div>

      <div className="pf6-pen-track">
        <div className="pf6-cache-hollow">
          <span className="pf6-hollow-tag">{zh ? "缓存" : "cache"}</span>
          <span className="pf6-hollow-mark">∅</span>
          <span className="pf6-hollow-sub">{zh ? "永远 miss" : "always miss"}</span>
        </div>
        {dots.map((d, i) => (
          <i
            key={i}
            className="pf6-pen-dot"
            style={{ animationDelay: `${d}s` }}
          />
        ))}
      </div>

      <div className="pf6-node pf6-db pf6-db-beat">
        <span className="pf6-node-ico" aria-hidden>
          🗄️
        </span>
        <span className="pf6-node-nm">{zh ? "数据库" : "database"}</span>
        <span className="pf6-node-sub bad">{zh ? "每次都被打到" : "hit every time"}</span>
      </div>
    </div>
  );
}

/* ---------- Tab 2：击穿——热点 key 过期，一群请求同时涌向 DB ---------- */

function BreakdownStage({ zh }: { zh: boolean }) {
  const rush = [0, 1, 2, 3, 4, 5, 6];
  return (
    <div className="pf6-brk">
      <div className="pf6-hotkey">
        <span className="pf6-hotkey-fire" aria-hidden>
          🔥
        </span>
        <span className="pf6-hotkey-nm">hot:product:42</span>
        <span className="pf6-hotkey-expire">{zh ? "TTL 到期 → 未命中" : "TTL expires → miss"}</span>
        <div className="pf6-ttlbar">
          <i />
        </div>
      </div>

      <div className="pf6-brk-fan">
        {rush.map((i) => (
          <span
            key={i}
            className="pf6-rush"
            style={{
              left: `${8 + i * 14}%`,
              animationDelay: `${2.5 + i * 0.03}s`,
            }}
          />
        ))}
      </div>

      <div className="pf6-node pf6-db pf6-db-crush">
        <span className="pf6-node-ico" aria-hidden>
          🗄️
        </span>
        <span className="pf6-node-nm">{zh ? "数据库" : "database"}</span>
        <span className="pf6-node-sub bad">{zh ? "并发重建打满" : "many rebuilds at once"}</span>
      </div>
    </div>
  );
}

/* ---------- Tab 3：雪崩——一排 key 同时过期，洪流砸向 DB ---------- */

function AvalancheStage({ zh }: { zh: boolean }) {
  const keys = [0, 1, 2, 3, 4, 5, 6, 7];
  return (
    <div className="pf6-ava">
      <div className="pf6-ava-keys">
        {keys.map((i) => (
          <div
            key={i}
            className="pf6-ava-key"
            style={{ animationDelay: `${(i % 3) * 0.06}s` }}
          >
            <span className="pf6-ava-key-nm">key {i + 1}</span>
            <div className="pf6-ttlbar sync">
              <i style={{ animationDelay: `${(i % 3) * 0.05}s` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="pf6-ava-flood">
        {keys.concat(keys).map((_, i) => (
          <span
            key={i}
            className="pf6-flood-drop"
            style={{
              left: `${4 + i * 5.6}%`,
              animationDelay: `${2.6 + (i % 6) * 0.06}s`,
            }}
          />
        ))}
      </div>

      <div className="pf6-node pf6-db pf6-db-crack">
        <span className="pf6-node-ico" aria-hidden>
          🗄️
        </span>
        <span className="pf6-node-nm">{zh ? "数据库" : "database"}</span>
        <span className="pf6-node-sub bad">{zh ? "流量同时到达" : "all traffic at once"}</span>
      </div>
    </div>
  );
}

/* ---------- Tab 4：一致性——读/写交错时间线（问题 / 延迟双删） ---------- */

type TlEvent = { lane: "r" | "w"; label: string; bad?: boolean; good?: boolean };

function ConsistencyStage({ fix, zh }: { fix: boolean; zh: boolean }) {
  const base: TlEvent[] = [
    { lane: "r", label: zh ? "读缓存 → 未命中" : "read cache → miss" },
    { lane: "r", label: zh ? "读 DB → 拿到旧值 v1" : "read DB → gets old value v1" },
    { lane: "w", label: zh ? "更新 DB：v1 → v2" : "update DB: v1 → v2" },
    { lane: "w", label: zh ? "删除缓存 key" : "delete the cache key" },
    {
      lane: "r",
      label: zh ? "把 v1 写回缓存 ⚠" : "write v1 back to the cache ⚠",
      bad: true,
    },
  ];
  const events: TlEvent[] = fix
    ? base.concat([
        {
          lane: "w",
          label: zh ? "延迟一小段，再删一次" : "after a delay, delete again",
          good: true,
        },
      ])
    : base;

  return (
    <div className="pf6-tl">
      <div className="pf6-tl-heads">
        <span className="pf6-tl-th t">{zh ? "时间" : "time"}</span>
        <span className="pf6-tl-th r">{zh ? "读请求 R" : "read R"}</span>
        <span className="pf6-tl-th w">{zh ? "写请求 W" : "write W"}</span>
      </div>
      {events.map((e, i) => (
        <div
          className="pf6-tl-row"
          key={i}
          style={{ animationDelay: `${0.15 + i * 0.55}s` }}
        >
          <span className="pf6-tl-t">t{i + 1}</span>
          <div className="pf6-tl-cell r">
            {e.lane === "r" && (
              <span
                className={`pf6-tl-chip r ${e.bad ? "bad" : ""} ${e.good ? "good" : ""}`}
              >
                {e.label}
              </span>
            )}
          </div>
          <div className="pf6-tl-cell w">
            {e.lane === "w" && (
              <span
                className={`pf6-tl-chip w ${e.bad ? "bad" : ""} ${e.good ? "good" : ""}`}
              >
                {e.label}
              </span>
            )}
          </div>
        </div>
      ))}
      <div
        className={`pf6-tl-result ${fix ? "good" : "bad"}`}
        style={{ animationDelay: `${0.15 + events.length * 0.55}s` }}
      >
        {fix
          ? zh
            ? "第二次删除清掉了写回的旧值 → 下次读未命中，从 DB 回填 v2 ✓"
            : "the second delete removes the value written back → the next read misses and refills v2 ✓"
          : zh
            ? "缓存 = v1（旧），DB = v2 → 对不上，直到这条缓存过期 ✗"
            : "cache = v1 (stale), DB = v2 → they disagree until the entry expires ✗"}
      </div>
    </div>
  );
}

/* ---------- Tab 5：热点 key（高频访问压垮）+ 大 key（阻塞单线程） ---------- */

function HotBigStage({ zh }: { zh: boolean }) {
  const hits = [0, 1, 2, 3, 4, 5];
  const blocked = [0, 1, 2, 3];
  return (
    <div className="pf6-hb">
      <div className="pf6-hb-col">
        <div className="pf6-hb-title">{zh ? "热点 key" : "hot key"}</div>
        <div className="pf6-hot-arena">
          {hits.map((i) => (
            <span
              key={i}
              className="pf6-hot-hit"
              style={{
                transform: `rotate(${i * 60}deg)`,
                animationDelay: `${(i % 3) * 0.18}s`,
              }}
            />
          ))}
          <div className="pf6-hot-cell">
            <span aria-hidden>🔥</span>
            <span className="pf6-hot-cell-nm">hot:key</span>
          </div>
        </div>
        <div className="pf6-hb-note">
          {zh ? "一个 key 打满一个节点" : "one key saturates one node"}
        </div>
      </div>

      <div className="pf6-hb-col">
        <div className="pf6-hb-title">{zh ? "大 key" : "big key"}</div>
        <div className="pf6-thread">
          <div className="pf6-thread-lane">
            <span className="pf6-thread-tag">
              {zh ? "一次一条命令" : "one at a time"}
            </span>
            <div className="pf6-bigkey">
              <span className="pf6-bigkey-nm">big:hash</span>
              <span className="pf6-bigkey-sub">O(n) · HGETALL</span>
            </div>
            <div className="pf6-blocked-row">
              {blocked.map((i) => (
                <span
                  key={i}
                  className="pf6-blocked"
                  style={{ animationDelay: `${i * 0.2}s` }}
                >
                  GET
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="pf6-hb-note">
          {zh
            ? "一条慢命令占住服务器，后面的全在排队"
            : "one slow command; everything behind it waits"}
        </div>
      </div>
    </div>
  );
}
