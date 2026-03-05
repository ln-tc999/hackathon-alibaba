# Alibaba Cloud Pricing & Model Recommendations

Berdasarkan official pricing dari Alibaba Cloud Model Studio (March 2026).

---

## 💰 Free Quota (Singapore Region)

Setelah activate Model Studio, kamu dapat **FREE QUOTA** untuk 90 hari:

### Text Generation Models:
- **qwen-plus:** 1 million tokens FREE ✅
- **qwen-turbo:** 1 million tokens FREE ✅
- **qwen-max:** 1 million tokens FREE ✅

### Vision Models:
- **qwen-vl-plus (qwen3-vl-plus):** 1 million tokens FREE ✅
- **qwen-vl-max:** 1 million tokens FREE ✅

### Image Generation (Wan2):
- **wan2.6-t2i:** 50 images FREE ✅
- **wan2.1-t2i-plus:** 200 images FREE ✅
- **wan2.1-t2i-turbo:** 200 images FREE ✅

---

## 🎯 Recommended Models untuk VlowGen

### 1. Text Generation (Prompt Enhancement, Chat)

**RECOMMENDED: qwen-plus** ✅

| Model | Input Price | Output Price | Context | Free Quota | Best For |
|-------|-------------|--------------|---------|------------|----------|
| **qwen-plus** | $0.40/1M | $1.20/1M | 256K-1M | 1M tokens | **Balanced - BEST CHOICE** |
| qwen-turbo | $0.05/1M | $0.20/1M | 8K | 1M tokens | Fast & cheap, simple tasks |
| qwen-max | $1.20/1M | $6.00/1M | 252K | 1M tokens | Most capable, complex tasks |

**Why qwen-plus?**
- ✅ Balanced performance & cost
- ✅ 1M context window (long conversations)
- ✅ 1M tokens FREE quota
- ✅ 3x cheaper than qwen-max
- ✅ Good for prompt enhancement

**Cost Example (qwen-plus):**
- 1000 prompt enhancements (500 tokens each) = 500K tokens
- Cost: $0.40 × 0.5 = **$0.20** (after free quota)

### 2. Vision Analysis (Image/Video Understanding)

**RECOMMENDED: qwen-vl-plus (qwen3-vl-plus)** ✅

| Model | Input Price | Output Price | Context | Free Quota | Best For |
|-------|-------------|--------------|---------|------------|----------|
| **qwen3-vl-plus** | $0.20/1M | $1.60/1M | 256K | 1M tokens | **Balanced - BEST CHOICE** |
| qwen-vl-max | $0.80/1M | $3.20/1M | 128K | 1M tokens | Highest quality |
| qwen3-vl-flash | $0.05/1M | $0.40/1M | 256K | 1M tokens | Fast & cheap |

**Why qwen3-vl-plus?**
- ✅ Good quality for vision analysis
- ✅ 1M tokens FREE quota
- ✅ 4x cheaper than qwen-vl-max
- ✅ Supports image & video

**Cost Example (qwen3-vl-plus):**
- 100 image analyses (2K tokens each) = 200K tokens
- Cost: $0.20 × 0.2 = **$0.04** (after free quota)

### 3. Image Generation (Wan2)

**RECOMMENDED: wan2.1-t2i-turbo** ✅

| Model | Price per Image | Free Quota | Resolution | Best For |
|-------|----------------|------------|------------|----------|
| **wan2.1-t2i-turbo** | $0.025 | 200 images | 1024x1024 | **Fast & cheap - BEST CHOICE** |
| wan2.1-t2i-plus | $0.05 | 200 images | 1024x1024 | Higher quality |
| wan2.6-t2i | $0.03 | 50 images | 1024x1024 | Latest model |

**Why wan2.1-t2i-turbo?**
- ✅ Cheapest option ($0.025/image)
- ✅ 200 images FREE quota (most generous!)
- ✅ Fast generation
- ✅ Good quality for social media

**Cost Example (wan2.1-t2i-turbo):**
- 1000 images generated
- First 200 FREE, then 800 × $0.025 = **$20**

---

## 📊 Total Cost Estimate untuk VlowGen

### Scenario: Small Business / Startup

**Monthly Usage:**
- 5,000 prompt enhancements (qwen-plus)
- 500 image analyses (qwen3-vl-plus)
- 2,000 images generated (wan2.1-t2i-turbo)

**Cost Breakdown:**

1. **Text Generation (qwen-plus):**
   - 5,000 × 500 tokens = 2.5M tokens
   - First 1M FREE, then 1.5M × $0.40 = $0.60

2. **Vision Analysis (qwen3-vl-plus):**
   - 500 × 2K tokens = 1M tokens
   - All FREE! ✅

3. **Image Generation (wan2.1-t2i-turbo):**
   - First 200 FREE, then 1,800 × $0.025 = $45

**Total Monthly Cost: ~$46** 💰

### Scenario: Medium Business

**Monthly Usage:**
- 20,000 prompt enhancements
- 2,000 image analyses
- 10,000 images generated

**Cost Breakdown:**

1. **Text Generation:** 10M tokens → ~$4
2. **Vision Analysis:** 4M tokens → ~$0.80
3. **Image Generation:** 9,800 images → ~$245

**Total Monthly Cost: ~$250** 💰

---

## ✅ Final Recommendations

### Models yang Sudah Cukup:

**YES! Models yang kamu pilih sudah PERFECT:** ✅

```bash
# Text Generation
NEXT_PUBLIC_QWEN_TEXT_MODEL=qwen-plus  ✅ PERFECT!

# Vision Analysis
NEXT_PUBLIC_QWEN_VISION_MODEL=qwen-vl-plus  ✅ PERFECT!
```

### Untuk Wan2 Image Generation:

**Update ke model yang lebih murah:**

```bash
# Current (di code)
model: 'wanx-v1'  # Old naming

# Recommended (update ke)
model: 'wan2.1-t2i-turbo'  # Cheapest + 200 free images!
```

---

## 🎁 Free Quota Summary

Dengan free quota, kamu bisa:

1. **Text Generation:** 1M tokens = ~2,000 prompt enhancements
2. **Vision Analysis:** 1M tokens = ~500 image analyses
3. **Image Generation:** 200 images (wan2.1-t2i-turbo)

**Total Value: ~$50 FREE untuk testing!** 🎉

---

## 💡 Cost Optimization Tips

### 1. Use Free Quota Wisely
- Test dengan free quota dulu
- Monitor usage di console
- Upgrade ke paid setelah validate product-market fit

### 2. Choose Right Models
- ✅ qwen-plus untuk most tasks (not qwen-max)
- ✅ qwen3-vl-plus untuk vision (not qwen-vl-max)
- ✅ wan2.1-t2i-turbo untuk images (not wan2.1-t2i-plus)

### 3. Implement Caching
```typescript
// Cache prompt enhancements
const cache = new Map();
if (cache.has(prompt)) {
  return cache.get(prompt);
}
```

### 4. Batch Processing
- Process multiple requests together
- Reduce API call overhead

### 5. Rate Limiting
- Prevent abuse
- Control costs

---

## 📈 Pricing Comparison vs Competitors

| Service | Text (1M tokens) | Vision (1M tokens) | Image (per image) |
|---------|------------------|-------------------|-------------------|
| **Alibaba Cloud (qwen-plus)** | $0.40 input | $0.20 input | $0.025 |
| OpenAI (GPT-4) | $10.00 input | $10.00 input | $0.040 |
| Anthropic (Claude) | $15.00 input | N/A | N/A |

**Alibaba Cloud = 25x cheaper than OpenAI!** 🎯

---

## 🚀 Next Steps

1. ✅ Models sudah cukup (qwen-plus + qwen-vl-plus)
2. ⏭️ Activate models di console
3. ⏭️ Test dengan free quota
4. ⏭️ Monitor usage
5. ⏭️ Scale up sesuai kebutuhan

---

**Built with ❤️ using Alibaba Cloud - Cost Effective AI!**
