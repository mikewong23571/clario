# Clario 视觉设计系统

**文档版本**: 1.0.0  
**创建日期**: 2025-08-21  
**维护团队**: 前端开发团队

## 🎨 设计理念

Clario 的视觉设计追求**专业、清晰、高效**的用户体验，体现需求澄清工具的核心价值：

- **专业性**: 简洁而不简单，体现工具的专业性
- **清晰性**: 信息层级分明，用户能快速理解和操作
- **高效性**: 减少视觉干扰，让用户专注于内容创作

---

## 🎯 当前状态分析

### 已有的设计元素
基于现有代码分析，当前已实现：
- ✅ 基础色彩体系（蓝色主色调 #3b82f6）
- ✅ 基础字体系统（系统字体栈）
- ✅ 基础间距和布局（使用 rem 单位）
- ✅ 响应式设计基础
- ✅ 无障碍性考虑（焦点样式、aria-label）

### 需要标准化的元素
- 🔄 颜色令牌和主题系统
- 🔄 字体大小和行高标准
- 🔄 组件样式规范
- 🔄 动画和过渡效果
- 🔄 图标系统
- 🔄 间距和布局网格

---

## 🎨 设计令牌 (Design Tokens)

### 颜色系统

#### 主色调 (Primary Colors)
```css
/* 蓝色系 - 主品牌色 */
--color-primary-50: #eff6ff;
--color-primary-100: #dbeafe; 
--color-primary-200: #bfdbfe;
--color-primary-300: #93c5fd;
--color-primary-400: #60a5fa;
--color-primary-500: #3b82f6;  /* 主色 */
--color-primary-600: #2563eb;
--color-primary-700: #1d4ed8;
--color-primary-800: #1e40af;
--color-primary-900: #1e3a8a;
--color-primary-950: #172554;
```

#### 中性色 (Neutral Colors)
```css
/* 灰色系 - 文本和背景 */
--color-gray-50: #f9fafb;
--color-gray-100: #f3f4f6;
--color-gray-200: #e5e7eb;
--color-gray-300: #d1d5db;
--color-gray-400: #9ca3af;
--color-gray-500: #6b7280;
--color-gray-600: #4b5563;
--color-gray-700: #374151;
--color-gray-800: #1f2937;
--color-gray-900: #111827;
--color-gray-950: #030712;
```

#### 功能色 (Semantic Colors)
```css
/* 成功色 - 绿色系 */
--color-success-50: #f0fdf4;
--color-success-500: #22c55e;
--color-success-600: #16a34a;

/* 警告色 - 黄色系 */
--color-warning-50: #fffbeb;
--color-warning-500: #f59e0b;
--color-warning-600: #d97706;

/* 错误色 - 红色系 */
--color-error-50: #fef2f2;
--color-error-500: #ef4444;
--color-error-600: #dc2626;

/* 信息色 - 天蓝色系 */
--color-info-50: #f0f9ff;
--color-info-500: #06b6d4;
--color-info-600: #0891b2;
```

#### 应用色彩 (Application Colors)
```css
/* 背景色 */
--color-bg-primary: #ffffff;
--color-bg-secondary: #f8fafc;
--color-bg-tertiary: #f1f5f9;

/* 文本色 */
--color-text-primary: #111827;
--color-text-secondary: #6b7280;
--color-text-tertiary: #9ca3af;
--color-text-inverse: #ffffff;

/* 边框色 */
--color-border-primary: #e5e7eb;
--color-border-secondary: #d1d5db;
--color-border-focus: #3b82f6;
```

### 字体系统

#### 字体族
```css
/* 主字体 - 无衬线字体 */
--font-family-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
                    'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 
                    'Helvetica Neue', sans-serif;

/* 等宽字体 - 代码和数据 */
--font-family-mono: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 
                    'Source Code Pro', monospace;
```

#### 字体大小和行高
```css
/* 字体大小阶梯 */
--font-size-xs: 0.75rem;    /* 12px */
--font-size-sm: 0.875rem;   /* 14px */
--font-size-base: 1rem;     /* 16px */
--font-size-lg: 1.125rem;   /* 18px */
--font-size-xl: 1.25rem;    /* 20px */
--font-size-2xl: 1.5rem;    /* 24px */
--font-size-3xl: 1.875rem;  /* 30px */
--font-size-4xl: 2.25rem;   /* 36px */

/* 行高 */
--line-height-tight: 1.25;
--line-height-normal: 1.5;
--line-height-relaxed: 1.625;
--line-height-loose: 2;

/* 字重 */
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

### 间距系统

#### 间距阶梯 (基于 4px 网格)
```css
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

### 阴影系统
```css
/* 阴影层级 */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-base: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);

/* 特殊阴影 */
--shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
--shadow-focus: 0 0 0 3px rgb(59 130 246 / 0.15);
```

### 圆角系统
```css
--radius-none: 0;
--radius-sm: 0.25rem;   /* 4px */
--radius-base: 0.5rem;  /* 8px */
--radius-md: 0.75rem;   /* 12px */
--radius-lg: 1rem;      /* 16px */
--radius-xl: 1.5rem;    /* 24px */
--radius-full: 9999px;  /* 完全圆角 */
```

### 过渡动画
```css
/* 持续时间 */
--duration-fast: 150ms;
--duration-base: 200ms;
--duration-slow: 300ms;

/* 缓动函数 */
--ease-linear: linear;
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

/* 常用过渡 */
--transition-colors: color var(--duration-base) var(--ease-out),
                     background-color var(--duration-base) var(--ease-out),
                     border-color var(--duration-base) var(--ease-out);
--transition-opacity: opacity var(--duration-base) var(--ease-out);
--transition-transform: transform var(--duration-base) var(--ease-out);
--transition-all: all var(--duration-base) var(--ease-out);
```

---

## 🧩 组件设计规范

### 按钮组件 (Button)

#### 样式变体
```css
/* 主要按钮 */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-family: var(--font-family-sans);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-tight);
  text-decoration: none;
  border: 1px solid transparent;
  cursor: pointer;
  transition: var(--transition-colors);
  white-space: nowrap;
}

/* 主要按钮样式 */
.btn--primary {
  background-color: var(--color-primary-500);
  color: var(--color-text-inverse);
  border-color: var(--color-primary-500);
}

.btn--primary:hover:not(:disabled) {
  background-color: var(--color-primary-600);
  border-color: var(--color-primary-600);
}

.btn--primary:focus {
  box-shadow: var(--shadow-focus);
}

/* 次要按钮样式 */
.btn--secondary {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  border-color: var(--color-border-primary);
}

.btn--secondary:hover:not(:disabled) {
  background-color: var(--color-gray-50);
  border-color: var(--color-border-secondary);
}

/* 按钮大小变体 */
.btn--sm {
  padding: var(--space-2) var(--space-4);
  font-size: var(--font-size-xs);
}

.btn--lg {
  padding: var(--space-4) var(--space-8);
  font-size: var(--font-size-base);
}

/* 禁用状态 */
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### 卡片组件 (Card)

#### 基础样式
```css
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

.card__header {
  margin-bottom: var(--space-4);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-4);
}

.card__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
  line-height: var(--line-height-tight);
}

.card__subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: var(--space-1) 0 0 0;
}

.card__content {
  color: var(--color-text-secondary);
  line-height: var(--line-height-normal);
}

.card__footer {
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border-primary);
}
```

### 表单组件 (Form)

#### 输入框样式
```css
.input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  font-family: var(--font-family-sans);
  font-size: var(--font-size-base);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  transition: var(--transition-colors);
}

.input:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: var(--shadow-focus);
}

.input:disabled {
  background: var(--color-gray-100);
  color: var(--color-text-tertiary);
  cursor: not-allowed;
}

.input--error {
  border-color: var(--color-error-500);
}

.input--error:focus {
  box-shadow: 0 0 0 3px rgb(239 68 68 / 0.15);
}
```

#### 标签样式
```css
.label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}

.label--required::after {
  content: ' *';
  color: var(--color-error-500);
}
```

### 加载状态组件

#### 骨架屏
```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-gray-100) 25%,
    var(--color-gray-200) 50%,
    var(--color-gray-100) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: var(--radius-base);
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.skeleton--text {
  height: var(--space-4);
  width: 100%;
}

.skeleton--text-short {
  width: 60%;
}

.skeleton--title {
  height: var(--space-6);
  width: 70%;
}

.skeleton--circle {
  width: var(--space-12);
  height: var(--space-12);
  border-radius: var(--radius-full);
}
```

#### 加载指示器
```css
.spinner {
  width: 1.5rem;
  height: 1.5rem;
  border: 2px solid var(--color-gray-200);
  border-top: 2px solid var(--color-primary-500);
  border-radius: var(--radius-full);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

---

## 📐 布局系统

### 容器和网格

#### 主容器
```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-6);
}

@media (max-width: 768px) {
  .container {
    padding: 0 var(--space-4);
  }
}
```

#### Flexbox 工具类
```css
.flex { display: flex; }
.flex-col { flex-direction: column; }
.flex-row { flex-direction: row; }
.flex-wrap { flex-wrap: wrap; }

.items-start { align-items: flex-start; }
.items-center { align-items: center; }
.items-end { align-items: flex-end; }
.items-stretch { align-items: stretch; }

.justify-start { justify-content: flex-start; }
.justify-center { justify-content: center; }
.justify-end { justify-content: flex-end; }
.justify-between { justify-content: space-between; }

.flex-1 { flex: 1 1 0%; }
.flex-none { flex: none; }
```

#### 间距工具类
```css
/* Margin */
.m-0 { margin: 0; }
.m-1 { margin: var(--space-1); }
.m-2 { margin: var(--space-2); }
.m-4 { margin: var(--space-4); }
.m-8 { margin: var(--space-8); }

.mt-4 { margin-top: var(--space-4); }
.mr-4 { margin-right: var(--space-4); }
.mb-4 { margin-bottom: var(--space-4); }
.ml-4 { margin-left: var(--space-4); }

/* Padding */
.p-0 { padding: 0; }
.p-1 { padding: var(--space-1); }
.p-2 { padding: var(--space-2); }
.p-4 { padding: var(--space-4); }
.p-8 { padding: var(--space-8); }

.pt-4 { padding-top: var(--space-4); }
.pr-4 { padding-right: var(--space-4); }
.pb-4 { padding-bottom: var(--space-4); }
.pl-4 { padding-left: var(--space-4); }
```

---

## 🎭 状态设计

### 交互状态
```css
/* 悬停状态 */
.interactive:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

/* 激活状态 */
.interactive:active {
  transform: translateY(0);
  box-shadow: var(--shadow-base);
}

/* 焦点状态 */
.focusable:focus {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

.focusable:focus:not(:focus-visible) {
  outline: none;
}
```

### 状态指示器
```css
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.status-badge--success {
  background: var(--color-success-50);
  color: var(--color-success-600);
}

.status-badge--warning {
  background: var(--color-warning-50);
  color: var(--color-warning-600);
}

.status-badge--error {
  background: var(--color-error-50);
  color: var(--color-error-600);
}

.status-badge--info {
  background: var(--color-info-50);
  color: var(--color-info-600);
}
```

---

## 🔤 图标系统

### 图标使用原则
1. **一致性**: 使用统一的图标库（推荐 Heroicons 或 Lucide）
2. **大小**: 常用尺寸 16px, 20px, 24px
3. **样式**: 线性图标，描边宽度 1.5-2px
4. **语义化**: 图标应有明确的语义含义

### 常用图标尺寸
```css
.icon {
  flex-shrink: 0;
  vertical-align: middle;
}

.icon--sm { width: 1rem; height: 1rem; }      /* 16px */
.icon--base { width: 1.25rem; height: 1.25rem; } /* 20px */
.icon--lg { width: 1.5rem; height: 1.5rem; }    /* 24px */
.icon--xl { width: 2rem; height: 2rem; }        /* 32px */
```

---

## 📱 响应式设计

### 断点系统
```css
/* 移动设备优先 */
:root {
  --breakpoint-sm: 640px;  /* 小型设备 */
  --breakpoint-md: 768px;  /* 中型设备 */
  --breakpoint-lg: 1024px; /* 大型设备 */
  --breakpoint-xl: 1280px; /* 超大设备 */
}

/* Media Queries */
@media (min-width: 640px) {
  /* 小型设备及以上 */
}

@media (min-width: 768px) {
  /* 中型设备及以上 */
}

@media (min-width: 1024px) {
  /* 大型设备及以上 */
}
```

### 响应式工具类
```css
/* 显示/隐藏 */
.hidden { display: none; }
.block { display: block; }

@media (max-width: 767px) {
  .hidden-mobile { display: none; }
  .block-mobile { display: block; }
}

@media (min-width: 768px) {
  .hidden-desktop { display: none; }
  .block-desktop { display: block; }
}
```

---

## ♿ 无障碍设计

### 颜色对比度
- **普通文本**: 至少 4.5:1 的对比度
- **大文本**: 至少 3:1 的对比度
- **非文本元素**: 至少 3:1 的对比度

### 焦点管理
```css
/* 确保所有交互元素都有清晰的焦点指示器 */
.focusable:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

/* 跳过链接 */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--color-primary-500);
  color: white;
  padding: 8px;
  text-decoration: none;
  z-index: 1000;
}

.skip-link:focus {
  top: 6px;
}
```

### 语义化 HTML
- 使用适当的 HTML 标签
- 提供必要的 ARIA 属性
- 确保键盘导航友好

---

## 🎨 主题和定制

### CSS 自定义属性结构
所有设计令牌都使用 CSS 自定义属性定义，支持主题切换：

```css
:root {
  /* 在根元素定义所有设计令牌 */
}

[data-theme="dark"] {
  /* 深色主题覆盖 */
  --color-bg-primary: #111827;
  --color-bg-secondary: #1f2937;
  --color-text-primary: #f9fafb;
  --color-text-secondary: #d1d5db;
}
```

### 组件变体系统
每个组件都支持通过修饰符类来实现变体：

```css
/* 基础组件 */
.component { }

/* 大小变体 */
.component--sm { }
.component--lg { }

/* 样式变体 */
.component--primary { }
.component--secondary { }

/* 状态变体 */
.component--active { }
.component--disabled { }
```

---

## 📋 实施指南

### 1. 设计令牌优先级
1. **立即实施**: 颜色、字体、间距基础令牌
2. **第二阶段**: 组件样式标准化
3. **第三阶段**: 动画和高级交互效果

### 2. 迁移现有代码
- 将现有的魔法数字替换为设计令牌
- 标准化组件的 class 命名
- 添加响应式和无障碍性支持

### 3. 工具和流程
- 使用 PostCSS 或 Sass 来管理设计令牌
- 建立设计令牌的自动化测试
- 创建组件库和样式指南

这套设计系统为 Clario 项目提供了完整的视觉设计基础，确保界面的一致性、可维护性和用户体验质量。