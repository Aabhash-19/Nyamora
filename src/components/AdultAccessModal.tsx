'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle, ExternalLink } from 'lucide-react';

export function AdultAccessModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const verified = localStorage.getItem('nyamora_age_confirmed');
    if (!verified) {
      setIsOpen(true);
    }
  }, []);

  const handleConfirm = () => {
    localStorage.setItem('nyamora_age_confirmed', 'true');
    setIsOpen(false);
  };

  const handleExit = () => {
    window.location.href = 'https://www.google.com';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md p-6 rounded-2xl border shadow-2xl bg-white dark:bg-[#12121a] border-slate-200 dark:border-[#262638] text-slate-900 dark:text-slate-100">
        
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Age-Access Verification</h3>
            <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold uppercase tracking-wider">
              Nyamora Archive • 18+ Only
            </p>
          </div>
        </div>

        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            Welcome to <strong>Nyamora</strong> (ニャモラ). This platform indexes adult-oriented doujinshi metadata and licensed creative works intended exclusively for mature audiences.
          </p>
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-[#1a1a26] text-xs space-y-1.5 border border-slate-200 dark:border-[#222234]">
            <p className="font-semibold text-slate-900 dark:text-slate-200">Strict Safety & Legal Policy:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-500 dark:text-slate-400">
              <li>Zero tolerance for sexual content involving minors or ambiguous age.</li>
              <li>Outbound references link directly to third-party destinations.</li>
              <li>Your preference data remains strictly local and private by default.</li>
            </ul>
          </div>
          <p className="text-xs text-slate-500">
            By proceeding, you attest under applicable local law that you are at least 18 years of age (or age of legal majority in your jurisdiction).
          </p>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleConfirm}
            className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 active:scale-[0.98] transition-all shadow-glow flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            I am 18+ • Enter
          </button>
          <button
            onClick={handleExit}
            className="py-2.5 px-4 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#181824] transition-colors"
          >
            Exit Site
          </button>
        </div>

      </div>
    </div>
  );
}
