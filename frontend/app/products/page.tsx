'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Search, ShieldCheck, SlidersHorizontal, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const CATEGORIES = ['All', 'Handicraft', 'Art', 'Jewelry', 'Textile', 'Decor', 'Traditional', 'Religious', 'Stationery'];

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('recent');

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params: string[] = [];
      if (search) params.push(`search=${encodeURIComponent(search)}`);
      if (category !== 'All') params.push(`category=${encodeURIComponent(category)}`);
      params.push('limit=50');
      const data = await api.getProducts(params.join('&'));
      setProducts(data);
    } catch { setProducts([]); }
    setLoading(false);
  };

  useEffect(() => { loadProducts(); }, [category]);

  useEffect(() => {
    const timer = setTimeout(() => { if (search !== undefined) loadProducts(); }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="min-h-screen px-4 md:px-8 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold mb-2 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-brand-400" /> <span className="gradient-text">Products</span>
          </h1>
          <p className="text-slate-400">Authentic products from verified local artisans</p>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="glass-card flex items-center px-4 py-2.5 flex-1">
            <Search className="w-5 h-5 text-slate-400 mr-3" />
            <input className="bg-transparent border-none outline-none text-white placeholder:text-slate-500 flex-1" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)} className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all cursor-pointer ${category === c ? 'bg-brand-500/20 text-brand-400 border border-brand-400/50' : 'glass text-slate-400 hover:text-white'}`}>{c}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="skeleton h-72 rounded-2xl" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="glass-card p-12 text-center"><p className="text-slate-400">No products found. Try a different search or category.</p></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}>
                <Link href={`/products/${p.id}`} className="block glass-card overflow-hidden group cursor-pointer">
                  <div className="h-44 relative overflow-hidden">
                    <img src={p.image_url || 'https://images.unsplash.com/photo-1567591370504-ce57d91f9905?w=400'} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    {p.verified && <span className="absolute top-2 right-2 badge-verified !text-[10px] !py-0.5"><ShieldCheck className="w-3 h-3" /></span>}
                  </div>
                  <div className="p-3">
                    <h4 className="font-medium text-sm text-white line-clamp-1">{p.name}</h4>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{p.seller_name}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-brand-400 font-bold">₹{p.price?.toLocaleString()}</span>
                      {p.category && <span className="text-[10px] text-slate-500 glass rounded-full px-2 py-0.5">{p.category}</span>}
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
