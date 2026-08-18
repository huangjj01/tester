# 源代码（鉴别材料）

## 软件名称：AI Agent 测试实施工作流门禁控制系统 V1.1

## 文件一：toolset/test_agent_runner.py

```python
#!/usr/bin/env python3
"""Test Agent Workflow Runner - 测试实施 workflow 流程门禁 CLI 工具。

为 AI Agent 的测试实施任务提供可执行、可检查、可恢复的本地流程门禁。
强制 Agent 按固定步骤推进，并在关键产物缺失或内容为空时阻止进入后续阶段。
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Optional

import yaml


# ---------------------------------------------------------------------------
# 配置数据模型
# ---------------------------------------------------------------------------


@dataclass
class StepConfig:
    """Workflow 中单个步骤的配置定义。"""

    id: str
    name: str
    output: str
    depends_on: list[str] = field(default_factory=list)
    required_headings: list[str] = field(default_factory=list)
    required_table_columns: list[str] = field(default_factory=list)


@dataclass
class WorkflowConfig:
    """Workflow 配置，从 YAML 文件加载。"""

    id: str
    name: str
    targets: dict[str, str]
    steps: list[StepConfig]

    @classmethod
    def load_from_yaml(cls, path: Path) -> WorkflowConfig:
        """从 YAML 文件加载 workflow 配置。"""
        if not path.exists():
            print(f"workflow config not found: {path}", file=sys.stderr)
            sys.exit(1)

        try:
            with path.open("r", encoding="utf-8") as f:
                data = yaml.safe_load(f)
        except yaml.YAMLError as exc:
            print(f"workflow config parse error: {exc}", file=sys.stderr)
            sys.exit(1)

        if not isinstance(data, dict):
            print("workflow config must be a YAML mapping", file=sys.stderr)
            sys.exit(1)

        steps: list[StepConfig] = []
        for step_data in data.get("steps", []):
            steps.append(
                StepConfig(
                    id=step_data["id"],
                    name=step_data["name"],
                    output=step_data["output"],
                    depends_on=step_data.get("depends_on", []),
                    required_headings=step_data.get("required_headings", []),
                    required_table_columns=step_data.get("required_table_columns", []),
                )
            )

        # 校验 step id 唯一性
        step_ids = [s.id for s in steps]
        duplicates = [sid for sid in step_ids if step_ids.count(sid) > 1]
        if duplicates:
            dup_set = sorted(set(duplicates))
            print(
                f"workflow config error: duplicate step id(s): {', '.join(dup_set)}",
                file=sys.stderr,
            )
            sys.exit(1)

        return cls(
            id=data["id"],
            name=data["name"],
            targets=data.get("targets", {}),
            steps=steps,
        )

    def get_step(self, step_id: str) -> Optional[StepConfig]:
        """根据 step_id 查找步骤配置。"""
        for step in self.steps:
            if step.id == step_id:
                return step
        return None

    def get_required_steps(self, target: str) -> list[StepConfig]:
        """获取指定 target 模式下需要完成的步骤列表。"""
        terminal_step_id = self.targets.get(target)
        if terminal_step_id is None:
            return []

        required: list[StepConfig] = []
        for step in self.steps:
            required.append(step)
            if step.id == terminal_step_id:
                break
        return required

    def get_next_step(self, current_step_id: str) -> Optional[StepConfig]:
        """获取当前步骤之后的下一个步骤。"""
        found = False
        for step in self.steps:
            if found:
                return step
            if step.id == current_step_id:
                found = True
        return None
```

（注：以上为源代码前部分节选。完整源代码共 1156 行，包含配置数据模型、运行状态数据模型、状态文件持久化函数、门禁校验器、步骤推进逻辑和 CLI 命令六个模块。完整代码见项目文件 `toolset/test_agent_runner.py`。）

## 文件二：config/test_agent_workflows/test_execution.yaml

```yaml
id: test_execution
name: 测试实施 Workflow

targets:
  execution_guide: execution_guide
  execution_record: execution_record
  report: report
  full: reflection

steps:
  - id: input_sources
    name: 输入资料确认
    output: artifacts/01_input_sources.md
    required_headings:
      - 输入资料
      - 已确认项
      - 待确认项

  - id: scope
    name: 测试范围与执行口径
    output: artifacts/02_scope.md
    depends_on:
      - input_sources
    required_headings:
      - 本轮测试范围
      - 不测范围
      - 部分覆盖项
      - 待确认项

  - id: environment_precheck
    name: 环境前置判断
    output: artifacts/03_environment_precheck.md
    depends_on:
      - scope
    required_headings:
      - 目标环境
      - 版本 / 包 / 分支
      - 服务 / 进程 / 配置
      - 启动参数 / 环境变量
      - mock / 外部依赖
      - 恢复基线

  - id: tool_selection
    name: 测试工具选型
    output: artifacts/04_tool_selection.md
    depends_on:
      - environment_precheck
    required_table_columns:
      - Case / 场景
      - 现有工具是否覆盖
      - 选用工具
      - 是否需要新增 case / 脚本
      - 断言方式
      - 选择理由
      - 缺口 / 风险

  - id: execution_guide
    name: 测试实施指南
    output: artifacts/05_execution_guide.md
    depends_on:
      - tool_selection
    required_headings:
      - 公共准备步骤
      - 逐 Case 实施步骤
      - 证据采集
      - 通过标准
      - 失败 / 阻塞处理

  - id: execution_record
    name: 测试执行记录
    output: artifacts/06_execution_record.md
    depends_on:
      - execution_guide
    required_headings:
      - 执行摘要
      - 测试工具选型结果
      - 逐 case 执行明细
      - 覆盖矩阵
      - 恢复记录
      - 未覆盖 / 阻塞项

  - id: report
    name: 最终报告
    output: artifacts/07_report.md
    depends_on:
      - execution_record
    required_headings:
      - 已验证通过
      - 发现的问题或需复测项
      - 部分覆盖和未执行项
      - 环境恢复状态
      - 剩余风险

  - id: reflection
    name: 测试工程反思
    output: artifacts/08_reflection.md
    depends_on:
      - report
    required_headings:
      - 本次暴露的规则缺口
      - 本次暴露的 skill / 执行流程缺口
      - 本次暴露的工具缺口
      - 建议沉淀项
```

---

**源代码提交说明：**

本软件源程序总计约 1236 行（主程序 1156 行 + 配置文件 80 行），不足 60 页，按规定提交全部源代码。正式提交时请使用 `toolset/test_agent_runner.py` 原始文件打印，每页 50 行，共约 24 页。
