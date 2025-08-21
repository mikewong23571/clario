# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Clario is a multi-agent collaborative requirement clarification and document generation platform. It helps individual developers and small teams transform vague ideas into clear, lightweight requirement specification documents through AI-driven dialogue.

**Core Architecture**: Frontend-backend separation with TDD-first engineering practices
- **Frontend**: React + Vite + TypeScript (port 5173)
- **Backend**: FastAPI + Python 3.12 (port 8000), dependency management with `uv`
- **Workspace**: pnpm workspace with frontend and backend packages

## Development Commands

### Backend (Python with uv)
Navigate to `backend/` directory first:

**Setup:**
```bash
cd backend
uv sync  # Installs all dependencies including dev group
```

**Testing:**
```bash
uv run pytest -q                    # Run all tests
uv run pytest tests/test_health.py  # Run specific test file
```

**Code Quality:**
```bash
uv run ruff check .                 # Lint check
uv run ruff format .                # Auto format
uv run mypy .                       # Type checking
```

**Dependency Management:**
```bash
uv add <package>                    # Add new dependency
uv add --dev <package>              # Add development dependency
uv remove <package>                 # Remove dependency
uv sync --upgrade-package <package> # Update specific dependency
uv lock --upgrade && uv sync        # Update all dependencies
```

**Development Server:**
```bash
uv run uvicorn app.main:app --reload --port 8000
```

### Frontend (pnpm)
Navigate to `frontend/` directory first:

**Setup:**
```bash
cd frontend
pnpm install
pnpm exec playwright install chromium  # First time only
```

**Testing:**
```bash
pnpm test          # Vitest unit tests
pnpm test:watch    # Vitest in watch mode
pnpm e2e           # Playwright E2E tests
```

**Code Quality:**
```bash
pnpm lint          # ESLint check
pnpm lint:fix      # ESLint auto fix
pnpm format        # Prettier format
pnpm format:check  # Prettier check
```

**Development:**
```bash
pnpm dev           # Start development server (port 5173)
pnpm build         # Build for production
```

### Root Level Commands
From the project root:
```bash
pnpm lint:fe       # Frontend ESLint
pnpm lint:fe:fix   # Frontend ESLint with fix
pnpm format:fe     # Frontend Prettier format
pnpm test:fe       # Frontend unit tests
pnpm e2e:fe        # Frontend E2E tests
```

## Architecture & Code Organization

### Backend Structure
- **`src/app/main.py`**: FastAPI application entry point with CORS configuration for frontend
- **`src/app/models/spec.py`**: Pydantic models based on `meta-doc/spec.schema.json` schema
- **`src/app/api/`**: API route handlers (projects, validation)
- **`src/app/services/`**: Business logic layer (project service, validation service)
- **`tests/`**: Test files using pytest with asyncio support

### Frontend Structure
- **`src/App.tsx`**: Main React application component
- **`src/main.tsx`**: Application entry point
- **`tests/e2e/`**: Playwright end-to-end tests
- **Configuration**: Vite, TypeScript strict mode, ESLint + Prettier integration

### Key Schema & Models
The project follows a rigorous data model based on `meta-doc/spec.schema.json`:
- **ProjectSpec**: Complete project specification document
- **CoreIdea**: Problem statement, target audience, core value
- **Scope**: In-scope and out-of-scope items
- **Scenario**: User stories with acceptance criteria, priorities, dependencies
- **DecisionLog**: Decision history with reasoning and impacts
- **ChangeHistory**: Document evolution tracking

### Multi-Agent Architecture
The system implements multiple AI agent roles:
- **Scope Planner**: Defines project boundaries and scope
- **Reviewer**: Analyzes consistency and quality
- **Recorder**: Documents decisions and changes
- **Promoter**: Drives progress and identifies next steps

## Testing Strategy

### TDD Workflow
1. Write failing test (unit or E2E)
2. Minimum implementation to pass
3. Refactor and add edge cases

### Test Types
- **Backend**: `pytest` with async support, integration tests using `httpx.AsyncClient`
- **Frontend**: Vitest for unit tests, Playwright for E2E tests
- **E2E**: Playwright config auto-starts Vite dev server during tests

## Code Quality Standards

### Python (Backend)
- **Ruff**: Line length 100, imports sorted with isort integration
- **MyPy**: Strict type checking with Python 3.12
- **Testing**: pytest with asyncio mode auto-enabled

### TypeScript (Frontend)
- **ESLint**: TypeScript, React, React Hooks rules with Prettier integration
- **Prettier**: Consistent formatting (trailing commas, semicolons)
- **TypeScript**: Strict mode enabled

## Development Workflow

### Session Models
Currently implements **Model A2** (New Session Resume):
- Documents persist, sessions restart fresh on reopen
- AI re-analyzes document state and generates new conversation
- Conversation history can be archived but is not "live"

### File Structure Conventions
- Backend uses `snake_case` for Python conventions
- Frontend uses `camelCase` for TypeScript/React conventions
- JSON schema fields use `camelCase` with Pydantic alias support
- Test files prefixed with `test_` (backend) or `.test.ts` (frontend)

## Important Notes

### PowerShell Compatibility
Commands must be run individually (no `&&` chaining) on Windows PowerShell. The `uv sync` command automatically creates and manages virtual environments.

### Environment Setup
- Python 3.12 required with `uv` for dependency management (uses `uv sync` for setup)
- Node.js ≥18 with `pnpm` as package manager
- First-time Playwright setup: `pnpm exec playwright install chromium`
- Environment reset: Delete `.venv` directory → `uv sync`

### CORS Configuration
Backend pre-configured for frontend development server at `http://localhost:5173`.

### Schema Validation
All data models strictly follow `meta-doc/spec.schema.json`. Backend uses Pydantic for runtime validation, frontend planned for Ajv/zod integration.

## Business Context

This project targets individual developers and 2-5 person teams working on 1-6 month projects with 20-30 main features. It focuses on requirement clarification rather than technical implementation details, project management, or UI/prototype generation.