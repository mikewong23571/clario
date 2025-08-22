/**
 * 对话系统相关的类型定义
 */

/** 消息角色 */
export type MessageRole = 'user' | 'assistant' | 'system';

/** 消息接口 */
export interface Message {
  /** 消息ID */
  id: string;
  /** 消息角色 */
  role: MessageRole;
  /** 消息内容 */
  content: string;
  /** 时间戳 */
  timestamp: string;
  /** Agent类型（仅assistant消息） */
  agentType?: string;
  /** 建议回复（仅assistant消息） */
  suggestions?: string[];
  /** 文档更新（仅assistant消息） */
  documentUpdates?: Record<string, unknown>;
  /** 下一步行动（仅assistant消息） */
  nextAction?: string;
  /** 置信度（仅assistant消息） */
  confidence?: number;
  /** 是否为错误消息 */
  isError?: boolean;
}

/** 对话会话 */
export interface ConversationSession {
  /** 会话ID */
  sessionId: string;
  /** 项目ID（可选） */
  projectId?: string;
  /** 创建时间 */
  createdAt: string;
  /** 最后活动时间 */
  lastActiveAt: string;
  /** 消息历史 */
  messages: Message[];
  /** 项目规格（动态更新） */
  projectSpec: Record<string, unknown>;
  /** 会话状态 */
  status: 'active' | 'ended' | 'error';
}

/** 开始对话请求 */
export interface StartConversationRequest {
  /** 项目ID（可选） */
  projectId?: string;
  /** 初始消息（可选） */
  initialMessage?: string;
}

/** 发送消息请求 */
export interface SendMessageRequest {
  /** 消息内容 */
  content: string;
}

/** 对话响应 */
export interface ConversationResponse {
  /** 会话ID */
  sessionId: string;
  /** Agent类型 */
  agentType: string;
  /** 响应内容 */
  content: string;
  /** 建议回复 */
  suggestions: string[];
  /** 文档更新 */
  documentUpdates: Record<string, unknown>;
  /** 下一步行动 */
  nextAction?: string;
  /** 置信度 */
  confidence: number;
  /** 时间戳 */
  timestamp: string;
}

/** WebSocket 消息类型 */
export type WebSocketMessageType =
  | 'message'
  | 'response'
  | 'error'
  | 'ping'
  | 'pong';

/** WebSocket 消息 */
export interface WebSocketMessage {
  /** 消息类型 */
  type: WebSocketMessageType;
  /** 消息数据 */
  data?: unknown;
  /** 错误信息（仅error类型） */
  message?: string;
  /** 消息内容（仅message类型） */
  content?: string;
}

/** 用户意图 */
export interface UserIntent {
  /** 行动类型 */
  actionType: 'explore' | 'clarify' | 'review' | 'record';
  /** 关注领域 */
  focusArea: 'core_idea' | 'scope' | 'scenarios' | 'general';
  /** 置信度 */
  confidence: number;
  /** 参数 */
  parameters: Record<string, unknown>;
}

/** Agent 信息 */
export interface AgentInfo {
  /** 可用的Agent列表 */
  availableAgents: string[];
  /** 当前Agent */
  currentAgent?: string;
  /** Agent详细信息 */
  agentDetails: Record<string, unknown>;
}

/** 对话历史项 */
export interface ConversationHistoryItem {
  /** 会话ID */
  sessionId: string;
  /** 对话历史 */
  conversationHistory: Message[];
  /** 项目规格 */
  projectSpec: Record<string, unknown>;
  /** 创建时间 */
  createdAt: string;
}
