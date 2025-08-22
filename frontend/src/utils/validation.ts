/**
 * 表单验证工具
 * 提供通用的表单字段验证逻辑
 */

export interface ValidationRule {
  /** 验证规则名称 */
  name: string;
  /** 验证函数 */
  validate: (value: unknown, context?: unknown) => string | undefined;
  /** 是否为必填项 */
  required?: boolean;
}

export interface ValidationResult {
  /** 是否验证通过 */
  isValid: boolean;
  /** 错误信息 */
  error?: string;
}

export interface FormValidationResult {
  /** 是否验证通过 */
  isValid: boolean;
  /** 字段错误信息 */
  errors: Record<string, string>;
}

/**
 * 通用验证规则
 */
export const ValidationRules = {
  /** 必填项验证 */
  required: (message = '此字段不能为空'): ValidationRule => ({
    name: 'required',
    validate: (value: unknown) => {
      if (value === null || value === undefined || value === '') {
        return message;
      }
      if (typeof value === 'string' && !value.trim()) {
        return message;
      }
      return undefined;
    },
    required: true,
  }),

  /** 最小长度验证 */
  minLength: (min: number, message?: string): ValidationRule => ({
    name: 'minLength',
    validate: (value: string) => {
      if (typeof value !== 'string') return undefined;
      if (value.length < min) {
        return message || `至少需要 ${min} 个字符`;
      }
      return undefined;
    },
  }),

  /** 最大长度验证 */
  maxLength: (max: number, message?: string): ValidationRule => ({
    name: 'maxLength',
    validate: (value: string) => {
      if (typeof value !== 'string') return undefined;
      if (value.length > max) {
        return message || `不能超过 ${max} 个字符`;
      }
      return undefined;
    },
  }),

  /** 正则表达式验证 */
  pattern: (regex: RegExp, message: string): ValidationRule => ({
    name: 'pattern',
    validate: (value: string) => {
      if (typeof value !== 'string') return undefined;
      if (!regex.test(value)) {
        return message;
      }
      return undefined;
    },
  }),

  /** 枚举值验证 */
  oneOf: (values: unknown[], message?: string): ValidationRule => ({
    name: 'oneOf',
    validate: (value: unknown) => {
      if (!values.includes(value)) {
        return message || `请选择有效的选项`;
      }
      return undefined;
    },
  }),

  /** 自定义验证 */
  custom: (
    validator: (value: unknown, context?: unknown) => string | undefined,
    name = 'custom'
  ): ValidationRule => ({
    name,
    validate: validator,
  }),
};

/**
 * 项目相关的验证规则
 */
export const ProjectValidationRules = {
  /** 项目名称验证 */
  projectName: [
    ValidationRules.required('项目名称不能为空'),
    ValidationRules.minLength(2, '项目名称至少需要 2 个字符'),
    ValidationRules.maxLength(50, '项目名称不能超过 50 个字符'),
    ValidationRules.pattern(
      /^[a-zA-Z0-9\u4e00-\u9fa5_-\s]+$/,
      '项目名称只能包含字母、数字、中文、下划线、连字符和空格'
    ),
  ],

  /** 项目描述验证 */
  projectDescription: [
    ValidationRules.maxLength(200, '项目描述不能超过 200 个字符'),
  ],

  /** 项目类型验证 */
  projectType: [
    ValidationRules.required('请选择项目类型'),
    ValidationRules.oneOf(
      ['web', 'mobile', 'desktop', 'api'],
      '请选择有效的项目类型'
    ),
  ],

  /** 项目模板验证 */
  projectTemplate: [ValidationRules.required('请选择项目模板')],
};

/**
 * 验证单个字段
 */
export function validateField(
  value: unknown,
  rules: ValidationRule[],
  context?: unknown
): ValidationResult {
  for (const rule of rules) {
    const error = rule.validate(value, context);
    if (error) {
      return {
        isValid: false,
        error,
      };
    }
  }

  return {
    isValid: true,
  };
}

/**
 * 验证表单对象
 */
export function validateForm<T extends Record<string, unknown>>(
  data: T,
  schema: Record<keyof T, ValidationRule[]>,
  context?: unknown
): FormValidationResult {
  const errors: Record<string, string> = {};
  let isValid = true;

  for (const [field, rules] of Object.entries(schema)) {
    const result = validateField(data[field], rules, context);
    if (!result.isValid && result.error) {
      errors[field] = result.error;
      isValid = false;
    }
  }

  return {
    isValid,
    errors,
  };
}

/**
 * 创建验证器类
 */
export class FormValidator<T extends Record<string, unknown>> {
  private schema: Record<keyof T, ValidationRule[]>;
  private context?: unknown;

  constructor(schema: Record<keyof T, ValidationRule[]>, context?: unknown) {
    this.schema = schema;
    this.context = context;
  }

  /**
   * 验证单个字段
   */
  validateField(field: keyof T, value: unknown): ValidationResult {
    const rules = this.schema[field];
    if (!rules) {
      return { isValid: true };
    }
    return validateField(value, rules, this.context);
  }

  /**
   * 验证整个表单
   */
  validateForm(data: T): FormValidationResult {
    return validateForm(data, this.schema, this.context);
  }

  /**
   * 更新上下文
   */
  updateContext(context: unknown): void {
    this.context = context;
  }

  /**
   * 获取字段的验证规则
   */
  getFieldRules(field: keyof T): ValidationRule[] {
    return this.schema[field] || [];
  }

  /**
   * 检查字段是否为必填项
   */
  isFieldRequired(field: keyof T): boolean {
    const rules = this.schema[field] || [];
    return rules.some((rule) => rule.required);
  }
}

/**
 * 创建项目表单验证器
 */
export function createProjectFormValidator() {
  return new FormValidator({
    name: ProjectValidationRules.projectName,
    description: ProjectValidationRules.projectDescription,
    type: ProjectValidationRules.projectType,
    template: ProjectValidationRules.projectTemplate,
  });
}

/**
 * 验证项目数据（兼容现有代码）
 */
export function validateProjectData(projectData: {
  name: string;
  description: string;
  type: string;
  template: string;
}): void {
  const validator = createProjectFormValidator();
  const result = validator.validateForm(projectData);

  if (!result.isValid) {
    const firstError = Object.values(result.errors)[0];
    throw new Error(firstError);
  }
}

/**
 * 常用的验证工具函数
 */
export const ValidationUtils = {
  /** 检查是否为空值 */
  isEmpty: (value: unknown): boolean => {
    return (
      value === null ||
      value === undefined ||
      value === '' ||
      (typeof value === 'string' && !value.trim())
    );
  },

  /** 检查是否为有效的邮箱 */
  isEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /** 检查是否为有效的URL */
  isUrl: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /** 检查是否为数字 */
  isNumber: (value: unknown): boolean => {
    if (value === '' || value === null || value === undefined) {
      return false;
    }
    return !isNaN(Number(value)) && isFinite(Number(value));
  },

  /** 检查是否为整数 */
  isInteger: (value: unknown): boolean => {
    return Number.isInteger(Number(value));
  },

  /** 检查是否在指定范围内 */
  isInRange: (value: number, min: number, max: number): boolean => {
    return value >= min && value <= max;
  },
};
