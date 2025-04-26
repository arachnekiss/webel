import React from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Auction } from '@/types';
import AuctionCard from '@/components/ui/AuctionCard';
import { useDeviceDetect } from '@/lib/useDeviceDetect';
import { Button } from '@/components/ui/button';

const ReverseAuction: React.FC = () => {
  const { data: auctions, isLoading } = useQuery<Auction[]>({
    queryKey: ['/api/auctions/active'],
  });
  
  const { isMobile, isTablet } = useDeviceDetect();
  
  // Determine how many cards to show based on device
  const getCardCount = () => {
    if (isMobile) return 1;
    if (isTablet) return 2;
    return 3;
  };
  
  const cardCount = getCardCount();

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">역경매 시스템</h2>
        <Link href="/auctions">
          <div className="text-primary hover:underline text-sm font-medium cursor-pointer">모든 프로젝트 보기</div>
        </Link>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array(cardCount).fill(0).map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : auctions && auctions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {auctions.slice(0, cardCount).map((auction) => (
            <AuctionCard key={auction.id} auction={auction} />
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <p className="text-gray-600">현재 진행 중인 역경매가 없습니다.</p>
          <Link href="/auctions/create">
            <Button className="mt-4 bg-primary text-white px-4 py-2 rounded hover:bg-blue-600">
              새 프로젝트 등록하기
            </Button>
          </Link>
        </div>
      )}
    </section>
  );
};

export default ReverseAuction;
