import { describe, it, expect } from "vitest";
import { readingMs } from "./reading";
import { scenes } from "./intro";
import { scenarios } from "./scenarios";

describe("auto-play reading time", () => {
  it("counts a glossary term by its displayed words", () => {
    const words = Array.from({ length: 98 }, () => "word").join(" ");
    expect(readingMs(`${words} [[ttl:TTL]] end`, "en")).toBe(2000 + 100 * 300);
  });

  it("counts Chinese characters and the English words mixed into them", () => {
    expect(readingMs("一二三四五六七八九十".repeat(10) + " SET GET", "zh")).toBe(2000 + 102 * 200);
  });

  it("never shows a step for less than 8 seconds", () => {
    expect(readingMs("Short.", "en")).toBe(8000);
  });

  it("gives every narration on Stops 1 and 3 time to be read at 200 words a minute", () => {
    const texts = [...scenes.map((s) => s.text), ...scenarios.flatMap((s) => s.steps.map((st) => st.text))];
    for (const text of texts) {
      const words = text.en.replace(/\[\[\w+:([^\]]+)\]\]/g, "$1").split(/\s+/).filter(Boolean).length;
      expect(readingMs(text.en, "en")).toBeGreaterThanOrEqual((words / 200) * 60_000);
    }
  });
});
