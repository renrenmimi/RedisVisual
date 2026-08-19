// 第 1 站「什么是 Redis」的分幕动画：双语文案数据。
// 每幕的画面（动画 JSX）在 app/page.tsx 里按下标对应。
// 目标受众下限：完全没接触过 Redis 的人。先讲“是什么”，再讲“为什么快 / 为什么用”。
// 注意：本站正文由 RichText 直接渲染，只认 [[key:显示文字]]，不认反引号，
//   所以英文里不要写 `code` 反引号（会原样显示）。

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
      en: "You already know half of this",
    },
    text: {
      zh:
        "查过字典、用过手机通讯录、写过一次 { 名字: 内容 } 吗？给一个名字，拿到对应的内容——这就是 [[keyvalue:键值 (key → value)]]。" +
        "[[redis:Redis]] 本质上就是一个超大的、放在[[memory:内存]]里、能被很多程序同时通过网络读写的字典。" +
        "今天不需要任何 Redis 基础；正文里带虚线下划线的词，点击可以看到该术语的通俗解释。",
      en:
        "Have you looked a word up in a dictionary, opened the contacts app on your phone, or written { name: value } in code? " +
        "You give a name and you get its content back. That is a [[keyvalue:key → value]] pair. " +
        "[[redis:Redis]] is one very large dictionary that lives in [[memory:memory]], and many programs can read and write it over the network at the same time. " +
        "You need no Redis experience to start. Any word with a dotted underline is clickable and opens a short explanation.",
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
        "The most basic use is two commands. SET stores a value and GET reads it back. SET name \"Wayne\" puts the text \"Wayne\" into a slot named name. " +
        "GET name returns it unchanged. The key is a unique name you choose, and the value is the content stored under it. " +
        "Everything later in this course is built on these two commands.",
    },
  },
  {
    action: { zh: "它凭什么快（一）", en: "Why is it fast (1)" },
    title: {
      zh: "先纠正一个误会：仓库 vs 工作台",
      en: "First, a common misunderstanding: warehouse and workbench",
    },
    text: {
      zh:
        "别把 Redis 和 [[mysql:MySQL]] 当对手。MySQL 像仓库：东西存得准、存得久，但取一次要走流程；" +
        "Redis 像你手边的工作台：把常用的东西提前放手边，伸手就拿。它俩是分工，不是替代——" +
        "[[sourceoftruth:真相来源]]仍然在仓库里，工作台只是让高频操作更快。",
      en:
        "Redis and [[mysql:MySQL]] are not competitors. MySQL is the warehouse: it stores data accurately and keeps it, but every fetch goes through a process. " +
        "Redis is the workbench next to you: the things you use often are already within reach. They divide the work; neither one replaces the other. " +
        "The [[sourceoftruth:source of truth]] still lives in the warehouse. The workbench only makes frequent operations faster.",
    },
  },
  {
    action: { zh: "它凭什么快（二）", en: "Why is it fast (2)" },
    title: {
      zh: "第一层原因：内存比硬盘快几个数量级",
      en: "Reason one: memory is orders of magnitude faster than disk",
    },
    text: {
      zh:
        "Redis 把数据主要放在[[memory:内存]]里。内存随机读取大约几十到上百纳秒；SSD 要慢上千倍；机械硬盘更是慢十万倍。" +
        "少跑几趟慢的，[[latency:延迟]]自然就下来了。但这只是第一层——因为 MySQL 也有内存缓存（buffer pool），" +
        "所以只说“因为在内存”会被面试官追问。真正的差距看下一幕。",
      en:
        "Redis keeps its data mostly in [[memory:memory]]. A random read from memory takes tens to hundreds of nanoseconds. " +
        "An SSD is about 1,000 times slower, and a spinning disk about 100,000 times slower. Removing a few slow round trips is what brings [[latency:latency]] down. " +
        "But this is only the first reason. MySQL also caches hot data in memory, in its buffer pool, so answering \"because it is in memory\" will get you a follow-up question. " +
        "The real difference is in the next scene.",
    },
  },
  {
    action: { zh: "还有第二层", en: "There is a second reason" },
    title: {
      zh: "第二层：命令路径短 + 一次只执行一条",
      en: "Reason two: a short command path, one command at a time",
    },
    text: {
      zh:
        "查一条 SQL 即使命中缓存，也要走 解析 → 优化器 → 索引 → 事务/锁 → 返回 一长串关卡；" +
        "Redis 执行 GET 只有 解析 → 查哈希表 → 返回 两三步。再加上它[[singlethread:一次只执行一条命令]]：单条命令天生不用加锁，" +
        "和 Node.js 的事件循环是同一种思路。代价是一条耗时很长的命令会让排在它后面的所有命令一起等，所以我们只缓存“小而聚合好”的数据。",
      en:
        "Even when a SQL query finds its rows in memory, it still runs through parsing, the optimizer, an index lookup, transaction and lock handling, and finally the response. " +
        "Redis running GET has two or three steps: parse, look up the hash table, return. On top of that, Redis executes [[singlethread:one command at a time]], " +
        "so a single command never needs a lock. It is the same idea as the Node.js event loop. " +
        "The cost is that one slow command makes every command behind it wait, which is why you only cache small, already-aggregated values.",
    },
  },
  {
    action: { zh: "它不只是字符串", en: "It is more than strings" },
    title: {
      zh: "value 不只是字符串：五种常用结构",
      en: "A value is not only a string: five common structures",
    },
    text: {
      zh:
        "value 可以是好几种结构。String 存单值；Hash 像一个对象，存一组字段；List 是有序列表，可当队列；" +
        "Set 是不含重复元素的集合；Sorted Set 给每个成员带一个分数并按分数保持有序，适合排行榜和滑动窗口限流。" +
        "每种结构底层都有对应的实现——这也是“为什么快”的又一层：不是笼统的快，是每类操作都有配套的结构。",
      en:
        "A value can be one of several structures. String holds a single value. Hash holds a set of named fields, like an object. " +
        "List keeps items in order and works well as a queue. Set holds unique members and rejects duplicates. " +
        "Sorted Set stores a score with each member and keeps them ordered by that score, which suits leaderboards and sliding-window rate limits. " +
        "Each structure has an implementation built for its own operations. That is another reason Redis is fast: not fast in general, but a structure matched to each kind of work.",
    },
  },
  {
    action: { zh: "那它不是什么？", en: "So what is it not?" },
    title: {
      zh: "Redis 是加速层，不是数据库替代品",
      en: "Redis is a speed layer, not a replacement for a database",
    },
    text: {
      zh:
        "关键心智模型：Redis 通常不该是唯一的数据来源，它是 App 和慢速系统之间的“快车道”。" +
        "数据在内存里、进程停了就没了？它有可选的持久化（RDB 快照 / AOF 日志）；但对“丢了能重算”的[[cache:缓存]]数据，甚至可以不开。" +
        "什么时候使用 Redis：缓存、计数、session、排行榜、限流、[[idempotency:幂等]]——又快又临时的活。",
      en:
        "The key idea: Redis should normally not be the only place your data exists. It sits between your application and a slower system. " +
        "Data in memory is gone when the process stops, so Redis offers optional persistence: RDB snapshots and an AOF log. " +
        "For [[cache:cache]] data that can be computed again, you can leave persistence off. " +
        "Reach for Redis for caching, counters, sessions, leaderboards, rate limiting, and [[idempotency:idempotency]] — work that has to be fast and does not have to last.",
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
        "[[sourceoftruth:真相来源]]仍然交给数据库。下一站，先把 value 能装的几种数据结构一种种拆开看透——这也是面试最爱深挖的一块。",
      en:
        "Remember one sentence and you can discuss Redis with anyone. It is a [[keyvalue:key-value]] store in memory, used as a speed layer for frequent, temporary data that can [[ttl:expire]], " +
        "while the [[sourceoftruth:source of truth]] stays in the database. " +
        "The next stop takes apart the structures a value can hold, one at a time. Interviewers ask about them often.",
    },
  },
];

// 页头文案
export const meta = {
  title: { zh: "第 1 站 · 什么是 Redis？", en: "Stop 1 · What is Redis?" },
  subtitle: {
    zh: "八幕小动画，从“你已经会的东西”出发，讲透是什么、为什么快、为什么用",
    en: "Eight short scenes that start from what you already know: what Redis is, why it is fast, and why you would use it",
  },
  progressLabel: { zh: "八幕进度", en: "Scene progress" },
};

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
    en: "Give a key, get a value back. What you already know is the core of Redis.",
  },

  // 幕 1：SET / GET
  setCmd: { zh: "SET name \"Wayne\"", en: "SET name \"Wayne\"" },
  setNote: { zh: "存：把内容放进名叫 name 的格子", en: "Store: put the content into the slot named name" },
  getCmd: { zh: "GET name", en: "GET name" },
  getNote: { zh: "取：按名字把它拿回来", en: "Read: get it back by name" },
  keyTag: { zh: "key（唯一名字）", en: "key (unique name)" },
  valTag: { zh: "value（内容）", en: "value (content)" },
  s1cap: {
    zh: "SET 存、GET 取。复杂用法都建在这两条命令之上。",
    en: "SET stores, GET reads. Everything else is built on these two commands.",
  },

  // 幕 2：仓库 vs 工作台
  warehouse: { zh: "MySQL · 仓库", en: "MySQL · warehouse" },
  warehouseSub: { zh: "存得准、存得久，取货走流程", en: "accurate and kept; each fetch takes steps" },
  workbench: { zh: "Redis · 工作台", en: "Redis · workbench" },
  workbenchSub: { zh: "常用的放手边，伸手就拿", en: "what you use often, already within reach" },
  s2cap: {
    zh: "分工，不是替代。真相来源在仓库，工作台只管快。",
    en: "They divide the work; neither replaces the other. The source of truth stays in the warehouse.",
  },

  // 幕 3：延迟阶梯
  ladMem: { zh: "内存 (Redis)", en: "Memory (Redis)" },
  ladMemV: { zh: "~100 纳秒", en: "~100 ns" },
  ladSsd: { zh: "SSD 硬盘", en: "SSD disk" },
  ladSsdV: { zh: "~100 微秒 · 慢约 1000 倍", en: "~100 µs · about 1,000x slower" },
  ladHdd: { zh: "机械硬盘", en: "Spinning disk" },
  ladHddV: { zh: "~10 毫秒 · 慢约 10 万倍", en: "~10 ms · about 100,000x slower" },
  s3cap: {
    zh: "越靠上越快。Redis 位于最快的一层。",
    en: "Higher on the list is faster. Redis sits on the fastest tier.",
  },

  // 幕 4：命令路径
  sqlLabel: { zh: "一条 SQL 查询", en: "One SQL query" },
  sqlS1: { zh: "解析", en: "parse" },
  sqlS2: { zh: "优化器", en: "optimizer" },
  sqlS3: { zh: "走索引", en: "index lookup" },
  sqlS4: { zh: "事务/锁", en: "txn/locks" },
  sqlS5: { zh: "返回", en: "return" },
  redisLabel: { zh: "Redis 的 GET", en: "Redis GET" },
  redisS1: { zh: "解析", en: "parse" },
  redisS2: { zh: "查哈希表", en: "hash lookup" },
  redisS3: { zh: "返回", en: "return" },
  threadNote: {
    zh: "一条流水线：一次只执行一条命令，单条命令不用加锁（和 Node 的事件循环同理）",
    en: "One lane: one command at a time, and a single command needs no lock (the same idea as the Node.js event loop)",
  },
  s4cap: {
    zh: "路径短 + 不用加锁，才是它真正快的原因。",
    en: "A short path, and one command at a time. That is the real reason it is fast.",
  },

  // 幕 5：数据结构
  dsString: { zh: "String 字符串", en: "String" },
  dsStringEx: { zh: "SET views 42", en: "SET views 42" },
  dsHash: { zh: "Hash 哈希（像对象）", en: "Hash (like an object)" },
  dsHashEx: { zh: "user → { name, city }", en: "user → { name, city }" },
  dsList: { zh: "List 列表（可当队列）", en: "List (as a queue)" },
  dsListEx: { zh: "[ task1, task2 ]", en: "[ task1, task2 ]" },
  dsSet: { zh: "Set 集合（不含重复）", en: "Set (no duplicates)" },
  dsSetEx: { zh: "{ react, ts }", en: "{ react, ts }" },
  dsZset: { zh: "Sorted Set 有序集合", en: "Sorted Set" },
  dsZsetEx: { zh: "排行榜 / 限流", en: "leaderboard / rate limit" },
  s5cap: {
    zh: "每种结构对应一类活，底层都有对应的实现。",
    en: "Each structure fits one kind of job and has an implementation built for it.",
  },

  // 幕 6：加速层
  appNode: { zh: "你的 App", en: "Your app" },
  fastLane: { zh: "Redis · 快车道", en: "Redis · fast lane" },
  fastLaneSub: { zh: "缓存 / 计数 / session / 限流 / 幂等", en: "cache / counters / session / rate limit / idempotency" },
  fastBadge: { zh: "⚡ 快", en: "⚡ fast" },
  dbNode: { zh: "数据库 · 真相来源", en: "Database · source of truth" },
  dbNodeSub: { zh: "长期、可靠、可查", en: "durable, reliable, queryable" },
  truthBadge: { zh: "🗄️ 真相来源", en: "🗄️ truth" },
  s6cap: {
    zh: "Redis 不可用时，App 还能回落到数据库——它是加速层，不是唯一来源。",
    en: "If Redis is unavailable, the application falls back to the database. It is a speed layer, not the only source.",
  },

  // 幕 7：公式
  fMem: { zh: "内存", en: "memory" },
  fKv: { zh: "key → value", en: "key → value" },
  fTtl: { zh: "TTL 过期", en: "TTL expiry" },
  fResult: { zh: "又快又临时", en: "fast and temporary" },
  s7cap: {
    zh: "内存 + 键值 + 过期 = Redis。真相来源仍交给数据库。",
    en: "Memory + key-value + expiry = Redis. The source of truth stays in the database.",
  },

  toNext: { zh: "下一站：数据结构详解 →", en: "Next stop: data structures in depth →" },
};
