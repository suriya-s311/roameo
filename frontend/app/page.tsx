'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { MapPin, Search, ArrowRight, Star, ShieldCheck, Compass, Sparkles, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HomePage() {
  const router = useRouter();
  const [destination, setDestination] = useState('');
  const [destinations, setDestinations] = useState<any[]>([]);
  const [recentProducts, setRecentProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getDestinations().catch(() => []),
      api.getRecentProducts(8).catch(() => []),
    ]).then(([dests, products]) => {
      setDestinations(dests);
      setRecentProducts(products);
      setLoading(false);
    });
  }, []);

  const handleExplore = () => {
    if (destination.trim()) {
      const match = destinations.find(d => d.name.toLowerCase().includes(destination.toLowerCase()));
      if (match) router.push(`/destinations/${match.id}`);
      else router.push(`/destinations?search=${encodeURIComponent(destination)}`);
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } }),
  };

  return (
    <div className="min-h-screen">
      {/* ─── Hero Section ───────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute top-20 -left-40 w-96 h-96 bg-brand-500/20 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-20 -right-40 w-96 h-96 bg-ocean-500/20 rounded-full blur-[120px] animate-float" style={{ animationDelay: '3s' }} />

        <motion.div initial="hidden" animate="visible" className="text-center max-w-4xl mx-auto relative z-10">
          <motion.div custom={0} variants={fadeUp} className="mb-4 inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-sm text-brand-300">
            <Sparkles className="w-4 h-4" /> Explore Local • Buy Original • Experience the Originals
          </motion.div>

          <motion.h1 custom={1} variants={fadeUp} className="font-display text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Discover Your Next <br />
            <span className="gradient-text">Adventure</span>
          </motion.h1>

          <motion.p custom={2} variants={fadeUp} className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Plan your journey, explore incredible destinations, discover verified local artisans, and bring home genuine treasures.
          </motion.p>

          {/* Search Bar */}
          <motion.div custom={3} variants={fadeUp} className="max-w-xl mx-auto">
            <div className="glass-strong flex items-center rounded-2xl p-2 gap-2">
              <div className="flex items-center gap-2 flex-1 px-3">
                <MapPin className="w-5 h-5 text-brand-400 shrink-0" />
                <input
                  className="bg-transparent border-none outline-none text-white placeholder:text-slate-400 text-lg flex-1 py-2"
                  placeholder="Where are you going?"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleExplore()}
                />
              </div>
              <button onClick={handleExplore} className="glass-button !rounded-xl !px-6 !py-3 shrink-0">
                <Search className="w-5 h-5" />
                <span className="hidden sm:inline">Explore</span>
              </button>
            </div>

            {/* Quick destination chips */}
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {destinations.slice(0, 4).map((d) => (
                <button
                  key={d.id}
                  onClick={() => router.push(`/destinations/${d.id}`)}
                  className="glass rounded-full px-4 py-1.5 text-sm text-slate-300 hover:text-brand-300 hover:border-brand-400/30 transition-all cursor-pointer"
                >
                  {d.name}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div custom={4} variants={fadeUp} className="flex justify-center gap-8 md:gap-16 mt-16">
            {[
              { label: 'Destinations', value: destinations.length || '5+' },
              { label: 'Verified Shops', value: '10+' },
              { label: 'Local Products', value: recentProducts.length ? `${recentProducts.length}+` : '20+' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-3xl font-bold gradient-text">{stat.value}</p>
                <p className="text-sm text-slate-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ─── How ROAMEO Works ────────────────────────────────── */}
      <section className="py-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-4">
            How <span className="gradient-text">ROAMEO</span> Works
          </h2>
          <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">
            Plan → Explore → Travel → Discover → Visit → Experience → Buy → Track
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Compass, title: 'Plan Your Journey', desc: 'Enter your destination, set your budget, choose your interests. ROAMEO builds a smart itinerary with budget tracking.', color: 'from-brand-400 to-brand-600', href: '/journey/builder' },
              { icon: MapPin, title: 'Discover & Explore', desc: 'Explore tourist spots, find nearby verified shops on the map, and discover local products along your route.', color: 'from-ocean-400 to-ocean-600', href: '/destinations' },
              { icon: ShieldCheck, title: 'Buy Local', desc: 'Shop from verified local artisans. Carry with you or ship to home. Track your orders every step of the way.', color: 'from-amber-400 to-orange-600', href: '/products' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="glass-card p-8 text-center group cursor-pointer hover:border-brand-400/30 transition-all"
                onClick={() => router.push(item.href)}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">{item.desc}</p>
                <span className="text-brand-400 text-sm font-medium flex items-center justify-center gap-1 group-hover:gap-2 transition-all">Get Started <ArrowRight className="w-4 h-4" /></span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Destinations ───────────────────────────────────── */}
      <section className="py-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-3xl font-bold">Explore Destinations</h2>
              <p className="text-slate-400 mt-1">Discover incredible places across Tamil Nadu</p>
            </div>
            <Link href="/destinations" className="glass-button-outline !py-2 !px-4 !text-sm">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <div key={i} className="skeleton h-72 rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {destinations.slice(0, 6).map((dest, i) => (
                <motion.div
                  key={dest.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link href={`/destinations/${dest.id}`} className="block glass-card overflow-hidden group cursor-pointer">
                    <div className="h-48 relative overflow-hidden">
                      <img
                        src={dest.image_url || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600'}
                        alt={dest.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-3 left-4">
                        <p className="text-xs text-brand-300 mb-1">{dest.state}</p>
                        <h3 className="font-display text-xl font-bold text-white">{dest.name}</h3>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-slate-400 line-clamp-2 mb-3">{dest.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-brand-400">{dest.spot_count || 0} spots</span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> Popular
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── Recently Added Products ────────────────────────── */}
      <section className="py-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-3xl font-bold flex items-center gap-2">
                <TrendingUp className="w-7 h-7 text-brand-400" /> Recently Added
              </h2>
              <p className="text-slate-400 mt-1">Fresh products from verified local artisans</p>
            </div>
            <Link href="/products" className="glass-button-outline !py-2 !px-4 !text-sm">
              Browse All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-64 rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recentProducts.slice(0, 8).map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link href={`/products/${product.id}`} className="block glass-card overflow-hidden group cursor-pointer">
                    <div className="h-40 relative overflow-hidden">
                      <img
                        src={product.image_url || 'https://images.unsplash.com/photo-1567591370504-ce57d91f9905?w=400'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-3">
                      <h4 className="font-medium text-sm text-white line-clamp-1">{product.name}</h4>
                      <p className="text-brand-400 font-semibold mt-1">₹{product.price?.toLocaleString()}</p>
                      {product.verified && (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-400 mt-1">
                          <ShieldCheck className="w-3 h-3" /> Verified Seller
                        </span>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── CTA: Become a Seller ────────────────────────────── */}
      <section className="py-20 px-4 md:px-8">
        <div className="max-w-4xl mx-auto text-center glass-card p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-600/10 to-ocean-600/10" />
          <div className="relative z-10">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Are You a Local Artisan?
            </h2>
            <p className="text-slate-400 mb-8 max-w-lg mx-auto">
              Join ROAMEO as a verified seller. Reach travelers, showcase your original products, and grow your business.
            </p>
            <Link href="/seller/register" className="glass-button !text-base !px-8 !py-3">
              Become a Seller <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-12 px-4 md:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-8">
          <div>
            <p className="font-display font-bold text-xl gradient-text mb-2">ROAMEO</p>
            <p className="text-sm text-slate-500 max-w-xs">Roam + Experience the Originals. Connecting travelers with original local experiences.</p>
          </div>
          <div className="flex gap-12">
            <div>
              <p className="font-medium text-sm text-slate-300 mb-3">Explore</p>
              <div className="flex flex-col gap-2">
                <Link href="/destinations" className="text-sm text-slate-500 hover:text-brand-400 transition-colors">Destinations</Link>
                <Link href="/products" className="text-sm text-slate-500 hover:text-brand-400 transition-colors">Products</Link>
              </div>
            </div>
            <div>
              <p className="font-medium text-sm text-slate-300 mb-3">Sellers</p>
              <div className="flex flex-col gap-2">
                <Link href="/seller/register" className="text-sm text-slate-500 hover:text-brand-400 transition-colors">Register</Link>
                <Link href="/seller/dashboard" className="text-sm text-slate-500 hover:text-brand-400 transition-colors">Dashboard</Link>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-white/5 text-center text-xs text-slate-600">
          © 2026 ROAMEO. All rights reserved. Udyam verification is a prototype/demo system.
        </div>
      </footer>
    </div>
  );
}
