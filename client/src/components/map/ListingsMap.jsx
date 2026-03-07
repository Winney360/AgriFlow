import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';

const markerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export const ListingsMap = ({ products }) => {
  const fallbackCenter = [-1.286389, 36.817223];
  const center = products?.length
    ? [products[0].location.latitude, products[0].location.longitude]
    : fallbackCenter;

  return (
    <div className="h-80 overflow-hidden rounded-2xl border border-[var(--outline)] md:h-[460px]">
      <MapContainer center={center} zoom={7} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {products.map((product) => (
          <Marker
            key={product._id}
            icon={markerIcon}
            position={[product.location.latitude, product.location.longitude]}
          >
            <Popup>
              <div className="space-y-1">
                <p className="font-bold">{product.title}</p>
                <p>{product.location.locationName || 'Unnamed location'}</p>
                <Link to={`/products/${product._id}`} className="text-[var(--primary)] underline">
                  View product
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
