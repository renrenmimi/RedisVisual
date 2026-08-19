// 第 5 站「生产机制」的全部双语文案数据。
// 主题：Redis 上了生产、面试后半程才见真章的四类机制——
//   持久化 / 过期淘汰 / 高可用与扩展 / 事务与原子。
// 形态：tab + 详情（机制讲解）+ 对比表 + 面试深挖手风琴。
// 页面 app/internals/page.tsx 按 tab.id 给每个 tab 配一段循环动画；文字全在这里。
// 约定：所有可见文字都是 { zh, en } 成对（类型 L）；正文用 RichText 渲染，可含 [[术语]] 标记。
//   命令 / 配置项放在 chips（等宽、不翻译）里，避免和正文混在一起。

import type { L } from "@/lib/i18n";

export type TabId = "persistence" | "eviction" | "ha" | "transactions";

// 一条机制讲解（详情卡）
export type Point = {
  head: L; // 小标题 / 概念名
  body: L; // 讲解正文（RichText，可含 [[术语]]）
  chips?: string[]; // 命令 / 配置项，等宽展示（语言无关，不翻译）
  tone?: "accent" | "teal" | "amber"; // 卡片强调色（默认中性）
};

// 对比表：第一列是维度名，其余列是被对比的对象
export type CompareTable = {
  cols: L[]; // 表头：cols[0] 是左上角，cols[1..] 是各对比项
  rows: { label: L; cells: L[] }[]; // 每行：维度名 + 各对比项在该维度的值
  monoLabels?: boolean; // 第一列是否用等宽（如策略名 allkeys-lru）
};

// 面试深挖：追问 + 该怎么答
export type Probe = { q: L; a: L };

export type Tab = {
  id: TabId;
  tab: L; // tab 上的短序号标（机制 1 / 2 …）
  name: L; // tab 名
  kicker: L; // tab 副标（mono 小字）
  lede: L; // 该 tab 的一句开场（RichText）
  animCaption: L; // 动画舞台底部字幕
  points: Point[]; // 详情：机制讲解
  table: CompareTable; // 对比表
  probes: Probe[]; // 面试深挖手风琴（2–3 条）
};

// ---------- 页头 + 通用小文案（本站专属，不进 i18n.tsx） ----------

export const meta = {
  title: { zh: "第 5 站 · 生产机制", en: "Stop 5 · Redis in production" },
  subtitle: {
    zh: "Redis 真正跑在生产上才会遇到的四类机制：持久化、过期与淘汰、高可用与扩展、事务与原子——讲清楚它们怎么工作，也讲清楚它们不保证什么。",
    en: "Four mechanisms you only meet once Redis is running in production: persistence, expiry and eviction, availability and scaling, and transactions. What each one does, and what it does not promise.",
  },

  introStep: { zh: "开场", en: "Start here" },
  introTitle: {
    zh: "前四站讲“是什么、为什么用、怎么写”；这一站讲“上了生产会怎样”",
    en: "The earlier stops covered what Redis is and how to use it; this one covers what happens in production",
  },
  introBody: {
    zh:
      "到这里你已经会用 [[redis:Redis]] 做缓存了。把它真正跑在生产上，还有四个问题要回答：" +
      "断电或重启之后，[[memory:内存]]里的数据怎么办（持久化）；" +
      "key 的 TTL 到点之后会怎样、内存写满了又该删掉谁（过期与淘汰）；" +
      "一台机器故障了怎么办、一台机器装不下了怎么办（高可用与扩展）；" +
      "好几条命令怎么作为一个整体执行（事务与原子）。" +
      "简历上写了 Redis，面试后半程问的基本就是这四件事。" +
      "点上面的标签逐个看——每个都配一段会动的图、一张对比表，和几道面试深挖。",
    en:
      "By now you can use [[redis:Redis]] as a cache. Running it in production raises four more questions. " +
      "What happens to the data in [[memory:memory]] after a restart or a power cut (persistence)? " +
      "What happens to a key once its TTL has passed, and which keys are removed when memory fills up (expiry and eviction)? " +
      "What happens when one machine fails, or when one machine is no longer enough (availability and scaling)? " +
      "And how do several commands run as one unit (transactions and atomicity)? " +
      "Once Redis is on your resume, these are the questions an interviewer asks next. " +
      "Open the tabs one at a time — each has an animation, a comparison table, and a few interview questions.",
  },

  // 详情 / 对比 / 深挖 三段的小标题
  detailLabel: { zh: "讲清楚", en: "The mechanism" },
  tableLabel: { zh: "一眼看懂", en: "Side by side" },
  probeLabel: { zh: "面试深挖", en: "Interview probes" },

  probeQ: { zh: "追问", en: "Probe" },
  probeA: { zh: "这样答", en: "Answer" },

  prev: { zh: "← 上一站", en: "← Previous" },
  next: { zh: "下一站：跟着写一遍 →", en: "Next stop: write it yourself →" },
};

// ---------- 四个 tab ----------

export const tabs: Tab[] = [
  // ============ Tab 1 · 持久化 ============
  {
    id: "persistence",
    tab: { zh: "机制 1", en: "Part 1" },
    name: { zh: "持久化", en: "Persistence" },
    kicker: { zh: "RDB / AOF · 断电怎么办", en: "RDB / AOF · surviving a crash" },
    lede: {
      zh:
        "[[redis:Redis]] 主要把数据放在[[memory:内存]]里，而内存在断电或重启之后就是空的。持久化就是把内存里的数据写到硬盘上，" +
        "让重启后还能加载回来。两条路线：RDB 定期拍快照，AOF 把每条写命令记成日志。两者都不能让 Redis 默认变成可靠的主数据库。",
      en:
        "[[redis:Redis]] keeps data mostly in [[memory:memory]], and memory is empty again after a restart or a power cut. Persistence writes that data to disk, " +
        "so a restart can load it back. There are two approaches: RDB writes periodic snapshots, and AOF logs every write command. Neither one makes Redis a durable primary database by default.",
    },
    animCaption: {
      zh: "左：RDB 每隔一段时间把整份数据完整地写成一个文件。右：AOF 把每条写命令逐条追加到一卷日志末尾。",
      en: "Left: RDB writes the whole dataset to one file at intervals. Right: AOF appends each write command to the end of a log that keeps growing.",
    },
    points: [
      {
        head: { zh: "RDB · 快照", en: "RDB · snapshot" },
        tone: "accent",
        body: {
          zh:
            "RDB 把某一时刻的整份数据做成一份快照，写成一个紧凑的二进制文件（dump.rdb）。" +
            "文件小、加载快，适合做备份、也适合把整份数据搬到另一台机器上。" +
            "代价是会丢数据：如果 Redis 在两次快照之间停止，最后一次快照之后的写全部丢失。" +
            "另外 BGSAVE 会 fork 一个子进程来写文件，父子进程按写时复制(copy-on-write)共享[[memory:内存]]，" +
            "所以父进程在 fork 期间继续接收写入时，内存占用可能明显上升。",
          en:
            "RDB writes a point-in-time snapshot of the whole dataset to one compact binary file (dump.rdb). " +
            "The file is small and loads quickly, which makes it good for backups and for moving a dataset to another machine. " +
            "The cost is data loss: if Redis stops between two snapshots, every write made after the last snapshot is gone. " +
            "BGSAVE also forks a child process to write the file. Parent and child share [[memory:memory]] copy-on-write, " +
            "so while the parent keeps accepting writes during the fork, memory use can rise noticeably.",
        },
        chips: ["dump.rdb", "SAVE / BGSAVE", "save 900 1"],
      },
      {
        head: { zh: "AOF · 追加日志", en: "AOF · append-only file" },
        tone: "teal",
        body: {
          zh:
            "AOF（Append Only File）把每一条写命令追加到一个日志文件末尾；重启时 Redis 从头重放这些命令，把数据重建出来。" +
            "刷盘策略由 appendfsync 决定，有三档：always 每条命令都 fsync，最安全也最慢；" +
            "everysec 每秒 fsync 一次，是默认值，宕机大约会丢一秒的写；no 把时机交给操作系统，最快也最不安全。" +
            "和 RDB 比，AOF 丢得更少、日志也能直接读懂；代价是文件更大、恢复更慢，因为命令要重新执行一遍。" +
            "AOF rewrite 会把日志压缩成“能得到同样数据的最短命令集”，防止它无限变大。",
          en:
            "AOF (append only file) appends every write command to the end of a log. On restart, Redis replays that log from the beginning to rebuild the data. " +
            "The fsync policy is set by appendfsync and has three values. always fsyncs after every command: the safest and the slowest. " +
            "everysec fsyncs once a second: the default, and it can lose about one second of writes in a crash. " +
            "no leaves the timing to the operating system: the fastest and the least safe. " +
            "Compared with RDB, AOF loses less and the log is readable, but the file is larger and recovery is slower because the commands run again. " +
            "An AOF rewrite compacts the log into the shortest set of commands that produces the same data, so it does not grow forever.",
        },
        chips: ["appendonly yes", "appendfsync everysec", "BGREWRITEAOF"],
      },
      {
        head: { zh: "混合持久化 (Redis 4.0+)", en: "Hybrid persistence (Redis 4.0+)" },
        tone: "amber",
        body: {
          zh:
            "把两者合起来用：AOF 文件的前半段是一份 RDB 格式的全量快照，后半段再追加此后的写命令。" +
            "重启时先快速加载快照，再重放很短的一小段命令——恢复比纯 AOF 快，丢失窗口又比纯 RDB 小。很多生产环境用的就是这个组合。",
          en:
            "This combines the two. The AOF file begins with a full snapshot in RDB format and appends the later write commands after it. " +
            "On restart, Redis loads the snapshot quickly and then replays a short tail of commands, so recovery is faster than plain AOF and the loss window is smaller than plain RDB. Many production setups use this combination.",
        },
        chips: ["aof-use-rdb-preamble yes"],
      },
      {
        head: { zh: "能恢复，不等于能当主数据库", en: "Recoverable is not the same as durable" },
        body: {
          zh:
            "持久化让 Redis 重启后能把数据加载回来，但 RDB 和 AOF 都不能让它默认成为一个可靠的主数据库：" +
            "RDB 会丢掉最后一次快照之后的全部写，AOF 默认的 everysec 也可能丢约一秒。" +
            "所以把 Redis 定位成一个“可以被重建的加速层”：涉及钱和关键状态的数据，权威副本——[[sourceoftruth:真相来源]]——留在数据库里。" +
            "面试里把这条边界主动说清楚，比背下配置项更有价值。",
          en:
            "Persistence lets Redis load its data again after a restart, but neither RDB nor AOF makes it a durable primary database by default. " +
            "RDB loses everything written after the last snapshot, and the default AOF policy can lose about one second of writes. " +
            "So treat Redis as a layer you can rebuild: for money and other critical state, keep the authoritative copy — the [[sourceoftruth:source of truth]] — in the database. " +
            "In an interview, saying that limit out loud is worth more than naming config options.",
        },
      },
    ],
    table: {
      cols: [
        { zh: "维度", en: "Dimension" },
        { zh: "RDB 快照", en: "RDB snapshot" },
        { zh: "AOF 日志", en: "AOF log" },
      ],
      rows: [
        {
          label: { zh: "恢复速度", en: "Recovery speed" },
          cells: [
            { zh: "快：直接加载二进制文件", en: "Fast: loads a binary file" },
            { zh: "慢：要重放命令", en: "Slower: replays the commands" },
          ],
        },
        {
          label: { zh: "文件大小", en: "File size" },
          cells: [
            { zh: "紧凑、小", en: "Compact" },
            { zh: "更大：每条写都记一行", en: "Larger: one entry per write" },
          ],
        },
        {
          label: { zh: "丢数据", en: "Data loss" },
          cells: [
            {
              zh: "较多：最后一次快照之后的写全丢",
              en: "More: everything after the last snapshot",
            },
            {
              zh: "较少：everysec 约丢一秒",
              en: "Less: about one second with everysec",
            },
          ],
        },
        {
          label: { zh: "适合", en: "Best for" },
          cells: [
            { zh: "备份、整份迁移、恢复要快", en: "Backups, moving a dataset, fast restart" },
            { zh: "希望尽量少丢数据的场景", en: "Keeping the loss window small" },
          ],
        },
      ],
    },
    probes: [
      {
        q: { zh: "只开 RDB，最多会丢多少数据？", en: "With RDB only, how much data can you lose?" },
        a: {
          zh:
            "丢的是最后一次快照之后的所有写。快照是定时的：比如配成每 5 分钟一次，那么在两次快照之间宕机，最坏就丢掉这最多 5 分钟内的写。" +
            "所以只开 RDB 适合“丢几分钟可以接受”的缓存类数据；一条都不能丢的数据不能只靠它。",
          en:
            "You lose every write made after the last snapshot. Snapshots are periodic: if one is taken every 5 minutes, a crash between two snapshots loses up to those 5 minutes of writes. " +
            "RDB on its own fits cache-like data where losing a few minutes is acceptable. Data you cannot afford to lose needs more than this.",
        },
      },
      {
        q: { zh: "AOF 的 everysec 为什么是默认？", en: "Why is everysec the default AOF policy?" },
        a: {
          zh:
            "它是安全和性能之间的平衡点。always 每条命令都 fsync，最安全，但把每次写都变成一次磁盘 I/O，太慢；" +
            "no 完全交给操作系统，最快，但可能丢很多。" +
            "everysec 每秒在后台 fsync 一次，宕机最多丢约一秒的写——大多数业务都能接受，性能几乎不受影响，所以它是默认值。",
          en:
            "It sits between safety and speed. always fsyncs after every command: the safest, but it turns each write into a disk write, which is slow. " +
            "no leaves everything to the operating system: the fastest, but it can lose much more. " +
            "everysec fsyncs once a second in the background and loses about one second of writes in a crash. Most workloads accept that, and the cost is small, so it is the default.",
        },
      },
      {
        q: { zh: "生产上常用什么组合？", en: "What is a common production setup?" },
        a: {
          zh:
            "两种常见做法。一是 RDB 做定期备份 + AOF everysec 做主力持久化：既有紧凑的快照可以搬走，日常也丢得少。" +
            "二是直接开混合持久化（AOF 文件里嵌一份 RDB 全量 + 之后的增量命令），恢复更快、丢得也少。" +
            "选哪种取决于你更在意恢复速度还是丢失窗口。无论选哪种，都要说清楚：这是为了少丢数据，不是为了把 Redis 当主数据库用。",
          en:
            "Two setups are common. One is RDB for periodic backups plus AOF everysec as the main persistence: you get a compact snapshot you can copy elsewhere, and day-to-day loss stays small. " +
            "The other is hybrid persistence, where an RDB snapshot and the later commands live in the same AOF file. That restarts faster and still loses little. " +
            "Which one you pick depends on whether restart time or the loss window matters more. Either way, say what this is for: reducing loss, not turning Redis into the primary database.",
        },
      },
    ],
  },

  // ============ Tab 2 · 过期与内存淘汰 ============
  {
    id: "eviction",
    tab: { zh: "机制 2", en: "Part 2" },
    name: { zh: "过期与淘汰", en: "Expiry and eviction" },
    kicker: { zh: "TTL 到期 / maxmemory 淘汰", en: "TTL expiry / maxmemory eviction" },
    lede: {
      zh:
        "两件容易混在一起的事：一件是 key 的 [[ttl:TTL]] 到点之后会发生什么（过期），另一件是内存到达 maxmemory 上限时该删掉谁腾地方（淘汰）。" +
        "前者由时间触发，后者由内存压力触发，配置也是分开的。",
      en:
        "Two mechanisms are easy to confuse. Expiry decides what happens to a key once its [[ttl:TTL]] has passed. " +
        "Eviction decides which keys Redis removes when memory reaches the maxmemory limit. One is driven by time, the other by memory pressure, and you configure them separately.",
    },
    animCaption: {
      zh: "内存一路涨到 maxmemory 上限 → 触发淘汰，按 LRU/LFU 选中最“冷”的一个 key 删掉（淡出），内存降下来。",
      en: "Memory climbs to the maxmemory limit → eviction starts, the coldest key by LRU or LFU is removed (it fades out), and memory drops back.",
    },
    points: [
      {
        head: { zh: "过期：惰性 + 定期", en: "Expiry: lazy and active" },
        tone: "teal",
        body: {
          zh:
            "一个 key 的 [[ttl:TTL]] 到点，并不意味着它在那一刻就被删除。Redis 用两套机制配合：" +
            "① 惰性过期——下次有客户端访问这个 key 时才检查，发现已过期就在那时删掉；" +
            "② 定期过期——后台任务每隔一小会儿抽样一批设了 TTL 的 key，把其中已过期的删掉，抽到的只是一部分。" +
            "所以要分清两件事：Redis 保证过期的 key 不会再被返回给客户端；它不保证内存在哪一刻被回收。" +
            "为什么不给每个 key 挂一个精确定时器？几百万个定时器的开销太大，不划算。",
          en:
            "A key is not removed at the exact moment its [[ttl:TTL]] passes. Redis combines two mechanisms. " +
            "Lazy expiry: the next time a client touches the key, Redis checks it, sees that it has expired, and deletes it then. " +
            "Active expiry: a background job runs at intervals, samples a batch of keys that have a TTL, and deletes the expired ones it finds, which is only a fraction of them. " +
            "So keep two statements separate. Redis does guarantee that an expired key is never returned to a client. It does not guarantee when the memory is reclaimed. " +
            "Why not give every key an exact timer? With millions of keys, that many timers cost more than they are worth.",
        },
        chips: ["EXPIRE key 60", "TTL key", "PERSIST key"],
      },
      {
        head: { zh: "淘汰：maxmemory-policy", en: "Eviction: maxmemory-policy" },
        tone: "accent",
        body: {
          zh:
            "淘汰只在内存达到 maxmemory 上限时才发生。这时新的写入必须先腾出空间，删掉谁由 maxmemory-policy 决定。" +
            "默认是 noeviction：什么都不删，需要更多内存的写入直接返回错误。" +
            "allkeys-* 在所有 key 里挑；volatile-* 只在设了 TTL 的 key 里挑——如果没有任何 key 设过 TTL，它一个都腾不出来。" +
            "挑选依据是 lru（最近最少使用）、lfu（最不经常使用）、ttl（最接近过期，仅 volatile）或 random（随机）。" +
            "完整八种：noeviction、allkeys-lru、allkeys-lfu、allkeys-random、volatile-lru、volatile-lfu、volatile-random、volatile-ttl。",
          en:
            "Eviction happens only when memory reaches the maxmemory limit. At that point a new write has to free space first, and maxmemory-policy decides which key goes. " +
            "The default is noeviction: nothing is removed, and a write that needs more memory returns an error. " +
            "allkeys-* policies choose from every key. volatile-* policies choose only from keys that have a TTL, so they can free nothing at all when no key has one. " +
            "The rule for choosing is lru (least recently used), lfu (least frequently used), ttl (closest to expiry, volatile only), or random. " +
            "The full list is noeviction, allkeys-lru, allkeys-lfu, allkeys-random, volatile-lru, volatile-lfu, volatile-random, and volatile-ttl.",
        },
        chips: ["maxmemory 2gb", "maxmemory-policy allkeys-lru"],
      },
      {
        head: { zh: "LRU 和 LFU 都是近似的", en: "LRU and LFU are both approximate" },
        tone: "amber",
        body: {
          zh:
            "LRU 按“最近有没有被用过”排序，LFU（Redis 4.0+）按“用得频不频繁”排序。" +
            "差别在异常访问模式下才显出来：一次全量扫描会让大量冷 key 看起来刚刚用过，LRU 可能因此把真正的热点淘汰掉；" +
            "LFU 用一个随时间衰减的计数器统计访问频率，受一次扫描的影响小得多。" +
            "两者都是近似的：Redis 不维护全体 key 的精确访问顺序，每次淘汰只随机采样少量 key（maxmemory-samples，默认 5 个），" +
            "在样本里挑最差的删掉。这样省内存，实际效果也够用。",
          en:
            "LRU ranks keys by how recently they were used. LFU (Redis 4.0+) ranks them by how often. " +
            "The difference shows under an unusual access pattern: one full scan makes many cold keys look recently used, so LRU can evict the keys that are genuinely hot. " +
            "LFU counts accesses with a counter that decays over time, so a single scan moves it much less. " +
            "Both are approximate. Redis does not keep an exact ordering of every key. On each eviction it samples a small number of keys (maxmemory-samples, 5 by default) and removes the worst one in that sample. " +
            "That costs far less memory and is close enough in practice.",
        },
        chips: ["maxmemory-samples 5", "OBJECT FREQ key"],
      },
    ],
    table: {
      monoLabels: true,
      cols: [
        { zh: "策略", en: "Policy" },
        { zh: "在谁里面挑", en: "Chooses from" },
        { zh: "挑选依据", en: "Chosen by" },
      ],
      rows: [
        {
          label: { zh: "noeviction（默认）", en: "noeviction (default)" },
          cells: [
            { zh: "不淘汰", en: "nothing" },
            { zh: "写入直接返回错误", en: "the write returns an error" },
          ],
        },
        {
          label: { zh: "allkeys-lru", en: "allkeys-lru" },
          cells: [
            { zh: "所有 key", en: "all keys" },
            { zh: "最近最少使用", en: "least recently used" },
          ],
        },
        {
          label: { zh: "allkeys-lfu", en: "allkeys-lfu" },
          cells: [
            { zh: "所有 key", en: "all keys" },
            { zh: "最不经常使用", en: "least frequently used" },
          ],
        },
        {
          label: { zh: "volatile-lru", en: "volatile-lru" },
          cells: [
            { zh: "只有设了 TTL 的 key", en: "keys with a TTL only" },
            { zh: "最近最少使用", en: "least recently used" },
          ],
        },
        {
          label: { zh: "volatile-ttl", en: "volatile-ttl" },
          cells: [
            { zh: "只有设了 TTL 的 key", en: "keys with a TTL only" },
            { zh: "最接近过期的先删", en: "closest to expiry first" },
          ],
        },
        {
          label: { zh: "allkeys-random", en: "allkeys-random" },
          cells: [
            { zh: "所有 key", en: "all keys" },
            { zh: "随机", en: "chosen at random" },
          ],
        },
      ],
    },
    probes: [
      {
        q: { zh: "纯缓存场景该选哪个淘汰策略？", en: "For a pure cache, which eviction policy?" },
        a: {
          zh:
            "一般是 allkeys-lru 或 allkeys-lfu。既然所有 key 都是可以丢的缓存，就该允许在全部 key 里按冷热淘汰，把内存留给最有用的数据。" +
            "访问有明显冷热之分、又担心偶发的全量扫描冲掉热点时，allkeys-lfu 更稳。" +
            "纯缓存不要留着默认的 noeviction——内存满了写入会直接报错。也不要在“很多 key 没设 TTL”的情况下用 volatile-*，那样可能一个都淘汰不掉。",
          en:
            "Usually allkeys-lru or allkeys-lfu. If every key is disposable cache, let Redis choose from all of them and drop the least used, so memory goes to the data that is actually read. " +
            "When access has a clear hot and cold split and you are worried about an occasional full scan pushing the hot keys out, allkeys-lfu is steadier. " +
            "Do not leave the default noeviction on a pure cache, because writes fail once memory is full. And do not pick a volatile-* policy when many keys have no TTL, because it may not be able to free anything.",
        },
      },
      {
        q: { zh: "为什么默认策略是 noeviction？", en: "Why is noeviction the default?" },
        a: {
          zh:
            "为了不悄悄丢数据。到了内存上限，Redis 宁可让写操作报错，也不默默删掉你的 key——因为它无法判断你的数据能不能丢。" +
            "把“到底允不允许淘汰、按什么规则淘汰”留给你显式选择，是更安全的默认值。确实要当缓存用，就自己改成 allkeys-lru 之类。",
          en:
            "So that it never drops data silently. At the memory limit, Redis would rather fail a write than delete your keys on its own, because it cannot know whether your data is disposable. " +
            "Leaving the decision to you — whether to evict at all, and by what rule — is the safer default. If you do want a cache, you set the policy yourself, for example allkeys-lru.",
        },
      },
      {
        q: { zh: "惰性过期有什么弱点？", en: "What is the weakness of lazy expiry?" },
        a: {
          zh:
            "一个 key 过期后如果再没人访问它，惰性过期永远不会被触发，它会一直占着内存。" +
            "兜底的是定期过期：后台抽样带 TTL 的 key、清理其中过期的。但它是抽样的，不是即时的，" +
            "所以从 key 过期到内存真正被回收之间会有一段时间差。这段时间里读它不会拿到旧值——Redis 不会返回过期的 key——但内存还没还回来。" +
            "内存吃紧时，这部分尚未回收的过期 key 也可能让淘汰更早开始。",
          en:
            "If a key expires and nobody ever accesses it again, lazy expiry never runs, and the key keeps holding memory. " +
            "Active expiry is the backstop: a background job samples keys that have a TTL and clears the expired ones. But it samples, so it is not immediate, " +
            "and there is a gap between the moment a key expires and the moment its memory is reclaimed. Reads are still correct in that gap, because Redis does not return an expired key, but the memory is not back yet. " +
            "Under memory pressure, those unreclaimed keys can make eviction start sooner.",
        },
      },
    ],
  },

  // ============ Tab 3 · 高可用与扩展 ============
  {
    id: "ha",
    tab: { zh: "机制 3", en: "Part 3" },
    name: { zh: "高可用与扩展", en: "Availability and scaling" },
    kicker: { zh: "复制 / 哨兵 / 集群", en: "replication / Sentinel / Cluster" },
    lede: {
      zh:
        "一台 Redis 有两个限制：它可能故障，故障时没有别的节点顶上；单机的内存和吞吐也是有上限的。" +
        "三种机制分别对应这两个限制：主从复制（多留几份数据、读可以分流）、哨兵（主节点故障时自动换主）、集群（把数据分片到多台机器上横向扩容）。",
      en:
        "One Redis server has two limits. It can fail, and then nothing is left to serve the traffic. And a single machine has a fixed amount of memory and throughput. " +
        "Three mechanisms address those limits: replication keeps extra copies and lets reads spread out, Sentinel promotes a replica when the master fails, and Cluster splits the data across several masters.",
    },
    animCaption: {
      zh: "上：主节点异步把写复制给从节点；主节点故障 → 哨兵把一个从节点提升为新主。下：16384 个哈希槽分给各主节点，key 由 CRC16 决定落在哪个槽。",
      en: "Top: the master copies writes to its replicas asynchronously; the master fails → Sentinel promotes one replica to master. Bottom: the 16384 hash slots are split between masters, and CRC16 decides which slot a key belongs to.",
    },
    points: [
      {
        head: { zh: "主从复制", en: "Replication" },
        tone: "teal",
        body: {
          zh:
            "一主多从：从节点持续复制主节点的数据，于是数据不止一份，读请求也可以分流到从节点上。" +
            "但复制是异步的——主节点执行完写命令就返回给客户端，不等任何从节点确认。由此有两个后果，都要说清楚：" +
            "从节点可能返回稍旧的数据；主节点已经确认过的写，如果它在从节点收到之前故障，这条写就丢了。" +
            "WAIT 命令可以阻塞到指定数量的从节点报告收到，能缩小这个窗口，但它给的保证仍然弱于真正的共识提交，不能当成解决方案。",
          en:
            "One master with several replicas: each replica copies the master's data continuously, so the data exists in more than one place and reads can be sent to the replicas. " +
            "Replication is asynchronous. The master replies to the client as soon as it applies a write, without waiting for any replica. Two consequences follow, and both are worth saying out loud. " +
            "A replica can return slightly older data. And a write the master already acknowledged is lost if the master fails before a replica received it. " +
            "WAIT blocks until a given number of replicas report the write, which narrows that window, but it is a weaker guarantee than a real consensus commit, so do not present it as a fix.",
        },
        chips: ["REPLICAOF host port", "replica-read-only yes", "WAIT 1 100"],
      },
      {
        head: { zh: "哨兵 (Sentinel)", en: "Sentinel" },
        tone: "accent",
        body: {
          zh:
            "光有从节点还不够，因为写请求仍然只能发给主节点。哨兵是一组独立进程，专门监控主从节点的健康状态。" +
            "当足够多的哨兵都认为主节点不可达（这个数量就是 quorum，法定票数），它们自动执行故障转移：" +
            "挑一个从节点提升为新主，让其余从节点改跟新主，并把新主地址告诉客户端。" +
            "两点要记住：正因为要凑 quorum，哨兵一般至少部署三个、分布在不同机器上；" +
            "网络分区时，旧主可能仍在接受那些还能连到它的客户端的写入，这就是脑裂(split brain)，等它重新加入、降级成从节点，这些写就丢了。" +
            "min-replicas-to-write 能限制损失，但不能消除这种情况。",
          en:
            "Replicas alone do not restore service, because writes still have to go to the master. Sentinel is a set of separate processes that watch the health of masters and replicas. " +
            "When enough Sentinels agree that the master is unreachable — that number is the quorum — they run an automatic failover: " +
            "one replica is promoted to master, the others are told to follow it, and clients ask Sentinel for the new address. " +
            "Two things follow. Because a quorum is needed, you normally run at least three Sentinels on separate machines. " +
            "And during a network partition the old master can keep accepting writes from clients that still reach it. That is a split brain, and those writes are lost when it rejoins as a replica. " +
            "min-replicas-to-write limits the damage but does not remove the case.",
        },
        chips: ["sentinel monitor mymaster … quorum", "min-replicas-to-write 1"],
      },
      {
        head: { zh: "集群 (Cluster) 与 16384 个槽", en: "Cluster and 16384 slots" },
        tone: "amber",
        body: {
          zh:
            "复制和哨兵让一份数据保持可用，但它并不能让这份数据变大。集群解决的是容量和吞吐：把数据分片到多个主节点，每个主节点各自带从节点。" +
            "整个键空间固定切成 16384 个哈希槽，一个 key 属于哪个槽由 CRC16(key) 对 16384 取模决定，每个主节点负责其中一段槽，" +
            "于是容量和吞吐随主节点数量增长。" +
            "代价是：一条涉及多个 key 的命令，如果这些 key 不在同一个槽，会被直接拒绝。" +
            "想让相关的 key 待在一起，用 hash tag——只对 {} 里的部分算槽，所以 user:{123}:profile 和 user:{123}:cart 落在同一个槽，可以出现在同一条命令里。",
          en:
            "Replication and Sentinel keep one dataset available; they do not make it bigger. Cluster is about capacity and throughput: it shards the data across several masters, each with its own replicas. " +
            "The keyspace is divided into a fixed 16384 hash slots. A key belongs to slot CRC16(key) mod 16384, and each master owns a range of slots, " +
            "so capacity and throughput grow with the number of masters. " +
            "The cost: a command that touches several keys is rejected when those keys are not in the same slot. " +
            "To keep related keys together, use a hash tag — only the part inside {} is hashed, so user:{123}:profile and user:{123}:cart land in the same slot and can appear in one command.",
        },
        chips: ["CRC16(key) % 16384", "user:{123}:profile", "CLUSTER KEYSLOT key"],
      },
    ],
    table: {
      cols: [
        { zh: "维度", en: "Dimension" },
        { zh: "主从复制", en: "Replication" },
        { zh: "哨兵", en: "Sentinel" },
        { zh: "集群", en: "Cluster" },
      ],
      rows: [
        {
          label: { zh: "解决什么", en: "Solves" },
          cells: [
            { zh: "多一份数据、读可分流", en: "extra copies, read scaling" },
            { zh: "自动故障转移", en: "automatic failover" },
            { zh: "分片、横向扩容", en: "sharding, scale-out" },
          ],
        },
        {
          label: { zh: "分片吗", en: "Sharded?" },
          cells: [
            { zh: "否（整份复制）", en: "no (one full copy)" },
            { zh: "否", en: "no" },
            { zh: "是（16384 个槽）", en: "yes (16384 slots)" },
          ],
        },
        {
          label: { zh: "自动换主", en: "Automatic failover" },
          cells: [
            { zh: "否（要手动）", en: "no (manual)" },
            { zh: "是", en: "yes" },
            { zh: "是（每个分片内）", en: "yes (within each shard)" },
          ],
        },
        {
          label: { zh: "容量上限", en: "Capacity ceiling" },
          cells: [
            { zh: "单机内存", en: "one machine's memory" },
            { zh: "单机内存", en: "one machine's memory" },
            { zh: "所有主节点相加", en: "sum of all masters" },
          ],
        },
        {
          label: { zh: "故障转移会丢写吗", en: "Can a failover lose writes?" },
          cells: [
            { zh: "会（复制是异步的）", en: "yes (replication is async)" },
            { zh: "会", en: "yes" },
            { zh: "会", en: "yes" },
          ],
        },
      ],
    },
    probes: [
      {
        q: { zh: "主从复制为什么可能读到旧数据？", en: "Why can replication return stale reads?" },
        a: {
          zh:
            "因为复制是异步的。主节点执行完写命令就立刻返回给客户端，不等从节点确认收到。" +
            "在从节点还没追上这条写的这段时间里，如果你的读正好发到了这个从节点，读到的就是旧值。" +
            "同一个原因还有更严重的一面：主节点已经确认的写，如果它在从节点收到之前故障，故障转移之后这条写就不存在了。" +
            "要更强的一致性，就把关键的读发到主节点；WAIT 可以等到若干个从节点报告收到，但它只是缩小窗口，不等于共识提交。",
          en:
            "Because replication is asynchronous. The master replies to the client the moment it applies a write, without waiting for any replica to confirm. " +
            "In the gap before a replica catches up, a read that lands on that replica returns the older value. " +
            "The same cause has a more serious side: a write the master already acknowledged does not exist after a failover if no replica had received it. " +
            "For stronger guarantees, send the reads that matter to the master. WAIT can block until a number of replicas report the write, but it narrows the window rather than giving you a consensus commit.",
        },
      },
      {
        q: { zh: "哨兵和集群有什么区别？", en: "Sentinel or Cluster — what is the difference?" },
        a: {
          zh:
            "一句话：哨兵是高可用但不分片，集群是分片加高可用。" +
            "哨兵下数据仍是完整的一份（一主多从），它只负责在主节点故障时自动换主，容量还是受单机限制。" +
            "集群把数据切成多份分散到多个主节点，每个主节点可以再带从节点做高可用——既有自动故障转移，也能横向扩容。" +
            "数据装不下一台机器、或者单机吞吐不够了，才需要上集群；只是怕单点故障，哨兵就够了。",
          en:
            "In one line: Sentinel gives availability without sharding, Cluster gives sharding and availability. " +
            "Under Sentinel the data is still one complete copy (one master, several replicas). Sentinel only replaces the master automatically when it fails, and capacity is still bounded by one machine. " +
            "Cluster splits the data across several masters, and each master can have replicas of its own, so you get automatic failover and scale-out together. " +
            "You need Cluster when the data no longer fits on one machine or one machine cannot serve the traffic. If you only want to survive a failed node, Sentinel is enough.",
        },
      },
      {
        q: { zh: "集群为什么是 16384 个槽，不是更多？", en: "Why 16384 slots, and not more?" },
        a: {
          zh:
            "节点之间要靠心跳消息互相同步“谁负责哪些槽”，这份归属信息在心跳包里是用一个位图(bitmap)传的。" +
            "16384 位正好是 2KB，心跳包不至于太大；换成 65536 个槽，位图会到 8KB，节点一多、心跳又频繁，带宽就很不划算。" +
            "而作者建议集群规模一般不超过约 1000 个节点，16384 个槽已经足够把数据均匀分到这些节点上。" +
            "这是带宽和集群规模之间的权衡——面试里能讲出这层原因，比只记住数字强。",
          en:
            "Nodes tell each other which node owns which slots in their heartbeat messages, and that ownership travels as a bitmap inside the packet. " +
            "16384 bits is exactly 2KB, which keeps heartbeats small. With 65536 slots the bitmap would be 8KB, and with many nodes sending frequent heartbeats that wastes a lot of bandwidth. " +
            "Since the author suggests a cluster generally stays under about 1000 nodes, 16384 slots are more than enough to spread data evenly across them. " +
            "It is a trade-off between bandwidth and cluster size, and explaining that reasoning is worth more in an interview than remembering the number.",
        },
      },
    ],
  },

  // ============ Tab 4 · 事务与原子 ============
  {
    id: "transactions",
    tab: { zh: "机制 4", en: "Part 4" },
    name: { zh: "事务与原子", en: "Transactions" },
    kicker: { zh: "MULTI / Lua / Pipeline / 锁", en: "MULTI / Lua / pipelining / locks" },
    lede: {
      zh:
        "先记住最基础的一条：单条 Redis 命令本身就是[[atomic:原子]]的，因为命令是被一条一条执行的。" +
        "要让好几条命令作为一个整体执行，Redis 给了几种工具，而它们很容易被搞混：MULTI/EXEC 把命令排队后按顺序执行；" +
        "WATCH 在 EXEC 之前加一道乐观检查；Lua 脚本作为一个整体执行；Pipeline 只是把命令批量发送，完全不提供原子性。",
      en:
        "Start from the basic fact: a single Redis command is already [[atomic:atomic]], because commands are executed one at a time. " +
        "To make several commands run as one unit, Redis offers a few tools, and they are easy to mix up. MULTI/EXEC queues commands and runs them in order. " +
        "WATCH adds an optimistic check before EXEC. A Lua script runs as one unit. Pipelining only batches commands over the network and gives no atomicity at all.",
    },
    animCaption: {
      zh: "左：MULTI 把几条命令排进队列 → EXEC 把整队按顺序执行完。右：Pipeline 一次发出多条命令、一次读回多个回复，省掉来回的网络往返。",
      en: "Left: MULTI puts the commands in a queue → EXEC runs the whole queue in order. Right: pipelining sends several commands together and reads the replies together, which saves round trips.",
    },
    points: [
      {
        head: { zh: "MULTI / EXEC：排队执行，没有回滚", en: "MULTI / EXEC: queued, with no rollback" },
        tone: "accent",
        body: {
          zh:
            "MULTI 开启一个块，之后的命令不会立刻执行——Redis 把它们排进队列并回复 QUEUED；" +
            "直到 EXEC，整队命令才按顺序执行完，中间不会插入其它客户端的命令。" +
            "但它不是关系型数据库那种可回滚的事务：如果某条命令在执行时出错（比如对一个 String 用了 List 的命令），其余命令照常执行，已经执行的也不会撤销。" +
            "另一种情况不同：如果错误在入队时就能发现（比如参数个数不对），EXEC 会拒绝整个块，一条都不执行。DISCARD 则是直接丢掉这个队列。",
          en:
            "MULTI opens a block. The commands after it do not run yet: Redis queues them and replies QUEUED. " +
            "At EXEC the whole queue runs in order, and no other client's command runs in between. " +
            "This is not a rollback transaction. If a command fails while the block is running — a list command on a string value, for example — the other commands still run and nothing already done is undone. " +
            "An error Redis can see while queueing is different, such as the wrong number of arguments: EXEC then refuses the whole block and none of the commands run. DISCARD throws the queue away.",
        },
        chips: ["MULTI", "EXEC", "DISCARD"],
      },
      {
        head: { zh: "WATCH：乐观检查，不是加锁", en: "WATCH: an optimistic check, not a lock" },
        tone: "teal",
        body: {
          zh:
            "WATCH 提供的是乐观并发控制。你先 WATCH 一个或几个 key，读它们，再发 MULTI 和 EXEC。" +
            "如果在 WATCH 和 EXEC 之间，这些 key 被别的客户端改过，EXEC 就什么都不做、返回 nil，由你重新读一遍再重试。" +
            "注意它并没有加锁：别的客户端不会被阻塞，也不会被拖慢。" +
            "所以它适合冲突很少的场景；很多客户端抢同一个 key 时反而不合适，因为失败的那些都要重试。",
          en:
            "WATCH gives you optimistic concurrency control. You WATCH one or more keys, read them, then send MULTI and EXEC. " +
            "If another client changed any watched key between the WATCH and the EXEC, EXEC does nothing and returns nil, and your client reads again and retries. " +
            "Note that nothing is locked: no other client is blocked or slowed down. " +
            "That makes it a good fit when conflicts are rare, and a poor fit when many clients compete for the same key, because every client that loses has to retry.",
        },
        chips: ["WATCH key", "UNWATCH"],
      },
      {
        head: { zh: "Lua 脚本：整段原子执行", en: "Lua scripts: one atomic unit" },
        tone: "amber",
        body: {
          zh:
            "把一段逻辑写成 Lua 脚本交给 Redis，整个脚本会作为一个[[atomic:原子]]单元执行：" +
            "因为命令是在[[singlethread:单线程]]上被一条一条执行的，脚本运行期间不会插入别的客户端的命令。" +
            "这正是 MULTI 做不到的事：脚本里可以先读一个值、据此判断、再决定写什么，把“判断 + 操作”合成一步原子操作，限流和扣库存是最常见的例子。" +
            "要小心的是同一个性质的另一面：脚本运行期间其它客户端都在等，所以脚本要写得短。",
          en:
            "Give Redis a piece of logic as a Lua script and the whole script runs as one [[atomic:atomic]] unit: " +
            "because commands run one at a time on [[singlethread:a single thread]], no other client's command runs in the middle of it. " +
            "This is what MULTI cannot do. Inside a script you can read a value, decide based on it, and then write — a check and an action in one atomic step. Rate limiting and decrementing stock are the usual examples. " +
            "The caution is the same property seen from the other side: while a script runs, every other client waits, so keep scripts short.",
        },
        chips: ["EVAL script numkeys …", "redis.call(...)"],
      },
      {
        head: { zh: "Pipeline：省网络往返，不保证原子", en: "Pipelining: fewer round trips, no atomicity" },
        tone: "teal",
        body: {
          zh:
            "Pipeline 是一次发出多条命令、不逐条等回复，再一次性把所有回复读回来。" +
            "命令本身没有任何变化，省下的是每条命令一次的网络往返(RTT)——而对小命令来说，往返往往就是耗时的大头。" +
            "但 Pipeline 不提供原子性：别的客户端的命令可以插在你这批命令中间，其中一条失败也不会撤销别的。" +
            "它解决的是网络问题，不是正确性问题。要让这批命令作为一个整体执行，就在 pipeline 里放 MULTI/EXEC 或一段 Lua 脚本。",
          en:
            "Pipelining sends several commands without waiting for each reply, then reads all the replies together. " +
            "The commands themselves do not change. What you save is one network round trip per command, and for small commands the round trip is usually most of the time spent. " +
            "Pipelining gives no atomicity. Another client's commands can run in the middle of your batch, and if one command fails, nothing else is undone. " +
            "It solves a network problem, not a correctness problem. If the commands have to run as one unit, put a MULTI/EXEC block or a Lua script inside the pipeline.",
        },
        chips: ["batch send → batch receive", "saves RTT"],
      },
      {
        head: { zh: "分布式锁：SET NX + Lua 释放", en: "Distributed lock: SET NX, released by Lua" },
        body: {
          zh:
            "单实例上的标准写法：加锁用 [[setnx:SET]] key <唯一值> NX EX 30。" +
            "一条命令同时完成“检查 key 是否空闲”和“写入”，所以并发下只有一个客户端能拿到；EX 的过期时间保证持锁进程崩了，锁也会自动释放。" +
            "释放时不要先 GET 再 DEL：这两步之间你的锁可能已经到期、被别的客户端拿走，你的 DEL 就把别人的锁删了。" +
            "要用一小段 Lua 脚本，把“比对 value 是不是自己的”和“删除”合成一步。" +
            "还有一条限制一定要主动说出来：这把锁在故障转移时并不安全——复制是异步的，主节点已经确认的锁可能还没到从节点，" +
            "从节点被提升后，两个客户端就可能同时认为自己持有锁。" +
            "Redlock 把锁同时加在多个独立的主节点上，能减少其中一部分失败情形，但它依赖“时钟漂移有界、进程停顿有界”这两个假设，业界至今仍有争议。" +
            "如果正确性必须绝对保证，就用为共识设计的系统（比如 ZooKeeper、etcd），或者把被保护的操作做成[[idempotency:幂等]]的。",
          en:
            "On a single instance, acquire the lock with [[setnx:SET]] key <unique-token> NX EX 30. " +
            "One command both checks that the key is free and sets it, so only one client wins. The expiry means a crashed holder does not keep the lock forever. " +
            "To release it, do not run GET and then DEL: between those two steps your expiry can pass and another client can acquire the lock, and your DEL would remove theirs. " +
            "Compare the value and delete it in one step with a small Lua script. " +
            "One more limit is worth stating yourself: this lock is not safe across a failover. Replication is asynchronous, so a lock the master acknowledged may be missing on the replica that gets promoted, " +
            "and two clients can then believe they hold it. " +
            "Redlock takes the lock on several independent masters, which reduces some of these failure modes, but it assumes bounded clock drift and bounded process pauses, and it is still debated. " +
            "When correctness has to be absolute, use a system built for consensus such as ZooKeeper or etcd, or make the protected operation [[idempotency:idempotent]].",
        },
        chips: ["SET lock <uuid> NX EX 30", "if GET==uuid then DEL (Lua)"],
      },
    ],
    table: {
      cols: [
        { zh: "维度", en: "Dimension" },
        { zh: "MULTI/EXEC", en: "MULTI/EXEC" },
        { zh: "Lua 脚本", en: "Lua script" },
        { zh: "Pipeline", en: "Pipelining" },
      ],
      rows: [
        {
          label: { zh: "作为一个整体执行", en: "Runs as one unit?" },
          cells: [
            { zh: "是（按顺序，不被插入）", en: "yes (in order, no interleaving)" },
            { zh: "是（整段脚本）", en: "yes (the whole script)" },
            { zh: "否", en: "no" },
          ],
        },
        {
          label: { zh: "能先读值再判断", en: "Read then decide?" },
          cells: [
            { zh: "不能（只是排队）", en: "no (queued only)" },
            { zh: "能（脚本里有逻辑）", en: "yes (logic in the script)" },
            { zh: "不能", en: "no" },
          ],
        },
        {
          label: { zh: "出错会回滚吗", en: "Rollback on error?" },
          cells: [
            { zh: "不会（其余命令照常执行）", en: "no (the rest still run)" },
            { zh: "不会（已执行的不撤销）", en: "no (what already ran stands)" },
            { zh: "不会", en: "no" },
          ],
        },
        {
          label: { zh: "主要用途", en: "Main use" },
          cells: [
            { zh: "多条命令按顺序整体执行", en: "several commands as one ordered unit" },
            { zh: "判断 + 操作的原子组合", en: "check and act atomically" },
            { zh: "省网络往返、提高吞吐", en: "fewer round trips, more throughput" },
          ],
        },
      ],
    },
    probes: [
      {
        q: { zh: "Redis 事务为什么没有回滚？", en: "Why do Redis transactions have no rollback?" },
        a: {
          zh:
            "这是刻意的设计取舍。Redis 认为运行期出错的命令几乎都是编程错误（用错了 key 的类型、参数写错），而不是数据本身的问题——" +
            "这类错误应该在开发和测试阶段暴露，而不是靠运行时回滚兜底。" +
            "而且入队时就能发现的错误会让 EXEC 直接拒绝整个块，所以能走到 EXEC 的命令基本都是形式上合法的。" +
            "不做回滚让实现保持简单、执行更快。你需要知道的结论是：Redis 的事务保证的是顺序和不被插入，不是全有或全无。",
          en:
            "It is a deliberate trade-off. Redis treats a command that fails at run time as almost always a programming error (the wrong type for that key, a bad argument) rather than a problem with the data, " +
            "and that kind of bug should show up in development and testing instead of being covered by a run-time rollback. " +
            "Errors Redis can see while queueing make EXEC refuse the whole block, so the commands that reach EXEC are at least well formed. " +
            "Skipping rollback keeps the implementation simple and execution fast. The conclusion to remember: a Redis transaction guarantees order and no interleaving, not all-or-nothing.",
        },
      },
      {
        q: { zh: "Pipeline 和事务到底差在哪？", en: "Pipelining or a transaction — what is the real difference?" },
        a: {
          zh:
            "它们解决的问题不一样。Pipeline 解决网络问题：一次发出多条命令、一次读回所有回复，省掉每条命令一次的往返；" +
            "但它不保证原子，中间可以被别的客户端的命令插入。" +
            "事务（MULTI/EXEC）解决的是顺序问题：保证这批命令连续按顺序执行，中间不插入别人的命令。" +
            "一句话——Pipeline 省的是网络，事务管的是执行顺序；两者可以叠加（在 pipeline 里发一个 MULTI…EXEC），但别把“发得快”当成“执行得原子”。",
          en:
            "They solve different problems. Pipelining is about the network: send several commands at once, read all the replies at once, and save one round trip per command. " +
            "It guarantees no atomicity, and another client's commands can run in between. " +
            "A transaction (MULTI/EXEC) is about ordering: the batch runs consecutively, in order, with no other client's command in the middle. " +
            "In one line, pipelining saves network time and a transaction controls execution order. You can combine them by sending a MULTI…EXEC block inside a pipeline, but do not mistake sending faster for running atomically.",
        },
      },
      {
        q: { zh: "用 SET NX 做锁有什么坑？", en: "What goes wrong with a SET NX lock?" },
        a: {
          zh:
            "四个常见问题。① 不设过期时间会死锁：持锁的进程崩了，锁永远不释放，别人再也拿不到。" +
            "② 删锁不校验 value 会误删别人的锁：你的锁到期后被别的客户端拿到了，你的业务这时才结束、直接 DEL，删掉的是人家的锁；所以要用 Lua 把“比对 value”和“删除”合成一步。" +
            "③ 锁到期了但业务还没做完：需要后台定时续期（比如 Redisson 的看门狗），或者把过期时间设得比最坏耗时更长。" +
            "④ 故障转移会丢锁：复制是异步的，主节点确认过的锁可能还没同步到从节点，从节点被提升后就有两个客户端同时持锁。" +
            "Redlock 针对第 ④ 点，但它依赖时钟和停顿有界，仍有争议；正确性要求绝对时，应该用为共识设计的系统。",
          en:
            "Four common problems. 1) No expiry means a deadlock: if the holder crashes, the lock is never released and nobody can acquire it again. " +
            "2) Deleting without checking the value removes someone else's lock: your expiry passes, another client acquires the lock, then your job finishes and calls DEL on it. Compare the value and delete in one step with a Lua script. " +
            "3) The expiry passes while your job is still running: renew it periodically in the background (this is what the Redisson watchdog does), or set an expiry longer than the worst-case run time. " +
            "4) A failover can lose the lock: replication is asynchronous, so a lock the master acknowledged may never reach the replica that gets promoted, and two clients then hold it at once. " +
            "Redlock addresses the fourth problem, but it depends on bounded clock drift and bounded pauses and is still debated. When correctness has to be absolute, use a system built for consensus.",
        },
      },
    ],
  },
];
