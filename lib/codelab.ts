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
  title: { zh: "第 6 站 · 跟着写一遍", en: "Stop 6 · Write it yourself" },
  subtitle: {
    zh: "打开 VS Code，从零把一个 Redis Demo 跑起来",
    en: "Open VS Code and take a Redis demo from zero to running",
  },
  cmdsTitle: { zh: "命令 · 逐条解释", en: "Commands · line by line" },
  pointsTitle: { zh: "这段代码在干嘛", en: "What this code does" },
  copy: { zh: "复制", en: "Copy" },
  copied: { zh: "已复制", en: "Copied" },
  replay: { zh: "↻ 重新播放", en: "↻ Replay" },
  reset: { zh: "回到第一步", en: "Back to step 1" },
  nextStation: { zh: "下一站：面试速通 →", en: "Next stop: Interview prep →" },
  kbdNext: { zh: "下一步", en: "next" },
  kbdPrev: { zh: "上一步", en: "back" },
  ariaProgress: { zh: "步骤进度", en: "Step progress" },
  ariaStage: { zh: "演示区", en: "Demo stage" },
  ariaPrev: { zh: "上一步", en: "Previous step" },
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
  "// Stand-in for the permanent database. In a real app these rows live in MySQL.",
  "const ledger: LedgerEntry[] = [",
  '  { accountId: "account-101", amount: 100, type: "credit" },',
  '  { accountId: "account-101", amount: 25, type: "debit" },',
  "];",
  "",
  "function sleep(ms: number): Promise<void> {",
  "  return new Promise((resolve) => setTimeout(resolve, ms));",
  "}",
  "",
  "// Stands in for external carrier API calls. The delay is network and third-party time.",
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
  "// Demo 2: idempotency. One SET checks and writes; NX makes it succeed only if the key is absent.",
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
    title: { zh: "打开 VS Code，建一个空文件夹", en: "Open VS Code and create an empty folder" },
    body: [
      {
        zh: "先打开 VS Code。它自带一个终端：菜单栏 Terminal → New Terminal，或按快捷键 ⌃`（Control + 反引号）。之后每一步的命令都在这个终端里敲。",
        en: "Open VS Code first. It has a built-in terminal: open it from the menu with Terminal → New Terminal, or press ⌃` (Control + backtick). Every command in this stop goes into that terminal.",
      },
      {
        zh: "再创建项目目录：新建一个空文件夹 redis-shipping-demo 并进去。pwd 会打印你当前所在的目录，用来确认没走错地方。",
        en: "Now create the project directory: make an empty folder named redis-shipping-demo and move into it. pwd prints the folder you are in, so you can check you are in the right place.",
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
        zh: "我们不把 Redis 直接装进系统，而是用 [[docker:Docker]] 起一个容器：一条命令拉起，用完即弃，不在你电脑上留下一堆残留。先确认 Docker 能用。",
        en: "You will not install Redis onto your system directly. You will run it in a [[docker:Docker]] container instead: one command starts it, and you can throw it away when you are done. First check that Docker is available.",
      },
      {
        zh: "运行 docker --version，能打印版本号就说明 docker 命令装好了。如果提示 command not found，去装 Docker Desktop；如果后面 docker run 报连不上守护进程，把 Docker Desktop 打开再试一次。",
        en: "Run docker --version. A version number means the docker command is installed. If you see command not found, install Docker Desktop. If a later docker run reports that it cannot connect to the daemon, start Docker Desktop and try again.",
      },
    ],
    cmds: [
      {
        cmd: "docker --version",
        note: {
          zh: "让 Docker 打印版本号，确认命令可用；它只是读一下，不会改动任何东西。",
          en: "Prints the version of the Docker command line tool. It only reads; nothing is created or changed.",
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
    title: { zh: "一条命令，把 Redis 跑起来", en: "One command starts Redis" },
    body: [
      {
        zh: "这条 docker run 是本站最重要的一行。它下载 Redis 镜像、用镜像创建容器、让容器在后台跑起来，并把容器里的 6379 端口映射到你本机的 6379。6379 是 [[redis:Redis]] 的默认端口，你的代码之后就连它。",
        en: "This docker run is the most important command in this stop. It downloads the Redis image, creates a container from it, starts the container in the background, and maps port 6379 inside the container to port 6379 on your machine. 6379 is [[redis:Redis]]'s default port, and it is the port your code will connect to.",
      },
      {
        zh: "第一次会先拉取镜像（Pulling…），之后就用本地缓存了。跑完 docker ps 应能看到 redis-lab 正在运行、端口已映射。",
        en: "The first run downloads the image, so you will see the Pulling lines; later runs use the cached copy. After that, docker ps should list redis-lab as running with the port mapped.",
      },
    ],
    cmds: [
      {
        cmd: "docker run --name redis-lab -p 6379:6379 -d redis:8-alpine",
        note: { zh: "创建并启动一个 Redis 容器。逐个 flag 拆开看：", en: "Create and start a Redis container. Flag by flag:" },
        flags: [
          { flag: "docker run", desc: { zh: "创建并启动一个新容器。", en: "Create and start a new container." } },
          { flag: "--name redis-lab", desc: { zh: "把容器命名为 redis-lab，后面的命令都用这个名字。", en: "Name the container redis-lab so later commands can refer to it." } },
          {
            flag: "-p 6379:6379",
            desc: { zh: "本机端口 : 容器端口。发到本机 6379 的连接会被转进容器。", en: "host port : container port. Connections to port 6379 on your machine are forwarded into the container." },
          },
          { flag: "-d", desc: { zh: "后台运行（detached），不占住当前终端。", en: "Run detached, in the background, so your terminal stays free." } },
          {
            flag: "redis:8-alpine",
            desc: { zh: "Redis 8，基于体积很小的 Alpine Linux 基础镜像。", en: "Redis 8, built on Alpine Linux, a very small base image." },
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
    caution: {
      zh: "这个容器没有设密码，-p 6379:6379 又把端口发布在本机所有网卡上。自己电脑上练习没问题，公网能访问到的服务器上别这么开。",
      en: "This container has no password, and -p 6379:6379 publishes the port on every network interface of your machine. That is fine for practice on your own computer. Do not run it this way on a server that is reachable from the internet.",
    },
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
    action: { zh: "打开 redis-cli 试几条", en: "Open redis-cli" },
    title: { zh: "先用 redis-cli 亲手敲几条命令", en: "Try a few commands by hand in redis-cli" },
    body: [
      {
        zh: "写代码之前，先进容器用 redis-cli 手动敲几条命令。Redis 说到底就是一本很大的字典，亲手敲一遍最容易建立这个感觉。PING 返回 PONG 说明连上了；SET 和 GET 就是最基本的写和读。",
        en: "Before writing any code, open redis-cli inside the container and type a few commands by hand. This is where Redis starts to feel like what it is: one very large dictionary. PING returns PONG when the connection works. SET and GET are the most basic write and read.",
      },
      {
        zh: "重点看两条。给键加 EX 就有了 [[ttl:TTL]]：TTL 会一秒秒往下走，归零之后这个键就取不到了。带 NX 的 SET 连做两次，第二次返回 (nil)——[[setnx:NX]] 只在键不存在时才写，这正是后面幂等演示的地基。敲 exit 退出 CLI。",
        en: "Two of them deserve extra attention. EX gives the key a [[ttl:TTL]]: TTL counts down, and once it reaches zero the key is no longer returned. A SET with NX run twice returns (nil) the second time, because [[setnx:NX]] writes only when the key does not exist. That is the basis of the idempotency demo later. Type exit to leave the CLI.",
      },
    ],
    cmds: [
      {
        cmd: "docker exec -it redis-lab redis-cli",
        note: {
          zh: "进入容器里的 redis-cli 交互终端。-it 表示保持交互（interactive）并分配一个终端（tty）。",
          en: "Open the interactive redis-cli inside the container. -it keeps the session interactive and attaches a terminal.",
        },
      },
      { cmd: "PING", note: { zh: "连通性测试，返回 PONG 说明服务器答上话了。", en: "A connection test. PONG means the server answered." } },
      {
        cmd: "SET name Wayne",
        note: { zh: "把键 name 存成值 Wayne，返回 OK。", en: "Store the value Wayne under the key name. Returns OK." },
      },
      { cmd: "GET name", note: { zh: "按键名把值读回来。", en: "Read the value back by its key." } },
      {
        cmd: "SET greeting hi EX 10",
        note: { zh: "写一个带 10 秒 [[ttl:TTL]] 的键；10 秒之后 GET 就返回 (nil)。", en: "Write a key with a 10-second [[ttl:TTL]]. After that, GET returns (nil)." },
      },
      { cmd: "TTL greeting", note: { zh: "查这个键还剩几秒过期。", en: "Show how many seconds the key has left." } },
      {
        cmd: "SET order:1 processing NX EX 30",
        note: {
          zh: "连做两次：第二次返回 (nil)。这一条命令同时完成检查和写入，而 [[setnx:NX]] 只在键不存在时才写。",
          en: "Run it twice: the second time returns (nil). This one command both checks and writes, and [[setnx:NX]] writes only when the key does not exist.",
        },
      },
      { cmd: "exit", note: { zh: "退出 redis-cli，回到普通终端。", en: "Leave redis-cli and return to the normal shell." } },
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
        zh: "回到普通终端，把项目搭起来。npm init -y 生成 package.json；然后装运行时依赖：redis 就是官方 Node 客户端 [[api:node-redis]]，代码里 import 的正是它。",
        en: "Back in the normal shell, set the project up. npm init -y creates package.json. Then install the runtime dependency: redis is the official Node client, [[api:node-redis]], and it is what your code imports.",
      },
      {
        zh: "开发依赖装 typescript、tsx、@types/node。tsx 是关键：它能直接跑 .ts 文件，省掉手动编译成 .js 这一步。最后建一个 src 文件夹放源码。",
        en: "The development dependencies are typescript, tsx, and @types/node. tsx matters most here: it runs a .ts file directly, so you never compile to .js by hand. Last, create a src folder for the source code.",
      },
    ],
    cmds: [
      {
        cmd: "npm init -y",
        note: { zh: "生成默认 package.json（-y = 全部用默认值，不逐条问你）。", en: "Create a default package.json (-y accepts every default instead of asking)." },
      },
      {
        cmd: "npm install redis",
        note: { zh: "装官方 Node 客户端 [[api:node-redis]]，写进 dependencies。", en: "Install the official Node client [[api:node-redis]]. It goes into dependencies." },
      },
      {
        cmd: "npm install -D typescript tsx @types/node",
        note: {
          zh: "-D = 开发依赖：typescript 类型系统、tsx 直接跑 .ts、@types/node 给 Node API 提供类型。",
          en: "-D marks these as development dependencies: TypeScript itself, tsx to run .ts files directly, and @types/node for the Node API types.",
        },
      },
      { cmd: "mkdir src", note: { zh: "放源码的文件夹，等下写 src/index.ts。", en: "A folder for the source code. Next you will write src/index.ts." } },
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
        en: 'Open package.json and change two things. First, add "type": "module" so Node accepts import / export instead of the older require syntax.',
      },
      {
        zh: "第二处：在 scripts 里加一行 dev，指向 tsx src/index.ts。这样以后一句 npm run dev 就能跑整个程序。版本号只是示意，以你 npm install 实际写入的为准。",
        en: "Second, add a dev entry under scripts that points at tsx src/index.ts. After that, npm run dev runs the whole program. The version numbers here are only an example; keep whatever npm install wrote in your own file.",
      },
    ],
    points: [
      { zh: '加 "type": "module"：让 Node 用 import / export，而不是 require。', en: 'Add "type": "module" so Node uses import / export, not require.' },
      { zh: '加 scripts.dev = "tsx src/index.ts"：一句 npm run dev 就能跑。', en: 'Add scripts.dev = "tsx src/index.ts" so npm run dev runs everything.' },
      { zh: "^5 / ^4 / ^22 只是占位，实际以 npm install 写入的为准。", en: "^5 / ^4 / ^22 are only placeholders; your file keeps whatever npm install wrote." },
    ],
    panel: { kind: "code", file: "pkg", focus: [[4, 4], [5, 7]] },
  },

  // 7 ── 写代码 ①
  {
    action: { zh: "开写 ①：运费缓存", en: "Write part ①: rate cache" },
    title: { zh: "写 src/index.ts · ① 运费缓存 (cache-aside)", en: "src/index.ts · ① rate cache (cache-aside)" },
    body: [
      {
        zh: "在 src/index.ts 顶部连上 Redis，再定义几个类型和一个用来顶替数据库的 [[ledger:账本]]（真实系统里这些数据在 MySQL）。真正的重点是 getCarrierRates——一个最普通的 [[cacheaside:cache-aside]] 读取。",
        en: "At the top of src/index.ts, connect to Redis, then define a few types and a stand-in [[ledger:ledger]] (in a real system that data lives in MySQL). The function that matters is getCarrierRates, a plain [[cacheaside:cache-aside]] read.",
      },
      {
        zh: "先 redis.get 查缓存：命中就 JSON.parse 直接返回；未命中才调 fetchRatesFromCarriers（用 sleep(1500) 模拟一次又慢又花钱的外部 [[carrier:承运商]] [[api:API]] 调用），拿到结果再写回缓存，并带上 EX: 30 这个 30 秒的 [[ttl:TTL]]。",
        en: "redis.get checks the cache first. On a hit it parses the JSON and returns it. Only on a miss does it call fetchRatesFromCarriers, where sleep(1500) stands in for a slow, paid call to an external [[carrier:carrier]] [[api:API]]. The result is then written back with EX: 30, a 30-second [[ttl:TTL]].",
      },
    ],
    points: [
      { zh: "getCarrierRates 就是 [[cacheaside:cache-aside]]：先查 Redis，再决定要不要走慢路径。", en: "getCarrierRates is [[cacheaside:cache-aside]]: check Redis first, then decide whether to take the slow path." },
      { zh: "命中（cached !== null）→ 直接返回，省下 1.5 秒的外部调用（[[cachehit:命中]]）。", en: "Hit (cached !== null) → return at once and skip the 1.5-second external call (a [[cachehit:cache hit]])." },
      { zh: "未命中 → 取真数据，带 EX: 30 写回缓存，再返回（[[cachemiss:未命中]]）。", en: "Miss → fetch the real rates, write them back with EX: 30, then return them (a [[cachemiss:cache miss]])." },
    ],
    panel: { kind: "code", file: "index", focus: [[1, 9], [11, 22], [36, 76]] },
  },

  // 8 ── 写代码 ②
  {
    action: { zh: "写 ②：幂等购买", en: "Write part ②: idempotency" },
    title: { zh: "写 src/index.ts · ② 幂等购买标签", en: "src/index.ts · ② idempotent label purchase" },
    body: [
      {
        zh: "purchaseLabel 用一条 SET redisKey \"processing\" NX EX 60 实现 [[idempotency:幂等]]。这一条命令同时完成“检查键在不在”和“写入”，而 Redis 一次只执行一条命令，所以并发里只有一个请求能写成功。老写法 SETNX + EXPIRE 并不等价：两条命令之间进程一旦停掉，就会留下一个永不过期的键。",
        en: 'purchaseLabel gets its [[idempotency:idempotency]] from one command: SET redisKey "processing" NX EX 60. That single command both checks whether the key exists and writes it, and Redis executes commands one at a time, so exactly one of the concurrent requests can succeed. The older SETNX plus EXPIRE pair is not equivalent: the process can stop between the two commands and leave a key that never expires.',
      },
      {
        zh: "acquired === null 说明这个键已经被别的请求写过了——那就是一次重复请求（网络重试，或者用户连点了两下）。这时直接返回已有状态，不重复扣款、不重复出标签。只有写成功的那个请求才真的去买，买完把结果写回同一个键。",
        en: "acquired === null means another request already wrote the key, so this one is a duplicate: a network retry, or a user clicking twice. It returns the existing status instead, so the account is not charged twice and a second label is never created. Only the request that wrote the key does the real work, and it writes the result back under the same key.",
      },
    ],
    points: [
      { zh: "[[setnx:SET NX]] 只在键不存在时才写，一次并发里只有一个请求能拿到。", en: "[[setnx:SET NX]] writes only when the key does not exist, so one request wins and the rest see a duplicate." },
      { zh: "acquired === null → 已有人在处理 → 当成重复请求返回。", en: "acquired === null → another request already holds the key → return it as a duplicate." },
      { zh: "EX 60 是安全网：万一处理到一半停了，键会自己过期，不会把这个请求永久卡死。", en: "EX 60 is the safety net: if the handler stops midway, the key expires instead of blocking that request id forever." },
    ],
    caution: {
      zh: "这里做的是幂等标记，不是通用的分布式锁。键 60 秒后过期，所以处理中途停掉的话，重试会把活重做一遍。真正的锁在释放时必须“比对值 + 删除”一步做完（用 Lua 脚本）：先 GET 再 DEL，可能删掉别人在 TTL 过期后拿到的那把锁。",
      en: "This is an idempotency marker, not a general-purpose distributed lock. The key expires after 60 seconds, so if the handler stops midway a retry will do the work again. Releasing a real lock means comparing the stored value and deleting it in one atomic step, which needs a Lua script: a plain GET followed by DEL can delete a lock that another client acquired after the first TTL ran out.",
    },
    panel: { kind: "code", file: "index", focus: [[77, 92]] },
  },

  // 9 ── 写代码 ③
  {
    action: { zh: "写 ③：余额投影", en: "Write part ③: balance projection" },
    title: { zh: "写 src/index.ts · ③ 余额投影 + 失效", en: "src/index.ts · ③ balance projection + invalidation" },
    body: [
      {
        zh: "余额不该每次都从 [[ledger:账本]] 一条条加。getBalance 把它当成 [[projection:投影 / 读模型]]：Redis 里有就直接读（BALANCE HIT），没有才从账本重算并缓存 60 秒（BALANCE MISS）。账本始终是[[sourceoftruth:真相来源]]，Redis 里那份只是一个可以随时丢掉的副本。",
        en: "A balance should not be summed from the [[ledger:ledger]] on every read. getBalance treats it as a [[projection:projection / read model]]: if Redis has it, read it (BALANCE HIT); if not, recompute from the ledger and cache it for 60 seconds (BALANCE MISS). The ledger stays the [[sourceoftruth:source of truth]], and the copy in Redis can be thrown away at any time.",
      },
      {
        zh: "关键在 addLedgerEntry：写完账本立刻 redis.del 掉旧余额——这就是 [[invalidation:缓存失效]]。下次读就会 MISS，并重算出正确的新值。最后 runDemo 把三段依次跑一遍，用 console.time 顺手量出快慢。",
        en: "The important part is addLedgerEntry: right after appending to the ledger, redis.del removes the old balance. That is [[invalidation:cache invalidation]]. The next read misses and recomputes the correct value. Finally, runDemo runs the three demos in order and measures them with console.time.",
      },
    ],
    points: [
      { zh: "getBalance = 读 [[projection:投影]]；缺失时从[[sourceoftruth:真相来源]]（账本）重建。", en: "getBalance = read the [[projection:projection]]; when it is missing, rebuild it from the [[sourceoftruth:source of truth]] (the ledger)." },
      { zh: "写账本后必须 redis.del 失效旧值，否则会一直返回过时余额（[[invalidation:缓存失效]]）。", en: "After writing the ledger you must redis.del the old value, or reads keep returning a stale balance ([[invalidation:cache invalidation]])." },
      { zh: "先写库再删缓存仍有竞态窗口：一个慢读可能在 del 之后把旧值写回去。EX 60 决定了这种旧值最多存活多久。", en: "Write first, then delete still leaves a race window: a slow reader can write the old value back after the del. The 60-second TTL is what limits how long such a value survives." },
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
        zh: "一句 npm run dev，tsx 直接跑 src/index.ts。看右边的回放：DEMO 1 第一次是 CACHE MISS，要等约 1.5 秒（模拟调 [[carrier:承运商]] [[api:API]]）；第二次是 CACHE HIT，几毫秒就返回——同样的结果，一边是跨网调用的[[latency:延迟]]，一边只是一次内存读取。",
        en: "npm run dev hands src/index.ts to tsx. Watch the replay on the right. In DEMO 1 the first call is a CACHE MISS and waits about 1.5 seconds, which is the simulated [[carrier:carrier]] [[api:API]] call. The second call is a CACHE HIT and returns in a few milliseconds: the same result, with the [[latency:latency]] of a memory read instead of a network round trip.",
      },
      {
        zh: "DEMO 2：第一次 NEW REQUEST 真的买了，第二次同一个 key 直接 DUPLICATE（重复分支原样返回存着的那个字符串，所以打印出来的 status 里套着第一次的 JSON）。DEMO 3：第一次 BALANCE MISS 从账本算出 75，第二次命中；加一笔 10 的支出后旧投影被删掉，再读又 MISS，重算出 65（100 − 25 − 10）。",
        en: "DEMO 2: the first call is a NEW REQUEST and does the work; the second call, with the same key, comes back as a DUPLICATE (the duplicate branch returns the stored string as it is, which is why the printed status contains the JSON of the first result). DEMO 3: the first read is a BALANCE MISS and computes 75 from the ledger; the second read is a hit. After a $10 debit is appended, the old projection is deleted, so the next read misses again and recomputes 65 (100 − 25 − 10).",
      },
    ],
    cmds: [
      {
        cmd: "npm run dev",
        note: {
          zh: "tsx 编译并运行 src/index.ts；右边就是预期输出。",
          en: "tsx compiles and runs src/index.ts. The expected output is on the right.",
        },
      },
    ],
    caution: {
      zh: "右边的耗时是代码里 sleep() 模拟出来的，不是真实压测。别据此在简历上写“性能提升 99%”。",
      en: 'The timings on the right come from sleep() in the code, not a real benchmark. Do not turn this into a "99% faster" line on your resume.',
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
    title: { zh: "用 redis-cli 亲眼看程序写了什么", en: "Inspect what the program wrote, in redis-cli" },
    body: [
      {
        zh: "程序跑完，再进一次 redis-cli，看看它留下的键。KEYS * 列出全部：运费缓存、幂等键、余额投影都在。GET 出来的运费和幂等键都是 JSON 字符串，TTL 能看到运费缓存还剩几秒。",
        en: "After the program finishes, open redis-cli again and look at the keys it left behind. KEYS * lists all of them: the rate cache, the idempotency key, and the balance projection. GET returns the rate and idempotency values as JSON strings, and TTL shows how many seconds the rate cache has left.",
      },
      {
        zh: "读一下 balance:account-101，是 65。再手动 DEL 掉它——下次谁调 getBalance 就会 MISS，然后从[[sourceoftruth:账本]]重算。你刚刚手动演了一遍 [[invalidation:缓存失效]]。",
        en: "Read balance:account-101 and you get 65. Then delete it by hand: the next call to getBalance misses and recomputes from the [[sourceoftruth:ledger]]. You have just performed [[invalidation:cache invalidation]] manually.",
      },
    ],
    cmds: [
      {
        cmd: "docker exec -it redis-lab redis-cli",
        note: { zh: "再进一次 CLI，查刚才程序写进去的键。", en: "Back into the CLI, to inspect the keys the program just wrote." },
      },
      {
        cmd: "KEYS *",
        note: {
          zh: "列出所有键。教学库随便用，生产库别用：KEYS 要扫整个键空间，是 O(n)，而 Redis [[singlethread:一条条执行命令]]，其它请求只能排队等着。生产用 SCAN。",
          en: "List every key. Fine on a practice database, not in production: KEYS is O(n) over the whole keyspace, and because Redis [[singlethread:runs commands one at a time]], every other client waits behind it. Use SCAN instead.",
        },
      },
      {
        cmd: "TTL carrier-rates:account-101:94063:10001:5",
        note: {
          zh: "看运费缓存还剩几秒（当初设的是 EX: 30）。归零之后 GET 就返回 (nil)；至于内存，Redis 是在下次访问该键时、或后台采样扫到它时才真正回收。",
          en: "How many seconds the rate cache has left (it was set with EX: 30). Once it reaches zero, GET returns (nil). The memory is reclaimed a little later, when the key is next accessed or when the background sampling job reaches it.",
        },
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
    action: { zh: "收尾与清理", en: "Wrap up and clean up" },
    title: { zh: "收尾：停容器，记住一句话", en: "Wrap up: stop the container, remember one thing" },
    body: [
      {
        zh: "练习结束后停止容器：docker stop redis-lab。这只是停掉里面的进程，容器还在，下次 docker start redis-lab 就能接着用，不必再 run 一遍。",
        en: "When you are done, stop the container: docker stop redis-lab. That only stops the process inside; the container itself stays, so next time docker start redis-lab picks it up again and you do not have to run it a second time.",
      },
      {
        zh: "这个容器没有挂载数据卷，所以别把里面的数据当回事：Redis 一停，内存里的东西就没了；docker rm redis-lab 删掉容器，剩下的也一并消失。练习环境正好要这样——用完即弃。",
        en: "This container has no volume mounted, so treat everything inside it as disposable. When Redis stops, whatever was in memory is gone, and docker rm redis-lab discards the rest with the container. For a practice environment that is exactly what you want.",
      },
      {
        zh: "带走一句话：[[redis:Redis]] 是加速层，不是[[sourceoftruth:真相来源]]。它不可用、或者被清空了，你的系统必须还能照常工作——回到数据库、回到账本重算。缓存能丢，账不能错。",
        en: "One thing to take away: [[redis:Redis]] is a speed layer, not the [[sourceoftruth:source of truth]]. If it is unavailable, or its data is flushed, your system still has to work: read from the database, recompute from the ledger. Losing a cache is acceptable; getting the numbers wrong is not.",
      },
    ],
    cmds: [
      {
        cmd: "docker stop redis-lab",
        note: { zh: "停掉容器；里面的 Redis 进程结束，只存在内存里的数据也就没了。", en: "Stop the container. The Redis process ends, so anything held only in memory is gone." },
      },
      {
        cmd: "docker start redis-lab",
        note: { zh: "下次继续用同一个容器（不用再 run）。", en: "Reuse the same container next time (no need to run it again)." },
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
