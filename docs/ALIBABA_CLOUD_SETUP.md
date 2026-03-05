# Alibaba Cloud Setup Guide - VlowGen

Panduan lengkap untuk setup Alibaba Cloud services untuk VlowGen platform.

---

## 🎯 Services yang Digunakan

VlowGen menggunakan 100% Alibaba Cloud services:

1. **Qwen Models** (via DashScope) - Text generation, vision analysis, prompt enhancement
2. **Wan2.1** - Image generation
3. **Composio** - Social media integrations (Twitter, Instagram, Facebook, TikTok, YouTube)

---

## 📋 Step 1: Setup DashScope (Qwen Models)

### 1.1 Login ke Alibaba Cloud

Buka console berdasarkan region:
- **Singapore (Recommended):** https://bailian.console.alibabacloud.com/?regionId=ap-southeast-1
- **US (Virginia):** https://bailian.console.alibabacloud.com/?regionId=us-east-1
- **China (Beijing):** https://bailian.console.aliyun.com/?regionId=cn-beijing

### 1.2 Activate Model Studio

- Jika muncul prompt activation, klik **"Activate"**
- Service activation GRATIS, hanya bayar untuk usage
- Dapat free quota untuk testing

### 1.3 Create API Key

1. Go to **Key Management** page
2. Klik **"Create API Key"**
3. Configure:
   - **Owner Account:** Pilih Alibaba Cloud account
   - **Workspace:** Pilih **"Default workspace"**
   - **Description:** "VlowGen Platform"
4. Klik **"OK"**
5. **Copy API key** (format: `sk-xxxxxxxx...`)

### 1.4 Activate Models

⚠️ **PENTING:** Kamu harus activate models sebelum bisa dipakai!

1. Di sidebar, klik **"Model Gallery"** atau **"Models"**
2. Cari dan activate models berikut:
   - **qwen-plus** - Text generation (recommended, balanced)
   - **qwen-turbo** - Fast & cheap alternative
   - **qwen-vl-plus** - Vision analysis (image/video)
3. Untuk setiap model:
   - Klik model card
   - Klik **"Activate"** atau **"Enable"**
   - Baca Terms of Service
   - Klik **"Agree and Activate"**

### 1.5 Check Free Quota

Setelah activation, check quota di console:
- Text generation: Biasanya ribuan tokens gratis
- Vision models: Ratusan requests gratis

---

## 🖼️ Step 2: Setup Wan2.1 (Image Generation)

### 2.1 Activate Wan2 Service

1. Di Model Studio console, go to **"Model Gallery"**
2. Cari **"Wan2.1"** atau **"Wanx"**
3. Klik **"Activate"**
4. Baca Terms of Service, klik **"Agree"**

### 2.2 Use Same API Key

Wan2.1 menggunakan API key yang sama dengan Qwen (DashScope API key).

---

## 🔧 Step 3: Configure Environment Variables

### 3.1 Update `.env.local` di Frontend

```bash
# Alibaba Cloud - Qwen/DashScope Configuration
DASHSCOPE_API_KEY=sk-466ebab0feed41f7880c3b7ca509d15b
NEXT_PUBLIC_DASHSCOPE_API_KEY=sk-466ebab0feed41f7880c3b7ca509d15b
NEXT_PUBLIC_QWEN_BASE_URL=https://dashscope-intl.aliyuncs.com/compatible-mode/v1
NEXT_PUBLIC_QWEN_TEXT_MODEL=qwen-plus
NEXT_PUBLIC_QWEN_VISION_MODEL=qwen-vl-plus

# Alibaba Cloud - Wan2 Image Generation
NEXT_PUBLIC_WAN2_API_KEY=sk-466ebab0feed41f7880c3b7ca509d15b
```

### 3.2 Update Backend Environment

Backend akan otomatis baca `DASHSCOPE_API_KEY` dari environment.

---

## 🧪 Step 4: Test API Connection

### Test 1: Qwen Text Generation

```bash
curl -X POST https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions \
  -H "Authorization: Bearer sk-466ebab0feed41f7880c3b7ca509d15b" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen-plus",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'
```

Expected response:
```json
{
  "choices": [{
    "message": {
      "role": "assistant",
      "content": "Hello! How can I help you today?"
    }
  }]
}
```

### Test 2: Qwen Vision

```bash
curl -X POST https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions \
  -H "Authorization: Bearer sk-466ebab0feed41f7880c3b7ca509d15b" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen-vl-plus",
    "messages": [{
      "role": "user",
      "content": [
        {"type": "text", "text": "Describe this image"},
        {"type": "image_url", "image_url": {"url": "https://example.com/image.jpg"}}
      ]
    }]
  }'
```

---

## ❌ Troubleshooting

### Error: "AccessDenied.Unpurchased"

**Penyebab:** Model belum di-activate

**Solusi:**
1. Login ke console
2. Go to Model Gallery
3. Activate model yang mau dipakai (qwen-plus, qwen-vl-plus, dll)

### Error: "InvalidApiKey"

**Penyebab:** API key salah atau region tidak sesuai

**Solusi:**
1. Verify API key di console
2. Pastikan base URL sesuai region:
   - Singapore: `https://dashscope-intl.aliyuncs.com`
   - US: `https://dashscope-us.aliyuncs.com`
   - Beijing: `https://dashscope.aliyuncs.com`

### Error: "InsufficientBalance"

**Penyebab:** Free quota habis atau balance tidak cukup

**Solusi:**
1. Check quota di console
2. Add payment method di https://account.alibabacloud.com/
3. Top up credit
4. Atau gunakan model lebih murah (qwen-turbo)

---

## 💰 Pricing & Quota

### Free Quota (New Users)

Setelah activate service, kamu dapat:
- Text generation: ~1M tokens gratis
- Vision analysis: ~1000 requests gratis
- Image generation: ~100 images gratis

### Pay-as-you-go Pricing

Setelah free quota habis:
- **qwen-turbo:** ~$0.0003/1K tokens
- **qwen-plus:** ~$0.0008/1K tokens
- **qwen-vl-plus:** ~$0.002/request
- **wan2.1:** ~$0.02/image

Check latest pricing: https://www.alibabacloud.com/help/en/model-studio/pricing

---

## 🚀 Next Steps

1. ✅ API key sudah di-set
2. ✅ Models sudah di-activate
3. ✅ Test API berhasil
4. ⏭️ Start development server:

```bash
# Backend
cd packages/backend
pnpm dev

# Frontend
cd packages/frontend
pnpm dev
```

5. ⏭️ Test di browser: http://localhost:3000

---

## 📚 Resources

- **Console:** https://bailian.console.alibabacloud.com/
- **Documentation:** https://www.alibabacloud.com/help/en/model-studio
- **API Reference:** https://www.alibabacloud.com/help/en/model-studio/qwen-api-reference
- **Pricing:** https://www.alibabacloud.com/help/en/model-studio/pricing
- **Support:** https://www.alibabacloud.com/support

---

**Built with ❤️ using 100% Alibaba Cloud**
