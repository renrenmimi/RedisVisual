// 第 8 站「故障模拟器」的双语文案 + 预设数据。
// 仿真的数学在纯引擎 lib/simulator/engine.ts 里；这个文件只放文字和预设，
// 并从引擎 re-export 参数，方便页面从一处取到配置和文案。
// 事件日志的每条模板都由引擎的实测数据填充（{db}/{p99}/{hit}/{n}/{span}/{peak}），
// 不存在只看开关、不看实测的「假成功」消息。

import type { L } from "@/lib/i18n";

// 仿真参数与配置类型的唯一真相来源是引擎，这里透传出去。
export {
  SIM,
  RANGES,
  DEFAULT_CONFIG,
  DEFAULT_SEED,
  type SimConfig,
} from "./simulator/engine";

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
    zh: "一批同时缓存、共用一个 TTL 的 key 一起到期——开 TTL 抖动能把到期时刻打散",
    en: "a cohort cached together with one shared TTL all comes due — TTL jitter staggers when they expire",
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
      en: "Breakdown: hot key expired, DB load hit {db}/s, p99 {p99}ms",
    },
    // 只有引擎实测 absorbed=true（单飞让 p99 没被拉高）时才会用这条。
    breakdownAbsorbed: {
      zh: "单飞挡住了击穿：并发回源被合并成 1 次，实测 p99 稳在 {p99}ms",
      en: "Single-flight absorbed the breakdown: concurrent rebuilds collapsed to one, measured p99 stayed {p99}ms",
    },
    // 同步过期（未开抖动）：整批在同一 tick 到期，数字来自那一 tick 的实测。
    avalancheSync: {
      zh: "同步过期：{n} 个 key 在同一 tick 一起到期，命中率跌到 {hit}%，p99 延迟 {p99}ms",
      en: "Synchronized expiry: {n} keys came due in the same tick — hit rate {hit}%, p99 {p99}ms",
    },
    // 铺开过期：只有引擎实测到期确实跨越了多个 tick（spread=true）时才会用这条。
    avalancheSpread: {
      zh: "TTL 抖动把 {n} 个 key 的到期铺开到 {span} 个 tick，单 tick 最多 {peak} 个过期；实测命中率最低 {hit}%，p99 峰值 {p99}ms",
      en: "TTL jitter spread the {n}-key cohort over {span} ticks — at most {peak} expired in one tick; measured hit rate dipped to {hit}%, peak p99 {p99}ms",
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
