"use client";

// 第 5 站「生产机制」。
// 结构：页头 + 开场讲解卡 + 四个 tab（持久化 / 过期淘汰 / 高可用扩展 / 事务原子）。
// 每个 tab = 一句开场(lede) + 一段循环动画 + 详情(机制卡) + 对比表 + 面试深挖手风琴。
// 文案全部来自 lib/internals.ts；这里只负责把机制画成会动的图、把对比画成表、把深挖做成 accordion。
// 动画由 tab.id 决定，切 tab 时用 key 重挂载，所以每次切换都会重新入场并重播动画。

import { useState } from "react";
import Link from "next/link";
import {
  meta,
  tabs,
  type TabId,
  type Point,
  type CompareTable,
  type Probe,
} from "@/lib/internals";
import { useLang, t, type Lang } from "@/lib/i18n";
import { RichText } from "@/lib/glossary";
import "./internals.css";

export default function InternalsPage() {
  const { lang } = useLang();
  const [tab, setTab] = useState(0);
  const [open, setOpen] = useState<ReadonlySet<string>>(new Set());

  const cur = tabs[tab];

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <main className="page in7-root">
      <header className="header">
        <div>
          <h1 className="page-title">{t(meta.title, lang)}</h1>
          <p className="subtitle">{t(meta.subtitle, lang)}</p>
        </div>
      </header>

      {/* 开场讲解卡 */}
      <section className="narration appear">
        <div className="n-head">
          <span className="n-step">{t(meta.introStep, lang)}</span>
          <h2>{t(meta.introTitle, lang)}</h2>
        </div>
        <p className="n-body">
          <RichText text={t(meta.introBody, lang)} lang={lang} />
        </p>
      </section>

      {/* tab 切换 */}
      <div className="in7-tabs" role="tablist" aria-label="mechanisms">
        {tabs.map((tb, i) => (
          <button
            key={tb.id}
            role="tab"
            aria-selected={i === tab}
            className={`in7-tab ${i === tab ? "on" : ""}`}
            onClick={() => setTab(i)}
          >
            <span className="in7-tab-top">
              <span className="in7-tab-ix">{t(tb.tab, lang)}</span>
              <span className="in7-tab-name">{t(tb.name, lang)}</span>
            </span>
            <span className="in7-tab-kicker">{t(tb.kicker, lang)}</span>
          </button>
        ))}
      </div>

      {/* 该 tab 的正文；key=tab.id → 切换时整体重新入场并重播动画 */}
      <div key={cur.id} className="in7-panel">
        <p className="in7-lede appear">
          <RichText text={t(cur.lede, lang)} lang={lang} />
        </p>

        {/* 动画舞台 */}
        <section className="stage-panel appear">
          <div className="stage in7-stage">
            <Anim id={cur.id} lang={lang} />
          </div>
          <div className="stage-caption">{t(cur.animCaption, lang)}</div>
        </section>

        {/* 详情：机制讲解卡 */}
        <section className="in7-section appear">
          <div className="in7-sec-head">
            <span className="tdot tdot-accent" />
            {t(meta.detailLabel, lang)}
          </div>
          <div className="in7-points">
            {cur.points.map((p, i) => (
              <PointCard key={i} p={p} lang={lang} />
            ))}
          </div>
        </section>

        {/* 对比表 */}
        <section className="in7-section appear">
          <div className="in7-sec-head">
            <span className="tdot tdot-teal" />
            {t(meta.tableLabel, lang)}
          </div>
          <TableView table={cur.table} lang={lang} />
        </section>

        {/* 面试深挖手风琴 */}
        <section className="in7-section appear">
          <div className="in7-sec-head">
            <span className="tdot tdot-amber" />
            {t(meta.probeLabel, lang)}
          </div>
          <div className="in7-probes">
            {cur.probes.map((pr, i) => {
              const id = `${cur.id}-${i}`;
              return (
                <ProbeCard
                  key={id}
                  pr={pr}
                  n={i + 1}
                  lang={lang}
                  open={open.has(id)}
                  onToggle={() => toggle(id)}
                />
              );
            })}
          </div>
        </section>
      </div>

      {/* 底部导航 */}
      <div className="in7-nav">
        <Link href="/pitfalls" className="btn">
          {t(meta.prev, lang)}
        </Link>
        <Link href="/code" className="btn btn-primary">
          {t(meta.next, lang)}
        </Link>
      </div>
    </main>
  );
}

/* ======================= 详情卡 ======================= */

function PointCard({ p, lang }: { p: Point; lang: Lang }) {
  return (
    <article className={`in7-point ${p.tone ? `tone-${p.tone}` : ""}`}>
      <h3 className="in7-point-head">{t(p.head, lang)}</h3>
      <p className="in7-point-body">
        <RichText text={t(p.body, lang)} lang={lang} />
      </p>
      {p.chips && p.chips.length > 0 && (
        <div className="in7-chips">
          {p.chips.map((c, i) => (
            <code key={i} className="in7-cmd">
              {c}
            </code>
          ))}
        </div>
      )}
    </article>
  );
}

/* ======================= 对比表 ======================= */

function TableView({ table, lang }: { table: CompareTable; lang: Lang }) {
  return (
    <div className="in7-table-wrap">
      <table className="in7-table">
        <thead>
          <tr>
            {table.cols.map((c, i) => (
              <th key={i} className={i === 0 ? "in7-th-dim" : ""}>
                {t(c, lang)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((r, ri) => (
            <tr key={ri}>
              <th
                scope="row"
                className={`in7-td-label ${table.monoLabels ? "mono" : ""}`}
              >
                {t(r.label, lang)}
              </th>
              {r.cells.map((cell, ci) => (
                <td key={ci}>
                  <RichText text={t(cell, lang)} lang={lang} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ======================= 面试深挖手风琴 ======================= */

function ProbeCard({
  pr,
  n,
  lang,
  open,
  onToggle,
}: {
  pr: Probe;
  n: number;
  lang: Lang;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <article className={`in7-probe ${open ? "open" : ""}`}>
      <button
        type="button"
        className="in7-probe-q"
        onClick={onToggle}
        aria-expanded={open}
      >
        <span className="in7-probe-ix">{t(meta.probeQ, lang)}</span>
        <span className="in7-probe-qtext">{t(pr.q, lang)}</span>
        <span className="in7-caret" aria-hidden>
          ▸
        </span>
      </button>
      <div className="in7-probe-a">
        <div className="in7-probe-clip">
          <div className="in7-probe-body">
            <span className="in7-probe-atag">{t(meta.probeA, lang)}</span>
            <p className="in7-probe-atext">
              <RichText text={t(pr.a, lang)} lang={lang} />
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ======================= 动画总入口 ======================= */

function Anim({ id, lang }: { id: TabId; lang: Lang }) {
  const zh = lang === "zh";
  if (id === "persistence") return <PersistenceAnim zh={zh} />;
  if (id === "eviction") return <EvictionAnim zh={zh} />;
  if (id === "ha") return <HaAnim zh={zh} />;
  return <TxnAnim zh={zh} />;
}

/* ---------- Tab 1：持久化 —— RDB 快照 vs AOF 追加 ---------- */

const AOF_CMDS = ["SET a 1", "INCR a", "LPUSH q x", "SET b hi", "DEL a"];

function PersistenceAnim({ zh }: { zh: boolean }) {
  return (
    <div className="in7-persist">
      {/* RDB：定时把整块内存拍成一个文件 */}
      <div className="in7-col">
        <div className="in7-col-tag accent">RDB · {zh ? "快照" : "snapshot"}</div>
        <div className="in7-mem">
          <span className="in7-snap" aria-hidden />
          {Array.from({ length: 9 }).map((_, i) => (
            <span key={i} className="in7-mem-cell" />
          ))}
        </div>
        <div className="in7-varrow">
          <span className="in7-shutter" aria-hidden>
            ▣
          </span>
        </div>
        <div className="in7-file">dump.rdb</div>
        <div className="in7-col-note">
          {zh ? "每隔一段时间，整块拍一张照" : "one whole photo every so often"}
        </div>
      </div>

      {/* AOF：每条写命令追加进日志卷 */}
      <div className="in7-col">
        <div className="in7-col-tag teal">AOF · {zh ? "追加日志" : "append log"}</div>
        <div className="in7-log">
          {AOF_CMDS.map((c, i) => (
            <span
              key={i}
              className="in7-log-line"
              style={{ animationDelay: `${i * 0.6}s` }}
            >
              <i className="in7-log-caret">›</i>
              {c}
            </span>
          ))}
        </div>
        <div className="in7-col-note">
          {zh ? "每条写命令，追加到末尾" : "each write appended to the end"}
        </div>
      </div>
    </div>
  );
}

/* ---------- Tab 2：过期淘汰 —— 内存满 → 踢掉最冷的 key ---------- */

const EVICT_KEYS = ["sess:12", "rate:9", "user:3", "cart:7", "tmp:5"];

function EvictionAnim({ zh }: { zh: boolean }) {
  return (
    <div className="in7-evict">
      <div className="in7-membar">
        <span className="in7-membar-fill" />
        <span className="in7-membar-cap">
          <i />
          <span>maxmemory</span>
        </span>
      </div>

      <div className="in7-keys">
        {EVICT_KEYS.map((k, i) => (
          <span key={k} className={`in7-key ${i === 0 ? "cold" : ""}`}>
            {k}
            {i === 0 && (
              <span className="in7-key-badge">{zh ? "最冷 · 淘汰" : "coldest · evict"}</span>
            )}
          </span>
        ))}
      </div>

      <div className="in7-evict-note">
        {zh
          ? "内存到顶 → LRU/LFU 挑最冷的一个踢出去"
          : "memory full → LRU/LFU picks the coldest to evict"}
      </div>
    </div>
  );
}

/* ---------- Tab 3：高可用 —— 复制 + 故障转移 + 集群分槽 ---------- */

const CLUSTER_NODES = [
  { nm: "M1", slots: "0–5460" },
  { nm: "M2", slots: "5461–10922" },
  { nm: "M3", slots: "10923–16383" },
];

function HaAnim({ zh }: { zh: boolean }) {
  return (
    <div className="in7-ha">
      {/* 复制 + 哨兵故障转移（循环时间线） */}
      <div className="in7-repl">
        <div className="in7-node in7-master">
          <span className="in7-node-ico" aria-hidden>
            ⚡
          </span>
          <span className="in7-node-nm">{zh ? "主" : "master"}</span>
          <span className="in7-down-badge">{zh ? "宕机" : "down"}</span>
        </div>

        <div className="in7-repl-arrows" aria-hidden>
          <span className="in7-repl-line" />
          <span className="in7-repl-line d1" />
        </div>

        <div className="in7-replicas">
          <div className="in7-node in7-replica promote">
            <span className="in7-node-ico" aria-hidden>
              ⚡
            </span>
            <span className="in7-node-nm">{zh ? "从 → 新主" : "replica → new master"}</span>
            <span className="in7-new-badge">{zh ? "升为新主" : "NEW MASTER"}</span>
          </div>
          <div className="in7-node in7-replica">
            <span className="in7-node-ico" aria-hidden>
              ⚡
            </span>
            <span className="in7-node-nm">{zh ? "从" : "replica"}</span>
          </div>
        </div>

        <div className="in7-sentinel">
          <span aria-hidden>👁</span>
          {zh ? "哨兵" : "Sentinel"}
        </div>
      </div>

      {/* 集群：16384 槽，key 经 CRC16 落到某节点 */}
      <div className="in7-cluster">
        <div className="in7-cluster-key">
          <code className="in7-cmd">CRC16(user:123) % 16384 = 7000</code>
          <span className="in7-cluster-pkt" aria-hidden>
            key
          </span>
        </div>
        <div className="in7-cluster-nodes">
          {CLUSTER_NODES.map((n, i) => (
            <div key={n.nm} className={`in7-cnode ${i === 1 ? "land" : ""}`}>
              <span className="in7-cnode-nm">{n.nm}</span>
              <span className="in7-cnode-slots">
                {zh ? "槽 " : "slots "}
                {n.slots}
              </span>
            </div>
          ))}
        </div>
        <div className="in7-evict-note">
          {zh
            ? "16384 个哈希槽分给各主节点，key 经 CRC16 落到 slot 7000 → M2"
            : "16384 hash slots split across masters; the key lands on slot 7000 → M2 via CRC16"}
        </div>
      </div>
    </div>
  );
}

/* ---------- Tab 4：事务 —— MULTI 排队/EXEC 齐发 + Pipeline 省往返 ---------- */

const MULTI_CMDS = ["SET a 1", "INCR b", "LPUSH q x"];

function TxnAnim({ zh }: { zh: boolean }) {
  return (
    <div className="in7-txn">
      {/* MULTI / EXEC：命令排队 → 一次性执行 */}
      <div className="in7-col">
        <div className="in7-col-tag accent">MULTI / EXEC</div>
        <div className="in7-queue">
          <div className="in7-queue-tag">MULTI</div>
          {MULTI_CMDS.map((c, i) => (
            <span
              key={i}
              className="in7-q-cmd"
              style={{ animationDelay: `${0.4 + i * 0.5}s` }}
            >
              {c}
              <i className="in7-q-flag">QUEUED</i>
            </span>
          ))}
          <div className="in7-exec">EXEC ⚡</div>
        </div>
        <div className="in7-col-note">
          {zh ? "排进队列 → EXEC 一次性按序执行" : "queue up → EXEC runs them all in order"}
        </div>
      </div>

      {/* Pipeline：批量发 / 批量收，省 RTT */}
      <div className="in7-col">
        <div className="in7-col-tag teal">Pipeline</div>
        <div className="in7-pipe">
          <div className="in7-pipe-end">{zh ? "客户端" : "client"}</div>
          <div className="in7-pipe-wire">
            <span className="in7-pipe-batch send" aria-hidden>
              ▮▮▮▮
            </span>
            <span className="in7-pipe-batch recv" aria-hidden>
              ▮▮▮▮
            </span>
          </div>
          <div className="in7-pipe-end">{zh ? "服务端" : "server"}</div>
        </div>
        <div className="in7-col-note">
          {zh ? "4 条命令 = 1 次往返，不是 4 次" : "4 commands = 1 round trip, not 4"}
        </div>
      </div>
    </div>
  );
}
