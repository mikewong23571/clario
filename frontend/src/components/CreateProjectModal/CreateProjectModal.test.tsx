/**
 * CreateProjectModal 组件测试
 */

/* eslint-disable react/prop-types */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateProjectModal } from './CreateProjectModal';

// Mock Modal component
vi.mock('../ui/Modal', () => ({
  Modal: ({
    open,
    onClose,
    title,
    children,
  }: {
    open: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
  }) => {
    return open ? (
      <div data-testid="modal">
        <h2>{title}</h2>
        <button onClick={onClose} data-testid="modal-close">
          关闭
        </button>
        {children}
      </div>
    ) : null;
  },
}));

// Mock Input component
vi.mock('../ui/Input', () => ({
  Input: ({
    label,
    value,
    onChange,
    onBlur,
    errorMessage,
    ...props
  }: {
    label?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    errorMessage?: string;
    [key: string]: unknown;
  }) => {
    // Filter out custom props that shouldn't be passed to DOM
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      size,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      variant,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      leftIcon,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      rightIcon,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      clearable,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onClear,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      wrapperClassName,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      showRequiredMark,
      ...domProps
    } = props;

    const inputId = `input-${label || 'input'}`;

    return (
      <div>
        {label && <label htmlFor={inputId}>{label}</label>}
        <input
          id={inputId}
          value={value || ''}
          onChange={(e) => {
            // For testing purposes, don't enforce maxLength in the mock
            // This allows validation tests to work properly
            const newValue = e.target.value;

            // Create a new event with the full value (ignore maxLength)
            const syntheticEvent = {
              ...e,
              target: { ...e.target, value: newValue },
              currentTarget: { ...e.currentTarget, value: newValue },
            };
            onChange?.(syntheticEvent);
          }}
          onBlur={onBlur}
          data-testid={props['data-testid'] || `input-${label}`}
          // Remove maxLength from DOM props to prevent browser enforcement
          {...Object.fromEntries(
            Object.entries(domProps).filter(([key]) => key !== 'maxLength')
          )}
        />
        {errorMessage && (
          <span data-testid={`error-message-${label}`}>{errorMessage}</span>
        )}
      </div>
    );
  },
}));

// Mock Button component
vi.mock('../ui/Button', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    loading,
    type,
    ...props
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    loading?: boolean;
    type?: 'button' | 'submit' | 'reset';
    [key: string]: unknown;
  }) => {
    // Filter out custom props that shouldn't be passed to DOM
    const {
      className,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      variant,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      size,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      shape,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      iconOnly,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      glow,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      pulse,
      ...domProps
    } = props;

    return (
      <button
        onClick={onClick}
        disabled={disabled || loading}
        data-testid={props['data-testid'] || 'button'}
        className={className}
        type={type}
        {...domProps}
      >
        {loading ? '创建中...' : children}
      </button>
    );
  },
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
    expect(screen.getByText('项目类型')).toBeInTheDocument();
    expect(screen.getByText('项目模板')).toBeInTheDocument();
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
    render(<CreateProjectModal {...defaultProps} />);

    // Manually trigger form submission instead of clicking the button
    const form = screen.getByTestId('modal').querySelector('form');
    if (form) {
      const submitEvent = new Event('submit', {
        bubbles: true,
        cancelable: true,
      });
      form.dispatchEvent(submitEvent);
    }

    await waitFor(() => {
      expect(screen.getByTestId('error-message-项目名称')).toBeInTheDocument();
      expect(screen.getByTestId('error-message-项目名称')).toHaveTextContent(
        '项目名称不能为空'
      );
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
      expect(screen.getByText('项目名称至少需要 2 个字符')).toBeInTheDocument();
    });
  });

  it('calls onCreateProject with form data when form is valid', async () => {
    const user = userEvent.setup();
    const onCreateProject = vi.fn().mockResolvedValue(undefined);

    render(
      <CreateProjectModal {...defaultProps} onCreateProject={onCreateProject} />
    );

    // Fill in valid form data
    await user.type(screen.getByTestId('input-项目名称'), 'Test Project');
    await user.type(screen.getByTestId('input-项目描述'), 'Test Description');
    await user.click(screen.getByDisplayValue('web'));
    await user.click(screen.getByDisplayValue('react-ts'));

    const createButton = screen.getByText('创建项目');
    await user.click(createButton);

    await waitFor(() => {
      expect(onCreateProject).toHaveBeenCalledWith({
        name: 'Test Project',
        description: 'Test Description',
        type: 'web',
        template: 'react-ts',
      });
    });
  });

  it('disables create button when loading', () => {
    render(<CreateProjectModal {...defaultProps} loading={true} />);

    const createButton = screen.getByText('创建中...');
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
    const onCreateProject = vi
      .fn()
      .mockRejectedValue(new Error('Creation failed'));

    render(
      <CreateProjectModal {...defaultProps} onCreateProject={onCreateProject} />
    );

    // Fill in valid form data
    await user.type(screen.getByTestId('input-项目名称'), 'Test Project');
    await user.type(screen.getByTestId('input-项目描述'), 'Test Description');
    await user.click(screen.getByDisplayValue('web'));
    await user.click(screen.getByDisplayValue('react-ts'));

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
      expect(screen.getByText('项目名称至少需要 2 个字符')).toBeInTheDocument();
    });

    // Clear and test maximum length
    await user.clear(nameInput);
    await user.type(nameInput, 'a'.repeat(51));

    // Submit the form to trigger validation
    const createButton = screen.getByText('创建项目');
    await user.click(createButton);

    await waitFor(() => {
      expect(
        screen.getByText('项目名称不能超过 50 个字符')
      ).toBeInTheDocument();
    });
  });

  it('validates project description length', async () => {
    const user = userEvent.setup();

    render(<CreateProjectModal {...defaultProps} />);

    const descriptionInput = screen.getByTestId('input-项目描述');

    // Test maximum length - use form submission instead of blur
    await user.type(descriptionInput, 'a'.repeat(201));

    // Submit the form to trigger validation
    const createButton = screen.getByText('创建项目');
    await user.click(createButton);

    await waitFor(() => {
      expect(
        screen.getByText('项目描述不能超过 200 个字符')
      ).toBeInTheDocument();
    });
  });
});
