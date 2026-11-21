'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Grid, Sparkles, MessageSquareText, Bookmark } from 'lucide-react';

export function MobileBottomNav() {
  const pathname = usePathname();

  // Hide mobile bottom nav inside full reader view for maximum immersion
  if (pathname.startsWith('/reader/')) {
    return null;
  }

  const navItems = [
    {
      label: 'Discover',
      href: '/',
      icon: Compass,
      active: pathname === '/'
    },
    {
      label: 'Browse',
      href: '/browse',
      icon: Grid,
      active: pathname.startsWith('/browse')
    },
    {
      label: 'AI Search',
      href: '/ai-search',
      icon: Sparkles,
      active: pathname === '/ai-search',
      highlight: true
    },
    {
      label: 'Community',
      href: '/community',
      icon: MessageSquareText,
      active: pathname === '/community'
    },
    {
      label: 'Library',
      href: '/library',
      icon: Bookmark,
      active: pathname === '/library'
    }
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0d0d16]/95 dark:bg-[#090910]/95 backdrop-blur-xl border-t border-purple-900/30 px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.5)] transition-all"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 8px), 8px)' }}
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.active;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all relative ${
                isActive
                  ? 'text-purple-400 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    item.highlight && isActive ? 'text-purple-400 animate-pulse' : ''
                  }`}
                />
                {item.highlight && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-purple-500 shadow-glow" />
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-6 h-0.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
