import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { useLocation as useGeoLocation } from '@/contexts/LocationContext';
import { Service } from '@/types';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

import 'leaflet/dist/leaflet.css';

interface ServiceMapProps {
  services: Service[];
}

// 마커 아이콘 커스터마이즈
const customIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  shadowSize: [41, 41]
});

// 3D 프린터 전용 아이콘
const printerIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  shadowSize: [41, 41]
});

const ServiceMap: React.FC<ServiceMapProps> = ({ services }) => {
  const { currentLocation, getLocation } = useGeoLocation();

  useEffect(() => {
    if (!currentLocation) {
      getLocation();
    }
  }, [currentLocation, getLocation]);

  // 기본 위치 (사용자 위치를 못 가져올 경우 서울시청)
  const defaultPosition: [number, number] = currentLocation 
    ? [currentLocation.lat, currentLocation.long] 
    : [37.5665, 126.9780];
  
  return (
    <div className="h-[500px] w-full rounded-lg overflow-hidden shadow-md mb-6">
      {!currentLocation && (
        <div className="bg-blue-50 p-3 mb-3 rounded-md text-blue-800 flex items-center">
          <Printer className="mr-2 h-5 w-5" />
          <p>위치 정보를 허용하면 근처의 3D 프린터 서비스를 더 정확하게 찾을 수 있습니다.</p>
        </div>
      )}
      
      <MapContainer 
        center={defaultPosition} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* 현재 위치 마커 */}
        {currentLocation && (
          <Marker position={[currentLocation.lat, currentLocation.long]} icon={customIcon}>
            <Popup>
              현재 위치
            </Popup>
          </Marker>
        )}
        
        {/* 서비스 마커들 */}
        {services.map(service => {
          if (!service.location) return null;
          
          const position: [number, number] = [
            service.location.lat, 
            service.location.long
          ];
          
          return (
            <Marker 
              key={service.id} 
              position={position} 
              icon={service.serviceType === '3d_printing' ? printerIcon : customIcon}
            >
              <Popup>
                <div className="p-1">
                  <h3 className="font-bold text-lg">{service.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{service.description}</p>
                  <div className="mb-2">
                    {service.isIndividual ? 
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">개인</span> : 
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">비즈니스</span>
                    }
                    {service.printerModel && (
                      <span className="ml-2 bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                        {service.printerModel}
                      </span>
                    )}
                  </div>
                  {service.pricing && (
                    <p className="text-sm mb-2">
                      <span className="font-semibold">가격:</span> {service.pricing}
                    </p>
                  )}
                  <Link href={`/services/${service.id}`}>
                    <Button size="sm" className="w-full">
                      상세 정보 보기
                    </Button>
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default ServiceMap;