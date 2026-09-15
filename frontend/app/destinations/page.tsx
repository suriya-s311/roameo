'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Search, MapPin, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';

const DESTINATION_FALLBACK_IMAGES: Record<string, string> = {
  Mahabalipuram: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800',
  Madurai: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=800',
  Pondicherry: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800',
  Thanjavur: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800',
  Rameswaram: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800',
};

function getDestinationCover(dest: any): string {
  if (dest?.name && DESTINATION_FALLBACK_IMAGES[dest.name]) {
    return DESTINATION_FALLBACK_IMAGES[dest.name];
  }
  return dest?.image_url || 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800';
}

export default function DestinationsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-brand-400 border-t-transparent rounded-full animate-spin" /></div>}>
      <DestinationsContent />
    </Suspense>
  );
}

function DestinationsContent() {
  const [destinations, setDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const searchParams = useSearchParams();

  useEffect(() => {
    const q = searchParams.get('search') || '';
    setSearch(q);
    loadDestinations(q);
  }, [searchParams]);

  const loadDestinations = async (q: string = '') => {
    setLoading(true);
    try {
      const data = await api.getDestinations(q ? `search=${encodeURIComponent(q)}` : '');
      setDestinations(data);
    } catch { setDestinations([]); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen px-4 md:px-8 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold mb-2">Explore <span className="gradient-text">Destinations</span></h1>
          <p className="text-slate-400">Discover incredible places and plan your journey</p>
        </div>

        <div className="glass-card flex items-center px-4 py-3 mb-8 max-w-md">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            className="bg-transparent border-none outline-none text-white placeholder:text-slate-500 flex-1"
            placeholder="Search destinations..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); loadDestinations(e.target.value); }}
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton h-80 rounded-2xl" />)}
          </div>
        ) : destinations.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <MapPin className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400">No destinations found. Try a different search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map((dest, i) => (
              <motion.div key={dest.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Link href={`/destinations/${dest.id}`} className="block glass-card overflow-hidden group cursor-pointer">
                  <div className="h-52 relative overflow-hidden bg-slate-800">
                    <img
                      src={getDestinationCover(dest)}
                      alt={dest.name}
                      onError={(e) => {
                        const fallback = DESTINATION_FALLBACK_IMAGES[dest.name] || 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800';
                        if ((e.target as HTMLImageElement).src !== fallback) {
                          (e.target as HTMLImageElement).src = fallback;
                        }
                      }}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute top-3 right-3 badge-verified"><Star className="w-3 h-3 fill-current" /> Featured</div>
                    <div className="absolute bottom-4 left-4">
                      <p className="text-xs text-brand-300 mb-1">{dest.state}</p>
                      <h3 className="font-display text-2xl font-bold text-white">{dest.name}</h3>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-sm text-slate-400 line-clamp-2 mb-4">{dest.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-brand-400 font-medium">{dest.spot_count || 0} tourist spots</span>
                      <span className="glass-button-outline !py-1.5 !px-3 !text-xs">Explore →</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
