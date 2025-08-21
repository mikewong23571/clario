/**
 * 搜索栏组件
 * 提供项目搜索和过滤功能
 */

import React, { useState, useCallback } from 'react';
import { clsx } from 'clsx';
import { ProjectFilter } from '../../types/project';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  /** 当前过滤器状态 */
  filter: ProjectFilter;
  /** 过滤器变化回调 */
  onFilterChange: (filter: ProjectFilter) => void;
  /** 是否显示加载状态 */
  loading?: boolean;
  /** 占位符文本 */
  placeholder?: string;
  /** 额外的CSS类名 */
  className?: string;
}

/**
 * 搜索栏组件
 */
export function SearchBar({
  filter,
  onFilterChange,
  loading = false,
  placeholder = '搜索项目名称、ID或状态...',
  className,
}: SearchBarProps) {
  const [searchValue, setSearchValue] = useState(filter.search || '');

  // 处理搜索输入变化
  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setSearchValue(value);

      // 实时搜索，延迟300ms
      const timeoutId = setTimeout(() => {
        onFilterChange({
          ...filter,
          search: value.trim() || undefined,
        });
      }, 300);

      return () => clearTimeout(timeoutId);
    },
    [filter, onFilterChange]
  );

  // 处理排序变化
  const handleSortChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const [sortBy, sortOrder] = event.target.value.split('-') as [
        ProjectFilter['sortBy'],
        ProjectFilter['sortOrder'],
      ];

      onFilterChange({
        ...filter,
        sortBy: sortBy || undefined,
        sortOrder: sortOrder || 'asc',
      });
    },
    [filter, onFilterChange]
  );

  // 处理状态过滤变化
  const handleStatusChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const status = event.target.value;
      onFilterChange({
        ...filter,
        status: status || undefined,
      });
    },
    [filter, onFilterChange]
  );

  // 清除所有过滤器
  const handleClearFilters = useCallback(() => {
    setSearchValue('');
    onFilterChange({});
  }, [onFilterChange]);

  const hasActiveFilters = filter.search || filter.status || filter.sortBy;

  return (
    <div className={clsx(styles.searchBar, className)}>
      <div className={styles.searchContainer}>
        {/* 搜索输入框 */}
        <div className={styles.searchInputWrapper}>
          <svg
            className={styles.searchIcon}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder={placeholder}
            value={searchValue}
            onChange={handleSearchChange}
            disabled={loading}
            className={clsx(styles.searchInput, loading && styles.disabled)}
          />
          {loading && (
            <div className={styles.loadingContainer}>
              <svg
                className={styles.loadingSpinner}
                width="16"
                height="16"
                viewBox="0 0 24 24"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray="32"
                  strokeDashoffset="32"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    values="32;0;32"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                </circle>
              </svg>
            </div>
          )}
        </div>

        {/* 过滤器控件 */}
        <div className={styles.filtersContainer}>
          {/* 状态过滤 */}
          <select
            value={filter.status || ''}
            onChange={handleStatusChange}
            disabled={loading}
            className={clsx(styles.select, loading && styles.disabled)}
          >
            <option value="">所有状态</option>
            <option value="draft">草稿</option>
            <option value="active">活跃</option>
            <option value="completed">已完成</option>
            <option value="archived">已归档</option>
          </select>

          {/* 排序选择 */}
          <select
            value={`${filter.sortBy || 'lastUpdated'}-${filter.sortOrder || 'desc'}`}
            onChange={handleSortChange}
            disabled={loading}
            className={clsx(styles.select, loading && styles.disabled)}
          >
            <option value="lastUpdated-desc">最近更新</option>
            <option value="lastUpdated-asc">最早更新</option>
            <option value="name-asc">名称 A-Z</option>
            <option value="name-desc">名称 Z-A</option>
            <option value="status-asc">状态升序</option>
            <option value="status-desc">状态降序</option>
          </select>

          {/* 清除过滤器按钮 */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              disabled={loading}
              title="清除所有过滤器"
              className={clsx(styles.clearButton, loading && styles.disabled)}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              清除
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
