import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from '@/contexts/LocationContext';
import { Service } from '@/types';
import LocationCard from '@/components/ui/LocationCard';
import { useDeviceDetect } from '@/lib/useDeviceDetect';
import { Button } from '@/components/ui/button';

const LocationBasedServices: React.FC = () => {
  const { currentLocation, isLoading: locationLoading, error: locationError } = useLocation();
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
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">내 근처 서비스</h2>
        <Link href="/services">
          <div className="text-primary hover:underline text-sm font-medium cursor-pointer">모두 보기</div>
        </Link>
      </div>
      
      {locationLoading ? (
        <div className="text-center py-10">
          <p>위치 정보를 가져오는 중...</p>
        </div>
      ) : locationError ? (
        <div className="bg-red-50 p-4 rounded-lg text-center">
          <p className="text-red-600">{locationError}</p>
          <p className="text-sm mt-2">위치 정보가 없어 모든 서비스를 보여드립니다.</p>
        </div>
      ) : servicesLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array(cardsToShow).fill(0).map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : services && services.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.slice(0, cardsToShow).map((service) => (
            <LocationCard key={service.id} service={service} />
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <p className="text-gray-600">근처에 이용 가능한 서비스가 없습니다.</p>
          <Link href="/services">
            <Button className="mt-4 bg-primary text-white px-4 py-2 rounded hover:bg-blue-600">
              모든 서비스 보기
            </Button>
          </Link>
        </div>
      )}
    </section>
  );
};

export default LocationBasedServices;
