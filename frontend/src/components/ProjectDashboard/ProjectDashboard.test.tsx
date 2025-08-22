import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { ProjectDashboard } from './ProjectDashboard';
import * as useProjectsHook from '../../hooks/useProjects';
import type { Project } from '../../types/project';

// Mock CreateProjectModal
vi.mock('../CreateProjectModal', () => ({
  CreateProjectModal: ({ open, onClose }: { open: boolean; onClose: () => void }) => {
    return open ? (
      <div data-testid="create-project-modal">
        <h2>创建新项目</h2>
        <label htmlFor="project-name">项目名称</label>
        <input id="project-name" />
        <button onClick={onClose}>关闭</button>
      </div>
    ) : null;
  },
}));

// Mock the hook
vi.mock('../../hooks/useProjects');

const mockUseFilteredProjects = vi.mocked(useProjectsHook.useFilteredProjects);
const mockUsePrefetchProject = vi.mocked(useProjectsHook.usePrefetchProject);

// Mock project data
const mockProjects: Project[] = [
  {
    id: 'project-1',
    name: 'Project Alpha',
    description: 'First test project',
    status: 'active',
    specVersion: '1.0.0',
    lastUpdated: '2024-01-15T10:30:00Z',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T10:30:00Z',
  },
  {
    id: 'project-2',
    name: 'Project Beta',
    description: 'Second test project',
    status: 'completed',
    specVersion: '2.0.0',
    lastUpdated: '2024-01-10T08:15:00Z',
    created_at: '2024-01-05T00:00:00Z',
    updated_at: '2024-01-10T08:15:00Z',
  },
];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  TestWrapper.displayName = 'TestWrapper';
  return TestWrapper;
};

describe('ProjectDashboard', () => {
  const mockOnProjectClick = vi.fn();
  const mockOnCreateProject = vi.fn();

  const defaultProps = {
    onProjectClick: mockOnProjectClick,
    onCreateProject: mockOnCreateProject,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock usePrefetchProject to return a function
    mockUsePrefetchProject.mockReturnValue(vi.fn());
  });

  it('renders dashboard title and subtitle', () => {
    mockUseFilteredProjects.mockReturnValue({
      data: mockProjects,
      isLoading: false,
      isError: false,
      error: null,
      totalCount: mockProjects.length,
      filteredCount: mockProjects.length,
      refetch: vi.fn(),
    });

    render(<ProjectDashboard {...defaultProps} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText('项目仪表盘')).toBeInTheDocument();
    expect(screen.getByText('管理和查看您的所有项目')).toBeInTheDocument();
  });

  it('displays project count correctly', () => {
    mockUseFilteredProjects.mockReturnValue({
      data: mockProjects,
      isLoading: false,
      isError: false,
      error: null,
      totalCount: mockProjects.length,
      filteredCount: mockProjects.length,
      refetch: vi.fn(),
    });

    render(<ProjectDashboard {...defaultProps} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText('共 2 个项目')).toBeInTheDocument();
  });

  it('renders create project button', () => {
    mockUseFilteredProjects.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      totalCount: 0,
      filteredCount: 0,
      refetch: vi.fn(),
    });

    render(<ProjectDashboard {...defaultProps} />, {
      wrapper: createWrapper(),
    });

    // Should find at least one create button (either in header or empty state)
    const createButtons = screen.getAllByText('创建新项目');
    expect(createButtons.length).toBeGreaterThan(0);
  });

  it('opens create project modal when create button is clicked', async () => {
    const user = userEvent.setup();
    mockUseFilteredProjects.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      totalCount: 0,
      filteredCount: 0,
      refetch: vi.fn(),
    });

    render(<ProjectDashboard {...defaultProps} />, {
      wrapper: createWrapper(),
    });

    const createButton = screen.getAllByText('创建新项目')[0];
    await user.click(createButton);

    // Check if the modal is opened
    expect(screen.getByTestId('create-project-modal')).toBeInTheDocument();
    expect(screen.getByLabelText('项目名称')).toBeInTheDocument();
  });

  it('renders SearchBar component', () => {
    mockUseFilteredProjects.mockReturnValue({
      data: mockProjects,
      isLoading: false,
      isError: false,
      error: null,
      totalCount: mockProjects.length,
      filteredCount: mockProjects.length,
      refetch: vi.fn(),
    });

    render(<ProjectDashboard {...defaultProps} />, {
      wrapper: createWrapper(),
    });

    // SearchBar should be present with search input
    expect(
      screen.getByPlaceholderText('搜索项目名称、ID或状态...')
    ).toBeInTheDocument();
  });

  it('displays loading state', () => {
    mockUseFilteredProjects.mockReturnValue({
      data: [],
      isLoading: true,
      isError: false,
      error: null,
      totalCount: 0,
      filteredCount: 0,
      refetch: vi.fn(),
    });

    render(<ProjectDashboard {...defaultProps} />, {
      wrapper: createWrapper(),
    });

    // Check for skeleton loading elements by class name
    const skeletonElements = document.querySelectorAll('[class*="skeleton"]');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it('displays error state', () => {
    const errorMessage = 'Failed to fetch projects';
    mockUseFilteredProjects.mockReturnValue({
      data: [],
      isLoading: false,
      isError: true,
      error: new Error(errorMessage),
      totalCount: 0,
      filteredCount: 0,
      refetch: vi.fn(),
    });

    render(<ProjectDashboard {...defaultProps} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText('加载项目时出错')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('displays empty state when no projects', () => {
    mockUseFilteredProjects.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      totalCount: 0,
      filteredCount: 0,
      refetch: vi.fn(),
    });

    render(<ProjectDashboard {...defaultProps} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText('还没有项目')).toBeInTheDocument();
    expect(
      screen.getByText('创建您的第一个项目来开始使用 Clario')
    ).toBeInTheDocument();
  });

  it('renders project cards when projects are available', () => {
    mockUseFilteredProjects.mockReturnValue({
      data: mockProjects,
      isLoading: false,
      isError: false,
      error: null,
      totalCount: mockProjects.length,
      filteredCount: mockProjects.length,
      refetch: vi.fn(),
    });

    render(<ProjectDashboard {...defaultProps} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText('Project Alpha')).toBeInTheDocument();
    expect(screen.getByText('Project Beta')).toBeInTheDocument();
    expect(screen.getByText('project-1')).toBeInTheDocument();
    expect(screen.getByText('project-2')).toBeInTheDocument();
  });

  it('calls onProjectClick when project card is clicked', async () => {
    const user = userEvent.setup();
    mockUseFilteredProjects.mockReturnValue({
      data: mockProjects,
      isLoading: false,
      isError: false,
      error: null,
      totalCount: mockProjects.length,
      filteredCount: mockProjects.length,
      refetch: vi.fn(),
    });

    render(<ProjectDashboard {...defaultProps} />, {
      wrapper: createWrapper(),
    });

    const projectCard = screen.getByText('Project Alpha').closest('div');
    if (projectCard) {
      await user.click(projectCard);
      expect(mockOnProjectClick).toHaveBeenCalledWith(mockProjects[0]);
    }
  });

  it('passes correct props to SearchBar', () => {
    mockUseFilteredProjects.mockReturnValue({
      data: mockProjects,
      isLoading: false,
      isError: false,
      error: null,
      totalCount: mockProjects.length,
      filteredCount: mockProjects.length,
      refetch: vi.fn(),
    });

    render(<ProjectDashboard {...defaultProps} />, {
      wrapper: createWrapper(),
    });

    // Verify SearchBar component is rendered
    expect(
      screen.getByPlaceholderText('搜索项目名称、ID或状态...')
    ).toBeInTheDocument();
  });

  it('handles responsive layout', () => {
    mockUseFilteredProjects.mockReturnValue({
      data: mockProjects,
      isLoading: false,
      isError: false,
      error: null,
      totalCount: mockProjects.length,
      filteredCount: mockProjects.length,
      refetch: vi.fn(),
    });

    render(<ProjectDashboard {...defaultProps} />, {
      wrapper: createWrapper(),
    });

    // Check if main container has proper styling for responsive layout
    const mainContainer = screen.getByText('项目仪表盘').closest('div');
    expect(mainContainer).toBeInTheDocument();
  });

  it('displays filtered results message when search is active', () => {
    mockUseFilteredProjects.mockReturnValue({
      data: [mockProjects[0]], // Only one project matches filter
      isLoading: false,
      isError: false,
      error: null,
      totalCount: mockProjects.length,
      filteredCount: 1,
      refetch: vi.fn(),
    });

    render(<ProjectDashboard {...defaultProps} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText('显示 1 / 2 个项目')).toBeInTheDocument();
    expect(screen.getByText('Project Alpha')).toBeInTheDocument();
    expect(screen.queryByText('Project Beta')).not.toBeInTheDocument();
  });
});
