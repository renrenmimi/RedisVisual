"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  steps,
  pkgCode,
  indexCode,
  clui,
  type TermLine,
  type Cmd,
} from "@/lib/codelab";
import { useLang, t, type Lang } from "@/lib/i18n";
import { RichText } from "@/lib/glossary";
import "./code.css";

export default function CodeChapter() {
  const [cursor, setCursor] = useState(0);
  const { lang } = useLang();

  const step = steps[cursor];
  const atEnd = cursor >= steps.length - 1;
  const nextAction = atEnd ? null : steps[cursor + 1].action;

  const advance = () => setCursor((c) => Math.min(c + 1, steps.length - 1));
  const back = () => setCursor((c) => Math.max(c - 1, 0));
  const reset = () => setCursor(0);

  // 键盘：空格 / → 推进，← 回退
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (
        tag === "BUTTON" ||
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "A"
      )
        return;
      if (e.key === " " || e.key === "ArrowRight") {
        e.preventDefault();
        setCursor((c) => Math.min(c + 1, steps.length - 1));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCursor((c) => Math.max(c - 1, 0));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const leftItems: Cmd[] = step.cmds ?? [];

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1 className="page-title">{t(clui.title, lang)}</h1>
          <p className="subtitle">{t(clui.subtitle, lang)}</p>
        </div>
        <div className="progress" aria-label="progress">
          {steps.map((s, i) => (
            <button
              key={i}
              className={`pdot ${i < cursor ? "done" : ""} ${
                i === cursor ? "cur" : ""
              }`}
              onClick={() => setCursor(i)}
              title={`${i + 1}. ${t(s.title, lang)}`}
              aria-label={`${i + 1}. ${t(s.title, lang)}`}
            />
          ))}
        </div>
      </header>

      <section className="narration appear" key={`n-${cursor}-${lang}`}>
        <div className="n-head">
          <span className="n-step">
            STEP {cursor + 1}
            <i>/{steps.length}</i>
          </span>
          <h2>{t(step.title, lang)}</h2>
        </div>
        {step.body.map((p, i) => (
          <p className="n-body" key={i}>
            <RichText text={t(p, lang)} lang={lang} />
          </p>
        ))}
      </section>

      <div className="cl3-grid">
        <section className="panel cl3-left" aria-label="commands">
          <div className="panel-title">
            <span
              className={`tdot ${
                step.cmds ? "tdot-accent" : "tdot-teal"
              }`}
            />
            {t(step.cmds ? clui.cmdsTitle : clui.pointsTitle, lang)}
          </div>

          {step.cmds && (
            <div className="cl3-cmds">
              {leftItems.map((c, i) => (
                <CmdCard key={`${cursor}-${i}`} c={c} lang={lang} />
              ))}
            </div>
          )}

          {step.points && (
            <ul className="cl3-points">
              {step.points.map((p, i) => (
                <li className="cl3-point" key={i}>
                  <RichText text={t(p, lang)} lang={lang} />
                </li>
              ))}
            </ul>
          )}

          {step.caution && (
            <div className="cl3-caution">
              <b>⚠ </b>
              <RichText text={t(step.caution, lang)} lang={lang} />
            </div>
          )}
        </section>

        <section className="cl3-stage" aria-label="stage">
          {step.panel.kind === "term" ? (
            <Terminal
              key={cursor}
              file={step.panel.file}
              lines={step.panel.lines}
              lang={lang}
            />
          ) : (
            <CodeView
              key={cursor}
              file={step.panel.file}
              focus={step.panel.focus}
            />
          )}
        </section>
      </div>

      <div className="controls">
        <button className="btn" onClick={reset} disabled={cursor === 0}>
          {t(clui.reset, lang)}
        </button>
        <button className="btn" onClick={back} disabled={cursor === 0}>
          ←
        </button>
        {nextAction ? (
          <button className="btn btn-primary" onClick={advance}>
            {t(nextAction, lang)}
          </button>
        ) : (
          <Link className="btn btn-primary" href="/interview">
            {t(clui.nextStation, lang)}
          </Link>
        )}
        <span className="hint">
          <kbd>{lang === "zh" ? "空格" : "Space"}</kbd>{" "}
          {t(clui.kbdNext, lang)} · <kbd>←</kbd> {t(clui.kbdPrev, lang)}
        </span>
      </div>
    </div>
  );
}

// ---------- 左侧：命令卡（可复制 + 逐 flag 解释） ----------

function CmdCard({ c, lang }: { c: Cmd; lang: Lang }) {
  return (
    <div className="cl3-cmd">
      <div className="cl3-cmd-bar">
        <span className="cl3-dollar" aria-hidden>
          $
        </span>
        <code className="cl3-cmd-text">{c.cmd}</code>
        <CopyBtn text={c.cmd} lang={lang} />
      </div>
      <div className="cl3-note">
        <RichText text={t(c.note, lang)} lang={lang} />
      </div>
      {c.flags && (
        <ul className="cl3-flags">
          {c.flags.map((f, i) => (
            <li className="cl3-flag" key={i}>
              <code>{f.flag}</code>
              <span>
                <RichText text={t(f.desc, lang)} lang={lang} />
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CopyBtn({ text, lang }: { text: string; lang: Lang }) {
  const [done, setDone] = useState(false);
  const timer = useRef<number | null>(null);

  // 卸载（换步骤时命令卡会重挂载）前清掉挂起的定时器
  useEffect(() => {
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // 剪贴板不可用时静默降级：按钮仍给出“已复制”反馈
    }
    setDone(true);
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setDone(false), 1300);
  };
  return (
    <button
      type="button"
      className={`cl3-copy ${done ? "done" : ""}`}
      onClick={copy}
      aria-label={t(done ? clui.copied : clui.copy, lang)}
    >
      {done ? `✓ ${t(clui.copied, lang)}` : t(clui.copy, lang)}
    </button>
  );
}

// ---------- 右侧：终端回放（逐行浮现 + 打字机节拍 + 结尾光标） ----------

function Terminal({
  file,
  lines,
  lang,
}: {
  file: string;
  lines: TermLine[];
  lang: Lang;
}) {
  const [shown, setShown] = useState(0);
  const [running, setRunning] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!running) return;
    if (shown >= lines.length) {
      setRunning(false);
      return;
    }
    const next = lines[shown];
    const base = next.cls === "sh" || next.cls === "rc" ? 340 : 130;
    const delay = next.pause ?? base;
    const id = window.setTimeout(() => setShown((s) => s + 1), delay);
    return () => window.clearTimeout(id);
  }, [shown, running, lines]);

  // 输出增长时自动滚到底
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [shown]);

  const replay = () => {
    setShown(0);
    setRunning(true);
  };

  return (
    <div className="code-window">
      <div className="code-bar">
        <span className="wdot wdot-r" />
        <span className="wdot wdot-y" />
        <span className="wdot wdot-g" />
        <span className="code-file">{file}</span>
        <button
          type="button"
          className="cl3-replay"
          onClick={replay}
          disabled={running}
        >
          {t(clui.replay, lang)}
        </button>
      </div>
      <div className="run-term cl3-term" ref={scrollRef}>
        {lines.slice(0, shown).map((line, i) => (
          <TermRow key={i} line={line} />
        ))}
        {running && <span className="run-cursor" />}
      </div>
    </div>
  );
}

function TermRow({ line }: { line: TermLine }) {
  const cls = line.cls ?? "out";
  const prefix =
    cls === "sh" ? (
      <span className="cl3-dollar">$&nbsp;</span>
    ) : cls === "rc" ? (
      <span className="cl3-arrow">127.0.0.1:6379&gt;&nbsp;</span>
    ) : null;
  const bodyCls =
    cls === "ok"
      ? "cl3-t-ok"
      : cls === "dim"
        ? "cl3-t-dim"
        : cls === "accent"
          ? "cl3-t-accent"
          : "";
  return (
    <div className="run-line cl3-line appear">
      {prefix}
      <span className={bodyCls}>{line.text.length ? line.text : " "}</span>
    </div>
  );
}

// ---------- 右侧：代码窗（逐行点亮 + 自动滚动到焦点段） ----------

function CodeView({
  file,
  focus,
}: {
  file: "pkg" | "index";
  focus: [number, number][];
}) {
  const lines = file === "pkg" ? pkgCode : indexCode;
  const codeRef = useRef<HTMLDivElement>(null);

  const isOn = (ln: number) => focus.some(([a, b]) => ln >= a && ln <= b);

  useEffect(() => {
    const container = codeRef.current;
    if (!container) return;
    const first = Math.min(...focus.map((f) => f[0]));
    const el = container.querySelector<HTMLElement>(`[data-line="${first}"]`);
    if (el) {
      container.scrollTo({
        top: Math.max(0, el.offsetTop - container.clientHeight * 0.32),
        behavior: "smooth",
      });
    }
    // 挂载即滚动一次即可；focus 随步骤变化时通过 key 重挂载
  }, [focus]);

  return (
    <div className="code-window">
      <div className="code-bar">
        <span className="wdot wdot-r" />
        <span className="wdot wdot-y" />
        <span className="wdot wdot-g" />
        <span className="code-file">
          {file === "pkg" ? "package.json" : "src/index.ts"}
        </span>
      </div>
      <div
        className={`code ${file === "index" ? "cl3-code-tall" : ""}`}
        ref={codeRef}
      >
        {lines.map((line, i) => (
          <div
            key={i}
            data-line={i + 1}
            className={`cl ${isOn(i + 1) ? "on" : ""}`}
          >
            <span className="ln">{i + 1}</span>
            <span className="ct">{tokenize(line)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- 语法高亮：注释 / 字符串 / 数字 / 关键字 / 函数名 ----------

const TOKEN_RE =
  /(\/\/.*)|(`(?:[^`\\]|\\.)*`|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|\b(\d[\d_]*(?:\.\d+)?)\b|\b(import|from|export|const|let|var|async|function|await|return|if|else|new|type|interface|void|unknown|catch|throw|for|of|in|true|false|null|undefined|string|number|boolean|Promise)\b|\b([A-Za-z_$][\w$]*)(?=\s*\()/g;

function tokenize(line: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let k = 0;
  for (const m of line.matchAll(TOKEN_RE)) {
    const idx = m.index ?? 0;
    if (idx > last) out.push(line.slice(last, idx));
    const cls = m[1]
      ? "tk-cmt"
      : m[2]
        ? "tk-str"
        : m[3]
          ? "tk-num"
          : m[4]
            ? "tk-kw"
            : "tk-fn";
    out.push(
      <span key={k++} className={cls}>
        {m[0]}
      </span>,
    );
    last = idx + m[0].length;
  }
  if (last < line.length) out.push(line.slice(last));
  if (out.length === 0) out.push(" ");
  return out;
}
