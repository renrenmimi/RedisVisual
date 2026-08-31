// 第 8 站「故障模拟器」的文案 + 参数 + 预设数据（双语）。
// 页面 app/simulator/page.tsx 里有一个真正的仿真引擎：按访问分布跑请求流，
// 维护一个带 TTL + LRU 淘汰的模拟缓存，实时算出命中率和延迟。
// 这里只放文字、参数范围和预设；引擎逻辑在页面里。

import type { L } from "@/lib/i18n";

// ---------- 仿真参数（引擎和滑块共用） ----------

export const SIM = {
  keyspace: 200, // 总共多少个不同的 key
  gridCells: 60, // 缓存网格展示前多少个 key
  tickMs: 100, // 每个 tick = 100ms 仿真时间（10 tick/秒）
  historyLen: 90, // 图表保留最近多少个 tick（约 9 秒）
  hitLatency: 1, // 命中延迟（ms）
  dbBaseLatency: 40, // 未命中回源到 DB 的基础延迟（ms）
  dbCapacity: 30, // DB 每 tick 能从容处理多少次回源；超过就排队变慢
  overloadK: 3, // 过载惩罚系数：负载越超上限，延迟涨得越狠
  redisDownMs: 3000, // 「Redis 宕机」持续时间
  avalancheFrac: 0.8, // 「雪崩」一次让多大比例的已缓存 key 立刻过期
};

// 滑块范围（min / max / step / 默认）
export const RANGES = {
  qps: { min: 200, max: 6000, step: 100, def: 1200 }, // 每秒请求数
  ttl: { min: 1, max: 30, step: 1, def: 8 }, // TTL（秒）
  capacity: { min: 20, max: 200, step: 10, def: 160 }, // 缓存容量（最多缓存多少 key）
  hot: { min: 0, max: 85, step: 5, def: 30 }, // 热点 key 占总流量的百分比
};

export type SimConfig = {
  qps: number;
  ttl: number; // 秒
  capacity: number;
  hot: number; // 0–85（%）
  jitter: boolean; // TTL 随机抖动（防雪崩）
  singleFlight: boolean; // 单飞 / 互斥（防击穿）
};

export const DEFAULT_CONFIG: SimConfig = {
  qps: RANGES.qps.def,
  ttl: RANGES.ttl.def,
  capacity: RANGES.capacity.def,
  hot: RANGES.hot.def,
  jitter: false,
  singleFlight: false,
};

// ---------- 页面外壳文案 ----------

export const sm = {
  title: { zh: "第 8 站 · 故障模拟器", en: "Stop 8 · Fault simulator" },
  subtitle: {
    zh: "亲手制造 Redis 故障，用命中率和延迟实时看后果——击穿、雪崩、热点、TTL、淘汰。",
    en: "Break Redis on purpose and watch the fallout live in hit rate and latency — breakdown, avalanche, hot keys, TTL, eviction.",
  },

  introTitle: {
    zh: "前面讲的坑，这里让你亲眼看到",
    en: "The pitfalls you read about — now you can watch them happen",
  },
  intro: {
    zh:
      "下面是一个**真的在跑**的仿真：引擎每秒按你设的 QPS 生成请求，查一个带 [[ttl:TTL]] 和 [[eviction:LRU 淘汰]]的模拟缓存，" +
      "命中就快（约 1ms），未命中就回源到「数据库」（约 40ms，且回源太多会排队变得更慢）。" +
      "**调左边的参数、点故障按钮**，右边的命中率、延迟、DB 压力会实时变化。开两个开关（TTL 抖动 / 单飞）能看到修复手段怎么把曲线拉回来。",
    en:
      "Below is a simulation that is **actually running**: each second the engine generates your chosen QPS of requests against a mock cache with [[ttl:TTL]] and [[eviction:LRU eviction]]. " +
      "A hit is fast (~1ms); a miss falls through to the “database” (~40ms — and gets slower as too many misses queue up). " +
      "**Move the controls on the left and press the fault buttons**; the hit rate, latency, and DB load on the right react live. Flip the two fixes (TTL jitter / single-flight) to watch the curves recover.",
  },

  // 控制面板
  ctrlTitle: { zh: "控制台", en: "Control panel" },
  qpsLabel: { zh: "请求量 QPS", en: "Traffic (QPS)" },
  ttlLabel: { zh: "TTL（秒）", en: "TTL (seconds)" },
  capLabel: { zh: "缓存容量（最多 key 数）", en: "Cache capacity (max keys)" },
  hotLabel: { zh: "热点 key 占流量", en: "Hot-key share of traffic" },

  fixesTitle: { zh: "修复手段", en: "Fixes" },
  jitterLabel: { zh: "TTL 随机抖动", en: "TTL jitter" },
  jitterHint: { zh: "打散过期时间，防雪崩", en: "spreads expiry, prevents avalanche" },
  sfLabel: { zh: "单飞 / 互斥重建", en: "Single-flight rebuild" },
  sfHint: { zh: "一个 key 同一时刻只回源一次，防击穿", en: "one rebuild per key at a time, prevents breakdown" },

  faultsTitle: { zh: "触发故障", en: "Trigger a fault" },
  faultBreakdown: { zh: "缓存击穿", en: "Cache breakdown" },
  faultBreakdownHint: {
    zh: "让热点 key 立刻过期，看它的流量瞬间涌向 DB",
    en: "expire the hot key now; watch its traffic slam the DB",
  },
  faultAvalanche: { zh: "缓存雪崩", en: "Cache avalanche" },
  faultAvalancheHint: {
    zh: "让大批 key 同时过期，DB 被瞬间涌入的请求压垮",
    en: "expire a large batch at once; the DB is flooded",
  },
  faultRedisDown: { zh: "Redis 宕机 3 秒", en: "Redis down for 3s" },
  faultRedisDownHint: {
    zh: "缓存整个消失，所有请求直连 DB",
    en: "the cache vanishes; every request hits the DB",
  },

  // 运行控制
  run: { zh: "运行", en: "Run" },
  pause: { zh: "暂停", en: "Pause" },
  reset: { zh: "重置", en: "Reset" },

  // 指标
  mHit: { zh: "命中率", en: "Hit rate" },
  mLat: { zh: "平均延迟", en: "Avg latency" },
  mP99: { zh: "p99 延迟", en: "p99 latency" },
  mDb: { zh: "DB 回源", en: "DB load" },
  mDbUnit: { zh: "次/秒", en: "/s" },
  mCache: { zh: "缓存占用", en: "Cache used" },

  chartHit: { zh: "命中率（越高越好）", en: "Hit rate (higher is better)" },
  chartLat: { zh: "p99 延迟（越低越好）", en: "p99 latency (lower is better)" },

  gridTitle: { zh: "缓存里的 key（前 60 个）", en: "Keys in the cache (first 60)" },
  legHot: { zh: "热点", en: "hot" },
  legFresh: { zh: "有效", en: "fresh" },
  legExpiring: { zh: "将过期", en: "expiring" },
  legEmpty: { zh: "空 / 已淘汰", en: "empty / evicted" },

  logTitle: { zh: "事件日志", en: "Event log" },
  logEmpty: { zh: "还没有事件——调调参数、点个故障试试。", en: "No events yet — change a control or trigger a fault." },

  // 预设剧本
  presetsTitle: { zh: "一键剧本", en: "One-click scenarios" },
  presets: [
    {
      id: "breakdown",
      name: { zh: "演示：缓存击穿", en: "Demo: cache breakdown" },
      desc: {
        zh: "把热点拉满、关掉单飞，然后让热点 key 过期——看 p99 瞬间飙升，再打开单飞看它压回去。",
        en: "Crank the hot key, turn single-flight off, then expire it — watch p99 spike, then flip single-flight on to see it flatten.",
      },
    },
    {
      id: "avalanche",
      name: { zh: "演示：缓存雪崩", en: "Demo: cache avalanche" },
      desc: {
        zh: "关掉 TTL 抖动，触发雪崩——命中率崩、DB 被洪水淹。再打开抖动重来，感受差别。",
        en: "Turn TTL jitter off and trigger an avalanche — hit rate collapses, the DB floods. Turn jitter on and retry to feel the difference.",
      },
    },
    {
      id: "eviction",
      name: { zh: "演示：内存不够（淘汰）", en: "Demo: not enough memory (eviction)" },
      desc: {
        zh: "把容量调到远小于 key 总数——热点还在，但冷数据被 LRU 不停淘汰，命中率稳稳地低。",
        en: "Set capacity far below the keyspace — hot keys survive, but cold data is evicted by LRU, so the hit rate settles low.",
      },
    },
    {
      id: "ttl",
      name: { zh: "演示：TTL 太短", en: "Demo: TTL too short" },
      desc: {
        zh: "把 TTL 压到 1–2 秒——key 还没被复用就过期了，DB 一直有稳定的回源压力。",
        en: "Drop TTL to 1–2s — keys expire before they get reused, so the DB carries a steady stream of rebuilds.",
      },
    },
  ] as { id: string; name: L; desc: L }[],

  // 事件日志模板（{db} {p99} {hit} 会被替换成数字）
  ev: {
    breakdown: {
      zh: "缓存击穿：热点 key 过期，DB 回源冲到 {db} 次/秒，p99 延迟 {p99}ms",
      en: "Breakdown: hot key expired, DB load jumped to {db}/s, p99 latency {p99}ms",
    },
    breakdownSafe: {
      zh: "缓存击穿被单飞挡住：只回源 1 次，p99 稳在 {p99}ms",
      en: "Breakdown absorbed by single-flight: just 1 rebuild, p99 stays {p99}ms",
    },
    avalanche: {
      zh: "缓存雪崩：{n} 个 key 同时过期，命中率跌到 {hit}%，p99 延迟 {p99}ms",
      en: "Avalanche: {n} keys expired at once, hit rate fell to {hit}%, p99 latency {p99}ms",
    },
    avalancheSafe: {
      zh: "TTL 抖动生效：过期被打散，命中率只轻微波动",
      en: "TTL jitter working: expiry is spread out, hit rate only dips slightly",
    },
    redisDown: {
      zh: "Redis 宕机：缓存全失效，所有请求直连 DB，命中率 0%",
      en: "Redis down: cache gone, every request hits the DB, hit rate 0%",
    },
    redisUp: {
      zh: "Redis 恢复：缓存回填中，命中率正在爬升",
      en: "Redis back: cache is refilling, hit rate climbing",
    },
    recovered: {
      zh: "已恢复稳态：命中率 {hit}%，p99 延迟 {p99}ms",
      en: "Back to steady state: hit rate {hit}%, p99 latency {p99}ms",
    },
  },

  takeawayTitle: { zh: "从曲线里读到的", en: "What the curves teach" },
  takeaways: [
    {
      zh: "**命中率**由容量、TTL、访问分布共同决定；容量 < key 总数就必然有 LRU 淘汰，命中率上不去。",
      en: "**Hit rate** is set by capacity, TTL and access pattern together; once capacity < keyspace, LRU eviction is unavoidable and the hit rate caps out.",
    },
    {
      zh: "**延迟不是线性的**：回源一旦超过 DB 处理能力，就开始排队，p99 呈非线性飙升——这就是击穿/雪崩的杀伤力来源。",
      en: "**Latency is not linear**: once rebuilds exceed the DB's capacity they queue, and p99 spikes non-linearly — that is what makes breakdown and avalanche dangerous.",
    },
    {
      zh: "**单飞治击穿**（把 N 次回源压成 1 次），**TTL 抖动治雪崩**（把同时过期打散）。对症下药，一个开关就看得到。",
      en: "**Single-flight fixes breakdown** (collapses N rebuilds into 1); **TTL jitter fixes avalanche** (de-synchronizes expiry). Right fix, right fault — one toggle shows it.",
    },
  ] as L[],

  backToStart: { zh: "↻ 回到第 1 站", en: "↻ Back to Stop 1" },
};
