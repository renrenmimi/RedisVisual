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
  title: { zh: "第 5 站 · 生产机制", en: "Stop 5 · Under the Hood" },
  subtitle: {
    zh: "上了生产、面试后半程才见真章的四类机制——把它讲到 junior 彻底懂、还扛得住深挖。",
    en: "The four mechanisms that only surface in production and in the second half of an interview — explained until they truly click, and deep enough to defend.",
  },

  introStep: { zh: "开场", en: "Start here" },
  introTitle: {
    zh: "前四站讲“是什么、为什么用、怎么写”；这一站讲“上了生产会怎样”",
    en: "The first stops covered what, why, and how to write it; this one covers what happens in production",
  },
  introBody: {
    zh:
      "到这里你已经会用 [[redis:Redis]] 做缓存了。但真正把它跑在生产上，面试官会往后半程追问四件事：" +
      "内存里的数据断电怎么办（持久化）、内存写满了淘汰谁（过期与淘汰）、一台机器故障怎么办、单机容量不够了怎么办（高可用与扩展）、" +
      "多条命令怎么保证一起做（事务与原子）。这四件事，正是简历写了 Redis 之后最容易被深挖、也最能拉开差距的地方。" +
      "点上面的标签逐个看——每个都配一段会动的图、一张对比表，和几道面试深挖。",
    en:
      "By now you can use [[redis:Redis]] as a cache. But running it in production, an interviewer probes four more things in the second half: " +
      "what happens to in-memory data on a power cut (persistence), who gets evicted when memory fills up (expiration & eviction), " +
      "what happens when a machine dies or you outgrow one box (HA & scaling), and how several commands run together (transactions & atomicity). " +
      "These four are exactly where a Redis line on your resume gets probed hardest — and where you can pull ahead. " +
      "Click the tabs to take them one at a time — each comes with a live animation, a comparison table, and a few interview probes.",
  },

  // 详情 / 对比 / 深挖 三段的小标题
  detailLabel: { zh: "讲清楚", en: "The mechanism" },
  tableLabel: { zh: "一眼看懂", en: "Side by side" },
  probeLabel: { zh: "面试深挖", en: "Interview probes" },

  probeQ: { zh: "追问", en: "Probe" },
  probeA: { zh: "这样答", en: "Answer" },

  prev: { zh: "← 上一站", en: "← Previous" },
  next: { zh: "下一站：跟着写一遍 →", en: "Next: Code It Yourself →" },
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
        "[[redis:Redis]] 主要把数据放在[[memory:内存]]里——断电、重启，内存就空了。持久化就是把内存里的数据以某种方式落到硬盘，" +
        "让重启后还能恢复。两条主线：定期拍快照的 RDB，和把每条写命令记流水的 AOF。",
      en:
        "[[redis:Redis]] keeps data mostly in [[memory:memory]] — cut the power or restart, and memory is wiped. Persistence writes that data to disk somehow, " +
        "so a restart can recover it. Two approaches: RDB takes periodic snapshots, AOF logs every write command.",
    },
    animCaption: {
      zh: "左：RDB 每隔一段时间把整块内存完整快照成一个文件。右：AOF 把每条写命令逐条追加进一卷日志。",
      en: "Left: RDB snapshots the whole memory into one file every so often. Right: AOF appends every write command to a growing log.",
    },
    points: [
      {
        head: { zh: "RDB · 快照", en: "RDB · snapshot" },
        tone: "accent",
        body: {
          zh:
            "定时把整个内存做一次[[memory:内存]]快照，dump 成一个紧凑的二进制文件（dump.rdb）。" +
            "优点：文件小、加载快、恢复迅速，适合冷备份和全量迁移。" +
            "缺点：两次快照之间宕机，会丢掉“最后一次快照之后的所有写”；生成时靠 fork 一个子进程来写盘，数据集很大时 fork 本身有开销。",
          en:
            "Periodically take a [[memory:memory]] snapshot and dump it as one compact binary file (dump.rdb). " +
            "Pros: small file, fast to load, quick recovery — great for cold backups and full migrations. " +
            "Cons: crash between two snapshots loses every write since the last snapshot; it forks a child process to write the file, and forking has overhead on a large dataset.",
        },
        chips: ["dump.rdb", "SAVE / BGSAVE", "save 900 1"],
      },
      {
        head: { zh: "AOF · 追加日志", en: "AOF · append-only file" },
        tone: "teal",
        body: {
          zh:
            "AOF（Append Only File）把每一条写命令追加进一个日志文件；重启时把这些命令从头重放一遍，就恢复了数据。" +
            "刷盘策略 appendfsync 有三档：always（每条命令都刷盘，最安全也最慢）、everysec（每秒刷一次，默认，宕机最多丢约 1 秒，最常用）、no（交给操作系统决定何时刷，最快也最不安全）。" +
            "优点：丢数据少、日志人类可读。缺点：文件比 RDB 大、恢复更慢（要重放命令）；还需要 AOF rewrite 定期把日志压缩成等价的最小命令集。",
          en:
            "AOF (Append Only File) appends every write command to a log; on restart it replays those commands from the top to rebuild the data. " +
            "The fsync policy appendfsync has three levels: always (fsync every command, safest and slowest), everysec (fsync once a second, the default, loses at most ~1s on a crash, the common choice), and no (let the OS decide, fastest and least safe). " +
            "Pros: little data loss, human-readable log. Cons: bigger file than RDB, slower recovery (it replays commands); it also needs periodic AOF rewrite to compact the log into a minimal equivalent set of commands.",
        },
        chips: ["appendonly yes", "appendfsync everysec", "BGREWRITEAOF"],
      },
      {
        head: { zh: "混合持久化 (Redis 4.0+)", en: "Hybrid persistence (Redis 4.0+)" },
        tone: "amber",
        body: {
          zh:
            "把两者的优点合起来：AOF 文件里前半段用 RDB 格式存一份全量快照、后半段再追加增量的写命令。" +
            "恢复时先快速加载 RDB 全量、再重放少量增量命令——兼顾了“恢复快”和“丢得少”，是很多生产环境的默认组合。",
          en:
            "Combine the best of both: the AOF file stores a full RDB-format snapshot up front, then appends incremental write commands after it. " +
            "On recovery it loads the RDB bulk fast, then replays a small tail of commands — getting both “fast recovery” and “little loss”. It's a common production default.",
        },
        chips: ["aof-use-rdb-preamble yes"],
      },
      {
        head: { zh: "口径：能恢复，但仍不是真相来源", en: "The framing: recoverable, still not the truth" },
        body: {
          zh:
            "持久化让 Redis “重启能恢复”，但它仍然不该当系统里唯一的[[sourceoftruth:真相来源]]。" +
            "把它定位成“可以被重建的加速层”：涉及钱和关键状态的数据，权威副本要留在数据库里。这条口径在面试里比任何配置项都值钱。",
          en:
            "Persistence lets Redis “recover on restart”, but it still shouldn't be the single [[sourceoftruth:source of truth]] in your system. " +
            "Frame it as a rebuildable speed layer: for money and critical state, keep the authoritative copy in the database. In interviews this stance is worth more than any config flag.",
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
            { zh: "快（直接加载二进制）", en: "Fast (load binary directly)" },
            { zh: "慢（要重放命令）", en: "Slower (replays commands)" },
          ],
        },
        {
          label: { zh: "文件大小", en: "File size" },
          cells: [
            { zh: "紧凑、小", en: "Compact, small" },
            { zh: "更大（记每条写）", en: "Larger (every write)" },
          ],
        },
        {
          label: { zh: "丢数据风险", en: "Data-loss risk" },
          cells: [
            { zh: "高：丢最后一次快照后的写", en: "High: loses writes since last snapshot" },
            { zh: "低：everysec 最多丢约 1 秒", en: "Low: everysec loses at most ~1s" },
          ],
        },
        {
          label: { zh: "适用场景", en: "Best for" },
          cells: [
            { zh: "冷备份 / 全量迁移 / 恢复要快", en: "Cold backup / full migration / fast recovery" },
            { zh: "尽量少丢数据的主力持久化", en: "Primary persistence when loss must be minimal" },
          ],
        },
      ],
    },
    probes: [
      {
        q: { zh: "只开 RDB，最多会丢多少数据？", en: "With RDB only, how much data can you lose?" },
        a: {
          zh:
            "丢“最后一次快照之后的所有写”。快照是定时的——比如配了每 5 分钟一次，那么在两次快照之间宕机，最坏就丢掉这最多 5 分钟的写。" +
            "所以 RDB 单开适合“丢几分钟能接受”的缓存类数据，不适合一条都不能丢的场景。",
          en:
            "You lose every write since the last snapshot. Snapshots are periodic — say one every 5 minutes — so a crash between two snapshots loses up to that ~5-minute window in the worst case. " +
            "RDB-only fits cache-like data where losing a few minutes is acceptable, not data where you can't lose a single write.",
        },
      },
      {
        q: { zh: "AOF 的 everysec 为什么是默认？", en: "Why is AOF's everysec the default?" },
        a: {
          zh:
            "它是安全和性能的平衡点。always 每条命令都 fsync 刷盘，最安全但把每次写都拖成一次磁盘 I/O，太慢；no 完全交给操作系统，最快但可能丢很多。" +
            "everysec 每秒后台 fsync 一次，宕机最多丢约 1 秒的写——绝大多数业务都能接受，性能几乎不受影响，所以是默认。",
          en:
            "It's the balance point between safety and speed. always fsyncs every command — safest, but turns each write into a disk I/O, too slow; no leaves it entirely to the OS — fastest, but can lose a lot. " +
            "everysec fsyncs once a second in the background, losing at most ~1s of writes on a crash — acceptable for most workloads with almost no performance hit, so it's the default.",
        },
      },
      {
        q: { zh: "生产上常用什么组合？", en: "What's a common production combination?" },
        a: {
          zh:
            "两种主流：一是 RDB 做定时备份 + AOF everysec 做主力持久化，兼顾“有紧凑快照可迁移”和“平时少丢数据”；" +
            "二是直接开混合持久化（AOF 文件里嵌一份 RDB 全量 + 增量命令），恢复快、丢得少。选哪种取决于你对“恢复速度 vs 丢数据量”的取舍。",
          en:
            "Two mainstream setups: one is RDB for periodic backups plus AOF everysec as the primary persistence — you get a compact snapshot to migrate and little day-to-day loss; " +
            "the other is hybrid persistence (an RDB bulk plus incremental commands inside the AOF file) for fast recovery with little loss. Which one depends on your recovery-speed vs data-loss trade-off.",
        },
      },
    ],
  },

  // ============ Tab 2 · 过期与内存淘汰 ============
  {
    id: "eviction",
    tab: { zh: "机制 2", en: "Part 2" },
    name: { zh: "过期与淘汰", en: "Expiry & Eviction" },
    kicker: { zh: "TTL 到期 / maxmemory 淘汰", en: "TTL expiry / maxmemory eviction" },
    lede: {
      zh:
        "两件容易混的事：一件是 key 设了 [[ttl:TTL]]、到点了怎么被删（过期删除）；另一件是内存写到 maxmemory 上限、该淘汰谁腾地方（内存淘汰）。" +
        "前者按时间，后者按内存压力——面试常故意混着问。",
      en:
        "Two things people conflate: how a key with a [[ttl:TTL]] gets deleted once it expires (expiration), and who gets kicked out when memory hits the maxmemory ceiling (eviction). " +
        "One is driven by time, the other by memory pressure — interviewers love to mix them.",
    },
    animCaption: {
      zh: "内存条一路涨到 maxmemory 上限 → 触发淘汰，按 LRU/LFU 把最“冷”的一个 key 踢出去（淡出），内存降下来。",
      en: "The memory bar climbs to the maxmemory ceiling → eviction fires, the coldest key (by LRU/LFU) is ejected (fades out), and memory drops back.",
    },
    points: [
      {
        head: { zh: "过期删除：惰性 + 定期", en: "Expiration: lazy + active" },
        tone: "teal",
        body: {
          zh:
            "一个 key 的 [[ttl:TTL]] 到了，Redis 不是立刻就删。它用两招配合：" +
            "① 惰性删除——下次有人访问到这个 key 时，才检查、发现过期就顺手删掉；" +
            "② 定期删除——后台每隔一小会儿，随机抽查一批设了 TTL 的 key，把其中过期的删掉。" +
            "为什么不给每个 key 挂一个精确定时器到点即删？几百万个定时器的开销太大，得不偿失。",
          en:
            "When a key's [[ttl:TTL]] runs out, Redis doesn't delete it instantly. It combines two tactics: " +
            "1) lazy deletion — next time someone accesses the key, it checks, finds it expired, and deletes it then; " +
            "2) active deletion — every little while a background job samples a batch of keys that have a TTL and deletes the expired ones. " +
            "Why not attach a precise timer to every key and delete on the dot? Millions of timers cost too much to be worth it.",
        },
        chips: ["EXPIRE key 60", "TTL key", "PERSIST key"],
      },
      {
        head: { zh: "内存淘汰：maxmemory-policy", en: "Eviction: maxmemory-policy" },
        tone: "accent",
        body: {
          zh:
            "内存用到 maxmemory 上限后，再写就得先淘汰点东西腾地方——淘汰谁由 maxmemory-policy 决定。" +
            "noeviction 是默认：不淘汰，再写直接报错。allkeys-* 在所有 key 里挑；volatile-* 只在设了 TTL 的 key 里挑。" +
            "挑的依据有：lru（最近最少用）、lfu（最不经常用）、ttl（最接近过期，仅 volatile）、random（随机）。" +
            "组合起来就是 allkeys-lru / allkeys-lfu / volatile-lru / volatile-lfu / volatile-ttl / volatile-random / allkeys-random。",
          en:
            "Once memory reaches the maxmemory ceiling, a new write must first evict something to make room — who gets evicted is set by maxmemory-policy. " +
            "noeviction is the default: evict nothing, and new writes just error out. allkeys-* pick from all keys; volatile-* pick only from keys that have a TTL. " +
            "The basis can be: lru (least recently used), lfu (least frequently used), ttl (closest to expiry, volatile only), or random. " +
            "Combined, you get allkeys-lru / allkeys-lfu / volatile-lru / volatile-lfu / volatile-ttl / volatile-random / allkeys-random.",
        },
        chips: ["maxmemory 2gb", "maxmemory-policy allkeys-lru"],
      },
      {
        head: { zh: "LRU vs LFU（且是“近似”的）", en: "LRU vs LFU (and it's “approximate”)" },
        tone: "amber",
        body: {
          zh:
            "LRU 看“最近有没有被用过”，LFU（4.0+）看“用得频不频”。" +
            "差别在抗干扰：一次偶发的全量扫描会把一堆冷 key 变成“刚刚用过”，LRU 就可能把真正的热点挤掉；LFU 按访问频率算，更稳。" +
            "还有个细节要知道：Redis 的 LRU 是近似 LRU——随机采样几个 key 挑最旧的淘汰，而不是维护一个全局精确的访问顺序，这样省内存、也够用。",
          en:
            "LRU looks at “was it used recently”, LFU (4.0+) at “how often is it used”. " +
            "The difference is resilience: a one-off full scan makes lots of cold keys look “just used”, so LRU can evict the real hot keys; LFU counts by frequency and stays steadier. " +
            "One detail to know: Redis's LRU is approximate — it samples a few keys and evicts the oldest among them, rather than maintaining a globally exact access order, which saves memory and is good enough.",
        },
      },
    ],
    table: {
      monoLabels: true,
      cols: [
        { zh: "策略", en: "Policy" },
        { zh: "在谁里面淘汰", en: "Evicts from" },
        { zh: "挑选依据", en: "Chosen by" },
      ],
      rows: [
        {
          label: { zh: "noeviction（默认）", en: "noeviction (default)" },
          cells: [
            { zh: "不淘汰", en: "nothing" },
            { zh: "写满就报错", en: "errors on write when full" },
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
            { zh: "最接近过期的先走", en: "closest to expiry first" },
          ],
        },
        {
          label: { zh: "allkeys-random", en: "allkeys-random" },
          cells: [
            { zh: "所有 key", en: "all keys" },
            { zh: "随机挑", en: "random pick" },
          ],
        },
      ],
    },
    probes: [
      {
        q: { zh: "纯缓存的场景该选哪个淘汰策略？", en: "For a pure cache, which eviction policy?" },
        a: {
          zh:
            "通常 allkeys-lru 或 allkeys-lfu。既然全部 key 都是可丢弃的缓存，就该允许在所有 key 里按冷热淘汰，把内存留给最有用的数据。" +
            "访问有明显冷热分布、又怕偶发扫描冲掉热点时，用 allkeys-lfu 更稳。千万别在纯缓存上留着默认的 noeviction——写满会直接报错。",
          en:
            "Usually allkeys-lru or allkeys-lfu. Since all keys are disposable cache, you should allow eviction across all of them by hot/cold, keeping memory for the most useful data. " +
            "When access has a clear hot/cold split and you worry about scans flushing the hot set, allkeys-lfu is steadier. Don't leave the default noeviction on a pure cache — it errors on write when full.",
        },
      },
      {
        q: { zh: "为什么默认策略是 noeviction？", en: "Why is noeviction the default?" },
        a: {
          zh:
            "为了不悄悄丢数据。到了内存上限，Redis 宁可对写操作直接报错，也不默默删掉你的 key——因为它不知道你的数据能不能丢。" +
            "把“到底允不允许淘汰、按什么淘汰”交给你显式选择，是更安全的默认。你确实想当缓存用，就自己改成 allkeys-lru 之类。",
          en:
            "So it never silently drops data. At the memory ceiling, Redis would rather error on writes than quietly delete your keys — it can't know whether your data is disposable. " +
            "Leaving “whether to evict at all, and by what rule” as an explicit choice is the safer default. If you truly want a cache, you set it to something like allkeys-lru yourself.",
        },
      },
      {
        q: { zh: "惰性删除有什么坑？", en: "What's the catch with lazy deletion?" },
        a: {
          zh:
            "一个 key 过期了，但之后再没人访问它，惰性删除就永远不会被触发，它会一直占着内存。" +
            "兜底的是定期删除——后台随机抽查带 TTL 的 key 清理过期的，但它是抽样的、不是即时的，所以过期 key 到被真正回收之间会有一段“僵尸期”。" +
            "内存吃紧时，这部分没回收的过期 key 也可能提前触发淘汰。",
          en:
            "A key expires but is never accessed again — lazy deletion never fires, so it keeps occupying memory. " +
            "Active deletion is the backstop: a background job samples TTL keys and clears expired ones, but it's sampled and not instant, so there's a “zombie” window between expiry and actual reclamation. " +
            "Under memory pressure, those un-reclaimed expired keys can also help trigger eviction sooner.",
        },
      },
    ],
  },

  // ============ Tab 3 · 高可用与扩展 ============
  {
    id: "ha",
    tab: { zh: "机制 3", en: "Part 3" },
    name: { zh: "高可用与扩展", en: "HA & Scaling" },
    kicker: { zh: "复制 / 哨兵 / 集群", en: "replication / Sentinel / Cluster" },
    lede: {
      zh:
        "一台 Redis 有两个瓶颈：一是它可能故障（单点故障），二是单机内存/吞吐有上限。" +
        "三种机制分别应对这两个瓶颈：主从复制（数据多一份、读能分流）、哨兵（主故障时自动换主）、集群（把数据分片到多台机器横向扩容）。",
      en:
        "A single Redis has two limits: it can fail (a single point of failure), and one box has limited memory/throughput. " +
        "Three mechanisms address those limits: replication (a second copy, reads can spread out), Sentinel (auto-promote a new master when one fails), and Cluster (shard data across machines to scale out).",
    },
    animCaption: {
      zh: "上：主向多个从异步复制；主变红宕机 → 哨兵指挥一个从升为新主。下：一圈 16384 个哈希槽，key 经 CRC16 落到某个槽 / 节点。",
      en: "Top: the master replicates asynchronously to replicas; the master goes red → Sentinel promotes a replica to new master. Bottom: a ring of 16384 hash slots, a key lands on one slot/node via CRC16.",
    },
    points: [
      {
        head: { zh: "主从复制 (replication)", en: "Replication" },
        tone: "teal",
        body: {
          zh:
            "一主多从：从节点持续复制主节点的数据，等于给数据多留了几份副本。读请求可以分流到从节点，做读写分离、扛更高的读吞吐。" +
            "但复制是异步的——主写完就返回、不等从确认。于是主从之间有短暂的复制延迟，这一瞬间去读从节点，可能读到稍旧的数据。",
          en:
            "One master, several replicas: replicas continuously copy the master's data, so you get extra copies. Reads can spread to replicas — a read/write split that handles higher read throughput. " +
            "But replication is asynchronous — the master returns as soon as it writes, without waiting for replicas. So there's a brief replication lag, and reading a replica in that instant can return slightly stale data.",
        },
        chips: ["REPLICAOF host port", "replica-read-only yes"],
      },
      {
        head: { zh: "哨兵 (Sentinel)", en: "Sentinel" },
        tone: "accent",
        body: {
          zh:
            "光有从还不够——主故障时得有节点接替。哨兵是一组独立进程，专门监控主从的健康。" +
            "一旦确认主确实故障，它们自动做故障转移(failover)：从若干个从里选一个升为新主，并把新主的地址通知给客户端。" +
            "这样就解决了“主是单点故障”的问题，不用半夜爬起来手动切主。",
          en:
            "Replicas alone aren't enough — when the master dies, someone must fail over. Sentinel is a set of separate processes that monitor the health of masters and replicas. " +
            "Once they agree the master is truly down, they perform an automatic failover: pick one replica, promote it to new master, and tell clients the new address. " +
            "That fixes the “master is a single point of failure” problem — no getting up at 3am to switch masters by hand.",
        },
        chips: ["sentinel monitor mymaster …", "SENTINEL get-master-addr-by-name"],
      },
      {
        head: { zh: "集群 (Cluster) 与 16384 个槽", en: "Cluster & 16384 slots" },
        tone: "amber",
        body: {
          zh:
            "复制和哨兵解决“单点故障”，但数据仍是一整份、受单机内存限制。集群解决“单机容量与吞吐不够”：把数据分片(sharding)到多个主节点。" +
            "怎么决定一个 key 归哪个节点？全空间固定切成 16384 个哈希槽(hash slots)，key 经 CRC16 再对 16384 取模映射到某个槽，槽再分配到各主节点；每个主可挂从做高可用。这样容量和吞吐都能横向扩展。" +
            "代价：跨槽的多 key 操作和事务受限。想让相关的 key 落到同一个槽，用 hash tag——只对 {} 里的部分算槽，比如 user:{123}:profile 和 user:{123}:cart 会落到同一个槽。",
          en:
            "Replication and Sentinel keep it alive, but the data is still one whole copy bounded by a single box. Cluster solves “too big / too hot”: it shards data across multiple masters. " +
            "How is a key assigned to a node? The whole space is fixed into 16384 hash slots; a key maps to a slot via CRC16 mod 16384, and slots are distributed across masters; each master can have replicas for HA. Capacity and throughput now scale out. " +
            "The cost: multi-key operations and transactions across slots are restricted. To force related keys onto the same slot, use a hash tag — only the part inside {} is hashed, so user:{123}:profile and user:{123}:cart land on the same slot.",
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
            { zh: "读扩展 + 数据冗余", en: "read scaling + redundancy" },
            { zh: "自动故障转移", en: "automatic failover" },
            { zh: "数据分片、横向扩容", en: "sharding, scale-out" },
          ],
        },
        {
          label: { zh: "分片吗", en: "Sharded?" },
          cells: [
            { zh: "否（整份复制）", en: "no (full copy)" },
            { zh: "否", en: "no" },
            { zh: "是（16384 槽）", en: "yes (16384 slots)" },
          ],
        },
        {
          label: { zh: "主故障自动切换", en: "Auto-failover on master failure" },
          cells: [
            { zh: "否（要手动）", en: "no (manual)" },
            { zh: "是", en: "yes" },
            { zh: "是（每个分片内）", en: "yes (within each shard)" },
          ],
        },
        {
          label: { zh: "容量上限", en: "Capacity ceiling" },
          cells: [
            { zh: "单机内存", en: "one box's memory" },
            { zh: "单机内存", en: "one box's memory" },
            { zh: "多机相加", en: "sum of many boxes" },
          ],
        },
      ],
    },
    probes: [
      {
        q: { zh: "主从复制为什么可能读到旧数据？", en: "Why can replication return stale reads?" },
        a: {
          zh:
            "因为复制是异步的。主节点执行完写命令就立刻返回给客户端，不会等从节点确认收到。" +
            "这中间从节点还没把这条写追上，你正好把读请求发到了从节点上，就会读到复制延迟窗口里的旧值。" +
            "要强一致读，就把关键读发到主节点，或用 WAIT 命令等复制到足够多的从——但那会牺牲性能。",
          en:
            "Because replication is asynchronous. The master returns to the client the moment it applies a write, without waiting for replicas to acknowledge. " +
            "In that gap a replica hasn't caught up with the write, and if your read hits that replica, you get the stale value from the replication-lag window. " +
            "For strongly consistent reads, send critical reads to the master, or use WAIT to block until enough replicas have the write — at a performance cost.",
        },
      },
      {
        q: { zh: "哨兵和集群有什么区别？", en: "Sentinel vs Cluster — what's the difference?" },
        a: {
          zh:
            "一句话：哨兵是“高可用但不分片”，集群是“分片 + 高可用”。" +
            "哨兵下数据还是一整份完整副本（一主多从），它只负责在主挂时自动换主，容量仍受单机限制。" +
            "集群把数据切成多份、分散到多个主节点，每个主可以再带从做高可用——既能自动故障转移，又能横向扩容。数据装不下一台机器时才需要上集群。",
          en:
            "In one line: Sentinel is “HA without sharding”, Cluster is “sharding plus HA”. " +
            "Under Sentinel the data is still one whole copy (one master, several replicas); it only auto-switches the master on failure, and capacity is still bounded by one box. " +
            "Cluster splits data into shards across masters, each master able to have replicas for HA — you get both automatic failover and scale-out. You reach for Cluster only when the data no longer fits on one machine.",
        },
      },
      {
        q: { zh: "集群为什么是 16384 个槽，不是更多？", en: "Why 16384 slots, not more?" },
        a: {
          zh:
            "节点之间要靠心跳消息互相同步“谁负责哪些槽”，这个信息在心跳包里是用一个位图(bitmap)传的。" +
            "16384 位正好是 2KB，心跳包不至于太大；换成 65536 个槽，位图会到 8KB，节点一多、心跳频繁，带宽就很吃亏。" +
            "而 Redis 作者建议集群规模一般不超过约 1000 个节点，16384 个槽足够把数据均匀分到这些节点上。这是带宽和节点规模之间的平衡——面试能说出这层原因就是加分项。",
          en:
            "Nodes gossip “who owns which slots” in heartbeat messages, and that ownership travels as a bitmap in the packet. " +
            "16384 bits is exactly 2KB, keeping heartbeats small; 65536 slots would make the bitmap 8KB, and with many nodes and frequent heartbeats that wastes bandwidth. " +
            "Since the author suggests clusters generally stay under ~1000 nodes, 16384 slots are plenty to spread data evenly across them. It's a bandwidth-vs-cluster-size balance — knowing this is a bonus in interviews.",
        },
      },
    ],
  },

  // ============ Tab 4 · 事务与原子 ============
  {
    id: "transactions",
    tab: { zh: "机制 4", en: "Part 4" },
    name: { zh: "事务与原子", en: "Transactions & Atomicity" },
    kicker: { zh: "MULTI / Lua / Pipeline / 锁", en: "MULTI / Lua / Pipeline / locks" },
    lede: {
      zh:
        "想让好几条命令“一起、按顺序、不被打断”地做，Redis 给了几种工具：MULTI/EXEC 事务、WATCH 乐观锁、Lua 脚本、以及只省网络的 Pipeline。" +
        "它们经常被搞混——尤其“Pipeline 不是事务”这一点。",
      en:
        "To run several commands “together, in order, uninterrupted”, Redis offers a few tools: MULTI/EXEC transactions, WATCH optimistic locking, Lua scripts, and Pipeline (which only saves network). " +
        "They get confused a lot — especially the fact that “Pipeline is not a transaction”.",
    },
    animCaption: {
      zh: "左：MULTI 把几条命令排进队列 → EXEC 一次性、按顺序执行。右：Pipeline 把多条命令“一次发出、一次收回”，省掉来回的网络往返。",
      en: "Left: MULTI queues several commands → EXEC runs them at once, in order. Right: Pipeline sends many commands in one shot and reads them back in one shot, saving round trips.",
    },
    points: [
      {
        head: { zh: "MULTI / EXEC：排队执行，但没有回滚", en: "MULTI / EXEC: queued, but no rollback" },
        tone: "accent",
        body: {
          zh:
            "MULTI 开启事务后，后面的命令不会马上执行，而是被打包排进一个队列；直到 EXEC，才把整队命令按顺序、中间不插入任何别的客户端命令地一次性执行。" +
            "但关键区别于关系型数据库：Redis 事务没有回滚。如果某条命令在运行时出错（比如对一个 String 用了 List 的命令），其余命令照常执行，不会整体撤销。" +
            "（注意：如果是 EXEC 之前就发现的语法/入队错误，整个事务会被拒绝、一条都不执行。）",
          en:
            "After MULTI opens a transaction, following commands don't run immediately — they're queued; only at EXEC does the whole queue run at once, in order, with no other client's command interleaved. " +
            "The key difference from a relational DB: Redis transactions have no rollback. If a command errors at run time (say a List command on a String), the rest still execute — nothing is undone. " +
            "(Note: an error detected before EXEC, like a syntax/queueing error, makes the whole transaction get rejected and nothing runs.)",
        },
        chips: ["MULTI", "EXEC", "DISCARD"],
      },
      {
        head: { zh: "WATCH：乐观锁（CAS）", en: "WATCH: optimistic lock (CAS)" },
        tone: "teal",
        body: {
          zh:
            "WATCH 是“检查再更新”的乐观锁。EXEC 之前先 WATCH 一个或几个 key，如果在 EXEC 真正执行前、这些 key 被别的客户端改动过，" +
            "整个事务就直接放弃、不执行（返回 nil），由你重试。这就是 compare-and-set 的思路：不加真正的锁，只在提交时检查“我读到之后有没有人动过它”。",
          en:
            "WATCH is a check-then-update optimistic lock. Before EXEC, you WATCH one or more keys; if any of them is modified by another client before EXEC actually runs, " +
            "the whole transaction is abandoned (returns nil) and you retry. That's compare-and-set: no real lock, just a commit-time check of “did anyone touch it since I read it?”.",
        },
        chips: ["WATCH key", "UNWATCH"],
      },
      {
        head: { zh: "Lua 脚本：一整段原子执行", en: "Lua scripts: one atomic block" },
        tone: "amber",
        body: {
          zh:
            "把一段逻辑写成 Lua 脚本交给 Redis，它会作为一个整体[[atomic:原子]]执行——[[singlethread:单线程]]跑这段脚本期间不会被别的命令打断。" +
            "比 MULTI 灵活得多：脚本里能先读一个值、再根据它决定要不要写，做“判断 + 操作”的原子组合，限流、扣库存这类最合适。" +
            "唯一要小心：脚本别写太长太慢，它会长时间占住那条唯一的线程，把后面所有请求都堵住。",
          en:
            "Hand Redis a chunk of logic as a Lua script and it runs [[atomic:atomically]] as a whole — the [[singlethread:single thread]] won't interleave other commands while the script runs. " +
            "Far more flexible than MULTI: inside the script you can read a value first, then decide whether to write — a “check + act” atomic combo, ideal for rate limiting or decrementing stock. " +
            "The one caution: don't write a long, slow script — it hogs that single thread and blocks everything behind it.",
        },
        chips: ["EVAL script numkeys …", "redis.call(...)"],
      },
      {
        head: { zh: "Pipeline：省网络，不是事务", en: "Pipeline: saves network, not a transaction" },
        tone: "teal",
        body: {
          zh:
            "Pipeline 把多条命令一次性发出去、再一次性把结果收回来，省掉一条条命令来回的网络往返(RTT)，吞吐能大幅提升。" +
            "但一定要记牢：Pipeline 不是事务。它不保证原子，也不保证这批命令中间不被别的客户端命令穿插——它只是“打包发送”省网络，跟“原子有序”是两码事。想要原子，得配 MULTI 或 Lua。",
          en:
            "Pipeline sends many commands in one shot and reads all the replies back in one shot, cutting the per-command network round trips (RTT) and greatly boosting throughput. " +
            "But nail this down: Pipeline is not a transaction. It guarantees neither atomicity nor that other clients' commands won't interleave with your batch — it's just “batched sending” to save network, which is a different thing from “atomic and ordered”. For atomicity, pair it with MULTI or Lua.",
        },
        chips: ["batch send → batch receive", "saves RTT"],
      },
      {
        head: { zh: "分布式锁：SET NX + Lua 释放", en: "Distributed lock: SET NX + Lua release" },
        body: {
          zh:
            "单实例分布式锁的标准写法：加锁用 [[setnx:SET]] key 一个唯一值 NX EX ttl（NX 保证只有第一个能拿到，EX 的 ttl 防止持锁进程崩了锁永不释放）。" +
            "释放时不能直接 DEL——要用 Lua 脚本先校验 value 是不是自己那个唯一值，是才删，避免误删别人的锁。" +
            "多主/主从场景下有 Redlock 算法，但它有争议：Martin Kleppmann 质疑它在时钟漂移、GC / 进程停顿下并不可靠。面试里能说出“知道 Redlock 和它的争议”，就是加分。",
          en:
            "The standard single-instance lock: acquire with [[setnx:SET]] key <unique-value> NX EX ttl (NX ensures only the first caller wins; the EX ttl stops a crashed holder from wedging the lock forever). " +
            "To release, don't just DEL — use a Lua script to first check the value is your own unique token and only then delete, so you never delete someone else's lock. " +
            "Across multiple masters there's the Redlock algorithm, but it's contested: Martin Kleppmann argues it isn't safe under clock drift, GC, or process pauses. In interviews, being able to say “I know Redlock and its controversy” scores points.",
        },
        chips: ["SET lock <uuid> NX EX 30", "if GET==uuid then DEL (Lua)"],
      },
    ],
    table: {
      cols: [
        { zh: "维度", en: "Dimension" },
        { zh: "MULTI/EXEC", en: "MULTI/EXEC" },
        { zh: "Lua 脚本", en: "Lua script" },
        { zh: "Pipeline", en: "Pipeline" },
      ],
      rows: [
        {
          label: { zh: "保证原子", en: "Atomic?" },
          cells: [
            { zh: "是（顺序执行、不插入）", en: "yes (in order, no interleave)" },
            { zh: "是（整段不打断）", en: "yes (whole block)" },
            { zh: "否", en: "no" },
          ],
        },
        {
          label: { zh: "能读值再判断", en: "Read-then-decide?" },
          cells: [
            { zh: "不能（只排队）", en: "no (just queues)" },
            { zh: "能（脚本里有逻辑）", en: "yes (logic inside)" },
            { zh: "不能", en: "no" },
          ],
        },
        {
          label: { zh: "防别的命令穿插", en: "Blocks interleaving?" },
          cells: [
            { zh: "是", en: "yes" },
            { zh: "是", en: "yes" },
            { zh: "否", en: "no" },
          ],
        },
        {
          label: { zh: "主要用途", en: "Main purpose" },
          cells: [
            { zh: "打包多命令原子有序", en: "atomic, ordered batch" },
            { zh: "判断+操作的原子组合", en: "atomic check + act" },
            { zh: "省网络往返、提吞吐", en: "save RTT, boost throughput" },
          ],
        },
      ],
    },
    probes: [
      {
        q: { zh: "Redis 事务为什么没有回滚？", en: "Why do Redis transactions have no rollback?" },
        a: {
          zh:
            "是刻意的设计取舍。Redis 认为运行期出错的命令，几乎都是编程错误（用错了 key 的类型、参数写错），而不是数据本身的问题——" +
            "这类错误应该在开发测试阶段就暴露，而不是靠运行时回滚兜底。而且语法错误会在 EXEC 之前就被拒、整个事务不执行，所以能进 EXEC 的基本都是“逻辑上合法”的命令。" +
            "不做回滚让实现保持简单、执行更快，这和 Redis 一贯“简单快速”的取向一致。",
          en:
            "It's a deliberate trade-off. Redis holds that a command failing at run time is almost always a programming error (wrong key type, bad argument), not a data problem — " +
            "the kind of bug that should surface in dev/test, not be papered over by run-time rollback. And syntax errors are rejected before EXEC, so nothing runs; commands that reach EXEC are essentially “logically valid”. " +
            "Skipping rollback keeps the implementation simple and execution fast, consistent with Redis's “simple and fast” philosophy.",
        },
      },
      {
        q: { zh: "Pipeline 和事务到底差在哪？", en: "Pipeline vs transaction — the real difference?" },
        a: {
          zh:
            "解决的问题不一样。Pipeline 解决的是网络：把多条命令一次发、一次收，省掉一条条来回的 RTT，但它不保证原子、中间可以被别的客户端命令穿插。" +
            "事务(MULTI/EXEC)解决的是原子有序：保证这批命令连续、按顺序执行，不被别人插队。" +
            "一句话——Pipeline 省网络、事务保原子；两者可以叠加（在 pipeline 里发一个 MULTI…EXEC），但别把“发得快”当成“做得原子”。",
          en:
            "They solve different problems. Pipeline is about the network: send many commands in one shot and read them back in one shot, saving per-command RTT — but it guarantees no atomicity and other clients can interleave. " +
            "A transaction (MULTI/EXEC) is about atomic ordering: it guarantees the batch runs consecutively, in order, with no one cutting in. " +
            "In a line — Pipeline saves network, a transaction guarantees atomicity; you can combine them (send a MULTI…EXEC inside a pipeline), but don't mistake “sent fast” for “done atomically”.",
        },
      },
      {
        q: { zh: "用 SET NX 做锁有什么坑？", en: "What are the pitfalls of a SET NX lock?" },
        a: {
          zh:
            "三个经典坑：① 不设 ttl 会死锁——持锁的进程崩了，锁永远不释放，别人再也拿不到；" +
            "② 删锁不校验 value 会误删别人的锁——你的锁 ttl 过期后被别人拿到了，你的业务这时才收尾、直接 DEL，就把人家的锁删了；所以要用 Lua 先比对 value 是自己的再删。" +
            "③ 锁过期了但业务还没跑完——需要“看门狗”在后台定时续期（比如 Redisson 的实现）。多主场景才会牵扯到 Redlock，而 Redlock 本身还有争议。",
          en:
            "Three classic ones: 1) no ttl means deadlock — if the holder crashes, the lock is never released and no one can acquire it again; " +
            "2) deleting the lock without checking the value deletes someone else's lock — your ttl expires, another client acquires it, then your job finishes and blindly DELs, wiping their lock; so use a Lua script to check the value is yours before deleting. " +
            "3) the lock expires while your job is still running — you need a “watchdog” to renew it periodically in the background (as Redisson does). Only multi-master setups bring in Redlock, and Redlock itself is contested.",
        },
      },
    ],
  },
];
