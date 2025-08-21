/**
 * 项目仪表盘组件
 * 展示项目列表，提供搜索、过滤和创建功能
 */

import React, { useState, useCallback } from 'react';
import { clsx } from 'clsx';
import { useFilteredProjects } from '../../hooks/useProjects';
import { Project, ProjectFilter } from '../../types/project';
import { SearchBar } from '../SearchBar';
import { ProjectCard } from '../ProjectCard';
import styles from './ProjectDashboard.module.css';

interface ProjectDashboardProps {
  /** 点击项目卡片的回调 */
  onProjectClick?: (project: Project) => void;
  /** 点击创建项目按钮的回调 */
  onCreateProject?: () => void;
  /** 自定义CSS类名 */
  className?: string;
}

/**
 * 项目仪表盘组件
 */
export function ProjectDashboard({
  onProjectClick,
  onCreateProject,
  className = '',
}: ProjectDashboardProps) {
  // 过滤器状态
  const [filter, setFilter] = useState<ProjectFilter>({
    sortBy: 'lastUpdated',
    sortOrder: 'desc',
  });

  // 获取过滤后的项目数据
  const {
    data: projects,
    isLoading,
    isError,
    error,
    totalCount,
    filteredCount,
    refetch,
  } = useFilteredProjects(filter);

  // 处理过滤器变化
  const handleFilterChange = useCallback((newFilter: ProjectFilter) => {
    setFilter(newFilter);
  }, []);

  // 处理项目卡片点击
  const handleProjectClick = useCallback(
    (project: Project) => {
      if (onProjectClick) {
        onProjectClick(project);
      }
    },
    [onProjectClick]
  );

  // 处理创建项目按钮点击
  const handleCreateProject = useCallback(() => {
    if (onCreateProject) {
      onCreateProject();
    }
  }, [onCreateProject]);

  // 处理重试
  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  // 渲染空状态
  const renderEmptyState = () => {
    const hasFilters = filter.search || filter.status;

    return (
      <div className={styles.stateContainer}>
        <svg
          className={styles.stateIcon}
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14,2 14,8 20,8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10,9 9,9 8,9" />
        </svg>
        <h3 className={styles.stateTitle}>
          {hasFilters ? '没有找到匹配的项目' : '还没有项目'}
        </h3>
        <p className={styles.stateDescription}>
          {hasFilters
            ? '尝试调整搜索条件或清除过滤器'
            : '创建您的第一个项目来开始使用 Clario'}
        </p>
        {!hasFilters && onCreateProject && (
          <button
            type="button"
            className={styles.createButton}
            onClick={handleCreateProject}
          >
            <svg
              className={styles.createButtonIcon}
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            创建新项目
          </button>
        )}
      </div>
    );
  };

  // 渲染错误状态
  const renderErrorState = () => (
    <div className={clsx(styles.stateContainer, styles.errorState)}>
      <svg
        className={styles.stateIcon}
        width="64"
        height="64"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <h3 className={styles.stateTitle}>加载项目时出错</h3>
      <p className={styles.stateDescription}>
        {error instanceof Error ? error.message : '请检查网络连接并重试'}
      </p>
      <button
        type="button"
        className={styles.stateButton}
        onClick={handleRetry}
      >
        <svg
          className={styles.stateButtonIcon}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </svg>
        重试
      </button>
    </div>
  );

  // 渲染加载状态
  const renderLoadingState = () => (
    <div className={styles.loadingGrid}>
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className={styles.loadingCard}>
          <div className={styles.loadingCardHeader}>
            <div className={clsx(styles.skeleton, styles['skeleton--title'])} />
            <div className={clsx(styles.skeleton, styles['skeleton--badge'])} />
          </div>
          <div className={styles.loadingCardContent}>
            <div className={clsx(styles.skeleton, styles['skeleton--text'])} />
            <div
              className={clsx(
                styles.skeleton,
                styles['skeleton--text'],
                styles['skeleton--textShort']
              )}
            />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={clsx(styles.dashboard, className)}>
      {/* 头部区域 */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.headerContent}>
            <h1>项目仪表盘</h1>
            <p className={styles.headerSubtitle}>
              管理和查看您的所有项目
              {totalCount > 0 && (
                <span className={styles.projectCount}>
                  {filteredCount !== totalCount
                    ? `显示 ${filteredCount} / ${totalCount} 个项目`
                    : `共 ${totalCount} 个项目`}
                </span>
              )}
            </p>
          </div>

          {onCreateProject && (
            <button
              type="button"
              className={styles.createButton}
              onClick={handleCreateProject}
              disabled={isLoading}
            >
              <svg
                className={styles.createButtonIcon}
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              创建新项目
            </button>
          )}
        </div>

        {/* 搜索和过滤 */}
        <SearchBar
          filter={filter}
          onFilterChange={handleFilterChange}
          loading={isLoading}
        />
      </div>

      {/* 内容区域 */}
      <div className={styles.content}>
        {isError ? (
          renderErrorState()
        ) : isLoading ? (
          renderLoadingState()
        ) : projects.length === 0 ? (
          renderEmptyState()
        ) : (
          <div className={styles.projectGrid}>
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={onProjectClick ? handleProjectClick : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
