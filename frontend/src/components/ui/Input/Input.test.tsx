/**
 * Input 组件测试
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';

describe('Input', () => {
  const defaultProps = {
    id: 'test-input',
    name: 'test',
  };

  it('renders input element', () => {
    render(<Input {...defaultProps} />);

    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('id', 'test-input');
    expect(input).toHaveAttribute('name', 'test');
  });

  it('renders with label when provided', () => {
    render(<Input {...defaultProps} label="Test Label" />);

    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('renders with placeholder', () => {
    render(<Input {...defaultProps} placeholder="Enter text" />);

    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('renders with default value', () => {
    render(<Input {...defaultProps} defaultValue="Default text" />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('Default text');
  });

  it('renders with controlled value', () => {
    render(
      <Input {...defaultProps} value="Controlled text" onChange={vi.fn()} />
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('Controlled text');
  });

  it('calls onChange when value changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<Input {...defaultProps} onChange={onChange} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'test');

    expect(onChange).toHaveBeenCalled();
  });

  it('calls onBlur when input loses focus', async () => {
    const user = userEvent.setup();
    const onBlur = vi.fn();

    render(<Input {...defaultProps} onBlur={onBlur} />);

    const input = screen.getByRole('textbox');
    await user.click(input);
    await user.tab();

    expect(onBlur).toHaveBeenCalled();
  });

  it('calls onFocus when input gains focus', async () => {
    const user = userEvent.setup();
    const onFocus = vi.fn();

    render(<Input {...defaultProps} onFocus={onFocus} />);

    const input = screen.getByRole('textbox');
    await user.click(input);

    expect(onFocus).toHaveBeenCalled();
  });

  it('renders different input types', () => {
    const { rerender } = render(<Input {...defaultProps} type="email" />);

    let input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');

    rerender(<Input {...defaultProps} type="password" />);
    input = screen.getByDisplayValue(''); // Password inputs don't have textbox role
    expect(input).toHaveAttribute('type', 'password');
  });

  it('renders as disabled when disabled prop is true', () => {
    render(<Input {...defaultProps} disabled />);

    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('renders as readonly when readonly prop is true', () => {
    render(<Input {...defaultProps} readOnly />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('readonly');
  });

  it('renders as required when required prop is true', () => {
    render(<Input {...defaultProps} required />);

    const input = screen.getByRole('textbox');
    expect(input).toBeRequired();
  });

  it('applies error state styling', () => {
    render(<Input {...defaultProps} errorMessage="Error message" />);

    const container = screen.getByRole('textbox').parentElement;
    expect(container?.className).toMatch(/error/); // Check for error class name pattern
  });

  it('renders error message when provided', () => {
    render(<Input {...defaultProps} errorMessage="This field is required" />);

    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('renders help text when provided', () => {
    render(<Input {...defaultProps} helperText="Enter your email address" />);

    expect(screen.getByText('Enter your email address')).toBeInTheDocument();
  });

  it('applies different sizes', () => {
    const { rerender } = render(<Input {...defaultProps} size="small" />);

    let container = screen.getByRole('textbox').parentElement;
    expect(container?.className).toMatch(/small/); // Check for small class name pattern

    rerender(<Input {...defaultProps} size="large" />);
    container = screen.getByRole('textbox').parentElement;
    expect(container?.className).toMatch(/large/); // Check for large class name pattern
  });

  it('applies custom className', () => {
    render(<Input {...defaultProps} className="custom-input" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('custom-input');
  });

  it('forwards ref to input element', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input {...defaultProps} ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current).toBe(screen.getByRole('textbox'));
  });

  it('has correct accessibility attributes', () => {
    render(
      <Input
        {...defaultProps}
        label="Email"
        required
        errorMessage="Invalid email"
        helperText="Enter your email"
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toBeRequired();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby');
  });

  it('prevents input when maxLength is reached', async () => {
    const user = userEvent.setup();
    render(<Input {...defaultProps} maxLength={5} />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    await user.type(input, '123456789');

    expect(input.value).toBe('12345');
  });

  it('handles keyboard events', () => {
    const onKeyDown = vi.fn();
    const onKeyUp = vi.fn();

    render(<Input {...defaultProps} onKeyDown={onKeyDown} onKeyUp={onKeyUp} />);

    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Enter' });
    fireEvent.keyUp(input, { key: 'Enter' });

    expect(onKeyDown).toHaveBeenCalled();
    expect(onKeyUp).toHaveBeenCalled();
  });
});
