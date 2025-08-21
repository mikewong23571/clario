# 开发者入门指南

**文档版本**: 1.0.0  
**目标用户**: 新加入 Clario 项目的初级/中级工程师

## 🎯 欢迎加入 Clario 团队！

这份指南将帮助你快速上手 Clario 项目，了解代码结构、开发流程和最佳实践。

---

## 📚 项目概览

### 核心业务
Clario 是一个**多智能体协作的需求澄清与文档生成平台**，帮助个人开发者和小团队：
- 通过 AI 对话澄清模糊的项目想法
- 生成结构化的需求规格文档
- 支持实时预览和协作编辑

### 技术栈
- **前端**: React 18 + TypeScript + Vite + Zustand
- **后端**: FastAPI + Python 3.12 + Pydantic + AsyncIO
- **AI 服务**: OpenAI/Anthropic API
- **实时通信**: WebSocket (Socket.IO)
- **测试**: pytest + Vitest + Playwright

---

## 🚀 环境搭建

### 1. 克隆代码库
```bash
git clone <repository-url>
cd clario
```

### 2. 后端环境设置
```bash
cd backend

# 安装 uv（如果没有）
pip install uv

# 安装依赖
uv sync

# 验证安装
uv run python --version  # 应显示 Python 3.12.x
```

### 3. 前端环境设置
```bash
cd frontend

# 安装 pnpm（如果没有）
npm install -g pnpm

# 安装依赖
pnpm install

# 安装 Playwright（首次）
pnpm exec playwright install chromium
```

### 4. 配置环境变量
```bash
# 复制环境变量模板
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 编辑 backend/.env 添加必要配置
OPENAI_API_KEY=your_openai_api_key_here
```

### 5. 验证环境
```bash
# 测试后端
cd backend
uv run pytest -q

# 测试前端  
cd frontend
pnpm test

# 运行 E2E 测试（可选）
pnpm e2e
```

---

## 📁 项目结构

### 后端结构 (`backend/src/app/`)
```
app/
├── main.py                 # FastAPI 应用入口
├── api/                    # API 路由层
│   ├── projects.py         # 项目管理 API
│   ├── conversation.py     # 对话 API  
│   └── validation.py       # 验证 API
├── agents/                 # AI 智能体系统
│   ├── base.py            # Agent 抽象基类
│   ├── orchestrator.py    # Agent 协调器
│   ├── scope_planner.py   # 范围规划 Agent
│   └── promoter.py        # 推进者 Agent
├── models/                 # 数据模型
│   ├── spec.py            # 项目规格模型
│   └── conversation.py    # 对话模型
├── services/              # 业务逻辑层
│   ├── project.py         # 项目服务
│   ├── ai_client.py       # AI 客户端
│   └── session.py         # 会话管理
└── websocket/             # WebSocket 处理
    └── events.py          # 实时事件处理
```

### 前端结构 (`frontend/src/`)
```
src/
├── main.tsx               # 应用入口点
├── App.tsx                # 根组件
├── components/            # React 组件
│   ├── ProjectDashboard.tsx
│   ├── ConversationInterface.tsx
│   ├── DocumentPreview.tsx
│   └── WorkspaceLayout.tsx
├── hooks/                 # 自定义 React Hooks
│   ├── useProjects.ts
│   ├── useConversation.ts
│   └── useDocumentSync.ts
├── services/              # 外部服务集成
│   ├── api.ts             # API 客户端
│   └── RealTimeSyncManager.ts
├── stores/                # Zustand 状态管理
│   ├── projectStore.ts
│   └── conversationStore.ts
├── types/                 # TypeScript 类型定义
│   ├── project.ts
│   └── conversation.ts
└── utils/                 # 工具函数
    ├── validation.ts
    └── formatting.ts
```

---

## 🛠️ 开发工作流

### 日常开发流程

#### 1. 启动开发服务
```bash
# Terminal 1: 启动后端
cd backend
uv run uvicorn app.main:app --reload --port 8000

# Terminal 2: 启动前端
cd frontend
pnpm dev  # 访问 http://localhost:5173
```

#### 2. 任务开发流程
```bash
# 1. 创建功能分支
git checkout -b feature/task-name

# 2. 开发功能（TDD 方式）
# - 先写测试
# - 再写实现
# - 重构优化

# 3. 运行测试
cd backend && uv run pytest
cd frontend && pnpm test

# 4. 代码检查
cd backend && uv run ruff check . && uv run mypy .
cd frontend && pnpm lint && pnpm format:check

# 5. 提交代码
git add .
git commit -m "feat: implement task description"

# 6. 创建 Pull Request
git push origin feature/task-name
```

### 代码风格规范

#### Python (后端)
```python
# 好的示例
async def create_project(
    project_id: str, 
    spec_data: Dict[str, Any]
) -> ProjectSpec:
    """创建新项目
    
    Args:
        project_id: 项目唯一标识符
        spec_data: 项目规格数据
        
    Returns:
        创建的项目规格对象
        
    Raises:
        ValueError: 当项目ID已存在时
    """
    if await self.project_exists(project_id):
        raise ValueError(f"项目 {project_id} 已存在")
    
    spec = ProjectSpec.model_validate(spec_data)
    await self.save_project(project_id, spec)
    return spec
```

#### TypeScript (前端)
```typescript
// 好的示例
interface ProjectCardProps {
  project: Project;
  onSelect: (projectId: string) => void;
  isLoading?: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onSelect,
  isLoading = false
}) => {
  const handleClick = useCallback(() => {
    onSelect(project.id);
  }, [project.id, onSelect]);

  return (
    <div 
      className="project-card"
      onClick={handleClick}
      role="button"
      tabIndex={0}
    >
      <h3>{project.name}</h3>
      <p>{project.lastUpdated}</p>
      {isLoading && <Spinner />}
    </div>
  );
};
```

---

## 🧪 测试指南

### 后端测试
```python
# backend/tests/api/test_projects.py
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_create_project_success(client: AsyncClient):
    """测试成功创建项目"""
    project_data = {
        "project_id": "test-project",
        "spec": {
            "lastUpdated": "2024-01-01",
            "specVersion": "1.0",
            "coreIdea": {
                "problemStatement": "Test problem",
                "targetAudience": "Test users", 
                "coreValue": "Test value"
            },
            "scope": {
                "inScope": ["feature1"],
                "outOfScope": ["feature2"]
            }
        }
    }
    
    response = await client.post("/projects/", json=project_data)
    assert response.status_code == 201
    assert response.json()["coreIdea"]["problemStatement"] == "Test problem"

@pytest.mark.asyncio
async def test_create_project_validation_error(client: AsyncClient):
    """测试创建项目时的验证错误"""
    invalid_data = {"project_id": "test", "spec": {}}
    
    response = await client.post("/projects/", json=invalid_data)
    assert response.status_code == 400
```

### 前端测试
```typescript
// frontend/src/components/ProjectCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ProjectCard } from './ProjectCard';

const mockProject = {
  id: 'test-project',
  name: 'Test Project',
  lastUpdated: '2024-01-01',
  specVersion: '1.0'
};

describe('ProjectCard', () => {
  it('renders project information correctly', () => {
    const onSelect = jest.fn();
    
    render(<ProjectCard project={mockProject} onSelect={onSelect} />);
    
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('2024-01-01')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', () => {
    const onSelect = jest.fn();
    
    render(<ProjectCard project={mockProject} onSelect={onSelect} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalledWith('test-project');
  });
});
```

---

## 🤖 AI 系统开发指南

### Agent 开发模式
```python
# backend/src/app/agents/example_agent.py
from .base import BaseAgent, AgentContext, AgentResponse

class ExampleAgent(BaseAgent):
    """示例智能体实现"""
    
    def get_system_prompt(self) -> str:
        return """你是一个专业的助手，负责...
        
        你的职责包括：
        1. 分析用户输入
        2. 提供专业建议
        3. 更新相关文档
        """
    
    async def process(self, context: AgentContext) -> AgentResponse:
        # 1. 分析上下文
        analysis = self._analyze_context(context)
        
        # 2. 生成提示词
        prompt = self._build_prompt(context, analysis)
        
        # 3. 调用 LLM
        llm_response = await self.llm_client.complete(prompt)
        
        # 4. 解析响应并返回结构化数据
        return AgentResponse(
            agent_type=self.agent_type,
            content=llm_response.content,
            suggestions=self._extract_suggestions(llm_response),
            document_updates=self._extract_updates(llm_response),
            next_action=self._determine_next_action(llm_response)
        )
    
    def _analyze_context(self, context: AgentContext) -> Dict[str, Any]:
        """分析上下文，提取关键信息"""
        return {
            "current_phase": self._determine_phase(context.project_spec),
            "missing_info": self._find_missing_info(context.project_spec),
            "user_intent": self._classify_intent(context.user_input)
        }
```

### 前端 AI 交互模式
```typescript
// frontend/src/hooks/useConversation.ts
export const useConversation = (projectId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const sendMessage = useCallback(async (content: string) => {
    // 添加用户消息
    const userMessage: Message = {
      id: generateId(),
      type: 'user',
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      // 发送到后端
      const response = await api.post(`/projects/${projectId}/conversation`, {
        message: content
      });
      
      // 添加 AI 响应
      const aiMessage: Message = {
        id: generateId(),
        type: 'ai',
        content: response.content,
        agentType: response.agent_type,
        suggestions: response.suggestions,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      
      // 处理文档更新
      if (response.document_updates) {
        updateDocument(response.document_updates);
      }
      
    } catch (error) {
      // 错误处理
      const errorMessage: Message = {
        id: generateId(),
        type: 'error',
        content: '抱歉，发生了错误，请稍后再试。',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);
  
  return {
    messages,
    isLoading,
    sendMessage
  };
};
```

---

## 🔧 常用工具和命令

### 开发命令速查
```bash
# 后端
uv run uvicorn app.main:app --reload    # 启动开发服务器
uv run pytest                          # 运行所有测试
uv run pytest -k "test_name"           # 运行特定测试
uv run pytest --cov=app               # 运行测试并查看覆盖率
uv run ruff check .                    # 代码检查
uv run ruff format .                   # 代码格式化
uv run mypy .                          # 类型检查

# 前端
pnpm dev                               # 启动开发服务器
pnpm test                              # 运行单元测试
pnpm test:watch                        # 监视模式运行测试
pnpm e2e                              # 运行 E2E 测试
pnpm lint                             # ESLint 检查
pnpm lint:fix                         # ESLint 修复
pnpm format                           # Prettier 格式化
pnpm build                            # 构建生产版本
```

### Git 提交规范
```bash
# 提交类型前缀
feat:     # 新功能
fix:      # 修复 bug
docs:     # 文档更新
style:    # 代码格式调整
refactor: # 重构
test:     # 测试相关
chore:    # 构建过程或辅助工具变动

# 示例
git commit -m "feat: add project creation dialog"
git commit -m "fix: resolve websocket connection issue"
git commit -m "test: add unit tests for scope planner agent"
```

---

## 🆘 常见问题和解决方案

### 环境问题

**Q: `uv sync` 失败，提示 Python 版本不匹配**
```bash
# A: 检查 Python 版本
python --version  # 需要 3.12.x

# 如果版本不对，安装正确版本
# Windows: 从官网下载安装
# macOS: brew install python@3.12
# Linux: pyenv install 3.12.0
```

**Q: 前端安装依赖失败**
```bash
# A: 清理缓存重新安装
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**Q: WebSocket 连接失败**
```bash
# A: 检查后端服务是否启动，端口是否正确
netstat -an | grep 8000  # 检查端口占用
```

### 开发问题

**Q: AI API 调用超时或失败**
```bash
# A: 检查网络连接和 API Key
# 1. 确认 .env 文件中的 API Key 正确
# 2. 测试网络连接到 OpenAI
# 3. 查看错误日志了解具体问题
```

**Q: 测试运行失败**
```bash
# A: 逐步检查
# 1. 确保所有依赖已安装
# 2. 检查测试数据库连接
# 3. 清理测试缓存
pytest --cache-clear
```

**Q: 类型检查错误**
```bash
# A: 确保类型注解完整
# 1. 检查导入语句
# 2. 添加必要的类型注解
# 3. 参考现有代码的类型定义
```

---

## 📖 学习资源

### 必读文档
- [FastAPI 文档](https://fastapi.tiangolo.com/)
- [React 18 文档](https://react.dev/)
- [Pydantic 文档](https://docs.pydantic.dev/)
- [Zustand 文档](https://github.com/pmndrs/zustand)

### 项目特定资源
- `docs/tech-design.md` - 技术架构设计
- `docs/phase1-development-plan.md` - 开发计划
- `meta-doc/spec.schema.json` - 数据模型规范

### 推荐工具
- **VSCode 扩展**: Python, TypeScript, ESLint, Prettier
- **API 测试**: Thunder Client, Postman
- **数据库工具**: DB Browser for SQLite（如适用）

---

## 🎉 开始你的第一个任务！

现在你已经了解了 Clario 项目的基本信息，可以开始你的第一个开发任务了！

### 下一步
1. 阅读 `docs/phase1-development-plan.md` 了解当前开发计划
2. 根据你的角色（前端/后端/全栈）选择合适的任务
3. 创建功能分支开始开发
4. 遇到问题及时沟通

**记住**：每个任务都有详细的验收标准，按照标准完成即可。不要害怕提问，团队会支持你的成长！

欢迎加入 Clario 团队，期待你的贡献！ 🚀