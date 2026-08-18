# Test Agent Workflow Runner 失败用例复测记录

## 执行摘要

本次针对上一轮失败的 `<测试实施 Runner>` 用例进行回归复测。

| 项目 | 结果 |
| --- | --- |
| 执行日期 | 2026-05-20 |
| 复测范围 | `Runner-TC-002`、`Runner-TC-039` |
| Runner 复测记录 run_id | `20260520_161825_142063_test-agent-runner-failed-retest` |
| 被测文件 | `toolset/test_agent_runner.py` |
| 被测配置 | `config/test_agent_workflows/test_execution.yaml` |
| 复测结论 | 2 条失败 case 均已复测通过 |

说明：

- `Runner-TC-039` 在执行中拆成两个检查点：非法 YAML、重复 step id。
- 本次未复跑全部 43 条 case，只针对上一轮失败项做回归。

## 测试工具选型结果

| 场景 | 实际使用工具 | 断言方式 | 结果 |
| --- | --- | --- | --- |
| `Runner-TC-002` 同名快速 start 唯一性 | Runner CLI | 两次 stdout 的 run_id 不同，两个 run 目录均存在 | 通过 |
| `Runner-TC-039A` 非法 YAML | `/private/tmp` 测试副本 + Runner CLI | `start` 退出码非 0，错误指向 YAML 解析失败 | 通过 |
| `Runner-TC-039B` 重复 step id | `/private/tmp` 测试副本 + Runner CLI | `start` 退出码非 0，错误包含重复 step id | 通过 |

## 逐 case 执行明细

| Case ID | 复测结果 | 关键证据 |
| --- | --- | --- |
| `Runner-TC-002` | 通过 | 连续快速 start 同名需求，第一次 `run_id=20260520_162001_054969_EXAMPLE-1001-RETEST`，第二次 `run_id=20260520_162001_330722_EXAMPLE-1001-RETEST`，两个 run_id 不同 |
| `Runner-TC-039A` | 通过 | 非法 YAML 退出码为 1，错误信息包含 `expected ',' or ']', but got '<stream end>'` |
| `Runner-TC-039B` | 通过 | 重复 step id 退出码为 1，错误信息为 `workflow config error: duplicate step id(s): input_sources` |

## 覆盖矩阵

| 上轮失败点 | 复测 case | 当前状态 |
| --- | --- | --- |
| 同秒同名 run_id 冲突 | `Runner-TC-002` | 已修复，复测通过 |
| 重复 step id 未被拒绝 | `Runner-TC-039B` | 已修复，复测通过 |
| 非法 YAML 配置失败路径 | `Runner-TC-039A` | 仍通过 |

## 恢复记录

| 项目 | 结果 |
| --- | --- |
| `.runs/` | 本次产生复测 run，按规则不自动删除 |
| `/private/tmp` 测试副本 | 已产生 `/private/tmp/runner-retest-1779265201337`，按规则不自动删除 |
| 主工作区 workflow 配置 | 未修改 |
| 远端环境 | 未连接，无需恢复 |
| 团队渠道 / webhook | 未调用，无需恢复 |

如需清理 `.runs/` 或 `/private/tmp` 测试副本，需用户明确授权后再执行。

## 未覆盖 / 阻塞项

无阻塞项。

未覆盖项：

- 本次只复测上轮失败 case，未复跑全部 43 条测试用例。

## 测试工程反思候选

本次复测说明 Runner 对配置结构类缺陷已有更明确的失败输出，`run_id` 也已具备同秒唯一性。建议保留这两条用例作为后续回归的固定冒烟项，尤其是在修改 run_id 生成、workflow 配置加载、schema 校验逻辑时优先执行。
