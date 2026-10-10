"use client";

// Left navigation rail of the "Research OS" workbench (ported from AgentLab).
// RedisVisual is a single linear learning path, so the rail is a flat list of stops
// rather than a chapter tree. The STOP list + active-stop rule are exported so
// the toolbar and command palette share the same source.

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ui, useLang, t, type L } from "@/lib/i18n";
import { useShell } from "./theme-provider";
import { BrandMark } from "./logo";

export type SideStop = { href: string; glyph: string; label: L };

// The eight stops of the learning path, in order.
export const STOPS: SideStop[] = [
  { href: "/", glyph: "1", label: ui.nav.stop1 },
  { href: "/data", glyph: "2", label: ui.nav.stop2 },
  { href: "/scenarios", glyph: "3", label: ui.nav.stop3 },
  { href: "/pitfalls", glyph: "4", label: ui.nav.stop4 },
  { href: "/internals", glyph: "5", label: ui.nav.stop5 },
  { href: "/code", glyph: "6", label: ui.nav.stop6 },
  { href: "/interview", glyph: "7", label: ui.nav.stop7 },
  { href: "/simulator", glyph: "8", label: ui.nav.stop8 },
];

// Which stop is active for a given path ("/code/x" still counts as /code).
// -1 for a path that is not a stop (the 404 page), so nothing is marked current.
export function activeStopIndex(path: string): number {
  if (path === "/") return 0;
  return STOPS.findIndex(
    (s) => s.href !== "/" && (path === s.href || path.startsWith(s.href + "/")),
  );
}

export default function Sidebar() {
  const path = usePathname();
  const { lang } = useLang();
  const { sidebarOpen, setSidebarOpen } = useShell();

  const activeIndex = activeStopIndex(path);
  const progress = Math.round(((activeIndex + 1) / STOPS.length) * 100);

  const close = () => setSidebarOpen(false);
  const railRef = useRef<HTMLElement>(null);

  // Mobile drawer: move focus in when it opens, keep Tab inside it, close it with Esc
  // (or when the window grows past the drawer breakpoint), and give focus back to the
  // menu button when it closes.
  useEffect(() => {
    if (!sidebarOpen) return;
    const rail = railRef.current;
    if (!rail) return;
    const links = () => Array.from(rail.querySelectorAll<HTMLElement>("a[href]"));
    (rail.querySelector<HTMLElement>('[aria-current="page"]') ?? links()[0])?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setSidebarOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const items = links();
      const first = items[0];
      const last = items[items.length - 1];
      if (!rail.contains(document.activeElement)) {
        e.preventDefault();
        first?.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    const wide = window.matchMedia("(min-width: 961px)");
    const onWide = () => {
      if (wide.matches) setSidebarOpen(false);
    };
    document.addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);
    return () => {
      document.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
      if (rail.contains(document.activeElement)) {
        document.querySelector<HTMLElement>(".menu-btn")?.focus();
      }
    };
  }, [sidebarOpen, setSidebarOpen]);

  return (
    <>
      <aside
        ref={railRef}
        className={`sidebar${sidebarOpen ? " open" : ""}`}
        aria-label={t(ui.side.rail, lang)}
      >
        <Link href="/" className="brand" onClick={close} aria-label="RedisVisual">
          <span className="brand-mark" aria-hidden>
            <BrandMark />
          </span>
          <span className="brand-text">
            <span className="brand-name">{t(ui.brand.name, lang)}</span>
            <span className="brand-tagline">{t(ui.brand.tagline, lang)}</span>
          </span>
        </Link>

        <nav className="side-nav" aria-label={t(ui.side.stops, lang)}>
          {STOPS.map((s, i) => {
            const active = i === activeIndex;
            return (
              <Link
                key={s.href}
                href={s.href}
                // No prefetch: the rail lists every stop, so prefetching would download the
                // whole course on each visit. The page's own "next stop" link still prefetches.
                prefetch={false}
                className={`side-link${active ? " active" : ""}`}
                aria-current={active ? "page" : undefined}
                onClick={close}
              >
                <span className="side-glyph" aria-hidden>
                  {s.glyph}
                </span>
                <span className="side-label">{t(s.label, lang)}</span>
              </Link>
            );
          })}
        </nav>

        <div className="side-status">
          <div className="eyebrow">{t(ui.side.status, lang)}</div>
          <div className="side-status-label">
            {t(ui.side.progress, lang)}
            {activeIndex >= 0 && (
              <span className="side-status-pos">
                {" · "}
                {activeIndex + 1} / {STOPS.length}
              </span>
            )}
          </div>
          <div
            className="progress"
            role="progressbar"
            aria-label={t(ui.side.position, lang)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            aria-valuetext={
              activeIndex >= 0
                ? lang === "zh"
                  ? `第 ${activeIndex + 1} 站，共 ${STOPS.length} 站`
                  : `Stop ${activeIndex + 1} of ${STOPS.length}`
                : undefined
            }
          >
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </aside>

      <div
        className={`scrim${sidebarOpen ? " open" : ""}`}
        aria-hidden
        onClick={close}
      />
    </>
  );
}
