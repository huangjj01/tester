# Test Agent Workflow Runner 产品文档

## 1. 产品定位

Test Agent Workflow Runner 是一个轻量级 CLI 工具，为 AI Agent 的测试实施任务提供**流程门禁**。

它解决的核心问题是：Agent 在执行测试实施任务时，可能跳过环境前置确认、工具选型、执行记录或测试工程反思等关键环节，导致产出质量不可控。

Runner 不替代现有规则体系（`AGENTS.md`、skills、toolset），而是在其之上增加一层**可执行、可检查、可恢复**的本地流程保护。

## 2. 核心能力

| 能力 | 说明 |
|------|------|
| 固定步骤推进 | 8 步测试实施 workflow，按依赖关系强制顺序执行 |
| 门禁校验 | 标题+非空内容校验、表格列+有效数据校验，阻止空内容通过 |
| 目标产物模式 | 支持 4 种 target，按需只完成必要步骤 |
| 中断恢复 | 所有状态持久化到本地 JSON，不依赖聊天上下文 |
| 阻止跳步 | 依赖未满足时拒绝推进，校验失败时标记 blocked |
| 幂等操作 | 重复 complete 不改变已完成状态 |

## 3. 适用场景

当用户要求 Agent 产出以下任一产物时，必须启动 Runner：

- 测试实施指南
- 测试工具选型
- 测试执行记录
- 覆盖矩阵
- 最终测试报告
- 团队渠道测试报告草稿
- 根据已有需求/测试用例落地执行方案

## 4. Workflow 步骤

| 顺序 | step_id | 名称 | 门禁规则 |
|------|---------|------|---------|
| 1 | `input_sources` | 输入资料确认 | 标题：输入资料、已确认项、待确认项 |
| 2 | `scope` | 测试范围与执行口径 | 标题：本轮测试范围、不测范围、部分覆盖项、待确认项 |
| 3 | `environment_precheck` | 环境前置判断 | 标题：目标环境、版本/包/分支、服务/进程/配置、启动参数/环境变量、mock/外部依赖、恢复基线 |
| 4 | `tool_selection` | 测试工具选型 | 表格 7 列 + 至少 1 行非占位符有效数据 |
| 5 | `execution_guide` | 测试实施指南 | 标题：公共准备步骤、逐 Case 实施步骤、证据采集、通过标准、失败/阻塞处理 |
| 6 | `execution_record` | 测试执行记录 | 标题：执行摘要、测试工具选型结果、逐 case 执行明细、覆盖矩阵、恢复记录、未覆盖/阻塞项 |
| 7 | `report` | 最终报告 | 标题：已验证通过、发现的问题或需复测项、部分覆盖和未执行项、环境恢复状态、剩余风险 |
| 8 | `reflection` | 测试工程反思 | 标题：本次暴露的规则缺口、skill/执行流程缺口、工具缺口、建议沉淀项 |

## 5. 目标产物模式

| target | 说明 | 必经步骤 |
|--------|------|---------|
| `execution_guide` | 只整理测试实施指南 | 步骤 1~5 |
| `execution_record` | 生成或维护执行记录 | 步骤 1~6 |
| `report` | 生成最终报告或团队渠道草稿 | 步骤 1~7 |
| `full` | 完整测试实施闭环 | 全部 8 步 |

## 6. CLI 命令参考

### 6.1 start — 创建 workflow run

```bash
python toolset/test_agent_runner.py start test_execution \
  --name <需求编号或功能名> \
  --target <execution_guide|execution_record|report|full>
```

输出：
```
run_id: 20260520_103012_583665_EXAMPLE-1001
next_step: input_sources
run_dir: .runs/test_execution/20260520_103012_583665_EXAMPLE-1001
```

### 6.2 status — 查看当前状态

```bash
python toolset/test_agent_runner.py status <run_id>
```

输出每个步骤的 `id: status`。

### 6.3 next — 查看下一步

```bash
python toolset/test_agent_runner.py next <run_id>
```

输出当前步骤的 output 路径和门禁要求（required_headings 或 required_table_columns）。

### 6.4 complete — 步骤完成与校验

```bash
python toolset/test_agent_runner.py complete <run_id> <step_id>
```

- 校验通过：`OK: <step_id> completed`，推进到下一步
- 校验失败：`BLOCKED: <错误原因>`，步骤标记为 blocked
- 退出码：0=成功，1=错误，2=blocked

### 6.5 validate — 全局校验

```bash
python toolset/test_agent_runner.py validate <run_id>
```

检查 target 是否已达成。输出 `target achieved` 或阻塞原因。

### 6.6 render — 合并输出

```bash
python toolset/test_agent_runner.py render <run_id>
```

按步骤顺序合并已完成 artifact，输出到 stdout。

## 7. 文件结构

```
config/test_agent_workflows/test_execution.yaml   # workflow 配置
toolset/test_agent_runner.py                       # Runner CLI

.runs/test_execution/<run_id>/                     # 运行产物（已 gitignore）
├── run.json                                       # 运行状态
├── checklist.json                                 # 步骤状态
├── artifacts/                                     # 步骤产物
│   ├── 01_input_sources.md
│   ├── 02_scope.md
│   ├── 03_environment_precheck.md
│   ├── 04_tool_selection.md
│   ├── 05_execution_guide.md
│   ├── 06_execution_record.md
│   ├── 07_report.md
│   └── 08_reflection.md
└── logs/
```

## 8. 门禁规则详解

### 8.1 标题+非空内容校验

- 检查 Markdown 中是否存在配置要求的标题（`#`~`######` 级别，精确匹配标题文本）
- 标题下方到下一个标题之间必须有非空正文（纯空行不算）
- 缺失标题：`missing heading: <heading>`
- 标题无内容：`heading has no content: <heading>`

### 8.2 表格列+有效数据校验

- 检查 Markdown 表格表头是否包含所有必需列
- 对 `tool_selection` 步骤额外检查：至少 1 行数据的关键列不全是占位符
- 占位符定义：空值、`<...>` 模式、`TBD`（不区分大小写）、`待补充`
- 无表格：`no table found`
- 缺列：`missing column: <col>`
- 全占位符：`no valid data rows (all placeholder)`

### 8.3 依赖校验

- 每个步骤配置了 `depends_on` 列表
- 依赖步骤未 completed 时，`complete` 命令返回 `dependency not met: <dep_id>`

## 9. 中断恢复

典型场景：Agent 上下文被 compact、用户隔天继续、Agent 被打断。

恢复流程：

```bash
python toolset/test_agent_runner.py status <run_id>   # 了解进度
python toolset/test_agent_runner.py next <run_id>     # 知道该做什么
```

恢复规则：
- 不得凭聊天上下文猜测进度
- 若 status=blocked，必须先处理 validation_errors
- 若当前 artifact 已存在但未完成，在原文件基础上补全，不覆盖已有内容
- 恢复后仍必须通过 `complete` 校验

## 10. 与现有体系的关系

```
AGENTS.md（入口规则）
  ↓ 命中"测试实施"任务
Runner（流程门禁）
  ↓ 按步骤推进
feature_test_execution_docs skill（具体方法）
  ↓ 参考模板
references/（模板文件）
```

- **Runner 负责**：流程定义、步骤状态、依赖关系、门禁校验、阻止跳步
- **Agent 负责**：读取资料、判断风险、做工具选型、编写文档、向用户确认
- **Skill 负责**：具体方法论和模板格式

## 11. 技术规格

| 项目 | 规格 |
|------|------|
| 语言 | Python 3.8+ |
| 依赖 | PyYAML（已在项目中使用） |
| 状态存储 | 本地 JSON 文件（UTF-8，indent=2） |
| 配置格式 | YAML |
| 产物格式 | Markdown |
| 网络依赖 | 无 |
| 数据库 | 无 |
| 并发支持 | 第一版不支持多 Agent 同时写同一个 run |

## 12. 退出码约定

| 退出码 | 含义 |
|--------|------|
| 0 | 成功 |
| 1 | 错误（参数无效、文件不存在、依赖未满足等） |
| 2 | Blocked（门禁校验失败） |

## 13. 非目标（第一版不做）

- 不自动执行真实测试 case
- 不自动 SSH 到远端
- 不替代人工判断
- 不自动修改 AGENTS.md / skill / 字典
- 不自动发送团队渠道
- 不覆盖日切、稳定性分析、部署安装等复杂 workflow
- 不处理多 Agent 并发冲突
- 不提供 `skip` 命令（blocked 后由 Agent 在 notes 中说明原因）
- 不提供 `set-target` 命令（需扩大目标时重新 start 新 run）

## 14. 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| v1.0 | 2026-05-20 | 初版：start/status/next/complete/validate/render 6 个命令 |
| v1.1 | 2026-05-20 | 修复 run_id 同秒冲突（加入微秒）；新增 workflow 配置 step id 唯一性校验 |
