# Twitter Direct API Setup Guide

## Why Direct API?

**Composio does NOT support media uploads to Twitter.** 

To post images/videos to Twitter, you need to use **Twitter Direct API** (OAuth 1.0a).

---

## Prerequisites

1. **Twitter Developer Account**
   - Go to https://developer.twitter.com
   - Apply for developer account (if you don't have one)
   - Create a new Project & App

2. **Required Permissions**
   - **App Permissions**: Read and Write
   - **Type of App**: Web App, Automated App or Bot
   - **App Info**:
     - Callback URI: `http://localhost:3001/api/auth/twitter/callback` (for OAuth flow)
     - Website URL: Your website URL (optional)

---

## Step-by-Step Setup

### **Step 1: Create Twitter App**

1. Login to https://developer.twitter.com
2. Go to **Dashboard** → **Projects & Apps**
3. Click **Create Project**
4. Fill in project details:
   - **Use case**: Describe what your app does (e.g., "Automated content posting")
   - **App name**: VlowGen (or your app name)
5. Create App

### **Step 2: Get API Keys**

After creating app, you'll get:
- **API Key** (Consumer Key)
- **API Key Secret** (Consumer Secret)
- **Bearer Token** (not needed for OAuth 1.0a)

### **Step 3: Generate Access Token**

1. Go to your App settings
2. Click **Keys and Tokens**
3. Under **Authentication Tokens**, click **Generate**
4. You'll get:
   - **Access Token**
   - **Access Token Secret**

### **Step 4: Configure .env**

Add these to your `.env` file:

```env
# Twitter Direct API Credentials
# Get from https://developer.twitter.com/en/portal/dashboard
TWITTER_CONSUMER_KEY=your_api_key_here
TWITTER_CONSUMER_SECRET=your_api_key_secret_here
TWITTER_ACCESS_TOKEN=your_access_token_here
TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret_here
```

### **Step 5: Test Connection**

Run your app and try to post to Twitter:

```
User prompt: "Create an image and post to Twitter"
```

If configured correctly, you'll see:
```
[Twitter Handler] Direct credentials check: { hasDirectCredentials: true }
[Twitter Handler] Using Direct Twitter API with OAuth 1.0a
[Twitter Handler] Uploading media to Twitter...
[Twitter Handler] Tweet posted successfully: https://twitter.com/i/web/status/xxxxx
```

---

## Troubleshooting

### **Error: "Twitter Direct API credentials not configured"**

**Cause:** Missing credentials in .env

**Fix:**
1. Check all 4 variables are set in `.env`
2. Restart backend server
3. Check console logs

---

### **Error: "Could not authenticate you"**

**Cause:** Invalid or expired tokens

**Fix:**
1. Go to Twitter Developer Dashboard
2. Regenerate Access Token
3. Update `.env` with new token
4. Restart backend

---

### **Error: "Media upload failed"**

**Cause:** Media file format or size issue

**Fix:**
- **Images**: JPG, PNG, GIF (max 5MB)
- **Videos**: MP4, MOV (max 512MB)
- Check media URL is publicly accessible

---

### **Error: "Tweet failed - Duplicate status"**

**Cause:** Posting same content twice

**Fix:**
- Change tweet text slightly
- Twitter doesn't allow exact duplicate tweets

---

## Rate Limits

**Twitter API v2 Rate Limits:**

| Endpoint | Limit |
|----------|-------|
| Tweet creation | 200 tweets per 24 hours |
| Media upload | 1000 uploads per 24 hours |
| User timeline | 900 requests per 15 minutes |

**Note:** Free tier has lower limits. Upgrade to Basic ($100/month) for higher limits.

---

## Security Best Practices

1. **Never commit .env to Git**
   ```bash
   # .gitignore
   .env
   .env.local
   .env.production
   ```

2. **Use environment variables in production**
   ```bash
   # Docker / VPS
   export TWITTER_CONSUMER_KEY=xxx
   export TWITTER_CONSUMER_SECRET=xxx
   ```

3. **Rotate tokens regularly**
   - Regenerate tokens every 90 days
   - Update .env immediately

4. **Monitor usage**
   - Check Twitter Developer Dashboard
   - Watch for unusual activity

---

## Migration from Composio

If you were using Composio for Twitter:

### **Before (Composio - NOT WORKING for media)**
```env
COMPOSIO_API_KEY=ak_xxx
TWITTER_CONNECTED_ACCOUNT_ID=ca_xxx
```

### **After (Direct API - WORKS for media)**
```env
TWITTER_CONSUMER_KEY=xxx
TWITTER_CONSUMER_SECRET=xxx
TWITTER_ACCESS_TOKEN=xxx
TWITTER_ACCESS_TOKEN_SECRET=xxx
```

### **Migration Steps:**
1. Remove `TWITTER_CONNECTED_ACCOUNT_ID` from .env
2. Add 4 Twitter Direct API credentials
3. Update code (already done - twitter-handler.ts updated)
4. Test with media upload

---

## API Reference

### **Direct API Endpoints Used:**

1. **Media Upload**
   ```
   POST https://upload.twitter.com/1.1/media/upload.json
   ```

2. **Tweet Creation**
   ```
   POST https://api.twitter.com/2/tweets
   ```

### **Code Location:**
- Handler: `packages/backend/src/nodes/social/twitter-handler.ts`
- Client: `packages/backend/src/integrations/twitter-direct.ts`

---

## Support

**Issues?**
1. Check Twitter Developer Dashboard for app status
2. Verify API credentials are correct
3. Check backend logs for detailed error messages
4. Review Twitter API documentation: https://developer.twitter.com/en/docs

**Composio NOT Supported:**
- ❌ Composio cannot upload media to Twitter
- ✅ Use Direct API (this guide) for media uploads
- ✅ Direct API supports: text, images, videos

---

**Last Updated:** March 2026
**API Version:** Twitter API v2 with OAuth 1.0a
