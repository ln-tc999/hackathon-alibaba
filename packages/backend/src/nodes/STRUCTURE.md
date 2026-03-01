# Node Handlers Structure

Organized folder structure for better code readability and maintainability.

## Folder Organization

```
nodes/
├── base/                    # Base classes and core interfaces
│   ├── handler.ts          # Core NodeHandler interface and registry
│   ├── social-handler.ts   # Base class for social media handlers
│   └── prompt-enhancer.ts  # Base class for prompt enhancers
│
├── ai/                      # AI generation handlers
│   ├── wan2-handler.ts     # Alibaba Cloud Wan2.1 image generation
│   ├── openrouter-handler.ts # OpenRouter AI image generation
│   └── vision-analyzer-handler.ts # Vision analysis and prompt generation
│
├── prompt/                  # Prompt-related handlers
│   ├── text-handler.ts     # Text prompt input
│   ├── enhancer-image-handler.ts # Image prompt enhancement
│   └── enhancer-video-handler.ts # Video prompt enhancement
│
├── social/                  # Social media platform handlers
│   ├── twitter-handler.ts  # Twitter/X posting
│   ├── instagram-handler.ts # Instagram posting
│   ├── facebook-handler.ts # Facebook posting
│   ├── tiktok-handler.ts   # TikTok posting
│   └── youtube-handler.ts  # YouTube video upload
│
├── tests/                   # Test files
│   ├── handler.test.ts
│   ├── twitter-handler.test.ts
│   ├── prompt-text-handler.test.ts
│   ├── openrouter-handler.test.ts
│   └── wan2-handler.test.ts
│
├── index.ts                 # Main exports
└── README.md                # Documentation
```

## Benefits

### 1. Clear Separation of Concerns
- **base/**: Core abstractions and interfaces
- **ai/**: AI-powered generation logic
- **prompt/**: Prompt handling and enhancement
- **social/**: Social media integrations
- **tests/**: All test files in one place

### 2. Easy Navigation
- Find handlers by category instead of scrolling through flat list
- Related handlers grouped together
- Clear naming conventions

### 3. Scalability
- Easy to add new handlers in appropriate category
- Can add new categories as needed
- Maintains organization as codebase grows

### 4. Better Imports
```typescript
// Clear, organized imports
import { BaseSocialMediaHandler } from './base/social-handler';
import { TwitterNodeHandler } from './social/twitter-handler';
import { Wan2NodeHandler } from './ai/wan2-handler';
```

## Adding New Handlers

### Social Media Handler
1. Create file in `social/` folder
2. Extend `BaseSocialMediaHandler`
3. Implement required methods
4. Export from `index.ts`

### AI Handler
1. Create file in `ai/` folder
2. Implement `NodeHandler` interface
3. Add AI-specific logic
4. Export from `index.ts`

### Prompt Handler
1. Create file in `prompt/` folder
2. Extend `BasePromptEnhancer` if applicable
3. Implement enhancement logic
4. Export from `index.ts`

## Code Reuse

All handlers benefit from:
- **Base classes**: Eliminate code duplication
- **Shared utilities**: Common error handling, validation
- **Type safety**: Full TypeScript support
- **Consistent patterns**: Same structure across all handlers
