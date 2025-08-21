"""数据校验 API 端点"""

from typing import Any, Dict, Optional

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from ..services.validation import ValidationService


router = APIRouter(prefix="/validation", tags=["validation"])
validation_service = ValidationService()


class ValidateRequest(BaseModel):
    """校验请求"""
    data: Dict[str, Any]
    validation_type: str = "full"  # "pydantic", "json_schema", "business", "full"


class ValidationResponse(BaseModel):
    """校验响应"""
    is_valid: bool
    errors: list[Dict[str, Any]]
    warnings: list[str]
    schema_version: str


@router.post("/validate", response_model=ValidationResponse)
def validate_spec(request: ValidateRequest) -> ValidationResponse:
    """校验项目规格数据"""
    try:
        if request.validation_type == "pydantic":
            result = validation_service.validate_with_pydantic(request.data)
        elif request.validation_type == "json_schema":
            result = validation_service.validate_with_json_schema(request.data)
        elif request.validation_type == "business":
            # 先进行 Pydantic 校验以创建模型实例
            pydantic_result = validation_service.validate_with_pydantic(request.data)
            if not pydantic_result.is_valid:
                result = pydantic_result
            else:
                from ..models.spec import ProjectSpec
                spec = ProjectSpec.model_validate(request.data)
                result = validation_service.validate_business_rules(spec)
        elif request.validation_type == "full":
            result = validation_service.validate_full(request.data)
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"不支持的校验类型: {request.validation_type}"
            )

        return ValidationResponse(
            is_valid=result.is_valid,
            errors=result.errors,
            warnings=result.warnings,
            schema_version=validation_service.get_schema_version()
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"校验失败: {str(e)}"
        )


@router.get("/schema-version", response_model=Dict[str, str])
def get_schema_version() -> Dict[str, str]:
    """获取当前 JSON Schema 版本"""
    try:
        version = validation_service.get_schema_version()
        return {"schema_version": version}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取 Schema 版本失败: {str(e)}"
        )


@router.post("/check-compatibility", response_model=Dict[str, bool])
def check_version_compatibility(
    spec_version: str, schema_version: Optional[str] = None
) -> Dict[str, Any]:
    """检查版本兼容性"""
    try:
        is_compatible = validation_service.is_version_compatible(spec_version, schema_version)
        return {
            "is_compatible": is_compatible,
            "spec_version": spec_version,
            "schema_version": schema_version or validation_service.get_schema_version()
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"版本兼容性检查失败: {str(e)}"
        )
