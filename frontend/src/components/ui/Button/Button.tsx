/**
 * Button 组件
 * 基于 Clario 设计系统的按钮组件
 */

import React from 'react';
import { clsx } from 'clsx';
import styles from './Button.module.css';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 按钮变体 */
  variant?:
    | 'primary'
    | 'secondary'
    | 'ghost'
    | 'text'
    | 'success'
    | 'danger'
    | 'warning';
  /** 按钮大小 */
  size?: 'small' | 'medium' | 'large';
  /** 按钮形状 */
  shape?: 'default' | 'rounded' | 'square';
  /** 是否为加载状态 */
  loading?: boolean;
  /** 是否为图标按钮 */
  iconOnly?: boolean;
  /** 是否有发光效果 */
  glow?: boolean;
  /** 是否有脉冲效果 */
  pulse?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 按钮内容 */
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'medium',
      shape = 'default',
      loading = false,
      iconOnly = false,
      glow = false,
      pulse = false,
      className,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={clsx(
          styles.button,
          styles[variant],
          size !== 'medium' && styles[size],
          shape !== 'default' && styles[shape],
          loading && styles.loading,
          iconOnly && styles.iconOnly,
          glow && styles.glow,
          pulse && styles.pulse,
          className
        )}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
