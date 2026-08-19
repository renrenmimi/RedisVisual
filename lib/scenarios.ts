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
  title: { zh: "第 3 站 · 我们为什么用 Redis", en: "Stop 3 · Why we use Redis" },
  subtitle: {
    zh: "拿一个真实系统 WeShipItNow，把 Redis 的三处用法讲透——顺带教你面试怎么答。",
    en: "One real system, WeShipItNow, and the three places it uses Redis — plus how to describe them in an interview.",
  },
  ivGood: { zh: "面试可以这样说", en: "In an interview, you can say" },
  ivHonest: { zh: "但要诚实 · 别过度包装", en: "But stay honest · don't oversell" },
  next: { zh: "下一站：缓存的坑与一致性 →", en: "Next stop: cache pitfalls and consistency →" },
  kbdStep: { zh: "推进本场景", en: "advance this scenario" },
  kbdBack: { zh: "回退", en: "go back" },
  autoplay: { zh: "自动播放", en: "Auto-play" },
  pause: { zh: "暂停", en: "Pause" },
  stepDone: { zh: "本场景已看完 · 点上方 tab 换一个", en: "Scenario complete · pick another tab above" },
};

// ---------- 顶部：WeShipItNow 系统背景 ----------

export const intro = {
  kicker: {
    zh: "WeShipItNow · 多承运商运费比价 & 买标签平台",
    en: "WeShipItNow · multi-carrier rate shopping and label platform",
  },
  title: {
    zh: "一个真实系统里，Redis 到底用在哪三处",
    en: "The three places Redis is actually used in one real system",
  },
  text: {
    zh:
      "WeShipItNow 让用户输入发货/收货邮编、包裹重量尺寸和发货日期，然后同时向 USPS、FedEx、UPS、Amazon 问[[carrier:承运商]]报价、比价，再买运费标签、追踪包裹。" +
      "[[redis:Redis]] 在这个系统里出现在三个地方——每一处都能回答同一个问题：为什么是 Redis，而不是别的。" +
      "下面三个场景，点 tab 切换，每个都能一步步看动画。",
    en:
      "WeShipItNow takes an origin ZIP, a destination ZIP, the package weight and dimensions, and a ship date. " +
      "It then asks USPS, FedEx, UPS, and Amazon for [[carrier:carrier]] quotes at the same time, compares them, and lets the user buy a label and track the parcel. " +
      "[[redis:Redis]] is used in three places here, and each one answers the same question: why Redis, and not something else? " +
      "Switch tabs between the three scenarios below. Each one plays step by step.",
  },
};

// ---------- 三个场景 ----------

export const scenarios: Scenario[] = [
  // ============ 场景 A：运费报价缓存（cache-aside）============
  {
    id: "rate",
    tab: { zh: "场景 A", en: "Scenario A" },
    name: { zh: "运费报价缓存", en: "Rate-quote caching" },
    kicker: { zh: "cache-aside · 简历主用法", en: "cache-aside · the resume headline" },
    steps: [
      {
        phase: "why",
        title: { zh: "先看清楚：慢的到底是谁", en: "First, find what is actually slow" },
        text: {
          zh:
            "一次报价要同时问 4 家 [[carrier:承运商]] 的 [[api:API]]：USPS 约 300ms、FedEx 约 800ms、UPS 偶尔超 1 秒、Amazon 也不快。" +
            "[[bff:BFF]] 得等最慢的那个回来才能比价，所以一次报价天然就是「秒级」。" +
            "更关键的是同一个包裹会被反复查——用户刷新、点返回、同事查同一条线路，短时间内报价根本不变。" +
            "「算一次很贵、又反复要」，这正是 [[cache:缓存]] 的教科书场景。",
          en:
            "One quote calls four [[carrier:carrier]] [[api:APIs]] at the same time: USPS around 300ms, FedEx around 800ms, UPS sometimes over a second, and Amazon is no faster. " +
            "The [[bff:BFF]] cannot compare prices until the slowest one answers, so a single quote takes roughly a second. " +
            "The same package is also queried again and again: the user refreshes, goes back a page, or a colleague checks the same route. " +
            "The rate does not change over such a short window. A value that is expensive to compute and requested repeatedly is the textbook case for a [[cache:cache]].",
        },
        caption: { zh: "慢 + 重复 = 缓存的黄金场景。", en: "Slow and repeated: exactly what a cache is for." },
      },
      {
        action: { zh: "看第一次查询（未命中）", en: "Watch the first query (miss)" },
        phase: "miss",
        title: { zh: "第一次查询：缓存里空空如也", en: "First query: the cache is empty" },
        text: {
          zh:
            "前端经 Apollo Client 把报价请求发给 GraphQL [[bff:BFF]]，BFF 先问 [[redis:Redis]]：「这个包裹的报价你有吗？」" +
            "第一次当然[[cachemiss:未命中]]。于是 BFF 才并发去调 4 家 carrier 的 [[api:API]]，等最慢的回来，聚合成一份可比较的报价。" +
            "这一趟，就是那要命的一秒多。先读缓存、未命中再回源——这套顺序就叫[[cacheaside:旁路缓存 (cache-aside)]]。",
          en:
            "The frontend sends the quote request through Apollo Client to the GraphQL [[bff:BFF]]. " +
            "The BFF asks [[redis:Redis]] first: is there a rate stored for this package? " +
            "The first time there is nothing stored, so the read is a [[cachemiss:miss]]. " +
            "Only then does the BFF call the four carrier [[api:APIs]] in parallel, wait for the slowest, and combine the answers into one comparable set of quotes. " +
            "That whole round trip takes over a second. Read the cache first and fall back to the source on a miss: this order is the [[cacheaside:cache-aside]] pattern.",
        },
        caption: { zh: "未命中 → 回源并发调 4 家 carrier，慢。", en: "Miss → call all 4 carriers. Slow." },
      },
      {
        action: { zh: "把结果写回 Redis", en: "Write the result back" },
        phase: "write",
        title: { zh: "写回缓存：SET + 短 TTL，key 必须带 accountId", en: "Write back: SET with a short TTL, and accountId in the key" },
        text: {
          zh:
            "聚合好的报价用 SET 写回 Redis，并设一个短 [[ttl:TTL]]——报价本来就只在短时间内有效。" +
            "代价要说清楚：在这个 TTL 内，所有人读到的都是这份缓存，所以页面上的价格最多可能比真实报价旧一个 TTL。" +
            "另外，Redis 并不保证在过期的那一秒就把 key 删掉；它保证的是过期之后不再把这个 key 返回给你——访问时惰性检查，加上后台定期抽样清理，内存稍后才回收。" +
            "key 本身同样关键：shipping-rate:{accountId}:{originZip}:{destZip}:{weight}:{dims}:{shipDate}。" +
            "少了 accountId，客户 B 就会读到客户 A 谈下来的折扣价——这不是普通 bug，是定价数据泄露。",
          en:
            "The combined quote is written back with SET and a short [[ttl:TTL]], because a rate is only valid for a short time. " +
            "Be clear about the cost: within that TTL every reader gets the stored quote, so the price on screen can be up to one TTL out of date. " +
            "A TTL also promises less than it looks. Redis does not remove the key at the exact second it expires. " +
            "It guarantees only that an expired key is never returned: it checks on access and also samples keys in a background job, and reclaims the memory later. " +
            "The key itself matters just as much: shipping-rate:{accountId}:{originZip}:{destZip}:{weight}:{dims}:{shipDate}. " +
            "Leave out the accountId and customer B reads the discount that customer A negotiated. That is not an ordinary bug; it is a pricing-data leak.",
        },
        caption: { zh: "key 带上 accountId，否则串价。", en: "Put accountId in the key, or prices leak between accounts." },
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
            "The same package is queried again. The BFF asks Redis and gets a [[cachehit:hit]]: one read from memory, and [[latency:latency]] drops from over a second to about a millisecond. " +
            "None of the four carriers is called at all. That is what the cache really saves. " +
            "It does not make the carrier API faster; it removes the carrier call from this request.",
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
            "缓存 key 里放了哪些字段，就是数据隔离的边界。",
          en:
            "Suppose the key holds only the ZIP codes and the weight, with no accountId. " +
            "Customer A, who has a volume discount, queries first, and that discounted price is written to Redis. " +
            "Customer B queries the same route and hits customer A's price. B sees a price they should never see, and you charge B too little. " +
            "The fields you put in a cache key are the boundary of data isolation. The fix is to put the account in the key.",
        },
        caption: { zh: "缓存键少一个维度，价格就会跨账户泄露。", en: "One missing field in the key, and prices leak between accounts." },
      },
      {
        action: { zh: "区分两层缓存 + 降级", en: "Two cache layers and a fallback" },
        phase: "layers",
        title: { zh: "别混淆：Apollo 缓存 vs Redis 缓存", en: "Don't mix these up: Apollo cache vs Redis cache" },
        text: {
          zh:
            "面试常被追问。Apollo Client 缓存在浏览器端，只服务当前这个用户、少发重复的 GraphQL 请求；" +
            "Redis 在服务端，被所有用户、所有实例共享，少调重复的 carrier API。别说成「两者都降低了 carrier API 延迟」——只有服务端的 Redis 拦得住 carrier 调用。" +
            "还有降级：Redis 不可用时，请求要能绕过它直连 carrier，慢一点但仍然能用，Redis 不能是单点；而且真正买标签时要重新校验价格，不能盲信旧报价。",
          en:
            "This is a common follow-up question. The Apollo Client cache lives in the browser. It serves only the current user and cuts repeated GraphQL requests. " +
            "Redis lives on the server, is shared by every user and every instance, and cuts repeated carrier API calls. " +
            "Do not say that both reduce carrier API latency: only the server-side cache can stop a carrier call. " +
            "Plan for Redis being unavailable as well. The request should still work by going to the slower source, which here is the carriers themselves, so Redis is not a single point of failure. " +
            "And when the user actually buys a label, re-check the price with the carrier instead of trusting the cached quote.",
        },
        caption: { zh: "浏览器一层、服务端一层，别混为一谈。", en: "One layer in the browser, one on the server — keep them separate." },
      },
    ],
    interview: {
      good: [
        {
          zh: "简历主用法就说这个：cache-aside 缓存 carrier 报价，把秒级外部调用变成毫秒级内存读取。",
          en: "Lead with this one: cache-aside over carrier quotes, turning a one-second external call into a millisecond read from memory.",
        },
        {
          zh: "主动讲 key 设计带 accountId、短 TTL、Redis 不可用时能降级直连 carrier——这些细节最加分。",
          en: "Bring up the details yourself: accountId in the key, a short TTL, and a fallback that calls the carriers directly when Redis is unavailable. Those details are what an interviewer is listening for.",
        },
      ],
      honest: [
        {
          zh: "别把 Apollo Client 缓存和 Redis 缓存说成一回事；只有服务端的 Redis 拦得住重复的 carrier 调用。",
          en: "Don't treat the Apollo Client cache and the Redis cache as the same thing. Only the server-side cache stops repeated carrier calls.",
        },
        {
          zh: "别吹「零延迟」；缓存里的报价最多可能旧一个 TTL，买标签前仍要重新校验价格。它只是加速读，不是权威价。",
          en: "Don't claim zero latency. A cached quote can be up to one TTL out of date, so you still re-check the price before buying a label. The cache speeds up reads; it is not the authoritative price.",
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
        title: { zh: "问题：重复提交导致重复下单", en: "The problem: one double-click, two labels" },
        text: {
          zh:
            "「购买标签」这个按钮，用户可能连续点击两次；或者前端网络超时后自动重试。" +
            "两个几乎同时到达的请求，如果都照常执行，就会重复建标签、重复扣款、甚至重复给用户发通知。" +
            "只要是「花钱」「产生副作用」的写操作，就必须防重复。",
          en:
            "A user can click the \"Buy label\" button twice, or the frontend can retry automatically after a network timeout. " +
            "If two requests arrive almost together and both run normally, the system creates two labels, charges the card twice, and may even send two notifications. " +
            "Any write that spends money or has another side effect needs protection against duplicates.",
        },
        caption: { zh: "双击 / 重试 → 两个请求同时冲进来。", en: "Double-click or retry → two requests arrive at almost the same time." },
      },
      {
        action: { zh: "用 SET NX 抢占处理权", en: "Claim the slot with SET NX" },
        phase: "nx",
        title: { zh: "SET NX：只有第一个请求写入成功", en: "SET NX: only the first write succeeds" },
        text: {
          zh:
            "用请求里唯一的 requestId 当 key：SET idempotency:purchase-label:{requestId} processing NX EX 60。" +
            "[[setnx:NX]] 的意思是「只有 key 不存在时才写成功」。" +
            "Redis 在单线程上逐条执行命令，所以这一句里的「检查」和「写入」中间插不进另一个请求：两个并发请求里恰好有一个拿到 OK，另一个拿到 nil。" +
            "EX 60 给这个 key 一个过期时间，万一请求中途失败，也不会把同一笔购买永远挡在门外。",
          en:
            "Use the unique requestId from the request as the key: SET idempotency:purchase-label:{requestId} processing NX EX 60. " +
            "[[setnx:NX]] means write only if the key does not already exist. " +
            "Redis runs commands one at a time on a single thread, so no other request can slip between the check and the write inside this one command. " +
            "Of two concurrent requests, exactly one gets OK back and the other gets nil. " +
            "EX 60 gives the key an expiry, so a request that fails halfway does not block the same purchase forever.",
        },
        caption: { zh: "原子的 SET NX：一个拿到 OK，其余拿到 nil。", en: "Atomic SET NX: one request gets OK, the rest get nil." },
      },
      {
        action: { zh: "看两个请求各自的结局", en: "See how each request ends" },
        phase: "resolve",
        title: { zh: "首个请求执行扣款，后续请求复用结果", en: "The first request charges; later ones reuse the result" },
        text: {
          zh:
            "抢到 key 的请求继续往下：建标签、扣一次款、把结果写好。拿到 nil 的那个请求不再重复执行，" +
            "而是直接返回上一次的结果；如果结果还没写好，就返回「处理中，请稍候」。对用户来说，点一下和点两下，结果完全一样——这就是[[idempotency:幂等]]。",
          en:
            "The request that set the key goes ahead: it creates the label, charges once, and stores the result. " +
            "The request that got nil does not run the purchase again. It returns the stored result of the first request, or a \"still processing\" response if that result is not ready yet. " +
            "One click and two clicks give the user the same outcome, and that is what [[idempotency:idempotency]] means.",
        },
        caption: { zh: "一次真执行，其余全部复用结果。", en: "One real execution; every duplicate reuses the result." },
      },
      {
        action: { zh: "生产级还差什么", en: "What production still needs" },
        phase: "honest",
        title: { zh: "别只靠一个易失的 Redis key", en: "Don't rely on a volatile Redis key alone" },
        text: {
          zh:
            "要诚实地说清这层保护会怎样失效：key 可能在重试到达之前就过期；节点重启会把它丢掉；" +
            "而且主从复制是异步的，故障切换后被提升的副本可能根本没收到这个 key。" +
            "所以 SET NX 是一道很快的过滤，不是正确性保证。只要涉及钱，保证必须来自数据库：" +
            "给 requestId / 订单号加唯一约束，让第二次插入直接失败，再配合订单状态检查。" +
            "Redis 用很低的成本挡掉几乎所有重复请求；数据库才是让重复真正不可能发生的那一层。",
          en:
            "Be honest about how this guard can fail. The key can expire before the retry arrives. The node can restart and lose it. " +
            "Replication is asynchronous, so after a failover the promoted replica may never have received the key. " +
            "SET NX is a fast filter, not a correctness guarantee. " +
            "When money is involved, the guarantee has to come from the database: a unique constraint on the requestId or the order id, so a second insert fails, plus a check of the order status. " +
            "Redis stops almost every duplicate cheaply; the database is what makes a duplicate impossible.",
        },
        caption: { zh: "Redis 是快速过滤，数据库唯一约束才是保证。", en: "Redis is the fast filter; the database constraint is the guarantee." },
      },
    ],
    interview: {
      good: [
        {
          zh: "讲清 SET NX 为什么是原子的：Redis 单线程逐条执行命令，并发里只有第一个拿到 OK，其余复用结果、不重复执行。",
          en: "Explain why SET NX is atomic: Redis runs commands one at a time, so only the first concurrent request gets OK, and the rest reuse the result instead of running again.",
        },
        {
          zh: "说明 key 用唯一 requestId、加 EX 过期，避免某次失败把同一笔购买永远挡住。",
          en: "Say that the key is the unique requestId and carries an EX expiry, so one failed attempt cannot block the same purchase forever.",
        },
      ],
      honest: [
        {
          zh: "如果你的真实项目只做了报价缓存，就别把幂等也说成「我用 Redis 做过」——只说你了解这个模式。",
          en: "If your real project only built the rate cache, don't say you \"built idempotency with Redis\". Say you understand the pattern.",
        },
        {
          zh: "强调 Redis 只负责快速拦截，真正的保证是数据库唯一约束：key 会过期，故障切换还可能把它丢掉。",
          en: "Say plainly that Redis is the fast guard and the database unique constraint is the actual guarantee. A key that can expire, or be lost in a failover, is not enough on its own.",
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
            "用户账户余额天天要看。真正的[[sourceoftruth:真相来源]]是 [[mysql:MySQL]] 里的[[ledger:账本]]——只追加、不修改。" +
            "但每次读都把账本从头加一遍太慢，所以把算好的「当前余额」作为一份[[projection:投影]]（读模型）放进 Redis，读的时候直接拿这一个数。",
          en:
            "A user's account balance is read constantly. The [[sourceoftruth:source of truth]] is the append-only [[ledger:ledger]] in [[mysql:MySQL]]: rows are added, never changed. " +
            "Adding up the whole ledger on every read is slow, so the computed current balance is stored in Redis as a [[projection:projection]], also called a read model. " +
            "A read takes that one number instead.",
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
            "If the balance is no longer in Redis (it expired, it was deleted, or the node restarted), the read is a [[cachemiss:miss]]. " +
            "The application goes back to the MySQL ledger, adds up the entries to get the current balance, writes it back to Redis, and the next read hits. " +
            "The projection can be deleted at any time, because it can always be computed again from the ledger. That is what makes it safe to keep in memory that can be lost.",
        },
        caption: { zh: "丢了不怕——账本能重算出余额。", en: "Losing it is fine: the ledger can produce it again." },
      },
      {
        action: { zh: "有新交易时怎么写", en: "How a new transaction writes" },
        phase: "invalidate",
        title: { zh: "写：先追加账本，再 DEL 掉旧投影", en: "Write: append to the ledger first, then DEL the old projection" },
        text: {
          zh:
            "来了一笔新交易：先往账本 append 一行，因为这一行才是必须留存的记录；然后 DEL 掉 Redis 里那份旧余额——这就是[[invalidation:缓存失效]]。" +
            "下次读会未命中，于是从最新账本重算、写回。顺序很重要：如果先删缓存、后写账本，中间的一次读就可能把旧余额又缓存回去。" +
            "即使顺序正确，也还剩一个小的竞态窗口：某个读请求在 DEL 之前就取到了旧的合计，却在 DEL 之后才写回。" +
            "所以这个 key 还应该配一个 TTL，真正要准的时候以账本为准。",
          en:
            "A new transaction arrives. Append the row to the ledger first, because that row is the record that has to survive. " +
            "Then DEL the balance key in Redis, which is [[invalidation:cache invalidation]]. The next read misses, recomputes from the updated ledger, and writes the new value back. " +
            "The order matters: delete first and append second, and a read in between can store the old balance again. " +
            "Even in the right order a small race remains. A reader that loaded the old total just before the DEL can write it back just after. " +
            "So give the key a TTL as well, and read the ledger itself whenever the number has to be exact.",
        },
        caption: { zh: "先落账本，再删旧投影，让下次重算。", en: "Append to the ledger, then delete the projection; the next read recomputes." },
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
            "The rule for money: the balance in Redis is a read model that makes reads fast. It is never the final record. " +
            "If Redis is unavailable or has lost the key, the balance must still be computable from the append-only [[ledger:ledger]], down to the cent. " +
            "A wrong projection costs you one recompute. A wrong ledger is a real incident. " +
            "That is why this number can live in memory while the record it is derived from stays in the database.",
        },
        caption: { zh: "账本是真相，Redis 只是一份能重算出来的副本。", en: "The ledger is the record; the Redis copy can be rebuilt from it." },
      },
    ],
    interview: {
      good: [
        {
          zh: "讲清读写分离：写走 append-only 账本（真相来源），读走 Redis 投影。",
          en: "Explain the read/write split: writes go to the append-only ledger, which is the source of truth, and reads go to the Redis projection.",
        },
        {
          zh: "写时先落账本、再 DEL 投影，下次读未命中触发重算——顺序是重点，而且要承认仍有一个小的竞态窗口。",
          en: "On a write, append to the ledger first and then DEL the projection; the next read misses and recomputes. The ordering is the point. Say as well that a small race window remains.",
        },
      ],
      honest: [
        {
          zh: "反复强调：涉及钱，Redis 绝不能当最终账本，必须能从账本重算恢复。",
          en: "Say it directly: with money, Redis is never the final record. You have to be able to rebuild the balance from the ledger.",
        },
        {
          zh: "别把它说成「用 Redis 存余额」——它只是一份可丢弃的加速副本；而且如果你只做了报价缓存，就说你了解这个模式，别说成你上线过。",
          en: "Don't say you \"store balances in Redis\". It is a derived copy that can be deleted and computed again. And if the rate cache is the only piece you built, say you understand this pattern rather than claiming you shipped it.",
        },
      ],
    },
  },
];
