"""项目服务

提供项目文件存储、版本管理、迁移等功能。
"""

import json
import shutil
from datetime import date, datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

from ..models.spec import ChangeHistory, ProjectSpec
from .validation import ValidationResult, ValidationService


class ProjectNotFoundError(Exception):
    """项目未找到错误"""
    pass


class ProjectVersionError(Exception):
    """项目版本错误"""
    pass


class ProjectService:
    """项目服务

    提供项目的 CRUD 操作、版本管理、快照和迁移功能。
    """

    def __init__(self, projects_root: Optional[Path] = None):
        self.projects_root = projects_root or Path.home() / ".clario" / "projects"
        self.projects_root.mkdir(parents=True, exist_ok=True)
        self.validation_service = ValidationService()

    def _get_project_dir(self, project_id: str) -> Path:
        """获取项目目录路径"""
        return self.projects_root / project_id

    def _get_spec_file(self, project_id: str) -> Path:
        """获取项目规格文件路径"""
        return self._get_project_dir(project_id) / "spec.json"

    def _get_snapshots_dir(self, project_id: str) -> Path:
        """获取快照目录路径"""
        return self._get_project_dir(project_id) / "snapshots"

    def _get_exports_dir(self, project_id: str) -> Path:
        """获取导出目录路径"""
        return self._get_project_dir(project_id) / "exports"

    def create_project(self, project_id: str, initial_spec: Dict[str, Any]) -> ProjectSpec:
        """创建新项目"""
        project_dir = self._get_project_dir(project_id)

        if project_dir.exists():
            raise ValueError(f"项目 {project_id} 已存在")

        # 校验初始规格
        validation_result = self.validation_service.validate_full(initial_spec)
        if not validation_result.is_valid:
            raise ValueError(f"项目规格校验失败: {validation_result.errors}")

        # 创建项目目录结构
        project_dir.mkdir(parents=True)
        self._get_snapshots_dir(project_id).mkdir()
        self._get_exports_dir(project_id).mkdir()

        # 创建 ProjectSpec 实例
        spec = ProjectSpec.model_validate(initial_spec)

        # 添加创建记录到变更历史
        if not spec.change_history:
            spec.change_history = []

        spec.change_history.append(ChangeHistory(
            date=date.today(),
            description=f"创建项目 {project_id}",
            related=["project"]
        ))

        # 保存项目文件
        self._save_spec(project_id, spec)

        # 创建初始快照
        self._create_snapshot(project_id, "项目创建")

        return spec

    def load_project(self, project_id: str) -> ProjectSpec:
        """加载项目"""
        spec_file = self._get_spec_file(project_id)

        if not spec_file.exists():
            raise ProjectNotFoundError(f"项目 {project_id} 不存在")

        with open(spec_file, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # 校验数据
        validation_result = self.validation_service.validate_full(data)
        if not validation_result.is_valid:
            raise ValueError(f"项目规格校验失败: {validation_result.errors}")

        return ProjectSpec.model_validate(data)

    def save_project(
        self,
        project_id: str,
        spec: ProjectSpec,
        change_description: Optional[str] = None
    ) -> None:
        """保存项目"""
        if not self._get_project_dir(project_id).exists():
            raise ProjectNotFoundError(f"项目 {project_id} 不存在")

        # 更新最后修改时间
        spec.last_updated = date.today()

        # 添加变更记录
        if change_description:
            if not spec.change_history:
                spec.change_history = []

            spec.change_history.append(ChangeHistory(
                date=date.today(),
                description=change_description
            ))

        # 保存文件
        self._save_spec(project_id, spec)

    def _save_spec(self, project_id: str, spec: ProjectSpec) -> None:
        """保存规格文件"""
        spec_file = self._get_spec_file(project_id)

        # 转换为字典并保存
        data = spec.model_dump(by_alias=True, exclude_none=True)

        with open(spec_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2, default=str)

    def list_projects(self) -> List[Dict[str, Any]]:
        """列出所有项目"""
        projects = []

        for project_dir in self.projects_root.iterdir():
            if project_dir.is_dir():
                spec_file = project_dir / "spec.json"
                if spec_file.exists():
                    try:
                        spec = self.load_project(project_dir.name)
                        problem_statement = spec.core_idea.problem_statement
                        display_name = (
                            problem_statement[:50] + "..."
                            if len(problem_statement) > 50
                            else problem_statement
                        )
                        projects.append({
                            "id": project_dir.name,
                            "name": display_name,
                            "last_updated": spec.last_updated,
                            "spec_version": spec.spec_version,
                            "status": spec.meta.document_status if spec.meta else None
                        })
                    except Exception:
                        # 跳过损坏的项目
                        continue

        return sorted(projects, key=lambda x: x["last_updated"], reverse=True)

    def delete_project(self, project_id: str) -> None:
        """删除项目"""
        project_dir = self._get_project_dir(project_id)

        if not project_dir.exists():
            raise ProjectNotFoundError(f"项目 {project_id} 不存在")

        shutil.rmtree(project_dir)

    def _create_snapshot(self, project_id: str, description: str) -> str:
        """创建快照"""
        snapshots_dir = self._get_snapshots_dir(project_id)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        snapshot_file = snapshots_dir / f"{timestamp}_{description.replace(' ', '_')}.json"

        # 复制当前规格文件
        spec_file = self._get_spec_file(project_id)
        shutil.copy2(spec_file, snapshot_file)

        return snapshot_file.name

    def list_snapshots(self, project_id: str) -> List[Dict[str, Any]]:
        """列出项目快照"""
        snapshots_dir = self._get_snapshots_dir(project_id)

        if not snapshots_dir.exists():
            return []

        snapshots = []
        for snapshot_file in snapshots_dir.glob("*.json"):
            # 解析文件名获取时间戳和描述
            name_parts = snapshot_file.stem.split("_", 2)
            if len(name_parts) >= 2:
                timestamp_str = f"{name_parts[0]}_{name_parts[1]}"
                description = name_parts[2] if len(name_parts) > 2 else "快照"

                try:
                    timestamp = datetime.strptime(timestamp_str, "%Y%m%d_%H%M%S")
                    snapshots.append({
                        "filename": snapshot_file.name,
                        "timestamp": timestamp,
                        "description": description.replace("_", " "),
                        "size": snapshot_file.stat().st_size
                    })
                except ValueError:
                    continue

        return sorted(snapshots, key=lambda x: x["timestamp"], reverse=True)

    def restore_snapshot(self, project_id: str, snapshot_filename: str) -> ProjectSpec:
        """恢复快照"""
        snapshots_dir = self._get_snapshots_dir(project_id)
        snapshot_file = snapshots_dir / snapshot_filename

        if not snapshot_file.exists():
            raise FileNotFoundError(f"快照文件 {snapshot_filename} 不存在")

        # 创建当前状态的备份快照
        self._create_snapshot(project_id, "恢复前备份")

        # 恢复快照
        spec_file = self._get_spec_file(project_id)
        shutil.copy2(snapshot_file, spec_file)

        # 加载并返回恢复的规格
        spec = self.load_project(project_id)

        # 添加恢复记录
        if not spec.change_history:
            spec.change_history = []

        spec.change_history.append(ChangeHistory(
            date=date.today(),
            description=f"从快照 {snapshot_filename} 恢复",
            related=["project"]
        ))

        self.save_project(project_id, spec)

        return spec

    def validate_project(self, project_id: str) -> ValidationResult:
        """校验项目"""
        spec_file = self._get_spec_file(project_id)

        if not spec_file.exists():
            raise ProjectNotFoundError(f"项目 {project_id} 不存在")

        with open(spec_file, 'r', encoding='utf-8') as f:
            data = json.load(f)

        return self.validation_service.validate_full(data)

    def get_project_stats(self, project_id: str) -> Dict[str, Any]:
        """获取项目统计信息"""
        spec = self.load_project(project_id)
        snapshots = self.list_snapshots(project_id)

        scenario_stats: Dict[str, Any] = {
            "total": len(spec.scenarios),
            "by_status": {},
            "by_complexity": {},
            "by_priority": {}
        }

        for scenario in spec.scenarios:
            # 按状态统计
            status = scenario.status.value if scenario.status else "未设置"
            scenario_stats["by_status"][status] = scenario_stats["by_status"].get(status, 0) + 1

            # 按复杂度统计
            complexity = (
                scenario.estimated_complexity.value
                if scenario.estimated_complexity else "未设置"
            )
            scenario_stats["by_complexity"][complexity] = (
                scenario_stats["by_complexity"].get(complexity, 0) + 1
            )

            # 按优先级统计
            priority = scenario.priority.level.value if scenario.priority else "未设置"
            scenario_stats["by_priority"][priority] = (
                scenario_stats["by_priority"].get(priority, 0) + 1
            )

        return {
            "project_id": project_id,
            "spec_version": spec.spec_version,
            "last_updated": spec.last_updated,
            "scenarios": scenario_stats,
            "decisions": len(spec.decision_log),
            "changes": len(spec.change_history),
            "snapshots": len(snapshots),
            "validation": self.validate_project(project_id).to_dict()
        }
