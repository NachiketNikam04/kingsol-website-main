import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, GeoJSON, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// =========================================================================
// CUSTOM LOCATION PIN SVG TEMPLATE
// Easily swappable icon definition for custom pins or brand SVGs
// =========================================================================
export const LOCATION_PIN_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="24" fill="#44a0e3" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" class="drop-shadow-sm">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
    <circle cx="12" cy="9" r="2.5" fill="#ffffff"/>
  </svg>
`;

// Known coordinates for Indian warehouse hubs & major commercial centres
const CITY_COORDINATES: Record<string, [number, number]> = {
  pune: [18.5912, 73.7389],
  bhiwandi: [19.2967, 73.0631],
  ahmedabad: [23.0225, 72.5714],
  bengaluru: [12.9716, 77.5946],
  bangalore: [12.9716, 77.5946],
  chennai: [13.0827, 80.2707],
  jaipur: [26.9124, 75.7873],
  kolkata: [22.5726, 88.3639],
  hyderabad: [17.3850, 78.4867],
  noida: [28.5355, 77.3910],
  delhi: [28.6139, 77.2090],
  goa: [15.2993, 74.1240],
  muktainagar: [21.0431, 76.0494],
  bhubaneshwar: [20.2961, 85.8245],
  bhubaneswar: [20.2961, 85.8245],
  ludhiana: [30.9010, 75.8573],
  mumbai: [19.0760, 72.8777],
  surat: [21.1702, 72.8311],
  nagpur: [21.1458, 79.0882],
  indore: [22.7196, 75.8577],
  lucknow: [26.8467, 80.9462],
  chandigarh: [30.7333, 76.7794],
  coimbatore: [11.0168, 76.9558],
  kochi: [9.9312, 76.2673],
  visakhapatnam: [17.6868, 83.2185],
  patna: [25.5941, 85.1376],
  bhopal: [23.2599, 77.4126],
  vadodara: [22.3072, 73.1812],
  gurugram: [28.4595, 77.0266],
};

function resolveCoordinates(locationStr: string): [number, number] | null {
  const normalized = locationStr.toLowerCase();
  for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
    if (normalized.includes(key)) {
      return coords;
    }
  }
  return null;
}

// Factory function for custom location pin with floor mirror/reflection effect
const createReflectivePinIcon = (isHq: boolean) => {
  return L.divIcon({
    className: 'custom-leaflet-div-icon',
    html: `
      <div class="flex flex-col items-center cursor-pointer group">
        <!-- Main Location Pin -->
        <div class="relative z-10 flex flex-col items-center transition-transform duration-200 group-hover:scale-110">
          ${LOCATION_PIN_SVG}
          ${isHq ? '<div class="hq-badge">HQ</div>' : ''}
        </div>
        <!-- Floor Mirror / Reflection Effect -->
        <div class="transform scale-y-[-1] opacity-30 -mt-1 blur-[1px] pointer-events-none select-none">
          ${LOCATION_PIN_SVG}
        </div>
      </div>
    `,
    iconSize: [26, 44],
    iconAnchor: [13, 24],
    popupAnchor: [0, -26],
  });
};

interface OfficeMapProps {
  locations?: string[];
  className?: string;
}

export const OfficeMap: React.FC<OfficeMapProps> = ({
  locations = [],
  className,
}) => {
  const [geoData, setGeoData] = useState<any>(null);
  const [loadingGeo, setLoadingGeo] = useState<boolean>(true);

  // Modern Post-2014 India States GeoJSON (includes distinct Telangana and Andhra Pradesh)
  const REMOTE_GEOJSON_URL =
    'https://raw.githubusercontent.com/geohacker/india/master/state/india_telengana.geojson';

  useEffect(() => {
    let isMounted = true;

    async function fetchIndiaGeoJson() {
      setLoadingGeo(true);
      try {
        let res = await fetch('/india-states.json');
        if (!res.ok) {
          res = await fetch(REMOTE_GEOJSON_URL);
        }
        const json = await res.json();
        if (isMounted) {
          setGeoData(json);
        }
      } catch (err) {
        console.warn('⚠️ [OfficeMap] Local GeoJSON fetch notice, retrying remote URL:', err);
        try {
          const fallbackRes = await fetch(REMOTE_GEOJSON_URL);
          const fallbackJson = await fallbackRes.json();
          if (isMounted) {
            setGeoData(fallbackJson);
          }
        } catch (fallbackErr) {
          console.error('❌ [OfficeMap] Failed to load Indian States GeoJSON:', fallbackErr);
        }
      } finally {
        if (isMounted) {
          setLoadingGeo(false);
        }
      }
    }

    fetchIndiaGeoJson();

    return () => {
      isMounted = false;
    };
  }, []);

  // Brand Blue GeoJSON path styling: fillColor #44a0e3, fillOpacity 0.1, border #44a0e3, weight 1
  const geoJsonStyle = useMemo(() => {
    return () => ({
      fillColor: '#44a0e3',
      fillOpacity: 0.1,
      color: '#44a0e3',
      weight: 1,
      opacity: 0.85,
    });
  }, []);

  // Interactive subtle hover reaction on states
  const onEachFeature = (_feature: any, layer: any) => {
    layer.on({
      mouseover: (e: any) => {
        const target = e.target;
        target.setStyle({
          fillColor: '#44a0e3',
          fillOpacity: 0.22,
          weight: 1.5,
          color: '#0284c7',
        });
      },
      mouseout: (e: any) => {
        const target = e.target;
        target.setStyle({
          fillColor: '#44a0e3',
          fillOpacity: 0.1,
          weight: 1,
          color: '#44a0e3',
        });
      },
    });
  };

  // Compile markers from warehouse locations & ensure Pune HQ is present
  const markers = useMemo(() => {
    const rawLocations = Array.isArray(locations) && locations.length > 0
      ? locations
      : [
          'Pune, Maharashtra (Headquarters)',
          'Bhiwandi, Maharashtra',
          'Ahmedabad, Gujarat',
          'Bengaluru, Karnataka',
          'Chennai, Tamil Nadu',
          'Jaipur, Rajasthan',
          'Kolkata, West Bengal',
          'Hyderabad, Telangana',
          'Noida, Delhi NCR',
          'Goa',
          'Muktainagar, Maharashtra',
          'Bhubaneshwar, Odisha',
          'Ludhiana, Punjab',
        ];

    const hasPune = rawLocations.some(
      (loc) => loc.toLowerCase().includes('pune') || loc.toLowerCase().includes('vardhaman')
    );
    const activeLocations = hasPune
      ? rawLocations
      : ['Pune, Maharashtra (Headquarters)', ...rawLocations];

    return activeLocations
      .map((loc) => {
        const coords = resolveCoordinates(loc);
        if (!coords) return null;
        const isHq = loc.toLowerCase().includes('pune') || loc.toLowerCase().includes('headquarters');
        return {
          label: loc,
          coords,
          isHq,
        };
      })
      .filter((m): m is { label: string; coords: [number, number]; isHq: boolean } => m !== null);
  }, [locations]);

  return (
    <div
      className={
        className ||
        'w-full h-full rounded-2xl overflow-hidden relative z-0 bg-[#fdfcf8]'
      }
    >
      {/* Self-contained CSS injection for custom reflective marker and badge styling */}
      <style>{`
        .custom-leaflet-div-icon {
          background: transparent !important;
          border: none !important;
        }
        .hq-badge {
          position: absolute;
          top: -6px;
          right: -8px;
          background-color: #0f172a;
          color: #ffffff;
          font-size: 8px;
          font-weight: 700;
          font-family: 'Poppins', sans-serif;
          padding: 1px 4px;
          border-radius: 4px;
          border: 1px solid rgba(68, 160, 227, 0.6);
          letter-spacing: 0.5px;
          line-height: 1.2;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          white-space: nowrap;
          pointer-events: none;
        }
      `}</style>

      {/* Loading Skeleton */}
      {loadingGeo && !geoData && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#fdfcf8] z-20 pointer-events-none">
          <div className="flex items-center gap-2 text-xs font-poppins text-slate-500 font-medium">
            <div className="w-4 h-4 border-2 border-[#44a0e3] border-t-transparent rounded-full animate-spin"></div>
            Loading India Map...
          </div>
        </div>
      )}

      <MapContainer
        center={[22.9074, 79.3810]}
        zoom={5}
        minZoom={4}
        maxBounds={[
          [6.5, 68.0],
          [37.5, 97.5],
        ]}
        maxBoundsViscosity={1.0}
        scrollWheelZoom={false}
        className="w-full h-full"
        style={{ backgroundColor: '#fdfcf8' }}
      >
        {/* Render India State Boundaries with Brand Blue Paths (No raster tiles) */}
        {geoData && (
          <GeoJSON
            key="india-states-geojson-telangana"
            data={geoData}
            style={geoJsonStyle}
            onEachFeature={onEachFeature}
          />
        )}

        {/* Custom Reflective Pin Markers for each Fulfillment Hub & HQ */}
        {markers.map((marker, idx) => (
          <Marker
            key={idx}
            position={marker.coords}
            icon={createReflectivePinIcon(marker.isHq)}
          >
            <Popup>
              <div className="font-poppins text-xs font-medium text-slate-800 p-0.5">
                <strong className="text-[#44a0e3] block mb-0.5 font-bold text-xs">
                  {marker.isHq ? 'Kingsol Energy HQ' : 'Kingsol Fulfillment Hub'}
                </strong>
                <span className="text-slate-600 block">{marker.label}</span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default OfficeMap;
