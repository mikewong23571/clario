# Clario UI 交互设计指南

**文档版本**: 1.0.0  
**创建日期**: 2025-08-21  
**目标用户**: 前端开发者、UI/UX设计师

## 🎯 交互设计原则

Clario 的交互设计遵循以下核心原则：

### 1. **渐进披露 (Progressive Disclosure)**
- 优先显示最重要的信息和操作
- 通过交互逐步展示更多细节
- 避免信息过载，保持界面简洁

### 2. **即时反馈 (Immediate Feedback)**
- 用户操作后立即提供视觉反馈
- 明确的加载状态和进度指示
- 错误状态有清晰的提示和解决方案

### 3. **一致性 (Consistency)**
- 相同功能在不同界面保持一致的交互模式
- 统一的视觉语言和行为预期
- 符合用户的心理模型

---

## 🖱️ 核心交互模式

### 1. 项目仪表盘交互

#### 项目卡片交互
```
[项目卡片] 
  ├── 悬停状态: 轻微上浮 + 阴影加深
  ├── 点击: 导航到项目工作区
  ├── 长按/右键: 显示上下文菜单
  └── 焦点状态: 蓝色边框高亮
```

#### 搜索和过滤交互
```
[搜索栏]
  ├── 输入时: 实时过滤结果 (防抖 300ms)
  ├── 清空按钮: 鼠标悬停时显示
  ├── 快捷键: Ctrl+K 聚焦搜索
  └── 无结果状态: 显示搜索建议

[过滤器]
  ├── 下拉选择: 点击展开，选择后自动收起
  ├── 状态指示: 已应用过滤器显示标记
  └── 清除功能: 一键重置所有过滤条件
```

### 2. 对话界面交互

#### 消息输入交互
```
[消息输入框]
  ├── 自动调整高度: 内容增加时自动扩展
  ├── 快捷键支持:
  │   ├── Enter: 发送消息
  │   ├── Shift+Enter: 换行
  │   └── Ctrl+/: 显示快捷键帮助
  ├── 字符计数: 接近限制时显示计数器
  └── 发送状态: 禁用状态防止重复发送
```

#### AI 响应交互
```
[AI 消息气泡]
  ├── 打字动画: 模拟实时输入效果
  ├── 建议按钮: 点击快速应用建议
  ├── 复制功能: 悬停显示复制按钮
  └── Agent 标识: 不同角色显示不同图标
```

### 3. 实时文档预览交互

#### 文档同步交互
```
[文档预览区]
  ├── 实时更新: 对话内容变化时平滑更新
  ├── 高亮标注: AI 建议以彩色高亮显示
  ├── 点击展开: 点击高亮区域显示详细建议
  └── 滚动同步: 自动滚动到更新位置
```

#### 标注交互
```
[AI 标注]
  ├── 类型区分:
  │   ├── 🔴 冲突: 红色高亮，感叹号图标
  │   ├── 💡 建议: 蓝色高亮，灯泡图标
  │   └── ❓ 疑问: 黄色高亮，问号图标
  ├── 展开详情: 点击显示浮层详情
  ├── 快速操作: "采纳"、"忽略"按钮
  └── 状态变化: 处理后变更视觉状态
```

---

## 🎨 交互状态设计

### 按钮状态
```css
/* 默认状态 */
.btn {
  transform: translateY(0);
  transition: all 200ms ease-out;
}

/* 悬停状态 */
.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 激活状态 */
.btn:active {
  transform: translateY(0);
  transition: all 100ms ease-out;
}

/* 加载状态 */
.btn--loading {
  pointer-events: none;
  position: relative;
  color: transparent;
}

.btn--loading::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  top: 50%;
  left: 50%;
  margin: -8px 0 0 -8px;
  border: 2px solid currentColor;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s linear infinite;
}
```

### 卡片交互状态
```css
.card {
  transition: all 200ms ease-out;
  cursor: pointer;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: var(--color-primary-200);
}

.card:active {
  transform: translateY(-1px);
  transition: all 100ms ease-out;
}

/* 选中状态 */
.card--selected {
  border-color: var(--color-primary-500);
  background: var(--color-primary-50);
}
```

---

## ⚡ 动画和过渡效果

### 页面转场动画
```css
/* 页面进入动画 */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-enter {
  animation: slideInUp 300ms ease-out;
}

/* 模态框动画 */
@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-enter {
  animation: modalSlideIn 200ms ease-out;
}
```

### 列表项动画
```css
/* 列表项进入动画 */
.list-item {
  animation: fadeInUp 300ms ease-out;
  animation-fill-mode: backwards;
}

.list-item:nth-child(1) { animation-delay: 0ms; }
.list-item:nth-child(2) { animation-delay: 50ms; }
.list-item:nth-child(3) { animation-delay: 100ms; }
.list-item:nth-child(4) { animation-delay: 150ms; }

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### 加载动画
```css
/* 骨架屏动画 */
@keyframes shimmer {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

.skeleton {
  background: linear-gradient(
    90deg,
    #f0f0f0 0px,
    #e0e0e0 40px,
    #f0f0f0 80px
  );
  background-size: 200px;
  animation: shimmer 1.5s infinite;
}

/* 打字动画 */
@keyframes typing {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.typing-indicator {
  display: inline-flex;
  gap: 2px;
}

.typing-indicator span {
  width: 4px;
  height: 4px;
  background: var(--color-text-tertiary);
  border-radius: 50%;
  animation: typing 1.5s infinite;
}

.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
```

---

## 📱 响应式交互设计

### 触摸优化
```css
/* 触摸目标最小尺寸 44px */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 触摸反馈 */
.touch-feedback {
  -webkit-tap-highlight-color: rgba(59, 130, 246, 0.15);
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

/* 移动端优化的按钮 */
@media (max-width: 768px) {
  .btn {
    padding: 12px 20px;
    font-size: 16px; /* 防止iOS自动缩放 */
  }
}
```

### 手势支持
```javascript
// 滑动手势示例 (伪代码)
class SwipeGesture {
  constructor(element, options = {}) {
    this.element = element;
    this.threshold = options.threshold || 50;
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    let startX, startY, startTime;
    
    this.element.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      startTime = Date.now();
    });
    
    this.element.addEventListener('touchend', (e) => {
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;
      const deltaTime = Date.now() - startTime;
      
      // 判断滑动方向和距离
      if (Math.abs(deltaX) > this.threshold && deltaTime < 300) {
        const direction = deltaX > 0 ? 'right' : 'left';
        this.onSwipe(direction);
      }
    });
  }
  
  onSwipe(direction) {
    // 触发滑动事件
    this.element.dispatchEvent(new CustomEvent('swipe', { 
      detail: { direction } 
    }));
  }
}
```

---

## 🔧 具体组件交互规范

### 1. 项目仪表盘

#### 搜索交互时序
```
用户输入 → 防抖(300ms) → API请求 → 显示结果
    ↓
  显示搜索中状态 → 更新结果 → 高亮匹配项
```

#### 项目卡片状态机
```
默认状态 
├── hover → 悬停高亮
├── focus → 键盘焦点框
├── active → 按下反馈
└── click → 导航到项目
```

### 2. 创建项目对话框

#### 表单验证交互
```javascript
// 实时验证示例
const validateProjectName = (name) => {
  const rules = [
    { test: name => name.length >= 3, message: '项目名称至少3个字符' },
    { test: name => name.length <= 50, message: '项目名称不超过50个字符' },
    { test: name => /^[a-zA-Z0-9\u4e00-\u9fa5\s-_]+$/.test(name), 
      message: '只能包含字母、数字、中文、空格和连字符' }
  ];
  
  for (const rule of rules) {
    if (!rule.test(name)) {
      return { valid: false, message: rule.message };
    }
  }
  
  return { valid: true };
};

// 防抖验证
const debouncedValidate = debounce(validateProjectName, 300);
```

#### 模态框交互规范
```
打开模态框:
1. 显示遮罩层 (opacity: 0 → 1)
2. 模态框缩放进入 (scale: 0.95 → 1)
3. 自动聚焦到第一个输入框
4. 捕获焦点在模态框内

关闭模态框:
1. ESC键 / 点击遮罩 / 点击关闭按钮
2. 模态框缩放退出 (scale: 1 → 0.95)
3. 遮罩层淡出 (opacity: 1 → 0)
4. 恢复之前的焦点位置
```

### 3. 对话界面

#### 消息发送流程
```
用户输入 → 点击发送 → 禁用输入 → 显示发送中
    ↓
  消息上屏 → 显示AI思考 → 逐字显示回复 → 恢复输入
```

#### 自动滚动逻辑
```javascript
const scrollToBottom = (smooth = true) => {
  const container = messagesContainer.current;
  const scrollOptions = {
    top: container.scrollHeight,
    behavior: smooth ? 'smooth' : 'auto'
  };
  
  // 只有用户在底部时才自动滚动
  const isNearBottom = container.scrollTop + container.clientHeight 
                      >= container.scrollHeight - 50;
  
  if (isNearBottom) {
    container.scrollTo(scrollOptions);
  }
};
```

---

## ♿ 无障碍交互设计

### 键盘导航
```javascript
// 键盘导航管理器
class KeyboardNavigationManager {
  constructor(container) {
    this.container = container;
    this.focusableElements = [
      'button', 
      'input', 
      'select', 
      'textarea', 
      'a[href]',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');
  }
  
  trapFocus(event) {
    if (event.key !== 'Tab') return;
    
    const focusables = this.container.querySelectorAll(this.focusableElements);
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    
    if (event.shiftKey) {
      if (document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }
}
```

### 屏幕阅读器支持
```html
<!-- 项目卡片的无障碍标记 -->
<div 
  class="project-card"
  role="button"
  tabindex="0"
  aria-label="项目：在线课程平台，最后更新于2024年1月1日"
  aria-describedby="project-status-active"
>
  <h3>在线课程平台</h3>
  <p>最后更新：2024-01-01</p>
  <span id="project-status-active" class="sr-only">状态：进行中</span>
</div>

<!-- 搜索框的无障碍标记 -->
<div role="search">
  <label for="project-search" class="sr-only">搜索项目</label>
  <input 
    id="project-search"
    type="text"
    placeholder="搜索项目..."
    aria-describedby="search-help"
  />
  <div id="search-help" class="sr-only">
    输入项目名称进行搜索，支持按名称和状态筛选
  </div>
</div>
```

---

## 🎯 微交互细节

### 加载状态微交互
```css
/* 按钮加载状态 */
.btn--loading {
  overflow: hidden;
  position: relative;
}

.btn--loading::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}
```

### 成功状态动画
```css
/* 成功检查标记动画 */
@keyframes checkmark {
  0% {
    stroke-dasharray: 0 50;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 25 25;
    stroke-dashoffset: -25;
  }
  100% {
    stroke-dasharray: 50 0;
    stroke-dashoffset: -50;
  }
}

.checkmark-icon {
  stroke-dasharray: 0 50;
  animation: checkmark 0.6s ease-out forwards;
}
```

### 错误状态摇摆动画
```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

.error-shake {
  animation: shake 0.5s ease-in-out;
}
```

---

## 📋 交互测试清单

### 基础交互测试
- [ ] 所有可点击元素有明确的悬停状态
- [ ] 按钮有加载、禁用状态的视觉反馈
- [ ] 表单验证有实时反馈
- [ ] 错误状态有清晰的提示信息
- [ ] 成功操作有确认反馈

### 键盘导航测试
- [ ] Tab 键可以访问所有交互元素
- [ ] 焦点指示器清晰可见
- [ ] Enter/Space 键可以激活按钮
- [ ] ESC 键可以关闭模态框
- [ ] 焦点管理符合预期

### 触摸设备测试
- [ ] 触摸目标尺寸足够大 (≥44px)
- [ ] 长按操作有反馈
- [ ] 滑动手势工作正常
- [ ] 避免误触操作

### 性能测试
- [ ] 动画流畅，无卡顿 (60fps)
- [ ] 交互响应时间 <100ms
- [ ] 大列表滚动性能良好
- [ ] 内存使用量合理

---

这份交互设计指南为 Clario 项目提供了完整的用户交互标准，确保用户在使用过程中有一致、流畅、愉悦的体验。开发团队应该根据这些规范来实现各个组件的交互效果。