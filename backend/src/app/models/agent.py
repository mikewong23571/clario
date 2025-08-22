"""Agent 相关数据模型

定义智能体系统的核心数据结构和接口。
"""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class AgentType(str, Enum):
    """智能体类型"""
    PROMOTER = "promoter"
    REVIEWER = "reviewer"
    RECORDER = "recorder"


class MessageRole(str, Enum):
    """消息角色"""
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class AgentContext(BaseModel):
    """智能体执行上下文"""
    project_spec: Dict[str, Any] = Field(description="当前项目规格")
    conversation_history: List[Dict[str, Any]] = Field(default_factory=list, description="对话历史")
    current_focus: str = Field(description="当前对话焦点")
    user_input: str = Field(description="用户输入")
    session_id: str = Field(description="会话ID")
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class AgentResponse(BaseModel):
    """智能体响应结果"""
    agent_type: str = Field(description="Agent 类型标识")
    content: str = Field(description="响应内容")
    suggestions: List[str] = Field(default_factory=list, description="建议选项")
    document_updates: Dict[str, Any] = Field(default_factory=dict, description="文档更新指令")
    next_action: Optional[str] = Field(None, description="下一步建议行动")
    confidence: float = Field(default=1.0, ge=0.0, le=1.0, description="响应置信度")


class Message(BaseModel):
    """对话消息"""
    id: str = Field(description="消息ID")
    role: MessageRole = Field(description="消息角色")
    content: str = Field(description="消息内容")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    project_id: str = Field(description="项目ID")
    agent_type: Optional[str] = Field(None, description="生成消息的Agent类型")
    suggestions: List[str] = Field(default_factory=list, description="AI建议选项")


class ConversationError(BaseModel):
    """对话错误信息"""
    message: str = Field(description="错误消息")
    code: str = Field(description="错误代码")
    details: Optional[Dict[str, Any]] = Field(None, description="错误详情")


class SendMessageRequest(BaseModel):
    """发送消息请求"""
    content: str = Field(description="消息内容")
    project_id: str = Field(description="项目ID")
    conversation_history: List[Message] = Field(default_factory=list, description="对话历史")


class UserIntent(BaseModel):
    """用户意图分析结果"""
    action_type: str = Field(description="行动类型: explore, review, record, clarify")
    focus_area: str = Field(description="焦点区域: core_idea, scope, scenarios, general")
    confidence: float = Field(ge=0.0, le=1.0, description="置信度")
    parameters: Dict[str, Any] = Field(default_factory=dict, description="意图参数")


# BaseAgent 已移动到 agents.base 模块中
