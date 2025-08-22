/**
 * useCreateProject Hook
 * 处理项目创建的业务逻辑和状态管理
 */

import { useState, useCallback } from 'react';
import { ProjectFormData } from '../components/CreateProjectModal';
import { validateProjectData } from '../utils/validation';

export interface CreateProjectState {
  /** 是否正在创建项目 */
  loading: boolean;
  /** 创建过程中的错误信息 */
  error: string | null;
  /** 创建成功的项目信息 */
  createdProject: CreatedProject | null;
}

export interface CreatedProject {
  /** 项目ID */
  id: string;
  /** 项目名称 */
  name: string;
  /** 项目描述 */
  description: string;
  /** 项目类型 */
  type: string;
  /** 项目模板 */
  template: string;
  /** 创建时间 */
  createdAt: string;
  /** 项目路径 */
  path?: string;
  /** 项目状态 */
  status: 'creating' | 'ready' | 'error';
}

export interface UseCreateProjectReturn {
  /** 当前状态 */
  state: CreateProjectState;
  /** 创建项目函数 */
  createProject: (projectData: ProjectFormData) => Promise<void>;
  /** 重置状态函数 */
  reset: () => void;
  /** 清除错误函数 */
  clearError: () => void;
}

/**
 * 模拟API调用 - 在实际项目中应该替换为真实的API调用
 */
const mockCreateProjectAPI = async (projectData: ProjectFormData): Promise<CreatedProject> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));
  
  // 模拟随机失败（10%概率）
  if (Math.random() < 0.1) {
    throw new Error('网络错误：无法连接到服务器');
  }
  
  // 模拟项目名称冲突（5%概率）
  if (Math.random() < 0.05) {
    throw new Error(`项目名称 "${projectData.name}" 已存在，请选择其他名称`);
  }
  
  // 生成模拟的项目数据
  const projectId = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const createdProject: CreatedProject = {
    id: projectId,
    name: projectData.name,
    description: projectData.description,
    type: projectData.type,
    template: projectData.template,
    createdAt: new Date().toISOString(),
    path: `/projects/${projectData.name.toLowerCase().replace(/\s+/g, '-')}`,
    status: 'ready',
  };
  
  return createdProject;
};

/**
 * 项目创建 Hook
 */
export const useCreateProject = (): UseCreateProjectReturn => {
  const [state, setState] = useState<CreateProjectState>({
    loading: false,
    error: null,
    createdProject: null,
  });

  /**
   * 创建项目
   */
  const createProject = useCallback(async (projectData: ProjectFormData) => {
    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      // 验证项目数据
      validateProjectData(projectData);
      
      // 调用API创建项目
      const createdProject = await mockCreateProjectAPI(projectData);
      
      setState(prev => ({
        ...prev,
        loading: false,
        createdProject,
        error: null,
      }));
      
      // 可以在这里添加成功回调，比如显示通知、跳转页面等
      console.log('项目创建成功:', createdProject);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '创建项目时发生未知错误';
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      
      // 记录错误日志
      console.error('创建项目失败:', error);
    }
  }, []);

  /**
   * 重置状态
   */
  const reset = useCallback(() => {
    setState({
      loading: false,
      error: null,
      createdProject: null,
    });
  }, []);

  /**
   * 清除错误
   */
  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  return {
    state,
    createProject,
    reset,
    clearError,
  };
};

// validateProjectData 函数现在从 utils/validation 导入

/**
 * 项目创建状态枚举
 */
export const PROJECT_STATUS = {
  CREATING: 'creating' as const,
  READY: 'ready' as const,
  ERROR: 'error' as const,
} as const;

export type ProjectStatus = typeof PROJECT_STATUS[keyof typeof PROJECT_STATUS];