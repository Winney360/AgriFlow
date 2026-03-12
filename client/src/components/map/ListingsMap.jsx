import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { ENGLISH_MAP_TILE_URL } from '../../lib/mapTiles';

const markerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export const ListingsMap = ({ products }) => {
  const fallbackCenter = [-1.286389, 36.817223];
  const mappableProducts = (products || []).filter(
    (product) =>
      Number.isFinite(product?.location?.latitude) &&
      Number.isFinite(product?.location?.longitude),
  );

  const center = mappableProducts.length
    ? [mappableProducts[0].location.latitude, mappableProducts[0].location.longitude]
    : fallbackCenter;

  return (
    <div className="h-80 overflow-hidden rounded-2xl border border-(--outline) md:h-115">
      <MapContainer center={center} zoom={7} className="h-full w-full" attributionControl={false}>
        <TileLayer url={ENGLISH_MAP_TILE_URL} />
        {mappableProducts.map((product) => (
          <Marker
            key={product._id}
            icon={markerIcon}
            position={[product.location.latitude, product.location.longitude]}
          >
            <Popup>
              <div className="space-y-1">
                <p className="font-bold">{product.title}</p>
                <p>{product.location.locationName || 'Unnamed location'}</p>
                <Link to={`/products/${product._id}`} className="text-(--primary) underline">
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
