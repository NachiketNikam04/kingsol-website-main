import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, GeoJSON, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

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

// Factory function for custom pulsing markers (#44a0e3)
const createPulsingIcon = (isHq: boolean) => {
  return L.divIcon({
    className: 'custom-leaflet-div-icon',
    html: `
      <div class="leaflet-pulsing-marker-wrapper">
        <div class="pulse-ring"></div>
        <div class="pulse-dot"></div>
        ${isHq ? '<div class="hq-badge">HQ</div>' : ''}
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -15],
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

  // Fetch GeoJSON of Indian States (local optimized asset with remote fallback)
  useEffect(() => {
    let isMounted = true;

    async function fetchIndiaGeoJson() {
      setLoadingGeo(true);
      try {
        let res = await fetch('/india-states.json');
        if (!res.ok) {
          res = await fetch(
            'https://raw.githubusercontent.com/Subhash9325/GeoJson-Data-of-Indian-States/master/Indian_States'
          );
        }
        const json = await res.json();
        if (isMounted) {
          setGeoData(json);
        }
      } catch (err) {
        console.warn('⚠️ [OfficeMap] Local GeoJSON fetch notice, retrying remote:', err);
        try {
          const fallbackRes = await fetch(
            'https://raw.githubusercontent.com/Subhash9325/GeoJson-Data-of-Indian-States/master/Indian_States'
          );
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

  // India States Path Styling: light green/gray fill (#e6efe9) with dark gray/black borders (#333)
  const geoJsonStyle = useMemo(() => {
    return () => ({
      fillColor: '#e6efe9',
      fillOpacity: 1,
      color: '#333333',
      weight: 1,
      opacity: 0.85,
    });
  }, []);

  // Slight hover reaction on states
  const onEachFeature = (_feature: any, layer: any) => {
    layer.on({
      mouseover: (e: any) => {
        const target = e.target;
        target.setStyle({
          fillColor: '#dbe8df',
          weight: 1.5,
          color: '#1e293b',
        });
      },
      mouseout: (e: any) => {
        const target = e.target;
        target.setStyle({
          fillColor: '#e6efe9',
          weight: 1,
          color: '#333333',
        });
      },
    });
  };

  // Compile markers from warehouse locations & ensure Pune HQ is present
  const markers = useMemo(() => {
    const rawLocations = Array.isArray(locations) && locations.length > 0 ? locations : [];
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
      {/* Self-contained CSS injection for custom pulsing animations and badge styling */}
      <style>{`
        .custom-leaflet-div-icon {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-pulsing-marker-wrapper {
          position: relative;
          width: 26px;
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .leaflet-pulsing-marker-wrapper .pulse-ring {
          position: absolute;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          border: 1px solid #44a0e3;
          background-color: rgba(68, 160, 227, 0.2);
          animation: kingsolMapPulse 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
          pointer-events: none;
        }
        .leaflet-pulsing-marker-wrapper .pulse-dot {
          position: relative;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: #44a0e3;
          border: 1.5px solid #ffffff;
          box-shadow: 0 0 6px rgba(68, 160, 227, 0.85);
          z-index: 2;
        }
        .leaflet-pulsing-marker-wrapper .hq-badge {
          position: absolute;
          top: 22px;
          left: 50%;
          transform: translateX(-50%);
          background-color: #0f172a;
          color: #ffffff;
          font-size: 9px;
          font-weight: 700;
          font-family: 'Poppins', sans-serif;
          padding: 1px 5px;
          border-radius: 4px;
          border: 1px solid rgba(68, 160, 227, 0.4);
          letter-spacing: 0.5px;
          line-height: 1.2;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
          white-space: nowrap;
          pointer-events: none;
          z-index: 3;
        }
        @keyframes kingsolMapPulse {
          0% {
            transform: scale(0.5);
            opacity: 1;
          }
          100% {
            transform: scale(2.3);
            opacity: 0;
          }
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
        {/* Render India State Boundaries with clean styling (No raster tiles) */}
        {geoData && (
          <GeoJSON
            key="india-states-geojson"
            data={geoData}
            style={geoJsonStyle}
            onEachFeature={onEachFeature}
          />
        )}

        {/* Custom Pulsing Markers for each Fulfillment Hub & HQ */}
        {markers.map((marker, idx) => (
          <Marker
            key={idx}
            position={marker.coords}
            icon={createPulsingIcon(marker.isHq)}
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
