# MinIO & Fingerprint.com Setup Guide

## MinIO Object Storage

MinIO is used for persistent image storage, making the backend container lightweight by offloading media files.

### Local Development

1. Start MinIO:
```bash
docker-compose up -d minio
```

2. Access MinIO Console:
- URL: http://localhost:9001
- Username: `minioadmin`
- Password: `minioadmin`

3. Configure environment variables in `packages/backend/.env`:
```env
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=vlowgen-images
```

### How It Works

1. Wan2 generates image → DashScope returns temporary URL
2. Backend downloads image from DashScope
3. Backend uploads to MinIO for persistent storage
4. MinIO URL is returned to frontend (permanent, accessible)
5. **Image automatically saved to history for workflow continuation**

### Benefits

- Backend container stays lightweight (no image storage)
- Images persist across container restarts
- Public URLs for easy sharing
- Scalable storage solution
- **Automatic image history tracking**

## Image History Feature

All generated images are automatically saved to history, enabling workflow continuation.

### Features

- **Automatic Tracking**: Every generated image is saved with metadata
- **Workflow Continuation**: AI models can access previous images
- **Search & Filter**: Find images by prompt keywords
- **Recent Images**: Quick access to last 100 images per user

### API Endpoints

```bash
# Get recent images
GET /api/image-history/recent?userId=xxx&limit=10

# Get latest image
GET /api/image-history/latest?userId=xxx

# Get specific image
GET /api/image-history/:imageId?userId=xxx

# Search by prompt
GET /api/image-history/search?userId=xxx&q=keywords

# Get images from workflow
GET /api/image-history/workflow/:workflowId?userId=xxx
```

### Workflow Continuation Examples

1. **Generate → Analyze → Enhance**
   - Prompt Text → Wan2 (generate image)
   - Wan2 → Vision Analyzer (analyze generated image)
   - Vision Analyzer → Prompt Enhancer → Wan2 (generate improved version)

2. **Iterative Refinement**
   - Generate image with Wan2
   - Use Vision Analyzer to analyze style
   - Generate new prompt based on analysis
   - Create variations with different prompts

3. **Multi-Platform Posting**
   - Generate image once
   - Post to Instagram, Twitter, Facebook using same image URL
   - All nodes receive the MinIO URL (permanent)

### Usage in Nodes

**Vision Analyzer**: Automatically receives image URL from connected Wan2 node
```typescript
// Vision Analyzer checks inputs for image URL
if (input.imageUrl) {
  // Use image from previous node
  imageUrl = input.imageUrl;
}
```

**Social Media Nodes**: Receive image URL from Wan2 or Preview nodes
```typescript
// Instagram/Twitter/Facebook handlers
const imageUrl = inputs[sourceNodeId].imageUrl || inputs[sourceNodeId];
```

## Fingerprint.com Integration

Fingerprint.com provides device fingerprinting for user tracking and analytics.

### Setup

1. Sign up at https://fingerprint.com/
2. Get your API key from the dashboard
3. Add to `packages/frontend/.env.local`:
```env
PUBLIC_FINGERPRINT_API_KEY=your_api_key_here
```

### Features

- Device fingerprinting on user initialization
- Visitor ID stored in localStorage
- Event tracking for analytics
- Automatic visitor data collection

### Usage

The integration automatically initializes when users visit the app. Visitor IDs are used for:
- User tracking across sessions
- Analytics and usage patterns
- Rate limiting (future)
- Fraud detection (future)

## Testing

Test MinIO integration:
```bash
node test-minio-integration.js
```

Test image history:
```bash
node test-image-history.js
```

This will:
1. Generate an image with Wan2
2. Upload to MinIO
3. Save to image history
4. Retrieve from history
5. Demonstrate workflow continuation

## Production Deployment

For production, update docker-compose.yml with:
- Secure MinIO credentials
- SSL/TLS configuration
- Volume persistence
- Backup strategy
- Consider using managed object storage (Alibaba Cloud OSS, AWS S3, etc.)

