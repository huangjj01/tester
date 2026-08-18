# Test Agent Workflow Runner 测试执行记录

## 执行摘要

本次根据 `docs/methodology/agent-testing-methodology/test_agent_workflow_runner_test_execution_guide.md` 对 `<测试实施 Runner>` 完成本地功能测试。

| 项目 | 结果 |
| --- | --- |
| 执行日期 | 2026-05-20 |
| 执行环境 | 本地 `sample-test-repo` 仓库 |
| Runner 执行记录 run_id | `20260520_160449_test-agent-runner-execution` |
| 被测文件 | `toolset/test_agent_runner.py` |
| 被测配置 | `config/test_agent_workflows/test_execution.yaml` |
| Python | `Python 3.8.18` |
| PyYAML | `6.0.3` |
| `.runs/` gitignore | 已确认：`.gitignore` 包含 `.runs/` |
| 总体结果 | 43 条测试用例中 41 条通过、2 条失败 |

失败项：

- `Runner-TC-002`：同名需求连续快速 `start` 时，run_id 只精确到秒，出现同秒冲突，第二次 start 复用了相同 run_id。
- `Runner-TC-039`：非法 YAML 能失败，但重复 step id 未被拒绝，Runner 仍创建 run。

补充观察：

- `Runner-TC-032`：target 未完成时，`render` 当前实现会输出已完成 artifact，已按“当前实现行为”记录。
- `Runner-TC-040`：`checklist.json` 损坏时命令失败且不覆盖原文件，但当前实现直接抛 traceback，建议后续优化为友好错误。
- 多数命令输出包含 locale warning：`setlocale: LC_ALL: cannot change locale (C.UTF-8)`，不影响退出码和 Runner 行为判断。

## 测试工具选型结果

| 场景 | 实际使用工具 | 结果 |
| --- | --- | --- |
| CLI 基础行为 | Runner CLI + 本地 harness | 已覆盖 |
| Artifact 门禁 | Runner CLI + Markdown artifact | 已覆盖 |
| target 模式 | Runner CLI + `run.json` / `checklist.json` | 已覆盖 |
| 中断恢复与幂等 | Runner CLI + JSON / mtime 对比 | 已覆盖 |
| 配置异常 | `/private/tmp` 最小测试副本 | 已覆盖 |
| 非目标边界 | Runner CLI + `git diff` 观察 | 已覆盖 |

本次未新增仓库内测试脚本。批量执行 harness 仅在当前会话中使用，结果已沉淀到本执行记录。

## 逐 case 执行明细

| Case ID | 结果 | 关键证据 / 说明 |
| --- | --- | --- |
| ENV-001 | 通过 | `python=Python 3.8.18`，`yaml=6.0.3`，Runner help 包含 6 个子命令 |
| Runner-TC-001 | 通过 | `run_id=20260520_160844_EXAMPLE-1001`，基础目录和状态文件创建成功 |
| Runner-TC-002 | 失败 | 连续同秒同名 start 得到相同 `run_id=20260520_160844_EXAMPLE-1001` |
| Runner-TC-003 | 通过 | 非法 target 返回 `invalid target: invalid_target` |
| Runner-TC-004 | 通过 | `run.json` 字段完整 |
| Runner-TC-005 | 通过 | `checklist.json` 8 个步骤字段完整 |
| Runner-TC-006 | 通过 | `execution_guide` target 下后续三步为 `not_required_yet` |
| Runner-TC-007 | 通过 | `full` target 下 8 个步骤均 required |
| Runner-TC-008 | 通过 | `next` 初始输出 `current_step: input_sources` |
| Runner-TC-009 | 通过 | 缺 artifact 返回 `BLOCKED: artifact not found` |
| Runner-TC-010 | 通过 | 缺 `待确认项` heading 返回 blocked |
| Runner-TC-011 | 通过 | `待确认项` 空内容返回 blocked |
| Runner-TC-012 | 通过 | `input_sources` completed 后推进到 `scope` |
| Runner-TC-013 | 通过 | 未完成 `scope` 时 complete `environment_precheck` 返回 `dependency not met: scope` |
| Runner-TC-014 | 通过 | `environment_precheck` 缺 `恢复基线` 返回 blocked |
| Runner-TC-015 | 通过 | `tool_selection` 无表格返回 `no table found` |
| Runner-TC-016 | 通过 | `tool_selection` 缺列返回 `missing column` |
| Runner-TC-017 | 通过 | 表头完整但无数据行返回 `no valid data rows` |
| Runner-TC-018 | 通过 | 全占位数据行返回 `no valid data rows` |
| Runner-TC-019 | 通过 | 有效工具选型表通过并推进到 `execution_guide` |
| Runner-TC-020 | 通过 | 未完成 `tool_selection` 时阻止 `execution_guide` |
| Runner-TC-021 | 通过 | `execution_guide` complete 后 `validate` 返回 `target achieved` |
| Runner-TC-022 | 通过 | `report` target 未到 `execution_record` 时 validate blocked |
| Runner-TC-023 | 通过 | report 缺 `剩余风险` 返回 blocked |
| Runner-TC-024 | 通过 | `full` target 完成 report 后 validate blocked，提示 `reflection` pending |
| Runner-TC-025 | 通过 | reflection 完成后 `validate` 返回 `target achieved` |
| Runner-TC-026 | 通过 | `status` 展示各 step 状态 |
| Runner-TC-027 | 通过 | blocked 后 `next` 展示 `validation_errors`，run_id `20260520_161007_RECOVERY-BLOCKED` |
| Runner-TC-028 | 通过 | `next` 不修改已存在 artifact，mtime 前后一致，run_id `20260520_161009_MTIME-PARTIAL` |
| Runner-TC-029 | 通过 | `skip` 和 `complete --skip` 均不支持 |
| Runner-TC-030 | 通过 | `set-target` 不支持，`run.json.target` 不变 |
| Runner-TC-031 | 通过 | blocked 状态下 validate 返回 `target not achieved` 并列出原因 |
| Runner-TC-032 | 通过 | target 未完成时 `render` 输出已完成 artifact；记录为当前实现行为 |
| Runner-TC-033 | 通过 | target 完成后 `render` 输出已完成 Markdown |
| Runner-TC-034 | 通过 | Runner 执行前后规则资产 diff 长度一致 |
| Runner-TC-035 | 通过 | 未执行 SSH |
| Runner-TC-036 | 通过 | 未执行 auto_case、pytest 或业务脚本 |
| Runner-TC-037 | 通过 | 未调用团队渠道 webhook |
| Runner-TC-038 | 通过 | workflow config 缺失返回 `workflow config not found` |
| Runner-TC-039 | 失败 | 非法 YAML 失败符合预期；重复 step id 未失败，仍创建 `run_id=20260520_160904_DUP-STEP` |
| Runner-TC-040 | 通过 | 损坏 `checklist.json` 后 `status/next` 失败且不覆盖原文件；但错误提示为 traceback |
| Runner-TC-041 | 通过 | `full` happy path 完成，`run_id=20260520_160905_HAPPY`，validate 返回 `target achieved` |
| Runner-TC-042 | 通过 | 重复 complete `input_sources` 返回 `already completed`，`completed_at` 不变 |
| Runner-TC-043 | 通过 | 重复 complete 已完成前置 `scope` 不影响 `current_step=tool_selection` |

## 覆盖矩阵

| 覆盖点 | 对应 case | 状态 |
| --- | --- | --- |
| start 创建 run | TC-001 | 通过 |
| run_id 唯一性 | TC-002 | 失败 |
| target 合法性 | TC-003、TC-006、TC-007、TC-021、TC-022、TC-024、TC-025 | 通过 |
| schema | TC-004、TC-005 | 通过 |
| next/status | TC-008、TC-026、TC-027、TC-028 | 通过 |
| artifact heading 门禁 | TC-009~TC-014、TC-023 | 通过 |
| tool_selection 表格门禁 | TC-015~TC-019 | 通过 |
| 依赖门禁 | TC-013、TC-020 | 通过 |
| render | TC-032、TC-033 | 通过，含当前实现行为记录 |
| 非目标边界 | TC-034~TC-037 | 通过 |
| 配置异常 | TC-038、TC-039 | TC-039 失败 |
| 状态损坏 | TC-040 | 通过，错误提示可改进 |
| full happy path | TC-041 | 通过 |
| complete 幂等 | TC-042、TC-043 | 通过 |

## 恢复记录

| 项目 | 结果 |
| --- | --- |
| `.runs/` | 本次产生多个 run，按规则不自动删除 |
| `/private/tmp` 测试副本 | 已产生 `/private/tmp/runner-check-1779264543209`，按规则不自动删除 |
| 规则资产 | Runner 执行前后 `AGENTS.md`、`.cursor/skills`、`docs/ai_workflows.md` 的 diff 未发生新增变化 |
| 远端环境 | 未连接远端，无需恢复 |
| 团队渠道 / webhook | 未调用，无需恢复 |

如需清理 `.runs/` 或 `/private/tmp` 测试副本，需用户明确授权后再执行。

## 未覆盖 / 阻塞项

无阻塞项。

未覆盖项：

- 多 Agent session 并发写同一个 run：设计中已明确第一版不覆盖。
- 网络级确认“未调用 SSH / webhook”：本轮通过命令路径和本地执行观察确认，未做系统调用级 hook。

## 测试工程反思候选

本次暴露的规则缺口：

- 测试实施指南本身必须先跑 Runner 的规则已经有效，本次实际拦截了标题不匹配和标题空内容问题，说明门禁有价值。

本次暴露的 skill / 执行流程缺口：

- 执行测试记录时，也应明确要求使用 Runner `execution_record` target；当前已按 `AGENTS.md` 执行。

本次暴露的工具缺口：

- Runner 的 run_id 生成只精确到秒，连续 start 存在冲突。
- Workflow 配置加载缺少重复 step id 校验。
- 状态 JSON 损坏时缺少友好错误提示。

建议沉淀项：

- 将“run_id 必须具备同秒唯一性”补入设计或实现验收标准。
- 将“workflow 配置 step id 唯一”补入配置 schema 校验。
- 将 JSON 状态文件损坏的错误提示纳入用户友好性验收。
