'use client';

import React, { useState, useEffect, use, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CatalogueItem, ReaderAsset, ReadingProgress } from '@/types';
import {
  ArrowLeft, ChevronLeft, ChevronRight, Maximize, Minimize,
  ZoomIn, ZoomOut, RotateCcw, ShieldCheck, CheckCircle2, Bookmark
} from 'lucide-react';

interface ReaderResponse {
  item?: CatalogueItem;
  pages?: ReaderAsset[];
  totalPages?: number;
  readingProgress?: ReadingProgress;
  error?: string;
  externalSource?: { canonicalUrl: string; provider: string };
}

export default function ReaderPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [data, setData] = useState<ReaderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [fitMode, setFitMode] = useState<'fit-width' | 'fit-height' | 'original'>('fit-height');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [useProxy, setUseProxy] = useState(false);
  const [pageSrc, setPageSrc] = useState<string>('');

  const resolvePageUrl = useCallback((rawUrl: string, proxyActive: boolean) => {
    if (!rawUrl) return '';
    if (proxyActive && rawUrl.includes('nhentai.net') && !rawUrl.includes('/api/nhentai/image')) {
      return `/api/nhentai/image?url=${encodeURIComponent(rawUrl)}`;
    }
    return rawUrl;
  }, []);

  useEffect(() => {
    async function loadReader() {
      try {
        setLoading(true);
        const res = await fetch(`/api/reader/${id}`);
        const json: ReaderResponse = await res.json();
        setData(json);

        // Resume reading progress if available
        const initPage = json.readingProgress?.pageIndex || 1;
        setCurrentPage(initPage);
        if (json.pages && json.pages[initPage - 1]?.imageUrl) {
          setPageSrc(resolvePageUrl(json.pages[initPage - 1].imageUrl!, useProxy));
        }
      } catch (err) {
        console.error('Failed to load reader:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReader();
  }, [id, resolvePageUrl, useProxy]);

  // Update pageSrc on page change
  useEffect(() => {
    if (data?.pages && data.pages[currentPage - 1]?.imageUrl) {
      setPageSrc(resolvePageUrl(data.pages[currentPage - 1].imageUrl!, useProxy));
    }
  }, [currentPage, data, useProxy, resolvePageUrl]);

  const handlePageError = () => {
    setUseProxy(true);
    if (pageSrc.includes('nhentai.net') && !pageSrc.includes('/api/nhentai/image')) {
      setPageSrc(`/api/nhentai/image?url=${encodeURIComponent(pageSrc)}`);
    }
  };

  const totalPages = data?.totalPages || data?.pages?.length || 1;

  // Save progress privately
  const saveProgress = useCallback(async (pageIdx: number) => {
    try {
      await fetch('/api/library/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: id,
          pageIndex: pageIdx,
          totalPages
        })
      });
    } catch (e) {
      console.error('Failed to save progress:', e);
    }
  }, [id, totalPages]);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      const next = currentPage + 1;
      setCurrentPage(next);
      saveProgress(next);
    }
  }, [currentPage, totalPages, saveProgress]);

  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) {
      const prev = currentPage - 1;
      setCurrentPage(prev);
      saveProgress(prev);
    }
  }, [currentPage, saveProgress]);

  const touchStartX = React.useRef<number | null>(null);
  const touchStartY = React.useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    const diffY = e.changedTouches[0].clientY - touchStartY.current;

    // Detect horizontal swipe with min 45px distance
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 45) {
      if (diffX < 0) {
        handleNextPage();
      } else {
        handlePrevPage();
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        handleNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrevPage();
      } else if (e.key === 'f') {
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextPage, handlePrevPage]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="py-32 text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mx-auto" />
        <p className="text-sm text-slate-400">Verifying rights register and loading licensed reader session...</p>
      </div>
    );
  }

  // Rights gate denial or restricted item
  if (data?.error || !data?.pages) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 rounded-3xl border bg-white dark:bg-[#12121a] border-slate-200 dark:border-[#222234] text-center space-y-5 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Integrated Reader Rights Gate
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {data?.error || 'This work is not cleared for integrated hosting on Nyamora.'}
        </p>

        {data?.externalSource && (
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-[#171724] border border-slate-200 dark:border-[#222234] text-xs space-y-2">
            <p className="font-semibold text-slate-300">Authorized External Destination Available:</p>
            <a
              href={data.externalSource.canonicalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition-colors shadow-glow"
            >
              Open on {data.externalSource.provider}
            </a>
          </div>
        )}

        <div>
          <Link
            href={`/item/${id}`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Catalogue Record
          </Link>
        </div>
      </div>
    );
  }

  const activePage = data.pages[currentPage - 1];

  return (
    <div className="flex flex-col min-h-[90vh] bg-[#07070b] text-slate-100 -mx-4 sm:-mx-6 lg:-mx-8 -my-6 px-4 py-3 select-none">
      
      {/* Top Toolbar */}
      <div className="flex items-center justify-between py-2 border-b border-[#1c1c2a] max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <Link
            href={`/item/${id}`}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#181824] transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Exit Reader</span>
          </Link>
          <div className="h-4 w-px bg-[#222234]" />
          <h2 className="text-xs sm:text-sm font-bold text-white truncate max-w-[200px] sm:max-w-md">
            {data.item?.canonicalTitle}
          </h2>
        </div>

        {/* Center Page Counter */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="p-1 rounded bg-[#171724] text-slate-300 disabled:opacity-30 hover:bg-[#202030]"
            title="Previous Page (Left Arrow)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span>
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
            className="p-1 rounded bg-[#171724] text-slate-300 disabled:opacity-30 hover:bg-[#202030]"
            title="Next Page (Right Arrow)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {/* Fit Mode Switcher */}
          <div className="hidden sm:flex items-center rounded-lg p-0.5 bg-[#171724] text-[11px] font-semibold">
            <button
              onClick={() => setFitMode('fit-height')}
              className={`px-2 py-1 rounded ${fitMode === 'fit-height' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}
            >
              Fit Height
            </button>
            <button
              onClick={() => setFitMode('fit-width')}
              className={`px-2 py-1 rounded ${fitMode === 'fit-width' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}
            >
              Fit Width
            </button>
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#181824] transition-colors"
            title="Toggle Fullscreen (F)"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Reader Viewport */}
      <div
        className="flex-1 flex items-center justify-center p-2 relative cursor-pointer"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          if (clickX > rect.width / 2) {
            handleNextPage();
          } else {
            handlePrevPage();
          }
        }}
      >
        {activePage && (
          <div className={`relative flex items-center justify-center ${
            fitMode === 'fit-height' ? 'h-[78vh]' : fitMode === 'fit-width' ? 'w-full max-w-4xl' : 'max-h-[85vh]'
          }`}>
            <img
              src={pageSrc || activePage.imageUrl || data.item?.coverImage}
              alt={`Page ${currentPage}`}
              referrerPolicy="no-referrer"
              onError={handlePageError}
              className={`rounded-lg object-contain shadow-2xl border border-[#222234] ${
                fitMode === 'fit-height' ? 'h-full max-w-full' : 'w-full h-auto'
              }`}
            />
          </div>
        )}

        {/* Floating Side Indicators */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white/60 hover:text-white hover:bg-black/80 transition-all">
          <ChevronLeft className="w-6 h-6" />
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white/60 hover:text-white hover:bg-black/80 transition-all">
          <ChevronRight className="w-6 h-6" />
        </div>
      </div>

      {/* Bottom Slider & Scrub Bar */}
      <div className="py-2 border-t border-[#1c1c2a] max-w-2xl mx-auto w-full px-4 flex items-center gap-4">
        <span className="text-[10px] text-slate-500 font-mono">P. 1</span>
        <input
          type="range"
          min="1"
          max={totalPages}
          value={currentPage}
          onChange={(e) => {
            const pageNum = parseInt(e.target.value, 10);
            setCurrentPage(pageNum);
            saveProgress(pageNum);
          }}
          className="flex-1 accent-purple-500 cursor-pointer"
        />
        <span className="text-[10px] text-slate-500 font-mono">P. {totalPages}</span>
      </div>

    </div>
  );
}
