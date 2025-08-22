# Phase 1 MVP 开发计划 (视觉设计整合版)

**文档版本**: 1.2.0  
**创建日期**: 2025-08-21  
**更新日期**: 2025-08-21  
**设计系统版本**: 1.0.0  
**目标用户**: 初级/中级工程师

## 📋 总览

Phase 1 目标：实现 MVP 核心场景，支持基本的项目管理和 AI 引导式需求澄清功能。

**持续时间**: 4-6 周  
**团队配置**: 2-3 名工程师（1前端 + 1后端 + 1全栈）  
**核心交付物**: 可演示的端到端用户旅程

## 🎨 **新增：设计规范整合**

在开始任何开发任务前，团队需要先了解和应用以下设计规范：

### 必读设计文档
- 📚 `docs/design-system.md` - 完整设计系统和组件规范
- 🖱️ `docs/ui-interaction-guide.md` - 交互设计和动画规范  
- 🏗️ `docs/css-architecture-guide.md` - CSS 架构和实现指南

### 设计令牌使用
**所有前端组件必须使用设计令牌**，禁止硬编码样式值：
```css
/* ❌ 错误的硬编码方式 */
.button {
  background: #3b82f6;
  padding: 12px 24px;
  border-radius: 8px;
}

/* ✅ 正确的令牌使用方式 */
.button {
  background: var(--color-primary-500);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
}
```

---

## 🏗️ 开发环境准备

### 必要工具安装
```bash
# 后端环境
cd backend
uv sync  # 安装所有依赖

# 前端环境  
cd frontend
pnpm install
pnpm exec playwright install chromium  # 首次安装

# 验证环境
cd backend && uv run pytest -q
cd frontend && pnpm test && pnpm validate-design
```

### 开发服务启动
```bash
# Terminal 1: 后端服务
cd backend
uv run uvicorn app.main:app --reload --port 8000

# Terminal 2: 前端服务 (带设计验证)
cd frontend  
pnpm dev:validate  # 启动在 http://localhost:5173 并启用设计系统验证
```

### **新增：设计系统开发环境**
```bash
# 设计系统验证和自动修复
cd frontend
pnpm validate-design              # 验证设计系统使用
pnpm validate-design:watch        # 监视模式验证  
pnpm validate-design:fix          # 自动修复部分问题

# 设计系统集成测试
node scripts/test-design-system-integration.js

# 设计系统环境初始化 (首次运行)
node scripts/setup-design-system-validation.js
```

---

## 🎯 Sprint 任务分解

### Sprint 1: 项目管理基础 + 设计系统建立 (1.5 周)

#### **新任务 1.0: 设计系统基础建设**
**负责人**: 前端工程师  
**预估工作量**: 2 天

**任务描述**:
建立 Clario 设计系统的基础架构，创建设计令牌和核心组件样式。

**具体要求**:
1. 创建设计令牌 CSS 文件
2. 建立 CSS Modules 架构
3. 创建核心组件样式模板
4. 搭建设计验证工具

**文件清单**:
```
frontend/src/
├── styles/
│   ├── tokens/
│   │   ├── colors.css         # 颜色令牌
│   │   ├── typography.css     # 字体令牌
│   │   ├── spacing.css        # 间距令牌
│   │   ├── shadows.css        # 阴影令牌
│   │   └── index.css          # 令牌统一入口
│   ├── base/
│   │   ├── reset.css          # CSS 重置
│   │   └── global.css         # 全局样式
│   └── components/
│       ├── Button.module.css  # 按钮组件样式
│       ├── Card.module.css    # 卡片组件样式
│       └── Form.module.css    # 表单组件样式
├── components/
│   └── ui/                    # 基础 UI 组件目录
│       ├── Button/
│       ├── Card/
│       └── ...
└── tools/
    └── design-validator.ts    # 设计规范验证工具
```

**验收标准**:
- [ ] 所有设计令牌正确实现并可通过 CSS 变量访问
- [ ] 基础组件(Button, Card)样式完整且支持所有变体
- [ ] 设计验证工具能检测硬编码值
- [ ] 响应式断点和工具类正常工作
- [ ] 深色主题切换功能正常
- [ ] 通过设计系统一致性检查

---

#### 任务 1.1: 前端项目仪表盘组件 `scn-project-dashboard` (重构版)
**负责人**: 前端工程师  
**预估工作量**: 3 天  
**前置依赖**: 任务 1.0 完成

**任务描述**:
**重构现有的 ProjectDashboard 组件**，使其完全符合设计系统规范。

**重构要求**:
1. **移除所有内联样式** - 当前组件使用了大量内联 style
2. **使用 CSS Modules** - 按照 `docs/css-architecture-guide.md` 规范重构
3. **应用设计令牌** - 所有颜色、间距、字体使用设计令牌
4. **实现交互规范** - 按照 `docs/ui-interaction-guide.md` 添加动画和状态

**文件清单**:
```
frontend/src/
├── components/
│   ├── ProjectDashboard/
│   │   ├── ProjectDashboard.tsx       # 重构主组件
│   │   ├── ProjectDashboard.module.css # 新增样式文件
│   │   └── index.ts
│   ├── ProjectCard/
│   │   ├── ProjectCard.tsx            # 重构卡片组件
│   │   ├── ProjectCard.module.css     # 新增样式文件
│   │   └── index.ts
│   └── SearchBar/
│       ├── SearchBar.tsx              # 重构搜索组件
│       ├── SearchBar.module.css       # 新增样式文件
│       └── index.ts
├── hooks/
│   └── useProjects.ts                 # 项目数据获取 hook
└── types/
    └── project.ts                     # 项目类型定义
```

**重构验收标准**:
- [ ] **零内联样式** - 移除所有 style 属性
- [ ] **设计令牌使用** - 所有样式值使用 CSS 变量
- [ ] **组件变体支持** - 按钮、卡片支持 size/variant 属性
- [ ] **交互动画** - 悬停、点击、加载状态有适当动画
- [ ] **响应式布局** - 在手机/平板/桌面正常显示
- [ ] **无障碍支持** - 键盘导航、屏幕阅读器支持
- [ ] **设计一致性** - 通过设计验证工具检查
- [ ] **性能优化** - CSS 体积合理，无重复样式

**重构示例**:
```tsx
// ❌ 重构前 (当前代码)
<button
  style={{
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    // ... 更多内联样式
  }}
>

// ✅ 重构后
import styles from './ProjectDashboard.module.css';
<button
  className={clsx(
    styles.button,
    styles.primary,
    isLoading && styles.loading
  )}
>
```

---

#### 任务 1.2: 前端项目创建对话框 `scn-create-project` (设计系统版)
**负责人**: 前端工程师  
**预估工作量**: 2 天

**任务描述**:
基于设计系统实现创建新项目的模态对话框。

**设计系统应用要求**:
1. 使用 `Modal.module.css` 模态框样式模板
2. 应用表单设计规范（输入框、标签、验证）
3. 实现按钮交互动画
4. 支持键盘导航和无障碍

**文件清单**:
```
frontend/src/
├── components/
│   ├── CreateProjectModal/
│   │   ├── CreateProjectModal.tsx
│   │   ├── CreateProjectModal.module.css
│   │   └── index.ts
│   └── ui/
│       ├── Modal/
│       │   ├── Modal.tsx              # 通用模态框组件
│       │   ├── Modal.module.css
│       │   └── index.ts
│       └── Input/
│           ├── Input.tsx              # 通用输入框组件
│           ├── Input.module.css
│           └── index.ts
├── hooks/
│   └── useCreateProject.ts            # 创建项目 hook
└── utils/
    └── validation.ts                  # 表单验证工具
```

**验收标准**:
- [ ] 模态框动画符合设计规范（缩放进入/退出）
- [ ] 表单组件使用设计系统样式
- [ ] 输入验证有实时视觉反馈
- [ ] 支持键盘操作（ESC 关闭，Tab 导航）
- [ ] 错误状态有摇摆动画
- [ ] 成功状态有确认动画
- [ ] 通过无障碍检查工具验证

---

### Sprint 2: AI 引导探索 + 实时反馈系统 (1.5 周)

#### 任务组 2A: AI 引导探索系统 (6 天)

##### 任务 2A.1: 后端 Agent 基础架构
**负责人**: 后端工程师（中级+）  
**预估工作量**: 3 天  
**前置依赖**: 无

**任务目标**: 建立多智能体系统的基础架构，为 AI 引导对话提供技术支撑

**子任务拆解**:
1. **Agent 抽象层实现** (1 天)
   - 创建 `BaseAgent` 抽象类和接口定义
   - 实现 `AgentContext` 和 `AgentResponse` 数据模型
   - 建立 Agent 生命周期管理机制
   
2. **PromoterAgent 核心实现** (1.5 天)
   - 实现引导提问和探索逻辑
   - 集成 LLM 服务 (OpenAI/Anthropic)
   - 实现上下文记忆和状态追踪
   
3. **Agent 协调器开发** (0.5 天)
   - 实现 `AgentOrchestrator` 意图识别
   - 建立 Agent 选择和调度机制
   - 添加错误处理和降级策略

**文件清单**:
```
backend/src/app/
├── agents/
│   ├── __init__.py
│   ├── base.py              # BaseAgent 抽象类
│   ├── promoter.py          # PromoterAgent 实现
│   └── orchestrator.py      # Agent 协调器
├── models/
│   ├── agent.py             # Agent 相关数据模型
│   └── conversation.py      # 对话数据模型
├── services/
│   ├── llm_service.py       # LLM 集成服务
│   └── conversation_service.py # 对话管理服务
└── api/
    └── conversation.py      # 对话 API 端点
```

**验收标准**:
- [ ] BaseAgent 抽象层完整实现
- [ ] PromoterAgent 能生成引导性问题
- [ ] LLM 服务集成稳定，响应时间 < 5秒
- [ ] Agent 协调器能正确路由用户意图
- [ ] 单元测试覆盖率 ≥ 85%
- [ ] API 响应格式符合前端需求

**技能要求**:
- Python 异步编程经验
- LLM API 集成经验
- 设计模式（策略、工厂模式）理解
- 单元测试编写能力

---

##### 任务 2A.2: 前端对话界面框架
**负责人**: 前端工程师（中级）  
**预估工作量**: 2 天  
**前置依赖**: 设计系统建立完成

**任务目标**: 建立 AI 对话界面的基础组件和状态管理

**子任务拆解**:
1. **对话组件基础架构** (1 天)
   - 创建 `ConversationInterface` 主组件
   - 实现 `MessageList` 消息列表组件
   - 建立消息渲染和滚动管理
   
2. **输入和状态管理** (1 天)
   - 实现 `MessageInput` 智能输入框
   - 创建 `useConversation` hook
   - 建立 Zustand conversation store

**文件清单**:
```
frontend/src/
├── components/
│   ├── ConversationInterface/
│   │   ├── ConversationInterface.tsx
│   │   ├── ConversationInterface.module.css
│   │   └── index.ts
│   ├── MessageList/
│   │   ├── MessageList.tsx
│   │   ├── MessageList.module.css
│   │   └── index.ts
│   └── MessageInput/
│       ├── MessageInput.tsx
│       ├── MessageInput.module.css
│       └── index.ts
├── hooks/
│   └── useConversation.ts
├── stores/
│   └── conversationStore.ts
└── types/
    └── conversation.ts
```

**验收标准**:
- [ ] 组件完全使用设计系统样式 (零内联 styles)
- [ ] 消息列表支持虚拟滚动 (处理大量消息)
- [ ] 输入框支持多行文本和快捷键 (Ctrl+Enter 发送)
- [ ] 状态管理支持乐观更新和错误回滚
- [ ] 组件单元测试覆盖率 ≥ 80%
- [ ] 响应式设计在移动端正常显示

**技能要求**:
- React Hooks 和组件设计经验
- CSS Modules 和响应式设计
- 状态管理 (Zustand) 使用
- 单元测试编写 (Vitest)

---

##### 任务 2A.3: AI 引导逻辑集成
**负责人**: 全栈工程师（高级）  
**预估工作量**: 1 天  
**前置依赖**: 2A.1, 2A.2 完成

**任务目标**: 集成前后端，实现完整的 AI 引导对话流程

**子任务拆解**:
1. **WebSocket 通信建立** (0.5 天)
   - 建立前后端 WebSocket 连接
   - 实现消息序列化和错误处理
   - 添加连接重试和状态同步
   
2. **引导流程测试** (0.5 天)
   - 端到端测试 AI 引导场景
   - 性能优化和错误边界处理
   - 集成测试和回归验证

**验收标准**:
- [ ] WebSocket 连接稳定，支持断线重连
- [ ] AI 响应流畅，无明显延迟感知
- [ ] 错误处理完善，用户体验友好
- [ ] E2E 测试覆盖核心引导流程

**技能要求**:
- 前后端集成经验
- WebSocket 实时通信开发
- E2E 测试编写 (Playwright)

---

#### 任务组 2B: 实时反馈系统 (4 天)

##### 任务 2B.1: 文档预览组件
**负责人**: 前端工程师（初级+）  
**预估工作量**: 2 天  
**前置依赖**: 设计系统建立完成

**任务目标**: 实现实时文档预览和同步显示功能

**子任务拆解**:
1. **Markdown 渲染组件** (1 天)
   - 创建 `DocumentPreview` 组件
   - 集成 React Markdown 渲染器
   - 实现自定义样式和主题支持
   
2. **实时同步管理** (1 天)
   - 实现 `RealTimeSyncManager` 类
   - 建立文档状态订阅机制
   - 添加平滑的更新动画

**文件清单**:
```
frontend/src/
├── components/
│   ├── DocumentPreview/
│   │   ├── DocumentPreview.tsx
│   │   ├── DocumentPreview.module.css
│   │   └── index.ts
│   └── WorkspaceLayout/
│       ├── WorkspaceLayout.tsx
│       ├── WorkspaceLayout.module.css
│       └── index.ts
├── services/
│   └── RealTimeSyncManager.ts
└── hooks/
    └── useDocumentSync.ts
```

**验收标准**:
- [ ] Markdown 渲染符合设计系统字体层级
- [ ] 文档更新有平滑过渡动画 (300ms)
- [ ] 双栏布局响应式适配
- [ ] 滚动同步自然流畅
- [ ] 支持深色主题切换

**技能要求**:
- React Markdown 使用经验
- CSS 动画和过渡效果
- 响应式布局设计

---

##### 任务 2B.2: 后端文档同步服务
**负责人**: 后端工程师（初级+）  
**预估工作量**: 1.5 天  
**前置依赖**: 2A.1 完成

**任务目标**: 建立文档状态管理和实时推送机制

**子任务拆解**:
1. **文档状态管理** (1 天)
   - 扩展 ProjectService 支持增量更新
   - 实现文档版本控制和冲突检测
   - 添加文档变更历史记录
   
2. **WebSocket 推送机制** (0.5 天)
   - 实现文档更新的实时推送
   - 添加客户端状态同步
   - 建立推送优化策略

**验收标准**:
- [ ] 文档增量更新精确有效
- [ ] WebSocket 推送及时稳定
- [ ] 多客户端同步一致性保证
- [ ] 性能满足实时体验要求

**技能要求**:
- Python 异步编程
- WebSocket 开发经验
- 数据结构和算法理解

---

##### 任务 2B.3: 高亮标注系统
**负责人**: 全栈工程师（中级+）  
**预估工作量**: 0.5 天  
**前置依赖**: 2B.1, 2B.2 完成

**任务目标**: 实现 AI 建议的可视化标注功能

**子任务拆解**:
1. **高亮组件实现** (0.5 天)
   - 创建 `HighlightManager` 类
   - 实现动态高亮渲染
   - 添加标注交互逻辑

**验收标准**:
- [ ] 高亮标注动画吸引注意力
- [ ] 标注类型视觉区分清晰
- [ ] 采纳建议交互流畅

**技能要求**:
- DOM 操作和事件处理
- CSS 动画设计

---

#### Sprint 2 验收里程碑

**核心功能验收**:
- [ ] 用户可以与 AI 进行引导式对话
- [ ] 对话内容实时更新到文档预览
- [ ] AI 可以提供针对性的探索建议
- [ ] 文档变更有可视化反馈
- [ ] 系统响应时间 ≤ 3秒 (90% 的情况)

**技术质量验收**:
- [ ] 单元测试覆盖率 ≥ 80%
- [ ] E2E 测试覆盖主要用户流程
- [ ] 代码通过 lint 和类型检查
- [ ] 设计系统一致性验证通过
- [ ] 性能指标满足要求

**用户体验验收**:
- [ ] 界面响应流畅，无明显卡顿
- [ ] 错误处理友好，有明确提示
- [ ] 支持键盘和触摸操作
- [ ] 在主流浏览器正常工作

---

### Sprint 3: 范围协作定义 + 高亮系统 (1.5 周)

#### 任务 3.2: 前端范围定义界面 (交互设计版)
**负责人**: 前端工程师  
**预估工作量**: 4 天

**交互设计重点**:
1. **拖拽排序** - 范围项支持拖拽重排
2. **AI 建议卡片** - 独特的视觉样式和交互
3. **采纳建议动画** - 建议被采纳时的视觉反馈
4. **状态转场** - 范围项状态变化的平滑过渡

**新增验收标准**:
- [ ] 拖拽交互流畅，有视觉反馈
- [ ] AI 建议卡片有独特的样式标识
- [ ] 采纳建议有成功动画效果
- [ ] 范围列表变化有过渡动画
- [ ] 触摸设备上拖拽操作正常

---

### Sprint 4: 实时预览系统 + 高级交互 (2 周)

#### 任务 4.2: 前端双栏布局和文档预览 (设计系统完整版)
**负责人**: 前端工程师  
**预估工作量**: 5 天

**设计系统核心应用**:
1. **响应式布局** - 完整的断点系统应用
2. **文档渲染样式** - Markdown 内容的视觉层级
3. **实时同步动画** - 内容更新的视觉过渡
4. **滚动同步** - 平滑的自动滚动效果

**新增验收标准**:
- [ ] 双栏布局在所有断点正常显示
- [ ] Markdown 渲染符合设计系统的字体层级
- [ ] 文档更新有平滑的过渡动画
- [ ] 滚动同步动画自然流畅
- [ ] 支持分割条拖拽调整布局比例

---

#### 任务 4.3: 文档高亮和标注系统 (微交互设计版)
**负责人**: 全栈工程师  
**预估工作量**: 4 天

**微交互设计**:
1. **高亮动画** - AI 标注出现时的动画效果
2. **悬停交互** - 标注悬停时的详情展示
3. **采纳反馈** - 采纳建议的微动画
4. **状态指示** - 不同类型标注的视觉区分

**新增验收标准**:
- [ ] 高亮标注有吸引注意力的进入动画
- [ ] 悬停详情有优雅的浮层效果
- [ ] 采纳建议有满意的反馈动画
- [ ] 标注类型的颜色和图标清晰区分
- [ ] 标注密度高时不会视觉混乱

---

## 🧪 **更新：质量保障标准**

### 设计系统验收标准
所有前端任务额外增加以下设计系统验收标准：

1. **设计令牌使用**:
   - [ ] 零硬编码值，所有样式使用 CSS 变量
   - [ ] 通过设计验证工具检查

2. **组件系统**:
   - [ ] 组件支持设计系统定义的所有变体
   - [ ] 组件API与设计规范一致

3. **交互设计**:
   - [ ] 所有动画符合设计系统的时长和缓动
   - [ ] 交互状态（hover, active, focus）完整实现

4. **响应式设计**:
   - [ ] 在所有定义的断点正常显示
   - [ ] 触摸设备交互优化

5. **无障碍性**:
   - [ ] 通过 axe-core 自动化检查
   - [ ] 键盘导航完整支持
   - [ ] 屏幕阅读器友好

### **新增：设计系统验证工具**

#### 自动化检查脚本
```bash
# 设计令牌验证
pnpm run design:validate-tokens

# 组件一致性检查  
pnpm run design:validate-components

# 无障碍性检查
pnpm run a11y:check

# 视觉回归测试
pnpm run visual:test
```

#### 开发时实时验证
- ESLint 规则检测硬编码值
- Stylelint 规则检测设计系统违规
- 浏览器开发工具集成

---

## 📋 **新增：设计系统检查清单**

每个 PR 合并前必须通过的设计系统检查：

### 视觉一致性
- [ ] 使用设计系统定义的颜色、字体、间距
- [ ] 组件变体和状态完整实现
- [ ] 响应式断点正确应用

### 交互一致性  
- [ ] 动画时长和缓动函数符合规范
- [ ] 交互状态视觉反馈充分
- [ ] 键盘和触摸交互支持

### 代码质量
- [ ] CSS 架构符合项目规范
- [ ] 组件 API 设计合理
- [ ] 性能指标达标

### 用户体验
- [ ] 加载状态处理充分
- [ ] 错误状态提示友好
- [ ] 无障碍性支持完整

---

通过这个更新的开发计划，团队将在实现功能的同时建立完整的设计系统，确保 Clario 产品有一致、专业、高质量的用户界面体验。每个Sprint都包含了具体的设计系统应用要求和验收标准，让开发者能够清楚地知道如何应用设计规范。