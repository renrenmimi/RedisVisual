// 第 3 站「跟着写一遍」的全部数据（双语）。
// 一次「从零把 Redis Demo 跑起来」的过程被拆成若干步：
// 每一步描述——到达它的按钮文字（action）、标题（title）、讲解正文（body，可含 [[key:文字]]）、
// 左侧命令卡（cmds）或代码要点（points）、可选提醒（caution），
// 以及右侧舞台（panel）：一个可回放的终端（term），或一个逐行点亮的代码窗（code）。
// 本站所有文案都写在这里，不改 lib/i18n.tsx。

import type { L } from "@/lib/i18n";

// ---------- 类型 ----------

// 一条可复制的命令 + 讲解，可选逐个 flag 拆解
export type Cmd = {
  cmd: string;
  note: L;
  flags?: { flag: string; desc: L }[];
};

// 终端回放的一行。cls 决定它是命令、redis-cli 输入、普通输出、成功、灰、还是强调。
// pause = 这一行出现前先等多少毫秒（用来讲“第一次慢、第二次快”的故事）。
export type TermLine = {
  text: string;
  cls?: "sh" | "rc" | "out" | "ok" | "dim" | "accent";
  pause?: number;
};

export type Panel =
  | { kind: "term"; file: string; lines: TermLine[] }
  | { kind: "code"; file: "pkg" | "index"; focus: [number, number][] };

export type Step = {
  action: L; // 到达这一步的按钮文字（显示在上一步的“下一步”按钮上）
  title: L;
  body: L[];
  cmds?: Cmd[];
  points?: L[];
  caution?: L;
  panel: Panel;
};

// ---------- 本站界面文案 ----------

export const clui = {
  title: { zh: "第 3 站 · 跟着写一遍", en: "Stop 3 · Code It Yourself" },
  subtitle: {
    zh: "打开 VS Code，从零把一个 Redis Demo 跑起来",
    en: "Open VS Code and take a Redis demo from zero to running",
  },
  cmdsTitle: { zh: "命令 · 逐条解释", en: "Commands · line by line" },
  pointsTitle: { zh: "这段代码在干嘛", en: "What this code does" },
  copy: { zh: "复制", en: "Copy" },
  copied: { zh: "已复制", en: "Copied" },
  replay: { zh: "↻ 重新播放", en: "↻ Replay" },
  reset: { zh: "回到第一步", en: "Restart" },
  nextStation: { zh: "下一站：面试速通 →", en: "Next stop: Interview Prep →" },
  kbdNext: { zh: "下一步", en: "next" },
  kbdPrev: { zh: "上一步", en: "back" },
} satisfies Record<string, L>;

// ---------- package.json（第 6 步展示） ----------

export const pkgCode: string[] = [
  "{",
  '  "name": "redis-shipping-demo",',
  '  "version": "1.0.0",',
  '  "type": "module",',
  '  "scripts": {',
  '    "dev": "tsx src/index.ts"',
  "  },",
  '  "dependencies": {',
  '    "redis": "^5"',
  "  },",
  '  "devDependencies": {',
  '    "typescript": "^5",',
  '    "tsx": "^4",',
  '    "@types/node": "^22"',
  "  }",
  "}",
];

// ---------- src/index.ts（第 7~9 步展示，一字不差） ----------

export const indexCode: string[] = [
  'import { createClient } from "redis";',
  "",
  "const redis = createClient({",
  '  url: process.env.REDIS_URL ?? "redis://localhost:6379",',
  "});",
  "",
  'redis.on("error", (error) => {',
  '  console.error("Redis error:", error);',
  "});",
  "",
  "type ShippingRequest = {",
  "  accountId: string;",
  "  originZip: string;",
  "  destinationZip: string;",
  "  weightLb: number;",
  "};",
  "",
  "type CarrierRate = {",
  "  carrier: string;",
  "  service: string;",
  "  price: number;",
  "};",
  "",
  "type LedgerEntry = {",
  "  accountId: string;",
  "  amount: number;",
  '  type: "credit" | "debit";',
  "};",
  "",
  "// Fake permanent database. In a real app these live in MySQL.",
  "const ledger: LedgerEntry[] = [",
  '  { accountId: "account-101", amount: 100, type: "credit" },',
  '  { accountId: "account-101", amount: 25, type: "debit" },',
  "];",
  "",
  "function sleep(ms: number): Promise<void> {",
  "  return new Promise((resolve) => setTimeout(resolve, ms));",
  "}",
  "",
  "// Pretends to call external carrier APIs. The delay is network + third-party time.",
  "async function fetchRatesFromCarriers(",
  "  request: ShippingRequest,",
  "): Promise<CarrierRate[]> {",
  '  console.log("Calling USPS, FedEx, and UPS APIs...");',
  "  await sleep(1500);",
  "  return [",
  '    { carrier: "USPS", service: "Priority Mail", price: 10 + request.weightLb * 0.8 },',
  '    { carrier: "FedEx", service: "Ground", price: 12 + request.weightLb * 0.7 },',
  '    { carrier: "UPS", service: "Ground", price: 11 + request.weightLb * 0.75 },',
  "  ];",
  "}",
  "",
  "function createRateCacheKey(request: ShippingRequest): string {",
  "  const parts = [",
  "    request.accountId,",
  "    request.originZip,",
  "    request.destinationZip,",
  "    request.weightLb.toString(),",
  "  ];",
  "  return `carrier-rates:${parts.join(\":\")}`;",
  "}",
  "",
  "// Demo 1: cache-aside. Check Redis; hit → return; miss → call slow source, then SET with TTL.",
  "async function getCarrierRates(request: ShippingRequest): Promise<CarrierRate[]> {",
  "  const cacheKey = createRateCacheKey(request);",
  "  const cached = await redis.get(cacheKey);",
  "  if (cached !== null) {",
  '    console.log("CACHE HIT: returning rates from Redis.");',
  "    return JSON.parse(cached) as CarrierRate[];",
  "  }",
  '  console.log("CACHE MISS: no reusable rates in Redis.");',
  "  const fresh = await fetchRatesFromCarriers(request);",
  "  await redis.set(cacheKey, JSON.stringify(fresh), { EX: 30 });",
  "  return fresh;",
  "}",
  "",
  "// Demo 2: idempotency. SET NX succeeds only when the key does not exist.",
  "async function purchaseLabel(idempotencyKey: string): Promise<{ status: string }> {",
  "  const redisKey = `idempotency:purchase-label:${idempotencyKey}`;",
  '  const acquired = await redis.set(redisKey, "processing", { NX: true, EX: 60 });',
  "  if (acquired === null) {",
  '    console.log("DUPLICATE REQUEST: label purchase already received.");',
  "    const existing = await redis.get(redisKey);",
  '    return { status: existing ?? "already-processing" };',
  "  }",
  '  console.log("NEW REQUEST: purchasing shipping label...");',
  "  await sleep(1000);",
  '  const result = { status: "completed", labelId: `label-${Date.now()}` };',
  "  await redis.set(redisKey, JSON.stringify(result), { EX: 300 });",
  "  return result;",
  "}",
  "",
  "// Rebuild the authoritative balance from the append-only ledger.",
  "function calculateBalanceFromLedger(accountId: string): number {",
  "  return ledger",
  "    .filter((entry) => entry.accountId === accountId)",
  "    .reduce(",
  "      (balance, entry) =>",
  '        entry.type === "credit" ? balance + entry.amount : balance - entry.amount,',
  "      0,",
  "    );",
  "}",
  "",
  "// Demo 3: balance projection. Redis is a fast read model; the ledger stays the source of truth.",
  "async function getBalance(accountId: string): Promise<number> {",
  "  const key = `balance:${accountId}`;",
  "  const cached = await redis.get(key);",
  "  if (cached !== null) {",
  '    console.log("BALANCE HIT: reading projection from Redis.");',
  "    return Number(cached);",
  "  }",
  '  console.log("BALANCE MISS: rebuilding from the ledger.");',
  "  const authoritative = calculateBalanceFromLedger(accountId);",
  "  await redis.set(key, authoritative.toString(), { EX: 60 });",
  "  return authoritative;",
  "}",
  "",
  "// Append to the ledger, then invalidate the stale projection.",
  "async function addLedgerEntry(entry: LedgerEntry): Promise<void> {",
  "  ledger.push(entry);",
  "  await redis.del(`balance:${entry.accountId}`);",
  "}",
  "",
  "async function runDemo(): Promise<void> {",
  "  await redis.connect();",
  '  console.log("Connected to Redis.\\n");',
  "  await redis.flushDb();",
  "",
  '  console.log("=== DEMO 1: CARRIER-RATE CACHE ===");',
  "  const request: ShippingRequest = {",
  '    accountId: "account-101",',
  '    originZip: "94063",',
  '    destinationZip: "10001",',
  "    weightLb: 5,",
  "  };",
  '  console.time("First rate request");',
  "  console.log(await getCarrierRates(request));",
  '  console.timeEnd("First rate request");',
  '  console.time("Second rate request");',
  "  console.log(await getCarrierRates(request));",
  '  console.timeEnd("Second rate request");',
  "",
  '  console.log("\\n=== DEMO 2: IDEMPOTENCY ===");',
  '  console.log("First purchase:", await purchaseLabel("checkout-request-001"));',
  '  console.log("Repeated purchase:", await purchaseLabel("checkout-request-001"));',
  "",
  '  console.log("\\n=== DEMO 3: BALANCE PROJECTION ===");',
  '  console.log("First balance read:", await getBalance("account-101"));',
  '  console.log("Second balance read:", await getBalance("account-101"));',
  '  console.log("Adding a $10 debit to the permanent ledger...");',
  '  await addLedgerEntry({ accountId: "account-101", amount: 10, type: "debit" });',
  '  console.log("Balance after ledger update:", await getBalance("account-101"));',
  "",
  "  await redis.quit();",
  "}",
  "",
  "runDemo().catch(async (error: unknown) => {",
  '  console.error("Demo failed:", error);',
  "  if (redis.isOpen) await redis.quit();",
  "  process.exitCode = 1;",
  "});",
];

// ---------- 步骤 ----------

export const steps: Step[] = [
  // 1 ── 建文件夹
  {
    action: { zh: "开始", en: "Start" },
    title: { zh: "打开 VS Code，建一个空文件夹", en: "Open VS Code, make an empty folder" },
    body: [
      {
        zh: "先打开 VS Code。它自带一个终端：菜单栏 Terminal → New Terminal，或按快捷键 ⌃`（Control + 反引号）。之后每一步的命令都在这个终端里敲。",
        en: "Open VS Code first. It ships with a built-in terminal: menu Terminal → New Terminal, or press ⌃` (Control + backtick). Every command from here on goes into that terminal.",
      },
      {
        zh: "先创建项目目录：新建一个空文件夹 redis-shipping-demo 并进去。pwd 会打印“你现在在哪”，确认一下就好。",
        en: "Give the project a home: create an empty folder redis-shipping-demo and step into it. pwd prints “where am I now” so you can confirm.",
      },
    ],
    cmds: [
      {
        cmd: "mkdir redis-shipping-demo",
        note: { zh: "新建一个空文件夹，当项目的根目录。", en: "Make an empty folder to serve as the project root." },
      },
      {
        cmd: "cd redis-shipping-demo",
        note: {
          zh: "进入这个文件夹——之后所有命令都在这里跑。",
          en: "Move into it — every later command runs from here.",
        },
      },
    ],
    panel: {
      kind: "term",
      file: "terminal",
      lines: [
        { text: "mkdir redis-shipping-demo", cls: "sh" },
        { text: "cd redis-shipping-demo", cls: "sh", pause: 400 },
        { text: "pwd", cls: "sh", pause: 400 },
        { text: "/Users/you/redis-shipping-demo", cls: "out" },
      ],
    },
  },

  // 2 ── 确认 Docker
  {
    action: { zh: "确认 Docker 装了没", en: "Check Docker is ready" },
    title: { zh: "确认 Docker 能用", en: "Make sure Docker works" },
    body: [
      {
        zh: "我们不在系统里直接装 Redis，而是用 [[docker:Docker]] 起一个容器：一条命令拉起、干净、用完即弃、不污染你的电脑。先确认 Docker 在。",
        en: "We won't install Redis onto your system directly — we'll run it in a [[docker:Docker]] container: one command to start, clean, disposable, no pollution of your machine. First confirm Docker is there.",
      },
      {
        zh: "运行 docker --version，看到版本号就说明 Docker 装好并在运行了。如果报“command not found”或连不上，去装并打开 Docker Desktop 再回来。",
        en: "Run docker --version. A version number means Docker is installed and running. If it says “command not found” or can't connect, install and open Docker Desktop, then come back.",
      },
    ],
    cmds: [
      {
        cmd: "docker --version",
        note: {
          zh: "只是问 Docker 报个版本号，验证它可用；不会改动任何东西。",
          en: "Just asks Docker for its version to confirm it's usable; changes nothing.",
        },
      },
    ],
    panel: {
      kind: "term",
      file: "terminal",
      lines: [
        { text: "docker --version", cls: "sh" },
        { text: "Docker version 27.4.0, build bde2b89", cls: "ok" },
      ],
    },
  },

  // 3 ── 启动 Redis
  {
    action: { zh: "用 Docker 启动 Redis", en: "Start Redis with Docker" },
    title: { zh: "一条命令，把 Redis 跑起来", en: "One line brings Redis up" },
    body: [
      {
        zh: "这条 docker run 是本站最重要的一行。它下载 Redis 镜像、创建容器、后台跑起来，并把容器的 6379 端口接到你本机的 6379——[[redis:Redis]] 的默认端口就是 6379，你的代码之后就连它。",
        en: "This docker run is the most important line of the stop. It pulls the Redis image, creates a container, runs it in the background, and wires the container's port 6379 to your machine's 6379 — 6379 is [[redis:Redis]]'s default port, which your code will connect to.",
      },
      {
        zh: "第一次会先“拉取镜像”（Pulling…），之后就有缓存了。跑完 docker ps 应能看到 redis-lab 正在运行、端口已映射。",
        en: "The first time it pulls the image (Pulling…); after that it's cached. Then docker ps should show redis-lab running with the port mapped.",
      },
    ],
    cmds: [
      {
        cmd: "docker run --name redis-lab -p 6379:6379 -d redis:8-alpine",
        note: { zh: "创建并启动一个 Redis 容器。逐个 flag 拆开看：", en: "Create and start a Redis container. Flag by flag:" },
        flags: [
          { flag: "docker run", desc: { zh: "创建并启动一个新容器。", en: "Create and start a new container." } },
          { flag: "--name redis-lab", desc: { zh: "给容器起个好记的名字，后面都用它。", en: "Give the container a memorable name to reuse." } },
          {
            flag: "-p 6379:6379",
            desc: { zh: "本机端口 : 容器端口，把 Redis 默认端口映射出来。", en: "host port : container port — expose Redis's default port." },
          },
          { flag: "-d", desc: { zh: "后台运行（detached），不占住终端。", en: "Run detached in the background; frees your terminal." } },
          {
            flag: "redis:8-alpine",
            desc: { zh: "用体积很小的 Redis 8 镜像（alpine = 精简版）。", en: "Use the tiny Redis 8 image (alpine = slim base)." },
          },
        ],
      },
      {
        cmd: "docker ps",
        note: {
          zh: "列出正在运行的容器；应能看到 redis-lab 和 0.0.0.0:6379->6379。",
          en: "List running containers; you should see redis-lab with 0.0.0.0:6379->6379.",
        },
      },
    ],
    panel: {
      kind: "term",
      file: "terminal",
      lines: [
        { text: "docker run --name redis-lab -p 6379:6379 -d redis:8-alpine", cls: "sh" },
        { text: "Unable to find image 'redis:8-alpine' locally", cls: "dim", pause: 400 },
        { text: "8-alpine: Pulling from library/redis", cls: "dim", pause: 300 },
        { text: "Digest: sha256:9c1d24e0f7b3a5c8e2f1a0b4d6c9e8f7a2b1c0d3e4f5a6b7", cls: "dim", pause: 300 },
        { text: "Status: Downloaded newer image for redis:8-alpine", cls: "dim", pause: 300 },
        { text: "b3f9c2a1e8d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0e1d2c3b4a5f6e7d8c9b0", cls: "out", pause: 700 },
        { text: "docker ps", cls: "sh", pause: 600 },
        {
          text: "CONTAINER ID   IMAGE            COMMAND                  STATUS         PORTS                      NAMES",
          cls: "dim",
        },
        {
          text: 'b3f9c2a1e8d4   redis:8-alpine   "docker-entrypoint.s…"   Up 2 seconds   0.0.0.0:6379->6379/tcp   redis-lab',
          cls: "out",
        },
      ],
    },
  },

  // 4 ── redis-cli 手动试
  {
    action: { zh: "打开 redis-cli 试几条", en: "Open redis-cli and poke around" },
    title: { zh: "先用 redis-cli 亲手感受几条命令", en: "Feel a few commands by hand in redis-cli" },
    body: [
      {
        zh: "写代码之前，先钻进容器用 redis-cli 手动敲几条，把 Redis “就是个大字典”的感觉建立起来。PING 回 PONG 代表通了；SET/GET 就是最基本的存和取。",
        en: "Before writing code, drop into redis-cli inside the container and type a few commands by hand — build the feel that Redis is just a big dictionary. PING → PONG means it's alive; SET/GET are the most basic write and read.",
      },
      {
        zh: "重点感受两条：给键加 EX 就有了 [[ttl:TTL]]（10 秒后自己消失）；带 NX 的 SET 连做两次，第二次返回 (nil)——因为 [[setnx:NX]] 只在键不存在时才写成功，这正是幂等的地基。敲 exit 退出 CLI。",
        en: "Notice two things: adding EX gives a key a [[ttl:TTL]] (it self-destructs in 10s); running a SET with NX twice returns (nil) the second time — because [[setnx:NX]] only writes when the key is absent, the very foundation of idempotency. Type exit to leave the CLI.",
      },
    ],
    cmds: [
      {
        cmd: "docker exec -it redis-lab redis-cli",
        note: {
          zh: "进入容器里的 redis-cli 交互终端。-it = 交互（interactive）+ 终端（tty）。",
          en: "Open the interactive redis-cli inside the container. -it = interactive + a TTY.",
        },
      },
      { cmd: "PING", note: { zh: "心跳测试，返回 PONG 就说明连上了。", en: "A heartbeat; PONG means you're connected." } },
      {
        cmd: "SET name Wayne",
        note: { zh: "把键 name 存成值 Wayne，返回 OK。", en: "Store value Wayne under key name; returns OK." },
      },
      { cmd: "GET name", note: { zh: "按键名取回值。", en: "Fetch the value by its key." } },
      {
        cmd: "SET greeting hi EX 10",
        note: { zh: "写一个 10 秒后自动消失的键，演示 [[ttl:TTL]]。", en: "Write a key that self-destructs in 10s — a live [[ttl:TTL]] demo." },
      },
      { cmd: "TTL greeting", note: { zh: "查这个键还能活几秒。", en: "Ask how many seconds the key has left." } },
      {
        cmd: "SET order:1 processing NX EX 30",
        note: {
          zh: "连做两次：第二次返回 (nil)，因为 [[setnx:NX]] 只在键不存在时才写。",
          en: "Run it twice: the second returns (nil), because [[setnx:NX]] only writes when the key is absent.",
        },
      },
      { cmd: "exit", note: { zh: "退出 redis-cli，回到普通终端。", en: "Leave redis-cli, back to the normal shell." } },
    ],
    panel: {
      kind: "term",
      file: "redis-cli",
      lines: [
        { text: "docker exec -it redis-lab redis-cli", cls: "sh" },
        { text: "PING", cls: "rc", pause: 500 },
        { text: "PONG", cls: "ok" },
        { text: "SET name Wayne", cls: "rc", pause: 450 },
        { text: "OK", cls: "ok" },
        { text: "GET name", cls: "rc", pause: 450 },
        { text: '"Wayne"', cls: "out" },
        { text: "SET greeting hi EX 10", cls: "rc", pause: 450 },
        { text: "OK", cls: "ok" },
        { text: "TTL greeting", cls: "rc", pause: 450 },
        { text: "(integer) 10", cls: "out" },
        { text: "SET order:1 processing NX EX 30", cls: "rc", pause: 450 },
        { text: "OK", cls: "ok" },
        { text: "SET order:1 processing NX EX 30", cls: "rc", pause: 600 },
        { text: "(nil)", cls: "dim" },
        { text: "exit", cls: "rc", pause: 450 },
      ],
    },
  },

  // 5 ── 初始化 Node/TS
  {
    action: { zh: "初始化 Node 项目", en: "Set up the Node project" },
    title: { zh: "初始化 Node / TypeScript 项目", en: "Set up the Node / TypeScript project" },
    body: [
      {
        zh: "回到普通终端，把项目搭起来。npm init -y 生成 package.json；再装依赖：redis 是官方 Node 客户端 [[api:node-redis]]，代码里 import 的就是它。",
        en: "Back in the normal shell, scaffold the project. npm init -y creates package.json; then install deps: redis is the official Node client [[api:node-redis]] — the one your code imports.",
      },
      {
        zh: "开发依赖装 typescript、tsx、@types/node。tsx 是关键：它让我们直接跑 .ts 文件，不用先手动编译成 .js。最后建个 src 文件夹放源码。",
        en: "Dev dependencies: typescript, tsx, and @types/node. tsx is the key one: it runs .ts files directly, no manual compile-to-.js step. Finally make a src folder for the source.",
      },
    ],
    cmds: [
      {
        cmd: "npm init -y",
        note: { zh: "生成默认 package.json（-y = 全部用默认值，不逐条问你）。", en: "Create a default package.json (-y accepts all defaults without prompting)." },
      },
      {
        cmd: "npm install redis",
        note: { zh: "装官方 Node 客户端 [[api:node-redis]]，写进 dependencies。", en: "Install the official Node client [[api:node-redis]]; goes into dependencies." },
      },
      {
        cmd: "npm install -D typescript tsx @types/node",
        note: {
          zh: "-D = 开发依赖：typescript 类型系统、tsx 直接跑 .ts、@types/node 给 Node API 提供类型。",
          en: "-D = dev deps: TypeScript, tsx to run .ts directly, and @types/node for Node API types.",
        },
      },
      { cmd: "mkdir src", note: { zh: "放源码的文件夹，等下写 src/index.ts。", en: "A folder for source; next you'll write src/index.ts." } },
    ],
    panel: {
      kind: "term",
      file: "terminal",
      lines: [
        { text: "npm init -y", cls: "sh" },
        { text: "Wrote to /Users/you/redis-shipping-demo/package.json", cls: "dim" },
        { text: "npm install redis", cls: "sh", pause: 600 },
        { text: "added 12 packages in 2s", cls: "ok", pause: 800 },
        { text: "npm install -D typescript tsx @types/node", cls: "sh", pause: 600 },
        { text: "added 24 packages in 3s", cls: "ok", pause: 800 },
        { text: "mkdir src", cls: "sh", pause: 500 },
      ],
    },
  },

  // 6 ── 配置 package.json
  {
    action: { zh: "配置 package.json", en: "Configure package.json" },
    title: { zh: "改两处 package.json", en: "Two edits to package.json" },
    body: [
      {
        zh: "打开 package.json 改两处。第一处：加 \"type\": \"module\"，让 Node 认识 import / export 这种现代写法（不然要用老的 require）。",
        en: 'Open package.json and change two things. First: add "type": "module" so Node understands modern import / export (otherwise you\'d need the old require).',
      },
      {
        zh: "第二处：在 scripts 里加一行 dev，指向 tsx src/index.ts。这样以后一句 npm run dev 就能跑整个程序。版本号只是示意，以你 npm install 实际写入的为准。",
        en: "Second: add a dev line under scripts pointing to tsx src/index.ts. Then npm run dev runs the whole thing. The version numbers are illustrative — trust whatever npm install actually wrote.",
      },
    ],
    points: [
      { zh: '加 "type": "module"：让 Node 用 import / export，而不是 require。', en: 'Add "type": "module" so Node uses import / export, not require.' },
      { zh: '加 scripts.dev = "tsx src/index.ts"：一句 npm run dev 就能跑。', en: 'Add scripts.dev = "tsx src/index.ts" so npm run dev runs everything.' },
      { zh: "^5 / ^4 / ^22 只是占位，实际以 npm install 写入的为准。", en: "^5 / ^4 / ^22 are placeholders; the real ones come from npm install." },
    ],
    panel: { kind: "code", file: "pkg", focus: [[4, 4], [5, 7]] },
  },

  // 7 ── 写代码 ①
  {
    action: { zh: "开写 ①：运费缓存", en: "Write part ①: rate cache" },
    title: { zh: "写 src/index.ts · ① 运费缓存 (cache-aside)", en: "src/index.ts · ① rate cache (cache-aside)" },
    body: [
      {
        zh: "在 src/index.ts 顶部连上 Redis，再定义几个类型和一个假的 [[ledger:账本]]（真实系统里这些数据在 MySQL）。核心是 getCarrierRates——一个标准的 [[cacheaside:cache-aside]]。",
        en: "At the top of src/index.ts connect to Redis, then define a few types and a fake [[ledger:ledger]] (in a real system this data lives in MySQL). The heart is getCarrierRates — a textbook [[cacheaside:cache-aside]].",
      },
      {
        zh: "先 redis.get 查缓存：命中就 JSON.parse 直接返回；未命中才调 fetchRatesFromCarriers（用 sleep(1500) 模拟又慢又花钱的外部 [[carrier:承运商]] [[api:API]]），拿到后 set 回去并带上 EX:30 的 [[ttl:TTL]]。",
        en: "First redis.get checks the cache: on a hit, JSON.parse and return; only on a miss does it call fetchRatesFromCarriers (sleep(1500) fakes a slow, costly external [[carrier:carrier]] [[api:API]]), then sets the result back with an EX:30 [[ttl:TTL]].",
      },
    ],
    points: [
      { zh: "getCarrierRates 就是 [[cacheaside:cache-aside]]：先查 Redis，再决定要不要走慢路径。", en: "getCarrierRates is [[cacheaside:cache-aside]]: check Redis first, then decide whether to take the slow path." },
      { zh: "命中（cached !== null）→ 直接返回，省下 1.5 秒的外部调用（[[cachehit:命中]]）。", en: "Hit (cached !== null) → return immediately, saving the 1.5s external call (a [[cachehit:cache hit]])." },
      { zh: "未命中 → 取真数据、写回缓存、设 EX:30 秒后自动过期（[[cachemiss:未命中]]）。", en: "Miss → fetch the real data, write it back, expire it after EX:30s (a [[cachemiss:cache miss]])." },
    ],
    panel: { kind: "code", file: "index", focus: [[1, 9], [11, 22], [36, 76]] },
  },

  // 8 ── 写代码 ②
  {
    action: { zh: "写 ②：幂等购买", en: "Write part ②: idempotency" },
    title: { zh: "写 src/index.ts · ② 幂等购买标签", en: "src/index.ts · ② idempotent label purchase" },
    body: [
      {
        zh: "purchaseLabel 用一条 SET redisKey \"processing\" NX EX:60 实现 [[idempotency:幂等]]。因为 Redis 命令是原子的，并发里只有第一个请求能写成功——它拿到“处理权”。",
        en: 'purchaseLabel implements [[idempotency:idempotency]] with a single SET redisKey "processing" NX EX:60. Since Redis commands are atomic, only the first request among many succeeds — it wins the right to process.',
      },
      {
        zh: "acquired === null 意味着这把“锁”已被别人抢走——说明是重复请求（网络重试、用户连续点击两下），直接返回已有状态，绝不重复扣款、重复出标签。抢到的那一个才真正去买，然后把结果写回同一个键。",
        en: "acquired === null means the “lock” was already taken — a duplicate request (a network retry or a double-click). Return the existing status; never charge twice or mint two labels. Only the first request actually buys, then writes the result back under the same key.",
      },
    ],
    points: [
      { zh: "[[setnx:SET NX]] 只在键不存在时写成功，天生适合“只处理一次”。", en: "[[setnx:SET NX]] only writes when the key is absent — perfect for “process exactly once”." },
      { zh: "acquired === null → 已有人在处理 → 当成重复请求返回。", en: "acquired === null → someone's already on it → return as a duplicate." },
      { zh: "EX:60 是安全网：万一处理中崩了，锁会自己过期，不会永久卡死。", en: "EX:60 is a safety net: if the handler crashes mid-way, the lock expires instead of jamming forever." },
    ],
    panel: { kind: "code", file: "index", focus: [[77, 92]] },
  },

  // 9 ── 写代码 ③
  {
    action: { zh: "写 ③：余额投影", en: "Write part ③: balance projection" },
    title: { zh: "写 src/index.ts · ③ 余额投影 + 失效", en: "src/index.ts · ③ balance projection + invalidation" },
    body: [
      {
        zh: "余额不该每次都从 [[ledger:账本]] 一条条加。getBalance 把它当成 [[projection:投影/读模型]]：Redis 里有就直接读（BALANCE HIT），没有才从账本重算并缓存 60 秒（BALANCE MISS）。账本永远是[[sourceoftruth:真相来源]]，Redis 只是快照。",
        en: "A balance shouldn't be re-summed from the [[ledger:ledger]] every time. getBalance treats it as a [[projection:projection / read model]]: if Redis has it, read it (BALANCE HIT); otherwise recompute from the ledger and cache it for 60s (BALANCE MISS). The ledger stays the [[sourceoftruth:source of truth]]; Redis is just a snapshot.",
      },
      {
        zh: "关键在 addLedgerEntry：写完账本立刻 redis.del 掉旧余额——这就是 [[invalidation:缓存失效]]。下次读就会 MISS 并重算出正确的新值。最后 runDemo 把三段依次跑一遍，用 console.time 顺手量出快慢。",
        en: "The key is addLedgerEntry: right after appending to the ledger, redis.del wipes the stale balance — that's [[invalidation:cache invalidation]]. The next read then MISSes and recomputes the correct value. Finally runDemo runs all three demos in order, timing them with console.time.",
      },
    ],
    points: [
      { zh: "getBalance = 读 [[projection:投影]]；缺失时从[[sourceoftruth:真相来源]]（账本）重建。", en: "getBalance = read the [[projection:projection]]; when missing, rebuild from the [[sourceoftruth:source of truth]] (the ledger)." },
      { zh: "写账本后必须 redis.del 失效旧值，否则会一直返回过时余额（[[invalidation:缓存失效]]）。", en: "After writing the ledger you must redis.del the old value, or you'll keep serving a stale balance ([[invalidation:cache invalidation]])." },
      { zh: "runDemo 负责编排：connect → flushDb → 三段 demo → quit。", en: "runDemo orchestrates: connect → flushDb → the three demos → quit." },
    ],
    panel: { kind: "code", file: "index", focus: [[24, 34], [93, 122], [124, 161]] },
  },

  // 10 ── 运行
  {
    action: { zh: "运行！npm run dev", en: "Run it: npm run dev" },
    title: { zh: "跑起来：npm run dev", en: "Run it: npm run dev" },
    body: [
      {
        zh: "一句 npm run dev，tsx 直接跑 src/index.ts。看右边的回放：DEMO 1 第一次是 CACHE MISS，要等约 1.5 秒（模拟调 [[carrier:承运商]] [[api:API]]）；第二次 CACHE HIT，几毫秒返回——同样的结果，[[latency:延迟]]差了几百倍。",
        en: "One npm run dev and tsx runs src/index.ts. Watch the replay on the right: in DEMO 1 the first call is a CACHE MISS and waits ~1.5s (faking the [[carrier:carrier]] [[api:API]]); the second is a CACHE HIT returning in milliseconds — same result, hundreds of times less [[latency:latency]].",
      },
      {
        zh: "DEMO 2：第一次 NEW REQUEST 真的买了，第二次同一个 key 直接 DUPLICATE。DEMO 3：第一次 BALANCE MISS 从账本算出 75，第二次 HIT；加一笔 10 的支出后旧投影被 DEL，再读又 MISS 重算出 65（100 − 25 − 10）。",
        en: "DEMO 2: the first NEW REQUEST really buys; the second, same key, is a straight DUPLICATE. DEMO 3: the first BALANCE MISS computes 75 from the ledger, the second HITs; after a $10 debit the old projection is DELeted, so the next read MISSes and recomputes 65 (100 − 25 − 10).",
      },
    ],
    cmds: [
      {
        cmd: "npm run dev",
        note: {
          zh: "tsx 编译并运行 src/index.ts；右边就是预期输出。",
          en: "tsx compiles and runs src/index.ts; the expected output is on the right.",
        },
      },
    ],
    caution: {
      zh: "右边的耗时是代码里 sleep() 模拟出来的，不是真实压测。别据此在简历上写“性能提升 99%”。",
      en: "The timings on the right come from sleep() in the code, not a real benchmark. Don't turn this into a “99% faster” résumé line.",
    },
    panel: {
      kind: "term",
      file: "terminal — npm run dev",
      lines: [
        { text: "npm run dev", cls: "sh" },
        { text: "", cls: "out" },
        { text: "> redis-shipping-demo@1.0.0 dev", cls: "dim" },
        { text: "> tsx src/index.ts", cls: "dim" },
        { text: "", cls: "out" },
        { text: "Connected to Redis.", cls: "ok", pause: 700 },
        { text: "", cls: "out" },
        { text: "=== DEMO 1: CARRIER-RATE CACHE ===", cls: "accent", pause: 300 },
        { text: "CACHE MISS: no reusable rates in Redis.", cls: "dim", pause: 300 },
        { text: "Calling USPS, FedEx, and UPS APIs...", cls: "out", pause: 300 },
        { text: "[", cls: "out", pause: 1500 },
        { text: "  { carrier: 'USPS', service: 'Priority Mail', price: 14 },", cls: "out" },
        { text: "  { carrier: 'FedEx', service: 'Ground', price: 15.5 },", cls: "out" },
        { text: "  { carrier: 'UPS', service: 'Ground', price: 14.75 }", cls: "out" },
        { text: "]", cls: "out" },
        { text: "First rate request: 1.51s", cls: "ok" },
        { text: "CACHE HIT: returning rates from Redis.", cls: "ok", pause: 450 },
        { text: "[", cls: "out" },
        { text: "  { carrier: 'USPS', service: 'Priority Mail', price: 14 },", cls: "out" },
        { text: "  { carrier: 'FedEx', service: 'Ground', price: 15.5 },", cls: "out" },
        { text: "  { carrier: 'UPS', service: 'Ground', price: 14.75 }", cls: "out" },
        { text: "]", cls: "out" },
        { text: "Second rate request: 3.2ms", cls: "ok" },
        { text: "", cls: "out" },
        { text: "=== DEMO 2: IDEMPOTENCY ===", cls: "accent", pause: 450 },
        { text: "NEW REQUEST: purchasing shipping label...", cls: "out", pause: 300 },
        { text: "First purchase: { status: 'completed', labelId: 'label-1737000000000' }", cls: "ok", pause: 1000 },
        { text: "DUPLICATE REQUEST: label purchase already received.", cls: "dim", pause: 450 },
        {
          text: "Repeated purchase: { status: '{\"status\":\"completed\",\"labelId\":\"label-1737000000000\"}' }",
          cls: "out",
        },
        { text: "", cls: "out" },
        { text: "=== DEMO 3: BALANCE PROJECTION ===", cls: "accent", pause: 450 },
        { text: "BALANCE MISS: rebuilding from the ledger.", cls: "dim", pause: 300 },
        { text: "First balance read: 75", cls: "ok" },
        { text: "BALANCE HIT: reading projection from Redis.", cls: "ok", pause: 450 },
        { text: "Second balance read: 75", cls: "ok" },
        { text: "Adding a $10 debit to the permanent ledger...", cls: "out", pause: 450 },
        { text: "BALANCE MISS: rebuilding from the ledger.", cls: "dim", pause: 300 },
        { text: "Balance after ledger update: 65", cls: "ok" },
      ],
    },
  },

  // 11 ── redis-cli 观察
  {
    action: { zh: "用 redis-cli 看结果", en: "Inspect with redis-cli" },
    title: { zh: "用 redis-cli 亲眼看程序写了什么", en: "See what the program wrote, in redis-cli" },
    body: [
      {
        zh: "程序跑完，再进 redis-cli 直接看它留下的键。KEYS * 列出全部：运费缓存、幂等键、余额投影都在。GET 出来的运费和幂等键都是 JSON 字符串，TTL 能看到运费还剩几秒就要过期。",
        en: "After the program finishes, hop back into redis-cli and inspect the keys it left. KEYS * lists them all: the rate cache, the idempotency key, the balance projection. GET shows the rate and idempotency values as JSON strings, and TTL shows how many seconds the rate cache has left.",
      },
      {
        zh: "读一下 balance:account-101，是 65。再手动 DEL 掉它——下次谁调 getBalance 就会 MISS，然后从[[sourceoftruth:账本]]重算。你刚刚手动演了一遍 [[invalidation:缓存失效]]。",
        en: "Read balance:account-101 — it's 65. Then DEL it by hand: the next getBalance will MISS and recompute from the [[sourceoftruth:ledger]]. You just performed [[invalidation:cache invalidation]] manually.",
      },
    ],
    cmds: [
      {
        cmd: "docker exec -it redis-lab redis-cli",
        note: { zh: "再进一次 CLI，查刚才程序写进去的键。", en: "Back into the CLI to inspect the keys the program just wrote." },
      },
      {
        cmd: "KEYS *",
        note: {
          zh: "列出所有键——教学方便，但生产别对大库用，它会阻塞 [[singlethread:单线程]] 服务器。",
          en: "List every key — handy for learning, but never on a big production DB; it blocks the [[singlethread:single-threaded]] server.",
        },
      },
      {
        cmd: "TTL carrier-rates:account-101:94063:10001:5",
        note: { zh: "看运费缓存还剩几秒过期（当初设的是 EX:30）。", en: "See how many seconds the rate cache has left (we set EX:30)." },
      },
      {
        cmd: "GET balance:account-101",
        note: { zh: "读余额投影；应是 65（100 − 25 − 10）。", en: "Read the balance projection; it should be 65 (100 − 25 − 10)." },
      },
      {
        cmd: "DEL balance:account-101",
        note: {
          zh: "手动删掉投影；下次 getBalance 又会 MISS 并从账本重算。",
          en: "Manually delete the projection; the next getBalance will MISS and rebuild from the ledger.",
        },
      },
    ],
    panel: {
      kind: "term",
      file: "redis-cli",
      lines: [
        { text: "docker exec -it redis-lab redis-cli", cls: "sh" },
        { text: "KEYS *", cls: "rc", pause: 450 },
        { text: '1) "balance:account-101"', cls: "out" },
        { text: '2) "carrier-rates:account-101:94063:10001:5"', cls: "out" },
        { text: '3) "idempotency:purchase-label:checkout-request-001"', cls: "out" },
        { text: "GET carrier-rates:account-101:94063:10001:5", cls: "rc", pause: 550 },
        {
          text: '"[{\\"carrier\\":\\"USPS\\",\\"service\\":\\"Priority Mail\\",\\"price\\":14}, ...]"',
          cls: "out",
        },
        { text: "TTL carrier-rates:account-101:94063:10001:5", cls: "rc", pause: 550 },
        { text: "(integer) 21", cls: "out" },
        { text: "GET idempotency:purchase-label:checkout-request-001", cls: "rc", pause: 550 },
        {
          text: '"{\\"status\\":\\"completed\\",\\"labelId\\":\\"label-1737000000000\\"}"',
          cls: "out",
        },
        { text: "GET balance:account-101", cls: "rc", pause: 550 },
        { text: '"65"', cls: "out" },
        { text: "DEL balance:account-101", cls: "rc", pause: 550 },
        { text: "(integer) 1", cls: "out" },
        { text: "exit", cls: "rc", pause: 450 },
      ],
    },
  },

  // 12 ── 收尾清理
  {
    action: { zh: "收尾与清理", en: "Wrap up & clean up" },
    title: { zh: "收尾：停容器，记住一句话", en: "Wrap up: stop the container, remember one thing" },
    body: [
      {
        zh: "练习结束后停止容器：docker stop redis-lab。容器里的数据默认在内存里，停了就清空。下次想接着用同一个容器，docker start redis-lab 即可，不必再 run。",
        en: "Done? Stop the container: docker stop redis-lab. Its data lives in memory by default, so it clears when stopped. Next time, docker start redis-lab reuses the same container — no need to run again.",
      },
      {
        zh: "带走一句话：[[redis:Redis]] 是加速层，不是[[sourceoftruth:真相来源]]。它不可用、被清空了，你的系统必须能降级——回到数据库、回到账本重算。缓存能丢，账不能错。",
        en: "One takeaway: [[redis:Redis]] is a speed layer, not the [[sourceoftruth:source of truth]]. If it dies or gets flushed, your system must degrade gracefully — fall back to the database, recompute from the ledger. Losing a cache is fine; getting the books wrong is not.",
      },
    ],
    cmds: [
      {
        cmd: "docker stop redis-lab",
        note: { zh: "停掉容器；内存里的数据随之清空。", en: "Stop the container; its in-memory data clears with it." },
      },
      {
        cmd: "docker start redis-lab",
        note: { zh: "下次继续用同一个容器（不用再 run）。", en: "Reuse the same container next time (no need to run again)." },
      },
    ],
    panel: {
      kind: "term",
      file: "terminal",
      lines: [
        { text: "docker stop redis-lab", cls: "sh" },
        { text: "redis-lab", cls: "out" },
        { text: "docker start redis-lab", cls: "sh", pause: 700 },
        { text: "redis-lab", cls: "out" },
      ],
    },
  },
];
