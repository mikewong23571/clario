/**
 * 项目数据获取相关的React Hooks
 * 使用TanStack Query进行数据管理
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Project, CreateProjectRequest, ProjectFilter } from '../types/project';
import { useMemo } from 'react';

/**
 * Query Keys 常量
 */
export const QUERY_KEYS = {
  PROJECTS: ['projects'] as const,
  PROJECT: (id: string) => ['projects', id] as const,
  PROJECT_STATS: (id: string) => ['projects', id, 'stats'] as const,
} as const;

/**
 * 获取项目列表的Hook
 */
export function useProjects() {
  return useQuery({
    queryKey: QUERY_KEYS.PROJECTS,
    queryFn: api.getProjects,
    staleTime: 5 * 60 * 1000, // 5分钟内数据被认为是新鲜的
    gcTime: 10 * 60 * 1000, // 10分钟后清理缓存
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * 获取单个项目详情的Hook
 */
export function useProject(projectId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.PROJECT(projectId),
    queryFn: () => api.getProject(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
  });
}

/**
 * 获取项目统计信息的Hook
 */
export function useProjectStats(projectId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.PROJECT_STATS(projectId),
    queryFn: () => api.getProjectStats(projectId),
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000, // 统计信息2分钟内新鲜
    gcTime: 5 * 60 * 1000,
    retry: 2,
  });
}

/**
 * 创建项目的Mutation Hook
 */
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateProjectRequest) => api.createProject(request),
    onSuccess: (data, variables) => {
      // 更新项目列表缓存
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECTS });

      // 预填充新项目的详情缓存
      queryClient.setQueryData(QUERY_KEYS.PROJECT(variables.project_id), data);
    },
    onError: (error) => {
      console.error('创建项目失败:', error);
    },
  });
}

/**
 * 更新项目的Mutation Hook
 */
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      spec,
      changeDescription,
    }: {
      projectId: string;
      spec: Record<string, unknown>;
      changeDescription?: string;
    }) => api.updateProject(projectId, spec, changeDescription),
    onSuccess: (data, variables) => {
      // 更新项目详情缓存
      queryClient.setQueryData(QUERY_KEYS.PROJECT(variables.projectId), data);

      // 更新项目列表缓存
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECTS });

      // 更新统计信息缓存
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PROJECT_STATS(variables.projectId),
      });
    },
    onError: (error) => {
      console.error('更新项目失败:', error);
    },
  });
}

/**
 * 删除项目的Mutation Hook
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => api.deleteProject(projectId),
    onSuccess: (_, projectId) => {
      // 从项目列表缓存中移除
      queryClient.setQueryData(
        QUERY_KEYS.PROJECTS,
        (oldData: Project[] | undefined) => {
          if (!oldData) return [];
          return oldData.filter((project) => project.id !== projectId);
        }
      );

      // 移除项目详情缓存
      queryClient.removeQueries({ queryKey: QUERY_KEYS.PROJECT(projectId) });

      // 移除项目统计缓存
      queryClient.removeQueries({
        queryKey: QUERY_KEYS.PROJECT_STATS(projectId),
      });
    },
    onError: (error) => {
      console.error('删除项目失败:', error);
    },
  });
}

/**
 * 项目搜索和过滤Hook
 */
export function useFilteredProjects(filter: ProjectFilter = {}) {
  const { data: projects = [], ...queryResult } = useProjects();

  const filteredProjects = useMemo(() => {
    let result = [...projects];

    // 搜索过滤
    if (filter.search) {
      const searchTerm = filter.search.toLowerCase();
      result = result.filter(
        (project) =>
          project.name.toLowerCase().includes(searchTerm) ||
          project.id.toLowerCase().includes(searchTerm) ||
          (project.status && project.status.toLowerCase().includes(searchTerm))
      );
    }

    // 状态过滤
    if (filter.status) {
      result = result.filter((project) => project.status === filter.status);
    }

    // 排序
    if (filter.sortBy) {
      result.sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        switch (filter.sortBy) {
          case 'name':
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case 'lastUpdated':
            aValue = new Date(a.lastUpdated).getTime();
            bValue = new Date(b.lastUpdated).getTime();
            break;
          case 'status':
            aValue = a.status || '';
            bValue = b.status || '';
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return filter.sortOrder === 'desc' ? 1 : -1;
        if (aValue > bValue) return filter.sortOrder === 'desc' ? -1 : 1;
        return 0;
      });
    }

    return result;
  }, [projects, filter]);

  return {
    ...queryResult,
    data: filteredProjects,
    totalCount: projects.length,
    filteredCount: filteredProjects.length,
  };
}

/**
 * 预加载项目详情的Hook
 */
export function usePrefetchProject() {
  const queryClient = useQueryClient();

  return (projectId: string) => {
    queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.PROJECT(projectId),
      queryFn: () => api.getProject(projectId),
      staleTime: 5 * 60 * 1000,
    });
  };
}

/**
 * 系统健康检查Hook
 */
export function useHealthCheck() {
  return useQuery({
    queryKey: ['health'],
    queryFn: api.healthCheck,
    staleTime: 30 * 1000, // 30秒
    gcTime: 60 * 1000, // 1分钟
    retry: 1,
    refetchInterval: 60 * 1000, // 每分钟检查一次
  });
}
