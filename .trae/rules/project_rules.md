# 项目规则（Project Rules）

本规则用于约束一切代码修改与运行方式，确保可维护、可演化、可测试。修改代码前，务必阅读并遵循本规则与开发文档。

## 0. 必读
- 修改任何代码之前，必须先阅读并对齐 `docs/DEVELOPMENT.md`（开发指南）。
- 若本规则与开发指南存在歧义，以 `docs/DEVELOPMENT.md` 为准并在 PR 中提出修订建议。

## 1. 技术选型与工具边界（不得擅自更改）
- 后端（Python）
  - 语言/版本：Python 3.12
  - 框架：FastAPI
  - 依赖与环境：uv（虚拟环境与安装均使用 uv），测试：pytest，代码质量：ruff、mypy
  - 允许的标准命令（PowerShell，请逐条执行）：
    - `cd backend`
    - `uv sync`
    - `uv run pytest -q`
    - `uv run uvicorn app.main:app --reload --port 8000`
  - 禁止事项：
    - 禁用 `pip install` 全局安装、`virtualenv/venv` 手动管理、`conda/poetry/pipenv` 等非本项目标准工具
    - 不得启动与上述命令不一致的本地服务方式

- 前端（Web）
  - 技术栈：React + TypeScript + Vite，包管理：pnpm，测试：Vitest（单测）、Playwright（E2E）
  - 允许的标准命令：
    - `cd frontend`
    - `pnpm install`
    - `pnpm test`
    - `pnpm exec playwright install chromium`（首次安装浏览器）
    - `pnpm e2e`
    - `pnpm dev`
  - 禁止事项：
    - 不得使用 `npm`/`yarn` 代替 pnpm；不得引入 webpack、jest 等与既定栈冲突的工具
    - 不得改变 `playwright.config.ts` 的启动方式（默认 `pnpm dev`）除非在 PR 中经审批

- 跨平台注意：
  - PowerShell 不支持 `&&` 串联命令，请逐条执行。

## 2. 测试策略与最低要求（TDD 优先）
- 先写失败的测试，再补实现，最后重构。
- 所有 PR 至少包含：
  - 后端：pytest 通过（含必要的集成测试），关键模块需 mypy/ruff 通过
  - 前端：Vitest 通过；涉及用户流程的改动需至少 1 条 Playwright 用例（可走 smoke）
- 端到端测试以业务场景命名（如 `scn-create-project`），逐步覆盖 MVP 闭环。

## 3. 代码与目录约束
- 领域与契约
  - 业务单一真实源：`docs/clario-spec.md`
  - 数据契约需与 `meta-doc/spec.schema.json` 对齐；变更需提供迁移与测试
- 目录与模块
  - 严禁任意创建与现有边界不一致的目录/层次；新增模块需说明归属（domain/application/adapters/ui）
  - 优先高内聚低耦合：通过接口与契约测试隔离实现细节

## 4. 配置、环境与安全
- 端口：前端 5173，后端 8000；前端通过 `VITE_API_URL` 配置后端地址
- 禁止将凭证/密钥提交入库；日志中不得打印敏感信息
- 本地仅使用前述标准命令启动服务，不得自定义脚本绕过校验

## 5. 变更流程
- 任何“技术选型/工具链/边界”的变更，必须：
  1) 在 PR 中提出动机与影响面；
  2) 更新 `docs/DEVELOPMENT.md` 与本规则文档；
  3) 提供相应测试（单元/集成/E2E）与迁移说明；
  4) 通过 Code Review 才可合入。

## 6. 常见错误与处理
- Playwright 第一次运行失败：先执行 `pnpm exec playwright install chromium`
- PowerShell 命令报错：不要使用 `&&`，逐条执行命令
- Python 环境异常：用 `uv venv` 重新创建环境，并用 `uv pip install -e .[dev]` 重装依赖

## 7. 最小反馈环（Agent 开发工作法）

本节规定在本项目中进行任何功能或修复时，Agent 应遵循的最小反馈环，确保以最短周期完成“红-绿-重构”。在开始任何改动前，先对齐 <mcfile name="DEVELOPMENT.md" path="docs\DEVELOPMENT.md"></mcfile> 的相关章节与边界约束。

- 总则
  - 单次迭代只做一件可验证的小事，以最快速度获得反馈。
  - 任何涉及边界或契约的改动，先补测试，再实现；必要时同步修订开发文档与规则。
  - PowerShell 禁止使用 `&&` 串联命令，请逐条执行标准命令。

- 反馈环步骤
  1) 对齐上下文与验收标准
     - 阅读需求/规格：docs/clario-spec.md、docs/spec-analysis-matrix.md（若相关）。
     - 定义“这次迭代的验证点”（测试名称/断言）。

  2) 建立红灯（先写失败的测试）
     - 后端（pytest）
       - 在 backend/tests 下新增/修改测试用例，命名清晰、可读。
       - 命令（首次需要创建与安装）：
         - cd backend
         - uv sync
         - uv run pytest -q  # 期望失败（红灯）
     - 前端（Vitest 单元/组件测试）
       - 在 frontend/src 编写/修改 *.test.ts(x)。
       - 命令（首次安装依赖）：
         - cd frontend
         - pnpm install
         - pnpm test  # 期望失败（红灯），或进入 watch 快速迭代
     - 前端（Playwright E2E 场景）
       - 在 frontend/tests/e2e 下以业务场景命名用例（如 scn-create-project.spec.ts）。
       - 命令（首次安装浏览器 + 直接运行）：
         - cd frontend
         - pnpm exec playwright install chromium
         - pnpm e2e  # 期望失败（红灯），配置会自动启动 dev server

  3) 最小实现（让测试转绿）
     - 只编写让当前失败测试通过所需的最少代码，避免过度设计。
     - 命令（快速验证）：
       - 后端：
         - uv run pytest -q  # 直到转绿
         - uv run ruff check .
         - uv run mypy .
       - 前端：
         - pnpm test  # 直到转绿（必要时加 -- --watch）
         - 如涉及 UI 变化，启动本地预览并自测交互：pnpm dev（保持独立终端）

  4) 重构（保持绿灯）
     - 在测试绿灯下进行命名、抽象、解耦、去重等重构；每次小步验证测试仍为绿。

  5) 提交与同步
     - 本地确认全量测试通过：
       - 后端：uv run pytest -q；uv run ruff check .；uv run mypy .
       - 前端：pnpm test；如改动用户流程，执行 pnpm e2e。
     - 若触及 API/数据模型/契约：同步更新 <mcfile name="DEVELOPMENT.md" path="docs\DEVELOPMENT.md"></mcfile> 与本规则；在 PR 中说明影响面与迁移。
     - 遵循开发文档中的分支/提交规范，提交 PR，并附上关键测试输出片段（通过截图或日志粘贴）。

  6) 回归核验（合入前）
     - 再次运行全量校验：
       - 后端：uv run pytest -q；uv run ruff check .；uv run mypy .
       - 前端：pnpm test；pnpm e2e。

- 加速技巧（在不破坏边界的前提下）
  - 仅运行相关测试：
    - 后端：uv run pytest -q -k "关键字"
    - 前端：pnpm test -- -t "关键字"
  - Watch 模式：前端默认支持；后端可配合编辑器/文件监听触发。
  - Playwright 已配置 webServer，通常直接运行 pnpm e2e 即可，无需手动起 dev server。

- UI 变更的特别要求
  - 必须本地预览并自测交互；必要时补充 E2E 断言覆盖关键路径。
  - 如涉及视觉回归风险，优先使用语义化断言（文本、属性、可见性），避免依赖脆弱的像素对比。

- 任务粒度与回退
  - 若 30 分钟内仍未将红灯转为绿灯，应进一步拆小问题或暂存回退到更小的可验证目标。
  - 始终保证主干可用；未完成的工作用特性分支维护。

## 8. 工具最佳实践：uv 与 pnpm

为保障一致性与可重复构建，以下做法在本仓库被视为“最佳实践”。如需偏离，必须按“变更流程”提 PR 说明并经批准。

- uv（Python 依赖与环境）
  - Dos
    - 使用 <mcfile name="pyproject.toml" path="backend/pyproject.toml"></mcfile> 作为唯一依赖声明与开发依赖组（如 [dependency-groups].dev）。
    - 使用 `.python-version` 锁定大版本（当前为 3.12）；本地与 CI 均以此为准。
    - `uv sync` 会自动创建和管理虚拟环境，不需要手动激活，统一用 `uv run <cmd>` 运行一切工具：pytest、ruff、mypy、uvicorn 等。
    - 依赖管理命令（在 backend 目录下执行）：
      - 安装/同步依赖：`uv sync`
      - 添加新依赖：`uv add <package>` 或 `uv add --dev <package>`（开发依赖）
      - 移除依赖：`uv remove <package>`
      - 更新特定依赖：`uv sync --upgrade-package <package>`
      - 更新所有依赖：`uv lock --upgrade` 然后 `uv sync`
    - 需要重置环境时：删除 `.venv` 目录 → `uv sync`。
  - Don'ts
    - 不要使用 `pip install` 全局安装；不要手动 `activate` 虚拟环境；不要使用 `conda/poetry/pipenv`。
    - 不在系统 Python 环境直接运行测试/服务。
  - CI 提示
    - CI 中避免 `source .venv/bin/activate`，统一 `uv run` 调用，例如：`uv run pytest -q`、`uv run ruff check .`、`uv run mypy .`。
    - 建议将 `requires-python` 与 mypy 的 `python_version` 与 `.python-version` 对齐（当前仓库为 3.12；如不一致请提 PR 修正）。

- pnpm（Node 包与前端工具）
  - Dos
    - 仅使用 pnpm；根 <mcfile name="package.json" path="package.json"></mcfile> 的 `packageManager` 已钉住版本，确保团队一致。
    - 依赖管理命令（在 frontend 目录下执行）：
      - 安装/同步依赖：`pnpm install`
      - 添加新依赖：`pnpm add <package>` 或 `pnpm add -D <package>`（开发依赖）
      - 移除依赖：`pnpm remove <package>`（别名：`pnpm rm`、`pnpm uninstall`、`pnpm un`）
      - 更新特定依赖：`pnpm update <package>`
      - 更新所有依赖：`pnpm update`
      - 更新到最新版本：`pnpm update --latest`
    - 将"更新快照"与"运行测试"分离：建议使用 `test` 仅运行测试（不更新快照），新增 `test:update` 专门用于更新快照（已在 <mcfile name="package.json" path="frontend/package.json"></mcfile> 脚本中配置）。
    - 始终提交 `pnpm-lock.yaml`，保证依赖锁定与可复现安装。
    - 从仓库根运行子包脚本优先用 `pnpm -C frontend <script>`；或进入 `frontend` 再执行 `pnpm <script>`。
    - 首次运行 E2E 前执行一次：`pnpm exec playwright install chromium`。

以上最佳实践与“技术边界”共同生效；若存在冲突，以“技术边界”与 <mcfile name="DEVELOPMENT.md" path="docs/DEVELOPMENT.md"></mcfile> 为准。