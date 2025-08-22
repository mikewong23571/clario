"""Agent 相关的 API 端点

提供 AI 引导系统的对话接口和 Agent 管理功能。
"""

import logging
from typing import Any, Dict, List, Optional
from uuid import uuid4

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel, Field

from ..agents.orchestrator import AgentOrchestrator
from ..models.agent import SendMessageRequest
from ..services.llm_service import get_llm_service


# 请求/响应模型
class ConversationStartRequest(BaseModel):
    """开始对话请求"""
    project_id: Optional[str] = None
    initial_message: Optional[str] = None


class ConversationResponse(BaseModel):
    """对话响应"""
    session_id: str
    agent_type: str
    content: str
    suggestions: List[str] = Field(default_factory=list)
    document_updates: Dict[str, Any] = Field(default_factory=dict)
    next_action: Optional[str] = None
    confidence: float
    timestamp: str


class AgentInfoResponse(BaseModel):
    """Agent 信息响应"""
    available_agents: List[str]
    current_agent: Optional[str] = None
    agent_details: Dict[str, Any] = Field(default_factory=dict)


# 路由器
router = APIRouter(prefix="/agents", tags=["agents"])
logger = logging.getLogger(__name__)

# 全局状态管理（生产环境应使用 Redis 等外部存储）
active_sessions: Dict[str, Dict[str, Any]] = {}
orchestrator: Optional[AgentOrchestrator] = None


def get_orchestrator() -> AgentOrchestrator:
    """获取 Agent 协调器实例"""
    global orchestrator
    if orchestrator is None:
        llm_service = get_llm_service()
        orchestrator = AgentOrchestrator(llm_service)
    return orchestrator


@router.post("/conversation/start", response_model=ConversationResponse)
async def start_conversation(request: ConversationStartRequest):
    """开始新的对话会话"""
    try:
        session_id = str(uuid4())

        # 初始化会话状态
        active_sessions[session_id] = {
            "project_id": request.project_id,
            "conversation_history": [],
            "project_spec": {},  # 从数据库加载项目规格
            "created_at": "2024-01-01T00:00:00Z"  # 实际应使用当前时间
        }

        # 处理初始消息（如果有）
        if request.initial_message:
            response = await send_message_internal(
                session_id,
                request.initial_message
            )
            return response
        else:
            # 返回欢迎消息
            return ConversationResponse(
                session_id=session_id,
                agent_type="promoter",
                content="你好！我是你的产品需求引导助手。让我们一起探索你的产品想法吧！请告诉我你想要解决什么问题？",
                suggestions=[
                    "描述你想解决的问题",
                    "说明你的目标用户群体",
                    "解释你的产品核心价值"
                ],
                document_updates={},
                next_action="explore_problem",
                confidence=1.0,
                timestamp="2024-01-01T00:00:00Z"
            )

    except Exception as e:
        logger.error(f"启动对话失败: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="启动对话失败")


@router.post("/conversation/{session_id}/message", response_model=ConversationResponse)
async def send_message(session_id: str, request: SendMessageRequest):
    """发送消息到指定会话"""
    try:
        return await send_message_internal(session_id, request.content)
    except KeyError:
        raise HTTPException(status_code=404, detail="会话不存在")
    except Exception as e:
        logger.error(f"发送消息失败: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="处理消息失败")


async def send_message_internal(session_id: str, content: str) -> ConversationResponse:
    """内部消息处理逻辑"""
    if session_id not in active_sessions:
        raise KeyError(f"会话 {session_id} 不存在")

    session = active_sessions[session_id]
    orchestrator_instance = get_orchestrator()

    # 添加用户消息到历史
    session["conversation_history"].append({
        "role": "user",
        "content": content,
        "timestamp": "2024-01-01T00:00:00Z"
    })

    # 处理用户输入
    agent_response = await orchestrator_instance.process_user_input(
        user_input=content,
        project_spec=session["project_spec"],
        conversation_history=session["conversation_history"],
        session_id=session_id
    )

    # 添加 Agent 响应到历史
    session["conversation_history"].append({
        "role": "assistant",
        "content": agent_response.content,
        "timestamp": "2024-01-01T00:00:00Z"
    })

    # 更新项目规格（如果有文档更新）
    if agent_response.document_updates:
        session["project_spec"].update(agent_response.document_updates)

    return ConversationResponse(
        session_id=session_id,
        agent_type=agent_response.agent_type,
        content=agent_response.content,
        suggestions=agent_response.suggestions,
        document_updates=agent_response.document_updates,
        next_action=agent_response.next_action,
        confidence=agent_response.confidence,
        timestamp="2024-01-01T00:00:00Z"
    )


@router.get("/conversation/{session_id}/history")
async def get_conversation_history(session_id: str):
    """获取对话历史"""
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="会话不存在")

    session = active_sessions[session_id]
    return {
        "session_id": session_id,
        "conversation_history": session["conversation_history"],
        "project_spec": session["project_spec"],
        "created_at": session["created_at"]
    }


@router.delete("/conversation/{session_id}")
async def end_conversation(session_id: str):
    """结束对话会话"""
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="会话不存在")

    del active_sessions[session_id]
    return {"message": "对话会话已结束", "session_id": session_id}


@router.get("/info", response_model=AgentInfoResponse)
async def get_agent_info():
    """获取 Agent 系统信息"""
    try:
        orchestrator_instance = get_orchestrator()
        available_agents = orchestrator_instance.get_available_agents()

        agent_details = {}
        for agent_type in available_agents:
            agent_details[agent_type] = orchestrator_instance.get_agent_info(agent_type)

        return AgentInfoResponse(
            available_agents=available_agents,
            current_agent="promoter",  # 默认 Agent
            agent_details=agent_details
        )

    except Exception as e:
        logger.error(f"获取 Agent 信息失败: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="获取 Agent 信息失败")


@router.websocket("/conversation/{session_id}/ws")
async def websocket_conversation(websocket: WebSocket, session_id: str):
    """WebSocket 对话接口"""
    await websocket.accept()

    try:
        # 检查会话是否存在
        if session_id not in active_sessions:
            await websocket.send_json({
                "type": "error",
                "message": "会话不存在"
            })
            await websocket.close()
            return

        logger.info(f"WebSocket 连接建立: {session_id}")

        while True:
            # 接收客户端消息
            data = await websocket.receive_json()

            if data.get("type") == "message":
                content = data.get("content", "")

                try:
                    # 处理消息
                    response = await send_message_internal(session_id, content)

                    # 发送响应
                    await websocket.send_json({
                        "type": "response",
                        "data": response.dict()
                    })

                except Exception as e:
                    logger.error(f"WebSocket 消息处理失败: {e}", exc_info=True)
                    await websocket.send_json({
                        "type": "error",
                        "message": "消息处理失败"
                    })

            elif data.get("type") == "ping":
                await websocket.send_json({"type": "pong"})

    except WebSocketDisconnect:
        logger.info(f"WebSocket 连接断开: {session_id}")
    except Exception as e:
        logger.error(f"WebSocket 错误: {e}", exc_info=True)
        try:
            await websocket.send_json({
                "type": "error",
                "message": "连接错误"
            })
        except Exception:
            pass
        finally:
            await websocket.close()


@router.get("/sessions")
async def list_active_sessions():
    """列出活跃的会话（调试用）"""
    return {
        "active_sessions": list(active_sessions.keys()),
        "total_count": len(active_sessions)
    }
