# Social Media Integration Test

Test script untuk testing posting ke social media platforms via VlowGen workflow execution API.

**Platforms:** Twitter, Facebook, YouTube, Instagram  
**Note:** TikTok di-skip sesuai request

## Prerequisites

### 1. Backend Running
```bash
cd packages/backend
pnpm dev
```

### 2. Environment Variables

Edit `.env` di root folder:

```env
# Composio API Key (REQUIRED)
COMPOSIO_API_KEY=ak_C4a5-yJQmd8bjd5wsB9E

# Connected Account IDs dari Composio
# Get these from: https://app.composio.dev → Apps → Connected Accounts
TWITTER_CONNECTED_ACCOUNT_ID=059a47ad-7dec-484a-9e2f-9a306d7aee4a
FACEBOOK_CONNECTED_ACCOUNT_ID=your-facebook-connected-account-id
YOUTUBE_CONNECTED_ACCOUNT_ID=your-youtube-connected-account-id
INSTAGRAM_CONNECTED_ACCOUNT_ID=your-instagram-connected-account-id

# Optional: Twitter Auth Config ID
TWITTER_AUTH_CONFIG_ID=ac_75SilkQv1YXU
```

### 3. Connect Social Media Accounts

1. **Buka** https://app.composio.dev
2. **Login** dengan akun Anda
3. **Go to** Apps
4. **Connect** masing-masing platform:
   - Twitter → Connect → Authorize
   - Facebook → Connect → Authorize
   - YouTube → Connect → Authorize
   - Instagram → Connect → Authorize
5. **Copy** Connected Account ID untuk setiap platform
6. **Paste** ke `.env` file

---

## Cara Menjalankan Test

### Option 1: Via npm script
```bash
pnpm test:social
```

### Option 2: Manual
```bash
npx tsx test-social-media.ts
```

---

## Output

### Contoh Output Success:
```
╔═══════════════════════════════════════════════════════════╗
║     VlowGen Social Media Integration Test Suite          ║
╚═══════════════════════════════════════════════════════════╝

Backend URL: http://localhost:3001
Tests to run: 4 (TikTok skipped)

Connected Account IDs:
  TWITTER: ✓ 059a47ad-7dec-484a-9e...
  FACEBOOK: ✓ 12345678-abcd-efgh-ij...
  YOUTUBE: ✓ abcdefgh-1234-5678-ij...
  INSTAGRAM: ✓ 12345678-abcd-efgh-ij...

✓ Backend is running
✓ Composio API key is set

============================================================
Testing: Twitter
============================================================
Prompt: Create a viral meme about AI and post to Twitter

Step 1: Creating workflow from prompt...
✓ Workflow created
  Nodes: prompt-text → prompt-enhancer-image → wan2 → twitter

Step 2: Executing workflow...
✓ Workflow executed successfully!

  node-twitter:
    Status: success
    Tweet: https://twitter.com/i/web/status/123456789

... (tests untuk platform lain)

════════════════════════════════════════════════════════════
TEST SUMMARY
════════════════════════════════════════════════════════════
✓ Twitter: PASSED
✓ Facebook: PASSED
✓ YouTube: PASSED
✓ Instagram: PASSED

Total: 4 tests
Passed: 4
Failed: 0

✓ All tests passed!
```

### Contoh Output Failed:
```
✗ Twitter: FAILED
  Error: Twitter connection expired. Please reconnect...

════════════════════════════════════════════════════════════
TEST SUMMARY
════════════════════════════════════════════════════════════
✗ Twitter: FAILED
✓ Facebook: PASSED
✓ YouTube: PASSED
✓ Instagram: PASSED

Total: 4 tests
Passed: 3
Failed: 1

⚠️  Some tests failed. Check the error messages above.

Environment variables to check:
  COMPOSIO_API_KEY=ak_...
  TWITTER_CONNECTED_ACCOUNT_ID=...
  FACEBOOK_CONNECTED_ACCOUNT_ID=...
  YOUTUBE_CONNECTED_ACCOUNT_ID=...
  INSTAGRAM_CONNECTED_ACCOUNT_ID=...
```

---

## Troubleshooting

### Error 401 Unauthorized
**Penyebab:** Connected account expired

**Solusi:**
1. Buka https://app.composio.dev
2. Apps → {Platform yang failed}
3. Click "Reconnect"
4. Authorize account
5. Copy Connected Account ID yang baru
6. Update `.env`:
   ```env
   {PLATFORM}_CONNECTED_ACCOUNT_ID=new-id-here
   ```
7. Restart backend

### Error: Backend not running
**Solusi:**
```bash
cd packages/backend
pnpm dev
```

### Error: No connected account found
**Penyebab:** Account belum connected di Composio

**Solusi:**
1. Buka https://app.composio.dev
2. Apps → Connect {Platform}
3. Authorize account
4. Copy Connected Account ID
5. Update `.env` dengan ID tersebut
6. Restart backend

### Error: COMPOSIO_API_KEY not set
**Solusi:**
1. Buka https://app.composio.dev
2. Settings → API Keys
3. Copy API key
4. Update `.env`:
   ```env
   COMPOSIO_API_KEY=ak_your-key-here
   ```
5. Restart backend

---

## Workflow Test

Test script akan create dan execute workflow seperti ini:

```
┌──────────────┐
│ Prompt Text  │
└──────┬───────┘
       │
       ↓
┌──────────────────┐
│ Prompt Enhancer  │
└──────┬───────────┘
       │
       ↓
┌──────────────┐
│ Wan2.1 (AI)  │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ {Platform}   │  ← Twitter/Facebook/YouTube/Instagram
└──────────────┘
```

---

## Notes

- Test script akan create workflow sederhana untuk setiap platform
- Workflow execution bisa memakan waktu 1-2 menit tergantung platform
- Image generation (Wan2.1) memakan waktu ~30-60 detik
- Pastikan koneksi internet stabil saat testing
- TikTok di-skip sesuai request

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `COMPOSIO_API_KEY` | ✓ | API key dari Composio dashboard |
| `TWITTER_CONNECTED_ACCOUNT_ID` | ✓ | Twitter connected account ID |
| `FACEBOOK_CONNECTED_ACCOUNT_ID` | ✓ | Facebook connected account ID |
| `YOUTUBE_CONNECTED_ACCOUNT_ID` | ✓ | YouTube connected account ID |
| `INSTAGRAM_CONNECTED_ACCOUNT_ID` | ✓ | Instagram connected account ID |
| `TWITTER_AUTH_CONFIG_ID` | ✗ | Twitter OAuth config ID (optional) |

---

## Support

Jika ada masalah:
1. Check error message di console
2. Verify semua environment variables sudah di-set
3. Pastikan accounts sudah connected di Composio
4. Restart backend setelah update .env
