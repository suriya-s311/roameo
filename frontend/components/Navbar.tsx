'use client';

import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { useState } from 'react';
import { MapPin, ShoppingCart, Search, Menu, X, Bell, User, LogOut, Compass, Store } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export function Navbar() {
  const { user, profile, signInWithGoogle, signOut, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [showSearch, setShowSearch] = useState(false);
  const router = useRouter();

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.length < 2) { setSearchResults(null); return; }
    try {
      const results = await api.search(q);
      setSearchResults(results);
    } catch { setSearchResults(null); }
  };

  return (
    <nav className="glass-nav fixed top-0 left-0 right-0 z-50 px-4 md:px-8 h-16 flex items-center justify-between">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 group">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:shadow-brand-500/40 transition-shadow">
          <Compass className="w-5 h-5 text-white" />
        </div>
        <span className="font-display font-bold text-xl tracking-tight">
          <span className="gradient-text">ROAMEO</span>
        </span>
      </Link>

      {/* Desktop Nav */}
      <div className="hidden md:flex items-center gap-6">
        <Link href="/destinations" className="text-sm text-slate-300 hover:text-brand-400 transition-colors flex items-center gap-1.5">
          <MapPin className="w-4 h-4" /> Destinations
        </Link>
        <Link href="/products" className="text-sm text-slate-300 hover:text-brand-400 transition-colors flex items-center gap-1.5">
          <Store className="w-4 h-4" /> Products
        </Link>

        {/* Search */}
        <div className="relative">
          <div className="flex items-center gap-2 glass-input !py-2 !px-3 !rounded-full !w-64">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              className="bg-transparent border-none outline-none text-sm text-slate-200 placeholder:text-slate-500 flex-1"
              placeholder="Search destinations, products..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setShowSearch(true)}
              onBlur={() => setTimeout(() => setShowSearch(false), 200)}
            />
          </div>
          {showSearch && searchResults && (
            <div className="absolute top-full mt-2 left-0 right-0 glass-strong rounded-xl p-3 max-h-80 overflow-y-auto animate-slide-down">
              {searchResults.destinations?.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider">Destinations</p>
                  {searchResults.destinations.map((d: any) => (
                    <button key={d.id} onClick={() => { router.push(`/destinations/${d.id}`); setShowSearch(false); }} className="block w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-slate-200">{d.name}</button>
                  ))}
                </div>
              )}
              {searchResults.products?.length > 0 && (
                <div>
                  <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider">Products</p>
                  {searchResults.products.map((p: any) => (
                    <button key={p.id} onClick={() => { router.push(`/products/${p.id}`); setShowSearch(false); }} className="block w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-slate-200">{p.name} — ₹{p.price}</button>
                  ))}
                </div>
              )}
              {(!searchResults.destinations?.length && !searchResults.products?.length) && (
                <p className="text-sm text-slate-400 text-center py-2">No results found</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="hidden md:flex items-center gap-3">
        {loading ? (
          <div className="w-8 h-8 skeleton rounded-full" />
        ) : user ? (
          <>
            <Link href="/cart" className="relative p-2 rounded-xl hover:bg-white/5 transition-colors">
              <ShoppingCart className="w-5 h-5 text-slate-300" />
            </Link>
            <Link href="/dashboard" className="relative p-2 rounded-xl hover:bg-white/5 transition-colors">
              <Bell className="w-5 h-5 text-slate-300" />
            </Link>
            <div className="relative group">
              <button className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/5 transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-ocean-500 flex items-center justify-center text-sm font-semibold text-white">
                  {profile?.full_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              </button>
              <div className="absolute right-0 top-full mt-2 w-56 glass-strong rounded-xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <p className="px-3 py-2 text-sm font-medium text-white truncate">{profile?.full_name || user.email}</p>
                <p className="px-3 pb-2 text-xs text-slate-400 capitalize">{profile?.role || 'traveler'}</p>
                <div className="border-t border-white/10 my-1" />
                <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-slate-300">
                  <User className="w-4 h-4" /> Dashboard
                </Link>
                {profile?.role === 'seller' && (
                  <Link href="/seller/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-slate-300">
                    <Store className="w-4 h-4" /> Seller Dashboard
                  </Link>
                )}
                <button onClick={signOut} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-red-400 w-full">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          </>
        ) : (
          <button onClick={signInWithGoogle} className="glass-button !py-2 !px-4 !text-sm">
            Continue with Google
          </button>
        )}
      </div>

      {/* Mobile menu toggle */}
      <button className="md:hidden p-2 rounded-xl hover:bg-white/5" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute top-16 left-0 right-0 glass-strong p-4 md:hidden animate-slide-down border-t border-white/5">
          <div className="flex flex-col gap-3">
            <Link href="/destinations" className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-white/5 text-slate-200" onClick={() => setMenuOpen(false)}>
              <MapPin className="w-4 h-4" /> Destinations
            </Link>
            <Link href="/products" className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-white/5 text-slate-200" onClick={() => setMenuOpen(false)}>
              <Store className="w-4 h-4" /> Products
            </Link>
            {user ? (
              <>
                <Link href="/cart" className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-white/5 text-slate-200" onClick={() => setMenuOpen(false)}>
                  <ShoppingCart className="w-4 h-4" /> Cart
                </Link>
                <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-white/5 text-slate-200" onClick={() => setMenuOpen(false)}>
                  <User className="w-4 h-4" /> Dashboard
                </Link>
                <button onClick={() => { signOut(); setMenuOpen(false); }} className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-white/5 text-red-400">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </>
            ) : (
              <button onClick={() => { signInWithGoogle(); setMenuOpen(false); }} className="glass-button">
                Continue with Google
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
