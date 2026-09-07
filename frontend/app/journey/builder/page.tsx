'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { MapPin, Calendar, IndianRupee, Heart, Plus, Minus, Clock, ArrowRight, Sparkles, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const MapContainer = dynamic(() => import('@/components/MapView'), { ssr: false, loading: () => <div className="skeleton h-64 rounded-2xl" /> });

const INTERESTS = ['History', 'Culture', 'Shopping', 'Food', 'Beach', 'Nature', 'Adventure', 'Religious'];

export default function JourneyBuilderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-brand-400 border-t-transparent rounded-full animate-spin" /></div>}>
      <JourneyBuilderContent />
    </Suspense>
  );
}

function JourneyBuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const destId = searchParams.get('destination') || '';

  const [destination, setDestination] = useState<any>(null);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [startLocation, setStartLocation] = useState('Chennai');
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState(5000);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['History', 'Culture']);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [selectedSpots, setSelectedSpots] = useState<any[]>([]);
  const [budgetData, setBudgetData] = useState<any>(null);
  const [planId, setPlanId] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getDestinations().then(setDestinations).catch(() => {});
    if (destId) api.getDestination(destId).then(setDestination).catch(() => {});
  }, [destId]);

  const toggleInterest = (i: string) => {
    setSelectedInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  };

  const createPlanAndGetRecs = async () => {
    if (!destination) { toast.error('Please select a destination'); return; }
    if (!user) { toast.error('Please sign in first'); return; }
    setLoading(true);
    try {
      const plan = await api.createTravelPlan({
        destination_id: destination.id,
        start_location: startLocation,
        number_of_days: days,
        budget_limit: budget,
        interests: selectedInterests,
      });
      setPlanId(plan.id);
      const recs = await api.getPlanRecommendations(plan.id);
      setRecommendations(recs);
      setSelectedSpots(recs.recommended_spots?.slice(0, days * 2) || []);
      setStep(2);
    } catch (err: any) { toast.error(err.message || 'Failed to create plan'); }
    setLoading(false);
  };

  const addSpotToPlan = async (spot: any) => {
    if (selectedSpots.find(s => s.id === spot.id)) return;
    setSelectedSpots(prev => [...prev, spot]);
  };

  const removeSpot = (spotId: string) => {
    setSelectedSpots(prev => prev.filter(s => s.id !== spotId));
  };

  const finalizePlan = async () => {
    if (!planId || selectedSpots.length === 0) { toast.error('Add at least one spot'); return; }
    setLoading(true);
    try {
      // Add all spots to plan
      const spotsPerDay = Math.ceil(selectedSpots.length / days);
      for (let i = 0; i < selectedSpots.length; i++) {
        const dayNum = Math.min(Math.floor(i / spotsPerDay) + 1, days);
        const order = (i % spotsPerDay) + 1;
        await api.addSpotToPlan(planId, {
          tourist_spot_id: selectedSpots[i].id,
          day_number: dayNum,
          visit_order: order,
        });
      }
      // Set plan to active
      await api.updateTravelPlan(planId, { status: 'active' });
      // Get budget
      const b = await api.getPlanBudget(planId);
      setBudgetData(b);
      setStep(3);
      toast.success('Journey plan created!');
    } catch (err: any) { toast.error(err.message || 'Failed to finalize plan'); }
    setLoading(false);
  };

  // Build route coords
  const routeCoords: [number, number][] = selectedSpots
    .filter(s => s.latitude && s.longitude)
    .map(s => [s.latitude, s.longitude]);

  return (
    <div className="min-h-screen px-4 md:px-8 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
          Build My <span className="gradient-text">Journey</span>
        </h1>
        <p className="text-slate-400 mb-8">Plan your perfect trip with smart recommendations</p>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-8">
          {['Plan', 'Select Spots', 'Summary'].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${step > i + 1 ? 'bg-brand-500 text-white' : step === i + 1 ? 'bg-brand-500/20 text-brand-400 border border-brand-400' : 'bg-white/5 text-slate-500'}`}>
                {i + 1}
              </div>
              <span className={`text-sm hidden sm:inline ${step === i + 1 ? 'text-brand-400' : 'text-slate-500'}`}>{label}</span>
              {i < 2 && <div className="w-8 md:w-16 h-px bg-white/10" />}
            </div>
          ))}
        </div>

        {/* Step 1: Plan Details */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="glass-card p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Where are you going?</label>
                  <select
                    className="glass-input"
                    value={destination?.id || ''}
                    onChange={(e) => {
                      const d = destinations.find(x => x.id === e.target.value);
                      setDestination(d);
                    }}
                  >
                    <option value="">Select destination</option>
                    {destinations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Starting from</label>
                  <input className="glass-input" value={startLocation} onChange={e => setStartLocation(e.target.value)} placeholder="e.g. Chennai" />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-2 flex items-center gap-2"><Calendar className="w-4 h-4" /> Number of Days</label>
                  <div className="flex items-center gap-4">
                    <button onClick={() => setDays(Math.max(1, days - 1))} className="glass-button-outline !p-2 !rounded-lg"><Minus className="w-4 h-4" /></button>
                    <span className="text-2xl font-bold text-white w-12 text-center">{days}</span>
                    <button onClick={() => setDays(Math.min(30, days + 1))} className="glass-button-outline !p-2 !rounded-lg"><Plus className="w-4 h-4" /></button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-2 flex items-center gap-2"><IndianRupee className="w-4 h-4" /> Budget (₹)</label>
                  <input className="glass-input" type="number" value={budget} onChange={e => setBudget(Number(e.target.value))} min={500} step={500} />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm text-slate-300 mb-3 flex items-center gap-2"><Heart className="w-4 h-4" /> Interests</label>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map(i => (
                    <button key={i} onClick={() => toggleInterest(i)} className={`px-4 py-2 rounded-full text-sm transition-all cursor-pointer ${selectedInterests.includes(i) ? 'bg-brand-500/20 text-brand-400 border border-brand-400/50' : 'glass text-slate-400 hover:text-slate-200'}`}>
                      {i}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={createPlanAndGetRecs} disabled={loading || !destination} className="glass-button w-full md:w-auto !py-3.5 !px-8">
              {loading ? 'Planning your journey...' : 'Get Recommendations'} <Sparkles className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {/* Step 2: Select Spots */}
        {step === 2 && recommendations && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="glass-card p-6">
              <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-400" /> Recommended Places
              </h2>
              <p className="text-sm text-slate-400 mb-4">Select the spots you want to visit. We recommend {days * 2} spots for {days} days.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {recommendations.recommended_spots?.map((spot: any) => {
                  const isSelected = selectedSpots.find(s => s.id === spot.id);
                  return (
                    <div key={spot.id} className={`glass-card !rounded-xl p-4 flex items-center gap-4 cursor-pointer transition-all ${isSelected ? 'border-brand-400 bg-brand-400/5' : ''}`} onClick={() => isSelected ? removeSpot(spot.id) : addSpotToPlan(spot)}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-brand-500 text-white' : 'bg-white/5 text-slate-400'}`}>
                        {isSelected ? '✓' : <Plus className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white text-sm">{spot.name}</h4>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {spot.estimated_visit_duration || 60}m</span>
                          <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3" /> {spot.estimated_entry_cost > 0 ? `₹${spot.estimated_entry_cost}` : 'Free'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Route Map */}
            {routeCoords.length > 0 && destination?.latitude && (
              <div className="glass-card overflow-hidden" style={{ height: 350 }}>
                <MapContainer center={[destination.latitude, destination.longitude]} spots={selectedSpots} shops={recommendations.nearby_shops || []} route={routeCoords} />
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="glass-button-outline !py-3 !px-6">Back</button>
              <button onClick={finalizePlan} disabled={loading || selectedSpots.length === 0} className="glass-button !py-3 !px-8 flex-1 md:flex-none">
                {loading ? 'Finalizing...' : `Create Journey (${selectedSpots.length} spots)`} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Summary */}
        {step === 3 && budgetData && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Journey Summary Card */}
            <div className="glass-strong p-8 rounded-3xl text-center">
              <h2 className="font-display text-2xl font-bold mb-2">My {destination?.name} Journey</h2>
              <div className="flex justify-center gap-8 mt-4 text-center">
                <div><p className="text-3xl font-bold gradient-text">{days}</p><p className="text-xs text-slate-400">Days</p></div>
                <div><p className="text-3xl font-bold gradient-text">{selectedSpots.length}</p><p className="text-xs text-slate-400">Places</p></div>
                <div><p className="text-3xl font-bold gradient-text">₹{budgetData.estimated_total?.toLocaleString()}</p><p className="text-xs text-slate-400">Est. Budget</p></div>
              </div>
            </div>

            {/* Budget Breakdown */}
            <div className="glass-card p-6">
              <h3 className="font-display text-lg font-semibold mb-4">Budget Breakdown</h3>
              <div className="space-y-3">
                {[
                  { label: 'Entry Fees', value: budgetData.entry_fees },
                  { label: 'Transportation', value: budgetData.transportation },
                  { label: 'Food', value: budgetData.food },
                  { label: 'Shopping', value: budgetData.shopping },
                  { label: 'Other', value: budgetData.other },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">{item.label}</span>
                    <span className="text-sm font-medium text-white">₹{item.value?.toLocaleString()}</span>
                  </div>
                ))}
                <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                  <span className="font-semibold">Estimated Total</span>
                  <span className="font-bold text-lg text-brand-400">₹{budgetData.estimated_total?.toLocaleString()}</span>
                </div>
                {budgetData.remaining !== null && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Remaining</span>
                    <span className={`text-sm font-medium ${budgetData.over_budget ? 'text-red-400' : 'text-emerald-400'}`}>
                      {budgetData.over_budget ? `-₹${budgetData.over_budget_amount?.toLocaleString()}` : `₹${budgetData.remaining?.toLocaleString()}`}
                    </span>
                  </div>
                )}
              </div>

              {budgetData.over_budget && (
                <div className="mt-4 glass !bg-red-500/10 !border-red-500/20 p-4 rounded-xl">
                  <p className="text-sm text-red-400 flex items-center gap-2 mb-2"><AlertTriangle className="w-4 h-4" /> Your plan is ₹{budgetData.over_budget_amount?.toLocaleString()} over budget</p>
                  {budgetData.suggestions?.map((s: string, i: number) => (
                    <p key={i} className="text-xs text-slate-400 ml-6">• {s}</p>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => router.push(`/journey/${planId}`)} className="glass-button !py-3 !px-8">
                View Journey <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => router.push('/dashboard')} className="glass-button-outline !py-3 !px-6">Go to Dashboard</button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
