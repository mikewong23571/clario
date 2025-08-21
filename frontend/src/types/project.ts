/**
 * 项目相关的TypeScript类型定义
 */

/**
 * 项目摘要信息
 * 对应后端API的ProjectSummary模型
 */
export interface Project {
  /** 项目唯一标识符 */
  id: string;
  /** 项目名称 */
  name: string;
  /** 最后更新时间 (ISO字符串) */
  lastUpdated: string;
  /** 规格版本 */
  specVersion: string;
  /** 项目状态 */
  status: string | null;
}

/**
 * 创建项目请求数据
 */
export interface CreateProjectRequest {
  /** 项目ID */
  project_id: string;
  /** 项目规格数据 */
  spec: Record<string, unknown>;
}

/**
 * 项目详细规格
 */
export interface ProjectSpec {
  /** 最后更新时间 */
  lastUpdated: string;
  /** 规格版本 */
  specVersion: string;
  /** 核心理念 */
  coreIdea: {
    /** 问题陈述 */
    problemStatement: string;
    /** 目标用户 */
    targetAudience: string;
    /** 核心价值 */
    coreValue: string;
  };
  /** 项目范围 */
  scope: {
    /** 范围内功能 */
    inScope: string[];
    /** 范围外功能 */
    outOfScope: string[];
  };
  /** 其他规格数据 */
  [key: string]: unknown;
}

/**
 * API响应包装类型
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

/**
 * API错误响应
 */
export interface ApiError {
  detail: string;
  status?: number;
}

/**
 * 项目搜索过滤器
 */
export interface ProjectFilter {
  /** 搜索关键词 */
  search?: string;
  /** 状态过滤 */
  status?: string;
  /** 排序方式 */
  sortBy?: 'name' | 'lastUpdated' | 'status';
  /** 排序方向 */
  sortOrder?: 'asc' | 'desc';
}
