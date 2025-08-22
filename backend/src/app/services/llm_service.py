"""LLM 集成服务

提供与智谱AI等LLM服务的集成接口。
"""

import json
import os
from typing import Any, Dict, List, Optional

from openai import AsyncOpenAI
from pydantic import BaseModel


class LLMConfig(BaseModel):
    """LLM配置"""
    base_url: str
    api_key: str
    model: str
    max_tokens: int = 2000
    temperature: float = 0.7
    timeout: float = 30.0


class LLMService:
    """LLM服务类"""

    def __init__(self, config: LLMConfig):
        self.config = config
        self.client = AsyncOpenAI(
            base_url=config.base_url,
            api_key=config.api_key,
            timeout=config.timeout
        )

    @classmethod
    def from_config_file(cls, config_path: str) -> "LLMService":
        """从配置文件创建LLM服务实例"""
        config_data = {}

        with open(config_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and ':' in line:
                    key, value = line.split(':', 1)
                    config_data[key.strip()] = value.strip()

        # 转换配置键名
        llm_config = LLMConfig(
            base_url=config_data.get('base_url', ''),
            api_key=config_data.get('apiKey', ''),
            model=config_data.get('model', 'glm-4')
        )

        return cls(llm_config)

    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        **kwargs
    ) -> str:
        """聊天完成接口"""
        try:
            response = await self.client.chat.completions.create(
                model=self.config.model,
                messages=messages,
                temperature=temperature or self.config.temperature,
                max_tokens=max_tokens or self.config.max_tokens,
                **kwargs
            )

            return response.choices[0].message.content or ""

        except Exception as e:
            print(f"LLM API调用失败: {e}")
            raise

    async def structured_completion(
        self,
        messages: List[Dict[str, str]],
        response_format: Dict[str, Any]
    ) -> Dict[str, Any]:
        """结构化响应 - 返回 JSON 格式的结果"""
        try:
            response = await self.client.chat.completions.create(
                model=self.config.model,
                messages=messages,
                response_format={"type": "json_object"},
                temperature=0.3,
                max_tokens=2000
            )

            content = response.choices[0].message.content
            return json.loads(content)

        except json.JSONDecodeError as e:
            print(f"JSON 解析失败: {e}")
            raise ValueError(f"LLM 返回的不是有效的 JSON: {content}")
        except Exception as e:
            print(f"结构化完成调用失败: {e}")
            raise

    async def analyze_intent(
        self,
        user_input: str,
        conversation_history: List[Dict[str, Any]],
        project_spec: Dict[str, Any]
    ) -> Dict[str, Any]:
        """分析用户意图"""

        # 构建上下文信息
        context_info = []
        if project_spec.get("coreIdea", {}).get("problemStatement"):
            context_info.append(f"问题陈述: {project_spec['coreIdea']['problemStatement']}")
        if project_spec.get("coreIdea", {}).get("targetUsers"):
            context_info.append(f"目标用户: {', '.join(project_spec['coreIdea']['targetUsers'])}")

        # 最近的对话历史
        recent_history = conversation_history[-3:] if conversation_history else []
        history_text = "\n".join([
            f"{msg.get('role', 'user')}: {msg.get('content', '')}"
            for msg in recent_history
        ])

        system_prompt = f"""你是一个用户意图分析专家。分析用户输入，判断用户的意图和关注领域。

项目上下文:
{chr(10).join(context_info) if context_info else '项目刚开始，信息较少'}

最近对话:
{history_text if history_text else '无历史对话'}

请分析用户意图，返回JSON格式:
{{
  "action_type": "explore|clarify|review|record",
  "focus_area": "core_idea|scope|scenarios|general",
  "confidence": 0.0-1.0,
  "parameters": {{}}
}}

action_type说明:
- explore: 探索新信息
- clarify: 澄清已有信息
- review: 回顾总结
- record: 记录决策

focus_area说明:
- core_idea: 核心理念、问题、用户
- scope: 功能范围、需求
- scenarios: 使用场景、流程
- general: 一般性讨论"""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"用户输入: {user_input}"}
        ]

        try:
            return await self.structured_completion(messages, {})
        except Exception as e:
            print(f"意图分析失败: {e}")
            # 返回默认意图
            return {
                "action_type": "explore",
                "focus_area": "general",
                "confidence": 0.5,
                "parameters": {"fallback": True}
            }


# 全局LLM服务实例
_llm_service: Optional[LLMService] = None


def get_llm_service() -> LLMService:
    """获取全局LLM服务实例"""
    global _llm_service
    if _llm_service is None:
        config_path = os.path.join(os.path.dirname(__file__), '../../../..', 'glm4.5.config')
        _llm_service = LLMService.from_config_file(config_path)
    return _llm_service
