/**
 * 设计系统验证环境设置脚本
 * 配置开发环境的设计系统验证和反馈循环
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DesignSystemSetup {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
  }

  /**
   * 初始化设计系统验证环境
   */
  async initializeValidationEnvironment() {
    console.log('🚀 初始化设计系统验证环境...\n');

    try {
      // 1. 创建必要的目录结构
      await this.createDirectoryStructure();

      // 2. 更新package.json脚本
      await this.updatePackageScripts();

      // 3. 配置开发环境钩子
      await this.setupDevelopmentHooks();

      // 4. 创建VSCode设置
      await this.setupVSCodeConfiguration();

      // 5. 创建验证配置文件
      await this.createValidationConfig();

      console.log('✅ 设计系统验证环境设置完成！');
      console.log('\n📋 可用命令:');
      console.log('  pnpm validate-design    - 验证设计系统使用');
      console.log('  pnpm validate-design:watch - 监视模式验证');
      console.log('  pnpm validate-design:fix - 自动修复部分问题');
      console.log('  pnpm dev:validate        - 开发模式带验证');

    } catch (error) {
      console.error('❌ 设置过程出错:', error);
      throw error;
    }
  }

  /**
   * 创建必要的目录结构
   */
  async createDirectoryStructure() {
    const directories = [
      'dist',
      '.vscode',
      'scripts',
      'src/styles/tokens',
      'src/components/ui',
      'src/tools'
    ];

    for (const dir of directories) {
      await fs.mkdir(path.join(this.projectRoot, dir), { recursive: true });
    }

    console.log('📁 目录结构创建完成');
  }

  /**
   * 更新package.json中的脚本
   */
  async updatePackageScripts() {
    const packagePath = path.join(this.projectRoot, 'package.json');
    
    try {
      const packageContent = await fs.readFile(packagePath, 'utf-8');
      const packageJson = JSON.parse(packageContent);

      // 添加设计系统相关脚本
      const newScripts = {
        'validate-design': 'node scripts/validate-design-system.js',
        'validate-design:watch': 'nodemon --watch src --ext css,tsx,ts --exec "pnpm validate-design"',
        'validate-design:fix': 'node scripts/fix-design-system.js',
        'dev:validate': 'concurrently "pnpm dev" "pnpm validate-design:watch"',
        'prebuild': 'pnpm validate-design',
        'postinstall': 'node scripts/setup-design-system-validation.js --silent'
      };

      packageJson.scripts = { ...packageJson.scripts, ...newScripts };

      // 添加开发依赖
      const newDevDeps = {
        'nodemon': '^3.0.0',
        'concurrently': '^8.2.0',
        'glob': '^10.3.0'
      };

      packageJson.devDependencies = { ...packageJson.devDependencies, ...newDevDeps };

      await fs.writeFile(packagePath, JSON.stringify(packageJson, null, 2));
      console.log('📦 package.json 脚本更新完成');
    } catch (error) {
      console.warn('⚠️  package.json 更新失败:', error.message);
    }
  }

  /**
   * 设置开发环境钩子
   */
  async setupDevelopmentHooks() {
    const hookContent = `#!/usr/bin/env node
/**
 * Git pre-commit 钩子
 * 在提交前验证设计系统使用
 */

import DesignSystemValidator from '../scripts/validate-design-system.js';

async function preCommitHook() {
  console.log('🎨 运行设计系统验证...');
  
  const validator = new DesignSystemValidator();
  const passed = await validator.validateFiles();
  
  if (!passed) {
    console.log('\\n❌ 提交被拒绝：设计系统验证失败');
    console.log('请修复上述问题后重新提交。');
    process.exit(1);
  }
  
  console.log('✅ 设计系统验证通过');
}

preCommitHook().catch(error => {
  console.error('验证钩子执行失败:', error);
  process.exit(1);
});
`;

    // 创建Git钩子目录和文件
    try {
      await fs.mkdir(path.join(this.projectRoot, '.git', 'hooks'), { recursive: true });
      await fs.writeFile(
        path.join(this.projectRoot, '.git', 'hooks', 'pre-commit'),
        hookContent,
        { mode: 0o755 }
      );
      console.log('🪝 Git pre-commit 钩子设置完成');
    } catch (error) {
      console.warn('⚠️  Git钩子设置失败（可能不在git仓库中）:', error.message);
    }
  }

  /**
   * 配置VSCode设置
   */
  async setupVSCodeConfiguration() {
    const vscodeSettings = {
      "css.validate": true,
      "css.lint.unknownProperties": "warning",
      "css.lint.duplicateProperties": "warning",
      "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true,
        "source.fixAll.stylelint": true
      },
      "files.associations": {
        "*.module.css": "css"
      },
      "emmet.includeLanguages": {
        "typescript": "html",
        "typescriptreact": "html"
      },
      "typescript.preferences.includePackageJsonAutoImports": "on",
      "workbench.colorCustomizations": {
        "statusBar.background": "#3b82f6",
        "statusBar.foreground": "#ffffff"
      }
    };

    const vscodeExtensions = {
      "recommendations": [
        "bradlc.vscode-tailwindcss",
        "ms-vscode.vscode-typescript-next",
        "esbenp.prettier-vscode",
        "dbaeumer.vscode-eslint",
        "stylelint.vscode-stylelint"
      ]
    };

    try {
      await fs.writeFile(
        path.join(this.projectRoot, '.vscode', 'settings.json'),
        JSON.stringify(vscodeSettings, null, 2)
      );

      await fs.writeFile(
        path.join(this.projectRoot, '.vscode', 'extensions.json'),
        JSON.stringify(vscodeExtensions, null, 2)
      );

      console.log('🔧 VSCode 配置文件创建完成');
    } catch (error) {
      console.warn('⚠️  VSCode配置创建失败:', error.message);
    }
  }

  /**
   * 创建验证配置文件
   */
  async createValidationConfig() {
    const validationConfig = {
      "version": "1.0.0",
      "rules": {
        "enforce-design-tokens": {
          "level": "error",
          "enabled": true,
          "description": "强制使用设计令牌"
        },
        "no-hardcoded-colors": {
          "level": "error",
          "enabled": true,
          "exceptions": ["transparent", "inherit", "currentColor"]
        },
        "no-hardcoded-spacing": {
          "level": "warning",
          "enabled": true,
          "tolerance": 2
        },
        "prefer-css-modules": {
          "level": "warning",
          "enabled": true
        },
        "validate-token-usage": {
          "level": "info",
          "enabled": true
        }
      },
      "ignore": [
        "**/*.test.{ts,tsx}",
        "**/node_modules/**",
        "**/dist/**",
        "**/*.stories.{ts,tsx}"
      ],
      "reportFormat": "both",
      "outputFile": "dist/design-system-validation-report.json"
    };

    try {
      await fs.writeFile(
        path.join(this.projectRoot, 'design-system.config.json'),
        JSON.stringify(validationConfig, null, 2)
      );

      console.log('⚙️  验证配置文件创建完成');
    } catch (error) {
      console.warn('⚠️  验证配置创建失败:', error.message);
    }
  }

  /**
   * 创建示例修复脚本
   */
  async createFixScript() {
    const fixScriptContent = `/**
 * 设计系统自动修复脚本
 * 自动修复一些常见的设计系统违规问题
 */

import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

class DesignSystemFixer {
  constructor() {
    this.fixes = {
      applied: 0,
      suggestions: []
    };
  }

  async fixFiles() {
    console.log('🔧 开始自动修复设计系统问题...');
    
    const files = await glob('src/**/*.{css,tsx,ts}');
    
    for (const filePath of files) {
      await this.fixFile(filePath);
    }
    
    this.generateReport();
  }

  async fixFile(filePath) {
    const content = await fs.readFile(filePath, 'utf-8');
    let fixedContent = content;
    
    // 修复常见的硬编码颜色
    const colorMap = {
      '#ffffff': 'var(--color-bg-primary)',
      '#000000': 'var(--color-text-primary)',
      '#3b82f6': 'var(--color-primary-500)',
      '#ef4444': 'var(--color-error-500)',
      '#22c55e': 'var(--color-success-500)',
      '#f59e0b': 'var(--color-warning-500)'
    };
    
    Object.entries(colorMap).forEach(([hardcoded, token]) => {
      const regex = new RegExp(hardcoded, 'gi');
      if (regex.test(fixedContent)) {
        fixedContent = fixedContent.replace(regex, token);
        this.fixes.applied++;
      }
    });
    
    // 如果有修改，写入文件
    if (fixedContent !== content) {
      await fs.writeFile(filePath, fixedContent);
      console.log(\`✅ 修复了 \${filePath}\`);
    }
  }

  generateReport() {
    console.log(\`\\n📊 自动修复报告:\`);
    console.log(\`修复数量: \${this.fixes.applied}\`);
    
    if (this.fixes.applied > 0) {
      console.log('✅ 部分问题已自动修复，建议运行验证确认');
    } else {
      console.log('ℹ️  未发现可自动修复的问题');
    }
  }
}

const fixer = new DesignSystemFixer();
fixer.fixFiles();
`;

    await fs.writeFile(
      path.join(this.projectRoot, 'scripts', 'fix-design-system.js'),
      fixScriptContent
    );

    console.log('🔧 自动修复脚本创建完成');
  }
}

// 执行设置
async function main() {
  const setup = new DesignSystemSetup();
  await setup.initializeValidationEnvironment();
  await setup.createFixScript();
}

// 检查是否为静默模式（通过postinstall调用）
const isSilent = process.argv.includes('--silent');

if (!isSilent) {
  main().catch(error => {
    console.error('设置失败:', error);
    process.exit(1);
  });
}

export default DesignSystemSetup;