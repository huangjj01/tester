# AGENTS

本文件是通用 **Agent 测试工程流程** 的入口与红线。维护原则：**红线放本文件，流程细节放 skill**。skill 唯一事实来源是 `.cursor/skills/`；两者冲突时红线以本文件为准、流程细节以 skill 为准。

## 通用红线（强制）

- **删除授权**：未收到用户逐条明示的删除授权时，禁止执行 `rm` / `rmdir` / `git clean` / 清空目录 / 任何等效于删除或不可逆整目录覆盖的操作。用户仅说“同步/对齐/更新/保持一致”不视为删除授权。
- **代码修改**：不随意修改代码，必须先提供方案并获得用户同意后再改。
- **沟通语言**：与用户沟通、撰写文档默认使用中文。
- **正式内容禁临时个人信息**：提交到项目的正式内容（需求、用例、实施指南、执行记录、报告、README、checklist、skill）禁止写入本地个人路径、个人用户名、一次性历史执行流水、一次性 PID 等临时信息；确需展示时只放在明确标注“示例 / 临时排查附录”的非正式段落。
- **默认非破坏**：默认不使用 `sudo` 破坏执行环境；影响面大或不可逆的操作先与用户确认。

## 完整测试流程（需求分析 → 报告）

这条流程由 Runner 门禁引擎串起，覆盖四个阶段：

| 阶段 | 入口 skill / 工具 |
| --- | --- |
| 需求分析 + 测试用例设计 | `.cursor/skills/test-case-design-checklist/SKILL.md` |
| 测试实施（指南 / 工具选型 / 执行记录 / 覆盖矩阵 / 报告） | `.cursor/skills/feature_test_execution_docs/SKILL.md` + Runner |
| 交付前文档自检与润色 | `.cursor/skills/humanizer/SKILL.md` |

skill 索引见 `.cursor/skills/README.md`。

## 测试实施 Runner 入口（强制）

当用户要求以下任一产物时，Agent 必须先启动 Runner，不得直接开写：测试实施指南 / 测试工具选型 / 测试执行记录 / 覆盖矩阵 / 最终测试报告 / 团队报告草稿 / 根据已有需求落地执行方案。

启动命令：

```bash
python toolset/test_agent_runner.py start test_execution --name <需求编号或功能名> --target <target>
```

Runner 校验未通过时，不得跳过步骤，不得生成目标产物，不得宣称测试实施流程完成。门禁命令、target 选型表与中断恢复规则见 `feature_test_execution_docs` skill 正文。

## Skill 维护约定

- `.cursor/skills/` 是共享 skill 的唯一事实来源。
- 新增 skill 应保持场景单一；skill 内容必须保持通用，不写死某个具体项目、服务、字段或需求编号。
- 项目特有内容只写进具体需求文档，不写进通用 skill 或模板。
