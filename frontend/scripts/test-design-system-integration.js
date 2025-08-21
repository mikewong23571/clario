/**
 * 设计系统集成测试脚本
 * 验证设计系统的完整端到端实现
 */

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import DesignSystemValidator from './validate-design-system.js';

class DesignSystemIntegrationTest {
  constructor() {
    this.testResults = {
      passed: [],
      failed: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0
      }
    };
  }

  /**
   * 运行完整的集成测试套件
   */
  async runIntegrationTests() {
    console.log('🧪 开始设计系统集成测试...\n');

    const tests = [
      { name: '设计令牌文件存在性验证', test: this.testDesignTokenFiles },
      { name: '组件样式模块验证', test: this.testComponentStyleModules },
      { name: '设计系统验证工具测试', test: this.testValidationTool },
      { name: 'ProjectDashboard重构验证', test: this.testProjectDashboardRefactor },
      { name: 'CSS变量使用验证', test: this.testCSSVariableUsage },
      { name: '响应式设计验证', test: this.testResponsiveDesign },
      { name: '无障碍性验证', test: this.testAccessibility },
      { name: '构建流程验证', test: this.testBuildProcess }
    ];

    for (const { name, test } of tests) {
      await this.runTest(name, test);
    }

    this.generateFinalReport();
    return this.testResults.summary.failed === 0;
  }

  /**
   * 运行单个测试
   */
  async runTest(name, testFunction) {
    console.log(`🔍 运行测试: ${name}`);
    this.testResults.summary.total++;

    try {
      await testFunction.call(this);
      this.testResults.passed.push(name);
      this.testResults.summary.passed++;
      console.log(`✅ ${name} - 通过\n`);
    } catch (error) {
      this.testResults.failed.push({ name, error: error.message });
      this.testResults.summary.failed++;
      console.log(`❌ ${name} - 失败: ${error.message}\n`);
    }
  }

  /**
   * 测试设计令牌文件存在性
   */
  async testDesignTokenFiles() {
    const tokenFiles = [
      'src/styles/tokens/colors.css',
      'src/styles/tokens/typography.css',
      'src/styles/tokens/spacing.css',
      'src/styles/tokens/shadows.css',
      'src/styles/tokens/borders.css',
      'src/styles/tokens/motion.css',
      'src/styles/tokens/index.css'
    ];

    for (const filePath of tokenFiles) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        if (content.length === 0) {
          throw new Error(`${filePath} 文件为空`);
        }
        
        // 验证文件包含CSS变量定义
        if (!content.includes(':root') || !content.includes('--')) {
          throw new Error(`${filePath} 不包含有效的CSS变量定义`);
        }
      } catch (error) {
        if (error.code === 'ENOENT') {
          throw new Error(`设计令牌文件不存在: ${filePath}`);
        }
        throw error;
      }
    }
  }

  /**
   * 测试组件样式模块
   */
  async testComponentStyleModules() {
    const componentModules = [
      'src/components/ui/Button/Button.module.css',
      'src/components/ui/Card/Card.module.css',
      'src/components/ProjectDashboard/ProjectDashboard.module.css'
    ];

    for (const modulePath of componentModules) {
      try {
        const content = await fs.readFile(modulePath, 'utf-8');
        
        // 验证使用了设计令牌
        const tokenUsageCount = (content.match(/var\(--[^)]+\)/g) || []).length;
        if (tokenUsageCount === 0) {
          throw new Error(`${modulePath} 未使用设计令牌`);
        }

        // 验证没有硬编码的颜色值
        const hardcodedColors = content.match(/#[0-9a-fA-F]{3,8}(?![^{]*var\()/g);
        if (hardcodedColors && hardcodedColors.length > 0) {
          throw new Error(`${modulePath} 包含硬编码颜色值: ${hardcodedColors.join(', ')}`);
        }

        console.log(`   └─ ${modulePath}: 使用了 ${tokenUsageCount} 个设计令牌`);
      } catch (error) {
        if (error.code === 'ENOENT') {
          throw new Error(`组件样式模块不存在: ${modulePath}`);
        }
        throw error;
      }
    }
  }

  /**
   * 测试设计系统验证工具
   */
  async testValidationTool() {
    try {
      // 验证验证工具文件存在
      await fs.access('src/tools/design-validator.ts');
      
      const validator = new DesignSystemValidator();
      const passed = await validator.validateFiles();
      
      if (!passed) {
        throw new Error('设计系统验证工具检测到违规问题');
      }
      
      console.log('   └─ 设计系统验证工具运行正常');
    } catch (error) {
      throw new Error(`验证工具测试失败: ${error.message}`);
    }
  }

  /**
   * 测试ProjectDashboard重构
   */
  async testProjectDashboardRefactor() {
    try {
      const dashboardContent = await fs.readFile('src/components/ProjectDashboard.tsx', 'utf-8');
      
      // 验证导入了样式模块
      if (!dashboardContent.includes('import styles from')) {
        throw new Error('ProjectDashboard未导入CSS Modules');
      }

      // 验证没有内联样式
      const inlineStyles = dashboardContent.match(/style=\{\{[^}]+\}\}/g);
      if (inlineStyles && inlineStyles.length > 0) {
        throw new Error(`ProjectDashboard仍包含内联样式: ${inlineStyles.length} 个`);
      }

      // 验证使用了CSS类
      const cssClassUsage = (dashboardContent.match(/className=\{[^}]*styles\./g) || []).length;
      if (cssClassUsage === 0) {
        throw new Error('ProjectDashboard未使用CSS Modules类');
      }

      console.log(`   └─ ProjectDashboard成功重构，使用了 ${cssClassUsage} 个CSS类`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * 测试CSS变量使用情况
   */
  async testCSSVariableUsage() {
    try {
      // 统计所有CSS文件中的变量使用
      const cssFiles = ['src/styles/tokens/index.css'];
      let totalVariables = 0;
      
      for (const filePath of cssFiles) {
        const content = await fs.readFile(filePath, 'utf-8');
        const variables = content.match(/--[a-zA-Z-]+/g) || [];
        totalVariables += variables.length;
      }

      if (totalVariables < 50) {
        throw new Error(`设计令牌数量不足: ${totalVariables} (期望至少50个)`);
      }

      console.log(`   └─ 发现 ${totalVariables} 个设计令牌`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * 测试响应式设计
   */
  async testResponsiveDesign() {
    try {
      const componentFiles = [
        'src/components/ui/Button/Button.module.css',
        'src/components/ui/Card/Card.module.css',
        'src/components/ProjectDashboard/ProjectDashboard.module.css'
      ];

      let totalMediaQueries = 0;

      for (const filePath of componentFiles) {
        const content = await fs.readFile(filePath, 'utf-8');
        const mediaQueries = content.match(/@media[^{]*\{/g) || [];
        totalMediaQueries += mediaQueries.length;
      }

      if (totalMediaQueries === 0) {
        throw new Error('未发现响应式媒体查询');
      }

      console.log(`   └─ 发现 ${totalMediaQueries} 个响应式断点`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * 测试无障碍性支持
   */
  async testAccessibility() {
    try {
      const componentFiles = [
        'src/components/ui/Button/Button.module.css',
        'src/components/ui/Card/Card.module.css'
      ];

      let accessibilityFeatures = 0;

      for (const filePath of componentFiles) {
        const content = await fs.readFile(filePath, 'utf-8');
        
        // 检查无障碍相关的CSS规则
        if (content.includes('prefers-reduced-motion')) accessibilityFeatures++;
        if (content.includes('prefers-contrast')) accessibilityFeatures++;
        if (content.includes('focus-visible')) accessibilityFeatures++;
      }

      if (accessibilityFeatures === 0) {
        throw new Error('未发现无障碍性支持规则');
      }

      console.log(`   └─ 发现 ${accessibilityFeatures} 个无障碍性特性`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * 测试构建流程
   */
  async testBuildProcess() {
    try {
      // 检查package.json中的脚本
      const packagePath = 'package.json';
      const packageContent = await fs.readFile(packagePath, 'utf-8');
      const packageJson = JSON.parse(packageContent);

      const requiredScripts = ['validate-design', 'prebuild'];
      const missingScripts = requiredScripts.filter(
        script => !packageJson.scripts || !packageJson.scripts[script]
      );

      if (missingScripts.length > 0) {
        throw new Error(`缺少必需的脚本: ${missingScripts.join(', ')}`);
      }

      console.log('   └─ 构建流程配置正确');
    } catch (error) {
      throw error;
    }
  }

  /**
   * 生成最终测试报告
   */
  generateFinalReport() {
    console.log('📊 设计系统集成测试报告');
    console.log('==============================');
    console.log(`测试总数: ${this.testResults.summary.total}`);
    console.log(`通过: ${this.testResults.summary.passed}`);
    console.log(`失败: ${this.testResults.summary.failed}`);
    
    const successRate = Math.round(
      (this.testResults.summary.passed / this.testResults.summary.total) * 100
    );
    console.log(`成功率: ${successRate}%\n`);

    if (this.testResults.failed.length > 0) {
      console.log('❌ 失败的测试:');
      this.testResults.failed.forEach((failure, index) => {
        console.log(`  ${index + 1}. ${failure.name}`);
        console.log(`     原因: ${failure.error}\n`);
      });
    }

    if (this.testResults.summary.failed === 0) {
      console.log('🎉 所有测试通过！设计系统集成成功！');
      console.log('\n✅ 最小反馈环已建立：');
      console.log('   - 设计令牌系统 → 完整实现');
      console.log('   - 组件重构 → ProjectDashboard已更新');
      console.log('   - 验证工具 → 自动化检测');
      console.log('   - 构建集成 → prebuild验证');
      console.log('   - 开发体验 → VSCode配置');
    } else {
      console.log('❌ 存在问题需要修复。请查看上述失败详情。');
    }

    // 保存测试报告
    this.saveTestReport();
  }

  /**
   * 保存测试报告为JSON文件
   */
  async saveTestReport() {
    try {
      await fs.mkdir('dist', { recursive: true });
      
      const report = {
        timestamp: new Date().toISOString(),
        summary: this.testResults.summary,
        passed: this.testResults.passed,
        failed: this.testResults.failed,
        integrationSuccess: this.testResults.summary.failed === 0
      };

      await fs.writeFile(
        'dist/design-system-integration-report.json',
        JSON.stringify(report, null, 2)
      );

      console.log('\n📄 详细报告已保存至: dist/design-system-integration-report.json');
    } catch (error) {
      console.warn(`无法保存测试报告: ${error.message}`);
    }
  }
}

// 执行集成测试
async function main() {
  const tester = new DesignSystemIntegrationTest();
  const success = await tester.runIntegrationTests();
  
  if (!success && process.env.CI) {
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('集成测试执行失败:', error);
    process.exit(1);
  });
}

export default DesignSystemIntegrationTest;