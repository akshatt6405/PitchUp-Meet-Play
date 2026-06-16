import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet's default marker images break under webpack/CRA (wrong paths),
// so point them at the CDN copies once, globally.
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// coords are GeoJSON [longitude, latitude]; Leaflet wants [lat, lng]
const VenueMap = ({ coords, label, zoom = 14 }) => {
  const elRef = useRef(null);

  useEffect(() => {
    if (!elRef.current || !coords) return;
    const [lng, lat] = coords;

    const map = L.map(elRef.current, {
      center: [lat, lng],
      zoom,
      scrollWheelZoom: false, // don't hijack page scroll
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    const marker = L.marker([lat, lng]).addTo(map);
    if (label) marker.bindPopup(label).openPopup();

    // Container size isn't always known on first paint — recalc once settled
    const t = setTimeout(() => map.invalidateSize(), 120);

    // Cleanup (also handles React StrictMode's double-invoke in dev)
    return () => { clearTimeout(t); map.remove(); };
  }, [coords, label, zoom]);

  if (!coords) return null;

  return <div className="venue-map" ref={elRef} aria-label={`Map of ${label || 'venue'}`} />;
};

export default VenueMap;
