"use client";

// 初学者术语词典：正文里写 [[key:显示文字]]，RichText 会把它渲染成
// 带虚线下划线的可点击术语，点开是一段“通俗解释”的解释。
// 各站数据文件里都可以直接用这些 key；找不到 key 时只渲染显示文字，绝不报错。

import { useState, useRef, useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { t, type L, type Lang } from "@/lib/i18n";

export const glossary: Record<string, { word: L; def: L }> = {
  redis: {
    word: { zh: "Redis", en: "Redis" },
    def: {
      zh: "一个主要把数据放在内存里的键值数据存储（data store）。名字来自 REmote DIctionary Server——可以想成一个能被网络上很多程序同时读写的超大字典。常用来做缓存、计数、去重、排行榜等“又快又临时”的活。",
      en: "A data store that keeps its data mostly in memory (RAM). The name stands for REmote DIctionary Server: one large dictionary that many programs can read and write over the network. It is normally used for caching, counters, deduplication, and leaderboards — work that has to be fast and does not have to last.",
    },
  },
  memory: {
    word: { zh: "内存 (RAM)", en: "memory (RAM)" },
    def: {
      zh: "电脑里读写最快的临时存储，断电就清空。Redis 把数据放这里，所以取数据非常快；代价是容量有限、且默认不像硬盘那样长期保存。",
      en: "The computer's fastest working storage. It is erased when the power is lost. Redis keeps its data here, which is why reads are fast. The cost is that memory is much smaller than disk, and nothing survives a restart unless persistence is turned on.",
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
      zh: "Redis 一次只执行一条命令，按收到的顺序排队执行。好处是单条命令天生不用加锁；代价是一条很慢的命令会让排在它后面的所有请求一起等。Redis 6 之后网络读写可以用额外的线程，但命令仍然是一条一条执行的。思路和 Node.js 的事件循环相同。",
      en: "Redis executes commands one at a time, in the order it receives them. Because nothing runs in parallel, a single command needs no locks to stay correct. The cost is that one slow command makes every command behind it wait. Redis 6 and later can use extra threads for network I/O, but commands are still executed one at a time. It is the same idea as the Node.js event loop.",
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
      zh: "一个操作要么整体完成、要么完全不发生，中间不会被别的请求插进来。Redis 一次只执行一条命令，所以 INCR、SET NX 这类单条命令天生就是原子的。注意：MULTI/EXEC 只保证这一批命令中间不被别人插入，并不能回滚——某条命令执行失败，其它命令照样生效。",
      en: "An operation either happens completely or does not happen at all, and no other request can slip in halfway through. Redis executes one command at a time, so a single command such as INCR or SET NX is atomic on its own. Note that MULTI/EXEC only guarantees that no other client's command runs in between; it cannot roll back. If one command inside the block fails, the others still take effect.",
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
      zh: "Redis 5.0 起的一种数据类型：只追加的日志 + 消费者组 + 消息确认(ack)。比用 List 拼的队列可靠得多——消费者崩了消息不会丢，能重投。真要做可靠消息队列就用它。",
      en: "A data type added in Redis 5.0: an append-only log, consumer groups, and acknowledgements. It is much more reliable than a queue built from a List, because a message that a consumer never acknowledges is kept and can be delivered again. Use it when you need a message queue you can trust.",
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
  const entry = glossary[termKey];

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
      const below = r.top < 200; // 靠近视口顶部就朝下弹，免得顶出屏幕
      setPos({
        left: Math.min(Math.max(center, halfW + 8), vw - halfW - 8),
        top: below ? r.bottom + 8 : r.top - 8,
        below,
      });
    };
    place();
    // 滚动/改窗口时跟随重新定位（而不是关闭）——既稳，也不会被残余的平滑滚动误关。
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
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
        onClick={() => setOpen((o) => !o)}
      >
        {display}
      </button>
      {open &&
        pos &&
        typeof document !== "undefined" &&
        createPortal(
          <span
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
