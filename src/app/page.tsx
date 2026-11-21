'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CatalogueItem, SearchResponse } from '@/types';
import { CatalogueCard } from '@/components/CatalogueCard';
import { Sparkles, Compass, Flame, Clock, Shuffle, ArrowRight, BookOpen, Star } from 'lucide-react';

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
        // Fetch popular (sorted by saves)
        const popRes = await fetch('/api/catalogue?sort=popular&pageSize=6');
        const popData: SearchResponse = await popRes.json();
        setPopularItems(popData.items || []);

        // Fetch recent
        const recRes = await fetch('/api/catalogue?sort=newest&pageSize=6');
        const recData: SearchResponse = await recRes.json();
        setRecentItems(recData.items || []);

        // Fetch licensed reader items
        const licRes = await fetch('/api/catalogue?availability=integrated_licensed&pageSize=6');
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
              <span>Grounded Semantic Search & Rights-Cleared Catalogue</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white font-display leading-tight">
              Discover adult doujinshi with <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-300 to-indigo-300">Nyan-chan</span>.
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              Explore 50+ rights-cleared indie releases, atmospheric romances, and fantasy worlds through natural language. Strictly non-explicit search concierge, zero scraper mirrors, and lawful licensed reading.
            </p>

            {/* Natural Language Search Box */}
            <form onSubmit={handleQuickSearch} className="pt-2 max-w-xl">
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="e.g. 'wholesome fantasy romance without drama' or 'Nagisa Chiaki'..."
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
                <Link href="/browse?include_tags=t-wholesome" className="px-2.5 py-0.5 rounded-full bg-purple-950/60 hover:bg-purple-900 border border-purple-800/50 text-purple-300 transition-colors">
                  #wholesome
                </Link>
                <Link href="/browse?include_tags=t-elf" className="px-2.5 py-0.5 rounded-full bg-purple-950/60 hover:bg-purple-900 border border-purple-800/50 text-purple-300 transition-colors">
                  #elf
                </Link>
                <Link href="/browse?include_tags=t-kemonomimi" className="px-2.5 py-0.5 rounded-full bg-purple-950/60 hover:bg-purple-900 border border-purple-800/50 text-purple-300 transition-colors">
                  #kemonomimi
                </Link>
                <Link href="/browse?include_tags=t-scifi" className="px-2.5 py-0.5 rounded-full bg-purple-950/60 hover:bg-purple-900 border border-purple-800/50 text-purple-300 transition-colors">
                  #sci-fi
                </Link>
                <Link href="/browse?exclude_tags=t-yandere" className="px-2.5 py-0.5 rounded-full bg-rose-950/40 hover:bg-rose-900 border border-rose-800/40 text-rose-300 transition-colors">
                  without #yandere
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

      {/* Curated Theme Collections Banner */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <Link
          href="/browse?include_tags=t-wholesome,t-vanilla"
          className="group p-5 rounded-2xl border transition-all bg-white dark:bg-[#12121b] border-slate-200 dark:border-[#202030] hover:border-purple-500 hover:shadow-glow flex flex-col justify-between"
        >
          <div>
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
              <Star className="w-4 h-4 fill-current" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-purple-400 transition-colors">
              Pure Vanilla & Wholesome
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Consensual, gentle, heartwarming intimacy and slow-burn confessions.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform">
            <span>Explore collection</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          href="/browse?include_tags=t-kemonomimi"
          className="group p-5 rounded-2xl border transition-all bg-white dark:bg-[#12121b] border-slate-200 dark:border-[#202030] hover:border-purple-500 hover:shadow-glow flex flex-col justify-between"
        >
          <div>
            <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center mb-3">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-pink-400 transition-colors">
              Kemonomimi & Maid Cafes
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Playful cat-girls, kitsune shrine maidens, and cheerful animal ears.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-pink-500 group-hover:translate-x-1 transition-transform">
            <span>Explore collection</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          href="/browse?include_tags=t-scifi"
          className="group p-5 rounded-2xl border transition-all bg-white dark:bg-[#12121b] border-slate-200 dark:border-[#202030] hover:border-purple-500 hover:shadow-glow flex flex-col justify-between"
        >
          <div>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3">
              <Compass className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-cyan-400 transition-colors">
              Cyberpunk & Orbital Sci-Fi
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Neon metropolises, cyborg mechanics, and heartfelt telemetry in deep space.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-cyan-500 group-hover:translate-x-1 transition-transform">
            <span>Explore collection</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          href="/browse?availability=integrated_licensed"
          className="group p-5 rounded-2xl border transition-all bg-white dark:bg-[#12121b] border-slate-200 dark:border-[#202030] hover:border-emerald-500 hover:shadow-glow flex flex-col justify-between"
        >
          <div>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-emerald-400 transition-colors">
              Licensed Hosted Readers
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Indie releases with documented permissions ready to read directly here.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-emerald-500 group-hover:translate-x-1 transition-transform">
            <span>Read online</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

      </section>

      {/* Licensed Hosted Works Shelf */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-display">
              Licensed Hosted Releases
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
              Interactive Reader Ready
            </span>
          </div>
          <Link
            href="/browse?availability=integrated_licensed"
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

      {/* Popular & Trending Shelf */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-display">
              Popular in Archive
            </h2>
            <span className="text-xs text-slate-400 hidden sm:inline">
              Ranked by community library saves
            </span>
          </div>
          <Link
            href="/browse?sort=popular"
            className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
          >
            View full rankings <ArrowRight className="w-3.5 h-3.5" />
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
            {popularItems.map((item) => (
              <CatalogueCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* Recently Added Shelf */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-display">
              Recently Added Releases
            </h2>
          </div>
          <Link
            href="/browse?sort=newest"
            className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
          >
            Browse catalogue <ArrowRight className="w-3.5 h-3.5" />
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

    </div>
  );
}
