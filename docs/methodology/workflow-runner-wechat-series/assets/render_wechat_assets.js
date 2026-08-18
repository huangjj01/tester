#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { createRequire } = require("module");

const nodeModules =
  process.env.CODEX_NODE_MODULES ||
  "/Users/jiekej/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules";
const requireFromBundle = createRequire(path.join(nodeModules, "package.json"));
const sharp = requireFromBundle("sharp");

const root = __dirname;
const dirs = {
  headerSvg: path.join(root, "covers_header"),
  headerPng: path.join(root, "png_header"),
  cardSvg: path.join(root, "covers_card"),
  cardPng: path.join(root, "png_card"),
  logicSvg: path.join(root, "logic_diagrams"),
  logicPng: path.join(root, "png_logic"),
};

Object.values(dirs).forEach((dir) => fs.mkdirSync(dir, { recursive: true }));

const C = {
  bg: "#0B0C0F",
  bg2: "#111318",
  panel: "#151922",
  panel2: "#1A202B",
  ink: "#F5F1E8",
  inkSoft: "#CFC5B4",
  steel: "#8E744A",
  teal: "#5C8D89",
  rust: "#A54E3D",
  amber: "#D4B06A",
  olive: "#6D7C57",
  line: "#2C3442",
  white: "#FFFDF8",
  green: "#4FA36B",
  red: "#C45A46",
  navy: "#202734",
};

function esc(s) {
  return String(s).replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
}

function charWidth(ch, size) {
  if (ch === " ") return size * 0.34;
  if (/[A-Z]/.test(ch)) return size * 0.72;
  if (/[a-z0-9]/.test(ch)) return size * 0.58;
  if (/[_./:-]/.test(ch)) return size * 0.42;
  return size * 1.02;
}

function wrapText(text, maxWidth, size = 24) {
  const parts = String(text).split("\n");
  const out = [];
  for (const part of parts) {
    let line = "";
    let width = 0;
    for (const ch of part) {
      const next = charWidth(ch, size);
      if (line && width + next > maxWidth) {
        out.push(line);
        line = ch;
        width = next;
      } else {
        line += ch;
        width += next;
      }
    }
    if (line) out.push(line);
  }
  return out;
}

function text(x, y, content, opts = {}) {
  const size = opts.size || 24;
  const color = opts.color || C.ink;
  const weight = opts.weight || 500;
  const anchor = opts.anchor || "start";
  const family = opts.family || "PingFang SC, Hiragino Sans GB, Microsoft YaHei, Arial, sans-serif";
  const lines = opts.width ? wrapText(content, opts.width, size) : String(content).split("\n");
  const lineHeight = opts.lineHeight || Math.round(size * 1.35);
  return `<text x="${x}" y="${y}" fill="${color}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}" font-family="${family}" letter-spacing="${opts.spacing || 0}">${lines
    .map((line, i) => `<tspan x="${x}" dy="${i === 0 ? 0 : lineHeight}">${esc(line)}</tspan>`)
    .join("")}</text>`;
}

function rect(x, y, w, h, opts = {}) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${opts.r || 22}" fill="${opts.fill || "none"}" stroke="${opts.stroke || "none"}" stroke-width="${opts.sw || 1}" opacity="${opts.opacity || 1}"/>`;
}

function pill(x, y, label, color = C.steel, bg = C.white) {
  const w = Math.max(110, label.length * 13 + 36);
  return `${rect(x, y, w, 40, { r: 20, fill: bg, stroke: color, sw: 1.4 })}${text(x + w / 2, y + 27, label, {
    size: 18,
    weight: 850,
    color,
    anchor: "middle",
  })}`;
}

function arrows(points, color = C.rust) {
  return points
    .map(([x1, y1, x2, y2]) => {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const angle = Math.atan2(dy, dx);
      const ah = 10;
      const ax1 = x2 - ah * Math.cos(angle - Math.PI / 6);
      const ay1 = y2 - ah * Math.sin(angle - Math.PI / 6);
      const ax2 = x2 - ah * Math.cos(angle + Math.PI / 6);
      const ay2 = y2 - ah * Math.sin(angle + Math.PI / 6);
      return `<path d="M ${x1} ${y1} L ${x2} ${y2} M ${ax1} ${ay1} L ${x2} ${y2} L ${ax2} ${ay2}" fill="none" stroke="${color}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`;
    })
    .join("");
}

function headerSvg({ index, title1, title2, hook, accent, accent2, tag }) {
  const width = 1600;
  const height = 900;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="paperWash" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${C.bg}"/>
      <stop offset="1" stop-color="${C.bg2}"/>
    </linearGradient>
    <radialGradient id="glow1" cx="82%" cy="18%" r="42%">
      <stop offset="0" stop-color="${accent}" stop-opacity="0.22"/>
      <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="10%" cy="82%" r="36%">
      <stop offset="0" stop-color="${accent2}" stop-opacity="0.18"/>
      <stop offset="1" stop-color="${accent2}" stop-opacity="0"/>
    </radialGradient>
    <filter id="shadow" x="-20%" y="-20%" width="160%" height="160%">
      <feDropShadow dx="0" dy="28" stdDeviation="32" flood-color="#000" flood-opacity="0.34"/>
    </filter>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#paperWash)"/>
  <rect width="${width}" height="${height}" fill="url(#glow1)"/>
  <rect width="${width}" height="${height}" fill="url(#glow2)"/>
  <g opacity="0.24">
    <path d="M0 132H1600M0 264H1600M0 396H1600M0 528H1600M0 660H1600M0 792H1600" stroke="${C.line}"/>
    <path d="M160 0V900M320 0V900M480 0V900M640 0V900M800 0V900M960 0V900M1120 0V900M1280 0V900M1440 0V900" stroke="${C.line}"/>
  </g>
  <g opacity="0.18">
    <path d="M1100 150H1450M1100 210H1450M1100 270H1450M1100 330H1450M1100 390H1450M1100 450H1450M1100 510H1450" stroke="${accent}"/>
    <path d="M1180 120V560M1320 120V560" stroke="${accent2}"/>
  </g>

  <g filter="url(#shadow)">
    ${rect(94, 88, 1412, 724, { r: 30, fill: "rgba(18,22,29,0.88)", stroke: "#2E3746", sw: 2.2 })}
    <rect x="94" y="88" width="12" height="724" rx="6" fill="${accent}"/>
  </g>

  <g>
    ${pill(152, 144, `WORKFLOW RUNNER 0${index}`, accent, "#171C24")}
    ${text(152, 236, "Agent Testing · 微信专题", { size: 30, weight: 800, color: C.inkSoft })}
    ${text(152, 382, title1, { size: 92, weight: 920, color: C.ink, width: 760, lineHeight: 108, family: "PingFang SC, STSong, Songti SC, serif" })}
    ${text(152, 498, title2, { size: 60, weight: 860, color: "#E8D8B7", width: 760, lineHeight: 78 })}

    ${rect(152, 566, 844, 96, { r: 24, fill: "rgba(255,255,255,0.05)", stroke: accent2, sw: 2 })}
    ${text(188, 624, hook, { size: 33, weight: 720, color: C.inkSoft, width: 760, lineHeight: 44 })}

    ${rect(1090, 564, 242, 90, { r: 24, fill: "#11161E", stroke: accent, sw: 2 })}
    ${text(1211, 620, tag, { size: 28, weight: 900, color: C.ink, anchor: "middle" })}
  </g>

  <g opacity="0.9">
    <rect x="1050" y="180" width="290" height="146" rx="26" fill="${C.panel}" stroke="${accent}" stroke-width="2.2"/>
    <rect x="1122" y="254" width="224" height="132" rx="26" fill="${C.panel2}" stroke="${accent2}" stroke-width="2.2"/>
    <rect x="1016" y="346" width="252" height="142" rx="26" fill="${C.panel}" stroke="${C.steel}" stroke-width="2"/>
    <rect x="1170" y="402" width="178" height="116" rx="22" fill="${accent}" stroke="${accent2}" stroke-width="2.2"/>
    ${arrows([
      [1180, 258, 1180, 344],
      [1142, 418, 1168, 418],
      [1268, 458, 1268, 518],
    ], accent)}
    ${text(1082, 228, "RULES", { size: 28, weight: 900, color: accent })}
    ${text(1152, 304, "FLOW", { size: 26, weight: 900, color: accent2 })}
    ${text(1044, 392, "CHECK", { size: 26, weight: 900, color: C.steel })}
    ${text(1259, 466, "GO", { size: 24, weight: 900, color: C.bg, anchor: "middle" })}
  </g>
</svg>`;
}

function cardSvg({ index, title, subtitle, accent, accent2, tag }) {
  const width = 900;
  const height = 383;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${C.bg}"/>
      <stop offset="1" stop-color="${C.bg2}"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" rx="28" fill="url(#bg)"/>
  <g opacity="0.16">
    <path d="M0 95H900M0 191H900M0 287H900" stroke="${C.line}"/>
    <path d="M150 0V383M300 0V383M450 0V383M600 0V383M750 0V383" stroke="${C.line}"/>
  </g>
  ${rect(26, 24, 848, 335, { r: 26, fill: "rgba(18,22,29,0.9)", stroke: "#2E3746", sw: 2 })}
  <rect x="26" y="24" width="10" height="335" rx="5" fill="${accent}"/>
  ${pill(58, 52, `WR 0${index}`, accent, "#171C24")}
  ${text(58, 132, title, { size: 46, weight: 920, color: C.ink, width: 420, lineHeight: 56, family: "PingFang SC, STSong, Songti SC, serif" })}
  ${text(58, 202, subtitle, { size: 26, weight: 780, color: C.inkSoft, width: 430, lineHeight: 36 })}
  ${rect(58, 250, 346, 58, { r: 18, fill: "#10141B", stroke: accent2, sw: 1.8 })}
  ${text(231, 286, tag, { size: 20, weight: 900, color: C.ink, anchor: "middle" })}
  <g opacity="0.9">
    <rect x="574" y="76" width="186" height="94" rx="24" fill="${C.panel}" stroke="${accent}" stroke-width="2"/>
    <rect x="636" y="138" width="192" height="96" rx="24" fill="${C.panel2}" stroke="${accent2}" stroke-width="2"/>
    <rect x="550" y="214" width="172" height="86" rx="22" fill="${C.panel}" stroke="${C.steel}" stroke-width="2"/>
    ${arrows([
      [666, 170, 666, 214],
      [722, 262, 756, 262],
    ], accent)}
  </g>
</svg>`;
}

function logicFrame(height, kicker, title, subtitle, content) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="${height}" viewBox="0 0 1200 ${height}">
  <defs>
    <linearGradient id="paperWash" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${C.bg}"/>
      <stop offset="1" stop-color="${C.bg2}"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="160%" height="160%">
      <feDropShadow dx="0" dy="18" stdDeviation="24" flood-color="#000" flood-opacity="0.26"/>
    </filter>
  </defs>
  <rect width="1200" height="${height}" fill="url(#paperWash)"/>
  <g opacity="0.14">
    <path d="M0 120H1200M0 240H1200M0 360H1200M0 480H1200M0 600H1200M0 720H1200M0 840H1200M0 960H1200M0 1080H1200M0 1200H1200M0 1320H1200" stroke="${C.line}"/>
    <path d="M120 0V${height}M240 0V${height}M360 0V${height}M480 0V${height}M600 0V${height}M720 0V${height}M840 0V${height}M960 0V${height}M1080 0V${height}" stroke="${C.line}"/>
  </g>
  ${text(58, 74, kicker, { size: 21, weight: 850, color: C.steel })}
  ${text(58, 138, title, { size: 52, weight: 920, color: C.ink, width: 980, lineHeight: 64, family: "PingFang SC, STSong, Songti SC, serif" })}
  ${text(58, 224, subtitle, { size: 24, weight: 560, color: C.inkSoft, width: 980, lineHeight: 36 })}
  ${content}
</svg>`;
}

function logicNode(x, y, w, h, title, body, accent) {
  return `${rect(x, y, w, h, { r: 22, fill: C.panel, stroke: accent, sw: 2.1 })}
    ${text(x + 24, y + 50, title, { size: 24, weight: 900, color: C.ink, width: w - 56, lineHeight: 32 })}
    ${body ? text(x + 24, y + 92, body, { size: 17, color: C.inkSoft, width: w - 60, lineHeight: 26 }) : ""}`;
}

const covers = [
  {
    index: 1,
    file: "01_rules_chaos",
    title1: "规则很多",
    title2: "为什么还是拦不住 Agent",
    hook: "文档写得再全，如果流程里没有门，Agent 仍然能带着空壳结果继续往前走。",
    accent: C.rust,
    accent2: C.steel,
    tag: "PROBLEM",
  },
  {
    index: 2,
    file: "02_where_it_breaks",
    title1: "问题不在模型",
    title2: "在执行闭环断了",
    hook: "规则、路由、步骤、工具都在，但执行时仍可能漏状态、跳依赖、绕门禁。",
    accent: C.steel,
    accent2: C.amber,
    tag: "BREAKPOINT",
  },
  {
    index: 3,
    file: "03_why_runner",
    title1: "Workflow Runner",
    title2: "把文档约束变成可执行门禁",
    hook: "不是再加更多规则，而是让规则不通过时，流程真的走不下去。",
    accent: C.teal,
    accent2: C.rust,
    tag: "RUNNER",
  },
  {
    index: 4,
    file: "04_how_it_works",
    title1: "8 步流程",
    title2: "怎么真正拦住跳步骤",
    hook: "固定序列、门禁校验、状态落盘和中断恢复，组成最小可行流程保障。",
    accent: C.amber,
    accent2: C.olive,
    tag: "MECHANISM",
  },
  {
    index: 5,
    file: "05_43_cases",
    title1: "43 / 2 / 1",
    title2: "不是没翻车，而是翻车后补上了",
    hook: "43 条用例拷问 Runner，2 个失败暴露边角缺陷，1 次复测把闭环做实。",
    accent: C.rust,
    accent2: C.green,
    tag: "VALIDATION",
  },
  {
    index: 6,
    file: "06_traceable_delivery",
    title1: "别把 Agent 管死",
    title2: "真正重要的是交付可验证",
    hook: "价值不在更严，而在可追溯、可恢复、可阻断、可沉淀。",
    accent: C.olive,
    accent2: C.steel,
    tag: "BOUNDARY",
  },
];

const diagrams = [
  {
    file: "01_rules_chaos_logic",
    svg: () =>
      logicFrame(
        980,
        "PART 01 · PROBLEM",
        "文档约束为什么总在执行时失效",
        "看起来规则很多，真正缺的是流程里那道拦住 Agent 的门。",
        `
        ${logicNode(58, 290, 324, 248, "规则很多", "规则入口、workflow、skills、toolset 都已经存在。", C.steel)}
        ${logicNode(438, 290, 324, 248, "Agent 继续往前跑", "跳过环境前置、工具选型或反思，仍能产出“已完成”的结果。", C.rust)}
        ${logicNode(818, 290, 324, 248, "没人真正拦它", "文档告诉它应该做什么，但流程里没有阻断机制。", C.amber)}
        ${arrows([[358, 410, 450, 410], [750, 410, 842, 410]], C.rust)}

        ${rect(58, 614, 1084, 280, { r: 26, fill: "rgba(21,25,34,0.92)", stroke: "#2E3746", sw: 2 })}
        ${text(86, 654, "三个结构性断点", { size: 30, weight: 900, color: C.ink })}
        ${logicNode(86, 706, 318, 146, "状态不落盘", "进度只活在聊天上下文里，一中断就丢。", C.steel)}
        ${logicNode(442, 706, 318, 146, "中断不可恢复", "恢复靠猜，不靠确定的状态文件。", C.amber)}
        ${logicNode(798, 706, 318, 146, "无阻止机制", "没做前置也能继续往后写。", C.rust)}
      `
      ),
  },
  {
    file: "01_rules_chaos_breakpoints",
    svg: () =>
      logicFrame(
        920,
        "PART 01 · BREAKPOINTS",
        "三个结构性断点",
        "真正让规则在执行时失效的，不是文档数量不够，而是这三类断裂一直存在。",
        `
        ${rect(58, 270, 1084, 540, { r: 28, fill: "rgba(21,25,34,0.94)", stroke: "#394356", sw: 2.2 })}
        ${logicNode(94, 334, 316, 200, "状态不落盘", "执行进度只活在聊天上下文里。只要 compact、切会话、隔天继续，之前走到哪一步就容易丢。", C.steel)}
        ${logicNode(442, 334, 316, 200, "中断不可恢复", "恢复时只能重新读文档、重新猜进度。文档里没有“当前状态”，只有“应该怎么做”。", C.amber)}
        ${logicNode(790, 334, 316, 200, "无阻止机制", "文档能写“必须先做 A 再做 B”，但如果 Agent 直接做了 B，没有任何东西把它挡回去。", C.rust)}
        ${arrows([[252, 534, 252, 594], [600, 534, 600, 594], [948, 534, 948, 594]], C.rust)}
        ${rect(170, 620, 860, 126, { r: 24, fill: "rgba(17,22,30,0.96)", stroke: C.rust, sw: 2 })}
        ${text(200, 676, "共同结果", { size: 28, weight: 900, color: C.ink })}
        ${text(200, 724, "Agent 可以跳过前置、漏掉证据、带着空壳结果继续往前走，而且看起来像“已经完成了”。", {
          size: 27,
          weight: 760,
          color: C.inkSoft,
          width: 780,
          lineHeight: 38,
        })}
      `
      ),
  },
  {
    file: "02_where_it_breaks_layers",
    svg: () =>
      logicFrame(
        960,
        "PART 02 · ASSETS",
        "四层治理资产结构",
        "这四层已经把“让 Agent 知道该怎么做”覆盖得很完整，但还没有把“执行时必须这样做”真正落成门禁。",
        `
        ${rect(58, 278, 1084, 542, { r: 28, fill: "rgba(21,25,34,0.94)", stroke: "#394356", sw: 2.2 })}
        ${text(86, 330, "已有治理资产", { size: 30, weight: 900, color: C.ink })}

        ${logicNode(116, 386, 968, 92, "规则层", "红线、强制入口、阶段约束：先定义什么不能做，什么必须先做。", C.steel)}
        ${logicNode(116, 512, 968, 92, "路由层", "workflow catalog / 任务类型识别：先判断命中了哪条执行路线。", C.teal)}
        ${logicNode(116, 638, 968, 92, "流程层", "skills / checklist / 步骤模板：把任务拆成可跟随的标准动作序列。", C.amber)}
        ${logicNode(116, 764, 968, 92, "工具层", "正式脚本与受控入口：限定 Agent 只能通过哪些命令和工具落地。", C.olive)}

        ${arrows([[600, 478, 600, 512], [600, 604, 600, 638], [600, 730, 600, 764]], C.rust)}

        ${rect(146, 868, 908, 50, { r: 25, fill: "rgba(17,22,30,0.96)", stroke: C.rust, sw: 2 })}
        ${text(600, 900, "共同作用：解决“怎么说、怎么写、怎么走”，但还没解决“怎么拦”。", {
          size: 23,
          weight: 820,
          color: C.inkSoft,
          anchor: "middle",
          width: 820,
          lineHeight: 30,
        })}
      `
      ),
  },
  {
    file: "02_where_it_breaks_logic",
    svg: () =>
      logicFrame(
        1120,
        "PART 02 · BREAKPOINTS",
        "现有治理体系解决了什么，没解决什么",
        "问题不在“有没有规则”，而在“规则如何在执行时继续有效”。",
        `
        ${rect(58, 280, 1084, 212, { r: 26, fill: "rgba(21,25,34,0.92)", stroke: "#2E3746", sw: 2 })}
        ${text(86, 330, "四层已有资产", { size: 30, weight: 900, color: C.ink })}
        ${logicNode(86, 360, 232, 102, "规则层", "红线和入口", C.steel)}
        ${logicNode(344, 360, 232, 102, "路由层", "workflow 路由", C.teal)}
        ${logicNode(602, 360, 232, 102, "流程层", "skills 步骤", C.amber)}
        ${logicNode(860, 360, 232, 102, "工具层", "正式脚本入口", C.olive)}

        ${rect(58, 544, 1084, 500, { r: 26, fill: "rgba(21,25,34,0.92)", stroke: "#2E3746", sw: 2 })}
        ${text(86, 594, "四个执行断点", { size: 30, weight: 900, color: C.ink })}
        ${logicNode(86, 640, 470, 152, "状态不落盘", "进度只在对话里，一旦 compact 或中断，就只能重新猜。", C.steel)}
        ${logicNode(644, 640, 470, 152, "依赖关系无强制", "文档能写“必须先做 A 再做 B”，但做错顺序没人拦。", C.rust)}
        ${logicNode(86, 834, 470, 152, "中断后不可恢复", "没有当前状态快照，恢复时只能重新解释上下文。", C.amber)}
        ${logicNode(644, 834, 470, 152, "无阻止机制", "最致命：可以跳过任何步骤，却没有任何后果。", C.teal)}
      `
      ),
  },
  {
    file: "03_why_runner_logic",
    svg: () =>
      logicFrame(
        1080,
        "PART 03 · RUNNER",
        "Workflow Runner 的工作模式",
        "它不是平台，也不是替代判断的系统，只是把流程推进和门禁校验做实。",
        `
        ${logicNode(58, 304, 250, 156, "启动 run", "为一次任务建立本地状态目录。", C.steel)}
        ${logicNode(336, 304, 250, 156, "读 next", "明确当前该做哪一步。", C.teal)}
        ${logicNode(614, 304, 250, 156, "提交产物", "把当前步骤的文档或记录落盘。", C.amber)}
        ${logicNode(892, 304, 250, 156, "门禁校验", "检查依赖、结构和有效内容。", C.rust)}
        ${arrows([[308, 376, 336, 376], [586, 376, 614, 376], [864, 376, 892, 376]], C.rust)}

        ${logicNode(218, 610, 320, 178, "通过", "状态推进，进入下一步；若 target 已达成，可进入 render 或收尾。", C.green)}
        ${logicNode(662, 610, 320, 178, "不通过", "标记 blocked，Agent 必须补齐后重新 complete。", C.rust)}
        ${arrows([[1018, 448, 1018, 540], [1018, 540, 822, 592], [1018, 540, 378, 592]], C.steel)}

        ${rect(58, 856, 1084, 190, { r: 26, fill: "rgba(21,25,34,0.92)", stroke: "#2E3746", sw: 2 })}
        ${text(86, 886, "一句话职责边界", { size: 30, weight: 900, color: C.ink })}
        ${text(86, 942, "Runner 不替代 Agent 干活，也不替代人判断；它只负责让“没做完”这件事再也装不成“做完了”。", {
          size: 27,
          weight: 760,
          color: C.inkSoft,
          width: 1020,
          lineHeight: 38,
        })}
      `
      ),
  },
  {
    file: "03_why_runner_cost_compare",
    svg: () =>
      logicFrame(
        960,
        "PART 03 · COMPARISON",
        "平台方案 vs CLI Runner",
        "不是能力越多越好，而是谁能以最低成本把那道门真正装上。",
        `
        ${rect(58, 286, 512, 560, { r: 28, fill: "rgba(21,25,34,0.94)", stroke: C.rust, sw: 2.2 })}
        ${text(86, 344, "平台方案", { size: 34, weight: 920, color: C.ink })}
        ${text(86, 392, "高成本 / 高复杂度", { size: 24, weight: 780, color: C.rust })}
        ${logicNode(86, 438, 456, 118, "要维护服务端和前端", "多租户、权限、可视化面板、状态管理，问题空间立刻膨胀。", C.rust)}
        ${logicNode(86, 592, 456, 118, "解决的是更大的问题", "适合团队平台化，不适合先解决“Agent 会不会跳步骤”这个局部痛点。", C.amber)}
        ${logicNode(86, 746, 456, 72, "结果", "门可能还没装好，平台先变重了。", C.steel)}

        ${rect(630, 286, 512, 560, { r: 28, fill: "rgba(21,25,34,0.94)", stroke: C.green, sw: 2.2 })}
        ${text(658, 344, "CLI Runner", { size: 34, weight: 920, color: C.ink })}
        ${text(658, 392, "低成本 / 精准命中", { size: 24, weight: 780, color: C.green })}
        ${logicNode(658, 438, 456, 118, "本地脚本 + YAML + JSON", "不引入额外服务，直接贴着仓库和现有 skill 工作。", C.teal)}
        ${logicNode(658, 592, 456, 118, "只管一件事", "定义步骤、检查产物、没过就卡住，把门禁做实就够。", C.green)}
        ${logicNode(658, 746, 456, 72, "结果", "先把最关键的执行保障补上。", C.olive)}

        ${text(600, 910, "选择轻量方案，不是因为想得少，而是因为问题本身就应该被窄打。", {
          size: 24,
          weight: 800,
          color: C.inkSoft,
          anchor: "middle",
          width: 980,
          lineHeight: 34,
        })}
      `
      ),
  },
  {
    file: "04_how_it_works_logic",
    svg: () =>
      logicFrame(
        1240,
        "PART 04 · MECHANISM",
        "8 步流程怎么防跳步、怎么防乱套",
        "流程不是为了复杂，而是为了在关键位置把证据、前置和交付接起来。",
        `
        ${rect(58, 278, 1084, 344, { r: 26, fill: "rgba(21,25,34,0.94)", stroke: "#394356", sw: 2.2 })}
        ${text(86, 326, "固定序列", { size: 30, weight: 900, color: C.ink })}
        ${["输入资料","范围口径","环境前置","工具选型","实施指南","执行记录","最终报告","工程反思"].map((x,i)=>{
          const x0=86+(i%4)*258, y0=366+Math.floor(i/4)*116, colors=[C.steel,C.teal,C.amber,C.rust,C.steel,C.teal,C.amber,C.olive];
          return `${logicNode(x0,y0,230,96,`${i+1}. ${x}`,"",colors[i]).replace(/<text[^>]*>[\s\S]*?<\/text>/, `${text(x0+20,y0+54,`${i+1}. ${x}`,{size:20,weight:860,color:C.ink,width:190,lineHeight:28})}`)}`;
        }).join("")}

        ${rect(58, 688, 520, 500, { r: 26, fill: "rgba(21,25,34,0.92)", stroke: "#2E3746", sw: 2 })}
        ${text(86, 726, "防跳步", { size: 30, weight: 900, color: C.ink })}
        ${logicNode(86, 768, 464, 126, "依赖没满足，就进不了下一步", "环境前置没过，就别谈工具选型；执行记录没落盘，就别生成报告。", C.rust)}
        ${logicNode(86, 922, 464, 126, "标题存在不算完成", "只有文件、标题和有效内容都过关，才能标 completed。", C.amber)}
        ${logicNode(86, 1076, 464, 92, "空壳产物过不了门", "空章节、空表格、占位符数据都会被挡回去。", C.steel)}

        ${rect(622, 688, 520, 500, { r: 26, fill: "rgba(21,25,34,0.92)", stroke: "#2E3746", sw: 2 })}
        ${text(650, 726, "防中断乱套", { size: 30, weight: 900, color: C.ink })}
        ${logicNode(650, 768, 464, 126, "状态写进文件", "run.json 和 checklist.json 让进度不再只活在聊天上下文里。", C.teal)}
        ${logicNode(650, 922, 464, 126, "恢复靠 status / next", "不是猜“上次做到哪了”，而是直接读取当前状态。", C.olive)}
        ${logicNode(650, 1076, 464, 92, "blocked 就先补齐", "恢复后仍要重新过 complete，不允许直接假装完成。", C.steel)}
      `
      ),
  },
  {
    file: "04_how_it_works_command_flow",
    svg: () =>
      logicFrame(
        980,
        "PART 04 · COMMAND FLOW",
        "start → next → complete → validate",
        "命令序列本身很轻，但它把状态推进和门禁校验串成了一个确定流程。",
        `
        ${logicNode(58, 312, 232, 132, "start", "创建 run，拷贝 workflow 配置，初始化步骤状态。", C.steel)}
        ${logicNode(340, 312, 232, 132, "next", "告诉 Agent 当前该做哪一步，以及该补什么产物。", C.teal)}
        ${logicNode(622, 312, 232, 132, "complete", "提交当前步骤，触发依赖和内容校验。", C.amber)}
        ${logicNode(904, 312, 238, 132, "validate", "检查目标产物是否已达成，决定能否收尾。", C.olive)}
        ${arrows([[290, 378, 340, 378], [572, 378, 622, 378], [854, 378, 904, 378]], C.rust)}

        ${rect(58, 532, 1084, 330, { r: 26, fill: "rgba(21,25,34,0.92)", stroke: "#2E3746", sw: 2 })}
        ${logicNode(86, 588, 464, 108, "校验通过", "步骤标记 completed，状态推进；下一次 next 会返回新的当前步骤。", C.green)}
        ${logicNode(592, 588, 522, 108, "校验失败", "步骤标记 blocked，记录失败原因；Agent 必须回原文件补齐后重新 complete。", C.rust)}
        ${arrows([[850, 444, 850, 540], [850, 540, 826, 588]], C.rust)}
        ${arrows([[744, 696, 744, 794], [744, 794, 456, 794], [456, 794, 456, 700]], C.steel)}
        ${text(458, 760, "blocked 后回到 artifact 补内容，再次 complete", {
          size: 22,
          weight: 780,
          color: C.inkSoft,
          anchor: "middle",
          width: 430,
          lineHeight: 30,
        })}
      `
      ),
  },
  {
    file: "04_how_it_works_run_tree",
    svg: () =>
      logicFrame(
        980,
        "PART 04 · RUN STRUCTURE",
        "run 目录里实际落了什么",
        "不把进度藏在聊天里，而是把当前状态、步骤状态和产物文件全都放进一个可检查的目录。",
        `
        ${rect(100, 282, 1000, 600, { r: 28, fill: "rgba(16,20,27,0.95)", stroke: "#394356", sw: 2.2 })}
        ${text(140, 348, ".runs/test_execution-20260612-xxxxxx/", { size: 30, weight: 900, color: C.ink, family: "Menlo, Monaco, Consolas, monospace" })}
        ${text(164, 416, "run.json", { size: 26, weight: 860, color: C.teal, family: "Menlo, Monaco, Consolas, monospace" })}
        ${text(360, 416, "整体状态：workflow、target、current_step、status", { size: 23, color: C.inkSoft, width: 640, lineHeight: 30 })}
        ${text(164, 486, "checklist.json", { size: 26, weight: 860, color: C.amber, family: "Menlo, Monaco, Consolas, monospace" })}
        ${text(360, 486, "每步状态：pending / completed / blocked，以及原因", { size: 23, color: C.inkSoft, width: 640, lineHeight: 30 })}
        ${text(164, 556, "workflow.yaml", { size: 26, weight: 860, color: C.steel, family: "Menlo, Monaco, Consolas, monospace" })}
        ${text(360, 556, "本次 run 使用的配置副本，避免后续漂移", { size: 23, color: C.inkSoft, width: 640, lineHeight: 30 })}
        ${text(164, 626, "artifacts/", { size: 26, weight: 860, color: C.green, family: "Menlo, Monaco, Consolas, monospace" })}
        ${text(360, 626, "各步骤产出：输入资料、实施指南、执行记录、报告", { size: 23, color: C.inkSoft, width: 640, lineHeight: 30 })}
        ${text(164, 696, "logs/", { size: 26, weight: 860, color: C.rust, family: "Menlo, Monaco, Consolas, monospace" })}
        ${text(360, 696, "执行日志和校验日志，方便回放与排查", { size: 23, color: C.inkSoft, width: 640, lineHeight: 30 })}
        ${text(600, 816, "目录透明，状态透明，恢复路径也透明。", {
          size: 25,
          weight: 800,
          color: C.inkSoft,
          anchor: "middle",
          width: 760,
          lineHeight: 34,
        })}
      `
      ),
  },
  {
    file: "05_43_cases_logic",
    svg: () =>
      logicFrame(
        1080,
        "PART 05 · VALIDATION",
        "43 / 2 / 1：验证闭环",
        "不是没翻车，而是翻车后补上了，这才让方案从设计变成工程。",
        `
        ${rect(58, 286, 1084, 200, { r: 26, fill: "rgba(21,25,34,0.92)", stroke: "#2E3746", sw: 2 })}
        ${text(136, 410, "43", { size: 112, weight: 920, color: C.ink, family: "Georgia, serif" })}
        ${text(136, 456, "总用例", { size: 28, weight: 800, color: C.inkSoft })}
        ${text(494, 410, "2", { size: 112, weight: 920, color: C.rust, family: "Georgia, serif" })}
        ${text(494, 456, "失败点", { size: 28, weight: 800, color: C.inkSoft })}
        ${text(820, 410, "1", { size: 112, weight: 920, color: C.green, family: "Georgia, serif" })}
        ${text(820, 456, "次复测闭环", { size: 28, weight: 800, color: C.inkSoft })}

        ${logicNode(58, 568, 520, 194, "失败 01 · 同秒冲突", "run_id 只精确到秒，连续快速 start 同名需求时，第二次直接撞上第一次。", C.rust)}
        ${logicNode(622, 568, 520, 194, "失败 02 · 配置缺陷未拦住", "重复 step id 的 YAML 配置仍能创建 run，说明门禁前的元规则校验不够。", C.rust)}
        ${logicNode(58, 824, 1084, 198, "从红到绿", "加入微秒精度，补上重复 step id 唯一性校验。再跑一遍：两个失败点全部复测通过。可信度不来自 100% 全过，而来自“有失败、有修复、有复测”的闭环。", C.green)}
      `
      ),
  },
  {
    file: "05_43_cases_matrix",
    svg: () =>
      logicFrame(
        980,
        "PART 05 · COVERAGE",
        "43 条用例覆盖矩阵",
        "不是随手跑几个 happy path，而是按维度系统性找薄弱点。",
        `
        ${rect(58, 286, 1084, 566, { r: 26, fill: "rgba(21,25,34,0.94)", stroke: "#394356", sw: 2.2 })}
        ${text(86, 340, "覆盖维度", { size: 30, weight: 900, color: C.ink })}
        ${["命令基本行为","门禁校验","Target 模式","中断恢复与幂等","配置异常","非目标边界"].map((name, i) => {
          const y = 394 + i * 70;
          const counts = ["8 / 8","9 / 9","8 / 8","7 / 7","5 / 7","6 / 6"][i];
          const color = i === 4 ? C.rust : C.green;
          return `${rect(86, y - 34, 970, 50, { r: 16, fill: "rgba(255,255,255,0.03)", stroke: "#2E3746", sw: 1.4 })}
            ${text(112, y, name, { size: 24, weight: 820, color: C.ink })}
            ${text(856, y, counts, { size: 24, weight: 900, color, anchor: "middle" })}
            ${text(1016, y, i === 4 ? "2 个失败点暴露在这里" : "全部通过", { size: 21, weight: 760, color: C.inkSoft, anchor: "middle" })}`;
        }).join("")}
        ${rect(86, 760, 970, 60, { r: 18, fill: "rgba(17,22,30,0.96)", stroke: C.green, sw: 1.8 })}
        ${text(571, 800, "大面积为绿，说明主链路成立；两个红点集中在配置异常维度，说明问题出在边界加固。", {
          size: 23,
          weight: 780,
          color: C.inkSoft,
          anchor: "middle",
          width: 900,
          lineHeight: 30,
        })}
      `
      ),
  },
  {
    file: "05_43_cases_fix_compare",
    svg: () =>
      logicFrame(
        980,
        "PART 05 · FIXES",
        "修复前（红）→ 修复后（绿）",
        "两个失败点都不复杂，但都直接提升了 Runner 的工程可靠性。",
        `
        ${rect(58, 296, 512, 520, { r: 28, fill: "rgba(21,25,34,0.94)", stroke: C.rust, sw: 2.2 })}
        ${text(86, 354, "修复前", { size: 34, weight: 920, color: C.ink })}
        ${logicNode(86, 408, 456, 132, "同秒冲突", "run_id 只到秒级，连续 start 同名任务会撞目录。", C.rust)}
        ${logicNode(86, 578, 456, 132, "重复 step id 未校验", "坏配置也能 start 成功，门禁根基不稳。", C.amber)}
        ${logicNode(86, 748, 456, 60, "结果", "边界场景会让流程状态失真。", C.steel)}

        ${rect(630, 296, 512, 520, { r: 28, fill: "rgba(21,25,34,0.94)", stroke: C.green, sw: 2.2 })}
        ${text(658, 354, "修复后", { size: 34, weight: 920, color: C.ink })}
        ${logicNode(658, 408, 456, 132, "时间戳加微秒", "快速重复 start 仍然生成不同 run_id，不再撞目录。", C.green)}
        ${logicNode(658, 578, 456, 132, "配置加载做唯一性校验", "重复 step id 直接报错退出，问题留在 start 阶段暴露。", C.teal)}
        ${logicNode(658, 748, 456, 60, "结果", "失败点被纳入固定回归冒烟项。", C.olive)}
      `
      ),
  },
  {
    file: "06_traceable_delivery_logic",
    svg: () =>
      logicFrame(
        980,
        "PART 06 · VALUE",
        "不是更严，而是更可验证",
        "做完这一轮之后，真正留下来的不是工具名字，而是治理方向。",
        `
        ${logicNode(58, 310, 250, 220, "可追溯", "每次 run 都有独立目录、状态文件和产物文件。", C.steel)}
        ${logicNode(340, 310, 250, 220, "可恢复", "中断之后不靠记忆，直接从状态继续。", C.teal)}
        ${logicNode(622, 310, 250, 220, "可阻断", "关键前置不满足，流程真的走不下去。", C.rust)}
        ${logicNode(904, 310, 238, 220, "可沉淀", "每次反思都把规则、工具和流程往前推一点。", C.olive)}
        ${rect(58, 620, 1084, 220, { r: 26, fill: "rgba(21,25,34,0.92)", stroke: "#2E3746", sw: 2 })}
        ${text(86, 688, "根本问题", { size: 30, weight: 900, color: C.ink })}
        ${text(86, 750, "Agent 时代的核心矛盾，不是它会不会写，而是团队能不能验证它交付了什么。Workflow Runner 解决的不是全部问题，但它把测试实施这一个切片从黑箱拉成了白箱。", {
          size: 27,
          weight: 760,
          color: C.inkSoft,
          width: 1020,
          lineHeight: 38,
        })}
      `
      ),
  },
  {
    file: "06_traceable_delivery_summary_card",
    svg: () =>
      logicFrame(
        760,
        "PART 06 · SUMMARY",
        "真正的问题不是 Agent 会不会写",
        "而是团队能不能验证它交付了什么",
        `
        ${rect(120, 246, 960, 356, { r: 32, fill: "rgba(17,22,30,0.96)", stroke: C.olive, sw: 2.4 })}
        ${text(600, 346, "真正的问题不是 Agent 会不会写，", {
          size: 42,
          weight: 920,
          color: C.ink,
          anchor: "middle",
          width: 800,
          lineHeight: 56,
          family: "PingFang SC, STSong, Songti SC, serif",
        })}
        ${text(600, 426, "而是团队能不能验证它交付了什么。", {
          size: 42,
          weight: 920,
          color: "#E8D8B7",
          anchor: "middle",
          width: 820,
          lineHeight: 56,
          family: "PingFang SC, STSong, Songti SC, serif",
        })}
        ${text(600, 516, "Workflow Runner 的价值，不在把 Agent 管死，而在把执行过程从黑箱变成可检查、可恢复、可追溯的白箱。", {
          size: 24,
          weight: 760,
          color: C.inkSoft,
          anchor: "middle",
          width: 760,
          lineHeight: 34,
        })}
      `
      ),
  },
];

async function writeAsset(svgPath, pngPath, svg) {
  fs.writeFileSync(svgPath, svg, "utf8");
  await sharp(Buffer.from(svg)).png().toFile(pngPath);
}

async function main() {
  for (const item of covers) {
    const header = headerSvg(item);
    const card = cardSvg({
      index: item.index,
      title: item.title1,
      subtitle: item.title2,
      accent: item.accent,
      accent2: item.accent2,
      tag: item.tag,
    });
    await writeAsset(
      path.join(dirs.headerSvg, `${item.file}_cover.svg`),
      path.join(dirs.headerPng, `${item.file}_cover.png`),
      header
    );
    await writeAsset(
      path.join(dirs.cardSvg, `${item.file}_cover_card.svg`),
      path.join(dirs.cardPng, `${item.file}_cover_card.png`),
      card
    );
  }

  for (const item of diagrams) {
    const svg = item.svg();
    await writeAsset(
      path.join(dirs.logicSvg, `${item.file}.svg`),
      path.join(dirs.logicPng, `${item.file}.png`),
      svg
    );
  }

  console.log("rendered assets:");
  Object.entries(dirs).forEach(([key, value]) => {
    console.log(`${key}: ${value}`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
