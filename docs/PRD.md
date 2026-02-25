📄 Product Requirements Document (PRD)

Product Name: VlowGen

Status: Draft / In Review

1. Executive Summary

VlowGen adalah platform SaaS (Software as a Service) automasi konten next-generation yang menggunakan antarmuka Visual Node-Based Workflow (terinspirasi dari n8n) untuk mengotomatisasi seluruh siklus hidup konten viral. Pengguna dapat merangkai logika kustom mereka sendiri mulai dari pembuatan ide (LLM), produksi aset visual (Wan2.1), optimasi copywriting, hingga distribusi ke berbagai platform (Composio), dan monetisasi Web3—semuanya dalam satu kanvas drag-and-drop.

Visi: "Memberikan kekuatan automasi level-enterprise kepada kreator melalui kanvas visual yang intuitif, mengubah ide menjadi aset viral dalam satu alur kerja."

2. Problem Statement

Kreator konten dan pemasar digital saat ini menghadapi tantangan besar:

Rigid Workflows: Platform automasi saat ini terlalu kaku. Pengguna tidak bisa membuat logika bercabang (misal: "Jika hasil gambar bagus, post ke IG. Jika tidak, regenerate").

Platform Fatigue: Mendistribusikan satu konten ke berbagai platform membutuhkan penyesuaian format yang memakan waktu.

Fragmented Tools: Harus melompat dari ChatGPT (ide), ke Midjourney/Wan2.1 (gambar), lalu ke Hootsuite (jadwal), membuat proses terputus-putus.

Monetization Friction: Memonetisasi karya (seperti NFT) tidak terintegrasi dengan alur pembuatan konten.

3. The Solution

VlowGen menyelesaikan masalah ini dengan menyatukan 3 pilar teknologi ke dalam sebuah Canvas Node-Editor:

AI Text-to-Flow (Magic Prompt): Kemampuan untuk men-generate seluruh rangkaian alur kerja node-based hanya dengan perintah teks bahasa natural.

Visual Workflow Builder: Kanvas drag-and-drop di mana setiap tools adalah sebuah Node yang bisa disambungkan.

Alibaba Cloud Wan2.1 (Generative Node): Node khusus untuk menghasilkan text-to-image dan text-to-video berkualitas tinggi.

Composio (Distribution Node): Node action untuk mempublikasikan aset serentak ke API media sosial (Twitter, Instagram, TikTok, YouTube).

Web3 (Monetization Node): Node untuk mencetak hasil menjadi NFT di akhir alur kerja.

4. Target Audience

Digital Marketing Agencies (B2B): Social Media Manager dan Automation Engineer yang butuh merancang alur konten kompleks untuk banyak klien.

Indie Content Creators & "Solopreneurs" (18-35 tahun): Kreator yang memproduksi konten harian masif dan butuh automasi layaknya memiliki tim lengkap.

Web3 Enthusiasts & NFT Artists: Pengguna yang ingin men-generasi koleksi seni AI dan mendistribusikannya secara otomatis.

5. Functional Requirements (Kebutuhan Fungsional)

5.1. Modul Autentikasi & Akun

REQ-1.1: Sistem harus mendukung Web3 Login menggunakan RainbowKit (MetaMask, WalletConnect, dll) dan/atau Web2 Login (Google).

REQ-1.2: Sistem profil pengguna otomatis berbasis wallet address atau email.

REQ-1.3: Dompet internal (kredit virtual) untuk melacak biaya eksekusi setiap Node (misal: AI Node butuh 2 kredit, Publish Node butuh 1 kredit).

5.2. Modul Visual Workflow Builder (The Canvas)

REQ-2.1 (Node Canvas): Sistem menyediakan infinite canvas (papan kerja interaktif) yang mendukung drag, drop, pan, dan zoom.

REQ-2.2 (Trigger Nodes): Pengguna dapat menambahkan Trigger Node untuk memulai alur (contoh: Manual Trigger, Schedule Cron Job, atau Webhook).

REQ-2.3 (Action Nodes): Tersedia berbagai Action Node:

LLM Node (untuk prompt engineering & copywriting).

Wan2.1 Node (Image & Video Generation).

Composio Node (X/Twitter, Instagram, TikTok, YouTube).

Condition/Logic Node (If/Else, Switch) untuk mencabangkan alur.

REQ-2.4 (Connections): Pengguna dapat menarik garis penghubung (edges) antar nodes untuk mengalirkan data (misal: Output text dari LLM Node ditarik menjadi Input prompt untuk Wan2.1 Node).

REQ-2.5 (AI Text-to-Flow / Magic Generator): Sistem memiliki input prompt (Co-pilot) di mana pengguna dapat mendeskripsikan alur yang diinginkan (contoh: "Buat alur generate gambar tiap pagi lalu post ke Twitter"). LLM (Qwen) akan menerjemahkan prompt menjadi format JSON (nodes & edges) yang otomatis merender rangkaian node di atas canvas React Flow.

5.3. Modul AI & Execution Engine (Backend)

REQ-3.1 (Flow Runner): Backend dapat membaca struktur JSON dari kanvas (nodes & edges) dan mengeksekusinya secara berurutan.

REQ-3.2 (Wan2.1 Integration): Menjalankan job generation gambar/video dengan parameter yang dikirim dari Node.

REQ-3.3 (Data Passing): Sistem harus bisa mem-passing variabel (seperti hasil URL gambar atau teks caption) dari satu Node ke Node berikutnya.

REQ-3.4 (Execution Logs): Sistem menampilkan log real-time saat flow dijalankan (status: Pending, Running, Success, Failed per Node).

5.4. Modul Distribusi & Integrasi (Composio)

REQ-4.1 (OAuth Manager): Antarmuka aman untuk menghubungkan akun media sosial pengguna via Composio.

REQ-4.2 (Platform Nodes): Setiap Composio Node memiliki konfigurasi spesifik (misal: Node Twitter butuh input teks dan media, Node YouTube butuh title, description, dan video).

REQ-4.3: Kemampuan Auto-Publish berdasarkan trigger jadwal di awal flow.

5.5. Modul Web3 & NFT

REQ-5.1: Crypto Pay-as-you-go menggunakan USDC/ETH untuk membeli kredit eksekusi Node.

REQ-5.2 (Mint Node): Action Node khusus yang secara otomatis mengambil output media dari Wan2.1 Node, mengunggahnya ke IPFS, dan mengeksekusi smart contract minting.

6. Non-Functional Requirements (Kebutuhan Non-Fungsional)

NFR-1 (UI Responsiveness): Interaksi drag-and-drop kanvas harus berjalan mulus (60fps) dan bebas lag meskipun ada puluhan node.

NFR-2 (Reliability & Queueing): Proses flow tidak boleh gagal jika ada lonjakan trafik. Harus menggunakan antrean (Message Broker seperti Redis/BullMQ). Jika satu Node gagal, flow dapat di-resume dari titik kegagalan.

NFR-3 (Security): Token otorisasi media sosial (OAuth Composio) dienkripsi AES-256. Payload data antar Node harus aman.

7. Technology Stack

Frontend: Next.js, Tailwind CSS.

Workflow UI Library: React Flow (Standar industri untuk antarmuka node-based yang interaktif).

Backend: Node.js, Express.js / NestJS.

Database: PostgreSQL (User & Flow Data), Redis (BullMQ untuk Queueing Job) dan IPFS Pinata

AI Models: Alibaba Cloud Wan2.1 API, Qwen

Social Distribution: Composio SDK & API.

Web3 Integration: Wagmi, Viem, Foundry, RainbowKit.

8. Business Model (Pricing Tiers)

Platform menggunakan model bisnis Freemium dan Pay-as-you-go:

| Tier | Harga | Benefit / Fitur Utama |
| Hobbyist (Free) | $0 / bulan | 50 Kredit, Max 3 Active Workflows, Basic Nodes, Watermark. |
| Creator | $19 / bulan | 500 Kredit, Unlimited Workflows, Wan2.1 Video Node, Auto-Post Composio Nodes. |
| Pro | $49 / bulan | 2000 Kredit, Priority Execution Queue, Logic/Condition Nodes, NFT Mint Node, API Access. |
| Pay-as-you-go | $5 / 200 Kredit | Pembelian kredit on-demand menggunakan Crypto (USDC/ETH). |

9. Development Roadmap (Timeline)

Phase 1: MVP Hackathon (Bulan 1)

Setup Next.js, RainbowKit, dan instalasi React Flow.

Membangun UI Node Canvas dasar (bisa tambah node dan sambungkan edge).

Pembuatan Hardcoded Runner untuk 3 Node utama: Prompt Text Node -> Wan2.1 Node -> Composio Twitter Node.

Presentasi demo eksekusi 1 flow sederhana hingga post sukses di Twitter.

Phase 2: Visual Builder Expansion

Pengembangan Flow Execution Engine dinamis (parsing JSON dari React Flow).

Penambahan Node platform lain (Instagram, TikTok).

Implementasi sistem Queue (BullMQ) untuk stabilitas backend.

Sistem langganan (Stripe/Web3) & Manajemen Kredit.

Phase 3: Advanced Workflows

Penambahan Logic Nodes (If/Else, Switch, Loop).

Node khusus Web3 (NFT Minting, IPFS Upload).

Template Library (Pengguna dapat menyalin workflow buatan orang lain).

Peluncuran versi Beta Public.

Phase 4: Enterprise & Ecosystem

Custom Webhooks (mengintegrasikan VlowGen dengan sistem internal Agency).

White-labeling dan Team Collaboration (Banyak user dalam 1 canvas).

Marketplace untuk Custom Nodes buatan komunitas.

End of Document