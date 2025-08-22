/**
 * CreateProjectModal 组件测试
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateProjectModal, type ProjectFormData } from './CreateProjectModal';

// Mock Modal component
vi.mock('../ui/Modal', () => ({
  Modal: ({ open, onClose, title, children }: any) => {
    return open ? (
      <div data-testid="modal">
        <h2>{title}</h2>
        <button onClick={onClose} data-testid="modal-close">关闭</button>
        {children}
      </div>
    ) : null;
  },
}));

// Mock Input component
vi.mock('../ui/Input', () => ({
  Input: ({ label, value, onChange, error, errorMessage, ...props }: any) => (
    <div>
      <label>{label}</label>
      <input
        value={value || ''}
        onChange={(e) => onChange?.(e)}
        data-testid={props['data-testid'] || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`}
        {...props}
      />
      {error && errorMessage && <span data-testid="error-message">{errorMessage}</span>}
    </div>
  ),
}));

// Mock Button component
vi.mock('../ui/Button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid={props['data-testid'] || 'button'}
      {...props}
    >
      {children}
    </button>
  ),
}));

describe('CreateProjectModal', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    onCreateProject: vi.fn(),
    loading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal when open', () => {
    render(<CreateProjectModal {...defaultProps} />);
    
    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(screen.getByText('创建新项目')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<CreateProjectModal {...defaultProps} open={false} />);
    
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  it('renders all form fields', () => {
    render(<CreateProjectModal {...defaultProps} />);
    
    expect(screen.getByLabelText('项目名称')).toBeInTheDocument();
    expect(screen.getByLabelText('项目描述')).toBeInTheDocument();
    expect(screen.getByLabelText('项目类型')).toBeInTheDocument();
    expect(screen.getByLabelText('项目模板')).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    render(<CreateProjectModal {...defaultProps} />);
    
    expect(screen.getByText('取消')).toBeInTheDocument();
    expect(screen.getByText('创建项目')).toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    
    render(<CreateProjectModal {...defaultProps} onClose={onClose} />);
    
    await user.click(screen.getByText('取消'));
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when modal close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    
    render(<CreateProjectModal {...defaultProps} onClose={onClose} />);
    
    await user.click(screen.getByTestId('modal-close'));
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('updates form fields when user types', async () => {
    const user = userEvent.setup();
    
    render(<CreateProjectModal {...defaultProps} />);
    
    const nameInput = screen.getByTestId('input-项目名称');
    const descriptionInput = screen.getByTestId('input-项目描述');
    
    await user.type(nameInput, 'Test Project');
    await user.type(descriptionInput, 'Test Description');
    
    expect(nameInput).toHaveValue('Test Project');
    expect(descriptionInput).toHaveValue('Test Description');
  });

  it('shows validation errors for empty required fields', async () => {
    const user = userEvent.setup();
    
    render(<CreateProjectModal {...defaultProps} />);
    
    const createButton = screen.getByText('创建项目');
    await user.click(createButton);
    
    await waitFor(() => {
      expect(screen.getByText('项目名称不能为空')).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid project name', async () => {
    const user = userEvent.setup();
    
    render(<CreateProjectModal {...defaultProps} />);
    
    const nameInput = screen.getByTestId('input-项目名称');
    await user.type(nameInput, 'a'); // Too short
    
    const createButton = screen.getByText('创建项目');
    await user.click(createButton);
    
    await waitFor(() => {
      expect(screen.getByText('项目名称长度必须在2-50个字符之间')).toBeInTheDocument();
    });
  });

  it('calls onCreateProject with form data when form is valid', async () => {
    const user = userEvent.setup();
    const onCreateProject = vi.fn().mockResolvedValue(undefined);
    
    render(<CreateProjectModal {...defaultProps} onCreateProject={onCreateProject} />);
    
    // Fill in valid form data
    await user.type(screen.getByTestId('input-项目名称'), 'Test Project');
    await user.type(screen.getByTestId('input-项目描述'), 'Test Description');
    await user.selectOptions(screen.getByLabelText('项目类型'), 'web');
    await user.selectOptions(screen.getByLabelText('项目模板'), 'react-typescript');
    
    const createButton = screen.getByText('创建项目');
    await user.click(createButton);
    
    await waitFor(() => {
      expect(onCreateProject).toHaveBeenCalledWith({
        name: 'Test Project',
        description: 'Test Description',
        type: 'web',
        template: 'react-typescript',
      });
    });
  });

  it('disables create button when loading', () => {
    render(<CreateProjectModal {...defaultProps} loading={true} />);
    
    const createButton = screen.getByText('创建项目');
    expect(createButton).toBeDisabled();
  });

  it('shows loading state in create button', () => {
    render(<CreateProjectModal {...defaultProps} loading={true} />);
    
    expect(screen.getByText('创建中...')).toBeInTheDocument();
  });

  it('resets form when modal is closed and reopened', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<CreateProjectModal {...defaultProps} />);
    
    // Fill in some data
    await user.type(screen.getByTestId('input-项目名称'), 'Test Project');
    
    // Close modal
    rerender(<CreateProjectModal {...defaultProps} open={false} />);
    
    // Reopen modal
    rerender(<CreateProjectModal {...defaultProps} open={true} />);
    
    // Form should be reset
    expect(screen.getByTestId('input-项目名称')).toHaveValue('');
  });

  it('handles form submission error gracefully', async () => {
    const user = userEvent.setup();
    const onCreateProject = vi.fn().mockRejectedValue(new Error('Creation failed'));
    
    render(<CreateProjectModal {...defaultProps} onCreateProject={onCreateProject} />);
    
    // Fill in valid form data
    await user.type(screen.getByTestId('input-项目名称'), 'Test Project');
    await user.type(screen.getByTestId('input-项目描述'), 'Test Description');
    await user.selectOptions(screen.getByLabelText('项目类型'), 'web');
    await user.selectOptions(screen.getByLabelText('项目模板'), 'react-typescript');
    
    const createButton = screen.getByText('创建项目');
    await user.click(createButton);
    
    await waitFor(() => {
      expect(onCreateProject).toHaveBeenCalled();
    });
    
    // Modal should remain open on error
    expect(screen.getByTestId('modal')).toBeInTheDocument();
  });

  it('validates project name length', async () => {
    const user = userEvent.setup();
    
    render(<CreateProjectModal {...defaultProps} />);
    
    const nameInput = screen.getByTestId('input-项目名称');
    
    // Test minimum length
    await user.type(nameInput, 'a');
    await user.tab(); // Trigger blur to show validation
    
    await waitFor(() => {
      expect(screen.getByText('项目名称长度必须在2-50个字符之间')).toBeInTheDocument();
    });
    
    // Clear and test maximum length
    await user.clear(nameInput);
    await user.type(nameInput, 'a'.repeat(51));
    await user.tab();
    
    await waitFor(() => {
      expect(screen.getByText('项目名称长度必须在2-50个字符之间')).toBeInTheDocument();
    });
  });

  it('validates project description length', async () => {
    const user = userEvent.setup();
    
    render(<CreateProjectModal {...defaultProps} />);
    
    const descriptionInput = screen.getByTestId('input-项目描述');
    
    // Test maximum length
    await user.type(descriptionInput, 'a'.repeat(201));
    await user.tab();
    
    await waitFor(() => {
      expect(screen.getByText('项目描述不能超过200个字符')).toBeInTheDocument();
    });
  });
});