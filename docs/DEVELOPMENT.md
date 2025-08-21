# 开发指南（Development Guide）

本指南将“前后端分离 + TDD 优先”的工程实践落地，帮助你在本仓库快速启动、编写与验证代码，并在持续演进中保持高内聚、低耦合与可测试性。

## 1. 系统概览
- 形态：Web 应用（前后端分离）
  - 前端：React + Vite + TypeScript（端口 5173）
  - 后端：FastAPI + Python（端口 8000），依赖/环境由 uv 管理
- 目标：以 TDD 驱动，从最小可运行测试开始，逐步扩展到集成与端到端；优先拉通 MVP 闭环（仪表盘、新建项目、引导式探索、范围定义、实时预览、导出、继续工作）。
- 需求与约束来源：`docs/clario-spec.md`（规格为单一真实源）。

## 2. 目录结构（精简）
```
clario/
├── backend/                     # Python 后端 （FastAPI + uv + pytest）
│   ├── pyproject.toml
│   ├── src/app/main.py          # FastAPI 入口（含 /health）
│   └── tests/                   # pytest 测试
├── frontend/                    # 前端 （React + Vite + Vitest + Playwright）
│   ├── package.json
│   ├── src/                     # 源码与单元测试
│   ├── tests/e2e/               # 端到端测试（Playwright）
│   └── vite.config.ts
├── docs/                        # 文档与规范
│   ├── clario-spec.md           # 业务需求规格（权威）
│   └── DEVELOPMENT.md           # 本开发文档
└── meta-doc/                    # 兼容/参考的 Schema 与生成器
    ├── spec.schema.json
    └── spec-to-markdown.py
```

## 3. 运行环境与工具链
- 前端
  - Node.js ≥ 18，包管理器：pnpm
  - 构建：Vite；单元测试：Vitest；E2E：Playwright
- 后端
  - Python 3.12，依赖与虚拟环境：uv（基于 `pyproject.toml`）
  - Web 框架：FastAPI；测试：pytest（asyncio 自动）
- 质量工具
  - Python：ruff（lint）、mypy（严格类型检查）
  - 前端：TypeScript 严格模式；后续可加入 ESLint/Prettier（按需）

## 4. 快速开始（Windows PowerShell，逐条执行）
### 4.1 后端
```
cd backend
uv venv
uv pip install -e .[dev]
uv run pytest -q
uv run uvicorn app.main:app --reload --port 8000  # 开发服务（可选）
```
> 注意：PowerShell 不支持 `&&` 串联，上述命令需逐条执行。

### 4.2 前端
```
cd frontend
pnpm install
pnpm test                         # Vitest 单元测试
pnpm exec playwright install chromium
pnpm e2e                          # Playwright 端到端测试
pnpm dev                          # 开发服务器（可选）
```

### 4.3 代码质量检查（前端）
```
cd frontend
pnpm lint                         # ESLint 检查
pnpm lint:fix                     # ESLint 自动修复
pnpm format                       # Prettier 格式化
pnpm format:check                 # Prettier 格式检查
```
或从根目录执行：
```
pnpm lint:fe                      # 前端 ESLint 检查
pnpm lint:fe:fix                  # 前端 ESLint 自动修复
pnpm format:fe                    # 前端 Prettier 格式化
pnpm format:fe:check              # 前端 Prettier 格式检查
```

默认前端端口 5173，后端端口 8000。后续通过 `VITE_API_URL` 等环境变量对接后端。

## 5. 测试策略与命令一览
- 单元测试
  - 后端：`uv run pytest -q`
  - 前端：`pnpm test`
- 集成测试（后端）
  - 使用 `httpx.AsyncClient` 对 FastAPI 进行集成测试（见 `backend/tests` 示例）
- 端到端（E2E）
  - 前端目录执行：`pnpm exec playwright install chromium`，后续 `pnpm e2e`
  - `playwright.config.ts` 已配置自动启动本地 Vite 开发服务器
- 按 TDD 流程推进
  1) 先写失败的测试（单元或端到端）
  2) 最小实现使其通过
  3) 重构并补齐边界测试

## 6. 编码规范与质量基线
- Python（在 `backend/pyproject.toml` 中配置）
  - ruff：`uv run ruff check backend/src backend/tests`
  - mypy：`uv run mypy backend/src backend/tests`
- TypeScript（已配置 ESLint + Prettier）
  - tsconfig 严格模式开启
  - ESLint：已配置 TypeScript、React、React Hooks 支持，集成 Prettier 规则
  - Prettier：统一代码格式（分号、单引号、尾随逗号等）
  - 配置文件：`eslint.config.js`、`.prettierrc`、`.prettierignore`
- 提交规范
  - 建议采用 Conventional Commits：`feat: ...` `fix: ...` `test: ...` `chore: ...`
  - 建议在提交前运行 `pnpm lint:fix` 和 `pnpm format` 确保代码质量

## 7. 架构与模块边界（可演进，Ports & Adapters）
- Domain（领域）：核心模型与规则（对齐 `meta-doc/spec.schema.json`），不依赖外界
- Application（服务）：ProjectService、Exporter 协调工作流；依赖 Domain 接口
- Adapters（适配器）：文件存储、LLM Provider、Markdown 渲染器、前端 UI
- Session 模式：当前按 A2（不持久化对话，只持久化文档）；预留演进到 C（显式会话）
- Feature Flags：Later 特性（一致性检查、按需审查、版本历史等）通过开关启用

## 8. 前后端契约与数据模型
- API 前缀规划：`/api/v1`（后续统一迁移 `/health` → `/api/v1/health`）
- 数据模型：以 `docs/clario-spec.md` 为权威，严格对齐 `meta-doc/spec.schema.json`；
  - 后端：pydantic 模型 + 校验
  - 前端：后续引入 Ajv 或 zod 进行 Schema 校验与类型推导

## 9. 配置与环境变量
- 默认端口：前端 5173，后端 8000
- 前端 API 地址：`VITE_API_URL`（示例：`http://localhost:8000`），在开发与部署时通过环境注入
- 安全与日志：后续集中到 Config 模块，避免凭证入库与日志

## 10. CI/CD（规划）
- GitHub Actions（建议）
  - Job 1：前端（pnpm install → lint/tsc → vitest → e2e smoke）
  - Job 2：后端（uv venv → install → ruff/mypy → pytest）
  - 缓存 pnpm/uv 依赖；E2E 完整套件跑夜间构建
- 版本与发布：以后续约定的分支策略与标签命名为准

## 11. 任务拆解（便于派发）
- 基础设施
  - ✅ 已完成：`pnpm-workspace.yaml`，前端 ESLint/Prettier 配置
  - 待完成：Git hooks（lint-staged）
- 后端
  - `/api/v1/health` 与 API 版本化骨架；ProjectService 草稿（内存实现 → 文件存储）
  - pydantic 模型对齐 Schema；迁移器与版本字段
- 前端
  - Dashboard（项目列表/创建）、Editor 基础布局（左对话/右预览）、Markdown 渲染
  - 一键导出（调用后端 Exporter 输出 JSON/Markdown；对齐 `spec-to-markdown.py` 行为）
- 智能体（Later）
  - Orchestrator + Provider 抽象（超时/重试/降级/模拟器）
- 质量
  - 黄金样例：导出 JSON/Markdown 的快照对比；端到端以 `scn-*` 命名用例拉通

## 12. 常见问题与排错
- PowerShell 不支持 `&&`：命令请逐条执行
- Playwright 首次运行需安装浏览器：`pnpm exec playwright install chromium`
- Python 环境：使用 `uv venv` 创建隔离环境，避免污染系统 Python

## 13. 参考
- 业务规格：`docs/clario-spec.md`
- Schema 与生成器：`meta-doc/spec.schema.json`、`meta-doc/spec-to-markdown.py`

---
如需将某个场景（例如 `scn-create-project`）落地，请先编写端到端测试（Playwright），再回填前后端实现与集成测试，最后补齐单元测试与质量检查。

## 14. 工具最佳实践（uv 与 pnpm）

为保证一致性、可重复构建与快速反馈，工具使用遵循以下最佳实践。若需偏离，请先阅读 <mcfile name="project_rules.md" path=".trae/rules/project_rules.md"></mcfile> 的“技术边界/变更流程”，在 PR 中说明动机与影响面并经批准。

### 14.1 uv（Python 依赖与环境）
- 依赖声明
  - 唯一依赖源：backend/<mcfile name="pyproject.toml" path="backend/pyproject.toml"></mcfile>（含可选 extras：`[project.optional-dependencies].dev`）。
  - Python 版本：以 `.python-version` 为准（当前 3.12）；建议将 `requires-python` 与 mypy `python_version` 对齐（本仓将通过后续 PR 统一为 3.12）。
- 安装与运行（PowerShell，逐条执行）
  - cd backend
  - uv venv
  - uv pip install -e .[dev]
  - 运行工具统一用 `uv run <cmd>`，例如：
    - 测试：`uv run pytest -q`
    - Lint：`uv run ruff check .`
    - 类型检查：`uv run mypy .`
    - 本地服务：`uv run uvicorn app.main:app --reload --port 8000`
- 维护与重置
  - 环境损坏或异常时：删除 `.venv` → `uv venv` → `uv pip install -e .[dev]`。
- 反模式（不要做）
  - 不全局 `pip install`；不手动 `activate` 虚拟环境；不使用 `conda/poetry/pipenv`。
  - 不在系统 Python 环境直接运行测试/服务。
- CI 提示
  - 避免 `source .venv/bin/activate`；统一 `uv run` 调用：`uv run pytest -q`、`uv run ruff check .`、`uv run mypy .`。
  - 缓存 uv 安装目录以加速。

### 14.2 pnpm（Node 包与前端工具）
- 依赖与版本
  - 仅使用 pnpm；根 <mcfile name="package.json" path="package.json"></mcfile> 的 `packageManager` 已钉住版本，团队以此为准。
  - 必须提交 `pnpm-lock.yaml`，确保可复现安装。
- 常用命令（PowerShell，逐条执行）
  - cd frontend
  - pnpm install
  - 单测：`pnpm test`
  - 安装浏览器（首次）：`pnpm exec playwright install chromium`
  - E2E：`pnpm e2e`（配置会自动启动 `vite` 开发服务）
  - 开发服务：`pnpm dev`
  - 代码质量：`pnpm lint`、`pnpm lint:fix`、`pnpm format`、`pnpm format:check`
- 从仓库根调用子包脚本
  - 推荐：`pnpm -C frontend <script>`（例如 `pnpm -C frontend test`）
  - 根目录已配置快捷脚本：`pnpm lint:fe`、`pnpm lint:fe:fix`、`pnpm format:fe`、`pnpm format:fe:check`
- 快照策略（重要）
  - 目前 frontend 的 `test` 脚本为 `vitest run`（不更新快照），并提供 `test:update`：`vitest -u` 用于显式更新快照。
  - 在执行 `pnpm test` 时不会修改快照；如需更新请显式运行 `pnpm run test:update`。
- 反模式（不要做）
  - 不使用 `npm`/`yarn`；不引入 webpack/jest 等与既定栈冲突的工具。
  - 不在 CI 或默认脚本中执行会隐式修改仓库文件的命令（如自动更新快照）。
- CI 提示
  - 固定 Node 与 pnpm 版本；使用 `pnpm install --frozen-lockfile`。
  - 利用 pnpm 缓存；脚本按 `pnpm -C frontend test`、`pnpm -C frontend e2e` 执行。

以上最佳实践与 <mcfile name="project_rules.md" path=".trae/rules/project_rules.md"></mcfile> 的“技术边界”“最小反馈环”共同生效；若冲突，以规则与边界为准。