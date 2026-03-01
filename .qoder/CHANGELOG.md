# Changelog

All notable changes to VlowGen Platform will be documented in this file.

## [Unreleased]

### Added
- **AI Chat Interface**: Users can now describe workflows in natural language and AI will generate them automatically
- **Manual Node Creation**: Traditional drag-and-drop interface for manual workflow creation
- **Dual Mode Sidebar**: Toggle between AI Chat and Manual modes with clean tab interface
- **Space Grotesk Font**: Modern neo-brutalism inspired typography throughout the application
- **Minimalist Navigation**: Simplified header with logo and essential controls

### Changed
- **UI Modernization**: Complete redesign with modern, clean aesthetics
- **Icon System**: Replaced emoji with professional Lucide React icons
- **Node Palette**: Removed border separators for cleaner look
- **Chat Interface**: Streamlined design with rounded message bubbles and better UX

### Technical
- Font: Space Grotesk (weights: 400, 500, 600, 700)
- Icons: Lucide React library
- Layout: Responsive sidebar (320px) with canvas area
- Components: ChatInterface, NodePalette with mode switching

## [1.0.0] - Initial Release

### Added
- Visual workflow builder with React Flow
- Node types: Prompt Text, WAN2 Image, OpenRouter Image, Twitter Post
- Workflow execution engine
- Real-time execution status tracking
- Error handling and validation
- Docker deployment support
- Comprehensive test coverage

### Features
- Drag-and-drop workflow creation
- Node connection validation
- Execution result visualization
- Twitter integration via Composio
- Image generation with WAN2 and OpenRouter
- Monorepo structure with pnpm workspaces

### Technical Stack
- Frontend: Next.js 14, React 18, TypeScript
- Backend: Express.js, TypeScript
- Styling: Tailwind CSS
- State Management: React hooks
- Testing: Vitest
- Deployment: Docker, Docker Compose
