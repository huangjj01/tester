# Workflow Runner 专题视觉与配图策划

## 1. 视觉总方向

这个专题的配图不能走“泛 AI 发光大脑”“紫色霓虹机器人”路线。更适合的方向是：

**工程秩序感 + 高级编辑感 + 轻科技感**

建议关键词：

- Gate
- Workflow
- Checkpoint
- State Machine
- Audit Trail
- Engineering Discipline

建议主色：

- 深海军蓝 `#0D1B2A`
- 石墨黑 `#111827`
- 冷银灰 `#98A2B3`
- 冰青高亮 `#46C2CB`
- 少量金属白 `#E5E7EB`

## 2. 每篇文章的主视觉方向

| 篇次 | 视觉主题 | 画面建议 | 文案气质 |
| --- | --- | --- | --- |
| 第 1 篇 | 规则很多，但流程失控 | 多层文档悬浮，底部流程断裂或偏航 | 强冲突、强共鸣 |
| 第 2 篇 | 文档层与执行层断开 | 左侧是 Markdown/规则文本，右侧是未受控 Agent 行为流 | 冷静、剖析感 |
| 第 3 篇 | 从文本到门禁 | 一道发光闸门把杂乱流程收束进轨道 | 方案登场、很提气 |
| 第 4 篇 | Runner 内部机制 | 8 步流程、target 路径、状态推进结构化展示 | 工程感、收藏感 |
| 第 5 篇 | 真实测试与修复闭环 | 测试矩阵、失败红点、复测转绿 | 可信、硬核 |
| 第 6 篇 | 边界与演进 | 门禁向更多 workflow 延展，但保留人工判断节点 | 克制、成熟 |

## 3. 配图清单建议

每篇建议配置 3 类图：

1. 封面头图
2. 正文主逻辑图
3. 证据型插图

### 第 1 篇配图

- 封面图：大量规则文档漂浮，但 Agent 路径偏航
- 正文图：文档约束与执行结果脱节示意图
- 插图：现有治理资产清单图

### 第 2 篇配图

- 封面图：文本层和执行层之间出现断层
- 正文图：问题断点拆解图
- 插图：规则、skill、workflow、toolset 的关系图

### 第 3 篇配图

- 封面图：一道“Workflow Runner”门禁横切在流程中间
- 正文图：用户请求进入 Runner 的总流程图
- 插图：Runner 职责边界图

### 第 4 篇配图

- 封面图：8 个步骤串成状态推进链
- 正文图：8 步 workflow + 4 种 target 的逻辑图
- 插图：run 目录结构、artifact 校验规则摘要图

### 第 5 篇配图

- 封面图：43 / 2 / 1 的大数字视觉
- 正文图：覆盖矩阵摘要图
- 插图：失败点与复测结果对照图

### 第 6 篇配图

- 封面图：流程门禁向外扩展，但关键人工判断节点高亮保留
- 正文图：边界与演进路线图
- 插图：当前能力与未来规划对比图

## 4. 可直接复用或改造的现有资产

优先复用这些现有图，而不是完全重做：

- `docs/methodology/agent-testing-methodology/publish-series/diagrams/premium/03_gate_check.svg`
- `docs/methodology/agent-testing-methodology/publish-series/diagrams/premium/03_runner_architecture.svg`
- `docs/methodology/agent-testing-methodology/publish-series/diagrams/premium/01_delivery_gap.svg`
- `docs/methodology/agent-testing-methodology/publish-series/diagrams/output_premium/03_gate_check.png`
- `docs/methodology/agent-testing-methodology/publish-series/diagrams/output_premium/03_runner_architecture.png`
- `docs/methodology/agent-testing-methodology/publish-series/diagrams/covers/03_wechat_cover.png`

## 5. 封面标题写法建议

公众号封面图的字数不要太长。建议正文标题和封面标题分开设计。

例如：

| 正文标题 | 封面标题 |
| --- | --- |
| 为什么写了那么多 Agent 规范，结果还是一地鸡毛？ | Agent 规范，为什么总失效 |
| 从文档约束到可执行门禁：我们为什么做 Workflow Runner | Workflow Runner |
| 43 条用例、2 个失败、1 次复测：Runner 值不值得做 | 43 条用例拷问 Runner |

## 6. 画面风格细节建议

- 字体气质：中文标题建议偏现代媒体感，避免默认系统黑体堆字。
- 版式：留白要大，避免把封面做成 PPT。
- 元素：可以用流程箭头、卡片、状态点、网格线，但不要堆满。
- 数据图：如果要做“43/2/1”，就做成核心主视觉，不要再堆太多解释文字。
- 截图：终端截图不要原样硬贴，建议做轻度包装，加标题条、局部高亮和注释。

## 7. 如果后续要真正出“高大上”配图

最稳妥的做法不是直接 AI 出图，而是：

1. 先用现有 SVG/PNG 做结构草图。
2. 再按统一视觉规范重绘一版封面和逻辑图。
3. 真要上 AI 出图，也只让它补抽象氛围背景，不让它替代结构信息。

这样既保住高级感，也不会丢掉工程图最重要的可读性。
