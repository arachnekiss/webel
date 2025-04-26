import React, { useState } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Auction, Bid, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, MapPin, User as UserIcon, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const AuctionDetail: React.FC = () => {
  const { id } = useParams();
  const auctionId = parseInt(id || '0');
  const { toast } = useToast();
  
  const [bidAmount, setBidAmount] = useState<string>('');
  const [bidDescription, setBidDescription] = useState<string>('');
  
  const { data: auction, isLoading: auctionLoading } = useQuery<Auction>({
    queryKey: [`/api/auctions/${auctionId}`],
    enabled: !isNaN(auctionId)
  });
  
  const { data: bids, isLoading: bidsLoading } = useQuery<Bid[]>({
    queryKey: [`/api/auctions/${auctionId}/bids`],
    enabled: !isNaN(auctionId) && !!auction
  });
  
  const { data: creator, isLoading: creatorLoading } = useQuery<User>({
    queryKey: [`/api/users/${auction?.userId}`],
    enabled: !!auction?.userId
  });
  
  // Calculate days remaining until deadline
  const getDaysRemaining = () => {
    if (!auction) return 0;
    
    const deadline = new Date(auction.deadline);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!auction) return;
    
    // Simple validation
    if (!bidAmount || parseInt(bidAmount) <= 0) {
      toast({
        title: "입력 오류",
        description: "유효한 금액을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, you'd submit this to the API
    // For this demo, we'll just show a success toast
    toast({
      title: "견적 제안 완료",
      description: `${parseInt(bidAmount).toLocaleString()}원 금액으로 견적이 제안되었습니다.`,
    });
    
    // Reset form
    setBidAmount('');
    setBidDescription('');
  };
  
  if (auctionLoading || creatorLoading) {
    return (
      <main className="container mx-auto px-4 py-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-300 rounded-lg mb-6"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="h-10 bg-gray-200 rounded w-1/4"></div>
        </div>
      </main>
    );
  }
  
  if (!auction) {
    return (
      <main className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">프로젝트를 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-6">요청하신 프로젝트가 존재하지 않거나 마감되었을 수 있습니다.</p>
          <Link href="/auctions">
            <Button className="bg-primary text-white hover:bg-blue-600">
              역경매 목록으로 돌아가기
            </Button>
          </Link>
        </div>
      </main>
    );
  }
  
  return (
    <main className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Link href="/auctions">
          <Button variant="link" className="inline-flex items-center text-primary hover:underline p-0">
            <ArrowLeft className="h-4 w-4 mr-1" />
            역경매 목록으로 돌아가기
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Auction details */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-2xl font-bold">{auction.title}</CardTitle>
              <div className="flex flex-wrap gap-2 mt-3">
                {auction.tags && auction.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-line mb-6">{auction.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-gray-800">마감일</h3>
                    <p className="text-gray-600">{formatDate(auction.deadline)}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-gray-800">남은 기간</h3>
                    <p className="text-gray-600">{getDaysRemaining()}일</p>
                  </div>
                </div>
                
                {auction.location && (
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-gray-800">선호 지역</h3>
                      <p className="text-gray-600">{auction.location.address}</p>
                    </div>
                  </div>
                )}
                
                {creator && (
                  <div className="flex items-start">
                    <UserIcon className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-gray-800">등록자</h3>
                      <p className="text-gray-600">{creator.fullName || creator.username}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-gray-800">현재 최저 제안가</h3>
                    <p className="text-xl font-bold text-blue-700">
                      {auction.currentLowestBid 
                        ? `₩${auction.currentLowestBid.toLocaleString()}` 
                        : '아직 없음'}
                    </p>
                  </div>
                  <div className="text-right">
                    <h3 className="font-medium text-gray-800">총 제안 수</h3>
                    <p className="text-xl font-bold text-blue-700">{auction.bidCount}</p>
                  </div>
                </div>
              </div>
              
              {/* Bid list */}
              {bidsLoading ? (
                <div className="animate-pulse space-y-3">
                  {Array(3).fill(0).map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : bids && bids.length > 0 ? (
                <div>
                  <h3 className="font-semibold text-lg mb-3">제안 내역</h3>
                  <div className="space-y-3">
                    {bids.map((bid) => (
                      <div key={bid.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-center">
                          <p className="font-medium">₩{bid.amount.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">{formatDate(bid.createdAt)}</p>
                        </div>
                        {bid.description && (
                          <p className="text-sm text-gray-600 mt-1">{bid.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">아직 제안이 없습니다. 첫 번째 제안을 해보세요!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Bid form */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>견적 제안하기</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBidSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="bid-amount" className="block text-sm font-medium text-gray-700 mb-1">
                      제안 금액 (원)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₩</span>
                      <Input 
                        id="bid-amount"
                        type="number" 
                        className="pl-8" 
                        placeholder="금액 입력" 
                        min="1000"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="bid-description" className="block text-sm font-medium text-gray-700 mb-1">
                      견적 설명 (선택사항)
                    </label>
                    <Textarea 
                      id="bid-description"
                      placeholder="어떤 서비스를 제공할 수 있는지 설명해주세요." 
                      rows={4}
                      value={bidDescription}
                      onChange={(e) => setBidDescription(e.target.value)}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-primary text-white hover:bg-blue-600"
                    disabled={!bidAmount || parseInt(bidAmount) <= 0}
                  >
                    견적 제출하기
                  </Button>
                </div>
              </form>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-800 mb-2">견적 제안 시 참고사항</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• 제안된 견적은 취소할 수 없습니다.</li>
                  <li>• 마감일 이전까지 여러 번 견적을 제안할 수 있습니다.</li>
                  <li>• 의뢰인이 견적을 수락하면 알림을 받게 됩니다.</li>
                  <li>• 수수료는 거래 금액의 5%입니다.</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default AuctionDetail;