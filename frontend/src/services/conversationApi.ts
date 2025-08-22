/**
 * 对话系统 API 服务
 * 与后端 Agent API 通信
 */

import {
  StartConversationRequest,
  SendMessageRequest,
  ConversationResponse,
  ConversationHistoryItem,
  AgentInfo,
} from '../types/conversation';

/** API 基础配置 */
const API_BASE_URL =
  (import.meta.env?.VITE_API_URL as string) || 'http://localhost:8000';
const AGENTS_API_BASE = `${API_BASE_URL}/agents`;

/** HTTP 请求工具函数 */
const apiRequest = async <T>(
  url: string,
  options: Parameters<typeof fetch>[1] = {}
): Promise<T> => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch {
      // 如果不是 JSON，使用原始错误文本
      if (errorText) {
        errorMessage = errorText;
      }
    }

    throw new Error(errorMessage);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }

  return response.text() as unknown as T;
};

/** 对话 API 服务 */
export const conversationApi = {
  /**
   * 开始新的对话
   */
  async startConversation(
    requestData: StartConversationRequest
  ): Promise<ConversationResponse> {
    return await apiRequest<ConversationResponse>(
      `${AGENTS_API_BASE}/conversation/start`,
      {
        method: 'POST',
        body: JSON.stringify(requestData),
      }
    );
  },

  /**
   * 发送消息到指定会话
   */
  async sendMessage(
    sessionId: string,
    messageRequest: SendMessageRequest
  ): Promise<ConversationResponse> {
    return await apiRequest<ConversationResponse>(
      `${AGENTS_API_BASE}/conversation/${sessionId}/message`,
      {
        method: 'POST',
        body: JSON.stringify(messageRequest),
      }
    );
  },

  /**
   * 获取对话历史
   */
  async getConversationHistory(
    sessionId: string
  ): Promise<ConversationHistoryItem> {
    return await apiRequest<ConversationHistoryItem>(
      `${AGENTS_API_BASE}/conversation/${sessionId}/history`
    );
  },

  /**
   * 结束对话会话
   */
  async endConversation(
    sessionId: string
  ): Promise<{ message: string; sessionId: string }> {
    return await apiRequest<{ message: string; sessionId: string }>(
      `${AGENTS_API_BASE}/conversation/${sessionId}`,
      {
        method: 'DELETE',
      }
    );
  },

  /**
   * 获取 Agent 系统信息
   */
  async getAgentInfo(): Promise<AgentInfo> {
    return await apiRequest<AgentInfo>(`${AGENTS_API_BASE}/info`);
  },

  /**
   * 列出活跃的会话（调试用）
   */
  async listActiveSessions(): Promise<{
    active_sessions: string[];
    total_count: number;
  }> {
    return await apiRequest<{ active_sessions: string[]; total_count: number }>(
      `${AGENTS_API_BASE}/sessions`
    );
  },

  /**
   * 创建 WebSocket 连接 URL
   */
  getWebSocketUrl(sessionId: string): string {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const apiUrl =
      (import.meta.env?.VITE_API_URL as string) || 'http://localhost:8000';
    const wsHost = apiUrl.replace(/^https?:\/\//, '');

    return `${wsProtocol}//${wsHost}/agents/conversation/${sessionId}/ws`;
  },
};

/** 导出默认实例 */
export default conversationApi;
