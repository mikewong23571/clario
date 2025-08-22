/**
 * Input 组件
 * 基于 Clario 设计系统的输入框组件
 */

import React, { forwardRef, useState, useCallback } from 'react';
import { clsx } from 'clsx';
import styles from './Input.module.css';

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** 输入框标签 */
  label?: string;
  /** 输入框大小 */
  size?: 'small' | 'medium' | 'large';
  /** 输入框变体 */
  variant?: 'default' | 'filled' | 'outlined';
  /** 验证状态 */
  status?: 'default' | 'success' | 'warning' | 'error';
  /** 帮助文本 */
  helperText?: string;
  /** 错误信息 */
  errorMessage?: string;
  /** 是否必填 */
  required?: boolean;
  /** 是否显示必填标记 */
  showRequiredMark?: boolean;
  /** 左侧图标 */
  leftIcon?: React.ReactNode;
  /** 右侧图标 */
  rightIcon?: React.ReactNode;
  /** 是否显示字符计数 */
  showCount?: boolean;
  /** 最大字符数 */
  maxLength?: number;
  /** 是否可清空 */
  clearable?: boolean;
  /** 清空回调 */
  onClear?: () => void;
  /** 自定义类名 */
  className?: string;
  /** 输入框容器类名 */
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      size = 'medium',
      variant = 'default',
      status = 'default',
      helperText,
      errorMessage,
      required = false,
      showRequiredMark = true,
      leftIcon,
      rightIcon,
      showCount = false,
      maxLength,
      clearable = false,
      onClear,
      className,
      wrapperClassName,
      value,
      defaultValue,
      onChange,
      onFocus,
      onBlur,
      disabled,
      id,
      ...inputProps
    },
    ref
  ) => {
    // Filter out custom props that shouldn't go to the DOM input
    const {
      // Remove any custom props that aren't native input props
      ...domProps
    } = inputProps;
    const [focused, setFocused] = useState(false);
    const [internalValue, setInternalValue] = useState(defaultValue || '');

    // 判断是否为受控组件
    const isControlled = value !== undefined;
    // 使用受控或非受控值
    const currentValue = isControlled ? value : internalValue;
    const hasValue = Boolean(currentValue);
    const showClearButton = clearable && hasValue && !disabled;

    // 生成唯一ID
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const helperTextId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;

    // 处理焦点事件
    const handleFocus = useCallback(
      (event: React.FocusEvent<HTMLInputElement>) => {
        setFocused(true);
        onFocus?.(event);
      },
      [onFocus]
    );

    const handleBlur = useCallback(
      (event: React.FocusEvent<HTMLInputElement>) => {
        setFocused(false);
        onBlur?.(event);
      },
      [onBlur]
    );

    // 处理值变化
    const handleChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;

        // 如果设置了最大长度，限制输入
        if (maxLength && newValue.length > maxLength) {
          return;
        }

        // 如果是非受控组件，更新内部状态
        if (!isControlled) {
          setInternalValue(newValue);
        }
        onChange?.(event);
      },
      [isControlled, maxLength, onChange]
    );

    // 处理清空
    const handleClear = useCallback(() => {
      if (!isControlled) {
        setInternalValue('');
      }
      onClear?.();

      // 创建一个模拟的change事件
      const syntheticEvent = {
        target: { value: '' },
        currentTarget: { value: '' },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange?.(syntheticEvent);
    }, [isControlled, onClear, onChange]);

    // 计算字符数
    const characterCount = String(currentValue).length;
    const isOverLimit = maxLength ? characterCount > maxLength : false;

    // 确定最终状态
    const finalStatus = errorMessage ? 'error' : status;
    const displayHelperText = errorMessage || helperText;

    return (
      <div className={clsx(styles.wrapper, wrapperClassName)}>
        {/* 标签 */}
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
            {required && showRequiredMark && (
              <span className={styles.required} aria-label="必填">
                *
              </span>
            )}
          </label>
        )}

        {/* 输入框容器 */}
        <div
          className={clsx(
            styles.inputContainer,
            styles[size],
            styles[variant],
            styles[finalStatus],
            {
              [styles.focused]: focused,
              [styles.disabled]: disabled,
              [styles.hasLeftIcon]: leftIcon,
              [styles.hasRightIcon]: rightIcon || showClearButton || showCount,
            }
          )}
        >
          {/* 左侧图标 */}
          {leftIcon && (
            <div className={styles.leftIcon} aria-hidden="true">
              {leftIcon}
            </div>
          )}

          {/* 输入框 */}
          <input
            ref={ref}
            id={inputId}
            className={clsx(styles.input, className)}
            {...(isControlled ? { value: currentValue } : { defaultValue })}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            required={required}
            maxLength={maxLength}
            aria-describedby={clsx(
              displayHelperText && helperTextId,
              errorMessage && errorId
            )}
            aria-invalid={finalStatus === 'error'}
            {...domProps}
          />

          {/* 右侧内容 */}
          <div className={styles.rightContent}>
            {/* 字符计数 */}
            {showCount && maxLength && (
              <span
                className={clsx(styles.count, {
                  [styles.countError]: isOverLimit,
                })}
                aria-live="polite"
              >
                {characterCount}/{maxLength}
              </span>
            )}

            {/* 清空按钮 */}
            {showClearButton && (
              <button
                type="button"
                className={styles.clearButton}
                onClick={handleClear}
                aria-label="清空输入"
                tabIndex={-1}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}

            {/* 右侧图标 */}
            {rightIcon && (
              <div className={styles.rightIcon} aria-hidden="true">
                {rightIcon}
              </div>
            )}
          </div>
        </div>

        {/* 帮助文本和错误信息 */}
        {displayHelperText && (
          <div
            id={errorMessage ? errorId : helperTextId}
            className={clsx(styles.helperText, {
              [styles.errorText]: errorMessage,
            })}
            role={errorMessage ? 'alert' : undefined}
            aria-live={errorMessage ? 'polite' : undefined}
          >
            {displayHelperText}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
