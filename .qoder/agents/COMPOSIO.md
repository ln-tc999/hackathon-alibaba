Untuk mengimplementasikan toolkit Twitter, Facebook, TikTok, dan YouTube di aplikasi Next.js, berikut langkah-langkahnya:

1. Setup Project
Install Composio SDK dengan Vercel Provider 1:

bash

Copy
npm install @composio/core @composio/vercel
2. Buat Composio Client (Server-Side)
javascript

Copy
import { Composio } from '@composio/core';
import { VercelProvider } from '@composio/vercel';

const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY,
  provider: new VercelProvider(),
});

export default composio;
3. Buat Auth Config untuk Setiap Toolkit
Untuk setiap toolkit (Twitter, Facebook, TikTok, YouTube), buat auth config di Composio Dashboard 2:

Catatan penting untuk Twitter: Composio managed credentials sudah tidak tersedia untuk Twitter toolkit - Anda harus membuat kredensial sendiri dari Twitter Developer Portal 3.

Untuk Facebook: Anda perlu membuat aplikasi di Meta For Developers, dapatkan Client ID dan Client Secret, lalu set Redirect URI ke https://backend.composio.dev/api/v3/toolkits/auth/callback 4.

4. Simpan Auth Config IDs
env

Copy
TWITTER_AUTH_CONFIG_ID=ac_1234567890
FACEBOOK_AUTH_CONFIG_ID=ac_1234567890
TIKTOK_AUTH_CONFIG_ID=ac_1234567890
YOUTUBE_AUTH_CONFIG_ID=ac_1234567890
5. Buat API untuk Menghubungkan User
javascript

Copy
// app/api/connect/route.js
export async function POST(request) {
  const { authConfigId, userId } = await request.json();
  
  const connectionRequest = await composio.connectedAccounts.initiate(
    userId,
    authConfigId
  );
  
  return Response.json({
    redirectUrl: connectionRequest.redirectUrl,
    connectionId: connectionRequest.id,
  });
}
6. Ambil dan Gunakan Tools
javascript

Copy
// app/api/chat/route.js
import { generateText } from 'ai';
import { openai } from "@ai-sdk/openai";

const tools = await composio.tools.get(userId, {
  toolkits: ['TWITTER', 'FACEBOOK', 'TIKTOK', 'YOUTUBE'],
});

const { text } = await generateText({
  model: openai("gpt-4o"),
  messages: [{ role: "user", content: "Post ke Twitter" }],
  tools,
});
Browse semua toolkit yang tersedia di platform.composio.dev di bagian "All Toolkits" 5.


Copy
Sources
Vercel AI SDK Provider
Full Stack Chat App
Changelog - Twitter Toolkit
How to create OAuth credentials for Meta apps
Tools and toolkits
apakah itu bisa buat user connect dengan akun nya ereka?
“How do I let users connect their own accounts with OAuth authentication flow?”
Ya, tentu bisa! Composio dirancang khusus untuk memungkinkan setiap user menghubungkan akun mereka sendiri (Twitter, Facebook, TikTok, YouTube) melalui OAuth flow 1.

Cara Kerjanya
1. Inisiasi Koneksi untuk User

javascript

Copy
// Backend API - Next.js
const connectionRequest = await composio.connectedAccounts.initiate(
  "user_123", // ID unik user di aplikasi Anda
  "ac_twitter_config_id", // Auth config ID untuk Twitter
  {
    callbackUrl: "https://yourapp.com/callback?user_id=user_123"
  }
);

// Redirect user ke halaman OAuth
return Response.json({ 
  redirectUrl: connectionRequest.redirectUrl 
});
2. User Melakukan OAuth Login

User akan diarahkan ke halaman login Twitter/Facebook/dll untuk mengotorisasi aplikasi Anda. Setelah selesai, mereka dikembalikan ke callbackUrl dengan parameter status=success dan connected_account_id 2.

3. Tunggu Koneksi Selesai

javascript

Copy
// Cek status koneksi
const connectedAccount = await composio.connectedAccounts.waitForConnection(
  connectionRequest.id
);
console.log(connectedAccount); // Koneksi berhasil!
Setiap User Punya Akun Sendiri
Setiap user_id yang berbeda akan memiliki connected account terpisah 3. Jadi:

User A connect Twitter → posting ke akun Twitter User A
User B connect Twitter → posting ke akun Twitter User B
White-Labeling (Opsional)
Jika ingin user melihat nama brand Anda (bukan "Composio") di layar OAuth consent, buat OAuth app sendiri di developer portal masing-masing platform 4.

Composio menangani semua kompleksitas OAuth: token refresh, credential management, dan penyimpanan token secara otomatis 1.