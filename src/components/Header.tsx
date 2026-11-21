'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from './ThemeContext';
import { Search, Sparkles, Shuffle, Bookmark, ShieldCheck, Sun, Moon, Compass, Grid, MessageSquareText } from 'lucide-react';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [isRandomLoading, setIsRandomLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ username: string } | null>(null);

  useEffect(() => {
    const checkUser = () => {
      try {
        const stored = localStorage.getItem('nyamora_user');
        if (stored) {
          setCurrentUser(JSON.parse(stored));
        } else {
          setCurrentUser(null);
        }
      } catch {
        setCurrentUser(null);
      }
    };
    checkUser();

    window.addEventListener('nyamora_auth_change', checkUser);
    return () => window.removeEventListener('nyamora_auth_change', checkUser);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleRandomPick = async () => {
    try {
      setIsRandomLoading(true);
      const res = await fetch('/api/catalogue/random');
      if (res.ok) {
        const data = await res.json();
        if (data.id) {
          router.push(`/item/${data.id}`);
        }
      }
    } catch (e) {
      console.error('Failed to get random item:', e);
    } finally {
      setIsRandomLoading(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b backdrop-blur-md transition-colors bg-white/80 dark:bg-[#0b0b10]/85 border-slate-200 dark:border-[#212130]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand & Host */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-purple-500/80 shadow-glow group-hover:scale-105 transition-transform">
              <img
                src="/avatars/nyan-chan-host.jpg"
                alt="Nyan-chan (Host)"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-xl tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                Nyamora
                <span className="text-xs px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 font-semibold border border-purple-300 dark:border-purple-800/60">
                  ニャモラ
                </span>
              </span>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium tracking-wider uppercase -mt-0.5">
                Curated Doujin Discovery
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                pathname === '/'
                  ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#181824]'
              }`}
            >
              <Compass className="w-4 h-4" />
              Discover
            </Link>

            <Link
              href="/browse"
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                pathname.startsWith('/browse')
                  ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#181824]'
              }`}
            >
              <Grid className="w-4 h-4" />
              Browse
            </Link>

            <Link
              href="/ai-search"
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                pathname === '/ai-search'
                  ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#181824]'
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-500 animate-pulse" />
              AI Search
            </Link>

            <Link
              href="/community"
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                pathname === '/community'
                  ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#181824]'
              }`}
            >
              <MessageSquareText className="w-4 h-4" />
              Community
            </Link>

            <Link
              href="/library"
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                pathname === '/library'
                  ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#181824]'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              Library
            </Link>
          </nav>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden lg:flex flex-1 max-w-md mx-4 relative">
          <input
            type="text"
            placeholder="Search titles, creators, tags, or concepts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-sm rounded-full border transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/50 bg-slate-100 dark:bg-[#14141e] border-slate-300 dark:border-[#272738] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
        </form>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Active Source Indicator */}
          <Link
            href="/browse?source=nhentai-api"
            title="Active Source: nHentai Live Open API (Click to Browse)"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30 hover:bg-purple-500/20 transition-all"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>nHentai Live</span>
          </Link>

          {/* Random Discovery */}
          <button
            onClick={handleRandomPick}
            disabled={isRandomLoading}
            title="Discover a random eligible work"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-slate-100 dark:hover:bg-[#181824] transition-colors flex items-center gap-1 text-sm font-medium"
          >
            <Shuffle className={`w-4 h-4 ${isRandomLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Random</span>
          </button>

          {/* Admin Link */}
          <Link
            href="/admin"
            title="Admin & Rights Register"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-slate-100 dark:hover:bg-[#181824] transition-colors"
          >
            <ShieldCheck className="w-4 h-4" />
          </Link>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-slate-100 dark:hover:bg-[#181824] transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Account & Register/Login Button */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-200 dark:border-slate-800">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {currentUser.username[0]?.toUpperCase() || 'U'}
              </div>
              <span className="hidden xl:inline text-xs font-semibold text-purple-300">
                {currentUser.username}
              </span>
              <button
                onClick={() => {
                  localStorage.removeItem('nyamora_user');
                  window.dispatchEvent(new Event('nyamora_auth_change'));
                }}
                title="Sign Out"
                className="text-[11px] text-slate-400 hover:text-rose-400 font-medium ml-1"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('nyamora_open_auth', { detail: { mode: 'register' } }));
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 shadow-glow transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Join</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
