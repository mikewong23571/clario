/**
 * 设计系统验证脚本
 * 在构建过程中自动验证设计系统的使用情况
 */

import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

const VALIDATION_RULES = {
  // 禁用的硬编码样式
  FORBIDDEN_PATTERNS: [
    {
      pattern: /color:\s*#[0-9a-fA-F]{3,8}(?![^{]*var\()/g,
      message: '禁止使用硬编码颜色值，请使用设计令牌',
      type: 'error'
    },
    {
      pattern: /background-color:\s*#[0-9a-fA-F]{3,8}(?![^{]*var\()/g,
      message: '禁止使用硬编码背景色，请使用设计令牌',
      type: 'error'
    },
    {
      pattern: /border-color:\s*#[0-9a-fA-F]{3,8}(?![^{]*var\()/g,
      message: '禁止使用硬编码边框色，请使用设计令牌',
      type: 'error'
    },
    {
      pattern: /padding:\s*\d+px(?!\s*var\()/g,
      message: '硬编码内边距，建议使用间距令牌',
      type: 'warning'
    },
    {
      pattern: /margin:\s*\d+px(?!\s*var\()/g,
      message: '硬编码外边距，建议使用间距令牌',
      type: 'warning'
    },
    {
      pattern: /font-size:\s*\d+px(?!\s*var\()/g,
      message: '硬编码字体大小，建议使用字体令牌',
      type: 'warning'
    },
    {
      pattern: /border-radius:\s*\d+px(?!\s*var\()/g,
      message: '硬编码圆角，建议使用圆角令牌',
      type: 'warning'
    }
  ],

  // 必需的设计令牌使用
  REQUIRED_TOKEN_USAGE: [
    {
      pattern: /var\(--color-/g,
      message: '正确使用颜色令牌',
      type: 'success'
    },
    {
      pattern: /var\(--space-/g,
      message: '正确使用间距令牌',
      type: 'success'
    },
    {
      pattern: /var\(--font-/g,
      message: '正确使用字体令牌',
      type: 'success'
    }
  ]
};

class DesignSystemValidator {
  constructor() {
    this.results = {
      errors: [],
      warnings: [],
      successes: [],
      summary: {
        totalFiles: 0,
        errorCount: 0,
        warningCount: 0,
        successCount: 0
      }
    };
  }

  /**
   * 验证所有CSS和TypeScript文件
   */
  async validateFiles() {
    console.log('🎨 开始设计系统验证...\n');

    // 获取所有需要验证的文件
    const cssFiles = await glob('src/**/*.{css,scss,module.css}');
    const tsxFiles = await glob('src/**/*.{tsx,ts}');
    
    const allFiles = [...cssFiles, ...tsxFiles];
    this.results.summary.totalFiles = allFiles.length;

    for (const filePath of allFiles) {
      await this.validateFile(filePath);
    }

    this.generateReport();
    return this.results.summary.errorCount === 0;
  }

  /**
   * 验证单个文件
   */
  async validateFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const fileExtension = path.extname(filePath);
      
      // 根据文件类型选择验证规则
      if (fileExtension.includes('.css') || fileExtension.includes('.scss')) {
        this.validateCSSFile(filePath, content);
      } else if (fileExtension.includes('.tsx') || fileExtension.includes('.ts')) {
        this.validateTSXFile(filePath, content);
      }
    } catch (error) {
      this.addResult('error', filePath, 0, `文件读取失败: ${error.message}`);
    }
  }

  /**
   * 验证CSS文件
   */
  validateCSSFile(filePath, content) {
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // 检查禁用模式
      VALIDATION_RULES.FORBIDDEN_PATTERNS.forEach(rule => {
        const matches = line.matchAll(rule.pattern);
        for (const match of matches) {
          this.addResult(rule.type, filePath, index + 1, rule.message, match[0]);
        }
      });

      // 检查正确的令牌使用
      VALIDATION_RULES.REQUIRED_TOKEN_USAGE.forEach(rule => {
        const matches = line.matchAll(rule.pattern);
        for (const match of matches) {
          this.addResult('success', filePath, index + 1, rule.message, match[0]);
        }
      });
    });
  }

  /**
   * 验证TSX文件中的内联样式
   */
  validateTSXFile(filePath, content) {
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // 检查内联样式
      const stylePattern = /style=\{\{([^}]+)\}\}/g;
      const matches = line.matchAll(stylePattern);
      
      for (const match of matches) {
        const styleContent = match[1];
        
        // 检查是否包含硬编码值
        VALIDATION_RULES.FORBIDDEN_PATTERNS.forEach(rule => {
          if (rule.pattern.test(styleContent)) {
            this.addResult('error', filePath, index + 1, 
              `内联样式中${rule.message}`, styleContent);
          }
        });
      }

      // 检查 className 的使用
      if (line.includes('className=') && !line.includes('styles.')) {
        if (line.includes('className="') || line.includes("className='")) {
          this.addResult('warning', filePath, index + 1, 
            '使用了字符串className，建议使用CSS Modules', line.trim());
        }
      }
    });
  }

  /**
   * 添加验证结果
   */
  addResult(type, filePath, lineNumber, message, code = '') {
    const result = {
      file: filePath,
      line: lineNumber,
      message,
      code: code.trim()
    };

    switch (type) {
      case 'error':
        this.results.errors.push(result);
        this.results.summary.errorCount++;
        break;
      case 'warning':
        this.results.warnings.push(result);
        this.results.summary.warningCount++;
        break;
      case 'success':
        this.results.successes.push(result);
        this.results.summary.successCount++;
        break;
    }
  }

  /**
   * 生成验证报告
   */
  generateReport() {
    console.log('📊 设计系统验证报告');
    console.log('========================');
    console.log(`验证文件数: ${this.results.summary.totalFiles}`);
    console.log(`错误: ${this.results.summary.errorCount}`);
    console.log(`警告: ${this.results.summary.warningCount}`);
    console.log(`正确使用: ${this.results.summary.successCount}\n`);

    // 显示错误
    if (this.results.errors.length > 0) {
      console.log('❌ 错误 (必须修复):');
      this.results.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error.file}:${error.line}`);
        console.log(`     ${error.message}`);
        if (error.code) {
          console.log(`     代码: ${error.code}`);
        }
        console.log('');
      });
    }

    // 显示警告
    if (this.results.warnings.length > 0) {
      console.log('⚠️  警告 (建议修复):');
      this.results.warnings.slice(0, 10).forEach((warning, index) => {
        console.log(`  ${index + 1}. ${warning.file}:${warning.line}`);
        console.log(`     ${warning.message}`);
        if (warning.code) {
          console.log(`     代码: ${warning.code}`);
        }
        console.log('');
      });
      
      if (this.results.warnings.length > 10) {
        console.log(`     ... 还有 ${this.results.warnings.length - 10} 个警告\n`);
      }
    }

    // 验证结果
    if (this.results.summary.errorCount === 0) {
      console.log('✅ 设计系统验证通过！');
    } else {
      console.log('❌ 设计系统验证失败，请修复上述错误。');
    }

    // 生成JSON报告供CI使用
    this.generateJSONReport();
  }

  /**
   * 生成JSON格式的报告
   */
  async generateJSONReport() {
    const reportPath = 'dist/design-system-validation-report.json';
    
    try {
      // 确保输出目录存在
      await fs.mkdir('dist', { recursive: true });
      
      const report = {
        timestamp: new Date().toISOString(),
        summary: this.results.summary,
        errors: this.results.errors,
        warnings: this.results.warnings,
        passed: this.results.summary.errorCount === 0
      };
      
      await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
      console.log(`📄 详细报告已保存至: ${reportPath}`);
    } catch (error) {
      console.warn(`无法生成JSON报告: ${error.message}`);
    }
  }
}

// 执行验证
async function main() {
  const validator = new DesignSystemValidator();
  const passed = await validator.validateFiles();
  
  // 在CI环境中，验证失败时退出码非零
  if (!passed && process.env.CI) {
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('验证过程出错:', error);
    process.exit(1);
  });
}

export default DesignSystemValidator;