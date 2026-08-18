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
const premiumDir = path.join(root, "premium");
const outputDir = path.join(root, "output_premium");
fs.mkdirSync(premiumDir, { recursive: true });
fs.mkdirSync(outputDir, { recursive: true });

const C = {
  bg: "#07111f",
  panel: "#101d31",
  panel2: "#0b1627",
  line: "#294260",
  text: "#edf5ff",
  muted: "#a8bbd2",
  cyan: "#19d3f3",
  blue: "#4f86ff",
  green: "#37d399",
  amber: "#f4b95a",
  red: "#ff6b7a",
  violet: "#b78cff",
};

function esc(s) {
  return String(s).replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
}

function wrapText(text, maxChars) {
  const raw = String(text).split("\n");
  const out = [];
  for (const part of raw) {
    let line = "";
    for (const ch of part) {
      const weight = /[A-Za-z0-9_./-]/.test(ch) ? 0.55 : 1;
      const lineWeight = [...line].reduce((n, c) => n + (/[A-Za-z0-9_./-]/.test(c) ? 0.55 : 1), 0);
      if (line && lineWeight + weight > maxChars) {
        out.push(line);
        line = ch;
      } else {
        line += ch;
      }
    }
    if (line) out.push(line);
  }
  return out;
}

function text(x, y, content, opts = {}) {
  const size = opts.size || 22;
  const color = opts.color || C.text;
  const weight = opts.weight || 500;
  const anchor = opts.anchor || "start";
  const family = "PingFang SC, Hiragino Sans GB, Microsoft YaHei, Arial, sans-serif";
  const lines = opts.width ? wrapText(content, opts.width) : String(content).split("\n");
  const lh = opts.lineHeight || Math.round(size * 1.45);
  return `<text x="${x}" y="${y}" fill="${color}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}" font-family="${family}">${lines
    .map((line, i) => `<tspan x="${x}" dy="${i === 0 ? 0 : lh}">${esc(line)}</tspan>`)
    .join("")}</text>`;
}

function rect(x, y, w, h, opts = {}) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${opts.r || 20}" fill="${opts.fill || C.panel}" stroke="${opts.stroke || C.line}" stroke-width="${opts.sw || 1.4}" opacity="${opts.opacity || 1}"/>`;
}

function line(x1, y1, x2, y2, color = C.cyan, width = 3, dash = "") {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" stroke-linecap="round" ${dash ? `stroke-dasharray="${dash}"` : ""}/>`;
}

function pill(x, y, label, color = C.cyan) {
  return `<rect x="${x}" y="${y}" width="${label.length * 12 + 34}" height="34" rx="17" fill="${color}" opacity="0.14" stroke="${color}" stroke-width="1.2"/>${text(x + 17, y + 23, label, { size: 15, weight: 800, color })}`;
}

function node(x, y, w, h, num, title, body, color = C.cyan) {
  return [
    rect(x, y, w, h, { fill: C.panel2, stroke: color, opacity: 0.96 }),
    `<rect x="${x + 22}" y="${y + 20}" width="44" height="44" rx="14" fill="${color}" opacity="0.18"/>`,
    text(x + 44, y + 50, num, { size: 18, weight: 900, color, anchor: "middle" }),
    text(x + 22, y + 92, title, { size: 25, weight: 850, color: C.text, width: Math.floor(w / 25) }),
    text(x + 22, y + 132, body, { size: 18, color: C.muted, width: Math.floor(w / 18), lineHeight: 27 }),
  ].join("");
}

function metric(x, y, w, h, big, small, color = C.cyan) {
  return [
    rect(x, y, w, h, { fill: "#0d1a2d", stroke: "#263d59", r: 16 }),
    text(x + 18, y + 40, big, { size: 32, weight: 900, color, width: Math.floor((w - 36) / 18) }),
    text(x + 18, y + 74, small, { size: 16, color: C.muted, width: Math.floor((w - 36) / 10), lineHeight: 23 }),
  ].join("");
}

function frame(height, kicker, title, subtitle, stamp, content) {
  const grid = [];
  for (let x = 0; x <= 1200; x += 42) grid.push(line(x, 0, x, height, "#8fb0dc", 0.55, "", "0.08"));
  for (let y = 0; y <= height; y += 42) grid.push(line(0, y, 1200, y, "#8fb0dc", 0.55, "", "0.08"));
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="${height}" viewBox="0 0 1200 ${height}">
  <defs>
    <radialGradient id="g1" cx="18%" cy="9%" r="45%"><stop offset="0" stop-color="#19d3f3" stop-opacity=".22"/><stop offset="1" stop-color="#19d3f3" stop-opacity="0"/></radialGradient>
    <radialGradient id="g2" cx="86%" cy="16%" r="38%"><stop offset="0" stop-color="#f4b95a" stop-opacity=".16"/><stop offset="1" stop-color="#f4b95a" stop-opacity="0"/></radialGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#000" flood-opacity=".38"/></filter>
  </defs>
  <rect width="1200" height="${height}" fill="${C.bg}"/>
  <rect width="1200" height="${height}" fill="url(#g1)"/>
  <rect width="1200" height="${height}" fill="url(#g2)"/>
  <g opacity=".22">${grid.join("")}</g>
  <g>
    <rect x="58" y="61" width="52" height="4" rx="2" fill="${C.cyan}"/>
    ${text(124, 70, kicker, { size: 21, weight: 850, color: C.cyan })}
    ${text(58, 132, title, { size: 52, weight: 900, color: C.text, width: 21, lineHeight: 66 })}
    ${text(58, 206, subtitle, { size: 23, color: "#bdd0e6", width: 42, lineHeight: 35 })}
    ${rect(960, 58, 182, 86, { fill: "#091624", stroke: C.cyan, r: 20, opacity: 0.88 })}
    ${text(1051, 96, stamp[0], { size: 30, weight: 900, color: C.cyan, anchor: "middle" })}
    ${text(1051, 124, stamp[1], { size: 16, color: C.muted, anchor: "middle" })}
  </g>
  <g filter="url(#shadow)">${content}</g>
</svg>`;
}

function arrow(x, y, w = 58) {
  return `${line(x, y, x + w, y, C.cyan, 4)}<path d="M ${x + w - 14} ${y - 9} L ${x + w} ${y} L ${x + w - 14} ${y + 9}" fill="none" stroke="${C.cyan}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
}

const diagrams = [
  {
    file: "01_delivery_gap",
    height: 1400,
    svg: () => frame(1400, "PART 01 · PROBLEM DEFINITION", "会写用例，不等于能交付测试", "Agent 能快速生成 case，但真实交付还需要环境、工具、断言、证据、判断和报告链路。", ["9", "工程断点"], `
      ${rect(58, 300, 1084, 430, { fill: "#0d1a2d", stroke: "#2f4c6e" })}
      ${text(86, 348, "测试交付链路中的能力断层", { size: 28, weight: 900 })}
      ${pill(860, 320, "从答案到结果", C.amber)}
      ${node(86, 386, 250, 250, "A", "Agent 擅长区", "需求理解、结构化总结、用例生成、格式化输出。", C.cyan)}
      ${arrow(352, 508)}
      ${node(426, 386, 330, 250, "B", "工程断层区", "环境前提、工具选择、断言口径、证据归因、异常解释、报告可信度。", C.red)}
      ${arrow(774, 508)}
      ${node(848, 386, 250, 250, "C", "真实测试交付", "执行记录、覆盖矩阵、可复核证据、可交接报告。", C.green)}
      ${[
        ["01","任务入口不稳","走错流程，后续动作全偏"],["02","需求基线不稳","预期错误，覆盖失真"],["03","环境前置缺失","结果无法证明目标功能"],
        ["04","工具选型缺失","输入不可控，证据不可归因"],["05","断言缺失","执行了也无法判断"],["06","证据链不闭合","单层日志支撑不了结论"],
        ["07","异常识别不足","隐蔽问题被漏掉"],["08","执行记录缺失","测试留在聊天窗口"],["09","报告失真","推断被包装成结论"]
      ].map(([n,t,b],i)=>{
        const x=58+(i%3)*368, y=770+Math.floor(i/3)*160, c=i<6?C.amber:C.red;
        return `${rect(x,y,340,128,{fill:"#0b1627",stroke:c,r:18})}
          <rect x="${x+22}" y="${y+20}" width="48" height="42" rx="14" fill="${c}" opacity=".18"/>
          ${text(x+46,y+48,n,{size:17,weight:900,color:c,anchor:"middle"})}
          ${text(x+22,y+88,t,{size:26,weight:850,color:C.text,width:11})}
          ${text(x+22,y+116,b,{size:17,color:C.muted,width:15})}`;
      }).join("")}
      ${rect(58, 1284, 1084, 74, { fill: "#0c2534", stroke: C.cyan, r: 18 })}
      ${text(86, 1330, "核心判断：Agent 测试的挑战不是一次回答有多聪明，而是能否在可控工程过程中持续收敛。", { size: 24, weight: 750, color: "#dff8ff", width: 45 })}
    `),
  },
  {
    file: "02_six_layer_model",
    height: 1650,
    svg: () => frame(1650, "PART 02 · CONTROL MODEL", "六层约束：把随机应答拉回工程轨道", "每一层约束一类不确定性，层与层之间形成输入、输出、校验和沉淀的闭环。", ["6", "约束层"], `
      ${rect(58, 300, 1084, 1160, { fill: "#0d1a2d", stroke: "#2f4c6e" })}
      ${text(86, 350, "测试工程控制塔", { size: 30, weight: 900 })}
      ${pill(818, 322, "路由 → 需求 → 实施 → 证据 → 判断 → 交付", C.cyan)}
      ${[
        ["01","任务路由","先选对 workflow，再谈执行","用户请求 → 流程目录 → 主/子流程",C.cyan],
        ["02","需求与用例","先对齐基线，再生成 case","信息源 → 需求分析 → 覆盖清单 → 用例",C.green],
        ["03","测试实施设计","从 case 变成可执行 runbook","环境前置 → 工具选型 → Runbook",C.amber],
        ["04","执行证据","记录实际发生了什么","Case 状态 → 标识 → 断言 → 证据",C.violet],
        ["05","判断基线","区分正常、异常和未知","业务字典/缺陷库 → 三分法",C.red],
        ["06","交付与沉淀","把结果变成可交接资产","记录 → 矩阵 → 报告 → 反思",C.cyan],
      ].map(([n,t,d,f,c],i)=>{
        const y=390+i*166;
        return `${rect(86,y,1028,132,{fill:"#0b1627",stroke:c,r:18})}
          <rect x="112" y="${y+31}" width="70" height="70" rx="20" fill="${c}" opacity=".18"/>
          ${text(147,y+75,n,{size:27,weight:900,color:c,anchor:"middle"})}
          ${text(210,y+53,t,{size:27,weight:900,color:C.text})}
          ${text(210,y+88,d,{size:18,color:C.muted,width:21})}
          ${rect(680,y+24,402,82,{fill:"#0d1a2d",stroke:"#263d59",r:16})}
          ${text(702,y+59,f,{size:22,weight:850,color:c,width:14,lineHeight:30})}
          ${i<5?arrow(600,y+142,0).replace(`x2="600"`, `x2="600"`).replace(`y2="${y+142}"`, `y2="${y+156}"`):""}`;
      }).join("")}
      ${rect(58, 1504, 1084, 74, { fill: "#0c2534", stroke: C.cyan, r: 18 })}
      ${text(86, 1550, "缺一层，就留下一类断裂：入口、需求、实施、事实、判断、交付。", { size: 25, weight: 800, color: "#dff8ff", width: 42 })}
    `),
  },
  {
    file: "02_asset_mapping",
    height: 1380,
    svg: () => frame(1380, "PART 02 · ENGINEERING ASSETS", "六类工程资产承载六层约束", "方法论不是口号，必须落到可维护的规则、流程、步骤、字典、模板和记录。", ["6", "资产类型"], `
      ${[
        ["01","rules","红线","禁止动作、授权边界、不可越过的工程约束","不能替代流程",C.red],
        ["02","workflows","路由","用户请求映射到主流程、子流程和必读材料","不能替代步骤",C.cyan],
        ["03","skills","步骤","具体执行方法、证据层、脚本入口和输出要求","不能替代判断",C.green],
        ["04","dictionaries","基线","正常、异常、未知的判定口径和历史反例","不能替代事实",C.amber],
        ["05","templates","结构","报告、记录、矩阵和反思的交付格式","不能替代内容",C.violet],
        ["06","records","事实","执行痕迹、日志路径、case 状态和证据索引","不能替代结论",C.blue],
      ].map(([n,k,t,d,w,c],i)=>{
        const x=58+(i%3)*368, y=310+Math.floor(i/3)*380;
        return `${rect(x,y,340,330,{fill:"#0d1a2d",stroke:c,r:22})}
          ${text(x+24,y+46,`${n} · ${t}`,{size:25,weight:900,color:C.text})}
          ${pill(x+220,y+22,k,c)}
          ${text(x+24,y+112,d,{size:29,weight:850,color:c,width:10,lineHeight:42})}
          ${line(x+24,y+226,x+316,y+226,c,2)}
          ${text(x+24,y+268,`边界：${w}`,{size:21,color:C.muted,width:13,lineHeight:31})}`;
      }).join("")}
      ${rect(58, 1116, 1084, 118, { fill: "#0c2534", stroke: C.cyan, r: 18 })}
      ${text(86, 1160, "一句话：rules 放红线，workflows 放路由，skills 放步骤，dictionaries 放判断基线，templates 放结构，records 放事实。", { size: 27, weight: 830, color: "#dff8ff", width: 38, lineHeight: 40 })}
    `),
  },
  {
    file: "03_runner_architecture",
    height: 1320,
    svg: () => frame(1320, "PART 03 · EXECUTABLE GUARDRAILS", "Test Agent Workflow Runner", "把“应该做”升级为“必须做”：状态持久化、目标裁剪、门禁校验和中断恢复。", ["CLI", "可执行门禁"], `
      ${rect(58,300,1084,500,{fill:"#0d1a2d",stroke:"#2f4c6e"})}
      ${text(86,350,"Runner 三层架构",{size:30,weight:900})}
      ${node(86,400,280,260,"01","交互接口层","start / status / next / complete / validate / render",C.cyan)}
      ${arrow(388,530)}
      ${node(460,400,300,260,"02","核心逻辑层","配置解析、状态管理、目标模式、门禁校验、中断恢复。",C.amber)}
      ${arrow(784,530)}
      ${node(856,400,260,260,"03","本地存储层","运行状态、步骤清单、产物文件、流程配置。",C.green)}
      ${[
        ["指南模式","步骤 1~5"],["记录模式","步骤 1~6"],["报告模式","步骤 1~7"],["完整模式","全部 8 步"]
      ].map(([a,b],i)=>metric(58+i*276,850,246,118,a,b,[C.cyan,C.green,C.amber,C.violet][i])).join("")}
      ${rect(58,1032,1084,118,{fill:"#0c2534",stroke:C.cyan,r:18})}
      ${text(86,1082,"Runner 不替代 Agent 执行测试，它只保证 Agent 不靠记忆、不凭感觉、不带空壳产物继续推进。",{size:25,weight:800,color:"#dff8ff",width:40,lineHeight:36})}
    `),
  },
  {
    file: "03_gate_check",
    height: 1320,
    svg: () => frame(1320, "PART 03 · GATE SYSTEM", "门禁校验三层防线", "当 Agent 说“完成了”，Runner 只相信文件、依赖和内容检查结果。", ["3", "防线"], `
      ${[
        ["01","依赖校验","前置步骤必须完成","依赖未满足",C.cyan],
        ["02","存在性校验","目标产物必须存在","产物不存在",C.amber],
        ["03","内容校验","标题、表格、有效数据必须合格","内容未合格",C.red],
      ].map(([n,t,d,e,c],i)=>{
        const x=58+i*374;
        return `${node(x,320,330,420,n,t,d,c)}${metric(x+28,590,274,100,e,"校验失败即阻塞推进",c)}${i<2?arrow(x+346,520,38):""}`;
      }).join("")}
      ${rect(58,800,1084,340,{fill:"#0d1a2d",stroke:"#2f4c6e"})}
      ${text(86,850,"真实拦截样例",{size:30,weight:900})}
      ${["缺失标题","标题无内容","表格全占位符","依赖未满足","产物文件不存在","目标未达成"].map((x,i)=>{
        const px=86+(i%3)*344, py=890+Math.floor(i/3)*118, c=i<3?C.amber:C.red;
        return `${rect(px,py,316,92,{fill:"#0b1627",stroke:c,r:16})}
          <rect x="${px+22}" y="${py+18}" width="44" height="44" rx="14" fill="${c}" opacity=".18"/>
          ${text(px+44,py+46,String(i+1),{size:17,weight:900,color:c,anchor:"middle"})}
          ${text(px+86,py+42,x,{size:23,weight:850,color:C.text,width:9})}
          ${text(px+86,py+72,"Agent 必须回去补齐。",{size:16,color:C.muted,width:13})}`;
      }).join("")}
    `),
  },
  {
    file: "04_correction_flow",
    height: 1560,
    svg: () => frame(1560, "PART 04 · CASE STUDY", "真实案例中的 Agent 纠偏闭环", "fake-clock 功能测试证明：可靠性不是一次性正确，而是被分层约束持续拉回正轨。", ["18", "case 覆盖"], `
      ${rect(58,300,1084,410,{fill:"#0d1a2d",stroke:"#2f4c6e"})}
      ${text(86,350,"从初期偏差到可交付结果",{size:30,weight:900})}
      ${node(86,395,290,210,"A","初期偏差","忽略二进制和 env，倾向观察背景流量，算法单预期理解偏差。",C.red)}
      ${arrow(398,500)}
      ${node(470,395,290,210,"B","方法论介入","对齐需求、区分理论输入与可执行输入、先做环境和工具选型。",C.amber)}
      ${arrow(784,500)}
      ${node(856,395,260,210,"C","结果闭环","每个 case 留下标识、断言、状态迁移和证据路径。",C.green)}
      ${rect(58,760,520,500,{fill:"#0d1a2d",stroke:C.cyan})}
      ${text(86,812,"环境前置不是附属动作",{size:29,weight:900})}
      ${["特定 fake-clock 二进制","启动时 env 注入","通过 guard start_cmd 生效","重启 guard 并验证 PID 变化","确认普通构建不受影响"].map((x,i)=>`
        ${rect(86,850+i*76,464,58,{fill:"#0b1627",stroke:C.cyan,r:16})}
        <rect x="108" y="${864+i*76}" width="42" height="42" rx="13" fill="${C.cyan}" opacity=".18"/>
        ${text(129,891+i*76,String(i+1),{size:17,weight:900,color:C.cyan,anchor:"middle"})}
        ${text(170,887+i*76,x,{size:22,weight:800,color:C.text,width:15})}
      `).join("")}
      ${rect(622,760,520,500,{fill:"#0d1a2d",stroke:C.green})}
      ${text(650,812,"执行结果",{size:29,weight:900})}
      ${metric(650,860,220,120,"12","通过",C.green)}
      ${metric(894,860,220,120,"1","部分覆盖",C.amber)}
      ${metric(650,1008,220,120,"1","需复测",C.cyan)}
      ${metric(894,1008,220,120,"4","本轮不执行",C.violet)}
      ${rect(650,1160,464,86,{fill:"#0b1627",stroke:C.amber,r:18})}
      <rect x="674" y="1182" width="42" height="42" rx="13" fill="${C.amber}" opacity=".18"/>
      ${text(695,1209,"修",{size:17,weight:900,color:C.amber,anchor:"middle"})}
      ${text(736,1195,"关键修正：算法单需要按过期撤单闭环重新判断。",{size:22,weight:820,color:C.text,width:15,lineHeight:30})}
      ${rect(58,1324,1084,88,{fill:"#0c2534",stroke:C.cyan,r:18})}
      ${text(86,1378,"复杂功能测试中，Agent 的可靠性来自分层约束对行为路径的持续纠偏。",{size:26,weight:830,color:"#dff8ff",width:41})}
    `),
  },
  {
    file: "05_evolution",
    height: 1460,
    svg: () => frame(1460, "PART 05 · HUMAN IN THE LOOP", "人机边界与未来演进", "流程越成熟，Agent 自主范围越大；但业务口径、风险边界和最终责任仍由人类锚定。", ["5", "演进方向"], `
      ${[
        ["Agent 可自主完成","匹配流程、列信息源、生成用例草案、梳理环境、采集日志、生成报告草稿",C.green],
        ["需要人类确认","流程冲突、需求口径不明、高风险环境变更、证据链缺层、字典外现象",C.amber],
        ["人类必须主导","长期流程口径、最终验收标准、生产级授权、高风险定责、团队流程变更",C.red],
      ].map(([t,d,c],i)=>node(58+i*368,310,340,330,String(i+1),t,d,c)).join("")}
      ${rect(58,700,1084,350,{fill:"#0d1a2d",stroke:"#2f4c6e"})}
      ${text(86,750,"后续建设路线",{size:30,weight:900})}
      ${[
        ["工具能力矩阵","减少拿错工具"],
        ["记录质量检查","发现漏用例和漏证据"],
        ["业务字典模板","复用三分法"],
        ["Runner 扩展","覆盖日切、部署、稳定性"],
        ["门禁增强","从结构走向内容质量"],
      ].map(([t,b],i)=>{
        const x=86+i*206, c=[C.cyan,C.green,C.amber,C.violet,C.red][i];
        return `${rect(x,790,180,210,{fill:"#0b1627",stroke:c,r:18})}
          <rect x="${x+22}" y="812" width="44" height="44" rx="14" fill="${c}" opacity=".18"/>
          ${text(x+44,840,String(i+1),{size:17,weight:900,color:c,anchor:"middle"})}
          ${text(x+22,895,t,{size:24,weight:850,color:C.text,width:5,lineHeight:34})}
          ${text(x+22,950,b,{size:17,color:C.muted,width:7,lineHeight:25})}`;
      }).join("")}
      ${rect(58,1100,1084,190,{fill:"#0d1a2d",stroke:C.cyan})}
      ${text(86,1150,"长期原则",{size:30,weight:900})}
      ${rect(86,1180,430,74,{fill:"#0b1627",stroke:C.cyan,r:18})}
      <rect x="110" y="1200" width="44" height="44" rx="14" fill="${C.cyan}" opacity=".18"/>
      ${text(132,1228,"今",{size:17,weight:900,color:C.cyan,anchor:"middle"})}
      ${text(172,1225,"人维护规则 → Agent 遵守 → 人复核",{size:22,weight:820,color:C.text,width:16})}
      ${arrow(544,1218,80)}
      ${rect(650,1180,464,74,{fill:"#0b1627",stroke:C.green,r:18})}
      <rect x="674" y="1200" width="44" height="44" rx="14" fill="${C.green}" opacity=".18"/>
      ${text(696,1228,"未",{size:17,weight:900,color:C.green,anchor:"middle"})}
      ${text(736,1225,"Agent 提议 → 人确认 → 遵守并自检",{size:22,weight:820,color:C.text,width:16})}
      ${rect(58,1330,1084,74,{fill:"#0c2534",stroke:C.cyan,r:18})}
      ${text(86,1376,"不变的原则：将不确定性显式化，并用工程机制管理它。",{size:26,weight:850,color:"#dff8ff",width:38})}
    `),
  },
];

async function main() {
  for (const diagram of diagrams) {
    const svg = diagram.svg();
    const svgPath = path.join(premiumDir, `${diagram.file}.svg`);
    const pngPath = path.join(outputDir, `${diagram.file}.png`);
    fs.writeFileSync(svgPath, svg, "utf8");
    await sharp(Buffer.from(svg)).png().toFile(pngPath);
    const sizeKb = Math.round(fs.statSync(pngPath).size / 1024);
    console.log(`${diagram.file}.png ${sizeKb} KB`);
  }
  console.log(`svg: ${premiumDir}`);
  console.log(`png: ${outputDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
