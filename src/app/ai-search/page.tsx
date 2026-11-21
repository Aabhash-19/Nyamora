'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { NyanChanMessage, StructuredSearchQuery, SearchResponse, SearchResultItem } from '@/types';
import { CatalogueCard } from '@/components/CatalogueCard';
import { NyanMessageText } from '@/components/NyanMessageText';
import {
  Sparkles, Send, ShieldAlert, Filter, SlidersHorizontal,
  RotateCcw, ArrowRight, BookOpen, ExternalLink, Bot, User, Check
} from 'lucide-react';

export default function AISearchPage() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<NyanChanMessage[]>([
    {
      id: 'ai-init',
      sender: 'nyan_chan',
      text: `*perches gracefully on the velvet parlour counter, tail giving a slow, teasing swish as my feline ears perk right up at you*

Nya~ Well, well, look what just walked into my private lounge... ♡ Did you honestly think you could sneak past me unnoticed, darling? (˶ᵔ ᵕ ᵔ˶)✨

*giggles mischievously, leaning in close until you can feel a warm, teasing whisper against your cheek*

I'm **Nyan-chan**—your delightfully wicked hostess, catalogue concierge, and sworn keeper of every guilty pleasure you would never dare admit in daylight. Whether you're secretly craving a blush-inducing, slow-burn ***pure wholesome romance*** where everyone holds hands and cries happy tears, or you're hunting down spicy, high-tension ***netorare*** drama *(strictly without that unsightly ugly bastard ruined mood, of course~ fufufu)*... I have the entire live **nHentai archive** purring at my fingertips.

Tell me what you're secretly starving for tonight, sweetheart. Whisper your favorite artist, guilty tropes, or what you want me to lock tightly in the dungeon (e.g. *"wholesome kemonomimi maid in English"* or *"Asanagi FGO without drama"*). 

Don't be shy with me... your deepest desires are 100% safe in my lap~ nya~ ♡ (ฅ^•ﻌ•^ฅ)`,
      timestamp: new Date().toISOString(),
      expression: 'wink',
      suggestedTags: ['wholesome', 'netorare', 'catgirl', 'maid', 'gyaru', 'milf', 'fantasy']
    }
  ]);

  const [currentStructuredQuery, setCurrentStructuredQuery] = useState<Partial<StructuredSearchQuery> | null>(null);
  const [currentResults, setCurrentResults] = useState<SearchResultItem[]>([]);
  const [totalFound, setTotalFound] = useState<number>(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text: string) => {
    const queryText = text.trim();
    if (!queryText || loading) return;

    const userMsg: NyanChanMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: queryText
        })
      });

      if (res.ok) {
        const assistantReply: NyanChanMessage = await res.json();
        setMessages(prev => [...prev, assistantReply]);

        if (assistantReply.allResults && assistantReply.allResults.length > 0) {
          setCurrentResults(assistantReply.allResults);
          setTotalFound(assistantReply.totalFound || assistantReply.allResults.length);
        } else if (assistantReply.recommendedItems && assistantReply.recommendedItems.length > 0) {
          setCurrentResults(assistantReply.recommendedItems);
          setTotalFound(assistantReply.recommendedItems.length);
        }

        if (assistantReply.structuredQuery) {
          setCurrentStructuredQuery(assistantReply.structuredQuery);
          // Only fetch separately if allResults was not provided by assistant
          if (!assistantReply.allResults || assistantReply.allResults.length === 0) {
            const searchRes = await fetch('/api/search', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(assistantReply.structuredQuery)
            });
            if (searchRes.ok) {
              const searchData: SearchResponse = await searchRes.json();
              setCurrentResults(searchData.items || []);
              setTotalFound(searchData.total || 0);
            }
          }
        }
      }
    } catch (err) {
      console.error('AI chat failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const getAvatarForExpression = (expr?: string) => {
    if (expr === 'ahegao') return '/avatars/nyan-chan-ahegao.png';
    if (expr === 'wink' || expr === 'happy') return '/avatars/nyan-chan-host.jpg';
    return '/avatars/nyan-chan.png';
  };

  return (
    <div className="space-y-8 pb-20">
      
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl border bg-gradient-to-r from-purple-950/40 via-[#13131e] to-[#0c0c14] border-purple-900/40 shadow-glow">
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-purple-400 shadow-glow flex-shrink-0">
            <img
              src="/avatars/nyan-chan-host.jpg"
              alt="Nyan-chan"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white font-display">
                Nyan-chan AI Search Workspace
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40">
                Groq AI LLaMA 3.3 70B
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-bold border border-pink-500/40">
                Seductive Concierge ♡
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Natural-language query parser + nHentai API v2 taxonomy & grounded vector semantic retrieval.
            </p>
          </div>
        </div>

        <Link
          href="/browse"
          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 border border-slate-700 hover:text-white hover:border-purple-500 transition-colors"
        >
          Standard Browse Mode
        </Link>
      </div>

      {/* Main Workspace Layout (Conversation on Left, Live Parsed Query & Results on Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Conversational Guide Drawer */}
        <div className="lg:col-span-5 flex flex-col h-[700px] rounded-3xl border overflow-hidden bg-white dark:bg-[#111119] border-slate-200 dark:border-[#212132] shadow-xl">
          
          <div className="p-4 border-b flex items-center justify-between bg-slate-50 dark:bg-[#151522] border-slate-200 dark:border-[#202030]">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-purple-400" />
              <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                Dialogue with Nyan-chan
              </span>
            </div>
            <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Ready
            </span>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'nyan_chan' && (
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-purple-400 shadow-glow mt-0.5">
                    <img
                      src={getAvatarForExpression(m.expression)}
                      alt="Nyan-chan"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-purple-600 text-white rounded-br-none shadow-sm'
                      : 'bg-slate-100 dark:bg-[#181826] text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200 dark:border-[#242436]'
                  }`}
                >
                  <NyanMessageText text={m.text} isUser={m.sender === 'user'} />

                  {/* Clarification prompt */}
                  {m.clarificationQuestion && (
                    <div className="mt-2.5 p-2 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      💡 {m.clarificationQuestion}
                    </div>
                  )}

                  {/* Suggestion pills */}
                  {m.suggestedTags && m.suggestedTags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {m.suggestedTags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => handleSend(`Show me ${tag} works`)}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800/60 hover:bg-purple-200 dark:hover:bg-purple-900 transition-colors"
                        >
                          +{tag}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 items-center text-slate-400 text-xs py-2">
                <div className="w-6 h-6 rounded-full overflow-hidden border border-purple-400 animate-spin">
                  <img src="/avatars/nyan-chan.png" alt="Loading" className="w-full h-full object-cover" />
                </div>
                <span>Nyan-chan is grounding results with real catalogue records... nya~</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Pre-Sets */}
          <div className="px-3 py-2 border-t flex gap-1.5 overflow-x-auto text-[11px] bg-slate-50 dark:bg-[#141420] border-slate-200 dark:border-[#202030]">
            <button
              onClick={() => handleSend('Wholesome romance without yandere')}
              className="whitespace-nowrap px-2 py-1 rounded-lg bg-slate-200 dark:bg-[#1c1c2a] text-slate-700 dark:text-slate-300 hover:text-purple-400"
            >
              Wholesome no yandere
            </button>
            <button
              onClick={() => handleSend('Kemonomimi catgirl maid')}
              className="whitespace-nowrap px-2 py-1 rounded-lg bg-slate-200 dark:bg-[#1c1c2a] text-slate-700 dark:text-slate-300 hover:text-purple-400"
            >
              Kemonomimi maid
            </button>
            <button
              onClick={() => handleSend('Asanagi fate grand order in English')}
              className="whitespace-nowrap px-2 py-1 rounded-lg bg-slate-200 dark:bg-[#1c1c2a] text-slate-700 dark:text-slate-300 hover:text-purple-400"
            >
              Asanagi FGO in English
            </button>
            <button
              onClick={() => handleSend('Gyaru dark skin stockings')}
              className="whitespace-nowrap px-2 py-1 rounded-lg bg-slate-200 dark:bg-[#1c1c2a] text-slate-700 dark:text-slate-300 hover:text-purple-400"
            >
              Gyaru stockings
            </button>
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="p-3 border-t flex items-center gap-2 bg-white dark:bg-[#111119] border-slate-200 dark:border-[#202030]"
          >
            <input
              type="text"
              placeholder="Tell Nyan-chan what you want (and what to avoid)..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-3.5 py-2 text-xs rounded-xl border bg-slate-100 dark:bg-[#181826] border-slate-300 dark:border-[#27273c] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 transition-colors shadow-glow"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

        {/* Right Column: Structured Query Breakdown & Live Results */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Structured Query Breakdown Card */}
          <div className="p-5 rounded-3xl border bg-white dark:bg-[#111119] border-slate-200 dark:border-[#212132] space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1e1e2c]">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-purple-400" />
                Live Structured Query Parser
              </h3>
              <span className="text-[10px] text-purple-400 font-mono">
                Schema: StructuredSearchQuery v1.1
              </span>
            </div>

            {currentStructuredQuery ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-[#161622] font-mono text-[11px] text-slate-700 dark:text-purple-300 overflow-x-auto">
                  <pre>{JSON.stringify(currentStructuredQuery, null, 2)}</pre>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#171724]">
                    <span className="text-slate-400 block text-[10px]">Include Tags:</span>
                    <strong className="text-purple-400">{currentStructuredQuery.include_tags?.length || 0}</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#171724]">
                    <span className="text-slate-400 block text-[10px]">Strict Exclude:</span>
                    <strong className="text-rose-400">{currentStructuredQuery.exclude_tags?.length || 0}</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#171724]">
                    <span className="text-slate-400 block text-[10px]">Language:</span>
                    <strong className="text-slate-200">{currentStructuredQuery.language || 'Any'}</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#171724]">
                    <span className="text-slate-400 block text-[10px]">Sort Signal:</span>
                    <strong className="text-slate-200">{currentStructuredQuery.sort || 'Relevance'}</strong>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic py-2">
                Ask Nyan-chan a question or search for a concept on the left to see the live structured AST and vector search breakdown here.
              </p>
            )}
          </div>

          {/* Results Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Grounded Candidate Matches ({totalFound})
              </h3>
              {currentResults.length > 0 && (
                <span className="text-xs text-purple-400 font-semibold">
                  Zero hallucinations • Verified DB records
                </span>
              )}
            </div>

            {currentResults.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {currentResults.map(item => (
                  <CatalogueCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-[#222234] text-xs text-slate-500">
                No items currently loaded. Type a prompt above or select one of the suggested tags to begin conversational discovery!
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
