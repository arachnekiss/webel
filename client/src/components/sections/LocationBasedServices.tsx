import React, { useState } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from '@/contexts/LocationContext';
import { Service } from '@/types';
import LocationCard from '@/components/ui/LocationCard';
import { useDeviceDetect } from '@/lib/useDeviceDetect';
import { Button } from '@/components/ui/button';
import { MapPin, ArrowRight, Compass, Sparkles } from 'lucide-react';

const LocationBasedServices: React.FC = () => {
  const { currentLocation, isLoading: locationLoading, error: locationError, getLocation } = useLocation();
  const { isMobile } = useDeviceDetect();
  
  // Define query based on location
  const { data: services, isLoading: servicesLoading } = useQuery<Service[]>({
    queryKey: [
      currentLocation 
        ? `/api/services/nearby?lat=${currentLocation.lat}&long=${currentLocation.long}&maxDistance=10` 
        : '/api/services'
    ],
    enabled: !locationLoading
  });

  // Determine number of cards to show based on device
  const cardsToShow = isMobile ? 2 : 4;

  return (
    <section className="rounded-3xl overflow-hidden border border-slate-100 shadow-xl bg-white">
      {/* 헤더 부분 */}
      <div className="bg-slate-50 px-6 py-8 border-b border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center mb-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 mr-3">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800">내 근처 서비스</h2>
            </div>
            <p className="text-slate-500 md:max-w-lg">
              현재 위치 주변의 3D 프린터 및 기타 제작 서비스를 찾아보세요
            </p>
          </div>
          
          <Link href="/services">
            <Button variant="outline" className="group md:self-start rounded-lg border-slate-200 hover:border-primary hover:bg-primary/5 transition-all">
              모든 서비스 보기
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
      
      {/* 콘텐츠 부분 */}
      <div className="p-6">
        {locationLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
              <Compass className="h-6 w-6 text-primary" />
            </div>
            <p className="text-slate-600 font-medium">위치 정보를 가져오는 중...</p>
            <p className="text-slate-400 text-sm mt-2 max-w-sm">현재 위치를 파악하여 근처의 서비스를 찾고 있습니다</p>
          </div>
        ) : locationError ? (
          <div className="bg-slate-50 border border-slate-200 p-8 rounded-xl text-center">
            <div className="bg-red-50 w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-4 text-red-500">
              <MapPin className="h-6 w-6" />
            </div>
            <p className="text-slate-800 font-medium mb-2">위치 정보를 사용할 수 없습니다</p>
            <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">{locationError}</p>
            <Button 
              onClick={() => getLocation()}
              className="bg-primary hover:bg-primary/90 text-white">
              위치 정보 다시 가져오기
            </Button>
          </div>
        ) : servicesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array(cardsToShow).fill(0).map((_, i) => (
              <div key={i} className="h-72 bg-slate-100 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : services && services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.slice(0, cardsToShow).map((service) => (
              <LocationCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-100 p-8 rounded-xl text-center">
            <div className="bg-blue-50 w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <p className="text-slate-800 font-medium mb-2">근처에 이용 가능한 서비스가 없습니다</p>
            <p className="text-slate-500 text-sm mb-6">다른 지역의 서비스를 찾아보거나 새로운 위치에서 시도해보세요</p>
            <Link href="/services">
              <Button className="bg-primary hover:bg-primary/90 text-white">
                모든 서비스 보기
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default LocationBasedServices;
