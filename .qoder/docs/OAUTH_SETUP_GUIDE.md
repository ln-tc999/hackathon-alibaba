# OAuth Setup Guide - Social Media Integration

Panduan lengkap untuk setup OAuth authentication untuk Instagram, Facebook, dan Twitter menggunakan Composio.

## Prerequisites

1. **Composio Account**: https://app.composio.dev/
2. **Composio API Key**: `ak_C4a5-yJQmd8bjd5wsB9E` (sudah ada)
3. **Backend Server Running**: `cd packages/backend && npm run dev`

## Step 1: Setup Composio Dashboard

### 1.1 Login ke Composio
```
https://app.composio.dev/
```

### 1.2 Navigate to Integrations
- Go to "Integrations" tab
- Search for platform (Instagram, Facebook, Twitter)
- Click "Enable" for each platform

### 1.3 Get Auth Config IDs
Setiap platform punya Auth Config ID yang sudah ada di `.env`:
```bash
INSTAGRAM_AUTH_CONFIG_ID=ac_meR-wKjTyyl_
FACEBOOK_AUTH_CONFIG_ID=ac_dhh5sQIijzKa
YOUTUBE_AUTH_CONFIG_ID=ac_uioofLhJ6UkR
```

## Step 2: Instagram OAuth Setup

### 2.1 Get Instagram OAuth URL
```bash
curl http://localhost:3001/api/auth/instagram/url
```

**Expected Response:**
```json
{
  "authUrl": "https://app.composio.dev/authorize?...",
  "state": "random-state-string"
}
```

### 2.2 Complete Authorization
1. Copy `authUrl` dari response
2. Open di browser
3. Login dengan Instagram account
4. Authorize aplikasi
5. Browser akan redirect ke callback URL

### 2.3 Verify Token Stored
Token akan otomatis tersimpan di backend memory setelah callback.

### 2.4 Test Instagram Post
```bash
node test-social-media-workflows.js instagram
```

## Step 3: Facebook OAuth Setup

### 3.1 Get Facebook OAuth URL
```bash
curl http://localhost:3001/api/auth/facebook/url
```

### 3.2 Complete Authorization
Same process as Instagram:
1. Open authUrl in browser
2. Login with Facebook
3. Authorize app
4. Wait for callback

### 3.3 Test Facebook Post
```bash
node test-social-media-workflows.js facebook
```

## Step 4: Twitter OAuth Setup

### 4.1 Get Twitter OAuth URL
```bash
curl http://localhost:3001/api/auth/twitter/url
```

**Expected Response:**
```json
{
  "authUrl": "https://app.composio.dev/authorize?...",
  "state": "random-state-string"
}
```

### 4.2 Complete Authorization
1. Open authUrl in browser
2. Login with Twitter/X account
3. Authorize app
4. Wait for callback

### 4.3 Test Twitter Post
```bash
node test-social-media-workflows.js twitter
```

## Step 5: Verify All Integrations

### 5.1 Check Connected Accounts
```bash
# Check Instagram
curl http://localhost:3001/api/auth/instagram/status

# Check Facebook
curl http://localhost:3001/api/auth/facebook/status

# Check Twitter
curl http://localhost:3001/api/auth/twitter/status
```

### 5.2 Run Full Test Suite
```bash
# Test all platforms
node test-social-media-workflows.js instagram
node test-social-media-workflows.js facebook
node test-social-media-workflows.js twitter
```

## Troubleshooting

### Issue 1: "Composio API network error"
**Cause**: Cannot reach api.composio.dev

**Solutions**:
1. Check internet connection
2. Verify Composio API is up: `curl https://api.composio.dev/health`
3. Check firewall/proxy settings
4. Try different network

### Issue 2: "Invalid API key"
**Cause**: Composio API key invalid or expired

**Solutions**:
1. Verify API key in Composio dashboard
2. Regenerate API key if needed
3. Update `COMPOSIO_API_KEY` in `.env`
4. Restart backend server

### Issue 3: "Authentication required"
**Cause**: OAuth not completed

**Solutions**:
1. Complete OAuth flow first (Step 2-4)
2. Check token is stored: Look for success message in backend logs
3. Token expires after 24 hours - re-authenticate if needed

### Issue 4: "Platform not connected"
**Cause**: Integration not enabled in Composio dashboard

**Solutions**:
1. Go to Composio dashboard
2. Enable integration for the platform
3. Complete OAuth flow again

### Issue 5: OAuth Callback Failed
**Cause**: Callback URL not configured

**Solutions**:
1. Check backend is running on correct port (3001)
2. Verify callback URL in Composio dashboard matches:
   - Instagram: `http://localhost:3001/api/auth/instagram/callback`
   - Facebook: `http://localhost:3001/api/auth/facebook/callback`
   - Twitter: `http://localhost:3001/api/auth/twitter/callback`
3. For production, use HTTPS URLs

## OAuth Flow Diagram

```
User → Get OAuth URL → Open in Browser → Login to Platform
  ↓
Authorize App → Redirect to Callback → Backend Stores Token
  ↓
Token Stored → Ready to Post → Test Workflow
```

## Security Notes

1. **Token Storage**: Currently in-memory (MVP)
   - Tokens lost on server restart
   - For production: Use encrypted database

2. **Token Expiration**: Tokens expire after 24 hours
   - Need to re-authenticate periodically
   - Implement token refresh mechanism

3. **API Keys**: Never commit to git
   - Use environment variables
   - Rotate keys regularly

4. **HTTPS**: Use HTTPS in production
   - OAuth requires secure callback URLs
   - Protect token transmission

## Alternative: Manual Token Setup (For Testing)

If OAuth flow is not working, you can manually set tokens:

### 1. Get Token from Composio Dashboard
1. Go to Composio dashboard
2. Navigate to "Connected Accounts"
3. Copy access token for platform

### 2. Set Token in Backend
Edit `packages/backend/src/api/workflows.ts`:
```typescript
// Add manual token for testing
const tokenStorage = new Map<string, { token: string; accountHandle: string }>();
tokenStorage.set('test-instagram', {
  token: 'your-instagram-token',
  accountHandle: 'your-handle'
});
```

### 3. Update Test Script
Use the token key in test:
```javascript
const testCredentials = {
  wan2ApiKey: 'sk-466ebab0feed41f7880c3b7ca509d15b',
  composioApiKey: 'ak_C4a5-yJQmd8bjd5wsB9E',
  composioApiUrl: 'https://api.composio.dev',
  instagramToken: 'test-instagram' // Use token key
};
```

## Next Steps After OAuth Setup

1. **Test All Platforms**: Run test scripts for each platform
2. **Verify Posts**: Check posts appear on social media
3. **Test Video Posts**: Create video workflow tests
4. **Implement Frontend OAuth**: Add OAuth buttons in UI
5. **Add Token Refresh**: Implement automatic token refresh
6. **Production Deployment**: Use HTTPS and secure storage

## Support

If you encounter issues:
1. Check backend logs for detailed errors
2. Verify all environment variables are set
3. Test Composio API directly with curl
4. Check Composio dashboard for integration status
5. Review TEST_RESULTS.md for known issues
