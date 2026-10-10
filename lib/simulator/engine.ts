// Pure, deterministic simulation engine for Stop 8 (the Redis fault simulator).
//
// Everything that used to live inside the React component now lives here as
// framework-free logic: a seeded PRNG, an explicit simulation state, and a
// single `tick(state, config, fault?)` step that returns metrics, cache cells
// and metric-derived events. The React page only advances the clock and renders
// what this module returns.
//
// Why this rewrite exists
// -----------------------
// The previous model injected a "cache avalanche" by force-expiring 80% of the
// cache with `expireAt = now`, regardless of the TTL-jitter toggle; jitter only
// changed the log message. So the simulator could claim "expiry was spread out"
// while the injected failure was byte-identical. That was a false positive.
//
// Here an avalanche is modelled as a COHORT of keys that were cached together
// and whose TTLs are now coming due. With jitter OFF the cohort was given one
// shared TTL, so it expires in a single synchronized tick. With jitter ON the
// cohort's TTLs were randomized at fill time, so expiry is spread across many
// ticks and fewer keys expire per tick. The protection therefore emerges from
// the simulation state (the distribution of `expireAt`), not from a message —
// and a protected run can still degrade, just by less.

/* ----------------------------- configuration ----------------------------- */

export interface SimConfig {
  /** requests per second */
  qps: number;
  /** time to live, in seconds */
  ttl: number;
  /** max keys the cache can hold before LRU eviction kicks in */
  capacity: number;
  /** share of traffic (0–85, a percentage) that targets the single hot key */
  hot: number;
  /** randomize TTLs so a cohort does not all expire at the same instant */
  jitter: boolean;
  /** collapse concurrent rebuilds of the same key into one DB call */
  singleFlight: boolean;
}

export const SIM = {
  keyspace: 200, // number of distinct keys in the workload
  gridCells: 60, // how many keys the cache grid visualises
  tickMs: 100, // one tick = 100ms of simulated time (10 ticks/second)
  historyLen: 90, // chart keeps this many ticks (~9s)
  hitLatency: 1, // a cache hit costs ~1ms
  dbBaseLatency: 40, // a miss falls through to the DB at ~40ms
  dbCapacity: 30, // DB comfortably serves this many rebuilds per tick
  overloadK: 3, // beyond capacity, latency grows: base * (1 + overload*K)
  redisDownMs: 3000, // "Redis down" outage length
  avalancheFrac: 0.8, // an avalanche cohort is this fraction of the cache
  // With jitter on, a cohort's expiry is spread uniformly across this fraction
  // of one TTL. This is the whole point of TTL jitter, expressed as state.
  avalancheJitterSpread: 0.85,
} as const;

export const RANGES = {
  qps: { min: 200, max: 6000, step: 100, def: 1200 },
  ttl: { min: 1, max: 30, step: 1, def: 8 },
  capacity: { min: 20, max: 200, step: 10, def: 160 },
  hot: { min: 0, max: 85, step: 5, def: 30 },
} as const;

export const DEFAULT_CONFIG: SimConfig = {
  qps: RANGES.qps.def,
  ttl: RANGES.ttl.def,
  capacity: RANGES.capacity.def,
  hot: RANGES.hot.def,
  jitter: false,
  singleFlight: false,
};

/** A fixed seed keeps the simulation deterministic, so Reset reproduces the
 *  exact opening state and tests can assert on concrete numbers. */
export const DEFAULT_SEED = 0x9e3779b9;

/* -------------------------------- outputs -------------------------------- */

export type FaultKind = "breakdown" | "avalanche" | "redisDown";

export interface Metrics {
  /** hit rate, 0–1 */
  hit: number;
  /** average latency this tick, ms */
  avg: number;
  /** p99 latency this tick, ms */
  p99: number;
  /** rebuilds sent to the DB this tick, expressed per second */
  dbQps: number;
  /** keys currently held in the cache */
  size: number;
}

export type CellState = "empty" | "fresh" | "expiring" | "hot";
export interface Cell {
  state: CellState;
  /** fraction of TTL remaining, 0–1 (only meaningful for fresh/expiring) */
  frac: number;
}

/** Events are derived from measured tick output, never from config alone. */
export type SimEvent =
  | { kind: "breakdown"; dbQps: number; p99: number; absorbed: boolean }
  | {
      kind: "avalanche";
      /** cohort size that was scheduled to expire */
      cohort: number;
      /** most keys that actually expired in any single tick */
      peak: number;
      /** how many ticks the cohort's expiry was spread across (measured) */
      spanTicks: number;
      /** true only when expiry actually landed across more than one tick */
      spread: boolean;
      /** worst hit rate observed while the cohort drained (0–100) */
      hit: number;
      /** worst p99 observed while the cohort drained (ms) */
      p99: number;
    }
  | { kind: "redisDown" }
  | { kind: "redisUp" }
  | { kind: "recovered"; hit: number; p99: number };

export interface TickOutput {
  metrics: Metrics;
  cells: Cell[];
  events: SimEvent[];
  /** total keys whose TTL lapsed this tick (before any refill) */
  expiredThisTick: number;
}

/* --------------------------------- state --------------------------------- */

interface Entry {
  expireAt: number;
  lastUsed: number;
}

/** Bookkeeping for one in-flight avalanche cohort, used to measure — not fake —
 *  how TTL jitter changed the failure. */
interface Cohort {
  size: number;
  /** key → scheduled expiry time; drained as `now` passes each entry */
  pending: Map<number, number>;
  injectedAt: number;
  firstExpiry: number; // -1 until the first cohort key expires
  lastExpiry: number;
  peakExpired: number; // most cohort keys expiring in a single tick
  worstHit: number; // 0–1
  worstP99: number; // ms
}

export interface SimState {
  /** mulberry32 seed; all randomness flows through this, nothing else */
  seed: number;
  now: number;
  cache: Map<number, Entry>;
  redisUntil: number;
  cohort: Cohort | null;
  badTicks: number;
  wasDown: boolean;
}

/* ------------------------------- utilities ------------------------------- */

/** mulberry32 — a small, fast, deterministic PRNG. Advances state.seed. */
function rand(s: SimState): number {
  s.seed = (s.seed + 0x6d2b79f5) | 0;
  let t = Math.imul(s.seed ^ (s.seed >>> 15), 1 | s.seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** The hot key is always key 0; the rest of the traffic is uniform. */
function pickKey(s: SimState, cfg: SimConfig): number {
  if (rand(s) * 100 < cfg.hot) return 0;
  return 1 + Math.floor(rand(s) * (SIM.keyspace - 1));
}

function evict(s: SimState, capacity: number): void {
  while (s.cache.size > capacity) {
    let lruKey = -1;
    let lruTime = Infinity;
    for (const [k, e] of s.cache) {
      if (e.lastUsed < lruTime) {
        lruTime = e.lastUsed;
        lruKey = k;
      }
    }
    if (lruKey === -1) break;
    s.cache.delete(lruKey);
  }
}

/** Refill TTL. Jitter here spreads ordinary refills (±40%); the cohort model
 *  below uses a wider spread to represent a whole cohort's randomized TTLs. */
function refillTtl(s: SimState, cfg: SimConfig): number {
  const factor = cfg.jitter ? 0.6 + rand(s) * 0.8 : 1;
  return cfg.ttl * 1000 * factor;
}

/* ------------------------------ construction ----------------------------- */

/** Build a warm cache so the opening frame is near steady state rather than a
 *  cold-start miss storm. Deterministic given the seed. */
export function createState(config: SimConfig, seed: number = DEFAULT_SEED): SimState {
  const s: SimState = {
    seed: seed | 0,
    now: 0,
    cache: new Map(),
    redisUntil: -1,
    cohort: null,
    badTicks: 0,
    wasDown: false,
  };
  const n = Math.min(config.capacity, SIM.keyspace);
  for (let k = 0; k < n; k++) {
    s.cache.set(k, {
      expireAt: config.ttl * 1000 * (0.2 + rand(s) * 0.8),
      lastUsed: -rand(s) * 1000,
    });
  }
  // Guarantee the hot key is present and fresh.
  s.cache.set(0, { expireAt: config.ttl * 1000, lastUsed: 0 });
  return s;
}

/* ------------------------------- injection ------------------------------- */

/** Inject an avalanche: a cohort of keys that were cached together and whose
 *  TTLs are now coming due. Without jitter they share one TTL and expire in the
 *  same tick; with jitter their TTLs were randomized, so expiry is spread. */
function injectAvalanche(s: SimState, cfg: SimConfig): void {
  const keys = [...s.cache.keys()].filter((k) => k !== 0);
  // Fisher–Yates with the seeded PRNG so cohort selection is deterministic.
  for (let i = keys.length - 1; i > 0; i--) {
    const j = Math.floor(rand(s) * (i + 1));
    [keys[i], keys[j]] = [keys[j], keys[i]];
  }
  const n = Math.floor(keys.length * SIM.avalancheFrac);
  const pending = new Map<number, number>();
  const window = cfg.ttl * 1000 * SIM.avalancheJitterSpread;
  for (let i = 0; i < n; i++) {
    const k = keys[i];
    // Synchronized (no jitter) => same instant. Jittered => staggered forward.
    const expireAt = cfg.jitter ? s.now + rand(s) * window : s.now;
    const e = s.cache.get(k);
    if (e) e.expireAt = expireAt;
    pending.set(k, expireAt);
  }
  s.cohort = {
    size: n,
    pending,
    injectedAt: s.now,
    firstExpiry: -1,
    lastExpiry: -1,
    peakExpired: 0,
    worstHit: 1,
    worstP99: 0,
  };
}

/* --------------------------------- tick ---------------------------------- */

export function tick(
  state: SimState,
  config: SimConfig,
  fault?: FaultKind | null,
): TickOutput {
  const s = state;
  const cfg = config;
  const prevNow = s.now;
  s.now += SIM.tickMs;
  const events: SimEvent[] = [];

  // 1) Apply the fault command at the top of the tick.
  if (fault === "redisDown") {
    s.redisUntil = s.now + SIM.redisDownMs;
  } else if (fault === "breakdown") {
    const e = s.cache.get(0);
    if (e) e.expireAt = s.now; // expire the hot key now
  } else if (fault === "avalanche") {
    injectAvalanche(s, cfg);
  }

  const down = s.now < s.redisUntil;

  // 2) Count keys whose TTL lapsed this tick, before any refill (a general,
  //    fault-agnostic measure of synchronized expiry).
  let expiredThisTick = 0;
  for (const e of s.cache.values()) {
    if (e.expireAt > prevNow && e.expireAt <= s.now) expiredThisTick++;
  }

  // 3) Serve this tick's request batch against the cache as it stands now
  //    (a concurrent batch: no mid-tick refills influence later requests).
  const reqs = Math.max(1, Math.round((cfg.qps * SIM.tickMs) / 1000));
  let hits = 0;
  const missed = new Set<number>();
  const hitKeys = new Set<number>();
  // When each key was last requested inside this tick. The batch is spread evenly over
  // (prevNow, now], so LRU sees real recency: a hot key asked for all through the tick
  // stays more recent than a cold key asked for once early on. (Stamping every key with
  // `now` made them all tie, and the tie fell to Map order, which evicted the hot key
  // first whenever one tick missed more keys than the cache had untouched entries.)
  const lastSeen = new Map<number, number>();
  for (let r = 0; r < reqs; r++) {
    const key = pickKey(s, cfg);
    lastSeen.set(key, prevNow + ((r + 1) / reqs) * SIM.tickMs);
    const e = s.cache.get(key);
    if (!down && e && e.expireAt > s.now) {
      hits++;
      hitKeys.add(key);
    } else {
      missed.add(key);
    }
  }
  const misses = reqs - hits;

  // 4) DB load. Single-flight collapses concurrent rebuilds of the SAME key
  //    into one call, so a breakdown herd on the hot key stops overloading it.
  const dbCalls = down ? misses : cfg.singleFlight ? missed.size : misses;
  const overload = Math.max(0, dbCalls - SIM.dbCapacity) / SIM.dbCapacity;
  const dbLat = SIM.dbBaseLatency * (1 + overload * SIM.overloadK);
  const hitRate = hits / reqs;
  const avg = (hits * SIM.hitLatency + misses * dbLat) / reqs;
  const p99 = 1 - hitRate >= 0.01 ? dbLat : SIM.hitLatency;
  const dbQps = Math.round(dbCalls * (1000 / SIM.tickMs));

  // 5) Update the cache: refresh hits, refill misses, evict by LRU.
  for (const k of hitKeys) {
    const e = s.cache.get(k);
    if (e) e.lastUsed = lastSeen.get(k) ?? s.now;
  }
  if (!down) {
    for (const k of missed) {
      s.cache.set(k, { expireAt: s.now + refillTtl(s, cfg), lastUsed: lastSeen.get(k) ?? s.now });
    }
    evict(s, cfg.capacity);
  }

  const metrics: Metrics = { hit: hitRate, avg, p99, dbQps, size: s.cache.size };

  // 6) Measure how the cohort actually drained, and emit ONE avalanche event
  //    from those measurements when it finishes (or its window elapses).
  if (s.cohort) {
    let expiredNow = 0;
    for (const [k, ea] of s.cohort.pending) {
      if (ea <= s.now) {
        expiredNow++;
        s.cohort.pending.delete(k);
      }
    }
    if (expiredNow > 0) {
      if (s.cohort.firstExpiry < 0) s.cohort.firstExpiry = s.now;
      s.cohort.lastExpiry = s.now;
      s.cohort.peakExpired = Math.max(s.cohort.peakExpired, expiredNow);
    }
    s.cohort.worstHit = Math.min(s.cohort.worstHit, hitRate);
    s.cohort.worstP99 = Math.max(s.cohort.worstP99, p99);

    const windowElapsed =
      s.now - s.cohort.injectedAt > cfg.ttl * 1000 * SIM.avalancheJitterSpread + SIM.tickMs;
    if (s.cohort.pending.size === 0 || windowElapsed) {
      const spanTicks =
        s.cohort.firstExpiry < 0
          ? 0
          : Math.round((s.cohort.lastExpiry - s.cohort.firstExpiry) / SIM.tickMs) + 1;
      events.push({
        kind: "avalanche",
        cohort: s.cohort.size,
        peak: s.cohort.peakExpired,
        spanTicks,
        spread: spanTicks > 1,
        hit: Math.round(s.cohort.worstHit * 100),
        p99: Math.round(s.cohort.worstP99),
      });
      s.cohort = null;
    }
  }

  // 7) Breakdown / outage events, all derived from this tick's measurements.
  if (fault === "breakdown") {
    events.push({
      kind: "breakdown",
      dbQps,
      p99: Math.round(p99),
      // "Absorbed" is measured: single-flight kept the DB out of overload.
      absorbed: cfg.singleFlight && p99 <= SIM.dbBaseLatency * 1.5,
    });
  }
  if (fault === "redisDown") events.push({ kind: "redisDown" });
  if (s.wasDown && !down) events.push({ kind: "redisUp" });
  s.wasDown = down;

  // 8) Recovery: only after a sustained bad stretch, so single-tick spikes do
  //    not spam the log.
  const bad = p99 > 60 || hitRate < 0.6;
  if (bad) {
    s.badTicks++;
  } else {
    if (s.badTicks >= 6) {
      events.push({ kind: "recovered", hit: Math.round(hitRate * 100), p99: Math.round(p99) });
    }
    s.badTicks = 0;
  }

  // 9) Cache grid snapshot.
  const cells: Cell[] = [];
  const ttlMs = cfg.ttl * 1000;
  for (let k = 0; k < SIM.gridCells; k++) {
    const e = s.cache.get(k);
    if (!e || e.expireAt <= s.now) {
      cells.push({ state: "empty", frac: 0 });
    } else {
      const frac = Math.max(0, Math.min(1, (e.expireAt - s.now) / ttlMs));
      const cellState: CellState = k === 0 ? "hot" : frac < 0.25 ? "expiring" : "fresh";
      cells.push({ state: cellState, frac });
    }
  }

  return { metrics, cells, events, expiredThisTick };
}
