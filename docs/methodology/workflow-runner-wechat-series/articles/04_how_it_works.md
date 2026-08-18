# 不是再造平台，而是加一道门：Workflow Runner 怎么工作

## 一、文章定位

- 篇次：第 4 篇
- 目标读者：工程型读者——想知道 Runner 内部机制的测试工程师和 AI 工程化实践者
- 这篇唯一核心观点：Runner 的核心结构是"8 步固定序列 + 依赖门禁 + 状态落盘 + 中断可恢复"，不复杂但有效
- 这篇希望读者看完记住的一句话：Runner 的关键不在界面，在状态推进和门禁校验

## 二、事实依据

| 观点 / 结论 | 证据来源 | 证据状态 | 备注 |
| --- | --- | --- | --- |
| 8 步 workflow 定义 | `test_agent_workflow_runner_design.md` 第 7 节 | 已有 | 步骤表 |
| 门禁规则详细定义 | `test_agent_workflow_runner_design.md` 第 8 节 | 已有 | 校验逻辑 |
| CLI 命令设计（start/status/next/complete/validate/render） | `test_agent_workflow_runner_design.md` 第 10 节 | 已有 | 命令示例和输出 |
| 文件结构（run.json / checklist.json / artifacts） | `test_agent_workflow_runner_design.md` 第 9 节 | 已有 | schema 定义 |
| Workflow 配置 YAML | `test_agent_workflow_runner_design.md` 第 12 节 | 已有 | 配置示例 |
| 中断恢复设计 | `test_agent_workflow_runner_design.md` 第 11 节 | 已有 | 恢复流程 |

## 三、正文结构

### 1. 开头 hook

上一篇讲了 Runner 的设计定位和选择逻辑。这一篇我们打开它的内部结构。

不用担心复杂度——Runner 的设计哲学是"最少够用"。它不追求覆盖所有场景，只追求在测试实施这一个 workflow 里，把步骤推进和门禁校验做可靠。

### 2. 8 步：测试实施的固定序列

第一版 Runner 的测试实施 workflow 固定为 8 步。每一步解决一个具体问题：

| 顺序 | 步骤 | 解决什么问题 |
| --- | --- | --- |
| 1 | 输入资料确认 | 测的是什么？依据是什么？ |
| 2 | 测试范围与执行口径 | 测什么、不测什么？ |
| 3 | 环境前置判断 | 环境是否就绪？版本对不对？配置到位没有？ |
| 4 | 测试工具选型 | 现有工具能不能覆盖？需不需要新增？ |
| 5 | 测试实施指南 | 可执行的 runbook |
| 6 | 测试执行记录 | 真实跑的时候发生了什么？ |
| 7 | 最终报告 | 结论是什么？ |
| 8 | 测试工程反思 | 哪些规则、工具、流程需要沉淀？ |

这 8 步的顺序是强制的。每一步都有前置依赖——不满足前置，后面的步骤进不去。

为什么要强制顺序？因为我们观察到 Agent 最容易犯的错误就是"跳到后面"。比如直接写实施指南却没做工具选型，直接写报告却没有执行记录。强制顺序是最朴素的防跳步手段。

[插图位]
图类型：主逻辑图
图目的：让读者一眼看到 8 步的线性序列和依赖关系
图依据：`test_agent_workflow_runner_design.md` 第 7 节步骤表
图重点：8 步从上到下或从左到右，每步之间有依赖箭头，突出"不能跳"的约束感

### 3. 门禁：不是检查标题存在，而是检查内容有效

Runner 的门禁不能只检查"这个文件有没有"或"这个标题存在不存在"。如果只做标题检查，Agent 写一个空标题就能蒙混过关。

第一版门禁做了三层校验：

**第一层：标题必须存在**

每个步骤的 artifact（Markdown 文件）必须包含设计配置中定义的必需标题。比如"环境前置判断"必须有：目标环境、版本/包/分支、服务/进程/配置、启动参数/环境变量、mock/外部依赖、恢复基线。

**第二层：标题下必须有非空正文**

标题存在不够，标题到下一个标题之间必须有内容。空章节不算通过。

**第三层：表格类校验**

对于"测试工具选型"这种以表格为主的步骤，校验更严格：
- 表格必须存在
- 表头必须包含必需列（Case/场景、现有工具是否覆盖、选用工具、断言方式 等）
- 必须至少有 1 行有效数据
- 有效数据不能只包含模板占位符（`<...>`、`TBD`、`待补充`）

校验失败时，Runner 不会把步骤标为 completed。它会标记为 `blocked`，并把具体的 `validation_errors` 写入 `checklist.json`。Agent 必须修复后重新提交。

### 4. 状态落盘：run.json 和 checklist.json

Runner 的所有状态信息都落在两个 JSON 文件里：

**`run.json`** 记录整体状态：

```json
{
  "run_id": "20260520_103012_feature-order-timeout",
  "workflow_id": "test_execution",
  "name": "feature-order-timeout",
  "target": "execution_guide",
  "status": "running",
  "current_step": "environment_precheck",
  "target_step": "execution_guide"
}
```

**`checklist.json`** 记录每个步骤的状态：

```json
{
  "steps": [
    {
      "id": "input_sources",
      "status": "completed",
      "completed_at": "2026-05-20T10:35:00+08:00"
    },
    {
      "id": "scope",
      "status": "completed",
      "completed_at": "2026-05-20T10:38:00+08:00"
    },
    {
      "id": "environment_precheck",
      "status": "pending",
      "validation_errors": []
    },
    {
      "id": "tool_selection",
      "status": "blocked",
      "validation_errors": ["dependency not met: environment_precheck"]
    }
  ]
}
```

这两个文件的存在解决了一个核心问题：**Agent 的执行状态不再只活在聊天上下文里。** 无论对话中断、compact、还是隔天再来，Agent 都可以通过读取这两个文件恢复进度。

### 5. CLI 命令：Agent 怎么和 Runner 交互

Runner 提供 6 个命令，覆盖完整的创建-推进-校验-恢复周期：

| 命令 | 作用 | 典型场景 |
| --- | --- | --- |
| `start` | 创建新的 workflow run | 任务开始时 |
| `status` | 查看当前各步骤状态 | 了解进度、恢复时 |
| `next` | 获取当前应执行步骤和要求 | 每步开始前 |
| `complete` | 提交步骤完成并触发校验 | 写完 artifact 后 |
| `validate` | 全局校验是否可达成目标 | 准备收尾时 |
| `render` | 合并 artifacts 生成目标文档 | 最终交付时 |

一个典型的交互流程：

```bash
# 创建 run
python toolset/test_agent_runner.py start test_execution --name feature-order-timeout --target execution_guide

# 查看该做什么
python toolset/test_agent_runner.py next 20260520_103012_feature-order-timeout

# Agent 写完 artifact 后，提交校验
python toolset/test_agent_runner.py complete 20260520_103012_feature-order-timeout input_sources

# 校验通过，继续下一步
python toolset/test_agent_runner.py next 20260520_103012_feature-order-timeout

# ... 逐步推进 ...

# 最终全局校验
python toolset/test_agent_runner.py validate 20260520_103012_feature-order-timeout
```

[插图位]
图类型：说明图
图目的：展示一次完整的 start → next → complete → validate 流程
图依据：`test_agent_workflow_runner_design.md` 第 10 节 CLI 设计
图重点：命令序列 + 关键输出 + "通过/blocked"的分叉节点

### 6. 中断恢复：不靠上下文，靠文件状态

Runner 把"中断恢复"作为第一版核心能力，而不是 nice-to-have。

原因很实际：测试实施任务跨越多天、多轮对话是常态。Agent 被打断后，不能靠猜测恢复进度。

恢复流程只需要两步：

```bash
python toolset/test_agent_runner.py status <run_id>
python toolset/test_agent_runner.py next <run_id>
```

Agent 恢复后的行为规则：

1. 不得凭聊天上下文猜测进度——必须以 `run.json` 和 `checklist.json` 为准
2. 如果当前状态是 `blocked`，必须先处理 `validation_errors`
3. 如果当前 artifact 已部分完成，在原文件基础上补全，不覆盖有效内容
4. 恢复后仍然要通过 `complete` 校验，不能直接标记完成

这套机制保证了一件事：**无论中断多少次，流程推进的状态是确定的、可追溯的、不依赖记忆的。**

### 7. 文件结构：一切透明、可检视

每次 run 产生一个独立目录：

```text
.runs/test_execution/20260520_103012_feature-order-timeout/
├── run.json            # 整体状态
├── checklist.json      # 步骤状态
├── workflow.yaml       # workflow 配置副本
├── artifacts/          # 每步产物
│   ├── 01_input_sources.md
│   ├── 02_scope.md
│   ├── 03_environment_precheck.md
│   ├── 04_tool_selection.md
│   └── 05_execution_guide.md
└── logs/               # 执行日志
```

`.runs/` 目录加入 `.gitignore`，不污染主仓库。但在本地，所有状态和产物都是普通文件——人类随时可以打开检视、核对、甚至手动修正。

[插图位]
图类型：说明图
图目的：让读者一眼看到 run 目录的完整结构
图依据：`test_agent_workflow_runner_design.md` 第 9 节文件结构
图重点：目录树 + 每个文件的一句话说明

### 8. 收束：简单但有效

回顾一下 Runner 的核心结构：

- 8 步固定序列，防跳步
- 三层门禁校验，防空产物
- JSON 状态落盘，防丢进度
- CLI 交互，Agent 可直接调用
- 中断恢复，不依赖聊天上下文

没有 UI，没有数据库，没有服务端。但它解决了一个之前解决不了的问题：**让 Agent 的执行流程从"可建议"变成"可检查、不通过时会阻断"。**

下一篇，我们用 43 条测试用例来验证这套设计到底撑不撑得住。

---

## 四、边界与待补项

- 已验证事实：8 步结构、门禁规则、CLI 命令、状态文件 schema 均为仓库内设计文档和已实现代码的真实内容
- 工程判断：门禁三层校验的粒度选择是当前阶段的工程权衡
- 仍待补证据：CLI 真机操作截图（status/next/complete 的连续输出）、run 目录结构截图
- 当前不能写死的结论：不能说"三层校验已覆盖所有绕过场景"，只能说"在当前覆盖范围内已验证有效"

## 五、给设计的补充说明

- 封面希望传达的主情绪：**秩序感** + 工程细节——读者打开就知道这篇是讲"内部结构"的
- 最重要的一张正文图：8 步流程 + 门禁节点的主逻辑图
- 最值得做成传播卡片的一句话：**Runner 的关键不在界面，在状态推进和门禁校验**
