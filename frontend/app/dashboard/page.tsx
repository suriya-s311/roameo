'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import { Compass, Package, MapPin, ShoppingCart, Bell, Route, ArrowRight, CheckCircle2, Clock } from 'lucide-react';

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push('/auth'); return; }
    Promise.all([
      api.getTravelPlans().catch(() => []),
      api.getOrders().catch(() => []),
      api.getNotifications().catch(() => []),
    ]).then(([p, o, n]) => { setPlans(p); setOrders(o); setNotifications(n); setLoading(false); });
  }, [user]);

  if (!user) return null;

  const activePlan = plans.find(p => p.status === 'active');

  return (
    <div className="min-h-screen px-4 md:px-8 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold">Welcome back, <span className="gradient-text">{profile?.full_name || 'Traveler'}</span></h1>
          <p className="text-slate-400 mt-1">Your travel dashboard</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Route, label: 'My Trips', value: plans.length, color: 'from-brand-400 to-brand-600', href: '/journey/builder' },
            { icon: Package, label: 'Orders', value: orders.length, color: 'from-ocean-400 to-ocean-600', href: '/orders' },
            { icon: ShoppingCart, label: 'Cart', value: '—', color: 'from-amber-400 to-orange-500', href: '/cart' },
            { icon: Bell, label: 'Notifications', value: notifications.filter(n => !n.read).length, color: 'from-purple-400 to-purple-600', href: '#notifs' },
          ].map(stat => (
            <Link key={stat.label} href={stat.href} className="glass-card p-5 group cursor-pointer">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-slate-400">{stat.label}</p>
            </Link>
          ))}
        </div>

        {/* Current Journey */}
        {activePlan && (
          <div className="glass-strong p-6 rounded-3xl mb-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-brand-400 mb-1 flex items-center gap-1"><Compass className="w-4 h-4" /> Current Journey</p>
                <h2 className="font-display text-xl font-bold">{activePlan.start_location} → {activePlan.destination_name}</h2>
                <p className="text-sm text-slate-400 mt-1">{activePlan.number_of_days} Days • {activePlan.status}</p>
              </div>
              <Link href={`/journey/${activePlan.id}`} className="glass-button !py-2.5">
                Continue <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Trips */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">My Trips</h3>
              <Link href="/journey/builder" className="text-xs text-brand-400 hover:underline">+ New Trip</Link>
            </div>
            {plans.length === 0 ? (
              <div className="text-center py-6">
                <Compass className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No trips yet</p>
                <Link href="/journey/builder" className="glass-button !text-xs !py-2 !px-4 mt-3 inline-flex">Plan a Journey</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {plans.slice(0, 5).map(plan => (
                  <Link key={plan.id} href={`/journey/${plan.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${plan.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-500'}`}>
                      {plan.status === 'active' ? <CheckCircle2 className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{plan.destination_name || 'Journey'}</p>
                      <p className="text-xs text-slate-500">{plan.number_of_days} days • {plan.status}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Recent Orders</h3>
              <Link href="/orders" className="text-xs text-brand-400 hover:underline">View All</Link>
            </div>
            {orders.length === 0 ? (
              <div className="text-center py-6">
                <Package className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 5).map(order => (
                  <Link key={order.id} href={`/orders/${order.id}`} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                    <div>
                      <p className="text-sm text-white">₹{order.total?.toLocaleString()}</p>
                      <p className="text-xs text-slate-500">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${order.status === 'delivered' ? 'text-emerald-400 bg-emerald-400/10' : 'text-amber-400 bg-amber-400/10'}`}>
                      {order.status?.replace('_', ' ').toUpperCase()}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="glass-card p-6 lg:col-span-2" id="notifs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2"><Bell className="w-4 h-4 text-brand-400" /> Notifications</h3>
              {notifications.length > 0 && (
                <button onClick={() => api.markAllNotificationsRead().then(() => setNotifications(n => n.map(x => ({...x, read: true}))))} className="text-xs text-brand-400 hover:underline">Mark all read</button>
              )}
            </div>
            {notifications.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No notifications</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {notifications.map(n => (
                  <div key={n.id} className={`flex items-start gap-3 p-3 rounded-xl ${n.read ? 'opacity-60' : 'bg-white/[0.02]'}`}>
                    <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${n.read ? 'bg-slate-600' : 'bg-brand-400'}`} />
                    <div>
                      <p className="text-sm font-medium text-white">{n.title}</p>
                      <p className="text-xs text-slate-400">{n.message}</p>
                      <p className="text-[10px] text-slate-600 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/destinations" className="glass-button-outline !py-2.5 !px-5 !text-sm"><MapPin className="w-4 h-4" /> Explore Destinations</Link>
          <Link href="/products" className="glass-button-outline !py-2.5 !px-5 !text-sm"><Package className="w-4 h-4" /> Browse Products</Link>
          <Link href="/journey/builder" className="glass-button !py-2.5 !px-5 !text-sm"><Compass className="w-4 h-4" /> Plan a Journey</Link>
        </div>
      </div>
    </div>
  );
}
