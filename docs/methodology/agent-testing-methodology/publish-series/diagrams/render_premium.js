#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { createRequire } = require("module");

const nodeModules =
  process.env.CODEX_NODE_MODULES ||
  "/Users/jiekej/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules";
const requireFromBundle = createRequire(path.join(nodeModules, "package.json"));
const { chromium } = requireFromBundle("playwright");

const root = __dirname;
const premiumDir = path.join(root, "premium");
const outputDir = path.join(root, "output_premium");
fs.mkdirSync(premiumDir, { recursive: true });
fs.mkdirSync(outputDir, { recursive: true });

const css = `
  :root {
    color-scheme: dark;
    --bg: #07111f;
    --panel: rgba(16, 28, 48, 0.88);
    --panel-2: rgba(12, 22, 38, 0.92);
    --line: rgba(134, 167, 210, 0.24);
    --muted: #8ea2bd;
    --text: #edf5ff;
    --cyan: #19d3f3;
    --blue: #4f86ff;
    --green: #37d399;
    --amber: #f4b95a;
    --red: #ff6b7a;
    --violet: #b78cff;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: #07111f;
    font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif;
  }
  .board {
    position: relative;
    width: 1200px;
    min-height: var(--h);
    padding: 54px 58px;
    color: var(--text);
    overflow: hidden;
    background:
      radial-gradient(circle at 16% 10%, rgba(25, 211, 243, 0.18), transparent 28%),
      radial-gradient(circle at 88% 16%, rgba(244, 185, 90, 0.13), transparent 27%),
      radial-gradient(circle at 75% 83%, rgba(79, 134, 255, 0.15), transparent 32%),
      linear-gradient(135deg, #07111f 0%, #0a1526 48%, #081323 100%);
  }
  .board:before {
    content: "";
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(143, 176, 220, 0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(143, 176, 220, 0.06) 1px, transparent 1px);
    background-size: 42px 42px;
    mask-image: linear-gradient(to bottom, rgba(0,0,0,0.78), transparent 92%);
  }
  .board > * { position: relative; z-index: 1; }
  .kicker {
    display: flex;
    align-items: center;
    gap: 14px;
    color: var(--cyan);
    font-size: 22px;
    letter-spacing: 0;
    font-weight: 700;
  }
  .kicker:before {
    content: "";
    width: 50px;
    height: 4px;
    border-radius: 2px;
    background: linear-gradient(90deg, var(--cyan), var(--amber));
    box-shadow: 0 0 24px rgba(25, 211, 243, 0.55);
  }
  h1 {
    margin: 18px 0 8px;
    font-size: 52px;
    line-height: 1.12;
    font-weight: 850;
    letter-spacing: 0;
  }
  .subtitle {
    max-width: 930px;
    color: #b8c8dd;
    font-size: 24px;
    line-height: 1.55;
  }
  .topbar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 24px;
    margin-bottom: 34px;
  }
  .stamp {
    min-width: 196px;
    padding: 14px 18px;
    border: 1px solid rgba(25, 211, 243, 0.38);
    background: rgba(5, 14, 25, 0.62);
    border-radius: 18px;
    text-align: right;
    box-shadow: inset 0 0 24px rgba(25, 211, 243, 0.07);
  }
  .stamp .big { font-size: 26px; font-weight: 850; color: var(--cyan); }
  .stamp .small { margin-top: 4px; font-size: 16px; color: var(--muted); }
  .panel {
    border: 1px solid var(--line);
    background: linear-gradient(180deg, rgba(20, 35, 58, 0.9), rgba(10, 20, 35, 0.92));
    border-radius: 20px;
    box-shadow: 0 28px 80px rgba(0, 0, 0, 0.38), inset 0 1px 0 rgba(255,255,255,0.06);
  }
  .panel-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 22px;
    border-bottom: 1px solid rgba(134, 167, 210, 0.18);
    font-size: 22px;
    font-weight: 820;
  }
  .chip {
    padding: 7px 12px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,0.13);
    background: rgba(255,255,255,0.06);
    color: #c5d4e8;
    font-size: 15px;
    font-weight: 700;
  }
  .grid { display: grid; gap: 20px; }
  .cols-3 { grid-template-columns: repeat(3, 1fr); }
  .cols-2 { grid-template-columns: repeat(2, 1fr); }
  .node {
    padding: 20px;
    border-radius: 18px;
    border: 1px solid rgba(134, 167, 210, 0.22);
    background: rgba(8, 18, 32, 0.72);
    min-height: 118px;
  }
  .node .num {
    display: inline-flex;
    width: 34px;
    height: 34px;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    margin-bottom: 12px;
    background: rgba(25, 211, 243, 0.14);
    color: var(--cyan);
    font-weight: 850;
  }
  .node h3 {
    margin: 0 0 8px;
    font-size: 23px;
    line-height: 1.25;
  }
  .node p {
    margin: 0;
    color: #aabbd2;
    font-size: 18px;
    line-height: 1.42;
  }
  .metric {
    padding: 18px 20px;
    border-radius: 18px;
    background: rgba(255,255,255,0.055);
    border: 1px solid rgba(255,255,255,0.09);
  }
  .metric b { display:block; font-size: 34px; line-height: 1; color: var(--cyan); margin-bottom: 8px; }
  .metric span { color: #b5c5db; font-size: 17px; }
  .arrow {
    color: var(--cyan);
    font-size: 44px;
    font-weight: 300;
    align-self: center;
    text-align: center;
  }
  .footer-note {
    margin-top: 26px;
    padding: 20px 24px;
    border-left: 5px solid var(--cyan);
    background: rgba(25, 211, 243, 0.08);
    color: #d7e7f7;
    font-size: 24px;
    line-height: 1.45;
    border-radius: 0 18px 18px 0;
  }
  .warn { color: var(--amber); }
  .bad { color: var(--red); }
  .ok { color: var(--green); }
  .violet { color: var(--violet); }
  .cyan { color: var(--cyan); }
`;

function page(content, height) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body><main class="board" style="--h:${height}px">${content}</main></body></html>`;
}

function header(kicker, title, subtitle, stamp) {
  return `
    <div class="topbar">
      <div>
        <div class="kicker">${kicker}</div>
        <h1>${title}</h1>
        <div class="subtitle">${subtitle}</div>
      </div>
      <div class="stamp"><div class="big">${stamp[0]}</div><div class="small">${stamp[1]}</div></div>
    </div>`;
}

const diagrams = [
  {
    file: "01_delivery_gap",
    height: 1380,
    html: page(`
      ${header("PART 01 · PROBLEM DEFINITION", "会写用例，不等于能交付测试", "Agent 最容易被高估的地方：它能快速生成 case，却无法自动补齐环境、工具、证据、判断和报告链路。", ["9", "工程断点"])}
      <div class="panel">
        <div class="panel-title"><span>测试交付链路中的能力断层</span><span class="chip">从“答案”到“结果”</span></div>
        <div style="padding:26px; display:grid; grid-template-columns: 1fr 80px 1.35fr 80px 1fr; gap:12px;">
          <div class="node" style="border-color:rgba(25,211,243,.42)">
            <div class="num">A</div><h3>Agent 擅长区</h3><p>需求理解、结构化总结、用例生成、格式化输出。</p>
            <div class="metric" style="margin-top:18px"><b>3 min</b><span>生成一批看起来完整的 case</span></div>
          </div>
          <div class="arrow">→</div>
          <div class="node" style="border-color:rgba(255,107,122,.55); box-shadow: inset 0 0 40px rgba(255,107,122,.06)">
            <div class="num" style="background:rgba(255,107,122,.14); color:var(--red)">B</div><h3>工程断层区</h3><p>环境前提、工具选择、断言口径、证据归因、异常解释、报告可信度。</p>
            <div class="grid cols-3" style="margin-top:18px">
              <div class="metric"><b class="bad">01</b><span>入口不稳</span></div>
              <div class="metric"><b class="bad">03</b><span>环境缺失</span></div>
              <div class="metric"><b class="bad">06</b><span>证据断链</span></div>
            </div>
          </div>
          <div class="arrow">→</div>
          <div class="node" style="border-color:rgba(55,211,153,.42)">
            <div class="num" style="background:rgba(55,211,153,.14); color:var(--green)">C</div><h3>真实测试交付</h3><p>可执行记录、覆盖矩阵、可复核证据、可交接报告。</p>
            <div class="metric" style="margin-top:18px"><b class="ok">闭环</b><span>结果可追溯，结论可复查</span></div>
          </div>
        </div>
      </div>
      <div class="grid cols-3" style="margin-top:24px">
        ${["任务入口不稳","需求基线不稳","环境前置缺失","工具选型缺失","断言缺失","证据链不闭合","异常识别不足","执行记录缺失","报告失真"].map((x,i)=>`<div class="node"><div class="num">${String(i+1).padStart(2,"0")}</div><h3>${x}</h3><p>${["走错流程，后续动作全偏","预期错误，覆盖失真","结果无法证明目标功能","输入不可控，证据不可归因","执行了也无法判断","单层日志支撑不了结论","隐蔽问题被漏掉","测试留在聊天窗口","推断被包装成结论"][i]}</p></div>`).join("")}
      </div>
      <div class="footer-note">核心判断：Agent 测试的真正挑战不是一次回答有多聪明，而是能否在可控工程过程中持续收敛。</div>
    `, 1380)
  },
  {
    file: "02_six_layer_model",
    height: 1680,
    html: page(`
      ${header("PART 02 · CONTROL MODEL", "六层约束：把随机应答拉回工程轨道", "每一层约束一类不确定性，层与层之间形成输入、输出、校验和沉淀的闭环。", ["6", "约束层"])}
      <div class="panel">
        <div class="panel-title"><span>测试工程控制塔</span><span class="chip">路由 → 需求 → 实施 → 证据 → 判断 → 交付</span></div>
        <div style="padding:28px; display:grid; grid-template-columns: 1fr; gap:18px;">
          ${[
            ["01","任务路由","先选对 workflow，再谈执行","用户请求 → Workflow Catalog → 主流程/子流程","cyan"],
            ["02","需求与用例","先对齐基线，再生成 case","信息源甄别 → 需求分析 → 覆盖清单 → 测试用例","green"],
            ["03","测试实施设计","从 case 变成可执行 runbook","环境前置 → 工具选型 → 逐 Case Runbook","amber"],
            ["04","执行证据","记录实际发生了什么","Case 状态 → 关键标识 → 断言结果 → 证据路径","violet"],
            ["05","判断基线","区分正常、异常和未知","业务字典/缺陷库/历史反例 → 三分法","red"],
            ["06","交付与沉淀","把结果变成可交接资产","执行记录 → 覆盖矩阵 → 测试报告 → 反思沉淀","cyan"]
          ].map(([n,t,d,f,c])=>`
            <div class="node" style="display:grid; grid-template-columns:90px 230px 1fr; align-items:center; min-height:138px;">
              <div class="num" style="width:58px;height:58px;font-size:24px">${n}</div>
              <div><h3 class="${c}">${t}</h3><p>${d}</p></div>
              <div class="metric"><span>${f}</span></div>
            </div>`).join("")}
        </div>
      </div>
      <div class="footer-note">缺一层，就留下一类断裂：入口断裂、需求断裂、实施断裂、事实断裂、判断断裂、交付断裂。</div>
    `, 1680)
  },
  {
    file: "02_asset_mapping",
    height: 1420,
    html: page(`
      ${header("PART 02 · ENGINEERING ASSETS", "六类工程资产承载六层约束", "方法论不是口号，必须落到可维护的规则、流程、步骤、字典、模板和记录。", ["6", "资产类型"])}
      <div class="grid cols-3">
        ${[
          ["rules","红线","禁止动作、授权边界、不可越过的工程约束","不能替代流程"],
          ["workflows","路由","用户请求映射到主流程、子流程和必读材料","不能替代步骤"],
          ["skills","步骤","具体执行方法、证据层、脚本入口和输出要求","不能替代判断"],
          ["dictionaries","基线","正常、异常、未知的判定口径和历史反例","不能替代事实"],
          ["templates","结构","报告、记录、矩阵和反思的交付格式","不能替代内容"],
          ["records","事实","执行痕迹、日志路径、case 状态和证据索引","不能替代结论"]
        ].map(([k,t,d,w],i)=>`
          <div class="panel" style="min-height:330px">
            <div class="panel-title"><span>${String(i+1).padStart(2,"0")} · ${t}</span><span class="chip">${k}</span></div>
            <div style="padding:24px">
              <h3 style="font-size:30px;margin:0 0 14px;color:${["var(--red)","var(--cyan)","var(--green)","var(--amber)","var(--violet)","var(--blue)"][i]}">${d}</h3>
              <p style="font-size:20px;line-height:1.55;color:#aebfd6;margin:0">边界提醒：${w}</p>
            </div>
          </div>`).join("")}
      </div>
      <div class="footer-note">一句话：rules 放红线，workflows 放路由，skills 放步骤，dictionaries 放判断基线，templates 放结构，records 放事实。</div>
    `, 1420)
  },
  {
    file: "03_runner_architecture",
    height: 1280,
    html: page(`
      ${header("PART 03 · EXECUTABLE GUARDRAILS", "Test Agent Workflow Runner", "把“应该做”升级为“必须做”：状态持久化、目标裁剪、门禁校验和中断恢复。", ["CLI", "可执行门禁"])}
      <div class="panel">
        <div class="panel-title"><span>Runner 三层架构</span><span class="chip">文档约束 → 技术保障</span></div>
        <div style="padding:30px; display:grid; grid-template-columns: 1fr 76px 1.2fr 76px 1fr; gap:12px; align-items:stretch;">
          <div class="node"><div class="num">01</div><h3>交互接口层</h3><p>start / status / next / complete / validate / render</p><div class="metric" style="margin-top:18px"><b>CLI</b><span>Agent 的唯一推进入口</span></div></div>
          <div class="arrow">→</div>
          <div class="node"><div class="num">02</div><h3>核心逻辑层</h3><p>配置解析、状态管理、目标模式、门禁校验、中断恢复。</p><div class="grid cols-2" style="margin-top:18px"><div class="metric"><b>YAML</b><span>声明式流程</span></div><div class="metric"><b>Gate</b><span>阻止跳步</span></div></div></div>
          <div class="arrow">→</div>
          <div class="node"><div class="num">03</div><h3>本地存储层</h3><p>run.json、checklist.json、artifacts/*.md、workflow config。</p><div class="metric" style="margin-top:18px"><b>JSON</b><span>不依赖聊天记忆</span></div></div>
        </div>
      </div>
      <div class="grid cols-4" style="display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-top:24px">
        ${[["execution_guide","步骤 1~5"],["execution_record","步骤 1~6"],["report","步骤 1~7"],["full","全部 8 步"]].map(([a,b])=>`<div class="metric"><b style="font-size:25px">${a}</b><span>${b}</span></div>`).join("")}
      </div>
      <div class="footer-note">Runner 不替代 Agent 执行测试，它只保证 Agent 不靠记忆、不凭感觉、不带空壳产物继续推进。</div>
    `, 1280)
  },
  {
    file: "03_gate_check",
    height: 1320,
    html: page(`
      ${header("PART 03 · GATE SYSTEM", "门禁校验三层防线", "当 Agent 说“完成了”，Runner 只相信文件、依赖和内容检查结果。", ["3", "防线"])}
      <div style="display:grid; grid-template-columns: 1fr 74px 1fr 74px 1fr; gap:10px; margin-top:30px">
        ${[
          ["01","依赖校验","前置步骤必须完成","dependency not met"],
          ["02","存在性校验","目标产物必须存在","artifact not found"],
          ["03","内容校验","标题、表格、有效数据必须合格","missing heading / placeholder"]
        ].map(([n,t,d,e],i)=>`
          ${i?'<div class="arrow">→</div>':''}
          <div class="panel" style="min-height:540px">
            <div class="panel-title"><span>${n}</span><span class="chip">GATE</span></div>
            <div style="padding:30px">
              <h3 style="font-size:38px;margin:0 0 18px;color:${["var(--cyan)","var(--amber)","var(--red)"][i]}">${t}</h3>
              <p style="font-size:24px;line-height:1.5;color:#c5d4e8">${d}</p>
              <div class="metric" style="margin-top:34px"><b style="font-size:28px">${e}</b><span>校验失败即阻塞推进</span></div>
            </div>
          </div>`).join("")}
      </div>
      <div class="panel" style="margin-top:28px">
        <div class="panel-title"><span>真实拦截样例</span><span class="chip">不是形式主义</span></div>
        <div class="grid cols-3" style="padding:24px">
          ${["缺失标题","标题无内容","表格全占位符","依赖未满足","产物文件不存在","目标未达成"].map((x,i)=>`<div class="node"><div class="num">${i+1}</div><h3>${x}</h3><p>Agent 必须回去补齐，而不是继续包装结论。</p></div>`).join("")}
        </div>
      </div>
    `, 1320)
  },
  {
    file: "04_correction_flow",
    height: 1580,
    html: page(`
      ${header("PART 04 · CASE STUDY", "真实案例中的 Agent 纠偏闭环", "fake-clock 功能测试证明：可靠性不是一次性正确，而是被分层约束持续拉回正轨。", ["18", "case 覆盖"])}
      <div class="panel">
        <div class="panel-title"><span>从初期偏差到可交付结果</span><span class="chip">持续收敛路径</span></div>
        <div style="padding:28px; display:grid; grid-template-columns: 1fr 60px 1fr 60px 1fr; gap:10px">
          <div class="node" style="border-color:rgba(255,107,122,.42)"><div class="num" style="color:var(--red)">A</div><h3 class="bad">初期偏差</h3><p>忽略二进制和 env，倾向观察背景流量，算法单预期理解偏差。</p></div>
          <div class="arrow">→</div>
          <div class="node" style="border-color:rgba(244,185,90,.44)"><div class="num" style="color:var(--amber)">B</div><h3 class="warn">方法论介入</h3><p>对齐需求、区分理论输入与可执行输入、先做环境和工具选型。</p></div>
          <div class="arrow">→</div>
          <div class="node" style="border-color:rgba(55,211,153,.42)"><div class="num" style="color:var(--green)">C</div><h3 class="ok">结果闭环</h3><p>每个 case 留下标识、断言、状态迁移和证据路径。</p></div>
        </div>
      </div>
      <div class="grid cols-2" style="margin-top:24px">
        <div class="panel">
          <div class="panel-title"><span>环境前置不是附属动作</span><span class="chip">fake-clock</span></div>
          <div style="padding:24px" class="grid">
            ${["特定 fake-clock 二进制","启动时 env 注入","通过 guard start_cmd 生效","重启 guard 并验证 PID 变化","确认普通构建不受影响"].map((x,i)=>`<div class="node" style="min-height:82px"><h3>${String(i+1).padStart(2,"0")} · ${x}</h3></div>`).join("")}
          </div>
        </div>
        <div class="panel">
          <div class="panel-title"><span>执行结果</span><span class="chip">诚实状态</span></div>
          <div style="padding:24px" class="grid cols-2">
            <div class="metric"><b class="ok">12</b><span>通过</span></div>
            <div class="metric"><b class="warn">1</b><span>部分覆盖</span></div>
            <div class="metric"><b class="cyan">1</b><span>需复测</span></div>
            <div class="metric"><b class="violet">4</b><span>本轮不执行</span></div>
          </div>
          <div style="padding:0 24px 24px"><div class="node"><h3>关键修正</h3><p>算法单不是简单“直接拒绝”，需要按过期撤单闭环重新判断。</p></div></div>
        </div>
      </div>
      <div class="footer-note">复杂功能测试中，Agent 的可靠性来自分层约束对行为路径的持续纠偏，而不是来自某次回答看起来很漂亮。</div>
    `, 1580)
  },
  {
    file: "05_evolution",
    height: 1480,
    html: page(`
      ${header("PART 05 · HUMAN IN THE LOOP", "人机边界与未来演进", "流程越成熟，Agent 自主范围越大；但业务口径、风险边界和最终责任仍由人类锚定。", ["5", "演进方向"])}
      <div class="grid cols-3">
        ${[
          ["Agent 可自主完成","匹配 workflow、列信息源、生成 case 草案、梳理环境、采集日志、生成报告草稿","var(--green)"],
          ["需要人类确认","workflow 冲突、需求口径不明、高风险环境变更、证据链缺层、字典外现象","var(--amber)"],
          ["人类必须主导","长期 workflow 口径、最终验收标准、生产级授权、高风险定责、团队流程变更","var(--red)"]
        ].map(([t,d,c])=>`<div class="panel" style="min-height:410px"><div class="panel-title"><span>${t}</span><span class="chip">boundary</span></div><div style="padding:26px"><h3 style="font-size:34px;line-height:1.35;margin:0;color:${c}">${d}</h3></div></div>`).join("")}
      </div>
      <div class="panel" style="margin-top:26px">
        <div class="panel-title"><span>后续建设路线</span><span class="chip">从人工维护资产到半自动演进</span></div>
        <div style="padding:26px; display:grid; grid-template-columns: repeat(5, 1fr); gap:16px;">
          ${["测试工具能力矩阵","执行记录质量检查","通用业务字典模板","Runner 覆盖更多 workflow","增强门禁校验规则"].map((x,i)=>`<div class="node" style="min-height:245px"><div class="num">${i+1}</div><h3>${x}</h3><p>${["减少拿错工具","发现漏 case 和漏证据","复用三分法","纳入日切/部署/稳定性","从结构走向内容质量"][i]}</p></div>`).join("")}
        </div>
      </div>
      <div class="panel" style="margin-top:26px">
        <div class="panel-title"><span>长期原则</span><span class="chip">不随模型版本过时</span></div>
        <div style="padding:30px; display:grid; grid-template-columns:1fr 70px 1fr; gap:20px; align-items:center">
          <div class="node"><h3>今天</h3><p>人维护规则 → Agent 遵守规则 → 人复核结果</p></div>
          <div class="arrow">→</div>
          <div class="node"><h3>未来</h3><p>Agent 提议规则 → 人确认规则 → Agent 遵守并自检 → 人在关键节点介入</p></div>
        </div>
      </div>
      <div class="footer-note">不变的原则：将不确定性显式化，并用工程机制管理它。</div>
    `, 1480)
  }
];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const pageObj = await browser.newPage({ viewport: { width: 1200, height: 2000 }, deviceScaleFactor: 2 });

  for (const diagram of diagrams) {
    const htmlPath = path.join(premiumDir, `${diagram.file}.html`);
    const pngPath = path.join(outputDir, `${diagram.file}.png`);
    fs.writeFileSync(htmlPath, diagram.html, "utf8");
    await pageObj.goto(`file://${htmlPath}`);
    const board = await pageObj.locator(".board");
    await board.screenshot({ path: pngPath });
    const sizeKb = Math.round(fs.statSync(pngPath).size / 1024);
    console.log(`${diagram.file}.png ${sizeKb} KB`);
  }

  await browser.close();
  console.log(`output: ${outputDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
