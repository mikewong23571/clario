/**
 * Modal 组件
 * 基于 Clario 设计系统的模态框组件
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import styles from './Modal.module.css';

export interface ModalProps {
  /** 是否显示模态框 */
  open: boolean;
  /** 关闭模态框的回调 */
  onClose: () => void;
  /** 模态框标题 */
  title?: string;
  /** 模态框大小 */
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  /** 是否显示关闭按钮 */
  showCloseButton?: boolean;
  /** 点击遮罩层是否关闭 */
  closeOnOverlayClick?: boolean;
  /** 按ESC键是否关闭 */
  closeOnEscape?: boolean;
  /** 是否居中显示 */
  centered?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 模态框内容 */
  children: React.ReactNode;
  /** 打开动画完成回调 */
  onAfterOpen?: () => void;
  /** 关闭动画完成回调 */
  onAfterClose?: () => void;
}

export const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      open,
      onClose,
      title,
      size = 'medium',
      showCloseButton = true,
      closeOnOverlayClick = true,
      closeOnEscape = true,
      centered = true,
      className,
      children,
      onAfterOpen,
      onAfterClose,
    },
    ref
  ) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const previousActiveElement = useRef<HTMLElement | null>(null);
    const isAnimating = useRef(false);

    // 处理ESC键关闭
    const handleEscapeKey = useCallback(
      (event: KeyboardEvent) => {
        if (closeOnEscape && event.key === 'Escape' && !isAnimating.current) {
          onClose();
        }
      },
      [closeOnEscape, onClose]
    );

    // 处理遮罩层点击关闭
    const handleOverlayClick = useCallback(
      (event: React.MouseEvent<HTMLDivElement>) => {
        if (
          closeOnOverlayClick &&
          event.target === event.currentTarget &&
          !isAnimating.current
        ) {
          onClose();
        }
      },
      [closeOnOverlayClick, onClose]
    );

    // 焦点管理
    const manageFocus = useCallback(() => {
      if (open) {
        // 保存当前焦点元素
        previousActiveElement.current = document.activeElement as HTMLElement;
        
        // 延迟聚焦到模态框，等待动画完成
        setTimeout(() => {
          const modalElement = modalRef.current;
          if (modalElement) {
            // 尝试聚焦到第一个可聚焦元素
            const focusableElements = modalElement.querySelectorAll(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstFocusable = focusableElements[0] as HTMLElement;
            if (firstFocusable) {
              firstFocusable.focus();
            } else {
              modalElement.focus();
            }
          }
          onAfterOpen?.();
        }, 150); // 等待进入动画完成
      } else {
        // 恢复之前的焦点
        setTimeout(() => {
          if (previousActiveElement.current) {
            previousActiveElement.current.focus();
            previousActiveElement.current = null;
          }
          onAfterClose?.();
        }, 150); // 等待退出动画完成
      }
    }, [open, onAfterOpen, onAfterClose]);

    // 焦点陷阱
    const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
      if (event.key === 'Tab') {
        const modalElement = modalRef.current;
        if (!modalElement) return;

        const focusableElements = modalElement.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusable = focusableElements[0] as HTMLElement;
        const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (event.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstFocusable) {
            event.preventDefault();
            lastFocusable?.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastFocusable) {
            event.preventDefault();
            firstFocusable?.focus();
          }
        }
      }
    }, []);

    // 副作用处理
    useEffect(() => {
      if (open) {
        // 阻止背景滚动
        document.body.style.overflow = 'hidden';
        // 添加ESC键监听
        document.addEventListener('keydown', handleEscapeKey);
        // 管理焦点
        manageFocus();
      } else {
        // 恢复背景滚动
        document.body.style.overflow = '';
        // 移除ESC键监听
        document.removeEventListener('keydown', handleEscapeKey);
        // 管理焦点
        manageFocus();
      }

      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleEscapeKey);
      };
    }, [open, handleEscapeKey, manageFocus]);

    // 动画状态管理
    useEffect(() => {
      if (open) {
        isAnimating.current = true;
        setTimeout(() => {
          isAnimating.current = false;
        }, 150);
      } else {
        isAnimating.current = true;
        setTimeout(() => {
          isAnimating.current = false;
        }, 150);
      }
    }, [open]);

    if (!open) {
      return null;
    }

    const modalContent = (
      <div
        className={clsx(
          styles.overlay,
          {
            [styles.centered]: centered,
          }
        )}
        onClick={handleOverlayClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        <div
          ref={modalRef}
          className={clsx(
            styles.modal,
            styles[size],
            className
          )}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          {(title || showCloseButton) && (
            <div className={styles.header}>
              {title && (
                <h2 id="modal-title" className={styles.title}>
                  {title}
                </h2>
              )}
              {showCloseButton && (
                <button
                  type="button"
                  className={styles.closeButton}
                  onClick={onClose}
                  aria-label="关闭对话框"
                >
                  <svg
                    width="24"
                    height="24"
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
            </div>
          )}
          <div className={styles.content}>
            {children}
          </div>
        </div>
      </div>
    );

    // 使用 Portal 渲染到 body
    return createPortal(modalContent, document.body);
  }
);

Modal.displayName = 'Modal';