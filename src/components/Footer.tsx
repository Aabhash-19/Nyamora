import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ExternalLink, Heart, Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t mt-20 transition-colors bg-white dark:bg-[#08080c] border-slate-200 dark:border-[#1c1c28] text-slate-500 dark:text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-base text-slate-900 dark:text-white">
                Nyamora
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-400 font-bold">
                18+ ADULT DISCOVERY
              </span>
            </div>
            <p className="leading-relaxed text-slate-600 dark:text-slate-400">
              A privacy-conscious doujin discovery platform featuring hybrid semantic search, grounded metadata navigation, and lawful reading options. Hosted by Nyan-chan.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-200 mb-3 text-sm">Navigation</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="hover:text-purple-500 transition-colors">Discover Home</Link></li>
              <li><Link href="/browse" className="hover:text-purple-500 transition-colors">Catalogue Browse & Filters</Link></li>
              <li><Link href="/ai-search" className="hover:text-purple-500 transition-colors">Nyan-chan AI Concierge</Link></li>
              <li><Link href="/community" className="hover:text-purple-500 transition-colors">Outbound Community Directory</Link></li>
              <li><Link href="/library" className="hover:text-purple-500 transition-colors">Private Bookmarks & Progress</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-200 mb-3 text-sm">Rights & Compliance</h4>
            <ul className="space-y-2">
              <li><Link href="/admin" className="hover:text-purple-500 transition-colors flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Rights & Provenance Register</Link></li>
              <li><span className="text-slate-600 dark:text-slate-500">Zero tolerance for underage content</span></li>
              <li><span className="text-slate-600 dark:text-slate-500">No unauthorized scraping or mirroring</span></li>
              <li><span className="text-slate-600 dark:text-slate-500">Outbound Reddit links only</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-200 mb-3 text-sm">Host & Assistant</h4>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-100 dark:bg-[#12121a] border border-slate-200 dark:border-[#222230]">
              <img src="/avatars/nyan-chan.png" alt="Nyan-chan" className="w-10 h-10 rounded-full object-cover border border-purple-500/50" />
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-200 text-xs">Nyan-chan (ニャンちゃん)</p>
                <p className="text-[11px] text-purple-600 dark:text-purple-400">Catalogue Concierge</p>
              </div>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
              Grounded strictly in stored metadata. Non-explicit assistance only.
            </p>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-[#1a1a24] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p>© 2026 Nyamora Platform. All rights reserved. Original editorial discovery architecture.</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-600">
            Intended exclusively for adults 18 years of age or older in jurisdictions where lawful.
          </p>
        </div>
      </div>
    </footer>
  );
}
