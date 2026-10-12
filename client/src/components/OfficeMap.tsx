import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icon missing in React-Leaflet builds
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Known coordinates for Indian warehouse hubs & commercial regions
const CITY_COORDINATES: Record<string, [number, number]> = {
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
  pune: [18.5912, 73.7389],
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

interface OfficeMapProps {
  addressText?: string;
  center?: [number, number];
  zoom?: number;
  locations?: string[];
  className?: string;
}

export const OfficeMap: React.FC<OfficeMapProps> = ({
  addressText = 'Third floor Shop. no. 326, Vardhaman Moonstone, Pune.',
  center,
  zoom,
  locations,
  className,
}) => {
  const isMultiLocation = Array.isArray(locations) && locations.length > 0;
  const defaultCenter: [number, number] = isMultiLocation
    ? [21.7679, 78.8718] // Centered on India
    : [18.5912, 73.7389]; // Pune HQ
  const mapCenter = center || defaultCenter;
  const mapZoom = zoom ?? (isMultiLocation ? 5 : 15);

  const resolvedMarkers = isMultiLocation
    ? locations
        .map((loc) => {
          const coords = resolveCoordinates(loc);
          return coords ? { label: loc, coords } : null;
        })
        .filter((item): item is { label: string; coords: [number, number] } => item !== null)
    : [];

  return (
    <div
      className={
        className ||
        'w-full h-[350px] md:h-[450px] rounded-2xl overflow-hidden shadow-md border border-slate-200/80 relative z-0'
      }
    >
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        {isMultiLocation ? (
          resolvedMarkers.map((marker, idx) => (
            <Marker key={idx} position={marker.coords}>
              <Popup>
                <div className="font-poppins text-xs font-medium text-slate-800">
                  <strong className="text-[#44a0e3] block mb-1">Kingsol Distribution Hub</strong>
                  {marker.label}
                </div>
              </Popup>
            </Marker>
          ))
        ) : (
          <Marker position={mapCenter}>
            <Popup>
              <div className="font-poppins text-xs font-medium text-slate-800">
                <strong className="text-[#44a0e3] block mb-1">Kingsol Energy HQ</strong>
                {addressText}
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default OfficeMap;
