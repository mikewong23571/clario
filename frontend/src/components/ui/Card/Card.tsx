/**
 * Card 组件
 * 基于 Clario 设计系统的卡片组件
 */

import React, { type JSX } from 'react';
import { clsx } from 'clsx';
import styles from './Card.module.css';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 卡片变体 */
  variant?: 'default' | 'elevated' | 'outlined' | 'filled' | 'plain';
  /** 卡片大小 */
  size?: 'small' | 'medium' | 'large';
  /** 是否为交互式卡片 */
  interactive?: boolean;
  /** 是否可选择 */
  selectable?: boolean;
  /** 是否已选择 */
  selected?: boolean;
  /** 卡片状态 */
  status?: 'default' | 'loading' | 'disabled' | 'error' | 'success' | 'warning';
  /** 布局方向 */
  direction?: 'vertical' | 'horizontal';
  /** 内容对齐方式 */
  centered?: boolean;
  /** 特殊效果 */
  effect?: 'none' | 'floating' | 'gradient-border';
  /** 自定义类名 */
  className?: string;
  /** 卡片内容 */
  children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      size = 'medium',
      interactive = false,
      selectable = false,
      selected = false,
      status = 'default',
      direction = 'vertical',
      centered = false,
      effect = 'none',
      className,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const isClickable = interactive || selectable || onClick;

    return (
      <div
        ref={ref}
        className={clsx(
          styles.card,
          styles[variant],
          size !== 'medium' && styles[size],
          status !== 'default' && styles[status],
          interactive && styles.interactive,
          selectable && styles.selectable,
          selected && styles.selected,
          direction === 'horizontal' && styles.horizontal,
          centered && styles.centered,
          effect === 'floating' && styles.floatingEnhanced,
          effect === 'gradient-border' && styles.gradientBorder,
          className
        )}
        role={isClickable ? 'button' : undefined}
        tabIndex={isClickable ? 0 : undefined}
        onClick={onClick}
        onKeyDown={
          onClick
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClick(e as React.MouseEvent<HTMLDivElement>);
                }
              }
            : undefined
        }
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// 卡片子组件
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 是否紧凑 */
  compact?: boolean;
  /** 是否无边框 */
  borderless?: boolean;
  /** 自定义类名 */
  className?: string;
  children: React.ReactNode;
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  (
    { compact = false, borderless = false, className, children, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={clsx(
          styles.cardHeader,
          compact && styles.compact,
          borderless && styles.borderless,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

export interface CardTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {
  /** 标题大小 */
  size?: 'small' | 'medium' | 'large';
  /** 标题级别 */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  /** 自定义类名 */
  className?: string;
  children: React.ReactNode;
}

export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ size = 'medium', level = 3, className, children, ...props }, ref) => {
    const Tag = `h${level}` as keyof JSX.IntrinsicElements;

    return (
      <Tag
        ref={ref}
        className={clsx(
          styles.cardTitle,
          size !== 'medium' && styles[size],
          className
        )}
        {...props}
      >
        {children}
      </Tag>
    );
  }
);

CardTitle.displayName = 'CardTitle';

export interface CardSubtitleProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  /** 自定义类名 */
  className?: string;
  children: React.ReactNode;
}

export const CardSubtitle = React.forwardRef<
  HTMLParagraphElement,
  CardSubtitleProps
>(({ className, children, ...props }, ref) => {
  return (
    <p ref={ref} className={clsx(styles.cardSubtitle, className)} {...props}>
      {children}
    </p>
  );
});

CardSubtitle.displayName = 'CardSubtitle';

export interface CardActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 自定义类名 */
  className?: string;
  children: React.ReactNode;
}

export const CardActions = React.forwardRef<HTMLDivElement, CardActionsProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={clsx(styles.cardActions, className)} {...props}>
        {children}
      </div>
    );
  }
);

CardActions.displayName = 'CardActions';

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 内容密度 */
  density?: 'compact' | 'normal' | 'spacious';
  /** 是否无内边距 */
  flush?: boolean;
  /** 自定义类名 */
  className?: string;
  children: React.ReactNode;
}

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  (
    { density = 'normal', flush = false, className, children, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={clsx(
          styles.cardContent,
          density !== 'normal' && styles[density],
          flush && styles.flush,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 是否紧凑 */
  compact?: boolean;
  /** 是否无边框 */
  borderless?: boolean;
  /** 自定义类名 */
  className?: string;
  children: React.ReactNode;
}

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  (
    { compact = false, borderless = false, className, children, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={clsx(
          styles.cardFooter,
          compact && styles.compact,
          borderless && styles.borderless,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

export interface CardImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** 是否圆角 */
  rounded?: boolean;
  /** 自定义类名 */
  className?: string;
}

export const CardImage = React.forwardRef<HTMLImageElement, CardImageProps>(
  ({ rounded = false, className, alt, ...props }, ref) => {
    return (
      <img
        ref={ref}
        className={clsx(styles.cardImage, rounded && styles.rounded, className)}
        alt={alt}
        {...props}
      />
    );
  }
);

CardImage.displayName = 'CardImage';

export interface CardIconProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 图标大小 */
  size?: 'small' | 'medium' | 'large';
  /** 自定义类名 */
  className?: string;
  children: React.ReactNode;
}

export const CardIcon = React.forwardRef<HTMLDivElement, CardIconProps>(
  ({ size = 'medium', className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          styles.cardIcon,
          size !== 'medium' && styles[size],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardIcon.displayName = 'CardIcon';
