import './globals.css';
import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import { Toaster } from 'sonner';

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap', // Optimize font loading
  preload: true,
});

export const metadata: Metadata = {
  title: 'VlowGen Platform - AI Workflow Automation',
  description: 'Fully autonomous AI that builds and executes workflows. Create content and automate distribution with visual workflow builder.',
  keywords: ['AI workflow', 'automation', 'content generation', 'visual workflow', 'autonomous AI'],
  authors: [{ name: 'VlowGen Team' }],
  creator: 'VlowGen',
  publisher: 'VlowGen',
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/logo.svg', type: 'image/svg+xml' },
    ],
    apple: '/logo.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'VlowGen Platform - AI Workflow Automation',
    description: 'Fully autonomous AI that builds and executes workflows',
    siteName: 'VlowGen',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VlowGen Platform - AI Workflow Automation',
    description: 'Fully autonomous AI that builds and executes workflows',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`min-h-screen bg-background antialiased ${spaceGrotesk.className}`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
