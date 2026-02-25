# VlowGen Platform

Visual workflow automation platform for content generation and distribution. Build powerful content automation workflows using a drag-and-drop interface with AI-powered image generation and social media distribution.

## Table of Contents

- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Obtaining API Keys](#obtaining-api-keys)
  - [WalletConnect Project ID](#1-walletconnect-project-id)
  - [Alibaba Cloud Wan2.1 API Key](#2-alibaba-cloud-wan21-api-key)
  - [Composio API Key](#3-composio-api-key)
- [Development Workflow](#development-workflow)
- [Available Commands](#available-commands)
- [Environment Variables](#environment-variables)
- [Architecture Overview](#architecture-overview)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## Project Structure

This is a monorepo managed with pnpm workspaces containing three packages:

```
vlowgen-platform/
├── packages/
│   ├── frontend/          # Next.js 14 application with React Flow
│   │   ├── src/
│   │   │   ├── app/      # Next.js app directory (pages & layouts)
│   │   │   ├── components/ # React components (canvas, nodes, wallet)
│   │   │   ├── lib/      # Frontend utilities and API client
│   │   │   └── styles/   # Global styles and Tailwind config
│   │   └── package.json
│   │
│   ├── backend/           # Node.js/Express API server
│   │   ├── src/
│   │   │   ├── api/      # REST API routes
│   │   │   ├── engine/   # Workflow execution engine
│   │   │   ├── nodes/    # Node execution handlers
│   │   │   ├── integrations/ # External service clients (Wan2, Composio)
│   │   │   └── index.ts  # Server entry point
│   │   └── package.json
│   │
│   └── shared/            # Shared TypeScript types and utilities
│       ├── src/
│       │   └── types/    # Workflow, execution, and API types
│       └── package.json
│
├── .env.template          # Environment variable template
├── package.json           # Root package.json with workspace config
└── README.md             # This file
```

## Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

- **Node.js** >= 18.0.0 (LTS version recommended)
  - Download from [nodejs.org](https://nodejs.org/)
  - Verify installation: `node --version`

- **pnpm** >= 8.0.0 (Package manager)
  - Install globally: `npm install -g pnpm`
  - Verify installation: `pnpm --version`

### Required API Keys

You'll need to obtain API keys from the following services:

1. **WalletConnect** - For Web3 wallet integration (free)
2. **Alibaba Cloud Wan2.1** - For AI image generation (paid service)
3. **Composio** - For Twitter integration (free tier available)

See the [Obtaining API Keys](#obtaining-api-keys) section below for detailed instructions.

## Quick Start

Follow these steps to get the platform running locally:

### 1. Clone the Repository

```bash
git clone <repository-url>
cd vlowgen-platform
```

### 2. Install Dependencies

```bash
pnpm install
```

This will install dependencies for all packages in the monorepo.

### 3. Configure Environment Variables

```bash
cp .env.template .env
```

Edit the `.env` file and add your API keys. See [Obtaining API Keys](#obtaining-api-keys) for instructions on getting these credentials.

### 4. Build Shared Package

The shared package contains TypeScript types used by both frontend and backend:

```bash
pnpm --filter @vlowgen/shared build
```

### 5. Start Development Servers

Run both frontend and backend in development mode:

```bash
pnpm dev
```

This will start:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001

The application will automatically reload when you make changes to the code.

## Obtaining API Keys

### 1. WalletConnect Project ID

WalletConnect enables Web3 wallet connections in the frontend.

**Steps to obtain:**

1. Visit [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Click "Sign Up" or "Sign In" (free account)
3. Once logged in, click "Create New Project"
4. Enter a project name (e.g., "VlowGen Platform")
5. Select "App" as the project type
6. Copy the **Project ID** from the project dashboard
7. Add to `.env` as `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`

**Example:**
```bash
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p
```

**Cost:** Free

### 2. Alibaba Cloud Wan2.1 API Key

Wan2.1 is Alibaba Cloud's AI service for text-to-image generation.

**Steps to obtain:**

1. Visit [Alibaba Cloud DashScope](https://dashscope.aliyun.com/)
2. Click "Sign Up" to create an Alibaba Cloud account
   - You may need to verify your identity and add payment information
3. Once logged in, navigate to the DashScope console
4. Go to "API Keys" or "Access Keys" section
5. Click "Create API Key"
6. Copy the generated API key (starts with `sk-`)
7. Add to `.env` as `WAN2_API_KEY`

**Example:**
```bash
WAN2_API_KEY=sk-1234567890abcdef1234567890abcdef
WAN2_API_URL=https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis
```

**Cost:** Paid service (charges per API call)
- Check current pricing at [Alibaba Cloud Pricing](https://www.alibabacloud.com/help/en/dashscope/pricing)
- Free trial credits may be available for new accounts

**Important Notes:**
- Keep your API key secure and never commit it to version control
- Monitor your usage to avoid unexpected charges
- Set up billing alerts in your Alibaba Cloud account

### 3. Composio API Key

Composio provides integration with Twitter and other social media platforms.

**Steps to obtain:**

1. Visit [Composio](https://composio.dev/)
2. Click "Sign Up" to create a free account
3. Verify your email address
4. Once logged in, navigate to the dashboard
5. Go to "API Keys" or "Settings" section
6. Click "Generate API Key" or "Create New Key"
7. Copy the generated API key (starts with `comp_`)
8. Add to `.env` as `COMPOSIO_API_KEY`

**Example:**
```bash
COMPOSIO_API_KEY=comp_1234567890abcdef1234567890abcdef
COMPOSIO_API_URL=https://api.composio.dev
```

**Cost:** Free tier available with usage limits
- Check current pricing at [Composio Pricing](https://composio.dev/pricing)

**Twitter Authentication:**
- After setting up Composio, you'll need to authenticate your Twitter account
- The platform will guide you through the OAuth flow when you add a Twitter node
- Your Twitter credentials are stored securely by Composio

## Development Workflow

### Running the Full Stack

Start both frontend and backend simultaneously:

```bash
pnpm dev
```

Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Health Check: http://localhost:3001/health

### Running Individual Packages

**Frontend only:**
```bash
pnpm --filter @vlowgen/frontend dev
```

**Backend only:**
```bash
pnpm --filter @vlowgen/backend dev
```

**Shared package (build):**
```bash
pnpm --filter @vlowgen/shared build
```

### Making Code Changes

1. **Frontend changes**: Edit files in `packages/frontend/src/`
   - Changes will hot-reload automatically
   - Check browser console for errors

2. **Backend changes**: Edit files in `packages/backend/src/`
   - Server will restart automatically (using tsx watch)
   - Check terminal output for errors

3. **Shared types**: Edit files in `packages/shared/src/`
   - Run `pnpm --filter @vlowgen/shared build` after changes
   - Restart frontend and backend to pick up changes

### Testing Your Changes

Run all tests:
```bash
pnpm test
```

Run tests for a specific package:
```bash
pnpm --filter @vlowgen/frontend test
pnpm --filter @vlowgen/backend test
```

Run tests in watch mode (during development):
```bash
pnpm --filter @vlowgen/frontend test -- --watch
```

### Code Quality Checks

Before committing code, run:

```bash
# Type checking
pnpm type-check

# Linting
pnpm lint

# Code formatting
pnpm format
```

## Available Commands

### Root Level Commands

These commands run across all packages in the monorepo:

| Command | Description |
|---------|-------------|
| `pnpm install` | Install all dependencies |
| `pnpm dev` | Start all packages in development mode |
| `pnpm build` | Build all packages for production |
| `pnpm test` | Run tests across all packages |
| `pnpm lint` | Lint all packages |
| `pnpm format` | Format code with Prettier |
| `pnpm type-check` | Type check all packages |

### Frontend Commands

Run from root with `pnpm --filter @vlowgen/frontend <command>`:

| Command | Description |
|---------|-------------|
| `dev` | Start Next.js development server (port 3000) |
| `build` | Build Next.js application for production |
| `start` | Start production server |
| `test` | Run Vitest tests |
| `lint` | Run ESLint |
| `type-check` | Run TypeScript type checking |

### Backend Commands

Run from root with `pnpm --filter @vlowgen/backend <command>`:

| Command | Description |
|---------|-------------|
| `dev` | Start Express server with hot reload (port 3001) |
| `build` | Compile TypeScript to JavaScript |
| `start` | Start production server |
| `test` | Run Vitest tests |
| `lint` | Run ESLint |
| `type-check` | Run TypeScript type checking |

### Shared Package Commands

Run from root with `pnpm --filter @vlowgen/shared <command>`:

| Command | Description |
|---------|-------------|
| `build` | Compile TypeScript types |
| `type-check` | Run TypeScript type checking |

## Environment Variables

The platform uses environment variables for configuration. Copy `.env.template` to `.env` and configure the following:

### Frontend Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes | `http://localhost:3001` |
| `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` | WalletConnect project ID | Yes | `1a2b3c4d...` |

### Backend Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `PORT` | Backend server port | No | `3001` (default) |
| `WAN2_API_KEY` | Alibaba Cloud Wan2.1 API key | Yes | `sk-1234...` |
| `WAN2_API_URL` | Wan2.1 API endpoint | No | `https://dashscope.aliyuncs.com/...` |
| `COMPOSIO_API_KEY` | Composio API key | Yes | `comp_1234...` |
| `COMPOSIO_API_URL` | Composio API endpoint | No | `https://api.composio.dev` |

### Shared Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NODE_ENV` | Runtime environment | No | `development` or `production` |
| `LOG_LEVEL` | Logging verbosity | No | `debug`, `info`, `warn`, `error` |

**Security Notes:**
- Never commit `.env` files to version control
- Use different API keys for development and production
- Rotate API keys regularly
- Set `NODE_ENV=production` and `LOG_LEVEL=info` in production

## Architecture Overview

### Technology Stack

**Frontend:**
- **Next.js 14** - React framework with App Router
- **React Flow** - Visual node-based workflow editor
- **RainbowKit** - Web3 wallet connection UI
- **wagmi + viem** - Ethereum wallet integration
- **Tailwind CSS** - Utility-first styling
- **TypeScript** - Type safety

**Backend:**
- **Node.js + Express** - REST API server
- **TypeScript** - Type safety
- **Axios** - HTTP client for external APIs
- **Composio SDK** - Twitter integration

**Development:**
- **pnpm workspaces** - Monorepo management
- **Vitest** - Unit testing framework
- **ESLint + Prettier** - Code quality and formatting
- **tsx** - TypeScript execution for development

### Key Features

1. **Visual Workflow Builder**
   - Drag-and-drop node interface
   - Real-time connection validation
   - Visual execution feedback

2. **Node Types**
   - **Prompt Text Node**: Text input for AI prompts
   - **Wan2.1 Node**: AI image generation
   - **Twitter Node**: Social media posting

3. **Workflow Execution**
   - Topological sorting for correct execution order
   - Data flow between connected nodes
   - Error handling and reporting

4. **External Integrations**
   - Alibaba Cloud Wan2.1 for image generation
   - Composio for Twitter posting
   - RainbowKit for wallet connections

## Troubleshooting

### Common Issues and Solutions

#### 1. "Cannot find module '@vlowgen/shared'"

**Problem:** Frontend or backend can't import shared types.

**Solution:**
```bash
# Build the shared package
pnpm --filter @vlowgen/shared build

# Restart dev servers
pnpm dev
```

#### 2. "Port 3000 or 3001 already in use"

**Problem:** Another process is using the required port.

**Solution:**
```bash
# Find and kill the process (macOS/Linux)
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9

# Or change the port in .env
PORT=3002  # for backend
# Frontend port can be changed with: next dev -p 3001
```

#### 3. "pnpm: command not found"

**Problem:** pnpm is not installed.

**Solution:**
```bash
npm install -g pnpm
```

#### 4. API Key Errors (401 Unauthorized)

**Problem:** Invalid or missing API keys.

**Solution:**
1. Verify `.env` file exists and contains all required keys
2. Check that API keys are correctly copied (no extra spaces)
3. Ensure keys haven't expired or been revoked
4. Restart the backend server after updating `.env`

#### 5. Wan2.1 API Timeout

**Problem:** Image generation requests timing out.

**Solution:**
- Check your internet connection
- Verify Wan2.1 API is operational
- Increase timeout in `packages/backend/src/integrations/wan2.ts` if needed
- Check Alibaba Cloud account status and credits

#### 6. Twitter Authentication Fails

**Problem:** OAuth flow doesn't complete successfully.

**Solution:**
1. Verify Composio API key is correct
2. Check that callback URL is properly configured in Composio dashboard
3. Ensure browser allows popups and redirects
4. Try clearing browser cookies and cache
5. Check Composio service status

#### 7. Type Errors After Updating Shared Types

**Problem:** TypeScript errors after modifying shared package.

**Solution:**
```bash
# Rebuild shared package
pnpm --filter @vlowgen/shared build

# Clear Next.js cache
pnpm --filter @vlowgen/frontend build --clean

# Restart TypeScript server in your IDE
# VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server"
```

#### 8. Tests Failing

**Problem:** Tests fail after code changes.

**Solution:**
```bash
# Run tests with verbose output
pnpm test -- --reporter=verbose

# Run specific test file
pnpm --filter @vlowgen/backend test -- src/engine/execution-engine.test.ts

# Update snapshots if needed
pnpm test -- -u
```

#### 9. Build Errors in Production

**Problem:** Production build fails.

**Solution:**
```bash
# Clean all build artifacts
rm -rf packages/*/dist packages/*/.next packages/*/node_modules

# Reinstall dependencies
pnpm install

# Build in order
pnpm --filter @vlowgen/shared build
pnpm --filter @vlowgen/backend build
pnpm --filter @vlowgen/frontend build
```

#### 10. CORS Errors

**Problem:** Frontend can't connect to backend API.

**Solution:**
1. Verify `NEXT_PUBLIC_API_URL` in `.env` matches backend URL
2. Check CORS configuration in `packages/backend/src/index.ts`
3. Ensure backend server is running
4. Check browser console for specific CORS error details

### Getting Help

If you encounter issues not covered here:

1. Check the browser console (F12) for frontend errors
2. Check the terminal output for backend errors
3. Review the `.env.template` file for required variables
4. Ensure all prerequisites are installed correctly
5. Try deleting `node_modules` and running `pnpm install` again

## Contributing

### Development Guidelines

1. **Code Style**
   - Follow TypeScript best practices
   - Use ESLint and Prettier configurations
   - Write descriptive variable and function names
   - Add comments for complex logic

2. **Testing**
   - Write unit tests for new features
   - Ensure all tests pass before committing
   - Aim for high test coverage

3. **Commits**
   - Write clear, descriptive commit messages
   - Reference issue numbers when applicable
   - Keep commits focused and atomic

4. **Pull Requests**
   - Provide clear description of changes
   - Include screenshots for UI changes
   - Ensure all checks pass
   - Request review from team members

### Project Structure Conventions

- Place React components in `packages/frontend/src/components/`
- Place API routes in `packages/backend/src/api/`
- Place shared types in `packages/shared/src/types/`
- Keep node handlers in `packages/backend/src/nodes/`
- Keep integration clients in `packages/backend/src/integrations/`

## License

Proprietary - All rights reserved
