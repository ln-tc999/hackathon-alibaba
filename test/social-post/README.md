# Social Media Posting Tests

Test suite untuk social media posting via Composio API v2.

## Setup

```bash
cd test/social-post
pnpm install
```

## Environment Variables

Buat file `.env` di folder ini (optional, sudah ada default values):

```bash
COMPOSIO_API_KEY=ak_C4a5-yJQmd8bjd5wsB9E
COMPOSIO_API_URL=https://backend.composio.dev/api
```

## Available Tests

### 1. Check Composio Connection Status
Check connected accounts dan entity IDs:

```bash
pnpm check-status
```

Output:
- List semua connected accounts (Instagram, Facebook, YouTube)
- Entity IDs untuk setiap platform
- Status koneksi

### 2. Test All Platforms
Test posting ke Instagram dan Facebook:

```bash
pnpm test
```

Test ini akan:
- Post image ke Instagram (2-step: create container + publish)
- Post image ke Facebook
- Skip YouTube (requires video file)
- Save results ke `results/all-platforms-test-*.json`

### 3. HTML to Image Generation
Generate images dari HTML templates:

```bash
# Set Chrome executable path
PUPPETEER_EXECUTABLE_PATH="/Users/em/.cache/puppeteer/chrome/mac-145.0.7632.77/chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing" pnpm test:html-image
```

Test ini akan:
- Generate 3 images (gradient card, quote card, stats card)
- Save images ke `results/html-images/`

## Composio API v2 Actions

### Instagram
- `INSTAGRAM_GET_USER_INFO` - Get user ID
- `INSTAGRAM_CREATE_MEDIA_CONTAINER` - Create draft media
- `INSTAGRAM_CREATE_POST` - Publish draft

### Facebook
- `FACEBOOK_CREATE_POST` - Text post
- `FACEBOOK_CREATE_PHOTO_POST` - Photo post

### YouTube
- `YOUTUBE_UPLOAD_VIDEO` - Upload video

### Twitter
- `TWITTER_UPLOAD_MEDIA` - Upload media
- `TWITTER_CREATION_OF_A_POST` - Create tweet

### TikTok
- `TIKTOK_UPLOAD_VIDEO` - Upload video
- `TIKTOK_PUBLISH_VIDEO` - Publish video

## Notes

- Semua tests menggunakan Composio API v2
- Connected accounts harus di-setup di https://app.composio.dev/apps
- Instagram requires 2-step process (container + publish)
- Test results disimpan di folder `results/`
- HTML to image test requires Puppeteer/Chrome
