import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import { ProjectWorkspace } from './ProjectWorkspace';
import { useProject } from '../../hooks/useProjects';
import { useConversation } from '../../hooks/useConversation';
import type { ProjectSpec } from '../../types/project';

// Mock ConversationInterface
vi.mock('../ConversationInterface', () => ({
  ConversationInterface: ({
    projectId,
    initialMessage,
  }: {
    projectId?: string;
    initialMessage?: string;
  }) => (
    <div data-testid="conversation-interface">
      <div>Project ID: {projectId}</div>
      <div>Initial Message: {initialMessage}</div>
    </div>
  ),
}));

// Mock useProject hook
vi.mock('../../hooks/useProjects', () => ({
  useProject: vi.fn(),
}));

// Mock useConversation hook
vi.mock('../../hooks/useConversation', () => ({
  useConversation: vi.fn(),
}));

const mockUseProject = vi.mocked(useProject);
const mockUseConversation = vi.mocked(useConversation);

// 创建测试用的QueryClient
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

// 测试用的项目数据
const mockProject: ProjectSpec = {
  lastUpdated: '2024-01-15T10:30:00Z',
  specVersion: '1.0.0',
  coreIdea: {
    problemStatement: '测试问题陈述',
    targetAudience: '测试用户',
    coreValue: '测试核心价值',
  },
  scope: {
    inScope: ['功能1', '功能2'],
    outOfScope: ['功能3'],
  },
  // Additional properties for display
  id: 'test-project-1',
  name: '测试项目',
  status: 'active',
};

const createWrapper = (
  initialEntries: string[] = ['/projects/test-project-1']
) => {
  const queryClient = createTestQueryClient();

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
    </QueryClientProvider>
  );
  TestWrapper.displayName = 'TestWrapper';
  return TestWrapper;
};

// Mock useParams to return test project ID
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(() => ({ projectId: 'test-project-1' })),
  };
});

// Helper to create a complete mock response for useProject
const createMockUseProjectResponse = (
  data: ProjectSpec | undefined,
  options: {
    isLoading?: boolean;
    isError?: boolean;
    error?: Error | null;
  } = {}
) => {
  const { isLoading = false, isError = false, error = null } = options;

  const status = isLoading ? 'pending' : isError ? 'error' : 'success';

  return {
    data,
    isLoading,
    isError,
    error,
    refetch: vi.fn(),
    isPending: isLoading,
    isLoadingError: isError,
    isRefetchError: false,
    isSuccess: status === 'success',
    isStale: false,
    isFetching: isLoading,
    isFetched: !isLoading,
    isFetchedAfterMount: !isLoading,
    isRefetching: false,
    isPlaceholderData: false,
    isInitialLoading: isLoading,
    isPaused: false,
    isEnabled: true,
    promise: Promise.resolve(data),
    status,
    fetchStatus: isLoading ? 'fetching' : 'idle',
    dataUpdatedAt: Date.now(),
    errorUpdatedAt: isError ? Date.now() : 0,
    failureCount: isError ? 1 : 0,
    failureReason: error,
    errorUpdateCount: isError ? 1 : 0,
  } as unknown as ReturnType<typeof useProject>;
};

describe('ProjectWorkspace', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock useProject to return successful data by default
    mockUseProject.mockReturnValue(createMockUseProjectResponse(mockProject));

    // Mock useConversation
    mockUseConversation.mockReturnValue({
      session: null,
      messages: [],
      isLoading: false,
      error: null,
      startConversation: vi.fn(),
      sendMessage: vi.fn(),
      endConversation: vi.fn(),
      clearError: vi.fn(),
      reconnect: vi.fn(),
    });
  });

  it('renders project workspace with project information', () => {
    render(<ProjectWorkspace />, {
      wrapper: createWrapper(),
    });

    // 检查项目名称
    expect(screen.getByText('测试项目')).toBeInTheDocument();

    // 检查项目元信息
    expect(screen.getByText(/项目ID: test-project-1/)).toBeInTheDocument();
    expect(screen.getByText(/最后更新: 2024\/1\/15/)).toBeInTheDocument();
  });

  it('renders back button with correct link', () => {
    render(<ProjectWorkspace />, {
      wrapper: createWrapper(),
    });

    const backButton = screen.getByText('返回项目列表');
    expect(backButton).toBeInTheDocument();
    expect(backButton.closest('a')).toHaveAttribute('href', '/');
  });

  it('renders tabs for conversation and documents', () => {
    render(<ProjectWorkspace />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText('AI 对话')).toBeInTheDocument();
    expect(screen.getByText('项目文档')).toBeInTheDocument();
  });

  it('shows conversation interface by default', () => {
    render(<ProjectWorkspace />, {
      wrapper: createWrapper(),
    });

    // 检查对话界面是否显示
    expect(screen.getByTestId('conversation-interface')).toBeInTheDocument();
    expect(screen.getByText('Project ID: test-project-1')).toBeInTheDocument();
  });

  it('switches to document view when document tab is clicked', async () => {
    render(<ProjectWorkspace />, {
      wrapper: createWrapper(),
    });

    // 点击文档标签
    const documentTab = screen.getByText('项目文档');
    fireEvent.click(documentTab);

    // 等待文档内容加载完成，检查文档标题
    await waitFor(() => {
      expect(screen.getAllByText('项目文档')).toHaveLength(2); // 标签页和文档标题
    });

    // 检查文档操作按钮
    expect(screen.getByText('编辑')).toBeInTheDocument();
    expect(screen.getByText('导出')).toBeInTheDocument();
  });

  it('shows loading state when document is loading', () => {
    render(<ProjectWorkspace />, {
      wrapper: createWrapper(),
    });

    // 切换到文档视图
    const documentTab = screen.getByText('项目文档');
    fireEvent.click(documentTab);

    // 检查加载状态
    expect(screen.getByText('正在加载项目文档...')).toBeInTheDocument();
  });

  it('displays document content after loading', async () => {
    render(<ProjectWorkspace />, {
      wrapper: createWrapper(),
    });

    // 切换到文档视图
    const documentTab = screen.getByText('项目文档');
    fireEvent.click(documentTab);

    // 等待文档加载完成
    await waitFor(
      () => {
        expect(screen.getByText(/# 测试项目/)).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    // 检查文档内容
    expect(screen.getByText(/## 项目概述/)).toBeInTheDocument();
    expect(screen.getByText(/## 核心功能/)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <ProjectWorkspace className="custom-class" />,
      {
        wrapper: createWrapper(),
      }
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('handles tab switching correctly', () => {
    render(<ProjectWorkspace />, {
      wrapper: createWrapper(),
    });

    const conversationTab = screen.getByText('AI 对话');
    const documentTab = screen.getByText('项目文档');

    // 默认对话标签应该是激活状态（检查className属性包含tabActive）
    expect(conversationTab.closest('button')?.className).toMatch(/tabActive/);
    expect(documentTab.closest('button')?.className).not.toMatch(/tabActive/);

    // 点击文档标签
    fireEvent.click(documentTab);

    // 文档标签应该变为激活状态
    expect(documentTab.closest('button')?.className).toMatch(/tabActive/);
    expect(conversationTab.closest('button')?.className).not.toMatch(
      /tabActive/
    );

    // 点击对话标签
    fireEvent.click(conversationTab);

    // 对话标签应该重新变为激活状态
    expect(conversationTab.closest('button')?.className).toMatch(/tabActive/);
    expect(documentTab.closest('button')?.className).not.toMatch(/tabActive/);
  });

  it('passes correct props to ConversationInterface', () => {
    render(<ProjectWorkspace />, {
      wrapper: createWrapper(),
    });

    const conversationInterface = screen.getByTestId('conversation-interface');
    expect(conversationInterface).toBeInTheDocument();

    // 检查传递的属性
    expect(screen.getByText('Project ID: test-project-1')).toBeInTheDocument();
    expect(
      screen.getByText(/Initial Message:.*开始为项目.*需求澄清/)
    ).toBeInTheDocument();
  });

  it('shows loading state when project is loading', () => {
    // Mock loading state
    mockUseProject.mockReturnValue(
      createMockUseProjectResponse(undefined, { isLoading: true })
    );

    render(<ProjectWorkspace />, { wrapper: createWrapper() });

    // There are multiple instances of loading text, so use getAllByText
    const loadingTexts = screen.getAllByText('正在加载项目...');
    expect(loadingTexts.length).toBeGreaterThan(0);
  });

  it('shows error state when project loading fails', () => {
    const error = new Error('Failed to load project');
    // Mock error state
    mockUseProject.mockReturnValue(
      createMockUseProjectResponse(undefined, { isError: true, error })
    );

    render(<ProjectWorkspace />, { wrapper: createWrapper() });

    expect(
      screen.getByText('加载项目失败: Failed to load project')
    ).toBeInTheDocument();
  });

  it('shows invalid project ID message when no projectId in URL', async () => {
    // For this specific test, mock useParams to return undefined projectId
    const { useParams } = await import('react-router-dom');
    vi.mocked(useParams).mockReturnValueOnce({ projectId: undefined });

    render(<ProjectWorkspace />, {
      wrapper: createWrapper(['/projects']), // No projectId in URL
    });

    expect(screen.getByText('无效的项目 ID')).toBeInTheDocument();
  });
});
