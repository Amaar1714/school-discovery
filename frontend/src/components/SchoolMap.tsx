import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { type School } from '@/types';
import 'leaflet/dist/leaflet.css';

async function resolvePostcode(postcode: string): Promise<[number, number] | null> {
  try {
    const normalized = postcode.replace(/\s+/g, '').toUpperCase();
    const res = await fetch(`https://api.postcodes.io/postcodes/${normalized}`);
    const data = await res.json();
    if (data.status === 200 && data.result) {
      return [data.result.latitude, data.result.longitude];
    }
    return null;
  } catch {
    return null;
  }
}

const ratingColors: Record<string, string> = {
  'Outstanding': '#2d9a5c',
  'Good': '#46a758',
  'Requires Improvement': '#e6930a',
  'Inadequate': '#dc2626',
};

const DEFAULT_COLOR = '#94a3b8';

const createIcon = (rating: string | null, isSelected: boolean) => {
  const color = rating ? (ratingColors[rating] ?? DEFAULT_COLOR) : DEFAULT_COLOR;
  const size = isSelected ? 18 : 12;
  const border = isSelected ? 3 : 2;
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:${border}px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);transition:all 0.2s;"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

interface SchoolMapProps {
  schools: School[];
  selectedSchool: School | null;
  onSelectSchool: (school: School) => void;
  postcode?: string;
  radiusKm?: number;
}

export const SchoolMap = ({ schools, selectedSchool, onSelectSchool, postcode, radiusKm }: SchoolMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const locationLayerRef = useRef<L.LayerGroup | null>(null);
  const hasFittedRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [52.5, -1.5],
      zoom: 6,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    markersRef.current = L.layerGroup().addTo(map);
    locationLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !markersRef.current) return;

    markersRef.current.clearLayers();

    schools.forEach((school) => {
      const marker = L.marker([school.latitude, school.longitude], {
        icon: createIcon(school.overallEffectiveness, selectedSchool?.urn === school.urn),
      });

      const ratingColor = school.overallEffectiveness
        ? (ratingColors[school.overallEffectiveness] ?? DEFAULT_COLOR)
        : DEFAULT_COLOR;

      marker.bindPopup(`
        <div style="font-family: 'DM Sans', sans-serif; font-size: 13px; min-width: 180px;">
          <p style="font-weight: 600; margin: 0 0 4px;">${school.name}</p>
          <span style="display:inline-block;padding:2px 8px;border-radius:99px;font-size:11px;font-weight:600;color:white;background:${ratingColor}">${school.overallEffectiveness ?? 'Unrated'}</span>
          <p style="font-size:11px;color:#666;margin:4px 0 0;">${school.address}</p>
        </div>
      `);

      marker.on('click', () => onSelectSchool(school));
      markersRef.current!.addLayer(marker);
    });

    // Auto-fit to show all school markers the first time results load
    if (schools.length > 0 && !hasFittedRef.current) {
      const bounds = L.latLngBounds(schools.map((s) => [s.latitude, s.longitude]));
      mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
      hasFittedRef.current = true;
    }

    // Reset so next postcode search re-fits
    if (schools.length === 0) {
      hasFittedRef.current = false;
    }
  }, [schools, selectedSchool, onSelectSchool]);

  useEffect(() => {
    if (selectedSchool && mapRef.current) {
      mapRef.current.flyTo([selectedSchool.latitude, selectedSchool.longitude], 14, { duration: 0.8 });
    }
  }, [selectedSchool]);

  useEffect(() => {
    if (!locationLayerRef.current) return;
    locationLayerRef.current.clearLayers();

    if (!postcode) return;

    resolvePostcode(postcode).then((coords) => {
      if (!coords || !locationLayerRef.current) return;
      const [lat, lng] = coords;

      // Blue pulsing marker for the searched postcode
      const locationIcon = L.divIcon({
        className: 'location-marker',
        html: `<div style="
          width:16px;height:16px;border-radius:50%;
          background:#3b82f6;border:3px solid white;
          box-shadow:0 0 0 4px rgba(59,130,246,0.3);
        "></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      L.marker([lat, lng], { icon: locationIcon })
        .bindPopup(`<div style="font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;">📍 ${postcode.toUpperCase()}</div>`)
        .addTo(locationLayerRef.current!);

      // Radius circle if a radius is selected
      if (radiusKm && radiusKm > 0) {
        L.circle([lat, lng], {
          radius: radiusKm * 1000,
          color: '#3b82f6',
          fillColor: '#3b82f6',
          fillOpacity: 0.05,
          weight: 1.5,
          dashArray: '6 4',
        }).addTo(locationLayerRef.current!);
      }
    });
  }, [postcode, radiusKm]);

  return <div ref={containerRef} className="h-full w-full rounded-xl" style={{ minHeight: '500px', position: 'relative', zIndex: 0 }} />;
};
