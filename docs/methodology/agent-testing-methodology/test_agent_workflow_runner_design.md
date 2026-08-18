# Test Agent Workflow Runner 设计落地文档

## 1. 背景

当前 示例业务系统 测试 Agent 方法论已经形成了比较清晰的文档体系：

- `AGENTS.md`：项目红线、强约束和入口规则。
- `docs/ai_workflows.md`：任务类型到 workflow / skill 的路由目录。
- `.cursor/skills/`：具体执行流程。
- `docs/methodology/agent-testing-methodology/`：测试 Agent 方法论。
- `toolset/`：正式脚本入口。

这套体系能告诉 Agent 应该怎么做，但仍然主要依赖 Agent 自觉遵守。实际执行时，Agent 仍可能跳过环境前置、工具选型、执行记录、测试工程反思等关键环节。

因此需要新增一个轻量 Runner，把测试实施 workflow 从“文档约束”升级为“可执行、可检查、可恢复”的本地流程。

## 2. 目标

Runner 的目标不是替代现有 `AGENTS.md`、skills、docs 或 toolset，而是在现有体系之上增加一层流程门禁。

核心目标：

1. 让 Agent 在测试实施任务中按固定步骤推进。
2. 强制关键产物落盘，避免只停留在聊天上下文。
3. 在缺少环境前置、工具选型、执行记录或反思时阻止进入后续阶段。
4. 支持中断后通过 `status` / `next` 恢复。
5. 保持足够轻，不引入 Web 平台或数据库。

## 3. 非目标

第一版 Runner 不做以下事情：

- 不自动执行真实测试 case。
- 不自动 SSH 到远端。
- 不替代 `feature_test_execution_docs` skill。
- 不替代人工判断。
- 不自动修改 `AGENTS.md` / skill / 字典。
- 不自动发送团队渠道。
- 不覆盖日切、稳定性分析、部署安装等复杂 workflow。
- 不处理多个 Agent session 同时写同一个 run 的并发冲突；第一版默认同一时间只有一个 Agent 操作同一个 run。

## 4. 第一阶段适用范围

第一阶段只覆盖“测试实施 workflow”。

触发场景包括：

- 整理测试实施指南。
- 生成测试工具选型。
- 生成测试执行记录。
- 整理覆盖矩阵。
- 生成最终测试报告。
- 生成团队渠道测试报告草稿。
- 根据已有需求 / 测试用例落地执行方案。

其中，“整理测试实施指南”也必须进入 Runner，因为实施指南本身依赖输入资料确认、测试范围、环境前置和工具选型。

## 5. 总体设计

用户仍然正常向 Agent 发起任务。Agent 识别到测试实施类任务后，主动启动 Runner。

```text
用户请求
  -> Agent 命中测试实施任务
  -> Agent 启动 Runner
  -> Runner 创建 run 目录和 checklist
  -> Agent 按 Runner 的 next step 产出 artifact
  -> Runner 校验 artifact
  -> 校验通过后进入下一步
  -> 目标产物生成
```

Runner 负责：

- 流程定义。
- 步骤状态。
- 依赖关系。
- 必填文件 / 标题 / 表格列校验。
- 阻止跳步。

Agent 负责：

- 读取需求、用例、代码和环境资料。
- 判断环境风险。
- 做工具选型。
- 编写实施指南、执行记录、报告和反思。
- 在需要人类确认时发问。

## 6. 目标产物模式

测试实施 workflow 不要求每次都跑完整闭环。Runner 需要支持目标产物模式。

示例：

```bash
python toolset/test_agent_runner.py start test_execution \
  --name EXAMPLE-1001 \
  --target execution_guide
```

当目标是 `execution_guide` 时，必经步骤为：

```text
input_sources
scope
environment_precheck
tool_selection
execution_guide
```

后续步骤标记为：

```text
not_required_yet
```

如果用户后续继续要求执行测试或生成报告，可以 resume 同一个 run，继续完成：

```text
execution_record
report
reflection
```

目标产物建议枚举：

| target | 说明 | 必经终点 |
| --- | --- | --- |
| `execution_guide` | 只整理测试实施指南 | `execution_guide` |
| `execution_record` | 生成或维护执行记录 | `execution_record` |
| `report` | 生成最终报告或团队渠道草稿 | `report` |
| `full` | 完整测试实施闭环 | `reflection` |

## 7. Workflow 步骤

第一版测试实施 workflow 固定为 8 步。

| 顺序 | step_id | 名称 | 说明 |
| --- | --- | --- | --- |
| 1 | `input_sources` | 输入资料确认 | 列出需求、用例、代码变更、环境说明、已有工具等 |
| 2 | `scope` | 测试范围与执行口径 | 明确测什么、不测什么、部分覆盖项和待确认点 |
| 3 | `environment_precheck` | 环境前置判断 | 确认环境、版本、配置、进程、启动参数、mock、恢复基线 |
| 4 | `tool_selection` | 测试工具选型 | 判断现有工具是否覆盖，是否需要新增 case / 脚本 / mock |
| 5 | `execution_guide` | 测试实施指南 | 输出可执行 runbook |
| 6 | `execution_record` | 测试执行记录 | 按真实执行情况记录证据 |
| 7 | `report` | 最终报告 | 从执行记录提炼结论 |
| 8 | `reflection` | 测试工程反思 | 输出规则、skill、工具缺口和候选沉淀项 |

## 8. 门禁规则

第一版先做结构门禁，但不能只检查标题存在。至少对关键步骤做非空校验，避免 Agent 写空章节或空表格通过门禁。

| 门禁 | 规则 |
| --- | --- |
| 输入资料缺失 | 不允许进入 `scope` |
| 环境前置缺失 | 不允许进入 `tool_selection` 和 `execution_guide` |
| 工具选型缺失 | 不允许生成 `execution_guide` |
| 工具选型为空 | `tool_selection` 表格必须至少有 1 行非模板数据，关键列不能全是 `<...>`、`TBD`、`待补充`、空值 |
| 实施指南缺失 | 不允许生成 `execution_record` |
| 执行记录缺失 | 不允许生成 `report` |
| 测试工程反思缺失 | `full` 模式不允许结束 workflow |
| 存在 blocked 待确认项 | 不允许输出最终结论，只能输出阶段性结论 |

第一版至少实现以下内容校验：

- `required_headings`：标题必须存在，且标题下方到下一个标题之间必须有非空正文。
- `required_table_columns`：表格必须存在，表头必须包含必需列。
- `tool_selection`：表格必须至少有 1 行有效数据；有效数据不能只包含模板占位符。
- `complete` 校验失败时，不得把步骤标记为 `completed`，应记录为 `blocked` 并写入 `validation_errors`。

## 9. 文件结构

新增 workflow 配置：

```text
config/test_agent_workflows/test_execution.yaml
```

新增 Runner：

```text
toolset/test_agent_runner.py
```

新增本地运行产物目录：

```text
.runs/test_execution/<run_id>/
```

`.runs/` 必须加入 `.gitignore`。

单次 run 目录结构：

```text
.runs/test_execution/<run_id>/
├── run.json
├── checklist.json
├── workflow.yaml
├── artifacts/
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

### 9.1 run.json schema

`run.json` 记录一次 workflow run 的整体状态。

```json
{
  "run_id": "20260520_103012_EXAMPLE-1001",
  "workflow_id": "test_execution",
  "name": "EXAMPLE-1001",
  "target": "execution_guide",
  "status": "running",
  "created_at": "2026-05-20T10:30:12+08:00",
  "updated_at": "2026-05-20T10:42:00+08:00",
  "current_step": "environment_precheck",
  "run_dir": ".runs/test_execution/20260520_103012_EXAMPLE-1001",
  "target_step": "execution_guide",
  "blocked_reason": null
}
```

字段说明：

| 字段 | 说明 |
| --- | --- |
| `run_id` | 本次运行 ID |
| `workflow_id` | workflow 类型，第一版固定为 `test_execution` |
| `name` | 需求编号或功能名 |
| `target` | 目标产物模式 |
| `status` | `running` / `blocked` / `completed` / `failed` |
| `current_step` | 当前应执行步骤 |
| `target_step` | 本次目标产物对应的终点 step |
| `blocked_reason` | 被阻塞时的原因 |

### 9.2 checklist.json schema

`checklist.json` 记录每个步骤的状态和校验结果。

```json
{
  "steps": [
    {
      "id": "tool_selection",
      "name": "测试工具选型",
      "required": true,
      "status": "pending",
      "output": "artifacts/04_tool_selection.md",
      "depends_on": ["environment_precheck"],
      "completed_at": null,
      "validation_errors": [],
      "notes": ""
    }
  ]
}
```

步骤状态枚举：

| 状态 | 说明 |
| --- | --- |
| `pending` | 等待执行 |
| `blocked` | 校验失败或依赖未满足 |
| `completed` | 已完成且校验通过 |
| `not_required_yet` | 当前 target 不要求执行 |
| `skipped` | 预留状态：经用户确认后跳过；第一版不实现 |

`complete` 命令只能在校验通过后把步骤置为 `completed`。校验失败时必须保留或设置为 `blocked`，并把失败原因写入 `validation_errors`。

第一版不提供 `skip` 命令，也不允许 Agent 自行把步骤改成 `skipped`。若某一步确实需要跳过，先记录为 `blocked`，由 Agent 在 `notes` 和对应 artifact 中写明原因并向用户确认；后续版本再通过专门的 `skip` 命令统一更新状态。

## 10. CLI 设计

### 10.1 start

创建 workflow run。

```bash
python toolset/test_agent_runner.py start test_execution \
  --name EXAMPLE-1001 \
  --target execution_guide
```

输出：

```text
run_id: 20260520_103012_EXAMPLE-1001
next_step: input_sources
run_dir: .runs/test_execution/20260520_103012_EXAMPLE-1001
```

`run_id` 必须包含时间戳。同一个 `--name` 多次执行 `start` 会生成新的 run，不覆盖已有 run。Runner 不按需求名覆盖历史记录。

### 10.2 status

查看当前状态。

```bash
python toolset/test_agent_runner.py status <run_id>
```

输出：

```text
input_sources: completed
scope: completed
environment_precheck: pending
tool_selection: blocked
execution_guide: blocked
```

### 10.3 next

告诉 Agent 当前该做什么。

```bash
python toolset/test_agent_runner.py next <run_id>
```

输出：

```text
current_step: environment_precheck
output: artifacts/03_environment_precheck.md
required_headings:
- 目标环境
- 版本 / 包 / 分支
- 服务 / 进程 / 配置
- 启动参数 / 环境变量
- mock / 外部依赖
- 恢复基线
```

### 10.4 complete

执行步骤校验，并在通过后标记完成。

```bash
python toolset/test_agent_runner.py complete <run_id> environment_precheck
```

如果通过：

```text
OK: environment_precheck completed
next_step: tool_selection
```

如果失败：

```text
BLOCKED: artifacts/03_environment_precheck.md missing heading: 恢复基线
```

`complete` 的行为要求：

1. 先校验 artifact。
2. 校验通过才更新该步骤为 `completed`。
3. 校验失败时更新该步骤为 `blocked`，写入 `validation_errors`。
4. 校验失败时不得推进 `current_step`。
5. 校验通过后，根据依赖关系推进到下一个可执行步骤。
6. 如果步骤已经是 `completed`，重复 `complete` 应保持幂等：返回已完成提示，不修改 `completed_at`，不重复推进 `current_step`。
7. 如果重复 `complete` 的是已完成的前置步骤，也不得影响当前进度。

### 10.5 validate

全局校验。

```bash
python toolset/test_agent_runner.py validate <run_id>
```

输出当前是否允许进入目标产物阶段或结束 workflow。

当 target 对应的 `target_step` 已经 `completed`，且所有 required steps 均无 blocked 状态时，`validate` 应返回当前 target 已达成。对于 `target=execution_guide`，后续 `execution_record/report/reflection` 处于 `not_required_yet` 时，不应阻止当前 target 完成。

### 10.6 render

汇总 artifacts，生成目标文档草稿。

```bash
python toolset/test_agent_runner.py render <run_id>
```

第一版可以只输出合并后的 Markdown，不做复杂排版。

## 11. 中断恢复

Runner 必须把中断恢复作为第一版能力，而不是依赖 Agent 的聊天上下文。

典型场景：

- Agent 上下文被 compact。
- 用户隔几小时或几天后继续同一个测试实施任务。
- Agent 执行到一半被打断。
- 当前 artifact 已经写了一部分，但步骤未完成。

恢复流程：

```bash
python toolset/test_agent_runner.py status <run_id>
python toolset/test_agent_runner.py next <run_id>
```

Agent 恢复后必须先读取：

```text
run.json
checklist.json
当前 step artifact
已完成步骤 artifacts
```

恢复时的行为要求：

1. 不得凭聊天上下文猜测当前进度。
2. 若 `run.json.status=blocked`，必须先处理 `blocked_reason` 或 `validation_errors`。
3. 若当前 step artifact 已存在但未完成，Agent 应在原文件基础上补全，不得直接覆盖已有有效内容。
4. 若用户要求切换目标产物，例如从 `execution_guide` 继续到 `report`，Runner 后续可新增 `set-target` 命令，统一更新 `run.json` 和 `checklist.json`。第一版不实现 `set-target`，也不建议手工修改状态文件；需要扩大目标产物时，优先重新 `start` 一个新 run。由于 `run_id` 带时间戳，新 run 不会覆盖旧 run。
5. 恢复后仍必须通过 `complete` 校验，不能直接标记完成。

## 12. Workflow 配置示例

`config/test_agent_workflows/test_execution.yaml`：

```yaml
id: test_execution
name: 测试实施 Workflow

targets:
  execution_guide: execution_guide
  execution_record: execution_record
  report: report
  full: reflection

steps:
  - id: input_sources
    name: 输入资料确认
    output: artifacts/01_input_sources.md
    required_headings:
      - 输入资料
      - 已确认项
      - 待确认项

  - id: scope
    name: 测试范围与执行口径
    output: artifacts/02_scope.md
    depends_on:
      - input_sources
    required_headings:
      - 本轮测试范围
      - 不测范围
      - 部分覆盖项
      - 待确认项

  - id: environment_precheck
    name: 环境前置判断
    output: artifacts/03_environment_precheck.md
    depends_on:
      - scope
    required_headings:
      - 目标环境
      - 版本 / 包 / 分支
      - 服务 / 进程 / 配置
      - 启动参数 / 环境变量
      - mock / 外部依赖
      - 恢复基线

  - id: tool_selection
    name: 测试工具选型
    output: artifacts/04_tool_selection.md
    depends_on:
      - environment_precheck
    required_table_columns:
      - Case / 场景
      - 现有工具是否覆盖
      - 选用工具
      - 是否需要新增 case / 脚本
      - 断言方式
      - 选择理由
      - 缺口 / 风险

  - id: execution_guide
    name: 测试实施指南
    output: artifacts/05_execution_guide.md
    depends_on:
      - tool_selection
    required_headings:
      - 公共准备步骤
      - 逐 Case 实施步骤
      - 证据采集
      - 通过标准
      - 失败 / 阻塞处理

  - id: execution_record
    name: 测试执行记录
    output: artifacts/06_execution_record.md
    depends_on:
      - execution_guide
    required_headings:
      - 执行摘要
      - 测试工具选型结果
      - 逐 case 执行明细
      - 覆盖矩阵
      - 恢复记录
      - 未覆盖 / 阻塞项

  - id: report
    name: 最终报告
    output: artifacts/07_report.md
    depends_on:
      - execution_record
    required_headings:
      - 已验证通过
      - 发现的问题或需复测项
      - 部分覆盖和未执行项
      - 环境恢复状态
      - 剩余风险

  - id: reflection
    name: 测试工程反思
    output: artifacts/08_reflection.md
    depends_on:
      - report
    required_headings:
      - 本次暴露的规则缺口
      - 本次暴露的 skill / 执行流程缺口
      - 本次暴露的工具缺口
      - 建议沉淀项
```

## 13. AGENTS.md 入口规则草案

后续实现 Runner 后，在 `AGENTS.md` 增加：

```md
## 测试实施 Runner（强制）

当用户要求测试实施指南、测试工具选型、测试执行记录、覆盖矩阵、最终测试报告或团队渠道测试报告草稿时，Agent 必须先启动：

`python toolset/test_agent_runner.py start test_execution --name <需求编号或功能名> --target <target>`

若用户只要求整理测试实施指南，target 使用 `execution_guide`。

Runner 校验未通过时，不得跳过步骤，不得生成目标产物，不得宣称测试实施流程完成。

测试实施 workflow 的事实来源仍为：
- `.cursor/skills/feature_test_execution_docs/SKILL.md`
- `.cursor/skills/feature_test_execution_docs/references/`
- `docs/methodology/agent-testing-methodology/`
```

## 14. MVP 实施计划

### 阶段 1：只做本地结构门禁

交付内容：

- `.gitignore` 增加 `.runs/`。
- 新增 `config/test_agent_workflows/test_execution.yaml`。
- 新增 `toolset/test_agent_runner.py`。
- 支持 `start`、`status`、`next`、`complete`、`validate`。
- 校验标题、标题下非空内容、表格列。
- `tool_selection` 必须校验至少 1 行非模板数据。
- 定义并写入 `run.json` / `checklist.json`。

验收标准：

- 能创建 run 目录。
- 能按顺序推进步骤。
- 能阻止跳过工具选型生成实施指南。
- 能阻止空工具选型表通过校验。
- 能阻止没有执行记录生成报告。
- 能阻止 `full` 模式缺少反思而结束。
- 能通过 `status` / `next` 恢复中断任务。

### 阶段 2：接入模板

交付内容：

- `render` 命令。
- 从 `feature_test_execution_docs/references/` 中读取模板。
- 汇总 artifacts 生成实施指南或执行记录草稿。

验收标准：

- `target=execution_guide` 可以生成实施指南草稿。
- `target=report` 可以从执行记录生成报告草稿骨架。

### 阶段 3：增强校验

交付内容：

- 多表格场景下的精确表格定位。
- blocked / 待确认项检测。
- artifact 引用检查。
- 可选 JSON sidecar，例如 `step_status.json`。

验收标准：

- 存在待确认项时，Runner 提示不能输出最终结论。
- 缺少证据记录时，Runner 提示补齐。

## 15. 风险与控制

| 风险 | 控制方式 |
| --- | --- |
| Runner 变成复杂平台 | 第一版只做 CLI 和本地文件 |
| Agent 把 Runner 当形式主义 | `AGENTS.md` 写强制入口，未通过不得产出目标文档 |
| 校验过粗 | 第一版即检查非空内容和工具选型有效数据 |
| workflow 配置和 skill 漂移 | 配置只写门禁和结构，具体方法仍引用 skill |
| 运行产物误提交 | `.runs/` 加入 `.gitignore` |

## 16. 结论

测试实施 Runner 是对现有方法论的一层工程化保护。

它不改变现有规则来源，也不替代 Agent 判断。它只负责把关键步骤落到本地 run 中，并用门禁防止 Agent 跳过输入资料确认、环境前置判断、测试工具选型、执行记录和测试工程反思。

第一版应保持很小，先围绕“整理测试实施指南”落地。只要能稳定阻止 Agent 在没有工具选型和环境前置的情况下生成实施指南，就已经能证明价值。
