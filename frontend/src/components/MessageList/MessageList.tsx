/**
 * MessageList 组件
 * 显示对话消息列表
 */

import React from 'react';
import { clsx } from 'clsx';
import { Message } from '../../types/conversation';
import { Card } from '../ui';
import styles from './MessageList.module.css';

export interface MessageListProps {
  /** 消息列表 */
  messages: Message[];
  /** 是否正在加载 */
  isLoading?: boolean;
  /** 自定义类名 */
  className?: string;
}

/** 消息项组件 */
const MessageItem: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.role === 'user';
  const isError = message.isError;

  return (
    <div
      className={clsx(
        styles.messageItem,
        isUser ? styles.userMessage : styles.assistantMessage,
        isError && styles.errorMessage
      )}
    >
      {/* 消息头部 */}
      <div className={styles.messageHeader}>
        <div className={styles.messageRole}>
          {isUser ? (
            <div className={styles.userAvatar}>
              <span>👤</span>
            </div>
          ) : (
            <div className={styles.assistantAvatar}>
              <span>🤖</span>
            </div>
          )}
          <span className={styles.roleName}>{isUser ? '你' : 'AI 助手'}</span>
        </div>
        <div className={styles.messageTime}>
          {new Date(message.timestamp).toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>

      {/* 消息内容 */}
      <div className={styles.messageContent}>
        <Card className={clsx(styles.messageCard, isUser && styles.userCard)}>
          <div className={styles.messageText}>{message.content}</div>

          {/* Agent 信息（仅助手消息） */}
          {!isUser && message.agentType && (
            <div className={styles.agentInfo}>
              <span className={styles.agentType}>{message.agentType}</span>
              {message.confidence && (
                <span className={styles.confidence}>
                  置信度: {Math.round(message.confidence * 100)}%
                </span>
              )}
            </div>
          )}

          {/* 文档更新提示（仅助手消息） */}
          {!isUser &&
            message.documentUpdates &&
            Object.keys(message.documentUpdates).length > 0 && (
              <div className={styles.documentUpdates}>
                <div className={styles.updateIcon}>📝</div>
                <span>已更新项目文档</span>
              </div>
            )}
        </Card>
      </div>
    </div>
  );
};

/** 加载指示器组件 */
const LoadingIndicator: React.FC = () => (
  <div
    className={clsx(
      styles.messageItem,
      styles.assistantMessage,
      styles.loadingMessage
    )}
  >
    <div className={styles.messageHeader}>
      <div className={styles.messageRole}>
        <div className={styles.assistantAvatar}>
          <span>🤖</span>
        </div>
        <span className={styles.roleName}>AI 助手</span>
      </div>
    </div>
    <div className={styles.messageContent}>
      <Card className={styles.messageCard}>
        <div className={styles.loadingContent}>
          <div className={styles.loadingDots}>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span className={styles.loadingText}>正在思考...</span>
        </div>
      </Card>
    </div>
  </div>
);

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading = false,
  className,
}) => {
  if (messages.length === 0 && !isLoading) {
    return (
      <div className={clsx(styles.messageList, styles.emptyState, className)}>
        <div className={styles.emptyContent}>
          <div className={styles.emptyIcon}>💬</div>
          <h3>开始对话</h3>
          <p>发送消息开始与 AI 助手的对话</p>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx(styles.messageList, className)}>
      <div className={styles.messagesContainer}>
        {messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}
        {isLoading && <LoadingIndicator />}
      </div>
    </div>
  );
};

MessageList.displayName = 'MessageList';
