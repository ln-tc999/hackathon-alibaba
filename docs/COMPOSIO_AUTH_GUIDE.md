# Composio Authentication Guide

Guide lengkap untuk setup authentication Twitter dan TikTok di Composio menggunakan custom credentials.

## Prerequisites

- Akun Composio (https://app.composio.dev/)
- Composio API Key: `your-api-key`

---

## 🐦 Twitter/X Authentication

### Step 1: Buat Twitter Developer Account

1. **Daftar Twitter Developer**
   - Buka: https://developer.x.com/
   - Login dengan akun Twitter kamu
   - Apply for Developer Account
   - Pilih use case: "Building tools for Twitter users"
   - Isi form aplikasi (nama project, deskripsi, dll)

2. **Buat Project & App**
   - Setelah approved, buka Developer Portal
   - Klik "Projects & Apps" → "Create Project"
   - Nama project: `VlowGen Platform`
   - Use case: `Making a bot`
   - Project description: `AI-powered social media automation platform`

3. **Setup App**
   - Dalam project, klik "Create App"
   - App name: `VlowGen Bot` (harus unique)
   - Klik "Complete"

### Step 2: Get API Credentials

1. **Get API Keys**
   - Di App settings, tab "Keys and tokens"
   - Klik "Generate" di bagian "API Key and Secret"
   - **SIMPAN CREDENTIALS INI:**
     ```
     API Key (Client ID): xxxxxxxxxxxxxxxxxxxxx
     API Key Secret (Client Secret): xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
     ```
   - ⚠️ Secret hanya ditampilkan sekali! Save di tempat aman

2. **Generate Access Token (Optional)**
   - Scroll ke "Authentication Tokens"
   - Klik "Generate" di "Access Token and Secret"
   - Simpan jika diperlukan

3. **Setup OAuth 2.0**
   - Klik tab "Settings"
   - Scroll ke "User authentication settings"
   - Klik "Set up"
   
   **OAuth Settings - ISI SEPERTI INI:**
   
   **App permissions:**
   - ✅ Pilih: `Read and write`
   - (Jangan pilih "Read and write and Direct message" kecuali butuh DM)
   
   **Type of App:**
   - ✅ Pilih: `Web App, Automated App or Bot` (Confidential client)
   
   **App info:**
   - **Callback URI / Redirect URL:**
     ```
     https://backend.composio.dev/api/v1/auth-apps/add
     ```
     (Klik "Add another" jika mau tambah backup URL)
   
   - **Website URL:**
     ```
     https://vlowgen.com
     ```
     (Atau domain kamu, atau bisa pakai `http://localhost:3000` untuk development)
   
   - **Organization name:** (Optional)
     ```
     VlowGen
     ```
   
   - **Organization URL:** (Optional)
     ```
     https://vlowgen.com
     ```
   
   - **Terms of Service:** (Optional - kosongkan dulu)
     ```
     https://vlowgen.com/terms
     ```
   
   - **Privacy Policy:** (Optional - kosongkan dulu)
     ```
     https://vlowgen.com/privacy
     ```
   
   - ⚠️ **PENTING:** Callback URI harus exact: `https://backend.composio.dev/api/v1/auth-apps/add`
   - Website URL bisa pakai domain apapun atau localhost
   - Terms & Privacy bisa dikosongkan untuk development
   
   - Klik "Save"

### Step 3: Setup di Composio

1. **Buka Composio Dashboard**
   - Login ke https://app.composio.dev/
   - Klik "Apps" di sidebar

2. **Find Twitter App**
   - Search "Twitter" atau "X"
   - Klik pada Twitter app

3. **Add Custom Integration**
   - Klik "Add Integration" atau "Configure"
   - Pilih "Custom Auth" atau "Bring Your Own Credentials"
   
   **Isi Form:**
   ```
   Integration Name: Twitter Custom
   Auth Type: OAuth 2.0
   Client ID: [API Key dari Step 2]
   Client Secret: [API Key Secret dari Step 2]
   Callback URL: https://backend.composio.dev/api/v1/auth-apps/add
   ```

4. **Connect Account**
   - Klik "Connect Account"
   - Authorize aplikasi di Twitter
   - Setelah berhasil, kamu akan dapat Entity ID

5. **Test Connection**
   ```bash
   cd test/social-post
   pnpm check-status
   ```
   
   Pastikan Twitter muncul di list connected accounts.

---

## 🎵 TikTok Authentication

### Step 1: Buat TikTok Developer Account

1. **Daftar TikTok for Developers**
   - Buka: https://developers.tiktok.com/
   - Klik "Register" atau "Login"
   - Login dengan akun TikTok kamu
   - Verify email dan phone number

2. **Create App**
   - Setelah login, klik "Manage apps"
   - Klik "Connect an app"
   - Pilih "Create new app"

3. **App Information**
   ```
   App name: VlowGen Platform
   Company/Individual name: [Nama kamu/perusahaan]
   Industry: Social Media Management
   App description: AI-powered social media automation platform
   ```

### Step 2: Configure App Settings

1. **Basic Information**
   - **App icon:** Upload logo (1024x1024px, max 5MB, JPEG/JPG/PNG)
   - **App name:** `VlowGen Platform`
   - **Category:** `Social` atau `Productivity`
   - **Description:** 
     ```
     AI-powered social media automation platform that helps users create and schedule content across multiple platforms.
     ```
   - **Terms of Service URL:** 
     ```
     https://vlowgen.com/terms
     ```
     (Atau GitHub link untuk development)
   - **Privacy Policy URL:**
     ```
     https://vlowgen.com/privacy
     ```
     (Atau GitHub link untuk development)
   - **Platform:** ✅ `Web`

2. **Add Products**
   - Klik "Add products"
   - ✅ Pilih "Login Kit" (untuk authentication)
   - ✅ Pilih "Content Posting API" (untuk posting video)

3. **Add Scopes**
   - Klik "Add scopes"
   - ✅ `user.info.basic` - Basic user info
   - ✅ `user.info.profile` - Profile info
   - ✅ `video.upload` - Upload video
   - ✅ `video.publish` - Publish video
   - ✅ `video.list` - List videos

4. **Redirect URI (di Login Kit settings)**
   - Add redirect URI:
     ```
     https://backend.composio.dev/api/v1/auth-apps/add
     ```

⚠️ **PENTING:** TikTok memerlukan app review untuk production. Untuk development, gunakan **Sandbox Mode** (tidak perlu review).

### Step 3: Get API Credentials

1. **Get Client Key & Secret**
   - Di App dashboard, tab "Basic information"
   - Lihat section "Credentials"
   - **SIMPAN CREDENTIALS INI:**
     ```
     Client Key (Client ID): awxxxxxxxxxxxxxxxxxx
     Client Secret: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
     ```

2. **Scopes/Permissions**
   - Pastikan scopes berikut enabled:
     - `user.info.basic` - Basic user info
     - `video.upload` - Upload video
     - `video.publish` - Publish video
     - `video.list` - List videos

### Step 4: Setup di Composio

1. **Buka Composio Dashboard**
   - Login ke https://app.composio.dev/
   - Klik "Apps" di sidebar

2. **Find TikTok App**
   - Search "TikTok"
   - Klik pada TikTok app

3. **Add Custom Integration**
   - Klik "Add Integration" atau "Configure"
   - Pilih "Custom Auth" atau "Bring Your Own Credentials"
   
   **Isi Form:**
   ```
   Integration Name: TikTok Custom
   Auth Type: OAuth 2.0
   Client ID: [Client Key dari Step 3]
   Client Secret: [Client Secret dari Step 3]
   Callback URL: https://backend.composio.dev/api/v1/auth-apps/add
   Scopes: user.info.basic,video.upload,video.publish
   ```

4. **Connect Account**
   - Klik "Connect Account"
   - Login ke TikTok
   - Authorize aplikasi
   - Setelah berhasil, kamu akan dapat Entity ID

5. **Test Connection**
   ```bash
   cd test/social-post
   pnpm check-status
   ```
   
   Pastikan TikTok muncul di list connected accounts.

---

## 🔧 Troubleshooting

### Twitter Issues

**Error: "Invalid OAuth 2.0 credentials"**
- Pastikan Client ID dan Secret benar
- Check callback URL: `https://backend.composio.dev/api/v1/auth-apps/add`
- Pastikan OAuth 2.0 settings sudah di-save di Twitter Developer Portal

**Error: "App does not have required permissions"**
- Di Twitter Developer Portal → App Settings → User authentication settings
- Pastikan permissions: `Read and write`
- Re-authorize aplikasi

**Error: "Callback URL mismatch"**
- Callback URL di Twitter harus exact match dengan Composio
- Format: `https://backend.composio.dev/api/v1/auth-apps/add`

### TikTok Issues

**Error: "App not approved"**
- Beberapa TikTok APIs memerlukan review
- Submit app untuk review di TikTok Developer Portal
- Proses review bisa 1-7 hari

**Error: "Invalid scopes"**
- Pastikan scopes yang diminta sudah enabled di app
- Check di TikTok Developer Portal → Products → Content Posting API

**Error: "Redirect URI mismatch"**
- Redirect URI di TikTok harus exact match
- Format: `https://backend.composio.dev/api/v1/auth-apps/add`

---

## 📝 Environment Variables

Setelah setup, update `.env` files:

### Backend `.env`
```bash
COMPOSIO_API_KEY=ak_C4a5-yJQmd8bjd5wsB9E
COMPOSIO_API_URL=https://backend.composio.dev/api

# Entity IDs (dari check-composio-status)
TWITTER_ENTITY_ID=your_twitter_entity_id
TIKTOK_ENTITY_ID=your_tiktok_entity_id
```

### Frontend `.env.local`
```bash
NEXT_PUBLIC_COMPOSIO_API_KEY=ak_C4a5-yJQmd8bjd5wsB9E

# Auth Config IDs (dari Composio dashboard)
TWITTER_AUTH_CONFIG_ID=your_twitter_auth_config_id
TIKTOK_AUTH_CONFIG_ID=your_tiktok_auth_config_id
```

---

## ✅ Verification

Test semua connections:

```bash
cd test/social-post
pnpm check-status
```

Expected output:
```
✅ Found 5 connected account(s):

📱 twitter
   Status: ✅ Active
   Entity ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

📱 tiktok
   Status: ✅ Active
   Entity ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

📱 instagram
   Status: ✅ Active
   Entity ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

📱 facebook
   Status: ✅ Active
   Entity ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

📱 youtube
   Status: ✅ Active
   Entity ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

---

## 📚 References

- **Twitter Developer Docs**: https://developer.x.com/en/docs
- **TikTok Developer Docs**: https://developers.tiktok.com/doc/
- **Composio Docs**: https://docs.composio.dev/
- **OAuth 2.0 Guide**: https://oauth.net/2/

---

## 🆘 Support

Jika masih ada masalah:
1. Check Composio logs di dashboard
2. Verify credentials di developer portals
3. Test dengan Composio CLI tools
4. Contact Composio support: support@composio.dev
