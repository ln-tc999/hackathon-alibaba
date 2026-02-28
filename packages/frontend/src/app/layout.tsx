import './globals.css';
import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import { Toaster } from 'sonner';
import { WalletProvider } from '@/components/wallet/WalletProvider';

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  title: 'VlowGen Platform',
  description: 'Visual workflow automation platform for content generation and distribution',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/logo.svg', type: 'image/svg+xml' },
    ],
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`min-h-screen bg-background antialiased ${spaceGrotesk.className}`}>
        <WalletProvider>
          {children}
          <Toaster />
        </WalletProvider>
      </body>
    </html>
  );
}
