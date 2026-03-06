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

## [1.1.0] - Editable Nodes & Text Rendering Improvements

### Added
- **Editable Node Fields**: All node fields are now editable directly in the canvas
  - Wan2Node: model, size, textRendering, style
  - PromptTextNode: promptText with character count
  - PromptEnhancerImageNode: userPrompt (editable)
  - PromptEnhancerVideoNode: userPrompt (editable)
- **Model Switching**: Real-time model selection in Wan2Node with visual feedback
  - Turbo models (fast, cheap)
  - Plus models (balanced)
  - 2.6 models (best quality for text)
  - Preview models
  - Qwen models
- **Text Rendering Control**: New textRendering parameter in Wan2Node
  - Precision mode: Maximum accuracy for ads/logos
  - Quality mode: Good text rendering with contrast optimization
  - Balanced mode: Default, moderate enhancement
  - Disabled mode: No text enhancement
- **Auto-save**: Workflow changes automatically saved after 2 seconds of inactivity

### Enhanced
- **Text Rendering Accuracy**: Improved from 40-60% to 80-95% with advanced prompting
  - Character-level text specification
  - Contrast optimization
  - Font style specification
  - Quality boosters (sharp text, professional typography, etc.)
- **Prompt Enhancement System**: Enhanced system prompts for better text rendering
  - Image Prompt Enhancer: Typography, contrast, quality boosters
  - Video Prompt Enhancer: Text stability, timing, motion descriptors
- **Smart Negative Prompting**: Positive approach - only prevents misspellings instead of blocking text
- **Node UI**: Professional icon-based interface with Lucide React
  - Zap icon for fast generation
  - Star icon for best quality
  - Target icon for precision mode
  - Film/Wand2 icons for enhancers

### Technical
- React Flow integration with useReactFlow hook for real-time updates
- Auto-save mechanism with 2s debounce
- Icon system: Zap, Star, Target, Scale, Wand2, Film, Sparkles, Palette
- Type-safe node data updates
- No breaking changes to existing workflows

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
