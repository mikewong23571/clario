/**
 * CreateProjectModal 组件
 * 项目创建对话框
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Modal, Button, Input } from '../ui';
import { clsx } from 'clsx';
import { createProjectFormValidator } from '../../utils/validation';
import styles from './CreateProjectModal.module.css';

export interface CreateProjectModalProps {
  /** 是否显示模态框 */
  open: boolean;
  /** 关闭模态框回调 */
  onClose: () => void;
  /** 创建项目回调 */
  onCreateProject: (projectData: ProjectFormData) => Promise<void>;
  /** 是否正在创建项目 */
  loading?: boolean;
}

export interface ProjectFormData {
  /** 项目名称 */
  name: string;
  /** 项目描述 */
  description: string;
  /** 项目类型 */
  type: 'web' | 'mobile' | 'desktop' | 'api';
  /** 项目模板 */
  template: string;
}

interface FormErrors {
  name?: string;
  description?: string;
  type?: string;
  template?: string;
}

const PROJECT_TYPES = [
  { value: 'web', label: 'Web 应用', description: '基于浏览器的 Web 应用程序' },
  {
    value: 'mobile',
    label: '移动应用',
    description: 'iOS 和 Android 移动应用',
  },
  {
    value: 'desktop',
    label: '桌面应用',
    description: 'Windows、macOS、Linux 桌面应用',
  },
  {
    value: 'api',
    label: 'API 服务',
    description: 'RESTful API 或 GraphQL 服务',
  },
] as const;

const PROJECT_TEMPLATES = {
  web: [
    {
      value: 'react-ts',
      label: 'React + TypeScript',
      description: '现代化的 React 应用模板',
    },
    {
      value: 'vue-ts',
      label: 'Vue + TypeScript',
      description: '基于 Vue 3 的应用模板',
    },
    { value: 'next-js', label: 'Next.js', description: '全栈 React 框架' },
    {
      value: 'vite-vanilla',
      label: 'Vanilla JS',
      description: '纯 JavaScript 项目',
    },
  ],
  mobile: [
    {
      value: 'react-native',
      label: 'React Native',
      description: '跨平台移动应用',
    },
    { value: 'flutter', label: 'Flutter', description: 'Google 的跨平台框架' },
    { value: 'ionic', label: 'Ionic', description: '混合移动应用框架' },
  ],
  desktop: [
    {
      value: 'electron',
      label: 'Electron',
      description: '基于 Web 技术的桌面应用',
    },
    { value: 'tauri', label: 'Tauri', description: '轻量级的桌面应用框架' },
    { value: 'qt', label: 'Qt', description: '跨平台 C++ 框架' },
  ],
  api: [
    {
      value: 'fastapi',
      label: 'FastAPI',
      description: '现代化的 Python API 框架',
    },
    { value: 'express', label: 'Express.js', description: 'Node.js Web 框架' },
    {
      value: 'spring-boot',
      label: 'Spring Boot',
      description: 'Java 企业级框架',
    },
    { value: 'django', label: 'Django', description: 'Python Web 框架' },
  ],
};

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  open,
  onClose,
  onCreateProject,
  loading = false,
}) => {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    type: 'web',
    template: 'react-ts',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // 创建表单验证器
  const validator = createProjectFormValidator();

  // 重置表单
  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      description: '',
      type: 'web',
      template: 'react-ts',
    });
    setErrors({});
    setTouched({});
  }, []);

  // 当模态框关闭时重置表单
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open, resetForm]);

  // 验证表单字段
  const validateField = useCallback(
    (field: keyof ProjectFormData, value: string) => {
      // 对于模板字段，需要额外验证是否在当前项目类型的可用模板中
      if (field === 'template') {
        const availableTemplates =
          PROJECT_TEMPLATES[formData.type as keyof typeof PROJECT_TEMPLATES];
        if (!availableTemplates?.some((template) => template.value === value)) {
          return '请选择有效的项目模板';
        }
      }

      const result = validator.validateField(field, value);
      return result.error;
    },
    [formData.type, validator]
  );

  // 验证整个表单
  const validateForm = useCallback(() => {
    const newErrors: FormErrors = {};

    Object.keys(formData).forEach((key) => {
      const field = key as keyof ProjectFormData;
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validateField]);

  // 处理字段变化
  const handleFieldChange = useCallback(
    (field: keyof ProjectFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      // 如果字段已经被触摸过，立即验证
      if (touched[field]) {
        const error = validateField(field, value);
        setErrors((prev) => ({ ...prev, [field]: error }));
      }

      // 如果改变了项目类型，重置模板选择
      if (field === 'type') {
        const newType = value as ProjectFormData['type'];
        const availableTemplates = PROJECT_TEMPLATES[newType];
        const defaultTemplate = availableTemplates?.[0]?.value || '';
        setFormData((prev) => ({ ...prev, template: defaultTemplate }));
      }
    },
    [touched, validateField]
  );

  // 处理字段失焦
  const handleFieldBlur = useCallback(
    (field: keyof ProjectFormData) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      const error = validateField(field, formData[field]);
      setErrors((prev) => ({ ...prev, [field]: error }));
    },
    [formData, validateField]
  );

  // 处理表单提交
  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      // 标记所有字段为已触摸
      const allFields = Object.keys(formData) as (keyof ProjectFormData)[];
      setTouched(
        allFields.reduce((acc, field) => ({ ...acc, [field]: true }), {})
      );

      // 验证表单
      if (!validateForm()) {
        return;
      }

      try {
        await onCreateProject(formData);
        onClose();
      } catch (error) {
        console.error('创建项目失败:', error);
        // 这里可以添加错误处理逻辑
      }
    },
    [formData, validateForm, onCreateProject, onClose]
  );

  // 获取当前项目类型的可用模板
  const availableTemplates =
    PROJECT_TEMPLATES[formData.type as keyof typeof PROJECT_TEMPLATES] || [];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="创建新项目"
      size="medium"
      closeOnOverlayClick={!loading}
      closeOnEscape={!loading}
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* 项目名称 */}
        <Input
          label="项目名称"
          value={formData.name}
          onChange={(e) => handleFieldChange('name', e.target.value)}
          onBlur={() => handleFieldBlur('name')}
          placeholder="请输入项目名称"
          required
          maxLength={50}
          showCount
          status={errors.name ? 'error' : 'default'}
          errorMessage={errors.name}
          disabled={loading}
        />

        {/* 项目描述 */}
        <Input
          label="项目描述"
          value={formData.description}
          onChange={(e) => handleFieldChange('description', e.target.value)}
          onBlur={() => handleFieldBlur('description')}
          placeholder="请输入项目描述（可选）"
          maxLength={200}
          showCount
          status={errors.description ? 'error' : 'default'}
          errorMessage={errors.description}
          disabled={loading}
        />

        {/* 项目类型 */}
        <fieldset className={styles.fieldGroup}>
          <legend className={styles.fieldLabel}>
            项目类型 <span className={styles.required}>*</span>
          </legend>
          <div
            className={styles.typeGrid}
            role="radiogroup"
            aria-labelledby="project-type-legend"
          >
            {PROJECT_TYPES.map((type) => (
              <label
                key={type.value}
                className={clsx(styles.typeOption, {
                  [styles.typeOptionSelected]: formData.type === type.value,
                  [styles.typeOptionDisabled]: loading,
                })}
              >
                <input
                  type="radio"
                  name="projectType"
                  value={type.value}
                  checked={formData.type === type.value}
                  onChange={(e) => handleFieldChange('type', e.target.value)}
                  onBlur={() => handleFieldBlur('type')}
                  disabled={loading}
                  className={styles.typeRadio}
                  aria-describedby={`type-${type.value}-desc`}
                />
                <div className={styles.typeContent}>
                  <div className={styles.typeTitle}>{type.label}</div>
                  <div
                    id={`type-${type.value}-desc`}
                    className={styles.typeDescription}
                  >
                    {type.description}
                  </div>
                </div>
              </label>
            ))}
          </div>
          {errors.type && (
            <div className={styles.errorMessage}>{errors.type}</div>
          )}
        </fieldset>

        {/* 项目模板 */}
        <fieldset className={styles.fieldGroup}>
          <legend className={styles.fieldLabel}>
            项目模板 <span className={styles.required}>*</span>
          </legend>
          <div
            className={styles.templateGrid}
            role="radiogroup"
            aria-labelledby="project-template-legend"
          >
            {availableTemplates.map((template) => (
              <label
                key={template.value}
                className={clsx(styles.templateOption, {
                  [styles.templateOptionSelected]:
                    formData.template === template.value,
                  [styles.templateOptionDisabled]: loading,
                })}
              >
                <input
                  type="radio"
                  name="projectTemplate"
                  value={template.value}
                  checked={formData.template === template.value}
                  onChange={(e) =>
                    handleFieldChange('template', e.target.value)
                  }
                  onBlur={() => handleFieldBlur('template')}
                  disabled={loading}
                  className={styles.templateRadio}
                  aria-describedby={`template-${template.value}-desc`}
                />
                <div className={styles.templateContent}>
                  <div className={styles.templateTitle}>{template.label}</div>
                  <div
                    id={`template-${template.value}-desc`}
                    className={styles.templateDescription}
                  >
                    {template.description}
                  </div>
                </div>
              </label>
            ))}
          </div>
          {errors.template && (
            <div className={styles.errorMessage}>{errors.template}</div>
          )}
        </fieldset>

        {/* 操作按钮 */}
        <div className={styles.actions}>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={loading}
          >
            取消
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={
              loading ||
              Object.keys(errors).some((key) => errors[key as keyof FormErrors])
            }
          >
            创建项目
          </Button>
        </div>
      </form>
    </Modal>
  );
};
