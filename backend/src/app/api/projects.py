"""项目管理 API 端点"""

from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from ..models.spec import ProjectSpec
from ..services.project import ProjectNotFoundError, ProjectService


router = APIRouter(prefix="/projects", tags=["projects"])
project_service = ProjectService()


class CreateProjectRequest(BaseModel):
    """创建项目请求"""
    project_id: str
    spec: Dict[str, Any]


class UpdateProjectRequest(BaseModel):
    """更新项目请求"""
    spec: Dict[str, Any]
    change_description: str = "更新项目"


class ProjectSummary(BaseModel):
    """项目摘要"""
    id: str
    name: str
    last_updated: str
    spec_version: str
    status: str | None


@router.get("/", response_model=List[ProjectSummary])
def list_projects() -> List[ProjectSummary]:
    """获取项目列表"""
    try:
        projects = project_service.list_projects()
        return [
            ProjectSummary(
                id=p["id"],
                name=p["name"],
                last_updated=p["last_updated"].isoformat(),
                spec_version=p["spec_version"],
                status=p["status"]
            )
            for p in projects
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取项目列表失败: {str(e)}"
        )


@router.post("/", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
def create_project(request: CreateProjectRequest) -> Dict[str, Any]:
    """创建新项目"""
    try:
        spec = project_service.create_project(request.project_id, request.spec)
        return spec.model_dump(by_alias=True, exclude_none=True)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"创建项目失败: {str(e)}"
        )


@router.get("/{project_id}", response_model=Dict[str, Any])
def get_project(project_id: str) -> Dict[str, Any]:
    """获取项目详情"""
    try:
        spec = project_service.load_project(project_id)
        return spec.model_dump(by_alias=True, exclude_none=True)
    except ProjectNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"项目 {project_id} 不存在"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取项目失败: {str(e)}"
        )


@router.put("/{project_id}", response_model=Dict[str, Any])
def update_project(project_id: str, request: UpdateProjectRequest) -> Dict[str, Any]:
    """更新项目"""
    try:
        # 先加载现有项目以验证存在性
        project_service.load_project(project_id)

        # 创建新的规格实例
        spec = ProjectSpec.model_validate(request.spec)

        # 保存项目
        project_service.save_project(project_id, spec, request.change_description)

        # 返回更新后的规格
        updated_spec = project_service.load_project(project_id)
        return updated_spec.model_dump(by_alias=True, exclude_none=True)
    except ProjectNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"项目 {project_id} 不存在"
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"项目数据校验失败: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"更新项目失败: {str(e)}"
        )


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: str) -> None:
    """删除项目"""
    try:
        project_service.delete_project(project_id)
    except ProjectNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"项目 {project_id} 不存在"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"删除项目失败: {str(e)}"
        )


@router.get("/{project_id}/stats", response_model=Dict[str, Any])
def get_project_stats(project_id: str) -> Dict[str, Any]:
    """获取项目统计信息"""
    try:
        stats = project_service.get_project_stats(project_id)
        return stats
    except ProjectNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"项目 {project_id} 不存在"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取项目统计失败: {str(e)}"
        )


@router.get("/{project_id}/snapshots", response_model=List[Dict[str, Any]])
def list_snapshots(project_id: str) -> List[Dict[str, Any]]:
    """获取项目快照列表"""
    try:
        snapshots = project_service.list_snapshots(project_id)
        return snapshots
    except ProjectNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"项目 {project_id} 不存在"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取快照列表失败: {str(e)}"
        )


@router.post("/{project_id}/snapshots/{snapshot_filename}/restore", response_model=Dict[str, Any])
def restore_snapshot(project_id: str, snapshot_filename: str) -> Dict[str, Any]:
    """恢复项目快照"""
    try:
        spec = project_service.restore_snapshot(project_id, snapshot_filename)
        return spec.model_dump(by_alias=True, exclude_none=True)
    except ProjectNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"项目 {project_id} 不存在"
        )
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"恢复快照失败: {str(e)}"
        )
