'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CommunityReference } from '@/types';
import { MessageSquare, ExternalLink, ShieldCheck, Sparkles, Filter } from 'lucide-react';

export default function CommunityPage() {
  const [references, setReferences] = useState<CommunityReference[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubreddit, setSelectedSubreddit] = useState<string>('all');

  useEffect(() => {
    async function loadCommunity() {
      try {
        setLoading(true);
        const res = await fetch('/api/community');
        if (res.ok) {
          const data = await res.json();
          setReferences(data.references || []);
        }
      } catch (e) {
        console.error('Failed to load community:', e);
      } finally {
        setLoading(false);
      }
    }
    loadCommunity();
  }, []);

  const subreddits = ['all', ...Array.from(new Set(references.map(r => r.subreddit)))];

  const filtered = selectedSubreddit === 'all'
    ? references
    : references.filter(r => r.subreddit === selectedSubreddit);

  return (
    <div className="space-y-8 pb-20">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl border bg-gradient-to-r from-orange-950/30 via-[#14141e] to-[#0c0c14] border-orange-900/30 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Curated Outbound Reddit Directory</span>
        </div>

        <h1 className="text-3xl font-extrabold text-white font-display">
          Community References & External Discussions
        </h1>

        <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
          Explore discussions, retrospective lists, and artist appreciation threads hosted directly on Reddit.
          In accordance with Reddit API guidelines and copyright compliance, <strong>all links open the original Reddit page</strong>; no comments or threads are mirrored on Nyamora.
        </p>

        {/* Disclaimer Notice Box */}
        <div className="p-4 rounded-2xl bg-orange-950/20 border border-orange-500/30 text-xs text-orange-200/90 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-orange-300">Outbound-Only Architectural Guarantee:</p>
            <p className="text-slate-400 mt-0.5">
              Community references represent user opinions on external platforms, not verified catalogue facts. Clicking any reference card safely opens the canonical Reddit URL in a new window.
            </p>
          </div>
        </div>
      </div>

      {/* Subreddit Filter Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
        <span className="text-slate-400 flex items-center gap-1 font-semibold">
          <Filter className="w-3.5 h-3.5" /> Filter by:
        </span>
        {subreddits.map(sub => (
          <button
            key={sub}
            onClick={() => setSelectedSubreddit(sub)}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
              selectedSubreddit === sub
                ? 'bg-orange-600 text-white shadow-glow'
                : 'bg-white dark:bg-[#13131e] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#222234] hover:text-white'
            }`}
          >
            {sub === 'all' ? 'All Subreddits' : sub}
          </button>
        ))}
      </div>

      {/* References Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 rounded-2xl bg-slate-200 dark:bg-[#141420] animate-pulse" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((ref) => (
            <a
              key={ref.id}
              href={ref.canonicalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-5 rounded-2xl border bg-white dark:bg-[#13131c] border-slate-200 dark:border-[#212130] hover:border-orange-500/50 hover:shadow-glow transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-2">
                  <span className="px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-400">
                    {ref.subreddit}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    {ref.relevanceLabel}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-orange-400 transition-colors line-clamp-3 leading-snug">
                  {ref.title}
                </h3>

                <div className="mt-3 flex flex-wrap gap-1">
                  {ref.tagReferences.map(t => (
                    <span
                      key={t}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-[#1b1b28] text-slate-500 dark:text-slate-400"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#1e1e2d] flex items-center justify-between text-xs text-slate-400">
                <span>{ref.publishedAt.substring(0, 10)}</span>
                <span className="flex items-center gap-1 font-semibold text-orange-500 group-hover:translate-x-0.5 transition-transform">
                  Open on Reddit <ExternalLink className="w-3.5 h-3.5" />
                </span>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center text-slate-400 text-sm">
          No community references currently found.
        </div>
      )}

    </div>
  );
}
