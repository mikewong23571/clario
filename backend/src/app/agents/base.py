"""智能体基类定义

定义所有智能体的通用接口和行为。
"""

from abc import ABC, abstractmethod
from typing import Any, Dict

from ..models.agent import AgentContext, AgentResponse


class BaseAgent(ABC):
    """智能体基类 - 定义所有 Agent 的通用接口"""

    def __init__(self, llm_client, agent_config: Dict[str, Any] = None):
        self.llm_client = llm_client
        self.agent_type = self.__class__.__name__.lower().replace('agent', '')
        self.config = agent_config or {}

    @abstractmethod
    async def process(self, context: AgentContext) -> AgentResponse:
        """处理用户输入的核心方法"""
        pass

    @abstractmethod
    def get_system_prompt(self) -> str:
        """获取 Agent 的系统提示词"""
        pass

    def _should_handle(self, context: AgentContext) -> bool:
        """判断是否应该处理这个上下文"""
        return True  # 默认实现，子类可覆盖

    def _extract_document_updates(
        self, llm_response: str, project_spec: Dict[str, Any]
    ) -> Dict[str, Any]:
        """从LLM响应中提取文档更新指令"""
        # 基础实现，子类可以覆盖以提供更复杂的逻辑
        updates = {}

        # 这里可以添加通用的文档更新提取逻辑
        # 例如：检测关键词、解析结构化信息等

        return updates

    def _build_context_prompt(self, context: AgentContext) -> str:
        """构建包含上下文信息的提示"""
        prompt_parts = []

        # 添加项目当前状态
        if context.project_spec:
            prompt_parts.append(f"当前项目状态: {context.project_spec}")

        # 添加对话历史摘要
        if context.conversation_history:
            recent_messages = context.conversation_history[-3:]  # 只取最近3条
            history_summary = "\n".join([
                f"{msg.get('role', 'unknown')}: {msg.get('content', '')[:100]}..."
                for msg in recent_messages
            ])
            prompt_parts.append(f"最近对话:\n{history_summary}")

        # 添加当前焦点
        if context.current_focus:
            prompt_parts.append(f"当前焦点: {context.current_focus}")

        # 添加用户输入
        prompt_parts.append(f"用户输入: {context.user_input}")

        return "\n\n".join(prompt_parts)
