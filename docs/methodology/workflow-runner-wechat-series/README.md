# Workflow Runner 公众号专题

**系列名：让 Agent 绕不过去的流程门禁**

本目录用于沉淀"从文档约束到可执行门禁：Agent 测试 Workflow Runner"的公众号专题策划与后续写作素材。

正式成文时，必须以仓库内真实设计、实现、测试记录、复测记录和实际落地结果为准，不补写未经验证的事实。

## 目录结构

```
workflow-runner-wechat-series/
├── README.md                  # 本文件
├── planning/                  # 策划与准备材料
│   ├── 00_series_strategy.md          # 连载总策划、文章结构、传播策略、标题池
│   ├── 01_source_material_inventory.md # 可引用素材清单、证据边界、待补材料
│   ├── 02_visual_asset_plan.md         # 封面图、长图、逻辑图的视觉策划
│   ├── 03_visual_master_system.md      # 视觉母版、版式规范、封面规则、图表语言
│   ├── 04_cover_storyboards.md         # 6 篇逐篇封面脚本、主视觉描述
│   ├── 05_writer_handoff_template.md   # 写作 agent 统一交接模板
│   └── 06_priority_image_production_plan.md # 第 1、3、5 篇优先出图清单
├── articles/                  # 正文（按交接模板格式，含元数据和图位标注）
│   ├── 01_rules_chaos.md
│   ├── 02_where_it_breaks.md
│   ├── 03_why_runner.md
│   ├── 04_how_it_works.md
│   ├── 05_43_cases.md
│   └── 06_traceable_delivery.md
└── wechat_ready/              # 公众号发布版（纯正文，可直接粘贴到编辑器）
    ├── 01_rules_chaos.txt
    ├── 02_where_it_breaks.txt
    ├── 03_why_runner.txt
    ├── 04_how_it_works.txt
    ├── 05_43_cases.txt
    └── 06_traceable_delivery.txt
```

## 使用原则

1. 先补证据，再写正文。
2. 先写事实，再做观点升华。
3. 每篇文章都要区分"已验证事实""工程判断""待补现场材料"。
4. 标题可以有传播张力，但正文不能脱离真实落地情况。

## 推荐阅读顺序

- 了解总策划 → `planning/00_series_strategy.md`
- 了解素材边界 → `planning/01_source_material_inventory.md`
- 了解交接规范 → `planning/05_writer_handoff_template.md`
- 出图参考 → `planning/06_priority_image_production_plan.md`
- 正文（含元数据/图位/证据表）→ `articles/` 目录按编号顺序
- 公众号粘贴版 → `wechat_ready/` 目录，.txt 纯文本，可直接复制到公众号编辑器

## wechat_ready 目录说明

`wechat_ready/` 下的 .txt 文件是从 `articles/` 提取的纯正文版本：

- 去掉了"文章定位""事实依据""边界与待补项""给设计的补充说明"等内部协作元数据
- 去掉了 Markdown 格式符号（加粗用文字节奏代替、代码块用文字描述代替）
- 图片位置用 `【图片：描述】` 统一标记
- 标题用中文数字（一、二、三）分段，适合公众号排版
- 直接全选复制粘贴即可
