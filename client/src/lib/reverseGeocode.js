import axios from 'axios';

export const reverseGeocode = async (lat, lng) => {
  // Use OpenStreetMap Nominatim API for free reverse geocoding
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
  const response = await axios.get(url);
  return response.data.display_name || '';
};
