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
const coverDir = path.join(root, "covers");
fs.mkdirSync(coverDir, { recursive: true });

const width = 1200;
const height = 511;

function escapeXml(value) {
  return String(value).replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
}

function text(x, y, content, opts = {}) {
  const family = "PingFang SC, Hiragino Sans GB, Microsoft YaHei, Arial, sans-serif";
  const size = opts.size || 40;
  const color = opts.color || "#edf5ff";
  const weight = opts.weight || 700;
  const anchor = opts.anchor || "start";
  const lines = String(content).split("\n");
  const lineHeight = opts.lineHeight || Math.round(size * 1.25);
  return `<text x="${x}" y="${y}" fill="${color}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}" font-family="${family}">${lines
    .map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`)
    .join("")}</text>`;
}

function cover({ id, label, title, subtitle, hook, badge, accent = "#19d3f3", secondary = "#f4b95a" }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#07111f"/>
      <stop offset="0.52" stop-color="#0b1728"/>
      <stop offset="1" stop-color="#111111"/>
    </linearGradient>
    <radialGradient id="accentGlow" cx="18%" cy="22%" r="55%">
      <stop offset="0" stop-color="${accent}" stop-opacity="0.32"/>
      <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="secondGlow" cx="82%" cy="18%" r="48%">
      <stop offset="0" stop-color="${secondary}" stop-opacity="0.18"/>
      <stop offset="1" stop-color="${secondary}" stop-opacity="0"/>
    </radialGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#000000" flood-opacity="0.38"/>
    </filter>
  </defs>

  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  <rect width="${width}" height="${height}" fill="url(#accentGlow)"/>
  <rect width="${width}" height="${height}" fill="url(#secondGlow)"/>

  <g opacity="0.18">
    ${Array.from({ length: 31 }, (_, i) => `<line x1="${i * 42}" y1="0" x2="${i * 42}" y2="${height}" stroke="#8fb0dc" stroke-width="0.7"/>`).join("")}
    ${Array.from({ length: 14 }, (_, i) => `<line x1="0" y1="${i * 42}" x2="${width}" y2="${i * 42}" stroke="#8fb0dc" stroke-width="0.7"/>`).join("")}
  </g>

  <g opacity="0.9">
    <path d="M 755 96 L 1058 96 Q 1088 96 1098 124 L 1140 246 Q 1150 276 1124 294 L 904 446 Q 880 462 852 452 L 702 396" fill="none" stroke="${accent}" stroke-width="2.2" opacity="0.38"/>
    <path d="M 794 132 L 1028 132 Q 1052 132 1061 154 L 1092 242 Q 1100 264 1080 278 L 908 398 Q 888 412 866 404 L 742 360" fill="none" stroke="${secondary}" stroke-width="1.6" opacity="0.32"/>
    <circle cx="765" cy="96" r="5" fill="${accent}"/>
    <circle cx="1058" cy="96" r="5" fill="${accent}"/>
    <circle cx="1092" cy="242" r="5" fill="${secondary}"/>
    <circle cx="904" cy="446" r="5" fill="${accent}"/>
  </g>

  <g filter="url(#shadow)">
    <rect x="70" y="62" width="1060" height="388" rx="28" fill="#0b1627" opacity="0.78" stroke="#294260" stroke-width="1.4"/>
    <rect x="70" y="62" width="7" height="388" rx="3.5" fill="${accent}"/>
  </g>

  <g>
    <rect x="112" y="104" width="62" height="5" rx="2.5" fill="${accent}"/>
    ${text(190, 115, `让 AI Agent 真正交付测试结果 · 连载第 ${label} 篇`, { size: 25, weight: 800, color: accent })}

    ${text(112, 220, title, { size: 62, weight: 900, color: "#f2f8ff", lineHeight: 72 })}
    ${text(112, 294, subtitle, { size: 46, weight: 850, color: "#f2f8ff", lineHeight: 58 })}

    <rect x="112" y="336" width="610" height="52" rx="16" fill="#12243a" stroke="${accent}" stroke-width="1.2" opacity="0.92"/>
    ${text(138, 370, hook, { size: 24, weight: 750, color: "#cfe5f8" })}

    <g transform="translate(865 326)">
      <rect x="0" y="0" width="192" height="58" rx="18" fill="#101d31" stroke="${secondary}" stroke-width="1.2"/>
      ${text(96, 37, badge, { size: 22, weight: 900, color: secondary, anchor: "middle" })}
    </g>
  </g>
</svg>`;
}

const covers = [
  {
    id: "01",
    label: "1",
    title: "会写用例 ≠ 能交付测试",
    subtitle: "AI Agent 测试的真实困境",
    hook: "从用例生成到测试交付，中间隔着一整套工程约束",
    badge: "PROBLEM 01",
    accent: "#19d3f3",
    secondary: "#f4b95a",
  },
  {
    id: "02",
    label: "2",
    title: "六层约束模型",
    subtitle: "把随机应答拉回工程轨道",
    hook: "路由、需求、实施、证据、判断、交付，逐层收敛不确定性",
    badge: "MODEL 02",
    accent: "#37d399",
    secondary: "#19d3f3",
  },
  {
    id: "03",
    label: "3",
    title: "从文档规则到可执行门禁",
    subtitle: "Test Agent Workflow Runner",
    hook: "把“应该做”升级为“必须做”，让流程无法带着空壳继续推进",
    badge: "RUNNER 03",
    accent: "#19d3f3",
    secondary: "#b78cff",
  },
  {
    id: "04",
    label: "4",
    title: "实战验证",
    subtitle: "两个真实案例的完整闭环",
    hook: "一个复杂业务功能，一个 Runner 自测，验证方法论的纠偏能力",
    badge: "CASE 04",
    accent: "#f4b95a",
    secondary: "#37d399",
  },
  {
    id: "05",
    label: "5",
    title: "人机边界与未来",
    subtitle: "Agent 测试工程的演进方向",
    hook: "流程越成熟，Agent 自主范围越大；关键口径仍由人确认",
    badge: "FUTURE 05",
    accent: "#b78cff",
    secondary: "#19d3f3",
  },
];

async function main() {
  for (const item of covers) {
    const svg = cover(item);
    const svgPath = path.join(coverDir, `${item.id}_wechat_cover.svg`);
    const pngPath = path.join(coverDir, `${item.id}_wechat_cover.png`);
    fs.writeFileSync(svgPath, svg, "utf8");
    await sharp(Buffer.from(svg)).png().toFile(pngPath);
    const kb = Math.round(fs.statSync(pngPath).size / 1024);
    console.log(`${path.basename(pngPath)} ${kb} KB`);
  }
  console.log(`output: ${coverDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
