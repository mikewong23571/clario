/**
 * Modal 组件测试
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from './Modal';

// Mock createPortal
vi.mock('react-dom', async () => {
  const actual = await vi.importActual('react-dom');
  return {
    ...actual,
    createPortal: (node: React.ReactNode) => node,
  };
});

describe('Modal', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    children: <div>Modal Content</div>,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset body overflow style
    document.body.style.overflow = '';
  });

  afterEach(() => {
    // Clean up body overflow style
    document.body.style.overflow = '';
  });

  it('renders modal content when open', () => {
    render(<Modal {...defaultProps} />);
    
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<Modal {...defaultProps} open={false} />);
    
    expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(<Modal {...defaultProps} title="Test Modal" />);
    
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
  });

  it('renders close button by default', () => {
    render(<Modal {...defaultProps} title="Test Modal" />);
    
    expect(screen.getByRole('button', { name: /关闭/i })).toBeInTheDocument();
  });

  it('hides close button when showCloseButton is false', () => {
    render(<Modal {...defaultProps} title="Test Modal" showCloseButton={false} />);
    
    expect(screen.queryByRole('button', { name: /关闭/i })).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    
    render(<Modal {...defaultProps} onClose={onClose} title="Test Modal" />);
    
    const closeButton = screen.getByRole('button', { name: /关闭/i });
    await user.click(closeButton);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when overlay is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    
    render(<Modal {...defaultProps} onClose={onClose} />);
    
    const overlay = screen.getByRole('dialog').parentElement;
    if (overlay) {
      await user.click(overlay);
      expect(onClose).toHaveBeenCalledTimes(1);
    }
  });

  it('does not call onClose when overlay is clicked and closeOnOverlayClick is false', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    
    render(<Modal {...defaultProps} onClose={onClose} closeOnOverlayClick={false} />);
    
    const overlay = screen.getByRole('dialog').parentElement;
    if (overlay) {
      await user.click(overlay);
      expect(onClose).not.toHaveBeenCalled();
    }
  });

  it('calls onClose when Escape key is pressed', () => {
    const onClose = vi.fn();
    
    render(<Modal {...defaultProps} onClose={onClose} />);
    
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when Escape key is pressed and closeOnEscape is false', () => {
    const onClose = vi.fn();
    
    render(<Modal {...defaultProps} onClose={onClose} closeOnEscape={false} />);
    
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    
    expect(onClose).not.toHaveBeenCalled();
  });

  it('applies correct size class', () => {
    const { rerender } = render(<Modal {...defaultProps} size="small" />);
    
    // Size class is applied to the inner modal div, not the overlay
    let modal = screen.getByRole('dialog').querySelector('.modal');
    expect(modal).toHaveClass('small');

    rerender(<Modal {...defaultProps} size="large" />);
    modal = screen.getByRole('dialog').querySelector('.modal');
    expect(modal).toHaveClass('large');
  });

  it('applies custom className', () => {
    render(<Modal {...defaultProps} className="custom-modal" />);
    
    // Custom className is applied to the inner modal div, not the overlay
    const modal = screen.getByRole('dialog').querySelector('.modal');
    expect(modal).toHaveClass('custom-modal');
  });

  it('prevents body scroll when open', () => {
    render(<Modal {...defaultProps} />);
    
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body scroll when closed', () => {
    const { rerender } = render(<Modal {...defaultProps} />);
    
    expect(document.body.style.overflow).toBe('hidden');
    
    rerender(<Modal {...defaultProps} open={false} />);
    
    expect(document.body.style.overflow).toBe('');
  });

  it('has correct accessibility attributes', () => {
    render(<Modal {...defaultProps} title="Test Modal" />);
    
    const modal = screen.getByRole('dialog');
    expect(modal).toHaveAttribute('aria-modal', 'true');
    expect(modal).toHaveAttribute('aria-labelledby');
  });

  it('does not close when clicking modal content', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    
    render(<Modal {...defaultProps} onClose={onClose} />);
    
    const modalContent = screen.getByText('Modal Content');
    await user.click(modalContent);
    
    expect(onClose).not.toHaveBeenCalled();
  });
});