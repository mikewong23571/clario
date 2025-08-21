/**
 * 项目卡片组件
 * 展示单个项目的摘要信息
 */

import React, { useCallback } from 'react';
import { clsx } from 'clsx';
import { Project } from '../types/project';
import { usePrefetchProject } from '../hooks/useProjects';
import styles from './ProjectCard.module.css';

interface ProjectCardProps {
  /** 项目数据 */
  project: Project;
  /** 点击卡片的回调 */
  onClick?: (project: Project) => void;
  /** 是否显示加载状态 */
  loading?: boolean;
  /** 自定义CSS类名 */
  className?: string;
}

/**
 * 项目卡片组件
 */
export function ProjectCard({
  project,
  onClick,
  loading = false,
  className = '',
}: ProjectCardProps) {
  const prefetchProject = usePrefetchProject();

  // 处理卡片点击
  const handleClick = useCallback(() => {
    if (!loading && onClick) {
      onClick(project);
    }
  }, [project, onClick, loading]);

  // 处理鼠标悬停，预加载项目详情
  const handleMouseEnter = useCallback(() => {
    if (!loading) {
      prefetchProject(project.id);
    }
  }, [project.id, prefetchProject, loading]);

  // 格式化日期
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return '今天';
      } else if (diffDays === 1) {
        return '昨天';
      } else if (diffDays < 7) {
        return `${diffDays}天前`;
      } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `${weeks}周前`;
      } else {
        return date.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      }
    } catch {
      return '未知时间';
    }
  };

  // 获取状态显示文本
  const getStatusText = (status: string | null) => {
    if (!status) return '未设置';

    const statusMap: Record<string, string> = {
      active: '活跃',
      completed: '已完成',
      draft: '草稿',
      archived: '已归档',
    };

    return statusMap[status.toLowerCase()] || status;
  };

  return (
    <div
      className={clsx(
        styles.card,
        {
          [styles['card--loading']]: loading,
          [styles['card--clickable']]: onClick,
        },
        className
      )}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* 卡片头部 */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h3 className={styles.title} title={project.name}>
            {project.name}
          </h3>
          <p className={styles.projectId} title={`项目ID: ${project.id}`}>
            {project.id}
          </p>
        </div>

        <div className={styles.statusSection}>
          <span
            className={clsx(
              styles.statusBadge,
              styles[`status--${project.status?.toLowerCase()}`] ||
                styles['status--default']
            )}
          >
            {getStatusText(project.status)}
          </span>
        </div>
      </div>

      {/* 卡片内容 */}
      <div className={styles.content}>
        <div className={styles.metaList}>
          <div className={styles.metaItem}>
            <svg
              className={styles.metaIcon}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v6m0 6v6" />
            </svg>
            <span className={styles.metaLabel}>版本:</span>
            <span className={styles.metaValue}>{project.specVersion}</span>
          </div>

          <div className={styles.metaItem}>
            <svg
              className={styles.metaIcon}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12,6 12,12 16,14" />
            </svg>
            <span className={styles.metaLabel}>更新:</span>
            <span className={styles.metaValue}>
              {formatDate(project.lastUpdated)}
            </span>
          </div>
        </div>
      </div>

      {/* 加载状态覆盖层 */}
      {loading && (
        <div className={styles.loadingOverlay} data-testid="loading-overlay">
          <svg
            className={styles.loadingSpinner}
            data-testid="loading-spinner"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              strokeOpacity="0.3"
            />
            <path
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              fill="currentColor"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

export default ProjectCard;
