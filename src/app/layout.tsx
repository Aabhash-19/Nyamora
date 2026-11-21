import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AdultAccessModal } from '@/components/AdultAccessModal';
import { NyanChanFloating } from '@/components/NyanChanFloating';

export const metadata: Metadata = {
  title: 'Nyamora (ニャモラ) — AI-Powered Doujin Discovery Platform',
  description: 'A polished, privacy-conscious adult doujin discovery platform with hybrid semantic search and grounded AI concierge Nyan-chan.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className="min-h-screen flex flex-col bg-[#0b0b10] text-slate-100 antialiased selection:bg-purple-600 selection:text-white">
        <ThemeProvider>
          <AdultAccessModal />
          <Header />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
          <Footer />
          <NyanChanFloating />
        </ThemeProvider>
      </body>
    </html>
  );
}
