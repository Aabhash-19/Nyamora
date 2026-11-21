'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('nyamora_open_auth', { detail: { mode: 'register' } }));
    router.replace('/');
  }, [router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center text-slate-400 text-sm">
      Opening Nyamora registration...
    </div>
  );
}
