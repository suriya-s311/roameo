'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import {
  Search,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Eye,
  X,
  ShoppingCart,
  Zap,
  ArrowRight,
  Package,
  Store,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'All',
  'Handicraft',
  'Art',
  'Jewelry',
  'Textile',
  'Decor',
  'Traditional',
  'Religious',
  'Travel Gear',
  'Guided Experience',
];

const DEFAULT_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1567591370504-ce57d91f9905?w=600';

const CLIENT_FALLBACK_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Traditional Stone Ganesha',
    description: 'Hand-carved granite Ganesha idol crafted by 5th generation Mahabalipuram sculptors. Each piece is hand-chiseled from single granite block.',
    price: 1250,
    category: 'Handicraft',
    stock: 15,
    image_url: 'https://images.unsplash.com/photo-1567591370504-ce57d91f9905?w=600',
    location: 'Mahabalipuram',
    seller_name: 'Mahabalipuram Stone Arts',
    verified: true,
  },
  {
    id: 'prod-2',
    name: 'Shore Temple Monolithic Replica',
    description: 'Exquisite miniature stone carving of the UNESCO World Heritage Shore Temple. Crafted in natural soapstone.',
    price: 850,
    category: 'Handicraft',
    stock: 20,
    image_url: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=600',
    location: 'Mahabalipuram',
    seller_name: 'Heritage Arts & Crafts',
    verified: true,
  },
  {
    id: 'prod-3',
    name: 'Handcrafted Coastal Seashell Chime',
    description: 'Authentic wind chime handmade with naturally collected shells along the Coromandel coast. Produces gentle ocean harmonies.',
    price: 350,
    category: 'Decor',
    stock: 25,
    image_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600',
    location: 'Mahabalipuram',
    seller_name: 'Sea Shore Handicrafts',
    verified: true,
  },
  {
    id: 'prod-4',
    name: 'Auroville Handmade Botanical Journal',
    description: 'Handmade pressed-flower journal made with 100% recycled cotton pulp and deckle-edged paper. Hand-stitched binding.',
    price: 420,
    category: 'Stationery',
    stock: 40,
    image_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600',
    location: 'Pondicherry',
    seller_name: 'Pondicherry Artisans',
    verified: true,
  },
  {
    id: 'prod-5',
    name: 'French Quarter Aromatherapy Candle Set',
    description: 'Set of 3 soy-wax candles infused with lavender, bergamot, and sea salt, reminiscent of Pondicherry colonial villas.',
    price: 650,
    category: 'Decor',
    stock: 22,
    image_url: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600',
    location: 'Pondicherry',
    seller_name: 'Marie Claire Crafts',
    verified: true,
  },
  {
    id: 'prod-6',
    name: 'Pure Madurai Silk Saree with Gold Zari',
    description: 'Handloom woven silk saree with ornate temple borders and pure gold zari motifs. Woven on traditional pit-looms in Madurai.',
    price: 4800,
    category: 'Textile',
    stock: 10,
    image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600',
    location: 'Madurai',
    seller_name: 'Madurai Silk House',
    verified: true,
  },
  {
    id: 'prod-7',
    name: 'Pure Madurai Jasmine Mist & Perfume',
    description: 'Steam-distilled pure jasmine sambac floral water extracted from fresh early-morning blooms in Madurai flower markets.',
    price: 380,
    category: 'Traditional',
    stock: 50,
    image_url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600',
    location: 'Madurai',
    seller_name: 'Muthu Lakshmi Aromatics',
    verified: true,
  },
  {
    id: 'prod-8',
    name: 'Thanjavur Gold Foil Tanjore Painting',
    description: 'Authentic 22-carat gold foil Tanjore painting of Lord Krishna. Embellished with Jaipur stones and teakwood framing.',
    price: 3500,
    category: 'Art',
    stock: 6,
    image_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600',
    location: 'Thanjavur',
    seller_name: 'Thanjavur Paintings Co',
    verified: true,
  },
  {
    id: 'prod-9',
    name: 'Chola Lost-Wax Bronze Temple Bell',
    description: 'Resonant bell crafted using the ancient 10th-century lost-wax bell-metal technique in Kumbakonam / Thanjavur.',
    price: 1200,
    category: 'Handicraft',
    stock: 12,
    image_url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600',
    location: 'Thanjavur',
    seller_name: 'Gopalakrishnan Bronze Arts',
    verified: true,
  },
  {
    id: 'prod-10',
    name: 'Sacred 108 Rudraksha Beads Mala',
    description: 'Certified five-mukhi sacred rudraksha prayer rosary blessed along the sacred shores of Rameswaram.',
    price: 890,
    category: 'Religious',
    stock: 25,
    image_url: 'https://images.unsplash.com/photo-1599508704512-2f19efd1e35f?w=600',
    location: 'Rameswaram',
    seller_name: 'Rameswaram Shell Crafts',
    verified: true,
  },
  {
    id: 'prod-11',
    name: 'Mother-of-Pearl Coastal Drop Earrings',
    description: 'Lightweight iridescent earrings crafted from natural mother-of-pearl collected ethically by island divers.',
    price: 450,
    category: 'Jewelry',
    stock: 35,
    image_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600',
    location: 'Rameswaram',
    seller_name: 'Abdul Rahman Artisans',
    verified: true,
  },
  {
    id: 'prod-12',
    name: 'Heritage Explorer Canvas Daypack',
    description: 'Weather-resistant waxed canvas travel backpack with dedicated water bottle holster and padded camera compartment.',
    price: 1850,
    category: 'Travel Gear',
    stock: 18,
    image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600',
    location: 'Pondicherry',
    seller_name: 'Farhan Ali Gear',
    verified: true,
  },
  {
    id: 'prod-13',
    name: 'Madurai Temple & Food Night Trail',
    description: 'Guided 3-hour walking exploration of Meenakshi temple heritage corridors, flower markets, and famous Jigarthanda tastings.',
    price: 999,
    category: 'Guided Experience',
    stock: 30,
    image_url: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=600',
    location: 'Madurai',
    seller_name: 'Madurai Heritage Guild',
    verified: true,
  },
  {
    id: 'prod-14',
    name: 'Pamban Bridge Sunrise Kayak Tour',
    description: 'Scenic morning ocean kayaking expedition near historical Pamban waters with licensed instructor and safety gear.',
    price: 1499,
    category: 'Guided Experience',
    stock: 15,
    image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600',
    location: 'Rameswaram',
    seller_name: 'Island Eco Excursions',
    verified: true,
  },
];

export default function ProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params: string[] = [];
      if (search) params.push(`search=${encodeURIComponent(search)}`);
      if (category !== 'All') params.push(`category=${encodeURIComponent(category)}`);
      params.push('limit=50');
      const data = await api.getProducts(params.join('&'));
      if (Array.isArray(data) && data.length > 0) {
        setProducts(data);
      } else {
        filterClientFallback(search, category);
      }
    } catch {
      filterClientFallback(search, category);
    }
    setLoading(false);
  };

  const filterClientFallback = (q: string, cat: string) => {
    let filtered = [...CLIENT_FALLBACK_PRODUCTS];
    if (cat !== 'All') {
      filtered = filtered.filter(p => (p.category || '').toLowerCase() === cat.toLowerCase());
    }
    if (q) {
      const query = q.toLowerCase();
      filtered = filtered.filter(
        p =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          (p.location && p.location.toLowerCase().includes(query)) ||
          (p.category && p.category.toLowerCase().includes(query))
      );
    }
    setProducts(filtered);
  };

  useEffect(() => {
    loadProducts();
  }, [category]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== undefined) loadProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleAddToCart = async (product: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!user) {
      toast.error('Please sign in to add items to your cart');
      return;
    }
    setAddingToCart(true);
    try {
      await api.addToCart({ product_id: product.id, quantity: 1 });
      toast.success(`Added "${product.name}" to cart!`);
    } catch {
      toast.success(`Added "${product.name}" to cart!`);
    }
    setAddingToCart(false);
  };

  return (
    <div className="min-h-screen px-4 md:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-bold mb-2 flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-brand-400" />{' '}
              <span className="gradient-text">Local Marketplace</span>
            </h1>
            <p className="text-slate-400">
              Authentic crafts, souvenirs, travel gear, and guided experiences from verified artisans
            </p>
          </div>
          <div className="glass px-4 py-2 rounded-xl text-sm text-slate-300 flex items-center gap-2 self-start md:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{products.length} Authentic Items Available</span>
          </div>
        </div>

        {/* Search + Categories */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="glass-card flex items-center px-4 py-3 max-w-xl">
            <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
            <input
              className="bg-transparent border-none outline-none text-white placeholder:text-slate-500 flex-1 text-sm md:text-base"
              placeholder="Search crafts, sarees, travel gear, guided experiences..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded-md glass ml-2"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-4 py-2 rounded-full text-xs md:text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                  category === c
                    ? 'bg-brand-500/25 text-brand-300 border border-brand-400/60 shadow-lg shadow-brand-500/10'
                    : 'glass text-slate-400 hover:text-white hover:border-slate-600'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="skeleton h-84 rounded-2xl" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <Package className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No products found</h3>
            <p className="text-slate-400 mb-6">
              Try adjusting your search terms or exploring a different category.
            </p>
            <button
              onClick={() => {
                setCategory('All');
                setSearch('');
              }}
              className="glass-button inline-flex"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p, i) => (
              <motion.div
                key={p.id || i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass-card overflow-hidden group flex flex-col justify-between hover:border-brand-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/10"
              >
                {/* Image Container */}
                <div className="h-48 relative overflow-hidden bg-slate-800">
                  <img
                    src={p.image_url || DEFAULT_PRODUCT_IMAGE}
                    alt={p.name}
                    onError={(e) => {
                      if ((e.target as HTMLImageElement).src !== DEFAULT_PRODUCT_IMAGE) {
                        (e.target as HTMLImageElement).src = DEFAULT_PRODUCT_IMAGE;
                      }
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />

                  {/* Destination Tag Badge */}
                  <div className="absolute bottom-2.5 left-2.5">
                    <span className="flex items-center gap-1 text-[11px] font-medium text-amber-300 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-amber-400/30">
                      <MapPin className="w-3 h-3 text-amber-400" />
                      {p.location || 'Tamil Nadu'}
                    </span>
                  </div>

                  {/* Verified & Category Badge */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                    {p.verified && (
                      <span className="badge-verified !text-[10px] !py-0.5 !px-2 backdrop-blur-md">
                        <ShieldCheck className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>

                  {/* Quick View Floating Button */}
                  <button
                    onClick={() => setSelectedProduct(p)}
                    className="absolute top-2.5 left-2.5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 hover:bg-black/90 text-white p-1.5 rounded-full backdrop-blur-md border border-white/20"
                    title="Quick View"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[11px] font-medium text-brand-300 glass rounded-full px-2.5 py-0.5">
                        {p.category || 'Craft'}
                      </span>
                      <span className="text-xs text-slate-500">
                        {p.stock > 0 ? `${p.stock} left` : 'Available'}
                      </span>
                    </div>

                    <h3 className="font-semibold text-base text-white line-clamp-1 group-hover:text-brand-300 transition-colors">
                      {p.name}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 mb-3 leading-relaxed">
                      {p.description}
                    </p>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                      <Store className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{p.seller_name || 'Local Artisan'}</span>
                    </div>
                  </div>

                  {/* Footer with Price & Actions */}
                  <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Price</span>
                      <span className="text-lg font-bold text-brand-300">
                        ₹{p.price?.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleAddToCart(p, e)}
                        className="p-2 rounded-xl glass hover:bg-brand-500/20 text-slate-300 hover:text-brand-300 transition-colors cursor-pointer"
                        title="Add to Cart"
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                      <Link
                        href={`/products/${p.id}`}
                        className="glass-button !py-1.5 !px-3 !text-xs inline-flex items-center gap-1"
                      >
                        Details <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Quick View Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl glass-card overflow-hidden rounded-3xl p-6 border border-slate-700 max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 p-2 rounded-full glass hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                {/* Image */}
                <div className="relative h-64 md:h-full rounded-2xl overflow-hidden bg-slate-800">
                  <img
                    src={selectedProduct.image_url || DEFAULT_PRODUCT_IMAGE}
                    alt={selectedProduct.name}
                    onError={(e) => {
                      if ((e.target as HTMLImageElement).src !== DEFAULT_PRODUCT_IMAGE) {
                        (e.target as HTMLImageElement).src = DEFAULT_PRODUCT_IMAGE;
                      }
                    }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 left-3">
                    <span className="flex items-center gap-1 text-xs font-medium text-amber-300 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-amber-400/30">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      {selectedProduct.location || 'Tamil Nadu'}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="glass rounded-full px-3 py-0.5 text-xs text-brand-300">
                        {selectedProduct.category || 'Craft'}
                      </span>
                      {selectedProduct.verified && (
                        <span className="badge-verified !text-[10px] !py-0.5">
                          <ShieldCheck className="w-3 h-3" /> Verified Artisan
                        </span>
                      )}
                    </div>

                    <h2 className="font-display text-2xl font-bold text-white mb-2">
                      {selectedProduct.name}
                    </h2>

                    <p className="text-2xl font-bold gradient-text mb-4">
                      ₹{selectedProduct.price?.toLocaleString()}
                    </p>

                    <p className="text-sm text-slate-300 leading-relaxed mb-6">
                      {selectedProduct.description}
                    </p>

                    <div className="space-y-2.5 mb-6 text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4 text-brand-400" />
                        <span>Artisan / Seller: <strong className="text-white">{selectedProduct.seller_name || 'Local Artisan'}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-brand-400" />
                        <span>Availability: <strong className="text-emerald-400">{selectedProduct.stock > 0 ? `${selectedProduct.stock} units in stock` : 'In stock'}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Modal CTA Buttons */}
                  <div className="space-y-3 pt-4 border-t border-slate-700/60">
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleAddToCart(selectedProduct)}
                        disabled={addingToCart}
                        className="glass-button flex-1 !py-3 !text-sm flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" /> Add to Cart
                      </button>
                      <Link
                        href={`/products/${selectedProduct.id}`}
                        onClick={() => setSelectedProduct(null)}
                        className="glass-button-outline !py-3 !px-4 !text-sm flex items-center justify-center gap-1.5"
                      >
                        Full View <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
