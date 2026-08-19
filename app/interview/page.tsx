"use client";

// 第 4 站「面试速通」：分类 tab + 可展开问答卡（accordion）+ 总结卡。
// 所有文案在 lib/interview.ts；正文用 RichText 支持术语弹层。
// accordion 用 CSS grid-template-rows 0fr→1fr 平滑展开，无需测高度。

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLang, t } from "@/lib/i18n";
import { RichText } from "@/lib/glossary";
import {
  iv,
  questions,
  summary,
  type Category,
  type QA,
} from "@/lib/interview";
import "./interview.css";

type Tab = Category | "all";

const TABS: { key: Tab; label: { zh: string; en: string } }[] = [
  { key: "all", label: iv.tabs.all },
  { key: "fundamentals", label: iv.tabs.fundamentals },
  { key: "system", label: iv.tabs.system },
  { key: "advanced", label: iv.tabs.advanced },
];

export default function InterviewPage() {
  const { lang } = useLang();
  const [tab, setTab] = useState<Tab>("all");
  const [open, setOpen] = useState<ReadonlySet<string>>(new Set());

  // 每个 tab 的题数（含 all）
  const counts = useMemo(() => {
    const c: Record<Tab, number> = {
      all: questions.length,
      fundamentals: 0,
      system: 0,
      advanced: 0,
    };
    for (const q of questions) c[q.category] += 1;
    return c;
  }, []);

  // 当前可见题目（保留全表编号 n，用于稳定的 Q1…Q14 序号）
  const visible = useMemo(
    () =>
      questions
        .map((qa, i) => ({ qa, n: i + 1 }))
        .filter(({ qa }) => tab === "all" || qa.category === tab),
    [tab],
  );

  const allOpen =
    visible.length > 0 && visible.every(({ qa }) => open.has(qa.id));

  const toggleOne = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = () =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (allOpen) visible.forEach(({ qa }) => next.delete(qa.id));
      else visible.forEach(({ qa }) => next.add(qa.id));
      return next;
    });

  const blurb =
    tab === "all"
      ? iv.blurb.all
      : tab === "fundamentals"
        ? iv.blurb.fundamentals
        : tab === "system"
          ? iv.blurb.system
          : iv.blurb.advanced;

  const countLabel = `${visible.length} ${t(iv.countUnit, lang)}`;

  return (
    <div className="page iv4-root">
      <header className="header">
        <div>
          <h1 className="page-title">{t(iv.title, lang)}</h1>
          <p className="subtitle">{t(iv.subtitle, lang)}</p>
        </div>
      </header>

      <section className="narration appear">
        <div className="n-head">
          <span className="n-step">{t(iv.intro.step, lang)}</span>
          <h2>{t(iv.intro.heading, lang)}</h2>
        </div>
        <p className="n-body">
          <RichText text={t(iv.intro.body, lang)} lang={lang} />
        </p>
      </section>

      {/* 分类 tab + 计数 */}
      <div className="iv4-bar">
        <div className="iv4-tabs" role="tablist" aria-label="categories">
          {TABS.map((tb) => {
            const on = tb.key === tab;
            return (
              <button
                key={tb.key}
                role="tab"
                aria-selected={on}
                className={`iv4-tab${on ? " on" : ""}`}
                onClick={() => setTab(tb.key)}
              >
                {t(tb.label, lang)}
                <span className="iv4-tab-n">{counts[tb.key]}</span>
              </button>
            );
          })}
        </div>
        <button className="iv4-toggle-all" onClick={toggleAll}>
          {allOpen ? t(iv.collapseAll, lang) : t(iv.expandAll, lang)}
        </button>
      </div>

      <p className="iv4-blurb">
        <span className="iv4-count">{countLabel}</span>
        <RichText text={t(blurb, lang)} lang={lang} />
      </p>

      {/* accordion 列表：key=tab 让切换分类时整列重新入场 */}
      <div className="iv4-list" key={tab}>
        {visible.map(({ qa, n }, vi) => (
          <QACard
            key={qa.id}
            qa={qa}
            n={n}
            lang={lang}
            open={open.has(qa.id)}
            onToggle={() => toggleOne(qa.id)}
            delay={vi * 45}
          />
        ))}
      </div>

      {/* 总结卡 */}
      <SummaryCard lang={lang} />

      {/* 收尾 + 回第 1 站 */}
      <footer className="iv4-footer appear">
        <p className="iv4-footer-line">
          <RichText text={t(iv.footer, lang)} lang={lang} />
        </p>
        <Link href="/" className="btn">
          {t(iv.backToStop1, lang)}
        </Link>
      </footer>
    </div>
  );
}

function QACard({
  qa,
  n,
  lang,
  open,
  onToggle,
  delay,
}: {
  qa: QA;
  n: number;
  lang: "zh" | "en";
  open: boolean;
  onToggle: () => void;
  delay: number;
}) {
  return (
    <article
      className={`iv4-card${open ? " open" : ""}${qa.alert ? " alert" : ""}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <button
        className="iv4-q"
        onClick={onToggle}
        aria-expanded={open}
        type="button"
      >
        <span className="iv4-q-ix">Q{n}</span>
        <span className="iv4-q-text">{t(qa.q, lang)}</span>
        {qa.alert && <span className="iv4-q-tag">{t(iv.alertTag, lang)}</span>}
        <span className="iv4-caret" aria-hidden>
          ▸
        </span>
      </button>

      <div className="iv4-ans">
        <div className="iv4-ans-clip">
          <div className="iv4-ans-body">
            <div className="iv4-block iv4-answer">
              <div className="iv4-block-label">
                <span className="tdot tdot-teal" />
                {t(iv.answerLabel, lang)}
              </div>
              <p className="iv4-block-text">
                <RichText text={t(qa.answer, lang)} lang={lang} />
              </p>
            </div>
            <div className="iv4-block iv4-explain">
              <div className="iv4-block-label">
                <span
                  className={`tdot ${qa.alert ? "tdot-amber" : "tdot-accent"}`}
                />
                {t(iv.noteLabel, lang)}
              </div>
              <p className="iv4-block-text iv4-note-text">
                <RichText text={t(qa.note, lang)} lang={lang} />
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function SummaryCard({ lang }: { lang: "zh" | "en" }) {
  return (
    <section className="iv4-summary appear">
      <div className="iv4-sum-head">
        <span className="n-step">{t(summary.step, lang)}</span>
        <h2>{t(summary.title, lang)}</h2>
      </div>

      <ul className="iv4-takeaways">
        {summary.takeaways.map((tk, i) => (
          <li key={i} className="iv4-take">
            <span className="iv4-take-n">{i + 1}</span>
            <span className="iv4-take-text">
              <RichText text={t(tk, lang)} lang={lang} />
            </span>
          </li>
        ))}
      </ul>

      <div className="iv4-flow-wrap">
        <div className="iv4-flow-title">{t(summary.flowTitle, lang)}</div>
        <div className="iv4-flow">
          {summary.flow.map((s, i) => (
            <div className="iv4-flow-item" key={i}>
              <div className="iv4-flow-node">
                <span className="iv4-flow-label">{t(s.label, lang)}</span>
                {s.sub && (
                  <span className="iv4-flow-sub mono">{t(s.sub, lang)}</span>
                )}
              </div>
              {i < summary.flow.length - 1 && (
                <span className="iv4-flow-arrow" aria-hidden>
                  →
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
