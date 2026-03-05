# Qwen Plus untuk Riset Konten Viral

## Apakah Qwen Plus Cukup?

**Ya, qwen-plus sangat cukup untuk riset konten viral dari sosial media.** Berikut alasannya:

### Keunggulan Qwen Plus:
- **Context Window 1M tokens**: Bisa menganalisis banyak konten sosmed sekaligus
- **Multilingual**: Mendukung bahasa Indonesia dan bahasa lainnya dengan baik
- **Strong Reasoning**: Kemampuan analisis dan pemahaman konteks yang kuat
- **Cost-Effective**: $0.40/1M input tokens, $1.20/1M output tokens
- **Free Quota**: 1M tokens gratis selama 90 hari

### Use Case untuk Viral Content Research:
1. **Analisis Trend**: Memproses banyak post sosmed untuk identifikasi pola viral
2. **Content Understanding**: Memahami konteks, sentiment, dan engagement patterns
3. **Prompt Generation**: Generate prompt kreatif untuk konten yang engaging
4. **Multi-Platform**: Analisis konten dari Twitter, Instagram, TikTok, YouTube

### Implementasi di Aplikasi:
- **Prompt Enhancer**: Menggunakan qwen-plus untuk enhance prompt text
- **Vision Analyzer**: Menggunakan qwen-vl-plus untuk analisis gambar/video
- **Image Generation**: Menggunakan wan2.1-t2i-turbo (paling murah)
- **Video Generation**: Menggunakan wan2.1-t2v-turbo (paling murah untuk video)

## Model yang Digunakan:

| Model | Fungsi | Harga | Free Quota |
|-------|--------|-------|------------|
| qwen-plus | Text generation & prompt enhancement | $0.40/1M input, $1.20/1M output | 1M tokens |
| qwen-vl-plus | Vision analysis (image/video) | $0.20/1M input, $1.60/1M output | 1M tokens |
| wan2.1-t2i-turbo | Image generation | $0.025/image | 200 images |
| wan2.1-t2v-turbo | Video generation (5s, 480P) | $0.25/video | 50 seconds |
| wan2.1-t2v-turbo | Video generation (5s, 720P) | $0.50/video | 50 seconds |

## Perbandingan Harga Image vs Video:

| Type | Output | Harga |
|------|--------|-------|
| Image | 1 gambar | $0.025 |
| Video 480P | 5 detik video | $0.25 (10x lipat) |
| Video 720P | 5 detik video | $0.50 (20x lipat) |

**Rekomendasi**: Gunakan 480P untuk testing, 720P untuk production.

Semua model sudah terintegrasi dan siap digunakan dengan DashScope API key yang sama.

