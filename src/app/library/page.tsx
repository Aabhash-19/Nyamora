'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CatalogueItem, UserBookmark, ReadingProgress } from '@/types';
import { CatalogueCard } from '@/components/CatalogueCard';
import {
  Bookmark, Clock, Download, Trash2, ShieldCheck,
  BookOpen, Heart, ArrowRight
} from 'lucide-react';

interface BookmarkedItemWithData extends UserBookmark {
  item: CatalogueItem;
}

export default function LibraryPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkedItemWithData[]>([]);
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'privacy'>('bookmarks');
  const [loading, setLoading] = useState(true);
  const [purged, setPurged] = useState(false);

  useEffect(() => {
    async function loadLibrary() {
      try {
        setLoading(true);
        const res = await fetch('/api/library/bookmarks');
        if (res.ok) {
          const data = await res.json();
          setBookmarks(data.bookmarks || []);
        }
      } catch (err) {
        console.error('Failed to load library:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLibrary();
  }, []);

  const handleExportData = () => {
    const exportPayload = {
      platform: 'Nyamora',
      version: '1.1',
      exportedAt: new Date().toISOString(),
      bookmarks,
      privacySettings: {
        analyticsConsent: false,
        retentionPolicy: 'local_private'
      }
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nyamora-library-export-${new Date().toISOString().substring(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePurgeData = async () => {
    if (!window.confirm('Are you sure you want to delete all saved bookmarks and reading progress? This action is irreversible.')) {
      return;
    }

    try {
      await fetch('/api/library/progress', { method: 'DELETE' });
      setBookmarks([]);
      setPurged(true);
      setTimeout(() => setPurged(false), 4000);
    } catch (e) {
      console.error('Purge error:', e);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl border bg-white dark:bg-[#12121a] border-slate-200 dark:border-[#222234] shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-purple-500 fill-current" />
            Your Private Library
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Zero tracking by default. All bookmarks, reading positions, and history remain private.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#181826] text-xs font-semibold">
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'bookmarks'
                ? 'bg-purple-600 text-white shadow-glow'
                : 'text-slate-600 dark:text-slate-400 hover:text-white'
            }`}
          >
            Saved Bookmarks ({bookmarks.length})
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'privacy'
                ? 'bg-purple-600 text-white shadow-glow'
                : 'text-slate-600 dark:text-slate-400 hover:text-white'
            }`}
          >
            Privacy & Data Controls
          </button>
        </div>
      </div>

      {/* Bookmarks Tab Content */}
      {activeTab === 'bookmarks' && (
        <section className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-2xl bg-slate-200 dark:bg-[#151522] animate-pulse" />
              ))}
            </div>
          ) : bookmarks.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {bookmarks.map((b) => (
                <CatalogueCard
                  key={b.itemId}
                  item={b.item}
                  isBookmarked={true}
                  onBookmarkToggle={(id) => {
                    setBookmarks(prev => prev.filter(item => item.itemId !== id));
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="p-16 text-center rounded-3xl border border-dashed border-slate-300 dark:border-[#242436] space-y-4">
              <div className="w-16 h-16 rounded-full bg-purple-500/10 text-purple-400 mx-auto flex items-center justify-center">
                <Bookmark className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                No saved bookmarks yet
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Tap the bookmark icon on any catalogue entry to save it to your private collection.
              </p>
              <Link
                href="/browse"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-glow"
              >
                Browse Catalogue <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </section>
      )}

      {/* Privacy Controls Tab Content */}
      {activeTab === 'privacy' && (
        <section className="max-w-2xl mx-auto space-y-6">
          <div className="p-6 rounded-3xl border bg-white dark:bg-[#12121a] border-slate-200 dark:border-[#222234] space-y-4">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-base">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
              Nyamora Privacy Policy & Data Sovereignty
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              We treat search queries, bookmarks, and preferences as sensitive personal data. Nyamora will never sell your browsing history, send queries to advertising brokers, or retain raw search terms beyond your active session.
            </p>

            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-[#181826] space-y-2 text-xs border border-slate-200 dark:border-[#222234]">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Public Interest Profile:</span>
                <span className="text-emerald-400 font-bold">DISABLED</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Ad Broker Telemetry:</span>
                <span className="text-emerald-400 font-bold">NONE</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Storage Location:</span>
                <span className="text-slate-400">Local Privacy Vault</span>
              </div>
            </div>

            {/* Export and Delete Controls */}
            <div className="pt-4 border-t border-slate-200 dark:border-[#202030] flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleExportData}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold border bg-white dark:bg-[#161624] text-slate-700 dark:text-slate-200 border-slate-300 dark:border-[#28283c] hover:border-purple-500 hover:text-purple-400 flex items-center justify-center gap-2 transition-all"
              >
                <Download className="w-4 h-4" />
                Export Library Data (JSON)
              </button>

              <button
                onClick={handlePurgeData}
                className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center gap-2 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                Purge All Saved Data
              </button>
            </div>

            {purged && (
              <p className="text-xs text-rose-400 font-semibold text-center">
                All saved bookmarks and reading history have been permanently purged.
              </p>
            )}
          </div>
        </section>
      )}

    </div>
  );
}
