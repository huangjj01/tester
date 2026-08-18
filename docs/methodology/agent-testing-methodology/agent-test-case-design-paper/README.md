# agent-test-case-design-paper 目录说明

这个目录已经按“正文 / 头图 / 封面图 / 正文逻辑图”拆分整理。

## 目录结构

- `articles/`
  - 4 篇公众号正文终稿
- `covers_header/`
  - 每篇文章正文内使用的头图
  - 适合放在标题下、正文开始前
- `covers_card/`
  - 每篇文章的公众号封面卡片图
  - 尺寸为 `900x383`
- `logic_diagrams/`
  - 正文中穿插使用的逻辑图
- `png_header/`
  - 头图对应的 PNG 版
  - 适合直接上传到公众号正文
- `png_card/`
  - 封面卡片对应的 PNG 版
  - 适合直接上传到公众号封面
- `png_logic/`
  - 正文逻辑图对应的 PNG 版
- `agent_test_case_design_paper.md`
  - 长文原稿
- `wechat_series_plan.md`
  - 公众号系列规划
- `writing_plan.md`
  - 早期写作计划

## 一一对应关系

### 第 1 篇

- 正文：
  - `articles/wechat_series_01.txt`
- 头图：
  - `covers_header/wechat_series_01_cover.svg`
- 头图 PNG：
  - `png_header/wechat_series_01_cover.png`
- 封面卡片：
  - `covers_card/wechat_series_01_cover_card.svg`
- 封面卡片 PNG：
  - `png_card/wechat_series_01_cover_card.png`
- 正文逻辑图：
  - 无

### 第 2 篇

- 正文：
  - `articles/wechat_series_02.txt`
- 头图：
  - `covers_header/wechat_series_02_cover.svg`
- 头图 PNG：
  - `png_header/wechat_series_02_cover.png`
- 封面卡片：
  - `covers_card/wechat_series_02_cover_card.svg`
- 封面卡片 PNG：
  - `png_card/wechat_series_02_cover_card.png`
- 正文逻辑图：
  - `logic_diagrams/wechat_series_02_logic_flow.svg`
- 正文逻辑图 PNG：
  - `png_logic/wechat_series_02_logic_flow.png`

建议插入位置：
- 放在 `七步到底在做什么` 这个小节标题后面

### 第 3 篇

- 正文：
  - `articles/wechat_series_03.txt`
- 头图：
  - `covers_header/wechat_series_03_cover.svg`
- 头图 PNG：
  - `png_header/wechat_series_03_cover.png`
- 封面卡片：
  - `covers_card/wechat_series_03_cover_card.svg`
- 封面卡片 PNG：
  - `png_card/wechat_series_03_cover_card.png`
- 正文逻辑图：
  - `logic_diagrams/wechat_series_03_logic_compare.svg`
- 正文逻辑图 PNG：
  - `png_logic/wechat_series_03_logic_compare.png`

建议插入位置：
- 放在 `什么叫弱断言` 之后
- 或放在 `怎么把断言从废话拉回证据` 之前

### 第 4 篇

- 正文：
  - `articles/wechat_series_04.txt`
- 头图：
  - `covers_header/wechat_series_04_cover.svg`
- 头图 PNG：
  - `png_header/wechat_series_04_cover.png`
- 封面卡片：
  - `covers_card/wechat_series_04_cover_card.svg`
- 封面卡片 PNG：
  - `png_card/wechat_series_04_cover_card.png`
- 正文逻辑图：
  - `logic_diagrams/wechat_series_04_logic_incremental.svg`
- 正文逻辑图 PNG：
  - `png_logic/wechat_series_04_logic_incremental.png`

建议插入位置：
- 放在 `怎么把 25 条压到 8 条` 这一节后面

## 发布时的推荐用法

- 公众号列表封面：
  - 优先使用 `png_card/` 下的文件
- 文章标题下头图：
  - 优先使用 `png_header/` 下的文件
- 正文中解释逻辑：
  - 优先使用 `png_logic/` 下的文件
