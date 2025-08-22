"""推进者智能体

负责引导用户探索和澄清产品需求。
"""

import json
from typing import Any, Dict

from ..models.agent import AgentContext, AgentResponse
from .base import BaseAgent


class PromoterAgent(BaseAgent):
    """推进者 Agent - 负责引导用户探索和澄清需求"""

    def get_system_prompt(self) -> str:
        return """你是一个专业的产品需求顾问，擅长引导用户澄清产品想法。

你的职责：
1. 根据用户输入，识别需要澄清的关键信息
2. 提出具体、有针对性的问题帮助用户思考
3. 基于用户回答，更新项目规格文档的相关部分
4. 保持对话自然流畅，避免一次性问太多问题

回应格式要求：
- 用友好、专业的语调
- 每次最多提出1-2个问题
- 提供具体的例子和建议
- 如果用户信息充分，主动推进到下一个环节

请以JSON格式回复，包含以下字段：
{
    "content": "你的回复内容",
    "suggestions": ["建议选项1", "建议选项2"],
    "document_updates": {
        "section": "要更新的文档部分",
        "content": "更新的内容"
    },
    "next_action": "下一步建议行动"
}"""

    async def process(self, context: AgentContext) -> AgentResponse:
        # 1. 分析当前项目状态
        current_state = self._analyze_project_state(context.project_spec)

        # 2. 构建 LLM 提示
        prompt = self._build_exploration_prompt(context, current_state)

        # 3. 调用 LLM 生成响应
        try:
            response_data = await self.llm_client.structured_completion(
                messages=[
                    {"role": "system", "content": self.get_system_prompt()},
                    {"role": "user", "content": prompt}
                ],
                response_format={
                    "content": "string",
                    "suggestions": "array",
                    "document_updates": "object",
                    "next_action": "string"
                },
                temperature=0.7
            )
        except Exception as e:
            # 降级处理：返回基础响应
            print(f"PromoterAgent LLM调用失败: {e}")
            response_data = {
                "content": "我理解了你的想法。能否详细说明一下你希望解决的核心问题是什么？",
                "suggestions": ["描述目标用户", "说明核心功能", "解释使用场景"],
                "document_updates": {},
                "next_action": "clarify_core_problem"
            }

        # 4. 处理文档更新
        document_updates = self._process_document_updates(
            response_data.get("document_updates", {}),
            context
        )

        return AgentResponse(
            agent_type=self.agent_type,
            content=response_data.get("content", ""),
            suggestions=response_data.get("suggestions", []),
            document_updates=document_updates,
            next_action=response_data.get("next_action"),
            confidence=0.8
        )

    def _analyze_project_state(self, project_spec: Dict[str, Any]) -> Dict[str, Any]:
        """分析项目当前完成状态"""
        analysis = {
            "completed_sections": [],
            "missing_info": [],
            "next_priorities": []
        }

        # 检查核心理念
        core_idea = project_spec.get("coreIdea", {})
        if not core_idea.get("problemStatement"):
            analysis["missing_info"].append("problem_statement")
            analysis["next_priorities"].append("define_core_problem")
        else:
            analysis["completed_sections"].append("problem_statement")

        if not core_idea.get("targetAudience"):
            analysis["missing_info"].append("target_audience")
            analysis["next_priorities"].append("identify_users")
        else:
            analysis["completed_sections"].append("target_audience")

        if not core_idea.get("valueProposition"):
            analysis["missing_info"].append("value_proposition")
            analysis["next_priorities"].append("define_value")
        else:
            analysis["completed_sections"].append("value_proposition")

        # 检查功能范围
        scope = project_spec.get("scope", {})
        if not scope.get("coreFeatures"):
            analysis["missing_info"].append("core_features")
            if "problem_statement" in analysis["completed_sections"]:
                analysis["next_priorities"].append("define_features")

        # 检查使用场景
        scenarios = project_spec.get("scenarios", [])
        if not scenarios:
            analysis["missing_info"].append("user_scenarios")
            if "target_audience" in analysis["completed_sections"]:
                analysis["next_priorities"].append("explore_scenarios")

        return analysis

    def _build_exploration_prompt(
        self, context: AgentContext, state_analysis: Dict[str, Any]
    ) -> str:
        """构建探索引导的提示"""
        prompt_parts = []

        # 添加项目状态分析
        prompt_parts.append(f"项目完成状态分析: {json.dumps(state_analysis, ensure_ascii=False)}")

        # 添加上下文信息
        prompt_parts.append(self._build_context_prompt(context))

        # 添加引导策略
        if state_analysis["next_priorities"]:
            next_priority = state_analysis["next_priorities"][0]
            strategy_map = {
                "define_core_problem": "引导用户明确要解决的核心问题",
                "identify_users": "帮助用户识别和描述目标用户群体",
                "define_value": "协助用户阐述产品的独特价值主张",
                "define_features": "引导用户思考核心功能需求",
                "explore_scenarios": "帮助用户描述具体的使用场景"
            }
            strategy = strategy_map.get(next_priority, "继续深入探索用户需求")
            prompt_parts.append(f"当前引导策略: {strategy}")

        return "\n\n".join(prompt_parts)

    def _process_document_updates(
        self, updates: Dict[str, Any], context: AgentContext
    ) -> Dict[str, Any]:
        """处理和验证文档更新"""
        if not updates:
            return {}

        processed_updates = {}

        # 根据更新的section类型进行处理
        section = updates.get("section")
        content = updates.get("content")

        if section and content:
            # 验证section是否为有效的文档部分
            valid_sections = [
                "coreIdea.problemStatement",
                "coreIdea.targetAudience",
                "coreIdea.valueProposition",
                "scope.coreFeatures",
                "scenarios"
            ]

            if section in valid_sections:
                processed_updates[section] = content
            else:
                # 如果section无效，记录到通用更新中
                processed_updates["general_notes"] = f"{section}: {content}"

        return processed_updates
