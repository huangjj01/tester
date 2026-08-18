# Test Agent Workflow Runner 测试用例设计

## Information Sources

- `BASELINE-CURRENT`：`docs/methodology/agent-testing-methodology/test_agent_workflow_runner_design.md`
- `BASELINE-CURRENT`：`.cursor/skills/feature_test_execution_docs/SKILL.md`
- `BASELINE-CURRENT`：`.cursor/skills/feature_test_execution_docs/references/test_execution_guide_template.md`
- `BASELINE-CURRENT`：`.cursor/skills/feature_test_execution_docs/references/test_execution_record_template.md`
- `BASELINE-CURRENT`：`docs/methodology/agent-testing-methodology/agent_testing_methodology_framework.md`
- `BASELINE-CURRENT`：用户当前确认：先不实现 Runner 代码，先写测试用例。

## Source Reconciliation

| Topic | Runner 设计文档 | feature_test_execution_docs / methodology | Issue | Resolution |
| --- | --- | --- | --- | --- |
| 测试实施指南是否需要 Runner | 整理测试实施指南也必须进入 Runner，target=`execution_guide` | 测试实施指南前必须完成环境前置和工具选型 | 一致 | 作为基线 |
| 工具选型位置 | `tool_selection` 在 `execution_guide` 前，缺失或空表不得通过 | 工具选型是必选步骤，必须写入实施指南和执行记录 | 一致 | 作为高优先级覆盖维度 |
| Runner 边界 | 第一版不自动 SSH、不自动执行真实 case、不发团队渠道、不覆盖日切等复杂 workflow | skill 负责测试实施文档，不负责真实执行和发送 | 一致 | 非目标必须有负向用例 |
| 恢复能力 | 第一版必须支持 `status` / `next` 恢复，不依赖聊天上下文 | 方法论要求过程可复核、可交接 | 一致 | 增加中断恢复用例 |
| `skipped` | 预留状态，第一版不实现 | 无直接描述 | 无冲突 | 增加第一版不支持 skip 的边界用例 |
| `set-target` | 第一版不实现，扩大目标产物时重新 start 新 run | 无直接描述 | 无冲突 | 增加同名 start 不覆盖旧 run 用例 |

## Requirements Analysis

- Runner 第一版只覆盖 `test_execution` workflow，不覆盖日切、稳定性分析、部署安装等复杂 workflow。
- Runner 必须创建本地 run 目录，并生成 `run.json`、`checklist.json`、`workflow.yaml` 和 artifacts 目录。
- Runner 必须支持 `start`、`status`、`next`、`complete`、`validate`；`render` 可作为第一版后续命令，但本用例仍覆盖基本行为。
- Runner 必须支持 target 模式：`execution_guide`、`execution_record`、`report`、`full`。
- `execution_guide` 模式必须完成：`input_sources`、`scope`、`environment_precheck`、`tool_selection`、`execution_guide`。
- `tool_selection` 不允许空表或模板占位表通过。
- `complete` 必须先校验 artifact；校验失败时设置 `blocked`，不得推进 `current_step`。
- 中断恢复必须依赖 `run.json`、`checklist.json` 和已有 artifacts，不依赖 Agent 聊天上下文。
- 同一个 `--name` 多次 start 必须生成不同 `run_id`，不得覆盖已有 run。
- 第一版不支持 `skip` 和 `set-target`，不得让 Agent 通过这两个能力绕过门禁。

## Scope Filter

本轮测试用例只覆盖 Runner 第一版设计，不覆盖：

- 真实远端 SSH 行为。
- 真实测试 case 执行。
- 团队渠道发送。
- Web UI。
- 数据库持久化。
- 日切 / 稳定性 / 部署安装 workflow。
- Agent 内容质量的深度语义判断，例如工具选择是否业务上最优。
- 多个 Agent session 同时写同一个 run 的并发冲突；第一版默认同一时间只有一个 Agent 操作同一个 run。

## Coverage Checklist

### A. Workflow 启动与目录

- start 创建 run 目录。
- run_id 包含时间戳和 name。
- 同名 start 不覆盖旧 run。
- `.runs/` 为本地产物目录。
- workflow 配置被复制或记录到 run 内。

### B. 状态文件

- `run.json` 字段完整。
- `checklist.json` 步骤完整。
- target 对应的 required / not_required_yet 正确。
- 状态枚举合法。

### C. 目标产物模式

- `execution_guide` 终点正确。
- `execution_record` 终点正确。
- `report` 终点正确。
- `full` 终点正确。
- target 非法时拒绝。

### D. 顺序与依赖门禁

- 未完成依赖时后续步骤 blocked。
- 环境前置未完成时不得进入工具选型。
- 工具选型未完成时不得生成实施指南。
- 执行记录未完成时不得生成报告。
- full 模式缺少 reflection 不得结束。

### E. Artifact 校验

- required headings 必须存在。
- heading 下必须有非空正文。
- required table columns 必须存在。
- `tool_selection` 表格必须有有效数据行。
- 模板占位符不能算有效数据。

### F. complete / validate 行为

- complete 成功后步骤 completed。
- complete 失败后步骤 blocked。
- complete 失败不得推进 current_step。
- validation_errors 必须记录原因。
- validate 能输出当前阻塞项。
- 重复 complete 已完成步骤应幂等。
- validate 在 target step 达成时应返回当前 target completed。

### G. 中断恢复

- status 能展示当前进度。
- next 能基于状态文件返回当前步骤。
- 已存在 artifact 不应被覆盖。
- blocked 状态恢复时先提示错误原因。

### H. 预留能力边界

- 第一版不支持 skip。
- 第一版不支持 set-target。
- 同名重新 start 生成新 run。

### I. 非目标边界

- Runner 不自动 SSH。
- Runner 不自动执行测试 case。
- Runner 不自动发团队渠道。
- Runner 不自动修改 AGENTS / skill / 字典。

## Test Point Groups

### 1. 启动与初始化

- start 正常创建 run。
- run_id 唯一。
- target 初始化正确。
- 状态文件字段完整。

### 2. 步骤推进

- next 返回当前应执行步骤。
- complete 校验通过后推进。
- complete 校验失败后阻塞。
- validate 汇总阻塞项。

### 3. 门禁校验

- 缺 heading 阻塞。
- heading 空内容阻塞。
- 工具选型表头缺列阻塞。
- 工具选型空表阻塞。
- 工具选型模板行阻塞。

### 4. 目标产物模式

- execution_guide 只要求到实施指南。
- report 要求执行记录。
- full 要求反思。
- 非目标步骤标记 not_required_yet。

### 5. 恢复与边界

- context 中断后可以通过 status / next 恢复。
- skip / set-target 第一版不可用。
- 非目标能力不会被执行。

## Test Cases

| Case ID | Case Name | Preconditions | Steps | Expected Result | Evidence |
| --- | --- | --- | --- | --- | --- |
| Runner-TC-001 | start / execution_guide / 创建基础 run 目录 | `test_execution.yaml` 存在；`.runs/` 可写 | 执行 `start test_execution --name EXAMPLE-1001 --target execution_guide` | 创建 `.runs/test_execution/<timestamp>_EXAMPLE-1001/`；生成 `run.json`、`checklist.json`、`workflow.yaml`、`artifacts/`、`logs/` | 文件树；命令输出 |
| Runner-TC-002 | start / run_id 唯一 / 同名不覆盖旧 run | 已存在 `EXAMPLE-1001` 的 run | 再次执行同名 start | 生成新的带时间戳 run_id；旧 run 目录和状态文件不变 | 两个 run 目录；旧 run.json mtime 不变 |
| Runner-TC-003 | start / 非法 target 拒绝 | workflow 只定义 4 个合法 target | 执行 `start test_execution --target invalid_target` | 命令失败；不创建 run 目录；输出合法 target 列表 | stderr；目录检查 |
| Runner-TC-004 | run.json schema / 字段完整 | 已 start 一个 run | 读取 `run.json` | 包含 `run_id/workflow_id/name/target/status/created_at/updated_at/current_step/run_dir/target_step/blocked_reason` | run.json |
| Runner-TC-005 | checklist.json schema / 步骤完整 | 已 start 一个 run | 读取 `checklist.json` | 包含 8 个步骤；每步有 `id/name/required/status/output/depends_on/completed_at/validation_errors/notes` | checklist.json |
| Runner-TC-006 | execution_guide target / 后续步骤 not_required_yet | target=`execution_guide` | 查看 checklist | `input_sources` 到 `execution_guide` 为 required；`execution_record/report/reflection` 为 `not_required_yet` | checklist.json |
| Runner-TC-007 | full target / reflection 为必需终点 | target=`full` | 查看 checklist | 8 个步骤均 required；target_step=`reflection` | run.json；checklist.json |
| Runner-TC-008 | next / 初始步骤返回 input_sources | 新 run 未完成任何步骤 | 执行 `next <run_id>` | 返回 `input_sources`、输出文件和 required headings | 命令输出 |
| Runner-TC-009 | complete / 缺 artifact 阻塞 | 未创建 `01_input_sources.md` | 执行 `complete <run_id> input_sources` | `input_sources` 状态为 `blocked`；记录 artifact missing；current_step 不推进 | checklist.json；run.json |
| Runner-TC-010 | complete / 缺 required heading 阻塞 | `01_input_sources.md` 存在但缺 `待确认项` | complete `input_sources` | 状态 `blocked`；`validation_errors` 指出缺 heading | checklist.json |
| Runner-TC-011 | complete / heading 下正文为空阻塞 | headings 都存在，但 `待确认项` 下无正文 | complete `input_sources` | 校验失败；不允许 completed | checklist.json；命令输出 |
| Runner-TC-012 | complete / input_sources 通过后推进 scope | `01_input_sources.md` 包含 required headings 和非空内容 | complete `input_sources` | `input_sources=completed`；current_step=`scope` | run.json；checklist.json |
| Runner-TC-013 | dependency / 未完成 scope 不得 complete environment_precheck | 只完成 input_sources | 直接 complete `environment_precheck` | 拒绝；提示依赖 `scope` 未完成 | 命令输出；checklist.json |
| Runner-TC-014 | environment_precheck / 缺恢复基线阻塞 | `03_environment_precheck.md` 缺 `恢复基线` | complete `environment_precheck` | blocked；current_step 不推进 tool_selection | checklist.json；run.json |
| Runner-TC-015 | tool_selection / 缺表格阻塞 | `04_tool_selection.md` 只有文字没有表格 | complete `tool_selection` | blocked；提示缺 required table | checklist.json |
| Runner-TC-016 | tool_selection / 表头缺列阻塞 | 表格缺 `断言方式` 或 `缺口 / 风险` | complete `tool_selection` | blocked；错误列出缺失列 | checklist.json；命令输出 |
| Runner-TC-017 | tool_selection / 空表阻塞 | 表头完整，但没有数据行 | complete `tool_selection` | blocked；提示至少需要 1 行有效数据 | checklist.json |
| Runner-TC-018 | tool_selection / 模板占位行阻塞 | 数据行全是 `<tool>`、`TBD`、`待补充` | complete `tool_selection` | blocked；模板占位不算有效数据 | checklist.json |
| Runner-TC-019 | tool_selection / 有效表格通过 | 表头完整，至少 1 行真实 case、工具、断言、理由和风险 | complete `tool_selection` | completed；current_step 推进 `execution_guide` | run.json；checklist.json |
| Runner-TC-020 | execution_guide / 工具选型未完成时阻止生成 | `tool_selection` 未 completed | 尝试 complete `execution_guide` | blocked；提示依赖 `tool_selection` 未完成 | 命令输出 |
| Runner-TC-021 | execution_guide / target reached / validate 返回完成 | target=`execution_guide`；前置步骤完成；实施指南包含公共准备、逐 Case、证据采集、通过标准、失败处理 | complete `execution_guide` 后执行 validate | `execution_guide=completed`；`execution_record/report/reflection=not_required_yet`；validate 返回当前 target completed / target reached | run.json；checklist.json；validate 输出 |
| Runner-TC-022 | execution_record target / report 前必须有执行记录 | target=`report`，只完成到 execution_guide | validate | blocked；提示 `execution_record` 未完成 | validate 输出 |
| Runner-TC-023 | report target / report required headings 校验 | target=`report`，执行记录完成，报告缺 `剩余风险` | complete `report` | blocked；记录缺 heading | checklist.json |
| Runner-TC-024 | full target / 缺 reflection 不能完成 workflow | target=`full`，完成到 report | validate | blocked；提示 `reflection` 未完成 | validate 输出 |
| Runner-TC-025 | reflection / 完整反思通过 full | target=`full`，reflection 包含规则缺口、skill 缺口、工具缺口、建议沉淀项 | complete `reflection` 后 validate | workflow status=`completed` | run.json；validate 输出 |
| Runner-TC-026 | status / 中断后展示当前状态 | 有 run，current_step=`tool_selection` | 执行 `status <run_id>` | 输出已完成、pending、blocked、not_required_yet 状态 | 命令输出 |
| Runner-TC-027 | next / blocked 恢复优先显示错误 | `tool_selection` blocked 且 validation_errors 非空 | 执行 `next <run_id>` | 返回当前 blocked step 和错误原因，不跳到后续步骤 | 命令输出 |
| Runner-TC-028 | next / 当前 artifact 已存在时提示补全而非覆盖 | 当前 step artifact 已有部分内容但步骤未 completed | 执行 `next <run_id>` | 输出当前 step、artifact 路径，并提示 artifact exists / 请补全或更新；Runner 不修改 artifact 内容 | next 输出；artifact mtime / 内容 |
| Runner-TC-029 | skip / 第一版不支持跳过 | 任意 pending step | 执行假想 `skip` 命令或 `complete --skip` | 命令不存在或返回 unsupported；状态不变 | 命令输出；checklist.json |
| Runner-TC-030 | set-target / 第一版不支持切换目标 | 已有 target=`execution_guide` run | 执行假想 `set-target report` | 返回 unsupported；提示重新 start 新 run；状态文件不被修改 | 命令输出；run.json |
| Runner-TC-031 | validate / 存在 blocked 时不允许最终结论 | 任一步骤 blocked | 执行 validate | 输出 blocked 列表；不得返回 workflow completed | validate 输出 |
| Runner-TC-032 | render / 目标 artifact 缺失时拒绝 | target=`execution_guide`，execution_guide 未 completed | 执行 render | render 失败；提示目标步骤未完成 | 命令输出 |
| Runner-TC-033 | render / execution_guide 汇总成功 | target=`execution_guide` 已完成 | 执行 render | 生成或输出实施指南草稿；不要求执行记录、报告、反思 | 输出文件 / stdout |
| Runner-TC-034 | 非目标边界 / 不自动 SSH | 执行 start/next/complete/validate | 观察命令行为 | 不发起 SSH 命令，不访问远端 | 日志 / mock command spy |
| Runner-TC-035 | 非目标边界 / 不自动执行测试 case | 完成 execution_guide | 执行 validate/render | 不执行 auto_case、pytest、远端脚本或业务 case | 日志 / command spy |
| Runner-TC-036 | 非目标边界 / 不自动发团队渠道 | target=`report` 完成 | 执行 render/validate | 不调用 team-report-send，不发 webhook | 日志 / mock webhook |
| Runner-TC-037 | 非目标边界 / 不自动修改规则资产 | 任意 workflow run | 执行全部 Runner 命令 | 不修改 `AGENTS.md`、`.cursor/skills/`、`docs/ai_workflows.md` | git diff |
| Runner-TC-038 | workflow config 缺失 / start 失败 | 临时移除或指定不存在 workflow config | start test_execution | 明确失败；不创建半成品 run | stderr；目录检查 |
| Runner-TC-039 | workflow config 异常 / 重复 step id 拒绝 | workflow 配置中存在重复 step id | start | 失败并提示配置错误 | stderr |
| Runner-TC-040 | checklist 损坏 / status 提示修复 | checklist.json 非法 JSON | status / next | 命令失败并提示状态文件损坏；不覆盖原文件 | stderr；文件内容 |
| Runner-TC-041 | full target / 端到端 happy path | workflow 配置正常；`.runs/` 可写 | start `--target full`；依次写入 8 个合法 artifact；依次 complete 8 个步骤；执行 validate | 8 个步骤均为 completed；`run.json.status=completed`；validate 返回 workflow completed | run.json；checklist.json；validate 输出 |
| Runner-TC-042 | complete / 已完成当前步骤重复 complete 幂等 | `input_sources=completed`；current_step 已推进到 `scope` | 再次 complete `input_sources` | 返回已完成或 OK；`input_sources` 保持 completed；`completed_at` 不变；current_step 仍为 `scope` | checklist.json；run.json；命令输出 |
| Runner-TC-043 | complete / 已完成前置步骤重复 complete 不影响当前进度 | current_step=`tool_selection`；`input_sources/scope/environment_precheck=completed` | 再次 complete `scope` | 返回已完成或 OK；`scope` 状态不变；current_step 仍为 `tool_selection` | checklist.json；run.json；命令输出 |

## Checklist Back-Check

- A. Workflow 启动与目录 -> Runner-TC-001, Runner-TC-002, Runner-TC-003, Runner-TC-038, Runner-TC-039
- B. 状态文件 -> Runner-TC-004, Runner-TC-005, Runner-TC-006, Runner-TC-007, Runner-TC-040
- C. 目标产物模式 -> Runner-TC-003, Runner-TC-006, Runner-TC-007, Runner-TC-021, Runner-TC-022, Runner-TC-024, Runner-TC-030, Runner-TC-041
- D. 顺序与依赖门禁 -> Runner-TC-008, Runner-TC-012, Runner-TC-013, Runner-TC-020, Runner-TC-021, Runner-TC-022, Runner-TC-024, Runner-TC-041
- E. Artifact 校验 -> Runner-TC-009, Runner-TC-010, Runner-TC-011, Runner-TC-014, Runner-TC-015, Runner-TC-016, Runner-TC-017, Runner-TC-018, Runner-TC-019, Runner-TC-023
- F. complete / validate 行为 -> Runner-TC-012, Runner-TC-014, Runner-TC-019, Runner-TC-021, Runner-TC-025, Runner-TC-031, Runner-TC-041, Runner-TC-042, Runner-TC-043
- G. 中断恢复 -> Runner-TC-026, Runner-TC-027, Runner-TC-028, Runner-TC-040
- H. 预留能力边界 -> Runner-TC-029, Runner-TC-030
- I. 非目标边界 -> Runner-TC-034, Runner-TC-035, Runner-TC-036, Runner-TC-037

Uncovered: 无。当前 checklist 项均有至少一个 case 覆盖。

## Rule Change Consistency Scan

- Source reconciliation：已记录 `skipped`、`set-target` 第一版不实现。
- Requirements analysis：已包含 target、非空校验、恢复、同名 run 不覆盖、非目标边界。
- Coverage checklist：已覆盖启动、状态、门禁、恢复、预留能力和非目标。
- Case names：均包含触发点或目标行为。
- Expected results：均以文件、状态、命令输出或 git diff 等可观察证据表达。
