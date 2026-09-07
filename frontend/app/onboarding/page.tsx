'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { Compass, Store, ArrowRight } from 'lucide-react';

export default function OnboardingPage() {
  const { user, refreshProfile } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState<'traveler' | 'seller'>('traveler');
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) { toast.error('Please enter your name'); return; }
    setSaving(true);
    try {
      await api.createProfile({
        full_name: name.trim(),
        role,
        avatar_url: user?.user_metadata?.avatar_url || '',
      });
      await refreshProfile();
      toast.success('Profile created!');
      if (role === 'seller') router.push('/seller/register');
      else router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create profile');
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-strong p-10 rounded-3xl max-w-lg w-full animate-scale-in">
        <h1 className="font-display text-2xl font-bold mb-2 text-center">Set Up Your Profile</h1>
        <p className="text-slate-400 text-center mb-8">Tell us about yourself to get started</p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm text-slate-300 mb-2">Your Name</label>
            <input
              className="glass-input"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-3">I am a...</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setRole('traveler')}
                className={`glass-card p-5 text-center cursor-pointer transition-all ${role === 'traveler' ? 'border-brand-400 bg-brand-400/10' : ''}`}
              >
                <Compass className={`w-8 h-8 mx-auto mb-2 ${role === 'traveler' ? 'text-brand-400' : 'text-slate-400'}`} />
                <p className="font-semibold">Traveler</p>
                <p className="text-xs text-slate-400 mt-1">Explore & discover</p>
              </button>
              <button
                onClick={() => setRole('seller')}
                className={`glass-card p-5 text-center cursor-pointer transition-all ${role === 'seller' ? 'border-brand-400 bg-brand-400/10' : ''}`}
              >
                <Store className={`w-8 h-8 mx-auto mb-2 ${role === 'seller' ? 'text-brand-400' : 'text-slate-400'}`} />
                <p className="font-semibold">Seller</p>
                <p className="text-xs text-slate-400 mt-1">Sell authentic products</p>
              </button>
            </div>
          </div>

          <button onClick={handleSubmit} disabled={saving} className="glass-button w-full !py-3.5">
            {saving ? 'Setting up...' : 'Get Started'} <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
