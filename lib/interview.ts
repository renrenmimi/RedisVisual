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
  title: { zh: "第 4 站 · 面试速通", en: "Stop 4 · Interview Prep" },
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
      zh: "14 道高频题，按“基础 → 系统 → 进阶”排好，从头过一遍。",
      en: "14 common questions, ordered fundamentals → system → advanced. Read them top to bottom.",
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
      "面试的终极原则：简历上每个技术词，都要能扛住 5–10 分钟的追问。没做过的别说做过，" +
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
        "采分点：说清它是“数据仓库”，并且开口就带出“内存”这个关键词——它是后面所有问题的地基。",
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
        "这句表态为后面“Redis 挂了怎么办”提前埋好伏笔。",
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
        "列出五个核心结构，每个配一个场景（hash=对象、sorted set=排行榜/限流最出彩）。顺带提一句 streams/HyperLogLog " +
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
        "一句话讲清“为什么”：协商折扣价因客户而异；不含 accountId 会串号，把 A 的价返给 B——既是 bug 又是定价数据泄露。" +
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
      zh: "What happens when Redis goes down?（Redis 挂了会怎样？）",
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
        "不是所有首次请求。如果你没有真实测量数据，面试千万别现编 p50/p95，宁可把简历里的 40% 删掉。面试官追问“怎么测的”" +
        "时，编数字是当场翻车的高发点；诚实反而是加分项。简历上写的每个数字，都要能扛住这一问。",
      en:
        "The most important one: be honest. Scope it — same package/route, before vs after caching, on cacheable repeat " +
        "requests; the gain only applies to requests that can hit the cache, not every first request. If you don’t have " +
        "real measurements, do not invent p50/p95 on the spot — drop the 40% from your resume instead. “How did you measure " +
        "it?” is where made-up numbers collapse; honesty scores points. Every number on your resume has to survive this question.",
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
