'use client';

/**
 * RainbowKit wallet provider configuration
 * Wraps the app with Web3 wallet connection functionality
 */

import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum, base } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient();

// Get WalletConnect project ID from environment
// Use a dummy projectId for build time if not set
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'dummy-project-id-for-build';

if (projectId === 'dummy-project-id-for-build') {
  console.warn(
    'NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID is not set. Using dummy projectId for build. Wallet connection will not work until you set a real projectId.'
  );
}

// Configure wagmi with RainbowKit defaults
const config = getDefaultConfig({
  appName: 'VlowGen Platform',
  projectId,
  chains: [mainnet, polygon, optimism, arbitrum, base],
  ssr: true, // Enable server-side rendering support
});

interface WalletProviderProps {
  children: React.ReactNode;
}

/**
 * Wallet provider component that wraps the app with RainbowKit and wagmi
 */
export function WalletProvider({ children }: WalletProviderProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
