# 代码审查检查清单

**文档版本**: 1.0.0  
**适用范围**: Clario 项目所有代码审查

## 🎯 审查目标

代码审查旨在确保：
- 代码质量和可维护性
- 遵循项目规范和最佳实践
- 功能正确性和测试覆盖
- 安全性和性能考虑

---

## 📋 通用检查项

### ✅ 基础要求
- [ ] **分支命名规范**: `feature/task-{sprint}-{number}` 或 `fix/issue-description`
- [ ] **提交信息**: 使用约定式提交 (feat:, fix:, docs:, etc.)
- [ ] **文件组织**: 按照项目结构规范放置文件
- [ ] **代码格式**: 通过所有 lint 和格式检查
- [ ] **类型安全**: 无 TypeScript/MyPy 类型错误
- [ ] **导入清理**: 无未使用的导入语句
- [ ] **调试代码**: 无 console.log, print() 等调试输出残留

### ✅ 文档和注释
- [ ] **公共 API**: 有完整的 JSDoc/docstring 文档
- [ ] **复杂逻辑**: 有必要的内联注释说明
- [ ] **类型定义**: 复杂类型有清晰的注释
- [ ] **TODO/FIXME**: 标记了负责人和时间线
- [ ] **变更日志**: 重要变更更新了相关文档

---

## 🐍 Python (后端) 检查项

### ✅ 代码风格和结构
- [ ] **函数长度**: 单个函数不超过 50 行
- [ ] **类职责**: 单一职责原则，类的功能聚焦
- [ ] **模块导入**: 按标准顺序（标准库、第三方、本地）
- [ ] **命名规范**: snake_case 用于变量和函数，PascalCase 用于类
- [ ] **常量定义**: 使用大写字母和下划线

```python
# ✅ 好的示例
from typing import Dict, List, Optional
from datetime import datetime

from fastapi import HTTPException
from pydantic import BaseModel

from app.models.spec import ProjectSpec
from app.services.base import BaseService

class ProjectService(BaseService):
    """项目管理服务
    
    负责项目的 CRUD 操作和相关业务逻辑。
    """
    
    async def create_project(
        self, 
        project_id: str, 
        spec_data: Dict[str, Any]
    ) -> ProjectSpec:
        """创建新项目"""
        if not project_id or len(project_id) < 3:
            raise ValueError("项目ID长度至少3个字符")
            
        # 业务逻辑...
        return await self._save_project(project_id, spec)
```

### ✅ 错误处理
- [ ] **异常类型**: 使用具体的异常类型，避免裸露的 `except:`
- [ ] **错误信息**: 错误信息有意义，便于调试
- [ ] **错误传播**: 适当的错误传播和转换
- [ ] **资源清理**: 正确处理文件、连接等资源

```python
# ✅ 好的错误处理
async def load_project(self, project_id: str) -> ProjectSpec:
    try:
        file_path = self._get_project_path(project_id)
        async with aiofiles.open(file_path, 'r') as f:
            data = json.loads(await f.read())
        return ProjectSpec.model_validate(data)
    except FileNotFoundError:
        raise ProjectNotFoundError(f"项目 {project_id} 不存在")
    except json.JSONDecodeError as e:
        raise ProjectValidationError(f"项目文件格式错误: {e}")
```

### ✅ API 设计
- [ ] **HTTP 状态码**: 使用正确的状态码
- [ ] **请求验证**: 使用 Pydantic 模型验证输入
- [ ] **响应格式**: 统一的响应格式
- [ ] **错误处理**: API 错误返回结构化信息
- [ ] **文档生成**: API 端点有正确的类型注解用于自动文档

```python
# ✅ 好的 API 设计
@router.post("/projects/", response_model=ProjectResponse, status_code=201)
async def create_project(request: CreateProjectRequest) -> ProjectResponse:
    """创建新项目
    
    Args:
        request: 创建项目请求数据
        
    Returns:
        创建的项目信息
        
    Raises:
        HTTPException: 当项目创建失败时
    """
    try:
        spec = await project_service.create_project(
            request.project_id, 
            request.spec
        )
        return ProjectResponse.from_spec(spec)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"创建项目失败: {e}")
        raise HTTPException(status_code=500, detail="内部服务器错误")
```

### ✅ 异步编程
- [ ] **async/await**: 正确使用异步语法
- [ ] **IO 操作**: 所有 IO 操作都是异步的
- [ ] **并发控制**: 适当使用 asyncio.gather 或 asyncio.as_completed
- [ ] **资源管理**: 正确管理异步上下文管理器

---

## ⚛️ React/TypeScript (前端) 检查项

### ✅ 组件设计
- [ ] **组件大小**: 单个组件不超过 200 行
- [ ] **单一职责**: 每个组件有明确单一的职责
- [ ] **Props 接口**: 完整的 Props 类型定义
- [ ] **默认值**: 可选 props 有合理默认值
- [ ] **组件导出**: 使用命名导出而非默认导出

```typescript
// ✅ 好的组件设计
interface ProjectCardProps {
  project: Project;
  onSelect: (projectId: string) => void;
  onDelete?: (projectId: string) => void;
  isLoading?: boolean;
  className?: string;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onSelect,
  onDelete,
  isLoading = false,
  className = ''
}) => {
  const handleSelect = useCallback(() => {
    onSelect(project.id);
  }, [project.id, onSelect]);

  // 组件实现...
};
```

### ✅ Hooks 使用
- [ ] **Hook 依赖**: useEffect/useCallback/useMemo 依赖数组正确
- [ ] **自定义 Hook**: 复杂逻辑提取为自定义 Hook
- [ ] **状态管理**: 使用适当的状态管理方案
- [ ] **内存泄漏**: 组件卸载时清理订阅和定时器

```typescript
// ✅ 好的 Hook 使用
export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取项目失败');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    isLoading,
    error,
    refetch: fetchProjects
  };
};
```

### ✅ 状态管理
- [ ] **状态结构**: 状态结构扁平化，避免深层嵌套
- [ ] **状态更新**: 使用不可变更新模式
- [ ] **状态分离**: UI 状态和业务状态合理分离
- [ ] **全局状态**: 仅在必要时使用全局状态

```typescript
// ✅ 好的状态管理 (Zustand)
interface ConversationState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

interface ConversationActions {
  addMessage: (message: Message) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;
}

export const useConversationStore = create<ConversationState & ConversationActions>(
  (set) => ({
    messages: [],
    isLoading: false,
    error: null,

    addMessage: (message) =>
      set((state) => ({
        messages: [...state.messages, message]
      })),

    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    clearMessages: () => set({ messages: [] })
  })
);
```

### ✅ 性能优化
- [ ] **Re-render 优化**: 使用 React.memo, useMemo, useCallback 优化
- [ ] **列表渲染**: 长列表使用虚拟化或分页
- [ ] **懒加载**: 适当使用 React.lazy 和 Suspense
- [ ] **Bundle 大小**: 避免导入整个库，使用 tree-shaking

---

## 🧪 测试检查项

### ✅ 测试覆盖
- [ ] **覆盖率**: 新功能测试覆盖率 ≥80%
- [ ] **测试类型**: 包含单元测试、集成测试
- [ ] **边界测试**: 测试边界条件和异常情况
- [ ] **回归测试**: 修复 bug 后添加相应测试

### ✅ 测试质量
- [ ] **测试独立**: 测试用例相互独立，可并行运行
- [ ] **测试数据**: 使用 mock 数据，不依赖外部服务
- [ ] **断言清晰**: 断言信息明确，便于理解失败原因
- [ ] **测试命名**: 测试名称描述期望行为

```python
# ✅ 好的测试示例
@pytest.mark.asyncio
async def test_create_project_with_valid_data_returns_spec():
    """测试使用有效数据创建项目应返回项目规格"""
    # Arrange
    project_id = "test-project"
    spec_data = {
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
    
    # Act
    result = await project_service.create_project(project_id, spec_data)
    
    # Assert
    assert isinstance(result, ProjectSpec)
    assert result.core_idea.problem_statement == "Test problem"
    assert len(result.scope.in_scope) == 1
```

```typescript
// ✅ 好的前端测试
describe('ProjectCard', () => {
  const mockProject: Project = {
    id: 'test-project',
    name: 'Test Project',
    lastUpdated: '2024-01-01',
    specVersion: '1.0'
  };

  it('should call onSelect when card is clicked', () => {
    const onSelect = jest.fn();
    
    render(<ProjectCard project={mockProject} onSelect={onSelect} />);
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(onSelect).toHaveBeenCalledWith('test-project');
  });

  it('should display loading spinner when isLoading is true', () => {
    const onSelect = jest.fn();
    
    render(
      <ProjectCard 
        project={mockProject} 
        onSelect={onSelect} 
        isLoading={true} 
      />
    );
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
```

---

## 🔒 安全检查项

### ✅ 通用安全
- [ ] **输入验证**: 所有用户输入都经过验证
- [ ] **输出转义**: 防止 XSS 攻击
- [ ] **敏感信息**: 不在代码中硬编码密钥或敏感数据
- [ ] **错误信息**: 错误信息不泄露敏感系统信息

### ✅ 后端安全
- [ ] **SQL 注入**: 使用参数化查询或 ORM
- [ ] **CORS 配置**: 正确配置跨域访问
- [ ] **身份验证**: API 端点有适当的权限检查
- [ ] **速率限制**: 考虑 API 速率限制

### ✅ 前端安全
- [ ] **XSS 防护**: 用户内容正确转义
- [ ] **敏感数据**: 不在客户端存储敏感信息
- [ ] **HTTPS**: 生产环境强制使用 HTTPS
- [ ] **依赖安全**: 定期更新依赖，检查安全漏洞

---

## ⚡ 性能检查项

### ✅ 后端性能
- [ ] **数据库查询**: 避免 N+1 查询问题
- [ ] **缓存策略**: 适当使用缓存减少重复计算
- [ ] **并发处理**: 合理使用异步和并发
- [ ] **资源管理**: 及时释放文件句柄、数据库连接等

### ✅ 前端性能
- [ ] **渲染优化**: 避免不必要的重新渲染
- [ ] **资源加载**: 图片、脚本等资源按需加载
- [ ] **内存泄漏**: 清理事件监听器和订阅
- [ ] **打包优化**: 合理的代码分割和懒加载

---

## 📝 审查流程

### 1. 审查前准备
- [ ] **理解需求**: 了解 PR 要解决的问题
- [ ] **检查分支**: 确认从正确分支创建
- [ ] **运行测试**: 本地运行测试确保通过

### 2. 审查过程
- [ ] **整体架构**: 检查代码架构是否合理
- [ ] **逻辑正确**: 验证业务逻辑实现正确
- [ ] **代码质量**: 按照检查清单逐项审查
- [ ] **测试充分**: 确认测试覆盖关键功能

### 3. 审查反馈
- [ ] **建设性**: 提供具体、建设性的反馈
- [ ] **优先级**: 区分必修改和建议改进
- [ ] **示例代码**: 提供改进建议的示例代码
- [ ] **学习机会**: 指出好的实践和学习资源

### 4. 审查完成
- [ ] **Approve**: 代码质量达标可批准合并
- [ ] **Request Changes**: 需要修改时明确指出问题
- [ ] **Comment**: 非阻塞性建议可仅评论

---

## ✅ 审查模板

### PR 审查评论模板

```markdown
## 🎯 整体评价
<!-- 简要评价这个 PR 的整体质量 -->

## ✅ 优点
<!-- 指出代码中做得好的地方 -->

## 🔧 必须修改 (Blocking)
<!-- 必须修改的问题 -->
- [ ] 

## 💡 建议改进 (Non-blocking)
<!-- 建议但非强制的改进点 -->
- [ ] 

## 📚 学习资源
<!-- 相关的学习资源或最佳实践文档 -->

## 🚀 下次可以尝试
<!-- 对开发者技能提升的建议 -->
```

---

## 🎓 审查者指南

### 新人代码审查要点
- **教育性**: 重点在于帮助学习而非挑错
- **具体性**: 提供具体的改进建议和示例
- **鼓励性**: 认可好的实践，鼓励持续改进
- **资源性**: 提供学习资源帮助成长

### 高级开发者代码审查要点
- **架构性**: 关注设计模式和架构决策
- **性能性**: 考虑性能影响和优化机会
- **维护性**: 评估代码的长期可维护性
- **创新性**: 鼓励新技术和方法的探索

---

这份检查清单确保所有代码审查都能维持高质量标准，同时为不同经验水平的开发者提供明确的指导。记住，代码审查是一个学习和改进的过程，目标是构建更好的产品和团队。