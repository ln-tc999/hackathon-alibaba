# TikTok Setup - Quick Reference

## ⚠️ PENTING: TikTok Memerlukan App Review!

TikTok lebih strict dibanding platform lain. Aplikasi harus di-review dan approved sebelum bisa digunakan untuk production.

---

## 📋 Form Settings untuk TikTok Developer Portal

### 🔑 Credentials (Sudah Ada)
```
Client key: ••••••••••••••••• (Sudah dapat)
Client secret: ••••••••••••••••• (Sudah dapat)
```
✅ Simpan credentials ini untuk Composio!

---

### 🎨 Basic Information

**App icon** (WAJIB):
- Upload logo 1024x1024px
- Format: JPEG, JPG, atau PNG
- Max 5MB
- Bisa pakai logo VlowGen atau buat simple logo

**App name** (WAJIB):
```
VlowGen Platform
```
(13/50 characters)

**Category** (WAJIB):
```
Social
```
atau
```
Productivity
```

**Description** (WAJIB):
```
AI-powered social media automation platform that helps users create and schedule content across multiple platforms.
```
(120 characters max)

**Terms of Service URL** (WAJIB):
```
https://vlowgen.com/terms
```
atau untuk development:
```
https://github.com/yourusername/vlowgen/blob/main/TERMS.md
```

**Privacy Policy URL** (WAJIB):
```
https://vlowgen.com/privacy
```
atau untuk development:
```
https://github.com/yourusername/vlowgen/blob/main/PRIVACY.md
```

**Platforms** (WAJIB):
```
☑️ Web
```
(Pilih Web untuk sekarang)

---

### 📦 Products & Scopes

**Klik "Add products"**, pilih:

1. **Login Kit** (untuk authentication)
   - Scopes yang diperlukan:
     - `user.info.basic` - Basic user info
     - `user.info.profile` - Profile info

2. **Content Posting API** (untuk posting video)
   - Scopes yang diperlukan:
     - `video.upload` - Upload video
     - `video.publish` - Publish video
     - `video.list` - List videos

**Klik "Add scopes"** dan pilih scopes di atas.

---

### 🎬 App Review (WAJIB untuk Production)

⚠️ **Ini bagian yang paling kompleks!**

**Explain how each product works** (WAJIB):
```
VlowGen Platform integrates with TikTok to enable automated content posting:

1. Login Kit: Users authenticate their TikTok account to grant VlowGen permission to post on their behalf.

2. Content Posting API: 
   - Users create video content using our AI tools
   - Videos are uploaded to TikTok via the video.upload scope
   - Videos are published to user's TikTok account via video.publish scope
   - Users can view their posted videos via video.list scope

The platform helps content creators automate their TikTok posting workflow while maintaining full control over their content.
```
(1000 characters max)

**Upload demo video** (WAJIB):
- Format: MP4 atau MOV
- Max 5 files, 50MB each
- Harus show complete flow:
  1. Login ke aplikasi
  2. Connect TikTok account (Login Kit)
  3. Upload video
  4. Publish ke TikTok
  5. View posted video

---

## 🚀 2 Options untuk Development

### Option 1: Sandbox Mode (RECOMMENDED untuk Development)

**Keuntungan:**
- ✅ Tidak perlu app review
- ✅ Bisa langsung test
- ✅ Cukup untuk development

**Cara:**
1. Jangan submit app review dulu
2. Gunakan sandbox environment
3. Test dengan akun developer kamu sendiri
4. Credentials tetap bisa digunakan untuk testing

**Setup di Composio:**
```
Client ID: [Client key dari TikTok]
Client Secret: [Client secret dari TikTok]
Environment: Sandbox
```

### Option 2: Production Mode (Butuh Review)

**Keuntungan:**
- ✅ Bisa digunakan user lain
- ✅ Full production access

**Kekurangan:**
- ❌ Butuh app review (1-7 hari)
- ❌ Butuh demo video
- ❌ Butuh Terms & Privacy Policy

**Langkah:**
1. Lengkapi semua form di atas
2. Buat demo video
3. Submit for review
4. Tunggu approval

---

## 📝 Minimal Setup untuk Testing (Sandbox)

Untuk bisa test sekarang tanpa review:

1. **Basic Information:**
   - App icon: Upload logo simple
   - App name: `VlowGen Platform`
   - Category: `Social`
   - Description: Isi deskripsi singkat
   - Terms & Privacy: Bisa pakai GitHub links atau placeholder

2. **Products:**
   - Add "Login Kit"
   - Add "Content Posting API"

3. **Scopes:**
   - `user.info.basic`
   - `video.upload`
   - `video.publish`

4. **JANGAN submit review dulu** - gunakan sandbox mode

5. **Copy Client Key & Secret** ke Composio

---

## 🔗 Redirect URI untuk Composio

Setelah setup products, tambahkan redirect URI:

**Di Login Kit settings:**
```
Redirect URI: https://backend.composio.dev/api/v1/auth-apps/add
```

---

## 🎯 Next Steps

### Untuk Development (Sekarang):
1. ✅ Isi Basic Information (minimal)
2. ✅ Add Products & Scopes
3. ✅ Copy Client Key & Secret
4. ✅ Setup di Composio (Sandbox mode)
5. ✅ Test dengan akun kamu sendiri

### Untuk Production (Nanti):
1. ⏭️ Buat demo video
2. ⏭️ Lengkapi Terms & Privacy Policy
3. ⏭️ Submit for review
4. ⏭️ Tunggu approval
5. ⏭️ Update Composio ke production mode

---

## 🆘 Troubleshooting

**"App not approved"**
- Gunakan sandbox mode untuk development
- Submit review hanya kalau mau production

**"Invalid scopes"**
- Pastikan scopes sudah di-add di Products
- Check di Content Posting API settings

**"Redirect URI mismatch"**
- Add redirect URI di Login Kit settings
- Format: `https://backend.composio.dev/api/v1/auth-apps/add`

---

## 💡 Tips

1. **Untuk development:** Gunakan sandbox mode, tidak perlu review
2. **Untuk production:** Siapkan demo video dan submit review
3. **Demo video:** Bisa record screen dengan OBS atau QuickTime
4. **Terms & Privacy:** Bisa pakai template dari internet atau GitHub

---

## 📚 Resources

- **TikTok Developer Portal:** https://developers.tiktok.com/
- **App Review Guidelines:** https://developers.tiktok.com/doc/app-review-guidelines
- **Content Posting API:** https://developers.tiktok.com/doc/content-posting-api-get-started
- **Sandbox Testing:** https://developers.tiktok.com/doc/sandbox-testing

---

## ✅ Quick Checklist

- [ ] App icon uploaded (1024x1024px)
- [ ] App name: VlowGen Platform
- [ ] Category: Social
- [ ] Description filled
- [ ] Terms & Privacy URLs added
- [ ] Login Kit product added
- [ ] Content Posting API product added
- [ ] Scopes added (user.info.basic, video.upload, video.publish)
- [ ] Redirect URI added in Login Kit
- [ ] Client Key & Secret copied
- [ ] Setup in Composio Dashboard
- [ ] Test connection: `pnpm check-status`
