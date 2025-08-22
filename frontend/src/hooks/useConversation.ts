/**
 * useConversation Hook
 * 管理对话状态和API调用
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Message,
  ConversationSession,
  StartConversationRequest,
  ConversationResponse,
} from '../types/conversation';
import { conversationApi } from '../services/conversationApi';

export interface UseConversationReturn {
  /** 当前会话 */
  session: ConversationSession | null;
  /** 消息列表 */
  messages: Message[];
  /** 是否正在加载 */
  isLoading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 开始对话 */
  startConversation: (request: StartConversationRequest) => Promise<void>;
  /** 发送消息 */
  sendMessage: (content: string) => Promise<void>;
  /** 结束对话 */
  endConversation: () => Promise<void>;
  /** 清除错误 */
  clearError: () => void;
  /** 重新连接 */
  reconnect: () => Promise<void>;
}

/** 生成消息ID */
const generateMessageId = () => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/** 将API响应转换为消息 */
const responseToMessage = (response: ConversationResponse): Message => {
  return {
    id: generateMessageId(),
    role: 'assistant',
    content: response.content,
    timestamp: response.timestamp,
    agentType: response.agentType,
    suggestions: response.suggestions,
    documentUpdates: response.documentUpdates,
    nextAction: response.nextAction,
    confidence: response.confidence,
  };
};

export const useConversation = (): UseConversationReturn => {
  const [session, setSession] = useState<ConversationSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // WebSocket 连接引用
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 3;

  // 清除错误
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 添加用户消息到列表
  const addUserMessage = useCallback((content: string): Message => {
    const message: Message = {
      id: generateMessageId(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, message]);
    return message;
  }, []);

  // 添加助手消息到列表
  const addAssistantMessage = useCallback((response: ConversationResponse) => {
    const message = responseToMessage(response);
    setMessages((prev) => [...prev, message]);
    return message;
  }, []);

  // 添加错误消息
  const addErrorMessage = useCallback((errorText: string) => {
    const message: Message = {
      id: generateMessageId(),
      role: 'assistant',
      content: `抱歉，出现了错误：${errorText}`,
      timestamp: new Date().toISOString(),
      isError: true,
    };

    setMessages((prev) => [...prev, message]);
  }, []);

  // WebSocket 连接管理
  const connectWebSocket = useCallback(
    (sessionId: string) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        return;
      }

      try {
        const wsUrl = `ws://localhost:8000/agents/conversation/${sessionId}/ws`;
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log('WebSocket 连接已建立');
          reconnectAttemptsRef.current = 0;
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === 'response' && data.data) {
              addAssistantMessage(data.data);
              setIsLoading(false);
            } else if (data.type === 'error') {
              addErrorMessage(data.message || '未知错误');
              setIsLoading(false);
            }
          } catch (error) {
            console.error('解析 WebSocket 消息失败:', error);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket 错误:', error);
          setError('连接错误，请检查网络');
        };

        ws.onclose = () => {
          console.log('WebSocket 连接已关闭');
          wsRef.current = null;

          // 自动重连
          if (reconnectAttemptsRef.current < maxReconnectAttempts) {
            reconnectTimeoutRef.current = setTimeout(() => {
              reconnectAttemptsRef.current++;
              connectWebSocket(sessionId);
            }, 2000 * reconnectAttemptsRef.current);
          }
        };

        wsRef.current = ws;
      } catch (error) {
        console.error('创建 WebSocket 连接失败:', error);
        setError('无法建立连接');
      }
    },
    [addAssistantMessage, addErrorMessage]
  );

  // 关闭 WebSocket 连接
  const closeWebSocket = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  // 开始对话
  const startConversation = useCallback(
    async (request: StartConversationRequest) => {
      try {
        setIsLoading(true);
        setError(null);
        setMessages([]);

        const response = await conversationApi.startConversation(request);

        const newSession: ConversationSession = {
          sessionId: response.sessionId,
          projectId: request.projectId,
          createdAt: response.timestamp,
          lastActiveAt: response.timestamp,
          messages: [],
          projectSpec: response.documentUpdates || {},
          status: 'active',
        };

        setSession(newSession);

        // 如果有初始响应，添加到消息列表
        if (response.content) {
          addAssistantMessage(response);
        }

        // 建立 WebSocket 连接
        connectWebSocket(response.sessionId);
      } catch (error) {
        console.error('开始对话失败:', error);
        setError(error instanceof Error ? error.message : '开始对话失败');
      } finally {
        setIsLoading(false);
      }
    },
    [addAssistantMessage, connectWebSocket]
  );

  // 发送消息
  const sendMessage = useCallback(
    async (content: string) => {
      if (!session || !content.trim()) {
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // 添加用户消息到界面
        addUserMessage(content);

        // 通过 WebSocket 发送消息
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              type: 'message',
              content,
            })
          );
        } else {
          // 降级到 HTTP API
          const response = await conversationApi.sendMessage(
            session.sessionId,
            { content }
          );
          addAssistantMessage(response);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('发送消息失败:', error);
        addErrorMessage(
          error instanceof Error ? error.message : '发送消息失败'
        );
        setIsLoading(false);
      }
    },
    [session, addUserMessage, addAssistantMessage, addErrorMessage]
  );

  // 结束对话
  const endConversation = useCallback(async () => {
    if (!session) {
      return;
    }

    try {
      await conversationApi.endConversation(session.sessionId);
      closeWebSocket();

      setSession((prev) => (prev ? { ...prev, status: 'ended' } : null));
    } catch (error) {
      console.error('结束对话失败:', error);
      setError(error instanceof Error ? error.message : '结束对话失败');
    }
  }, [session, closeWebSocket]);

  // 重新连接
  const reconnect = useCallback(async () => {
    if (session) {
      closeWebSocket();
      connectWebSocket(session.sessionId);
    }
  }, [session, closeWebSocket, connectWebSocket]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      closeWebSocket();
    };
  }, [closeWebSocket]);

  return {
    session,
    messages,
    isLoading,
    error,
    startConversation,
    sendMessage,
    endConversation,
    clearError,
    reconnect,
  };
};
