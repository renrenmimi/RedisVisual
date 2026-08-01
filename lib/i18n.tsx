"use client";

// 极简双语方案：一个 context 存当前语言（localStorage 持久化），
// 所有文案都是 { zh, en } 成对出现，用 t() 取当前语言的那份。
// 注意：只有「外壳」（侧栏 / 工具条 / 命令面板）的通用文案放在这里的 ui。
// 每一站自己的正文都写在各自的数据文件里（lib/intro.ts、lib/scenarios.ts …），
// 这样各站互不干扰，便于并行开发。

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Lang = "zh" | "en";
export type L = { zh: string; en: string };

export const t = (l: L, lang: Lang) => l[lang];

type Ctx = { lang: Lang; setLang: (l: Lang) => void };
const LangContext = createContext<Ctx>({ lang: "zh", setLang: () => {} });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, set] = useState<Lang>("zh");

  useEffect(() => {
    const saved = window.localStorage.getItem("redislab-lang");
    if (saved === "en" || saved === "zh") {
      set(saved);
      document.documentElement.lang = saved === "zh" ? "zh-CN" : "en";
    }
  }, []);

  const setLang = (l: Lang) => {
    set(l);
    window.localStorage.setItem("redislab-lang", l);
    document.documentElement.lang = l === "zh" ? "zh-CN" : "en";
  };

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);

// ---------- 界面通用文案（Research OS 外壳 + 四站导航名） ----------

export const ui = {
  nav: {
    stop1: { zh: "什么是 Redis", en: "What is Redis" },
    stop2: { zh: "我们为什么用它", en: "Why We Use It" },
    stop3: { zh: "跟着写一遍", en: "Code It Yourself" },
    stop4: { zh: "面试速通", en: "Interview Prep" },
  },

  brand: {
    name: { zh: "RedisLab", en: "RedisLab" },
    tagline: {
      zh: "看得见的 Redis · See Inside Redis",
      en: "See Inside Redis · 看得见的 Redis",
    },
  },
  side: {
    status: { zh: "STATUS", en: "STATUS" },
    progress: { zh: "四站学习闭环", en: "4-stop learning path" },
  },
  toolbar: {
    hideNav: { zh: "隐藏导航栏", en: "Hide navigation" },
    showNav: { zh: "显示导航栏", en: "Show navigation" },
    search: { zh: "搜索 / Search…", en: "Search…" },
  },
  cmdk: {
    placeholder: { zh: "搜索四站 / Search…", en: "Search stops…" },
    empty: { zh: "没有匹配项", en: "No matches" },
    navHint: {
      zh: "↑↓ 选择 · ↵ 跳转 · esc 关闭",
      en: "↑↓ navigate · ↵ open · esc close",
    },
  },
  theme: {
    toDark: { zh: "切到深色模式", en: "Switch to dark mode" },
    toLight: { zh: "切到浅色模式", en: "Switch to light mode" },
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
