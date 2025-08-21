import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from './SearchBar';
import { ProjectFilter } from '../types/project';

describe('SearchBar', () => {
  const defaultFilter: ProjectFilter = {
    search: '',
    status: undefined,
    sortBy: 'name',
    sortOrder: 'asc',
  };

  const defaultProps = {
    filter: defaultFilter,
    onFilterChange: vi.fn(),
    loading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders search input with placeholder', () => {
    render(<SearchBar {...defaultProps} />);

    const searchInput =
      screen.getByPlaceholderText('搜索项目名称、ID或状态...');
    expect(searchInput).toBeInTheDocument();
  });

  it('displays current search term', () => {
    const filterWithSearch = { ...defaultFilter, search: 'test project' };
    render(<SearchBar {...defaultProps} filter={filterWithSearch} />);

    const searchInput = screen.getByDisplayValue('test project');
    expect(searchInput).toBeInTheDocument();
  });

  it('calls onFilterChange when typing in search input', async () => {
    const user = userEvent.setup();
    render(<SearchBar {...defaultProps} />);

    const searchInput =
      screen.getByPlaceholderText('搜索项目名称、ID或状态...');
    await user.type(searchInput, 'new search');

    // Wait for debounced call
    await waitFor(
      () => {
        expect(defaultProps.onFilterChange).toHaveBeenCalledWith({
          ...defaultFilter,
          search: 'new search',
        });
      },
      { timeout: 500 }
    );
  });

  it('shows clear button when search term exists', () => {
    const filterWithSearch = { ...defaultFilter, search: 'test' };
    render(<SearchBar {...defaultProps} filter={filterWithSearch} />);

    const clearButton = screen.getByRole('button', { name: /清除/ });
    expect(clearButton).toBeInTheDocument();
    expect(clearButton).not.toBeDisabled();
  });

  it('hides clear button when search term is empty', () => {
    const emptyFilter: ProjectFilter = {};
    render(<SearchBar {...defaultProps} filter={emptyFilter} />);

    const clearButton = screen.queryByRole('button', { name: /清除/ });
    expect(clearButton).not.toBeInTheDocument();
  });

  it('clears search term when clear button is clicked', async () => {
    const user = userEvent.setup();
    const filterWithSearch = { ...defaultFilter, search: 'test' };
    render(<SearchBar {...defaultProps} filter={filterWithSearch} />);

    const clearButton = screen.getByRole('button', { name: /清除/ });
    await user.click(clearButton);

    expect(defaultProps.onFilterChange).toHaveBeenCalledWith({});
  });

  it('renders status filter dropdown with options', () => {
    render(<SearchBar {...defaultProps} />);

    const statusSelect = screen.getByDisplayValue('所有状态');
    expect(statusSelect).toBeInTheDocument();

    // Check if all status options are present
    expect(screen.getByText('所有状态')).toBeInTheDocument();
    expect(screen.getByText('活跃')).toBeInTheDocument();
    expect(screen.getByText('已完成')).toBeInTheDocument();
    expect(screen.getByText('草稿')).toBeInTheDocument();
    expect(screen.getByText('已归档')).toBeInTheDocument();
  });

  it('calls onFilterChange when status is selected', async () => {
    const user = userEvent.setup();
    render(<SearchBar {...defaultProps} />);

    const statusSelect = screen.getByDisplayValue('所有状态');
    await user.selectOptions(statusSelect, 'active');

    expect(defaultProps.onFilterChange).toHaveBeenCalledWith({
      ...defaultFilter,
      status: 'active',
    });
  });

  it('renders sort dropdown with options', () => {
    render(<SearchBar {...defaultProps} />);

    const sortSelect = screen.getAllByRole('combobox')[1];
    expect(sortSelect).toBeInTheDocument();

    // Check if all sort options are present
    expect(screen.getByText('最近更新')).toBeInTheDocument();
    expect(screen.getByText('最早更新')).toBeInTheDocument();
    expect(screen.getByText('名称 A-Z')).toBeInTheDocument();
    expect(screen.getByText('名称 Z-A')).toBeInTheDocument();
  });

  it('calls onFilterChange when sort option is selected', async () => {
    const user = userEvent.setup();
    render(<SearchBar {...defaultProps} />);

    const sortSelect = screen.getAllByRole('combobox')[1];
    await user.selectOptions(sortSelect, 'lastUpdated-asc');

    expect(defaultProps.onFilterChange).toHaveBeenCalledWith({
      ...defaultFilter,
      sortBy: 'lastUpdated',
      sortOrder: 'asc',
    });
  });

  it('shows clear filters button', () => {
    render(<SearchBar {...defaultProps} />);

    const clearFiltersButton = screen.getByRole('button', { name: /清除/ });
    expect(clearFiltersButton).toBeInTheDocument();
  });

  it('enables clear filters button when filters are active', () => {
    const filterWithData = {
      ...defaultFilter,
      search: 'test',
      status: 'active',
    };
    render(<SearchBar {...defaultProps} filter={filterWithData} />);

    const clearFiltersButton = screen.getByRole('button', { name: /清除/ });
    expect(clearFiltersButton).not.toBeDisabled();
  });

  it('hides clear filters button when no filters are active', () => {
    const emptyFilter: ProjectFilter = {};
    render(<SearchBar {...defaultProps} filter={emptyFilter} />);

    const clearFiltersButton = screen.queryByRole('button', { name: /清除/ });
    expect(clearFiltersButton).not.toBeInTheDocument();
  });

  it('calls onFilterChange when clear filters button is clicked', async () => {
    const user = userEvent.setup();
    const filterWithData = { ...defaultFilter, search: 'test' };
    render(<SearchBar {...defaultProps} filter={filterWithData} />);

    const clearFiltersButton = screen.getByRole('button', { name: /清除/ });
    await user.click(clearFiltersButton);

    expect(defaultProps.onFilterChange).toHaveBeenCalledWith({});
  });

  it('shows loading state when loading is true', () => {
    render(<SearchBar {...defaultProps} loading={true} />);

    const searchInput =
      screen.getByPlaceholderText('搜索项目名称、ID或状态...');
    expect(searchInput).toBeDisabled();
  });

  it('hides loading state when loading is false', () => {
    render(<SearchBar {...defaultProps} loading={false} />);

    const searchInput =
      screen.getByPlaceholderText('搜索项目名称、ID或状态...');
    expect(searchInput).not.toBeDisabled();
  });

  it('disables inputs when loading', () => {
    const filterWithSearch = { ...defaultFilter, search: 'test' };
    render(
      <SearchBar {...defaultProps} filter={filterWithSearch} loading={true} />
    );

    const searchInput =
      screen.getByPlaceholderText('搜索项目名称、ID或状态...');
    const statusSelect = screen.getByDisplayValue('所有状态');
    const sortSelect = screen.getAllByRole('combobox')[1];
    const clearFiltersButton = screen.getByRole('button', { name: /清除/ });

    expect(searchInput).toBeDisabled();
    expect(statusSelect).toBeDisabled();
    expect(sortSelect).toBeDisabled();
    expect(clearFiltersButton).toBeDisabled();
  });

  it('handles focus and blur events on search input', async () => {
    const user = userEvent.setup();
    render(<SearchBar {...defaultProps} />);

    const searchInput =
      screen.getByPlaceholderText('搜索项目名称、ID或状态...');

    // Focus should change border color (tested via style)
    await user.click(searchInput);
    expect(searchInput).toHaveFocus();

    // Blur should reset border color
    await user.tab();
    expect(searchInput).not.toHaveFocus();
  });

  it('maintains accessibility attributes', () => {
    const filterWithSearch = { ...defaultFilter, search: 'test' };
    render(<SearchBar {...defaultProps} filter={filterWithSearch} />);

    const searchInput =
      screen.getByPlaceholderText('搜索项目名称、ID或状态...');
    expect(searchInput).toHaveAttribute('type', 'text');

    const clearButton = screen.getByRole('button', { name: /清除/ });
    expect(clearButton).toHaveAttribute('type', 'button');

    const clearFiltersButton = screen.getByRole('button', { name: /清除/ });
    expect(clearFiltersButton).toHaveAttribute('type', 'button');
  });
});
