import { useEffect, useState } from "react";

export function LocationSection() {
  const [deviceLocation, setDeviceLocation] = useState(null);
  const [cityData, setCityData] = useState(null);
  const [error, setError] = useState(null);

  // Cache location data in localStorage
  const cacheLocation = (coords, cityInfo) => {
    const cacheData = {
      coords,
      cityInfo,
      timestamp: Date.now(),
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // Cache for 1 week
    };
    localStorage.setItem('locationCache', JSON.stringify(cacheData));
  };

  // Get cached location data
  const getCachedLocation = () => {
    try {
      const cached = localStorage.getItem('locationCache');
      if (!cached) return null;
      
      const cacheData = JSON.parse(cached);
      
      // Check if cache is still valid (not expired)
      if (Date.now() > cacheData.expiresAt) {
        localStorage.removeItem('locationCache');
        return null;
      }
      
      return cacheData;
    } catch (err) {
      console.error('Error reading cached location:', err);
      localStorage.removeItem('locationCache');
      return null;
    }
  };

  async function getCityFromCoords(lat, lon) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      const data = await res.json();

      return {
        city: data.address.city || data.address.town || data.address.village,
        region: data.address.state,
        country: data.address.country,
      };
    } catch (err) {
      console.error("Reverse geocoding failed:", err);
      return null;
    }
  }

  useEffect(() => {
    // First check for cached location data
    const cachedData = getCachedLocation();
    if (cachedData) {
      console.log('Using cached location data');
      setDeviceLocation(cachedData.coords);
      setCityData(cachedData.cityInfo);
      return;
    }

    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          method: "navigator.geolocation",
        };
        setDeviceLocation(coords);

        // Reverse-geocode
        console.log("this is the coords", coords);
        const cityInfo = await getCityFromCoords(coords.lat, coords.lon);
        setCityData(cityInfo);

        // Cache the location if accuracy is less than 1000m
        if (coords.accuracy < 1000) {
          console.log('Caching location data (accuracy < 1000m)');
          cacheLocation(coords, cityInfo);
        } else {
          console.log('Not caching location data (accuracy >= 1000m)');
        }
      },
      (err) => {
        setError(err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  return (
    <div>
      <p>📍 Location</p>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {deviceLocation && (
        <p>
          Coordinates: {deviceLocation.lat}, {deviceLocation.lon} <br />
          Accuracy: ±{Math.round(deviceLocation.accuracy)}m
        </p>
      )}
      {cityData && (
        <p>
          {cityData.city}, {cityData.region}, {cityData.country}
        </p>
      )}
    </div>
  );
}
