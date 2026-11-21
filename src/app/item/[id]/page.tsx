'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CatalogueItem,
  SourceProvenance,
  AssetRights,
  ReaderSource,
  CommunityReference,
  ReadingProgress
} from '@/types';
import { CatalogueCard } from '@/components/CatalogueCard';
import {
  BookOpen, ExternalLink, Bookmark, Share2, ShieldCheck,
  Calendar, Layers, Globe, Sparkles, MessageSquare, ArrowLeft,
  CheckCircle, AlertTriangle, Heart
} from 'lucide-react';

interface DetailData {
  item: CatalogueItem;
  provenance?: SourceProvenance;
  assetRights?: AssetRights;
  relatedItems: CatalogueItem[];
  readerSource?: ReaderSource;
  communityReferences: CommunityReference[];
  userState: {
    isBookmarked: boolean;
    readingProgress?: ReadingProgress;
  };
}

export default function ItemDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [data, setData] = useState<DetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  useEffect(() => {
    async function loadItem() {
      try {
        setLoading(true);
        const res = await fetch(`/api/catalogue/${id}`);
        if (res.ok) {
          const detailData: DetailData = await res.json();
          setData(detailData);
          setBookmarked(detailData.userState.isBookmarked);
        } else {
          setData(null);
        }
      } catch (err) {
        console.error('Failed to load item:', err);
      } finally {
        setLoading(false);
      }
    }
    loadItem();
  }, [id]);

  const handleToggleBookmark = async () => {
    if (!data) return;
    try {
      const next = !bookmarked;
      setBookmarked(next);
      await fetch('/api/library/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: data.item.id })
      });
    } catch (e) {
      console.error('Bookmark toggle failed:', e);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReport = () => {
    setReportSuccess(true);
    setTimeout(() => setReportSuccess(false), 3000);
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-purple-500 border-t-transparent animate-spin mx-auto" />
        <p className="text-sm text-slate-400">Loading catalogue record #{id}...</p>
      </div>
    );
  }

  if (!data || !data.item) {
    return (
      <div className="py-24 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Record Not Found</h2>
        <p className="text-sm text-slate-400">This catalogue entry does not exist or has been restricted.</p>
        <Link href="/browse" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold">
          <ArrowLeft className="w-4 h-4" /> Return to Catalogue
        </Link>
      </div>
    );
  }

  const { item, provenance, assetRights, relatedItems, readerSource, communityReferences } = data;

  return (
    <div className="space-y-12 pb-20">
      
      {/* Back Button */}
      <div>
        <Link
          href="/browse"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-purple-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to catalogue browse
        </Link>
      </div>

      {/* Main Detail Header Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Cover & Primary Action */}
        <div className="lg:col-span-4 space-y-4">
          <div className="relative rounded-2xl overflow-hidden border shadow-glow bg-[#12121b] border-slate-200 dark:border-[#222234] aspect-[3/4]">
            <img
              src={item.coverImage}
              alt={item.canonicalTitle}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Availability Action Button */}
          <div className="space-y-2">
            {item.availabilityMode === 'integrated_licensed' ? (
              <Link
                href={`/reader/${item.id}`}
                className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-glow flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <BookOpen className="w-4 h-4" />
                Read Licensed Release Online
              </Link>
            ) : item.availabilityMode === 'external_authorized' && readerSource ? (
              <a
                href={readerSource.canonicalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 shadow-glow flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <ExternalLink className="w-4 h-4" />
                Open Authorized Source ({readerSource.provider})
              </a>
            ) : (
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-[#161622] text-xs text-slate-400 text-center border border-slate-200 dark:border-[#242436]">
                🏛 Archival Metadata Only (Reading source not configured)
              </div>
            )}

            {/* Bookmark & Share Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleToggleBookmark}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                  bookmarked
                    ? 'bg-purple-600 text-white border-purple-500 shadow-glow'
                    : 'bg-white dark:bg-[#14141e] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#242436] hover:text-purple-400'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-current' : ''}`} />
                {bookmarked ? 'Bookmarked' : 'Save Work'}
              </button>

              <button
                onClick={handleShare}
                className="py-2 px-3 rounded-xl text-xs font-semibold border bg-white dark:bg-[#14141e] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#242436] hover:text-purple-400 flex items-center justify-center gap-1.5 transition-all"
              >
                <Share2 className="w-3.5 h-3.5" />
                {copied ? 'Link Copied!' : 'Share'}
              </button>
            </div>
          </div>

          {/* Provenance & Rights Register Box */}
          <div className="p-4 rounded-2xl border bg-slate-50 dark:bg-[#111119] border-slate-200 dark:border-[#202030] space-y-3 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Rights & Source Provenance
            </div>

            <div className="space-y-1.5 text-slate-600 dark:text-slate-400">
              <p>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Provider:</span> {provenance?.provider || 'Curated Indie Registry'}
              </p>
              <p>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Rights Basis:</span> {provenance?.rightsBasis.replace('_', ' ').toUpperCase()}
              </p>
              <p>
                <span className="font-semibold text-slate-700 dark:text-slate-300">License Ref:</span> {assetRights?.permissionReference || 'N/A'}
              </p>
              <p>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Territories:</span> {assetRights?.territories.join(', ') || 'Global'}
              </p>
              <p>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Review Status:</span>{' '}
                <span className="text-emerald-400 font-semibold uppercase">{assetRights?.reviewStatus || 'Approved'}</span>
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-[#1e1e2d] flex justify-between items-center text-[10px] text-slate-400">
              <span>Audited: {provenance?.termsReviewedAt.substring(0, 10)}</span>
              <button
                onClick={handleReport}
                className="text-slate-400 hover:text-rose-400 transition-colors"
              >
                {reportSuccess ? 'Report Received' : 'Report Issue'}
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Metadata Details */}
        <div className="lg:col-span-8 space-y-6">
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                {item.language}
              </span>
              <span className="text-xs text-slate-400">
                Ref ID: #{item.id}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-display leading-tight">
              {item.canonicalTitle}
            </h1>

            {item.alternateTitles && item.alternateTitles.length > 0 && (
              <div className="mt-2 text-sm text-slate-400 font-medium">
                {item.alternateTitles.join(' • ')}
              </div>
            )}
          </div>

          {/* Creator Attribution */}
          <div className="p-4 rounded-xl border bg-white dark:bg-[#13131c] border-slate-200 dark:border-[#212130] flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Artist / Circle</p>
              <Link
                href={`/browse?q=${encodeURIComponent(item.creatorName)}`}
                className="text-base font-bold text-purple-600 dark:text-purple-400 hover:underline"
              >
                {item.creatorName}
              </Link>
            </div>
            <div className="text-right text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Documented Attribution</span>
              <p className="text-[11px] text-slate-500">{provenance?.provider}</p>
            </div>
          </div>

          {/* Quick Specs Bar */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl border bg-white dark:bg-[#13131c] border-slate-200 dark:border-[#212130] text-center">
              <Calendar className="w-4 h-4 mx-auto text-purple-400 mb-1" />
              <p className="text-[10px] text-slate-400 uppercase font-bold">Release Date</p>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.publicationDate}</p>
            </div>

            <div className="p-3 rounded-xl border bg-white dark:bg-[#13131c] border-slate-200 dark:border-[#212130] text-center">
              <Layers className="w-4 h-4 mx-auto text-purple-400 mb-1" />
              <p className="text-[10px] text-slate-400 uppercase font-bold">Length</p>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.pageCount} Pages</p>
            </div>

            <div className="p-3 rounded-xl border bg-white dark:bg-[#13131c] border-slate-200 dark:border-[#212130] text-center">
              <Heart className="w-4 h-4 mx-auto text-rose-500 fill-rose-500 mb-1" />
              <p className="text-[10px] text-slate-400 uppercase font-bold">Community Saves</p>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.saveCount}</p>
            </div>
          </div>

          {/* Synopsis */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider">
              Synopsis & Catalogue Summary
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed p-4 rounded-2xl bg-white dark:bg-[#13131c] border border-slate-200 dark:border-[#212130]">
              {item.description}
            </p>
          </div>

          {/* Approved Tags Section */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider">
              Categorized Approved Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {item.tags.map(tag => (
                <Link
                  key={tag.id}
                  href={`/browse?include_tags=${tag.id}`}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 hover:bg-purple-600 hover:text-white transition-all shadow-sm"
                >
                  #{tag.normalizedName}
                  <span className="ml-1.5 text-[10px] opacity-70 uppercase font-normal">
                    {tag.category}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Outbound Reddit Community References Shelf */}
          {communityReferences.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-[#202030]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-orange-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider">
                    Community Outbound References (Reddit)
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400">
                  Links directly to external Reddit threads
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {communityReferences.map(ref => (
                  <a
                    key={ref.id}
                    href={ref.canonicalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group p-3 rounded-xl border bg-white dark:bg-[#13131c] border-slate-200 dark:border-[#212130] hover:border-orange-500/50 hover:shadow-glow transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-semibold text-orange-400 mb-1">
                        <span>{ref.subreddit}</span>
                        <span className="text-slate-500">{ref.relevanceLabel}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-orange-400 line-clamp-2">
                        {ref.title}
                      </h4>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-[#1a1a26] flex items-center justify-between text-[10px] text-slate-400">
                      <span>External Opinion</span>
                      <span className="flex items-center gap-1 font-semibold text-orange-400 group-hover:translate-x-0.5 transition-transform">
                        Open Reddit <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Related Entries Shelf */}
      {relatedItems.length > 0 && (
        <section className="space-y-4 pt-8 border-t border-slate-200 dark:border-[#202030]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                Related Catalogue Entries
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              Grounded on shared creators, themes, and vector similarity
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {relatedItems.map(rel => (
              <CatalogueCard key={rel.id} item={rel} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
