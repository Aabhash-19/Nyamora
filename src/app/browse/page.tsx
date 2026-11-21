'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SearchResponse, Tag, Creator } from '@/types';
import { CatalogueCard } from '@/components/CatalogueCard';
import {
  Search, Filter, SlidersHorizontal, LayoutGrid, List, X,
  ChevronLeft, ChevronRight, RotateCcw, ShieldAlert, Sparkles, BookOpen, Globe,
  Plus, Minus, Flame, Tag as TagIcon, Users
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

  // Tag search & category tab
  const [tagCategoryTab, setTagCategoryTab] = useState<'popular' | 'parody' | 'character' | 'exclusions'>('popular');
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [liveSearchResults, setLiveSearchResults] = useState<Tag[]>([]);
  const [isSearchingTags, setIsSearchingTags] = useState(false);

  // Form / Filter states derived from URL or inputs
  const currentQuery = searchParams.get('q') || '';
  const currentSort = searchParams.get('sort') || 'relevance';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentLanguage = searchParams.get('language') || '';
  const currentAvailability = searchParams.get('availability') || '';
  const includeTags = (searchParams.get('include_tags') || '').split(',').filter(Boolean);
  const excludeTags = (searchParams.get('exclude_tags') || '').split(',').filter(Boolean);

  const [inputSearch, setInputSearch] = useState(currentQuery);

  // Load baseline nHentai tags and creators on mount
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

  // Live nHentai tag search when user types in the tag filter box
  useEffect(() => {
    const q = tagSearchQuery.trim();
    if (q.length < 2) {
      setLiveSearchResults([]);
      setIsSearchingTags(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearchingTags(true);
        const res = await fetch(`/api/tags?q=${encodeURIComponent(q)}`);
        if (res.ok) {
          const json = await res.json();
          setLiveSearchResults(json.tags || []);
        }
      } catch (err) {
        console.error('Failed to search tags:', err);
      } finally {
        setIsSearchingTags(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [tagSearchQuery]);

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
  }, [searchParams, currentQuery]);

  // Update URL helper
  const updateParams = useCallback((updates: Record<string, string | null>) => {
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
  }, [searchParams, router]);

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
    setTagSearchQuery('');
    router.push('/browse');
  };

  const formatCount = (num?: number) => {
    if (!num) return '';
    if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
    return String(num);
  };

  const activeFilterChips = [
    ...includeTags.map(id => {
      const tag = allTags.find(t => t.id === id || t.normalizedName === id);
      return { id, label: `+ #${tag?.normalizedName || id}`, type: 'include' };
    }),
    ...excludeTags.map(id => {
      const tag = allTags.find(t => t.id === id || t.normalizedName === id);
      return { id, label: `- #${tag?.normalizedName || id}`, type: 'exclude' };
    }),
    ...(currentLanguage ? [{ id: 'lang', label: `Lang: ${currentLanguage}`, type: 'lang' }] : []),
    ...(currentAvailability ? [{ id: 'avail', label: `Mode: ${currentAvailability}`, type: 'avail' }] : [])
  ];

  // Filtered tags for current category tab
  const getCategoryTags = () => {
    switch (tagCategoryTab) {
      case 'parody':
        return allTags.filter(t => t.category === 'parody');
      case 'character':
        return allTags.filter(t => t.category === 'character');
      case 'exclusions':
        return allTags.filter(t => ['ugly-bastard', 'netorare', 'mind-break', 'cheating', 'guro', 'scat'].includes(t.id));
      case 'popular':
      default:
        return allTags.filter(t => t.category === 'theme' && !['ugly-bastard', 'netorare'].includes(t.id));
    }
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Top Search & Controls Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <input
            type="text"
            placeholder="Search nHentai releases, characters, parodies, or tags..."
            value={inputSearch}
            onChange={(e) => setInputSearch(e.target.value)}
            className="w-full pl-10 pr-28 py-3 text-sm rounded-2xl border transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-[#13131e] border-slate-200 dark:border-[#222234] text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
          <button
            type="submit"
            className="absolute right-2 top-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-glow"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-3 justify-between lg:justify-end">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            className="lg:hidden px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 bg-slate-100 dark:bg-[#161622] border-slate-300 dark:border-[#27273c]"
          >
            <Filter className="w-3.5 h-3.5 text-purple-400" />
            nHentai Filters {activeFilterChips.length > 0 && `(${activeFilterChips.length})`}
          </button>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <select
              value={currentSort}
              onChange={(e) => updateParams({ sort: e.target.value })}
              className="text-xs font-semibold py-2 px-3 rounded-xl border bg-white dark:bg-[#13131e] border-slate-200 dark:border-[#222234] text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="relevance">Sort: Most Relevant</option>
              <option value="popular">Sort: Popular Right Now</option>
              <option value="newest">Sort: New Uploads</option>
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
            <Filter className="w-3.5 h-3.5" /> Active nHentai Filters:
          </span>

          {activeFilterChips.map(chip => (
            <span
              key={chip.id}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-medium shadow-sm transition-all ${
                chip.type === 'exclude'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
              }`}
            >
              <span>{chip.label}</span>
              <button
                onClick={() => {
                  if (chip.type === 'include') toggleIncludeTag(chip.id);
                  else if (chip.type === 'exclude') toggleExcludeTag(chip.id);
                  else if (chip.type === 'lang') updateParams({ language: null });
                  else if (chip.type === 'avail') updateParams({ availability: null });
                }}
                className="hover:text-white rounded-full p-0.5 hover:bg-black/20"
                title="Remove Filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          <button
            onClick={handleClearAllFilters}
            className="ml-auto text-slate-400 hover:text-rose-400 flex items-center gap-1 font-semibold transition-colors px-2 py-1 rounded-lg hover:bg-rose-500/10"
          >
            <RotateCcw className="w-3 h-3" /> Reset Filters
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
              <Filter className="w-4 h-4 text-purple-400" /> nHentai Tag Filters
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

          {/* Language Selector */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" /> Language
            </h4>
            <div className="grid grid-cols-2 gap-1 text-xs">
              {[
                { id: '', label: 'All Languages' },
                { id: 'english', label: 'English' },
                { id: 'japanese', label: 'Japanese' },
                { id: 'chinese', label: 'Chinese' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => updateParams({ language: opt.id || null })}
                  className={`px-2 py-1.5 rounded-lg text-center font-medium transition-colors ${
                    currentLanguage === opt.id
                      ? 'bg-purple-600 text-white font-bold shadow-glow'
                      : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-[#171724] hover:bg-purple-100 dark:hover:bg-purple-950/50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Tag Search / Add Input */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-[#202030]">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <TagIcon className="w-3.5 h-3.5" /> Search Any nHentai Tag
            </h4>
            <div className="relative">
              <input
                type="text"
                placeholder="Type tag (e.g. maid, elf, stockings)..."
                value={tagSearchQuery}
                onChange={(e) => setTagSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-2 text-xs rounded-xl border bg-slate-50 dark:bg-[#161622] border-slate-200 dark:border-[#26263a] text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
              {tagSearchQuery && (
                <button
                  onClick={() => setTagSearchQuery('')}
                  className="absolute right-2 top-2 text-slate-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Live Autocomplete Results */}
            {tagSearchQuery.trim().length >= 2 && (
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-[#141420] border border-slate-200 dark:border-[#242436] space-y-1.5 max-h-48 overflow-y-auto">
                {isSearchingTags ? (
                  <p className="text-[11px] text-slate-400 py-2 text-center animate-pulse">Searching nHentai tags...</p>
                ) : liveSearchResults.length > 0 ? (
                  liveSearchResults.map(tag => {
                    const isInc = includeTags.includes(tag.id) || includeTags.includes(tag.normalizedName);
                    const isExc = excludeTags.includes(tag.id) || excludeTags.includes(tag.normalizedName);
                    return (
                      <div
                        key={tag.id}
                        className={`flex items-center justify-between p-1.5 rounded-lg text-[11px] transition-colors ${
                          isInc
                            ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40'
                            : isExc
                            ? 'bg-rose-600/30 text-rose-200 border border-rose-500/40'
                            : 'bg-white dark:bg-[#191926] text-slate-300'
                        }`}
                      >
                        <span className="font-semibold truncate max-w-[130px]">
                          #{tag.normalizedName}
                          {tag.count && <span className="text-[9px] text-slate-400 ml-1">({formatCount(tag.count)})</span>}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => toggleIncludeTag(tag.id)}
                            className={`p-1 rounded text-[10px] font-bold ${
                              isInc ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-[#222232] hover:bg-purple-600 hover:text-white'
                            }`}
                            title="Include Tag (+)"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => toggleExcludeTag(tag.id)}
                            className={`p-1 rounded text-[10px] font-bold ${
                              isExc ? 'bg-rose-600 text-white' : 'bg-slate-200 dark:bg-[#222232] hover:bg-rose-600 hover:text-white'
                            }`}
                            title="Exclude Tag (-)"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-2 space-y-1">
                    <p className="text-[11px] text-slate-400">No tag found matching "{tagSearchQuery}"</p>
                    <div className="flex items-center justify-center gap-1 pt-1">
                      <button
                        onClick={() => {
                          toggleIncludeTag(tagSearchQuery.trim());
                          setTagSearchQuery('');
                        }}
                        className="text-[10px] px-2 py-0.5 rounded bg-purple-600 text-white font-semibold"
                      >
                        + Include "{tagSearchQuery.trim()}"
                      </button>
                      <button
                        onClick={() => {
                          toggleExcludeTag(tagSearchQuery.trim());
                          setTagSearchQuery('');
                        }}
                        className="text-[10px] px-2 py-0.5 rounded bg-rose-600 text-white font-semibold"
                      >
                        - Exclude
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Categorized Tag Switcher */}
          <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-[#202030]">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Browse Tags by Category
              </h4>
              <span className="text-[10px] text-slate-500">+ Include | - Exclude</span>
            </div>

            {/* Category Tabs */}
            <div className="grid grid-cols-2 gap-1 text-[11px] font-semibold">
              <button
                onClick={() => setTagCategoryTab('popular')}
                className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition-colors ${
                  tagCategoryTab === 'popular'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-100 dark:bg-[#171724] text-slate-400 hover:text-white'
                }`}
              >
                <Flame className="w-3 h-3" /> Popular Tags
              </button>
              <button
                onClick={() => setTagCategoryTab('parody')}
                className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition-colors ${
                  tagCategoryTab === 'parody'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-100 dark:bg-[#171724] text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-3 h-3" /> Parodies
              </button>
              <button
                onClick={() => setTagCategoryTab('character')}
                className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition-colors ${
                  tagCategoryTab === 'character'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-100 dark:bg-[#171724] text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3 h-3" /> Characters
              </button>
              <button
                onClick={() => setTagCategoryTab('exclusions')}
                className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition-colors ${
                  tagCategoryTab === 'exclusions'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-100 dark:bg-[#171724] text-slate-400 hover:text-rose-300'
                }`}
              >
                <ShieldAlert className="w-3 h-3 text-rose-400" /> Exclude Tropes
              </button>
            </div>

            {/* Categorized Tag Pills */}
            <div className="flex flex-wrap gap-1.5 max-h-64 overflow-y-auto p-1 rounded-xl bg-slate-50 dark:bg-[#0e0e15] border border-slate-200 dark:border-[#1d1d2b]">
              {getCategoryTags().map(tag => {
                const isInc = includeTags.includes(tag.id) || includeTags.includes(tag.normalizedName);
                const isExc = excludeTags.includes(tag.id) || excludeTags.includes(tag.normalizedName);

                return (
                  <div
                    key={tag.id}
                    className={`group inline-flex items-center gap-1 text-[11px] pl-2 pr-1 py-0.5 rounded-lg border transition-all ${
                      isInc
                        ? 'bg-purple-600 text-white border-purple-500 shadow-glow'
                        : isExc
                        ? 'bg-rose-600 text-white border-rose-500'
                        : 'bg-white dark:bg-[#161622] text-slate-300 border-slate-200 dark:border-[#26263a] hover:border-purple-500/50'
                    }`}
                  >
                    <button
                      onClick={() => toggleIncludeTag(tag.id)}
                      className="font-semibold hover:underline flex items-center gap-1"
                      title={isInc ? 'Remove from included' : 'Click to Include (+)'}
                    >
                      <span>#{tag.normalizedName}</span>
                      {tag.count && (
                        <span className={`text-[9px] ${isInc || isExc ? 'text-white/80' : 'text-slate-500'}`}>
                          {formatCount(tag.count)}
                        </span>
                      )}
                    </button>

                    <div className="flex items-center ml-0.5">
                      <button
                        onClick={() => toggleExcludeTag(tag.id)}
                        className={`p-0.5 rounded text-[9px] font-bold ${
                          isExc
                            ? 'text-white hover:bg-black/30'
                            : 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/20'
                        }`}
                        title="Click to Exclude (-)"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
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
              Showing <strong className="text-slate-900 dark:text-white">{data?.items.length || 0}</strong> of <strong className="text-slate-900 dark:text-white">{data?.total || 0}</strong> verified nHentai releases
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
                No matching nHentai doujinshi found
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try loosening your tag exclusions, checking tag spelling, or using different keyword terms.
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

              <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#161622] text-slate-300">
                Page {currentPage} of {data.totalPages}
              </span>

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
    <Suspense fallback={
      <div className="py-24 text-center space-y-4">
        <div className="w-10 h-10 rounded-full border-4 border-purple-500 border-t-transparent animate-spin mx-auto" />
        <p className="text-sm text-slate-400">Loading nHentai catalogue browse...</p>
      </div>
    }>
      <BrowseContent />
    </Suspense>
  );
}
