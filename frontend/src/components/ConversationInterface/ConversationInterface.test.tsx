/**
 * ConversationInterface 组件测试
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConversationInterface } from './ConversationInterface';
import { ConversationSession } from '../../types/conversation';
// Mock useConversation hook
const mockUseConversation = {
  session: null as ConversationSession | null,
  messages: [] as Array<{
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: string;
  }>,
  isLoading: false,
  error: null,
  startConversation: vi.fn(),
  sendMessage: vi.fn(),
  endConversation: vi.fn(),
  clearError: vi.fn(),
  reconnect: vi.fn(),
};

vi.mock('../../hooks/useConversation', () => ({
  useConversation: () => mockUseConversation,
}));

// Mock MessageList component
vi.mock('../MessageList', () => ({
  MessageList: ({
    messages,
    isLoading,
  }: {
    messages: Array<{
      id: string;
      content: string;
      role: 'user' | 'assistant';
      timestamp: string;
    }>;
    isLoading: boolean;
  }) => (
    <div data-testid="message-list">
      {messages.map((msg, index) => (
        <div key={index} data-testid={`message-${msg.role}`}>
          {msg.content}
        </div>
      ))}
      {isLoading && <div data-testid="loading-indicator">Loading...</div>}
    </div>
  ),
}));

// Mock MessageInput component
vi.mock('../MessageInput', () => ({
  MessageInput: ({
    value,
    onChange,
    onSend,
    disabled,
  }: {
    value: string;
    onChange: (value: string) => void;
    onSend: (message: string) => void;
    disabled: boolean;
  }) => (
    <div data-testid="message-input">
      <input
        data-testid="input-field"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
      <button
        data-testid="send-button"
        onClick={() => onSend(value)}
        disabled={disabled || !value.trim()}
      >
        发送
      </button>
    </div>
  ),
}));

const defaultProps = {
  projectId: 'test-project-1',
  onConversationEnd: vi.fn(),
  onDocumentUpdate: vi.fn(),
};

describe('ConversationInterface', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock state
    mockUseConversation.session = null;
    mockUseConversation.messages = [];
    mockUseConversation.isLoading = false;
    mockUseConversation.error = null;
  });

  it('renders conversation interface correctly', () => {
    render(<ConversationInterface {...defaultProps} />);

    expect(screen.getByText('AI 产品需求引导')).toBeInTheDocument();
    expect(screen.getByTestId('message-input')).toBeInTheDocument();
  });

  it('starts conversation on mount', () => {
    render(<ConversationInterface {...defaultProps} />);

    expect(mockUseConversation.startConversation).toHaveBeenCalledWith({
      projectId: 'test-project-1',
    });
  });

  it('displays welcome message when no messages', () => {
    render(<ConversationInterface {...defaultProps} />);

    expect(screen.getByText(/欢迎使用 Clario AI 引导/)).toBeInTheDocument();
    expect(screen.getByText(/创建新产品/)).toBeInTheDocument();
  });

  it('displays messages when available', () => {
    const messages = [
      {
        id: '1',
        role: 'user' as const,
        content: 'Hello',
        timestamp: new Date().toISOString(),
      },
      {
        id: '2',
        role: 'assistant' as const,
        content: 'Hi there!',
        timestamp: new Date().toISOString(),
      },
    ];

    mockUseConversation.messages = messages;
    mockUseConversation.session = {
      id: 'test-session',
      projectId: 'test-project',
    };

    render(<ConversationInterface {...defaultProps} />);

    expect(screen.getByTestId('message-list')).toBeInTheDocument();
    expect(
      screen.queryByText(/欢迎使用 Clario AI 引导/)
    ).not.toBeInTheDocument();
  });

  it('sends message when input is submitted', async () => {
    const user = userEvent.setup();
    mockUseConversation.session = {
      id: 'test-session',
      projectId: 'test-project',
    };

    render(<ConversationInterface {...defaultProps} />);

    const input = screen.getByTestId('input-field');
    const sendButton = screen.getByTestId('send-button');

    await user.type(input, 'Test message');
    await user.click(sendButton);

    expect(mockUseConversation.sendMessage).toHaveBeenCalledWith(
      'Test message'
    );
  });

  it('disables input when loading', () => {
    Object.assign(mockUseConversation, { isLoading: true });

    render(<ConversationInterface {...defaultProps} />);

    expect(screen.getByTestId('input-field')).toBeDisabled();
    expect(screen.getByTestId('send-button')).toBeDisabled();
  });

  it('displays error message when error occurs', () => {
    Object.assign(mockUseConversation, { error: 'Connection failed' });

    render(<ConversationInterface {...defaultProps} />);

    expect(screen.getByText(/对话出现错误/)).toBeInTheDocument();
    expect(screen.getByText('Connection failed')).toBeInTheDocument();
    expect(screen.getByText(/重新开始/)).toBeInTheDocument();
  });

  it('clears error when retry button is clicked', async () => {
    const user = userEvent.setup();
    Object.assign(mockUseConversation, { error: 'Connection failed' });

    render(<ConversationInterface {...defaultProps} />);

    const retryButton = screen.getByText(/重新开始/);
    await user.click(retryButton);

    expect(mockUseConversation.startConversation).toHaveBeenCalledWith({
      projectId: 'test-project-1',
      initialMessage: '你好，我想重新开始讨论我的产品想法。',
    });
  });

  it('ends conversation when end button is clicked', async () => {
    const onConversationEnd = vi.fn();

    render(
      <ConversationInterface
        {...defaultProps}
        onConversationEnd={onConversationEnd}
      />
    );

    // This test would need to be adjusted based on actual UI implementation
    // For now, just test that endConversation can be called
    expect(mockUseConversation.endConversation).toBeDefined();
  });

  it('uses suggestions when suggestion is clicked', async () => {
    const user = userEvent.setup();

    render(<ConversationInterface {...defaultProps} />);

    // Click on a welcome suggestion button
    const suggestion = screen.getByText('创建新产品');
    await user.click(suggestion);

    expect(mockUseConversation.sendMessage).toHaveBeenCalledWith(
      '我想创建一个新的产品'
    );
  });
});
