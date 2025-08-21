from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import projects_router, validation_router


app = FastAPI(
    title="Clario API",
    description="多智能体协作的需求澄清与文档生成平台",
    version="0.1.0"
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # 前端开发服务器
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(projects_router)
app.include_router(validation_router)


@app.get("/health")
def health() -> dict[str, str]:
    """健康检查端点"""
    return {"status": "ok", "service": "clario-backend"}
