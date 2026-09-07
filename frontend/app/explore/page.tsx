'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import dynamic from 'next/dynamic';
import { MapPin, Navigation, ShieldCheck, Store, Compass } from 'lucide-react';

const MapContainer = dynamic(() => import('@/components/MapView'), { ssr: false, loading: () => <div className="skeleton h-96 rounded-2xl" /> });

export default function ExplorePage() {
  const [shops, setShops] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setUserLocation(loc);
          api.getNearbyShops(loc[0], loc[1], 25).then(setShops).catch(() => {}).finally(() => setLoading(false));
        },
        () => {
          // Default to Chennai if denied
          setUserLocation([13.0827, 80.2707]);
          api.getShops().then(setShops).catch(() => {}).finally(() => setLoading(false));
        },
      );
    } else {
      setUserLocation([13.0827, 80.2707]);
      api.getShops().then(setShops).catch(() => {}).finally(() => setLoading(false));
    }
  }, []);

  return (
    <div className="min-h-screen px-4 md:px-8 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold flex items-center gap-3">
            <Compass className="w-8 h-8 text-brand-400" /> Explore <span className="gradient-text">Nearby</span>
          </h1>
          <p className="text-slate-400 mt-1">Discover verified shops and authentic products near you</p>
        </div>

        {/* Map */}
        {userLocation && (
          <div className="glass-card overflow-hidden mb-8" style={{ height: 450 }}>
            <MapContainer center={userLocation} shops={shops} zoom={11} />
          </div>
        )}

        {/* Shop List */}
        <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2"><Store className="w-5 h-5 text-brand-400" /> Nearby Shops</h2>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="skeleton h-40 rounded-2xl" />)}</div>
        ) : shops.length === 0 ? (
          <div className="glass-card p-8 text-center"><p className="text-slate-400">No shops found nearby</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shops.map(shop => (
              <Link key={shop.id} href={`/shop/${shop.id}`} className="glass-card p-5 group cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-white group-hover:text-brand-400 transition-colors">{shop.name}</h3>
                  {shop.verification_status === 'verified' && <span className="badge-verified !text-[10px] !py-0.5"><ShieldCheck className="w-3 h-3" /> Verified</span>}
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 mb-3">{shop.description}</p>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {shop.district}, {shop.state}</span>
                  {shop.distance_km && <span className="flex items-center gap-1"><Navigation className="w-3 h-3" /> {shop.distance_km} km</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
