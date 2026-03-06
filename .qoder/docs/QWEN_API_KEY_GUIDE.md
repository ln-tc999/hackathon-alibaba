# Qwen API Key Guide - Step by Step

Guide lengkap untuk mendapatkan API key Qwen dari Alibaba Cloud Model Studio dan menggunakannya di VlowGen project.

---

## 📋 Prerequisites

Sebelum mulai, pastikan kamu punya:
- ✅ Akun Alibaba Cloud (daftar di https://www.alibabacloud.com/)
- ✅ Akun sudah diverifikasi (email & phone)
- ✅ Model Studio service sudah diaktifkan (gratis, hanya bayar untuk API calls)

---

## 🔑 Step 1: Login ke Alibaba Cloud

1. **Buka Model Studio Console berdasarkan region:**
   - **Singapore (Recommended untuk international):**
     ```
     https://bailian.console.alibabacloud.com/?regionId=ap-southeast-1
     ```
   - **US (Virginia):**
     ```
     https://bailian.console.alibabacloud.com/?regionId=us-east-1
     ```
   - **China (Beijing):**
     ```
     https://bailian.console.aliyun.com/?regionId=cn-beijing
     ```

2. **Login dengan akun Alibaba Cloud:**
   - Email: [your-email@domain.com]
   - Password: [your-password]
   - 2FA verification (jika aktif)

3. **⚠️ PENTING - Region:**
   - API key berbeda per region dan tidak bisa digunakan lintas region!
   - Pilih region yang paling dekat dengan user kamu
   - Base URL juga berbeda per region

---

## 🎯 Step 2: Activate Model Studio Service

1. **Jika service belum aktif:**
   - Kamu akan melihat message di bagian atas halaman untuk activate service
   - Klik tombol **"Activate"** untuk claim free quota
   - ⚠️ Aktivasi service GRATIS, kamu hanya bayar untuk API calls yang melebihi free quota

2. **Jika tidak ada prompt activation:**
   - Service sudah aktif, langsung lanjut ke step berikutnya

3. **Tentang Workspace:**
   - Default workspace otomatis dibuat saat activation
   - Kamu bisa buat sub-workspace untuk team collaboration atau cost allocation
   - Setiap workspace bisa punya max 20 API keys
   - Setiap account bisa punya max 10 workspaces (termasuk default)

---

## 🔑 Step 3: Create API Key

1. **Navigate ke Key Management page:**
   - **Singapore:** https://bailian.console.alibabacloud.com/?regionId=ap-southeast-1#/api-key
   - **US (Virginia):** https://bailian.console.alibabacloud.com/?regionId=us-east-1#/api-key
   - **China (Beijing):** https://bailian.console.aliyun.com/?regionId=cn-beijing#/api-key
   
   Atau di sidebar kiri, klik **"API-Key"** atau **"Key Management"**

2. **Create New API Key:**
   - Klik tombol **"Create API Key"**
   - Modal akan muncul

3. **Configure API Key:**
   - **Owner Account:** Pilih Alibaba Cloud account (digit-only ID) atau RAM user
     - Pilih account untuk personal use
     - Pilih RAM user untuk team member (easier permission management)
   - **Workspace:** Pilih **"Default workspace"** (recommended untuk start)
   - **Description:** (Optional) Contoh: "VlowGen AI content generation platform"

4. **Klik "OK" atau "Confirm"**

5. **⚠️ PENTING tentang Permissions:**
   - API key permissions ditentukan oleh workspace-nya
   - Semua API keys di workspace yang sama punya permissions yang sama
   - Default workspace: bisa call semua models & applications
   - Sub-workspace: hanya bisa call models yang sudah di-authorize

---

## 📋 Step 4: Copy API Key

1. **API Key akan muncul setelah create:**
   - Klik icon **copy** (📋) atau tombol **"View"** di kolom Actions
   - API key format: `sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

2. **⚠️ PENTING: Copy API Key SEKARANG!**
   - Untuk security, API key bisa di-view kapan saja dengan klik "View"
   - Tapi tetap simpan di tempat aman untuk easy access
   - Jangan close tab sebelum copy

3. **Simpan API Key:**
   - Copy ke password manager (1Password, Bitwarden, dll) - RECOMMENDED
   - ATAU simpan di file `.env` (hanya untuk development)
   - ⚠️ Jangan commit ke Git!
   - ⚠️ Jangan share publicly!

4. **Limits:**
   - Max 20 API keys per workspace
   - Max 10 workspaces per account
   - Jika sudah max, delete API key lama sebelum create yang baru
   - API keys valid permanently sampai kamu delete manual

---

## 🔒 Step 5: Configure API Key di Project

### Option A: Environment Variables (RECOMMENDED)

1. **Buat file `.env.local` di root project:**
```bash
# Qwen API Configuration
# Pilih salah satu region:

# Singapore (International - Recommended)
DASHSCOPE_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
QWEN_API_URL=https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/text-generation/generation
QWEN_BASE_URL=https://dashscope-intl.aliyuncs.com/compatible-mode/v1

# US (Virginia)
# DASHSCOPE_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# QWEN_API_URL=https://dashscope-us.aliyuncs.com/api/v1/services/aigc/text-generation/generation
# QWEN_BASE_URL=https://dashscope-us.aliyuncs.com/compatible-mode/v1

# China (Beijing)
# DASHSCOPE_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# QWEN_API_URL=https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation
# QWEN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
```

2. **Untuk Vision models (Qwen-VL):**
```bash
# Qwen Vision API Configuration (tambahkan ke .env.local)
QWEN_VL_API_URL=https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation
```

3. **Update `.env.local` di frontend:**
```bash
# Di packages/frontend/.env.local
NEXT_PUBLIC_DASHSCOPE_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_QWEN_BASE_URL=https://dashscope-intl.aliyuncs.com/compatible-mode/v1
NEXT_PUBLIC_QWEN_TEXT_MODEL=qwen-plus
NEXT_PUBLIC_QWEN_VISION_MODEL=qwen-vl-plus
```

### Option B: Backend Configuration

1. **Update backend config:**
```typescript
// packages/backend/src/integrations/qwen.ts
const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY || '';
const QWEN_BASE_URL = process.env.QWEN_BASE_URL || 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1';
```

2. **Restart backend server:**
```bash
pnpm dev
```

---

## 🧪 Step 6: Test API Key

### Test 1: Quick Test dengan cURL (Singapore Region)

```bash
# Linux/macOS
curl -X POST https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions \
  -H "Authorization: Bearer $DASHSCOPE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen-plus",
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful assistant."
      },
      {
        "role": "user",
        "content": "Hello, this is a test!"
      }
    ]
  }'

# Windows (CMD)
curl -X POST "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions" ^
  -H "Authorization: Bearer %DASHSCOPE_API_KEY%" ^
  -H "Content-Type: application/json" ^
  -d "{\"model\": \"qwen-plus\", \"messages\": [{\"role\": \"system\", \"content\": \"You are a helpful assistant.\"}, {\"role\": \"user\", \"content\": \"Hello, this is a test!\"}]}"
```

### Test 2: Test dengan Node.js (OpenAI SDK Compatible)

```javascript
// test-qwen.mjs
import OpenAI from 'openai';

const apiKey = process.env.DASHSCOPE_API_KEY || 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

async function testQwen() {
  try {
    const client = new OpenAI({
      apiKey: apiKey,
      baseURL: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1'
    });

    const completion = await client.chat.completions.create({
      model: 'qwen-plus',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Write a short poem about AI' }
      ]
    });

    console.log('✅ Success!');
    console.log('Response:', completion.choices[0].message.content);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testQwen();
```

Install dependencies & run:
```bash
npm install openai
node test-qwen.mjs
```

### Test 3: Test Vision Model (Qwen-VL)

```javascript
// test-qwen-vl.mjs
import OpenAI from 'openai';

const apiKey = process.env.DASHSCOPE_API_KEY || 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

async function testQwenVL() {
  try {
    const client = new OpenAI({
      apiKey: apiKey,
      baseURL: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1'
    });

    const completion = await client.chat.completions.create({
      model: 'qwen-vl-plus',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Describe this image' },
            { type: 'image_url', image_url: { url: 'https://example.com/test-image.jpg' } }
          ]
        }
      ]
    });

    console.log('✅ Vision API Success!');
    console.log('Response:', completion.choices[0].message.content);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testQwenVL();
```

Run:
```bash
node test-qwen-vl.mjs
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

### Text Generation Models (Updated 2026):

| Model | Use Case | Context Length | Cost |
|-------|----------|----------------|------|
| `qwen-max` | Most capable, complex reasoning | 32k tokens | Higher |
| `qwen-plus` | Balanced performance & cost | 32k tokens | Medium |
| `qwen-turbo` | Fast responses, simple tasks | 8k tokens | Lower |
| `qwen-long` | Extra long context | 1M tokens | Higher |

### Vision Models:

| Model | Use Case | Cost |
|-------|----------|------|
| `qwen-vl-max` | High-quality image/video analysis | Higher |
| `qwen-vl-plus` | Balanced vision analysis | Medium |

### Update `.env.local`:

```bash
# Text Generation (pilih berdasarkan kebutuhan)
NEXT_PUBLIC_QWEN_TEXT_MODEL=qwen-plus

# Vision Analysis
NEXT_PUBLIC_QWEN_VISION_MODEL=qwen-vl-plus

# Base URL (sesuaikan dengan region)
NEXT_PUBLIC_QWEN_BASE_URL=https://dashscope-intl.aliyuncs.com/compatible-mode/v1

# Image Generation (Wan2.1 - separate service)
NEXT_PUBLIC_WAN2_API_KEY=your_wan2_key
```

### Region-Specific Base URLs:

```bash
# Singapore (International)
https://dashscope-intl.aliyuncs.com/compatible-mode/v1

# US (Virginia)
https://dashscope-us.aliyuncs.com/compatible-mode/v1

# China (Beijing)
https://dashscope.aliyuncs.com/compatible-mode/v1
```

---

## 🔧 Step 9: Troubleshooting

### Error: "Invalid API Key"

**Check:**
1. ✅ API key benar (copy-paste ulang dari console)
2. ✅ Region sesuai (Singapore/Virginia/Beijing)
3. ✅ Base URL sesuai dengan region API key
4. ✅ Service sudah activated
5. ✅ Environment variable sudah di-set dengan benar

**Fix:**
```bash
# Verify environment variable
echo $DASHSCOPE_API_KEY  # Linux/macOS
echo %DASHSCOPE_API_KEY%  # Windows CMD
echo $env:DASHSCOPE_API_KEY  # Windows PowerShell

# Jika kosong, set ulang:
export DASHSCOPE_API_KEY="sk-xxx"  # Linux/macOS
set DASHSCOPE_API_KEY=sk-xxx  # Windows CMD
$env:DASHSCOPE_API_KEY="sk-xxx"  # Windows PowerShell

# Restart server
```

### Error: "Model.AccessDenied"

**Penyebab:**
- Menggunakan API key dari sub-workspace
- Sub-workspace belum di-authorize untuk access model tertentu

**Fix:**
1. Gunakan API key dari default workspace, ATAU
2. Root account admin harus grant authorization ke sub-workspace
3. Lihat dokumentasi: [Set model calling permissions](https://www.alibabacloud.com/help/en/model-studio/user-guide/permission-management)

### Error: "Insufficient Balance"

**Check:**
1. ✅ Free quota sudah habis
2. ✅ Payment method sudah ditambahkan
3. ✅ Account balance cukup

**Fix:**
- Check quota di console (pilih region kamu):
  - Singapore: https://bailian.console.alibabacloud.com/?regionId=ap-southeast-1
  - US: https://bailian.console.alibabacloud.com/?regionId=us-east-1
  - Beijing: https://bailian.console.aliyun.com/?regionId=cn-beijing
- Top up credit di: https://account.alibabacloud.com/
- Atau gunakan model dengan cost lebih rendah (qwen-turbo)

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
   - Console (Singapore): https://bailian.console.alibabacloud.com/?regionId=ap-southeast-1
   - Console (US): https://bailian.console.alibabacloud.com/?regionId=us-east-1
   - Console (Beijing): https://bailian.console.aliyun.com/?regionId=cn-beijing
   - Docs: https://www.alibabacloud.com/help/en/model-studio

2. **API Reference:**
   - Getting Started: https://www.alibabacloud.com/help/en/model-studio/getting-started/first-api-call-to-qwen
   - Text Generation: https://www.alibabacloud.com/help/en/model-studio/qwen-api-reference
   - Vision Models: https://www.alibabacloud.com/help/en/model-studio/user-guide/vision
   - API Key Management: https://www.alibabacloud.com/help/en/model-studio/user-guide/api-key-management

3. **SDKs:**
   - Python: `pip install dashscope`
   - Node.js (OpenAI Compatible): `npm install openai`
   - Java: Maven/Gradle dependency `com.alibaba:dashscope-sdk-java`

4. **Community:**
   - Qwen GitHub: https://github.com/QwenLM
   - Alibaba Cloud Forum: https://www.alibabacloud.com/forum

### Quick Links:

- **Get API Key:**
  - Singapore: https://bailian.console.alibabacloud.com/?regionId=ap-southeast-1#/api-key
  - US: https://bailian.console.alibabacloud.com/?regionId=us-east-1#/api-key
  - Beijing: https://bailian.console.aliyun.com/?regionId=cn-beijing#/api-key
- **Billing:** https://account.alibabacloud.com/
- **Support:** https://www.alibabacloud.com/support
- **Error Codes:** https://www.alibabacloud.com/help/en/model-studio/developer-reference/error-code

---

## ✅ Quick Checklist

- [ ] Login ke Alibaba Cloud
- [ ] Pilih region (Singapore/US/Beijing)
- [ ] Activate Model Studio service (gratis)
- [ ] Navigate ke Key Management page
- [ ] Create new API key dengan default workspace
- [ ] Copy API key (simpan di tempat aman!)
- [ ] Set environment variable `DASHSCOPE_API_KEY`
- [ ] Configure base URL sesuai region
- [ ] Test API dengan cURL/Node.js
- [ ] Verify di VlowGen app
- [ ] Configure models (qwen-plus, qwen-vl-plus)
- [ ] Deploy to production dengan secrets management

---

## 🎉 Done!

Sekarang kamu bisa:
1. ✅ Generate text dengan Qwen LLM (qwen-plus, qwen-max, qwen-turbo, qwen-long)
2. ✅ Analyze images/videos dengan Qwen-VL (qwen-vl-plus, qwen-vl-max)
3. ✅ Integrate ke VlowGen workflow dengan OpenAI-compatible API
4. ✅ Automate content generation dengan multi-region support

**Environment Variables:**
```bash
DASHSCOPE_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
QWEN_BASE_URL=https://dashscope-intl.aliyuncs.com/compatible-mode/v1
```

**Next Steps:**
- Test di VlowGen workflow
- Create AI-powered nodes
- Build automation flows
- Monitor usage & costs di console

**Important Notes:**
- API keys berbeda per region (Singapore/US/Beijing)
- Free quota available untuk new users
- OpenAI SDK compatible untuk easy integration
- Max 20 API keys per workspace, 10 workspaces per account

---

**Built with ❤️ using Alibaba Cloud Qwen**

**Last Updated:** March 2026 - Based on official Alibaba Cloud Model Studio documentation
