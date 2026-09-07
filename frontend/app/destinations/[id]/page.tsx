'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import dynamic from 'next/dynamic';
import { MapPin, Clock, IndianRupee, ArrowRight, Compass, ShieldCheck, Store, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const MapContainer = dynamic(() => import('@/components/MapView'), { ssr: false, loading: () => <div className="skeleton h-80 rounded-2xl" /> });

export default function DestinationDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [destination, setDestination] = useState<any>(null);
  const [spots, setSpots] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.getDestination(id as string).catch(() => null),
      api.getTouristSpots(`destination_id=${id}`).catch(() => []),
      api.getShops().catch(() => []),
      api.getProducts(`location=${encodeURIComponent('')}`).catch(() => []),
    ]).then(([dest, sp, sh, pr]) => {
      setDestination(dest);
      setSpots(sp);
      setShops(sh);
      setProducts(pr);
      setLoading(false);
    });
  }, [id]);

  if (loading) return (
    <div className="min-h-screen px-4 py-8 max-w-6xl mx-auto">
      <div className="skeleton h-72 rounded-3xl mb-6" />
      <div className="skeleton h-8 w-64 rounded-lg mb-4" />
      <div className="skeleton h-20 rounded-lg" />
    </div>
  );

  if (!destination) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glass-card p-12 text-center">
        <p className="text-slate-400">Destination not found.</p>
        <Link href="/destinations" className="glass-button mt-4 inline-flex">Back to Destinations</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <img src={destination.image_url || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200'} alt={destination.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-black/40 to-transparent" />
        <div className="absolute bottom-8 left-4 md:left-8">
          <p className="text-brand-300 text-sm mb-2">{destination.state}</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-3">{destination.name}</h1>
          <div className="flex gap-4 text-sm text-slate-300">
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-brand-400" /> {destination.district}</span>
            <span className="flex items-center gap-1"><Star className="w-4 h-4 text-amber-400" /> {spots.length} spots</span>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-8 max-w-6xl mx-auto">
        {/* Overview + Build Journey */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <div className="lg:col-span-2">
            <div className="glass-card p-6 mb-6">
              <h2 className="font-display text-xl font-semibold mb-3">About {destination.name}</h2>
              <p className="text-slate-400 leading-relaxed">{destination.description}</p>
              {destination.highlights?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {destination.highlights.map((h: string) => (
                    <span key={h} className="glass rounded-full px-3 py-1 text-xs text-brand-300">{h}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="glass-card p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
                <Compass className="w-5 h-5 text-brand-400" /> Build My Journey
              </h3>
              <p className="text-sm text-slate-400 mb-4">Create a personalized trip plan with budget tracking and smart recommendations.</p>
            </div>
            <button
              onClick={() => user ? router.push(`/journey/builder?destination=${id}`) : toast.error('Please sign in to build a journey')}
              className="glass-button w-full"
            >
              Start Planning <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tourist Spots */}
        <div className="mb-12">
          <h2 className="font-display text-2xl font-bold mb-6">Popular Places</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {spots.map((spot, i) => (
              <motion.div key={spot.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="glass-card overflow-hidden group">
                <div className="h-36 relative overflow-hidden">
                  <img src={spot.image_url || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400'} alt={spot.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute top-2 right-2 glass rounded-full px-2 py-0.5 text-xs text-brand-300">{spot.category}</span>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-white mb-1">{spot.name}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-3">{spot.description}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {spot.estimated_visit_duration || 60} min</span>
                    <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3" /> {spot.estimated_entry_cost > 0 ? `₹${spot.estimated_entry_cost}` : 'Free'}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Map */}
        {destination.latitude && (
          <div className="mb-12">
            <h2 className="font-display text-2xl font-bold mb-6">Map</h2>
            <div className="glass-card overflow-hidden" style={{ height: 400 }}>
              <MapContainer center={[destination.latitude, destination.longitude]} spots={spots} shops={shops} />
            </div>
          </div>
        )}

        {/* Nearby Shops */}
        <div className="mb-12">
          <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
            <Store className="w-6 h-6 text-brand-400" /> Nearby Shops
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shops.slice(0, 6).map((shop) => (
              <Link key={shop.id} href={`/shop/${shop.id}`} className="glass-card p-5 group cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-white group-hover:text-brand-400 transition-colors">{shop.name}</h4>
                  {shop.verification_status === 'verified' && (
                    <span className="badge-verified !text-[11px] !py-0.5"><ShieldCheck className="w-3 h-3" /> Verified</span>
                  )}
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 mb-3">{shop.description}</p>
                <p className="text-xs text-slate-500">{shop.district}, {shop.state}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Products */}
        <div>
          <h2 className="font-display text-2xl font-bold mb-6">Products from This Destination</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.slice(0, 8).map((p) => (
              <Link key={p.id} href={`/products/${p.id}`} className="glass-card overflow-hidden group cursor-pointer">
                <div className="h-36 overflow-hidden">
                  <img src={p.image_url || 'https://images.unsplash.com/photo-1567591370504-ce57d91f9905?w=300'} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="p-3">
                  <h4 className="text-sm font-medium text-white line-clamp-1">{p.name}</h4>
                  <p className="text-brand-400 font-semibold text-sm mt-1">₹{p.price?.toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
