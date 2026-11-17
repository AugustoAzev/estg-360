import { useEffect, useMemo } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import type { LocationItem } from './data/locations';
import 'leaflet/dist/leaflet.css';

type CityMapProps = {
  locations: LocationItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  onView: (id: string) => void;
};

const getPosition = (location: LocationItem): [number, number] => [
  location.coordinates.latitude,
  location.coordinates.longitude
];

function MapBounds({ locations }: { locations: LocationItem[] }) {
  const map = useMap();

  useEffect(() => {
    map.fitBounds(locations.map(getPosition), {
      padding: [48, 48],
      maxZoom: 16,
      animate: false
    });
  }, [locations, map]);

  return null;
}

function LocationMarker({
  location,
  selected,
  onSelect,
  onView
}: {
  location: LocationItem;
  selected: boolean;
  onSelect: (id: string) => void;
  onView: (id: string) => void;
}) {
  const icon = useMemo(
    () =>
      L.divIcon({
        className: `city-map-marker${selected ? ' selected' : ''}`,
        html: '<span class="city-map-pin"></span>',
        iconSize: [24, 34],
        iconAnchor: [12, 34],
        popupAnchor: [0, -30]
      }),
    [selected]
  );

  return (
    <Marker
      position={getPosition(location)}
      icon={icon}
      title={location.name}
      alt={`Selecionar ${location.name}`}
      eventHandlers={{ click: () => onSelect(location.id) }}
    >
      <Popup>
        <div className="city-map-popup-content">
          <img src={location.panoramas.current.imageUrl} alt={`Vista atual de ${location.name}`} />
          <div>
            <strong>{location.name}</strong>
            <small>
              {location.coordinates.latitude.toFixed(6)}, {location.coordinates.longitude.toFixed(6)}
            </small>
            <button type="button" className="preview-button" onClick={() => onView(location.id)}>
              Ver local
            </button>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

export default function CityMap({ locations, selectedId, onSelect, onView }: CityMapProps) {
  return (
    <MapContainer
      center={getPosition(locations[0])}
      zoom={16}
      dragging={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      touchZoom={false}
      boxZoom={false}
      keyboard={false}
      zoomControl={false}
      className="city-map"
      aria-label="Mapa interativo de Itacoatiara com pontos históricos"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapBounds locations={locations} />
      {locations.map((location) => (
        <LocationMarker
          key={location.id}
          location={location}
          selected={location.id === selectedId}
          onSelect={onSelect}
          onView={onView}
        />
      ))}
    </MapContainer>
  );
}
