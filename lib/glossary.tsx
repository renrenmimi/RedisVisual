"use client";

// 小白术语词典：正文里写 [[key:显示文字]]，RichText 会把它渲染成
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
      en: "A data store that keeps data mostly in memory (RAM). The name means REmote DIctionary Server — think of one giant dictionary many programs can read/write over the network. Common jobs: caching, counters, dedup, leaderboards — anything fast and short-lived.",
    },
  },
  memory: {
    word: { zh: "内存 (RAM)", en: "memory (RAM)" },
    def: {
      zh: "电脑里读写最快的临时存储，断电就清空。Redis 把数据放这里，所以取数据非常快；代价是容量有限、且默认不像硬盘那样长期保存。",
      en: "The computer's fastest scratch storage; it clears when power is lost. Redis keeps data here, which is why reads are so fast — the trade-off is limited size and no long-term durability by default.",
    },
  },
  keyvalue: {
    word: { zh: "键值 (key → value)", en: "key–value" },
    def: {
      zh: "最简单的数据存法：给每份数据起个唯一的名字（key），按名字存取内容（value）。像查字典：给出词条就拿到解释。",
      en: "The simplest way to store data: give each piece a unique name (key) and look it up by that name (value). Like a dictionary: give the word, get the definition.",
    },
  },
  ttl: {
    word: { zh: "TTL（存活时间）", en: "TTL (time to live)" },
    def: {
      zh: "给一份数据设一个“保质期”。到点后 Redis 自动把它删掉。缓存最爱用它：让旧数据到期自动消失，避免一直返回过时结果。",
      en: "An expiry timer on a piece of data. When it runs out, Redis deletes the key automatically. Caches love it: stale data disappears on its own instead of lingering.",
    },
  },
  cache: {
    word: { zh: "缓存 (cache)", en: "cache" },
    def: {
      zh: "把“算一次很贵、但短时间内会反复要”的结果先存起来，下次直接拿。就像把常用工具放在手边，而不是每次都跑去仓库取。",
      en: "Save the result of something expensive that gets asked for repeatedly, so next time you just hand it back. Like keeping your go-to tools on the desk instead of walking to the warehouse each time.",
    },
  },
  cacheaside: {
    word: { zh: "旁路缓存 (cache-aside)", en: "cache-aside" },
    def: {
      zh: "最常见的缓存套路：先查缓存，命中就直接返回；没命中就去原始来源取，取到后再写回缓存并设 TTL。由应用代码自己管缓存。",
      en: "The most common caching pattern: check the cache first; on a hit, return it; on a miss, fetch from the real source, then write the result back into the cache with a TTL. The app code manages the cache itself.",
    },
  },
  cachehit: {
    word: { zh: "命中 (cache hit)", en: "cache hit" },
    def: {
      zh: "要的数据缓存里正好有，直接返回，省下慢查询或外部调用。",
      en: "The data you asked for is already in the cache, so it's returned right away — no slow query or external call needed.",
    },
  },
  cachemiss: {
    word: { zh: "未命中 (cache miss)", en: "cache miss" },
    def: {
      zh: "缓存里没有，只能去慢的原始来源取一趟，取完顺手写回缓存，下次就能命中。",
      en: "Not in the cache, so you go fetch from the slow original source — then write it back so next time hits.",
    },
  },
  mysql: {
    word: { zh: "MySQL / 关系型数据库", en: "MySQL / relational DB" },
    def: {
      zh: "把数据长期、可靠地存在硬盘上的“主仓库”，支持复杂查询和事务。它关心“存得准存得久”，Redis 关心“取得快”。两者通常配合，而不是替代。",
      en: "The durable “main warehouse” that stores data on disk with complex queries and transactions. It cares about storing correctly and permanently; Redis cares about serving fast. They usually work together, not one instead of the other.",
    },
  },
  sourceoftruth: {
    word: { zh: "真相来源 (source of truth)", en: "source of truth" },
    def: {
      zh: "一份数据“以谁为准”。在我们的系统里，钱的账本以数据库为准（真相来源）；Redis 里的余额只是加速用的副本，随时可以丢掉重算。",
      en: "The authoritative copy of a piece of data. In our system the money ledger in the database is the source of truth; the balance in Redis is just a fast copy that can be thrown away and recomputed.",
    },
  },
  idempotency: {
    word: { zh: "幂等 (idempotency)", en: "idempotency" },
    def: {
      zh: "同一个操作做一次和做很多次，结果一样。买标签时用它保证：网络重试或用户连续点击两下，也只会真正扣一次款、只生成一张标签。",
      en: "Doing the same operation once or many times gives the same result. On label purchase it guarantees that network retries or a double-click still charge only once and create only one label.",
    },
  },
  setnx: {
    word: { zh: "SET NX", en: "SET NX" },
    def: {
      zh: "Redis 的一条命令：只有当 key 还不存在时才写入。因为 Redis 命令是原子执行的，并发里只有第一个请求能写成功——天生适合“抢占一次处理权”。",
      en: "A Redis command that writes a key only if it doesn't already exist. Because Redis runs commands atomically, only the first request among many succeeds — perfect for “claim the right to process this once”.",
    },
  },
  projection: {
    word: { zh: "投影 / 读模型 (projection)", en: "projection / read model" },
    def: {
      zh: "把“真相来源”算好的一个现成结果单独存一份，专门给读用。比如账本要一条条加才知道余额，就把算好的余额存进 Redis，读的时候直接拿。",
      en: "A ready-made result derived from the source of truth, kept just for fast reads. E.g. computing a balance means summing the ledger — so store the computed balance in Redis and read it directly.",
    },
  },
  ledger: {
    word: { zh: "账本 (ledger)", en: "ledger" },
    def: {
      zh: "只追加、不修改的流水记录。每一笔收支都往后加一行，从头加到尾就得到当前余额。查账、对账都靠它。",
      en: "An append-only record of transactions. Every credit or debit adds a new line; sum them all and you get the current balance. It's what you audit and reconcile against.",
    },
  },
  invalidation: {
    word: { zh: "缓存失效 (invalidation)", en: "cache invalidation" },
    def: {
      zh: "当原始数据变了，就把对应的旧缓存删掉或更新，免得继续返回过时结果。缓存里最容易出错的一步，业界名言：“最难的两件事之一”。",
      en: "When the underlying data changes, delete or update the matching cache entry so you stop serving stale results. It's the trickiest part of caching — famously “one of the two hard things”.",
    },
  },
  stampede: {
    word: { zh: "缓存击穿 (stampede)", en: "cache stampede" },
    def: {
      zh: "一个热门缓存刚过期，同一瞬间成百上千个请求全部未命中，一起冲向数据库或外部 API，把后端压垮。解决办法有加锁、请求合并、TTL 抖动等。",
      en: "A hot cache entry expires and, in the same instant, hundreds of requests all miss and stampede the database or external API at once. Fixes include locking, request coalescing, and TTL jitter.",
    },
  },
  latency: {
    word: { zh: "延迟 (latency)", en: "latency" },
    def: {
      zh: "从发出请求到拿到结果等了多久。内存读取约几十到上百纳秒，硬盘和跨网调用要慢几个数量级，所以“少跑几趟慢的”就能明显降低延迟。",
      en: "How long you wait between asking and getting an answer. A memory read is tens-to-hundreds of nanoseconds; disk and network calls are orders of magnitude slower — so cutting slow round-trips drops latency a lot.",
    },
  },
  singlethread: {
    word: { zh: "单线程", en: "single-threaded" },
    def: {
      zh: "Redis 处理命令的核心逻辑只有一条线在跑，同一时刻只做一件事。好处是天生不用加锁；代价是一条很慢的命令会卡住后面所有请求。和 Node.js 的事件循环是同一种思路。",
      en: "Redis runs the core of each command on a single line of execution — one thing at a time. Upside: no locks needed. Downside: one slow command blocks everything behind it. Same idea as Node.js's event loop.",
    },
  },
  bff: {
    word: { zh: "BFF (聚合层)", en: "BFF" },
    def: {
      zh: "Backend For Frontend：专门给前端准备数据的一层后端。前端发一次请求，BFF 在后台去调好几个服务、拼成前端正好要的形状再返回。",
      en: "Backend For Frontend: a backend layer built to serve the frontend. The frontend makes one request; the BFF calls several services behind the scenes and returns exactly the shape the frontend needs.",
    },
  },
  carrier: {
    word: { zh: "承运商 (carrier)", en: "carrier" },
    def: {
      zh: "送快递的公司，比如 USPS、FedEx、UPS、Amazon。我们的系统要同时问它们各自的运费报价，再放在一起比价。",
      en: "A shipping company — USPS, FedEx, UPS, Amazon, etc. Our system asks each of them for a rate quote and lays the quotes side by side for comparison.",
    },
  },
  api: {
    word: { zh: "API", en: "API" },
    def: {
      zh: "别人搭好的“服务窗口”：你的程序把请求发过去，它把结果发回来。调外部 carrier API 可能慢、要花钱、还有次数限制。",
      en: "A service counter someone else runs: your program sends a request, a result comes back. External carrier APIs can be slow, cost money, and have rate limits.",
    },
  },
  docker: {
    word: { zh: "Docker", en: "Docker" },
    def: {
      zh: "把一个软件连同它的运行环境打包成“集装箱”，一条命令就能在你电脑上跑起来，用完即弃，不会污染系统。本课用它一键启动 Redis。",
      en: "Packages a program together with its environment into a “container” you can start with one command, then throw away — without polluting your system. We use it to spin up Redis in one line.",
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
