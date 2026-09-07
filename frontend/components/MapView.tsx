'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const ShopIcon = L.divIcon({
  html: '<div style="background:linear-gradient(135deg,#14b8a6,#0d9488);width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:14px;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)">🏪</div>',
  className: '', iconSize: [30, 30], iconAnchor: [15, 15], popupAnchor: [0, -18],
});

const SpotIcon = L.divIcon({
  html: '<div style="background:linear-gradient(135deg,#3b82f6,#2563eb);width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:14px;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)">📍</div>',
  className: '', iconSize: [30, 30], iconAnchor: [15, 15], popupAnchor: [0, -18],
});

interface MapViewProps {
  center: [number, number];
  spots?: any[];
  shops?: any[];
  route?: [number, number][];
  zoom?: number;
  onShopClick?: (shop: any) => void;
}

export default function MapView({ center, spots = [], shops = [], route, zoom = 13, onShopClick }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center, zoom, scrollWheelZoom: true,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => { map.remove(); mapInstanceRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing layers except tile layer
    map.eachLayer((layer) => {
      if (!(layer instanceof L.TileLayer)) map.removeLayer(layer);
    });

    // Add spot markers
    spots.forEach((spot) => {
      if (!spot.latitude || !spot.longitude) return;
      L.marker([spot.latitude, spot.longitude], { icon: SpotIcon })
        .addTo(map)
        .bindPopup(`
          <div style="min-width:180px">
            <h4 style="font-weight:600;margin-bottom:4px;font-size:14px">${spot.name}</h4>
            <p style="font-size:12px;opacity:0.7;margin-bottom:6px">${spot.description?.substring(0, 80) || ''}...</p>
            <div style="display:flex;gap:12px;font-size:11px;opacity:0.6">
              <span>⏱ ${spot.estimated_visit_duration || 60} min</span>
              <span>💰 ${spot.estimated_entry_cost > 0 ? '₹' + spot.estimated_entry_cost : 'Free'}</span>
            </div>
          </div>
        `);
    });

    // Add shop markers
    shops.forEach((shop) => {
      if (!shop.latitude || !shop.longitude) return;
      const marker = L.marker([shop.latitude, shop.longitude], { icon: ShopIcon })
        .addTo(map)
        .bindPopup(`
          <div style="min-width:180px">
            <h4 style="font-weight:600;margin-bottom:4px;font-size:14px">${shop.name}</h4>
            ${shop.verification_status === 'verified' ? '<span style="color:#34d399;font-size:11px">✓ Verified Shop</span>' : ''}
            <p style="font-size:12px;opacity:0.7;margin:4px 0">${shop.description?.substring(0, 60) || ''}</p>
            <p style="font-size:11px;opacity:0.5">${shop.district || ''}, ${shop.state || ''}</p>
          </div>
        `);
      if (onShopClick) marker.on('click', () => onShopClick(shop));
    });

    // Draw route if provided
    if (route && route.length > 1) {
      L.polyline(route, { color: '#14b8a6', weight: 3, opacity: 0.8, dashArray: '10, 6' }).addTo(map);
    }

    // Fit bounds
    const allPoints: [number, number][] = [];
    spots.forEach(s => { if (s.latitude && s.longitude) allPoints.push([s.latitude, s.longitude]); });
    shops.forEach(s => { if (s.latitude && s.longitude) allPoints.push([s.latitude, s.longitude]); });
    if (route) allPoints.push(...route);
    if (allPoints.length > 1) {
      map.fitBounds(L.latLngBounds(allPoints), { padding: [40, 40] });
    } else {
      map.setView(center, zoom);
    }
  }, [spots, shops, route, center, zoom]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: 300, borderRadius: 16 }} />;
}
