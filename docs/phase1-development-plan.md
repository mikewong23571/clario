# Phase 1 MVP 开发计划

**文档版本**: 1.0.0  
**创建日期**: 2025-08-21  
**目标用户**: 初级/中级工程师

## 📋 总览

Phase 1 目标：实现 MVP 核心场景，支持基本的项目管理和 AI 引导式需求澄清功能。

**持续时间**: 4-6 周  
**团队配置**: 2-3 名工程师（1前端 + 1后端 + 1全栈）  
**核心交付物**: 可演示的端到端用户旅程

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
cd frontend && pnpm test
```

### 开发服务启动
```bash
# Terminal 1: 后端服务
cd backend
uv run uvicorn app.main:app --reload --port 8000

# Terminal 2: 前端服务
cd frontend  
pnpm dev  # 启动在 http://localhost:5173
```

---

## 🎯 Sprint 任务分解

### Sprint 1: 项目管理基础 (1 周)

#### 任务 1.1: 前端项目仪表盘组件 `scn-project-dashboard`
**负责人**: 前端工程师  
**预估工作量**: 3 天

**任务描述**:
创建项目列表页面，展示用户的所有项目，支持搜索和基本操作。

**具体要求**:
1. 创建 `ProjectDashboard` React 组件
2. 集成现有的项目列表 API (`GET /projects`)
3. 实现项目卡片展示（名称、更新时间、状态）
4. 添加搜索/过滤功能
5. "创建新项目"按钮

**文件清单**:
```
frontend/src/
├── components/
│   ├── ProjectDashboard.tsx      # 主仪表盘组件
│   ├── ProjectCard.tsx           # 项目卡片组件
│   └── SearchBar.tsx             # 搜索栏组件
├── hooks/
│   └── useProjects.ts            # 项目数据获取 hook
└── types/
    └── project.ts                # 项目类型定义
```

**技术要求**:
- 使用 TanStack Query 进行服务端状态管理
- 组件必须支持 loading 和 error 状态
- 使用 TypeScript 严格模式
- 所有用户交互有 loading 反馈

**验收标准**:
- [ ] 页面正确显示项目列表
- [ ] 搜索功能正常工作（按项目名称）
- [ ] 点击项目卡片可以导航到项目详情页（暂时显示404即可）
- [ ] "创建新项目"按钮存在且有点击反馈
- [ ] 组件测试覆盖率 ≥80%
- [ ] 支持空状态和错误状态展示
- [ ] 通过 `pnpm lint` 和 `pnpm format:check`
- [ ] 在3种不同屏幕尺寸下展示正常

**测试要求**:
```typescript
// frontend/src/components/ProjectDashboard.test.tsx
describe('ProjectDashboard', () => {
  it('renders project list correctly')
  it('handles search functionality')  
  it('shows loading state while fetching')
  it('handles error state gracefully')
  it('navigates to project on card click')
})
```

---

#### 任务 1.2: 前端项目创建对话框 `scn-create-project`
**负责人**: 前端工程师  
**预估工作量**: 2 天

**任务描述**:
实现创建新项目的模态对话框，收集项目基本信息并调用 API 创建项目。

**具体要求**:
1. 创建模态对话框组件
2. 项目名称输入表单
3. 表单验证（项目名称必填，长度限制）
4. 调用现有创建项目 API (`POST /projects`)
5. 创建成功后跳转到项目工作区

**文件清单**:
```
frontend/src/
├── components/
│   └── CreateProjectModal.tsx    # 创建项目模态框
├── hooks/
│   └── useCreateProject.ts       # 创建项目 hook
└── utils/
    └── validation.ts             # 表单验证工具
```

**技术要求**:
- 使用 React Hook Form 进行表单管理
- 模态框使用 Radix UI 或类似的无样式组件库
- 提供明确的成功/失败反馈

**验收标准**:
- [ ] 点击"创建新项目"按钮打开模态框
- [ ] 表单验证正常工作（必填、长度检查）
- [ ] 成功创建项目后关闭模态框并跳转
- [ ] API 错误有用户友好的错误提示
- [ ] 支持 ESC 键和点击遮罩关闭
- [ ] 组件测试覆盖率 ≥80%
- [ ] 通过所有 lint 检查

---

### Sprint 2: AI 引导探索 (1.5 周)

#### 任务 2.1: 后端基础 Agent 系统框架
**负责人**: 后端工程师  
**预估工作量**: 4 天

**任务描述**:
实现多智能体系统的基础框架，为后续 AI 功能提供统一的抽象层。

**具体要求**:
1. 实现 `BaseAgent` 抽象基类
2. 实现 `AgentOrchestrator` 协调器
3. 集成 OpenAI API 客户端
4. 实现基础的 `PromoterAgent`（推进者）
5. 创建 Agent 相关的数据模型

**文件清单**:
```
backend/src/app/
├── agents/
│   ├── __init__.py
│   ├── base.py                   # BaseAgent 抽象类
│   ├── orchestrator.py          # Agent 协调器
│   ├── promoter.py              # 推进者 Agent
│   └── models.py                # Agent 数据模型
├── services/
│   └── ai_client.py             # AI 服务客户端
└── config/
    └── ai_settings.py           # AI 服务配置
```

**技术要求**:
- 使用 ABC (Abstract Base Class) 定义 Agent 接口
- 支持异步操作（async/await）
- 错误处理和重试机制
- 配置文件支持多个 AI 提供商

**验收标准**:
- [ ] `BaseAgent` 类定义完整，包含必要的抽象方法
- [ ] `AgentOrchestrator` 可以注册和调用 Agent
- [ ] OpenAI API 集成可用，能够发送请求并获取响应
- [ ] `PromoterAgent` 能够基于项目状态生成引导性问题
- [ ] 所有 Agent 方法都有完整的类型注解
- [ ] 单元测试覆盖率 ≥90%
- [ ] 通过 `uv run ruff check .` 和 `uv run mypy .`
- [ ] 包含详细的错误日志记录

**测试要求**:
```python
# backend/tests/agents/test_base.py
@pytest.mark.asyncio
async def test_agent_orchestrator_selects_correct_agent()

@pytest.mark.asyncio  
async def test_promoter_agent_generates_questions()

@pytest.mark.asyncio
async def test_ai_client_handles_api_errors()
```

---

#### 任务 2.2: 后端对话 API 端点
**负责人**: 后端工程师  
**预估工作量**: 2 天

**任务描述**:
创建对话相关的 API 端点，支持前端发送用户消息并获取 AI 响应。

**具体要求**:
1. 创建对话 API 路由
2. 实现消息发送和响应端点
3. 集成 Agent 系统处理用户输入
4. 添加对话历史存储

**文件清单**:
```
backend/src/app/
├── api/
│   └── conversation.py          # 对话 API 端点
├── models/
│   └── conversation.py          # 对话数据模型
└── services/
    └── conversation.py          # 对话业务逻辑
```

**技术要求**:
- RESTful API 设计
- 请求/响应数据验证
- 错误处理和状态码
- API 文档自动生成

**验收标准**:
- [ ] `POST /projects/{project_id}/conversation` 端点工作正常
- [ ] `GET /projects/{project_id}/conversation/history` 端点工作正常
- [ ] 请求数据验证完整
- [ ] 返回结构化的 Agent 响应
- [ ] API 文档在 `/docs` 中正确显示
- [ ] 集成测试覆盖所有端点
- [ ] 响应时间 <5 秒（测试环境）

**API 规范示例**:
```python
# POST /projects/{project_id}/conversation
{
  "message": "我想创建一个在线课程平台",
  "context": {}
}

# Response
{
  "agent_type": "PromoterAgent",
  "content": "很好的想法！让我帮你澄清一下核心问题...",
  "suggestions": ["明确目标用户群体", "定义核心价值主张"],
  "document_updates": {
    "coreIdea": { "problemStatement": "..." }
  },
  "next_action": "define_target_audience"
}
```

---

#### 任务 2.3: 前端对话界面组件
**负责人**: 前端工程师  
**预估工作量**: 3 天

**任务描述**:
创建对话界面，支持用户与 AI 进行文本对话，实现引导式想法探索流程。

**具体要求**:
1. 创建对话界面组件
2. 消息列表展示（用户消息 + AI 回复）
3. 消息输入框和发送功能
4. 对话状态管理
5. 集成对话 API

**文件清单**:
```
frontend/src/
├── components/
│   ├── ConversationInterface.tsx # 主对话界面
│   ├── MessageList.tsx          # 消息列表
│   ├── MessageItem.tsx          # 单个消息项
│   └── MessageInput.tsx         # 消息输入框
├── hooks/
│   └── useConversation.ts       # 对话状态管理
└── stores/
    └── conversationStore.ts     # 对话 Zustand store
```

**技术要求**:
- 使用 Zustand 管理对话状态
- 支持消息的 loading 状态
- 自动滚动到最新消息
- 消息时间戳显示

**验收标准**:
- [ ] 对话界面正确展示消息历史
- [ ] 用户可以发送消息并收到 AI 回复
- [ ] 消息发送有 loading 状态反馈
- [ ] 支持多行消息输入（Shift+Enter 换行）
- [ ] 长消息自动换行显示
- [ ] 组件测试覆盖率 ≥80%
- [ ] 在移动端正常显示
- [ ] AI 消息区分不同 Agent 类型（显示角色标签）

---

### Sprint 3: 范围协作定义 (1.5 周)

#### 任务 3.1: 后端范围规划 Agent
**负责人**: 后端工程师  
**预估工作量**: 4 天

**任务描述**:
实现 `ScopePlannerAgent`，负责协助用户定义项目范围，提供范围建议和挑战。

**具体要求**:
1. 实现 `ScopePlannerAgent` 类
2. 范围分析和建议逻辑
3. 与核心理念一致性检查
4. 范围建议的结构化输出

**文件清单**:
```
backend/src/app/
├── agents/
│   └── scope_planner.py         # 范围规划 Agent
├── services/
│   └── scope_analyzer.py        # 范围分析服务
└── prompts/
    └── scope_planner.py         # 提示词模板
```

**技术要求**:
- 继承 `BaseAgent` 抽象类
- 结构化的提示词工程
- 范围项的分类和优先级建议

**验收标准**:
- [ ] Agent 能基于核心理念生成范围建议
- [ ] 可以识别和挑战不合理的范围设定
- [ ] 返回结构化的范围更新建议
- [ ] 提供范围内外功能的明确分类
- [ ] 单元测试覆盖关键逻辑 ≥90%
- [ ] 与 `AgentOrchestrator` 正确集成

**测试用例示例**:
```python
@pytest.mark.asyncio
async def test_scope_planner_suggests_reasonable_scope():
    context = AgentContext(
        project_spec={"coreIdea": {"problemStatement": "..."}},
        user_input="我想做一个包含支付、物流、库存的电商平台"
    )
    response = await scope_planner.process(context)
    assert "scope" in response.document_updates
    assert len(response.suggestions) > 0
```

---

#### 任务 3.2: 前端范围定义界面
**负责人**: 前端工程师  
**预估工作量**: 3 天

**任务描述**:
创建范围定义界面，支持用户添加/编辑范围内外功能，展示 AI 建议。

**具体要求**:
1. 范围定义表单组件
2. 范围内外功能列表
3. AI 建议的可视化展示
4. 范围项的增删改操作

**文件清单**:
```
frontend/src/
├── components/
│   ├── ScopeDefinition.tsx      # 范围定义主组件
│   ├── ScopeItemList.tsx        # 范围项列表
│   ├── ScopeItemEditor.tsx      # 范围项编辑器
│   └── AISuggestion.tsx         # AI 建议展示
└── hooks/
    └── useScope.ts              # 范围管理 hook
```

**验收标准**:
- [ ] 用户可以添加范围内外功能项
- [ ] 支持拖拽排序范围项
- [ ] AI 建议以卡片形式展示
- [ ] 可以采纳或忽略 AI 建议
- [ ] 范围变更实时更新到文档预览
- [ ] 组件测试覆盖率 ≥80%

---

### Sprint 4: 实时预览系统 (2 周)

#### 任务 4.1: 后端 WebSocket 基础设施
**负责人**: 后端工程师  
**预估工作量**: 3 天

**任务描述**:
搭建 WebSocket 服务，支持前后端实时通信和文档同步。

**具体要求**:
1. 集成 Socket.IO 到 FastAPI
2. 实现项目房间管理
3. 文档更新事件广播
4. 连接状态管理

**文件清单**:
```
backend/src/app/
├── websocket/
│   ├── __init__.py
│   ├── connection_manager.py    # 连接管理器
│   └── events.py               # WebSocket 事件处理
└── requirements.txt            # 添加 python-socketio
```

**验收标准**:
- [ ] WebSocket 连接建立成功
- [ ] 支持多个客户端连接到不同项目房间
- [ ] 文档更新事件正确广播
- [ ] 连接断开和重连处理
- [ ] WebSocket 集成测试通过

---

#### 任务 4.2: 前端双栏布局和文档预览
**负责人**: 前端工程师  
**预估工作量**: 4 天

**任务描述**:
实现双栏工作区布局，左侧对话，右侧文档实时预览。

**具体要求**:
1. 响应式双栏布局
2. Markdown 文档渲染
3. 实时同步管理器
4. 文档滚动和导航

**文件清单**:
```
frontend/src/
├── components/
│   ├── WorkspaceLayout.tsx      # 工作区布局
│   ├── DocumentPreview.tsx      # 文档预览
│   └── MarkdownRenderer.tsx     # Markdown 渲染器
├── services/
│   └── RealTimeSyncManager.ts   # 实时同步管理
└── hooks/
    └── useDocumentSync.ts       # 文档同步 hook
```

**验收标准**:
- [ ] 双栏布局在不同屏幕尺寸正常显示
- [ ] Markdown 文档正确渲染
- [ ] 文档内容实时同步更新
- [ ] 支持文档内导航跳转
- [ ] WebSocket 连接状态指示器
- [ ] 组件测试覆盖率 ≥80%

---

#### 任务 4.3: 文档高亮和标注系统
**负责人**: 全栈工程师  
**预估工作量**: 3 天

**任务描述**:
实现文档中的 AI 建议高亮显示和交互功能。

**具体要求**:
1. 高亮标注组件
2. 标注点击展开详情
3. "采纳建议"交互
4. 标注状态管理

**验收标准**:
- [ ] AI 建议在文档中正确高亮
- [ ] 点击高亮区域显示建议详情
- [ ] 采纳建议后文档内容更新
- [ ] 支持多种标注类型（冲突、建议、疑问）
- [ ] 标注状态持久化

---

## 🧪 质量保障标准

### 通用验收标准
所有任务都必须满足：

1. **代码质量**:
   - [ ] 通过所有 lint 检查
   - [ ] 类型检查无错误
   - [ ] 代码格式规范
   - [ ] 无 console.log 残留（前端）

2. **测试覆盖**:
   - [ ] 单元测试覆盖率达标
   - [ ] 关键路径有集成测试
   - [ ] 错误处理有对应测试

3. **文档**:
   - [ ] 公共 API 有 JSDoc/docstring
   - [ ] 复杂逻辑有注释说明
   - [ ] README 更新（如需要）

4. **性能**:
   - [ ] 无内存泄漏
   - [ ] API 响应时间合理
   - [ ] UI 交互流畅

### 代码审查检查清单

**前端代码审查**:
- [ ] 组件职责单一，可复用性好
- [ ] 状态管理合理，避免 prop drilling
- [ ] 异步操作有适当的 loading/error 状态
- [ ] 无障碍性支持（基本的 aria-label）
- [ ] 移动端适配

**后端代码审查**:
- [ ] API 遵循 RESTful 设计原则
- [ ] 错误处理完整，返回有意义的错误信息
- [ ] 数据验证使用 Pydantic
- [ ] 异步操作正确使用 async/await
- [ ] 数据库操作有事务处理（如适用）

---

## 🚀 开发流程

### 任务开始前
1. 创建功能分支：`git checkout -b feature/task-{sprint}-{number}`
2. 阅读任务详细描述和验收标准
3. 如有疑问，与架构师沟通澄清

### 开发过程中
1. 按照文件清单组织代码结构
2. 优先编写测试（TDD 方式）
3. 小步提交，commit 信息要清晰
4. 每日与团队同步进度

### 任务完成后
1. 自检所有验收标准
2. 运行完整测试套件
3. 提交 Pull Request
4. 通过代码审查后合并

### 每周里程碑验证
- [ ] Sprint 1 结束：用户可以查看和创建项目
- [ ] Sprint 2 结束：基础 AI 对话功能工作
- [ ] Sprint 3 结束：范围定义流程完整
- [ ] Sprint 4 结束：实时预览系统可用

---

## 📞 支持和沟通

### 遇到问题时
1. **技术问题**: 查阅已有代码和文档
2. **需求不清**: 联系产品经理澄清
3. **架构问题**: 联系架构师讨论
4. **阻塞问题**: 及时在每日站会中提出

### 预期的常见问题
1. **Q: AI API 调用失败怎么办？**  
   A: 检查 API key 配置，查看错误日志，有重试机制

2. **Q: WebSocket 连接不稳定？**  
   A: 实现断线重连，有连接状态指示器

3. **Q: 组件测试怎么写？**  
   A: 参考已有测试文件，测试用户行为而不是实现细节

### 资源链接
- [React 测试最佳实践](https://testing-library.com/docs/react-testing-library/intro/)
- [FastAPI WebSocket 文档](https://fastapi.tiangolo.com/advanced/websockets/)
- [OpenAI API 文档](https://platform.openai.com/docs/api-reference)

---

这份开发计划确保每个任务都有明确的边界和标准，让初级工程师可以专注于实现而不用担心架构决策。通过规范的验收标准，架构师可以高效地验证交付质量。