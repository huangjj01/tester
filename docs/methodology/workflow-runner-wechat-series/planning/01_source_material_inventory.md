# Workflow Runner 专题素材清单

## 1. 已有可直接支撑写作的材料

## 核心设计材料

| 材料 | 路径 | 可支撑内容 |
| --- | --- | --- |
| Runner 设计落地文档 | `docs/methodology/agent-testing-methodology/test_agent_workflow_runner_design.md` | 背景、目标、非目标、8 步 workflow、target 模式、门禁规则、目录结构 |
| Runner 测试用例 | `docs/methodology/agent-testing-methodology/test_agent_workflow_runner_test_cases.md` | 文章中提“如何验证 Runner”时的 case 设计依据 |
| Runner 测试实施指南 | `docs/methodology/agent-testing-methodology/test_agent_workflow_runner_test_execution_guide.md` | 如何组织验证动作、范围和工具选型 |

## 执行与验证材料

| 材料 | 路径 | 可支撑内容 |
| --- | --- | --- |
| 本地执行记录 | `docs/methodology/agent-testing-methodology/test_agent_workflow_runner_execution_record_20260520_local.md` | 首轮验证结果、失败点、覆盖矩阵、观察项 |
| 失败用例复测记录 | `docs/methodology/agent-testing-methodology/test_agent_workflow_runner_retest_record_20260520_local.md` | 修复闭环、失败点复测结果 |

## 体系背景材料

| 材料 | 路径 | 可支撑内容 |
| --- | --- | --- |
| 项目规则入口 | `AGENTS.md` | 为什么现有规则已经很多，但仍需要 Runner |
| Workflow catalog | `docs/ai_workflows.md` | workflow/skill 路由体系的背景 |
| 已有方法论总规划 | `docs/methodology/agent-testing-methodology/publish-series/00_series_plan.md` | 现有系列的表达方式、风格、定位 |

## 现有图形与视觉资产

| 材料 | 路径 | 可支撑内容 |
| --- | --- | --- |
| premium 逻辑图 SVG | `docs/methodology/agent-testing-methodology/publish-series/diagrams/premium/` | 方法论主视觉、流程逻辑图、架构图 |
| WeChat 封面图 | `docs/methodology/agent-testing-methodology/publish-series/diagrams/covers/` | 封面版式参考 |
| Premium PNG 输出 | `docs/methodology/agent-testing-methodology/publish-series/diagrams/output_premium/` | 直接预览、公众号插图 |

## 2. 每篇文章建议绑定的素材

| 篇次 | 必带素材 | 可选素材 |
| --- | --- | --- |
| 第 1 篇 | `AGENTS.md`、`docs/ai_workflows.md`、设计文档背景段 | 现有总规划中的问题定义表述 |
| 第 2 篇 | 设计文档目标、非目标、适用范围 | 资产映射图、体系结构图 |
| 第 3 篇 | 设计文档总体设计、target 模式、Runner 职责边界 | `toolset/test_agent_runner.py` 命令截图 |
| 第 4 篇 | 8 步 workflow、门禁规则、run 目录结构 | workflow config 截图、状态文件片段 |
| 第 5 篇 | 执行记录、复测记录、覆盖矩阵 | 失败点对比图、复测前后结果图 |
| 第 6 篇 | 设计文档非目标、执行记录反思候选 | 后续 roadmap 草图 |

## 3. 明确不能直接写死的内容

下面这些内容如果没有新增证据，不建议现在就写进正文：

- “已经在多个复杂 workflow 中全面落地”
- “团队效率提升 xx%”
- “缺陷拦截率提升 xx%”
- “线上事故显著下降”
- “已经沉淀为组织级平台能力”

这些表述要么需要真实统计，要么需要更长周期落地数据，现在仓库材料还不足以支撑。

## 4. 正式成稿前建议补充的现场材料

如果后面准备正式发公众号，建议补齐下面这些高传播材料：

| 材料类型 | 作用 | 当前状态 |
| --- | --- | --- |
| Runner CLI 真机截图 | 提升可信度和代入感 | 待补 |
| `status / next / complete / validate` 的连续操作截图 | 让读者一眼看懂 Runner 在干什么 | 待补 |
| run 目录结构截图 | 强化“可追溯、可恢复” | 待补 |
| 失败 case 前后对比图 | 第 5 篇传播力很强 | 待补 |
| 作者视角的真实工程判断 | 拉开和普通技术说明文的差距 | 待补 |

## 5. 建议的事实标注口径

后续写作时，建议统一用词，避免事实边界模糊。

| 场景 | 推荐口径 |
| --- | --- |
| 已在仓库中形成文档与实现 | “已设计并完成本地实现/本地验证” |
| 只做过本地测试 | “在本地仓库环境完成验证” |
| 有失败后修复与复测 | “经过首轮测试暴露问题后完成修复，并已回归复测” |
| 尚未覆盖更多 workflow | “当前版本聚焦测试实施 workflow，其他 workflow 暂未纳入本文结论” |

## 6. 一句话总判断

这套专题目前最有力的写法，不是“我们做了一个很厉害的系统”，而是：

**我们把一套原本停留在文档层的 Agent 测试约束，往前推进了一步，做成了一个真实可验证、且已经过测试拷问的轻量门禁流程。**
