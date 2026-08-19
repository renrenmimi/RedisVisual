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
  title: { zh: "第 2 站 · 数据结构详解", en: "Stop 2 · Data structures in depth" },
  subtitle: {
    zh: "把 value 能装的每种结构一种种拆开：心智模型 + 命令 + 用途 + 底层编码 + 面试深挖",
    en: "Every structure a value can hold, taken one at a time: mental model + commands + uses + encoding + interview probes",
  },

  // 开场：先破误解 —— key 永远是 string，变的是 value 的类型
  introTitle: {
    zh: "先破一个误解：Redis 不只是“存字符串”",
    en: "First, a common misunderstanding: Redis does not only store strings",
  },
  intro: {
    zh:
      "很多人以为 Redis 就是存字符串的 [[keyvalue:key-value]]。更准确的说法是：key 永远是字符串，有类型的是 value。" +
      "Redis 之所以被叫作“数据结构服务器”（data structure server）而不只是缓存，正是因为 value 可以是好几种结构，每种都配一套专属命令。" +
      "下面把它们一种种拆开——点上面的标签切换。每种都讲：怎么想它、常用命令、真实用途、[[encoding:底层编码]]、以及面试会怎么追问。",
    en:
      "Many people think Redis is a [[keyvalue:key-value]] store that only holds strings. More precisely: a key is always a string, and it is the value that has a type. " +
      "Redis is called a \"data structure server\", not just a cache, because a value can be one of several structures, and each structure has its own set of commands. " +
      "The tabs above take them one at a time. For each one: how to think about it, the commands you will actually use, real uses, the [[encoding:underlying encoding]], and the questions an interviewer asks next.",
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
  specialTitle: {
    zh: "专用类型：知道它们各自能干什么、不能干什么",
    en: "Specialized types: worth knowing what each one can and cannot do",
  },
  specialIntro: {
    zh: "这几个严格说不都是“独立类型”（有的建在 String / Sorted Set 之上），但各有一套独立命令，也各有明确的限制——限制才是重点。",
    en: "Strictly speaking, not all of these are separate types — some are built on String or Sorted Set. Each one has its own set of commands and its own limits, and the limits are the interesting part.",
  },

  // 底层编码区
  encTitle: { zh: "底层编码：那句“专门优化”到底指什么", en: "Encodings: what \"purpose-built\" actually means" },
  encIntro: {
    zh:
      "同一个类型，Redis 在内存里可以用不止一种内部布局，并按数据大小自动切换——小的时候用紧凑省内存的，超过配置阈值（如 `hash-max-listpack-entries`）后换成查得更快的。" +
      "编码是 Redis 自己选的，你指定不了，而且值继续变大还会再换；它只影响内存占用和速度，不改变任何命令的语义。这就是第 1 站那句“底层有专门优化”的具体含义。",
    en:
      "One type can be stored in more than one internal layout, and Redis switches between them by size: a compact layout while the value is small, and a faster one once it grows past a configured threshold such as `hash-max-listpack-entries`. " +
      "Redis chooses the encoding, not you, and it can change again as the value grows. It affects memory and speed only — never what a command does. This is what \"purpose-built implementation\" from Stop 1 means in practice.",
  },
  encColType: { zh: "类型", en: "Type" },
  encColSmall: { zh: "小数据（省内存）", en: "Small (saves memory)" },
  encColLarge: { zh: "大数据（查得快）", en: "Large (faster lookup)" },

  encStar: {
    zh:
      "最该记住这一对：Sorted Set = 跳表(skiplist) + 哈希表(hashtable)。哈希表存“成员 → 分数”，所以 ZSCORE 是 O(1)；" +
      "跳表按分数把成员串起来，所以排名和范围查询约 O(log n) 找到起点，再加上实际返回的 m 个元素。" +
      "两套索引指向同一批成员，所以同一个结构既能回答“这个成员多少分”，也能回答“前十名是谁”。代价是每个成员被索引两次，多占内存。",
    en:
      "The pair to remember: Sorted Set = skiplist + hashtable. The hashtable maps member to score, so ZSCORE is O(1). " +
      "The skiplist links the members in score order, so rank and range queries take about O(log n) to find the starting point, plus the m elements you read back. " +
      "Both index the same members, so one structure answers both \"what is this member's score\" and \"who is in the top ten\". The cost is memory: every member is indexed twice.",
  },

  // 通用深挖（不绑定某一种结构）
  bossTitle: { zh: "压轴通用深挖：不管哪种结构都可能被问", en: "General probes: these come up whatever structure you choose" },

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
      en: "One slot holds one value: text, a number, or binary data (up to 512MB)",
    },
    model: {
      zh:
        "最基础的类型，也是你最常用的。一个 key 对应一个值。别被“字符串”这个名字骗了——它也能存数字，而且 Redis 提供[[atomic:原子]]的 INCR/DECR 直接在原地加减，" +
        "不用把值取出来加一再写回去。value 也可以是一整份 JSON 或二进制数据。GET 和 SET 都是 O(1)。",
      en:
        "The most basic type, and the one you will use most. One key holds one value. The name is misleading: the value can also be a number, and Redis has [[atomic:atomic]] INCR and DECR that change it in place, " +
        "so you do not have to read the value, add one, and write it back. A value can also be a whole JSON document or binary data. GET and SET are both O(1).",
    },
    commands: [
      { cmd: "SET name \"Wayne\"", note: { zh: "存一个值", en: "store a value" } },
      { cmd: "GET name", note: { zh: "按 key 取回", en: "read by key" } },
      { cmd: "SET otp 123456 EX 30", note: { zh: "存并设 30 秒 TTL", en: "store with a 30s TTL" } },
      { cmd: "INCR page:views", note: { zh: "原子 +1（计数器）", en: "atomic +1 (counter)" } },
      { cmd: "SET lock v NX EX 10", note: { zh: "不存在才写（占位/幂等）", en: "write only if the key is absent (claim / idempotency)" } },
      { cmd: "MGET k1 k2 k3", note: { zh: "一次取多个", en: "read several keys in one round trip" } },
    ],
    uses: [
      { zh: "缓存一整份结果（如一份聚合好的 JSON）", en: "cache one whole result, such as an aggregated JSON document" },
      { zh: "计数器：页面浏览量、限流计数、失败次数", en: "counters: page views, rate-limit counts, failed attempts" },
      { zh: "开关 / 特性标志 / 验证码 / session token", en: "flags, feature toggles, one-time codes, session tokens" },
      { zh: "分布式锁、幂等占位（配合 NX + TTL）", en: "distributed locks and idempotency claims (SET with NX and a TTL)" },
    ],
    ship: {
      zh: "我们系统里三处 Redis 用法全是 String：运费报价存成 JSON 字符串、幂等 key、余额投影。一个 String 就能覆盖不少日常场景。",
      en: "All three Redis uses in our system are Strings: the rate quote stored as a JSON string, the idempotency key, and the balance projection. One type covers a lot of ordinary work.",
    },
    encoding: {
      zh: "三种编码：`int`（值是整数时直接按整数存，最省内存）、`embstr`（≤ 44 字节的短串，和对象头分配在同一块内存里）、`raw`（更长的串，单独分配）。选哪种由 Redis 自己决定。",
      en: "Three encodings: `int` (a value that is an integer is stored as an integer, which uses the least memory), `embstr` (strings of 44 bytes or fewer, allocated in one block together with the object header), `raw` (longer strings, allocated separately). Redis picks one for you.",
    },
    probes: [
      {
        q: { zh: "计数为什么用 INCR，不用 GET 出来 +1 再 SET？", en: "Why use INCR for a counter instead of GET, add one, SET?" },
        a: {
          zh: "因为 INCR 是[[atomic:原子]]的。GET 再 SET 是两步：两个请求可能读到同一个旧值，各自 +1 写回，结果少算了一次。INCR 把读和改写合成一条命令，而 Redis 一次只执行一条命令，中间插不进别的请求，所以不会丢更新。",
          en: "Because INCR is [[atomic:atomic]]. GET then SET is two steps: two clients can read the same old value, each add one, and write back, so one increment is lost. INCR does the read and the write inside a single command, and Redis executes commands one at a time, so no other client can slip in between.",
        },
      },
      {
        q: { zh: "一个 String 最大能存多大？", en: "How large can a String be?" },
        a: {
          zh: "上限 512MB。但实际要远小于这个数：对一个很大的 value 执行命令会长时间占住执行线程，后面所有请求都得排队（见下面“大 key”那条）。",
          en: "The limit is 512MB. In practice keep values far below that. A command on a very large value holds the execution thread for as long as it runs, and every other request waits behind it (see the \"big key\" probe).",
        },
      },
    ],
  },
  {
    id: "list",
    name: { zh: "List 列表", en: "List" },
    tag: {
      zh: "一排有序的字符串，两头进出都是 O(1)（像双端队列）",
      en: "An ordered row of strings; pushing and popping at either end is O(1)",
    },
    model: {
      zh:
        "按插入顺序排列的一串字符串。两端进出（LPUSH / RPOP 这类）都是 O(1)；用 LRANGE 读一段是 O(s+n)，s 是从头走到区间起点的距离。" +
        "左边 LPUSH、右边 RPOP 就是先进先出的队列；同一端进出就是栈。BRPOP 是阻塞版：没数据时消费者等着，不用反复轮询——够拼出一个简易的工作队列。",
      en:
        "A sequence of strings in insertion order. Pushing or popping at either end is O(1). Reading a range with LRANGE is O(s+n), where s is the distance from the head to the start of the range. " +
        "LPUSH on the left with RPOP on the right gives a FIFO queue; pushing and popping at the same end gives a stack. BRPOP is the blocking version: the consumer waits for an element instead of polling. That is enough to build a simple work queue.",
    },
    commands: [
      { cmd: "LPUSH q job1", note: { zh: "从左边加入", en: "push on the left" } },
      { cmd: "RPOP q", note: { zh: "从右边取出（FIFO）", en: "pop from the right (FIFO)" } },
      { cmd: "LRANGE q 0 -1", note: { zh: "读全部（0 到末尾）", en: "read the whole list (0 to end)" } },
      { cmd: "LLEN q", note: { zh: "长度", en: "length" } },
      { cmd: "BRPOP q 5", note: { zh: "阻塞取，最多等 5 秒", en: "blocking pop, wait up to 5s" } },
      { cmd: "LTRIM q 0 99", note: { zh: "只留最近 100 条", en: "keep only the latest 100" } },
    ],
    uses: [
      { zh: "简易队列：生产者 LPUSH，消费者 BRPOP", en: "simple queue: producer LPUSH, consumer BRPOP" },
      { zh: "栈 / 最近浏览 / 最新 N 条（配 LTRIM 定长）", en: "stack, recently viewed, latest N (LTRIM keeps it capped)" },
      { zh: "把一批任务缓冲起来慢慢处理", en: "buffer a batch of tasks and work through them" },
    ],
    ship: {
      zh: "买标签之后的下游事件可以先 LPUSH 进队列慢慢消费——但真上生产别把 List 当可靠队列，理由见下面的深挖。",
      en: "Downstream events after a label purchase could be pushed into a List and consumed one at a time. In production, though, a List is not a reliable queue — the probe below says why.",
    },
    encoding: {
      zh: "元素少时是 `listpack`（一整块连续内存，省内存也好扫）；超过阈值转成 `quicklist`（由多个 listpack 串成的链表，既压住内存又保住两端操作）。",
      en: "While the list is small it is a `listpack`: one contiguous block, compact and quick to scan. Past the threshold it becomes a `quicklist`, a linked list of listpacks, which keeps memory down while push and pop at both ends stay O(1).",
    },
    probes: [
      {
        q: { zh: "用 List 当消息队列有什么问题？", en: "What is wrong with using a List as a message queue?" },
        a: {
          zh: "没有确认(ack)、没有重试、没有消费者组。消费者 RPOP 拿到消息后还没处理完就崩了，这条消息就没了，而且没有任何记录。要可靠就用 [[stream:Stream]]（消息留在 key 里直到被确认）或专门的消息中间件。这也是我们不把 List 说成生产级队列的原因。",
          en: "There is no acknowledgement, no retry, and no consumer group. If a consumer pops a message and then crashes before finishing the work, the message is gone and nothing records that it was lost. For delivery you can rely on, use a [[stream:Stream]], where the message stays in the key until it is acknowledged, or a dedicated message broker. This is why we do not describe the List as a production queue.",
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
        "把一个对象拆成字段存在同一个 key 下。好处是能只读或只改其中一个字段：HGET / HSET 单个字段是 O(1)，不用把整个对象读出来、改完再整个写回去。" +
        "HGETALL 是 O(n)，n 是字段数，字段多的对象要避免整取。比如用户档案 `{ name, city, role }`，改个 city 就 HSET 那一个字段。",
      en:
        "Store one object as a set of fields under a single key. The point is that you can touch one field on its own: HGET and HSET on a single field are O(1), so you do not read the whole object, edit it, and write it all back. " +
        "HGETALL is O(n) in the number of fields, so avoid it on objects with many fields. For a profile `{ name, city, role }`, changing the city is one HSET on that field.",
    },
    commands: [
      { cmd: "HSET user:1 name Wayne city SF", note: { zh: "设多个字段", en: "set multiple fields" } },
      { cmd: "HGET user:1 city", note: { zh: "取一个字段", en: "get one field" } },
      { cmd: "HGETALL user:1", note: { zh: "取全部字段（字段数 O(n)）", en: "get all fields (O(n) in fields)" } },
      { cmd: "HINCRBY user:1 logins 1", note: { zh: "某字段原子 +1", en: "atomic +1 on a field" } },
      { cmd: "HDEL user:1 city", note: { zh: "删一个字段", en: "delete a field" } },
    ],
    uses: [
      { zh: "存对象且要频繁改单字段（用户资料、配置）", en: "store an object with frequent single-field edits (profiles, config)" },
      { zh: "每字段计数（一个购物车里各商品的数量）", en: "per-field counters, such as item quantities in a cart" },
      { zh: "省内存地存大量小对象", en: "store many small objects with less memory" },
    ],
    ship: {
      zh: "如果报价缓存需要单独更新某个承运商的价格，Hash 比“一整份 JSON 字符串”更合适；但我们是整体读、整体过期，所以用了 String——读写方式决定选型。",
      en: "If the rate cache had to update one carrier's price on its own, a Hash would fit better than a single JSON string. We read the quote as a whole and expire it as a whole, so a String was the simpler choice. The access pattern decides the type.",
    },
    encoding: {
      zh: "字段少、值短时是 `listpack`；超过阈值转 `hashtable`（按字段存取保持 O(1)）。阈值可配置：`hash-max-listpack-entries` 和 `hash-max-listpack-value`。",
      en: "Few short fields are stored as a `listpack`. Past the threshold Redis switches to a `hashtable`, which keeps per-field access at O(1). The thresholds are configurable: `hash-max-listpack-entries` and `hash-max-listpack-value`.",
    },
    probes: [
      {
        q: { zh: "Hash 存对象 vs String 存 JSON，怎么选？", en: "Hash or a JSON String for an object — which one?" },
        a: {
          zh: "看读写方式。经常只读或只改一个字段 → Hash。总是整体读、整体写、整体过期 → String 存 JSON 更简单（一次 GET 拿到、一个 TTL 管全体）。还有一点：TTL 只能加在整个 key 上，Hash 里的单个字段不能单独过期。我们的报价缓存属于后者。",
          en: "It depends on how you read and write it. If you read or change one field at a time, use a Hash. If you always read, write, and expire the whole object, a JSON String is simpler: one GET, one TTL. One more point: a TTL applies to the whole key, so a single field of a Hash cannot expire on its own. Our rate cache is the second case.",
        },
      },
    ],
  },
  {
    id: "set",
    name: { zh: "Set 集合", en: "Set" },
    tag: {
      zh: "一堆不重复的字符串，无序；擅长去重、判存在、求交并差",
      en: "Unique strings with no order: dedup, membership tests, and set operations",
    },
    model: {
      zh:
        "重复的成员加进去等于没加，所以 Set 天然去重。SADD 和 SISMEMBER 都是 O(1)，判断“这个值在不在里面”很便宜。" +
        "此外 Redis 能在服务端直接做集合运算：交集（共同好友）、并集、差集各一条命令。但这些命令要遍历成员，集合越大越贵——见下面的深挖。",
      en:
        "Adding a member that is already there changes nothing, so a Set removes duplicates for you. SADD and SISMEMBER are both O(1), which makes \"is this value in the set?\" cheap. " +
        "Redis can also combine sets on the server: intersection (mutual friends), union, and difference, each in one command. Those commands have to walk the members, so they get expensive on large sets — see the probe below.",
    },
    commands: [
      { cmd: "SADD tags react ts react", note: { zh: "加入（重复的等于没加）", en: "add (a repeat changes nothing)" } },
      { cmd: "SISMEMBER tags react", note: { zh: "在不在里面（O(1)）", en: "is it a member (O(1))" } },
      { cmd: "SCARD tags", note: { zh: "有几个成员", en: "how many members" } },
      { cmd: "SINTER a b", note: { zh: "交集（两边都有的）", en: "members that are in both" } },
      { cmd: "SRANDMEMBER tags 2", note: { zh: "随机取 2 个", en: "2 random members" } },
    ],
    uses: [
      { zh: "去重：唯一标签、去重后的独立访客", en: "dedup: unique tags, distinct visitors" },
      { zh: "判存在：这个用户点过赞吗 / 抽过奖吗", en: "membership: has this user liked the post, or entered the draw?" },
      { zh: "关系运算：共同好友、共同兴趣（SINTER）", en: "relationships: mutual friends or shared interests (SINTER)" },
      { zh: "抽奖 / 随机推荐（SRANDMEMBER / SPOP）", en: "raffles and random picks (SRANDMEMBER / SPOP)" },
    ],
    ship: {
      zh: "比如“某账户已经用过的一次性优惠码”：SADD 加进去，再用 SISMEMBER 拦住重复使用——一条 O(1) 的命令就够，也不用自己去重。",
      en: "For example, the one-time promo codes an account has already used: SADD each code, then SISMEMBER to block a second use. The check is one O(1) command, and the Set keeps the list free of duplicates by itself.",
    },
    encoding: {
      zh: "成员全是整数且数量不多时是 `intset`（紧凑的有序整数数组）；有少量非整数成员时是 `listpack`；再大转 `hashtable`（判存在保持 O(1)）。",
      en: "When every member is an integer and there are not many, the Set is an `intset`: a compact sorted array of integers. A few non-integer members make it a `listpack`. Larger sets become a `hashtable`, which keeps membership tests at O(1).",
    },
    probes: [
      {
        q: { zh: "对两个很大的 Set 做 SINTER 有什么风险？", en: "What is the risk of running SINTER on two large Sets?" },
        a: {
          zh: "SINTER 会遍历最小的那个集合，再拿每个成员去其它集合里判存在，复杂度 O(N×M)：N 是最小集合的成员数，M 是参与运算的集合个数。所以只要最小的那个仍有几百万成员，这条命令就会跑很久；而 Redis [[singlethread:一次只执行一条命令]]，后面所有客户端都得等它。缓解：只要交集大小就用 SINTERCARD（可以带 LIMIT 提前停）、控制集合规模、或者把这类重活放到 Redis 之外算。这属于“慢命令打在大 key 上”的问题。",
          en: "SINTER walks the smallest set and checks each of its members against the others, so it is O(N×M): N is the number of members in the smallest set and M is the number of sets. If that smallest set still holds millions of members, the command runs for a long time, and because Redis [[singlethread:runs one command at a time]], every other client waits for it. If you only need the size of the intersection, SINTERCARD takes a LIMIT and stops early. Otherwise keep the sets smaller, or compute the intersection outside Redis. This is the \"slow command on a big key\" problem.",
        },
      },
    ],
  },
  {
    id: "zset",
    name: { zh: "Sorted Set 有序集合", en: "Sorted Set (ZSet)" },
    tag: {
      zh: "Set 的每个成员再带一个分数，自动按分数排序；排行榜通常就用它",
      en: "A Set where each member carries a score and stays in score order — the usual choice for a leaderboard",
    },
    model: {
      zh:
        "成员像 Set 一样不重复，但每个成员多带一个分数(score)，Redis 按分数把成员排好序。ZADD 是 O(log n)；按排名或分数取一段是 O(log n + m)，m 是返回的元素个数。" +
        "分数放积分就是排行榜，分数放时间戳就能做滑动窗口限流。",
      en:
        "Members are unique, as in a Set, but each one carries a score and Redis keeps the members ordered by it. ZADD is O(log n). Reading a range by rank or by score is O(log n + m), where m is the number of elements returned. " +
        "Use points as the score and you have a leaderboard; use a timestamp as the score and you have a sliding window for rate limiting.",
    },
    commands: [
      { cmd: "ZADD board 230 alice", note: { zh: "加入成员并给分数", en: "add a member with a score" } },
      { cmd: "ZINCRBY board 5 alice", note: { zh: "给某成员加分", en: "raise a member's score" } },
      { cmd: "ZREVRANGE board 0 9 WITHSCORES", note: { zh: "分数最高的前 10 名", en: "top 10 by score" } },
      { cmd: "ZRANK board alice", note: { zh: "某成员当前排名", en: "a member's current rank" } },
      { cmd: "ZRANGEBYSCORE win 0 1000", note: { zh: "按分数范围取（做限流）", en: "range by score (rate limiting)" } },
      { cmd: "ZREMRANGEBYSCORE win 0 500", note: { zh: "删掉分数在区间内的（清窗口）", en: "drop a score range (trim the window)" } },
    ],
    uses: [
      { zh: "排行榜 / Top N（分数 = 积分）", en: "leaderboards and Top N (score = points)" },
      { zh: "滑动窗口限流（分数 = 时间戳）", en: "sliding-window rate limiting (score = timestamp)" },
      { zh: "优先级队列 / 延时队列（分数 = 优先级或到期时间）", en: "priority and delay queues (score = priority or due time)" },
      { zh: "按时间排序的信息流 / 排程", en: "time-ordered feeds and scheduling" },
    ],
    ship: {
      zh: "想给账户做“最近一分钟请求数”限流？每次请求用时间戳当分数 ZADD 一条记录，ZREMRANGEBYSCORE 删掉一分钟前的，再用 ZCARD 数一下和阈值比。",
      en: "To limit an account to N requests per minute: ZADD one entry per request with its timestamp as the score, ZREMRANGEBYSCORE to remove entries older than one minute, then ZCARD to count what is left and compare it with the limit.",
    },
    encoding: {
      zh: "成员少且短时是 `listpack`；变大后转成两套结构一起用：`skiplist`（跳表）+ `hashtable`（哈希表）。见“底层编码”标签页——这是面试最爱问的一处。",
      en: "Few short members are stored as a `listpack`. Past the threshold it becomes two structures used together: a `skiplist` and a `hashtable`. See the \"Encodings\" tab — this pair comes up often in interviews.",
    },
    probes: [
      {
        q: { zh: "为什么 ZSet 既能 O(1) 查分数、又能按序做范围查？", en: "How can a ZSet look up a score in O(1) and still answer range queries in order?" },
        a: {
          zh: "因为它对同一批成员同时维护两套结构：哈希表存“成员 → 分数”，所以 ZSCORE 这类查是 O(1)；跳表按分数把成员串起来，所以 ZRANK、ZRANGE 约 O(log n) 找到起点，再加上实际返回的 m 个元素。代价是每个成员被索引两次，用内存换两种查询都快。",
          en: "It keeps two structures over the same members. A hashtable maps member to score, so ZSCORE is O(1). A skiplist links the members in score order, so ZRANK and ZRANGE take about O(log n) to find the starting point, plus the m elements returned. The cost is memory: every member is indexed twice.",
        },
      },
      {
        q: { zh: "用 ZSet 做滑动窗口限流，具体怎么做？", en: "How exactly do you build sliding-window rate limiting with a ZSet?" },
        a: {
          zh: "每个用户一个 ZSet。来一个请求：① ZADD，分数用当前时间戳，成员用一个唯一 id——别拿时间戳当成员，同一毫秒的两个请求会被当成同一个成员，少算一次；② ZREMRANGEBYSCORE 删掉“现在−窗口”之前的旧记录；③ ZCARD 数还剩几条，超过阈值就拒绝。三条命令放进一个 Lua 脚本或 MULTI 里执行，中间不会被别的客户端插进来。另外给这个 key 设个 TTL，不再发请求的用户就不会一直占着内存。",
          en: "Keep one ZSet per user. On each request: (1) ZADD with the current timestamp as the score and a unique id as the member — do not use the timestamp as the member, or two requests in the same millisecond count as one; (2) ZREMRANGEBYSCORE to remove entries older than now minus the window; (3) ZCARD to count what is left, and reject the request if the count is over the limit. Run the three commands in one Lua script, or inside MULTI/EXEC, so no other client interleaves. Give the key a TTL as well, so a user who stops sending requests does not hold memory forever.",
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
      zh: "把一个 String 当成一排二进制位，按偏移量读写。1 个用户 1 个 bit：一百万用户约 125KB。Redis 会一直分配到你写过的最大偏移量，所以 id 要密集——在偏移量 10,000,000 上写一个 bit，就要占掉约 1.2MB。",
      en: "Treat a String as a row of bits addressed by offset. One bit per user id: a million users take about 125KB. Redis allocates up to the highest offset you write, so keep the ids dense — setting one bit at offset 10,000,000 allocates about 1.2MB.",
    },
    cmds: "SETBIT / GETBIT / BITCOUNT",
    use: { zh: "日活统计、签到、按 id 的布尔标志", en: "daily-active tracking, check-ins, one boolean per id" },
  },
  {
    id: "hll",
    name: { zh: "HyperLogLog", en: "HyperLogLog" },
    based: { zh: "概率算法", en: "probabilistic" },
    what: {
      zh: "用固定约 12KB 估算“有多少个不重复的东西”，标准误差约 0.81%，和数据量无关。它只能回答“有多少个”——列不出成员，也判断不了某个成员在不在。精确统计会撑爆内存时才用它。",
      en: "Counts distinct items approximately: about 12KB whatever the count, with a standard error near 0.81%. It answers \"how many\" only — it cannot list the members or test whether one is present. Use it when an exact Set would need too much memory.",
    },
    cmds: "PFADD / PFCOUNT / PFMERGE",
    use: { zh: "海量独立访客 / UV 估算", en: "approximate unique visitors (UV) at large scale" },
  },
  {
    id: "geo",
    name: { zh: "Geospatial 地理位置", en: "Geospatial" },
    based: { zh: "建在 Sorted Set 上", en: "built on Sorted Set" },
    what: {
      zh: "把一对经纬度编码成一个分数存进 Sorted Set，然后查“哪些点落在这个半径内”。它底下就是 ZSet，ZREM 之类的命令照样能用。",
      en: "Encodes a longitude and latitude pair into a single Sorted Set score, then answers \"which points fall within this radius\". It is a Sorted Set underneath, so ZSet commands such as ZREM still work on it.",
    },
    cmds: "GEOADD / GEOSEARCH",
    use: { zh: "离某个仓库最近的网点、附近的店", en: "nearest hub to a warehouse, nearby stores" },
  },
  {
    id: "stream",
    name: { zh: "Stream 流", en: "Stream" },
    based: { zh: "独立类型（5.0+）", en: "own type (5.0+)" },
    what: {
      zh: "追加式日志：消息被读走之后仍然留在 key 里，再配上消费者组和确认(ack)。没被确认的消息可以重新领取，这正是 List 当队列做不到的。代价是要自己裁剪（XADD 带 MAXLEN），否则会一直增长。",
      en: "An append-only log: a message stays in the key after it is read, with consumer groups and acknowledgements on top. A message nobody acknowledged can be claimed again, which a List cannot do. You have to trim it yourself (XADD with MAXLEN) or it grows without limit.",
    },
    cmds: "XADD / XREADGROUP / XACK",
    use: { zh: "可靠事件流、订单下游处理、审计日志", en: "event streams you can replay, downstream order processing, audit logs" },
  },
  {
    id: "pubsub",
    name: { zh: "Pub/Sub 发布订阅", en: "Pub/Sub" },
    based: { zh: "消息，不存储", en: "messaging, not storage" },
    what: {
      zh: "发布者发一条，当时正在订阅的客户端都收到。消息不保存：断线或正在重连的订阅者会漏掉这期间的消息，既没有确认也无法回放。不能丢的消息要用 Stream。",
      en: "A publisher sends a message and every client subscribed at that moment receives it. Nothing is stored: a subscriber that is disconnected, or still reconnecting, misses whatever was sent meanwhile, and there is no acknowledgement and no replay. Use a Stream when the message must not be lost.",
    },
    cmds: "PUBLISH / SUBSCRIBE",
    use: { zh: "实时通知、房间广播、缓存失效广播", en: "live notifications, room broadcasts, cache-invalidation messages" },
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
    q: { zh: "什么是“大 key”，为什么危险？", en: "What is a \"big key\", and why is it dangerous?" },
    a: {
      zh: "value 特别大就是大 key：几 MB 的 String，或者几十万成员的 list / set / zset。Redis [[singlethread:一次只执行一条命令]]，所以对大 key 执行 O(n) 的命令（HGETALL、大集合上的 SINTER、DEL 一个巨大的集合）会长时间占住执行线程，后面所有请求排队等着。做法：把大 key 拆小；用 SCAN、HSCAN 这类游标命令分批读，别一次全量取；删大集合用 UNLINK 代替 DEL，让内存由后台线程回收。",
      en: "A key whose value is very large: a String of several MB, or a list, set, or sorted set with hundreds of thousands of members. Redis [[singlethread:runs one command at a time]], so an O(n) command on such a key — HGETALL, SINTER on a large set, DEL on a huge collection — holds the execution thread for as long as it takes, and every other request waits. Split large keys into smaller ones, read them in batches with cursor commands such as SCAN and HSCAN instead of fetching everything at once, and delete large collections with UNLINK instead of DEL so a background thread frees the memory.",
    },
  },
  {
    q: { zh: "一次只跑一条命令为什么还够快？慢命令怎么办？", en: "Why is running one command at a time fast enough, and what about slow commands?" },
    a: {
      zh: "因为绝大多数命令是 O(1) 或 O(log n)，数据又在内存里，单条命令是微秒级；一条条执行还省掉了加锁的开销（第 1 站讲过）。注意“单线程”说的是命令执行：Redis 6 之后可以用额外的线程收发网络数据，但命令仍然是一条条执行的。风险在慢命令：KEYS 要扫整个键空间，是 O(n) 而且会阻塞服务器直到扫完；范围很大的 ZRANGE 要返回 m 个元素；大 key 上的 O(n) 操作同理。生产上用 SCAN 代替 KEYS——SCAN 用游标一批批返回、不阻塞，代价是可能返回重复的 key，也不保证是某一时刻的一致快照。重活要么拆成小命令，要么挪出 Redis。",
      en: "Most commands are O(1) or O(log n) and the data is already in memory, so a single command finishes in microseconds, and running them one at a time also removes the cost of locking (the Stop 1 point). One clarification on \"single-threaded\": since Redis 6, extra threads can read and write network sockets, but commands are still executed one at a time. The risk is the slow ones. KEYS scans the whole keyspace, so it is O(n) and blocks the server until it finishes. A very wide ZRANGE has to return m elements, and an O(n) command on a big key is slow for the same reason. In production use SCAN instead of KEYS: it returns a cursor and one batch at a time and does not block, at the price of possibly returning the same key twice and never giving a consistent snapshot of the keyspace. Break heavy work into smaller commands, or move it out of Redis.",
    },
  },
  {
    q: { zh: "该怎么给一个需求挑数据结构？", en: "How do you choose a structure for a requirement?" },
    a: {
      zh: "问三件事：① 读写形状——整体读写用 String，经常改单个字段用 Hash；② 要不要顺序或排名——要就 Sorted Set；③ 要不要去重或集合运算——要就 Set。再叠加专用类型：计数用 String + INCR；不能丢消息的队列用 Stream；按密集 id 存布尔值用 Bitmap；能接受估算的去重计数用 HyperLogLog。",
      en: "Ask three questions. (1) The read and write shape: reading and writing the whole object points to a String; frequent edits to single fields point to a Hash. (2) Do you need order or ranking? Then a Sorted Set. (3) Do you need uniqueness or set operations? Then a Set. After that the specialized types: a counter is a String with INCR; a queue whose messages must not be lost is a Stream; one boolean per id, when the ids are dense, is a Bitmap; a distinct count you can afford to approximate is a HyperLogLog.",
    },
  },
];
