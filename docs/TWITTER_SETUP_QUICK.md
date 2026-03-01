# Twitter Setup - Quick Reference

## Form Settings untuk Twitter Developer Portal

### ✅ App permissions
```
☑️ Read and write
```
(Pilih ini untuk bisa post tweets)

### ✅ Type of App
```
☑️ Web App, Automated App or Bot (Confidential client)
```

### ✅ App info

**Callback URI / Redirect URL** (WAJIB):
```
https://backend.composio.dev/api/v1/auth-apps/add
```

**Website URL** (WAJIB):
```
https://vlowgen.com
```
atau
```
http://localhost:3000
```
(Pakai domain apapun, tidak masalah untuk development)

**Organization name** (Optional):
```
VlowGen
```

**Organization URL** (Optional):
```
https://vlowgen.com
```

**Terms of Service** (Optional):
```
(Kosongkan dulu atau isi: https://vlowgen.com/terms)
```

**Privacy Policy** (Optional):
```
(Kosongkan dulu atau isi: https://vlowgen.com/privacy)
```

---

## ⚠️ PENTING

1. **Callback URI harus EXACT:**
   - `https://backend.composio.dev/api/v1/auth-apps/add`
   - Jangan ada typo atau spasi
   - Harus HTTPS

2. **Website URL bisa apa saja:**
   - Domain kamu
   - `http://localhost:3000`
   - Tidak perlu deploy dulu

3. **Terms & Privacy:**
   - Bisa dikosongkan untuk development
   - Nanti bisa diupdate kalau sudah production

---

## 🔑 Setelah Save

Kamu akan dapat:
- ✅ Client ID (API Key)
- ✅ Client Secret (API Key Secret)

**SIMPAN CREDENTIALS INI!** Secret hanya ditampilkan sekali.

---

## 🔗 Next Steps

1. Copy Client ID & Secret
2. Buka Composio Dashboard: https://app.composio.dev/
3. Search "Twitter" di Apps
4. Add Custom Integration
5. Paste Client ID & Secret
6. Connect Account
7. Test: `cd test/social-post && pnpm check-status`

---

## 🆘 Troubleshooting

**Error: "Callback URL mismatch"**
- Check typo di callback URL
- Harus exact: `https://backend.composio.dev/api/v1/auth-apps/add`

**Error: "Invalid credentials"**
- Pastikan copy Client ID & Secret dengan benar
- Jangan ada spasi di awal/akhir

**Error: "App does not have required permissions"**
- Pastikan pilih "Read and write"
- Re-authorize aplikasi di Composio
