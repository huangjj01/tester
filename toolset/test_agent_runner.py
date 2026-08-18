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
    targets: dict[str, str]  # target_name -> terminal_step_id
    steps: list[StepConfig]

    @classmethod
    def load_from_yaml(cls, path: Path) -> WorkflowConfig:
        """从 YAML 文件加载 workflow 配置。

        Args:
            path: YAML 配置文件路径。

        Returns:
            解析后的 WorkflowConfig 对象。

        Raises:
            SystemExit: 配置文件不存在或格式错误时退出。
        """
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
        """根据 step_id 查找步骤配置。

        Args:
            step_id: 步骤唯一标识。

        Returns:
            匹配的 StepConfig，未找到时返回 None。
        """
        for step in self.steps:
            if step.id == step_id:
                return step
        return None

    def get_required_steps(self, target: str) -> list[StepConfig]:
        """获取指定 target 模式下需要完成的步骤列表。

        返回从第一个步骤到 target 对应终点步骤（含）的所有步骤。

        Args:
            target: 目标产物模式名称（如 execution_guide、full 等）。

        Returns:
            需要完成的步骤列表（按顺序）。若 target 无效则返回空列表。
        """
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
        """获取当前步骤之后的下一个步骤。

        Args:
            current_step_id: 当前步骤 id。

        Returns:
            下一个 StepConfig，若已是最后一步则返回 None。
        """
        found = False
        for step in self.steps:
            if found:
                return step
            if step.id == current_step_id:
                found = True
        return None


# ---------------------------------------------------------------------------
# 运行状态数据模型
# ---------------------------------------------------------------------------


@dataclass
class StepState:
    """单个步骤的运行时状态。"""

    id: str
    name: str
    required: bool
    status: str  # pending | blocked | completed | not_required_yet
    output: str
    depends_on: list[str] = field(default_factory=list)
    completed_at: Optional[str] = None
    validation_errors: list[str] = field(default_factory=list)
    notes: str = ""

    def to_dict(self) -> dict:
        """将 StepState 序列化为字典。

        Returns:
            包含所有字段的字典，可直接用于 JSON 序列化。
        """
        return {
            "id": self.id,
            "name": self.name,
            "required": self.required,
            "status": self.status,
            "output": self.output,
            "depends_on": list(self.depends_on),
            "completed_at": self.completed_at,
            "validation_errors": list(self.validation_errors),
            "notes": self.notes,
        }

    @classmethod
    def from_dict(cls, data: dict) -> StepState:
        """从字典反序列化为 StepState 对象。

        Args:
            data: 包含 StepState 字段的字典。

        Returns:
            反序列化后的 StepState 对象。
        """
        return cls(
            id=data["id"],
            name=data["name"],
            required=data["required"],
            status=data["status"],
            output=data["output"],
            depends_on=data.get("depends_on", []),
            completed_at=data.get("completed_at"),
            validation_errors=data.get("validation_errors", []),
            notes=data.get("notes", ""),
        )


@dataclass
class RunState:
    """一次 workflow run 的整体运行状态。"""

    run_id: str
    workflow_id: str
    name: str
    target: str
    status: str  # running | blocked | completed | failed
    created_at: str
    updated_at: str
    current_step: str
    run_dir: str
    target_step: str
    blocked_reason: Optional[str] = None

    def to_dict(self) -> dict:
        """将 RunState 序列化为字典。

        Returns:
            包含所有字段的字典，可直接用于 JSON 序列化。
        """
        return {
            "run_id": self.run_id,
            "workflow_id": self.workflow_id,
            "name": self.name,
            "target": self.target,
            "status": self.status,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "current_step": self.current_step,
            "run_dir": self.run_dir,
            "target_step": self.target_step,
            "blocked_reason": self.blocked_reason,
        }

    @classmethod
    def from_dict(cls, data: dict) -> RunState:
        """从字典反序列化为 RunState 对象。

        Args:
            data: 包含 RunState 字段的字典。

        Returns:
            反序列化后的 RunState 对象。
        """
        return cls(
            run_id=data["run_id"],
            workflow_id=data["workflow_id"],
            name=data["name"],
            target=data["target"],
            status=data["status"],
            created_at=data["created_at"],
            updated_at=data["updated_at"],
            current_step=data["current_step"],
            run_dir=data["run_dir"],
            target_step=data["target_step"],
            blocked_reason=data.get("blocked_reason"),
        )


# ---------------------------------------------------------------------------
# 状态文件持久化函数
# ---------------------------------------------------------------------------


def save_run_state(state: RunState, run_dir: Path) -> None:
    """将 RunState 序列化并写入 run.json。

    Args:
        state: 要保存的 RunState 对象。
        run_dir: run 目录路径（run.json 将写入此目录）。
    """
    path = run_dir / "run.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(state.to_dict(), f, ensure_ascii=False, indent=2)


def load_run_state(run_dir: Path) -> RunState:
    """从 run.json 加载 RunState。

    Args:
        run_dir: run 目录路径（包含 run.json）。

    Returns:
        反序列化后的 RunState 对象。

    Raises:
        SystemExit: run.json 不存在或格式错误时退出。
    """
    path = run_dir / "run.json"
    if not path.exists():
        print(f"run not found: {run_dir}", file=sys.stderr)
        sys.exit(1)

    with path.open("r", encoding="utf-8") as f:
        data = json.load(f)

    return RunState.from_dict(data)


def save_checklist(steps: list[StepState], run_dir: Path) -> None:
    """将 checklist（步骤状态列表）序列化并写入 checklist.json。

    Args:
        steps: StepState 对象列表。
        run_dir: run 目录路径（checklist.json 将写入此目录）。
    """
    path = run_dir / "checklist.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    data = {"steps": [step.to_dict() for step in steps]}
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def load_checklist(run_dir: Path) -> list[StepState]:
    """从 checklist.json 加载步骤状态列表。

    Args:
        run_dir: run 目录路径（包含 checklist.json）。

    Returns:
        反序列化后的 StepState 对象列表。

    Raises:
        SystemExit: checklist.json 不存在或格式错误时退出。
    """
    path = run_dir / "checklist.json"
    if not path.exists():
        print(f"checklist not found: {run_dir}", file=sys.stderr)
        sys.exit(1)

    with path.open("r", encoding="utf-8") as f:
        data = json.load(f)

    return [StepState.from_dict(step_data) for step_data in data["steps"]]


# ---------------------------------------------------------------------------
# 门禁校验器
# ---------------------------------------------------------------------------

# 匹配 Markdown 标题行：一个或多个 # 后跟空格
_HEADING_RE = re.compile(r"^(#{1,6})\s+(.+)$")


def check_required_headings(content: str, required_headings: list[str]) -> list[str]:
    """检查 Markdown 内容是否包含所有必需标题，且标题下有非空正文。

    解析 Markdown 标题（支持 # ~ ###### 级别），对每个必需标题检查：
    1. 标题是否存在（case-sensitive 精确匹配标题文本）
    2. 标题下方到下一个标题之间是否有非空正文（去除空行和纯空白行）

    Args:
        content: Markdown 文件内容字符串（可为空）。
        required_headings: 必需标题文本列表（不含 # 前缀）。

    Returns:
        错误列表；空列表表示全部通过。
        - 缺失标题: "missing heading: <heading>"
        - 标题无内容: "heading has no content: <heading>"
    """
    lines = content.split("\n")

    # 解析所有标题及其位置
    headings: list[tuple[int, str]] = []  # (行号, 标题文本)
    for idx, line in enumerate(lines):
        match = _HEADING_RE.match(line)
        if match:
            heading_text = match.group(2).strip()
            headings.append((idx, heading_text))

    # 构建标题 -> 是否有非空正文的映射
    heading_has_content: dict[str, bool] = {}
    for i, (line_idx, heading_text) in enumerate(headings):
        # 确定正文范围：当前标题行之后到下一个标题行之前（或文件末尾）
        start = line_idx + 1
        if i + 1 < len(headings):
            end = headings[i + 1][0]
        else:
            end = len(lines)

        # 检查范围内是否有非空行（去除空行和纯空白行）
        has_content = False
        for body_line in lines[start:end]:
            if body_line.strip():
                has_content = True
                break

        # 若同名标题出现多次，只要有一处有内容即视为通过
        if heading_text in heading_has_content:
            heading_has_content[heading_text] = (
                heading_has_content[heading_text] or has_content
            )
        else:
            heading_has_content[heading_text] = has_content

    # 对每个必需标题生成错误
    errors: list[str] = []
    for heading in required_headings:
        if heading not in heading_has_content:
            errors.append(f"missing heading: {heading}")
        elif not heading_has_content[heading]:
            errors.append(f"heading has no content: {heading}")

    return errors


# 匹配表格分隔行：仅包含 |、-、:、空格
_TABLE_SEPARATOR_RE = re.compile(r"^\|[\s\-:|]+\|$")

# 匹配模板占位符 <...> 模式
_PLACEHOLDER_ANGLE_RE = re.compile(r"^<[^>]*>$")


def _is_placeholder(value: str) -> bool:
    """判断单元格值是否为模板占位符。

    占位符定义：
    - 空字符串或纯空白
    - <...> 模式（尖括号包裹任意内容）
    - TBD（不区分大小写）
    - 待补充

    Args:
        value: 去除首尾空白后的单元格文本。

    Returns:
        True 表示该值为占位符。
    """
    stripped = value.strip()
    if not stripped:
        return True
    if _PLACEHOLDER_ANGLE_RE.match(stripped):
        return True
    if stripped.upper() == "TBD":
        return True
    if stripped == "待补充":
        return True
    return False


def _parse_table(content: str) -> tuple[list[str], list[list[str]]] | None:
    """解析 Markdown 内容中的第一个表格。

    识别规则：
    - 表头行：以 | 分隔的单元格
    - 分隔行：仅包含 |、-、:、空格
    - 数据行：分隔行之后的以 | 分隔的行

    Args:
        content: Markdown 文件内容。

    Returns:
        (columns, data_rows) 元组，columns 为表头列名列表，data_rows 为数据行列表。
        若未找到表格则返回 None。
    """
    lines = content.split("\n")

    # 查找分隔行，其前一行为表头行
    for i, line in enumerate(lines):
        stripped_line = line.strip()
        if not _TABLE_SEPARATOR_RE.match(stripped_line):
            continue
        # 分隔行必须有前一行作为表头
        if i == 0:
            continue

        header_line = lines[i - 1].strip()
        # 表头行必须以 | 开头
        if not header_line.startswith("|"):
            continue

        # 解析表头列名
        # 去掉首尾 |，按 | 分割
        columns = [
            col.strip() for col in header_line.strip("|").split("|")
        ]

        # 解析数据行（分隔行之后的连续表格行）
        data_rows: list[list[str]] = []
        for j in range(i + 1, len(lines)):
            data_line = lines[j].strip()
            if not data_line.startswith("|"):
                break
            cells = [cell.strip() for cell in data_line.strip("|").split("|")]
            data_rows.append(cells)

        return columns, data_rows

    return None


def check_required_table_columns(content: str, columns: list[str]) -> list[str]:
    """检查 Markdown 表格表头是否包含所有必需列。

    解析 Markdown 内容中的第一个表格，检查其表头是否包含所有指定的必需列。

    Args:
        content: Markdown 文件内容字符串。
        columns: 必需列名列表。

    Returns:
        错误列表；空列表表示全部通过。
        - 无表格: ["no table found"]
        - 缺少列: "missing column: <col>"
    """
    parsed = _parse_table(content)
    if parsed is None:
        return ["no table found"]

    header_columns, _ = parsed
    errors: list[str] = []
    for col in columns:
        if col not in header_columns:
            errors.append(f"missing column: {col}")

    return errors


def check_table_has_valid_data(content: str, columns: list[str]) -> list[str]:
    """检查 Markdown 表格是否至少有 1 行非模板有效数据。

    解析 Markdown 表格，检查数据行中是否至少有一行在必需列中包含非占位符的有效数据。
    模板占位符定义：空值/纯空白、<...> 模式、TBD（不区分大小写）、待补充。

    Args:
        content: Markdown 文件内容字符串。
        columns: 必需列名列表（用于定位需要检查的列索引）。

    Returns:
        错误列表；空列表表示全部通过。
        - 无表格: ["no table found"]
        - 无有效数据行: ["no valid data rows (all placeholder)"]
    """
    parsed = _parse_table(content)
    if parsed is None:
        return ["no table found"]

    header_columns, data_rows = parsed

    # 找到必需列在表头中的索引
    col_indices: list[int] = []
    for col in columns:
        if col in header_columns:
            col_indices.append(header_columns.index(col))

    # 若没有匹配到任何必需列索引，无法判断有效数据
    # （缺列错误由 check_required_table_columns 报告）
    if not col_indices:
        return ["no valid data rows (all placeholder)"]

    # 检查是否至少有 1 行有效数据
    for row in data_rows:
        for idx in col_indices:
            if idx < len(row):
                if not _is_placeholder(row[idx]):
                    return []  # 找到有效数据，通过

    return ["no valid data rows (all placeholder)"]


@dataclass
class ValidationResult:
    """门禁校验结果。"""

    passed: bool
    errors: list[str]


def validate_artifact(step_config: StepConfig, artifact_path: Path) -> ValidationResult:
    """对单个 artifact 执行门禁校验。

    组合标题校验和表格校验，对 tool_selection 步骤额外执行有效数据校验。
    不修改 artifact 文件内容。

    Args:
        step_config: 步骤配置，包含门禁规则（required_headings、required_table_columns）。
        artifact_path: artifact 文件路径（必须存在）。

    Returns:
        ValidationResult，passed=True 当且仅当所有门禁规则通过，
        errors 列表包含所有失败原因的描述。
    """
    content = artifact_path.read_text(encoding="utf-8")
    errors: list[str] = []

    # 标题+非空内容校验
    if step_config.required_headings:
        errors.extend(check_required_headings(content, step_config.required_headings))

    # 表格列校验
    if step_config.required_table_columns:
        errors.extend(
            check_required_table_columns(content, step_config.required_table_columns)
        )
        # tool_selection 特殊校验：至少 1 行有效数据
        if step_config.id == "tool_selection":
            errors.extend(
                check_table_has_valid_data(content, step_config.required_table_columns)
            )

    return ValidationResult(passed=len(errors) == 0, errors=errors)


# ---------------------------------------------------------------------------
# 步骤推进逻辑
# ---------------------------------------------------------------------------


def advance_current_step(
    run_state: RunState, checklist: list[StepState], workflow: WorkflowConfig
) -> None:
    """推进 current_step 到下一个可执行步骤。

    从当前步骤向后扫描 checklist，找到下一个 pending 或 blocked 步骤作为新的
    current_step。若遇到 not_required_yet 步骤或所有步骤已完成，则标记 workflow
    为 completed。

    Args:
        run_state: 当前运行状态，将被原地修改 current_step 和 status。
        checklist: 步骤状态列表。
        workflow: workflow 配置，用于确定步骤顺序。
    """
    steps = workflow.steps

    # 找到当前步骤在 workflow 中的索引
    current_idx = -1
    for i, step in enumerate(steps):
        if step.id == run_state.current_step:
            current_idx = i
            break

    if current_idx == -1:
        return

    # 从当前步骤之后向前扫描
    for i in range(current_idx + 1, len(steps)):
        step_id = steps[i].id
        # 在 checklist 中查找对应状态
        step_state: Optional[StepState] = None
        for ss in checklist:
            if ss.id == step_id:
                step_state = ss
                break

        if step_state is None:
            continue

        if step_state.status == "not_required_yet":
            # 到达 target 边界，workflow 完成
            run_state.status = "completed"
            run_state.current_step = step_id
            return

        if step_state.status in ("pending", "blocked"):
            run_state.current_step = step_id
            return

    # 所有步骤已完成
    run_state.status = "completed"


# ---------------------------------------------------------------------------
# CLI 命令
# ---------------------------------------------------------------------------


def _resolve_project_root() -> Path:
    """Resolve project root (directory containing config/).

    使用脚本文件位置向上一级定位项目根目录。

    Returns:
        项目根目录路径。
    """
    return Path(__file__).resolve().parent.parent


def _find_run_dir(run_id: str) -> Path:
    """Find run directory by run_id, searching in .runs/ subdirectories.

    在 .runs/ 下的所有 workflow 子目录中搜索匹配的 run_id 目录。

    Args:
        run_id: 运行 ID。

    Returns:
        匹配的 run 目录路径。

    Raises:
        SystemExit: 未找到匹配的 run 目录时退出。
    """
    project_root = _resolve_project_root()
    runs_dir = project_root / ".runs"

    if not runs_dir.exists():
        print(f"run not found: {run_id}", file=sys.stderr)
        sys.exit(1)

    # 搜索 .runs/*/run_id/
    for workflow_dir in runs_dir.iterdir():
        if not workflow_dir.is_dir():
            continue
        candidate = workflow_dir / run_id
        if candidate.is_dir() and (candidate / "run.json").exists():
            return candidate

    print(f"run not found: {run_id}", file=sys.stderr)
    sys.exit(1)


def cmd_start(args: argparse.Namespace) -> int:
    """创建新的 workflow run。

    加载 workflow 配置，验证 target 有效性，生成 run_id，创建目录结构，
    初始化 checklist 和 run state，输出 run 信息。

    Args:
        args: 包含 workflow_id、name、target 的命令行参数。

    Returns:
        0 成功，1 错误。
    """
    project_root = _resolve_project_root()
    workflow_id = args.workflow_id
    name = args.name
    target = args.target

    # 加载 workflow 配置
    config_path = (
        project_root / "config" / "test_agent_workflows" / f"{workflow_id}.yaml"
    )
    workflow = WorkflowConfig.load_from_yaml(config_path)

    # 验证 target 有效性
    if target not in workflow.targets:
        valid_targets = ", ".join(workflow.targets.keys())
        print(
            f"invalid target: {target} (valid: {valid_targets})", file=sys.stderr
        )
        return 1

    # 生成 run_id（含完整微秒，避免同秒冲突）
    now = datetime.now()
    timestamp = now.strftime("%Y%m%d_%H%M%S_%f")
    run_id = f"{timestamp}_{name}"

    # 创建 run 目录结构
    run_dir = project_root / ".runs" / workflow_id / run_id
    (run_dir / "artifacts").mkdir(parents=True, exist_ok=True)
    (run_dir / "logs").mkdir(parents=True, exist_ok=True)

    # 确定 target 对应的终点 step_id
    target_step = workflow.targets[target]

    # 初始化 checklist
    required_steps = workflow.get_required_steps(target)
    required_step_ids = {s.id for s in required_steps}

    checklist: list[StepState] = []
    first_step_id: Optional[str] = None
    for step in workflow.steps:
        if step.id in required_step_ids:
            status = "pending"
            required = True
        else:
            status = "not_required_yet"
            required = False

        checklist.append(
            StepState(
                id=step.id,
                name=step.name,
                required=required,
                status=status,
                output=step.output,
                depends_on=list(step.depends_on),
            )
        )

        if first_step_id is None and status == "pending":
            first_step_id = step.id

    # 创建 run state
    now_iso = datetime.now().astimezone().isoformat()
    run_state = RunState(
        run_id=run_id,
        workflow_id=workflow_id,
        name=name,
        target=target,
        status="running",
        created_at=now_iso,
        updated_at=now_iso,
        current_step=first_step_id or workflow.steps[0].id,
        run_dir=f".runs/{workflow_id}/{run_id}",
        target_step=target_step,
    )

    # 持久化
    save_run_state(run_state, run_dir)
    save_checklist(checklist, run_dir)

    # 输出
    print(f"run_id: {run_id}")
    print(f"next_step: {run_state.current_step}")
    print(f"run_dir: {run_state.run_dir}")

    return 0


def cmd_status(args: argparse.Namespace) -> int:
    """查看 run 状态。

    加载 run 的 checklist，输出每个步骤的 id 和当前状态。

    Args:
        args: 包含 run_id 的命令行参数。

    Returns:
        0 成功。
    """
    run_dir = _find_run_dir(args.run_id)
    checklist = load_checklist(run_dir)

    for step in checklist:
        print(f"{step.id}: {step.status}")

    return 0


def cmd_next(args: argparse.Namespace) -> int:
    """查看下一步。

    输出当前应执行步骤的信息，包括 output 路径和门禁要求。

    Args:
        args: 包含 run_id 的命令行参数。

    Returns:
        0 成功。
    """
    run_dir = _find_run_dir(args.run_id)
    run_state = load_run_state(run_dir)
    checklist = load_checklist(run_dir)

    # 检查 workflow 是否已完成
    if run_state.status == "completed":
        print("workflow completed")
        return 0

    # 加载 workflow 配置以获取门禁要求
    project_root = _resolve_project_root()
    config_path = (
        project_root
        / "config"
        / "test_agent_workflows"
        / f"{run_state.workflow_id}.yaml"
    )
    workflow = WorkflowConfig.load_from_yaml(config_path)
    step_config = workflow.get_step(run_state.current_step)

    print(f"current_step: {run_state.current_step}")
    if step_config:
        print(f"output: {step_config.output}")
        if step_config.required_headings:
            print("required_headings:")
            for heading in step_config.required_headings:
                print(f"  - {heading}")
        if step_config.required_table_columns:
            print("required_table_columns:")
            for col in step_config.required_table_columns:
                print(f"  - {col}")

    # 如果当前步骤是 blocked，输出 validation_errors
    for step in checklist:
        if step.id == run_state.current_step and step.status == "blocked":
            if step.validation_errors:
                print("validation_errors:")
                for err in step.validation_errors:
                    print(f"  - {err}")
            break

    return 0


def cmd_complete(args: argparse.Namespace) -> int:
    """步骤完成与门禁校验。

    对指定步骤执行依赖检查、artifact 存在性检查和内容校验。
    校验通过则标记 completed 并推进 current_step；校验失败则标记 blocked。

    Args:
        args: 包含 run_id 和 step_id 的命令行参数。

    Returns:
        0 成功（OK），2 校验失败（BLOCKED），1 错误。
    """
    run_dir = _find_run_dir(args.run_id)
    run_state = load_run_state(run_dir)
    checklist = load_checklist(run_dir)

    step_id = args.step_id

    # 查找步骤
    step_state: Optional[StepState] = None
    for ss in checklist:
        if ss.id == step_id:
            step_state = ss
            break

    if step_state is None:
        print(f"step not found: {step_id}", file=sys.stderr)
        return 1

    # 幂等检查
    if step_state.status == "completed":
        print(f"already completed: {step_id}")
        return 0

    # 依赖检查
    for dep_id in step_state.depends_on:
        dep_state: Optional[StepState] = None
        for ss in checklist:
            if ss.id == dep_id:
                dep_state = ss
                break
        if dep_state is None or dep_state.status != "completed":
            print(f"dependency not met: {dep_id}", file=sys.stderr)
            return 1

    # 加载 workflow 配置
    project_root = _resolve_project_root()
    config_path = (
        project_root
        / "config"
        / "test_agent_workflows"
        / f"{run_state.workflow_id}.yaml"
    )
    workflow = WorkflowConfig.load_from_yaml(config_path)
    step_config = workflow.get_step(step_id)

    if step_config is None:
        print(f"step config not found: {step_id}", file=sys.stderr)
        return 1

    # artifact 存在性检查
    artifact_path = run_dir / step_config.output
    if not artifact_path.exists():
        step_state.status = "blocked"
        step_state.validation_errors = [
            f"artifact not found: {step_config.output}"
        ]
        run_state.updated_at = datetime.now().astimezone().isoformat()
        save_checklist(checklist, run_dir)
        save_run_state(run_state, run_dir)
        print(f"BLOCKED: artifact not found: {step_config.output}")
        return 2

    # 内容校验
    result = validate_artifact(step_config, artifact_path)

    if result.passed:
        step_state.status = "completed"
        step_state.completed_at = datetime.now().astimezone().isoformat()
        step_state.validation_errors = []
        advance_current_step(run_state, checklist, workflow)
        run_state.updated_at = datetime.now().astimezone().isoformat()
        save_checklist(checklist, run_dir)
        save_run_state(run_state, run_dir)
        print(f"OK: {step_id} completed")
        if run_state.status == "completed":
            print("workflow completed")
        else:
            print(f"next_step: {run_state.current_step}")
        return 0
    else:
        step_state.status = "blocked"
        step_state.validation_errors = list(result.errors)
        run_state.updated_at = datetime.now().astimezone().isoformat()
        save_checklist(checklist, run_dir)
        save_run_state(run_state, run_dir)
        errors_str = "; ".join(result.errors)
        print(f"BLOCKED: {errors_str}")
        return 2


def cmd_validate(args: argparse.Namespace) -> int:
    """全局校验：检查 target 是否已达成。

    检查 target_step 是否已 completed，且所有 required steps 无 blocked 状态。
    not_required_yet 步骤不阻塞 target 完成。

    Args:
        args: 包含 run_id 的命令行参数。

    Returns:
        0 target 已达成，2 未达成。
    """
    run_dir = _find_run_dir(args.run_id)
    run_state = load_run_state(run_dir)
    checklist = load_checklist(run_dir)

    # 检查 target_step 是否 completed
    target_completed = False
    blocking_reasons: list[str] = []

    for step in checklist:
        if step.status == "not_required_yet":
            continue
        if step.id == run_state.target_step and step.status == "completed":
            target_completed = True
        if step.status == "blocked":
            blocking_reasons.append(
                f"{step.id}: blocked ({'; '.join(step.validation_errors)})"
            )
        elif step.status == "pending" and step.required:
            blocking_reasons.append(f"{step.id}: pending")

    if target_completed and not blocking_reasons:
        print("target achieved")
        return 0
    else:
        if not target_completed:
            blocking_reasons.insert(
                0, f"target_step '{run_state.target_step}' not completed"
            )
        print("target not achieved")
        for reason in blocking_reasons:
            print(f"  - {reason}")
        return 2


def cmd_render(args: argparse.Namespace) -> int:
    """合并输出已完成步骤的 artifact。

    按步骤顺序读取已完成步骤的 artifact 文件，以步骤名称作为分隔标题，
    合并为单个 Markdown 输出到 stdout。

    Args:
        args: 包含 run_id 的命令行参数。

    Returns:
        0 成功。
    """
    run_dir = _find_run_dir(args.run_id)
    checklist = load_checklist(run_dir)

    parts: list[str] = []
    for step in checklist:
        if step.status != "completed":
            continue
        artifact_path = run_dir / step.output
        if not artifact_path.exists():
            continue
        content = artifact_path.read_text(encoding="utf-8")
        parts.append(f"# {step.name}\n\n{content}")

    output = "\n\n---\n\n".join(parts)
    print(output)

    return 0


# ---------------------------------------------------------------------------
# 主入口
# ---------------------------------------------------------------------------


def main() -> int:
    """CLI 主入口，解析命令行参数并路由到对应子命令。

    Returns:
        子命令的退出码。
    """
    parser = argparse.ArgumentParser(
        prog="test_agent_runner",
        description="Test Agent Workflow Runner - 测试实施 workflow 流程门禁 CLI 工具",
    )
    subparsers = parser.add_subparsers(dest="command", help="子命令")

    # start 子命令
    start_parser = subparsers.add_parser("start", help="创建新的 workflow run")
    start_parser.add_argument("workflow_id", help="Workflow ID")
    start_parser.add_argument("--name", required=True, help="需求编号或功能名")
    start_parser.add_argument("--target", required=True, help="目标产物模式")

    # status 子命令
    status_parser = subparsers.add_parser("status", help="查看 run 状态")
    status_parser.add_argument("run_id", help="Run ID")

    # next 子命令
    next_parser = subparsers.add_parser("next", help="查看下一步")
    next_parser.add_argument("run_id", help="Run ID")

    # complete 子命令
    complete_parser = subparsers.add_parser("complete", help="步骤完成与校验")
    complete_parser.add_argument("run_id", help="Run ID")
    complete_parser.add_argument("step_id", help="Step ID")

    # validate 子命令
    validate_parser = subparsers.add_parser("validate", help="全局校验")
    validate_parser.add_argument("run_id", help="Run ID")

    # render 子命令
    render_parser = subparsers.add_parser("render", help="合并输出 artifacts")
    render_parser.add_argument("run_id", help="Run ID")

    args = parser.parse_args()

    if args.command is None:
        parser.print_help()
        return 1

    # 路由到对应子命令
    commands = {
        "start": cmd_start,
        "status": cmd_status,
        "next": cmd_next,
        "complete": cmd_complete,
        "validate": cmd_validate,
        "render": cmd_render,
    }

    handler = commands.get(args.command)
    if handler is None:
        parser.print_help()
        return 1

    return handler(args)


if __name__ == "__main__":
    sys.exit(main())
