/**
 * 设计系统验证工具
 *
 * 用于验证组件是否符合设计系统规范
 * 检测硬编码值、不一致的样式等问题
 */

interface ValidationError {
  type: 'error' | 'warning';
  message: string;
  element?: HTMLElement;
  property?: string;
  value?: string;
  suggestion?: string;
}

interface ValidationReport {
  passed: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  score: number; // 0-100 的分数
}

class DesignValidator {
  private designTokens: Map<string, string> = new Map();
  private validationRules: ValidationRule[] = [];

  constructor() {
    this.loadDesignTokens();
    this.setupValidationRules();
  }

  /**
   * 加载设计令牌
   */
  private loadDesignTokens() {
    const computedStyle = getComputedStyle(document.documentElement);

    // 提取所有 CSS 自定义属性
    const cssText = computedStyle.cssText;
    const tokenRegex = /--([\w-]+):\s*([^;]+)/g;
    let match;

    while ((match = tokenRegex.exec(cssText)) !== null) {
      this.designTokens.set(`--${match[1]}`, match[2].trim());
    }

    // 如果无法通过 cssText 获取，尝试直接获取
    if (this.designTokens.size === 0) {
      this.loadTokensDirectly();
    }
  }

  /**
   * 直接加载常用设计令牌
   */
  private loadTokensDirectly() {
    const tokens = [
      // 颜色
      '--color-primary-500',
      '--color-primary-600',
      '--color-primary-50',
      '--color-text-primary',
      '--color-text-secondary',
      '--color-text-inverse',
      '--color-bg-primary',
      '--color-bg-secondary',
      '--color-bg-tertiary',
      '--color-border-primary',
      '--color-border-secondary',
      '--color-border-focus',

      // 间距
      '--space-1',
      '--space-2',
      '--space-3',
      '--space-4',
      '--space-6',
      '--space-8',
      '--space-12',
      '--space-16',
      '--space-20',
      '--space-24',

      // 字体
      '--font-size-xs',
      '--font-size-sm',
      '--font-size-base',
      '--font-size-lg',
      '--font-size-xl',
      '--font-size-2xl',
      '--font-weight-normal',
      '--font-weight-medium',
      '--font-weight-semibold',
      '--font-weight-bold',

      // 圆角
      '--radius-sm',
      '--radius-base',
      '--radius-md',
      '--radius-lg',
      '--radius-xl',
      '--radius-full',

      // 阴影
      '--shadow-sm',
      '--shadow-base',
      '--shadow-md',
      '--shadow-lg',
      '--shadow-xl',
      '--shadow-focus',
      '--shadow-none',

      // 动画
      '--duration-fast',
      '--duration-base',
      '--duration-slow',
      '--ease-out',
      '--ease-in-out',
    ];

    const computedStyle = getComputedStyle(document.documentElement);
    tokens.forEach((token) => {
      const value = computedStyle.getPropertyValue(token);
      if (value) {
        this.designTokens.set(token, value.trim());
      }
    });
  }

  /**
   * 设置验证规则
   */
  private setupValidationRules() {
    this.validationRules = [
      // 检查硬编码颜色
      {
        name: 'no-hardcoded-colors',
        type: 'error',
        check: (element: HTMLElement) => {
          const style = getComputedStyle(element);
          const errors: ValidationError[] = [];

          // 检查常见的硬编码颜色值
          const colorProperties = ['color', 'backgroundColor', 'borderColor'];
          const hardcodedPatterns = [
            /^#[0-9a-fA-F]{3,8}$/, // 十六进制颜色
            /^rgb\(/, // RGB 颜色
            /^rgba\(/, // RGBA 颜色
            /^hsl\(/, // HSL 颜色
            /^hsla\(/, // HSLA 颜色
          ];

          colorProperties.forEach((prop) => {
            const value = style.getPropertyValue(prop);
            if (
              value &&
              hardcodedPatterns.some((pattern) => pattern.test(value))
            ) {
              // 检查是否有对应的设计令牌
              if (!this.hasMatchingToken(value)) {
                errors.push({
                  type: 'error',
                  message: `硬编码颜色值: ${prop}`,
                  element,
                  property: prop,
                  value,
                  suggestion: '使用设计系统的颜色令牌',
                });
              }
            }
          });

          return errors;
        },
      },

      // 检查硬编码间距
      {
        name: 'no-hardcoded-spacing',
        type: 'warning',
        check: (element: HTMLElement) => {
          const style = getComputedStyle(element);
          const errors: ValidationError[] = [];

          const spacingProperties = [
            'margin',
            'padding',
            'gap',
            'top',
            'left',
            'right',
            'bottom',
          ];
          const spacingPattern = /^\d+px$/;

          spacingProperties.forEach((prop) => {
            const value = style.getPropertyValue(prop);
            if (value && spacingPattern.test(value)) {
              const numValue = parseInt(value);
              // 检查是否符合 4px 网格
              if (numValue % 4 !== 0 && numValue > 0) {
                errors.push({
                  type: 'warning',
                  message: `间距值不符合 4px 网格: ${prop}`,
                  element,
                  property: prop,
                  value,
                  suggestion: '使用基于 4px 网格的间距令牌',
                });
              }
            }
          });

          return errors;
        },
      },

      // 检查硬编码字体大小
      {
        name: 'no-hardcoded-font-sizes',
        type: 'warning',
        check: (element: HTMLElement) => {
          const style = getComputedStyle(element);
          const fontSize = style.getPropertyValue('font-size');

          if (fontSize && /^\d+px$/.test(fontSize)) {
            const numValue = parseInt(fontSize);
            const standardSizes = [12, 14, 16, 18, 20, 24, 30, 36, 48, 60]; // 对应设计令牌

            if (!standardSizes.includes(numValue)) {
              return [
                {
                  type: 'warning',
                  message: `非标准字体大小: ${fontSize}`,
                  element,
                  property: 'font-size',
                  value: fontSize,
                  suggestion: '使用设计系统的字体大小令牌',
                },
              ];
            }
          }

          return [];
        },
      },

      // 检查边框圆角
      {
        name: 'validate-border-radius',
        type: 'warning',
        check: (element: HTMLElement) => {
          const style = getComputedStyle(element);
          const borderRadius = style.getPropertyValue('border-radius');

          if (borderRadius && /^\d+px$/.test(borderRadius)) {
            const numValue = parseInt(borderRadius);
            const standardRadii = [0, 2, 4, 6, 8, 12, 16, 24, 32]; // 对应设计令牌

            if (
              !standardRadii.includes(numValue) &&
              borderRadius !== '9999px'
            ) {
              return [
                {
                  type: 'warning',
                  message: `非标准圆角值: ${borderRadius}`,
                  element,
                  property: 'border-radius',
                  value: borderRadius,
                  suggestion: '使用设计系统的圆角令牌',
                },
              ];
            }
          }

          return [];
        },
      },

      // 检查 z-index 值
      {
        name: 'validate-z-index',
        type: 'warning',
        check: (element: HTMLElement) => {
          const style = getComputedStyle(element);
          const zIndex = style.getPropertyValue('z-index');

          if (zIndex && zIndex !== 'auto') {
            const numValue = parseInt(zIndex);
            // 建议的 z-index 层级
            const standardLevels = [1, 10, 100, 1000, 9999];

            if (!standardLevels.includes(numValue)) {
              return [
                {
                  type: 'warning',
                  message: `非标准 z-index 值: ${zIndex}`,
                  element,
                  property: 'z-index',
                  value: zIndex,
                  suggestion: '使用标准的层级值 (1, 10, 100, 1000, 9999)',
                },
              ];
            }
          }

          return [];
        },
      },
    ];
  }

  /**
   * 检查是否有匹配的设计令牌
   */
  private hasMatchingToken(value: string): boolean {
    // 简化的匹配逻辑，实际应用中可以更复杂
    return Array.from(this.designTokens.values()).includes(value);
  }

  /**
   * 验证单个元素
   */
  public validateElement(element: HTMLElement): ValidationError[] {
    const errors: ValidationError[] = [];

    this.validationRules.forEach((rule) => {
      try {
        const ruleErrors = rule.check(element);
        errors.push(...ruleErrors);
      } catch (error) {
        console.warn(`验证规则 ${rule.name} 执行失败:`, error);
      }
    });

    return errors;
  }

  /**
   * 验证整个页面
   */
  public validatePage(): ValidationReport {
    const allElements = document.querySelectorAll('*') as NodeList;
    const allErrors: ValidationError[] = [];

    allElements.forEach((element) => {
      const errors = this.validateElement(element);
      allErrors.push(...errors);
    });

    const errors = allErrors.filter((error) => error.type === 'error');
    const warnings = allErrors.filter((error) => error.type === 'warning');

    // 计算分数
    const score = Math.max(0, 100 - (errors.length * 10 + warnings.length * 2));

    return {
      passed: errors.length === 0,
      errors,
      warnings,
      score,
    };
  }

  /**
   * 验证特定选择器的元素
   */
  public validateSelector(selector: string): ValidationReport {
    const elements = document.querySelectorAll(selector) as NodeList;
    const allErrors: ValidationError[] = [];

    elements.forEach((element) => {
      const errors = this.validateElement(element);
      allErrors.push(...errors);
    });

    const errors = allErrors.filter((error) => error.type === 'error');
    const warnings = allErrors.filter((error) => error.type === 'warning');

    return {
      passed: errors.length === 0,
      errors,
      warnings,
      score: Math.max(0, 100 - (errors.length * 10 + warnings.length * 2)),
    };
  }

  /**
   * 生成验证报告
   */
  public generateReport(report: ValidationReport): string {
    let output = `设计系统验证报告\n`;
    output += `===============\n`;
    output += `总体评分: ${report.score}/100\n`;
    output += `状态: ${report.passed ? '✅ 通过' : '❌ 未通过'}\n\n`;

    if (report.errors.length > 0) {
      output += `错误 (${report.errors.length}):\n`;
      report.errors.forEach((error, index) => {
        output += `${index + 1}. ${error.message}\n`;
        if (error.property && error.value) {
          output += `   属性: ${error.property}, 值: ${error.value}\n`;
        }
        if (error.suggestion) {
          output += `   建议: ${error.suggestion}\n`;
        }
        output += '\n';
      });
    }

    if (report.warnings.length > 0) {
      output += `警告 (${report.warnings.length}):\n`;
      report.warnings.forEach((warning, index) => {
        output += `${index + 1}. ${warning.message}\n`;
        if (warning.property && warning.value) {
          output += `   属性: ${warning.property}, 值: ${warning.value}\n`;
        }
        if (warning.suggestion) {
          output += `   建议: ${warning.suggestion}\n`;
        }
        output += '\n';
      });
    }

    return output;
  }

  /**
   * 实时验证模式
   */
  public enableLiveValidation() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement;
              const errors = this.validateElement(element);

              if (errors.length > 0) {
                this.highlightValidationErrors(element, errors);
              }
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * 高亮验证错误
   */
  private highlightValidationErrors(
    element: HTMLElement,
    errors: ValidationError[]
  ) {
    // 在开发环境下添加视觉提示
    if (import.meta.env.DEV) {
      element.style.outline = '2px dashed red';
      element.title = errors.map((e) => e.message).join(', ');

      // 添加控制台警告
      console.group(`🎨 设计系统验证错误`);
      console.warn('元素:', element);
      errors.forEach((error) => {
        console.warn(`${error.type.toUpperCase()}: ${error.message}`);
        if (error.suggestion) {
          console.info(`建议: ${error.suggestion}`);
        }
      });
      console.groupEnd();
    }
  }
}

interface ValidationRule {
  name: string;
  type: 'error' | 'warning';
  check: (element: HTMLElement) => ValidationError[];
}

// 创建全局验证器实例
export const designValidator = new DesignValidator();

// 开发环境下自动启用验证
if (import.meta.env.DEV) {
  // DOM 加载完成后启用
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      designValidator.enableLiveValidation();
    });
  } else {
    designValidator.enableLiveValidation();
  }
}

export default DesignValidator;
