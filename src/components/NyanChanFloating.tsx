'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NyanChanMessage, SearchResultItem } from '@/types';
import { Sparkles, MessageCircle, X, Send, BookOpen, ExternalLink, RefreshCw } from 'lucide-react';

export function NyanChanFloating() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<NyanChanMessage[]>([
    {
      id: 'welcome',
      sender: 'nyan_chan',
      text: 'Nya-hello! I\'m **Nyan-chan**, your host at Nyamora! What kind of doujin or romance are you looking for today? Tell me your favorite trope, or what to avoid!',
      timestamp: new Date().toISOString(),
      expression: 'happy',
      suggestedTags: ['wholesome', 'fantasy', 'kemonomimi', 'office romance']
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (messageText: string) => {
    const textToSend = messageText.trim();
    if (!textToSend || loading) return;

    // Add user message
    const userMsg: NyanChanMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend })
      });

      if (res.ok) {
        const assistantReply: NyanChanMessage = await res.json();
        setMessages(prev => [...prev, assistantReply]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            sender: 'nyan_chan',
            text: 'Nya... my connection to the archive library hiccuped for a moment. Could you try asking again? (ฅ^•ﻌ•^ฅ)',
            timestamp: new Date().toISOString(),
            expression: 'thinking'
          }
        ]);
      }
    } catch (err) {
      console.error('Nyan-chan chat failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const getAvatarForExpression = (expr?: string) => {
    if (expr === 'ahegao') return '/avatars/nyan-chan-ahegao.png';
    return '/avatars/nyan-chan.png';
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group p-1.5 rounded-full bg-gradient-to-tr from-purple-700 via-purple-600 to-indigo-600 shadow-glow hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-purple-400"
          title="Chat with Nyan-chan"
        >
          <div className="relative w-12 h-12 rounded-full overflow-hidden">
            <img
              src="/avatars/nyan-chan-host.jpg"
              alt="Nyan-chan"
              className="w-full h-full object-cover"
            />
          </div>
          {/* Notification Ping */}
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-purple-500 border-2 border-black text-[9px] font-bold text-white items-center justify-center">
              ✨
            </span>
          </span>
        </button>
      )}

      {/* Floating Chat Drawer */}
      {isOpen && (
        <div className="w-[90vw] sm:w-[420px] h-[580px] max-h-[85vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden bg-white dark:bg-[#111119] border-slate-200 dark:border-[#26263a] animate-fade-in">
          
          {/* Header */}
          <div className="p-3.5 border-b flex items-center justify-between bg-slate-50 dark:bg-[#151522] border-slate-200 dark:border-[#222234]">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-full overflow-hidden border border-purple-400 shadow-glow">
                <img
                  src="/avatars/nyan-chan-host.jpg"
                  alt="Nyan-chan"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  Nyan-chan
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-400 font-semibold">
                    Host
                  </span>
                </h4>
                <p className="text-[11px] text-emerald-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Grounded Search Concierge
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Link
                href="/ai-search"
                onClick={() => setIsOpen(false)}
                title="Open Fullscreen Workspace"
                className="p-1.5 rounded-lg text-slate-400 hover:text-purple-400 hover:bg-slate-100 dark:hover:bg-[#1e1e2d] transition-colors"
              >
                <Sparkles className="w-4 h-4" />
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1e1e2d] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'nyan_chan' && (
                  <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 border border-purple-400/50 mt-0.5">
                    <img
                      src={getAvatarForExpression(m.expression)}
                      alt="Nyan-chan"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div
                  className={`max-w-[82%] p-3 rounded-2xl leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-purple-600 text-white rounded-br-none shadow-sm'
                      : 'bg-slate-100 dark:bg-[#181826] text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200 dark:border-[#242438]'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>

                  {/* Grounded Recommended Items Cards */}
                  {m.recommendedItems && m.recommendedItems.length > 0 && (
                    <div className="mt-2.5 space-y-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                        Verified Matches:
                      </p>
                      {m.recommendedItems.map(item => (
                        <Link
                          key={item.id}
                          href={`/item/${item.id}`}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-2 p-1.5 rounded-lg bg-white dark:bg-[#111119] border border-slate-200 dark:border-[#27273c] hover:border-purple-500 transition-colors group"
                        >
                          <img
                            src={item.coverImage}
                            alt={item.canonicalTitle}
                            className="w-8 h-10 object-cover rounded flex-shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold truncate text-slate-900 dark:text-slate-100 group-hover:text-purple-400">
                              {item.canonicalTitle}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {item.creatorName} • {item.availabilityMode === 'integrated_licensed' ? 'Licensed' : 'DLsite'}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Suggested Tag Pills */}
                  {m.suggestedTags && m.suggestedTags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
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
              <div className="flex gap-2 items-center text-slate-400 text-xs">
                <div className="w-6 h-6 rounded-full overflow-hidden border border-purple-400 animate-spin">
                  <img src="/avatars/nyan-chan.png" alt="Loading" className="w-full h-full object-cover" />
                </div>
                <span>Nyan-chan is scouring the archive... nya~</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-3 py-1.5 border-t flex gap-1.5 overflow-x-auto text-[11px] bg-slate-50 dark:bg-[#141420] border-slate-200 dark:border-[#202030]">
            <button
              onClick={() => handleSend('Wholesome romance without yandere')}
              className="whitespace-nowrap px-2 py-0.5 rounded bg-slate-200 dark:bg-[#1e1e2c] text-slate-700 dark:text-slate-300 hover:text-purple-400"
            >
              Wholesome no yandere
            </button>
            <button
              onClick={() => handleSend('Kemonomimi catgirl maid')}
              className="whitespace-nowrap px-2 py-0.5 rounded bg-slate-200 dark:bg-[#1e1e2c] text-slate-700 dark:text-slate-300 hover:text-purple-400"
            >
              Kemonomimi maid
            </button>
            <button
              onClick={() => handleSend('Licensed works I can read online')}
              className="whitespace-nowrap px-2 py-0.5 rounded bg-slate-200 dark:bg-[#1e1e2c] text-slate-700 dark:text-slate-300 hover:text-purple-400"
            >
              Licensed readers only
            </button>
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="p-2.5 border-t flex items-center gap-2 bg-white dark:bg-[#111119] border-slate-200 dark:border-[#202030]"
          >
            <input
              type="text"
              placeholder="Ask Nyan-chan (e.g. 'elf romance without drama')..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs rounded-xl border bg-slate-100 dark:bg-[#181826] border-slate-300 dark:border-[#27273c] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 transition-colors shadow-glow"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}

    </div>
  );
}
