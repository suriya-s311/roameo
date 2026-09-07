'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import toast from 'react-hot-toast';
import { Package, Truck, ShoppingBag, CheckCircle } from 'lucide-react';

export default function CheckoutPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [cart, setCart] = useState<any>({ items: [], total: 0 });
  const [fulfillment, setFulfillment] = useState<'carry_with_me' | 'ship_to_home'>('carry_with_me');
  const [form, setForm] = useState({ name: '', phone: '', email: '', house_number: '', street: '', district: '', state: '', pin_code: '' });
  const [placing, setPlacing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => { api.getCart().then(setCart).catch(() => {}); }, []);

  const handleChange = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const placeOrder = async () => {
    if (fulfillment === 'ship_to_home') {
      if (!form.name || !form.phone || !form.house_number || !form.street || !form.district || !form.state || !form.pin_code) {
        toast.error('Please fill all address fields'); return;
      }
    }
    setPlacing(true);
    try {
      await api.createOrder({ fulfillment_type: fulfillment, ...form });
      setOrderPlaced(true);
      toast.success('Order placed successfully!');
    } catch (err: any) { toast.error(err.message || 'Failed to place order'); }
    setPlacing(false);
  };

  if (orderPlaced) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-strong p-12 rounded-3xl text-center animate-scale-in max-w-md">
        <CheckCircle className="w-20 h-20 text-emerald-400 mx-auto mb-6" />
        <h1 className="font-display text-3xl font-bold mb-2">Order Placed!</h1>
        <p className="text-slate-400 mb-8">Your order has been placed successfully. You can track it in your dashboard.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => router.push('/orders')} className="glass-button">View Orders</button>
          <button onClick={() => router.push('/products')} className="glass-button-outline">Continue Shopping</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen px-4 md:px-8 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Fulfillment */}
            <div className="glass-card p-6">
              <h2 className="font-semibold mb-4">How would you like to receive your products?</h2>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setFulfillment('carry_with_me')} className={`glass-card p-4 text-center cursor-pointer ${fulfillment === 'carry_with_me' ? 'border-brand-400 bg-brand-400/10' : ''}`}>
                  <ShoppingBag className={`w-8 h-8 mx-auto mb-2 ${fulfillment === 'carry_with_me' ? 'text-brand-400' : 'text-slate-400'}`} />
                  <p className="font-medium text-sm">Carry With Me</p>
                  <p className="text-xs text-slate-500 mt-1">Pick up from shop</p>
                </button>
                <button onClick={() => setFulfillment('ship_to_home')} className={`glass-card p-4 text-center cursor-pointer ${fulfillment === 'ship_to_home' ? 'border-brand-400 bg-brand-400/10' : ''}`}>
                  <Truck className={`w-8 h-8 mx-auto mb-2 ${fulfillment === 'ship_to_home' ? 'text-brand-400' : 'text-slate-400'}`} />
                  <p className="font-medium text-sm">Ship to Home</p>
                  <p className="text-xs text-slate-500 mt-1">Via postal service</p>
                </button>
              </div>
            </div>

            {/* Address (for shipping) */}
            {fulfillment === 'ship_to_home' && (
              <div className="glass-card p-6">
                <h2 className="font-semibold mb-4">Shipping Address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-xs text-slate-400 mb-1">Name</label><input className="glass-input" value={form.name} onChange={e => handleChange('name', e.target.value)} placeholder="Full Name" /></div>
                  <div><label className="block text-xs text-slate-400 mb-1">Phone</label><input className="glass-input" value={form.phone} onChange={e => handleChange('phone', e.target.value)} placeholder="Phone Number" /></div>
                  <div className="md:col-span-2"><label className="block text-xs text-slate-400 mb-1">Email</label><input className="glass-input" value={form.email} onChange={e => handleChange('email', e.target.value)} placeholder="Email (optional)" /></div>
                  <div><label className="block text-xs text-slate-400 mb-1">House/Door No.</label><input className="glass-input" value={form.house_number} onChange={e => handleChange('house_number', e.target.value)} /></div>
                  <div><label className="block text-xs text-slate-400 mb-1">Street</label><input className="glass-input" value={form.street} onChange={e => handleChange('street', e.target.value)} /></div>
                  <div><label className="block text-xs text-slate-400 mb-1">District</label><input className="glass-input" value={form.district} onChange={e => handleChange('district', e.target.value)} /></div>
                  <div><label className="block text-xs text-slate-400 mb-1">State</label><input className="glass-input" value={form.state} onChange={e => handleChange('state', e.target.value)} /></div>
                  <div><label className="block text-xs text-slate-400 mb-1">PIN Code</label><input className="glass-input" value={form.pin_code} onChange={e => handleChange('pin_code', e.target.value)} /></div>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="glass-strong p-6 rounded-2xl h-fit sticky top-24">
            <h2 className="font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              {cart.items?.map((item: any) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-slate-400 line-clamp-1">{item.product_name} x{item.quantity}</span>
                  <span className="text-white shrink-0">₹{item.subtotal?.toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-white/10 pt-3 flex justify-between items-center mb-6">
              <span className="font-semibold">Total</span>
              <span className="text-xl font-bold gradient-text">₹{cart.total?.toLocaleString()}</span>
            </div>
            <button onClick={placeOrder} disabled={placing} className="glass-button w-full !py-3.5">
              {placing ? 'Placing Order...' : 'Place Order'} <Package className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
