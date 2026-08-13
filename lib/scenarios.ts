// 第 2 站「我们为什么用 Redis」的全部双语文案数据。
// 主题：WeShipItNow —— 一个多承运商运费比价 / 买标签平台，Redis 出现在三个地方。
// 每个场景（scenario）是一段可单步推进的动画走查：若干 step（每步一句标题 + 一段讲解 + 一句舞台字幕），
// 外加一张「面试口径」卡（怎么说 / 别过度包装）。
// 画面（动画 JSX）在 app/scenarios/page.tsx 里按 scenario.id + step.phase 对应，做到数据 / 页面分离。

import type { L } from "@/lib/i18n";

// 每一步：进入本步的按钮文字（action）、稳定的画面标识（phase）、标题、讲解正文、舞台字幕。
export type ScenarioStep = {
  action?: L; // 推进到这一步的按钮文字（第一步没有）
  phase: string; // 画面标识，页面据此渲染对应动画
  title: L;
  text: L; // 讲解正文，用 RichText 渲染（含 [[术语]] 标记）
  caption: L; // 舞台底部的一句话字幕
};

// 面试口径：可以这样说（good）/ 但要诚实、别过度包装（honest）。
export type InterviewNote = {
  good: L[];
  honest: L[];
};

export type Scenario = {
  id: "rate" | "idem" | "balance";
  tab: L; // tab 上的短标（场景 A / B / C）
  name: L; // 场景名
  kicker: L; // tab 副标（mono 小字）
  steps: ScenarioStep[];
  interview: InterviewNote;
};

// ---------- 页头 + 通用小文案（本站专属，不进 i18n.tsx） ----------

export const meta = {
  title: { zh: "第 2 站 · 我们为什么用 Redis", en: "Stop 2 · Why We Use Redis" },
  subtitle: {
    zh: "拿一个真实系统 WeShipItNow，把 Redis 的三处用法讲透——顺带教你面试怎么答。",
    en: "One real system, WeShipItNow, and the three places Redis earns its keep — plus how to talk about it in interviews.",
  },
  ivGood: { zh: "面试可以这样说", en: "In interviews, you can say" },
  ivHonest: { zh: "但要诚实 · 别过度包装", en: "But stay honest · don't oversell" },
  next: { zh: "下一站：跟着写一遍 →", en: "Next stop: Code it yourself →" },
  kbdStep: { zh: "推进本场景", en: "step this scenario" },
  kbdBack: { zh: "回退", en: "back" },
  autoplay: { zh: "自动播放", en: "Auto-play" },
  pause: { zh: "暂停", en: "Pause" },
  stepDone: { zh: "本场景已看完 · 点上方 tab 换一个", en: "Scenario complete · pick another tab above" },
};

// ---------- 顶部：WeShipItNow 系统背景 ----------

export const intro = {
  kicker: {
    zh: "WeShipItNow · 多承运商运费比价 & 买标签平台",
    en: "WeShipItNow · multi-carrier rate-shopping & label platform",
  },
  title: {
    zh: "一个真实系统里，Redis 到底用在哪三处",
    en: "Where Redis actually lives in one real system",
  },
  text: {
    zh:
      "WeShipItNow 让用户输入发货/收货邮编、包裹重量尺寸和发货日期，然后同时向 USPS、FedEx、UPS、Amazon 问[[carrier:承运商]]报价、比价，再买运费标签、追踪包裹。" +
      "[[redis:Redis]] 在这个系统里出现在三个地方——每一处都能回答同一个问题：为什么是 Redis，而不是别的。" +
      "下面三个场景，点 tab 切换，每个都能一步步看动画。",
    en:
      "WeShipItNow takes an origin/destination ZIP, package weight and dimensions, and a ship date, then asks USPS, FedEx, UPS and Amazon for [[carrier:carrier]] quotes at once, compares them, and lets you buy a label and track the parcel. " +
      "[[redis:Redis]] shows up in three places here — and each one answers the same question: why Redis, and not something else. " +
      "Switch tabs between the three scenarios below; each plays step by step.",
  },
};

// ---------- 三个场景 ----------

export const scenarios: Scenario[] = [
  // ============ 场景 A：运费报价缓存（cache-aside）============
  {
    id: "rate",
    tab: { zh: "场景 A", en: "Scenario A" },
    name: { zh: "运费报价缓存", en: "Rate-quote caching" },
    kicker: { zh: "cache-aside · 简历主用法", en: "cache-aside · the résumé headline" },
    steps: [
      {
        phase: "why",
        title: { zh: "先看清楚：慢的到底是谁", en: "First, spot what's actually slow" },
        text: {
          zh:
            "一次报价要同时问 4 家 [[carrier:承运商]] 的 [[api:API]]：USPS 约 300ms、FedEx 约 800ms、UPS 偶尔超 1 秒、Amazon 也不快。" +
            "[[bff:BFF]] 得等最慢的那个回来才能比价，所以一次报价天然就是「秒级」。" +
            "更关键的是同一个包裹会被反复查——用户刷新、点返回、同事查同一条线路，短时间内报价根本不变。" +
            "「算一次很贵、又反复要」，这正是 [[cache:缓存]] 的教科书场景。",
          en:
            "One quote asks four [[carrier:carrier]] [[api:APIs]] at once: USPS ~300ms, FedEx ~800ms, UPS sometimes over a second, Amazon no faster. " +
            "The [[bff:BFF]] can't compare until the slowest one returns, so a quote is inherently seconds-long. " +
            "Worse, the same package gets queried again and again — a refresh, a back button, a colleague checking the same lane — and the rate doesn't change over that short window. " +
            "Expensive to compute, asked for repeatedly: the textbook case for a [[cache:cache]].",
        },
        caption: { zh: "慢 + 重复 = 缓存的黄金场景。", en: "Slow + repeated = the cache's sweet spot." },
      },
      {
        action: { zh: "看第一次查询（未命中）", en: "Watch the first query (miss)" },
        phase: "miss",
        title: { zh: "第一次查询：缓存里空空如也", en: "First query: the cache is empty" },
        text: {
          zh:
            "前端经 Apollo Client 把报价请求发给 GraphQL [[bff:BFF]]，BFF 先问 [[redis:Redis]]：「这个包裹的报价你有吗？」" +
            "第一次当然[[cachemiss:未命中]]。于是 BFF 才并发去调 4 家 carrier 的 [[api:API]]，等最慢的回来，聚合成一份可比较的报价。" +
            "这一趟，就是那要命的一秒多。",
          en:
            "The frontend (via Apollo Client) sends the quote request to the GraphQL [[bff:BFF]], which first asks [[redis:Redis]]: “do you have a rate for this package?” " +
            "The first time it is a [[cachemiss:miss]], of course. Only then does the BFF fan out to the four carrier [[api:APIs]], wait for the slowest, and aggregate one comparable set of quotes. " +
            "That round trip is the painful second-plus.",
        },
        caption: { zh: "未命中 → 回源并发调 4 家 carrier，慢。", en: "Miss → fan out to 4 carriers. Slow." },
      },
      {
        action: { zh: "把结果写回 Redis", en: "Write the result back" },
        phase: "write",
        title: { zh: "写回缓存：SET + 短 TTL，key 必须带 accountId", en: "Write back: SET + short TTL, key must carry accountId" },
        text: {
          zh:
            "聚合好的报价用 SET 写回 Redis，并设一个短 [[ttl:TTL]]（报价本来就只在短时间内有效）。" +
            "关键在 cache key：shipping-rate:{accountId}:{originZip}:{destZip}:{weight}:{dims}:{shipDate}。" +
            "少了 accountId 就会把 A 客户谈下来的折扣价返回给 B 客户——这不是普通 bug，是定价数据泄露。",
          en:
            "The aggregated quote is written back with SET and a short [[ttl:TTL]] (a quote is only valid briefly anyway). " +
            "The key is what matters: shipping-rate:{accountId}:{originZip}:{destZip}:{weight}:{dims}:{shipDate}. " +
            "Drop the accountId and you'd hand customer A's negotiated discount to customer B — not an ordinary bug, but a pricing-data leak.",
        },
        caption: { zh: "key 带上 accountId，否则串价。", en: "Put accountId in the key, or prices bleed across accounts." },
      },
      {
        action: { zh: "看第二次查询（命中）", en: "Watch the second query (hit)" },
        phase: "hit",
        title: { zh: "第二次查询：直接命中，秒级变毫秒级", en: "Second query: a hit — seconds become milliseconds" },
        text: {
          zh:
            "同一个包裹再被查一次，BFF 问 Redis 就直接[[cachehit:命中]]了：一次内存读取，[[latency:延迟]]从一秒多掉到毫秒级，" +
            "4 家 carrier 一个都不用惊动。这就是缓存真正省下的东西——不是「更快的 API」，而是「根本不调 API」。",
          en:
            "The same package is queried again; the BFF asks Redis and gets a [[cachehit:hit]]: one in-memory read, [[latency:latency]] dropping from over a second to milliseconds, " +
            "and not one of the four carriers is bothered. That's what a cache truly saves — not a “faster API”, but “no API call at all”.",
        },
        caption: { zh: "命中 = 一次内存读取，不碰 carrier。", en: "Hit = one memory read, zero carrier calls." },
      },
      {
        action: { zh: "放大看 key 的陷阱", en: "Zoom in on the key trap" },
        phase: "leak",
        title: { zh: "如果 key 不带 accountId 会怎样", en: "What happens if the key omits accountId" },
        text: {
          zh:
            "假设 key 只用了邮编 + 重量，没带 accountId。客户 A（有大客户折扣）先查了一次，折扣价写进 Redis。" +
            "客户 B 查同样的线路，命中的却是 A 的折扣价——B 看到了本不该看到的价格，你也少收了钱。" +
            "缓存 key 的粒度，直接等于数据隔离的边界。",
          en:
            "Suppose the key uses only ZIP + weight, no accountId. Customer A (with a volume discount) queries first, and that discounted price lands in Redis. " +
            "Customer B queries the same lane and hits A's discounted price — B sees a price they never should, and you undercharge. " +
            "The granularity of a cache key IS the boundary of data isolation.",
        },
        caption: { zh: "缓存键少一个维度，价格就会跨账户泄露。", en: "One missing key segment, and prices leak between tenants." },
      },
      {
        action: { zh: "区分两层缓存 + 降级", en: "Two cache layers + graceful degradation" },
        phase: "layers",
        title: { zh: "别混淆：Apollo 缓存 vs Redis 缓存", en: "Don't conflate: Apollo cache vs Redis cache" },
        text: {
          zh:
            "面试常被追问。[[cacheaside:Apollo Client]] 缓存在浏览器端，只服务当前这个用户、少发重复的 GraphQL 请求；" +
            "Redis 在服务端，被所有用户、所有实例共享，少调重复的 carrier API。别说成「两者都降低了 carrier API 延迟」——只有服务端的 Redis 拦得住 carrier 调用。" +
            "还有降级：Redis 不可用要能绕过它直连 carrier（慢一点但仍可用），Redis 不能是单点；而且真正买标签时要重新校验价格，不能盲信旧报价。",
          en:
            "A common follow-up. The [[cacheaside:Apollo Client]] cache lives in the browser, serves only the current user, and cuts repeated GraphQL requests; " +
            "Redis lives on the server, shared across all users and instances, and cuts repeated carrier API calls. Don't say “both reduce carrier API latency” — only server-side Redis intercepts carrier calls. " +
            "And degrade gracefully: if Redis is down, bypass it and call carriers directly (slower but working) — Redis must not be a single point of failure. At real label-purchase time, re-validate the price; never trust a stale quote.",
        },
        caption: { zh: "浏览器一层、服务端一层，别混为一谈。", en: "One layer in the browser, one on the server — keep them straight." },
      },
    ],
    interview: {
      good: [
        {
          zh: "简历主用法就说这个：cache-aside 缓存 carrier 报价，把秒级外部调用变成毫秒级内存读取。",
          en: "Lead with this one: cache-aside on carrier quotes, turning second-scale external calls into millisecond memory reads.",
        },
        {
          zh: "主动讲 key 设计带 accountId、短 TTL、Redis 不可用能降级直连 carrier——这些细节最加分。",
          en: "Volunteer the details: accountId in the key, short TTL, and a Redis-down fallback that calls carriers directly. Those score points.",
        },
      ],
      honest: [
        {
          zh: "别把 Apollo Client 缓存和 Redis 缓存说成一回事；只有服务端的 Redis 拦得住重复的 carrier 调用。",
          en: "Don't equate the Apollo Client cache with the Redis cache; only server-side Redis intercepts repeated carrier calls.",
        },
        {
          zh: "别吹「零延迟」；买标签前仍要重新校验价格，缓存只是加速读、不是权威价。",
          en: "Don't claim “zero latency”; you still re-validate the price before buying a label. The cache accelerates reads, it isn't the authoritative price.",
        },
      ],
    },
  },

  // ============ 场景 B：幂等（SET NX）============
  {
    id: "idem",
    tab: { zh: "场景 B", en: "Scenario B" },
    name: { zh: "买标签幂等", en: "Idempotent purchase" },
    kicker: { zh: "SET NX · 防重复扣款", en: "SET NX · no double charge" },
    steps: [
      {
        phase: "double",
        title: { zh: "问题：重复提交导致重复下单", en: "The problem: one accidental double-click, two labels" },
        text: {
          zh:
            "「购买标签」这个按钮，用户可能连续点击两次；或者前端网络超时后自动重试。" +
            "两个几乎同时到达的请求，如果都照常执行，就会重复建标签、重复扣款、甚至重复给用户发通知。" +
            "只要是「花钱」「产生副作用」的写操作，就必须防重复。",
          en:
            "The “Buy label” button can be double-clicked; or the frontend auto-retries after a network timeout. " +
            "Two requests arriving almost together, if both run normally, will create duplicate labels, charge twice, even notify the user twice. " +
            "Any write that spends money or has side effects must be protected against duplicates.",
        },
        caption: { zh: "双击 / 重试 → 两个请求同时冲进来。", en: "Double-click / retry → two requests rush in at once." },
      },
      {
        action: { zh: "用 SET NX 抢占处理权", en: "Claim the slot with SET NX" },
        phase: "nx",
        title: { zh: "SET NX：只有第一个请求写入成功", en: "SET NX: only the first one wins" },
        text: {
          zh:
            "用请求里唯一的 requestId 当 key：SET idempotency:purchase-label:{requestId} processing NX EX 60。" +
            "[[setnx:NX]] 的意思是「只有 key 不存在时才写成功」。" +
            "因为 Redis 命令是原子执行的，两个并发请求里只有第一个能写成功；第二个看到 key 已存在，写失败。EX 60 给这把「锁」一个过期时间，避免卡死。",
          en:
            "Use the request's unique requestId as the key: SET idempotency:purchase-label:{requestId} processing NX EX 60. " +
            "[[setnx:NX]] means “only write if the key does not already exist”. " +
            "Because Redis executes commands atomically, only the first of two concurrent requests succeeds; the second sees the key already there and fails to write. EX 60 gives this “lock” an expiry so the lock cannot block later attempts indefinitely.",
        },
        caption: { zh: "原子的 NX：并发下只有一个请求获得处理权。", en: "Atomic NX: exactly one request proceeds under concurrency." },
      },
      {
        action: { zh: "看两个请求各自的结局", en: "See how each request ends" },
        phase: "resolve",
        title: { zh: "首个请求执行扣款，后续请求复用结果", en: "The first request charges; later ones reuse the result" },
        text: {
          zh:
            "抢到 key 的请求继续往下：建标签、扣一次款、把结果写好。没抢到的那个请求不再重复执行，" +
            "而是直接返回上一次的结果（或「处理中，请稍候」）。对用户来说，点一下和点两下，结果完全一样——这就是[[idempotency:幂等]]。",
          en:
            "The request that grabbed the key proceeds: create the label, charge once, store the result. The one that didn't grab it does NOT re-run; " +
            "it returns the previous result (or “processing, hold on”). To the user, one click and two clicks give the exact same outcome — that is [[idempotency:idempotency]].",
        },
        caption: { zh: "一次真执行，其余全部复用结果。", en: "One real execution; everyone else reuses the result." },
      },
      {
        action: { zh: "生产级还差什么", en: "What production still needs" },
        phase: "honest",
        title: { zh: "别只靠一个易失的 Redis key", en: "Don't rely on a volatile Redis key alone" },
        text: {
          zh:
            "诚实地说：Redis key 会过期、也会因为 Redis 重启而丢。真正涉及钱的幂等，还得配合数据库的唯一约束" +
            "（同一个 requestId / 订单只能落一行）和订单状态检查做兜底。Redis 负责快速拦住绝大多数重复，数据库负责在极端情况下守住最后一道线。",
          en:
            "Honestly: a Redis key can expire, and can be lost on a Redis restart. Money-grade idempotency also needs a database unique constraint " +
            "(the same requestId / order can only insert one row) plus an order-status check as a backstop. Redis blocks the vast majority of duplicates fast; the database holds the final line in the extreme case.",
        },
        caption: { zh: "Redis 拦快的，数据库守最后一道线。", en: "Redis blocks duplicates quickly; the database provides the final guarantee." },
      },
    ],
    interview: {
      good: [
        {
          zh: "讲清 SET NX 的原子性：并发里只有第一个请求抢到处理权，其余复用结果、不重复执行。",
          en: "Explain the atomicity of SET NX: only the first concurrent request claims the slot; the rest reuse the result instead of re-running.",
        },
        {
          zh: "说明 key 用唯一 requestId、加 EX 过期，避免锁死。",
          en: "Note the key is a unique requestId with an EX expiry, so the lock cannot block later attempts.",
        },
      ],
      honest: [
        {
          zh: "如果你的真实项目只做了报价缓存，就别把幂等也说成「我用 Redis 做过」——只说你了解这个模式。",
          en: "If your real project only did rate caching, don't claim you “built idempotency with Redis” — say you understand the pattern.",
        },
        {
          zh: "强调生产级幂等要配合数据库唯一约束，不能只靠易失的 Redis key。",
          en: "Stress that production idempotency pairs with a DB unique constraint; a volatile Redis key alone isn't enough.",
        },
      ],
    },
  },

  // ============ 场景 C：余额投影（读模型）============
  {
    id: "balance",
    tab: { zh: "场景 C", en: "Scenario C" },
    name: { zh: "余额投影", en: "Balance projection" },
    kicker: { zh: "read model · 涉及钱要小心", en: "read model · money needs care" },
    steps: [
      {
        phase: "read",
        title: { zh: "余额投影：读余额直接走 Redis", en: "Balance projection: reads go straight to Redis" },
        text: {
          zh:
            "用户账户余额天天要看。真正的[[sourceoftruth:真相来源]]是 [[mysql:MySQL]] 里的[[ledger:账本]]（只追加、不修改）。" +
            "但每次读都把账本从头加一遍太慢，所以把算好的「当前余额」作为一份[[projection:投影]]（读模型）放进 Redis，读的时候直接拿。",
          en:
            "A user's account balance is read constantly. The real [[sourceoftruth:source of truth]] is the append-only [[ledger:ledger]] in [[mysql:MySQL]]. " +
            "But summing the whole ledger on every read is slow, so the computed “current balance” is stored in Redis as a [[projection:projection]] (a read model), and reads take it directly.",
        },
        caption: { zh: "读余额 = 直接读 Redis 里算好的数。", en: "Read balance = read the precomputed number in Redis." },
      },
      {
        action: { zh: "如果 Redis 里没有", en: "If Redis doesn't have it" },
        phase: "recompute",
        title: { zh: "未命中：回账本重算再写回", en: "Miss: recompute from the ledger, then write back" },
        text: {
          zh:
            "如果 Redis 里的余额不在了（过期、被删、或 Redis 刚重启），就[[cachemiss:未命中]]：回到 MySQL 账本，" +
            "把流水从头加一遍算出当前余额，写回 Redis，下次再读就命中。" +
            "投影随时可以丢，因为它永远能从账本重算出来——这一点是它敢放进易失内存的底气。",
          en:
            "If the balance is gone from Redis (expired, deleted, or Redis just restarted), it's a [[cachemiss:miss]]: go back to the MySQL ledger, " +
            "sum the entries to compute the current balance, write it back to Redis, and the next read hits. " +
            "The projection can be thrown away anytime, because it can always be recomputed from the ledger — that's why it's safe to keep in volatile memory.",
        },
        caption: { zh: "丢了不怕——账本能重算出余额。", en: "Losing it is fine — the ledger can recompute it." },
      },
      {
        action: { zh: "有新交易时怎么写", en: "How a new transaction writes" },
        phase: "invalidate",
        title: { zh: "写：先追加账本，再 DEL 掉旧投影", en: "Write: append the ledger first, then DEL the old projection" },
        text: {
          zh:
            "来了一笔新交易：先往账本 append 一行（这是真相，必须先落库），然后 DEL 掉 Redis 里那份旧余额——这就是[[invalidation:缓存失效]]。" +
            "下次读会未命中，于是从最新账本重算、写回。注意顺序：先写真相来源，再失效缓存；反过来则可能把旧值又缓存住。",
          en:
            "A new transaction arrives: first append a row to the ledger (this is the truth and must be persisted first), then DEL the old balance in Redis — that's [[invalidation:cache invalidation]]. " +
            "The next read misses, recomputes from the latest ledger, and writes back. Mind the order: write the source of truth first, then invalidate the cache; reversing it risks re-caching a stale value.",
        },
        caption: { zh: "先落账本，再删旧投影，让下次重算。", en: "Persist the ledger, then delete the projection, forcing a recompute." },
      },
      {
        action: { zh: "涉及钱的红线", en: "The money red line" },
        phase: "money",
        title: { zh: "涉及钱：Redis 绝不能当账本", en: "Money: Redis is never the ledger" },
        text: {
          zh:
            "关键红线：Redis 里的余额只是加速用的读模型，绝不是最终账本。" +
            "Redis 不可用或数据丢了，必须能从 append-only 的[[ledger:账本]]完整重算恢复，一分钱都不能错。" +
            "投影错了顶多慢一下重算；账本错了才是真出事。这也是为什么这份数据可以放内存、但真相必须留在数据库。",
          en:
            "The red line: the balance in Redis is only a read model for speed — never the final ledger. " +
            "If Redis dies or loses data, you must be able to fully recompute from the append-only [[ledger:ledger]], down to the cent. " +
            "A wrong projection just means a slow recompute; a wrong ledger is a real incident. That's why this data may live in memory, but the truth must stay in the database.",
        },
        caption: { zh: "账本是真相，Redis 只是快照。", en: "The ledger is the truth; Redis is just a snapshot." },
      },
    ],
    interview: {
      good: [
        {
          zh: "讲清读写分离：写走 append-only 账本（真相来源），读走 Redis 投影。",
          en: "Explain the read/write split: writes go to the append-only ledger (source of truth), reads go to the Redis projection.",
        },
        {
          zh: "写时「先落账本、再 DEL 投影」，下次读未命中触发重算——顺序是重点。",
          en: "On write, “persist the ledger, then DEL the projection”; the next read misses and recomputes — the ordering is the point.",
        },
      ],
      honest: [
        {
          zh: "反复强调：涉及钱，Redis 绝不能当最终账本，必须能从账本重算恢复。",
          en: "Repeat it: with money, Redis is never the final ledger; you must be able to recompute from the ledger.",
        },
        {
          zh: "别把它说成「用 Redis 存余额」——它只是可丢弃的加速副本。",
          en: "Don't call it “storing the balance in Redis” — it's a disposable, accelerating copy.",
        },
      ],
    },
  },
];
