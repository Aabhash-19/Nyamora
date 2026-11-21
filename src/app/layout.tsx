import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AdultAccessModal } from '@/components/AdultAccessModal';
import { NyanChanFloating } from '@/components/NyanChanFloating';
import { MobileBottomNav } from '@/components/MobileBottomNav';

export const metadata: Metadata = {
  title: 'Nyamora (ニャモラ) — AI-Powered Doujin Discovery Platform',
  description: 'A polished, privacy-conscious adult doujin discovery platform with hybrid semantic search and grounded AI concierge Nyan-chan.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Nyamora'
  },
  icons: {
    icon: '/avatars/nyan-chan-host.jpg',
    apple: '/avatars/nyan-chan-host.jpg'
  }
};

export const viewport = {
  themeColor: '#0b0b10',
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <meta name="referrer" content="no-referrer" />
      </head>
      <body className="min-h-screen flex flex-col bg-[#0b0b10] text-slate-100 antialiased selection:bg-purple-600 selection:text-white">
        <ThemeProvider>
          <AdultAccessModal />
          <Header />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6">
            {children}
          </main>
          <Footer />
          <MobileBottomNav />
          <NyanChanFloating />
        </ThemeProvider>
      </body>
    </html>
  );
}
