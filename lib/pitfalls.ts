// 新站「缓存的坑与一致性」(/pitfalls) 的全部双语文案数据。
// 目标：把缓存三大问题（穿透 / 击穿 / 雪崩）+ 数据库-缓存一致性 + 热点/大 key
//   讲到 junior 彻底懂、且能扛住面试深挖。
// 形态：5 个 tab，每个 = 一段「症状」讲解 + 一张纯 CSS 动画 + 「怎么解」列表 + 「面试深挖」手风琴。
// 画面（动画 JSX）在 app/pitfalls/page.tsx 里按 pitfall.id 对应，做到数据 / 页面分离。
// 约定：正文里用反引号 `CMD` 标命令（页面渲成 mono），**强调**渲成 strong，
//   [[key:字]] 标术语（RichText 弹层）。

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
  title: { zh: "第 4 站 · 缓存的坑与一致性", en: "Stop 4 · Cache pitfalls & consistency" },
  subtitle: {
    zh: "缓存快，是因为多存了一份数据。这一站讲这份副本什么时候会和数据库对不上、突然失效时会发生什么、又该怎么防。",
    en: "A cache is fast because it keeps a second copy of your data. This stop covers when that copy stops matching the database, what happens when it suddenly fails, and how to defend against both.",
  },
  sectionSymptom: { zh: "症状", en: "Symptom" },
  sectionFix: { zh: "怎么解", en: "How to fix" },
  sectionDeep: { zh: "面试深挖", en: "Interview deep-dive" },
  deepHint: { zh: "点开看每个追问该怎么答", en: "Open each follow-up to see how to answer" },
  replay: { zh: "↻ 重播动画", en: "↻ Replay" },
  problemTab: { zh: "看问题：读到旧值", en: "The problem: a stale read" },
  fixTab: { zh: "看解法：延迟双删", en: "The fix: delayed double delete" },
  prev: { zh: "← 上一站", en: "← Previous" },
  next: { zh: "下一站：生产机制 →", en: "Next: Redis in production →" },
};

// ---------- 开场讲解 ----------

export const intro = {
  kicker: {
    zh: "缓存三大问题 · 穿透 / 击穿 / 雪崩 · 外加缓存一致性",
    en: "Three cache failures · penetration / breakdown / avalanche · plus cache consistency",
  },
  title: {
    zh: "加了缓存，就多了一份要照看的数据",
    en: "Add a cache and you now have a second copy to keep correct",
  },
  text: {
    zh:
      "缓存能把一次慢查询变成一次内存读取，代价是：[[mysql:数据库]]之外多了一份副本。" +
      "这份副本有四种失效方式：它可能压根建不起来（[[cache:缓存]]永远未命中）、" +
      "可能在一个热点 key 过期后被大量并发请求同时重建、可能整批一起失效、也可能存着一个数据库早就改掉的旧值。" +
      "这四类问题——穿透、击穿、雪崩、缓存一致性——几乎是每场后端面试问 Redis 的必考点，也是线上事故的常见来源。" +
      "逐个 tab 看动画，把每种问题长什么样、怎么防讲清楚。",
    en:
      "A cache turns a slow query into one memory read. The price is a second copy of the data that lives outside the [[mysql:database]]. " +
      "That copy can fail in four ways: it never gets built ([[cache:cache]] always misses), one hot entry expires and many requests rebuild it at the same moment, " +
      "a large batch of entries disappears together, or it holds a value the database has already changed. " +
      "These four problems — penetration, breakdown, avalanche, and cache consistency — come up in almost every backend interview that touches Redis, and they are a common cause of production incidents. " +
      "Open each tab to see what the failure looks like and how to prevent it.",
  },
};

// ---------- 5 个坑 ----------

export const pitfalls: Pitfall[] = [
  // ============ Tab 1 · 缓存穿透 ============
  {
    id: "penetration",
    tab: { zh: "穿透", en: "Penetration" },
    name: { zh: "缓存穿透", en: "Cache penetration" },
    term: { zh: "cache penetration · 查一个根本不存在的 key", en: "cache penetration · a key that exists nowhere" },
    symptomTitle: { zh: "请求要的 key 哪里都没有，缓存永远拦不住", en: "The requested key exists nowhere, so the cache can never hold it" },
    symptom: {
      zh:
        "有人反复查一个**根本不存在**的数据，比如一个从来没创建过的用户 id。缓存里没有（[[cachemiss:未命中]]），于是回源查[[mysql:数据库]]——数据库里也没有，" +
        "查不出东西来写回缓存，这个 key 的缓存永远是空的。" +
        "结果就是：这类请求每一次都穿过缓存、直达数据库，缓存拦不住任何一次。" +
        "正常业务里很少见，一旦有人**故意用大量编造的 key 反复请求**就会变严重：缓存一个都接不住，全部请求量原样落到数据库上。",
      en:
        "Requests keep asking for data that **does not exist** — a user id that was never created, for example. The cache does not have it (a [[cachemiss:miss]]), so the request falls back to the [[mysql:database]], " +
        "which does not have it either. There is no value to write back, so the cache for that key stays empty forever. " +
        "Every one of these requests passes through the cache and reaches the database, and the cache cannot stop a single one of them. " +
        "This is rare in normal traffic. It becomes serious when someone sends **a large volume of made-up keys on purpose**: the cache absorbs none of them, and the full request rate lands on the database.",
    },
    caption: { zh: "假 id 一路穿过空缓存，每一次都打到数据库。", en: "Fake ids pass straight through the empty cache and reach the database every time." },
    solutions: [
      {
        tag: { zh: "缓存空值", en: "Cache the empty result" },
        tone: "teal",
        text: {
          zh: "即使数据库查不到，也把一个**空标记**写进缓存（空字符串或一个特殊占位值），并设一个**很短的 [[ttl:TTL]]**。下次同样的 key 读到这个标记就返回，不用再查库。",
          en: "Even when the database returns nothing, write an **empty marker** into the cache — an empty string or a sentinel value — with a **short [[ttl:TTL]]**. The next request for the same key reads the marker and stops there, so the database is not queried again.",
        },
      },
      {
        tag: { zh: "布隆过滤器", en: "Bloom filter" },
        tone: "accent",
        text: {
          zh: "把所有**真实存在的 key** 预先放进布隆过滤器（Bloom filter），请求先问它。它说“不存在”就一定不存在，直接拒绝，连缓存和数据库都不用碰。",
          en: "Load every **key that really exists** into a Bloom filter and ask it first. If it answers \"not present\", the key definitely does not exist, so you can reject the request without touching the cache or the database.",
        },
      },
      {
        tag: { zh: "入口校验 + 鉴权", en: "Validate and authenticate" },
        text: {
          zh: "在接口层就挡掉明显非法的参数（越界 id、格式不对的输入），再加上鉴权和限流，让单个客户端没法刷出海量编造的 key。",
          en: "Reject obviously invalid parameters at the API edge — out-of-range ids, malformed input. Then add authentication and rate limiting so one client cannot send a flood of made-up keys.",
        },
      },
    ],
    deep: [
      {
        q: { zh: "缓存空值有什么缺点？", en: "What is the downside of caching empty results?" },
        a: {
          zh:
            "两点。一是**占内存**：存了一堆不带任何数据的条目。二是**挡不住不断变化的假 key**：攻击者可以用海量*各不相同*的不存在 key，" +
            "每一个都要先打一次库才缓存出一个空标记，缓存反而被这些没用的条目塞满。" +
            "所以空值缓存适合“少量固定的不存在 key”；面对有意的攻击流量，要配合**布隆过滤器**，并把空标记的 TTL 设得很短。",
          en:
            "Two things. First, **memory**: you are storing entries that carry no data. Second, **it does not stop keys that keep changing**: an attacker can send countless *different* keys that do not exist, " +
            "and each one still reaches the database once before its empty marker is cached, so the cache fills up with useless entries. " +
            "Empty markers suit a small, fixed set of missing keys. Against a deliberate flood, pair them with a **Bloom filter** and keep the marker's TTL short.",
        },
      },
      {
        q: { zh: "布隆过滤器为什么省，可靠到什么程度？", en: "Why is a Bloom filter cheap, and how reliable is it?" },
        a: {
          zh:
            "它就是一个位数组加几个哈希函数，空间极省、判断极快。关键性质是**单向误差**：它可能把一个其实不存在的 key 判成“可能存在”（有一个很小的误判率），" +
            "但**绝不会**把一个真实存在的 key 说成“不存在”。也就是“**说不存在就一定不存在，说存在只是可能存在**”。" +
            "所以它能挡掉绝大多数穿透请求，而且不会误杀真实数据；代价是极少数假 key 因为误判被放行到后端，按普通请求处理就行。" +
            "缺点：标准布隆过滤器只支持添加、不支持删除，要用 counting bloom filter 或定期重建。",
          en:
            "It is a bit array plus a few hash functions, so it is small and fast. Its useful property is **one-sided error**: it can report \"maybe present\" for a key that is absent (a small false-positive rate), " +
            "but it will **never** report \"absent\" for a key that is present. In short: \"not present\" is certain, \"present\" is only probable. " +
            "So it stops the large majority of penetration traffic and never rejects real data. The cost is that a few made-up keys still get through, which the cache and database handle as ordinary requests. " +
            "Downside: a standard Bloom filter only supports adding, not removing — use a counting Bloom filter or rebuild it periodically.",
        },
      },
      {
        q: { zh: "缓存了空值，之后这条数据真被创建了怎么办？", en: "What if the record is created after you cached an empty result?" },
        a: {
          zh:
            "写入这条数据时，要在同一段写逻辑里**删掉或覆盖**那个空标记，否则读会一直命中“不存在”的旧标记，永远看不到新数据。" +
            "这也是空标记 TTL 要短的第二个理由：万一漏删，错误答案也有一个明确的存活上限。",
          en:
            "When you insert the record, **delete or overwrite** the empty marker in the same write path. Otherwise reads keep returning the stale \"absent\" marker and never see the new row. " +
            "This is the second reason to keep the marker's TTL short: if the invalidation is missed, the wrong answer still has a bounded lifetime.",
        },
      },
    ],
  },

  // ============ Tab 2 · 缓存击穿 ============
  {
    id: "breakdown",
    tab: { zh: "击穿", en: "Breakdown" },
    name: { zh: "缓存击穿（热点 key 过期）", en: "Hot-key breakdown" },
    term: { zh: "hot key breakdown · 又称 cache stampede", en: "hot key breakdown · also called a cache stampede" },
    symptomTitle: { zh: "一个热点 key 过期，大量并发请求同时去重建它", en: "One hot key expires and many concurrent requests rebuild it at once" },
    symptom: {
      zh:
        "某个 key **又存在、又特别热**——很大一部分流量都在读它——偏偏它的 [[ttl:TTL]] 到期了。" +
        "注意：Redis 不保证在到期那一刻就把 key 删掉，但保证过期后不会再把这个值返回，所以从那一刻起读一律[[cachemiss:未命中]]。" +
        "于是成百上千个并发请求在同一瞬间回源[[mysql:数据库]]，去重建**同一份数据**，把数据库压垮的正是这一下并发。这就是 [[stampede:缓存击穿]]（cache stampede）。" +
        "和穿透的区别：穿透查的是*根本不存在*的数据，击穿查的是*存在且很热*的数据，只是卡在它刚过期的那一小段时间里。",
      en:
        "One key is **both present and very hot** — a large share of traffic reads it — and its [[ttl:TTL]] runs out. " +
        "Redis does not promise to delete the key at that exact instant, but it does promise not to return an expired value, so from that moment every read [[cachemiss:misses]]. " +
        "Hundreds of concurrent requests fall back to the [[mysql:database]] in the same instant and rebuild **the same entry**, and it is that burst of identical work that overloads the database. This is a [[stampede:cache stampede]]. " +
        "Note the difference from penetration: penetration asks for data that *does not exist*, while breakdown asks for data that *exists and is hot*, in the short moment after it expires.",
    },
    caption: { zh: "热点 key 一过期 → 大量请求在同一刻回源重建同一份数据。", en: "The hot key expires → many requests rebuild the same entry at the same moment." },
    solutions: [
      {
        tag: { zh: "互斥锁 / 单飞", en: "Mutex / single-flight" },
        tone: "accent",
        text: {
          zh: "未命中时先抢一把锁（如 `SET key value NX PX ttl`）。**只有抢到锁的那个请求**去查库、重建缓存，其余请求短暂等待重试，或者先返回上一个值。这样同一时刻只有一个请求打到数据库。",
          en: "On a miss, take a lock first, for example `SET key value NX PX ttl`. **Only the request that wins the lock** reads the database and rebuilds the entry; the others wait and retry, or return the previous value. One request reaches the database instead of hundreds.",
        },
      },
      {
        tag: { zh: "逻辑过期", en: "Logical expiry" },
        tone: "teal",
        text: {
          zh: "key **不设真正的 TTL**，改成把一个过期时间戳存进 value 里。读到发现这个时间戳已经过了，就**异步**起一个任务去重建，当前请求直接返回旧值、不必等待。代价是重建完成之前，大家读到的都是旧值。",
          en: "Give the key **no real TTL**, and store an expiry timestamp **inside the value** instead. When a read sees that the timestamp has passed, it starts an **asynchronous** rebuild and returns the old value immediately, so nothing waits. Until the rebuild finishes, every reader gets the old value.",
        },
      },
      {
        tag: { zh: "最热的 key 不过期", en: "Never expire the hottest keys" },
        text: {
          zh: "对流量最集中的那几个 key，干脆不用过期来触发重建，而是用后台定时任务主动刷新，让读**永远命中**。代价是刷新责任转到了你身上：后台任务停了，缓存会一直是旧值，而且没有报错。",
          en: "For the few keys that carry the most traffic, do not use expiry to trigger the rebuild at all. Refresh them from a scheduled background job so reads **always hit**. The refresh is now your responsibility: if the job stops, the value goes stale silently.",
        },
      },
    ],
    deep: [
      {
        q: { zh: "互斥锁方案有什么代价？", en: "What does the mutex approach cost?" },
        a: {
          zh:
            "抢到锁的请求在重建缓存时，其余请求要**等**，这一批请求的尾延迟会明显变差；锁本身必须设**过期时间**，" +
            "否则持锁的请求一崩，其它人就永远卡住；而且拿到锁之后要**再查一次缓存**——你在排队等锁的这段时间里，别人可能已经把缓存重建好了，那就完全不用再打库。",
          en:
            "While the lock holder rebuilds, the other requests **wait**, which raises tail latency for that batch. The lock itself needs an **expiry**, so a request that crashes while holding it cannot block everyone forever. " +
            "And once you acquire the lock you should **check the cache again**: another request may have finished the rebuild while you were queued, in which case you can skip the database entirely.",
        },
      },
      {
        q: { zh: "逻辑过期的取舍是什么？", en: "What is the trade-off of logical expiry?" },
        a: {
          zh:
            "好处是**没有请求会阻塞，永远有值可以返回**，可用性最好，热点读的体验也最平滑。" +
            "代价是重建完成之前，**所有人拿到的都是旧值**——你是用一段可控的陈旧期换来了可用性。" +
            "所以它只适合“旧一点也没关系”的数据；涉及钱、或者要求读到最新一次写入的场景，不能这么做。",
          en:
            "The upside is that **no request blocks and there is always a value to return**, so availability stays high and hot reads stay smooth. " +
            "The cost is that **every reader gets stale data until the rebuild finishes** — you are trading a window of staleness for availability. " +
            "Use it where a slightly old value is acceptable. Do not use it for money, or for any read that must reflect the latest write.",
        },
      },
      {
        q: { zh: "穿透和击穿到底差在哪？", en: "What exactly separates penetration from breakdown?" },
        a: {
          zh:
            "**穿透**查的是*根本不存在*的数据，缓存永远建不起来，靠**空值缓存 / 布隆过滤器**防。" +
            "**击穿**查的是*一个存在且很热*的 key，只在它刚过期的那段时间里被大量请求同时重建，靠**加锁 / 逻辑过期 / 让它不过期**防。" +
            "一句话：一个是“压根没东西可缓存”，一个是“一秒钟前还缓存着”。",
          en:
            "**Penetration** asks for data that *does not exist*, so the cache can never hold it; you defend with empty markers and a Bloom filter. " +
            "**Breakdown** asks for one *existing, very hot* key in the moment after it expires, when many requests rebuild it together; you defend with a lock, logical expiry, or by not expiring that key. " +
            "In a line: one is \"there is nothing to cache\", the other is \"it was cached a second ago\".",
        },
      },
    ],
  },

  // ============ Tab 3 · 缓存雪崩 ============
  {
    id: "avalanche",
    tab: { zh: "雪崩", en: "Avalanche" },
    name: { zh: "缓存雪崩", en: "Cache avalanche" },
    term: { zh: "avalanche · 大批 key 同时失效 / 缓存节点故障", en: "avalanche · many keys expire together, or the cache node fails" },
    symptomTitle: { zh: "大批 key 在几乎同一时刻失效，或者缓存节点整个故障", en: "Many keys expire at nearly the same time, or the cache node itself fails" },
    symptom: {
      zh:
        "两种成因。一是**大量 key 在几乎同一时刻过期**——比如启动时批量预热，给它们设了*一模一样*的 [[ttl:TTL]]，到点一起失效。" +
        "二是 **[[redis:Redis]] 节点本身故障**。无论哪种，都会有很大一部分流量在同一时间[[cachemiss:未命中]]、一起落到[[mysql:数据库]]上；" +
        "数据库一旦被拖慢，上游请求就开始超时，故障会顺着调用链扩散。" +
        "和击穿的区别在规模：击穿是*一个*热点 key，雪崩是*一大批 key* 或者*整个缓存层*。",
      en:
        "Two causes. First, **many keys expiring at nearly the same moment** — for example a batch warm-up at startup that gave every key the *same* [[ttl:TTL]], so they all lapse together. " +
        "Second, the **[[redis:Redis]] node itself failing**. Either way a large share of traffic [[cachemiss:misses]] at once and reaches the [[mysql:database]] together. " +
        "Once the database slows down, callers start timing out and the failure spreads up the call chain. " +
        "The difference from breakdown is scale: breakdown is *one* hot key, avalanche is *a large batch of keys* or *the whole cache layer*.",
    },
    caption: { zh: "一排 key 同时到期变灰 → 大部分流量在同一时间落到数据库。", en: "A row of keys expires together → a large share of traffic reaches the database at the same time." },
    solutions: [
      {
        tag: { zh: "TTL 加随机抖动", en: "Jitter the TTL" },
        tone: "accent",
        text: {
          zh: "别给一批 key 设相同的 TTL。在基础值上加一个**随机量**（如 `base + rand(0, 300s)`），把过期时间**打散**，它们就不会扎堆到期。最便宜的一招，直接消掉最常见的那个成因。",
          en: "Do not give a batch of keys the same TTL. Add a **random offset** to a base value, for example `base + rand(0, 300s)`, so expiry times **spread out** instead of landing together. This is the cheapest fix and it removes the most common cause.",
        },
      },
      {
        tag: { zh: "多级缓存", en: "Multi-level cache" },
        tone: "teal",
        text: {
          zh: "**本地缓存（进程内）+ Redis** 两层。Redis 那层未命中或不可用时，本地缓存还能接住一部分流量，不至于请求全部落到数据库。代价是每个进程各存一份，短时间内它们之间可能对不上。",
          en: "Run two layers: a **local, in-process cache in front of Redis**. When the Redis layer misses or is unavailable, the local copy still answers part of the traffic, so not every request reaches the database. Each process holds its own copy, so the copies can disagree for a short time.",
        },
      },
      {
        tag: { zh: "限流 / 熔断 / 降级", en: "Rate-limit / circuit-break / degrade" },
        text: {
          zh: "对涌向数据库的流量**限流**；数据库压力过大时**熔断**，返回一个**降级**结果（默认值、上一个值，或者一个说得清的错误）。目标是让数据库还能服务一部分请求，而不是全部失败。",
          en: "**Rate-limit** the traffic that reaches the database, open a **circuit breaker** when it is overloaded, and return a **degraded** answer — a default, the previous value, or a clear error. The goal is to keep the database serving some requests instead of failing all of them.",
        },
      },
      {
        tag: { zh: "Redis 高可用", en: "Redis high availability" },
        tone: "amber",
        text: {
          zh: "主从 + 哨兵 / 集群，**别用单节点**：节点故障时能自动切换，缓存层不至于整体消失。也要知道它的边界——主从复制是**异步**的，从库可能落后一点，主库已经确认的写在切换时也可能丢。",
          en: "Run replicas with Sentinel or Cluster instead of **a single node**, so a failed node is replaced automatically and the cache layer does not disappear. Know the limit as well: replication is **asynchronous**, so a replica can be slightly behind, and a write the primary already acknowledged can be lost if it fails over before the replica received it.",
        },
      },
    ],
    deep: [
      {
        q: { zh: "雪崩和击穿的区别再说一遍？", en: "One more time — avalanche versus breakdown?" },
        a: {
          zh:
            "**击穿**是局部的：*一个*热点 key 过期，读它的那批请求一起去重建它，靠加锁、逻辑过期、或让它不过期来防。" +
            "**雪崩**是大面积的：*一大批* key 在几乎同一时刻过期，或者*缓存节点*故障，于是很大一部分流量一起落到数据库，" +
            "靠 TTL 抖动、第二层缓存、限流降级、以及有冗余的 Redis 部署来防。一个是一个 key，一个是一大片 key。",
          en:
            "**Breakdown** is local: *one* hot key expires and the requests reading it rebuild it together. You fix it with a lock, logical expiry, or by not expiring that key. " +
            "**Avalanche** is broad: *a large batch* of keys expires at nearly the same time, or *the cache node* fails, so a large share of all traffic reaches the database. " +
            "You fix it with TTL jitter, a second cache layer, rate limiting with degradation, and a redundant Redis deployment. One key versus a large slice of the keyspace.",
        },
      },
      {
        q: { zh: "为什么高可用是治雪崩的一环？", en: "Why is high availability part of the answer?" },
        a: {
          zh:
            "雪崩的两个成因里，有一个就是 **Redis 不可用**——节点崩了，或者网络分区。如果整个缓存只在一个节点上，它一挂，所有请求瞬间全部回源，这是最惨的一种。" +
            "主从 + 哨兵 / 集群能在节点故障时**自动把从库提升为主库**，缓存层就能扛住单节点故障。" +
            "但它不是白来的：切换要花几秒，新主库的数据是冷的或者略旧的，而且因为复制是异步的，最近的一批写可能根本没同步过去。" +
            "TTL 抖动只治“一起过期”，治不了“节点没了”，所以两手都要有。",
          en:
            "One of the two causes of avalanche is **Redis being unavailable** — a crashed node or a network partition. If a single node holds the whole cache, losing it sends every request to the database at once. " +
            "Replicas with Sentinel or Cluster **promote a replica automatically**, so the cache layer survives one node failure. " +
            "It is not free: failover takes seconds, the promoted replica starts cold or slightly behind, and because replication is asynchronous the most recent writes may never have reached it. " +
            "TTL jitter fixes \"everything expires together\" and does nothing for \"the node is gone\", so you need both.",
        },
      },
      {
        q: { zh: "抖动的 TTL 会不会把缓存搞得难以理解？", en: "Does a jittered TTL make the cache harder to reason about?" },
        a: {
          zh:
            "不会。它只是在基础 TTL 上加一个小随机量，规则仍然是“这条缓存大约 N 秒后过期”，正确性不受影响；换来的是过期时间被摊平，不会扎堆。实现就是一行代码。" +
            "随机区间怎么定：宽到足以把重建的峰值削平，又窄到数据不会旧得超出业务能接受的范围。",
          en:
            "No. It adds a small random offset to a base TTL, and the rule is still \"this entry expires after roughly N seconds\", so correctness is unchanged. What you gain is that expiry times are spread out instead of bunched. It is one line of code. " +
            "Choose the range deliberately: wide enough to flatten the rebuild peak, narrow enough that the data never gets older than the product allows.",
        },
      },
    ],
  },

  // ============ Tab 4 · 数据库与缓存一致性 ============
  {
    id: "consistency",
    tab: { zh: "一致性", en: "Consistency" },
    name: { zh: "数据库与缓存一致性（双写一致性）", en: "Database and cache consistency" },
    term: { zh: "read-write consistency · 一次修改要动两个地方", en: "read-write consistency · one change touches two places" },
    symptomTitle: { zh: "改一条数据要动数据库和缓存，这两步不是原子的", en: "A change touches the database and the cache — two steps that are not atomic" },
    symptom: {
      zh:
        "在 [[cacheaside:cache-aside]] 下，改一条数据要动**两个地方**：[[mysql:数据库]]和[[cache:缓存]]。这两步**不是原子**的，中间可以插进别的请求。" +
        "并发下，一个读请求可能在写请求删掉缓存之后，才把它早先读到的旧值写回去；从那一刻起，缓存和数据库就对不上，一直到这条缓存过期为止。" +
        "所以写路径是有讲究的：先动哪一个、是删还是更新、以及顺序本身补不掉的那种交错怎么办。" +
        "下面这条时间线，先演示一个读和一个写交错，**把旧值写回缓存**；再切到“延迟双删”，看它**补掉了什么、又补不掉什么**。",
      en:
        "Under [[cacheaside:cache-aside]], changing one record means touching **two places**: the [[mysql:database]] and the [[cache:cache]]. The two steps are **not atomic**, so another request can run between them. " +
        "Under concurrency a reader can put an old value back into the cache after the writer already removed it. From that moment the cache disagrees with the database, and it stays that way until the entry expires. " +
        "This is why the write path has rules: which store to touch first, whether to delete or update, and what to do about the interleaving that ordering alone does not cover. " +
        "The timeline below first shows a read and a write interleaving so that **a stale value ends up back in the cache**, then switches to \"delayed double delete\" to show **what that fixes and what it does not**.",
    },
    caption: { zh: "时间线：读写交错把旧值写回缓存；延迟双删把它清掉，但窗口只是变小。", en: "Timeline: a read and a write interleave and put a stale value back; the second delete removes it, but the window only gets smaller." },
    solutions: [
      {
        tag: { zh: "先更库，再删缓存", en: "Update the database, then delete the cache" },
        tone: "accent",
        text: {
          zh: "标准顺序：**先写数据库，再删掉那个缓存 key**（而不是去更新它）。删掉之后，下一次读会未命中，按 [[cacheaside:cache-aside]] 从数据库回填最新值——真有人要读的时候才加载一次。",
          en: "The standard order: **write the database first, then delete the cache key** (not update it). After the delete, the next read misses and refills the key from the database through [[cacheaside:cache-aside]], so the new value is loaded once, when someone actually asks for it.",
        },
      },
      {
        tag: { zh: "删缓存，而不是更新缓存", en: "Delete, do not update" },
        tone: "teal",
        text: {
          zh: "为什么是删不是写新值？两个并发写请求更新缓存的顺序可能和更新数据库的顺序相反，结果把旧值留在了缓存里；而且更新还可能**算了一个没人会读的值**。删除两个问题都没有，代价只是下次读多一次数据库查询。",
          en: "Why delete rather than write the new value in? Two concurrent writers can update the cache in the opposite order from the database, which leaves the older value in place. Updating also computes a value that may never be read. Deleting avoids both, and it costs one extra database read the next time someone asks for the key.",
        },
      },
      {
        tag: { zh: "延迟双删", en: "Delayed double delete" },
        tone: "amber",
        text: {
          zh: "即便“先更库、后删缓存”，仍有一种交错漏得掉：读请求先读到旧值 → 写请求更新数据库并删缓存 → 读请求这时才把旧值写回。隔一小段再删一次，就能把它清掉。但这个延迟必须比那次慢读还长，而你只能估——所以它**只是把窗口变小，并没有关掉窗口**。",
          en: "Even with \"database first, then delete\", one interleaving still slips through: a reader loads the old value, the writer updates the database and deletes the key, and only then does the reader write the old value back. Deleting a second time after a short delay removes it. The delay has to outlast that slow read, and you can only estimate it — so this **narrows the window, it does not close it**.",
        },
      },
      {
        tag: { zh: "更硬的兜底", en: "Stronger backstops" },
        text: {
          zh: "订阅数据库 binlog（canal、Debezium），**从变更流里删缓存**，这样删除就不依赖应用记得删；删除失败的用**消息队列**重试。最要紧的是：给每条缓存都设一个**短 TTL**——不管哪一步出了问题，它都是唯一能兜住旧值的机制。",
          en: "Subscribe to the database binlog (canal, Debezium) and **delete the cache from the change stream**, so the delete no longer depends on the application remembering to do it. Retry failed deletes through a **message queue**. Above all, give every cached entry a **short TTL**: whichever step failed, that is the one mechanism that still clears a stale value.",
        },
      },
    ],
    deep: [
      {
        q: { zh: "为什么是“删缓存”而不是“更新缓存”？", en: "Why delete the cache instead of updating it?" },
        a: {
          zh:
            "两个原因。①**并发写会乱序**：写请求 A 算出 v1，写请求 B 算出更新的 v2；如果 B 先写缓存、A 后写，数据库里是 v2，缓存里却是 v1，而且没有任何东西会去纠正它，直到这条缓存过期。" +
            "删除没有顺序问题：两个写请求都只是删，下一次读加载的就是数据库当时的值。" +
            "②**白算**：更新意味着现在就把新值算出来，可这个 key 可能再也没人读。删除是懒加载，下次真有人读再回填——读多写少时这笔账明显更划算。",
          en:
            "Two reasons. ① **Concurrent writers can reorder.** Writer A computes v1 and writer B computes the newer v2. If B writes the cache first and A writes second, the database holds v2 while the cache holds v1, and nothing corrects it until the entry expires. " +
            "Deleting has no ordering problem: both writers simply delete, and the next read loads whatever the database holds at that point. " +
            "② **Wasted work.** Updating means computing the new value right away, even if nobody reads that key again. Deleting refills lazily on the next real read, which is the better trade when reads outnumber writes.",
        },
      },
      {
        q: { zh: "为什么“先更库后删缓存”，不能反过来？", en: "Why update the database before deleting the cache, and not the reverse?" },
        a: {
          zh:
            "若**先删缓存、后更库**：在“删完缓存”和“数据库写完”之间有一个窗口。一个读请求正好落在这个窗口里，[[cachemiss:未命中]] → 从数据库读到**旧值** → 把旧值写回缓存。" +
            "等写请求把库更完，数据库是新值、缓存是旧值，而且会一直这样，直到这条缓存过期。" +
            "先更库能把这个窗口压得小很多：读请求必须在写提交之前就把值读出来，又要在删除之后才写回去，这个重叠区间窄得多。" +
            "（补充：也有“先删缓存”的流派，但它必须配延迟双删才能补掉这个窗口。）",
          en:
            "If you **delete first and update second**, there is a window between the delete and the database write. A read arriving in that window [[cachemiss:misses]], reads the **old** value from the database, and writes it back into the cache. " +
            "When the write finishes, the database holds the new value and the cache holds the old one — and it stays that way until the entry expires. " +
            "Updating the database first makes that window much smaller, because the reader has to load its value before the write commits and write it back after the delete, which is a far narrower overlap. " +
            "(A \"delete first\" variant does exist, but it needs the delayed second delete to cover this window.)",
        },
      },
      {
        q: { zh: "延迟双删能保证一致吗？", en: "Does the delayed double delete guarantee consistency?" },
        a: {
          zh:
            "不能。面试时直说这一点，反而比背下步骤更有说服力。第二次删除能清掉慢读写回的那个旧值，但那个延迟是**估出来的**：" +
            "它必须比“在你这次写之前就已经开始的最慢的一次读”还长，而写入侧根本量不到这个时间。" +
            "设短了，读请求会在第二次删除之后才写回；设长了，要么占住写路径，要么得把这次删除丢进后台任务。" +
            "真正兜底的是**给缓存设一个短 TTL**，让任何旧值都有一个存活上限。把 cache-aside 理解成“窗口很小的最终一致”，而不是“一致”。",
          en:
            "No. Saying so plainly is a better interview answer than reciting the steps. The second delete removes the stale value that a slow reader wrote back, but the delay is a **guess**: " +
            "it has to outlast the slowest read that started before your write, and the write path cannot measure that. " +
            "Set it too short and the reader writes back after your second delete; set it too long and you either hold the write path open or move the delete into a background job. " +
            "The dependable backstop is a **short TTL on the cached entry**, which bounds how long any stale value can live. Treat cache-aside as eventually consistent with a small window, not as consistent.",
        },
      },
      {
        q: { zh: "为什么不干脆追求强一致？", en: "Why not aim for strong consistency instead?" },
        a: {
          zh:
            "因为缓存换来的速度，本身就是靠“接受一段两边不一样的窗口”买的。要消掉这个窗口，要么加分布式锁 / 把读写串行化到两个存储上——那就把当初加缓存省下的延迟又还回去了；" +
            "要么干脆不缓存这份数据，直接读库。工程上一般接受毫秒级的窗口，再加一个短 TTL 兜底。" +
            "真正要求数值准确的地方就别缓存，或者把权威副本放在数据库事务里——这就是上一站那个模式：Redis 里放一份随时可以丢掉重算的读模型，账本才是[[sourceoftruth:真相来源]]。",
          en:
            "Because the speed a cache buys you is paid for by accepting a window in which the two copies differ. Removing that window means locking or serialising reads and writes across both stores, which gives back the latency the cache was added to save, " +
            "or not caching that data at all and reading the database directly. In practice teams accept a window of milliseconds plus a short TTL as a backstop. " +
            "Where the number has to be exact, do not cache it, or keep the authoritative copy inside a database transaction. That is the pattern from the previous stop: Redis holds a read model you can throw away and recompute, and the ledger is the [[sourceoftruth:source of truth]].",
        },
      },
    ],
  },

  // ============ Tab 5 · 热点 key / 大 key ============
  {
    id: "hotbig",
    tab: { zh: "热点 / 大 key", en: "Hot / big key" },
    name: { zh: "热点 key 与大 key", en: "Hot keys and big keys" },
    term: {
      zh: "hot key / big key · 一个压垮单个节点，一个阻塞排在它后面的命令",
      en: "hot key / big key · one overloads a single node, one blocks the commands behind it",
    },
    symptomTitle: { zh: "两类有问题的 key：一个太热，一个太大", en: "Two kinds of problem key: one too hot, one too big" },
    symptom: {
      zh:
        "**热点 key**：单个 key 占了很大一部分访问量。所有请求都落到**存着它的那一个节点**上，那个节点被打满，集群里其它节点却很闲。" +
        "加机器也没用——一个 key 只会落在一个节点上。" +
        "**大 key**：单个 value 特别大（几 MB 的 String，或者几十万元素的 list / set / zset / hash）。" +
        "[[redis:Redis]] 执行命令是[[singlethread:一次一条]]的（Redis 6 之后有额外线程处理网络 I/O，但执行命令的仍然只有一条线）。" +
        "所以对大 key 做一次 O(n) 操作——`HGETALL`、`SMEMBERS`、对一个巨大集合 `DEL`——会长时间占住服务器，**排在它后面的命令全都要等**。大 key 还很占内存，扩缩容迁移时也慢。",
      en:
        "**Hot key**: one key takes a very large share of the traffic. Every request for it lands on the **single node that holds it**, so that node saturates while the rest of the cluster stays idle. " +
        "Adding nodes does not help, because a key lives on exactly one node. " +
        "**Big key**: one value is very large — a multi-megabyte string, or a list, set, sorted set, or hash with hundreds of thousands of elements. " +
        "[[redis:Redis]] runs commands [[singlethread:one at a time]] (Redis 6 and later use extra threads for network I/O, but command execution is still serialised). " +
        "So one O(n) command on a big key — `HGETALL`, `SMEMBERS`, or `DEL` on a huge collection — occupies the server for a long time and **every command queued behind it waits**. Big keys also use a lot of memory and are slow to move when you reshard.",
    },
    caption: {
      zh: "左：一个热点 key 把单个节点打满。右：一个大 key 占住服务器，后面的命令全在排队。",
      en: "Left: one hot key saturates a single node. Right: one big key occupies the server while the commands behind it wait.",
    },
    solutions: [
      {
        tag: { zh: "热点：本地缓存挡一层", en: "Hot: add a local cache" },
        tone: "accent",
        text: {
          zh: "把热点数据缓存在**应用进程内**，大部分读在本地就答完了，根本不会发到存着这个 key 的那个节点。代价是每个进程各有一份，所以给它一个很短的存活时间，并接受它可能比 Redis 慢半拍。",
          en: "Cache the hot value **inside the application process**. Most reads are then answered locally and never reach the node that holds the key. Each process keeps its own copy, so give it a short lifetime and accept that it can be slightly behind Redis.",
        },
      },
      {
        tag: { zh: "热点：把 key 打散", en: "Hot: split the key" },
        tone: "teal",
        text: {
          zh: "把同一份值存到**多个 key** 下（`hot:key#1` … `hot:key#N`），让它们散落到不同的槽，读的时候随机挑一个。从库也能分担读，但复制是异步的，从库可能返回一个略旧的值。",
          en: "Store the same value under **several keys** (`hot:key#1` … `hot:key#N`) so they hash to different slots, and have each read pick one at random. Read replicas can absorb reads too, but replication is asynchronous, so a replica can return a slightly older value.",
        },
      },
      {
        tag: { zh: "大 key：拆开", en: "Big: split it" },
        tone: "amber",
        text: {
          zh: "把一个大 key **拆成多个小 key**——一个巨大的 hash 拆成一组小 hash，一个很长的 list 切成若干段——让单次命令只碰其中一小块数据。",
          en: "**Break one big key into several smaller ones** — one huge hash into a group of small hashes, one long list into segments — so a single command only touches a small part of the data.",
        },
      },
      {
        tag: { zh: "大 key：分批读 + UNLINK", en: "Big: scan in batches, delete with UNLINK" },
        text: {
          zh: "用 `HSCAN` / `SSCAN` / `SCAN` 分页读大集合，别一次 `HGETALL` 或 `SMEMBERS`。删除用 `UNLINK` 而不是 `DEL`：`UNLINK` 会立刻把 key 摘掉，把回收内存交给后台线程，删一个大集合就不会卡住其它命令。",
          en: "Read big collections in pages with `HSCAN`, `SSCAN`, or `SCAN` instead of one `HGETALL` or `SMEMBERS`. Delete with `UNLINK` rather than `DEL`: `UNLINK` detaches the key immediately and frees the memory on a background thread, so removing a large collection does not hold up the other commands.",
        },
      },
    ],
    deep: [
      {
        q: { zh: "为什么一个大 key 会拖慢整个实例？", en: "Why does one big key slow down the whole instance?" },
        a: {
          zh:
            "Redis 执行命令是[[singlethread:一次一条]]的。一条要遍历大 key 全部元素的命令——全读出来、全删掉——会把服务器占住整整那么久，" +
            "**其它所有客户端的命令都排在后面等**，表现出来就是整个实例超时，而不只是这一个 key 变慢。" +
            "Redis 6 之后用额外线程收发网络数据，但这一点没变：命令执行仍然是串行的。" +
            "解法也就顺理成章：用 `HSCAN` / `SSCAN` 分页处理，用 `UNLINK` 把大对象的内存回收放到后台线程。",
          en:
            "Redis runs commands [[singlethread:one at a time]]. A command that touches every element of a big key — read it all, delete it all — occupies the server for as long as that takes, " +
            "and **every other client's command waits in the queue behind it**. That shows up as timeouts across the whole instance, not just on that one key. " +
            "Redis 6 and later use extra threads to read and write sockets, which does not change this: command execution is still serialised. " +
            "The fixes follow from that: work in pages with `HSCAN` / `SSCAN`, and use `UNLINK` so freeing a large object happens on a background thread.",
        },
      },
      {
        q: { zh: "集群模式下，热点 key 为什么还是问题？", en: "In cluster mode, why is a hot key still a problem?" },
        a: {
          zh:
            "Redis Cluster 按**哈希槽**分片，一个 key 只映射到一个槽，而这个槽只在一个节点上。热点 key 再热，也只由那一个节点扛；" +
            "加节点只是把*其它* key 重新分配一下，对这个 key 没有任何帮助。" +
            "要摊开它，只能在 **key 本身上做文章**——存成多份、随机读——或者在**应用进程里再存一份**。这个节点的从库也能分担读，代价是可能返回略旧的值。",
          en:
            "Redis Cluster shards by **hash slot**, and a key maps to exactly one slot, which lives on exactly one node. However hot the key becomes, that one node serves all of it; " +
            "adding nodes only redistributes *other* keys and changes nothing for this one. " +
            "To spread it you have to act on the key itself — several copies read at random — or keep a copy in the application process. Replicas of that node can take read traffic, at the cost of returning slightly older values.",
        },
      },
      {
        q: { zh: "怎么发现大 key / 热点 key？", en: "How do you find big keys and hot keys?" },
        a: {
          zh:
            "**大 key**：`redis-cli --bigkeys` 用 `SCAN` 采样扫一遍，报出每种类型里最大的那个 key；`MEMORY USAGE <key>` 量单个 key；" +
            "离线分析 RDB 文件能看到全貌，而且完全不碰线上实例。" +
            "**热点 key**：`redis-cli --hotkeys` 需要把 `maxmemory-policy` 设成 LFU 才能用；更实际的做法是在客户端统计每个 key 的请求数。" +
            "线上繁忙的实例上别开 `MONITOR`——它会把每一条命令都推出来，实打实地吃掉吞吐。",
          en:
            "**Big keys**: `redis-cli --bigkeys` samples the keyspace with `SCAN` and reports the largest key of each type; `MEMORY USAGE <key>` measures one key; " +
            "and analysing an RDB file offline gives the full picture without touching the running server. " +
            "**Hot keys**: `redis-cli --hotkeys` needs an LFU `maxmemory-policy` to work; counting requests per key in the client is usually more practical. " +
            "Avoid `MONITOR` on a busy production server — it streams every command and costs real throughput.",
        },
      },
    ],
  },
];
