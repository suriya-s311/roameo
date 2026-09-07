'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import { Package, ShoppingBag, Truck, Plus, CheckCircle2, Clock, TrendingUp, Store, ShieldCheck } from 'lucide-react';

export default function SellerDashboardPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [seller, setSeller] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push('/auth'); return; }
    Promise.all([
      api.getMySellerProfile().catch(() => null),
      api.getProducts().catch(() => []),
      api.getOrders('role=seller').catch(() => []),
    ]).then(([s, p, o]) => {
      if (!s) { router.push('/seller/register'); return; }
      setSeller(s);
      setProducts(p.filter((prod: any) => prod.seller_id === s.id));
      setOrders(o);
      setLoading(false);
    });
  }, [user]);

  const updateOrderStatus = async (orderId: string, status: string, extra?: any) => {
    try {
      await api.updateOrderStatus(orderId, { status, ...extra });
      const updated = await api.getOrders('role=seller');
      setOrders(updated);
      toast_success(`Order ${status.replace('_', ' ')}`);
    } catch {}
  };

  if (loading) return <div className="min-h-screen p-8 max-w-6xl mx-auto"><div className="skeleton h-48 rounded-2xl mb-4" /><div className="grid grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="skeleton h-32 rounded-2xl" />)}</div></div>;

  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const shippedOrders = orders.filter(o => ['shipped', 'in_transit'].includes(o.status)).length;
  const completedOrders = orders.filter(o => o.status === 'delivered').length;

  return (
    <div className="min-h-screen px-4 md:px-8 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold">Seller <span className="gradient-text">Dashboard</span></h1>
            <p className="text-slate-400 mt-1 flex items-center gap-2">
              <Store className="w-4 h-4" /> {seller?.shop_name}
              {seller?.udyam_verified && <span className="badge-verified !text-[10px]"><ShieldCheck className="w-3 h-3" /> Verified</span>}
            </p>
          </div>
          <Link href="/seller/products/add" className="glass-button">
            <Plus className="w-5 h-5" /> Add Product
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Package, label: 'Total Products', value: products.length, color: 'from-brand-400 to-brand-600' },
            { icon: ShoppingBag, label: 'Pending Orders', value: pendingOrders, color: 'from-amber-400 to-orange-500' },
            { icon: Truck, label: 'Shipped', value: shippedOrders, color: 'from-cyan-400 to-blue-500' },
            { icon: CheckCircle2, label: 'Completed', value: completedOrders, color: 'from-emerald-400 to-emerald-600' },
          ].map(stat => (
            <div key={stat.label} className="glass-card p-5">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Products */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2"><TrendingUp className="w-4 h-4 text-brand-400" /> My Products</h3>
              <Link href="/seller/products/add" className="text-xs text-brand-400 hover:underline">+ Add New</Link>
            </div>
            {products.length === 0 ? (
              <div className="text-center py-6">
                <Package className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No products yet</p>
                <Link href="/seller/products/add" className="glass-button !text-xs !py-2 !px-4 mt-3 inline-flex">Add Your First Product</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {products.slice(0, 6).map(p => (
                  <div key={p.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors">
                    <img src={p.image_url || 'https://images.unsplash.com/photo-1567591370504-ce57d91f9905?w=60'} alt={p.name} className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{p.name}</p>
                      <p className="text-xs text-slate-500">₹{p.price} • Stock: {p.stock}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <div className="glass-card p-6">
            <h3 className="font-semibold mb-4">Orders</h3>
            {orders.length === 0 ? (
              <div className="text-center py-6"><p className="text-sm text-slate-500">No orders yet</p></div>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 6).map(order => (
                  <div key={order.id} className="glass-card !rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-500">#{order.id?.slice(0, 8)}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${order.status === 'pending' ? 'text-amber-400 bg-amber-400/10' : order.status === 'delivered' ? 'text-emerald-400 bg-emerald-400/10' : 'text-blue-400 bg-blue-400/10'}`}>
                        {order.status?.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-white font-medium">₹{order.total?.toLocaleString()}</p>
                    <p className="text-xs text-slate-500">{order.fulfillment_type === 'carry_with_me' ? '🛍 Carry' : '📦 Ship'} • {new Date(order.created_at).toLocaleDateString()}</p>

                    {/* Quick actions */}
                    <div className="flex gap-2 mt-3">
                      {order.status === 'pending' && <button onClick={() => updateOrderStatus(order.id, 'confirmed')} className="glass-button !py-1.5 !px-3 !text-xs !rounded-lg">Confirm</button>}
                      {order.status === 'confirmed' && <button onClick={() => updateOrderStatus(order.id, 'packed')} className="glass-button !py-1.5 !px-3 !text-xs !rounded-lg">Mark Packed</button>}
                      {order.status === 'packed' && (
                        <button onClick={() => {
                          const tracking = prompt('Enter postal tracking number:');
                          if (tracking) updateOrderStatus(order.id, 'shipped', { tracking_number: tracking });
                        }} className="glass-button !py-1.5 !px-3 !text-xs !rounded-lg">Ship & Track</button>
                      )}
                      {order.status === 'shipped' && <button onClick={() => updateOrderStatus(order.id, 'in_transit')} className="glass-button-outline !py-1.5 !px-3 !text-xs !rounded-lg">In Transit</button>}
                      {order.status === 'in_transit' && <button onClick={() => updateOrderStatus(order.id, 'delivered')} className="glass-button !py-1.5 !px-3 !text-xs !rounded-lg">Delivered</button>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function toast_success(msg: string) {
  // Simple inline toast helper
  if (typeof window !== 'undefined') {
    import('react-hot-toast').then(m => m.default.success(msg));
  }
}
