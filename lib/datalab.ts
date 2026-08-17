// 第 2 站「数据结构详解」的全部内容数据（双语）。
// 目标：把 Redis 的 value 能装的每种结构彻底讲透，且能扛住面试深挖。
// 页面 app/data/page.tsx 按 id 给每种结构配一段动画；文字全在这里。

import type { L } from "@/lib/i18n";

export type Cmd = { cmd: string; note: L }; // 一条命令 + 它干嘛（命令本身不翻译）
export type Probe = { q: L; a: L }; // 面试深挖：追问 + 该怎么答

export type Structure = {
  id: string; // string | list | hash | set | zset
  name: L; // "String 字符串"
  tag: L; // 一句话定位
  model: L; // 心智模型（正文，可含 [[术语]]）
  commands: Cmd[]; // 常用命令
  uses: L[]; // 真实用途
  ship: L; // 在 WeShipItNow 里的对应
  encoding: L; // 底层编码
  probes: Probe[]; // 面试深挖 Q&A
};

// ---------- 页面外壳文案 ----------

export const dl = {
  title: { zh: "第 2 站 · 数据结构详解", en: "Stop 2 · Data Structures in Depth" },
  subtitle: {
    zh: "把 value 能装的每种结构一种种拆开：心智模型 + 命令 + 用途 + 底层编码 + 面试深挖",
    en: "Every structure a value can hold, taken apart one by one: mental model + commands + uses + encoding + interview probes",
  },

  // 开场：先破误解 —— key 永远是 string，变的是 value 的类型
  introTitle: {
    zh: "先破一个误解：Redis 不只是“存字符串”",
    en: "Bust one myth first: Redis isn't just “string storage”",
  },
  intro: {
    zh:
      "很多人以为 Redis 就是存字符串的 [[keyvalue:key-value]]。更准确的说法是：**key 永远是字符串，变化的是 value 的类型**。" +
      "Redis 之所以被叫作“**数据结构服务器**”（data structure server）而不只是缓存，正是因为 value 可以是好几种结构，每种都配一套**专属命令**。" +
      "下面把它们一种种拆开——点上面的标签切换。每种都讲：怎么想它、常用命令、真实用途、[[encoding:底层编码]]、以及面试会怎么追问。",
    en:
      "Many people think Redis just stores strings under a [[keyvalue:key-value]] map. More precisely: **keys are always strings; what varies is the value's type**. " +
      "Redis is called a “**data structure server**”, not merely a cache, exactly because a value can be several structures, each with its own command set. " +
      "Let's take them apart one at a time — switch with the tabs above. For each: how to think about it, key commands, real uses, [[encoding:underlying encoding]], and how interviewers probe deeper.",
  },

  // 分区标签
  tabCore: { zh: "核心五种", en: "Core five" },
  tabSpecial: { zh: "专用类型", en: "Specialized" },
  tabEncoding: { zh: "底层编码", en: "Encodings" },

  // 详情面板小标题
  secModel: { zh: "怎么想它", en: "Mental model" },
  secCmd: { zh: "常用命令", en: "Key commands" },
  secUse: { zh: "真实用途", en: "Real uses" },
  secShip: { zh: "在 WeShipItNow 里", en: "In WeShipItNow" },
  secEnc: { zh: "底层编码", en: "Underlying encoding" },
  secProbe: { zh: "面试深挖", en: "Interview probes" },

  probeQ: { zh: "追问", en: "Probe" },
  probeA: { zh: "这样答", en: "Answer" },

  // 专用类型区
  specialTitle: { zh: "专用类型：能提到就是加分项", en: "Specialized types: bonus points if you mention them" },
  specialIntro: {
    zh: "这几个严格说不都是“独立类型”（有的建在 String / Sorted Set 之上），但各有一套独立命令，面试里点到就显专业。",
    en: "Strictly speaking not all are separate types (some are built on String / Sorted Set), but each has its own command set — naming them signals depth.",
  },

  // 底层编码区
  encTitle: { zh: "底层编码：那句“专门优化”到底指什么", en: "Encodings: what “purpose-built” actually means" },
  encIntro: {
    zh:
      "同一个类型，Redis 会根据**数据大小自动切换内部编码**——小的时候用省内存的紧凑结构，大了换成查得快的结构。" +
      "这就是第 1 站那句“底层有专门优化”的具体含义，也是面试显深度的地方。",
    en:
      "For the same type, Redis **auto-switches its internal encoding by data size** — a compact, memory-thrifty layout when small; a fast-at-scale layout when large. " +
      "This is what “purpose-built implementation” from Stop 1 concretely means — and where you show depth in interviews.",
  },
  encColType: { zh: "类型", en: "Type" },
  encColSmall: { zh: "小数据（省内存）", en: "Small (memory-thrifty)" },
  encColLarge: { zh: "大数据（查得快）", en: "Large (fast at scale)" },

  encStar: {
    zh:
      "**最该记住这一对：Sorted Set = 跳表(skiplist) + 哈希表(hashtable)。** 哈希表让“成员 → 分数”做到 O(1) 查；" +
      "跳表让“按分数排名 / 范围”做到 O(log n) 查。一个结构同时满足“随机查”和“有序范围查”——这就是它既能当排行榜又快的原因。",
    en:
      "**The pair to memorize: Sorted Set = skiplist + hashtable.** The hashtable gives O(1) “member → score” lookups; " +
      "the skiplist gives O(log n) “rank / range by score”. One structure serves both random lookup and ordered range queries — that's why it's a fast leaderboard.",
  },

  // 通用深挖（不绑定某一种结构）
  bossTitle: { zh: "压轴通用深挖：不管哪种结构都可能被问", en: "Boss-level probes: asked regardless of structure" },

  toPrev: { zh: "← 回第 1 站", en: "← Back to Stop 1" },
  toNext: { zh: "下一站：我们为什么用它 →", en: "Next stop: why we use it →" },
};

// ---------- 五种核心结构 ----------

export const structures: Structure[] = [
  {
    id: "string",
    name: { zh: "String 字符串", en: "String" },
    tag: {
      zh: "一个格子存一个值：文本、数字，甚至二进制（≤ 512MB）",
      en: "One slot, one value: text, a number, even binary (≤ 512MB)",
    },
    model: {
      zh:
        "最基础的类型，也是你最常用的。一个 key 对应一个值。别被“字符串”骗了——它也能存数字，而且 Redis 提供**原子的** [[atomic:INCR/DECR]] 直接加减，" +
        "不用把值取出来加一再写回去。value 甚至可以是一整坨 JSON 或二进制。",
      en:
        "The most basic type, and the one you'll use most. One key maps to one value. Don't let “string” fool you — it also holds numbers, and Redis offers [[atomic:atomic]] INCR/DECR " +
        "to add/subtract in place, no read-modify-write. A value can even be a whole JSON blob or binary.",
    },
    commands: [
      { cmd: "SET name \"Wayne\"", note: { zh: "存一个值", en: "store a value" } },
      { cmd: "GET name", note: { zh: "按 key 取回", en: "read by key" } },
      { cmd: "SET otp 123456 EX 30", note: { zh: "存并设 30 秒 TTL", en: "store with a 30s TTL" } },
      { cmd: "INCR page:views", note: { zh: "原子 +1（计数器）", en: "atomic +1 (counter)" } },
      { cmd: "SET lock v NX EX 10", note: { zh: "不存在才写（占位/幂等）", en: "write only if absent (claim/idempotency)" } },
      { cmd: "MGET k1 k2 k3", note: { zh: "一次取多个", en: "read several at once" } },
    ],
    uses: [
      { zh: "缓存一整坨结果（如一份聚合好的 JSON）", en: "cache a whole result (e.g. one aggregated JSON)" },
      { zh: "计数器：页面浏览量、限流计数、失败次数", en: "counters: page views, rate-limit counts, failed attempts" },
      { zh: "开关 / 特性标志 / 验证码 / session token", en: "flags / feature toggles / OTPs / session tokens" },
      { zh: "分布式锁、幂等占位（配合 NX + TTL）", en: "distributed locks, idempotency claims (with NX + TTL)" },
    ],
    ship: {
      zh: "我们系统里三处 Redis 用法**全是 String**：运费报价存成 JSON 字符串、幂等 key、余额投影。可见 String 的覆盖面有多广。",
      en: "All three Redis uses in our system are Strings: the rate quote as a JSON string, the idempotency key, and the balance projection. String carries a lot.",
    },
    encoding: {
      zh: "三种编码：`int`（值是整数时直接按整数存，最省）、`embstr`（≤ 44 字节的短串，和对象头连在一起分配）、`raw`（更长的串）。",
      en: "Three encodings: `int` (integer values stored as ints — cheapest), `embstr` (short strings ≤ 44 bytes, allocated inline with the header), `raw` (longer strings).",
    },
    probes: [
      {
        q: { zh: "计数为什么用 INCR，不用 GET 出来 +1 再 SET？", en: "Why INCR for counters instead of GET, +1, SET?" },
        a: {
          zh: "因为 INCR 是[[atomic:原子]]的。GET+SET 是两步，并发下两个请求可能都读到同一个旧值，各自 +1 写回，就少算了一次（竞态）。INCR 在单线程里一步到位，绝不会丢更新。",
          en: "Because INCR is [[atomic:atomic]]. GET+SET is two steps; under concurrency two requests can read the same old value, each +1 and write back, losing one increment (a race). INCR does it in one step on the single thread — no lost updates.",
        },
      },
      {
        q: { zh: "一个 String 最大能存多大？", en: "What's the max size of a String?" },
        a: { zh: "512MB。但别真存这么大——单线程下操作大 value 会拖慢所有人（见“大 key”那条）。", en: "512MB. But don't — operating on a huge value blocks everyone on the single thread (see the “big key” probe)." },
      },
    ],
  },
  {
    id: "list",
    name: { zh: "List 列表", en: "List" },
    tag: {
      zh: "一排有序的字符串，两头都能快速进出（像双端链表）",
      en: "An ordered row of strings, fast push/pop at both ends (a deque)",
    },
    model: {
      zh:
        "按插入顺序排列的一串字符串，两端进出都很快。左边 LPUSH、右边 RPOP，就是一个先进先出的队列；同一端进出就是栈。" +
        "还有阻塞版 BRPOP：没数据时消费者挂起等着，一来就取——这样能拼出一个简易的工作队列。",
      en:
        "A sequence of strings in insertion order, fast in/out at both ends. LPUSH on the left, RPOP on the right = a FIFO queue; same-end in/out = a stack. " +
        "There's also a blocking BRPOP: the consumer parks until data arrives — enough to hand-roll a simple work queue.",
    },
    commands: [
      { cmd: "LPUSH q job1", note: { zh: "从左边加入", en: "push on the left" } },
      { cmd: "RPOP q", note: { zh: "从右边取出（FIFO）", en: "pop from the right (FIFO)" } },
      { cmd: "LRANGE q 0 -1", note: { zh: "看全部（0 到末尾）", en: "view all (0 to end)" } },
      { cmd: "LLEN q", note: { zh: "长度", en: "length" } },
      { cmd: "BRPOP q 5", note: { zh: "阻塞取，最多等 5 秒", en: "blocking pop, wait up to 5s" } },
      { cmd: "LTRIM q 0 99", note: { zh: "只留最近 100 条", en: "keep only the latest 100" } },
    ],
    uses: [
      { zh: "简易队列：生产者 LPUSH，消费者 BRPOP", en: "simple queue: producer LPUSH, consumer BRPOP" },
      { zh: "栈 / 最近浏览 / “最新 N 条”（配 LTRIM 定长）", en: "stack / recently viewed / “latest N” (LTRIM to cap)" },
      { zh: "把一批任务缓冲起来慢慢处理", en: "buffer a batch of tasks to process gradually" },
    ],
    ship: {
      zh: "买标签后的“下游事件”可以先 LPUSH 进队列慢慢消费——但**真上生产别用 List 当可靠队列**，理由见深挖。",
      en: "Post-purchase downstream events could be LPUSH'd into a queue to consume gradually — but don't use a List as a reliable queue in production; see the probe.",
    },
    encoding: {
      zh: "`listpack`（元素少时，一整块连续内存，省又快）→ 变大后转 `quicklist`（由多个 listpack 串成的链表，兼顾内存和两端操作）。",
      en: "`listpack` (few elements: one contiguous block, small and fast) → grows into `quicklist` (a linked list of listpacks, balancing memory and end operations).",
    },
    probes: [
      {
        q: { zh: "用 List 当消息队列有什么问题？", en: "What's wrong with a List as a message queue?" },
        a: {
          zh: "没有消息确认(ack)、没有重试、没有消费者组。消费者 RPOP 出来还没处理完就崩了，这条消息就丢了。要**可靠**得用 [[stream:Stream]] 或专门的 MQ——这正好呼应我们系统里“别把 List 说成生产级队列”的诚实口径。",
          en: "No acknowledgements, no retries, no consumer groups. If a consumer RPOPs a message and crashes before finishing, it's lost. For reliability use a [[stream:Stream]] or a real MQ — matching our system's honest line about not overclaiming a List as a production queue.",
        },
      },
    ],
  },
  {
    id: "hash",
    name: { zh: "Hash 哈希", en: "Hash" },
    tag: {
      zh: "一个 key 下挂一堆 字段 → 值，像个小对象 / 字典",
      en: "One key holding many field → value pairs, like a small object",
    },
    model: {
      zh:
        "把一个对象拆成字段存在同一个 key 下。好处是能**只读或只改其中一个字段**，不用把整个对象读出来、改完再整个写回去。" +
        "比如用户档案 `{ name, city, role }`，改个 city 就 HSET 一下那个字段。",
      en:
        "Store an object as fields under one key. The win: you can read or update a single field without pulling the whole object out, editing, and writing it all back. " +
        "E.g. a profile `{ name, city, role }` — change city with a single HSET on that field.",
    },
    commands: [
      { cmd: "HSET user:1 name Wayne city SF", note: { zh: "设多个字段", en: "set multiple fields" } },
      { cmd: "HGET user:1 city", note: { zh: "取一个字段", en: "get one field" } },
      { cmd: "HGETALL user:1", note: { zh: "取全部字段", en: "get all fields" } },
      { cmd: "HINCRBY user:1 logins 1", note: { zh: "某字段原子 +1", en: "atomic +1 on a field" } },
      { cmd: "HDEL user:1 city", note: { zh: "删一个字段", en: "delete a field" } },
    ],
    uses: [
      { zh: "存对象且要频繁改单字段（用户资料、配置）", en: "store an object with frequent single-field edits (profiles, config)" },
      { zh: "每字段计数（一个购物车里各商品数量）", en: "per-field counters (item quantities in a cart)" },
      { zh: "省内存地存大量小对象", en: "memory-efficient storage of many small objects" },
    ],
    ship: {
      zh: "如果报价缓存需要“单独更新某个承运商的价格”，Hash 比“整坨 JSON 字符串”更合适；但我们是整体读整体过期，所以用了 String——**选型看你怎么读写**。",
      en: "If the rate cache needed to update one carrier's price alone, a Hash beats a single JSON string; but we read and expire it as a whole, so we used String — the choice follows your read/write pattern.",
    },
    encoding: {
      zh: "`listpack`（字段少、值短时）→ 超过阈值转 `hashtable`（保证按字段 O(1) 存取）。阈值可调（hash-max-listpack-entries / -value）。",
      en: "`listpack` (few, short fields) → beyond a threshold, `hashtable` (guaranteeing O(1) per-field access). Thresholds are tunable (hash-max-listpack-entries / -value).",
    },
    probes: [
      {
        q: { zh: "Hash 存对象 vs String 存 JSON，怎么选？", en: "Hash vs a JSON String for an object — which?" },
        a: {
          zh: "看读写方式。**频繁只改/只读单个字段** → Hash（HGET/HSET 一个字段就行）。**总是整体读、整体写、整体过期** → String 存 JSON 更简单（一次 GET 拿到、一个 TTL 管全体）。我们的报价缓存属于后者。",
          en: "By access pattern. Frequently editing/reading one field → Hash (HGET/HSET a single field). Always reading/writing/expiring the whole thing → a JSON String is simpler (one GET, one TTL). Our rate cache is the latter.",
        },
      },
    ],
  },
  {
    id: "set",
    name: { zh: "Set 集合", en: "Set" },
    tag: {
      zh: "一堆不重复的字符串，无序；擅长去重、判存在、求交并差",
      en: "Unordered unique strings; great at dedup, membership, set algebra",
    },
    model: {
      zh:
        "元素**自动去重**，且能 O(1) 判断“某个值在不在里面”。更强的是集合运算：两个 Set 求交集（共同好友）、并集、差集，一条命令搞定。",
      en:
        "Elements are auto-deduped, and “is X a member?” is O(1). The superpower is set algebra: intersect two Sets (mutual friends), union, difference — each in one command.",
    },
    commands: [
      { cmd: "SADD tags react ts react", note: { zh: "加入（重复的自动忽略）", en: "add (duplicates ignored)" } },
      { cmd: "SISMEMBER tags react", note: { zh: "在不在里面（O(1)）", en: "membership (O(1))" } },
      { cmd: "SCARD tags", note: { zh: "有几个（去重后）", en: "count (deduped)" } },
      { cmd: "SINTER a b", note: { zh: "交集（共同元素）", en: "intersection" } },
      { cmd: "SRANDMEMBER tags 2", note: { zh: "随机取 2 个", en: "2 random members" } },
    ],
    uses: [
      { zh: "去重：唯一标签、去重后的独立访客", en: "dedup: unique tags, distinct visitors" },
      { zh: "判存在：“这个用户点过赞吗 / 抽过奖吗”", en: "membership: “has this user liked / entered?”" },
      { zh: "关系运算：共同好友、共同兴趣（SINTER）", en: "relationships: mutual friends/interests (SINTER)" },
      { zh: "抽奖 / 随机推荐（SRANDMEMBER / SPOP）", en: "raffles / random picks (SRANDMEMBER / SPOP)" },
    ],
    ship: {
      zh: "比如“某账户已用过的一次性优惠码集合”，SADD 进去、SISMEMBER 判重复使用，天然去重。",
      en: "E.g. “one-time promo codes an account has used”: SADD them in, SISMEMBER to block reuse — dedup for free.",
    },
    encoding: {
      zh: "`intset`（成员**全是整数**时，紧凑有序数组）→ `listpack`（少量非整数）→ `hashtable`（大集合，O(1) 判存在）。",
      en: "`intset` (when all members are integers — a compact sorted array) → `listpack` (a few non-integers) → `hashtable` (large sets, O(1) membership).",
    },
    probes: [
      {
        q: { zh: "对两个很大的 Set 做 SINTER 有什么风险？", en: "Risk of SINTER on two large Sets?" },
        a: {
          zh: "复杂度约 O(N×M)，在[[singlethread:单线程]]里跑这么重的命令会**阻塞后面所有请求**。缓解：用 SINTERCARD（只要交集大小、可设上限提前停）、限制集合规模、或把重活挪到离线。这属于“慢命令 + 大 key”问题。",
          en: "It's ~O(N×M); running such a heavy command on the [[singlethread:single thread]] blocks every request behind it. Mitigate with SINTERCARD (only the count, with an early-stop limit), cap set sizes, or move heavy work offline. It's a “slow command + big key” issue.",
        },
      },
    ],
  },
  {
    id: "zset",
    name: { zh: "Sorted Set 有序集合", en: "Sorted Set (ZSet)" },
    tag: {
      zh: "Set 每个成员再带一个分数，自动按分数排序；做排行榜的首选结构",
      en: "A Set where each member carries a score, auto-sorted; the go-to structure for leaderboards",
    },
    model: {
      zh:
        "像 Set 一样成员不重复，但每个成员多带一个**分数(score)**，Redis 自动按分数排好序。于是你能 O(log n) 地插入、按排名/分数范围取一段。" +
        "分数放积分就是排行榜，分数放时间戳就能做滑动窗口限流。",
      en:
        "Like a Set (unique members) but each member carries a **score**, and Redis keeps them sorted by it. So you insert in O(log n) and fetch ranges by rank or score. " +
        "Score = points → leaderboard; score = timestamp → sliding-window rate limiting.",
    },
    commands: [
      { cmd: "ZADD board 230 alice", note: { zh: "加入成员并给分数", en: "add member with a score" } },
      { cmd: "ZINCRBY board 5 alice", note: { zh: "给某成员加分", en: "bump a member's score" } },
      { cmd: "ZREVRANGE board 0 9 WITHSCORES", note: { zh: "分数最高的前 10 名", en: "top 10 by score" } },
      { cmd: "ZRANK board alice", note: { zh: "某成员当前排名", en: "a member's rank" } },
      { cmd: "ZRANGEBYSCORE win 0 1000", note: { zh: "按分数范围取（做限流）", en: "range by score (rate limit)" } },
      { cmd: "ZREMRANGEBYSCORE win 0 500", note: { zh: "删掉分数在区间内的（清窗口）", en: "drop a score range (trim window)" } },
    ],
    uses: [
      { zh: "排行榜 / Top N（分数 = 积分）", en: "leaderboards / Top N (score = points)" },
      { zh: "滑动窗口限流（分数 = 时间戳）", en: "sliding-window rate limiting (score = timestamp)" },
      { zh: "优先级队列 / 延时队列（分数 = 优先级或到期时间）", en: "priority / delay queues (score = priority or due time)" },
      { zh: "按时间排序的信息流 / 排程", en: "time-ordered feeds / scheduling" },
    ],
    ship: {
      zh: "想给账户做“最近一分钟请求数”限流？ZADD 用时间戳当分数记每次请求，ZREMRANGEBYSCORE 删掉一分钟前的，ZCARD 数一下就知道有没有超。",
      en: "Rate-limit an account by “requests in the last minute”? ZADD each request with a timestamp score, ZREMRANGEBYSCORE to drop those older than a minute, ZCARD to count — over the limit or not.",
    },
    encoding: {
      zh: "`listpack`（成员少时）→ 变大转 **`skiplist`(跳表) + `hashtable`(哈希表)** 双结构。见下方“底层编码”，这是面试最爱问的一处。",
      en: "`listpack` (few members) → grows into a dual **`skiplist` + `hashtable`**. See “Encodings” below — a favorite interview spot.",
    },
    probes: [
      {
        q: { zh: "为什么 ZSet 既能 O(1) 查分数、又能 O(log n) 排序？", en: "Why can a ZSet do O(1) score lookup and O(log n) ordering?" },
        a: {
          zh: "因为它同时维护两套结构：**哈希表**存“成员 → 分数”，让 ZSCORE 这类查 O(1)；**跳表**按分数把成员串起来，让 ZRANGE/ZRANK 这类按序范围查 O(log n)。两者指向同一批成员，靠空间换来两种都快。",
          en: "It maintains two structures at once: a **hashtable** for “member → score” (O(1) ZSCORE), and a **skiplist** ordering members by score (O(log n) ZRANGE/ZRANK). Both point at the same members — spending memory to make both fast.",
        },
      },
      {
        q: { zh: "用 ZSet 做滑动窗口限流，具体怎么做？", en: "How exactly do you build sliding-window rate limiting with a ZSet?" },
        a: {
          zh: "每个用户一个 ZSet。来一个请求：ZADD 用当前时间戳既当分数又当成员；ZREMRANGEBYSCORE 删掉“现在−窗口”之前的旧记录；ZCARD 数还剩几条，超过阈值就拒绝。整套操作可用 Lua 脚本或 MULTI 保证原子。",
          en: "One ZSet per user. On a request: ZADD with the current timestamp as both score and member; ZREMRANGEBYSCORE to drop entries older than now−window; ZCARD to count what's left; reject if over the limit. Wrap it in a Lua script or MULTI for atomicity.",
        },
      },
    ],
  },
];

// ---------- 专用类型 ----------

export type Special = { id: string; name: L; based: L; what: L; cmds: string; use: L };

export const specials: Special[] = [
  {
    id: "bitmap",
    name: { zh: "Bitmap 位图", en: "Bitmap" },
    based: { zh: "建在 String 上", en: "built on String" },
    what: {
      zh: "把一个 String 当成一排二进制位来操作。1 个用户 1 个 bit——几百万用户也才几 MB，极省内存。",
      en: "Treat a String as a row of bits. 1 bit per user — millions fit in a few MB. Extremely memory-thrifty.",
    },
    cmds: "SETBIT / GETBIT / BITCOUNT",
    use: { zh: "日活统计、签到、布尔特性开关", en: "daily-active tracking, check-ins, boolean flags" },
  },
  {
    id: "hll",
    name: { zh: "HyperLogLog", en: "HyperLogLog" },
    based: { zh: "概率算法", en: "probabilistic" },
    what: {
      zh: "用固定约 12KB 就能**估算**“有多少个不重复的东西”，误差约 0.81%，与数据量无关。用 Set 精确统计会爆内存时用它。",
      en: "Estimate “how many unique things” in a fixed ~12KB, ~0.81% error, regardless of cardinality. Use it when an exact Set would blow up memory.",
    },
    cmds: "PFADD / PFCOUNT / PFMERGE",
    use: { zh: "海量独立访客 / UV 估算", en: "massive unique-visitor / UV estimation" },
  },
  {
    id: "geo",
    name: { zh: "Geospatial 地理位置", en: "Geospatial" },
    based: { zh: "建在 Sorted Set 上", en: "built on Sorted Set" },
    what: {
      zh: "存经纬度（把坐标编码成分数塞进 ZSet），然后查“某个半径内有哪些点”。",
      en: "Store lon/lat (coordinates encoded as ZSet scores), then query “which points fall within a radius”.",
    },
    cmds: "GEOADD / GEOSEARCH",
    use: { zh: "“离这个仓库最近的网点”、附近的店", en: "“nearest hub to this warehouse”, nearby stores" },
  },
  {
    id: "stream",
    name: { zh: "Stream 流", en: "Stream" },
    based: { zh: "独立类型（5.0+）", en: "own type (5.0+)" },
    what: {
      zh: "追加式日志 + 消费者组 + 消息确认(ack)。这才是**可靠**的消息队列 / 事件流原语——List 当队列的问题它都解决了。",
      en: "An append-only log + consumer groups + acknowledgements. This is the reliable message-queue / event-log primitive — it fixes what a List-as-queue lacks.",
    },
    cmds: "XADD / XREADGROUP / XACK",
    use: { zh: "可靠事件流、订单下游处理、审计日志", en: "reliable event streams, order downstream, audit logs" },
  },
  {
    id: "pubsub",
    name: { zh: "Pub/Sub 发布订阅", en: "Pub/Sub" },
    based: { zh: "消息，不存储", en: "messaging, not storage" },
    what: {
      zh: "广播消息：发布者发一条，所有订阅者收到。**不持久化**——没人在听就丢了，要可靠用 Stream。",
      en: "Broadcast: a publisher sends, all subscribers receive. Not persisted — if nobody's listening it's gone; use Stream for reliability.",
    },
    cmds: "PUBLISH / SUBSCRIBE",
    use: { zh: "实时通知、房间广播、缓存失效广播", en: "live notifications, room broadcasts, cache-invalidation fan-out" },
  },
];

// ---------- 底层编码表 ----------

export type EncRow = { type: L; small: string; large: string };

export const encodings: EncRow[] = [
  { type: { zh: "String", en: "String" }, small: "int / embstr (≤44B)", large: "raw" },
  { type: { zh: "List", en: "List" }, small: "listpack", large: "quicklist" },
  { type: { zh: "Hash", en: "Hash" }, small: "listpack", large: "hashtable" },
  { type: { zh: "Set", en: "Set" }, small: "intset / listpack", large: "hashtable" },
  { type: { zh: "Sorted Set", en: "Sorted Set" }, small: "listpack", large: "skiplist + hashtable" },
];

// ---------- 压轴通用深挖 ----------

export const bossProbes: Probe[] = [
  {
    q: { zh: "什么是“大 key”，为什么危险？", en: "What's a “big key” and why is it dangerous?" },
    a: {
      zh: "value 特别大（几 MB 的 String、几十万元素的 list/set/zset）就是大 key。因为 Redis 是[[singlethread:单线程]]，对大 key 做 O(N) 的命令（HGETALL、大 SINTER、DEL 一个巨 key）会**长时间占住那唯一的线程**，阻塞其后的所有请求。要拆分大 key、避免一次性全量操作、用渐进式命令（如 SCAN、HSCAN）。",
      en: "A value that's huge (a multi-MB String, or hundreds of thousands of elements in a list/set/zset). Because Redis is [[singlethread:single-threaded]], an O(N) command on a big key (HGETALL, a large SINTER, DELeting a huge key) hogs the one thread and stalls everything behind it. Split big keys, avoid full-scan ops, use progressive commands (SCAN, HSCAN).",
    },
  },
  {
    q: { zh: "为什么单线程还敢用？慢命令怎么办？", en: "Single-threaded — why is that OK, and what about slow commands?" },
    a: {
      zh: "因为绝大多数命令是 O(1)/O(log n)，内存里跑极快，一条接一条也够快，还省了加锁开销（这是第 1 站讲过的）。风险在**慢命令**：KEYS *（全库扫描）、大范围 ZRANGE、大 key 的 O(N) 操作。生产上禁用 KEYS，用 SCAN 迭代；把重活拆小或挪走。",
      en: "Because the vast majority of commands are O(1)/O(log n), blazing fast in memory even back-to-back, with no locking overhead (Stop 1's point). The risk is slow commands: KEYS * (full scan), huge ZRANGE, O(N) ops on big keys. Ban KEYS in production, iterate with SCAN, and break up or offload heavy work.",
    },
  },
  {
    q: { zh: "该怎么给一个需求挑数据结构？", en: "How do you pick a structure for a requirement?" },
    a: {
      zh: "问三件事：① 读写形状——整体读写用 String，改单字段用 Hash；② 要不要有序/排名——要就 Sorted Set；③ 要不要去重/集合运算——要就 Set。再叠加：要计数用 String+INCR，要可靠队列用 Stream，要省内存的布尔用 Bitmap，要海量去重计数用 HyperLogLog。",
      en: "Ask three things: (1) read/write shape — whole-object → String, single-field edits → Hash; (2) need order/ranking? → Sorted Set; (3) need dedup/set algebra? → Set. Then layer on: counters → String+INCR, reliable queue → Stream, memory-thrifty booleans → Bitmap, huge unique counts → HyperLogLog.",
    },
  },
];
