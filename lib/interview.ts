// 第 4 站「面试速通」的全部双语文案 + 面试题数据。
// 形态：分类 tab + 可展开问答卡（accordion）+ 一张总结卡。
// 约定：面试说英文，所以「问题」和「英文示范回答」两种语言基本都放英文
//   （zh 问题里可带中文括注）；只有「讲解」note 才真正分语言：
//   zh 给中文讲解（为什么这么答 / 采分点 / 别过度包装），en 给英文 tips。
// 页面（app/interview/page.tsx）按 category 分组渲染，正文用 RichText 支持术语弹层。

import type { L } from "@/lib/i18n";

export type Category = "fundamentals" | "system" | "advanced";

export type QA = {
  id: string;
  category: Category;
  q: L; // 英文问题（zh 可带中文括注）
  answer: L; // 英文示范回答（面试要说的话）
  note: L; // zh=中文讲解 / en=English tips
  alert?: boolean; // 诚实红线：高亮这张卡
};

// ---------- 页面外壳文案 ----------

export const iv = {
  title: { zh: "第 7 站 · 面试速通", en: "Stop 7 · Interview Prep" },
  subtitle: {
    zh: "把前三站学到的，变成面试官面前能用英语讲出来的话。",
    en: "Turn the first three stops into words you can say to an interviewer — in English.",
  },

  intro: {
    step: { zh: "面试准备", en: "Interview prep" },
    heading: {
      zh: "英文问题 + 英文示范答案 + 中文讲解",
      en: "The question, a model answer, and why it works",
    },
    body: {
      zh:
        "前三站你已经见过 [[redis:Redis]] 是什么、为什么快、我们的系统为什么用它。这一站把它们打包成面试能用的话：" +
        "每题给出英文问题、一段可以直接背的英文示范回答，以及一段中文讲解——为什么这么答、别过度包装、采分点在哪。" +
        "点开任意一题展开答案；正文里带虚线的词，点一下就有解释。",
      en:
        "Across the first three stops you saw what [[redis:Redis]] is, why it is fast, and why a real system reaches for it. " +
        "This stop packages that into interview-ready words: each question comes with an English model answer you can rehearse, " +
        "plus notes on why it works and where the points are. Click any question to expand it; dotted words open a quick definition.",
    },
  },

  tabs: {
    all: { zh: "全部", en: "All" },
    fundamentals: { zh: "基础", en: "Fundamentals" },
    system: { zh: "我们的系统", en: "Our system" },
    advanced: { zh: "进阶", en: "Advanced" },
  },

  // tab 下方每类的一句副标题
  blurb: {
    all: {
      zh: "26 道高频题，按“基础 → 系统 → 进阶”排好，从头过一遍。",
      en: "26 common questions, ordered fundamentals → system → advanced. Read them top to bottom.",
    },
    fundamentals: {
      zh: "先能一句话讲清 Redis 是什么、为什么快——最容易被追问的地方。",
      en: "Be able to say what Redis is and why it is fast in one breath — the most-probed area.",
    },
    system: {
      zh: "WeShipItNow 里的三处真实用法：能讲出“解决了什么问题”才算数。",
      en: "The three real usages in WeShipItNow — you must be able to say what problem each solved.",
    },
    advanced: {
      zh: "失效、击穿、选型、以及那个 40% 该怎么诚实地讲。",
      en: "Invalidation, stampede, tool fit, and how to talk about that 40% honestly.",
    },
  },

  answerLabel: { zh: "英文示范回答", en: "Model answer" },
  noteLabel: { zh: "讲解 · 为什么这么答", en: "Why this works" },
  alertTag: { zh: "诚实红线", en: "Be honest" },

  expandAll: { zh: "全部展开", en: "Expand all" },
  collapseAll: { zh: "全部收起", en: "Collapse all" },
  countUnit: { zh: "题", en: "" },
  questionWord: { zh: "问题", en: "questions" },

  footer: {
    zh:
      "面试的核心原则：简历上每个技术词，都要能扛住 5–10 分钟的追问。没做过的别说做过，" +
      "没测过的数字别编——诚实本身，就是一种能力信号。",
    en:
      "The one rule that matters: every technical word on your resume should survive five to ten minutes of follow-up. " +
      "Don’t claim what you haven’t done, don’t invent numbers you haven’t measured — honesty itself is a signal of competence.",
  },
  backToStop1: { zh: "↻ 回到第 1 站", en: "↻ Back to Stop 1" },
};

// ---------- 面试题 ----------

export const questions: QA[] = [
  // ===== A. 基础 =====
  {
    id: "what-is-redis",
    category: "fundamentals",
    q: { zh: "What is Redis?（Redis 是什么？）", en: "What is Redis?" },
    answer: {
      zh:
        "Redis is an in-memory [[keyvalue:key-value]] data store. The name stands for REmote DIctionary Server — " +
        "picture one giant dictionary that many programs read and write over the network. Because it lives in " +
        "[[memory:memory]], it’s commonly used for caching, counters, session storage, rate limiting, and leaderboards — " +
        "anything that needs to be fast and is okay to be short-lived.",
      en:
        "Redis is an in-memory [[keyvalue:key-value]] data store. The name stands for REmote DIctionary Server — " +
        "picture one giant dictionary that many programs read and write over the network. Because it lives in " +
        "[[memory:memory]], it’s commonly used for caching, counters, session storage, rate limiting, and leaderboards — " +
        "anything that needs to be fast and is okay to be short-lived.",
    },
    note: {
      zh:
        "先给一句话定义（in-memory key-value store），再补名字来历和三四个典型用途就够了，别背完整功能列表。" +
        "采分点：说清它是“数据存储（data store）”，并且开口就带出“内存”这个关键词——它是后面所有问题的基础。",
      en:
        "Give the one-line definition (in-memory key-value store), then the name origin and three or four typical use cases — " +
        "don’t recite the whole feature list. Scoring point: make clear it’s a data store and lead with the word “in-memory”, " +
        "which every later question builds on.",
    },
  },
  {
    id: "why-fast",
    category: "fundamentals",
    q: { zh: "Why is Redis fast?（为什么快？）", en: "Why is Redis fast?" },
    answer: {
      zh:
        "Three reasons, and I’d avoid saying only “because it’s in memory”. First, data lives in [[memory:memory]], " +
        "so there’s no disk seek. Second, the command path is extremely short — a GET is basically a hash-table lookup, " +
        "whereas SQL has to parse, plan, walk a B+ tree, and honor transactions. Third, Redis runs commands on a " +
        "[[singlethread:single thread]], so there are no locks — a bit like Node’s event loop. That’s why even MySQL " +
        "with a warm buffer pool is still slower: the work per request is just heavier.",
      en:
        "Three reasons, and I’d avoid saying only “because it’s in memory”. First, data lives in [[memory:memory]], " +
        "so there’s no disk seek. Second, the command path is extremely short — a GET is basically a hash-table lookup, " +
        "whereas SQL has to parse, plan, walk a B+ tree, and honor transactions. Third, Redis runs commands on a " +
        "[[singlethread:single thread]], so there are no locks — a bit like Node’s event loop. That’s why even MySQL " +
        "with a warm buffer pool is still slower: the work per request is just heavier.",
    },
    note: {
      zh:
        "这是最容易被追问的一题。面试官会说“MySQL 也有 buffer pool、也在内存啊”——所以一定要答到“命令路径短”" +
        "这一层，而不是停在“因为在内存”。单线程免加锁是加分项，能类比 Node 事件循环更好。",
      en:
        "This one gets follow-ups. The interviewer will say “MySQL has a buffer pool too, that’s in memory” — so you must " +
        "reach the “short command path” point, not stop at “it’s in memory”. Single-threaded / lock-free is a bonus; the " +
        "Node event-loop analogy lands well.",
    },
  },
  {
    id: "db-or-cache",
    category: "fundamentals",
    q: {
      zh: "Is Redis a database or a cache?（是数据库还是缓存？）",
      en: "Is Redis a database or a cache?",
    },
    answer: {
      zh:
        "It can be both. Redis has optional persistence, so some teams run it as a primary store. But in most systems — " +
        "including ours — we use it as a cache and a read model in front of a durable database. It is not the " +
        "[[sourceoftruth:source of truth]]; if we lost it, we could rebuild everything from the database.",
      en:
        "It can be both. Redis has optional persistence, so some teams run it as a primary store. But in most systems — " +
        "including ours — we use it as a cache and a read model in front of a durable database. It is not the " +
        "[[sourceoftruth:source of truth]]; if we lost it, we could rebuild everything from the database.",
    },
    note: {
      zh:
        "标准答案是“都可以，看你怎么用”。关键是要表态：在你们系统里它是缓存/读模型，不是真相来源。" +
        "这句表态为后面“Redis 不可用怎么办”提前埋好伏笔。",
      en:
        "The model answer is “both, depending on how you use it”. The key is to take a stance: in your system it’s a cache / " +
        "read model, not the source of truth. That sets up the later “what if Redis goes down” question.",
    },
  },
  {
    id: "hit-miss",
    category: "fundamentals",
    q: {
      zh: "What is a cache hit / cache miss?（命中 / 未命中？）",
      en: "What is a cache hit / cache miss?",
    },
    answer: {
      zh:
        "A [[cachehit:cache hit]] means the data you asked for is already in the cache, so you return it immediately — " +
        "no slow query or external call. A [[cachemiss:cache miss]] means it isn’t there, so you go to the slow original " +
        "source, then write the result back so the next request hits. Hit rate is the number that tells you whether the " +
        "cache is actually earning its keep.",
      en:
        "A [[cachehit:cache hit]] means the data you asked for is already in the cache, so you return it immediately — " +
        "no slow query or external call. A [[cachemiss:cache miss]] means it isn’t there, so you go to the slow original " +
        "source, then write the result back so the next request hits. Hit rate is the number that tells you whether the " +
        "cache is actually earning its keep.",
    },
    note: {
      zh:
        "两个词一起讲，顺手带出“hit rate（命中率）”这个衡量指标，显得你真运维过缓存，而不是只背概念。" +
        "别把 miss 说成“出错”——它是正常流程的一部分。",
      en:
        "Explain both together and slip in “hit rate” as the metric — it signals you’ve actually operated a cache, not just " +
        "memorized definitions. Don’t describe a miss as an “error”; it’s a normal part of the flow.",
    },
  },
  {
    id: "ttl",
    category: "fundamentals",
    q: { zh: "What is TTL?（存活时间是什么？）", en: "What is TTL?" },
    answer: {
      zh:
        "[[ttl:TTL]], time to live, is an expiry timer on a key. When it runs out, Redis deletes the key automatically. " +
        "Caches rely on it so stale data disappears on its own instead of lingering forever. For our rate cache we use a " +
        "short TTL — quotes are only valid for a little while anyway, so expiry doubles as a correctness guarantee, not " +
        "just cleanup.",
      en:
        "[[ttl:TTL]], time to live, is an expiry timer on a key. When it runs out, Redis deletes the key automatically. " +
        "Caches rely on it so stale data disappears on its own instead of lingering forever. For our rate cache we use a " +
        "short TTL — quotes are only valid for a little while anyway, so expiry doubles as a correctness guarantee, not " +
        "just cleanup.",
    },
    note: {
      zh:
        "定义 + 为什么缓存离不开它（旧数据自动消失）。加一句“短 TTL 同时也是一种正确性保证”，能体现你理解业务语义，" +
        "而不只是把它当垃圾回收。",
      en:
        "Definition plus why caches need it (stale data self-destructs). Adding “a short TTL is also a correctness guarantee” " +
        "shows you grasp the business semantics, not just garbage collection.",
    },
  },
  {
    id: "data-structures",
    category: "fundamentals",
    q: {
      zh: "What data structures does Redis support?（支持哪些数据结构？）",
      en: "What data structures does Redis support?",
    },
    answer: {
      zh:
        "The core five are strings, hashes, lists, sets, and sorted sets. A string holds a value or a counter; a hash is " +
        "great for storing an object as fields; a list works as a queue or stack; a set gives you membership and dedup; " +
        "and a sorted set, ordered by a score, is the go-to for leaderboards and for sliding-window rate limiting. There " +
        "are more — streams, bitmaps, HyperLogLog — but those five cover most day-to-day work.",
      en:
        "The core five are strings, hashes, lists, sets, and sorted sets. A string holds a value or a counter; a hash is " +
        "great for storing an object as fields; a list works as a queue or stack; a set gives you membership and dedup; " +
        "and a sorted set, ordered by a score, is the go-to for leaderboards and for sliding-window rate limiting. There " +
        "are more — streams, bitmaps, HyperLogLog — but those five cover most day-to-day work.",
    },
    note: {
      zh:
        "列出五个核心结构，每个配一个场景（hash=对象、sorted set 对应排行榜与限流是最具说服力的例子）。顺带提一句 streams/HyperLogLog " +
        "说明你知道还有更多，但别展开背。采分点在“结构 → 场景”的对应，而不是罗列名字。",
      en:
        "List the five core structures, each with a use case (hash = object, sorted set = leaderboard / rate limiting is the " +
        "standout). Mentioning streams / HyperLogLog shows you know there’s more, but don’t go deep. The scoring point is the " +
        "structure-to-use-case mapping, not the names.",
    },
  },

  // ===== B. 我们的系统 WeShipItNow =====
  {
    id: "how-used",
    category: "system",
    q: {
      zh: "How did you use Redis at WeShipItNow?（你们怎么用的？）",
      en: "How did you use Redis at WeShipItNow?",
    },
    answer: {
      zh:
        "In three places. First, a [[cacheaside:cache-aside]] cache for shipping rate quotes with a short [[ttl:TTL]], " +
        "so repeated lookups for the same package don’t hit the [[carrier:carrier]] APIs every time. Second, an " +
        "[[idempotency:idempotency]] key on label purchase using [[setnx:SET NX]], so a retry or a double-click can’t " +
        "charge the customer twice or create two labels. Third, an account balance [[projection:projection]] — the " +
        "[[ledger:ledger]] in the database is the source of truth, and Redis holds the pre-computed balance so reads are " +
        "instant. So: one read cache, one concurrency guard, one read model.",
      en:
        "In three places. First, a [[cacheaside:cache-aside]] cache for shipping rate quotes with a short [[ttl:TTL]], " +
        "so repeated lookups for the same package don’t hit the [[carrier:carrier]] APIs every time. Second, an " +
        "[[idempotency:idempotency]] key on label purchase using [[setnx:SET NX]], so a retry or a double-click can’t " +
        "charge the customer twice or create two labels. Third, an account balance [[projection:projection]] — the " +
        "[[ledger:ledger]] in the database is the source of truth, and Redis holds the pre-computed balance so reads are " +
        "instant. So: one read cache, one concurrency guard, one read model.",
    },
    note: {
      zh:
        "这是整站最该背熟的一段。用“三处”的结构讲，每处一句：什么模式 + 解决什么问题。结尾用“一个读缓存、" +
        "一个并发保护、一个读模型”收口，面试官一听就知道你分得清三种用法的本质不同。别混成一句“我用 Redis 做缓存”。",
      en:
        "This is the paragraph to memorize cold. Use the “three places” structure, one line each: which pattern + what " +
        "problem it solves. Close with “one read cache, one concurrency guard, one read model” so the interviewer sees you " +
        "distinguish them. Don’t collapse it into “I used Redis for caching”.",
    },
  },
  {
    id: "account-id-key",
    category: "system",
    q: {
      zh: "Why include the account ID in the cache key?（key 为什么要带 accountId？）",
      en: "Why include the account ID in the cache key?",
    },
    answer: {
      zh:
        "Because different customers get different negotiated discount rates from the carriers. If the key were just the " +
        "package and route, without the accountId, I could hand customer A’s discounted price to customer B — that’s both " +
        "wrong and a pricing-data leak. Putting the accountId in the key scopes each cached quote to the account it was " +
        "computed for.",
      en:
        "Because different customers get different negotiated discount rates from the carriers. If the key were just the " +
        "package and route, without the accountId, I could hand customer A’s discounted price to customer B — that’s both " +
        "wrong and a pricing-data leak. Putting the accountId in the key scopes each cached quote to the account it was " +
        "computed for.",
    },
    note: {
      zh:
        "一句话讲清“为什么”：协商折扣价因客户而异；不含 accountId 会导致不同账户的数据互相污染，把 A 的价返给 B——既是 bug 又是定价数据泄露。" +
        "这道缓存 key 设计题，面试官想看你有没有多租户 / 数据隔离意识。",
      en:
        "State the “why” in one line: negotiated discounts differ per customer; without the accountId you’d cross-serve A’s " +
        "price to B — a bug and a pricing-data leak. This cache-key question is really testing your multi-tenant / " +
        "data-isolation awareness.",
    },
  },
  {
    id: "apollo-vs-redis",
    category: "system",
    q: {
      zh: "Apollo Client cache vs Redis?（前端缓存和 Redis 有什么区别？）",
      en: "What’s the difference between the Apollo Client cache and Redis?",
    },
    answer: {
      zh:
        "They cache at different layers. The Apollo Client cache lives in the browser, serves a single user, and its job " +
        "is to avoid refetching the same GraphQL data on the frontend. Redis lives on the server, is shared across all " +
        "users and all server instances, and its job is to avoid repeating expensive backend work like [[carrier:carrier]] " +
        "API calls. So one is per-user and client-side; the other is shared and server-side. They don’t replace each other.",
      en:
        "They cache at different layers. The Apollo Client cache lives in the browser, serves a single user, and its job " +
        "is to avoid refetching the same GraphQL data on the frontend. Redis lives on the server, is shared across all " +
        "users and all server instances, and its job is to avoid repeating expensive backend work like [[carrier:carrier]] " +
        "API calls. So one is per-user and client-side; the other is shared and server-side. They don’t replace each other.",
    },
    note: {
      zh:
        "抓住三个对比维度：在哪一层（浏览器 vs 服务端）、服务谁（单用户 vs 跨用户跨实例）、省什么（前端重复请求 vs " +
        "后端重复调用）。面试官想确认你没把两种缓存混为一谈。用“不同层、不互相替代”收口。",
      en:
        "Hit three contrast axes: which layer (browser vs server), who it serves (single user vs shared across users and " +
        "instances), and what it saves (frontend refetches vs backend calls). The interviewer wants to confirm you don’t " +
        "conflate the two. Close with “different layers, not replacements”.",
    },
  },
  {
    id: "redis-down",
    category: "system",
    q: {
      zh: "What happens when Redis goes down?（Redis 不可用会怎样？）",
      en: "What happens when Redis goes down?",
    },
    answer: {
      zh:
        "It depends on which usage — I designed each to degrade differently. For the rate cache, we bypass it and call " +
        "the [[carrier:carrier]] APIs directly: slower, but still correct and available. For the balance, we recompute " +
        "from the [[ledger:ledger]], which is the source of truth. Idempotency is the sensitive one: a lost key could let " +
        "a duplicate charge through, so we don’t rely on a volatile Redis key alone — we back it with a unique constraint " +
        "in the database and the order’s own status, so correctness never hinges on the cache surviving.",
      en:
        "It depends on which usage — I designed each to degrade differently. For the rate cache, we bypass it and call " +
        "the [[carrier:carrier]] APIs directly: slower, but still correct and available. For the balance, we recompute " +
        "from the [[ledger:ledger]], which is the source of truth. Idempotency is the sensitive one: a lost key could let " +
        "a duplicate charge through, so we don’t rely on a volatile Redis key alone — we back it with a unique constraint " +
        "in the database and the order’s own status, so correctness never hinges on the cache surviving.",
    },
    note: {
      zh:
        "这题考“降级设计”。按三处分别答：rate=绕过直调（慢但可用）、balance=从账本重算、idempotency=最危险，必须有" +
        "数据库唯一约束 / 订单状态兜底。核心表态：Redis 是易失的加速层，正确性不能只押在它身上。这条能把前面所有铺垫收束起来。",
      en:
        "This tests graceful degradation. Answer per usage: rate = bypass and call directly (slow but available), balance = " +
        "recompute from the ledger, idempotency = the dangerous one, must be backed by a DB unique constraint / order status. " +
        "Core stance: Redis is a volatile speed layer, and correctness can’t rest on it alone. This ties together everything " +
        "you set up earlier.",
    },
  },

  // ===== C. 进阶 =====
  {
    id: "invalidation",
    category: "advanced",
    q: {
      zh: "What is cache invalidation?（缓存失效是什么？）",
      en: "What is cache invalidation?",
    },
    answer: {
      zh:
        "[[invalidation:Cache invalidation]] is keeping the cache from serving stale data after the underlying data " +
        "changes — you delete or update the matching entry. The simplest form is: on a write, delete the key (DEL) so the " +
        "next read misses and repopulates from the source. In our system a lot of it is handled by short TTLs, so entries " +
        "expire before they drift too far. It’s famously hard because the bugs are silent — you just quietly serve " +
        "something out of date.",
      en:
        "[[invalidation:Cache invalidation]] is keeping the cache from serving stale data after the underlying data " +
        "changes — you delete or update the matching entry. The simplest form is: on a write, delete the key (DEL) so the " +
        "next read misses and repopulates from the source. In our system a lot of it is handled by short TTLs, so entries " +
        "expire before they drift too far. It’s famously hard because the bugs are silent — you just quietly serve " +
        "something out of date.",
    },
    note: {
      zh:
        "定义 + 最简做法（写后 DEL key）+ 你们靠短 TTL 兜底。加一句“bug 是静默的”点出它难在哪。经典梗“计算机科学两大" +
        "难题之一”可以提，但别当成答案主体。",
      en:
        "Definition + simplest approach (DEL the key on write) + how short TTLs cover you. Add “the bugs are silent” to " +
        "explain why it’s hard. The classic “two hard things in CS” joke is fine to mention but shouldn’t be the whole answer.",
    },
  },
  {
    id: "stampede",
    category: "advanced",
    q: {
      zh: "What is a cache stampede?（缓存击穿是什么？）",
      en: "What is a cache stampede?",
    },
    answer: {
      zh:
        "A [[stampede:cache stampede]] is when a hot key expires and, in that instant, hundreds of requests all miss and " +
        "hit the backend or the [[carrier:carrier]] API at once — overwhelming it right when the cache was supposed to " +
        "protect it. The usual fixes are: a lock or single-flight so only one request rebuilds the entry while the others " +
        "wait, request coalescing, and adding jitter to TTLs so keys don’t all expire together.",
      en:
        "A [[stampede:cache stampede]] is when a hot key expires and, in that instant, hundreds of requests all miss and " +
        "hit the backend or the [[carrier:carrier]] API at once — overwhelming it right when the cache was supposed to " +
        "protect it. The usual fixes are: a lock or single-flight so only one request rebuilds the entry while the others " +
        "wait, request coalescing, and adding jitter to TTLs so keys don’t all expire together.",
    },
    note: {
      zh:
        "先描述现象（热 key 过期瞬间大量 miss 同时冲后端），再给三个解法：加锁 / single-flight、请求合并、TTL 抖动。" +
        "能说出“本该保护后端的缓存，反而在最脆弱的瞬间放开了闸”这层反讽，说明你真理解。",
      en:
        "First describe the phenomenon (a hot key expires and a burst of misses hits the backend at once), then give three " +
        "fixes: lock / single-flight, request coalescing, TTL jitter. Noting the irony — the cache lets the flood through " +
        "exactly when it was meant to shield the backend — shows real understanding.",
    },
  },
  {
    id: "why-not-mysql",
    category: "advanced",
    q: {
      zh: "Why not just use MySQL for the rate cache?（为什么不用 MySQL 存报价？）",
      en: "Why not just use MySQL for the rate cache?",
    },
    answer: {
      zh:
        "You could, but it’s the wrong tool. Rate quotes are temporary, read very frequently, and are meant to expire — " +
        "which is exactly what a cache with a [[ttl:TTL]] is for. Doing it in [[mysql:MySQL]] means writing your own " +
        "expiry logic, adding read load and churn to the primary that the real data depends on, and you still don’t get " +
        "memory-speed reads. Redis gives you expiry and speed for free and keeps that throwaway traffic off the database.",
      en:
        "You could, but it’s the wrong tool. Rate quotes are temporary, read very frequently, and are meant to expire — " +
        "which is exactly what a cache with a [[ttl:TTL]] is for. Doing it in [[mysql:MySQL]] means writing your own " +
        "expiry logic, adding read load and churn to the primary that the real data depends on, and you still don’t get " +
        "memory-speed reads. Redis gives you expiry and speed for free and keeps that throwaway traffic off the database.",
    },
    note: {
      zh:
        "别贬低 MySQL，而是讲“工具匹配”：报价临时、高频读、要过期——正好是缓存的形状。用 MySQL 要自管过期、给主库加压、" +
        "还没内存快。采分点是你能从数据的生命周期 / 访问模式来选型，而不是“Redis 就是快”。",
      en:
        "Don’t trash MySQL — frame it as tool fit: quotes are temporary, high-read, and want to expire, which is exactly a " +
        "cache’s shape. MySQL means self-managed expiry, extra load on the primary, and still no memory-speed reads. The " +
        "scoring point is choosing by the data’s lifecycle and access pattern, not “Redis is just fast”.",
    },
  },
  {
    id: "measure-40",
    category: "advanced",
    alert: true,
    q: {
      zh: "How did you measure the 40% improvement?（那个 40% 怎么测的？）",
      en: "How did you measure the 40% improvement?",
    },
    answer: {
      zh:
        "Honestly, and I’d scope it carefully. The number compares response time for the same package and route, before " +
        "and after caching, on repeated requests — the ones that can actually be served from cache. It is not a claim that " +
        "every request got 40% faster; a first, uncached request still pays full price. And if I didn’t have real " +
        "before-and-after measurements, I wouldn’t quote p50 or p95 figures — I’d rather drop the number from my resume " +
        "than defend one I can’t back up.",
      en:
        "Honestly, and I’d scope it carefully. The number compares response time for the same package and route, before " +
        "and after caching, on repeated requests — the ones that can actually be served from cache. It is not a claim that " +
        "every request got 40% faster; a first, uncached request still pays full price. And if I didn’t have real " +
        "before-and-after measurements, I wouldn’t quote p50 or p95 figures — I’d rather drop the number from my resume " +
        "than defend one I can’t back up.",
    },
    note: {
      zh:
        "这条最重要：诚实。说清口径——对比同包裹 / 同路线、开缓存前后、可缓存的重复请求；提升只适用于能命中缓存的重复请求，" +
        "不是所有首次请求。如果你没有真实测量数据，面试中不要临场编造 p50/p95 数据，宁可把简历里的 40% 删掉。面试官追问“怎么测的”" +
        "时，编造的数字在追问下极易当场暴露；诚实反而是加分项。简历上写的每个数字，都要能扛住这一问。",
      en:
        "The most important one: be honest. Scope it — same package/route, before vs after caching, on cacheable repeat " +
        "requests; the gain only applies to requests that can hit the cache, not every first request. If you don’t have " +
        "real measurements, do not invent p50/p95 on the spot — drop the 40% from your resume instead. “How did you measure " +
        "it?” is where made-up numbers collapse; honesty scores points. Every number on your resume has to survive this question.",
    },
  },
  {
    id: "rdb-vs-aof",
    category: "advanced",
    q: {
      zh: "RDB vs AOF — how does Redis persist data?（RDB 和 AOF 有什么区别？）",
      en: "RDB vs AOF — how does Redis persist data?",
    },
    answer: {
      zh:
        "Redis has two persistence options. RDB takes point-in-time snapshots of the whole dataset — the file is compact " +
        "and restores fast, but if the process crashes between snapshots you lose everything since the last one. AOF " +
        "instead logs every write command; with appendfsync everysec, the default, you lose at most about a second of " +
        "writes, but the file is larger and replay on restart is slower. In production people often run AOF everysec, or a " +
        "hybrid of RDB plus AOF, to balance durability and restart speed. Either way, Redis still isn’t the " +
        "[[sourceoftruth:source of truth]] — the database is.",
      en:
        "Redis has two persistence options. RDB takes point-in-time snapshots of the whole dataset — the file is compact " +
        "and restores fast, but if the process crashes between snapshots you lose everything since the last one. AOF " +
        "instead logs every write command; with appendfsync everysec, the default, you lose at most about a second of " +
        "writes, but the file is larger and replay on restart is slower. In production people often run AOF everysec, or a " +
        "hybrid of RDB plus AOF, to balance durability and restart speed. Either way, Redis still isn’t the " +
        "[[sourceoftruth:source of truth]] — the database is.",
    },
    note: {
      zh:
        "先分清两种机制：RDB=内存快照（紧凑、恢复快，但两次快照间宕机会丢数据）；AOF=记录每条写命令（appendfsync " +
        "everysec 是默认、最多丢约 1 秒，但文件大、恢复慢）。采分点：说出 everysec 是默认、生产常用 AOF everysec 或 " +
        "RDB+AOF 混合持久化。别背成“AOF 一定比 RDB 好”——是权衡。收口仍要表态：Redis 不是真相来源。",
      en:
        "Distinguish the two: RDB = memory snapshot (compact, fast restore, but loses data between snapshots); AOF = logs " +
        "every write (appendfsync everysec loses ~1s, but bigger file and slower replay). Scoring points: name everysec as " +
        "the default and mention AOF everysec or a hybrid RDB+AOF in production. Don’t claim AOF is simply better — it’s a " +
        "trade-off. Close by restating Redis isn’t the source of truth.",
    },
  },
  {
    id: "expire-deletion",
    category: "advanced",
    q: {
      zh: "How does Redis delete expired keys?（过期的 key 是怎么删的？）",
      en: "How does Redis delete expired keys?",
    },
    answer: {
      zh:
        "Redis combines two strategies. Lazy deletion: when you access a key, it checks the [[ttl:TTL]] and deletes it " +
        "right then if it has expired. Lazy alone would leak memory for keys nobody ever touches, so there’s also active " +
        "expiration: a background job periodically samples a batch of keys that have a TTL and removes the expired ones. " +
        "Redis deliberately does not attach a timer to every single key, because millions of timers would be far too " +
        "expensive — sampling is good enough.",
      en:
        "Redis combines two strategies. Lazy deletion: when you access a key, it checks the [[ttl:TTL]] and deletes it " +
        "right then if it has expired. Lazy alone would leak memory for keys nobody ever touches, so there’s also active " +
        "expiration: a background job periodically samples a batch of keys that have a TTL and removes the expired ones. " +
        "Redis deliberately does not attach a timer to every single key, because millions of timers would be far too " +
        "expensive — sampling is good enough.",
    },
    note: {
      zh:
        "两种机制结合：惰性删除（访问到才检查 TTL 并删）+ 定期删除（后台随机抽一批带 TTL 的 key 删过期的）。采分点是解释" +
        "“为什么不给每个 key 挂定时器”——开销太大。别说 Redis 到点就精确瞬删，实际是采样近似，过期 key 可能短时间仍占内存。",
      en:
        "Two mechanisms combined: lazy deletion (checked on access) + active sampling (a background job samples keys with a " +
        "TTL and drops the expired ones). Scoring point: explain why there’s no per-key timer — the overhead would be huge. " +
        "Don’t claim keys vanish the exact instant they expire; it’s approximate, and an expired key can briefly still hold memory.",
    },
  },
  {
    id: "eviction-policy",
    category: "advanced",
    q: {
      zh: "What happens when memory is full?（内存满了淘汰谁？）",
      en: "What happens when Redis runs out of memory?",
    },
    answer: {
      zh:
        "When Redis reaches the maxmemory limit, it evicts keys according to maxmemory-policy. The default is noeviction, " +
        "which just returns errors on further writes. The main alternatives are allkeys-lru or allkeys-lfu, which can evict " +
        "any key, and the volatile-* variants, which only evict keys that carry a [[ttl:TTL]]. LRU evicts what hasn’t been " +
        "used recently; LFU evicts what’s used least often, which resists a one-off scan polluting the cache. Note Redis " +
        "uses approximate LRU by sampling, not a perfect ordering. For a pure cache I’d usually pick allkeys-lru or " +
        "allkeys-lfu.",
      en:
        "When Redis reaches the maxmemory limit, it evicts keys according to maxmemory-policy. The default is noeviction, " +
        "which just returns errors on further writes. The main alternatives are allkeys-lru or allkeys-lfu, which can evict " +
        "any key, and the volatile-* variants, which only evict keys that carry a [[ttl:TTL]]. LRU evicts what hasn’t been " +
        "used recently; LFU evicts what’s used least often, which resists a one-off scan polluting the cache. Note Redis " +
        "uses approximate LRU by sampling, not a perfect ordering. For a pure cache I’d usually pick allkeys-lru or " +
        "allkeys-lfu.",
    },
    note: {
      zh:
        "先说触发点（到 maxmemory 按 maxmemory-policy 淘汰）。采分点：noeviction 是默认（写报错）、allkeys-* vs volatile-*" +
        "（后者只淘汰设了 TTL 的）、LRU（最近用没用）vs LFU（用得频不频、更抗偶发大扫描）。补一句“Redis 是近似 LRU（采样）”" +
        "显得懂细节。纯缓存常选 allkeys-lru/lfu。",
      en:
        "Start with the trigger (at maxmemory, evict per maxmemory-policy). Scoring points: noeviction is the default (writes " +
        "error), allkeys-* vs volatile-* (the latter only evicts keys with a TTL), LRU (recency) vs LFU (frequency, resists a " +
        "one-off scan). Adding “approximate LRU via sampling” shows depth. For a pure cache, allkeys-lru/lfu is the common pick.",
    },
  },
  {
    id: "replication-sentinel-cluster",
    category: "advanced",
    q: {
      zh: "Replication vs Sentinel vs Cluster?（主从、哨兵、集群的区别？）",
      en: "What’s the difference between replication, Sentinel, and Cluster?",
    },
    answer: {
      zh:
        "These solve different problems. Replication gives you read scaling: replicas copy the master, but replication is " +
        "asynchronous, so a replica can serve slightly stale data. Sentinel adds high availability — it monitors the master " +
        "and, if it dies, automatically promotes a replica and fails over. Cluster is about horizontal scale: it shards data " +
        "across 16384 hash slots spread over multiple masters. The clean distinction is: Sentinel is HA without sharding, " +
        "Cluster is sharding plus HA.",
      en:
        "These solve different problems. Replication gives you read scaling: replicas copy the master, but replication is " +
        "asynchronous, so a replica can serve slightly stale data. Sentinel adds high availability — it monitors the master " +
        "and, if it dies, automatically promotes a replica and fails over. Cluster is about horizontal scale: it shards data " +
        "across 16384 hash slots spread over multiple masters. The clean distinction is: Sentinel is HA without sharding, " +
        "Cluster is sharding plus HA.",
    },
    note: {
      zh:
        "三者别混：主从=读扩展（异步复制→从库可能读到旧数据）；哨兵=监控+主挂了自动故障转移（高可用，不分片）；集群=16384 " +
        "个哈希槽分片（横向扩容+高可用）。采分点就是这句对比：哨兵=HA 不分片，集群=分片+HA。能提一句“异步复制导致主从延迟”加分。",
      en:
        "Keep them distinct: replication = read scaling (async → replicas can be stale); Sentinel = monitoring + automatic " +
        "failover (HA, no sharding); Cluster = 16384 hash slots for sharding (horizontal scale + HA). The scoring line is the " +
        "contrast: Sentinel is HA without sharding, Cluster is sharding plus HA. Mentioning replication lag from async " +
        "replication is a bonus.",
    },
  },
  {
    id: "transactions",
    category: "advanced",
    q: {
      zh: "Does Redis have transactions?（Redis 有事务吗？）",
      en: "Does Redis have transactions?",
    },
    answer: {
      zh:
        "It does, but not in the SQL sense. MULTI queues commands and EXEC runs them in order, as a unit, without another " +
        "client’s commands interleaving. The big caveat is there’s no rollback: if one command fails at runtime, the others " +
        "still execute. WATCH gives you optimistic locking — EXEC aborts if a watched key changed in the meantime. And when " +
        "you need real atomic multi-step logic, you use a Lua script, which runs [[atomic:atomically]] on the single thread.",
      en:
        "It does, but not in the SQL sense. MULTI queues commands and EXEC runs them in order, as a unit, without another " +
        "client’s commands interleaving. The big caveat is there’s no rollback: if one command fails at runtime, the others " +
        "still execute. WATCH gives you optimistic locking — EXEC aborts if a watched key changed in the meantime. And when " +
        "you need real atomic multi-step logic, you use a Lua script, which runs [[atomic:atomically]] on the single thread.",
    },
    note: {
      zh:
        "先肯定“有事务”，但立刻点出和 SQL 不同：MULTI/EXEC 只保证排队按序、不被打断，没有回滚（某条运行时出错其余照跑）。" +
        "采分点：WATCH=乐观锁、复杂原子逻辑用 Lua 脚本。别说“Redis 事务能回滚”——这是高频翻车点。",
      en:
        "Confirm “yes, transactions exist” but immediately flag the difference from SQL: MULTI/EXEC only guarantee ordered, " +
        "uninterrupted execution, with no rollback (a runtime error doesn’t undo the rest). Scoring points: WATCH = optimistic " +
        "lock, and Lua for real atomic logic. Never say Redis transactions roll back — that’s a common trip-up.",
    },
  },
  {
    id: "pipeline-vs-transaction",
    category: "advanced",
    q: {
      zh: "Pipeline vs transaction?（Pipeline 和事务有什么区别？）",
      en: "What’s the difference between a pipeline and a transaction?",
    },
    answer: {
      zh:
        "They’re often confused but do different things. A pipeline is purely a network optimization: you send many commands " +
        "in one batch and read the replies together, cutting round-trip time (RTT). It does not make them [[atomic:atomic]] — " +
        "another client’s commands can still interleave with yours. A transaction, MULTI/EXEC, guarantees the batch runs in " +
        "order without interruption. So pipelining is about throughput and RTT; a transaction is about atomicity. You can " +
        "even pipeline a MULTI/EXEC block to get both.",
      en:
        "They’re often confused but do different things. A pipeline is purely a network optimization: you send many commands " +
        "in one batch and read the replies together, cutting round-trip time (RTT). It does not make them [[atomic:atomic]] — " +
        "another client’s commands can still interleave with yours. A transaction, MULTI/EXEC, guarantees the batch runs in " +
        "order without interruption. So pipelining is about throughput and RTT; a transaction is about atomicity. You can " +
        "even pipeline a MULTI/EXEC block to get both.",
    },
    note: {
      zh:
        "核心区别：pipeline=一次发多条一次收、省网络往返(RTT)，不保证原子、中间可被别的客户端命令穿插；事务(MULTI/EXEC)=" +
        "保证有序不被打断。采分点是别把两者混为一谈——一个解决吞吐/延迟，一个解决原子性。能说“可以把 MULTI/EXEC 也放进 " +
        "pipeline”算加分。",
      en:
        "Core difference: a pipeline batches sends/receives to save RTT but is not atomic (other clients can interleave); a " +
        "transaction (MULTI/EXEC) guarantees ordered, uninterrupted execution. Scoring point: don’t conflate them — one is " +
        "throughput/latency, the other is atomicity. Noting you can pipeline a MULTI/EXEC block is a bonus.",
    },
  },
  {
    id: "distributed-lock",
    category: "advanced",
    q: {
      zh: "How would you build a distributed lock with Redis?（用 Redis 怎么做分布式锁？）",
      en: "How would you build a distributed lock with Redis?",
    },
    answer: {
      zh:
        "The basic pattern is [[setnx:SET key <unique-value> NX EX <ttl>]] — NX means only one client can acquire it. Two " +
        "things matter. First, when you release, don’t just DEL: run a small Lua script that checks the value is yours before " +
        "deleting, so you never release someone else’s lock. Second, the TTL prevents a dead client from holding the lock " +
        "forever, but if your work outlives the TTL you need a watchdog to renew it. For multi-master setups there’s the " +
        "Redlock algorithm, though it’s debated — Kleppmann argued it isn’t safe under clock drift and GC pauses. Being able " +
        "to say “I know Redlock and the controversy” is a plus.",
      en:
        "The basic pattern is [[setnx:SET key <unique-value> NX EX <ttl>]] — NX means only one client can acquire it. Two " +
        "things matter. First, when you release, don’t just DEL: run a small Lua script that checks the value is yours before " +
        "deleting, so you never release someone else’s lock. Second, the TTL prevents a dead client from holding the lock " +
        "forever, but if your work outlives the TTL you need a watchdog to renew it. For multi-master setups there’s the " +
        "Redlock algorithm, though it’s debated — Kleppmann argued it isn’t safe under clock drift and GC pauses. Being able " +
        "to say “I know Redlock and the controversy” is a plus.",
    },
    note: {
      zh:
        "采分点分三层：加锁用 SET key 唯一值 NX EX ttl；释放要用 Lua 先校验 value 是自己的再删（避免误删别人的锁）；ttl 防死锁" +
        "但业务超时要看门狗续期。能说出 Redlock 及 Kleppmann 的质疑（时钟漂移/GC 停顿）是加分。别把分布式锁说得绝对安全——它有边界。",
      en:
        "Three scoring layers: acquire with SET key <unique> NX EX ttl; release via a Lua check-value-then-delete (never delete " +
        "someone else’s lock); TTL avoids deadlock but a job that outlives it needs a watchdog to renew. Bonus: mention Redlock " +
        "and Kleppmann’s critique (clock drift / GC pauses). Don’t present the lock as absolutely safe — it has limits.",
    },
  },
  {
    id: "cache-penetration",
    category: "advanced",
    q: {
      zh: "What is cache penetration?（缓存穿透是什么？）",
      en: "What is cache penetration?",
    },
    answer: {
      zh:
        "Cache penetration is when requests keep asking for data that doesn’t exist anywhere — every lookup misses the cache " +
        "and falls through to the database, and an attacker can weaponize it by hammering random non-existent keys. The " +
        "fixes: cache the empty result with a short [[ttl:TTL]] so repeats stop at the cache, put a Bloom filter in front to " +
        "reject keys that definitely don’t exist, and validate inputs so obviously bogus requests never reach the DB.",
      en:
        "Cache penetration is when requests keep asking for data that doesn’t exist anywhere — every lookup misses the cache " +
        "and falls through to the database, and an attacker can weaponize it by hammering random non-existent keys. The " +
        "fixes: cache the empty result with a short [[ttl:TTL]] so repeats stop at the cache, put a Bloom filter in front to " +
        "reject keys that definitely don’t exist, and validate inputs so obviously bogus requests never reach the DB.",
    },
    note: {
      zh:
        "先讲现象：查根本不存在的数据，缓存永远 miss、每次穿透到 DB，可被恶意刷。采分点三个解法：缓存空值（短 TTL）+ 布隆" +
        "过滤器挡掉一定不存在的 key + 参数校验。注意和“击穿”“雪崩”区分——穿透查的是不存在的数据。",
      en:
        "Describe it: querying data that doesn’t exist, so the cache always misses and every request falls through to the DB — " +
        "abusable by attackers. Three fixes: cache the null (short TTL) + a Bloom filter to reject definitely-missing keys + " +
        "input validation. Distinguish it from breakdown and avalanche — penetration is about non-existent data.",
    },
  },
  {
    id: "cache-breakdown",
    category: "advanced",
    q: {
      zh: "What is hot-key breakdown?（缓存击穿是什么？）",
      en: "What is hot-key cache breakdown?",
    },
    answer: {
      zh:
        "Cache breakdown is the single-hot-key version of a [[stampede:stampede]]: one very popular key expires and, in that " +
        "instant, a flood of concurrent requests all miss and hit the database together. The fixes: a mutex or single-flight " +
        "so only one request rebuilds the entry while the rest wait, logical expiration where you serve slightly stale data " +
        "and rebuild asynchronously, or simply never expiring the hottest keys.",
      en:
        "Cache breakdown is the single-hot-key version of a [[stampede:stampede]]: one very popular key expires and, in that " +
        "instant, a flood of concurrent requests all miss and hit the database together. The fixes: a mutex or single-flight " +
        "so only one request rebuilds the entry while the rest wait, logical expiration where you serve slightly stale data " +
        "and rebuild asynchronously, or simply never expiring the hottest keys.",
    },
    note: {
      zh:
        "和穿透区分：击穿查的是存在的热点 key，只是恰好过期的瞬间大量并发一起打 DB。采分点三个解法：互斥锁/单飞（只放一个去" +
        "重建）、逻辑过期（异步重建）、热点 key 不过期。能点出“单个热 key 的 stampede”这层关系加分。",
      en:
        "Distinguish from penetration: breakdown is a hot key that exists but just expired, so a burst of concurrency hits the " +
        "DB at once. Three fixes: mutex/single-flight (one rebuilder), logical expiration (async rebuild), or never expiring the " +
        "hottest keys. Framing it as a single-hot-key stampede is a plus.",
    },
  },
  {
    id: "cache-avalanche",
    category: "advanced",
    q: {
      zh: "What is a cache avalanche?（缓存雪崩是什么？）",
      en: "What is a cache avalanche?",
    },
    answer: {
      zh:
        "A cache avalanche is the large-scale version: a huge number of keys expire at the same moment, or Redis itself goes " +
        "down, and the resulting flood of requests overwhelms the database. The fixes: add random jitter to TTLs so keys " +
        "don’t all expire together, use multi-level caching, apply rate limiting and circuit breakers to shed load, and run " +
        "Redis in a highly available setup so it isn’t a single point of failure.",
      en:
        "A cache avalanche is the large-scale version: a huge number of keys expire at the same moment, or Redis itself goes " +
        "down, and the resulting flood of requests overwhelms the database. The fixes: add random jitter to TTLs so keys " +
        "don’t all expire together, use multi-level caching, apply rate limiting and circuit breakers to shed load, and run " +
        "Redis in a highly available setup so it isn’t a single point of failure.",
    },
    note: {
      zh:
        "和击穿的区别是规模：雪崩是大量 key 同时过期、或 Redis 整个宕机，请求洪流压垮 DB。采分点：TTL 加随机抖动（避免同时" +
        "过期）、多级缓存、限流熔断降级、Redis 高可用别单点。三大缓存问题（穿透/击穿/雪崩）能一次讲清是很强的信号。",
      en:
        "Difference from breakdown is scale: avalanche is many keys expiring together, or Redis itself down, flooding the DB. " +
        "Fixes: TTL jitter (avoid synchronized expiry), multi-level cache, rate limiting / circuit breaking, and HA Redis so it " +
        "isn’t a single point of failure. Explaining the trio (penetration / breakdown / avalanche) cleanly is a strong signal.",
    },
  },
  {
    id: "cache-consistency",
    category: "advanced",
    q: {
      zh: "How do you keep the database and cache consistent?（数据库和缓存怎么保证一致？）",
      en: "How do you keep the database and the cache consistent?",
    },
    answer: {
      zh:
        "There’s no perfect strong consistency once you add a cache — you aim for eventual consistency. Under " +
        "[[cacheaside:cache-aside]] the common rule is: update the database first, then delete the cache key, not update it — " +
        "deleting avoids two concurrent writers leaving a wrong value behind. Even then a rare interleaving can briefly serve " +
        "stale data, so some teams do a delayed double-delete: delete after the write, then delete again a moment later. For " +
        "something stronger you can subscribe to the [[mysql:database]] binlog with a tool like Canal and invalidate " +
        "asynchronously, plus a short backstop [[ttl:TTL]] on the cache. The honest stance: don’t chase strong consistency — " +
        "if you truly need it, don’t put a cache in front.",
      en:
        "There’s no perfect strong consistency once you add a cache — you aim for eventual consistency. Under " +
        "[[cacheaside:cache-aside]] the common rule is: update the database first, then delete the cache key, not update it — " +
        "deleting avoids two concurrent writers leaving a wrong value behind. Even then a rare interleaving can briefly serve " +
        "stale data, so some teams do a delayed double-delete: delete after the write, then delete again a moment later. For " +
        "something stronger you can subscribe to the [[mysql:database]] binlog with a tool like Canal and invalidate " +
        "asynchronously, plus a short backstop [[ttl:TTL]] on the cache. The honest stance: don’t chase strong consistency — " +
        "if you truly need it, don’t put a cache in front.",
    },
    note: {
      zh:
        "采分点：Cache-Aside 下“先更新数据库、再删缓存”（删而不是更新，避免并发覆盖留脏值）；极端时序仍可能短暂不一致→" +
        "延迟双删；更强可订阅 binlog(canal) 异步删缓存 + 短 TTL 兜底。最重要的表态：别追求强一致——要强一致就别加缓存。" +
        "这条最能体现你懂权衡、不过度包装。",
      en:
        "Scoring points: under cache-aside, “update DB first, then delete the cache” (delete, not update, to avoid concurrent " +
        "writers leaving a stale value); rare interleavings still allow brief staleness → delayed double-delete; stronger " +
        "still, subscribe to the binlog (Canal) and invalidate async, with a short backstop TTL. The key stance: don’t chase " +
        "strong consistency — if you truly need it, don’t add a cache. This shows you understand the trade-off.",
    },
  },
  {
    id: "singlethread-multithread",
    category: "advanced",
    q: {
      zh: "Redis is single-threaded — so why is 6.0 multithreaded?（单线程为什么还快？6.0 的多线程是什么？）",
      en: "If Redis is single-threaded, why is it fast — and what did 6.0’s multithreading change?",
    },
    answer: {
      zh:
        "Command execution is [[singlethread:single-threaded]], and that’s a feature, not a limitation: with one thread " +
        "there are no locks and no context switching, and since everything is in memory it’s still extremely fast — much " +
        "like Node’s event loop. Redis 6.0 added multithreading, but only for network I/O — reading and writing sockets and " +
        "parsing the protocol. The actual command execution stays single-threaded, which is why data operations still need " +
        "no locking.",
      en:
        "Command execution is [[singlethread:single-threaded]], and that’s a feature, not a limitation: with one thread " +
        "there are no locks and no context switching, and since everything is in memory it’s still extremely fast — much " +
        "like Node’s event loop. Redis 6.0 added multithreading, but only for network I/O — reading and writing sockets and " +
        "parsing the protocol. The actual command execution stays single-threaded, which is why data operations still need " +
        "no locking.",
    },
    note: {
      zh:
        "采分点：核心命令执行仍是单线程（免加锁、免上下文切换、内存够快）。关键澄清：6.0+ 的多线程只是网络 I/O（读写 socket、" +
        "协议解析）多线程，命令执行仍单线程，所以数据操作依然无需加锁。别误说“Redis 6.0 变成多线程执行命令了”——这是高频误区。",
      en:
        "Scoring points: core command execution is still single-threaded (no locks, no context switches, fast in memory). Key " +
        "clarification: 6.0+ multithreading is only for network I/O (socket read/write, protocol parsing); command execution " +
        "stays single-threaded, so data ops still need no locking. Don’t say “Redis 6.0 executes commands multithreaded” — a " +
        "common misconception.",
    },
  },
];

// ---------- 总结卡 ----------

export type FlowStep = { label: L; sub?: L };

export const summary = {
  step: { zh: "带走这四条", en: "Take these four" },
  title: { zh: "总结 · 一图记住", en: "Summary · remember this" },

  takeaways: [
    {
      zh:
        "[[redis:Redis]] 是加速层，不是[[sourceoftruth:真相来源]]；它随时可能挂，所以每处用法都要能降级，或从原始来源重算。",
      en:
        "[[redis:Redis]] is a speed layer, not the [[sourceoftruth:source of truth]]. It can go down at any time, so every " +
        "usage must degrade gracefully or recompute from the original source.",
    },
    {
      zh:
        "[[cacheaside:cache-aside]] 四拍：查缓存 →（命中）直接返回 /（未命中）取原始来源 → 写回并设 [[ttl:TTL]]。",
      en:
        "[[cacheaside:Cache-aside]] in four beats: check the cache → (hit) return it / (miss) fetch the source → write it " +
        "back with a [[ttl:TTL]].",
    },
    {
      zh:
        "WeShipItNow 三处用法记牢：运费 rate cache（读缓存）、买标签 [[idempotency:幂等]]（并发保护）、余额 [[projection:投影]]（读模型）。",
      en:
        "Remember the three WeShipItNow usages: rate cache (a read cache), label [[idempotency:idempotency]] (a concurrency " +
        "guard), and balance [[projection:projection]] (a read model).",
    },
    {
      zh:
        "诚实原则：简历上每个词都要扛得住追问；没做过的别说做过，没测过的数字（比如那个 40%）别编。",
      en:
        "The honesty rule: every word on your resume must survive follow-ups; don’t claim what you didn’t do, and don’t " +
        "invent numbers (like that 40%) you never measured.",
    },
  ] as L[],

  flowTitle: { zh: "cache-aside 四拍", en: "Cache-aside · four beats" },
  flow: [
    {
      label: { zh: "① 查缓存", en: "① Check cache" },
      sub: { zh: "GET key", en: "GET key" },
    },
    {
      label: { zh: "② 命中？直接返回", en: "② Hit? return it" },
      sub: { zh: "cache hit", en: "cache hit" },
    },
    {
      label: { zh: "③ 未命中？取原始来源", en: "③ Miss? fetch source" },
      sub: { zh: "DB / carrier API", en: "DB / carrier API" },
    },
    {
      label: { zh: "④ 写回 + 设 TTL", en: "④ Write back + TTL" },
      sub: { zh: "SET key … EX", en: "SET key … EX" },
    },
  ] as FlowStep[],
};
