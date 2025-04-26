import React, { useState } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Auction } from '@/types';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CategoryNav from '@/components/layout/CategoryNav';
import AuctionCard from '@/components/ui/AuctionCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Auctions: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>("all");
  
  const { data: auctions, isLoading } = useQuery<Auction[]>({
    queryKey: ['/api/auctions/active'],
  });
  
  // Filter auctions by search query and type
  const filteredAuctions = auctions?.filter(auction => {
    // Apply type filter
    if (filterType !== "all" && auction.auctionType !== filterType) {
      return false;
    }
    
    // Apply search filter
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      auction.title.toLowerCase().includes(query) ||
      auction.description.toLowerCase().includes(query) ||
      auction.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  });
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <CategoryNav />
      
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">역경매 시스템</h1>
            <p className="text-gray-600">
              엔지니어와 제조업체에게 프로젝트를 의뢰하고 최적의 제안을 받아보세요.
            </p>
          </div>
          <Link href="/auctions/create">
            <Button className="flex items-center gap-2 bg-primary text-white hover:bg-blue-600">
              <Plus className="h-4 w-4" />
              <span>새 프로젝트 등록</span>
            </Button>
          </Link>
        </div>
        
        {/* Search and filter controls */}
        <div className="bg-white rounded-lg shadow p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Input 
                type="text" 
                placeholder="프로젝트 검색..." 
                className="w-full pr-10" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            
            <div className="flex gap-4 w-full md:w-auto">
              <div className="w-40">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="타입 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">모든 타입</SelectItem>
                    <SelectItem value="3d_printing">3D 프린팅</SelectItem>
                    <SelectItem value="electronics">전자 회로</SelectItem>
                    <SelectItem value="woodworking">목공</SelectItem>
                    <SelectItem value="metalworking">금속 가공</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery('');
                  setFilterType('all');
                }}
                disabled={!searchQuery && filterType === 'all'}
              >
                필터 초기화
              </Button>
            </div>
          </div>
        </div>
        
        {/* Auctions grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : filteredAuctions && filteredAuctions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAuctions.map((auction) => (
              <AuctionCard key={auction.id} auction={auction} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 p-8 rounded-lg text-center">
            <p className="text-gray-600 mb-4">
              {searchQuery || filterType !== 'all'
                ? '검색 조건에 맞는 프로젝트가 없습니다.' 
                : '현재 진행 중인 역경매가 없습니다.'}
            </p>
            {(searchQuery || filterType !== 'all') && (
              <Button 
                className="mr-4 bg-primary text-white hover:bg-blue-600"
                onClick={() => {
                  setSearchQuery('');
                  setFilterType('all');
                }}
              >
                모든 프로젝트 보기
              </Button>
            )}
            <Link href="/auctions/create">
              <Button className="mt-2 md:mt-0 bg-accent text-white hover:bg-amber-600">
                새 프로젝트 등록하기
              </Button>
            </Link>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Auctions;
