# Test Agent Workflow Runner 测试实施指南

## 1. 目标

本文档用于指导 `<测试实施 Runner>` 的本地功能测试执行，验证 `toolset/test_agent_runner.py` 是否按需求设计和测试用例实现测试实施 workflow 的流程门禁、状态推进、artifact 校验、target 模式和恢复能力。

本指南本身已按 `AGENTS.md` 的“测试实施 Runner（强制）”要求，通过 Runner `execution_guide` target 生成。

Runner 过程信息：

| 项目 | 值 |
| --- | --- |
| workflow | `test_execution` |
| target | `execution_guide` |
| run_id | `20260520_155747_test-agent-runner-guide` |
| run_dir | `.runs/test_execution/20260520_155747_test-agent-runner-guide` |

配套资料：

- 需求 / 设计：`docs/methodology/agent-testing-methodology/test_agent_workflow_runner_design.md`
- 测试用例：`docs/methodology/agent-testing-methodology/test_agent_workflow_runner_test_cases.md`
- Runner 实现：`toolset/test_agent_runner.py`
- Workflow 配置：`config/test_agent_workflows/test_execution.yaml`
- 测试实施 skill：`.cursor/skills/feature_test_execution_docs/SKILL.md`

## 2. 输入资料

| 资料类型 | 路径 / 来源 | 状态 | 备注 |
| --- | --- | --- | --- |
| 项目规则 | `AGENTS.md` | 已确认 | 要求测试实施指南先启动 Runner |
| Workflow catalog | `docs/ai_workflows.md` | 已检查 | 未命中专门 Runner 测试 workflow，回到测试实施 skill |
| 测试实施 skill | `.cursor/skills/feature_test_execution_docs/SKILL.md` | 已确认 | 要求输入资料、范围、环境、工具选型、实施指南完整落地 |
| 需求 / 设计 | `docs/methodology/agent-testing-methodology/test_agent_workflow_runner_design.md` | 已确认 | Runner 目标、CLI、schema、门禁、target 模式 |
| 测试用例 | `docs/methodology/agent-testing-methodology/test_agent_workflow_runner_test_cases.md` | 已确认 | 43 条 case，含端到端和幂等场景 |
| 实现文件 | `toolset/test_agent_runner.py` | 已确认 | CLI 主程序 |
| Workflow 配置 | `config/test_agent_workflows/test_execution.yaml` | 已确认 | 8 步 workflow、4 种 target、required headings/table columns |

## 3. 测试范围与执行口径

| 项目 | 口径 |
| --- | --- |
| 本轮覆盖 | Runner CLI 的 `start/status/next/complete/validate/render`、target 模式、状态文件、artifact 校验、中断恢复、幂等行为 |
| 本轮不覆盖 | 真实远端 SSH、真实业务 case、团队渠道发送、Web UI、数据库、多个 Agent session 并发写同一 run |
| 部分覆盖项 | 配置异常类 case 在一次性测试副本中执行；`render` 未完成 target 时的行为按当前实现记录 |
| 本轮不执行项 | 需要破坏主工作区或依赖远端环境的动作不在主工作区执行 |
| 外部依赖口径 | 仅依赖本地 Python、PyYAML 和文件系统；不依赖远端环境 |

## 4. 环境前置判断

| 检查项 | 本次要求 | 确认方式 | 记录位置 |
| --- | --- | --- | --- |
| 目标环境 | 本地 `sample-test-repo` 仓库根目录 | `pwd` | 执行记录“测试前置记录” |
| Git 状态 | 记录测试前状态 | `git status --short` | 执行记录 |
| Python | 可执行 `python3` | `python3 --version` | 执行记录 |
| PyYAML | 可 import `yaml` | `python3 -c 'import yaml; print(yaml.__version__)'` | 执行记录 |
| Runner 文件 | `toolset/test_agent_runner.py` 存在 | `test -f toolset/test_agent_runner.py` | 执行记录 |
| Workflow 配置 | `config/test_agent_workflows/test_execution.yaml` 存在 | `test -f config/test_agent_workflows/test_execution.yaml` | 执行记录 |
| `.runs/` | 已被 `.gitignore` 忽略 | `rg -n '^\\.runs/' .gitignore` | 执行记录 |
| Runner help | CLI 子命令完整 | `python3 toolset/test_agent_runner.py --help` | 执行记录 |
| 远端依赖 | 不需要 | 不执行 SSH / webhook | 执行记录 |
| 恢复基线 | 不自动删除测试产物 | 记录 run_id 和副本路径 | 恢复记录 |

若 `import yaml` 失败，标记为 `阻塞`，不要继续执行 Runner case。若出现 locale warning，只记录为环境提示；只要退出码和 Runner 输出符合预期，不作为阻塞。

## 5. 测试工具选型

| Case / 场景 | 现有工具是否覆盖 | 选用工具 | 是否需要新增 case / 脚本 | 断言方式 | 选择理由 | 缺口 / 风险 |
| --- | --- | --- | --- | --- | --- | --- |
| TC-001~008 启动、状态文件、target 初始化 | 是 | Runner CLI + shell 文件检查 | 否 | 退出码、stdout、目录、`run.json`、`checklist.json` | CLI 是真实入口，能直接验证用户路径 | 需准确记录 run_id |
| TC-009~023 Artifact 门禁 | 是 | Runner CLI + Markdown artifact | 否 | `complete` 退出码、validation_errors、状态推进 | 门禁逻辑依赖 artifact 内容，直接构造最可控 | 模板占位内容不能误当有效内容 |
| TC-026~028 中断恢复 | 是 | `status` / `next` | 否 | stdout、blocked errors、artifact mtime | 验证不依赖聊天上下文的恢复能力 | artifact exists 提示可能只部分覆盖 |
| TC-029~037 预留命令和非目标边界 | 是 | Runner CLI + `git diff` 观察 | 否 | 命令失败、规则资产无 diff、无远端调用 | 确认 Runner 不越权、不替代业务测试 | 远端/团队渠道未调用以命令路径和人工观察确认 |
| TC-038~040 配置异常和状态损坏 | 部分 | `/private/tmp` 测试副本 + Runner CLI | 否 | stderr、退出码、状态文件是否被覆盖 | 破坏类 case 不污染主工作区 | 当前实现可能 traceback，需记录为改进项 |
| TC-041 full happy path | 是 | Runner CLI + 8 个合法 artifact | 否 | 全步骤 completed、validate 输出 | 验证跨步骤状态传递完整链路 | artifact 准备较多 |
| TC-042~043 complete 幂等 | 是 | Runner CLI + JSON 前后对比 | 否 | `completed_at`、`current_step` 不变 | 幂等是重复执行和恢复安全性的关键 | 需保存前后状态快照 |

## 公共准备步骤

后续命令均在 `sample-test-repo` 仓库根目录执行。

### 6.1 环境记录

```bash
pwd
git status --short
python3 --version
python3 -c 'import yaml; print(yaml.__version__)'
test -f toolset/test_agent_runner.py
test -f config/test_agent_workflows/test_execution.yaml
rg -n '^\.runs/' .gitignore
python3 toolset/test_agent_runner.py --help
```

通过标准：

- 当前目录为 `sample-test-repo` 仓库根目录。
- Python 和 PyYAML 可用。
- Runner 和 workflow 配置存在。
- `.runs/` 已在 `.gitignore` 中。
- help 输出包含 `start/status/next/complete/validate/render`。

### 6.2 run_id 记录约定

每次 `start` 后，从 stdout 记录：

```text
run_id: <RUN_ID>
run_dir: .runs/test_execution/<RUN_ID>
```

后续命令用以下占位表示：

```bash
RUN_ID="<start 输出的 run_id>"
RUN_DIR=".runs/test_execution/${RUN_ID}"
```

### 6.3 Artifact 写入约定

测试执行时可以用编辑器或 `apply_patch` 写入 artifact。每个 artifact 必须写到 `RUN_DIR/artifacts/` 下对应文件。

合法 `input_sources` 示例：

```markdown
# 输入资料

需求、设计、测试用例和实现文件均已确认。

# 已确认项

- Runner CLI 已实现。
- Workflow 配置存在。

# 待确认项

- 无阻塞待确认项。
```

合法 `tool_selection` 示例：

```markdown
| Case / 场景 | 现有工具是否覆盖 | 选用工具 | 是否需要新增 case / 脚本 | 断言方式 | 选择理由 | 缺口 / 风险 |
| --- | --- | --- | --- | --- | --- | --- |
| Runner-TC-001 | 是 | Runner CLI | 否 | 文件树 + stdout | 直接验证 start 行为 | 无 |
```

## 逐 Case 实施步骤

本节按测试用例的功能分组组织执行步骤。执行时必须保持 run_id、命令输出和状态文件证据可追溯；同一组内若前置步骤未通过，不得继续执行依赖它的后续 case。

### 7.1 TC-001~TC-008：启动、target 和状态文件

执行 `execution_guide` target：

```bash
python3 toolset/test_agent_runner.py start test_execution --name EXAMPLE-1001 --target execution_guide
```

检查：

```bash
test -f "${RUN_DIR}/run.json"
test -f "${RUN_DIR}/checklist.json"
test -d "${RUN_DIR}/artifacts"
test -d "${RUN_DIR}/logs"
python3 -m json.tool "${RUN_DIR}/run.json"
python3 -m json.tool "${RUN_DIR}/checklist.json"
python3 toolset/test_agent_runner.py next "${RUN_ID}"
```

通过标准：

- start 退出码为 0。
- stdout 包含 `run_id`、`next_step: input_sources`、`run_dir`。
- `run.json` 包含 `run_id/workflow_id/name/target/status/created_at/updated_at/current_step/run_dir/target_step/blocked_reason`。
- `checklist.json` 包含 8 个步骤，每步包含 `id/name/required/status/output/depends_on/completed_at/validation_errors/notes`。
- `execution_guide` target 下，`input_sources` 到 `execution_guide` 为 required；`execution_record/report/reflection` 为 `not_required_yet`。
- `next` 输出当前步骤 `input_sources` 和 artifact 路径。

同名需求重复 start 时，应生成新的 timestamp run_id，不覆盖旧 run。非法 target 应失败且不创建对应 run。

### 7.2 TC-009~TC-023：Artifact 门禁

按 workflow 顺序推进，不允许跳过依赖。

缺 artifact：

```bash
python3 toolset/test_agent_runner.py complete "${RUN_ID}" input_sources
```

通过标准：

- 退出码为 2。
- 输出 `BLOCKED: artifact not found`。
- `checklist.json` 中对应 step 为 `blocked`。

heading 缺失和空内容：

- 缺 required heading 时，complete 应 blocked，并记录 `missing heading`。
- 只有 heading 但正文为空时，complete 应 blocked，并记录 `heading has no content`。
- 修正为合法内容后，complete 应输出 `OK: <step_id> completed`，并推进 `current_step`。

依赖门禁：

```bash
python3 toolset/test_agent_runner.py complete "${RUN_ID}" environment_precheck
```

若 `scope` 未完成，应失败并输出 `dependency not met: scope`。

`tool_selection` 负向场景：

- 无 Markdown 表格。
- 表格缺 required column。
- 表头完整但无数据行。
- 数据行全是 `<tool>`、`TBD`、`待补充` 或空值。

通过标准：

- 四类场景均 blocked。
- validation_errors 分别体现 `no table found`、`missing column` 或 `no valid data rows`。
- 写入有效工具选型表后，`tool_selection` 应 completed，并推进到 `execution_guide`。

`execution_guide` target reached：

- 完成到 `tool_selection` 后，写入合法 `05_execution_guide.md`。
- complete `execution_guide` 后应输出 `workflow completed`。
- validate 应输出 `target achieved`。
- `execution_record/report/reflection` 保持 `not_required_yet`。

### 7.3 TC-026~TC-028、TC-042~TC-043：中断恢复与幂等

中断恢复：

```bash
python3 toolset/test_agent_runner.py status "${RUN_ID}"
python3 toolset/test_agent_runner.py next "${RUN_ID}"
```

通过标准：

- `status` 展示每个 step 的状态。
- `next` 展示当前步骤、artifact 路径和校验要求。
- 若当前步骤 blocked，`next` 应展示 validation_errors。

artifact 已存在但未 complete：

```bash
BEFORE_MTIME=$(stat -f "%m" "${RUN_DIR}/artifacts/04_tool_selection.md")
python3 toolset/test_agent_runner.py next "${RUN_ID}"
AFTER_MTIME=$(stat -f "%m" "${RUN_DIR}/artifacts/04_tool_selection.md")
```

通过标准：

- `next` 不修改 artifact。
- mtime 不变化。
- 若实现没有显式提示 artifact exists，应记录为“当前口径部分覆盖 / 改进建议”。

complete 幂等：

- 对已 completed 的 `input_sources` 再次 complete。
- 对 current_step 之前已 completed 的 `scope` 再次 complete。

通过标准：

- stdout 包含 `already completed: <step_id>`。
- `completed_at` 不变。
- `current_step` 不倒退、不重复推进。

### 7.4 TC-029~TC-037：预留能力和非目标边界

skip 不支持：

```bash
python3 toolset/test_agent_runner.py skip "${RUN_ID}" input_sources
python3 toolset/test_agent_runner.py complete "${RUN_ID}" input_sources --skip
```

通过标准：

- 命令失败。
- 状态文件不被修改为 `skipped`。

set-target 不支持：

```bash
python3 toolset/test_agent_runner.py set-target "${RUN_ID}" report
```

通过标准：

- 命令失败。
- `run.json.target` 不变。

blocked validate：

```bash
python3 toolset/test_agent_runner.py validate "${RUN_ID}"
```

通过标准：

- 输出 `target not achieved`。
- 列出 blocked step 和原因。

render：

```bash
python3 toolset/test_agent_runner.py render "${RUN_ID}"
```

执行记录按当前实现记录实际行为：

- target 未完成时，若 render 输出已完成 artifact，记录为“当前实现行为”，并列入是否收紧的改进建议。
- target 完成后，render 应输出已完成步骤的 Markdown。

非目标边界：

```bash
git diff -- AGENTS.md .cursor/skills docs/ai_workflows.md
```

通过标准：

- Runner 不修改规则资产。
- Runner 不执行 SSH。
- Runner 不执行 auto_case / pytest / 业务 case。
- Runner 不调用团队渠道 webhook。

### 7.5 TC-038~TC-040：配置异常和状态损坏

这些 case 必须在一次性测试副本中执行，避免污染主工作区。

准备副本：

```bash
TEST_COPY="/private/tmp/sample-test-repo-runner-check-$(date +%Y%m%d_%H%M%S)"
rsync -a --exclude .git --exclude .runs ./ "${TEST_COPY}/"
cd "${TEST_COPY}"
```

workflow config 缺失：

- 在测试副本中临时改名 `config/test_agent_workflows/test_execution.yaml`。
- 执行 start。
- 预期失败，不创建半成品 run。

workflow config 异常：

- 在测试副本中构造非法 YAML 或重复 step id。
- 执行 start。
- 预期失败并输出配置错误。
- 若重复 step id 未失败，应记录为缺陷或改进项。

checklist 损坏：

- 在测试副本中 start 一个 run。
- 将 `checklist.json` 改成非法 JSON。
- 执行 `status` 和 `next`。

通过标准：

- 命令失败。
- 不覆盖原始损坏文件。
- 若直接抛 traceback，应记录为友好错误提示改进项。

### 7.6 TC-041：full target 端到端 happy path

```bash
python3 toolset/test_agent_runner.py start test_execution --name HAPPY --target full
```

依次写入 8 个合法 artifact，并按顺序执行：

```bash
python3 toolset/test_agent_runner.py complete "${RUN_ID}" input_sources
python3 toolset/test_agent_runner.py complete "${RUN_ID}" scope
python3 toolset/test_agent_runner.py complete "${RUN_ID}" environment_precheck
python3 toolset/test_agent_runner.py complete "${RUN_ID}" tool_selection
python3 toolset/test_agent_runner.py complete "${RUN_ID}" execution_guide
python3 toolset/test_agent_runner.py complete "${RUN_ID}" execution_record
python3 toolset/test_agent_runner.py complete "${RUN_ID}" report
python3 toolset/test_agent_runner.py complete "${RUN_ID}" reflection
python3 toolset/test_agent_runner.py validate "${RUN_ID}"
```

通过标准：

- 8 个步骤均为 `completed`。
- `run.json.status=completed`。
- validate 输出 `target achieved`。

## 证据采集

每个 case 至少采集以下证据之一：

- 命令退出码。
- stdout / stderr 关键行。
- `run.json` 和 `checklist.json` 的关键字段。
- artifact 文件路径和关键内容。
- `git diff` 证明规则资产未被 Runner 修改。
- `/private/tmp` 测试副本路径和异常 case 输出。

执行记录中不要只写“正常”，必须能回到具体 run_id、step_id、命令输出或状态文件复核。

## 通过标准

整体通过标准：

- 所有主路径 case 按预期通过。
- 负向门禁能阻止错误 artifact 或错误依赖。
- target 模式能正确判断 `not_required_yet` 和 `target achieved`。
- 中断恢复不依赖聊天上下文。
- 重复 complete 不破坏状态。
- 配置破坏类 case 不污染主工作区。
- `.runs/` 不进入 git 提交范围。

若某个 case 结果与测试用例预期不一致，但符合当前实现，应记录为“当前实现行为”，并给出是否需要修正实现或修正测试预期的建议。

## 失败 / 阻塞处理

遇到失败时按以下顺序处理：

1. 记录 run_id、step_id、命令、退出码、stdout/stderr。
2. 检查 `run.json` 和 `checklist.json` 是否与命令结果一致。
3. 判断失败属于用例构造问题、实现问题、配置问题还是环境问题。
4. 若是 artifact 内容不满足门禁，修正 artifact 后重跑同一步 complete。
5. 若是配置异常或状态损坏类 case，确认是否在测试副本中执行；不得在主工作区破坏配置。
6. 若证据不足，标记为 `阻塞`，不要写成通过或失败。

## 11. 恢复步骤

本测试不要求删除 `.runs/`。恢复动作只记录，不自动清理：

| 步骤 | 操作 | 检查 / 记录 |
| --- | --- | --- |
| 1 | 记录本次生成的 run_id | 写入执行记录 |
| 2 | 确认 `.runs/` 未进入 git 暂存 | `git status --short --ignored .runs` |
| 3 | 确认规则资产未被 Runner 修改 | `git diff -- AGENTS.md .cursor/skills docs/ai_workflows.md` |
| 4 | 若使用测试副本 | 记录副本路径；不自动删除 |

如需清理 `.runs/` 或 `/private/tmp` 测试副本，必须由用户明确授权后再执行。

## 12. 执行记录要求

执行时同步创建执行记录，建议路径：

```text
docs/methodology/agent-testing-methodology/test_agent_workflow_runner_execution_record_<YYYYMMDD>_local.md
```

执行记录至少包含：

- 执行摘要。
- Python / PyYAML / git 状态。
- 每个 case 的状态：通过 / 失败 / 当前口径部分覆盖 / 阻塞 / 本轮不执行。
- 每个 case 的 run_id。
- 关键 stdout / stderr 摘要。
- `run.json` / `checklist.json` 断言结果。
- 与测试用例预期不一致的实现行为。
- 恢复记录。
- 测试工程反思候选。
