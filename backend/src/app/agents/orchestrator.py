"""智能体协调器

负责分析用户意图并路由请求到合适的智能体。
"""

import logging
from datetime import datetime
from typing import Any, Dict, List

from ..models.agent import AgentContext, AgentResponse, UserIntent
from ..services.llm_service import LLMService
from .promoter import PromoterAgent


class AgentOrchestrator:
    """Agent 协调器 - 智能路由用户请求到合适的 Agent"""

    def __init__(self, llm_service: LLMService):
        self.llm_service = llm_service
        self.agents = {
            "promoter": PromoterAgent(llm_service),
            # 后续可以添加其他 Agent
            # "reviewer": ReviewerAgent(llm_service),
            # "recorder": RecorderAgent(llm_service),
        }
        self.logger = logging.getLogger(__name__)

    async def process_user_input(
        self,
        user_input: str,
        project_spec: Dict[str, Any],
        conversation_history: List[Dict[str, Any]],
        session_id: str
    ) -> AgentResponse:
        """协调器主入口 - 分析意图并路由到合适的 Agent"""

        try:
            # 1. 分析用户意图
            intent = await self._analyze_user_intent(
                user_input, conversation_history, project_spec
            )

            # 2. 选择合适的 Agent
            agent = self._select_agent(intent)

            # 3. 构建执行上下文
            context = AgentContext(
                project_spec=project_spec,
                conversation_history=conversation_history,
                current_focus=intent.focus_area,
                user_input=user_input,
                session_id=session_id
            )

            # 4. 执行并返回结果
            response = await agent.process(context)

            # 5. 记录执行日志
            await self._log_agent_execution(intent, response, session_id)

            return response

        except Exception as e:
            self.logger.error(f"协调器处理失败: {e}", exc_info=True)

            # 降级处理：返回默认的探索响应
            return AgentResponse(
                agent_type="promoter",
                content="我遇到了一些技术问题，但我仍然可以帮助你。请告诉我更多关于你的产品想法。",
                suggestions=["描述你的产品概念", "说明目标用户", "解释核心功能"],
                document_updates={},
                next_action="explore_basic_info",
                confidence=0.5
            )

    async def _analyze_user_intent(
        self,
        user_input: str,
        history: List[Dict[str, Any]],
        project_spec: Dict[str, Any]
    ) -> UserIntent:
        """使用 LLM 分析用户意图"""
        try:
            intent_data = await self.llm_service.analyze_intent(
                user_input, history, project_spec
            )

            return UserIntent(
                action_type=intent_data.get("action_type", "explore"),
                focus_area=intent_data.get("focus_area", "general"),
                confidence=intent_data.get("confidence", 0.7),
                parameters=intent_data.get("parameters", {})
            )

        except Exception as e:
            self.logger.warning(f"意图分析失败，使用默认意图: {e}")

            # 降级处理：基于关键词的简单意图识别
            return self._fallback_intent_analysis(user_input, project_spec)

    def _fallback_intent_analysis(
        self, user_input: str, project_spec: Dict[str, Any]
    ) -> UserIntent:
        """降级的意图分析 - 基于关键词匹配"""
        user_input_lower = user_input.lower()

        # 简单的关键词匹配
        if any(word in user_input_lower for word in ["用户", "目标", "受众", "客户"]):
            focus_area = "core_idea"
        elif any(word in user_input_lower for word in ["功能", "特性", "需求", "范围"]):
            focus_area = "scope"
        elif any(word in user_input_lower for word in ["场景", "使用", "流程", "步骤"]):
            focus_area = "scenarios"
        else:
            focus_area = "general"

        # 根据项目状态判断行动类型
        if not project_spec.get("coreIdea", {}).get("problemStatement"):
            action_type = "explore"
        else:
            action_type = "clarify"

        return UserIntent(
            action_type=action_type,
            focus_area=focus_area,
            confidence=0.6,
            parameters={"fallback": True}
        )

    def _select_agent(self, intent: UserIntent) -> Any:
        """根据意图选择合适的 Agent"""
        # 当前版本主要使用 PromoterAgent
        # 后续可以根据 intent.action_type 选择不同的 Agent

        if intent.action_type in ["explore", "clarify"]:
            return self.agents["promoter"]
        elif intent.action_type == "review":
            # 未来可以添加 ReviewerAgent
            return self.agents["promoter"]  # 暂时使用 PromoterAgent
        elif intent.action_type == "record":
            # 未来可以添加 RecorderAgent
            return self.agents["promoter"]  # 暂时使用 PromoterAgent
        else:
            # 默认使用 PromoterAgent
            return self.agents["promoter"]

    async def _log_agent_execution(
        self,
        intent: UserIntent,
        response: AgentResponse,
        session_id: str
    ) -> None:
        """记录 Agent 执行日志"""
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "session_id": session_id,
            "intent": {
                "action_type": intent.action_type,
                "focus_area": intent.focus_area,
                "confidence": intent.confidence
            },
            "response": {
                "agent_type": response.agent_type,
                "confidence": response.confidence,
                "has_document_updates": bool(response.document_updates),
                "suggestions_count": len(response.suggestions)
            }
        }

        self.logger.info(f"Agent执行完成: {log_data}")

    def get_available_agents(self) -> List[str]:
        """获取可用的 Agent 列表"""
        return list(self.agents.keys())

    def get_agent_info(self, agent_type: str) -> Dict[str, Any]:
        """获取指定 Agent 的信息"""
        agent = self.agents.get(agent_type)
        if not agent:
            return {}

        return {
            "type": agent_type,
            "class_name": agent.__class__.__name__,
            "system_prompt_preview": agent.get_system_prompt()[:200] + "..."
        }
