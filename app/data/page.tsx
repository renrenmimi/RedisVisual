"use client";

// 第 2 站「数据结构详解」：一排 7 个标签（5 种核心结构 + 专用类型 + 底层编码），
// 选中某结构 → 左侧专属 CSS 动画 + 心智模型，右侧命令/用途/WeShipItNow/编码/深挖手风琴。
// 文案全部来自 lib/datalab.ts；正文一律用 RichText（并额外把反引号 `code` 渲成 mono）。
// 动画都是纯 CSS keyframes，prefers-reduced-motion 下由 globals.css 统一关掉。

import { useState } from "react";
import Link from "next/link";
import { useLang, t, type Lang, type L } from "@/lib/i18n";
import { RichText } from "@/lib/glossary";
import {
  dl,
  structures,
  specials,
  encodings,
  bossProbes,
  type Structure,
  type Probe,
} from "@/lib/datalab";
import "./data.css";

/* 正文渲染器：先按反引号切出 `code` 段（渲成 mono），其余交给 RichText 处理 [[术语]]。 */
function Rich({ text, lang }: { text: string; lang: Lang }) {
  const segs = text.split("`");
  return (
    <>
      {segs.map((seg, i) =>
        i % 2 === 1 ? (
          <code className="ds5-ic" key={i}>
            {seg}
          </code>
        ) : (
          <RichText key={i} text={seg} lang={lang} />
        ),
      )}
    </>
  );
}

export default function DataPage() {
  const { lang } = useLang();
  // 选中项：结构 id（string/list/hash/set/zset）或 "special" / "encoding"，默认第一种结构。
  const [tab, setTab] = useState<string>(structures[0].id);

  const tabs: { key: string; label: L; alt?: boolean }[] = [
    ...structures.map((s) => ({ key: s.id, label: s.name })),
    { key: "special", label: dl.tabSpecial, alt: true },
    { key: "encoding", label: dl.tabEncoding, alt: true },
  ];

  const active = structures.find((s) => s.id === tab);

  return (
    <main className="page ds5-root">
      <header className="header">
        <div>
          <h1 className="page-title">{t(dl.title, lang)}</h1>
          <p className="subtitle">{t(dl.subtitle, lang)}</p>
        </div>
      </header>

      {/* 破误解的开场讲解卡 */}
      <section className="narration appear">
        <div className="n-head">
          <span className="n-step">value ∈ 5</span>
          <h2>{t(dl.introTitle, lang)}</h2>
        </div>
        <p className="n-body">
          <Rich text={t(dl.intro, lang)} lang={lang} />
        </p>
      </section>

      {/* 标签栏：5 结构 + 专用类型 + 底层编码 */}
      <div
        className="ds5-tabs"
        role="tablist"
        aria-label={t({ zh: "数据结构", en: "Data structures" }, lang)}
      >
        {tabs.map((tb) => {
          const on = tb.key === tab;
          return (
            <button
              key={tb.key}
              role="tab"
              aria-selected={on}
              className={`ds5-tab${on ? " on" : ""}${tb.alt ? " ds5-tab-alt" : ""}`}
              onClick={() => setTab(tb.key)}
            >
              {t(tb.label, lang)}
            </button>
          );
        })}
      </div>

      {/* 内容区：切换标签时用 key 重挂载，整块重新入场 */}
      <div className="ds5-content appear" key={tab}>
        {tab === "special" ? (
          <SpecialsView lang={lang} />
        ) : tab === "encoding" ? (
          <EncodingView lang={lang} />
        ) : active ? (
          <StructureDetail s={active} lang={lang} />
        ) : null}
      </div>

      {/* 上一站 / 下一站 */}
      <div className="ds5-nav">
        <Link href="/" className="btn">
          {t(dl.toPrev, lang)}
        </Link>
        <Link href="/scenarios" className="btn btn-primary">
          {t(dl.toNext, lang)}
        </Link>
      </div>
    </main>
  );
}

/* ======================= 单个结构详情 ======================= */

function StructureDetail({ s, lang }: { s: Structure; lang: Lang }) {
  return (
    <div className="ds5-detail grid">
      {/* 左：动画舞台 + 心智模型 */}
      <div className="ds5-left">
        <div className="stage-panel">
          <div className="stage">
            <Anim id={s.id} lang={lang} />
            <div className="stage-caption">{t(s.tag, lang)}</div>
          </div>
        </div>
        <div className="panel ds5-model">
          <div className="panel-title">
            <span className="tdot tdot-teal" />
            {t(dl.secModel, lang)}
          </div>
          <p className="ds5-model-text">
            <Rich text={t(s.model, lang)} lang={lang} />
          </p>
        </div>
      </div>

      {/* 右：命令 / 用途 / WeShipItNow / 编码 / 深挖 */}
      <div className="ds5-right">
        <div className="panel">
          <div className="panel-title">
            <span className="tdot tdot-accent" />
            {t(dl.secCmd, lang)}
            <span className="len">{s.commands.length}</span>
          </div>
          <ul className="ds5-cmds">
            {s.commands.map((c, i) => (
              <li className="ds5-cmd" key={i}>
                <code className="ds5-cmd-code">{c.cmd}</code>
                <span className="ds5-cmd-note">{t(c.note, lang)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="panel">
          <div className="panel-title">
            <span className="tdot tdot-teal" />
            {t(dl.secUse, lang)}
          </div>
          <ul className="ds5-uses">
            {s.uses.map((u, i) => (
              <li key={i}>
                <Rich text={t(u, lang)} lang={lang} />
              </li>
            ))}
          </ul>
        </div>

        <div className="ds5-ship card-accent">
          <div className="ds5-ship-head">
            <span className="ds5-ship-badge">WeShipItNow</span>
            {t(dl.secShip, lang)}
          </div>
          <p className="ds5-ship-text">
            <Rich text={t(s.ship, lang)} lang={lang} />
          </p>
        </div>

        <div className="panel">
          <div className="panel-title">
            <span className="tdot tdot-amber" />
            {t(dl.secEnc, lang)}
          </div>
          <p className="ds5-enc-text">
            <Rich text={t(s.encoding, lang)} lang={lang} />
          </p>
        </div>

        <div className="panel">
          <div className="panel-title">
            <span className="tdot tdot-accent" />
            {t(dl.secProbe, lang)}
            <span className="len">{s.probes.length}</span>
          </div>
          <div className="ds5-probes">
            {s.probes.map((p, i) => (
              <ProbeRow key={i} probe={p} lang={lang} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* 面试深挖：可平滑展开的手风琴条（结构 probes 与压轴 bossProbes 共用） */
function ProbeRow({ probe, lang }: { probe: Probe; lang: Lang }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`ds5-probe${open ? " open" : ""}`}>
      <button
        className="ds5-probe-q"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        type="button"
      >
        <span className="ds5-probe-tag">{t(dl.probeQ, lang)}</span>
        <span className="ds5-probe-qt">{t(probe.q, lang)}</span>
        <span className="ds5-probe-caret" aria-hidden>
          ▸
        </span>
      </button>
      <div className="ds5-probe-ans">
        <div className="ds5-probe-clip">
          <div className="ds5-probe-body">
            <span className="ds5-probe-atag">{t(dl.probeA, lang)}</span>
            <p className="ds5-probe-at">
              <Rich text={t(probe.a, lang)} lang={lang} />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ======================= 专用类型 ======================= */

function SpecialsView({ lang }: { lang: Lang }) {
  return (
    <div className="ds5-special">
      <div className="ds5-sec-head">
        <h2>{t(dl.specialTitle, lang)}</h2>
        <p>
          <Rich text={t(dl.specialIntro, lang)} lang={lang} />
        </p>
      </div>
      <div className="ds5-cards">
        {specials.map((sp, i) => (
          <div
            className="ds5-card"
            key={sp.id}
            style={{ animationDelay: `${i * 75}ms` }}
          >
            <div className="ds5-card-top">
              <span className="ds5-card-name">{t(sp.name, lang)}</span>
              <span className="ds5-card-based">{t(sp.based, lang)}</span>
            </div>
            <p className="ds5-card-what">
              <Rich text={t(sp.what, lang)} lang={lang} />
            </p>
            <code className="ds5-card-cmds">{sp.cmds}</code>
            <div className="ds5-card-use">
              <span className="ds5-card-use-dot" aria-hidden>
                ▸
              </span>
              {t(sp.use, lang)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ======================= 底层编码 ======================= */

function EncodingView({ lang }: { lang: Lang }) {
  return (
    <div className="ds5-enc">
      <div className="ds5-sec-head">
        <h2>{t(dl.encTitle, lang)}</h2>
        <p>
          <Rich text={t(dl.encIntro, lang)} lang={lang} />
        </p>
      </div>

      {/* 编码对照表 */}
      <div className="ds5-enctable">
        <div className="ds5-encrow ds5-enchead">
          <span>{t(dl.encColType, lang)}</span>
          <span>{t(dl.encColSmall, lang)}</span>
          <span>{t(dl.encColLarge, lang)}</span>
        </div>
        {encodings.map((e, i) => {
          const star = e.type.en === "Sorted Set";
          return (
            <div
              className={`ds5-encrow${star ? " ds5-encstar-row" : ""}`}
              key={i}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className="ds5-enc-type">
                {t(e.type, lang)}
                {star && (
                  <span className="ds5-star" aria-hidden>
                    ★
                  </span>
                )}
              </span>
              <span className="ds5-enc-cell">
                {e.small.split(" / ").map((tk, j) => (
                  <code className={`chip${star ? " chip-accent" : ""}`} key={j}>
                    {tk}
                  </code>
                ))}
              </span>
              <span className="ds5-enc-cell">
                {e.large.split(" / ").map((tk, j) => (
                  <code className={`chip${star ? " chip-accent" : ""}`} key={j}>
                    {tk}
                  </code>
                ))}
              </span>
            </div>
          );
        })}
      </div>

      {/* Sorted Set = skiplist + hashtable 双结构示意 */}
      <ZDiagram lang={lang} />

      {/* 重点 callout */}
      <div className="ds5-star-callout card-accent">
        <span className="ds5-star-ico" aria-hidden>
          ★
        </span>
        <p>
          <Rich text={t(dl.encStar, lang)} lang={lang} />
        </p>
      </div>

      {/* 压轴通用深挖 */}
      <div className="ds5-boss">
        <div className="ds5-sec-head ds5-sec-head-sm">
          <h2>{t(dl.bossTitle, lang)}</h2>
        </div>
        <div className="ds5-probes">
          {bossProbes.map((p, i) => (
            <ProbeRow key={i} probe={p} lang={lang} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* 「哈希表 O(1) 随机查」+「跳表 O(log n) 有序范围查」指向同一批成员 */
function ZDiagram({ lang }: { lang: Lang }) {
  const members: { n: string; s: string; hot?: boolean }[] = [
    { n: "alice", s: "230" },
    { n: "bob", s: "210" },
    { n: "carol", s: "300", hot: true },
  ];
  // 跳表两层：base 全量，express 跳过一部分节点（HEAD→210→300→NIL）
  type SkNode = { c: number; l: string; head?: boolean; nil?: boolean; hot?: boolean };
  const express: SkNode[] = [
    { c: 1, l: "HEAD", head: true },
    { c: 3, l: "210" },
    { c: 5, l: "300", hot: true },
    { c: 6, l: "NIL", nil: true },
  ];
  const base: SkNode[] = [
    { c: 1, l: "HEAD", head: true },
    { c: 2, l: "180" },
    { c: 3, l: "210" },
    { c: 4, l: "230" },
    { c: 5, l: "300", hot: true },
    { c: 6, l: "NIL", nil: true },
  ];

  return (
    <div className="ds5-zdiagram">
      {/* 哈希表：成员 → 分数，O(1) 直查 */}
      <div className="ds5-zbox ds5-zhash">
        <div className="ds5-zbox-head">
          <b>hashtable</b>
          <span className="ds5-zbadge">{t({ zh: "成员 → 分数 · O(1)", en: "member → score · O(1)" }, lang)}</span>
        </div>
        <div className="ds5-zhash-rows">
          {members.map((m, i) => (
            <div className={`ds5-zhash-row${m.hot ? " hot" : ""}`} key={i}>
              <span className="ds5-zhm mono">{m.n}</span>
              <span className="ds5-zharrow" aria-hidden>
                →
              </span>
              <span className="ds5-zhs mono">{m.s}</span>
            </div>
          ))}
        </div>
        <div className="ds5-zbox-cap">{t({ zh: "给成员名，直接命中分数，不用比较", en: "give the member name, get the score directly — no comparisons" }, lang)}</div>
      </div>

      {/* 跳表：按分数有序，O(log n) 范围 / 排名 */}
      <div className="ds5-zbox ds5-zskip">
        <div className="ds5-zbox-head">
          <b>skiplist</b>
          <span className="ds5-zbadge">{t({ zh: "按分数有序 · O(log n)", en: "ordered by score · O(log n)" }, lang)}</span>
        </div>
        <div className="ds5-sk">
          <div className="ds5-sk-level ds5-sk-express">
            {express.map((n, i) => (
              <span
                key={i}
                className={`ds5-sk-node ds5-sk-seek${n.head ? " head" : ""}${n.nil ? " nil" : ""}${n.hot ? " hot" : ""}`}
                style={{ gridColumn: n.c, animationDelay: `${i * 0.5}s` }}
              >
                {n.l}
              </span>
            ))}
          </div>
          <div className="ds5-sk-level">
            {base.map((n, i) => (
              <span
                key={i}
                className={`ds5-sk-node${n.head ? " head" : ""}${n.nil ? " nil" : ""}${n.hot ? " hot" : ""}`}
                style={{ gridColumn: n.c }}
              >
                {n.l}
              </span>
            ))}
          </div>
        </div>
        <div className="ds5-zbox-cap">{t({ zh: "上层“快速路”跳着走，一次查找不用逐个节点走完", en: "the upper level skips ahead, so a search does not visit every node" }, lang)}</div>
      </div>

      <div className="ds5-zsame">
        {t({ zh: "↑ 两套索引指向同一批成员：一个按成员名查，一个按分数排序", en: "↑ two indexes over the same members: one looks up by member name, one keeps them ordered by score" }, lang)}
      </div>
    </div>
  );
}

/* ======================= 每种结构的专属动画 ======================= */

function Anim({ id, lang }: { id: string; lang: Lang }) {
  if (id === "string") return <StringAnim lang={lang} />;
  if (id === "list") return <ListAnim lang={lang} />;
  if (id === "hash") return <HashAnim lang={lang} />;
  if (id === "set") return <SetAnim lang={lang} />;
  return <ZsetAnim lang={lang} />;
}

/* string：SET 写入一个格子亮起 + INCR 计数器持续 +1 跳动 */
function StringAnim({ lang }: { lang: Lang }) {
  return (
    <div className="ds5-anim ds5-str">
      <div className="ds5-str-set">
        <div className="ds5-str-cmd mono">SET name &quot;Wayne&quot;</div>
        <div className="ds5-str-slot">
          <span className="ds5-str-key mono">name</span>
          <span className="ds5-str-arrow" aria-hidden>
            →
          </span>
          <span className="ds5-str-val mono">&quot;Wayne&quot;</span>
        </div>
      </div>
      <div className="ds5-str-incr">
        <div className="ds5-str-incr-top">
          <span className="ds5-str-chip mono">INCR</span>
          <span className="ds5-str-klabel mono">page:views</span>
        </div>
        <div className="ds5-str-num mono ds5-count-num" aria-hidden />
        <div className="ds5-str-atomic">
          {t({ zh: "原子 +1 · 并发下不会丢更新", en: "atomic +1 · no lost updates under concurrency" }, lang)}
        </div>
      </div>
    </div>
  );
}

/* list：一条传送带无缝流动，左进（LPUSH）右出（RPOP） */
function ListAnim({ lang }: { lang: Lang }) {
  const seq = ["job1", "job2", "job3", "job4", "job5"];
  return (
    <div className="ds5-anim ds5-list">
      <div className="ds5-list-ends">
        <span className="ds5-list-op ds5-list-lpush mono">LPUSH →</span>
        <span className="ds5-list-op ds5-list-rpop mono">→ RPOP</span>
      </div>
      <div className="ds5-list-lane">
        <div className="ds5-list-track">
          {[...seq, ...seq].map((label, i) => (
            <span className="ds5-list-cell mono" key={i}>
              {label}
            </span>
          ))}
        </div>
      </div>
      <div className="ds5-list-cap">
        {t({ zh: "左边进、右边出 · 先进先出队列", en: "in on the left, out on the right · a FIFO queue" }, lang)}
      </div>
    </div>
  );
}

/* hash：同一个 key 下只把 city 字段的值周期性替换 + 高亮 */
function HashAnim({ lang }: { lang: Lang }) {
  return (
    <div className="ds5-anim ds5-hash">
      <div className="ds5-hash-card">
        <div className="ds5-hash-title mono">HSET user:1</div>
        <div className="ds5-hash-line">
          <span className="ds5-hf mono">name</span>
          <span className="ds5-hv mono">Wayne</span>
        </div>
        <div className="ds5-hash-line ds5-hash-live">
          <span className="ds5-hf mono">city</span>
          <span className="ds5-hv-swap mono">
            <b className="ds5-hv-a">SF</b>
            <b className="ds5-hv-b">NYC</b>
          </span>
          <span className="ds5-hset-badge mono">HSET city</span>
        </div>
        <div className="ds5-hash-line">
          <span className="ds5-hf mono">role</span>
          <span className="ds5-hv mono">eng</span>
        </div>
      </div>
      <div className="ds5-hash-cap">
        {t({ zh: "只改 city 一个字段，其它字段原地不动", en: "only the city field is written; the other fields are untouched" }, lang)}
      </div>
    </div>
  );
}

/* set：3 个元素落入袋子，重复的 react 被弹开（去重） */
function SetAnim({ lang }: { lang: Lang }) {
  return (
    <div className="ds5-anim ds5-set">
      <div className="ds5-set-stage">
        <span className="ds5-set-dup mono">
          react <i>✕</i>
        </span>
        <div className="ds5-set-bag">
          <span className="ds5-set-bag-tag mono">tags</span>
          <div className="ds5-set-bag-items">
            <span className="ds5-set-chip ds5-sc1 mono">react</span>
            <span className="ds5-set-chip ds5-sc2 mono">ts</span>
            <span className="ds5-set-chip ds5-sc3 mono">node</span>
          </div>
        </div>
      </div>
      <div className="ds5-set-cap">
        {t({ zh: "3 个进袋；重复的 react 被弹开，成员不会重复", en: "three go in; the repeated react bounces off — members stay unique" }, lang)}
      </div>
    </div>
  );
}

/* zset：ZADD 一个高分成员，滑入正确排序位置，把别人挤下去 */
function ZsetAnim({ lang }: { lang: Lang }) {
  return (
    <div className="ds5-anim ds5-zset">
      <div className="ds5-zset-board">
        <div className="ds5-zrow ds5-znew">
          <span className="ds5-zrank">1</span>
          <span className="ds5-zname">carol</span>
          <span className="ds5-zscore mono">300</span>
          <span className="ds5-znew-tag">NEW</span>
        </div>
        <div className="ds5-zrow ds5-zr2">
          <span className="ds5-zrank">2</span>
          <span className="ds5-zname">alice</span>
          <span className="ds5-zscore mono">230</span>
        </div>
        <div className="ds5-zrow ds5-zr3">
          <span className="ds5-zrank">3</span>
          <span className="ds5-zname">bob</span>
          <span className="ds5-zscore mono">210</span>
        </div>
        <div className="ds5-zrow ds5-zr4">
          <span className="ds5-zrank">4</span>
          <span className="ds5-zname">dave</span>
          <span className="ds5-zscore mono">180</span>
        </div>
      </div>
      <div className="ds5-zset-cmd mono">ZADD board 300 carol</div>
      <div className="ds5-zset-cap">
        {t({ zh: "新成员按分数自动滑到正确排名，其它人顺次下移", en: "the new member slides into place by score; the rest shift down" }, lang)}
      </div>
    </div>
  );
}
