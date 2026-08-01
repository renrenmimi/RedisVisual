// 第 1 站「什么是 Redis」的分幕动画：双语文案数据。
// 每幕的画面（动画 JSX）在 app/page.tsx 里按下标对应。
// 目标受众下限：完全没接触过 Redis 的人。先讲“是什么”，再讲“为什么快 / 为什么用”。

import type { L } from "@/lib/i18n";

export type Scene = {
  action?: L; // 推进到这一幕的按钮文字（第一幕没有）
  title: L;
  text: L;
};

export const scenes: Scene[] = [
  {
    title: {
      zh: "你其实已经懂一半了",
      en: "You already know half of it",
    },
    text: {
      zh:
        "查过字典、用过手机通讯录、写过一次 { 名字: 内容 } 吗？给一个名字，拿到对应的内容——这就是 [[keyvalue:键值 (key → value)]]。" +
        "[[redis:Redis]] 说白了就是一个超大的、放在[[memory:内存]]里、能被很多程序同时通过网络读写的字典。" +
        "今天不需要任何 Redis 基础；正文里带虚线下划线的词，点一下就有“说人话”的解释。",
      en:
        "Have you ever used a dictionary, a phone's contacts, or written { name: value } once? Give a name, get its content back — " +
        "that is [[keyvalue:key → value]]. [[redis:Redis]] is, put plainly, one giant dictionary that lives in [[memory:memory]] and " +
        "that many programs can read and write over the network at the same time. No Redis background needed today; any dotted word is clickable.",
    },
  },
  {
    action: { zh: "先看它长什么样", en: "See what it looks like" },
    title: {
      zh: "Redis = 内存里的键值字典",
      en: "Redis = a key-value dictionary in memory",
    },
    text: {
      zh:
        "它最基本的用法就两条命令：SET 存、GET 取。SET name \"Wayne\" 就是把 \"Wayne\" 放进名叫 name 的格子；" +
        "GET name 就把它原样拿回来。key 是你起的唯一名字，value 是内容。就这么简单——后面那些看起来很厉害的用法，都建在这两条之上。",
      en:
        "Its most basic use is two commands: SET to store, GET to read. SET name \"Wayne\" puts \"Wayne\" into a slot called name; " +
        "GET name hands it right back. The key is a unique name you pick; the value is the content. That's it — every fancy use later is built on top of these two.",
    },
  },
  {
    action: { zh: "它凭什么快（一）", en: "Why is it fast (1)" },
    title: {
      zh: "先纠正一个误会：仓库 vs 工作台",
      en: "Clear up one myth first: warehouse vs workbench",
    },
    text: {
      zh:
        "别把 Redis 和 [[mysql:MySQL]] 当对手。MySQL 像仓库：东西存得准、存得久，但取一次要走流程；" +
        "Redis 像你手边的工作台：把常用的东西提前放手边，伸手就拿。它俩是分工，不是替代——" +
        "[[sourceoftruth:真相来源]]仍然在仓库里，工作台只是让高频操作更快。",
      en:
        "Don't treat Redis and [[mysql:MySQL]] as rivals. MySQL is the warehouse: it stores things accurately and durably, but each fetch goes through a process. " +
        "Redis is the workbench at your elbow: keep the frequently used things within reach and just grab them. They divide labor, not replace each other — " +
        "the [[sourceoftruth:source of truth]] still lives in the warehouse; the workbench only makes hot operations faster.",
    },
  },
  {
    action: { zh: "它凭什么快（二）", en: "Why is it fast (2)" },
    title: {
      zh: "第一层原因：内存比硬盘快几个数量级",
      en: "Reason one: memory beats disk by orders of magnitude",
    },
    text: {
      zh:
        "Redis 把数据主要放在[[memory:内存]]里。内存随机读取大约几十到上百纳秒；SSD 要慢上千倍；机械硬盘更是慢十万倍。" +
        "少跑几趟慢的，[[latency:延迟]]自然就下来了。但这只是第一层——因为 MySQL 也有内存缓存（buffer pool），" +
        "所以只说“因为在内存”会被面试官追问。真正的差距看下一幕。",
      en:
        "Redis keeps data mostly in [[memory:memory]]. A random memory read is tens-to-hundreds of nanoseconds; an SSD is ~1000× slower; a spinning disk ~100,000× slower. " +
        "Skip a few slow round-trips and [[latency:latency]] drops. But that's only layer one — MySQL also caches hot data in memory (the buffer pool), " +
        "so “because it's in memory” alone invites a follow-up. The real gap is in the next scene.",
    },
  },
  {
    action: { zh: "还有第二层", en: "There's a layer two" },
    title: {
      zh: "第二层：命令路径短 + 单线程",
      en: "Reason two: a short command path + single thread",
    },
    text: {
      zh:
        "查一条 SQL 即使命中缓存，也要走 解析 → 优化器 → 索引 → 事务/锁 → 返回 一长串关卡；" +
        "Redis 执行 GET 只有 解析 → 查哈希表 → 返回 两三步。再加上它处理命令是[[singlethread:单线程]]的：同一刻只做一件事，" +
        "天生不用加锁——和 Node.js 的事件循环是同一种思路。代价是一条很慢的命令会卡住后面所有人，所以我们只缓存“小而聚合好”的数据。",
      en:
        "Even a cache-hit SQL query still runs parse → optimizer → index walk → transaction/locks → return — a long line of gates. " +
        "Redis running GET is just parse → hash-table lookup → return, two or three steps. On top of that it handles commands [[singlethread:single-threaded]]: one thing at a time, " +
        "so no locks are needed — the same idea as Node.js's event loop. The trade-off: one slow command blocks everyone behind it, which is why we only cache small, pre-aggregated data.",
    },
  },
  {
    action: { zh: "它不只是字符串", en: "It's more than strings" },
    title: {
      zh: "value 不只是字符串：五种常用结构",
      en: "Values aren't just strings: five common structures",
    },
    text: {
      zh:
        "value 可以是好几种结构。String 存单值；Hash 像一个对象，存一组字段；List 是有序列表，可当队列；" +
        "Set 是去重集合；Sorted Set 带分数自动排序，天生适合排行榜和滑动窗口限流。" +
        "每种结构底层都有专门优化——这也是“为什么快”的又一层：不是笼统的快，是每种活都有趁手的工具。",
      en:
        "A value can be several structures. String holds a single value; Hash is like an object holding a set of fields; List is an ordered list you can use as a queue; " +
        "Set is a dedup collection; Sorted Set carries a score and stays sorted, perfect for leaderboards and sliding-window rate limits. " +
        "Each structure has a purpose-built implementation — another layer of “why fast”: not vaguely fast, but the right tool for each job.",
    },
  },
  {
    action: { zh: "那它不是什么？", en: "So what is it NOT?" },
    title: {
      zh: "Redis 是加速层，不是数据库替代品",
      en: "Redis is a speed layer, not a database replacement",
    },
    text: {
      zh:
        "关键心智模型：Redis 通常不该是唯一的数据来源，它是 App 和慢速系统之间的“快车道”。" +
        "数据在内存里、断电会丢？它有可选的持久化（RDB 快照 / AOF 日志）；但对“丢了能重算”的[[cache:缓存]]数据，甚至可以不开。" +
        "什么时候掏出 Redis：缓存、计数、session、排行榜、限流、[[idempotency:幂等]]——又快又临时的活。",
      en:
        "The key mental model: Redis usually shouldn't be the only source of data — it's the fast lane between your app and a slower system. " +
        "Data in memory, lost on power off? It has optional persistence (RDB snapshots / AOF logs); but for [[cache:cache]] data that can be recomputed, you can even skip it. " +
        "When to reach for Redis: caching, counters, sessions, leaderboards, rate limiting, [[idempotency:idempotency]] — fast and short-lived work.",
    },
  },
  {
    action: { zh: "一句话记住", en: "Sum it up in one line" },
    title: {
      zh: "内存 + 键值 + 过期 = 又快又临时",
      en: "Memory + key-value + expiry = fast and temporary",
    },
    text: {
      zh:
        "记住这一句，你就能跟人聊 Redis 了：它是一个放在内存里的[[keyvalue:键值]]存储，给高频、临时、可[[ttl:过期]]的数据当加速层，" +
        "[[sourceoftruth:真相来源]]仍然交给数据库。下一站，我们回到你简历里的 WeShipItNow，看看这套东西具体用在了哪三个地方、为什么用。",
      en:
        "Remember this one line and you can talk Redis with anyone: it's a [[keyvalue:key-value]] store in memory, a speed layer for frequent, temporary, [[ttl:expirable]] data, " +
        "while the [[sourceoftruth:source of truth]] stays in the database. Next stop, we return to WeShipItNow from your résumé and see exactly which three places use it — and why.",
    },
  },
];

// 舞台（动画画面）里的文字
export const stage = {
  // 幕 0：字典查找
  dictTitle: { zh: "内存里的一本大字典", en: "One big dictionary in memory" },
  dictK1: { zh: "user:1001", en: "user:1001" },
  dictV1: { zh: "\"Wayne\"", en: "\"Wayne\"" },
  dictK2: { zh: "greeting", en: "greeting" },
  dictV2: { zh: "\"hi\"", en: "\"hi\"" },
  dictK3: { zh: "cart:1001", en: "cart:1001" },
  dictV3: { zh: "3 件商品", en: "3 items" },
  s0cap: {
    zh: "给一个 key，立刻拿到 value。你已经会的东西，就是 Redis 的核心。",
    en: "Give a key, get a value instantly. What you already know IS the core of Redis.",
  },

  // 幕 1：SET / GET
  setCmd: { zh: "SET name \"Wayne\"", en: "SET name \"Wayne\"" },
  setNote: { zh: "存：把内容放进名叫 name 的格子", en: "Store: put content into the slot named name" },
  getCmd: { zh: "GET name", en: "GET name" },
  getNote: { zh: "取：按名字把它拿回来", en: "Read: fetch it back by name" },
  keyTag: { zh: "key（唯一名字）", en: "key (unique name)" },
  valTag: { zh: "value（内容）", en: "value (content)" },
  s1cap: {
    zh: "SET 存、GET 取。复杂用法都建在这两条命令之上。",
    en: "SET to store, GET to read. Everything else is built on these two.",
  },

  // 幕 2：仓库 vs 工作台
  warehouse: { zh: "MySQL · 仓库", en: "MySQL · warehouse" },
  warehouseSub: { zh: "存得准、存得久，取货走流程", en: "accurate, durable, fetch via a process" },
  workbench: { zh: "Redis · 工作台", en: "Redis · workbench" },
  workbenchSub: { zh: "常用的放手边，伸手就拿", en: "hot items at your elbow, just grab them" },
  s2cap: {
    zh: "分工，不是替代。真相来源在仓库，工作台只管快。",
    en: "Division of labor, not replacement. Truth lives in the warehouse; the bench just brings speed.",
  },

  // 幕 3：延迟阶梯
  ladMem: { zh: "内存 (Redis)", en: "Memory (Redis)" },
  ladMemV: { zh: "~100 纳秒", en: "~100 ns" },
  ladSsd: { zh: "SSD 硬盘", en: "SSD disk" },
  ladSsdV: { zh: "~100 微秒 · 慢约 1000 倍", en: "~100 µs · ~1000× slower" },
  ladHdd: { zh: "机械硬盘", en: "Spinning disk" },
  ladHddV: { zh: "~10 毫秒 · 慢约 10 万倍", en: "~10 ms · ~100,000× slower" },
  s3cap: {
    zh: "越靠上越快。Redis 待在最快的那一层。",
    en: "Higher is faster. Redis lives on the fastest tier.",
  },

  // 幕 4：命令路径
  sqlLabel: { zh: "一条 SQL 查询", en: "One SQL query" },
  sqlS1: { zh: "解析", en: "parse" },
  sqlS2: { zh: "优化器", en: "optimizer" },
  sqlS3: { zh: "走索引", en: "index walk" },
  sqlS4: { zh: "事务/锁", en: "txn/locks" },
  sqlS5: { zh: "返回", en: "return" },
  redisLabel: { zh: "Redis 的 GET", en: "Redis GET" },
  redisS1: { zh: "解析", en: "parse" },
  redisS2: { zh: "查哈希表", en: "hash lookup" },
  redisS3: { zh: "返回", en: "return" },
  threadNote: {
    zh: "单线程一条流水线：同一刻只做一件事，不用加锁（像 Node 的事件循环）",
    en: "Single thread, one lane: one thing at a time, no locks needed (like Node's event loop)",
  },
  s4cap: {
    zh: "路径短 + 不加锁，才是它真正快的原因。",
    en: "A short path plus no locks — that's the real reason it's fast.",
  },

  // 幕 5：数据结构
  dsString: { zh: "String 字符串", en: "String" },
  dsStringEx: { zh: "SET views 42", en: "SET views 42" },
  dsHash: { zh: "Hash 哈希（像对象）", en: "Hash (like an object)" },
  dsHashEx: { zh: "user → { name, city }", en: "user → { name, city }" },
  dsList: { zh: "List 列表（可当队列）", en: "List (as a queue)" },
  dsListEx: { zh: "[ task1, task2 ]", en: "[ task1, task2 ]" },
  dsSet: { zh: "Set 集合（去重）", en: "Set (dedup)" },
  dsSetEx: { zh: "{ react, ts }", en: "{ react, ts }" },
  dsZset: { zh: "Sorted Set 有序集合", en: "Sorted Set" },
  dsZsetEx: { zh: "排行榜 / 限流", en: "leaderboard / rate limit" },
  s5cap: {
    zh: "每种结构对应一类活，底层都有专门优化。",
    en: "Each structure fits a kind of job, each with a purpose-built implementation.",
  },

  // 幕 6：加速层
  appNode: { zh: "你的 App", en: "Your App" },
  fastLane: { zh: "Redis · 快车道", en: "Redis · fast lane" },
  fastLaneSub: { zh: "缓存 / 计数 / session / 限流 / 幂等", en: "cache / counters / session / rate limit / idempotency" },
  dbNode: { zh: "数据库 · 真相来源", en: "Database · source of truth" },
  dbNodeSub: { zh: "长期、可靠、可查", en: "durable, reliable, queryable" },
  s6cap: {
    zh: "Redis 挂了，App 还能回落到数据库——它是加速层，不是唯一来源。",
    en: "If Redis dies, the app falls back to the database — it's a speed layer, not the only source.",
  },

  // 幕 7：公式
  fMem: { zh: "内存", en: "memory" },
  fKv: { zh: "key → value", en: "key → value" },
  fTtl: { zh: "TTL 过期", en: "TTL expiry" },
  fResult: { zh: "又快又临时", en: "fast & temporary" },
  s7cap: {
    zh: "内存 + 键值 + 过期 = Redis。真相来源仍交给数据库。",
    en: "Memory + key-value + expiry = Redis. The source of truth stays in the database.",
  },

  toNext: { zh: "下一站：我们为什么用它 →", en: "Next stop: why we use it →" },
};
