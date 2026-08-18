# 阶段 4：案例研究 EXAMPLE-1001

论文题目：

```text
从用例设计到执行报告：一种可落地的 Agent 测试工程方法论
```

## 1. 案例定位

本文选择 `EXAMPLE-1001 sample-client fake-clock` 作为案例，用于说明 Agent 如何在真实功能测试中从“会写用例”推进到“能交付可复核测试结果”。

该案例不是普通下单回归。它的测试目标是验证 sample-client fake-clock 构建在启动时读取 `UPS_CLIENT_VIRTUAL_CLOCK_DRIFT_SEC`，并将 drift 应用于 `DayOrderExpireTime` 过期判断。测试是否有效，取决于四类前提是否同时满足：

- 运行的是 fake-clock 二进制，而不是普通 sample-client。
- drift env 通过 guard `start_cmd` 注入，而不是只在 SSH shell 中 export。
- 修改 guard 配置后重启 guard，使新配置真正生效。
- 订单证据必须回到 upstream-service 实际下发的 `DayOrderExpireTime`，不能只用文档中的示例时间。

因此，本案例适合验证本文方法论中的四个关键点：

- Workflow 任务路由能否让 Agent 先识别测试前置。
- 测试实施设计能否把工具选型、环境准备和逐 case runbook 写清楚。
- 执行记录能否保存真实证据，而不是只保存通过 / 失败摘要。
- 异常嗅觉能否帮助 Agent 识别部分覆盖、需复测和不可构造输入。

## 2. 需求背景

EXAMPLE-1001 的功能变更是：sample-client 新增用于联调和仿真测试的虚拟墙钟漂移能力，配合上游 mock 时钟场景验证 `dayOrderExpireTime` 相关逻辑。

核心规则如下：

```text
虚拟当前时间 = 真实当前时间 + UPS_CLIENT_VIRTUAL_CLOCK_DRIFT_SEC
```

过期判断如下：

```text
DayOrderExpireTime != 0 && 虚拟当前时间 >= DayOrderExpireTime
```

业务含义：

- `drift > 0`：虚拟时间更晚，订单会更早被判过期。
- `drift < 0`：虚拟时间更早，订单会延后过期。
- `drift = 0`：等价原始判断。
- `DayOrderExpireTime = 0`：表示不过期，不应继续比较虚拟当前时间。
- 普通 `sample-client` / `sample_client_debug` 不启用 fake-clock，不应受该 env 影响。

代码与通知对齐后，测试范围被确定为：

- fake-clock 二进制启动与 env 解析。
- 正数、负数、0、非法值、未设置 env。
- 用户订单入口。
- 算法单触发到 sample-client 的入口。
- 普通 debug / release 路径不受 fake-clock 影响的回归口径。

## 3. 测试难点

### 3.1 环境前置不是附属动作

fake-clock 能力依赖特定二进制和启动时 env。仅仅执行下单 case，无法证明测试目标已经生效。测试前必须先确认：

- 当前环境是 `test-host`。
- guard unit 是 `guard-test`。
- guard 配置路径是 `/opt/guard/conf/test.yaml`。
- 当前实际运行进程是目标二进制。
- `UPS_CLIENT_VIRTUAL_CLOCK_DRIFT_SEC` 出现在 guard `start_cmd` 和运行态命令中。
- guard 与 sample-client PID 在重启后确实发生变化。

这个难点暴露出 Agent 测试的典型风险：如果不把环境前置写入实施设计，Agent 很容易从用例直接跳到业务执行。

### 3.2 `DayOrderExpireTime` 不能任意构造

用例中使用了类似下面的可读表达：

```text
10:00:00 + 120秒 = 10:02:00
10:02:00 >= 10:01:00
=> sample-client 判定 day order expired
```

但真实执行时，`DayOrderExpireTime` 不是测试脚本手工传入的字段，而是 upstream-service 根据交易日历和日切口径硬编码计算后下发。执行证据必须从 `event.log` 中取真实值，例如：

```text
UserOrderRequest{..., DayOrderExpireTime: 1778792400000000000}
```

这意味着部分理论 case 在当前环境下不可执行：

- 不能模拟 `DayOrderExpireTime=0`。
- 不能稳定构造“真实当前时间已经晚于 DayOrderExpireTime”的输入。
- “刚好等于边界”的 case 需要极高时间精度，不能用普通下单动作轻易证明。

### 3.3 普通单和算法单入口不同

普通订单入口可以用 auto_case 的 place-only case 定向下单，不需要 `app.py`。

算法单入口不同。它需要先下算法单，再通过 `mockTransactionPrice` 触发行情，使 core-engine 送单到 sample-client。这个场景需要 `auto_case/app.py`，并且预期不是新单直接 `8/8` reject，而是算法单先 ACK，触发后形成 `ordStatus=4 / execType=4 / Day order expired` 的闭环终态。

如果 Agent 不做工具选型，很容易把普通单工具直接套到算法单入口，导致测试无效。

### 3.4 背景流量会污染证据

测试最初可以选择观察稳定性脚本持续下单的结果，也可以用 auto_case 定向构造订单。最终选择 auto_case，是因为本功能需要精确控制输入、断言和 clOrdID 归因。

因此执行前需要停掉稳定性脚本，避免 event.log、北向 FIX、南向 `nv-ext-msg` 混入背景订单。

## 4. Agent 初期偏差

本案例中，Agent 初期出现过多类偏差。这些偏差不是单点能力不足，而是缺少测试工程流程约束导致的。

| 偏差 | 表现 | 风险 |
| --- | --- | --- |
| 忽略环境前置 | 一开始关注下单逻辑，没有第一时间确认二进制、env、guard 配置和重启方式 | case 结果可能不是 fake-clock 行为 |
| 混淆工具前提 | 将普通下单和 app.py 前置混在一起 | 把不需要 mock 行情的普通单复杂化 |
| 工具选型不充分 | 倾向观察稳定性脚本，而不是新增定向 auto_case case | 证据不可归因，断言不稳定 |
| 执行记录滞后 | 不是所有 case 一开始都按执行记录模板补齐 | 用户无法检查完整执行结果 |
| 错误理解算法单预期 | FC-014 初期按直接 reject 理解 | 忽略算法单需要闭环终态 |
| 过度要求日志 | 曾把合法 env 必须打印到 sample-client 日志当作检查点 | 将非需求内容误写成验收标准 |

这些偏差正好说明：Agent 不是只需要更多上下文，而是需要流程把关键动作前置。

## 5. 方法论介入

### 5.1 用例设计：从通知和代码对齐需求

用例设计阶段先对齐通知、代码和用户澄清，形成 `test_case_design.md`。

关键输出包括：

- 信息源列表。
- 通知与代码的 source reconciliation。
- fake-clock 判断公式。
- 覆盖清单 CK-01 到 CK-13。
- 18 个测试 case。
- checklist back-check。

这个阶段最重要的价值是：把“理论上应该测什么”和“当前环境实际能测什么”分开。

例如：

- FC-006 理论上要测负漂移不足时真实已过期订单仍应过期，但当前无法构造真实已过期输入。
- FC-007 / FC-008 理论上要测 `DayOrderExpireTime=0`，但当前 upstream-service 暂不能模拟该输入。
- FC-018 最终修正为启动证据覆盖，不再要求合法 env 必须写入某个特定日志。

### 5.2 测试实施设计：把工具选型纳入实施

实施指南没有直接写“按 case 下单”，而是先解决测试实施设计：

- 环境前置判断。
- 二进制切换。
- drift env 配置。
- guard 重启生效。
- PID 对比。
- 测试流量隔离。
- 普通单和算法单工具选型。
- DayOrderExpireTime 取证方式。
- 逐 case runbook。

其中工具选型被明确写成测试实施的一部分：

| 场景 | 工具选择 | 原因 |
| --- | --- | --- |
| 普通未过期 ACK | auto_case 独立 type `sample_fake_clock_expect_ack` | 输入可归因，有北向断言 |
| 普通过期拒单 | auto_case 独立 type `sample_fake_clock_expect_expired_reject` | 可断言 `39=8 / 150=8` |
| 算法单入口 | auto_case + app.py + `mockTransactionPrice` | 需要触发行情，让 core-engine 送单到 sample-client |
| 背景稳定性流量 | 不采用 | 订单不可控，证据不可精确归因 |

这个修正体现了本文方法论的关键观点：工具选型不是测试实施之外的额外阶段，而是测试实施设计内部的强制环节。

### 5.3 执行记录：把真实执行转化为证据资产

执行记录 `test_execution_record_20260514_test_host.md` 保存了完整测试事实：

- 执行环境。
- guard 配置。
- 原始二进制和恢复结果。
- 每个 drift 场景的 guard / sample-client PID 变化。
- 每个订单的 clOrdID、OrderId、`DayOrderExpireTime`。
- 北向 FIX 结果。
- event.log 结果。
- 本地拒单场景的南向无发送证据。
- 覆盖矩阵。
- 未覆盖 / 阻塞项。
- 测试工程反思候选。

执行记录避免了两个常见问题：

- 结果只停留在聊天窗口。
- 报告阶段新增执行记录里没有的判断。

## 6. 执行结果

本轮共处理 18 个设计 case，最终状态如下：

| 状态 | Case | 说明 |
| --- | --- | --- |
| 通过 | FC-001、FC-002、FC-003、FC-009、FC-010、FC-011、FC-012、FC-013、FC-014、FC-016、FC-017 | 覆盖 drift=0、正漂移、非法 env、未设置 env、用户订单入口、算法单入口、普通 debug 回归和 fake-clock debug |
| 当前口径部分覆盖 | FC-005 | 负漂移只覆盖“不误拒正常未到期订单”，无法覆盖真实已过期输入 |
| 需复测 | FC-004 | 已验证超过边界会过期，但未达到严格“刚好等于边界”的精度 |
| 本轮不执行 | FC-006、FC-007、FC-008、FC-015 | FC-006/007/008 输入当前不可构造；FC-015 release 回归已由 UAT 人工完成，本轮不重复 |
| 不单独执行 / 已覆盖 | FC-018 | 合法 env 由 guard startCmd、运行态、PID 和订单行为覆盖；非法值由 fallback 日志覆盖 |

关键执行结论：

- fake-clock debug 在 `drift=0` 时未误拒正常未到期订单。
- 正漂移能让原本未到期订单提前被判 `Day order expired`。
- 正漂移不足时订单仍可正常 ACK。
- 负漂移不会误拒正常未到期订单。
- 非法 env `abc`、`5s`、前后空格和未设置 env 均回退为 0。
- 用户订单入口和算法单触发到 sample-client 的入口均覆盖。
- 本地过期拒单场景未继续南向发送。
- 普通 `sample_client_debug` 不启用 fake-clock，正常路径回归通过。

剩余风险：

- FC-004 的严格边界 `虚拟当前时间 == DayOrderExpireTime` 仍需设计更精确执行窗口。
- FC-006 依赖已过期输入，当前普通链路不能构造。
- FC-007 / FC-008 依赖 `DayOrderExpireTime=0`，当前 upstream-service 暂不能模拟。
- release `sample-client` 回归依赖 UAT 人工口径，本轮 test-host 不重复执行。

## 7. 方法论抽象

### 7.1 需求理解必须区分“理论输入”和“可执行输入”

测试用例可以描述理想输入，例如 `DayOrderExpireTime=0` 或真实已过期订单。但执行时必须回到系统真实输入能力。不能因为某个 case 理论上存在，就强行写成已执行。

本案例中，FC-006、FC-007、FC-008 被标记为本轮不执行，是正确的测试结论，而不是测试失败。

### 7.2 测试实施设计必须先回答环境和工具

fake-clock 的有效性不由订单结果单独证明，而由以下证据共同证明：

- 目标二进制。
- guard 配置。
- env 注入位置。
- guard 与 sample-client PID 变化。
- 运行态命令。
- 启动日志或 fallback 日志。
- 订单行为。

因此，测试实施设计必须先完成工具选型和环境准备，再写逐 case 步骤。

### 7.3 工具选型决定证据是否可归因

稳定性脚本虽然持续下单，但不适合做本需求的主验证工具，因为它难以精确控制 drift、订单类型、clOrdID 和断言。auto_case 独立 type 更适合本轮验证，因为它能产生明确输入、明确断言和可追踪证据。

算法单入口则必须使用 app.py mock 行情。这说明工具选型不是一次性选择，而是按 case 场景分别选择。

### 7.4 执行记录必须保存“不完整”的真实状态

真实测试不会总是得到全通过结果。部分覆盖、需复测、本轮不执行、不单独执行但已覆盖，都是有价值的测试结论。

本案例中，执行记录没有把 FC-004、FC-005、FC-006、FC-007、FC-008、FC-015、FC-018 强行写成通过，而是分别保留了真实状态。这使报告可以被后续工程师复核。

### 7.5 Agent 的测试能力来自资产协同

本案例中，每类资产承担不同职责：

| 资产 | 在案例中的作用 |
| --- | --- |
| rules | 要求先确认环境、二进制、env、重启和 PID |
| workflows | 让 Agent 识别这是功能测试实施，不是单纯下单或日志调查 |
| skills | 提供用例设计、实施指南、远端调查和执行记录流程 |
| dictionaries / defect libraries | 提供异常识别和未知项标记的思路 |
| templates | 固化实施指南、执行记录和报告结构 |
| execution records | 保存本轮真实执行证据和覆盖矩阵 |

单靠其中任何一类资产都不够。规则能防止越界，workflow 能选对入口，skill 能给步骤，模板能约束输出，执行记录能保存事实。

## 8. 对论文的支撑

EXAMPLE-1001 案例支撑本文的主要研究问题：

| 研究问题 | 案例支撑 |
| --- | --- |
| RQ1 工程断点 | 暴露环境前置、工具选型、执行记录、算法单预期理解等断点 |
| RQ2 用例到实施指南 | 通过 `test_execution_guide.md` 展示如何从 18 个 case 生成可执行 runbook |
| RQ3 工具选型 | 展示普通单、算法单、稳定性流量三类工具选择差异 |
| RQ4 执行记录和证据链 | 通过逐 case 记录保存 PID、OrderId、FIX、event.log、南向证据 |
| RQ5 可疑问题发现 | 将不可构造输入、边界精度不足、非需求日志要求识别为不同类型的问题 |
| RQ6 资产协作 | 展示 rules、workflows、skills、dictionaries、templates、records 如何协同 |
| RQ7 workflow 路由 | 说明测试任务必须先识别环境前置和实施路径，不能直接进入业务 case |

## 9. 阶段 4 验收标准

| 验收项 | 状态 |
| --- | --- |
| 已说明 EXAMPLE-1001 需求背景 | 已完成 |
| 已说明测试难点 | 已完成 |
| 已总结 Agent 初期偏差 | 已完成 |
| 已说明方法论如何介入修正 | 已完成 |
| 已汇总 18 个 case 的最终状态 | 已完成 |
| 已抽象出通用测试工程原则 | 已完成 |

## 10. 下一阶段任务

阶段 5 需要完成：

```text
agent_testing_methodology_paper.md
```

阶段 5 不再新增方法论资产，而是把阶段 1 到阶段 4 的内容整合为论文初稿。初稿应包含：

- 摘要和关键词。
- 引言。
- 工程断点。
- 方法论框架。
- 资产映射。
- EXAMPLE-1001 案例研究。
- 效果、边界与后续工作。
- 结论。

整合时要避免把阶段文档机械拼接成论文，应围绕一个主论点展开：

```text
Agent 测试能力的稳定性，不只来自更详细的提示词或更多 skill，而来自任务路由、执行技能、业务判断基线、证据模板和执行记录之间的分层约束。
```
