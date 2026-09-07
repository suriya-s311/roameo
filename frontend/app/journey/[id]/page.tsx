'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { MapPin, Clock, IndianRupee, CheckCircle2, Circle, SkipForward, ArrowRight, Store } from 'lucide-react';

const MapContainer = dynamic(() => import('@/components/MapView'), { ssr: false, loading: () => <div className="skeleton h-64 rounded-2xl" /> });

export default function JourneyDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [plan, setPlan] = useState<any>(null);
  const [spots, setSpots] = useState<any[]>([]);
  const [budget, setBudget] = useState<any>(null);
  const [nearbyShops, setNearbyShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [p, s, b] = await Promise.all([
        api.getTravelPlan(id as string),
        api.getPlanSpots(id as string),
        api.getPlanBudget(id as string),
      ]);
      setPlan(p);
      setSpots(s);
      setBudget(b);

      // Load nearby shops if destination has coords
      if (p.destination_id) {
        const dest = await api.getDestination(p.destination_id).catch(() => null);
        if (dest?.latitude) {
          const shops = await api.getNearbyShops(dest.latitude, dest.longitude, 10).catch(() => []);
          setNearbyShops(shops);
        }
      }
    } catch { toast.error('Failed to load journey'); }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [id]);

  const updateSpotStatus = async (spotId: string, status: string) => {
    try {
      await api.updatePlanSpot(id as string, spotId, { status });
      toast.success(status === 'visited' ? 'Spot completed! ✓' : 'Spot skipped');
      loadData();
    } catch { toast.error('Failed to update'); }
  };

  if (loading) return <div className="min-h-screen p-8"><div className="skeleton h-48 rounded-2xl mb-4 max-w-4xl mx-auto" /><div className="skeleton h-96 rounded-2xl max-w-4xl mx-auto" /></div>;

  const visited = spots.filter(s => s.status === 'visited').length;
  const total = spots.length;
  const progress = total > 0 ? (visited / total) * 100 : 0;

  // Group by day
  const dayGroups: Record<number, any[]> = {};
  spots.forEach(s => {
    if (!dayGroups[s.day_number]) dayGroups[s.day_number] = [];
    dayGroups[s.day_number].push(s);
  });

  const routeCoords: [number, number][] = spots.filter(s => s.latitude && s.longitude).map(s => [s.latitude, s.longitude]);

  return (
    <div className="min-h-screen px-4 md:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Summary Header */}
        <div className="glass-strong p-6 rounded-3xl mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-brand-400 mb-1">Current Journey</p>
              <h1 className="font-display text-2xl font-bold">{plan?.start_location} → {plan?.destination_name}</h1>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${plan?.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}`}>
              {plan?.status?.toUpperCase()}
            </span>
          </div>

          {/* Progress bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>{visited} / {total} Places</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="flex gap-6 text-sm text-slate-400">
            <span>{plan?.number_of_days} Days</span>
            {budget && <span>₹{budget.estimated_total?.toLocaleString()} Budget</span>}
          </div>
        </div>

        {/* Day-wise Itinerary */}
        <div className="space-y-6 mb-8">
          {Object.entries(dayGroups).sort(([a], [b]) => Number(a) - Number(b)).map(([day, daySpots]) => (
            <div key={day} className="glass-card p-5">
              <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-sm font-bold">D{day}</span>
                Day {day}
              </h3>
              <div className="space-y-3">
                {daySpots.sort((a: any, b: any) => a.visit_order - b.visit_order).map((spot: any) => (
                  <div key={spot.id} className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${spot.status === 'visited' ? 'bg-emerald-500/5' : spot.status === 'skipped' ? 'bg-slate-500/5 opacity-60' : 'hover:bg-white/5'}`}>
                    <div className="shrink-0">
                      {spot.status === 'visited' ? <CheckCircle2 className="w-6 h-6 text-emerald-400" /> : spot.status === 'skipped' ? <SkipForward className="w-6 h-6 text-slate-500" /> : <Circle className="w-6 h-6 text-slate-500" />}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-medium text-sm ${spot.status === 'visited' ? 'text-emerald-300 line-through' : 'text-white'}`}>{spot.spot_name}</h4>
                      <div className="flex gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {spot.estimated_duration || 60}m</span>
                        <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3" /> ₹{spot.estimated_cost || 0}</span>
                      </div>
                    </div>
                    {spot.status === 'planned' && (
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => updateSpotStatus(spot.id, 'visited')} className="glass-button !py-1.5 !px-3 !text-xs !rounded-lg">Visited ✓</button>
                        <button onClick={() => updateSpotStatus(spot.id, 'skipped')} className="glass-button-outline !py-1.5 !px-3 !text-xs !rounded-lg">Skip</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Nearby Shops */}
        {nearbyShops.length > 0 && (
          <div className="mb-8">
            <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2"><Store className="w-5 h-5 text-brand-400" /> Explore Nearby Shops</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {nearbyShops.slice(0, 4).map(shop => (
                <Link key={shop.id} href={`/shop/${shop.id}`} className="glass-card p-4 group cursor-pointer">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-sm text-white group-hover:text-brand-400 transition-colors">{shop.name}</h4>
                    {shop.verification_status === 'verified' && <span className="badge-verified !text-[10px] !py-0">✓ Verified</span>}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{shop.distance_km ? `${shop.distance_km} km away` : shop.district}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Budget Card */}
        {budget && (
          <div className="glass-card p-6 mb-8">
            <h3 className="font-display text-lg font-semibold mb-3">Budget Tracker</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div><p className="text-2xl font-bold text-white">₹{budget.per_day?.toLocaleString()}</p><p className="text-xs text-slate-400">Per Day</p></div>
              <div><p className="text-2xl font-bold text-brand-400">₹{budget.estimated_total?.toLocaleString()}</p><p className="text-xs text-slate-400">Total</p></div>
              <div><p className="text-2xl font-bold text-white">₹{budget.budget_limit?.toLocaleString() || '—'}</p><p className="text-xs text-slate-400">Limit</p></div>
              <div><p className={`text-2xl font-bold ${budget.over_budget ? 'text-red-400' : 'text-emerald-400'}`}>₹{Math.abs(budget.remaining || 0).toLocaleString()}</p><p className="text-xs text-slate-400">{budget.over_budget ? 'Over' : 'Remaining'}</p></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
