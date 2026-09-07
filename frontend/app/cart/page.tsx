'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import toast from 'react-hot-toast';
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [cart, setCart] = useState<any>({ items: [], total: 0, count: 0 });
  const [loading, setLoading] = useState(true);

  const loadCart = async () => {
    try { const c = await api.getCart(); setCart(c); } catch { setCart({ items: [], total: 0, count: 0 }); }
    setLoading(false);
  };

  useEffect(() => { if (user) loadCart(); else setLoading(false); }, [user]);

  const updateQty = async (itemId: string, qty: number) => {
    try {
      if (qty <= 0) { await api.removeFromCart(itemId); toast.success('Removed'); }
      else { await api.updateCartItem(itemId, { quantity: qty }); }
      loadCart();
    } catch { toast.error('Failed to update'); }
  };

  const removeItem = async (itemId: string) => {
    try { await api.removeFromCart(itemId); toast.success('Removed from cart'); loadCart(); } catch { toast.error('Failed'); }
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glass-card p-12 text-center">
        <ShoppingCart className="w-12 h-12 text-slate-500 mx-auto mb-4" />
        <p className="text-slate-400 mb-4">Sign in to view your cart</p>
        <Link href="/auth" className="glass-button inline-flex">Sign In</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen px-4 md:px-8 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-3xl font-bold mb-6 flex items-center gap-3">
          <ShoppingCart className="w-7 h-7 text-brand-400" /> My Cart
        </h1>

        {loading ? (
          <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>
        ) : cart.items.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <ShoppingCart className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-xl text-slate-400 mb-2">Your cart is empty</p>
            <p className="text-sm text-slate-500 mb-6">Discover authentic products from local artisans</p>
            <Link href="/products" className="glass-button inline-flex">Browse Products</Link>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              {cart.items.map((item: any) => (
                <div key={item.id} className="glass-card p-4 flex items-center gap-4">
                  <img src={item.product_image || 'https://images.unsplash.com/photo-1567591370504-ce57d91f9905?w=100'} alt={item.product_name} className="w-20 h-20 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item.product_id}`} className="font-medium text-white hover:text-brand-400 transition-colors line-clamp-1">{item.product_name}</Link>
                    <p className="text-xs text-slate-500">{item.seller_name}</p>
                    <p className="text-brand-400 font-semibold mt-1">₹{item.product_price?.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => updateQty(item.id, item.quantity - 1)} className="glass-button-outline !p-1.5 !rounded-lg"><Minus className="w-3 h-3" /></button>
                    <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, item.quantity + 1)} className="glass-button-outline !p-1.5 !rounded-lg"><Plus className="w-3 h-3" /></button>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-white">₹{item.subtotal?.toLocaleString()}</p>
                    <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-300 mt-1"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="glass-strong p-6 rounded-2xl">
              <div className="flex justify-between items-center mb-4">
                <span className="text-slate-400">Subtotal ({cart.count} items)</span>
                <span className="text-2xl font-bold gradient-text">₹{cart.total?.toLocaleString()}</span>
              </div>
              <button onClick={() => router.push('/checkout')} className="glass-button w-full !py-3.5">
                Proceed to Checkout <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
