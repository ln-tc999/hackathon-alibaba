import './globals.css';
import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { WalletProvider } from '@/components/wallet/WalletProvider';

export const metadata: Metadata = {
  title: 'VlowGen Platform',
  description: 'Visual workflow automation platform for content generation and distribution',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        <WalletProvider>
          {children}
          <Toaster />
        </WalletProvider>
      </body>
    </html>
  );
}
