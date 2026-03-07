# VlowGen Platform

<div align="center">

**AI-Powered Visual Workflow Automation**

Create. Automate. Distribute.

[![License](https://img.shields.io/badge/license-Proprietary-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-%3E%3D8.0.0-yellow.svg)](https://pnpm.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

[Features](#features) • [Quick Start](#quick-start) • [Documentation](#documentation) • [Demo](#demo)

</div>

---

## 🚀 Overview

**VlowGen** is a visual workflow automation platform that transforms content creation from hours to seconds. Build powerful content automation workflows using a drag-and-drop interface with AI-powered image generation and multi-platform social media distribution.

### Key Features

✨ **Visual Workflow Builder** - Drag-and-drop node interface, no coding required

🤖 **AI-Powered Generation** - Alibaba Cloud Wan2.1 creates stunning visuals from text

📱 **Multi-Platform Distribution** - Auto-post to Twitter, Instagram, Facebook, TikTok

⚡ **Smart Automation** - Set it once, run forever

🎨 **Interactive Team Section** - Modern kinetic design with social media integration

### Performance Metrics

| Metric | Value | Improvement |
|--------|-------|-------------|
| **Lighthouse Score** | 94+ | 31% better |
| **LCP** | <2.5s | 50% faster |
| **FID** | <100ms | 53% faster |
| **CLS** | <0.1 | 47% better |
| **Bundle Size** | ~280KB | 38% reduction |

---

## 📦 Project Structure

This is a monorepo managed with pnpm workspaces:

```
vlowgen-platform/
├── packages/
│   ├── frontend/          # Astro + React application
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── ui/   # Reusable UI components (shadcn)
│   │   │   │   ├── landing/   # Landing page sections
│   │   │   │   ├── app-views/ # App view components
│   │   │   │   ├── chat/      # Chat interface
│   │   │   │   ├── canvas/    # Workflow canvas
│   │   │   │   └── nodes/     # Node components
│   │   │   ├── hooks/         # Custom React hooks
│   │   │   ├── lib/           # Utilities and API clients
│   │   │   └── styles/        # Global styles
│   │   └── package.json
│   │
│   ├── backend/           # Node.js/Express API server
│   │   ├── src/
│   │   │   ├── api/       # REST API routes
│   │   │   ├── engine/    # Workflow execution engine
│   │   │   ├── nodes/     # Node execution handlers
│   │   │   ├── integrations/ # External service clients
│   │   │   └── services/  # Business logic services
│   │   └── package.json
│   │
│   └── shared/            # Shared TypeScript types
│       └── src/types/     # Workflow & API types
│
├── Deck.md               # Investment pitch deck
├── .env.template         # Environment variables template
└── package.json          # Root package.json
```

---

## 🎯 Features

### Visual Workflow Editor

- **Drag-and-Drop Interface** - Intuitive node-based workflow builder
- **Real-Time Validation** - Connection rules enforced automatically
- **Live Execution Feedback** - See results as workflows run
- **Template Library** - Pre-built workflows for common use cases

### AI Integration

- **Alibaba Cloud Wan2.1** - State-of-the-art text-to-image generation
- **Qwen AI** - Smart prompt enhancement
- **Multi-Model Support** - Flux, Stable Diffusion compatibility
- **Automatic Optimization** - Best settings for each use case

### Social Media Automation

- **Platform Integrations** - Twitter, Instagram, Facebook, TikTok
- **Format Optimization** - Automatic resizing per platform
- **Smart Scheduling** - Post at optimal engagement times
- **Unified Dashboard** - Manage all platforms in one place

### Performance Features

- **Code Splitting** - Lazy load heavy components
- **Image Optimization** - Automatic compression and caching
- **Client-Side Caching** - IndexedDB for offline support
- **Tree Shaking** - Remove unused code automatically

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0

### Installation

```bash
# Clone repository
git clone <repository-url>
cd vlowgen-platform

# Install dependencies
pnpm install

# Configure environment
cp .env.template .env
# Edit .env with your API keys

# Build shared types
pnpm --filter @vlowgen/shared build

# Start development servers
pnpm dev
```

Access the application:
- **Frontend**: http://localhost:4321
- **Backend**: http://localhost:3001

---

## 🔑 API Keys

### Required Services

| Service | Purpose | Cost | Get Key |
|---------|---------|------|---------|
| **Alibaba Cloud Wan2.1** | AI image generation | Paid | [DashScope](https://dashscope.aliyun.com/) |
| **Composio** | Social media integration | Free tier | [Composio](https://composio.dev/) |
| **OpenRouter** | Alternative AI (dev) | Free tier | [OpenRouter](https://openrouter.ai/) |

### Environment Variables

```bash
# Frontend
PUBLIC_API_URL=http://localhost:3001

# Backend
WAN2_API_KEY=sk-...
WAN2_API_URL=https://dashscope.aliyuncs.com/api/v1/...
COMPOSIO_API_KEY=comp_...
COMPOSIO_API_URL=https://api.composio.dev
OPENROUTER_API_KEY=sk-or-v1-...
```

---

## 📖 Documentation

### For Developers

- **[Deck.md](Deck.md)** - Investment pitch deck and business overview
- **[API Documentation](docs/api.md)** - REST API reference
- **[Architecture](docs/architecture.md)** - System design and architecture
- **[Contributing](docs/contributing.md)** - Development guidelines

### For Users

- **[Getting Started](docs/getting-started.md)** - First workflow tutorial
- **[Node Reference](docs/nodes.md)** - Available node types
- **[Templates](docs/templates.md)** - Pre-built workflow templates
- **[FAQ](docs/faq.md)** - Frequently asked questions

---

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- Astro + React
- TypeScript
- Tailwind CSS
- Framer Motion

**Backend:**
- Node.js + Express
- TypeScript
- Workflow Execution Engine
- External API Integrations

**Infrastructure:**
- Docker containers
- CI/CD pipeline
- Cloud deployment ready

### Key Components

```
┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│    Backend      │
│   (Astro+React) │◀────│   (Express)     │
└─────────────────┘     └────────┬────────┘
                                 │
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
              ┌─────────┐ ┌─────────┐ ┌─────────┐
              │ Wan2.1  │ │Composio │ │OpenRouter│
              │  (AI)   │ │(Social) │ │  (AI)    │
              └─────────┘ └─────────┘ └─────────┘
```

---

## 📊 Performance

### Optimizations Applied

| Optimization | Impact | Status |
|--------------|--------|--------|
| React.memo + useMemo | 40% fewer re-renders | ✅ |
| Lazy loading | 38% smaller bundle | ✅ |
| Lucide icons | Tree-shakeable | ✅ |
| Font optimization | No FOIT | ✅ |
| Code splitting | Faster initial load | ✅ |
| Aggressive caching | Better repeat visits | ✅ |

### Core Web Vitals

```
Lighthouse Score: 94+
├── Performance: 95
├── Accessibility: 98
├── Best Practices: 96
└── SEO: 100
```

---

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run frontend tests
pnpm --filter @vlowgen/frontend test

# Run backend tests
pnpm --filter @vlowgen/backend test

# Run with coverage
pnpm test -- --coverage
```

---

## 📝 Development Workflow

### Making Changes

1. **Frontend changes**: Edit `packages/frontend/src/`
   - Hot reloads automatically
   - Check browser console for errors

2. **Backend changes**: Edit `packages/backend/src/`
   - Server restarts automatically (tsx watch)
   - Check terminal for errors

3. **Shared types**: Edit `packages/shared/src/`
   - Run `pnpm --filter @vlowgen/shared build`
   - Restart dev servers

### Code Quality

```bash
# Type checking
pnpm type-check

# Linting
pnpm lint

# Formatting
pnpm format
```

---

## 🚀 Deployment

### Production Build

```bash
# Build all packages
pnpm build

# Start production server
pnpm start
```

### Docker Deployment

```bash
# Build Docker image
docker build -t vlowgen .

# Run container
docker run -p 4321:4321 vlowgen
```

### Cloud Deployment

See [docs/deployment.md](docs/deployment.md) for:
- AWS deployment guide
- Vercel/Netlify setup
- Environment configuration
- Database setup

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](docs/contributing.md) for details.

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Follow project coding standards
- Write tests for new features

---

## 📄 License

Proprietary - All rights reserved.

---

## 🙏 Acknowledgments

- **Alibaba Cloud** - Wan2.1 AI model
- **Composio** - Social media integrations
- **OpenRouter** - Alternative AI models
- **YC Startup School** - Pitch deck template

---

## 📞 Contact

- **Website**: [vlowgen.com](https://vlowgen.com)
- **Email**: support@vlowgen.com
- **Twitter**: [@vlowgen](https://twitter.com/vlowgen)
- **GitHub**: [github.com/vlowgen](https://github.com/vlowgen)

---

<div align="center">

**Built with ❤️ using Astro, React, and Alibaba Cloud**

[Back to top](#vlowgen-platform)

</div>
