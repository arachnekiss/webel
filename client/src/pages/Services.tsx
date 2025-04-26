import React, { useState } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Service } from '@/types';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CategoryNav from '@/components/layout/CategoryNav';
import LocationCard from '@/components/ui/LocationCard';
import { useLocation } from '@/contexts/LocationContext';
import { MapPin, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Services: React.FC = () => {
  const { type } = useParams();
  const { currentLocation, isLoading: locationLoading, error: locationError, getLocation } = useLocation();
  const [distance, setDistance] = useState<string>("10");
  
  // Define query key based on parameters
  const queryKey = type 
    ? `/api/services/type/${type}`
    : currentLocation 
      ? `/api/services/nearby?lat=${currentLocation.lat}&long=${currentLocation.long}&maxDistance=${distance}`
      : '/api/services';
  
  const { data: services, isLoading: servicesLoading } = useQuery<Service[]>({
    queryKey: [queryKey],
    enabled: !locationLoading || !!type
  });
  
  // Get service type name for display
  const getServiceTypeName = () => {
    switch (type) {
      case '3d_printing':
        return '3D 프린팅 서비스';
      case 'electronics':
        return '전자 회로 제작 서비스';
      case 'woodworking':
        return '목공 서비스';
      case 'metalworking':
        return '금속 가공 서비스';
      case 'manufacturers':
        return '생산업체';
      default:
        return '모든 서비스';
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <CategoryNav />
      
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-3">{getServiceTypeName()}</h1>
          <p className="text-gray-600">
            필요한 서비스를 제공하는 가까운 파트너를 찾아보세요.
          </p>
        </div>
        
        {/* Location and filter controls */}
        <div className="bg-white rounded-lg shadow p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="w-full md:w-auto flex-grow">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="font-medium">내 위치:</span>
                <span className="text-gray-600">
                  {locationLoading 
                    ? '위치 가져오는 중...' 
                    : locationError 
                      ? '위치 정보 없음' 
                      : currentLocation?.address || '내 위치'}
                </span>
              </div>
            </div>
            
            <div className="flex gap-4 w-full md:w-auto">
              <div className="w-24">
                <Select value={distance} onValueChange={setDistance}>
                  <SelectTrigger>
                    <SelectValue placeholder="거리" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5km</SelectItem>
                    <SelectItem value="10">10km</SelectItem>
                    <SelectItem value="20">20km</SelectItem>
                    <SelectItem value="50">50km</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                className="whitespace-nowrap"
                onClick={() => getLocation()}
                disabled={locationLoading}
              >
                위치 새로고침
              </Button>
            </div>
          </div>
          
          {locationError && (
            <div className="mt-3 flex items-center text-amber-600 gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">{locationError}</span>
            </div>
          )}
        </div>
        
        {/* Services grid */}
        {servicesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : services && services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {services.map((service) => (
              <LocationCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 p-8 rounded-lg text-center">
            <p className="text-gray-600 mb-4">이 지역에 이용 가능한 서비스가 없습니다.</p>
            <p className="text-sm text-gray-500 mb-6">다른 지역을 검색하거나 거리 필터를 조정해보세요.</p>
            <Button 
              className="bg-primary text-white hover:bg-blue-600"
              onClick={() => getLocation()}
            >
              위치 새로고침
            </Button>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Services;
