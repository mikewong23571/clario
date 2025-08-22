# Sprint 2 详细实施计划：AI 引导探索 + 实时反馈系统

**Sprint 版本**: 2.0  
**创建日期**: 2025-08-22  
**目标团队**: 初级/中级工程师  
**总工期**: 1.5 周 (10 个工作日)

## 🎯 Sprint 目标

在 Task 1.2 设计系统基础完成后，实现 Clario 核心的 AI 引导对话和实时文档预览功能。让用户能够通过自然对话完成项目需求探索，并实时看到文档变化。

### 业务价值
- **AI 引导探索**: 用户无需专业背景即可完成需求澄清
- **实时反馈**: 对话内容立即反映到文档，增强用户信心
- **技术基础**: 为后续 Sprint 建立核心技术架构

### 技术目标
- 建立多智能体协作系统基础架构
- 实现前后端实时通信机制
- 建立文档状态管理和同步系统

---

## 📋 任务分组与依赖关系

```mermaid
gantt
    title Sprint 2 任务时间线
    dateFormat X
    axisFormat %d

    section 任务组 2A (AI引导系统)
    2A.1 Agent基础架构    :done, a1, 0, 3
    2A.2 前端对话界面     :done, a2, 2, 4
    2A.3 集成测试         :done, a3, 4, 5

    section 任务组 2B (实时反馈)
    2B.1 文档预览组件     :done, b1, 1, 3
    2B.2 后端同步服务     :done, b2, 3, 5
    2B.3 高亮标注系统     :done, b3, 5, 6

    section 验收里程碑
    Sprint验收            :milestone, m1, 6
```

### 并行开发策略
- **Day 1-3**: 2A.1 + 2B.1 并行开发（前后端同时启动）
- **Day 3-4**: 2A.2 + 2B.2 并行开发（依赖基础架构）
- **Day 4-5**: 2A.3 + 2B.3 集成测试和优化
- **Day 6**: 整体验收和文档更新

---

## 🏗️ 任务组 2A: AI 引导探索系统

### 任务 2A.1: 后端 Agent 基础架构

**👤 负责人**: 后端工程师（中级+）  
**⏱️ 工期**: 3 天  
**📋 前置条件**: Python 环境已配置，LLM API 密钥可用

#### 实施步骤详解

**第1天: Agent 抽象层实现**

```python
# 目标输出：backend/src/app/agents/base.py
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
from pydantic import BaseModel
from datetime import datetime

class AgentContext(BaseModel):
    """智能体执行上下文"""
    project_spec: Dict[str, Any]           # 当前项目规格
    conversation_history: List[Dict[str, Any]]  # 对话历史
    current_focus: str                     # 当前对话焦点
    user_input: str                        # 用户输入
    session_id: str                        # 会话ID
    timestamp: datetime = datetime.utcnow()

class AgentResponse(BaseModel):
    """智能体响应结果"""
    agent_type: str                        # Agent 类型标识
    content: str                           # 响应内容
    suggestions: List[str] = []            # 建议选项
    document_updates: Dict[str, Any] = {}  # 文档更新指令
    next_action: Optional[str] = None      # 下一步建议行动
    confidence: float = 1.0                # 响应置信度
    
class BaseAgent(ABC):
    """智能体基类 - 定义所有 Agent 的通用接口"""
    
    def __init__(self, llm_client, agent_config: Dict[str, Any] = None):
        self.llm_client = llm_client
        self.agent_type = self.__class__.__name__
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
```

**验收要点**:
- [ ] 抽象类设计合理，扩展性好
- [ ] 数据模型覆盖所有必要字段
- [ ] 类型注解完整，支持 IDE 智能提示

**第2天: PromoterAgent 核心实现**

```python
# 目标输出：backend/src/app/agents/promoter.py
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
- 如果用户信息充分，主动推进到下一个环节"""

    async def process(self, context: AgentContext) -> AgentResponse:
        # 1. 分析当前项目状态
        current_state = self._analyze_project_state(context.project_spec)
        
        # 2. 构建 LLM 提示
        prompt = self._build_prompt(context, current_state)
        
        # 3. 调用 LLM 生成响应
        llm_response = await self.llm_client.chat_completion(
            messages=[
                {"role": "system", "content": self.get_system_prompt()},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        
        # 4. 解析响应并提取文档更新
        response_data = self._parse_llm_response(llm_response)
        
        return AgentResponse(
            agent_type=self.agent_type,
            content=response_data["content"],
            suggestions=response_data.get("suggestions", []),
            document_updates=response_data.get("document_updates", {}),
            next_action=response_data.get("next_action")
        )
    
    def _analyze_project_state(self, project_spec: Dict[str, Any]) -> Dict[str, Any]:
        """分析项目当前完成状态"""
        analysis = {
            "completed_sections": [],
            "missing_info": [],
            "next_priorities": []
        }
        
        # 检查核心理念
        if not project_spec.get("coreIdea"):
            analysis["missing_info"].append("core_idea")
            analysis["next_priorities"].append("define_core_value")
        
        # 检查目标用户
        if not project_spec.get("coreIdea", {}).get("targetAudience"):
            analysis["missing_info"].append("target_audience")
            
        # 添加更多检查逻辑...
        
        return analysis
```

**验收要点**:
- [ ] LLM 集成工作正常，可以生成合理回复
- [ ] 文档更新逻辑准确，不会破坏现有数据
- [ ] 错误处理完善，网络异常时有降级方案

**第3天: Agent 协调器开发**

```python
# 目标输出：backend/src/app/agents/orchestrator.py
class UserIntent(BaseModel):
    """用户意图分析结果"""
    action_type: str  # "explore", "review", "record", "clarify"
    focus_area: str   # "core_idea", "scope", "scenarios", "general"
    confidence: float
    parameters: Dict[str, Any] = {}

class AgentOrchestrator:
    """Agent 协调器 - 智能路由用户请求到合适的 Agent"""
    
    def __init__(self, llm_client):
        self.llm_client = llm_client
        self.agents = {
            "promoter": PromoterAgent(llm_client),
            # 后续添加其他 Agent
        }
        
    async def process_user_input(
        self, 
        user_input: str, 
        project_spec: Dict[str, Any],
        conversation_history: List[Dict[str, Any]],
        session_id: str
    ) -> AgentResponse:
        """协调器主入口 - 分析意图并路由到合适的 Agent"""
        
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
        await self._log_agent_execution(intent, response)
        
        return response
    
    async def _analyze_user_intent(
        self, 
        user_input: str, 
        history: List[Dict[str, Any]], 
        project_spec: Dict[str, Any]
    ) -> UserIntent:
        """使用 LLM 分析用户意图"""
        # 实现意图分析逻辑
        pass
```

**验收要点**:
- [ ] 意图识别准确率在测试场景中 > 80%
- [ ] Agent 选择逻辑合理，可以正确路由
- [ ] 日志记录完整，便于调试和监控

#### 技能检查清单

**必备技能**:
- [ ] Python 异步编程 (async/await)
- [ ] Pydantic 数据建模
- [ ] LLM API 调用经验
- [ ] 抽象类和接口设计

**加分技能**:
- [ ] 设计模式理解（策略模式、工厂模式）
- [ ] 错误处理和重试机制
- [ ] 单元测试编写

#### 常见问题预防

**Q: LLM API 调用超时怎么办？**
A: 实现超时重试机制，设置合理的 timeout 值，并提供降级响应。

**Q: Agent 响应格式不一致怎么办？**  
A: 使用 Pydantic 强制校验，LLM 响应通过结构化解析器处理。

**Q: 如何保证 Agent 选择的准确性？**
A: 建立意图分析的测试用例，持续优化提示词和选择逻辑。

---

### 任务 2A.2: 前端对话界面框架

**👤 负责人**: 前端工程师（中级）  
**⏱️ 工期**: 2 天  
**📋 前置条件**: 设计系统已建立，TypeScript 环境配置完成

#### 实施步骤详解

**第1天: 对话组件基础架构**

```typescript
// 目标输出：frontend/src/components/ConversationInterface/ConversationInterface.tsx
import React, { useEffect, useRef } from 'react';
import { MessageList } from '../MessageList';
import { MessageInput } from '../MessageInput';
import { useConversation } from '../../hooks/useConversation';
import styles from './ConversationInterface.module.css';

interface ConversationInterfaceProps {
  projectId: string;
  className?: string;
}

export const ConversationInterface: React.FC<ConversationInterfaceProps> = ({
  projectId,
  className
}) => {
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearError
  } = useConversation(projectId);

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <h2 className={styles.title}>AI 需求顾问</h2>
        <span className={styles.status}>
          {isLoading ? '思考中...' : '准备就绪'}
        </span>
      </div>
      
      <MessageList 
        messages={messages}
        isLoading={isLoading}
        className={styles.messageList}
      />
      
      <MessageInput
        onSendMessage={sendMessage}
        disabled={isLoading}
        className={styles.messageInput}
        placeholder="描述你的产品想法，或回答AI的问题..."
      />
      
      {error && (
        <div className={styles.errorBanner}>
          <span className={styles.errorText}>{error.message}</span>
          <button onClick={clearError} className={styles.closeError}>
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
```

```css
/* 目标输出：frontend/src/components/ConversationInterface/ConversationInterface.module.css */
.container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-surface-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4) var(--space-6);
  background: var(--color-surface-secondary);
  border-bottom: 1px solid var(--color-border-subtle);
}

.title {
  font: var(--font-heading-md);
  color: var(--color-text-primary);
  margin: 0;
}

.status {
  font: var(--font-body-sm);
  color: var(--color-text-secondary);
  padding: var(--space-1) var(--space-3);
  background: var(--color-surface-accent);
  border-radius: var(--radius-full);
}

.messageList {
  flex: 1;
  min-height: 0; /* 允许 flex 子项收缩 */
}

.messageInput {
  flex-shrink: 0;
}

.errorBanner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  background: var(--color-error-subtle);
  border-top: 1px solid var(--color-error-border);
}

.errorText {
  font: var(--font-body-sm);
  color: var(--color-error-text);
}

.closeError {
  background: none;
  border: none;
  color: var(--color-error-text);
  cursor: pointer;
  padding: var(--space-1);
  border-radius: var(--radius-sm);
}

.closeError:hover {
  background: var(--color-error-hover);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header {
    padding: var(--space-3) var(--space-4);
  }
  
  .title {
    font: var(--font-heading-sm);
  }
}
```

```typescript
// 目标输出：frontend/src/components/MessageList/MessageList.tsx
import React, { useEffect, useRef } from 'react';
import { MessageItem } from '../MessageItem';
import { Message } from '../../types/conversation';
import styles from './MessageList.module.css';

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  className?: string;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading = false,
  className
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div 
      ref={scrollRef}
      className={`${styles.container} ${className || ''}`}
    >
      <div className={styles.messageList}>
        {messages.map((message) => (
          <MessageItem 
            key={message.id} 
            message={message}
          />
        ))}
        
        {isLoading && (
          <div className={styles.loadingIndicator}>
            <div className={styles.typingAnimation}>
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span className={styles.loadingText}>AI 正在思考...</span>
          </div>
        )}
      </div>
    </div>
  );
};
```

**验收要点**:
- [ ] 组件结构清晰，职责分离
- [ ] 完全使用设计令牌，无硬编码样式
- [ ] 响应式设计在移动端正常显示
- [ ] 自动滚动和加载状态正确

**第2天: 输入和状态管理**

```typescript
// 目标输出：frontend/src/hooks/useConversation.ts
import { useState, useCallback, useEffect } from 'react';
import { useConversationStore } from '../stores/conversationStore';
import { Message, SendMessageRequest } from '../types/conversation';
import { api } from '../services/api';

export const useConversation = (projectId: string) => {
  const {
    messages,
    isLoading,
    error,
    addMessage,
    setLoading,
    setError,
    clearError
  } = useConversationStore();

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    try {
      setLoading(true);
      
      // 乐观更新：立即添加用户消息
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
        projectId
      };
      addMessage(userMessage);

      // 发送到后端
      const request: SendMessageRequest = {
        content: content.trim(),
        projectId,
        conversationHistory: messages
      };

      const response = await api.sendMessage(request);
      
      // 添加 AI 响应
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        projectId,
        agentType: response.agentType,
        suggestions: response.suggestions
      };
      addMessage(aiMessage);

    } catch (err) {
      console.error('发送消息失败:', err);
      setError({
        message: '发送消息失败，请重试',
        code: 'SEND_MESSAGE_FAILED'
      });
    } finally {
      setLoading(false);
    }
  }, [projectId, messages, isLoading, addMessage, setLoading, setError]);

  // 项目切换时清空消息
  useEffect(() => {
    // 清空当前消息，加载项目历史
  }, [projectId]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearError
  };
};
```

```typescript
// 目标输出：frontend/src/stores/conversationStore.ts
import { create } from 'zustand';
import { Message, ConversationError } from '../types/conversation';

interface ConversationState {
  messages: Message[];
  isLoading: boolean;
  error: ConversationError | null;
  
  // Actions
  addMessage: (message: Message) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: ConversationError | null) => void;
  clearError: () => void;
  clearMessages: () => void;
}

export const useConversationStore = create<ConversationState>((set) => ({
  messages: [],
  isLoading: false,
  error: null,

  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),

  clearMessages: () => set({ messages: [] })
}));
```

**验收要点**:
- [ ] 状态管理逻辑清晰，无内存泄漏
- [ ] 乐观更新和错误回滚机制完善
- [ ] Hook 可复用，接口设计合理
- [ ] TypeScript 类型安全，无 any 类型

#### 技能检查清单

**必备技能**:
- [ ] React Hooks 熟练使用
- [ ] Zustand 状态管理
- [ ] CSS Modules 和响应式设计
- [ ] TypeScript 类型定义

**加分技能**:
- [ ] 虚拟滚动实现
- [ ] 性能优化（useMemo, useCallback）
- [ ] 无障碍性支持

---

### 任务 2A.3: AI 引导逻辑集成

**👤 负责人**: 全栈工程师（高级）  
**⏱️ 工期**: 1 天  
**📋 前置条件**: 2A.1 和 2A.2 完成

#### 实施重点

**WebSocket 连接建立** (0.5天)
- 前后端 WebSocket 握手和鉴权
- 消息序列化和错误处理
- 连接重试和状态恢复

**端到端测试** (0.5天)
- 完整对话流程测试
- 性能监控和优化
- 错误边界处理

---

## 🔄 任务组 2B: 实时反馈系统

### 任务 2B.1: 文档预览组件

**👤 负责人**: 前端工程师（初级+）  
**⏱️ 工期**: 2 天

#### 核心要求

**Markdown 渲染** (1天)
- React Markdown 集成和配置
- 自定义渲染器和样式
- 代码高亮和表格支持

**实时同步** (1天)
- 文档状态订阅机制
- 平滑更新动画
- 滚动位置保持

### 任务 2B.2: 后端文档同步服务

**👤 负责人**: 后端工程师（初级+）  
**⏱️ 工期**: 1.5 天

#### 核心要求

**文档状态管理** (1天)
- ProjectService 扩展
- 增量更新算法
- 版本控制机制

**WebSocket 推送** (0.5天)
- 实时推送实现
- 客户端状态同步
- 性能优化

### 任务 2B.3: 高亮标注系统

**👤 负责人**: 全栈工程师（中级+）  
**⏱️ 工期**: 0.5 天

#### 核心要求

**高亮渲染** (0.5天)
- HighlightManager 实现
- 动态标注渲染
- 交互逻辑处理

---

## ✅ 质量保障策略

### 开发规范

**代码质量要求**:
- [ ] ESLint + Prettier 检查通过
- [ ] TypeScript strict 模式无错误
- [ ] 所有公共 API 有 JSDoc 注释
- [ ] 关键业务逻辑有单元测试

**设计系统合规**:
- [ ] 零硬编码样式值
- [ ] 完全使用设计令牌
- [ ] 组件 API 与设计规范一致
- [ ] 通过设计验证工具检查

### 测试策略

**单元测试 (每日)**:
```bash
# 后端测试
cd backend && uv run pytest -q

# 前端测试  
cd frontend && pnpm test
```

**集成测试 (每2天)**:
```bash
# E2E 测试关键流程
cd frontend && pnpm e2e
```

**性能监控**:
- LLM 调用响应时间 < 5秒
- WebSocket 消息延迟 < 100ms
- 前端组件渲染 < 16ms

### 验收检查清单

**功能验收**:
- [ ] 用户可以与 AI 进行自然对话
- [ ] 对话内容实时更新到文档预览
- [ ] AI 响应具有引导性和针对性
- [ ] 文档变更有平滑的视觉反馈
- [ ] 错误处理友好，用户体验良好

**技术验收**:
- [ ] 代码架构清晰，模块职责分明
- [ ] API 接口设计合理，扩展性好
- [ ] 前端组件可复用，性能良好
- [ ] 数据流清晰，状态管理合理
- [ ] 日志记录完整，便于调试

**用户体验验收**:
- [ ] 界面响应快速，无明显延迟
- [ ] 交互流程自然，学习成本低
- [ ] 视觉设计一致，符合设计规范
- [ ] 支持键盘和触摸操作
- [ ] 在不同设备和浏览器正常工作

---

## 📈 成功度量指标

### 技术指标
- **响应时间**: AI 对话响应 < 3秒 (90% 的请求)
- **可用性**: 系统正常运行时间 > 99%
- **测试覆盖率**: 单元测试 ≥ 80%，E2E 测试覆盖主流程
- **代码质量**: 所有 PR 通过 lint 和类型检查

### 用户体验指标
- **对话质量**: AI 响应相关性和有用性
- **界面流畅度**: 无明显卡顿和延迟感知
- **错误处理**: 错误情况下用户可以理解和恢复
- **学习曲线**: 新用户 5 分钟内可以完成基本操作

### 业务指标
- **功能完整性**: 实现设计文档中的所有核心功能
- **架构可扩展性**: 为 Sprint 3 奠定坚实基础
- **团队效率**: 按时完成所有任务，无严重阻塞
- **文档质量**: 代码文档和用户文档完整准确

---

## 🚧 风险识别与应对

### 技术风险

**风险1: LLM API 不稳定**
- **概率**: 中等
- **影响**: 影响 AI 对话功能
- **应对**: 实现重试机制，准备降级方案

**风险2: WebSocket 连接问题**
- **概率**: 低
- **影响**: 实时同步失效
- **应对**: 实现长轮询降级，增强错误处理

**风险3: 前端状态管理复杂化**
- **概率**: 中等
- **影响**: 导致 bug 和性能问题
- **应对**: 简化状态结构，增强测试覆盖

### 进度风险

**风险1: 任务依赖阻塞**
- **概率**: 中等
- **影响**: 影响整体进度
- **应对**: 并行开发，增加沟通频次

**风险2: 技能不匹配**
- **概率**: 低
- **影响**: 任务质量下降
- **应对**: 配备高级工程师支持，提供技术指导

### 质量风险

**风险1: 设计系统集成问题**
- **概率**: 中等  
- **影响**: 界面不一致
- **应对**: 加强设计验证，定期检查

**风险2: 用户体验不佳**
- **概率**: 低
- **影响**: 影响产品价值
- **应对**: 早期用户测试，快速迭代

---

## 📚 参考资料和工具

### 技术文档
- [Clario 技术设计文档](./tech-design.md)
- [设计系统规范](./design-system.md)  
- [CSS 架构指南](./css-architecture-guide.md)
- [UI 交互规范](./ui-interaction-guide.md)

### 开发工具
- **后端**: FastAPI, Pydantic, pytest
- **前端**: React, TypeScript, Vite, Vitest
- **状态管理**: Zustand
- **实时通信**: Socket.IO
- **AI 服务**: OpenAI/Anthropic SDK

### 质量工具
- **代码质量**: ESLint, Prettier, Ruff, MyPy
- **测试**: pytest, Vitest, Playwright
- **设计系统**: 设计验证工具
- **性能监控**: 浏览器开发工具

---

通过这个详细的实施计划，初级和中级工程师可以在确定性的上下文中高效工作，每个任务都有明确的目标、验收标准和技能要求。同时保持了系统的整体架构清晰和模块职责分明。