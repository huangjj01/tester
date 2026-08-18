# Workflow Runner 专题优先出图计划

## 1. 为什么先做第 1、3、5 篇

这三篇最适合先出图，因为它们能最快形成一个完整传播闭环：

- 第 1 篇有问题张力
- 第 3 篇有方案辨识度
- 第 5 篇有真实验证说服力

只要这三篇的图出来，哪怕后面 2、4、6 还在写，整个专题已经能先跑起来。

## 2. 总体执行策略

这三篇都不建议一上来就“完全新做”。建议分成三类：

| 图类型 | 策略 |
| --- | --- |
| 封面图 | 先按母版重做，统一风格 |
| 主逻辑图 | 尽量复用现有 premium 资产做结构基础 |
| 证据图 | 等正文 agent 定稿到可引用状态后再出 |

## 3. 第 1 篇图片清单

### 文章定位

- 文章主题：为什么规则很多，Agent 还是会失控
- 图像任务：先把“痛点”和“反差”打出来

### 需要的图片

| 图名 | 类型 | 优先级 | 来源策略 | 当前状态 |
| --- | --- | --- | --- | --- |
| `wr_series_01_cover` | 封面图 | 高 | 新做，按 A 版冲突型封面执行 | 可启动 |
| `wr_series_01_logic_gap` | 主逻辑图 | 高 | 优先改造 `01_delivery_gap` | 可启动 |
| `wr_series_01_assets_map` | 说明图 | 中 | 复用现有体系关系素材，必要时重绘 | 需正文确定用法 |
| `wr_series_01_share_card` | 摘要卡片 | 中 | 等正文定一句最强传播句后再做 | 待补文案 |

### 最适合先做的两张

1. `wr_series_01_cover`
2. `wr_series_01_logic_gap`

原因：

- 这两张已经能支撑第 1 篇的主体传播
- 都能较多复用现有结构，不依赖太多新增现场截图

### 素材依赖

- `AGENTS.md`
- `docs/ai_workflows.md`
- `docs/methodology/agent-testing-methodology/test_agent_workflow_runner_design.md`
- `docs/methodology/agent-testing-methodology/publish-series/diagrams/premium/01_delivery_gap.svg`

### 暂时不要急着做的图

- 终端截图类证据图
- 依赖具体正文金句的分享卡片

这些更适合等正文基本定稿后再补。

## 4. 第 3 篇图片清单

### 文章定位

- 文章主题：为什么要做 Workflow Runner，以及它解决的到底是什么问题
- 图像任务：让 Runner 这四个字有强辨识度

### 需要的图片

| 图名 | 类型 | 优先级 | 来源策略 | 当前状态 |
| --- | --- | --- | --- | --- |
| `wr_series_03_cover` | 封面图 | 高 | 新做，按 B 版方案型封面执行 | 可启动 |
| `wr_series_03_runner_flow` | 主逻辑图 | 高 | 改造 `03_runner_architecture` | 可启动 |
| `wr_series_03_gate_detail` | 说明图 | 中 | 改造 `03_gate_check` 或重画局部门禁图 | 可启动 |
| `wr_series_03_share_card` | 摘要卡片 | 中 | 等正文确定金句后制作 | 待补文案 |

### 最适合先做的两张

1. `wr_series_03_cover`
2. `wr_series_03_runner_flow`

原因：

- 这是整个专题的方法论主图
- 即使正文还没完全定稿，这两张也已经有稳定结构基础

### 素材依赖

- `docs/methodology/agent-testing-methodology/test_agent_workflow_runner_design.md`
- `docs/methodology/agent-testing-methodology/publish-series/diagrams/premium/03_runner_architecture.svg`
- `docs/methodology/agent-testing-methodology/publish-series/diagrams/premium/03_gate_check.svg`

### 暂时不要急着做的图

- 过于依赖正文最终措辞的口号型卡片
- 过于细节化的命令截图拼图

## 5. 第 5 篇图片清单

### 文章定位

- 文章主题：Runner 不是概念包装，而是被真实测试过的方案
- 图像任务：把“43 / 2 / 1”做成一眼抓人的证据感视觉

### 需要的图片

| 图名 | 类型 | 优先级 | 来源策略 | 当前状态 |
| --- | --- | --- | --- | --- |
| `wr_series_05_cover` | 封面图 | 高 | 新做，按 C 版验证型封面执行 | 可启动 |
| `wr_series_05_result_matrix` | 证据图 | 高 | 基于执行记录的覆盖矩阵重绘 | 可启动 |
| `wr_series_05_failure_retest_compare` | 对比图 | 高 | 基于执行记录 + 复测记录重绘 | 可启动 |
| `wr_series_05_share_card` | 摘要卡片 | 中 | 从“43 / 2 / 1”直接派生 | 可启动 |

### 最适合先做的三张

1. `wr_series_05_cover`
2. `wr_series_05_result_matrix`
3. `wr_series_05_failure_retest_compare`

原因：

- 这篇最强的不是抽象概念，而是可视化证据
- 执行记录和复测记录已经足够支撑三张核心图

### 素材依赖

- `docs/methodology/agent-testing-methodology/test_agent_workflow_runner_execution_record_20260520_local.md`
- `docs/methodology/agent-testing-methodology/test_agent_workflow_runner_retest_record_20260520_local.md`

### 推荐视觉重点

- `43` 要最大
- `2` 的失败要明显但不能喧宾夺主
- `1 次复测` 要呈现“从红到绿”的闭环感

## 6. 出图顺序建议

如果我后面开始真正出图，建议按这个顺序：

1. `wr_series_03_cover`
2. `wr_series_01_cover`
3. `wr_series_05_cover`
4. `wr_series_03_runner_flow`
5. `wr_series_01_logic_gap`
6. `wr_series_05_result_matrix`
7. `wr_series_05_failure_retest_compare`

原因：

- 第 3 篇封面最能建立整个专题的“品牌脸”
- 第 1 篇封面最适合先做传播测试
- 第 5 篇封面最容易带结果感
- 逻辑图和证据图可以在正文 agent 留好图位后继续细化

## 7. 每张图的完成标准

后面真正做图时，我会按这几个标准验收：

| 检查项 | 标准 |
| --- | --- |
| 手机端可读性 | 关键信息在手机预览下能一眼识别 |
| 系列一致性 | 色板、标签、期数、标题气质统一 |
| 工程感 | 不像普通运营海报，不像泛 AI 炫图 |
| 传播感 | 单张转发出去也能抓住人 |
| 事实边界 | 不出现正文里还没有证据支撑的表达 |

## 8. 现在就能并行启动的工作

如果要并行推进，现在最合适的是：

1. 写作 agent 先按模板写第 1、3、5 篇半成品
2. 我先做第 3 篇封面方案
3. 再做第 1 篇冲突型封面
4. 等第 5 篇正文引用位稳定后，直接做结果矩阵和失败复测对比图

## 9. 一句话结论

当前最优策略不是“6 篇全部先做图”，而是：

**先把第 1、3、5 篇做成可传播样板，再用样板带动整个专题统一成型。**
