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

function text(x, y, content, opts = {}) {
  const family = "PingFang SC, Hiragino Sans GB, Microsoft YaHei, Arial, sans-serif";
  const size = opts.size || 40;
  const color = opts.color || "#edf5ff";
  const weight = opts.weight || 700;
  const anchor = opts.anchor || "start";
  const lines = String(content).split("\n");
  const lineHeight = opts.lineHeight || Math.round(size * 1.25);
  return `<text x="${x}" y="${y}" fill="${color}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}" font-family="${family}">${lines
    .map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${line}</tspan>`)
    .join("")}</text>`;
}

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#07111f"/>
      <stop offset="0.52" stop-color="#0b1728"/>
      <stop offset="1" stop-color="#111111"/>
    </linearGradient>
    <radialGradient id="cyanGlow" cx="18%" cy="22%" r="55%">
      <stop offset="0" stop-color="#19d3f3" stop-opacity="0.32"/>
      <stop offset="1" stop-color="#19d3f3" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="amberGlow" cx="82%" cy="18%" r="48%">
      <stop offset="0" stop-color="#f4b95a" stop-opacity="0.18"/>
      <stop offset="1" stop-color="#f4b95a" stop-opacity="0"/>
    </radialGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#000000" flood-opacity="0.38"/>
    </filter>
  </defs>

  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  <rect width="${width}" height="${height}" fill="url(#cyanGlow)"/>
  <rect width="${width}" height="${height}" fill="url(#amberGlow)"/>

  <g opacity="0.18">
    ${Array.from({ length: 31 }, (_, i) => `<line x1="${i * 42}" y1="0" x2="${i * 42}" y2="${height}" stroke="#8fb0dc" stroke-width="0.7"/>`).join("")}
    ${Array.from({ length: 14 }, (_, i) => `<line x1="0" y1="${i * 42}" x2="${width}" y2="${i * 42}" stroke="#8fb0dc" stroke-width="0.7"/>`).join("")}
  </g>

  <g opacity="0.9">
    <path d="M 755 96 L 1058 96 Q 1088 96 1098 124 L 1140 246 Q 1150 276 1124 294 L 904 446 Q 880 462 852 452 L 702 396" fill="none" stroke="#19d3f3" stroke-width="2.2" opacity="0.38"/>
    <path d="M 794 132 L 1028 132 Q 1052 132 1061 154 L 1092 242 Q 1100 264 1080 278 L 908 398 Q 888 412 866 404 L 742 360" fill="none" stroke="#f4b95a" stroke-width="1.6" opacity="0.32"/>
    <circle cx="765" cy="96" r="5" fill="#19d3f3"/>
    <circle cx="1058" cy="96" r="5" fill="#19d3f3"/>
    <circle cx="1092" cy="242" r="5" fill="#f4b95a"/>
    <circle cx="904" cy="446" r="5" fill="#19d3f3"/>
  </g>

  <g filter="url(#shadow)">
    <rect x="70" y="62" width="1060" height="388" rx="28" fill="#0b1627" opacity="0.78" stroke="#294260" stroke-width="1.4"/>
    <rect x="70" y="62" width="7" height="388" rx="3.5" fill="#19d3f3"/>
  </g>

  <g>
    <rect x="112" y="104" width="62" height="5" rx="2.5" fill="#19d3f3"/>
    ${text(190, 115, "让 AI Agent 真正交付测试结果 · 连载第 1 篇", { size: 25, weight: 800, color: "#19d3f3" })}

    ${text(112, 220, "会写用例 ≠ 能交付测试", { size: 66, weight: 900, color: "#f2f8ff" })}
    ${text(112, 294, "AI Agent 测试的真实困境", { size: 48, weight: 850, color: "#f2f8ff" })}

    <rect x="112" y="336" width="530" height="52" rx="16" fill="#12243a" stroke="#19d3f3" stroke-width="1.2" opacity="0.92"/>
    ${text(138, 370, "从用例生成到测试交付，中间隔着一整套工程约束", { size: 24, weight: 750, color: "#cfe5f8" })}

    <g transform="translate(865 326)">
      <rect x="0" y="0" width="192" height="58" rx="18" fill="#101d31" stroke="#f4b95a" stroke-width="1.2"/>
      ${text(96, 37, "PROBLEM 01", { size: 22, weight: 900, color: "#f4b95a", anchor: "middle" })}
    </g>
  </g>
</svg>`;

async function main() {
  const svgPath = path.join(coverDir, "01_wechat_cover.svg");
  const pngPath = path.join(coverDir, "01_wechat_cover.png");
  fs.writeFileSync(svgPath, svg, "utf8");
  await sharp(Buffer.from(svg)).png().toFile(pngPath);
  console.log(`svg: ${svgPath}`);
  console.log(`png: ${pngPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
