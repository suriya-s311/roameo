'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { Camera, RotateCcw, Check, X, Package, ArrowRight } from 'lucide-react';

export default function AddProductPage() {
  const { user } = useAuth();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [cameraError, setCameraError] = useState('');
  const [stream, setStream] = useState<MediaStream | null>(null);

  const [form, setForm] = useState({ name: '', description: '', price: '', category: 'Handicraft', stock: '10', location: '' });
  const [saving, setSaving] = useState(false);

  const CATEGORIES = ['Handicraft', 'Art', 'Jewelry', 'Textile', 'Decor', 'Traditional', 'Religious', 'Stationery', 'Food'];

  const handleChange = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  // ─── Camera Functions ───────────────────────────────────
  const startCamera = async () => {
    setCameraError('');
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      setStream(mediaStream);
      setCameraActive(true);
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setCameraError('Camera access denied. Please allow camera access in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setCameraError('No camera found on this device. Please connect a camera and try again.');
      } else {
        setCameraError(`Camera error: ${err.message}`);
      }
    }
  };

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedImage(dataUrl);
      // Convert to blob
      canvas.toBlob((blob) => { if (blob) setImageBlob(blob); }, 'image/jpeg', 0.85);
    }
    stopCamera();
  }, []);

  const stopCamera = () => {
    if (stream) { stream.getTracks().forEach(t => t.stop()); setStream(null); }
    setCameraActive(false);
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setImageBlob(null);
    startCamera();
  };

  // ─── Submit ─────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.name || !form.price) { toast.error('Name and price are required'); return; }
    if (!capturedImage) { toast.error('Please capture a product image'); return; }
    setSaving(true);

    try {
      let imageUrl = '';

      // Upload image to Supabase Storage
      if (imageBlob) {
        const fileName = `product_${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, imageBlob, { contentType: 'image/jpeg' });

        if (uploadError) {
          // Fallback: use data URL if storage isn't configured
          console.warn('Storage upload failed, using placeholder:', uploadError.message);
          imageUrl = 'https://images.unsplash.com/photo-1567591370504-ce57d91f9905?w=400';
        } else {
          const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
          imageUrl = urlData.publicUrl;
        }
      }

      await api.createProduct({
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        category: form.category,
        stock: parseInt(form.stock) || 0,
        image_url: imageUrl || 'https://images.unsplash.com/photo-1567591370504-ce57d91f9905?w=400',
        location: form.location,
      });

      toast.success('Product added successfully!');
      router.push('/seller/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add product');
    }
    setSaving(false);
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center"><div className="glass-card p-8"><p className="text-slate-400">Please sign in</p></div></div>;

  return (
    <div className="min-h-screen px-4 md:px-8 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-3xl font-bold mb-2">Add <span className="gradient-text">Product</span></h1>
        <p className="text-slate-400 mb-8">Capture your product photo and fill in the details</p>

        {/* Camera Section */}
        <div className="glass-card p-6 mb-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><Camera className="w-5 h-5 text-brand-400" /> Capture Product Image</h2>

          {/* Camera Error */}
          {cameraError && (
            <div className="glass !bg-red-500/10 !border-red-500/20 p-4 rounded-xl mb-4">
              <p className="text-sm text-red-400">{cameraError}</p>
              <button onClick={startCamera} className="glass-button-outline !py-1.5 !px-3 !text-xs mt-2">Try Again</button>
            </div>
          )}

          {/* No image yet */}
          {!cameraActive && !capturedImage && !cameraError && (
            <button onClick={startCamera} className="w-full h-56 rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-3 hover:border-brand-400/30 hover:bg-white/[0.02] transition-all cursor-pointer group">
              <div className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Camera className="w-7 h-7 text-brand-400" />
              </div>
              <p className="text-sm text-slate-400 group-hover:text-brand-300">Take Product Photo</p>
              <p className="text-xs text-slate-600">Opens your device camera</p>
            </button>
          )}

          {/* Camera Feed */}
          {cameraActive && (
            <div className="relative">
              <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-2xl bg-black aspect-video object-cover" />
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                <button onClick={capturePhoto} className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-xl hover:scale-105 transition-transform">
                  <div className="w-14 h-14 rounded-full border-4 border-gray-300" />
                </button>
                <button onClick={stopCamera} className="w-12 h-12 rounded-full glass flex items-center justify-center">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          )}

          {/* Captured Preview */}
          {capturedImage && (
            <div className="relative">
              <img src={capturedImage} alt="Captured product" className="w-full rounded-2xl aspect-video object-cover" />
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                <button onClick={retakePhoto} className="glass-button-outline !py-2.5 !px-4">
                  <RotateCcw className="w-4 h-4" /> Retake
                </button>
                <button className="glass-button !py-2.5 !px-4" disabled>
                  <Check className="w-4 h-4" /> Photo Captured
                </button>
              </div>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Product Form */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="font-semibold flex items-center gap-2"><Package className="w-5 h-5 text-brand-400" /> Product Details</h2>
          <div><label className="block text-xs text-slate-400 mb-1">Product Name *</label><input className="glass-input" value={form.name} onChange={e => handleChange('name', e.target.value)} placeholder="e.g. Traditional Stone Ganesha" /></div>
          <div><label className="block text-xs text-slate-400 mb-1">Description</label><textarea className="glass-input !h-24 resize-none" value={form.description} onChange={e => handleChange('description', e.target.value)} placeholder="Describe your product..." /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs text-slate-400 mb-1">Price (₹) *</label><input className="glass-input" type="number" value={form.price} onChange={e => handleChange('price', e.target.value)} placeholder="850" min="1" /></div>
            <div><label className="block text-xs text-slate-400 mb-1">Stock</label><input className="glass-input" type="number" value={form.stock} onChange={e => handleChange('stock', e.target.value)} placeholder="10" min="0" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Category</label>
              <select className="glass-input" value={form.category} onChange={e => handleChange('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div><label className="block text-xs text-slate-400 mb-1">Location</label><input className="glass-input" value={form.location} onChange={e => handleChange('location', e.target.value)} placeholder="e.g. Mahabalipuram" /></div>
          </div>

          <button onClick={handleSubmit} disabled={saving} className="glass-button w-full !py-3.5">
            {saving ? 'Adding Product...' : 'Add Product'} <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
