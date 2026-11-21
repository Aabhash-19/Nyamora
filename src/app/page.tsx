'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CatalogueItem, SearchResponse } from '@/types';
import { CatalogueCard } from '@/components/CatalogueCard';
import { Sparkles, Compass, Flame, Clock, Shuffle, ArrowRight, BookOpen, Star, Globe, Layers } from 'lucide-react';

export default function DiscoverHomePage() {
  const router = useRouter();
  const [popularItems, setPopularItems] = useState<CatalogueItem[]>([]);
  const [recentItems, setRecentItems] = useState<CatalogueItem[]>([]);
  const [licensedItems, setLicensedItems] = useState<CatalogueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickQuery, setQuickQuery] = useState('');

  useEffect(() => {
    async function loadDiscoverData() {
      try {
        setLoading(true);

        // Fetch popular right now (exact 1:1 match with nHentai homepage top section)
        const popRes = await fetch('/api/catalogue?sort=popular&pageSize=5');
        const popData: SearchResponse = await popRes.json();
        setPopularItems(popData.items || []);

        // Fetch recent uploads (exact 1:1 match with nHentai newest grid)
        const recRes = await fetch('/api/catalogue?sort=newest&pageSize=6');
        const recData: SearchResponse = await recRes.json();
        setRecentItems(recData.items || []);

        // Fetch popular English reader items
        const licRes = await fetch('/api/catalogue?q=language:english&sort=popular&pageSize=6');
        const licData: SearchResponse = await licRes.json();
        setLicensedItems(licData.items || []);
      } catch (err) {
        console.error('Failed to load discover items:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDiscoverData();
  }, []);

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickQuery.trim()) {
      router.push(`/browse?q=${encodeURIComponent(quickQuery.trim())}`);
    }
  };

  return (
    <div className="space-y-12 pb-16">
      
      {/* Editorial Hero Section with Nyan-chan Host */}
      <section className="relative overflow-hidden rounded-3xl border p-6 sm:p-10 transition-all bg-gradient-to-br from-purple-950/40 via-[#12121c] to-[#0c0c14] border-purple-900/40 shadow-glow">
        
        {/* Subtle decorative background gradient circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>AI-Powered Doujin Discovery & Live nHentai Sync</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white font-display leading-tight">
              Discover adult doujinshi with <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-300 to-indigo-300">Nyan-chan</span>.
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              Explore over 660,000+ doujinshi releases, trending circles, and authentic parody works with real-time nHentai synchronisation. Guided by Nyan-chan, featuring semantic search, strict trope exclusions, and instant online reading.
            </p>

            {/* Natural Language Search Box */}
            <form onSubmit={handleQuickSearch} className="pt-2 max-w-xl">
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="e.g. 'wholesome romance without ugly bastard' or 'Fate Scathach'..."
                  value={quickQuery}
                  onChange={(e) => setQuickQuery(e.target.value)}
                  className="w-full pl-4 pr-28 py-3.5 text-sm rounded-2xl border transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 bg-[#161622] border-[#2d2d42] text-white placeholder:text-slate-400 shadow-inner"
                />
                <button
                  type="submit"
                  className="absolute right-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-glow flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Search
                </button>
              </div>

              {/* Quick Tag Pills */}
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="text-slate-400 py-0.5">Try:</span>
                <Link href="/browse?include_tags=sole-female" className="px-2.5 py-0.5 rounded-full bg-purple-950/60 hover:bg-purple-900 border border-purple-800/50 text-purple-300 transition-colors">
                  #sole female
                </Link>
                <Link href="/browse?include_tags=big-breasts" className="px-2.5 py-0.5 rounded-full bg-purple-950/60 hover:bg-purple-900 border border-purple-800/50 text-purple-300 transition-colors">
                  #big breasts
                </Link>
                <Link href="/browse?include_tags=parody-fate-grand-order" className="px-2.5 py-0.5 rounded-full bg-purple-950/60 hover:bg-purple-900 border border-purple-800/50 text-purple-300 transition-colors">
                  #fate grand order
                </Link>
                <Link href="/browse?include_tags=romance" className="px-2.5 py-0.5 rounded-full bg-purple-950/60 hover:bg-purple-900 border border-purple-800/50 text-purple-300 transition-colors">
                  #romance
                </Link>
                <Link href="/browse?exclude_tags=ugly-bastard" className="px-2.5 py-0.5 rounded-full bg-rose-950/40 hover:bg-rose-900 border border-rose-800/40 text-rose-300 transition-colors">
                  without #ugly bastard
                </Link>
              </div>
            </form>
          </div>

          {/* Host Avatar Card */}
          <div className="lg:col-span-4 flex justify-center">
            <div className="relative group p-2 rounded-3xl bg-gradient-to-tr from-purple-800/40 via-purple-600/30 to-indigo-600/30 border border-purple-500/40 shadow-glow">
              <div className="relative w-56 h-72 sm:w-64 sm:h-80 rounded-2xl overflow-hidden border border-purple-400/50">
                <img
                  src="/avatars/nyan-chan-host.jpg"
                  alt="Nyan-chan (Host)"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                  <div className="flex items-center gap-1.5 text-xs text-purple-300 font-bold">
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                    Host of Nyamora
                  </div>
                  <p className="text-white font-extrabold text-base">Nyan-chan (ニャンちゃん)</p>
                  <p className="text-[11px] text-purple-200 font-medium">"Looking for something sweet... or deliciously wicked tonight? Whisper your desires to me, darling~ ♡"</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Relevant Feature & Discovery Highlights Banner */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Popular Right Now */}
        <Link
          href="/browse?sort=popular"
          className="group p-5 rounded-2xl border transition-all bg-white dark:bg-[#12121b] border-slate-200 dark:border-[#202030] hover:border-amber-500 hover:shadow-glow flex flex-col justify-between"
        >
          <div>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
              <Flame className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-amber-400 transition-colors">
              Popular Right Now
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Explore what is trending worldwide across the doujinshi community with live rankings.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-amber-500 group-hover:translate-x-1 transition-transform">
            <span>Explore popular</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        {/* Parodies & Franchises */}
        <Link
          href="/browse?include_tags=parody-fate-grand-order"
          className="group p-5 rounded-2xl border transition-all bg-white dark:bg-[#12121b] border-slate-200 dark:border-[#202030] hover:border-indigo-500 hover:shadow-glow flex flex-col justify-between"
        >
          <div>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-indigo-400 transition-colors">
              Parodies & Franchises
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Fate/Grand Order, Blue Archive, Touhou, Genshin Impact, and original circle releases.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-indigo-400 group-hover:translate-x-1 transition-transform">
            <span>Browse franchises</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        {/* AI Concierge with Nyan-chan */}
        <Link
          href="/ai-search"
          className="group p-5 rounded-2xl border transition-all bg-white dark:bg-[#12121b] border-slate-200 dark:border-[#202030] hover:border-purple-500 hover:shadow-glow flex flex-col justify-between"
        >
          <div>
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-purple-400 transition-colors">
              AI Search with Nyan-chan
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Describe your cravings in plain words, filter by creators, or exclude specific tropes.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-purple-400 group-hover:translate-x-1 transition-transform">
            <span>Ask Nyan-chan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        {/* English Translated Releases */}
        <Link
          href="/browse?language=english"
          className="group p-5 rounded-2xl border transition-all bg-white dark:bg-[#12121b] border-slate-200 dark:border-[#202030] hover:border-emerald-500 hover:shadow-glow flex flex-col justify-between"
        >
          <div>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-emerald-400 transition-colors">
              English Translated Releases
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Over 150,000+ localized releases ready to read immediately in our fast WebP reader.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform">
            <span>Read in English</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

      </section>

      {/* Popular Right Now Shelf (Synchronous with nHentai Homepage Top) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-display">
              Popular Right Now
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-semibold border border-amber-500/30">
              Live from nHentai
            </span>
          </div>
          <Link
            href="/browse?sort=popular"
            className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
          >
            View all popular <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-2xl bg-slate-200 dark:bg-[#161622] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {popularItems.map((item) => (
              <CatalogueCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* New Uploads Shelf (Synchronous with nHentai Recent Uploads) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-display">
              New Uploads
            </h2>
            <span className="text-xs text-slate-400 hidden sm:inline">
              Real-time synchronised releases
            </span>
          </div>
          <Link
            href="/browse?sort=newest"
            className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
          >
            Browse all new releases <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-2xl bg-slate-200 dark:bg-[#161622] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {recentItems.map((item) => (
              <CatalogueCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* Interactive Doujinshi Reader (English Releases) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-display">
              Interactive Doujinshi Reader
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
              English Translated
            </span>
          </div>
          <Link
            href="/browse?language=english"
            className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
          >
            View all ({licensedItems.length}+) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-2xl bg-slate-200 dark:bg-[#161622] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {licensedItems.map((item) => (
              <CatalogueCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
