# VlowGen Frontend

Next.js frontend application for the VlowGen visual workflow automation platform.

## Features

- **Next.js 14+** with App Router
- **Tailwind CSS** for styling with Shadcn UI design system
- **RainbowKit** for Web3 wallet integration
- **TypeScript** for type safety
- **API Client** for backend communication

## Setup

1. Install dependencies from the root:
   ```bash
   pnpm install
   ```

2. Copy the environment template:
   ```bash
   cp .env.local.template .env.local
   ```

3. Configure environment variables in `.env.local`:
   - `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:3001)
   - `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`: Get from https://cloud.walletconnect.com/

## Development

Run the development server:
```bash
pnpm dev
```

The app will be available at http://localhost:3000

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   └── wallet/           # Wallet integration components
│       └── WalletProvider.tsx
└── lib/                   # Utilities and helpers
    └── api-client.ts     # Backend API client
```

## API Client

The `api-client.ts` provides typed methods for backend communication:

- `executeWorkflow(workflow, credentials)` - Execute a workflow
- `validateWorkflow(workflow)` - Validate workflow structure
- `getTwitterAuthUrl()` - Get Twitter OAuth URL
- `handleTwitterCallback(code)` - Handle OAuth callback

All API errors are mapped to user-friendly messages and include retry information.

## Wallet Integration

The app uses RainbowKit for Web3 wallet connection:

- Supports multiple wallets (MetaMask, WalletConnect, Coinbase, etc.)
- Persists connection state across page refreshes
- Configured for Ethereum mainnet and major L2s (Polygon, Optimism, Arbitrum, Base)

## Building

Build for production:
```bash
pnpm build
```

Start production server:
```bash
pnpm start
```

## Type Checking

Run TypeScript type checking:
```bash
pnpm type-check
```

## Testing

Run tests:
```bash
pnpm test
```
