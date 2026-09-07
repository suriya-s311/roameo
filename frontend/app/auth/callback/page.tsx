'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push('/onboarding');
      } else {
        router.push('/auth');
      }
    });
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glass-card p-8 text-center animate-fade-in">
        <div className="w-12 h-12 border-4 border-brand-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-300">Completing authentication...</p>
      </div>
    </div>
  );
}
