# 阶段 3：资产映射

论文题目：

```text
从用例设计到执行报告：一种可落地的 Agent 测试工程方法论
```

## 1. 阶段目标

阶段 3 的目标是把当前项目中的真实资产映射到“任务路由到执行报告闭环模型”，说明这些资产分别解决什么问题、位于闭环哪一环、还存在哪些缺口。

本阶段不重复解释每个文件的全部内容，而是回答：

```text
这些 rules、workflows、skills、dictionaries、templates 和测试文档如何共同支撑 Agent 完成功能测试闭环？
```

## 2. 资产总览

| 资产类型 | 资产路径 | 主要作用 |
| --- | --- | --- |
| rule | `.cursor/rules/00-global-team-standards.mdc` | 全局红线、强制 skill 入口、证据链与结论约束 |
| rule | `.cursor/rules/01-deploy-process-management.mdc` | 部署流程入口提示，具体流程转交 `deploy_install` |
| workflow | `docs/ai_workflows.md` | 项目级 workflow catalog，负责把用户请求路由到日切、失败排查、部署、远端 SSH、auto_case 等主流程 |
| skill | `.cursor/skills/test-case-design-checklist/SKILL.md` | 测试用例设计流程 |
| skill | `.cursor/skills/feature_test_execution_docs/SKILL.md` | 测试实施指南、工具选型、执行记录、报告闭环 |
| skill | `.cursor/skills/deploy_install/SKILL.md` | 包安装、组件部署、guard 停启与部署约束 |
| skill | `.cursor/skills/triage_failure/SKILL.md` | auto_case / stability 失败排查和分类复核 |
| skill | `.cursor/skills/log_layers/SKILL.md` | 正式调查前的日志层和证据层入口 |
| dictionary | `docs/daycut_behavior_dictionary.md` | 日切 / 维护 / 稳定性场景的正常、异常、灰区判断基线 |
| defect library | `docs/known_defects/known_defects.yaml` | 已知缺陷库，用于正式调查前命中历史问题和反例 |
| template | `docs/daycut_report_template.md` | 日切正式报告结构，约束场景窗口、正常列表、问题列表、关键分类和结论 |
| schema | `docs/investigation_checklist_schema.md` | 调查执行清单结构，用于约束证据勾稽和未完成项 |
| template | `.cursor/skills/feature_test_execution_docs/references/test_execution_guide_template.md` | 通用测试实施指南模板 |
| template | `.cursor/skills/feature_test_execution_docs/references/test_execution_record_template.md` | 通用测试执行记录模板 |
| template | `.cursor/skills/feature_test_execution_docs/references/team_report_template.md` | 团队渠道测试报告模板 |
| case artifact | `docs/iterations/EXAMPLE-1001-sample-client-fake-clock/test_case_design.md` | EXAMPLE-1001 测试用例设计产物 |
| execution artifact | `docs/iterations/EXAMPLE-1001-sample-client-fake-clock/test_execution_guide.md` | EXAMPLE-1001 测试实施指南 |
| execution artifact | `docs/iterations/EXAMPLE-1001-sample-client-fake-clock/test_execution_record_20260514_test_host.md` | EXAMPLE-1001 测试执行记录和覆盖矩阵 |

## 3. 方法论阶段映射

| 方法论阶段 | 对应资产 | 解决的问题 | 当前成熟度 |
| --- | --- | --- | --- |
| Workflow 任务路由 | `docs/ai_workflows.md`、`AGENTS.md` AI 工作流入口 | 防止 Agent 一开始选错流程；明确主 workflow、子流程、必读文档和输出结构 | 已成型，需持续补充更多任务类型 |
| 测试用例设计 | `test-case-design-checklist`、`test_case_design.md` | 从需求、代码、通知中形成可执行、可回归、可 review 的 case | 较成熟 |
| 测试实施设计 | `feature_test_execution_docs`、`test_execution_guide_template.md`、`test_execution_guide.md` | 防止 Agent 从 case 直接跳到执行；补齐环境前置、工具选型、执行口径、逐 case runbook 和恢复步骤 | 已成型，需更多需求验证 |
| 测试实施中的工具选型 | `feature_test_execution_docs`、`test_execution_guide.md` | 要求先判断现有工具是否覆盖，是否需要新增 case、断言、mock 或脚本 | 初步成型，是测试实施设计的内部强制环节 |
| 执行与证据采集 | `test_execution_record_template.md`、`test_execution_record_20260514_test_host.md` | 逐 case 记录输入、输出、证据、状态和结论 | 已成型 |
| 可疑问题发现 | `00-global-team-standards.mdc`、`docs/daycut_behavior_dictionary.md`、`docs/known_defects/known_defects.yaml`、`log_layers`、`triage_failure`、执行记录 | 通过业务字典、已知缺陷、证据链、分类复核、未知项标记发现可疑问题 | 日切领域较成熟，通用业务字典仍需补 |
| 覆盖矩阵与报告 | `test_execution_record_template.md`、`team_report_template.md`、执行记录覆盖矩阵 | 从执行记录提炼结论，避免新增未验证判断 | 已成型 |
| 反思与沉淀 | `feature_test_execution_docs`、执行记录第 8 节 | 将规则缺口、skill 缺口、工具缺口作为候选沉淀项 | 已成型，需持续执行 |

## 4. 关键资产职责分析

### 4.1 `00-global-team-standards.mdc`

职责：

- 作为全局红线和 alwaysApply 约束。
- 固化删除、远端同步、中文沟通、修改前确认等不可违反规则。
- 提供强制 skill 入口，例如失败排查、部署、测试实施文档。
- 约束正式结论必须基于闭合证据链。

它解决的问题：

- 防止 Agent 因“同步”“清理”“对齐”等模糊指令误删文件。
- 防止 Agent 在证据不完整时输出正式结论。
- 防止专项流程散落在聊天中，要求进入对应 skill。

不应承担的职责：

- 不应承载长篇部署流程。
- 不应承载完整测试实施模板。
- 不应替代具体调查 skill。

在方法论中的位置：

```text
rules 层：约束红线和强制入口。
```

### 4.2 `01-deploy-process-management.mdc`

职责：

- 作为部署流程入口提示。
- 标明部署细节已迁移到 `deploy_install` skill。
- 保留少量强约束摘要。

它解决的问题：

- 避免旧规则和新 skill 双份漂移。
- 保留部署场景的快速入口。

不应承担的职责：

- 不再维护完整部署流程。
- 不再作为 alwaysApply 规则压入所有任务。

在方法论中的位置：

```text
rules 入口层：从 rule 跳转到 skill。
```

### 4.3 `docs/ai_workflows.md`

职责：

- 作为项目级 workflow catalog。
- 将用户请求映射到日切检查、测试失败排查、远端 SSH 调查、部署安装、auto_case 执行、稳定性生命周期、file comparison、某外部交易所 EXTP recon 等主流程。
- 为每类主流程声明主 skill、子流程、必读文档、证据要求和必须输出的结构。
- 在未命中现有 workflow 时，要求 Agent 显式说明未命中，而不是临时拼接流程。

它解决的问题：

- 防止 Agent 一开始选错任务路径。
- 防止 skill 虽然存在，但入口判断依赖上下文记忆。
- 防止复杂测试任务缺少主流程和子流程的编排关系。
- 防止正式输出缺少必须章节或证据勾稽。

不应承担的职责：

- 不替代具体 skill 的操作步骤。
- 不替代业务字典的判断口径。
- 不记录本次实际执行结果。

在方法论中的位置：

```text
workflow 路由层：从用户请求进入正确主流程。
```

当前缺口：

- 已覆盖 示例业务系统 高频测试任务，但跨业务域、跨项目的 workflow 泛化仍需更多样本验证。
- 通用功能测试 workflow 可以继续补充，例如“纯配置变更验证”“接口兼容性验证”“数据修复验证”。

### 4.4 `test-case-design-checklist`

职责：

- 设计测试用例和测试计划。
- 强制列出信息源。
- 强制做跨源甄别。
- 先需求分析，再 coverage checklist，再 test point，再 case。
- 用 checklist back-check 防止覆盖遗漏。

它解决的问题：

- 防止 Agent 直接按单一通知写 case。
- 防止需求基线冲突未解决就写预期结果。
- 防止用例只按技术模块罗列，缺少业务覆盖维度。

在方法论中的位置：

```text
测试用例设计阶段。
```

当前缺口：

- 与实施阶段的交接还可以更显式，例如在用例设计末尾固定输出“执行关注点 / 工具候选 / 环境前置风险”。

### 4.5 `feature_test_execution_docs`

职责：

- 从已有需求或测试用例生成测试实施指南。
- 强制补环境前置判断。
- 强制补测试工具选型。
- 生成执行记录、覆盖矩阵和最终报告模板。
- 要求执行记录不能把计划写成结果。

它解决的问题：

- 防止 Agent 从 case 直接跳到执行。
- 防止忽略包、版本、二进制、配置、env、mock、服务重启等前置条件。
- 防止只执行不记录。
- 防止报告阶段新增未验证结论。

在方法论中的位置：

```text
测试实施设计
  - 实施规划
  - 工具选型
  - 环境准备
执行记录
覆盖矩阵与报告
反思与沉淀
```

当前缺口：

- 已在日切领域形成业务字典实践，但尚未内置通用“业务字典 / 正常 / 异常 / 未知三分法”模板。
- 尚未提供执行记录质量检查脚本。
- 尚未提供从覆盖矩阵自动生成团队渠道报告草稿的脚本。

### 4.6 `docs/daycut_behavior_dictionary.md`

职责：

- 为日切、维护窗口、稳定性结果分析提供业务判断基线。
- 将现象划分为正常白名单、已知异常黑名单、灰区 / 字典外现象。
- 要求字典外现象先写事实、推断、待确认点，并交由人工复核。

它解决的问题：

- 防止 Agent 把已知正常现象误报为 bug。
- 防止 Agent 把字典外现象擅自定性为正常或异常。
- 将“异常嗅觉”从主观感觉转化为可查表、可复核、可补充的业务资产。

在方法论中的位置：

```text
可疑问题发现 / 业务判断基线 / 正常异常未知三分法。
```

当前缺口：

- 该字典目前是日切领域字典，仍需抽象出通用业务字典模板。
- 字典更新流程还需要和执行记录、反思候选更紧密地连接。

### 4.7 `docs/known_defects/known_defects.yaml`

职责：

- 保存已知缺陷、owner、状态和命中证据要求。
- 在正式调查前作为历史反例和已知问题检索入口。

它解决的问题：

- 防止 Agent 对已知问题重复从零分析。
- 防止遇到相似模式时漏掉历史反例。
- 帮助报告区分“新增疑点”“已知缺陷复现”“已知缺陷回归”。

在方法论中的位置：

```text
可疑问题发现 / 历史反例库 / 结论定性前置检查。
```

当前缺口：

- 仍需持续补充缺陷样本和标准化命中字段。
- 可进一步与自动化分析脚本联动，减少人工检索成本。

### 4.8 `deploy_install`

职责：

- 处理 构建包 包下载和组件 install。
- 固化推荐入口 `toolset/deploy_install.sh`。
- 明确部署禁用项，例如禁止 `deploy.sh restart`、禁止 `deploy.sh check`。
- 描述 guard 与组件进程管理关系。

它解决的问题：

- 防止 Agent 绕开推荐部署入口。
- 防止部署流程细节散落在 rules 和 AGENTS 中。
- 防止部署后不确认运行态。

在方法论中的位置：

```text
环境前置判断 / 部署准备 / 运行态确认。
```

当前缺口：

- 与不同环境的部署差异仍依赖脚本和人工口径持续维护。

### 4.9 `triage_failure`

职责：

- 排查 `auto_case` 或 `load-stability_test` 失败。
- 按测试类型分流。
- 通过脚本和日志逐层定位失败原因。
- 对 rejected / failed 做分类和样本复核。

它解决的问题：

- 防止 Agent 不读脚本直接跳日志。
- 防止把整桶 rejected / failed 直接判为正常。
- 防止缺少样本和证据就做桶级结论。

在方法论中的位置：

```text
可疑问题发现 / 失败分析 / 证据链补全。
```

当前缺口：

- 主要适用于 示例业务系统 自动化与稳定性场景，通用功能测试仍需要业务字典和工具矩阵补充。

### 4.10 `log_layers`

职责：

- 作为正式调查、问题排查、结果定性前的日志层入口。
- 帮助 Agent 明确不同证据层的职责。

它解决的问题：

- 防止只看单层日志定性。
- 防止混淆客户端、服务端、内部事件和下游原始日志。

在方法论中的位置：

```text
证据采集 / 可疑问题发现 / 结论约束。
```

当前缺口：

- 仍需与具体业务字典结合，才能判断某个现象属于正常、异常还是未知。

## 5. 模板资产映射

| 模板 | 对应阶段 | 固化内容 | 防止的问题 |
| --- | --- | --- | --- |
| `test_execution_guide_template.md` | 测试实施设计 | 输入资料、测试范围、环境前置、工具选型、公共准备、逐 case 步骤、恢复步骤 | 防止直接执行 case、遗漏环境和工具判断 |
| `test_execution_record_template.md` | 执行记录、覆盖矩阵、反思 | 执行摘要、口径说明、前置记录、工具选型、逐 case 明细、恢复记录、覆盖矩阵、未覆盖项、反思候选 | 防止结果只留在聊天窗口、状态不全、证据不全 |
| `team_report_template.md` | 测试报告、团队同步 | 总体结论、关键数字、通过项、失败/复测项、部分覆盖/未执行说明、环境恢复、最终结论 | 防止报告遗漏风险项或新增未验证结论 |

## 6. EXAMPLE-1001 案例资产映射

### 6.1 `test_case_design.md`

对应阶段：

```text
测试用例设计。
```

该文档体现的方法论点：

- 使用表格化 case 描述，保留“输入 -> sample-client 实际判断 -> 期望输出 / 证据”的可执行表达。
- 将不可构造输入单独标记，例如 `DayOrderExpireTime=0` 当前无法模拟。
- 将算法单入口与用户订单入口区分。
- 将 FC-018 从“日志必须打印”修正为“启动证据覆盖”，避免将非需求内容写成验收标准。

方法论价值：

- 说明用例设计需要结合真实系统输入能力，不把理论输入直接当可执行 case。
- 说明 case 需要为后续实施保留证据口径。

### 6.2 `test_execution_guide.md`

对应阶段：

```text
测试实施设计
  - 实施规划
  - 工具选型
  - 环境准备
恢复设计
```

该文档体现的方法论点：

- 明确执行前必须读取相关 skill。
- 明确 fake-clock 不只是下单验证，还依赖特定二进制、启动时 env、guard 重启生效。
- 区分普通 place-only case 和算法单触发入口。
- 明确普通单不需要 app.py，算法单 mock 行情需要 app.py。
- 将测试工具选型写入测试实施设计，而不是执行时临时判断。

方法论价值：

- 说明实施指南的核心是让下一个人或 Agent 可以一步一步操作。
- 说明“环境怎么用”必须先于业务 case。

### 6.3 `test_execution_record_20260514_test_host.md`

对应阶段：

```text
执行与证据采集
可疑问题发现
覆盖矩阵与报告
反思沉淀
```

该文档体现的方法论点：

- 记录执行摘要、执行口径和测试前置。
- 按 Case ID 排序记录逐 case 明细。
- 每个 case 有状态、关键标识、日志证据和结论。
- 覆盖矩阵统一收敛 18 个 case 状态。
- 对 FC-004 标记需复测，而不是因为出现过期拒单就直接通过。
- 对 FC-006 / FC-007 / FC-008 标记本轮不执行，并说明输入不可构造。
- 对 FC-018 标记不单独执行 / 已覆盖，避免过度要求非需求日志。
- 记录环境恢复。
- 输出测试工程反思候选。

方法论价值：

- 说明执行记录不是“通过/失败”的摘要，而是完整证据资产。
- 说明状态枚举能避免把部分覆盖、需复测、本轮不执行混成通过。
- 说明测试产出中的可疑点和限制项必须显式写出。

## 7. 资产对论文研究问题的支撑

| 研究问题 | 支撑资产 | 支撑方式 |
| --- | --- | --- |
| RQ1：工程断点 | EXAMPLE-1001 执行过程、执行记录、反思候选 | 展示 Agent 初期在环境前置、工具理解、记录完整性上的问题 |
| RQ2：用例转实施指南 | `feature_test_execution_docs`、`test_execution_guide.md` | 展示如何从 case 转化为环境前置、工具选型、逐 case 步骤 |
| RQ3：工具选型 | `feature_test_execution_docs`、`test_execution_guide.md`、auto_case SQL case | 展示普通单、算法单、稳定性背景流量的工具取舍 |
| RQ4：执行记录和证据链 | `test_execution_record_template.md`、执行记录 | 展示逐 case 状态、证据路径、恢复记录和覆盖矩阵 |
| RQ5：可疑问题发现 | `00-global-team-standards`、`docs/daycut_behavior_dictionary.md`、`docs/known_defects/known_defects.yaml`、`triage_failure`、`log_layers`、执行记录 | 展示业务字典、已知缺陷、证据链闭合、部分覆盖、需复测、未知项和可疑项处理 |
| RQ6：资产协作 | rules、workflows、skills、dictionaries、templates、records 全部资产 | 展示 rules 放红线、workflows 放路由、skills 放步骤、dictionaries 放判断基线、templates 放结构、records 放事实 |
| RQ7：任务路由 | `docs/ai_workflows.md`、`AGENTS.md` AI 工作流入口 | 展示 Agent 如何先识别任务类型，再进入主 workflow 与子流程 |

## 8. 当前资产缺口

| 缺口 | 影响 | 建议 |
| --- | --- | --- |
| 测试工具能力矩阵尚未系统化 | Agent 工具选型仍依赖上下文经验 | 建立 `docs/methodology/test_tool_capability_matrix.md` 或放入 skill reference |
| 通用业务字典模板缺失 | 日切领域已有字典，但异常嗅觉跨需求复用仍不稳定 | 在 `feature_test_execution_docs` 增加业务字典 / 三分法模板，并沉淀字典外现象回补流程 |
| 执行记录质量检查未自动化 | 可能漏 case、漏证据、漏恢复记录 | 开发执行记录 lint 脚本 |
| 用例设计与实施指南交接字段不够显式 | 实施阶段仍需重新梳理环境和工具风险 | 在 `test-case-design-checklist` 末尾增加“执行关注点 / 工具候选 / 环境风险” |
| 团队渠道报告仍靠人工提炼 | 报告可能漏掉部分覆盖或需复测项 | 从覆盖矩阵自动生成团队渠道草稿 |
| workflow catalog 仍偏 示例业务系统 高频任务 | 跨业务域或新型功能测试可能未命中现有 workflow | 增加未命中 workflow 的复盘与回补机制 |
| 异常嗅觉依赖 示例业务系统 既有调查规则较多 | 跨业务域泛化仍需验证 | 用 2-3 个不同需求校准三分法和业务字典模板 |

## 9. 对方法论的修正建议

基于资产映射，阶段 2 框架可以进一步明确：

1. 方法论入口应增加 “Workflow 任务路由”，先判断主流程和子流程，再进入具体 skill。
2. “可疑问题发现”应产出三类列表：正常情况、异常情况、未知情况。
3. “测试工具选型”应引用工具能力矩阵，而不是只写选择理由。
4. “执行记录”应支持质量检查，至少校验 case 覆盖、状态、证据、恢复记录。
5. “反思与沉淀”应区分规则、workflow、skill、模板、工具、业务字典六类沉淀方向。
6. `test-case-design-checklist` 与 `feature_test_execution_docs` 应建立明确交接字段。

## 10. 阶段 3 验收标准

| 验收项 | 状态 |
| --- | --- |
| 已列出当前项目主要 rules / workflows / skills / dictionaries / templates / records | 已完成 |
| 已完成方法论阶段到资产的映射 | 已完成 |
| 已说明每个关键资产解决的问题 | 已完成 |
| 已说明 EXAMPLE-1001 三份测试文档在闭环中的作用 | 已完成 |
| 已将资产映射到 RQ1-RQ7 | 已完成 |
| 已列出当前资产缺口和修正建议 | 已完成 |

## 11. 下一阶段任务

阶段 4 需要完成：

```text
case_study_example_1001.md
```

该文档应重点写：

- EXAMPLE-1001 需求背景。
- 测试难点。
- Agent 初期失误。
- 方法论如何介入并修正执行方式。
- 18 个 case 的最终状态。
- 从该案例抽象出的通用原则。

案例研究必须避免写成执行流水账。重点应是：

```text
问题 -> 方法论修正 -> 执行结果 -> 通用原则
```
