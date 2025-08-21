import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { ProjectCard } from './ProjectCard';
import type { Project } from '../types/project';

// 创建测试用的QueryClient
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

// 测试包装器
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

// Mock project data
const mockProject: Project = {
  id: 'test-project-1',
  name: 'Test Project',
  description: 'A test project for unit testing',
  status: 'active',
  specVersion: '1.0.0',
  lastUpdated: '2024-01-15T10:30:00Z',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-15T10:30:00Z',
};

describe('ProjectCard', () => {
  it('renders project information correctly', () => {
    render(<ProjectCard project={mockProject} />, { wrapper: TestWrapper });

    // Check if project name is displayed
    expect(screen.getByText('Test Project')).toBeInTheDocument();

    // Check if project ID is displayed
    expect(screen.getByText('test-project-1')).toBeInTheDocument();

    // Check if status is displayed
    expect(screen.getByText('活跃')).toBeInTheDocument();

    // Check if version is displayed
    expect(screen.getByText('1.0.0')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const mockOnClick = vi.fn();
    render(<ProjectCard project={mockProject} onClick={mockOnClick} />, {
      wrapper: TestWrapper,
    });

    const card = screen.getByRole('button');
    fireEvent.click(card);

    expect(mockOnClick).toHaveBeenCalledWith(mockProject);
  });

  it('handles keyboard navigation', () => {
    const mockOnClick = vi.fn();
    render(<ProjectCard project={mockProject} onClick={mockOnClick} />, {
      wrapper: TestWrapper,
    });

    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: 'Enter' });

    expect(mockOnClick).toHaveBeenCalledWith(mockProject);
  });

  it('displays loading state correctly', () => {
    render(<ProjectCard project={mockProject} loading={true} />, {
      wrapper: TestWrapper,
    });

    // Loading overlay should be present when loading
    const loadingOverlay = screen.getByTestId('loading-overlay');
    expect(loadingOverlay).toBeInTheDocument();

    // Loading spinner should be present
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toBeInTheDocument();
  });

  it('renders without onClick handler (non-interactive)', () => {
    render(<ProjectCard project={mockProject} />, { wrapper: TestWrapper });

    // Should not have button role when no onClick handler
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('displays different status styles correctly', () => {
    const statusTests = [
      { status: 'active', displayText: '活跃' },
      { status: 'completed', displayText: '已完成' },
      { status: 'draft', displayText: '草稿' },
      { status: 'archived', displayText: '已归档' },
    ] as const;

    statusTests.forEach(({ status, displayText }) => {
      const projectWithStatus = { ...mockProject, status };
      const { rerender } = render(<ProjectCard project={projectWithStatus} />, {
        wrapper: TestWrapper,
      });

      expect(screen.getByText(displayText)).toBeInTheDocument();

      rerender(<div />); // Clear for next iteration
    });
  });

  it('formats date correctly', () => {
    render(<ProjectCard project={mockProject} />, { wrapper: TestWrapper });

    // Should display formatted date (implementation depends on formatDate function)
    const dateElement = screen.getByText(/2024/);
    expect(dateElement).toBeInTheDocument();
  });

  it('handles mouse enter for preloading', () => {
    render(<ProjectCard project={mockProject} onClick={vi.fn()} />, {
      wrapper: TestWrapper,
    });

    const card = screen.getByRole('button');

    // Test that mouse enter doesn't throw an error
    expect(() => {
      fireEvent.mouseEnter(card);
    }).not.toThrow();

    // Verify the card is still rendered after mouse enter
    expect(card).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const customClass = 'custom-project-card';
    render(<ProjectCard project={mockProject} className={customClass} />, {
      wrapper: TestWrapper,
    });

    // Find the root div element that should have the className
    const card = screen
      .getByText('Test Project')
      .closest('div[class*="custom-project-card"]');
    expect(card).toBeInTheDocument();
  });

  it('handles missing optional fields gracefully', () => {
    const minimalProject: Project = {
      id: 'minimal-project',
      name: 'Minimal Project',
      description: 'Minimal project description',
      status: 'draft',
      specVersion: '1.0.0',
      lastUpdated: '2024-01-15T10:30:00Z',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-15T10:30:00Z',
    };

    expect(() => {
      render(<ProjectCard project={minimalProject} />, {
        wrapper: TestWrapper,
      });
    }).not.toThrow();

    expect(screen.getByText('Minimal Project')).toBeInTheDocument();
  });
});
