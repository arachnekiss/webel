import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Location 타입 직접 정의
interface Location {
  lat: number;
  long: number;
  address: string;
  city?: string;
  country?: string;
}

interface LocationContextType {
  currentLocation: Location | null;
  isLoading: boolean;
  error: string | null;
  getLocation: () => Promise<void>;
}

export const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // 초기 상태를 로딩 중으로 변경
  const [error, setError] = useState<string | null>(null);

  // 위치 정보 가져오기 함수
  async function getLocation() {
    if (!navigator.geolocation) {
      setError('브라우저가 위치 정보를 지원하지 않습니다.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 8000, // 시간 제한 약간 증가
          maximumAge: 30000 // 캐시된 위치를 사용할 수 있는 시간 증가
        });
      });

      // 위치 정보 구하기
      const reversedGeocode = await reverseGeocodeCoordinates(
        position.coords.latitude, 
        position.coords.longitude
      );

      setCurrentLocation({
        lat: position.coords.latitude,
        long: position.coords.longitude,
        address: reversedGeocode
      });
    } catch (err: any) {
      let errorMsg = '위치 정보를 가져올 수 없습니다.';
      
      if (err.code) {
        switch (err.code) {
          case 1: // PERMISSION_DENIED
            errorMsg = '위치 정보 접근 권한이 거부되었습니다. 브라우저 설정에서 권한을 허용해주세요.';
            break;
          case 2: // POSITION_UNAVAILABLE
            errorMsg = '현재 위치 정보를 사용할 수 없습니다.';
            break;
          case 3: // TIMEOUT
            errorMsg = '위치 정보 요청 시간이 초과되었습니다.';
            break;
        }
      }
      
      setError(errorMsg);
      console.error('Error getting location:', err);
      
      // 기본 위치 설정 (서울)
      setCurrentLocation({
        lat: 37.5665,
        long: 126.9780,
        address: '서울특별시'
      });
    } finally {
      setIsLoading(false);
    }
  }

  // 좌표를 주소로 변환하는 함수 (실제로는 더 복잡할 수 있음)
  async function reverseGeocodeCoordinates(lat: number, long: number): Promise<string> {
    // 여기서는 간단한 구현만 함. 실제로는 Google Maps, Kakao Maps 등의 API를 사용할 수 있음
    // 좌표 근처 주요 도시 추정
    if (lat > 37.4 && lat < 37.7 && long > 126.8 && long < 127.2) {
      return '서울특별시';
    } else if (lat > 35.0 && lat < 35.3 && long > 128.9 && long < 129.2) {
      return '부산광역시';
    } else if (lat > 37.3 && lat < 37.6 && long > 126.6 && long < 126.8) {
      return '인천광역시';
    } else if (lat > 35.1 && lat < 35.3 && long > 126.8 && long < 127.0) {
      return '광주광역시';
    } else if (lat > 35.8 && lat < 36.0 && long > 128.5 && long < 128.7) {
      return '대구광역시';
    } else if (lat > 36.3 && lat < 36.4 && long > 127.3 && long < 127.5) {
      return '대전광역시';
    }
    
    return '내 현재 위치';
  }

  // 컴포넌트가 마운트될 때 위치 정보 자동으로 가져오기
  useEffect(() => {
    getLocation();
  }, []);

  return (
    <LocationContext.Provider value={{ currentLocation, isLoading, error, getLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation(): LocationContextType {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
