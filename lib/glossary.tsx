"use client";

// 初学者术语词典：正文里写 [[key:显示文字]]，RichText 会把它渲染成
// 带虚线下划线的可点击术语，点开是一段“通俗解释”的解释。
// 各站数据文件里都可以直接用这些 key；找不到 key 时只渲染显示文字，绝不报错。

import { useState, useRef, useEffect, useId, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { t, type L, type Lang } from "@/lib/i18n";

export const glossary: Record<string, { word: L; def: L }> = {
  redis: {
    word: { zh: "Redis", en: "Redis" },
    def: {
      zh: "一个主要把数据放在内存里的键值数据存储（data store）。名字来自 REmote DIctionary Server——可以想成一个能被网络上很多程序同时读写的超大字典。常用来做缓存、计数、去重、排行榜这类要求快、又不需要长期保存的工作。",
      en: "A data store that keeps its data mostly in memory (RAM). The name stands for REmote DIctionary Server: one large dictionary that many programs can read and write over the network. It is normally used for caching, counters, deduplication, and leaderboards — work that has to be fast and does not have to last.",
    },
  },
  memory: {
    word: { zh: "内存 (RAM)", en: "memory (RAM)" },
    def: {
      zh: "电脑里读写最快的临时存储，断电就清空。Redis 把数据放这里，所以取数据非常快；代价是容量比硬盘小得多，而且还没写到硬盘上的数据会随进程一起丢失。Redis 默认会定期把数据快照到硬盘（RDB），还可以开启 AOF 日志，缩小可能丢失的范围。",
      en: "The computer's fastest working storage. It is erased when the power is lost. Redis keeps its data here, which is why reads are fast. The cost is that memory is much smaller than disk, and anything not yet saved to disk is lost when the process stops. Redis saves RDB snapshots to disk by default, and AOF can be turned on to lose less.",
    },
  },
  keyvalue: {
    word: { zh: "键值 (key → value)", en: "key-value" },
    def: {
      zh: "最简单的数据存法：给每份数据起个唯一的名字（key），按名字存取内容（value）。像查字典：给出词条就拿到解释。",
      en: "The simplest way to store data. Give each piece of data a unique name, called the key, and store the content under it, called the value. You read it back by name, the way you look a word up in a dictionary.",
    },
  },
  ttl: {
    word: { zh: "TTL（存活时间）", en: "TTL (time to live)" },
    def: {
      zh: "给一个 key 设一个“保质期”。时间一到，Redis 就不再返回它。真正的删除发生在下次访问这个 key 的时候（惰性删除），或者由后台的定期抽样任务完成——所以过期的 key 可能还会短暂占着内存。缓存靠它让旧数据自动消失，而不是一直被读到。",
      en: "An expiry time set on a key. Once that time has passed, Redis no longer returns the key. The key is actually removed either when something tries to read it, or later by a background job that samples keys, so an expired key can still hold memory for a short while. Caches use a TTL so old values disappear on their own instead of being served forever.",
    },
  },
  eviction: {
    word: { zh: "内存淘汰 (eviction)", en: "eviction" },
    def: {
      zh: "内存用到上限（maxmemory）时，Redis 按策略挑一些 key 删掉给新数据腾地方，最常用的是 LRU（最近最少用）或 LFU（最不常用）。这和 TTL 过期是两回事：过期是到点自己失效，淘汰是内存不够被动清退。缓存容量小于数据总量时，淘汰会直接压低命中率。",
      en: "When memory reaches its limit (maxmemory), Redis picks some keys to delete to make room for new data — most commonly by LRU (least recently used) or LFU (least frequently used). This differs from TTL expiry: expiry is a key timing out on its own, while eviction is keys being pushed out because memory is full. When the cache is smaller than the working set, eviction directly drags the hit rate down.",
    },
  },
  cache: {
    word: { zh: "缓存 (cache)", en: "cache" },
    def: {
      zh: "把“算一次很贵、但短时间内会反复要”的结果先存起来，下次直接拿。就像把常用工具放在手边，而不是每次都跑去仓库取。",
      en: "A place to keep the result of something expensive to produce, so the next request can be answered from the stored copy. It is like keeping the tools you use most on your desk instead of walking to the warehouse each time.",
    },
  },
  cacheaside: {
    word: { zh: "旁路缓存 (cache-aside)", en: "cache-aside" },
    def: {
      zh: "最常见的缓存套路：先查缓存，命中就直接返回；没命中就去原始来源取，取到后再写回缓存并设 TTL。缓存由应用代码自己管，Redis 不会替你管。",
      en: "The most common caching pattern. The application reads the cache first. On a hit it returns that value. On a miss it reads the real source, then writes the result into the cache with a TTL. The application code manages the cache; Redis does not do it for you.",
    },
  },
  cachehit: {
    word: { zh: "命中 (cache hit)", en: "cache hit" },
    def: {
      zh: "要的数据缓存里正好有，直接返回，省下慢查询或外部调用。",
      en: "The value you asked for is already in the cache, so it is returned immediately. No slow query and no external call are needed.",
    },
  },
  cachemiss: {
    word: { zh: "未命中 (cache miss)", en: "cache miss" },
    def: {
      zh: "缓存里没有，只能去慢的原始来源取一趟，取完顺手写回缓存，下次就能命中。",
      en: "The value is not in the cache, so the application reads the slower original source and then writes the result back. The next read can then hit.",
    },
  },
  mysql: {
    word: { zh: "MySQL / 关系型数据库", en: "MySQL / relational DB" },
    def: {
      zh: "把数据长期、可靠地存在硬盘上的“主仓库”，支持复杂查询和事务。它关心“存得准存得久”，Redis 关心“取得快”。两者通常配合，而不是替代。",
      en: "A database that keeps data on disk for the long term, with complex queries and transactions. It is built to store data correctly and keep it; Redis is built to serve data quickly. Most systems use both rather than one instead of the other.",
    },
  },
  sourceoftruth: {
    word: { zh: "真相来源 (source of truth)", en: "source of truth" },
    def: {
      zh: "一份数据“以谁为准”。在我们的系统里，钱的账本以数据库为准（真相来源）；Redis 里的余额只是加速用的副本，随时可以丢掉重算。",
      en: "The copy of a piece of data that decides what is correct. In this system the money ledger in the database is the source of truth. The balance in Redis is only a fast copy that can be deleted and computed again.",
    },
  },
  idempotency: {
    word: { zh: "幂等 (idempotency)", en: "idempotency" },
    def: {
      zh: "同一个操作做一次和做很多次，结果一样。买标签时用它保证：网络重试或用户连续点击两下，也只会真正扣一次款、只生成一张标签。",
      en: "Running the same operation once or many times produces the same result. On a label purchase it means a network retry or a double click still charges once and creates one label.",
    },
  },
  setnx: {
    word: { zh: "SET NX", en: "SET NX" },
    def: {
      zh: "Redis 的一条命令：只有当 key 还不存在时才写入。因为命令是一条一条执行的，并发里只有第一个请求能写成功——适合用来“抢占一次处理权”。新代码请写成 SET key value NX PX 30000，让写入和设置过期在同一条命令里完成。",
      en: "A Redis command that writes a key only if the key does not already exist. Commands are executed one at a time, so among many concurrent requests only the first one succeeds. That makes it a simple way to let exactly one request claim a piece of work. In new code write it as SET key value NX PX 30000, so the key gets its expiry in the same command.",
    },
  },
  projection: {
    word: { zh: "投影 / 读模型 (projection)", en: "projection / read model" },
    def: {
      zh: "把“真相来源”算好的一个现成结果单独存一份，专门给读用。比如账本要一条条加才知道余额，就把算好的余额存进 Redis，读的时候直接拿。",
      en: "A ready-made result derived from the source of truth and kept only to make reads fast. Computing a balance means adding up the whole ledger, so the computed balance is stored in Redis and read directly.",
    },
  },
  ledger: {
    word: { zh: "账本 (ledger)", en: "ledger" },
    def: {
      zh: "只追加、不修改的流水记录。每一笔收支都往后加一行，从头加到尾就得到当前余额。查账、对账都靠它。",
      en: "An append-only record of transactions. Every credit or debit adds one new line, and adding all the lines together gives the current balance. It is what you audit and reconcile against.",
    },
  },
  invalidation: {
    word: { zh: "缓存失效 (invalidation)", en: "cache invalidation" },
    def: {
      zh: "当原始数据变了，就把对应的旧缓存删掉或更新，免得继续返回过时结果。这一步最容易出错：写数据库和删缓存是两个独立步骤，中间可能被并发的读请求插进来，把旧值又写回缓存。",
      en: "When the underlying data changes, the matching cache entry has to be deleted or updated so the old value is no longer served. This is the hardest part of caching, because the database write and the cache delete are two separate steps, and a concurrent reader can write the old value back in between them.",
    },
  },
  stampede: {
    word: { zh: "缓存击穿 (stampede)", en: "cache stampede" },
    def: {
      zh: "一个热点 key 刚过期，同一瞬间大量请求全部未命中，一起冲向数据库或外部 API，把后端压垮。常见解法：加锁让一个请求去重建、合并重复请求、把过期时间错开。",
      en: "One popular key expires, and in the same moment many requests all miss the cache and go to the database or the external API together. Common fixes: let one request rebuild the value while the others wait, merge duplicate requests, and spread expiry times apart.",
    },
  },
  latency: {
    word: { zh: "延迟 (latency)", en: "latency" },
    def: {
      zh: "从发出请求到拿到结果等了多久。内存读取约几十到上百纳秒，硬盘和跨网调用要慢几个数量级，所以“少跑几趟慢的”就能明显降低延迟。",
      en: "How long you wait between sending a request and getting the answer. A memory read takes tens to hundreds of nanoseconds. Disk reads and network calls are orders of magnitude slower, so removing slow round trips is what brings latency down.",
    },
  },
  singlethread: {
    word: { zh: "单线程", en: "single-threaded" },
    def: {
      zh: "Redis 一次只执行一条命令，按收到的顺序排队执行。好处是单条命令天生不用加锁；代价是一条很慢的命令会让排在它后面的所有请求一起等。一个线程之所以能同时照看成千上万个连接，靠的是 I/O 多路复用：事件循环通过 epoll（Linux）或 kqueue（macOS）同时监听所有连接，哪个连接的数据准备好了就处理哪个，不会停下来等某一个慢客户端。思路和 Node.js 的事件循环相同。Redis 6 之后网络读写可以用额外的线程，但命令仍然是一条一条执行的。",
      en: "Redis executes commands one at a time, in the order it receives them. Because nothing runs in parallel, a single command needs no locks to stay correct. The cost is that one slow command makes every command behind it wait. One thread can still serve thousands of connections because of I/O multiplexing: the event loop asks the kernel, through epoll on Linux or kqueue on macOS, which connections are ready and handles only those, so it never sits waiting on one slow client. It is the same idea as the Node.js event loop. Redis 6 and later can use extra threads for network I/O, but commands are still executed one at a time.",
    },
  },
  bff: {
    word: { zh: "BFF (聚合层)", en: "BFF" },
    def: {
      zh: "Backend For Frontend：专门给前端准备数据的一层后端。前端发一次请求，BFF 去调好几个服务、拼成前端正好要的形状再返回。",
      en: "Backend For Frontend: a backend layer built to serve one frontend. The frontend sends a single request; the BFF calls several services, combines the results, and returns exactly the shape the frontend needs.",
    },
  },
  carrier: {
    word: { zh: "承运商 (carrier)", en: "carrier" },
    def: {
      zh: "送快递的公司，比如 USPS、FedEx、UPS、Amazon。我们的系统要同时问它们各自的运费报价，再放在一起比价。",
      en: "A shipping company such as USPS, FedEx, UPS, or Amazon. This system asks each of them for a rate quote and puts the quotes side by side so they can be compared.",
    },
  },
  api: {
    word: { zh: "API", en: "API" },
    def: {
      zh: "别人搭好的“服务窗口”：你的程序把请求发过去，它把结果发回来。调外部 carrier API 可能慢、要花钱、还有次数限制。",
      en: "A service counter that someone else runs: your program sends a request and a result comes back. Calls to an external carrier API can be slow, can cost money, and are usually rate limited.",
    },
  },
  docker: {
    word: { zh: "Docker", en: "Docker" },
    def: {
      zh: "把一个软件连同它的运行环境打包成“集装箱”，一条命令就能在你电脑上跑起来，用完即弃，不会污染系统。本课用它一键启动 Redis。",
      en: "Docker packages a program together with everything it needs to run into a container. You start it with one command and delete it when you are finished, without installing anything into your own system. This course uses it to start Redis.",
    },
  },
  atomic: {
    word: { zh: "原子操作 (atomic)", en: "atomic" },
    def: {
      zh: "在 Redis 里，“原子”指一个操作执行期间不会有别的命令插进来，其它客户端看到的要么是它执行之前的状态，要么是执行之后的状态。Redis 一次只执行一条命令，所以 INCR、SET NX 这类单条命令天生就是原子的。注意这不等于“出错就全部撤销”：MULTI/EXEC 和 Lua 脚本都不回滚，中途某条命令出错，之前已经生效的写入会保留。",
      en: "In Redis, atomic means that no other command runs while the operation is in progress, so other clients see the state either before it or after it. Redis executes one command at a time, so a single command such as INCR or SET NX is atomic on its own. This is not the same as all-or-nothing: neither MULTI/EXEC nor a Lua script rolls back, and if one command fails halfway, the writes made before it stay in place.",
    },
  },
  encoding: {
    word: { zh: "底层编码 (encoding)", en: "encoding" },
    def: {
      zh: "同一种数据类型，Redis 在内存里可以用不同的内部结构来存。元素少时用紧凑省内存的（如 listpack/intset），超过配置的阈值后自动换成大数据量下更快的（如 hashtable/skiplist）。切换是自动的，也不会改变命令的行为。",
      en: "Redis can store the same data type using different internal layouts. While a value is small it uses a compact layout that saves memory, such as listpack or intset. Once it grows past a configured threshold, Redis switches to a layout that stays fast at size, such as hashtable or skiplist. The switch happens automatically and never changes what the commands do.",
    },
  },
  stream: {
    word: { zh: "Stream 流", en: "Stream" },
    def: {
      zh: "Redis 5.0 起的一种数据类型：只追加的日志 + 消费者组 + 消息确认（ack）。比用 List 拼的队列可靠得多：消费者读走消息后崩溃，没有确认的消息会留在待处理列表里，可以用 XAUTOCLAIM 交给别的消费者重新处理。消息在 Redis 宕机后能否保留，仍取决于持久化配置。需要可靠的消息队列时，应当选用它。",
      en: "A data type added in Redis 5.0: an append-only log, consumer groups, and acknowledgements. It is much more reliable than a queue built from a List: if a consumer crashes after reading a message, the unacknowledged message stays in the pending list, and another consumer can claim it with XAUTOCLAIM. Whether messages survive a Redis crash still depends on persistence. Use it when you need a reliable message queue.",
    },
  },
};

const RE = /\[\[(\w+):([^\]]+)\]\]/g;

// 把带 [[key:文字]] 标记的文案渲染成正文 + 可点击术语
export function RichText({ text, lang }: { text: string; lang: Lang }) {
  const parts: ReactNode[] = [];
  let last = 0;
  let k = 0;
  for (const m of text.matchAll(RE)) {
    const idx = m.index!;
    if (idx > last) parts.push(text.slice(last, idx));
    parts.push(<Term key={k++} termKey={m[1]} display={m[2]} lang={lang} />);
    last = idx + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

type PopPos = { left: number; top: number; below: boolean };

// Only one definition is open at a time: opening a term closes the one before it.
let closeOpenTerm: (() => void) | null = null;

function Term({
  termKey,
  display,
  lang,
}: {
  termKey: string;
  display: string;
  lang: Lang;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<PopPos | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLSpanElement>(null);
  const popId = useId();
  const entry = glossary[termKey];

  // While open: Esc or a press anywhere outside the term and its definition closes it,
  // and opening another term closes this one.
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    closeOpenTerm?.();
    closeOpenTerm = close;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node;
      if (btnRef.current?.contains(target) || popRef.current?.contains(target)) return;
      close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
      if (closeOpenTerm === close) closeOpenTerm = null;
    };
  }, [open]);

  // 弹层用 portal 渲染到 body + 固定定位，从触发词的位置算坐标——这样无论
  // 祖先有没有 overflow:hidden / backdrop-filter，都不会被裁掉。滚动/改窗口就关掉。
  useEffect(() => {
    if (!open) return;
    const place = () => {
      const el = btnRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vw = window.innerWidth;
      const halfW = Math.min(300, vw * 0.78) / 2;
      const center = r.left + r.width / 2;
      // 上方放得下整个弹层才朝上弹，否则朝下，免得顶出屏幕。弹层第一次渲染前量不到高度，
      // 先按 240px 估，渲染后的下一帧再按实际高度重算一次。
      const h = popRef.current?.offsetHeight ?? 240;
      const below = r.top - 8 - h < 8;
      setPos({
        left: Math.min(Math.max(center, halfW + 8), vw - halfW - 8),
        top: below ? r.bottom + 8 : r.top - 8,
        below,
      });
    };
    place();
    const frame = requestAnimationFrame(place);
    // 滚动/改窗口时跟随重新定位（而不是关闭）——既稳，也不会被残余的平滑滚动误关。
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open]);

  if (!entry) return <>{display}</>;

  return (
    <span className="term-wrap">
      <button
        ref={btnRef}
        type="button"
        className={`term ${open ? "term-on" : ""}`}
        aria-expanded={open}
        aria-describedby={open ? popId : undefined}
        onClick={() => setOpen((o) => !o)}
      >
        {display}
      </button>
      {open &&
        pos &&
        typeof document !== "undefined" &&
        createPortal(
          <span
            ref={popRef}
            id={popId}
            className="term-pop"
            role="tooltip"
            style={{
              position: "fixed",
              left: pos.left,
              top: pos.top,
              bottom: "auto",
              transform: pos.below
                ? "translate(-50%, 0)"
                : "translate(-50%, -100%)",
            }}
          >
            <b>{t(entry.word, lang)}</b>
            {t(entry.def, lang)}
          </span>,
          document.body,
        )}
    </span>
  );
}

/**
 * 正文标记：`code` → <code>，**粗** → <strong>，*斜* → <em>，[[术语]] → 词典弹层。
 *
 * 这一套原本只长在 /pitfalls 页面里，而 lib/pitfalls.ts 顶部那句约定
 * （「正文里用反引号标命令，**强调**渲成 strong」）是写给全站数据文件的。
 * 于是 /simulator 按约定写了 **强调**，却直接调 RichText —— 那一层只认
 * [[术语]]，星号被原样印在页面上（线上 12 处）。
 *
 * 所以搬到这里，两处共用一份。四层由外往内依次剥：
 * 反引号 → 双星号 → 单星号 → 术语。
 */
export function Markup({
  text,
  lang,
  codeClass,
}: {
  text: string;
  lang: Lang;
  /** 各站代码片段的行内样式类名不同,由调用方给。 */
  codeClass?: string;
}) {
  return <MarkupCode text={text} lang={lang} codeClass={codeClass} />;
}

function MarkupCode({ text, lang, codeClass }: { text: string; lang: Lang; codeClass?: string }) {
  const segs = text.split("`");
  return (
    <>
      {segs.map((seg, i) =>
        i % 2 === 1 ? (
          <code className={codeClass} key={i}>
            {seg}
          </code>
        ) : (
          <MarkupStrong key={i} text={seg} lang={lang} />
        ),
      )}
    </>
  );
}

function MarkupStrong({ text, lang }: { text: string; lang: Lang }) {
  const segs = text.split("**");
  return (
    <>
      {segs.map((seg, i) =>
        i % 2 === 1 ? (
          <strong key={i}>
            <MarkupEm text={seg} lang={lang} />
          </strong>
        ) : (
          <MarkupEm key={i} text={seg} lang={lang} />
        ),
      )}
    </>
  );
}

function MarkupEm({ text, lang }: { text: string; lang: Lang }) {
  const segs = text.split("*");
  return (
    <>
      {segs.map((seg, i) =>
        i % 2 === 1 ? (
          <em key={i}>
            <RichText text={seg} lang={lang} />
          </em>
        ) : (
          <RichText key={i} text={seg} lang={lang} />
        ),
      )}
    </>
  );
}
