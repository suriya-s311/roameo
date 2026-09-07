'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import dynamic from 'next/dynamic';
import { ShieldCheck, MapPin, Package } from 'lucide-react';

const MapContainer = dynamic(() => import('@/components/MapView'), { ssr: false, loading: () => <div className="skeleton h-64 rounded-2xl" /> });

export default function ShopPage() {
  const { id } = useParams();
  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getShop(id as string).catch(() => null),
      api.getProducts(`shop_id=${id}`).catch(() => []),
    ]).then(([s, p]) => { setShop(s); setProducts(p); setLoading(false); });
  }, [id]);

  if (loading) return <div className="min-h-screen p-8 max-w-5xl mx-auto"><div className="skeleton h-48 rounded-2xl mb-4" /><div className="skeleton h-64 rounded-2xl" /></div>;
  if (!shop) return <div className="min-h-screen flex items-center justify-center"><div className="glass-card p-8"><p className="text-slate-400">Shop not found</p></div></div>;

  return (
    <div className="min-h-screen px-4 md:px-8 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Shop Header */}
        <div className="glass-strong p-8 rounded-3xl mb-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold mb-2">{shop.name}</h1>
              {shop.verification_status === 'verified' && <span className="badge-verified mb-3 inline-flex"><ShieldCheck className="w-4 h-4" /> Verified Shop</span>}
              <p className="text-slate-400 mt-2 max-w-xl">{shop.description}</p>
              <div className="flex gap-4 mt-3 text-sm text-slate-500">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {shop.address || `${shop.district}, ${shop.state}`}</span>
                <span className="flex items-center gap-1"><Package className="w-4 h-4" /> {shop.product_count || products.length} products</span>
              </div>
            </div>
          </div>
        </div>

        {/* Map */}
        {shop.latitude && shop.longitude && (
          <div className="glass-card overflow-hidden mb-8" style={{ height: 300 }}>
            <MapContainer center={[shop.latitude, shop.longitude]} shops={[shop]} zoom={15} />
          </div>
        )}

        {/* Products */}
        <h2 className="font-display text-2xl font-bold mb-6">Products</h2>
        {products.length === 0 ? (
          <div className="glass-card p-8 text-center"><p className="text-slate-400">No products yet</p></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(p => (
              <Link key={p.id} href={`/products/${p.id}`} className="glass-card overflow-hidden group cursor-pointer">
                <div className="h-40 overflow-hidden"><img src={p.image_url || 'https://images.unsplash.com/photo-1567591370504-ce57d91f9905?w=300'} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /></div>
                <div className="p-3">
                  <h4 className="text-sm font-medium text-white line-clamp-1">{p.name}</h4>
                  <p className="text-brand-400 font-bold mt-1">₹{p.price?.toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
