# VlowGen Platform - Project Context

## Project Overview

**VlowGen Platform** is a visual workflow automation platform for content generation and distribution. It enables users to build powerful content automation workflows using a drag-and-drop interface with AI-powered image/video generation and social media distribution.

### Core Features

- **Visual Workflow Builder**: Drag-and-drop node-based interface using React Flow
- **AI-Powered Content Generation**: Integration with Alibaba Cloud's Wan2.1 for text-to-image/video synthesis
- **Social Media Distribution**: Automated posting to Twitter, Instagram, Facebook, TikTok, and YouTube via Composio
- **Prompt Enhancement**: AI-powered prompt enhancement using Qwen models
- **Vision Analysis**: Image/video understanding and analysis

### Technology Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | Next.js 14, React Flow, Tailwind CSS, TypeScript, Lucide React icons |
| **Backend** | Node.js, Express, TypeScript, Axios |
| **AI Services** | Alibaba Cloud DashScope (Qwen, Wan2.1), OpenRouter (alternative) |
| **Social Integration** | Composio SDK |
| **Monorepo** | pnpm workspaces |
| **Testing** | Vitest |
| **Code Quality** | ESLint, Prettier, TypeScript |
| **Deployment** | Docker, Docker Compose |

## Project Structure

```
vlowgen-platform/
├── packages/
│   ├── frontend/              # Next.js 14 application
│   │   ├── src/
│   │   │   ├── app/          # Next.js App Router (pages & layouts)
│   │   │   ├── components/   # React components (canvas, nodes, wallet)
│   │   │   ├── lib/          # Frontend utilities and API client
│   │   │   └── styles/       # Global styles
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── backend/              # Express API server
│   │   ├── src/
│   │   │   ├── api/          # REST API routes (workflows, OAuth)
│   │   │   ├── engine/       # Workflow execution engine
│   │   │   ├── nodes/        # Node execution handlers
│   │   │   │   ├── ai/       # AI nodes (Wan2, prompt enhancer, vision)
│   │   │   │   ├── social/   # Social media nodes (Twitter, etc.)
│   │   │   │   ├── prompt/   # Prompt text nodes
│   │   │   │   └── base/     # Base node classes
│   │   │   ├── integrations/ # External service clients
│   │   │   │   ├── wan2.ts   # Wan2.1 image/video generation
│   │   │   │   └── composio.ts # Social media integration
│   │   │   ├── services/     # Business logic services
│   │   │   └── index.ts      # Server entry point
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── shared/               # Shared TypeScript types
│       ├── src/
│       │   ├── types/
│       │   │   ├── workflow.ts    # Core workflow/node types
│       │   │   ├── execution.ts   # Execution result types
│       │   │   ├── api.ts         # API request/response types
│       │   │   └── validation.ts  # Validation types
│       │   └── index.ts
│       └── package.json
│
├── .env.template             # Environment variable template
├── .env.production.template  # Production environment template
├── docker-compose.yml        # Docker orchestration
├── deploy.sh                 # Deployment script
├── package.json              # Root workspace config
├── tsconfig.json             # Root TypeScript config
└── pnpm-workspace.yaml       # pnpm workspace definition
```

## Building and Running

### Prerequisites

- **Node.js** >= 18.0.0 (LTS recommended)
- **pnpm** >= 8.0.0

### Installation

```bash
pnpm install
```

### Development

```bash
# Build shared types first
pnpm --filter @vlowgen/shared build

# Start all packages in development mode
pnpm dev
```

This starts:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001

### Individual Package Commands

```bash
# Frontend only
pnpm --filter @vlowgen/frontend dev
pnpm --filter @vlowgen/frontend build
pnpm --filter @vlowgen/frontend test

# Backend only
pnpm --filter @vlowgen/backend dev
pnpm --filter @vlowgen/backend build
pnpm --filter @vlowgen/backend test

# Shared package
pnpm --filter @vlowgen/shared build
```

### Root Level Commands

```bash
pnpm build        # Build all packages
pnpm test         # Run all tests
pnpm lint         # Lint all packages
pnpm format       # Format code with Prettier
pnpm type-check   # TypeScript type checking
```

### Production Deployment

```bash
# Copy and configure production environment
cp .env.production.template .env.production
# Edit .env.production with your credentials

# Deploy using Docker
./deploy.sh production
```

## Environment Variables

### Frontend (`.env.local` or `.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:3001` |

### Backend (`.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | `3001` |
| `DASHSCOPE_API_KEY` | Alibaba Cloud API key | Yes |
| `WAN2_API_URL` | Wan2.1 API endpoint | No (uses default) |
| `COMPOSIO_API_KEY` | Composio API key | Yes |
| `COMPOSIO_API_URL` | Composio endpoint | No (uses default) |
| `QWEN_TEXT_MODEL` | Text generation model | `qwen-plus` |
| `QWEN_VISION_MODEL` | Vision analysis model | `qwen-vl-plus` |
| `WAN2_IMAGE_MODEL` | Image generation model | `wan2.1-t2i-turbo` |

## Development Conventions

### Code Style

- **TypeScript**: Strict mode enabled
- **Quotes**: Single quotes
- **Semicolons**: Required
- **Trailing commas**: ES5 style
- **Print width**: 100 characters
- **Tabs**: 2 spaces

### File Organization

- **Frontend components**: `packages/frontend/src/components/`
- **API routes**: `packages/backend/src/api/`
- **Shared types**: `packages/shared/src/types/`
- **Node handlers**: `packages/backend/src/nodes/`
- **Integration clients**: `packages/backend/src/integrations/`

### Testing Practices

- **Framework**: Vitest
- **Test files**: Co-located with source files (`.test.ts`)
- **Run tests**: `pnpm test`

### Type Safety

- All code is strictly typed
- Shared types in `@vlowgen/shared` package
- Build shared package before running frontend/backend:
  ```bash
  pnpx --filter @vlowgen/shared build
  ```

## Key Architecture Concepts

### Workflow Execution

1. Workflows are defined as JSON with nodes and edges
2. Nodes are executed in topological order
3. Data flows through connections between nodes
4. Each node type has a specific handler in `packages/backend/src/nodes/`

### Node Types

| Type | Description |
|------|-------------|
| `prompt-text` | Text input for AI prompts |
| `wan2` | AI image generation |
| `wan2-video` | AI video generation |
| `twitter`, `instagram`, `facebook`, `tiktok`, `youtube` | Social media posting |
| `prompt-enhancer-image`, `prompt-enhancer-video` | AI prompt enhancement |
| `vision-analyzer` | Image/video understanding |

### External Integrations

- **Alibaba Cloud DashScope**: Qwen models and Wan2.1 image/video generation
- **Composio**: OAuth-based social media integrations
- **OpenRouter**: Alternative AI provider for development

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/workflows` | GET | List workflows |
| `/api/workflows/:id` | GET | Get workflow |
| `/api/workflows` | POST | Create workflow |
| `/api/workflows/:id` | PUT | Update workflow |
| `/api/workflows/:id` | DELETE | Delete workflow |
| `/api/workflows/:id/execute` | POST | Execute workflow |
| `/api/oauth/:platform/connect` | GET | OAuth connect |
| `/api/oauth/:platform/callback` | GET | OAuth callback |

## Common Workflows

### Adding a New Node Type

1. Define node data type in `packages/shared/src/types/workflow.ts`
2. Create node handler in `packages/backend/src/nodes/`
3. Add node type to `NodeType` union
4. Create frontend component in `packages/frontend/src/components/`
5. Register node in backend `packages/backend/src/nodes/index.ts`

### Making Changes to Shared Types

```bash
# 1. Edit types in packages/shared/src/types/
# 2. Rebuild shared package
pnpm --filter @vlowgen/shared build

# 3. Restart frontend and backend
pnpm dev
```

## Troubleshooting

### "Cannot find module '@vlowgen/shared'"

```bash
pnpm --filter @vlowgen/shared build
```

### Port conflicts

```bash
# Kill processes on ports 3000/3001
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

### Type errors after changes

```bash
# Rebuild shared package and restart
pnpm --filter @vlowgen/shared build
pnpm dev
```

## Documentation Files

- `README.md` - Main project documentation
- `DEPLOYMENT.md` - Detailed deployment guide
- `ALIBABA_CLOUD_SETUP.md` - Alibaba Cloud configuration
- `MIGRATION_TO_ALIBABA_CLOUD.md` - Migration guide
- `QWEN_PLUS_FOR_VIRAL_CONTENT.md` - Qwen model usage guide
- `PRICING_RECOMMENDATION.md` - Cost optimization

## Performance Optimizations

The platform includes several performance optimizations:

- React.memo, useMemo, useCallback for optimal re-renders
- Code splitting and lazy loading
- Lucide React icons (tree-shakeable)
- SWC minification
- Aggressive caching headers
- Bundle size optimization (~280KB initial)

For detailed performance documentation, see the `PERFORMANCE_*.md` files in the docs folder.
