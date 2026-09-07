'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ShieldCheck, MapPin, ShoppingCart, Zap, Package, Store, Minus, Plus } from 'lucide-react';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    api.getProduct(id as string).then(setProduct).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const addToCart = async () => {
    if (!user) { toast.error('Please sign in'); router.push('/auth'); return; }
    setAdding(true);
    try {
      await api.addToCart({ product_id: id, quantity: qty });
      toast.success('Added to cart!');
    } catch (err: any) { toast.error(err.message || 'Failed to add'); }
    setAdding(false);
  };

  if (loading) return <div className="min-h-screen p-8 max-w-5xl mx-auto"><div className="skeleton h-96 rounded-2xl" /></div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center"><div className="glass-card p-8 text-center"><p className="text-slate-400">Product not found</p></div></div>;

  return (
    <div className="min-h-screen px-4 md:px-8 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image */}
          <div className="glass-card overflow-hidden rounded-3xl">
            <img src={product.image_url || 'https://images.unsplash.com/photo-1567591370504-ce57d91f9905?w=600'} alt={product.name} className="w-full h-80 md:h-[450px] object-cover" />
          </div>

          {/* Details */}
          <div>
            {product.verified && <span className="badge-verified mb-3 inline-flex"><ShieldCheck className="w-3.5 h-3.5" /> Verified Seller</span>}
            <h1 className="font-display text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-3xl font-bold gradient-text mb-4">₹{product.price?.toLocaleString()}</p>

            <p className="text-slate-400 leading-relaxed mb-6">{product.description}</p>

            <div className="space-y-3 mb-6">
              {product.seller_name && (
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Store className="w-4 h-4 text-brand-400" /> <span>Seller: <Link href={`/shop/${product.shop_id}`} className="text-brand-400 hover:underline">{product.seller_name}</Link></span>
                </div>
              )}
              {product.location && (
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <MapPin className="w-4 h-4 text-brand-400" /> {product.location}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Package className="w-4 h-4 text-brand-400" /> {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </div>
              {product.category && (
                <span className="glass rounded-full px-3 py-1 text-xs text-brand-300 inline-block">{product.category}</span>
              )}
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm text-slate-400">Quantity:</span>
              <div className="flex items-center gap-3">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="glass-button-outline !p-2 !rounded-lg"><Minus className="w-4 h-4" /></button>
                <span className="text-xl font-bold w-8 text-center">{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock || 10, qty + 1))} className="glass-button-outline !p-2 !rounded-lg"><Plus className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-6">
              <button onClick={addToCart} disabled={adding || product.stock <= 0} className="glass-button flex-1 !py-3.5">
                <ShoppingCart className="w-5 h-5" /> {adding ? 'Adding...' : 'Add to Cart'}
              </button>
              <button onClick={() => { addToCart().then(() => router.push('/cart')); }} disabled={product.stock <= 0} className="glass-button-outline flex-1 !py-3.5">
                <Zap className="w-5 h-5" /> Buy Now
              </button>
            </div>

            {/* Fulfillment info */}
            <div className="glass-card p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-300"><span className="text-brand-400">🛍</span> Carry With Me — Take it with you</div>
              <div className="flex items-center gap-2 text-sm text-slate-300"><span className="text-brand-400">📦</span> Ship to Home — Seller ships via postal service</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
