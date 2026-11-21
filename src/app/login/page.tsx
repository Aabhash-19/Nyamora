'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('nyamora_open_auth', { detail: { mode: 'login' } }));
    router.replace('/');
  }, [router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center text-slate-400 text-sm">
      Opening Nyamora login...
    </div>
  );
}
