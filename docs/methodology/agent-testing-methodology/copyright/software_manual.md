# 软件说明书

## 软件名称

AI Agent 测试实施工作流门禁控制系统 V1.1

## 版本号

V1.1

## 一、软件概述

### 1.1 软件用途

本软件是一款面向 AI Agent 测试实施任务的轻量级命令行流程门禁控制工具。在 AI Agent 参与软件功能测试实施过程中，Agent 可能跳过环境前置确认、测试工具选型、执行记录或测试工程反思等关键环节，导致测试产出质量不可控、测试结论不可复核。本软件通过配置化的工作流定义、步骤依赖管理、产物内容校验和状态持久化机制，强制 AI Agent 按预定义的步骤序列推进测试实施任务，在关键产物缺失或内容不合格时阻止流程推进，并支持跨会话的中断恢复。

### 1.2 适用对象

本软件适用于使用 AI Agent 辅助完成软件功能测试实施任务的测试工程团队。典型使用场景包括：

- 整理测试实施指南
- 生成测试工具选型文档
- 生成测试执行记录
- 整理覆盖矩阵
- 生成最终测试报告
- 根据已有需求或测试用例落地执行方案

### 1.3 运行环境

| 项目 | 要求 |
|------|------|
| 操作系统 | Windows 10+、macOS 10.15+、Linux（Ubuntu 18.04+） |
| 运行时 | Python 3.8 及以上版本 |
| 依赖库 | PyYAML |
| 存储 | 本地文件系统 |
| 网络 | 无网络依赖 |
| 数据库 | 无数据库依赖 |

## 二、软件安装

### 2.1 环境准备

确保系统已安装 Python 3.8 或更高版本：

```bash
python3 --version
```

### 2.2 依赖安装

安装 PyYAML 依赖：

```bash
pip install pyyaml
```

### 2.3 文件部署

将以下文件部署到项目目录：

```
项目根目录/
├── toolset/
│   └── test_agent_runner.py          # 主程序
├── config/
│   └── test_agent_workflows/
│       └── test_execution.yaml       # 工作流配置文件
└── .runs/                            # 运行产物目录（自动创建）
```

## 三、功能说明

### 3.1 功能总览

本软件提供以下六项核心功能：

| 功能 | 命令 | 说明 |
|------|------|------|
| 创建工作流运行实例 | start | 根据任务名称和目标产物类型创建新的工作流运行 |
| 查看运行状态 | status | 显示所有步骤的当前状态 |
| 查看下一步 | next | 显示当前应执行步骤的产物路径和门禁要求 |
| 步骤完成与校验 | complete | 对指定步骤执行门禁校验并更新状态 |
| 全局校验 | validate | 检查目标产物是否已达成 |
| 合并输出 | render | 将已完成步骤的产物合并输出 |

### 3.2 工作流步骤定义

本软件内置测试实施工作流，包含以下八个有序步骤：

| 顺序 | 步骤标识 | 步骤名称 | 门禁校验规则 |
|------|----------|----------|-------------|
| 1 | input_sources | 输入资料确认 | 标题校验：输入资料、已确认项、待确认项 |
| 2 | scope | 测试范围与执行口径 | 标题校验：本轮测试范围、不测范围、部分覆盖项、待确认项 |
| 3 | environment_precheck | 环境前置判断 | 标题校验：目标环境、版本/包/分支、服务/进程/配置、启动参数/环境变量、mock/外部依赖、恢复基线 |
| 4 | tool_selection | 测试工具选型 | 表格校验：7列必需表头 + 至少1行非占位符有效数据 |
| 5 | execution_guide | 测试实施指南 | 标题校验：公共准备步骤、逐Case实施步骤、证据采集、通过标准、失败/阻塞处理 |
| 6 | execution_record | 测试执行记录 | 标题校验：执行摘要、测试工具选型结果、逐case执行明细、覆盖矩阵、恢复记录、未覆盖/阻塞项 |
| 7 | report | 最终报告 | 标题校验：已验证通过、发现的问题或需复测项、部分覆盖和未执行项、环境恢复状态、剩余风险 |
| 8 | reflection | 测试工程反思 | 标题校验：本次暴露的规则缺口、skill/执行流程缺口、工具缺口、建议沉淀项 |

### 3.3 目标产物模式

本软件支持四种目标产物模式，允许按需只完成必要步骤：

| 目标模式 | 说明 | 必经步骤范围 |
|----------|------|-------------|
| execution_guide | 只整理测试实施指南 | 步骤1至步骤5 |
| execution_record | 生成或维护执行记录 | 步骤1至步骤6 |
| report | 生成最终报告 | 步骤1至步骤7 |
| full | 完整测试实施闭环 | 全部8个步骤 |

## 四、操作说明

### 4.1 创建工作流运行实例（start）

**功能描述：** 创建一个新的工作流运行实例，生成唯一运行标识，初始化步骤状态，并根据目标产物类型确定必经步骤集合。

**命令格式：**

```bash
python toolset/test_agent_runner.py start <工作流类型> --name <任务名称> --target <目标产物模式>
```

**参数说明：**

| 参数 | 必填 | 说明 |
|------|------|------|
| 工作流类型 | 是 | 工作流标识，当前支持 test_execution |
| --name | 是 | 任务名称，如需求编号或功能名 |
| --target | 是 | 目标产物模式：execution_guide、execution_record、report、full |

**操作示例：**

```bash
python toolset/test_agent_runner.py start test_execution --name EXAMPLE-1001 --target execution_guide
```

**输出示例：**

```
run_id: 20260520_103012_583665_EXAMPLE-1001
next_step: input_sources
run_dir: .runs/test_execution/20260520_103012_583665_EXAMPLE-1001
```

**输出说明：**

- run_id：本次运行的唯一标识，包含时间戳和微秒级精度，确保同一秒内多次创建不冲突
- next_step：当前应执行的第一个步骤标识
- run_dir：运行产物存储目录的相对路径

**生成的目录结构：**

```
.runs/test_execution/20260520_103012_583665_EXAMPLE-1001/
├── run.json          # 运行状态文件
├── checklist.json    # 步骤状态文件
├── artifacts/        # 步骤产物目录
└── logs/             # 日志目录
```

### 4.2 查看运行状态（status）

**功能描述：** 显示指定运行实例中所有步骤的当前状态。

**命令格式：**

```bash
python toolset/test_agent_runner.py status <运行标识>
```

**操作示例：**

```bash
python toolset/test_agent_runner.py status 20260520_103012_583665_EXAMPLE-1001
```

**输出示例：**

```
input_sources: completed
scope: completed
environment_precheck: pending
tool_selection: pending
execution_guide: pending
execution_record: not_required_yet
report: not_required_yet
reflection: not_required_yet
```

**步骤状态枚举：**

| 状态 | 含义 |
|------|------|
| pending | 等待执行 |
| blocked | 校验失败，需修正后重新提交 |
| completed | 已完成且校验通过 |
| not_required_yet | 当前目标产物模式不要求执行 |

### 4.3 查看下一步（next）

**功能描述：** 显示当前应执行步骤的详细信息，包括产物输出路径和门禁校验要求。

**命令格式：**

```bash
python toolset/test_agent_runner.py next <运行标识>
```

**操作示例：**

```bash
python toolset/test_agent_runner.py next 20260520_103012_583665_EXAMPLE-1001
```

**输出示例（标题校验类步骤）：**

```
current_step: environment_precheck
output: artifacts/03_environment_precheck.md
required_headings:
  - 目标环境
  - 版本 / 包 / 分支
  - 服务 / 进程 / 配置
  - 启动参数 / 环境变量
  - mock / 外部依赖
  - 恢复基线
```

**输出示例（表格校验类步骤）：**

```
current_step: tool_selection
output: artifacts/04_tool_selection.md
required_table_columns:
  - Case / 场景
  - 现有工具是否覆盖
  - 选用工具
  - 是否需要新增 case / 脚本
  - 断言方式
  - 选择理由
  - 缺口 / 风险
```

**输出示例（步骤被阻塞时）：**

```
current_step: environment_precheck
output: artifacts/03_environment_precheck.md
required_headings:
  - 目标环境
  - 版本 / 包 / 分支
  - 服务 / 进程 / 配置
  - 启动参数 / 环境变量
  - mock / 外部依赖
  - 恢复基线
validation_errors:
  - missing heading: 恢复基线
```

**输出示例（工作流已完成时）：**

```
workflow completed
```

### 4.4 步骤完成与门禁校验（complete）

**功能描述：** 对指定步骤执行门禁校验。校验通过时将步骤标记为已完成并推进到下一步；校验失败时将步骤标记为已阻塞并记录错误信息。

**命令格式：**

```bash
python toolset/test_agent_runner.py complete <运行标识> <步骤标识>
```

**操作示例：**

```bash
python toolset/test_agent_runner.py complete 20260520_103012_583665_EXAMPLE-1001 environment_precheck
```

**校验通过时的输出：**

```
OK: environment_precheck completed
next_step: tool_selection
```

**校验失败时的输出：**

```
BLOCKED: missing heading: 恢复基线; heading has no content: mock / 外部依赖
```

**依赖未满足时的输出：**

```
dependency not met: scope
```

**产物文件不存在时的输出：**

```
BLOCKED: artifact not found: artifacts/03_environment_precheck.md
```

**幂等性：** 对已完成的步骤重复执行 complete 命令时，直接返回已完成提示，不修改已记录的完成时间，不重复推进步骤指针：

```
already completed: environment_precheck
```

**门禁校验流程：**

校验按以下顺序依次执行，任一层失败则停止后续校验：

1. 依赖校验：检查当前步骤的所有前置依赖步骤是否均已完成
2. 产物存在性校验：检查产物文件是否存在于指定路径
3. 产物内容校验：根据步骤配置的校验规则执行结构校验和有效性校验

**退出码约定：**

| 退出码 | 含义 |
|--------|------|
| 0 | 校验通过，步骤已完成 |
| 1 | 错误（步骤不存在、依赖未满足等） |
| 2 | 校验失败，步骤已阻塞 |

### 4.5 全局校验（validate）

**功能描述：** 检查当前目标产物是否已达成。当目标产物对应的终点步骤已完成，且所有必经步骤均无阻塞状态时，判定目标已达成。

**命令格式：**

```bash
python toolset/test_agent_runner.py validate <运行标识>
```

**操作示例：**

```bash
python toolset/test_agent_runner.py validate 20260520_103012_583665_EXAMPLE-1001
```

**目标已达成时的输出：**

```
target achieved
```

**目标未达成时的输出：**

```
target not achieved
  - target_step 'execution_guide' not completed
  - tool_selection: pending
```

### 4.6 合并输出（render）

**功能描述：** 按步骤顺序将所有已完成步骤的产物文件内容合并输出为完整的 Markdown 文档。

**命令格式：**

```bash
python toolset/test_agent_runner.py render <运行标识>
```

**操作示例：**

```bash
python toolset/test_agent_runner.py render 20260520_103012_583665_EXAMPLE-1001
```

**输出格式：** 按步骤顺序，以步骤名称作为一级标题，各步骤产物内容之间以分隔线分隔，输出到标准输出流。

## 五、门禁校验规则详解

### 5.1 标题校验

标题校验用于检查 Markdown 产物文件是否包含配置要求的所有标题，且每个标题下方存在非空正文内容。

**校验逻辑：**

1. 解析产物文件中的所有 Markdown 标题（支持一级至六级标题）
2. 对配置中要求的每个必需标题，检查是否存在文本精确匹配的标题
3. 对每个匹配到的标题，确定其正文范围（当前标题到下一个标题之间的区域）
4. 检查正文范围内是否存在至少一行非空白内容

**错误类型：**

| 错误 | 含义 | 示例 |
|------|------|------|
| missing heading | 产物文件中不存在该标题 | missing heading: 恢复基线 |
| heading has no content | 标题存在但下方无非空正文 | heading has no content: mock / 外部依赖 |

### 5.2 表格校验

表格校验用于检查 Markdown 产物文件中的表格是否包含所有必需列，以及是否存在有效数据行。

**列完整性校验逻辑：**

1. 解析产物文件中的第一个 Markdown 表格
2. 提取表头行中的列名
3. 检查表头是否包含配置要求的所有必需列

**有效数据校验逻辑（仅对测试工具选型步骤）：**

1. 解析表格的所有数据行
2. 对每个数据行的关键列值执行占位符判定
3. 当所有数据行的关键列均为占位符时，判定为校验失败

**占位符判定规则：**

| 模式 | 示例 | 判定结果 |
|------|------|----------|
| 空值或纯空白 | ""、"  " | 占位符 |
| 尖括号包围的文本 | "\<待填写\>"、"\<工具名\>" | 占位符 |
| TBD（不区分大小写） | "TBD"、"tbd"、"Tbd" | 占位符 |
| 待补充 | "待补充" | 占位符 |
| 其他任何文本 | "auto_case"、"是" | 有效数据 |

**错误类型：**

| 错误 | 含义 |
|------|------|
| no table found | 产物文件中未找到表格 |
| missing column: \<列名\> | 表头缺少指定列 |
| no valid data rows (all placeholder) | 所有数据行均为占位符，无有效数据 |

## 六、中断恢复机制

### 6.1 设计原理

本软件将所有运行状态持久化至本地 JSON 文件，不依赖 AI Agent 的对话上下文。当 Agent 执行中断后（如上下文被压缩、用户隔天继续、Agent 被打断），可通过读取持久化状态恢复执行进度。

### 6.2 恢复操作流程

**第一步：查看当前状态**

```bash
python toolset/test_agent_runner.py status <运行标识>
```

**第二步：查看下一步要求**

```bash
python toolset/test_agent_runner.py next <运行标识>
```

**第三步：根据状态继续执行**

- 若当前步骤状态为 pending：按 next 输出的要求生成产物文件
- 若当前步骤状态为 blocked：根据 validation_errors 修正产物文件后重新提交
- 若产物文件已存在但步骤未完成：在已有内容基础上补全，不覆盖已有有效内容

### 6.3 状态文件说明

**run.json（运行状态文件）：**

记录运行实例的整体状态，包括运行标识、工作流类型、任务名称、目标产物类型、当前步骤指针和运行状态。

**checklist.json（步骤状态文件）：**

记录每个步骤的详细状态，包括步骤标识、是否为必经步骤、当前状态、产物输出路径、依赖步骤列表、完成时间和校验错误列表。

## 七、工作流配置说明

### 7.1 配置文件格式

工作流配置采用 YAML 格式，存储于 `config/test_agent_workflows/` 目录下。

### 7.2 配置结构

```yaml
id: <工作流标识>
name: <工作流名称>

targets:
  <目标模式名>: <终点步骤标识>

steps:
  - id: <步骤标识>
    name: <步骤名称>
    output: <产物输出路径>
    depends_on:
      - <依赖步骤标识>
    required_headings:
      - <必需标题文本>
    required_table_columns:
      - <必需列名>
```

### 7.3 配置合法性校验

系统在加载配置时自动执行以下合法性校验：

1. 步骤标识唯一性：检查所有步骤标识是否唯一，存在重复时拒绝加载
2. 依赖存在性：检查每个步骤声明的依赖步骤标识是否在步骤序列中存在
3. 目标终点存在性：检查目标产物映射中的终点步骤标识是否在步骤序列中存在

## 八、数据文件格式

### 8.1 run.json 格式

```json
{
  "run_id": "20260520_103012_583665_EXAMPLE-1001",
  "workflow_id": "test_execution",
  "name": "EXAMPLE-1001",
  "target": "execution_guide",
  "status": "running",
  "created_at": "2026-05-20T10:30:12+08:00",
  "updated_at": "2026-05-20T10:42:00+08:00",
  "current_step": "environment_precheck",
  "run_dir": ".runs/test_execution/20260520_103012_583665_EXAMPLE-1001",
  "target_step": "execution_guide",
  "blocked_reason": null
}
```

### 8.2 checklist.json 格式

```json
{
  "steps": [
    {
      "id": "input_sources",
      "name": "输入资料确认",
      "required": true,
      "status": "completed",
      "output": "artifacts/01_input_sources.md",
      "depends_on": [],
      "completed_at": "2026-05-20T10:35:00+08:00",
      "validation_errors": [],
      "notes": ""
    },
    {
      "id": "tool_selection",
      "name": "测试工具选型",
      "required": true,
      "status": "blocked",
      "output": "artifacts/04_tool_selection.md",
      "depends_on": ["environment_precheck"],
      "completed_at": null,
      "validation_errors": ["no valid data rows (all placeholder)"],
      "notes": ""
    }
  ]
}
```

## 九、技术特点

### 9.1 配置化工作流定义

工作流的步骤序列、依赖关系、门禁校验规则和目标产物映射均通过声明式 YAML 配置定义，无需修改程序代码即可调整工作流结构。

### 9.2 分层门禁校验

门禁校验按依赖校验、产物存在性校验、产物内容校验三层依次执行，任一层失败即阻止推进，确保每个步骤的产物满足质量要求。

### 9.3 目标产物模式

支持按需裁剪必经步骤，简单任务无需承担完整闭环的成本，复杂任务可执行全部步骤。

### 9.4 状态持久化与中断恢复

所有状态数据持久化至本地 JSON 文件，支持跨会话、跨时间段的连续执行，不依赖 AI Agent 的对话上下文。

### 9.5 幂等性设计

对已完成步骤重复执行完成操作时，直接返回成功，不修改已记录的完成时间，不重复推进步骤指针，确保重复操作不会破坏已有状态。

### 9.6 有效数据校验

对测试工具选型步骤，不仅检查表格结构完整性，还检查数据行是否包含非占位符的有效内容，防止 AI Agent 生成空壳文档通过门禁。

## 十、版本历史

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| V1.0 | 2026-05-20 | 初版发布，支持 start、status、next、complete、validate、render 六个命令 |
| V1.1 | 2026-05-20 | 修复运行标识同秒冲突问题（加入微秒级精度）；新增工作流配置步骤标识唯一性校验 |
