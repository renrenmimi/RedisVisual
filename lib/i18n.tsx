"use client";

// 极简双语方案：一个 context 存当前语言（localStorage 持久化），
// 所有文案都是 { zh, en } 成对出现，用 t() 取当前语言的那份。
// 默认语言是英文（en）；中文通过工具条上的切换按钮启用。
// 注意：只有「外壳」（侧栏 / 工具条 / 命令面板）的通用文案放在这里的 ui。
// 每一站自己的正文都写在各自的数据文件里（lib/intro.ts、lib/scenarios.ts …），
// 这样各站互不干扰，便于并行开发。

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "zh" | "en";
export type L = { zh: string; en: string };

export const t = (l: L, lang: Lang) => l[lang];

const LANG_KEY = "redisvisual-lang";

// 首帧前跑（和 themeScript 一起放在 <head> 里）：读出保存的语言并写到
// <html data-lang> / <html lang> 上，这样第一次绘制就已经是正确的语言，
// 不会先闪一下中文再切成英文。默认 "en"。
export const langScript = `(function(){var d=document.documentElement;var l="en";try{if(localStorage.getItem("${LANG_KEY}")==="zh"){l="zh";}}catch(e){}d.dataset.lang=l;d.lang=l==="zh"?"zh-CN":"en";})();`;

type Ctx = { lang: Lang; setLang: (l: Lang) => void };
const LangContext = createContext<Ctx>({ lang: "en", setLang: () => {} });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, set] = useState<Lang>("en");

  // 和无闪脚本已经写好的 <html data-lang> 对齐（脚本已经读过 localStorage）。
  useEffect(() => {
    const applied = document.documentElement.dataset.lang;
    if (applied === "zh" || applied === "en") {
      set(applied);
      return;
    }
    let saved: string | null = null;
    try {
      saved = window.localStorage.getItem(LANG_KEY);
    } catch {
      /* 隐私模式 / 禁用存储时忽略 */
    }
    if (saved === "en" || saved === "zh") {
      set(saved);
      document.documentElement.dataset.lang = saved;
      document.documentElement.lang = saved === "zh" ? "zh-CN" : "en";
    }
  }, []);

  const setLang = useCallback((l: Lang) => {
    set(l);
    const d = document.documentElement;
    d.dataset.lang = l;
    d.lang = l === "zh" ? "zh-CN" : "en";
    try {
      window.localStorage.setItem(LANG_KEY, l);
    } catch {
      /* 写入失败（隐私模式等）不应影响切换本身 */
    }
  }, []);

  const value = useMemo(() => ({ lang, setLang }), [lang, setLang]);

  return (
    <LangContext.Provider value={value}>{children}</LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);

// ---------- 界面通用文案（Research OS 外壳 + 七站导航名） ----------

export const ui = {
  nav: {
    stop1: { zh: "什么是 Redis", en: "What is Redis" },
    stop2: { zh: "数据结构详解", en: "Data structures" },
    stop3: { zh: "我们为什么用它", en: "Why we use it" },
    stop4: { zh: "缓存的坑与一致性", en: "Cache pitfalls" },
    stop5: { zh: "生产机制", en: "Redis in production" },
    stop6: { zh: "跟着写一遍", en: "Write it yourself" },
    stop7: { zh: "面试速通", en: "Interview prep" },
  },

  brand: {
    name: { zh: "RedisVisual", en: "RedisVisual" },
    tagline: {
      zh: "看得见的 Redis · See Inside Redis",
      en: "See Inside Redis · 看得见的 Redis",
    },
  },
  side: {
    status: { zh: "STATUS", en: "STATUS" },
    progress: { zh: "七站学习闭环", en: "A 7-stop learning path" },
    stops: { zh: "七站导航", en: "Stops" },
    rail: { zh: "课程导航", en: "Course navigation" },
  },
  toolbar: {
    hideNav: { zh: "隐藏导航栏", en: "Hide the navigation rail" },
    showNav: { zh: "显示导航栏", en: "Show the navigation rail" },
    search: { zh: "搜索 / Search…", en: "Search…" },
  },
  cmdk: {
    placeholder: { zh: "搜索七站 / Search…", en: "Search the seven stops…" },
    empty: { zh: "没有匹配项", en: "No matches" },
    navHint: {
      zh: "↑↓ 选择 · ↵ 跳转 · esc 关闭",
      en: "↑↓ select · ↵ open · esc close",
    },
  },
  theme: {
    toDark: { zh: "切到深色模式", en: "Switch to dark mode" },
    toLight: { zh: "切到浅色模式", en: "Switch to light mode" },
  },
  lang: {
    group: { zh: "语言 / Language", en: "Language / 语言" },
    toEn: { zh: "切换到英文", en: "Switch to English" },
    toZh: { zh: "切换到中文", en: "Switch to Chinese" },
  },

  common: {
    reset: { zh: "重置", en: "Reset" },
    autoplay: { zh: "自动播放", en: "Auto-play" },
    pause: { zh: "暂停", en: "Pause" },
    replay: { zh: "↻ 重新播放", en: "↻ Replay" },
    next: { zh: "下一步", en: "next" },
    prev: { zh: "上一步", en: "back" },
    space: { zh: "空格", en: "Space" },
  },
};
