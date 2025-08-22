/**
 * MessageInput 组件
 * 用户消息输入组件
 */

import React, { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { Button } from '../ui';
import styles from './MessageInput.module.css';

export interface MessageInputProps {
  /** 输入值 */
  value: string;
  /** 值变化回调 */
  onChange: (value: string) => void;
  /** 发送消息回调 */
  onSend: (message: string) => void;
  /** 是否禁用 */
  disabled?: boolean;
  /** 占位符文本 */
  placeholder?: string;
  /** 最大长度 */
  maxLength?: number;
  /** 自定义类名 */
  className?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  value,
  onChange,
  onSend,
  disabled = false,
  placeholder = '输入消息...',
  maxLength = 1000,
  className,
}) => {
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 自动调整文本域高度
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  // 监听值变化，调整高度
  useEffect(() => {
    adjustTextareaHeight();
  }, [value]);

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      onChange(newValue);
    }
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  // 处理输入法组合事件
  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  // 发送消息
  const handleSend = () => {
    const trimmedValue = value.trim();
    if (trimmedValue && !disabled) {
      onSend(trimmedValue);
    }
  };

  // 计算字符数
  const characterCount = value.length;
  const isNearLimit = characterCount > maxLength * 0.8;
  const isOverLimit = characterCount > maxLength;

  return (
    <div className={clsx(styles.messageInput, className)}>
      <div className={styles.inputContainer}>
        {/* 文本输入区域 */}
        <div className={styles.textareaContainer}>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            placeholder={placeholder}
            disabled={disabled}
            className={clsx(
              styles.textarea,
              disabled && styles.disabled,
              isOverLimit && styles.overLimit
            )}
            rows={1}
            maxLength={maxLength}
          />

          {/* 字符计数 */}
          {(isNearLimit || isOverLimit) && (
            <div
              className={clsx(
                styles.characterCount,
                isOverLimit && styles.overLimit
              )}
            >
              {characterCount}/{maxLength}
            </div>
          )}
        </div>

        {/* 发送按钮 */}
        <div className={styles.sendButtonContainer}>
          <Button
            onClick={handleSend}
            disabled={disabled || !value.trim() || isOverLimit}
            variant="primary"
            size="medium"
            className={styles.sendButton}
          >
            {disabled ? '...' : '发送'}
          </Button>
        </div>
      </div>

      {/* 提示信息 */}
      <div className={styles.hints}>
        <div className={styles.shortcutHint}>
          <span>按 Enter 发送，Shift + Enter 换行</span>
        </div>
        {isOverLimit && (
          <div className={styles.errorHint}>消息长度超出限制，请缩短内容</div>
        )}
      </div>
    </div>
  );
};

MessageInput.displayName = 'MessageInput';
