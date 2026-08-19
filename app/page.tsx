"use client";

import "./home.css";
import { useEffect, useState } from "react";
import Link from "next/link";
import { scenes, stage, meta } from "@/lib/intro";
import { ui, useLang, t, type Lang } from "@/lib/i18n";
import { RichText } from "@/lib/glossary";

export default function IntroPage() {
  const [cursor, setCursor] = useState(0);
  const [auto, setAuto] = useState(false);
  const { lang } = useLang();

  const atEnd = cursor >= scenes.length - 1;
  const scene = scenes[cursor];
  const nextAction = atEnd ? null : scenes[cursor + 1].action;

  useEffect(() => {
    if (!auto) return;
    if (cursor >= scenes.length - 1) {
      setAuto(false);
      return;
    }
    const id = setTimeout(
      () => setCursor((c) => Math.min(c + 1, scenes.length - 1)),
      8000,
    );
    return () => clearTimeout(id);
  }, [auto, cursor]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "BUTTON" || tag === "INPUT" || tag === "TEXTAREA" || tag === "A")
        return;
      if (e.key === " " || e.key === "ArrowRight") {
        e.preventDefault();
        setCursor((c) => Math.min(c + 1, scenes.length - 1));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCursor((c) => Math.max(c - 1, 0));
        setAuto(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // 序号写法在两种语言里位置不同（第 N 幕 / Scene N），所以就地拼一次。
  const sceneLabel = lang === "zh" ? `第 ${cursor + 1} 幕` : `Scene ${cursor + 1}`;

  return (
    <main className="page">
      <header className="header">
        <div>
          <h1 className="page-title">{t(meta.title, lang)}</h1>
          <p className="subtitle">{t(meta.subtitle, lang)}</p>
        </div>
        <div className="progress" aria-label={t(meta.progressLabel, lang)}>
          {scenes.map((s, i) => (
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

      <section className="narration appear" key={`n-${cursor}-${lang}`}>
        <div className="n-head">
          <span className="n-step">
            {sceneLabel}
            <i>/{scenes.length}</i>
          </span>
          <h2>{t(scene.title, lang)}</h2>
        </div>
        <p className="n-body">
          <RichText text={t(scene.text, lang)} lang={lang} />
        </p>
      </section>

      <section className="stage-panel appear" key={`s-${cursor}-${lang}`}>
        <SceneVisual id={cursor} lang={lang} />
      </section>

      <div className="controls">
        <button
          className="btn"
          onClick={() => {
            setCursor((c) => Math.max(c - 1, 0));
            setAuto(false);
          }}
          disabled={cursor === 0}
        >
          ←
        </button>
        {nextAction ? (
          <button
            className="btn btn-primary"
            onClick={() => setCursor((c) => Math.min(c + 1, scenes.length - 1))}
          >
            {t(nextAction, lang)}
          </button>
        ) : (
          <Link className="btn btn-primary" href="/data">
            {t(stage.toNext, lang)}
          </Link>
        )}
        <button className="btn" onClick={() => setAuto((a) => !a)} disabled={atEnd}>
          {auto ? t(ui.common.pause, lang) : t(ui.common.autoplay, lang)}
        </button>
        <span className="hint">
          <kbd>{t(ui.common.space, lang)}</kbd> {t(ui.common.next, lang)} · <kbd>←</kbd>{" "}
          {t(ui.common.prev, lang)}
        </span>
      </div>
    </main>
  );
}

function SceneVisual({ id, lang }: { id: number; lang: Lang }) {
  switch (id) {
    // 幕 0：内存里的一本大字典（key → value 查找）
    case 0:
      return (
        <div className="stage">
          <div className="hm-dict">
            <div className="hm-dict-title">{t(stage.dictTitle, lang)}</div>
            <div className="hm-row hm-row-hot">
              <span className="hm-k">{t(stage.dictK1, lang)}</span>
              <span className="hm-arrow">→</span>
              <span className="hm-v">{t(stage.dictV1, lang)}</span>
            </div>
            <div className="hm-row">
              <span className="hm-k">{t(stage.dictK2, lang)}</span>
              <span className="hm-arrow">→</span>
              <span className="hm-v">{t(stage.dictV2, lang)}</span>
            </div>
            <div className="hm-row">
              <span className="hm-k">{t(stage.dictK3, lang)}</span>
              <span className="hm-arrow">→</span>
              <span className="hm-v">{t(stage.dictV3, lang)}</span>
            </div>
          </div>
          <div className="stage-caption">{t(stage.s0cap, lang)}</div>
        </div>
      );

    // 幕 1：SET / GET
    case 1:
      return (
        <div className="stage">
          <div className="hm-cmds">
            <div className="hm-cmd hm-cmd-set mono">
              <code>{t(stage.setCmd, lang)}</code>
              <div className="hm-cmd-tags">
                <span className="hm-tag hm-tag-key">{t(stage.keyTag, lang)}</span>
                <span className="hm-tag hm-tag-val">{t(stage.valTag, lang)}</span>
              </div>
              <span className="hm-cmd-note">{t(stage.setNote, lang)}</span>
            </div>
            <div className="hm-slot" aria-hidden>
              <span className="hm-slot-name">name</span>
              <span className="hm-slot-val">"Wayne"</span>
            </div>
            <div className="hm-cmd hm-cmd-get mono">
              <code>{t(stage.getCmd, lang)}</code>
              <span className="hm-cmd-note">{t(stage.getNote, lang)}</span>
            </div>
          </div>
          <div className="stage-caption">{t(stage.s1cap, lang)}</div>
        </div>
      );

    // 幕 2：仓库 vs 工作台
    case 2:
      return (
        <div className="stage">
          <div className="hm-vs">
            <div className="hm-vs-card hm-warehouse">
              <span className="hm-vs-emoji">🏢</span>
              <span className="hm-vs-name">{t(stage.warehouse, lang)}</span>
              <span className="hm-vs-sub">{t(stage.warehouseSub, lang)}</span>
            </div>
            <div className="hm-vs-plus">+</div>
            <div className="hm-vs-card hm-workbench">
              <span className="hm-vs-emoji">🛠️</span>
              <span className="hm-vs-name">{t(stage.workbench, lang)}</span>
              <span className="hm-vs-sub">{t(stage.workbenchSub, lang)}</span>
            </div>
          </div>
          <div className="stage-caption">{t(stage.s2cap, lang)}</div>
        </div>
      );

    // 幕 3：延迟阶梯
    case 3:
      return (
        <div className="stage">
          <div className="hm-ladder">
            <div className="hm-lad hm-lad-mem">
              <span className="hm-lad-name">{t(stage.ladMem, lang)}</span>
              <span className="hm-lad-bar" style={{ width: "14%" }} />
              <span className="hm-lad-val">{t(stage.ladMemV, lang)}</span>
            </div>
            <div className="hm-lad hm-lad-ssd">
              <span className="hm-lad-name">{t(stage.ladSsd, lang)}</span>
              <span className="hm-lad-bar" style={{ width: "48%" }} />
              <span className="hm-lad-val">{t(stage.ladSsdV, lang)}</span>
            </div>
            <div className="hm-lad hm-lad-hdd">
              <span className="hm-lad-name">{t(stage.ladHdd, lang)}</span>
              <span className="hm-lad-bar" style={{ width: "100%" }} />
              <span className="hm-lad-val">{t(stage.ladHddV, lang)}</span>
            </div>
          </div>
          <div className="stage-caption">{t(stage.s3cap, lang)}</div>
        </div>
      );

    // 幕 4：命令路径（长 vs 短）+ 单线程
    case 4:
      return (
        <div className="stage">
          <div className="hm-paths">
            <div className="hm-path hm-path-sql">
              <span className="hm-path-label">{t(stage.sqlLabel, lang)}</span>
              <div className="hm-path-row">
                <span className="hm-gate">{t(stage.sqlS1, lang)}</span>
                <span className="hm-gate">{t(stage.sqlS2, lang)}</span>
                <span className="hm-gate">{t(stage.sqlS3, lang)}</span>
                <span className="hm-gate">{t(stage.sqlS4, lang)}</span>
                <span className="hm-gate hm-gate-end">{t(stage.sqlS5, lang)}</span>
              </div>
            </div>
            <div className="hm-path hm-path-redis">
              <span className="hm-path-label">{t(stage.redisLabel, lang)}</span>
              <div className="hm-path-row">
                <span className="hm-gate hm-gate-fast">{t(stage.redisS1, lang)}</span>
                <span className="hm-gate hm-gate-fast">{t(stage.redisS2, lang)}</span>
                <span className="hm-gate hm-gate-fast hm-gate-end">
                  {t(stage.redisS3, lang)}
                </span>
              </div>
            </div>
          </div>
          <div className="hm-thread">{t(stage.threadNote, lang)}</div>
          <div className="stage-caption">{t(stage.s4cap, lang)}</div>
        </div>
      );

    // 幕 5：五种数据结构
    case 5:
      return (
        <div className="stage">
          <div className="hm-ds">
            {[
              [stage.dsString, stage.dsStringEx],
              [stage.dsHash, stage.dsHashEx],
              [stage.dsList, stage.dsListEx],
              [stage.dsSet, stage.dsSetEx],
              [stage.dsZset, stage.dsZsetEx],
            ].map(([name, ex], i) => (
              <div className="hm-ds-card" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
                <span className="hm-ds-name">{t(name, lang)}</span>
                <code className="hm-ds-ex mono">{t(ex, lang)}</code>
              </div>
            ))}
          </div>
          <div className="stage-caption">{t(stage.s5cap, lang)}</div>
        </div>
      );

    // 幕 6：加速层（App → Redis 快车道 + DB 真相来源）
    case 6:
      return (
        <div className="stage">
          <div className="hm-lane">
            <div className="hm-lane-node hm-lane-app">{t(stage.appNode, lang)}</div>
            <div className="hm-lane-split">
              <div className="hm-lane-node hm-lane-redis">
                <span className="hm-lane-title">{t(stage.fastLane, lang)}</span>
                <span className="hm-lane-sub">{t(stage.fastLaneSub, lang)}</span>
                <span className="hm-lane-badge">{t(stage.fastBadge, lang)}</span>
              </div>
              <div className="hm-lane-node hm-lane-db">
                <span className="hm-lane-title">{t(stage.dbNode, lang)}</span>
                <span className="hm-lane-sub">{t(stage.dbNodeSub, lang)}</span>
                <span className="hm-lane-badge hm-lane-badge-db">
                  {t(stage.truthBadge, lang)}
                </span>
              </div>
            </div>
          </div>
          <div className="stage-caption">{t(stage.s6cap, lang)}</div>
        </div>
      );

    // 幕 7：公式
    default:
      return (
        <div className="stage">
          <div className="hm-formula">
            <span className="hm-f hm-f-mem">{t(stage.fMem, lang)}</span>
            <span className="hm-f-op">+</span>
            <span className="hm-f hm-f-kv mono">{t(stage.fKv, lang)}</span>
            <span className="hm-f-op">+</span>
            <span className="hm-f hm-f-ttl">{t(stage.fTtl, lang)}</span>
            <span className="hm-f-op">=</span>
            <span className="hm-f hm-f-res">{t(stage.fResult, lang)}</span>
          </div>
          <div className="stage-caption">{t(stage.s7cap, lang)}</div>
        </div>
      );
  }
}
