# VlowGen Platform - Project Context

## Project Overview

**VlowGen** is a visual workflow automation platform for content generation and distribution. It provides a drag-and-drop interface for building powerful content automation workflows with AI-powered image generation and social media distribution capabilities.

### Key Features
- **Visual Workflow Builder**: Drag-and-drop node interface using React Flow
- **AI Image Generation**: Integration with Alibaba Cloud Wan2.1 and OpenRouter
- **Social Media Distribution**: Twitter, Facebook, Instagram, TikTok, YouTube integrations via Composio
- **Custom Twitter Implementation**: Full OAuth 1.0a support with automatic fallback
- **Object Storage**: MinIO for media storage
- **Performance Optimized**: Core Web Vitals focus with 94+ Lighthouse score

## Technology Stack

### Frontend
- **Astro 5.5** - Static site generator with server-side rendering
- **React 18** - UI components and interactive elements
- **React Flow** - Visual node-based workflow editor
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Animations and transitions
- **TypeScript** - Type safety

### Backend
- **Node.js + Express** - REST API server
- **TypeScript** - Type safety
- **Axios** - HTTP client for external APIs
- **MinIO SDK** - Object storage client
- **OAuth 1.0a** - Twitter authentication
- **Composio SDK** - Social media integrations

### Development & Tooling
- **pnpm workspaces** - Monorepo management
- **Vitest** - Unit testing framework
- **ESLint + Prettier** - Code quality and formatting
- **tsx** - TypeScript execution for development
- **Docker + Docker Compose** - Containerization

## Project Structure

```
vlowgen-platform/
├── packages/
│   ├── frontend/          # Astro + React frontend (port 4321)
│   │   ├── src/
│   │   │   ├── components/  # React components (canvas, nodes, wallet)
│   │   │   ├── layouts/     # Astro layouts
│   │   │   ├── lib/         # Frontend utilities and API client
│   │   │   ├── pages/       # Astro pages
│   │   │   └── styles/      # Global styles and Tailwind config
│   │   └── package.json
│   │
│   ├── backend/           # Node.js/Express API server (port 3001)
│   │   ├── src/
│   │   │   ├── api/         # REST API routes
│   │   │   ├── engine/      # Workflow execution engine
│   │   │   ├── integrations/# External service clients (Wan2, Composio, Twitter)
│   │   │   ├── middleware/  # Express middleware
│   │   │   ├── nodes/       # Node execution handlers
│   │   │   ├── services/    # Business logic services
│   │   │   ├── utils/       # Utility functions
│   │   │   └── index.ts     # Server entry point
│   │   └── package.json
│   │
│   └── shared/            # Shared TypeScript types and utilities
│       ├── src/
│       │   └── types/       # Workflow, execution, and API types
│       └── package.json
│
├── docker-compose.yml     # Docker orchestration (MinIO, Frontend, Backend)
├── .env.production.template  # Production environment template
├── package.json           # Root package.json with workspace config
└── README.md              # Comprehensive documentation
```

## Building and Running

### Prerequisites
- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0 (`npm install -g pnpm`)

### Development Commands

```bash
# Install dependencies for all packages
pnpm install

# Start all services in development mode
# - Frontend: http://localhost:4321
# - Backend: http://localhost:3001
pnpm dev

# Build all packages for production
pnpm build

# Run tests across all packages
pnpm test

# Run type checking
pnpm type-check

# Run linting
pnpm lint

# Format code with Prettier
pnpm format
```

### Package-Specific Commands

```bash
# Frontend only
pnpm --filter @vlowgen/frontend dev      # Start dev server
pnpm --filter @vlowgen/frontend build    # Build for production
pnpm --filter @vlowgen/frontend test     # Run tests

# Backend only
pnpm --filter @vlowgen/backend dev       # Start with hot reload
pnpm --filter @vlowgen/backend build     # Compile TypeScript
pnpm --filter @vlowgen/backend start     # Start production server

# Shared package (must be built before frontend/backend)
pnpm --filter @vlowgen/shared build      # Compile shared types
```

### Docker Deployment

```bash
# Copy and configure production environment
cp .env.production.template .env.production
# Edit .env.production with your values

# Start all services with Docker Compose
docker-compose up -d

# Services:
# - Frontend: http://localhost:80
# - Backend API: http://localhost:3001
# - MinIO Console: http://localhost:9001
# - MinIO API: http://localhost:9000
```

## Environment Variables

### Required API Keys

| Variable | Description | Source |
|----------|-------------|--------|
| `DASHSCOPE_API_KEY` | Alibaba Cloud Wan2.1 for AI image generation | [Alibaba Cloud DashScope](https://dashscope.aliyun.com/) |
| `COMPOSIO_API_KEY` | Social media integrations | [Composio](https://composio.dev/) |
| `OPENROUTER_API_KEY` | Alternative AI provider (optional) | [OpenRouter](https://openrouter.ai/) |

### Optional Twitter OAuth 1.0a (for direct API access)

| Variable | Description |
|----------|-------------|
| `TWITTER_CONSUMER_KEY` | Twitter API Key |
| `TWITTER_CONSUMER_SECRET` | Twitter API Secret |
| `TWITTER_ACCESS_TOKEN` | User Access Token |
| `TWITTER_ACCESS_TOKEN_SECRET` | User Access Token Secret |

### MinIO Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `MINIO_ENDPOINT` | minio | MinIO server hostname |
| `MINIO_PORT` | 9000 | MinIO server port |
| `MINIO_ACCESS_KEY` | minioadmin | Access key |
| `MINIO_SECRET_KEY` | minioadmin | Secret key |
| `MINIO_BUCKET_NAME` | vlowgen-images | Default bucket |

## Development Conventions

### Code Style
- **TypeScript**: Strict mode enabled
- **ESLint**: Recommended rules with TypeScript support
- **Prettier**: 2-space tabs, single quotes, 100 char width, trailing commas (es5)

### Key ESLint Rules
- `@typescript-eslint/no-explicit-any`: Off (allowed for flexibility)
- `@typescript-eslint/no-unused-vars`: Warn (ignores `_` prefixed args)
- `@typescript-eslint/no-empty-function`: Off

### Project Conventions
- React components in `packages/frontend/src/components/`
- API routes in `packages/backend/src/api/`
- Shared types in `packages/shared/src/types/`
- Node handlers in `packages/backend/src/nodes/`
- Integration clients in `packages/backend/src/integrations/`

### Testing
- **Framework**: Vitest
- Run tests: `pnpm test`
- Run specific package: `pnpm --filter @vlowgen/backend test`

### Git Workflow
- Use `push.sh` for automated deployment pushes
- Use `deploy-production.sh` for production deployments
- Environment files (`.env`, `.env.production`) are git-ignored

## Key Integrations

### AI Image Generation
1. **Alibaba Cloud Wan2.1** (Primary) - Text-to-image generation
2. **OpenRouter** (Alternative) - Multiple AI models including Flux, Stable Diffusion

### Social Media
1. **Twitter** - Full OAuth 1.0a implementation with Composio fallback
2. **Facebook, Instagram, TikTok, YouTube** - Via Composio API

### Storage
- **MinIO** - S3-compatible object storage for generated images and media

## Architecture Highlights

### Workflow Execution Engine
- Topological sorting for correct node execution order
- Data flow between connected nodes
- Error handling and execution state tracking

### Smart Twitter Integration
```
Has OAuth credentials? ──Yes──► Direct Twitter API (OAuth 1.0a)
        │
        No
        │
        ▼
Has media (image/video)? ──Yes──► Try Direct API ──Fail──► Composio Fallback
        │
        No
        ▼
   Composio API (text-only)
```

### Performance Optimizations
- React performance patterns (useMemo, useCallback, React.memo)
- Code splitting with lazy loading (38% bundle reduction)
- Lucide React icons (tree-shakeable)
- Font optimization with display swap
- Aggressive static asset caching

## Documentation Files

| File | Description |
|------|-------------|
| `README.md` | Comprehensive setup and usage guide |
| `TWITTER_IMPLEMENTATION_SUMMARY.md` | Twitter OAuth implementation details |
| `TWITTER_QUICK_START.md` | Quick start for Twitter integration |
| `docs/TWITTER_DIRECT_API_SETUP.md` | Twitter OAuth 1.0a setup guide |
| `.env.production.template` | Production environment configuration template |

## Troubleshooting

### Common Issues

1. **"Cannot find module '@vlowgen/shared'"**
   ```bash
   pnpm --filter @vlowgen/shared build
   ```

2. **Port conflicts (3000, 3001, 4321)**
   ```bash
   lsof -ti:3001 | xargs kill -9
   ```

3. **Type errors after shared package changes**
   ```bash
   pnpm --filter @vlowgen/shared build
   # Restart dev servers
   ```

4. **CORS errors**
   - Verify `NEXT_PUBLIC_API_URL` / `PUBLIC_API_URL` matches backend URL
   - Check `ALLOWED_ORIGINS` in backend environment

## License

Proprietary - All rights reserved
