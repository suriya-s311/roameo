'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import toast from 'react-hot-toast';
import { ShieldCheck, Store, ArrowRight, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function SellerRegisterPage() {
  const { user, refreshProfile } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    business_name: '', business_description: '', udyam_number: '',
    shop_name: '', shop_description: '', shop_address: '',
    district: '', state: 'Tamil Nadu', latitude: 0, longitude: 0,
    phone: '', bank_account_name: '', bank_account_number: '', bank_ifsc: '',
  });
  const [udyamResult, setUdyamResult] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChange = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const verifyUdyam = async () => {
    if (!form.udyam_number.trim()) { toast.error('Enter Udyam number'); return; }
    setVerifying(true);
    try {
      const result = await api.verifyUdyam({ udyam_number: form.udyam_number.trim() });
      setUdyamResult(result);
      if (result.found) toast.success('Account Found! ✓ Verified');
      else toast.error('Invalid User');
    } catch (err: any) { toast.error(err.message || 'Verification failed'); }
    setVerifying(false);
  };

  const submitRegistration = async () => {
    if (!form.business_name || !form.shop_name) { toast.error('Business name and shop name are required'); return; }
    setSaving(true);
    try {
      await api.createSeller(form);
      await refreshProfile();
      toast.success('Seller registration complete!');
      router.push('/seller/dashboard');
    } catch (err: any) { toast.error(err.message || 'Registration failed'); }
    setSaving(false);
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center"><div className="glass-card p-8"><p className="text-slate-400">Please sign in first</p></div></div>;

  return (
    <div className="min-h-screen px-4 md:px-8 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-3xl font-bold mb-2">Become a <span className="gradient-text">Seller</span></h1>
        <p className="text-slate-400 mb-8">Register your business and start selling authentic products to travelers</p>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {['Business Details', 'Udyam Verification', 'Shop & Bank', 'Complete'].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${step > i + 1 ? 'bg-brand-500 text-white' : step === i + 1 ? 'bg-brand-500/20 text-brand-400 border border-brand-400' : 'bg-white/5 text-slate-500'}`}>{i + 1}</div>
              <span className="text-xs text-slate-500 hidden sm:inline">{label}</span>
              {i < 3 && <div className="w-4 md:w-8 h-px bg-white/10" />}
            </div>
          ))}
        </div>

        {/* Step 1: Business Details */}
        {step === 1 && (
          <div className="glass-card p-6 space-y-4 animate-fade-in">
            <h2 className="font-semibold text-lg mb-2">Business Details</h2>
            <div><label className="block text-xs text-slate-400 mb-1">Business Name *</label><input className="glass-input" value={form.business_name} onChange={e => handleChange('business_name', e.target.value)} placeholder="Your business name" /></div>
            <div><label className="block text-xs text-slate-400 mb-1">Business Description</label><textarea className="glass-input !h-24 resize-none" value={form.business_description} onChange={e => handleChange('business_description', e.target.value)} placeholder="Tell us about your business..." /></div>
            <div><label className="block text-xs text-slate-400 mb-1">Phone</label><input className="glass-input" value={form.phone} onChange={e => handleChange('phone', e.target.value)} placeholder="Contact number" /></div>
            <button onClick={() => { if (form.business_name) setStep(2); else toast.error('Business name required'); }} className="glass-button !py-3 w-full">Next: Udyam Verification <ArrowRight className="w-4 h-4" /></button>
          </div>
        )}

        {/* Step 2: Udyam Verification */}
        {step === 2 && (
          <div className="glass-card p-6 space-y-4 animate-fade-in">
            <h2 className="font-semibold text-lg mb-2 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-brand-400" /> Udyam Verification</h2>
            <div className="glass !bg-amber-500/5 !border-amber-500/20 p-3 rounded-xl text-xs text-amber-300">
              ⚠️ This is a <strong>prototype/demo</strong> Udyam verification system using seeded database records. Not an official government API.
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Udyam Registration Number</label>
              <input className="glass-input" value={form.udyam_number} onChange={e => handleChange('udyam_number', e.target.value.toUpperCase())} placeholder="e.g. UDYAM-TN-01-0000001" />
            </div>
            <button onClick={verifyUdyam} disabled={verifying} className="glass-button w-full !py-3">
              {verifying ? <><Loader2 className="w-4 h-4 animate-spin" /> Checking Udyam...</> : 'Verify Udyam'}
            </button>

            {/* Result */}
            {udyamResult && (
              <div className={`p-5 rounded-xl ${udyamResult.found ? 'glass !bg-emerald-500/10 !border-emerald-500/20' : 'glass !bg-red-500/10 !border-red-500/20'}`}>
                {udyamResult.found ? (
                  <>
                    <p className="font-semibold text-emerald-400 flex items-center gap-2 mb-3"><CheckCircle className="w-5 h-5" /> Account Found</p>
                    <div className="space-y-1 text-sm">
                      <p className="text-slate-300">Business: <span className="text-white">{udyamResult.business_name}</span></p>
                      <p className="text-slate-300">Owner: <span className="text-white">{udyamResult.owner_name}</span></p>
                      <p className="text-slate-300">District: <span className="text-white">{udyamResult.district}</span></p>
                      <p className="text-slate-300">State: <span className="text-white">{udyamResult.state}</span></p>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-emerald-400 font-medium">
                      <CheckCircle className="w-5 h-5" /> ✓ Verified Shop
                    </div>
                  </>
                ) : (
                  <p className="font-semibold text-red-400 flex items-center gap-2"><XCircle className="w-5 h-5" /> Invalid User</p>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="glass-button-outline !py-3 flex-1">Back</button>
              <button onClick={() => setStep(3)} className="glass-button !py-3 flex-1">Next: Shop Details <ArrowRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}

        {/* Step 3: Shop & Bank */}
        {step === 3 && (
          <div className="glass-card p-6 space-y-4 animate-fade-in">
            <h2 className="font-semibold text-lg mb-2 flex items-center gap-2"><Store className="w-5 h-5 text-brand-400" /> Shop & Bank Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2"><label className="block text-xs text-slate-400 mb-1">Shop Name *</label><input className="glass-input" value={form.shop_name} onChange={e => handleChange('shop_name', e.target.value)} placeholder="Your shop name" /></div>
              <div className="md:col-span-2"><label className="block text-xs text-slate-400 mb-1">Shop Description</label><textarea className="glass-input !h-20 resize-none" value={form.shop_description} onChange={e => handleChange('shop_description', e.target.value)} placeholder="Describe your shop..." /></div>
              <div className="md:col-span-2"><label className="block text-xs text-slate-400 mb-1">Shop Address</label><input className="glass-input" value={form.shop_address} onChange={e => handleChange('shop_address', e.target.value)} /></div>
              <div><label className="block text-xs text-slate-400 mb-1">District</label><input className="glass-input" value={form.district} onChange={e => handleChange('district', e.target.value)} /></div>
              <div><label className="block text-xs text-slate-400 mb-1">State</label><input className="glass-input" value={form.state} onChange={e => handleChange('state', e.target.value)} /></div>
            </div>
            <div className="border-t border-white/10 pt-4 mt-4">
              <p className="text-sm text-slate-400 mb-3">Bank Details (optional for prototype)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-xs text-slate-400 mb-1">Account Holder</label><input className="glass-input" value={form.bank_account_name} onChange={e => handleChange('bank_account_name', e.target.value)} /></div>
                <div><label className="block text-xs text-slate-400 mb-1">IFSC Code</label><input className="glass-input" value={form.bank_ifsc} onChange={e => handleChange('bank_ifsc', e.target.value)} /></div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="glass-button-outline !py-3 flex-1">Back</button>
              <button onClick={submitRegistration} disabled={saving} className="glass-button !py-3 flex-1">
                {saving ? 'Registering...' : 'Complete Registration'} <CheckCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
