'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { CheckCircle2, Circle, Package, Truck, MapPin, Clock } from 'lucide-react';

const STEPS = ['pending', 'confirmed', 'packed', 'shipped', 'in_transit', 'delivered'];
const STEP_LABELS: Record<string, string> = {
  pending: 'Order Placed', confirmed: 'Confirmed', packed: 'Packed',
  shipped: 'Shipped', in_transit: 'In Transit', delivered: 'Delivered',
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getOrder(id as string).then(setOrder).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen p-8 max-w-3xl mx-auto"><div className="skeleton h-96 rounded-2xl" /></div>;
  if (!order) return <div className="min-h-screen flex items-center justify-center"><div className="glass-card p-8"><p className="text-slate-400">Order not found</p></div></div>;

  const currentStep = STEPS.indexOf(order.status);

  return (
    <div className="min-h-screen px-4 md:px-8 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-3xl font-bold mb-2">Order Details</h1>
        <p className="text-sm text-slate-500 mb-8">#{order.id?.slice(0, 8)} • {new Date(order.created_at).toLocaleDateString()}</p>

        {/* Timeline */}
        <div className="glass-strong p-8 rounded-3xl mb-8">
          <h2 className="font-semibold mb-6">Order Status</h2>
          <div className="space-y-0">
            {STEPS.map((step, i) => {
              const reached = currentStep >= i;
              const isCurrent = currentStep === i;
              return (
                <div key={step} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${reached ? 'bg-brand-500 text-white' : 'bg-white/5 text-slate-600'} ${isCurrent ? 'ring-4 ring-brand-400/20' : ''}`}>
                      {reached ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                    </div>
                    {i < STEPS.length - 1 && <div className={`w-0.5 h-12 ${reached ? 'bg-brand-500' : 'bg-white/5'}`} />}
                  </div>
                  <div className="pb-8">
                    <p className={`font-medium ${reached ? 'text-white' : 'text-slate-500'}`}>{STEP_LABELS[step]}</p>
                    {step === 'shipped' && order.tracking_number && (
                      <p className="text-xs text-brand-400 mt-1">Tracking: {order.tracking_number}</p>
                    )}
                    {step === 'shipped' && order.shipping_date && (
                      <p className="text-xs text-slate-500 mt-0.5">Shipped: {order.shipping_date}</p>
                    )}
                    {step === 'delivered' && order.expected_delivery_date && (
                      <p className="text-xs text-slate-500">Expected: {order.expected_delivery_date}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {order.status === 'cancelled' && (
            <div className="mt-4 glass !bg-red-500/10 !border-red-500/20 p-4 rounded-xl text-red-400 text-sm">Order was cancelled</div>
          )}
        </div>

        {/* Items */}
        <div className="glass-card p-6 mb-6">
          <h3 className="font-semibold mb-4">Items</h3>
          <div className="space-y-3">
            {order.items?.map((item: any) => (
              <div key={item.id} className="flex items-center gap-4">
                <img src={item.product_image || 'https://images.unsplash.com/photo-1567591370504-ce57d91f9905?w=80'} alt={item.product_name} className="w-14 h-14 rounded-xl object-cover" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{item.product_name}</p>
                  <p className="text-xs text-slate-500">Qty: {item.quantity} × ₹{item.price?.toLocaleString()}</p>
                </div>
                <p className="font-semibold text-white">₹{item.subtotal?.toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 mt-4 pt-4 flex justify-between">
            <span className="font-semibold">Total</span>
            <span className="text-xl font-bold gradient-text">₹{order.total?.toLocaleString()}</span>
          </div>
        </div>

        {/* Fulfillment & Address */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-card p-5">
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2"><Truck className="w-4 h-4 text-brand-400" /> Fulfillment</h4>
            <p className="text-sm text-slate-400">{order.fulfillment_type === 'carry_with_me' ? '🛍 Carry With Me' : '📦 Ship to Home'}</p>
            {order.tracking_number && <p className="text-xs text-brand-400 mt-2">Postal Tracking: {order.tracking_number}</p>}
          </div>
          {order.address && (
            <div className="glass-card p-5">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2"><MapPin className="w-4 h-4 text-brand-400" /> Shipping Address</h4>
              <p className="text-sm text-slate-400">{order.address.name}</p>
              <p className="text-xs text-slate-500">{order.address.house_number}, {order.address.street}</p>
              <p className="text-xs text-slate-500">{order.address.district}, {order.address.state} - {order.address.pin_code}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
