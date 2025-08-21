"""API 路由模块"""

from .projects import router as projects_router
from .validation import router as validation_router


__all__ = ["projects_router", "validation_router"]
