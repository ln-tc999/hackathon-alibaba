# Twitter Direct API Setup (OAuth 1.0a)

This guide explains how to set up Twitter OAuth 1.0a credentials for direct media uploads (images and videos).

## Why Direct API?

The Twitter integration supports two modes:

1. **Direct Twitter API (OAuth 1.0a)** - Full support for image and video uploads
2. **Composio API (fallback)** - Text-only tweets or when direct credentials are not configured

The direct API provides better reliability for media uploads and doesn't depend on third-party services.

## Setup Steps

### 1. Create Twitter Developer Account

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Sign in with your Twitter account
3. Apply for a developer account if you haven't already
4. Create a new project and app

### 2. Get OAuth 1.0a Credentials

1. In your app settings, go to "Keys and tokens" tab
2. You'll need these 4 credentials:
   - **API Key** (Consumer Key)
   - **API Key Secret** (Consumer Secret)
   - **Access Token**
   - **Access Token Secret**

3. If you don't have Access Token/Secret, click "Generate" under "Access Token and Secret"

### 3. Set App Permissions

1. Go to "Settings" tab in your app
2. Under "App permissions", select **Read and Write** (required for posting)
3. Save changes
4. **Important**: Regenerate your Access Token after changing permissions

### 4. Configure Environment Variables

Add these to your `packages/backend/.env` file:

```bash
# Twitter OAuth 1.0a Direct API (optional - for media uploads)
TWITTER_CONSUMER_KEY=your_api_key_here
TWITTER_CONSUMER_SECRET=your_api_key_secret_here
TWITTER_ACCESS_TOKEN=your_access_token_here
TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret_here
```

### 5. Restart Backend

After adding credentials, restart your backend server:

```bash
cd packages/backend
npm run dev
```

## How It Works

The Twitter handler uses a smart fallback system:

```
┌─────────────────────────────────────┐
│  Twitter Handler                    │
├─────────────────────────────────────┤
│                                     │
│  Has OAuth 1.0a credentials?       │
│  AND has media (image/video)?      │
│         │                           │
│         ├─ YES → Direct Twitter API│
│         │        (OAuth 1.0a)       │
│         │        ✅ Full media      │
│         │           support         │
│         │                           │
│         └─ NO  → Composio API      │
│                  (fallback)         │
│                  ⚠️  Text-only or   │
│                     limited media   │
└─────────────────────────────────────┘
```

## Testing

Run the test script to verify your setup:

```bash
node test-twitter-media.js
```

This will test:
- Image upload to Twitter
- Video upload to Twitter

## Troubleshooting

### "Failed to upload media"

- Check that your app has **Read and Write** permissions
- Regenerate Access Token after changing permissions
- Verify all 4 credentials are correct

### "Authentication failed"

- Double-check your Consumer Key and Secret
- Make sure there are no extra spaces in your .env file
- Verify your Access Token matches your Consumer Key

### "Media too large"

Twitter limits:
- Images: Max 5 MB
- Videos: Max 512 MB (chunked upload automatically used)

### Still not working?

The system will automatically fallback to Composio API if direct API fails. Check the logs to see which method is being used:

```
[Twitter Handler] Using direct Twitter API with OAuth 1.0a
```

or

```
[Twitter Handler] Using Composio API
```

## Benefits of Direct API

✅ Full control over media uploads  
✅ Better error handling  
✅ No dependency on third-party services  
✅ Supports both images and videos  
✅ Automatic chunked upload for large videos  
✅ Graceful fallback to Composio if needed  

## Optional: Keep Using Composio Only

If you prefer to use only Composio API, simply don't add the Twitter OAuth credentials to your .env file. The system will automatically use Composio for all Twitter posts.
