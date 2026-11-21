'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CatalogueItem, SearchResultItem } from '@/types';
import { Bookmark, BookOpen, ExternalLink, Sparkles, Heart } from 'lucide-react';

interface CatalogueCardProps {
  item: CatalogueItem | SearchResultItem;
  viewMode?: 'grid' | 'list';
  onBookmarkToggle?: (itemId: string) => void;
  isBookmarked?: boolean;
}

export function CatalogueCard({
  item,
  viewMode = 'grid',
  onBookmarkToggle,
  isBookmarked = false
}: CatalogueCardProps) {
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [saveCount, setSaveCount] = useState(item.saveCount);

  const searchItem = item as SearchResultItem;
  const matchReasons = searchItem.matchReasons || [];

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const nextState = !bookmarked;
      setBookmarked(nextState);
      setSaveCount(prev => nextState ? prev + 1 : Math.max(0, prev - 1));

      await fetch('/api/library/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.id })
      });

      if (onBookmarkToggle) {
        onBookmarkToggle(item.id);
      }
    } catch (err) {
      console.error('Bookmark error:', err);
    }
  };

  const getAvailabilityBadge = () => {
    switch (item.availabilityMode) {
      case 'integrated_licensed':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <BookOpen className="w-3 h-3" /> Licensed Reader
          </span>
        );
      case 'external_authorized':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <ExternalLink className="w-3 h-3" /> DLsite Partner
          </span>
        );
      case 'metadata_only':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-400 border border-slate-500/30">
            Metadata Archival
          </span>
        );
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="group relative flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl border transition-all bg-white dark:bg-[#13131c] border-slate-200 dark:border-[#212130] hover:border-purple-500/50 hover:shadow-glow">
        <Link href={`/item/${item.id}`} className="relative w-24 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-slate-900 border border-slate-700/50">
          <img
            src={item.coverImage}
            alt={item.canonicalTitle}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {getAvailabilityBadge()}
            <span className="text-[10px] uppercase font-bold text-slate-400">
              {item.language} • {item.pageCount}P
            </span>
            {searchItem.isExactMatch && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40">
                Exact Match
              </span>
            )}
          </div>

          <Link href={`/item/${item.id}`} className="block">
            <h3 className="font-bold text-base text-slate-900 dark:text-white truncate group-hover:text-purple-400 transition-colors">
              {item.canonicalTitle}
            </h3>
            {item.alternateTitles?.[0] && (
              <p className="text-xs text-slate-400 truncate mb-1">
                {item.alternateTitles[0]}
              </p>
            )}
          </Link>

          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1 mb-2">
            By <span className="font-semibold text-purple-600 dark:text-purple-400">{item.creatorName}</span> — {item.description}
          </p>

          <div className="flex flex-wrap gap-1 items-center">
            {item.tags.slice(0, 5).map(tag => (
              <Link
                key={tag.id}
                href={`/browse?include_tags=${tag.id}`}
                className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#1a1a26] text-slate-600 dark:text-slate-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 hover:text-purple-600 dark:hover:text-purple-300 transition-colors"
              >
                #{tag.normalizedName}
              </Link>
            ))}
          </div>

          {matchReasons.length > 0 && (
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-purple-600 dark:text-purple-400">
              <Sparkles className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{matchReasons.join(' • ')}</span>
            </div>
          )}
        </div>

        <div className="flex sm:flex-col items-center gap-2 self-end sm:self-center">
          <button
            onClick={handleBookmark}
            title={bookmarked ? "Remove Bookmark" : "Save to Library"}
            className={`p-2 rounded-lg border transition-all ${
              bookmarked
                ? 'bg-purple-600 text-white border-purple-500 shadow-glow'
                : 'text-slate-400 border-slate-200 dark:border-[#2a2a3c] hover:text-purple-400 hover:border-purple-400'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
          </button>
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> {saveCount}
          </span>
        </div>
      </div>
    );
  }

  // Grid Mode (Default)
  return (
    <div className="group relative flex flex-col rounded-2xl border transition-all overflow-hidden bg-white dark:bg-[#13131c] border-slate-200 dark:border-[#212130] hover:border-purple-500/50 hover:shadow-glow">
      
      {/* Cover Image */}
      <Link href={`/item/${item.id}`} className="relative aspect-[3/4] w-full overflow-hidden bg-slate-900">
        <img
          src={item.coverImage}
          alt={item.canonicalTitle}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Top Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 pointer-events-none">
          <div className="pointer-events-auto">
            {getAvailabilityBadge()}
          </div>
          <button
            onClick={handleBookmark}
            title={bookmarked ? "Bookmarked" : "Save"}
            className={`p-1.5 rounded-full backdrop-blur-md transition-all pointer-events-auto ${
              bookmarked
                ? 'bg-purple-600 text-white shadow-glow'
                : 'bg-black/60 text-white hover:bg-purple-600'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Bottom Year / Pages Pill */}
        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[10px] font-semibold text-white/90 drop-shadow">
          <span className="px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm uppercase">
            {item.language}
          </span>
          <span className="px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm">
            {item.pageCount} Pages
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          <Link href={`/item/${item.id}`} className="block">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-purple-400 transition-colors">
              {item.canonicalTitle}
            </h3>
          </Link>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            by <span className="font-medium text-purple-600 dark:text-purple-400">{item.creatorName}</span>
          </p>
        </div>

        {/* Match Reasons for AI & Hybrid Search */}
        {matchReasons.length > 0 && (
          <div className="text-[11px] p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/50 text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 flex-shrink-0 text-purple-500" />
            <span className="truncate">{matchReasons[0]}</span>
          </div>
        )}

        {/* Compact Tags */}
        <div className="flex flex-wrap gap-1">
          {item.tags.slice(0, 3).map(tag => (
            <Link
              key={tag.id}
              href={`/browse?include_tags=${tag.id}`}
              className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-[#1c1c2a] text-slate-600 dark:text-slate-300 hover:text-purple-500 transition-colors"
            >
              #{tag.normalizedName}
            </Link>
          ))}
          {item.tags.length > 3 && (
            <span className="text-[10px] text-slate-400 self-center">
              +{item.tags.length - 3}
            </span>
          )}
        </div>

        {/* Footer Meta */}
        <div className="pt-2 border-t border-slate-100 dark:border-[#1d1d2b] flex items-center justify-between text-[11px] text-slate-400">
          <span>{item.publicationDate.substring(0, 7)}</span>
          <span className="flex items-center gap-1 font-medium">
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> {saveCount}
          </span>
        </div>

      </div>

    </div>
  );
}
