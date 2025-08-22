/**
 * ConversationInterface 组件
 * AI 引导系统的主要对话界面
 */

import React, { useState, useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { MessageList } from '../MessageList';
import { MessageInput } from '../MessageInput';
import { Button } from '../ui';
import { useConversation } from '../../hooks/useConversation';
import { ConversationSession } from '../../types/conversation';
import styles from './ConversationInterface.module.css';

export interface ConversationInterfaceProps {
  /** 项目ID（可选） */
  projectId?: string;
  /** 初始消息（可选） */
  initialMessage?: string;
  /** 对话结束回调 */
  onConversationEnd?: (session: ConversationSession) => void;
  /** 文档更新回调 */
  onDocumentUpdate?: (updates: Record<string, unknown>) => void;
  /** 自定义类名 */
  className?: string;
}

export const ConversationInterface: React.FC<ConversationInterfaceProps> = ({
  projectId,
  initialMessage,
  onConversationEnd,
  onDocumentUpdate,
  className,
}) => {
  const {
    session,
    messages,
    isLoading,
    error,
    startConversation,
    sendMessage,
    endConversation,
  } = useConversation();

  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  const scrollToBottom = () => {
    if (
      messagesEndRef.current &&
      typeof messagesEndRef.current.scrollIntoView === 'function'
    ) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 初始化对话
  useEffect(() => {
    if (!session) {
      startConversation({
        projectId,
        initialMessage,
      });
    }
  }, [projectId, initialMessage, session, startConversation]);

  // 滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 处理文档更新
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (
      lastMessage?.documentUpdates &&
      Object.keys(lastMessage.documentUpdates).length > 0
    ) {
      onDocumentUpdate?.(lastMessage.documentUpdates);
    }

    // 更新建议
    if (lastMessage?.suggestions) {
      setSuggestions(lastMessage.suggestions);
    }
  }, [messages, onDocumentUpdate]);

  // 发送消息
  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    setInputValue('');
    setSuggestions([]);

    try {
      await sendMessage(content);
    } catch (error) {
      console.error('发送消息失败:', error);
    }
  };

  // 使用建议
  const handleUseSuggestion = (suggestion: string) => {
    setInputValue(suggestion);
  };

  // 结束对话
  const handleEndConversation = async () => {
    if (session) {
      await endConversation();
      onConversationEnd?.(session);
    }
  };

  // 重新开始对话
  const handleRestartConversation = () => {
    startConversation({
      projectId,
      initialMessage: '你好，我想重新开始讨论我的产品想法。',
    });
  };

  if (error) {
    return (
      <div
        className={clsx(styles.conversationInterface, styles.error, className)}
      >
        <div className={styles.errorContent}>
          <h3>对话出现错误</h3>
          <p>{error}</p>
          <div className={styles.errorActions}>
            <Button onClick={handleRestartConversation} variant="primary">
              重新开始
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx(styles.conversationInterface, className)}>
      {/* 对话头部 */}
      <div className={styles.conversationHeader}>
        <div className={styles.headerInfo}>
          <h2>AI 产品需求引导</h2>
          <p>让我帮助你梳理和完善产品需求</p>
        </div>
        <div className={styles.headerActions}>
          <Button
            onClick={handleEndConversation}
            variant="ghost"
            size="small"
            disabled={!session}
          >
            结束对话
          </Button>
        </div>
      </div>

      {/* 消息列表区域 */}
      <div className={styles.messagesContainer}>
        {!session && !isLoading ? (
          <div className={styles.welcomeMessage}>
            <div className={styles.welcomeContent}>
              <h3>👋 欢迎使用 Clario AI 引导</h3>
              <p>我是你的产品需求助手，让我们一起探索你的产品想法吧！</p>
              <div className={styles.welcomeSuggestions}>
                <Button
                  onClick={() => handleSendMessage('我想创建一个新的产品')}
                  variant="secondary"
                  size="small"
                >
                  创建新产品
                </Button>
                <Button
                  onClick={() => handleSendMessage('帮我完善现有的产品需求')}
                  variant="secondary"
                  size="small"
                >
                  完善需求
                </Button>
                <Button
                  onClick={() => handleSendMessage('我需要分析用户场景')}
                  variant="secondary"
                  size="small"
                >
                  分析场景
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <MessageList
            messages={messages}
            isLoading={isLoading}
            className={styles.messageList}
          />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 建议区域 */}
      {suggestions.length > 0 && (
        <div className={styles.suggestionsContainer}>
          <div className={styles.suggestionsLabel}>建议回复:</div>
          <div className={styles.suggestions}>
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                onClick={() => handleUseSuggestion(suggestion)}
                variant="ghost"
                size="small"
                className={styles.suggestionButton}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* 输入区域 */}
      <div className={styles.inputContainer}>
        <MessageInput
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSendMessage}
          disabled={isLoading || !session}
          placeholder={isLoading ? 'AI 正在思考...' : '输入你的想法...'}
          className={styles.messageInput}
        />
      </div>
    </div>
  );
};

ConversationInterface.displayName = 'ConversationInterface';
