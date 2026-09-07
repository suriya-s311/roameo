'use client';

import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Compass } from 'lucide-react';

export default function AuthPage() {
  const { user, signInWithGoogle, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.push('/dashboard');
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="absolute top-20 -left-40 w-96 h-96 bg-brand-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-20 -right-40 w-96 h-96 bg-ocean-500/10 rounded-full blur-[120px]" />

      <div className="glass-strong p-10 rounded-3xl max-w-md w-full animate-scale-in text-center relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-brand-500/20">
          <Compass className="w-8 h-8 text-white" />
        </div>
        <h1 className="font-display text-3xl font-bold mb-2 gradient-text">Welcome to ROAMEO</h1>
        <p className="text-slate-400 mb-8">Explore Local. Buy Authentic. Experience the Originals.</p>

        <button
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-3 glass-card !rounded-xl px-6 py-3.5 hover:bg-white/10 transition-colors group cursor-pointer"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span className="font-medium text-white">Continue with Google</span>
        </button>

        <p className="text-xs text-slate-500 mt-6">By continuing, you agree to ROAMEO&apos;s terms of service.</p>
      </div>
    </div>
  );
}
