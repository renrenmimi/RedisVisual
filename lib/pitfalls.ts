// 新站「缓存的坑与一致性」(/pitfalls) 的全部双语文案数据。
// 目标：把缓存三大问题（穿透 / 击穿 / 雪崩）+ 数据库-缓存一致性 + 热点/大 key
//   讲到 junior 彻底懂、且能扛住面试深挖。
// 形态：5 个 tab，每个 = 一段「症状」讲解 + 一张纯 CSS 动画 + 「怎么解」列表 + 「面试深挖」手风琴。
// 画面（动画 JSX）在 app/pitfalls/page.tsx 里按 pitfall.id 对应，做到数据 / 页面分离。
// 约定：正文里用反引号 `CMD` 标命令（页面渲成 mono），[[key:字]] 标术语（RichText 弹层）。

import type { L } from "@/lib/i18n";

// 一条解法：一个短标签（mono chip）+ 一段说明；tone 决定 chip 配色。
export type Solution = {
  tag: L;
  text: L;
  tone?: "accent" | "teal" | "amber";
};

// 面试深挖：追问 + 该怎么答（都用 RichText 渲染）。
export type Probe = { q: L; a: L };

export type Pitfall = {
  id: "penetration" | "breakdown" | "avalanche" | "consistency" | "hotbig";
  tab: L; // tab 上的短名（穿透 / 击穿 …）
  name: L; // 全名
  term: L; // 英文术语（mono 小字）
  symptomTitle: L;
  symptom: L; // 症状正文（RichText + `code`）
  caption: L; // 动画舞台底部字幕
  solutions: Solution[];
  deep: Probe[];
};

// ---------- 页头 + 通用小文案 ----------

export const meta = {
  title: { zh: "第 4 站 · 缓存的坑与一致性", en: "Stop 4 · Cache Pitfalls & Consistency" },
  subtitle: {
    zh: "缓存为什么快？因为多存了一份数据。这一份副本什么时候会骗你、突然失灵时会发生什么、又该怎么防。",
    en: "A cache is fast because it keeps a second copy of your data. Here's when that copy lies to you, what happens when it suddenly fails, and how to defend against both.",
  },
  sectionSymptom: { zh: "症状", en: "Symptom" },
  sectionFix: { zh: "怎么解", en: "How to fix" },
  sectionDeep: { zh: "面试深挖", en: "Interview deep-dive" },
  deepHint: { zh: "点开看每个追问该怎么答", en: "Open each follow-up to see how to answer" },
  replay: { zh: "↻ 重播动画", en: "↻ Replay" },
  problemTab: { zh: "看问题：读到旧值", en: "The bug: stale read" },
  fixTab: { zh: "看解法：延迟双删", en: "The fix: delayed double delete" },
  prev: { zh: "← 上一站", en: "← Previous" },
  next: { zh: "下一站：生产机制 →", en: "Next: Under the Hood →" },
};

// ---------- 开场讲解 ----------

export const intro = {
  kicker: {
    zh: "缓存三大问题 · 穿透 / 击穿 / 雪崩 · + 双写一致性",
    en: "The three classic cache problems · penetration / breakdown / avalanche · + read-write consistency",
  },
  title: {
    zh: "加了缓存，就多了一份要操心的数据",
    en: "Add a cache, and you've added a second copy to worry about",
  },
  text: {
    zh:
      "缓存能把一次慢查询变成一次内存读取，代价是：[[mysql:数据库]]之外多了一份副本。" +
      "这份副本可能压根建不起来（[[cache:缓存]]永远未命中）、可能在过期的一瞬被并发挤爆、可能整批一起消失、也可能和数据库悄悄对不上。" +
      "这四类问题——穿透、击穿、雪崩、双写一致性——几乎是每场后端面试问 Redis 的必考点，也是线上最容易出问题的地方。" +
      "逐个 tab 看动画，把每种坑长什么样、怎么防讲清楚。",
    en:
      "A cache turns a slow query into one memory read — the price is a second copy living outside the [[mysql:database]]. " +
      "That copy might never build ([[cache:cache]] always misses), might get crushed the instant it expires, might vanish all at once, or might quietly drift out of sync with the database. " +
      "These four problems — penetration, breakdown, avalanche, and read-write consistency — are near-guaranteed in any backend interview that touches Redis, and the easiest place to have a production incident. " +
      "Walk the tabs to see what each pitfall looks like and how to defend against it.",
  },
};

// ---------- 5 个坑 ----------

export const pitfalls: Pitfall[] = [
  // ============ Tab 1 · 缓存穿透 ============
  {
    id: "penetration",
    tab: { zh: "穿透", en: "Penetration" },
    name: { zh: "缓存穿透", en: "Cache penetration" },
    term: { zh: "cache penetration · 查不存在的数据", en: "cache penetration · querying data that doesn't exist" },
    symptomTitle: { zh: "查一个根本不存在的数据，缓存永远拦不住", en: "Querying data that doesn't exist — the cache can never stop it" },
    symptom: {
      zh:
        "有人反复查一个**根本不存在**的数据，比如一个不存在的用户 id。缓存里没有（[[cachemiss:未命中]]），于是回源查[[mysql:数据库]]——数据库里也没有，查不出东西来写回缓存。" +
        "结果就是：这类请求每一次都穿过缓存、直达数据库，缓存形同虚设。" +
        "正常业务里很少见，但被人**恶意用海量不存在的 key 反复请求**时，缓存彻底失灵，所有请求直接穿透到数据库。",
      en:
        "Someone repeatedly queries data that **doesn't exist** — say a user id that was never created. The cache doesn't have it (a [[cachemiss:miss]]), so it falls back to the [[mysql:database]] — which also doesn't have it, so there's nothing to write back into the cache. " +
        "The result: every one of these requests passes straight through the cache to the database, as if the cache weren't there. " +
        "Rare in normal traffic, but when someone **maliciously floods you with countless non-existent keys**, the cache is useless and the database takes the full beating.",
    },
    caption: { zh: "假 id 一路穿过空缓存，反复砸向数据库。", en: "Fake ids pass straight through the empty cache and hammer the database." },
    solutions: [
      {
        tag: { zh: "缓存空值", en: "Cache the empty result" },
        tone: "teal",
        text: {
          zh: "即使数据库查不到，也把一个**空标记**写进缓存（如空字符串 / 特殊占位），设一个**短 [[ttl:TTL]]**。下次同样的 key 直接命中空标记，不再打库。",
          en: "Even when the database returns nothing, write an **empty marker** into the cache (an empty string / sentinel) with a **short [[ttl:TTL]]**. Next time the same key hits the marker instead of the database.",
        },
      },
      {
        tag: { zh: "布隆过滤器", en: "Bloom filter" },
        tone: "accent",
        text: {
          zh: "把所有**真实存在的 key** 预先放进**布隆过滤器**（Bloom filter）。请求先问它：它说“不存在”就一定不存在，直接拒绝，连缓存和数据库都不碰。",
          en: "Pre-load every **key that really exists** into a Bloom filter. A request asks it first: if it says “not present”, the key definitely doesn't exist — reject it without touching the cache or the database.",
        },
      },
      {
        tag: { zh: "入口校验 + 鉴权", en: "Validate + authenticate" },
        text: {
          zh: "在接口层就挡掉明显非法的参数（越界 id、错误格式），并加鉴权、限流，压住恶意刷不存在 key 的流量。",
          en: "Reject obviously invalid params (out-of-range ids, malformed input) at the API edge, and add auth + rate limiting to throttle floods of bogus keys.",
        },
      },
    ],
    deep: [
      {
        q: { zh: "缓存空值有什么缺点？", en: "What's the downside of caching empty values?" },
        a: {
          zh:
            "两点。一是**占内存**：一堆没意义的空值也要存。二是**挡不住变化的假 key**：攻击者可以用海量*各不相同*的不存在 key，每个都得先打一次库才缓存出一个空值，缓存反而被这些垃圾塞满。" +
            "所以空值缓存更适合“少量固定的不存在 key”，面对恶意攻击要配合**布隆过滤器**，并把空值的 TTL 设得很短。",
          en:
            "Two things. First, **memory**: you're storing lots of meaningless empty markers. Second, **it doesn't stop varying fake keys**: an attacker can use countless *distinct* non-existent keys, each of which still hits the database once before an empty value is cached — filling the cache with garbage. " +
            "So empty-value caching suits “a small, fixed set of missing keys”; against real attacks pair it with a **Bloom filter** and keep the empty-value TTL very short.",
        },
      },
      {
        q: { zh: "布隆过滤器为什么能省，可靠吗？", en: "Why is a Bloom filter cheap, and is it reliable?" },
        a: {
          zh:
            "它用一个位数组 + 几个哈希函数，空间极省、判断极快。关键性质是**单向可靠**：它可能把“其实不存在”的 key 误判成“可能存在”（极小误判率），但**绝不会**把“存在”的 key 说成“不存在”。" +
            "也就是“**说不存在就一定不存在，说存在只是可能存在**”。所以它能 100% 拦住穿透（真不存在的一定被挡），代价只是偶尔放行个别假 key 到后端，无伤大雅。" +
            "缺点：标准布隆过滤器元素只增不减、不好删（要用 counting bloom 或定期重建）。",
          en:
            "It's a bit array plus a few hash functions — tiny and fast. The key property is **one-sided reliability**: it may mislabel a truly-absent key as “maybe present” (a small false-positive rate), but it will **never** call a present key “absent”. " +
            "So “**not present means definitely not present; present only means maybe**”. That lets it block penetration 100% (truly-missing keys are always stopped); the only cost is occasionally letting a stray fake key through to the backend — harmless. " +
            "Downside: a standard Bloom filter is add-only and hard to delete from (use a counting Bloom filter or periodically rebuild it).",
        },
      },
      {
        q: { zh: "缓存了空值，之后这条数据真被创建了怎么办？", en: "After caching an empty value, what if that record actually gets created?" },
        a: {
          zh:
            "写入这条数据时，要**主动删除/更新**那个空值缓存，否则读还会一直命中“不存在”的旧标记，新数据读不出来。这也是为什么空值的 TTL 要短——即使漏删了，也能很快自愈。",
          en:
            "When you insert the record, **proactively delete/update** the empty-value cache, or reads will keep hitting the stale “absent” marker and never see the new data. This is also why the empty-value TTL should be short — even a missed invalidation self-heals quickly.",
        },
      },
    ],
  },

  // ============ Tab 2 · 缓存击穿 ============
  {
    id: "breakdown",
    tab: { zh: "击穿", en: "Breakdown" },
    name: { zh: "缓存击穿（热点 key 过期）", en: "Hot-key breakdown" },
    term: { zh: "hot key breakdown · a.k.a. cache stampede", en: "hot key breakdown · a.k.a. cache stampede" },
    symptomTitle: { zh: "一个热点 key 过期的那一瞬，所有请求一起涌向数据库", en: "The instant one hot key expires, every request rushes the database at once" },
    symptom: {
      zh:
        "某个 key **又存在、又特别热**（大量请求都在读它），偏偏在某一刻 [[ttl:TTL]] 到期了。就在它消失的**那一瞬间**，成百上千个并发请求同时[[cachemiss:未命中]]，" +
        "一起回源、一起去数据库重建同一份缓存，把数据库瞬间压垮。这就是 [[stampede:缓存击穿]]（stampede）。" +
        "注意它和穿透的区别：穿透查的是*不存在*的数据，击穿查的是*存在且很热*的数据，只是卡在它过期的一刹那。",
      en:
        "A key is **both present and very hot** (tons of requests read it), and its [[ttl:TTL]] happens to expire at some moment. In **that instant** it vanishes, hundreds of concurrent requests all [[cachemiss:miss]] together, " +
        "fall back at once, and stampede the database to rebuild the very same entry — crushing the database in a spike. That's a [[stampede:cache stampede]]. " +
        "Contrast with penetration: penetration queries data that *doesn't exist*; breakdown queries data that *exists and is hot*, caught in the split second it expires.",
    },
    caption: { zh: "热点 key 到点消失 → 一群请求瞬间同时砸向数据库。", en: "The hot key expires → a crowd of requests hits the database all at once." },
    solutions: [
      {
        tag: { zh: "互斥锁 / 单飞", en: "Mutex / singleflight" },
        tone: "accent",
        text: {
          zh: "未命中时先抢一把锁（如 `SET NX`），**只有抢到锁的那个请求**去查库、重建缓存，其余请求短暂等待重试、或先返回旧值。这样同一时刻只有一个请求打库。",
          en: "On a miss, grab a lock first (e.g. `SET NX`); **only the request that wins the lock** queries the DB and rebuilds the cache, while the rest wait-and-retry or return a stale value. Only one request hits the database.",
        },
      },
      {
        tag: { zh: "逻辑过期", en: "Logical expiry" },
        tone: "teal",
        text: {
          zh: "key **不设真正的 TTL**（物理上不过期），而是把“逻辑过期时间”存进 value 里。读到发现逻辑已过期，就**异步**开个任务去重建，当前请求先返回旧值、不必等待。",
          en: "Give the key **no real TTL** (it never physically expires); store a “logical expiry time” inside the value. When a read sees it's logically stale, kick off an **async** rebuild while the current request returns the old value — no blocking.",
        },
      },
      {
        tag: { zh: "热点 key 不过期 + 后台刷新", en: "Never expire + background refresh" },
        text: {
          zh: "对极热的数据，干脆不靠 TTL 到期触发重建，而是用后台定时任务主动刷新缓存，让读**永远命中**。",
          en: "For extremely hot data, don't rely on TTL expiry to trigger a rebuild at all — refresh the cache from a background job so reads **always hit**.",
        },
      },
    ],
    deep: [
      {
        q: { zh: "互斥锁方案有什么代价？", en: "What does the mutex approach cost?" },
        a: {
          zh:
            "抢锁的请求在重建缓存时，其余请求要**等待**，会拉高这批请求的延迟（尾延迟变差）；锁本身必须设**过期时间**，防止持锁的请求崩了导致死锁；" +
            "而且拿到锁后要**再查一次缓存**（double-check）——因为可能在你排队等锁的时候，别人已经把缓存重建好了，就不必再打库。",
          en:
            "While the lock-holder rebuilds, everyone else **waits**, raising that batch's latency (worse tail latency). The lock itself must have an **expiry** so a crashed holder can't deadlock. " +
            "And after acquiring the lock you must **re-check the cache** (double-check): while you queued for the lock, someone may have already rebuilt it, so you can skip the DB hit.",
        },
      },
      {
        q: { zh: "逻辑过期的取舍是什么？", en: "What's the trade-off of logical expiry?" },
        a: {
          zh:
            "好处是**任何请求都不阻塞、始终有值返回**，可用性最好，热点读体验最平滑。代价是重建期间大家拿到的是**旧数据**——用一点点一致性，换来了可用性。" +
            "所以它只适合“能容忍短暂旧值”的场景；涉及钱或强一致的读，不能这么干。",
          en:
            "Upside: **nothing blocks and there's always a value**, so availability is best and hot reads stay smooth. Cost: during the rebuild everyone gets **stale data** — you trade a little consistency for availability. " +
            "So it only fits “can tolerate briefly-stale values”; don't use it for money or strongly-consistent reads.",
        },
      },
      {
        q: { zh: "穿透和击穿到底差在哪？", en: "What exactly separates penetration from breakdown?" },
        a: {
          zh:
            "**穿透**查的是*根本不存在*的数据，缓存永远建不起来，靠**空值缓存 / 布隆过滤器**防。" +
            "**击穿**查的是*存在且很热*的一个 key，只是它过期的一瞬大量请求同时回源，靠**加锁 / 逻辑过期**防。一句话：一个是“查不到”，一个是“刚好过期”。",
          en:
            "**Penetration** queries data that *doesn't exist* — the cache can never build — defended with **empty-value caching / Bloom filters**. " +
            "**Breakdown** queries one *existing, hot* key that many requests fall back on the instant it expires — defended with **locking / logical expiry**. In a line: one is “can't be found”, the other is “just expired”.",
        },
      },
    ],
  },

  // ============ Tab 3 · 缓存雪崩 ============
  {
    id: "avalanche",
    tab: { zh: "雪崩", en: "Avalanche" },
    name: { zh: "缓存雪崩", en: "Cache avalanche" },
    term: { zh: "avalanche · 大批 key 同时过期 / Redis 宕机", en: "avalanche · many keys expire together / Redis goes down" },
    symptomTitle: { zh: "大批 key 同时过期，或 Redis 整个挂掉", en: "A whole batch of keys expires together, or Redis goes down entirely" },
    symptom: {
      zh:
        "两种成因。一是**大量 key 在同一时刻集中过期**——比如启动时批量预热、给它们设了*一模一样*的 [[ttl:TTL]]，到点一起失效。" +
        "二是 **[[redis:Redis]] 整个宕机**。无论哪种，请求都会在**瞬间全部[[cachemiss:未命中]]**、一起砸向[[mysql:数据库]]，把它打垮，甚至连锁反应拖垮整个系统。" +
        "和击穿的区别：击穿是“*一个*热点 key”，雪崩是“*一大批* key 或整个缓存层”一起没了——一个是点，一个是面。",
      en:
        "Two causes. First, **many keys expiring at the same moment** — e.g. a batch warm-up on startup that gave them all the *identical* [[ttl:TTL]], so they lapse together. " +
        "Second, **[[redis:Redis]] going down entirely**. Either way, requests **all [[cachemiss:miss]] at once**, slam the [[mysql:database]] together, crush it, and can cascade into a full system outage. " +
        "Versus breakdown: breakdown is “*one* hot key”; avalanche is “*a whole batch* of keys, or the entire cache layer” vanishing at once — a point versus a plane.",
    },
    caption: { zh: "一排 key 同时过期变灰 → 请求洪流一起砸向数据库。", en: "A row of keys expires and greys out together → a flood of requests hits the database at once." },
    solutions: [
      {
        tag: { zh: "TTL 加随机抖动", en: "Jitter the TTL" },
        tone: "accent",
        text: {
          zh: "别给一批 key 设相同的 TTL。在基础值上加个**随机量**（如 `base + rand(0, 300s)`），把过期时间**打散**，避免它们扎堆到期。最便宜有效的一招。",
          en: "Don't give a batch of keys the same TTL. Add a **random offset** to a base value (e.g. `base + rand(0, 300s)`) to **spread out** expiry times so they don't lapse together. The cheapest effective fix.",
        },
      },
      {
        tag: { zh: "多级缓存", en: "Multi-level cache" },
        tone: "teal",
        text: {
          zh: "**本地缓存（进程内）+ Redis** 两层。Redis 那层未命中或不可用时，本地缓存还能承接一部分，不至于请求全部落到数据库。",
          en: "Two layers: a **local (in-process) cache + Redis**. If the Redis layer misses or dies, the local cache still cushions the blow instead of every request landing on the database.",
        },
      },
      {
        tag: { zh: "限流 / 熔断 / 降级", en: "Throttle / circuit-break / degrade" },
        text: {
          zh: "对涌向数据库的流量**限流**；数据库压力过大时**熔断**，返回**降级**结果（默认值 / 旧值 / 友好错误），保护数据库不被彻底压垮。",
          en: "**Rate-limit** traffic aimed at the database; **circuit-break** when it's overwhelmed and return a **degraded** result (default / stale value / friendly error) to keep the database from dying outright.",
        },
      },
      {
        tag: { zh: "Redis 高可用", en: "Redis high availability" },
        tone: "amber",
        text: {
          zh: "主从 + 哨兵 / 集群，**避免单点部署**。单个节点故障时能自动切换，不至于整个缓存层瞬间消失——这是根治“Redis 宕机型雪崩”的关键。",
          en: "Replicas + Sentinel / Cluster — **no single point**. A failed node fails over automatically so the whole cache layer doesn't vanish at once — the root-cause fix for “Redis-down avalanches”.",
        },
      },
    ],
    deep: [
      {
        q: { zh: "雪崩和击穿的区别再说一遍？", en: "One more time — avalanche vs breakdown?" },
        a: {
          zh:
            "**击穿**是*一个*热点 key 过期引发的局部风暴，防它靠加锁 / 逻辑过期。" +
            "**雪崩**是*大批* key 同时过期、或*整个 Redis* 不可用引发的全局性冲击，防它靠 TTL 抖动 / 多级缓存 / 限流降级 / 高可用。一个是点，一个是面。",
          en:
            "**Breakdown** is a local storm from *one* hot key expiring — defended with locking / logical expiry. " +
            "**Avalanche** is a global flood from *a whole batch* of keys expiring together, or *all of Redis* going down — defended with TTL jitter / multi-level cache / throttling+degradation / HA. A point versus a plane.",
        },
      },
      {
        q: { zh: "为什么高可用是根治雪崩的一环？", en: "Why is high availability part of the cure for avalanche?" },
        a: {
          zh:
            "雪崩的一大成因就是 **Redis 整体不可用**（宕机 / 网络分区）。单点 Redis 一挂，所有请求瞬间全部回源，这是最惨的雪崩。" +
            "主从 + 哨兵 / 集群能在节点故障时**自动切换**，让缓存层不至于整体消失，从根上把“整个缓存没了”这种雪崩的概率压下去。TTL 抖动只能治“同时过期”，治不了“缓存层整个挂”，所以两手都要有。",
          en:
            "A major avalanche cause is **Redis being entirely unavailable** (crash / network partition). A single-node Redis dying sends every request to the origin at once — the worst kind of avalanche. " +
            "Replicas + Sentinel / Cluster **fail over automatically** on node failure, so the cache layer doesn't disappear wholesale — cutting off the “the whole cache is gone” avalanche at the root. TTL jitter only cures “expire together”, not “the cache layer dies”, so you need both.",
        },
      },
      {
        q: { zh: "抖动的 TTL 会不会把缓存管理搞乱？", en: "Does jittered TTL make cache management messy?" },
        a: {
          zh:
            "不会。它只是在基础 TTL 上加一个小随机量，逻辑上仍然是“到期失效”，不影响正确性；换来的是过期时间被摊平，避免同批一起到期。实现只是一行加个随机数，收益却很大。",
          en:
            "No. It just adds a small random offset to a base TTL; logically it's still “expire when the timer ends”, so correctness is unaffected. In return, expiries are smeared out and never bunch up. It's a one-line random offset for a large payoff.",
        },
      },
    ],
  },

  // ============ Tab 4 · 数据库与缓存一致性 ============
  {
    id: "consistency",
    tab: { zh: "一致性", en: "Consistency" },
    name: { zh: "数据库与缓存一致性（双写一致性）", en: "Database–cache consistency" },
    term: { zh: "read-write consistency · 改数据要动两个地方", en: "read-write consistency · a change touches two places" },
    symptomTitle: { zh: "改数据要同时动数据库和缓存，两步非原子", en: "A change must touch both the database and the cache — two non-atomic steps" },
    symptom: {
      zh:
        "在 [[cacheaside:cache-aside]] 下，改一条数据要**同时动两个地方**：[[mysql:数据库]] 和 [[cache:缓存]]。这两步**不是原子**的，中间可能被其它请求插进来，" +
        "并发下就会读到旧值、甚至让缓存和数据库**长期对不上**。所以“更新数据时缓存怎么处理”有一整套讲究——顺序、删还是更新、以及极端时序下的补刀。" +
        "下面这条时间线，先演示两个请求（读 / 写）交错**怎么把旧值写回缓存**，再切到“延迟双删”看它**怎么补上**。",
      en:
        "Under [[cacheaside:cache-aside]], changing one record must **touch two places**: the [[mysql:database]] and the [[cache:cache]]. Those two steps are **not atomic**; another request can slip in between, " +
        "and under concurrency you read stale values or leave the cache and database **out of sync for a long time**. So “how to handle the cache on a write” is a whole playbook — ordering, delete-vs-update, and a final touch-up for the nasty interleaving. " +
        "The timeline below first shows two requests (a read and a write) interleaving to **write a stale value back into the cache**, then switches to “delayed double delete” to show **how it's fixed**.",
    },
    caption: { zh: "时间线：读/写交错把旧值写回缓存；延迟双删把它清掉。", en: "Timeline: read/write interleave to re-cache a stale value; the delayed double delete wipes it." },
    solutions: [
      {
        tag: { zh: "先更库，再删缓存", en: "Update DB, then delete cache" },
        tone: "accent",
        text: {
          zh: "标准做法：**先更新数据库，再删除缓存**（而不是更新缓存）。删掉让下次读时 [[cacheaside:cache-aside]] 自然回填最新值。",
          en: "The standard: **update the database first, then delete the cache** (don't update it). Deleting lets the next read refill the latest value naturally via [[cacheaside:cache-aside]].",
        },
      },
      {
        tag: { zh: "删，而不是更新", en: "Delete, don't update" },
        tone: "teal",
        text: {
          zh: "为什么删不更新？更新缓存有**并发写互相覆盖**的风险，还可能**白算一个没人读的值**；删掉最省事——下次真有人读再回填（读多写少时尤其划算）。",
          en: "Why delete instead of update? Updating risks **concurrent writes overwriting each other**, and may **compute a value nobody reads**. Deleting is simplest — refill on the next real read (a big win when reads outnumber writes).",
        },
      },
      {
        tag: { zh: "延迟双删", en: "Delayed double delete" },
        tone: "amber",
        text: {
          zh: "即便“先更库后删缓存”，极端时序下（读请求读到旧库值 → 写请求更库并删缓存 → 读请求再把旧值写回）仍可能短暂不一致 → 更新库后删一次，**隔一小段再删一次**。",
          en: "Even with “update DB, then delete cache”, a nasty interleaving (a read gets the old DB value → the write updates the DB and deletes the cache → the read writes the old value back) can leave a brief mismatch → after updating the DB, delete once, then **delete again after a short delay**.",
        },
      },
      {
        tag: { zh: "更强的兜底", en: "Stronger backstops" },
        text: {
          zh: "订阅数据库 binlog（如 canal）**异步删缓存**；用**消息队列**对“删缓存”做重试、保证最终删掉；给缓存设一个**兜底短 TTL**，即使漏删也能最终一致。",
          en: "Subscribe to the DB binlog (e.g. canal) to **delete the cache asynchronously**; use a **message queue** to retry the delete until it succeeds; and set a **fallback short TTL** so even a missed delete converges eventually.",
        },
      },
    ],
    deep: [
      {
        q: { zh: "为什么是“删缓存”而不是“更新缓存”？", en: "Why “delete the cache” instead of “update the cache”?" },
        a: {
          zh:
            "两个原因。①**并发写覆盖**：两个写请求可能以乱序更新缓存，把缓存写成旧值（A 先算出新值、B 后算出更新值，但 B 先写、A 后写，缓存就留下了 A 的旧值）。" +
            "②**白算浪费**：更新缓存要立刻算好新值，但这个值可能根本没人读，算了白算。删掉最省事——下次真有人读再回填（懒加载），读多写少时尤其划算。",
          en:
            "Two reasons. ① **Concurrent overwrite**: two writers may update the cache out of order and leave a stale value (A computes a new value, B computes a newer one, but B writes first and A writes last — the cache keeps A's stale value). " +
            "② **Wasted compute**: updating means computing the new value now, but nobody may read it — wasted work. Deleting is simplest: refill lazily on the next real read, a big win when reads outnumber writes.",
        },
      },
      {
        q: { zh: "为什么“先更库后删缓存”，不能反过来？", en: "Why “update DB then delete cache”, not the reverse?" },
        a: {
          zh:
            "若**先删缓存、后更库**：在“删完缓存、还没更完库”这个窗口里，一个读请求进来 [[cachemiss:未命中]] → 读到**旧的库值** → 把旧值写回缓存。" +
            "等写请求更完库，缓存里却留着刚被写回的旧值，长期不一致，直到 TTL 到期。所以标准顺序是**先把真相（数据库）改对，再删缓存**。" +
            "（补充：也有“先删缓存”流派，但必须配合延迟双删才能补掉这个窗口，见延迟双删。）",
          en:
            "If you **delete the cache first, then update the DB**: in the window between “cache deleted” and “DB updated”, a read comes in, [[cachemiss:misses]], reads the **old DB value**, and writes it back into the cache. " +
            "By the time the write finishes updating the DB, the cache holds that freshly re-written stale value — inconsistent until the TTL lapses. So the standard order is **fix the truth (DB) first, then delete the cache**. " +
            "(Aside: a “delete-first” school exists, but it must pair with delayed double delete to cover this window.)",
        },
      },
      {
        q: { zh: "为什么不干脆追求强一致？", en: "Why not just aim for strong consistency?" },
        a: {
          zh:
            "因为缓存的本质就是用**最终一致**换性能。要强一致，要么加分布式锁 / 串行化把读写都锁起来——那就丧失了缓存的性能优势，" +
            "要么干脆别加缓存、直接读库。工程上一般接受**极短暂**的不一致（毫秒级窗口 + 兜底短 TTL）；真正涉及钱等强一致场景，就不缓存、或走数据库事务（就像上一站的余额投影：Redis 只当可丢弃的读模型，账本才是真相）。",
          en:
            "Because a cache is fundamentally a **trade of eventual consistency for speed**. Strong consistency means either locking/serializing reads and writes — which throws away the cache's performance win — " +
            "or dropping the cache and reading the DB directly. In practice you accept a **very brief** window of inconsistency (milliseconds + a fallback TTL). For money-grade, strongly-consistent needs, don't cache, or use DB transactions (like the previous stop's balance projection: Redis is a disposable read model, the ledger is the truth).",
        },
      },
    ],
  },

  // ============ Tab 5 · 热点 key / 大 key ============
  {
    id: "hotbig",
    tab: { zh: "热点 / 大 key", en: "Hot / big key" },
    name: { zh: "热点 key 与大 key", en: "Hot keys & big keys" },
    term: { zh: "hot key overloads a node · big key blocks the single thread", en: "hot key overloads a node · big key blocks the single thread" },
    symptomTitle: { zh: "两类“畸形 key”：一个太热、一个太大", en: "Two kinds of misshapen keys: one too hot, one too big" },
    symptom: {
      zh:
        "**热点 key**：单个 key 访问量极高，所有请求都集中到它所在的**那一个分片 / 实例**，把这个单点压满。即使用了集群也无法缓解——一个 key 只落在一个节点，加机器也分摊不到它。" +
        "**大 key**：单个 value 特别大（几 MB 的大 String，或几十万元素的 list/set/zset/hash）。危害在于：[[redis:Redis]] 是[[singlethread:单线程]]的，对大 key 做 O(N) 操作（`HGETALL`、`SMEMBERS`、`DEL` 一个巨 key）会**长时间占住那唯一的线程，阻塞所有其它请求**；大 key 还占内存、迁移慢。",
      en:
        "**Hot key**: a single key with enormous traffic — every request lands on the **one shard / instance** that holds it, maxing out that single point. Even a cluster can't dodge it: a key lives on exactly one node, so adding machines doesn't spread it. " +
        "**Big key**: a single oversized value (a multi-MB String, or a list/set/zset/hash with hundreds of thousands of elements). The danger: [[redis:Redis]] is [[singlethread:single-threaded]], so an O(N) op on a big key (`HGETALL`, `SMEMBERS`, `DEL` on a huge key) **holds that one thread for a long time and blocks every other request**; big keys also eat memory and migrate slowly.",
    },
    caption: { zh: "左：一个热点 key 被高频访问压垮。右：一个大 key 阻塞单线程，其后请求全部排队。", en: "Left: one hot key overwhelmed by traffic. Right: a big key blocks the single thread while everything queues behind it." },
    solutions: [
      {
        tag: { zh: "热点：本地缓存扛一层", en: "Hot: front with a local cache" },
        tone: "accent",
        text: {
          zh: "在应用进程里加一层**本地缓存**，把热点数据缓存在本地，大幅减少发往 Redis 那个单点的请求。",
          en: "Add a **local cache** inside the app process so the hot data is served locally, drastically cutting requests to that single Redis node.",
        },
      },
      {
        tag: { zh: "热点：把 key 打散", en: "Hot: shard the key" },
        tone: "teal",
        text: {
          zh: "把一个热点 key **复制成多份**（`key#1 … key#N` 分布到不同节点），读时随机挑一份，把压力**摊到多个节点**；配合读写分离让多个从库分担读。",
          en: "Replicate the hot key into **several copies** (`key#1 … key#N` across nodes), pick one at random on read to **spread load across nodes**; add read/write splitting so replicas share the reads.",
        },
      },
      {
        tag: { zh: "大 key：拆分", en: "Big: split it" },
        tone: "amber",
        text: {
          zh: "把一个大 key **拆成多个小 key**（一个巨 hash 拆成多个小 hash、大 list 分段），让单次操作只碰一小块。",
          en: "**Break a big key into smaller ones** (one giant hash into several small hashes, a long list into segments) so any single operation touches only a small slice.",
        },
      },
      {
        tag: { zh: "大 key：渐进命令 + UNLINK", en: "Big: scan progressively + UNLINK" },
        text: {
          zh: "用**渐进式命令**分批取（`HSCAN` / `SSCAN` / `SCAN`，别一次 `HGETALL`）；删除用 `UNLINK`（**异步删除**，把回收内存交给后台线程）而不是 `DEL`，避免删除大 key 阻塞主线程。",
          en: "Read in batches with **progressive commands** (`HSCAN` / `SSCAN` / `SCAN`, never a single `HGETALL`); delete with `UNLINK` (**async delete**, freeing memory on a background thread) instead of `DEL`, so removing a big key doesn't stall the main thread.",
        },
      },
    ],
    deep: [
      {
        q: { zh: "为什么大 key 在单线程下这么危险？", en: "Why is a big key so dangerous under a single thread?" },
        a: {
          zh:
            "Redis 处理命令的核心是[[singlethread:单线程]]，一次只做一件事。对大 key 的 O(N) 操作（取全部、删全部）会**长时间占住这条唯一的线**，" +
            "期间所有其它请求全部**排队等待**，表现为整个实例卡顿、超时。所以要用**渐进命令**分批处理、用 `UNLINK` 把大 key 的内存回收丢到后台线程，别让一条慢命令拖垮全场。",
          en:
            "Redis processes commands on a [[singlethread:single thread]] — one thing at a time. An O(N) op on a big key (fetch all, delete all) **holds that one thread for a long time**, " +
            "and every other request **queues behind it**, showing up as a stalled, timing-out instance. So process in batches with **progressive commands** and use `UNLINK` to offload the big key's memory reclamation to a background thread — never let one slow command take down the whole show.",
        },
      },
      {
        q: { zh: "集群模式下，热点 key 为什么还是问题？", en: "In cluster mode, why is a hot key still a problem?" },
        a: {
          zh:
            "Redis Cluster 按 key 的**哈希槽**分片，同一个 key 永远落在**同一个节点**。热点 key 再热，也只由那一个节点承担，加机器也分不掉这个**单点压力**。" +
            "所以要在 **key 层面打散**（复制成多份、随机读）或在**应用层加本地缓存**，才能真正把热点摊开——单纯扩容集群没用。",
          en:
            "Redis Cluster shards by a key's **hash slot**, so a given key always lands on **one node**. However hot the key gets, only that node carries it, and adding machines can't split that **single-point load**. " +
            "So you must **shard at the key level** (replicate into copies, read at random) or **add a local cache in the app** to actually spread the hotspot — merely growing the cluster doesn't help.",
        },
      },
      {
        q: { zh: "怎么发现大 key / 热点 key？", en: "How do you find big keys / hot keys?" },
        a: {
          zh:
            "**大 key**：`redis-cli --bigkeys` 扫一遍、`MEMORY USAGE <key>` 看单个占用、或离线分析 RDB 文件。" +
            "**热点 key**：`redis-cli --hotkeys`（需开启 LFU 淘汰策略）、或用 `MONITOR` / 客户端埋点统计访问频次。发现了再针对性拆分 / 打散——先能定位，才谈得上治理。",
          en:
            "**Big keys**: sweep with `redis-cli --bigkeys`, check individuals with `MEMORY USAGE <key>`, or analyze the RDB file offline. " +
            "**Hot keys**: `redis-cli --hotkeys` (requires an LFU eviction policy), or count access frequency via `MONITOR` / client-side instrumentation. Once located, split / shard accordingly — you can't fix what you can't find.",
        },
      },
    ],
  },
];
