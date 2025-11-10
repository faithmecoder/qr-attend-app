import { useState, useEffect } from 'react';

const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // Start loading immediately

  useEffect(() => {
    // This effect runs only once when the hook is mounted
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }

    // Get the current position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        // e.g., "User denied Geolocation"
        setError(`Geolocation Error: ${err.message}`);
        setLoading(false);
      }
    );
  }, []); // The empty dependency array ensures this runs only once on mount

  return { location, error, loading };
};

export default useGeolocation;