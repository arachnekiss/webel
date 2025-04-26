import React from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Resource } from '@/types';
import ResourceCard from '@/components/ui/ResourceCard';
import { useDeviceDetect } from '@/lib/useDeviceDetect';

const FreeResources: React.FC = () => {
  const { data: resources, isLoading } = useQuery<Resource[]>({
    queryKey: ['/api/resources'],
  });
  
  const { isMobile, isTablet } = useDeviceDetect();
  
  // Determine number of cards to show based on device
  const getCardsToShow = () => {
    if (isMobile) return 2;
    if (isTablet) return 3;
    return 4;
  };
  
  const cardsToShow = getCardsToShow();

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">인기 무료 리소스</h2>
        <Link href="/resources">
          <a className="text-primary hover:underline text-sm font-medium">모두 보기</a>
        </Link>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array(cardsToShow).fill(0).map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : resources && resources.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {resources.slice(0, cardsToShow).map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <p className="text-gray-600">이용 가능한 리소스가 없습니다.</p>
        </div>
      )}
    </section>
  );
};

export default FreeResources;
