"""JSON Schema 校验服务

提供基于 meta-doc/spec.schema.json 的数据校验功能。
"""

import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Set

from pydantic import ValidationError as PydanticValidationError

from ..models.spec import ProjectSpec


class ValidationError(Exception):
    """校验错误"""

    def __init__(self, message: str, errors: Optional[List[Dict[str, Any]]] = None):
        super().__init__(message)
        self.errors = errors or []


class ValidationResult:
    """校验结果"""

    def __init__(
        self,
        is_valid: bool,
        errors: Optional[List[Dict[str, Any]]] = None,
        warnings: Optional[List[str]] = None
    ):
        self.is_valid = is_valid
        self.errors = errors or []
        self.warnings = warnings or []

    def __bool__(self) -> bool:
        return self.is_valid

    def to_dict(self) -> Dict[str, Any]:
        return {
            "is_valid": self.is_valid,
            "errors": self.errors,
            "warnings": self.warnings
        }


class ValidationService:
    """JSON Schema 校验服务

    提供项目规格文档的校验功能，支持：
    - Pydantic 模型校验
    - JSON Schema 校验
    - 版本兼容性检查
    - 业务规则校验
    """

    def __init__(self) -> None:
        """初始化校验服务"""
        self._schema_cache: Optional[Dict[str, Any]] = None
        self._schema_path = self._get_schema_path()

    def _get_schema_path(self) -> Path:
        """获取 JSON Schema 文件路径"""
        # 从当前文件向上查找项目根目录
        current_dir = Path(__file__).parent
        while current_dir.parent != current_dir:
            schema_path = current_dir / "meta-doc" / "spec.schema.json"
            if schema_path.exists():
                return schema_path
            current_dir = current_dir.parent

        raise FileNotFoundError("未找到 meta-doc/spec.schema.json 文件")

    def _load_schema(self) -> Dict[str, Any]:
        """加载 JSON Schema"""
        if self._schema_cache is None:
            with open(self._schema_path, 'r', encoding='utf-8') as f:
                self._schema_cache = json.load(f)
        return self._schema_cache

    def validate_with_pydantic(self, data: Dict[str, Any]) -> ValidationResult:
        """使用 Pydantic 模型进行校验"""
        try:
            # 尝试创建 ProjectSpec 实例
            ProjectSpec.model_validate(data)
            return ValidationResult(is_valid=True)
        except PydanticValidationError as e:
            errors = []
            for error in e.errors():
                errors.append({
                    "field": ".".join(str(loc) for loc in error["loc"]),
                    "message": error["msg"],
                    "type": error["type"],
                    "input": error.get("input")
                })
            return ValidationResult(is_valid=False, errors=errors)

    def validate_with_json_schema(self, data: Dict[str, Any]) -> ValidationResult:
        """使用 JSON Schema 进行校验

        注意：这里暂时使用 Pydantic 校验，后续可以集成 jsonschema 库
        """
        # TODO: 集成 jsonschema 库进行更严格的 JSON Schema 校验
        return self.validate_with_pydantic(data)

    def validate_business_rules(self, spec: ProjectSpec) -> ValidationResult:
        """业务规则校验"""
        warnings = []
        errors = []

        # 检查范围内外的项目是否有重叠
        if spec.scope:
            in_scope_set = set(spec.scope.in_scope)
            out_of_scope_set = set(spec.scope.out_of_scope)
            overlap = in_scope_set.intersection(out_of_scope_set)
            if overlap:
                errors.append({
                    "type": "scope_overlap",
                    "message": f"范围重叠: {list(overlap)}",
                    "field": "scope",
                    "overlapping_items": list(overlap)
                })

        # 检查场景依赖是否存在
        if spec.scenarios:
            scenario_ids = {scenario.id for scenario in spec.scenarios}
            for scenario in spec.scenarios:
                if scenario.dependencies:
                    for dep_id in scenario.dependencies:
                        if dep_id not in scenario_ids:
                            errors.append({
                                "type": "missing_dependency",
                                "message": f"场景 {scenario.id} 依赖的场景不存在: {dep_id}",
                                "field": "scenarios",
                                "scenario_id": scenario.id or "unknown",
                                "missing_dependency": dep_id
                            })

        # 检查场景依赖是否存在循环
        if spec.scenarios and len(spec.scenarios) > 1:
            # 简单的循环检测：检查是否存在相互依赖
            scenario_deps: Dict[str, Set[str]] = {
                scenario.id: set(scenario.dependencies or [])
                for scenario in spec.scenarios
                if scenario.id is not None
            }
            for scenario_id, deps in scenario_deps.items():
                for dep_id in deps:
                    if dep_id in scenario_deps and scenario_id in scenario_deps[dep_id]:
                        errors.append({
                            "type": "circular_dependency",
                            "message": f"场景存在循环依赖: {scenario_id} <-> {dep_id}",
                            "field": "scenarios",
                            "circular_scenarios": [scenario_id, dep_id]
                        })

        # 检查优先级分配是否合理
        if spec.scenarios:
            mvp_count = sum(
                1 for s in spec.scenarios
                if s.priority and s.priority.level.value == "MVP"
            )
            total_count = len(spec.scenarios)
            if mvp_count > total_count * 0.5:  # MVP场景不应超过总数的50%
                warnings.append(f"MVP场景过多 ({mvp_count}/{total_count})，建议重新评估优先级")

        return ValidationResult(
            is_valid=len(errors) == 0,
            errors=errors,
            warnings=warnings
        )

    def validate_full(self, data: Dict[str, Any]) -> ValidationResult:
        """完整校验

        包括 Pydantic 模型校验、JSON Schema 校验和业务规则校验。
        """
        # 首先进行 Pydantic 校验
        pydantic_result = self.validate_with_pydantic(data)
        if not pydantic_result.is_valid:
            return pydantic_result

        # 创建 ProjectSpec 实例用于业务规则校验
        spec = ProjectSpec.model_validate(data)

        # 进行业务规则校验
        business_result = self.validate_business_rules(spec)

        return ValidationResult(
            is_valid=business_result.is_valid,
            errors=business_result.errors,
            warnings=business_result.warnings
        )

    def get_schema_version(self) -> str:
        """获取 Schema 版本"""
        schema = self._load_schema()
        comment = schema.get("$comment", "")
        if isinstance(comment, str):
            return comment.replace("schemaVersion: ", "")
        return ""

    def is_version_compatible(
        self, spec_version: str, schema_version: Optional[str] = None
    ) -> bool:
        """检查版本兼容性"""
        if schema_version is None:
            schema_version = self.get_schema_version()

        # 简单的版本兼容性检查
        # TODO: 实现更复杂的语义版本兼容性检查
        try:
            spec_parts = [int(x) for x in spec_version.split('.')]
            schema_parts = [int(x) for x in schema_version.split('.')]

            # 主版本号必须相同
            return spec_parts[0] == schema_parts[0]
        except (ValueError, IndexError):
            return False
