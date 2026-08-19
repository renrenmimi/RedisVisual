// 第 7 站「面试速通」的全部双语文案 + 面试题数据。
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
  title: { zh: "第 7 站 · 面试速通", en: "Stop 7 · Interview prep" },
  subtitle: {
    zh: "把前面几站学到的，变成面试官面前能用英语讲出来的话。",
    en: "Turn what you learned in the earlier stops into English you can say to an interviewer.",
  },

  intro: {
    step: { zh: "面试准备", en: "Interview prep" },
    heading: {
      zh: "英文问题 + 英文示范回答 + 中文讲解",
      en: "The question, a model answer, and why it works",
    },
    body: {
      zh:
        "前面几站你已经见过 [[redis:Redis]] 是什么、为什么快、我们的系统为什么用它、缓存会怎么失效。这一站把它们变成面试能说出口的话：" +
        "每题给出英文问题、一段可以直接背的英文示范回答，以及一段中文讲解——面试官到底在确认什么、哪一两句能拿分、哪句话会翻车。" +
        "点开任意一题展开答案；正文里带虚线的词，点一下就有解释。",
      en:
        "The earlier stops covered what [[redis:Redis]] is, why it is fast, how a real system uses it, and how caches fail. " +
        "This stop turns that into words you can say out loud: every question comes with an English model answer you can rehearse, " +
        "plus a short note on what the interviewer is checking and which sentence loses credit. " +
        "Click any question to open it. Words with a dotted underline open a short definition.",
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
      en: "26 common questions, ordered fundamentals → system → advanced. Read them from top to bottom.",
    },
    fundamentals: {
      zh: "先能用一两句话讲清 Redis 是什么、为什么快——面试官最先试探的就是这里。",
      en: "Say what Redis is and why it is fast in one or two sentences. This is the area interviewers probe first.",
    },
    system: {
      zh: "WeShipItNow 里的三处真实用法：每一处都要能讲出“解决了什么问题”。",
      en: "The three real usages in WeShipItNow. For each one, be able to say which problem it solved.",
    },
    advanced: {
      zh: "失效、穿透 / 击穿 / 雪崩、选型，以及那个 40% 该怎么诚实地讲。",
      en: "Invalidation, the three cache failures, tool choice, and how to talk about that 40% honestly.",
    },
  },

  answerLabel: { zh: "英文示范回答", en: "Model answer" },
  noteLabel: { zh: "讲解 · 为什么这么答", en: "Why this works" },
  alertTag: { zh: "诚实红线", en: "Be honest" },

  expandAll: { zh: "全部展开", en: "Expand all" },
  collapseAll: { zh: "全部收起", en: "Collapse all" },
  countUnit: { zh: "题", en: "questions" },

  footer: {
    zh:
      "面试的核心原则：简历上每个技术词，都要能扛住 5–10 分钟的追问。没做过的别说做过，没测过的数字别编——" +
      "一句“这个我没测过”，比一个撑不住追问的数字有力得多。",
    en:
      "One rule matters most: every technical word on your resume should survive five to ten minutes of follow-up questions. " +
      "Do not claim work you did not do, and do not invent numbers you never measured. " +
      "Saying that you did not measure something is a stronger answer than a number you cannot defend.",
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
        "Redis is an in-memory [[keyvalue:key-value]] data store. The name comes from REmote DIctionary Server, so you can " +
        "picture one large dictionary that many programs read and write over the network. Because the data sits in " +
        "[[memory:memory]], reads and writes are very fast. Teams use it for caching, counters, session storage, rate " +
        "limiting, and leaderboards. In our system it sits in front of the database, so it holds data that has to be fast " +
        "and is allowed to be short-lived.",
      en:
        "Redis is an in-memory [[keyvalue:key-value]] data store. The name comes from REmote DIctionary Server, so you can " +
        "picture one large dictionary that many programs read and write over the network. Because the data sits in " +
        "[[memory:memory]], reads and writes are very fast. Teams use it for caching, counters, session storage, rate " +
        "limiting, and leaderboards. In our system it sits in front of the database, so it holds data that has to be fast " +
        "and is allowed to be short-lived.",
    },
    note: {
      zh:
        "面试官在这一题只想确认一件事：你能不能用一句话把工具定义清楚，再展开。采分点是两个词——data store（是数据存储，" +
        "不是某个库或框架）和 in-memory（后面所有问题都建立在它上面，所以要第一句就说出来）。别背整张功能列表，" +
        "三四个真实用途就够；说完停下来，让面试官挑一个往下追。",
      en:
        "The interviewer is checking whether you can define the tool in one sentence before you talk about it. Credit comes " +
        "from two words: data store, and in-memory. Every later question builds on the second one, so say it early. The trap " +
        "is reciting the whole feature list; three or four real use cases are enough, and then you stop and let them choose " +
        "the follow-up.",
    },
  },
  {
    id: "why-fast",
    category: "fundamentals",
    q: { zh: "Why is Redis fast?（为什么快？）", en: "Why is Redis fast?" },
    answer: {
      zh:
        "Three reasons, and memory is only the first one. The data is in [[memory:memory]], so there is no disk read. The " +
        "command path is also short: a GET is close to a hash-table lookup, while SQL has to parse the query, plan it, walk " +
        "a B+ tree, and apply transaction rules. And Redis runs commands one at a time on a [[singlethread:single thread]], " +
        "so it needs no locks between them. That is why MySQL with a warm buffer pool is still slower: it does more work per " +
        "request.",
      en:
        "Three reasons, and memory is only the first one. The data is in [[memory:memory]], so there is no disk read. The " +
        "command path is also short: a GET is close to a hash-table lookup, while SQL has to parse the query, plan it, walk " +
        "a B+ tree, and apply transaction rules. And Redis runs commands one at a time on a [[singlethread:single thread]], " +
        "so it needs no locks between them. That is why MySQL with a warm buffer pool is still slower: it does more work per " +
        "request.",
    },
    note: {
      zh:
        "这是全场最容易被追问的一题：面试官会立刻回你一句“MySQL 也有 buffer pool，也在内存里”，所以只答“因为在内存”一定被打回来。" +
        "采分点是第二层——每条命令要做的工作本来就少得多。第三层“单线程所以不用加锁”是加分项，但别顺口说成“Redis 全都是单线程”，" +
        "Redis 6 已经有网络 I/O 多线程了（见最后一题）。",
      en:
        "This is the most common follow-up in the whole set. The interviewer will answer that MySQL also keeps pages in " +
        "memory, so memory alone cannot be the reason. Credit comes from the second point: Redis does far less work per " +
        "command. One thread and no locking is a good third point, but do not let it become a claim that Redis is " +
        "single-threaded everywhere, because Redis 6 added threads for network I/O.",
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
        "It can be both. Redis supports persistence, so some teams run it as a primary store. In most systems, including " +
        "ours, it is a cache and a read model in front of a durable database. It is not the " +
        "[[sourceoftruth:source of truth]]. If we lost the whole Redis instance, we could rebuild every key from the " +
        "database.",
      en:
        "It can be both. Redis supports persistence, so some teams run it as a primary store. In most systems, including " +
        "ours, it is a cache and a read model in front of a durable database. It is not the " +
        "[[sourceoftruth:source of truth]]. If we lost the whole Redis instance, we could rebuild every key from the " +
        "database.",
    },
    note: {
      zh:
        "面试官要的是一个立场，不是一段定义。所以先说“两者都可以，看你怎么用”，再立刻说清在你们系统里它是哪一种、为什么。" +
        "采分点是把“真相来源在数据库”这句话说出口——它决定了后面“Redis 不可用怎么办”那一题怎么答。" +
        "别停在抽象层面，那样面试官听不出你到底做过什么。",
      en:
        "The interviewer wants a position, not a definition. Say that it can be either, then say which one it is in your " +
        "system and why. Credit comes from naming the source of truth out loud, because that decides how you answer the " +
        "failure question later. The trap is an abstract answer that never says what you actually built.",
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
        "A [[cachehit:cache hit]] means the value is already in the cache, so you return it right away and skip the slow " +
        "query or the external call. A [[cachemiss:cache miss]] means it is not there, so you read the original source and " +
        "then write the result back, so the next request hits. A miss is a normal part of the flow, not an error. The number " +
        "that matters is hit rate, which is hits divided by total lookups. If the hit rate is low, the cache is using memory " +
        "and returning very little.",
      en:
        "A [[cachehit:cache hit]] means the value is already in the cache, so you return it right away and skip the slow " +
        "query or the external call. A [[cachemiss:cache miss]] means it is not there, so you read the original source and " +
        "then write the result back, so the next request hits. A miss is a normal part of the flow, not an error. The number " +
        "that matters is hit rate, which is hits divided by total lookups. If the hit rate is low, the cache is using memory " +
        "and returning very little.",
    },
    note: {
      zh:
        "这是一道热身题，答快一点，然后补一个定义里没有的东西：命中率。主动提命中率，说明你真的看过缓存的线上指标，" +
        "而不只是背过概念。要避免的说法是把 miss 讲成“出错了”——它是正常路径，缓存本来就靠 miss 来填。",
      en:
        "This is a warm-up question, so answer it quickly and add one thing the definition does not contain. Hit rate is that " +
        "thing, and naming it suggests you have watched a cache in production rather than read about one. The trap is " +
        "calling a miss an error; a miss is the normal path that fills the cache in the first place.",
    },
  },
  {
    id: "ttl",
    category: "fundamentals",
    q: { zh: "What is TTL?（存活时间是什么？）", en: "What is TTL?" },
    answer: {
      zh:
        "[[ttl:TTL]], time to live, is an expiry timer on a key. Once the key expires, Redis will not return it any more. " +
        "The deletion can happen slightly later, because Redis checks expiry when a key is accessed and a background job " +
        "samples keys that carry a TTL. Caches depend on this, so stale values do not stay forever. Our rate cache uses a " +
        "short TTL: a shipping quote is only valid for a short time, so expiry is part of correctness and not only cleanup.",
      en:
        "[[ttl:TTL]], time to live, is an expiry timer on a key. Once the key expires, Redis will not return it any more. " +
        "The deletion can happen slightly later, because Redis checks expiry when a key is accessed and a background job " +
        "samples keys that carry a TTL. Caches depend on this, so stale values do not stay forever. Our rate cache uses a " +
        "short TTL: a shipping quote is only valid for a short time, so expiry is part of correctness and not only cleanup.",
    },
    note: {
      zh:
        "先给定义，再把保证说准。Redis 保证的是“过期之后不再返回这个 key”，不是“到点那一刻就把它删掉”——真正的删除靠访问时的" +
        "惰性检查加后台采样，内存是稍后才回收的。加一句“短 TTL 本身也是一种正确性保证”，说明你在想数据的业务语义，" +
        "而不是把 TTL 当垃圾回收。要避免的说法：到点瞬间精确删除。",
      en:
        "Give the definition, then be precise about the guarantee. Redis promises that an expired key is not returned; it " +
        "does not promise the key is removed at that exact moment, and the memory is reclaimed later. Saying that a short " +
        "TTL is also a correctness rule, not only cleanup, shows you think about the data and not only about the cache. The " +
        "trap is claiming the key disappears the instant the timer ends.",
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
        "The five core types are strings, hashes, lists, sets, and sorted sets. A string holds a value or a counter. A hash " +
        "stores an object as fields, so you can update one field without rewriting the whole object. A list works as a queue " +
        "or a stack, and a set gives you membership tests and deduplication. A sorted set keeps members ordered by a score, " +
        "which is what leaderboards and sliding-window rate limiting need. There are more types, such as streams, bitmaps, " +
        "and HyperLogLog, but those five cover most daily work.",
      en:
        "The five core types are strings, hashes, lists, sets, and sorted sets. A string holds a value or a counter. A hash " +
        "stores an object as fields, so you can update one field without rewriting the whole object. A list works as a queue " +
        "or a stack, and a set gives you membership tests and deduplication. A sorted set keeps members ordered by a score, " +
        "which is what leaderboards and sliding-window rate limiting need. There are more types, such as streams, bitmaps, " +
        "and HyperLogLog, but those five cover most daily work.",
    },
    note: {
      zh:
        "面试官想看的是“结构 → 场景”的对应，不是能背几个名字。所以每个结构配一句用途，其中 sorted set 要举具体例子" +
        "（排行榜、滑动窗口限流），这是最能体现你真用过的一项。顺带提一句 streams / HyperLogLog 说明你知道还有更多，" +
        "但别主动展开。要避免的答法：光报一串名字，一个场景都没有。",
      en:
        "The interviewer is checking whether you can map a structure to a problem, not whether you can list names. Give one " +
        "short use case per type, and make the sorted set example concrete, because leaderboards and rate limiting are the " +
        "two that sound like real work. Naming streams or HyperLogLog shows wider reading, but do not start explaining them " +
        "unless you are asked. The trap is a flat list with no use cases attached.",
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
        "In three places. First, a [[cacheaside:cache-aside]] cache for shipping rate quotes with a short [[ttl:TTL]], so " +
        "repeated lookups for the same package do not call the [[carrier:carrier]] APIs again. Second, an " +
        "[[idempotency:idempotency]] key on label purchase using [[setnx:SET NX]], so a retry or a double click cannot " +
        "charge the customer twice or create two labels. Third, an account balance [[projection:projection]]: the " +
        "[[ledger:ledger]] in the database stays the source of truth, and Redis holds the pre-computed balance so reads are " +
        "fast. So one read cache, one concurrency guard, and one read model.",
      en:
        "In three places. First, a [[cacheaside:cache-aside]] cache for shipping rate quotes with a short [[ttl:TTL]], so " +
        "repeated lookups for the same package do not call the [[carrier:carrier]] APIs again. Second, an " +
        "[[idempotency:idempotency]] key on label purchase using [[setnx:SET NX]], so a retry or a double click cannot " +
        "charge the customer twice or create two labels. Third, an account balance [[projection:projection]]: the " +
        "[[ledger:ledger]] in the database stays the source of truth, and Redis holds the pre-computed balance so reads are " +
        "fast. So one read cache, one concurrency guard, and one read model.",
    },
    note: {
      zh:
        "这是最该背熟的一段，因为后面大半追问都是从这里分叉出去的。用“三处”的结构讲，每处一句：什么模式 + 解决了什么问题，" +
        "最后用“一个读缓存、一个并发保护、一个读模型”收口，面试官一听就知道你分得清三者的本质区别，而不是笼统一句“我用 Redis 做缓存”。" +
        "诚实提醒：只讲你真正写过的那部分。如果某一处只是方案设计、没有落地，就直说“这块是设计，最后没上线”——" +
        "面试官几乎一定会挑其中一处往下追三四层。",
      en:
        "This is the answer to rehearse first, because most follow-up questions branch off it. Give the pattern and the " +
        "problem it solved for each place, then close with the one-line summary, so the interviewer hears three different " +
        "jobs instead of one vague cache. Be honest about scope: describe only the parts you built, and if one of the three " +
        "was a design you proposed rather than shipped, say so in the same sentence. The interviewer will pick one and go " +
        "three levels deeper, so only list the ones you can defend.",
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
        "Because each customer has different negotiated rates with the carriers. If the key contained only the package and " +
        "the route, I could return customer A's discounted price to customer B. That is a wrong quote and a leak of pricing " +
        "data at the same time. Putting the accountId in the key keeps every cached quote scoped to the account it was " +
        "computed for.",
      en:
        "Because each customer has different negotiated rates with the carriers. If the key contained only the package and " +
        "the route, I could return customer A's discounted price to customer B. That is a wrong quote and a leak of pricing " +
        "data at the same time. Putting the accountId in the key keeps every cached quote scoped to the account it was " +
        "computed for.",
    },
    note: {
      zh:
        "表面是 key 命名题，实际考的是多租户 / 数据隔离意识。采分点不是“key 要唯一”这条规则，而是说清后果：" +
        "少了 accountId，A 客户的协商折扣价会被返给 B 客户。再补一句“这不只是脏数据，是定价数据泄露”，这题就答满了。" +
        "只答“为了区分不同数据”是拿不到分的。",
      en:
        "This looks like a naming question, but the interviewer is testing whether you think about tenant isolation. Credit " +
        "comes from naming the consequence rather than the rule: without the accountId, one customer can be shown another " +
        "customer's negotiated price. Adding that this is a data leak, not only a stale value, raises the answer. The trap " +
        "is answering only that cache keys have to be unique.",
    },
  },
  {
    id: "apollo-vs-redis",
    category: "system",
    q: {
      zh: "Apollo Client cache vs Redis?（前端缓存和 Redis 有什么区别？）",
      en: "What is the difference between the Apollo Client cache and Redis?",
    },
    answer: {
      zh:
        "They cache at different layers. The Apollo Client cache lives in the browser, serves one user, and avoids " +
        "refetching the same GraphQL data in the frontend. Redis lives on the server, is shared by every user and every " +
        "server instance, and avoids repeating expensive backend work such as [[carrier:carrier]] API calls. So one is per " +
        "user and client-side, and the other is shared and server-side. They do not replace each other, and one request can " +
        "benefit from both.",
      en:
        "They cache at different layers. The Apollo Client cache lives in the browser, serves one user, and avoids " +
        "refetching the same GraphQL data in the frontend. Redis lives on the server, is shared by every user and every " +
        "server instance, and avoids repeating expensive backend work such as [[carrier:carrier]] API calls. So one is per " +
        "user and client-side, and the other is shared and server-side. They do not replace each other, and one request can " +
        "benefit from both.",
    },
    note: {
      zh:
        "沿三个对比轴回答：在哪一层（浏览器 vs 服务端）、服务谁（单用户 vs 跨用户跨实例）、省掉什么（前端重复请求 vs 后端重复调用）。" +
        "采分点在“共享”这一条：服务端缓存能让所有用户、所有实例受益，浏览器缓存做不到。" +
        "要避免的答法：把两者当成二选一——它们在不同层，通常同时存在。",
      en:
        "Answer along three axes: which layer, who it serves, and what work it saves. Credit comes from the shared part, " +
        "because a server cache helps every user and every instance while a browser cache cannot. The trap is treating them " +
        "as two options to choose between; they sit at different layers and are normally used together.",
    },
  },
  {
    id: "redis-down",
    category: "system",
    q: {
      zh: "What happens if Redis is unavailable?（Redis 不可用会怎样？）",
      en: "What happens if Redis is unavailable?",
    },
    answer: {
      zh:
        "It depends on the usage, because each one degrades differently. For the rate cache we skip Redis and call the " +
        "[[carrier:carrier]] APIs directly: slower, but still correct and available. For the balance we recompute from the " +
        "[[ledger:ledger]], which is the source of truth. Idempotency is the sensitive one, because a lost key could let a " +
        "duplicate charge through. So it is backed by a unique constraint in the database and by the order status, and " +
        "correctness never depends on a volatile key surviving.",
      en:
        "It depends on the usage, because each one degrades differently. For the rate cache we skip Redis and call the " +
        "[[carrier:carrier]] APIs directly: slower, but still correct and available. For the balance we recompute from the " +
        "[[ledger:ledger]], which is the source of truth. Idempotency is the sensitive one, because a lost key could let a " +
        "duplicate charge through. So it is backed by a unique constraint in the database and by the order status, and " +
        "correctness never depends on a volatile key surviving.",
    },
    note: {
      zh:
        "这题考降级设计，好答案不是一个答案，而是三个。按用法逐条讲：缓存降级成慢路径、投影从账本重算、幂等 key 必须有持久化兜底，" +
        "因为丢了它要花真钱。采分点就在第三条——它说明你分得清哪种失效只是变慢、哪种会造成损失。" +
        "要避免的答法：一句“回退到数据库就行”，那正好盖住了不能简单回退的那一处。",
      en:
        "This question is about graceful degradation, and the good answer is not one answer but three. Go usage by usage: " +
        "the cache degrades to a slow path, the projection is recomputed from the ledger, and the idempotency key needs a " +
        "durable backstop because losing it can cost real money. Credit comes from that third one, since it shows you know " +
        "which failure is expensive. The trap is a single sentence such as fall back to the database, which hides the case " +
        "where falling back is not safe.",
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
        "[[invalidation:Cache invalidation]] means stopping the cache from serving a value after the underlying data has " +
        "changed. The simplest form is: on a write, update the database and then delete the key, so the next read misses " +
        "and reloads from the source. In our system short TTLs do most of this work, so an entry cannot drift for long. It " +
        "is a hard problem because the failure is silent: nothing crashes, you simply return data that is out of date.",
      en:
        "[[invalidation:Cache invalidation]] means stopping the cache from serving a value after the underlying data has " +
        "changed. The simplest form is: on a write, update the database and then delete the key, so the next read misses " +
        "and reloads from the source. In our system short TTLs do most of this work, so an entry cannot drift for long. It " +
        "is a hard problem because the failure is silent: nothing crashes, you simply return data that is out of date.",
    },
    note: {
      zh:
        "面试官想听两件事：写操作之后你是删 key 而不是改 key；以及你知道这类 bug 为什么危险。采分点在“静默”二字——" +
        "失效 bug 不报错、监控看不见，最后是用户先发现的。收口用“我们靠短 TTL 兜底”，诚实又具体。" +
        "“计算机科学两大难题”那个梗提一次可以，但它不是答案。",
      en:
        "The interviewer wants to hear two things: that you delete the key on a write rather than rewrite it, and that you " +
        "know why this bug class is dangerous. Credit comes from the word silent, because an invalidation bug raises no " +
        "error and monitoring does not see it, so users find it first. Closing with the short TTL as your backstop is " +
        "honest and concrete. The old joke about two hard things in computer science can be mentioned once, but it is not " +
        "an answer.",
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
        "A [[stampede:cache stampede]] happens when many requests miss the same key at the same moment and all rebuild it " +
        "together. The usual cause is a popular key that has just expired: for a short moment the cache holds nothing, so " +
        "the full load reaches the database or the [[carrier:carrier]] API. The fixes are a lock or single flight, so one " +
        "request rebuilds while the others wait, request coalescing in the service layer, and refreshing the value shortly " +
        "before it expires instead of after. This is about one key. Many keys expiring at once is a different problem, an " +
        "avalanche, with a different fix.",
      en:
        "A [[stampede:cache stampede]] happens when many requests miss the same key at the same moment and all rebuild it " +
        "together. The usual cause is a popular key that has just expired: for a short moment the cache holds nothing, so " +
        "the full load reaches the database or the [[carrier:carrier]] API. The fixes are a lock or single flight, so one " +
        "request rebuilds while the others wait, request coalescing in the service layer, and refreshing the value shortly " +
        "before it expires instead of after. This is about one key. Many keys expiring at once is a different problem, an " +
        "avalanche, with a different fix.",
    },
    note: {
      zh:
        "面试官要的是机制，不是名词：同一个 key 上并发 miss 的瞬间峰值，恰好发生在缓存本该保护后端的时候。" +
        "采分点是给出一个真正能压住并发的解法（加锁 / single flight），因为只有它能把回源请求数封顶。" +
        "务必和雪崩分开——那是“很多 key 同时过期”。如果这些方案你没实际做过，就说你会选哪个、为什么，别说成做过。",
      en:
        "The interviewer wants the mechanism, not the label: a burst of concurrent misses on one key, at the exact moment " +
        "the cache was supposed to protect the source. Credit comes from naming a fix that limits concurrency, such as a " +
        "lock or single flight, because that is the one that caps how many requests reach the source. Keep it separate from " +
        "an avalanche, which is many keys expiring together. If you have not built one of these, say which one you would " +
        "choose and why, rather than implying you shipped it.",
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
        "You could, but it is the wrong tool for this data. Rate quotes are temporary, read very often, and meant to " +
        "expire, which is exactly the shape of a cache entry. In [[mysql:MySQL]] I would have to write my own expiry job, " +
        "and I would add read load and row churn to the database that the real data depends on. I would still not get " +
        "memory-speed reads. Redis provides the expiry and the fast reads directly, and keeps this short-lived traffic away " +
        "from the database.",
      en:
        "You could, but it is the wrong tool for this data. Rate quotes are temporary, read very often, and meant to " +
        "expire, which is exactly the shape of a cache entry. In [[mysql:MySQL]] I would have to write my own expiry job, " +
        "and I would add read load and row churn to the database that the real data depends on. I would still not get " +
        "memory-speed reads. Redis provides the expiry and the fast reads directly, and keeps this short-lived traffic away " +
        "from the database.",
    },
    note: {
      zh:
        "面试官考的是选型方法，所以从数据的形状答起：临时、高频读、本来就该过期。采分点是你替数据库省下的成本" +
        "（自己写过期逻辑、主库多出的读压力和行变更），而不是一句“Redis 快”。别去贬低 MySQL——重点是匹配，" +
        "同样的推理反过来会把需要持久化的账务数据留在 MySQL。",
      en:
        "The interviewer is checking how you choose a tool, so answer with the shape of the data: temporary, read-heavy, and " +
        "meant to expire. Credit comes from the cost you avoid on the database side, not from the claim that Redis is fast. " +
        "Do not argue that MySQL is bad. The point is fit, and the same reasoning keeps durable financial data in MySQL.",
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
        "I would scope the number carefully. It compares response time for the same package and the same route, before and " +
        "after caching, on repeated requests, which are the ones a cache can serve. It is not a claim that every request " +
        "became 40% faster, because the first, uncached request still pays the full cost. And if I did not have real " +
        "before-and-after measurements, I would not quote a p50 or p95 figure. I would rather take the number off my resume " +
        "than defend one I cannot support.",
      en:
        "I would scope the number carefully. It compares response time for the same package and the same route, before and " +
        "after caching, on repeated requests, which are the ones a cache can serve. It is not a claim that every request " +
        "became 40% faster, because the first, uncached request still pays the full cost. And if I did not have real " +
        "before-and-after measurements, I would not quote a p50 or p95 figure. I would rather take the number off my resume " +
        "than defend one I cannot support.",
    },
    note: {
      zh:
        "这一题决定面试官还信不信你简历上的其他内容。先把口径说全：同包裹、同路线、能命中缓存的重复请求、开缓存前后对比。" +
        "如果你根本没测过，就直说“这个我没有实际测量过，是粗略对比出来的印象”，然后讲你现在会怎么测——" +
        "这句实话比任何数字都稳。绝对不要临场编 p50 / p95：下一句追问一定是“怎么测的、样本多大”，编的数字撑不过两轮。" +
        "如果这个 40% 你撑不住，面试前就把它从简历上删掉。",
      en:
        "This question decides whether the interviewer trusts the rest of your resume. Say the scope out loud first: same " +
        "package, same route, repeated requests only, measured before and after the cache. If you never measured it, say so " +
        "in plain words — I did not measure that, it was a rough comparison — and then say how you would measure it now. " +
        "Never invent a p50 or p95 under pressure, because the next question is how you measured it and with what sample " +
        "size, and an invented number does not survive two follow-ups. If you cannot support the 40%, take it off the " +
        "resume before the interview.",
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
        "Redis has two persistence options. RDB writes a point-in-time snapshot of the dataset: the file is compact and " +
        "restart is fast, but a crash between two snapshots loses everything written since the last one. AOF appends every " +
        "write command to a log, and appendfsync decides how often that log is flushed to disk. The default, everysec, can " +
        "lose about one second of writes, and the file is larger and slower to replay. Many teams run AOF with everysec, or " +
        "both mechanisms together. Either way this is crash recovery, not a durability guarantee — the database is still " +
        "the [[sourceoftruth:source of truth]].",
      en:
        "Redis has two persistence options. RDB writes a point-in-time snapshot of the dataset: the file is compact and " +
        "restart is fast, but a crash between two snapshots loses everything written since the last one. AOF appends every " +
        "write command to a log, and appendfsync decides how often that log is flushed to disk. The default, everysec, can " +
        "lose about one second of writes, and the file is larger and slower to replay. Many teams run AOF with everysec, or " +
        "both mechanisms together. Either way this is crash recovery, not a durability guarantee — the database is still " +
        "the [[sourceoftruth:source of truth]].",
    },
    note: {
      zh:
        "先把两种机制分清：RDB 是快照，AOF 是写命令日志。采分点是把“会丢多少”说出来——RDB 丢到上一次快照为止，" +
        "AOF 在 everysec 下大约丢 1 秒。再提一句生产上常见的是 AOF everysec 或两者混用，说明你见过真实配置。" +
        "别说“AOF 一定比 RDB 好”，那是权衡；也别因为有持久化就说 Redis 可以当持久化主库。",
      en:
        "Keep the two mechanisms apart: RDB is a snapshot, AOF is a log of write commands. Credit comes from stating the " +
        "loss window for each one: back to the last snapshot for RDB, about one second for AOF with everysec. Adding that " +
        "production setups often run AOF everysec, or both, shows you have seen a real configuration. Do not say AOF is " +
        "simply better, and do not let persistence turn into a claim that Redis is a durable primary database.",
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
        "Redis combines two strategies. Lazy expiration: when a key is accessed, Redis checks the [[ttl:TTL]] and, if the " +
        "key has expired, it is removed and not returned. Lazy expiration alone would hold memory for keys that nobody " +
        "reads again, so there is also active expiration: a background job repeatedly samples keys that carry a TTL and " +
        "removes the expired ones. So the guarantee is that an expired key is never returned, not that it is deleted at the " +
        "exact second it expires. Redis avoids a timer per key on purpose, because millions of timers would cost more than " +
        "sampling.",
      en:
        "Redis combines two strategies. Lazy expiration: when a key is accessed, Redis checks the [[ttl:TTL]] and, if the " +
        "key has expired, it is removed and not returned. Lazy expiration alone would hold memory for keys that nobody " +
        "reads again, so there is also active expiration: a background job repeatedly samples keys that carry a TTL and " +
        "removes the expired ones. So the guarantee is that an expired key is never returned, not that it is deleted at the " +
        "exact second it expires. Redis avoids a timer per key on purpose, because millions of timers would cost more than " +
        "sampling.",
    },
    note: {
      zh:
        "面试官要听两半机制——惰性 + 定期采样——以及它们背后的那条保证。采分点是把保证说准：过期的 key 不会被返回，" +
        "内存是稍后才回收的。再解释“为什么不给每个 key 挂定时器”（记账成本高于采样），这是设计层面的加分。" +
        "要避免的说法：到点即删——采样式的设计并没有做这个承诺。",
      en:
        "The interviewer is listening for both halves, lazy and active, and for the guarantee behind them. Credit comes from " +
        "the precise claim: an expired key is not returned, and the memory is reclaimed later. Explaining why there is no " +
        "timer per key, because the bookkeeping would cost more than sampling, is the design-level point. The trap is " +
        "saying keys are deleted the moment they expire, which the sampling design does not promise.",
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
        "Eviction only starts when Redis reaches the maxmemory limit, and maxmemory-policy decides what happens then. The " +
        "default is noeviction: reads keep working and writes return an error. The allkeys-lru and allkeys-lfu policies can " +
        "evict any key, while the volatile policies only evict keys that carry a [[ttl:TTL]]. LRU drops what has not been " +
        "used recently; LFU drops what is used least often, so a one-off scan of cold data pushes less useful data out. " +
        "Both are approximate: Redis samples a small number of keys and evicts the best candidate instead of keeping an " +
        "exact ordering. For a pure cache I would use allkeys-lru or allkeys-lfu.",
      en:
        "Eviction only starts when Redis reaches the maxmemory limit, and maxmemory-policy decides what happens then. The " +
        "default is noeviction: reads keep working and writes return an error. The allkeys-lru and allkeys-lfu policies can " +
        "evict any key, while the volatile policies only evict keys that carry a [[ttl:TTL]]. LRU drops what has not been " +
        "used recently; LFU drops what is used least often, so a one-off scan of cold data pushes less useful data out. " +
        "Both are approximate: Redis samples a small number of keys and evicts the best candidate instead of keeping an " +
        "exact ordering. For a pure cache I would use allkeys-lru or allkeys-lfu.",
    },
    note: {
      zh:
        "先说触发条件，因为淘汰和过期最容易被混在一起：淘汰发生在到达 maxmemory 时，过期是每个 key 按自己的 TTL 走。" +
        "采分点是两组对比：allkeys 与 volatile、LRU 与 LFU。补一句“Redis 的 LRU/LFU 是采样近似、不是精确排序”，" +
        "能把你和只看过博客的候选人区分开。要避免的答法：内存满了就删旧数据——这跳过了策略这一层。",
      en:
        "Start with the trigger, because eviction and expiry get mixed up: eviction happens at maxmemory, while expiry " +
        "happens key by key from its own TTL. Credit comes from two contrasts, allkeys versus volatile and LRU versus LFU. " +
        "The detail that both are sampled approximations rather than exact orderings separates you from a candidate who " +
        "read one blog post. The trap is answering that Redis deletes old data when memory is full, which skips the policy " +
        "entirely.",
    },
  },
  {
    id: "replication-sentinel-cluster",
    category: "advanced",
    q: {
      zh: "Replication vs Sentinel vs Cluster?（主从、哨兵、集群的区别？）",
      en: "What is the difference between replication, Sentinel, and Cluster?",
    },
    answer: {
      zh:
        "They solve three different problems. Replication copies a primary to one or more replicas, which gives read " +
        "capacity and a standby copy, but replication is asynchronous, so a replica can return slightly stale data. " +
        "Sentinel adds availability: it watches the primary and promotes a replica automatically when the primary fails. " +
        "Cluster adds horizontal scale: the keyspace is sharded across 16384 hash slots spread over several primaries. The " +
        "short version is that Sentinel is failover without sharding, and Cluster is sharding with failover. In both cases " +
        "a failover can lose recent writes, because the promoted replica may not have received them yet.",
      en:
        "They solve three different problems. Replication copies a primary to one or more replicas, which gives read " +
        "capacity and a standby copy, but replication is asynchronous, so a replica can return slightly stale data. " +
        "Sentinel adds availability: it watches the primary and promotes a replica automatically when the primary fails. " +
        "Cluster adds horizontal scale: the keyspace is sharded across 16384 hash slots spread over several primaries. The " +
        "short version is that Sentinel is failover without sharding, and Cluster is sharding with failover. In both cases " +
        "a failover can lose recent writes, because the promoted replica may not have received them yet.",
    },
    note: {
      zh:
        "面试官想确认你知道三者各自解决什么问题，所以开口就点出：读扩展、可用性、横向扩容。" +
        "采分句就是那句对比——哨兵是不分片的故障转移，集群是带故障转移的分片。" +
        "再加一句“复制是异步的，所以故障转移可能丢掉已确认的写”，这题就从背诵变成了工程判断。" +
        "要避免的说法：把集群讲成哨兵的升级版——它们回答的是不同问题。",
      en:
        "The interviewer is checking whether you know which problem each one solves, so lead with read capacity, " +
        "availability, and scale. The line that earns the credit is the contrast: Sentinel is failover without sharding, " +
        "Cluster is sharding with failover. Adding that replication is asynchronous, so a failover can lose already " +
        "acknowledged writes, turns a memorized comparison into an engineering answer. The trap is presenting Cluster as an " +
        "upgraded Sentinel; they answer different questions.",
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
        "Yes, but not in the SQL sense. MULTI queues the commands and EXEC runs them in order, with no other client's " +
        "command in between. There is no rollback: if one command fails at runtime, the commands around it still take " +
        "effect. WATCH gives you optimistic concurrency control rather than a lock — if a watched key changed before EXEC, " +
        "EXEC returns nil, nothing runs, and your code retries. When several steps really have to be one unit, I use a Lua " +
        "script, which Redis runs [[atomic:atomically]] as a single unit.",
      en:
        "Yes, but not in the SQL sense. MULTI queues the commands and EXEC runs them in order, with no other client's " +
        "command in between. There is no rollback: if one command fails at runtime, the commands around it still take " +
        "effect. WATCH gives you optimistic concurrency control rather than a lock — if a watched key changed before EXEC, " +
        "EXEC returns nil, nothing runs, and your code retries. When several steps really have to be one unit, I use a Lua " +
        "script, which Redis runs [[atomic:atomically]] as a single unit.",
    },
    note: {
      zh:
        "先承认“有事务”，然后立刻修正这个词带来的预期。采分点是两句精确的话：MULTI/EXEC 只保证顺序执行、不被打断，没有回滚；" +
        "WATCH 是乐观并发控制，所以你的代码必须处理 EXEC 返回 nil 并重试。真正多步的原子逻辑用 Lua 脚本，这是这题里最有分量的一句。" +
        "绝对不要说“Redis 事务可以回滚”——这一句会把前面答对的都抵消掉。",
      en:
        "Confirm that transactions exist, then correct the expectation the word creates. Credit comes from two precise " +
        "statements: MULTI and EXEC give ordering and isolation but no rollback, and WATCH is optimistic concurrency, so " +
        "your code has to handle a nil reply and retry. Naming Lua as the tool for logic that is genuinely multi-step is " +
        "the strongest part of the answer. Never say a Redis transaction can be rolled back; that one sentence undoes the " +
        "rest.",
    },
  },
  {
    id: "pipeline-vs-transaction",
    category: "advanced",
    q: {
      zh: "Pipeline vs transaction?（Pipeline 和事务有什么区别？）",
      en: "What is the difference between a pipeline and a transaction?",
    },
    answer: {
      zh:
        "They are often confused, but they solve different problems. A pipeline is a network optimization: you send many " +
        "commands without waiting for each reply, then read the replies together, which removes most of the round trips. A " +
        "pipeline gives no [[atomic:atomicity]] — another client's commands can still run between yours. A transaction, " +
        "MULTI and EXEC, guarantees that the queued commands run in order with nothing in between. So a pipeline is about " +
        "round trips and a transaction is about ordering, and you can send a MULTI and EXEC block inside a pipeline.",
      en:
        "They are often confused, but they solve different problems. A pipeline is a network optimization: you send many " +
        "commands without waiting for each reply, then read the replies together, which removes most of the round trips. A " +
        "pipeline gives no [[atomic:atomicity]] — another client's commands can still run between yours. A transaction, " +
        "MULTI and EXEC, guarantees that the queued commands run in order with nothing in between. So a pipeline is about " +
        "round trips and a transaction is about ordering, and you can send a MULTI and EXEC block inside a pipeline.",
    },
    note: {
      zh:
        "面试官在验证一个很具体的误解：以为“打包发送”就等于原子。所以要明说 pipeline 只省网络往返，中间仍可能被别的客户端插入命令。" +
        "采分点是把这组对照压成一句：一个解决往返次数，一个解决顺序与隔离。再补一句“事务可以放进 pipeline 一起发”，" +
        "说明你两样都用过，而不只是读过。",
      en:
        "The interviewer is checking one specific misconception: that batching makes commands atomic. Say plainly that a " +
        "pipeline only removes round trips and that another client can still run commands in between. Credit comes from " +
        "compressing the contrast into one line: round trips versus ordering. Adding that a transaction can be sent inside " +
        "a pipeline shows you have used both rather than read about them.",
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
        "The basic pattern is [[setnx:SET key <random-value> NX PX <ttl>]]. NX means the write only succeeds if the key does " +
        "not exist, so exactly one client acquires the lock, and PX sets the timeout. Two details matter. To release, do not " +
        "call DEL directly: run a small Lua script that checks the stored value is yours and deletes it in the same step, " +
        "otherwise you can delete a lock that another client acquired after your TTL expired. And a lock on a single Redis " +
        "instance is not safe across a failover, because replication is asynchronous and a promoted replica may never have " +
        "received the lock. If correctness has to be absolute, I would use a system built for consensus instead.",
      en:
        "The basic pattern is [[setnx:SET key <random-value> NX PX <ttl>]]. NX means the write only succeeds if the key does " +
        "not exist, so exactly one client acquires the lock, and PX sets the timeout. Two details matter. To release, do not " +
        "call DEL directly: run a small Lua script that checks the stored value is yours and deletes it in the same step, " +
        "otherwise you can delete a lock that another client acquired after your TTL expired. And a lock on a single Redis " +
        "instance is not safe across a failover, because replication is asynchronous and a promoted replica may never have " +
        "received the lock. If correctness has to be absolute, I would use a system built for consensus instead.",
    },
    note: {
      zh:
        "三层都答到才算满分：加锁用一条同时“检查并设置”的命令；释放用 Lua 校验 value 再删（否则会删掉别人刚拿到的锁）；" +
        "TTL 防止客户端崩溃后锁永远不释放，业务可能超时就再提一句看门狗续期。面试官真正在听的是边界那句——" +
        "单实例锁在故障转移时可能丢失，因为复制是异步的。被问到多主时可以提 Redlock，但要说清它仍有争议" +
        "（Kleppmann 关于时钟漂移和进程停顿的质疑是标准参考），别说成“用 Redlock 就解决了”。",
      en:
        "Three layers earn credit: acquire with one command that both checks and sets, release with a compare-and-delete Lua " +
        "script, and a TTL so a crashed client cannot hold the lock forever. If the work can outlive the TTL, mention a " +
        "watchdog that renews it. What the interviewer is really listening for is the limit: a single-instance lock can be " +
        "lost during a failover, because replication is asynchronous. Redlock is worth naming if they ask about multiple " +
        "primaries, but present it as debated rather than as a fix — Kleppmann's critique about clock drift and process " +
        "pauses is the standard reference.",
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
        "Penetration is when requests ask for data that does not exist anywhere. The cache misses every time because there " +
        "is nothing to store, so every request reaches the database and the cache gives no protection at all. It can also " +
        "be abused, by sending random ids that will never exist. The fixes are to cache the empty result with a short " +
        "[[ttl:TTL]], to put a Bloom filter in front so ids that certainly do not exist are rejected early, and to validate " +
        "the id format before any lookup.",
      en:
        "Penetration is when requests ask for data that does not exist anywhere. The cache misses every time because there " +
        "is nothing to store, so every request reaches the database and the cache gives no protection at all. It can also " +
        "be abused, by sending random ids that will never exist. The fixes are to cache the empty result with a short " +
        "[[ttl:TTL]], to put a Bloom filter in front so ids that certainly do not exist are rejected early, and to validate " +
        "the id format before any lookup.",
    },
    note: {
      zh:
        "面试官在这一组题里考的是你能不能把三种缓存故障分清，所以要按成因定义：数据根本不存在，所以任何缓存都不可能装得下它。" +
        "采分点是“缓存空值 + 短 TTL”，这是最多人漏掉的一条。再补一句布隆过滤器“能确定不存在，不能确定存在”，细节分就拿到了。" +
        "别和热点 key 过期（击穿）混在一起。",
      en:
        "The interviewer is checking whether you can separate the three cache failures, so define this one by its cause: the " +
        "data does not exist, so no cache can ever hold it. Credit comes from caching the empty result with a short TTL, " +
        "the fix most candidates forget. Mentioning that a Bloom filter can say no for certain but not yes for certain is a " +
        "good extra detail. Do not mix this with a hot key expiring, which is breakdown.",
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
        "Breakdown is about one key that exists and is very popular. When that key expires, the requests that were being " +
        "served from cache all miss within the same moment and reach the database together. The fixes are a mutex or single " +
        "flight so one request rebuilds while the others wait, logical expiry where you keep serving the old value and " +
        "rebuild in the background, or never expiring the hottest keys and refreshing them on a schedule.",
      en:
        "Breakdown is about one key that exists and is very popular. When that key expires, the requests that were being " +
        "served from cache all miss within the same moment and reach the database together. The fixes are a mutex or single " +
        "flight so one request rebuilds while the others wait, logical expiry where you keep serving the old value and " +
        "rebuild in the background, or never expiring the hottest keys and refreshing them on a schedule.",
    },
    note: {
      zh:
        "用两个条件来定义它，面试官听的就是这两个：key 存在，而且很热。采分点是给出能限制重建并发的解法，所以先说互斥锁 / single flight。" +
        "如果对方追问延迟，就给逻辑过期——它让所有请求都不用等重建。要避免的答法：讲成“很多 key 同时过期”，那是雪崩。",
      en:
        "Define it by the two conditions the interviewer is listening for: the key exists, and it is hot. Credit comes from " +
        "a fix that limits how many requests rebuild the value, so name the mutex or single-flight version first. Logical " +
        "expiry is the answer if they push on latency, because then no request waits for the rebuild. The trap is " +
        "describing many keys expiring together, which is avalanche.",
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
        "An avalanche is the large-scale version: a large number of keys expire at nearly the same time, or the Redis node " +
        "itself fails, so a big share of the traffic reaches the database at once. The classic cause is filling the cache in " +
        "one batch with an identical [[ttl:TTL]]. The fixes are random jitter on the TTLs so keys expire at different " +
        "times, a second cache layer, rate limiting and circuit breakers so the database is never asked for more than it " +
        "can serve, and a replicated Redis setup so one node is not a single point of failure.",
      en:
        "An avalanche is the large-scale version: a large number of keys expire at nearly the same time, or the Redis node " +
        "itself fails, so a big share of the traffic reaches the database at once. The classic cause is filling the cache in " +
        "one batch with an identical [[ttl:TTL]]. The fixes are random jitter on the TTLs so keys expire at different " +
        "times, a second cache layer, rate limiting and circuit breakers so the database is never asked for more than it " +
        "can serve, and a replicated Redis setup so one node is not a single point of failure.",
    },
    note: {
      zh:
        "区别全在规模，所以开口就把数量说出来：很多 key，或者整个缓存。采分点先是那个你能预防的成因——一批 key 用同一个 TTL 灌进去，" +
        "然后是对应的解法 TTL 加随机抖动。再补一条限流 / 熔断，说明你也为“预防失败之后”做了准备。" +
        "如果穿透、击穿、雪崩你能用三句话分别讲清，这一组题就结束了。",
      en:
        "Scale is the whole distinction, so say the number out loud: many keys, or the whole cache. Credit comes first from " +
        "the cause you can prevent, a batch of keys written with the same TTL, and then from jitter as the direct fix. " +
        "Adding a limit on how much traffic reaches the database shows you also plan for the case where prevention fails. " +
        "If you can explain penetration, breakdown, and avalanche in three separate sentences, this group of questions is " +
        "finished.",
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
        "Once you add a cache you cannot have strong consistency, so the goal is a short window of staleness. Under " +
        "[[cacheaside:cache-aside]] the rule is: write the database first, then delete the cache key. Delete rather than " +
        "update, because two concurrent writers can otherwise leave the older value in the cache. A race still remains: a " +
        "reader that loaded the old value before the write can put it back after the delete. A delayed double delete makes " +
        "that window smaller but does not close it, and a short [[ttl:TTL]] limits how long any stale value can survive. If " +
        "the data cannot tolerate that window at all, the honest answer is not to cache it.",
      en:
        "Once you add a cache you cannot have strong consistency, so the goal is a short window of staleness. Under " +
        "[[cacheaside:cache-aside]] the rule is: write the database first, then delete the cache key. Delete rather than " +
        "update, because two concurrent writers can otherwise leave the older value in the cache. A race still remains: a " +
        "reader that loaded the old value before the write can put it back after the delete. A delayed double delete makes " +
        "that window smaller but does not close it, and a short [[ttl:TTL]] limits how long any stale value can survive. If " +
        "the data cannot tolerate that window at all, the honest answer is not to cache it.",
    },
    note: {
      zh:
        "这一题考的是你会不会说过头。永远别说“缓存和数据库是一致的”，要描述那个不一致的窗口有多大、能持续多久。" +
        "采分点有两个：先写库再删缓存，以及“为什么是删不是改”（并发写会把旧值留在缓存里）。" +
        "然后主动承认剩下的竞态——慢读请求可能在删除之后把旧值写回；延迟双删只是把窗口缩小，没有关掉它。" +
        "如果对方还想更强，就提订阅数据库变更日志（例如用 Canal 读 MySQL binlog）异步失效，加短 TTL 兜底。" +
        "声称自己“做到了强一致”的候选人，会被追问得最狠。",
      en:
        "This question is about whether you will overclaim. Never say the cache and the database are consistent; describe " +
        "the window in which they disagree and how long it lasts. Credit comes from two things: write the database first " +
        "and delete the key, and the reason delete beats update. Then admit the race that remains, because a slow reader can " +
        "write the old value back after the delete and a delayed double delete only narrows that window. If they want more, " +
        "mention invalidating from the database change log, for example a tool such as Canal reading the MySQL binlog, with " +
        "a short TTL as a backstop.",
    },
  },
  {
    id: "singlethread-multithread",
    category: "advanced",
    q: {
      zh: "Redis is single-threaded — so why is 6.0 multithreaded?（单线程为什么还快？6.0 的多线程是什么？）",
      en: "If Redis is single-threaded, why is it fast — and what did 6.0 multithreading change?",
    },
    answer: {
      zh:
        "Redis executes commands one at a time on a [[singlethread:single thread]]. That is a design choice: with one " +
        "thread there are no locks and no context switching between commands, and because the data is in memory each " +
        "command finishes quickly. Redis 6 added extra threads, but only for network I/O — reading and writing sockets and " +
        "parsing the protocol. Command execution is still serialized on one thread, which is why every command is still " +
        "[[atomic:atomic]] and why data operations still need no locking. So the accurate sentence is that command " +
        "execution is single-threaded, not that Redis is single-threaded.",
      en:
        "Redis executes commands one at a time on a [[singlethread:single thread]]. That is a design choice: with one " +
        "thread there are no locks and no context switching between commands, and because the data is in memory each " +
        "command finishes quickly. Redis 6 added extra threads, but only for network I/O — reading and writing sockets and " +
        "parsing the protocol. Command execution is still serialized on one thread, which is why every command is still " +
        "[[atomic:atomic]] and why data operations still need no locking. So the accurate sentence is that command " +
        "execution is single-threaded, not that Redis is single-threaded.",
    },
    note: {
      zh:
        "题目本身就带着陷阱：对 Redis 6 之后的版本来说，“单线程”这个说法已经不准确了。采分点是把两层分开——" +
        "I/O 线程负责收发和解析，执行仍然只有一条线程。要把“单执行线程”讲成一种收益（免加锁、免上下文切换），" +
        "而不是一个还没修好的缺陷。反方向的坑同样要避开：别说 Redis 6 开始并行执行命令了，它没有。",
      en:
        "The question contains its own trap, because for Redis 6 and later the phrase single-threaded is not accurate. " +
        "Credit comes from separating the two layers: I/O threads read and parse, one thread executes. Present the single " +
        "execution thread as a benefit, no locks and no context switching, rather than a limitation nobody has fixed yet. " +
        "The opposite trap matters too: do not say Redis 6 runs commands in parallel, because it does not.",
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
        "[[redis:Redis]] 是加速层，不是[[sourceoftruth:真相来源]]；它随时可能不可用，所以每处用法都要能降级，或从原始来源重算。",
      en:
        "[[redis:Redis]] is a speed layer, not the [[sourceoftruth:source of truth]]. It can become unavailable at any " +
        "time, so every usage needs a fallback or a way to recompute from the original source.",
    },
    {
      zh:
        "[[cacheaside:cache-aside]] 四拍：查缓存 →（命中）直接返回 /（未命中）取原始来源 → 写回并设 [[ttl:TTL]]。",
      en:
        "[[cacheaside:Cache-aside]] in four beats: check the cache → (hit) return it / (miss) read the source → write it " +
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
        "The honesty rule: every word on your resume has to survive follow-up questions. Do not claim work you did not do, " +
        "and do not invent numbers, such as that 40%, that you never measured.",
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
      label: { zh: "③ 未命中？取原始来源", en: "③ Miss? read source" },
      sub: { zh: "DB / carrier API", en: "DB / carrier API" },
    },
    {
      label: { zh: "④ 写回 + 设 TTL", en: "④ Write back + TTL" },
      sub: { zh: "SET key … EX", en: "SET key … EX" },
    },
  ] as FlowStep[],
};
