# Clario CSS 架构指南

**文档版本**: 1.0.0  
**创建日期**: 2025-08-21  
**目标用户**: 前端开发团队

## 🏗️ CSS 架构理念

Clario 的 CSS 架构设计遵循**模块化、可维护、可扩展**的原则：

### 核心原则
1. **组件优先**: CSS 与 React 组件紧密结合
2. **设计令牌驱动**: 使用 CSS 自定义属性实现设计系统
3. **层级分明**: 清晰的样式层级和命名规范
4. **性能优化**: 减少 CSS 体积和运行时计算

---

## 📁 文件组织结构

### 推荐的目录结构
```
frontend/src/
├── styles/
│   ├── base/
│   │   ├── reset.css          # CSS 重置
│   │   ├── typography.css     # 字体样式
│   │   └── global.css         # 全局样式
│   ├── tokens/
│   │   ├── colors.css         # 颜色令牌
│   │   ├── spacing.css        # 间距令牌
│   │   ├── typography.css     # 字体令牌
│   │   └── index.css          # 令牌统一导入
│   ├── components/
│   │   ├── Button.css         # 按钮组件样式
│   │   ├── Card.css           # 卡片组件样式
│   │   └── ...
│   ├── layouts/
│   │   ├── Dashboard.css      # 仪表盘布局
│   │   ├── Workspace.css      # 工作区布局
│   │   └── ...
│   ├── utilities/
│   │   ├── spacing.css        # 间距工具类
│   │   ├── display.css        # 显示工具类
│   │   └── responsive.css     # 响应式工具类
│   └── index.css              # 样式总入口
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.module.css  # 组件级样式
│   │   └── index.ts
│   └── ...
```

---

## 🎨 CSS 方法论选择

### 1. CSS Modules (推荐)

**优势**:
- 局部作用域，避免样式冲突
- 与 React 组件完美集成
- 支持动态类名组合
- 构建时优化

**示例实现**:
```css
/* Button.module.css */
.button {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  transition: var(--transition-colors);
  cursor: pointer;
  border: 1px solid transparent;
}

.primary {
  background-color: var(--color-primary-500);
  color: var(--color-text-inverse);
  border-color: var(--color-primary-500);
}

.primary:hover {
  background-color: var(--color-primary-600);
  border-color: var(--color-primary-600);
}

.secondary {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  border-color: var(--color-border-primary);
}

.small {
  padding: var(--space-2) var(--space-4);
  font-size: var(--font-size-xs);
}

.large {
  padding: var(--space-4) var(--space-8);
  font-size: var(--font-size-base);
}

.loading {
  pointer-events: none;
  position: relative;
  color: transparent;
}

.loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 16px;
  height: 16px;
  margin: -8px 0 0 -8px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

```tsx
// Button.tsx
import React from 'react';
import styles from './Button.module.css';
import { clsx } from 'clsx';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  loading = false,
  children,
  className,
  ...props
}) => {
  return (
    <button
      className={clsx(
        styles.button,
        styles[variant],
        size !== 'medium' && styles[size],
        loading && styles.loading,
        className
      )}
      disabled={loading}
      {...props}
    >
      {children}
    </button>
  );
};
```

### 2. 工具类 CSS (辅助方案)

对于常用的样式模式，提供工具类：

```css
/* utilities/spacing.css */
.m-0 { margin: 0 !important; }
.m-1 { margin: var(--space-1) !important; }
.m-2 { margin: var(--space-2) !important; }
.m-4 { margin: var(--space-4) !important; }

.mt-0 { margin-top: 0 !important; }
.mt-1 { margin-top: var(--space-1) !important; }
.mt-2 { margin-top: var(--space-2) !important; }
.mt-4 { margin-top: var(--space-4) !important; }

/* utilities/display.css */
.flex { display: flex !important; }
.inline-flex { display: inline-flex !important; }
.block { display: block !important; }
.hidden { display: none !important; }

.items-center { align-items: center !important; }
.items-start { align-items: flex-start !important; }
.items-end { align-items: flex-end !important; }

.justify-center { justify-content: center !important; }
.justify-between { justify-content: space-between !important; }
.justify-start { justify-content: flex-start !important; }
```

---

## 🎯 设计令牌实现

### 令牌文件结构
```css
/* tokens/colors.css */
:root {
  /* Primary Colors */
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-900: #1e3a8a;
  
  /* Semantic Colors */
  --color-success-500: #22c55e;
  --color-warning-500: #f59e0b;
  --color-error-500: #ef4444;
  
  /* Application Colors */
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f8fafc;
  --color-text-primary: #111827;
  --color-text-secondary: #6b7280;
  --color-border-primary: #e5e7eb;
}

/* Dark theme support */
[data-theme="dark"] {
  --color-bg-primary: #111827;
  --color-bg-secondary: #1f2937;
  --color-text-primary: #f9fafb;
  --color-text-secondary: #d1d5db;
  --color-border-primary: #374151;
}
```

```css
/* tokens/spacing.css */
:root {
  --space-0: 0;
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-5: 1.25rem;  /* 20px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  --space-10: 2.5rem;  /* 40px */
  --space-12: 3rem;    /* 48px */
  --space-16: 4rem;    /* 64px */
}
```

```css
/* tokens/typography.css */
:root {
  /* Font Families */
  --font-family-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  --font-family-mono: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
  
  /* Font Sizes */
  --font-size-xs: 0.75rem;   /* 12px */
  --font-size-sm: 0.875rem;  /* 14px */
  --font-size-base: 1rem;    /* 16px */
  --font-size-lg: 1.125rem;  /* 18px */
  --font-size-xl: 1.25rem;   /* 20px */
  --font-size-2xl: 1.5rem;   /* 24px */
  
  /* Font Weights */
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  /* Line Heights */
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.625;
}
```

---

## 🧩 组件样式模式

### 1. 基础组件模式

```css
/* Card.module.css */
.card {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
  transition: var(--transition-all);
}

.card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--color-border-secondary);
}

/* 变体模式 */
.elevated {
  box-shadow: var(--shadow-lg);
}

.bordered {
  border-width: 2px;
}

.interactive {
  cursor: pointer;
}

.interactive:hover {
  transform: translateY(-1px);
}

/* 大小变体 */
.compact {
  padding: var(--space-4);
}

.spacious {
  padding: var(--space-8);
}

/* 状态变体 */
.selected {
  border-color: var(--color-primary-500);
  background: var(--color-primary-50);
}

.disabled {
  opacity: 0.5;
  pointer-events: none;
}
```

### 2. 布局组件模式

```css
/* Dashboard.module.css */
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-6);
}

.header {
  margin-bottom: var(--space-8);
}

.headerContent {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-6);
  margin-bottom: var(--space-6);
}

.title {
  flex: 1;
}

.titleHeading {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-2) 0;
}

.titleSubtext {
  color: var(--color-text-secondary);
  margin: 0;
}

.actions {
  flex-shrink: 0;
}

.content {
  min-height: 400px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--space-6);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dashboard {
    padding: var(--space-4);
  }
  
  .headerContent {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-4);
  }
  
  .titleHeading {
    font-size: var(--font-size-2xl);
  }
  
  .grid {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }
}
```

### 3. 状态组件模式

```css
/* LoadingState.module.css */
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-16) var(--space-8);
  text-align: center;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid var(--color-gray-200);
  border-top-color: var(--color-primary-500);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: var(--space-4);
}

.text {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* EmptyState.module.css */
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-16) var(--space-8);
  text-align: center;
}

.icon {
  width: 4rem;
  height: 4rem;
  color: var(--color-gray-300);
  margin-bottom: var(--space-6);
}

.title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-2) 0;
}

.description {
  color: var(--color-text-secondary);
  margin: 0 0 var(--space-8) 0;
  max-width: 400px;
}

.action {
  /* 继承按钮样式 */
}
```

---

## 📱 响应式设计策略

### 断点管理
```css
/* tokens/breakpoints.css */
:root {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
}

/* 自定义媒体查询 (PostCSS) */
@custom-media --sm (min-width: 640px);
@custom-media --md (min-width: 768px);
@custom-media --lg (min-width: 1024px);
@custom-media --xl (min-width: 1280px);

/* 或者使用 Sass mixin */
@mixin respond-to($breakpoint) {
  @if $breakpoint == 'sm' {
    @media (min-width: 640px) { @content; }
  }
  @if $breakpoint == 'md' {
    @media (min-width: 768px) { @content; }
  }
  @if $breakpoint == 'lg' {
    @media (min-width: 1024px) { @content; }
  }
  @if $breakpoint == 'xl' {
    @media (min-width: 1280px) { @content; }
  }
}
```

### 响应式组件实现
```css
/* ResponsiveGrid.module.css */
.grid {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: 1fr;
}

@media (min-width: 640px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-6);
  }
}

@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1280px) {
  .grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* 响应式字体大小 */
.title {
  font-size: var(--font-size-xl);
  
  @media (min-width: 768px) {
    font-size: var(--font-size-2xl);
  }
  
  @media (min-width: 1024px) {
    font-size: var(--font-size-3xl);
  }
}
```

---

## ⚡ 性能优化策略

### 1. CSS-in-JS vs CSS Modules

**当前推荐**: CSS Modules
- 构建时提取，运行时性能更好
- 支持 CSS 预处理器特性
- 更小的 JavaScript 包体积

**避免 styled-jsx 的性能问题**:
```tsx
// ❌ 避免：内联样式在组件中
export function BadComponent() {
  return (
    <div>
      <style jsx>{`
        .container { padding: 20px; }
      `}</style>
      <div className="container">Content</div>
    </div>
  );
}

// ✅ 推荐：使用 CSS Modules
import styles from './Component.module.css';

export function GoodComponent() {
  return (
    <div className={styles.container}>
      Content
    </div>
  );
}
```

### 2. 关键 CSS 提取
```javascript
// vite.config.ts
export default defineConfig({
  css: {
    modules: {
      localsConvention: 'camelCase'
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'design-tokens': ['./src/styles/tokens/index.css']
        }
      }
    }
  }
});
```

### 3. 动画性能优化
```css
/* 优化动画性能 */
.optimized-animation {
  /* 只动画 transform 和 opacity */
  transition: transform 200ms ease-out, opacity 200ms ease-out;
  
  /* 启用硬件加速 */
  will-change: transform, opacity;
}

.optimized-animation:hover {
  transform: translateY(-2px);
  opacity: 0.9;
}

/* 动画完成后移除 will-change */
.optimized-animation:not(:hover) {
  will-change: auto;
}

/* 避免重复重绘的动画 */
@keyframes slide-in {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.slide-in {
  animation: slide-in 300ms ease-out;
  /* 避免动画结束后回到初始状态 */
  animation-fill-mode: both;
}
```

---

## 🔧 开发工具配置

### 1. PostCSS 配置
```javascript
// postcss.config.js
module.exports = {
  plugins: {
    'postcss-import': {},
    'postcss-custom-properties': {
      preserve: true // 保留 CSS 变量以支持运行时主题切换
    },
    'postcss-custom-media': {},
    'autoprefixer': {},
    'cssnano': process.env.NODE_ENV === 'production' ? {} : false
  }
}
```

### 2. VSCode 扩展推荐
```json
// .vscode/extensions.json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "stylelint.vscode-stylelint",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag"
  ]
}
```

### 3. Stylelint 配置
```javascript
// stylelint.config.js
module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-css-modules'
  ],
  rules: {
    'custom-property-pattern': '^([a-z][a-z0-9]*)(-[a-z0-9]+)*$',
    'selector-class-pattern': '^([a-z][a-z0-9]*)(-[a-z0-9]+)*$',
    'declaration-no-important': true,
    'max-nesting-depth': 3
  }
};
```

---

## 📋 最佳实践清单

### CSS 编写规范
- [ ] 使用设计令牌而非硬编码值
- [ ] 遵循 BEM 或 CSS Modules 命名规范
- [ ] 避免使用 `!important`
- [ ] 优先使用 flexbox 和 grid 布局
- [ ] 动画只使用 transform 和 opacity

### 组件样式规范
- [ ] 每个组件有独立的样式文件
- [ ] 支持多种变体 (size, variant, state)
- [ ] 提供合理的默认值
- [ ] 考虑深色主题兼容性
- [ ] 响应式设计支持

### 性能优化
- [ ] CSS 文件按需加载
- [ ] 避免深层嵌套选择器
- [ ] 使用 CSS Modules 避免全局污染
- [ ] 动画使用 GPU 加速属性
- [ ] 生产环境开启 CSS 压缩

### 维护性
- [ ] 设计令牌集中管理
- [ ] 组件样式模块化
- [ ] 代码注释清晰
- [ ] 遵循团队编码规范
- [ ] 定期重构冗余样式

---

这套 CSS 架构指南为 Clario 项目提供了完整的样式组织和开发方案，确保代码的可维护性、性能和团队协作效率。