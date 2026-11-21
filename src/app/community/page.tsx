'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CommunityReference } from '@/types';
import {
  MessageSquare, ExternalLink, ShieldCheck, Sparkles, Filter,
  Flame, Heart, Tag as TagIcon, Compass, Share2
} from 'lucide-react';

interface SubredditHubItem {
  name: string;
  url: string;
  tag: string;
  desc: string;
  badgeColor: string;
}

const SUBREDDIT_HUBS: SubredditHubItem[] = [
  {
    name: 'r/nhentai',
    url: 'https://www.reddit.com/r/nhentai/',
    tag: 'nhentai',
    desc: 'Official nHentai community for sauce finding, daily releases, and tag search syntax.',
    badgeColor: 'bg-pink-500/20 text-pink-400 border-pink-500/30'
  },
  {
    name: 'r/netorare',
    url: 'https://www.reddit.com/r/netorare/',
    tag: 'netorare',
    desc: 'Netorare drama & psychological romance. Includes recommendations strictly without ugly bastard.',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
  },
  {
    name: 'r/wholesomehentai',
    url: 'https://www.reddit.com/r/wholesomehentai/',
    tag: 'wholesome',
    desc: 'Pure vanilla, slow-burn romantic fluff, and heartwarming consensual intimacy.',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
  },
  {
    name: 'r/doujinshi',
    url: 'https://www.reddit.com/r/doujinshi/',
    tag: 'doujinshi',
    desc: 'Primary hub for Comiket releases, indie circles, artist appreciation, and translation groups.',
    badgeColor: 'bg-sky-500/20 text-sky-400 border-sky-500/30'
  },
  {
    name: 'r/kemonomimi',
    url: 'https://www.reddit.com/r/kemonomimi/',
    tag: 'kemonomimi',
    desc: 'Animal-eared maidens, kitsune shrine girls, and fluffy tail doujin aesthetics.',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
  },
  {
    name: 'r/catgirls',
    url: 'https://www.reddit.com/r/catgirls/',
    tag: 'catgirl',
    desc: 'Neko companions, catgirl maidens, and playful purring maid doujinshi.',
    badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30'
  },
  {
    name: 'r/milfhentai',
    url: 'https://www.reddit.com/r/milfhentai/',
    tag: 'milf',
    desc: 'Mature female storylines, tender office ladies, and married woman (hitozuma) releases.',
    badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
  },
  {
    name: 'r/galhentai',
    url: 'https://www.reddit.com/r/galhentai/',
    tag: 'gyaru',
    desc: 'Gyaru fashion, dark skin / tan romance, and playful, confident heroine doujins.',
    badgeColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
  },
  {
    name: 'r/yande_re',
    url: 'https://www.reddit.com/r/yande_re/',
    tag: 'yandere',
    desc: 'Obsessive devotion, thrilling high-stakes love, and intense yandere doujins.',
    badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30'
  },
  {
    name: 'r/femdom',
    url: 'https://www.reddit.com/r/femdom/',
    tag: 'femdom',
    desc: 'Gentle & commanding female domination, onee-san dynamics, and tease storylines.',
    badgeColor: 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30'
  }
];

export default function CommunityPage() {
  const [references, setReferences] = useState<CommunityReference[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubreddit, setSelectedSubreddit] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');

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
  const allTags = ['all', ...Array.from(new Set(references.flatMap(r => r.tagReferences)))];

  const filtered = references.filter(r => {
    const matchesSub = selectedSubreddit === 'all' || r.subreddit === selectedSubreddit;
    const matchesTag = selectedTag === 'all' || r.tagReferences.includes(selectedTag);
    return matchesSub && matchesTag;
  });

  return (
    <div className="space-y-10 pb-20">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl border bg-gradient-to-r from-orange-950/30 via-[#14141e] to-[#0c0c14] border-orange-900/30 space-y-4 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Curated Outbound Reddit & Tag Community Hub</span>
        </div>

        <h1 className="text-3xl font-extrabold text-white font-display">
          Community Hub & Subreddit Directory
        </h1>

        <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
          Direct redirects to major doujinshi, nHentai, netorare, and trope communities across Reddit. 
          All outbound cards open the original canonical Reddit discussion page directly.
        </p>

        {/* Disclaimer Notice Box */}
        <div className="p-4 rounded-2xl bg-orange-950/20 border border-orange-500/30 text-xs text-orange-200/90 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-orange-300">Outbound-Only Architectural Guarantee:</p>
            <p className="text-slate-400 mt-0.5">
              Community discussions are hosted externally on Reddit. Clicking any card or direct hub button safely opens the verified Reddit URL in a new tab.
            </p>
          </div>
        </div>
      </div>

      {/* Primary Subreddit Redirect Hub */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-orange-400" />
            <h2 className="text-lg font-bold text-white font-display">
              Subreddit Redirects & Tag Communities
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Direct outbound portals (opens Reddit)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
          {SUBREDDIT_HUBS.map(hub => (
            <div
              key={hub.name}
              className="p-4 rounded-2xl border bg-white dark:bg-[#12121b] border-slate-200 dark:border-[#20202e] hover:border-orange-500/50 hover:shadow-glow transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${hub.badgeColor}`}>
                    {hub.name}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedSubreddit(hub.name);
                      setSelectedTag('all');
                    }}
                    title="Filter discussions below"
                    className="text-[10px] text-slate-400 hover:text-orange-400 font-semibold transition-colors"
                  >
                    Filter ↓
                  </button>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug line-clamp-2 mt-1">
                  {hub.desc}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-[#1c1c28] flex items-center justify-between">
                <button
                  onClick={() => {
                    setSelectedTag(hub.tag);
                    setSelectedSubreddit('all');
                  }}
                  className="text-[10px] font-semibold text-purple-400 hover:text-purple-300"
                >
                  #{hub.tag}
                </button>
                <a
                  href={hub.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-orange-400 group-hover:text-orange-300 transition-colors"
                >
                  Open <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Section for Curated Discussions */}
      <div className="p-5 rounded-2xl border bg-slate-50 dark:bg-[#111119] border-slate-200 dark:border-[#1e1e2c] space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-orange-400" />
            <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
              Filter Curated External Discussions:
            </span>
          </div>
          {(selectedSubreddit !== 'all' || selectedTag !== 'all') && (
            <button
              onClick={() => {
                setSelectedSubreddit('all');
                setSelectedTag('all');
              }}
              className="text-[11px] text-orange-400 hover:underline font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Subreddit Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] text-slate-400 font-medium mr-1 flex-shrink-0">Subreddit:</span>
          {subreddits.map(sub => (
            <button
              key={sub}
              onClick={() => setSelectedSubreddit(sub)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-colors ${
                selectedSubreddit === sub
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'bg-white dark:bg-[#171724] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#242436] hover:text-white'
              }`}
            >
              {sub === 'all' ? 'All Subreddits' : sub}
            </button>
          ))}
        </div>

        {/* Tag Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] text-slate-400 font-medium mr-1 flex-shrink-0">Tag:</span>
          {allTags.slice(0, 12).map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-medium whitespace-nowrap transition-colors ${
                selectedTag === tag
                  ? 'bg-purple-600 text-white'
                  : 'bg-white dark:bg-[#161622] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-[#222232] hover:text-purple-300'
              }`}
            >
              {tag === 'all' ? 'All Tags' : `#${tag}`}
            </button>
          ))}
        </div>
      </div>

      {/* Curated Discussion Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-orange-400" />
            Curated Reddit Discussion Threads ({filtered.length})
          </h3>
          <span className="text-xs text-slate-400">
            Click any thread to open on Reddit
          </span>
        </div>

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
                  <span className="flex items-center gap-1 font-semibold text-orange-400 group-hover:text-orange-300 group-hover:translate-x-0.5 transition-transform">
                    Open on Reddit <ExternalLink className="w-3.5 h-3.5" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-[#222234] text-slate-400 text-sm">
            No community references matching your current filter. Try resetting filters above.
          </div>
        )}
      </div>

    </div>
  );
}
