// How long auto-play stays on a step: long enough to read its narration.
// The rates are deliberately unhurried for a beginner reading technical text:
// about 0.3 s per English word and 0.2 s per Chinese character, plus 2 s to watch
// the animation, and never less than 8 s.

import type { Lang } from "./i18n";

const TERM = /\[\[\w+:([^\]]+)\]\]/g;

export function readingMs(text: string, lang: Lang): number {
  const plain = text.replace(TERM, "$1").replace(/[`*]/g, "");
  const units =
    lang === "zh"
      ? (plain.match(/[㐀-鿿]/g) ?? []).length +
        (plain.match(/[A-Za-z0-9][A-Za-z0-9.:'-]*/g) ?? []).length
      : (plain.match(/\S+/g) ?? []).length;
  return Math.max(8000, 2000 + units * (lang === "zh" ? 200 : 300));
}
