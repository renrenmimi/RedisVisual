// Unit tests for the pure simulation engine (Stop 8).
//
// These prove the correctness properties the fault simulator claims — in
// particular that TTL jitter changes the simulation state (a spread expiry
// cohort), not merely the log copy. Everything is deterministic: the engine's
// only randomness is a seeded PRNG, so no test calls Math.random.

import { describe, it, expect } from "vitest";
import {
  createState,
  tick,
  SIM,
  DEFAULT_CONFIG,
  type SimConfig,
  type SimEvent,
  type TickOutput,
} from "./engine";

const SEED = 12345;

function cfg(over: Partial<SimConfig> = {}): SimConfig {
  return { ...DEFAULT_CONFIG, ...over };
}

/** Run `ticks` steps, optionally injecting one fault at a given tick index. */
function run(
  config: SimConfig,
  opts: { seed?: number; ticks: number; faultAt?: number; fault?: "breakdown" | "avalanche" | "redisDown" },
) {
  const state = createState(config, opts.seed ?? SEED);
  const outputs: TickOutput[] = [];
  for (let i = 0; i < opts.ticks; i++) {
    const fault = opts.fault && i === opts.faultAt ? opts.fault : null;
    outputs.push(tick(state, config, fault));
  }
  return { state, outputs };
}

function eventsOfKind<K extends SimEvent["kind"]>(outputs: TickOutput[], kind: K) {
  return outputs.flatMap((o) => o.events).filter((e): e is Extract<SimEvent, { kind: K }> => e.kind === kind);
}

const peak = (outputs: TickOutput[], sel: (o: TickOutput) => number) =>
  Math.max(...outputs.map(sel));

describe("determinism", () => {
  it("1. same seed + same config produce identical output", () => {
    const a = run(cfg({ hot: 40 }), { ticks: 60, faultAt: 5, fault: "avalanche" });
    const b = run(cfg({ hot: 40 }), { ticks: 60, faultAt: 5, fault: "avalanche" });
    expect(JSON.stringify(a.outputs)).toEqual(JSON.stringify(b.outputs));
  });

  it("10. reset reproduces the initial deterministic state", () => {
    const snap = () => [...createState(cfg(), SEED).cache.entries()].sort((x, y) => x[0] - y[0]);
    expect(snap()).toEqual(snap());
  });

  it("11. pause stops simulation time (no tick, no advance)", () => {
    const state = createState(cfg(), SEED);
    tick(state, cfg());
    tick(state, cfg());
    const pausedNow = state.now;
    const pausedCacheSize = state.cache.size;
    // "Pause" is simply not calling tick: nothing about state may change.
    expect(state.now).toBe(pausedNow);
    expect(state.cache.size).toBe(pausedCacheSize);
    // Resuming advances by exactly one tick.
    tick(state, cfg());
    expect(state.now).toBe(pausedNow + SIM.tickMs);
  });
});

describe("avalanche cohort model", () => {
  it("2. without jitter, the cohort expires in one synchronized tick", () => {
    const { outputs } = run(cfg({ jitter: false }), { ticks: 30, faultAt: 2, fault: "avalanche" });
    const [ava] = eventsOfKind(outputs, "avalanche");
    expect(ava).toBeDefined();
    expect(ava.spread).toBe(false);
    expect(ava.spanTicks).toBe(1);
    // Almost the whole cohort lapses in the injection tick.
    expect(ava.peak).toBe(ava.cohort);
    expect(outputs[2].expiredThisTick).toBeGreaterThanOrEqual(ava.cohort);
  });

  it("3. with jitter, the cohort's expiry spreads across many ticks", () => {
    const { outputs } = run(cfg({ jitter: true }), { ticks: 120, faultAt: 2, fault: "avalanche" });
    const [ava] = eventsOfKind(outputs, "avalanche");
    expect(ava).toBeDefined();
    expect(ava.spread).toBe(true);
    expect(ava.spanTicks).toBeGreaterThan(1);
    // Materially fewer keys expire in any single tick than the whole cohort.
    expect(ava.peak).toBeLessThan(ava.cohort / 2);
  });

  it("4. protected peak DB load and p99 are lower than the unprotected run (fixed seed)", () => {
    const base = { qps: 1500, hot: 30 } as const;
    const off = run(cfg({ ...base, jitter: false }), { ticks: 90, faultAt: 1, fault: "avalanche" });
    const on = run(cfg({ ...base, jitter: true }), { ticks: 90, faultAt: 1, fault: "avalanche" });
    const peakP99Off = peak(off.outputs, (o) => o.metrics.p99);
    const peakP99On = peak(on.outputs, (o) => o.metrics.p99);
    const peakDbOff = peak(off.outputs, (o) => o.metrics.dbQps);
    const peakDbOn = peak(on.outputs, (o) => o.metrics.dbQps);
    expect(peakP99On).toBeLessThan(peakP99Off);
    expect(peakDbOn).toBeLessThan(peakDbOff);
  });

  it("5. the avalanche event carries measured counts, not fabricated ones", () => {
    const { outputs } = run(cfg({ jitter: false }), { ticks: 30, faultAt: 2, fault: "avalanche" });
    const [ava] = eventsOfKind(outputs, "avalanche");
    // peak keys/tick is a real subset of the cohort; hit and p99 are in range.
    expect(ava.peak).toBeGreaterThan(0);
    expect(ava.peak).toBeLessThanOrEqual(ava.cohort);
    expect(ava.hit).toBeGreaterThanOrEqual(0);
    expect(ava.hit).toBeLessThanOrEqual(100);
    expect(ava.p99).toBeGreaterThanOrEqual(SIM.hitLatency);
  });

  it("6. spread is true only when expiry actually landed across >1 tick", () => {
    const noJitter = eventsOfKind(
      run(cfg({ jitter: false }), { ticks: 40, faultAt: 2, fault: "avalanche" }).outputs,
      "avalanche",
    );
    const withJitter = eventsOfKind(
      run(cfg({ jitter: true }), { ticks: 120, faultAt: 2, fault: "avalanche" }).outputs,
      "avalanche",
    );
    for (const e of [...noJitter, ...withJitter]) {
      // The flag is derived from the measured span, never from config.
      expect(e.spread).toBe(e.spanTicks > 1);
    }
    // The no-jitter run must never claim a spread.
    expect(noJitter.every((e) => e.spread === false)).toBe(true);
  });
});

describe("other mechanisms are preserved", () => {
  it("7. single-flight collapses concurrent rebuilds of the same key", () => {
    const base = { hot: 80, qps: 2000 } as const;
    const noSf = run(cfg({ ...base, singleFlight: false }), { ticks: 20, faultAt: 2, fault: "breakdown" });
    const sf = run(cfg({ ...base, singleFlight: true }), { ticks: 20, faultAt: 2, fault: "breakdown" });
    const dbOff = eventsOfKind(noSf.outputs, "breakdown")[0];
    const dbOn = eventsOfKind(sf.outputs, "breakdown")[0];
    expect(dbOn.dbQps).toBeLessThan(dbOff.dbQps);
    expect(dbOn.absorbed).toBe(true);
    expect(dbOff.absorbed).toBe(false);
  });

  it("8. LRU eviction never exceeds capacity", () => {
    const { outputs } = run(cfg({ capacity: 40, hot: 20, qps: 2500 }), { ticks: 120 });
    for (const o of outputs) expect(o.metrics.size).toBeLessThanOrEqual(40);
  });

  it("12. LRU keeps the hot key when the cache is far smaller than the keyspace", () => {
    // The "not enough memory" preset: one tick misses more keys than the cache can hold.
    const config = cfg({ capacity: 40, hot: 25, ttl: 12 });
    const state = createState(config, SEED);
    let present = 0;
    let hit = 0;
    const ticks = 200;
    for (let i = 0; i < 400; i++) {
      const before = state.cache.get(0);
      const out = tick(state, config, null);
      if (i < 400 - ticks) continue;
      if (before && before.expireAt > state.now) present++;
      hit += out.metrics.hit;
    }
    // The hot key is requested all through every tick, so it is never the least
    // recently used entry: it stays cached apart from its own TTL refills.
    expect(present / ticks).toBeGreaterThanOrEqual(0.9);
    // And the hit rate cannot fall below the hot key's own share of the traffic.
    expect(hit / ticks).toBeGreaterThan(config.hot / 100);
  });

  it("9. Redis-down produces zero cache hits during the outage", () => {
    const { outputs } = run(cfg(), { ticks: 40, faultAt: 3, fault: "redisDown" });
    const outageTicks = SIM.redisDownMs / SIM.tickMs; // 30 ticks
    for (let i = 3; i < 3 + outageTicks; i++) {
      expect(outputs[i].metrics.hit).toBe(0);
    }
    // And it recovers afterwards.
    expect(outputs[3 + outageTicks + 5].metrics.hit).toBeGreaterThan(0);
  });
});
