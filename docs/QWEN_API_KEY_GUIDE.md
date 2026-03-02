# Qwen API Key Guide - Step by Step

Guide lengkap untuk mendapatkan API key Qwen dari Alibaba Cloud Model Studio dan menggunakannya di VlowGen project.

---

## 📋 Prerequisites

Sebelum mulai, pastikan kamu punya:
- ✅ Akun Alibaba Cloud (daftar di https://www.alibabacloud.com/)
- ✅ Akun sudah diverifikasi (email & phone)
- ✅ Akun sudah punya payment method (untuk some models)

---

## 🔑 Step 1: Login ke Alibaba Cloud

1. **Buka Model Studio Console:**
   ```
   https://modelstudio.console.alibabacloud.com
   ```

2. **Login dengan akun Alibaba Cloud:**
   - Email: [your-email@domain.com]
   - Password: [your-password]
   - 2FA verification (jika aktif)

3. **Set Region (PENTING!):**
   - Di pojok kanan atas, pilih region:
     - **Singapore (ap-southeast-1)** - Recommended untuk international
     - **Beijing (cn-beijing)** - Untuk China region
   - API key berbeda per region!

---

## 🎯 Step 2: Activate Model Studio Service

1. **Jika service belum aktif:**
   - Kamu akan melihat halaman "Activate Service"
   - Klik tombol **"Activate Now"** atau **"Enable Service"**

2. **Set Workspace:**
   - Pilih workspace default atau buat workspace baru
   - Workspace name: `default` atau `vlowgen`
   - Klik **"Confirm"** atau **"Activate"**

3. **Tunggu activation selesai:**
   - Biasanya 1-2 menit
   - Refresh page jika perlu

---

## 🔑 Step 3: Create API Key

1. **Navigate ke API Key page:**
   - Di sidebar kiri, klik **"API-KEY"**
   - Atau langsung ke: `https://modelstudio.console.alibabacloud.com/api-key`

2. **Create New API Key:**
   - Klik tombol **"Create API Key"** atau **"Create My API Key"**
   - Modal akan muncul

3. **Configure API Key:**
   ```
   API Key Name: vlowgen-platform
   Description: API key for VlowGen AI content generation platform
   Workspace: default (atau workspace kamu)
   ```

4. **Klik "Create" atau "Confirm"**

---

## 📋 Step 4: Copy API Key

1. **API Key akan muncul setelah create:**
   ```
   API Key: sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

2. **⚠️ PENTING: Copy API Key SEKARANG!**
   - API key hanya ditampilkan sekali!
   - Jangan close tab sebelum copy
   - Simpan di tempat aman

3. **Simpan API Key:**
   - Copy ke password manager (1Password, Bitwarden, dll)
   - ATAU simpan di file `.env` (hanya untuk development)
   - Jangan commit ke Git!

---

## 🔒 Step 5: Configure API Key di Project

### Option A: Environment Variables (RECOMMENDED)

1. **Buat file `.env.local` di root project:**
```bash
# Qwen API Configuration
QWEN_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
QWEN_API_URL=https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation
```

2. **Atau untuk Vision models (Qwen-VL):**
```bash
# Qwen Vision API Configuration
QWEN_VL_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
QWEN_VL_API_URL=https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation
```

3. **Update `.env.local` di frontend:**
```bash
# Di packages/frontend/.env.local
NEXT_PUBLIC_QWEN_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_QWEN_IMAGE_MODEL=qwen-max
NEXT_PUBLIC_QWEN_VISION_MODEL=qwen-vl-max
```

### Option B: Backend Configuration

1. **Update backend config:**
```typescript
// packages/backend/src/integrations/qwen.ts
const QWEN_API_KEY = process.env.QWEN_API_KEY || 'your-default-key';
const QWEN_API_URL = process.env.QWEN_API_URL || 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
```

2. **Restart backend server:**
```bash
pnpm dev
```

---

## 🧪 Step 6: Test API Key

### Test 1: Quick Test dengan cURL

```bash
curl -X POST https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen-max",
    "input": {
      "prompt": "Hello, this is a test!"
    }
  }'
```

### Test 2: Test dengan Node.js

```javascript
// test-qwen.js
const axios = require('axios');

const apiKey = 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

async function testQwen() {
  try {
    const response = await axios.post(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
      {
        model: 'qwen-max',
        input: {
          prompt: 'Write a short poem about AI'
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Success!');
    console.log('Response:', response.data);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testQwen();
```

Run:
```bash
node test-qwen.js
```

### Test 3: Test Vision Model (Qwen-VL)

```javascript
// test-qwen-vl.js
const axios = require('axios');

const apiKey = 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

async function testQwenVL() {
  try {
    const response = await axios.post(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation',
      {
        model: 'qwen-vl-max',
        input: {
          prompt: 'Describe this image',
          image: 'https://example.com/test-image.jpg'
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Vision API Success!');
    console.log('Response:', response.data);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testQwenVL();
```

---

## 📊 Step 7: Verify API Key di VlowGen

### Check Backend:

```bash
cd packages/backend
pnpm dev
```

### Check Frontend:

```bash
cd packages/frontend
pnpm dev
```

### Test di Browser:

1. **Buka http://localhost:3000**
2. **Login ke aplikasi**
3. **Create workflow dengan Qwen node**
4. **Execute workflow**
5. **Check logs untuk verify API key working**

---

## 🎨 Step 8: Configure Models di VlowGen

### Text Generation Models:

| Model | Use Case | Cost |
|-------|----------|------|
| `qwen-max` | General purpose, complex tasks | Higher |
| `qwen-plus` | Balanced performance | Medium |
| `qwen-turbo` | Fast, simple tasks | Lower |
| `qwen-max-longcontext` | Long context (32k) | Higher |

### Vision Models:

| Model | Use Case | Cost |
|-------|----------|------|
| `qwen-vl-max` | High-quality image analysis | Higher |
| `qwen-vl-plus` | Balanced image analysis | Medium |

### Update `.env.local`:

```bash
# Text Generation
NEXT_PUBLIC_QWEN_TEXT_MODEL=qwen-max

# Vision Analysis
NEXT_PUBLIC_QWEN_VISION_MODEL=qwen-vl-max

# Image Generation (Wan2.1 - separate)
NEXT_PUBLIC_WAN2_API_KEY=your_wan2_key
```

---

## 🔧 Step 9: Troubleshooting

### Error: "Invalid API Key"

**Check:**
1. ✅ API key benar (copy-paste ulang)
2. ✅ Region sesuai (Singapore vs Beijing)
3. ✅ Service sudah activated
4. ✅ Workspace benar

**Fix:**
```bash
# Regenerate API key di console
# Update di .env.local
# Restart server
```

### Error: "Insufficient Balance"

**Check:**
1. ✅ Akun punya credit/balance
2. ✅ Payment method sudah ditambahkan
3. ✅ Service sudah activated

**Fix:**
- Top up credit di: https://account.alibabacloud.com/
- Atau gunakan free tier models

### Error: "Model Not Found"

**Check:**
1. �� Model name benar (case-sensitive)
2. ✅ Model available di region kamu
3. ✅ Service sudah activated

**Fix:**
```bash
# Check available models di console
# Update model name di .env.local
```

### Error: "Rate Limit Exceeded"

**Check:**
1. ✅ API call frequency
2. ✅ Quota limit di console
3. ✅ Billing plan

**Fix:**
- Wait for quota reset
- Upgrade billing plan
- Implement rate limiting di code

---

## 📚 Step 10: Best Practices

### 1. **Security**
```bash
# ❌ JANGAN commit API key ke Git
# ✅ Gunakan .env.local (sudah di .gitignore)
# ✅ Gunakan environment variables di production
# ✅ Rotate API key secara berkala
```

### 2. **Error Handling**
```typescript
// Always handle errors
try {
  const response = await qwenClient.generate(prompt);
} catch (error) {
  console.error('Qwen API Error:', error);
  // Fallback logic
}
```

### 3. **Caching**
```typescript
// Cache responses untuk reduce API calls
const cache = new Map();
if (cache.has(prompt)) {
  return cache.get(prompt);
}
```

### 4. **Rate Limiting**
```typescript
// Implement rate limiting
const rateLimit = {
  maxCalls: 10,
  windowMs: 60000 // 1 minute
};
```

### 5. **Logging**
```typescript
// Log API calls untuk debugging
console.log('Qwen API Call:', {
  model,
  promptLength: prompt.length,
  timestamp: new Date().toISOString()
});
```

---

## 🎯 Step 11: Production Deployment

### 1. **Environment Variables di Production**

**Vercel:**
```bash
# Settings → Environment Variables
QWEN_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Docker:**
```yaml
# docker-compose.yml
environment:
  - QWEN_API_KEY=${QWEN_API_KEY}
```

**Heroku:**
```bash
heroku config:set QWEN_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 2. **Secrets Management**

**Production:**
- ✅ Gunakan secrets manager (AWS Secrets Manager, HashiCorp Vault)
- ✅ Jangan hardcode API key
- ✅ Use environment-specific keys

### 3. **Monitoring**

**Set up alerts:**
- API call failures
- Rate limit warnings
- Balance low alerts

---

## 📞 Step 12: Support & Resources

### Official Resources:

1. **Alibaba Cloud Model Studio:**
   - Console: https://modelstudio.console.alibabacloud.com
   - Docs: https://www.alibabacloud.com/help/en/model-studio

2. **API Reference:**
   - Text Generation: https://www.alibabacloud.com/help/en/model-studio/qwen-api-reference
   - Vision: https://www.alibabacloud.com/help/en/model-studio/user-guide/vision

3. **SDKs:**
   - Python: `pip install dashscope`
   - Node.js: `npm install @alicloud/dashscope`

4. **Community:**
   - Discord: Qwen Community
   - Forum: Alibaba Cloud Community

### Quick Links:

- **Get API Key:** https://modelstudio.console.alibabacloud.com/api-key
- **View Quota:** https://modelstudio.console.alibabacloud.com/quota
- **Billing:** https://account.alibabacloud.com/
- **Support:** https://www.alibabacloud.com/support

---

## ✅ Quick Checklist

- [ ] Login ke Alibaba Cloud
- [ ] Activate Model Studio service
- [ ] Navigate ke API-KEY page
- [ ] Create new API key
- [ ] Copy API key (simpan di tempat aman!)
- [ ] Add to `.env.local`
- [ ] Test API dengan cURL/Node.js
- [ ] Verify di VlowGen app
- [ ] Configure models
- [ ] Deploy to production

---

## 🎉 Done!

Sekarang kamu bisa:
1. ✅ Generate text dengan Qwen LLM
2. ✅ Analyze images dengan Qwen-VL
3. ✅ Integrate ke VlowGen workflow
4. ✅ Automate content generation

**API Key:**
```
QWEN_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Next Steps:**
- Test di VlowGen workflow
- Create AI-powered nodes
- Build automation flows

---

**Built with ❤️ using Alibaba Cloud Qwen**
