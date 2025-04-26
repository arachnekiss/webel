import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Location } from '@/types';

interface LocationContextType {
  currentLocation: Location | null;
  isLoading: boolean;
  error: string | null;
  getLocation: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function getLocation() {
    if (!navigator.geolocation) {
      setError('브라우저가 위치 정보를 지원하지 않습니다.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });

      // In a real app, we might use a geocoding service to get the address from coordinates
      // For now, we'll just store the coordinates
      setCurrentLocation({
        lat: position.coords.latitude,
        long: position.coords.longitude,
        address: '내 현재 위치' // This would normally be set by a reverse geocoding API
      });
    } catch (err) {
      setError('위치 정보를 가져올 수 없습니다. 위치 서비스를 허용해주세요.');
      console.error('Error getting location:', err);
    } finally {
      setIsLoading(false);
    }
  }

  // Try to get location when the component mounts
  useEffect(() => {
    getLocation();
  }, []);

  return (
    <LocationContext.Provider value={{ currentLocation, isLoading, error, getLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
