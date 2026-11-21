'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SearchResponse, Tag, Creator, AvailabilityMode } from '@/types';
import { CatalogueCard } from '@/components/CatalogueCard';
import {
  Search, Filter, SlidersHorizontal, LayoutGrid, List, X,
  ChevronLeft, ChevronRight, RotateCcw, ShieldAlert, Sparkles, BookOpen
} from 'lucide-react';

function BrowseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [allCreators, setAllCreators] = useState<Creator[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Form / Filter states derived from URL or inputs
  const currentQuery = searchParams.get('q') || '';
  const currentSort = searchParams.get('sort') || 'relevance';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentLanguage = searchParams.get('language') || '';
  const currentAvailability = searchParams.get('availability') || '';
  const includeTags = (searchParams.get('include_tags') || '').split(',').filter(Boolean);
  const excludeTags = (searchParams.get('exclude_tags') || '').split(',').filter(Boolean);

  const [inputSearch, setInputSearch] = useState(currentQuery);

  // Load available tags and creators on mount
  useEffect(() => {
    async function loadMetadata() {
      try {
        const [tagsRes, creatorsRes] = await Promise.all([
          fetch('/api/tags'),
          fetch('/api/creators')
        ]);
        const tagsData = await tagsRes.json();
        const creatorsData = await creatorsRes.json();
        setAllTags(tagsData.tags || []);
        setAllCreators(creatorsData.creators || []);
      } catch (err) {
        console.error('Failed to load filter metadata:', err);
      }
    }
    loadMetadata();
  }, []);

  // Fetch search/catalogue results whenever URL query params change
  useEffect(() => {
    async function fetchResults() {
      try {
        setLoading(true);
        const params = new URLSearchParams(searchParams.toString());
        if (!params.has('pageSize')) params.set('pageSize', '12');

        const res = await fetch(`/api/catalogue?${params.toString()}`);
        if (res.ok) {
          const resData: SearchResponse = await res.json();
          setData(resData);
        }
      } catch (err) {
        console.error('Failed to fetch browse results:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
    setInputSearch(currentQuery);
  }, [searchParams]);

  // Update URL helper
  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, val] of Object.entries(updates)) {
      if (val === null || val === '') {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    }
    // Reset to page 1 on filter changes unless changing page directly
    if (!('page' in updates)) {
      params.set('page', '1');
    }
    router.push(`/browse?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ q: inputSearch.trim() || null });
  };

  const toggleIncludeTag = (tagId: string) => {
    const next = includeTags.includes(tagId)
      ? includeTags.filter(t => t !== tagId)
      : [...includeTags, tagId];
    // Cannot be included and excluded simultaneously
    const nextExclude = excludeTags.filter(t => t !== tagId);
    updateParams({
      include_tags: next.length > 0 ? next.join(',') : null,
      exclude_tags: nextExclude.length > 0 ? nextExclude.join(',') : null
    });
  };

  const toggleExcludeTag = (tagId: string) => {
    const next = excludeTags.includes(tagId)
      ? excludeTags.filter(t => t !== tagId)
      : [...excludeTags, tagId];
    // Cannot be included and excluded simultaneously
    const nextInclude = includeTags.filter(t => t !== tagId);
    updateParams({
      exclude_tags: next.length > 0 ? next.join(',') : null,
      include_tags: nextInclude.length > 0 ? nextInclude.join(',') : null
    });
  };

  const handleClearAllFilters = () => {
    setInputSearch('');
    router.push('/browse');
  };

  const activeFilterChips = [
    ...includeTags.map(id => {
      const tag = allTags.find(t => t.id === id);
      return { id, label: `+ #${tag?.normalizedName || id}`, type: 'include' };
    }),
    ...excludeTags.map(id => {
      const tag = allTags.find(t => t.id === id);
      return { id, label: `- #${tag?.normalizedName || id}`, type: 'exclude' };
    }),
    ...(currentLanguage ? [{ id: 'lang', label: `Lang: ${currentLanguage}`, type: 'lang' }] : []),
    ...(currentAvailability ? [{ id: 'avail', label: `Mode: ${currentAvailability}`, type: 'avail' }] : [])
  ];

  return (
    <div className="space-y-6 pb-20">
      
      {/* Top Search & Controls Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <input
            type="text"
            placeholder="Search titles, creators, tags, or concepts (supports 'not X' or '-tag')..."
            value={inputSearch}
            onChange={(e) => setInputSearch(e.target.value)}
            className="w-full pl-10 pr-28 py-3 text-sm rounded-2xl border transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-[#13131e] border-slate-200 dark:border-[#222234] text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
          <button
            type="submit"
            className="absolute right-2 top-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-glow"
          >
            Filter
          </button>
        </form>

        <div className="flex items-center gap-3 justify-between lg:justify-end">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            className="lg:hidden px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 bg-slate-100 dark:bg-[#161622] border-slate-300 dark:border-[#27273c]"
          >
            <Filter className="w-3.5 h-3.5 text-purple-400" />
            Filters {activeFilterChips.length > 0 && `(${activeFilterChips.length})`}
          </button>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <select
              value={currentSort}
              onChange={(e) => updateParams({ sort: e.target.value })}
              className="text-xs font-semibold py-2 px-3 rounded-xl border bg-white dark:bg-[#13131e] border-slate-200 dark:border-[#222234] text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="relevance">Sort: Highest Relevance</option>
              <option value="popular">Sort: Most Popular (Saves)</option>
              <option value="newest">Sort: Recently Added</option>
              <option value="publication_date">Sort: Release Date</option>
              <option value="title_asc">Sort: Title (A – Z)</option>
              <option value="title_desc">Sort: Title (Z – A)</option>
            </select>
          </div>

          {/* Grid / List Mode */}
          <div className="hidden sm:flex items-center rounded-xl p-1 border bg-slate-100 dark:bg-[#13131e] border-slate-200 dark:border-[#222234]">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-[#202030] text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-[#202030] text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter Chips Bar */}
      {activeFilterChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl border bg-purple-500/5 border-purple-500/20 text-xs">
          <span className="font-semibold text-purple-400 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Active:
          </span>

          {activeFilterChips.map(chip => (
            <span
              key={chip.id}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-medium ${
                chip.type === 'exclude'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
              }`}
            >
              {chip.label}
              <button
                onClick={() => {
                  if (chip.type === 'include') toggleIncludeTag(chip.id);
                  else if (chip.type === 'exclude') toggleExcludeTag(chip.id);
                  else if (chip.type === 'lang') updateParams({ language: null });
                  else if (chip.type === 'avail') updateParams({ availability: null });
                }}
                className="hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          <button
            onClick={handleClearAllFilters}
            className="ml-auto text-slate-400 hover:text-rose-400 flex items-center gap-1 font-semibold transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Clear All
          </button>
        </div>
      )}

      {/* Main Browse Layout (Sidebar + Results) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Filter Sidebar */}
        <aside
          className={`lg:col-span-3 space-y-6 ${
            showFiltersMobile ? 'block' : 'hidden lg:block'
          } p-5 rounded-2xl border bg-white dark:bg-[#111119] border-slate-200 dark:border-[#202030]`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#202030]">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Filter className="w-4 h-4 text-purple-400" /> Advanced Filter
            </h3>
            {activeFilterChips.length > 0 && (
              <button
                onClick={handleClearAllFilters}
                className="text-[11px] text-purple-400 hover:underline"
              >
                Reset
              </button>
            )}
          </div>

          {/* Availability Mode */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Availability Mode
            </h4>
            <div className="space-y-1 text-xs">
              {[
                { id: '', label: 'All Modes' },
                { id: 'integrated_licensed', label: '📖 Licensed Reader Only' },
                { id: 'external_authorized', label: '🔗 DLsite / Partner Store' },
                { id: 'metadata_only', label: '🏛 Archival Metadata Only' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => updateParams({ availability: opt.id || null })}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                    currentAvailability === opt.id
                      ? 'bg-purple-600 text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1a1a28]'
                  }`}
                >
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Language Selector */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Language
            </h4>
            <div className="grid grid-cols-2 gap-1 text-xs">
              {[
                { id: '', label: 'Any Language' },
                { id: 'english', label: 'English' },
                { id: 'japanese', label: 'Japanese' },
                { id: 'chinese', label: 'Chinese' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => updateParams({ language: opt.id || null })}
                  className={`px-2 py-1.5 rounded-lg text-center font-medium transition-colors ${
                    currentLanguage === opt.id
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-[#171724] hover:bg-purple-100 dark:hover:bg-purple-950/50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Include Tags Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Include Tags (+)
              </h4>
              <span className="text-[10px] text-slate-500">Tap to include</span>
            </div>
            <div className="flex flex-wrap gap-1 max-h-48 overflow-y-auto p-1">
              {allTags.map(tag => {
                const isInc = includeTags.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    onClick={() => toggleIncludeTag(tag.id)}
                    className={`text-[10px] px-2 py-0.5 rounded-md font-medium transition-colors ${
                      isInc
                        ? 'bg-purple-600 text-white shadow-glow'
                        : 'bg-slate-100 dark:bg-[#171724] text-slate-600 dark:text-slate-400 hover:text-purple-400'
                    }`}
                  >
                    #{tag.normalizedName}
                  </button>
                );
              })}
            </div>
          </div>

          {/* EXCLUDE Tags Selector (Mandatory Distinct Server-side Exclusion) */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-[#202030]">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> Exclude Tags (-)
              </h4>
              <span className="text-[10px] text-slate-500">Strict filter</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              Entries containing any selected tag will be strictly omitted from results.
            </p>
            <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto p-1">
              {allTags.map(tag => {
                const isExc = excludeTags.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    onClick={() => toggleExcludeTag(tag.id)}
                    className={`text-[10px] px-2 py-0.5 rounded-md font-medium transition-colors ${
                      isExc
                        ? 'bg-rose-600 text-white font-bold'
                        : 'bg-slate-100 dark:bg-[#171724] text-slate-600 dark:text-slate-400 hover:text-rose-400 hover:border-rose-400'
                    }`}
                  >
                    -#{tag.normalizedName}
                  </button>
                );
              })}
            </div>
          </div>

        </aside>

        {/* Right Catalogue Results Grid */}
        <section className="lg:col-span-9 space-y-6">
          
          {/* Header count info */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              Showing <strong className="text-slate-900 dark:text-white">{data?.items.length || 0}</strong> of <strong className="text-slate-900 dark:text-white">{data?.total || 0}</strong> verified records
            </span>
            <span>
              Page {data?.page || 1} of {data?.totalPages || 1}
            </span>
          </div>

          {/* Results Display */}
          {loading ? (
            <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'} gap-4`}>
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-2xl bg-slate-200 dark:bg-[#151522] animate-pulse" />
              ))}
            </div>
          ) : data && data.items.length > 0 ? (
            <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'} gap-4`}>
              {data.items.map((item) => (
                <CatalogueCard key={item.id} item={item} viewMode={viewMode} />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-[#27273c] space-y-4">
              <div className="w-16 h-16 rounded-full bg-purple-500/10 text-purple-400 mx-auto flex items-center justify-center">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                No matching catalogue entries found
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try loosening your tag exclusions, checking spelling, or asking Nyan-chan in AI Search to recommend related circles!
              </p>
              <button
                onClick={handleClearAllFilters}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-glow"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* Pagination Controls */}
          {data && data.totalPages > 1 && (
            <div className="pt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => updateParams({ page: String(Math.max(1, currentPage - 1)) })}
                disabled={currentPage <= 1}
                className="p-2 rounded-xl border bg-white dark:bg-[#12121b] border-slate-200 dark:border-[#222234] text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:text-purple-400 transition-colors"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1 text-xs">
                {[...Array(data.totalPages)].map((_, i) => {
                  const pNum = i + 1;
                  return (
                    <button
                      key={pNum}
                      onClick={() => updateParams({ page: String(pNum) })}
                      className={`w-8 h-8 rounded-xl font-bold transition-all ${
                        pNum === currentPage
                          ? 'bg-purple-600 text-white shadow-glow'
                          : 'bg-white dark:bg-[#12121b] border border-slate-200 dark:border-[#222234] text-slate-600 dark:text-slate-400 hover:text-white'
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => updateParams({ page: String(Math.min(data.totalPages, currentPage + 1)) })}
                disabled={currentPage >= data.totalPages}
                className="p-2 rounded-xl border bg-white dark:bg-[#12121b] border-slate-200 dark:border-[#222234] text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:text-purple-400 transition-colors"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </section>

      </div>

    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading catalogue...</div>}>
      <BrowseContent />
    </Suspense>
  );
}
