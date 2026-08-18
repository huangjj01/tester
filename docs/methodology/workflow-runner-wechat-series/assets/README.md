# Workflow Runner 系列配图

本目录用于存放 Workflow Runner 微信连载的发布用图片资产。

## 目录结构

- `covers_header/`
  - 正文头图 SVG
  - 尺寸：`1600x900`
- `png_header/`
  - 正文头图 PNG
  - 尺寸：`1600x900`
- `covers_card/`
  - 公众号封面卡片 SVG
  - 尺寸：`900x383`
- `png_card/`
  - 公众号封面卡片 PNG
  - 尺寸：`900x383`
- `logic_diagrams/`
  - 正文逻辑图 SVG
- `png_logic/`
  - 正文逻辑图 PNG

## 风格说明

本套资产刻意不沿用旧稿的深色科技网格风，改成：

- 米白纸面底
- 深墨色正文
- 铁锈红 / 钢青 / 琥珀 / 橄榄作为强调色
- 更偏“编辑化工程图”而不是“霓虹科技图”

## 生成方式

执行：

```bash
node docs/methodology/workflow-runner-wechat-series/assets/render_wechat_assets.js
```

会自动生成：

- 6 张头图 SVG + PNG
- 6 张封面卡片 SVG + PNG
- 多张正文逻辑图 / 说明图 SVG + PNG

## 文件命名

- 第 1 篇头图：`covers_header/01_rules_chaos_cover.svg`
- 第 1 篇封面卡：`covers_card/01_rules_chaos_cover_card.svg`
- 第 1 篇逻辑图：`logic_diagrams/01_rules_chaos_logic.svg`

其余篇目同理。
