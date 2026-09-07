'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import { Package, CheckCircle2, Truck, Circle, Clock } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-amber-400 bg-amber-400/10',
  confirmed: 'text-blue-400 bg-blue-400/10',
  packed: 'text-indigo-400 bg-indigo-400/10',
  shipped: 'text-cyan-400 bg-cyan-400/10',
  in_transit: 'text-teal-400 bg-teal-400/10',
  delivered: 'text-emerald-400 bg-emerald-400/10',
  cancelled: 'text-red-400 bg-red-400/10',
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) api.getOrders().then(setOrders).catch(() => []).finally(() => setLoading(false));
    else setLoading(false);
  }, [user]);

  if (!user) return <div className="min-h-screen flex items-center justify-center"><div className="glass-card p-8"><p className="text-slate-400">Please sign in to view orders</p></div></div>;

  return (
    <div className="min-h-screen px-4 md:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-display text-3xl font-bold mb-6 flex items-center gap-3"><Package className="w-7 h-7 text-brand-400" /> My Orders</h1>
        {loading ? (
          <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="skeleton h-32 rounded-2xl" />)}</div>
        ) : orders.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No orders yet. Start shopping!</p>
            <Link href="/products" className="glass-button inline-flex mt-4">Browse Products</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <Link key={order.id} href={`/orders/${order.id}`} className="block glass-card p-5 group cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-xs text-slate-500">Order #{order.id?.slice(0, 8)}</span>
                    <p className="font-semibold text-white group-hover:text-brand-400 transition-colors">₹{order.total?.toLocaleString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] || 'text-slate-400 bg-slate-400/10'}`}>
                    {order.status?.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(order.created_at).toLocaleDateString()}</span>
                  <span>{order.fulfillment_type === 'carry_with_me' ? '🛍 Carry' : '📦 Ship'}</span>
                  {order.items?.length > 0 && <span>{order.items.length} items</span>}
                </div>
                {/* Order Timeline */}
                <div className="flex items-center gap-1 mt-4">
                  {['pending','confirmed','packed','shipped','in_transit','delivered'].map((s, i, arr) => {
                    const reached = arr.indexOf(order.status) >= i;
                    return (
                      <div key={s} className="flex items-center gap-1 flex-1">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${reached ? 'bg-brand-500 text-white' : 'bg-white/5 text-slate-600'}`}>
                          {reached ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                        </div>
                        {i < arr.length - 1 && <div className={`flex-1 h-0.5 ${reached ? 'bg-brand-500' : 'bg-white/5'}`} />}
                      </div>
                    );
                  })}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
