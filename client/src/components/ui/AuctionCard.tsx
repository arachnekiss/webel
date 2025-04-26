import React from 'react';
import { Link } from 'wouter';
import { Auction } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface AuctionCardProps {
  auction: Auction;
}

const AuctionCard: React.FC<AuctionCardProps> = ({ auction }) => {
  // Calculate days remaining
  const daysRemaining = () => {
    const deadline = new Date(auction.deadline);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  return (
    <Card className="bg-white rounded-lg shadow-md overflow-hidden">
      <CardHeader className="p-5 border-b">
        <h3 className="text-lg font-semibold text-gray-800">{auction.title}</h3>
        <p className="text-sm text-gray-600 mt-1">
          제안 마감까지 {daysRemaining()}일 남음
        </p>
      </CardHeader>
      <CardContent className="p-5">
        <p className="text-gray-600 text-sm mb-4">
          {auction.description}
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {auction.tags && auction.tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-sm text-gray-500">현재 최저가</span>
            <p className="text-lg font-semibold text-gray-800">
              {auction.currentLowestBid 
                ? `₩${auction.currentLowestBid.toLocaleString()}`
                : '아직 없음'}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-500">제안 수</span>
            <p className="text-lg font-semibold text-gray-800">{auction.bidCount}</p>
          </div>
        </div>
        <Link href={`/auctions/${auction.id}`}>
          <Button className="w-full py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors">
            견적 제안하기
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default AuctionCard;
