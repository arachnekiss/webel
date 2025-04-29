import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Loader2, Search, Wrench, Star, Clock, Zap } from 'lucide-react';
import { getQueryFn } from '@/lib/queryClient';
import { Service } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Engineers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('rating'); // rating, experience, hourly_rate

  // 엔지니어 데이터 가져오기
  const { data: engineers, isLoading, error } = useQuery<Service[]>({
    queryKey: ['/api/services/type/engineer'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
  });

  // 검색어 및 정렬 적용
  const filteredEngineers = React.useMemo(() => {
    if (!engineers) return [];
    
    let result = [...engineers];
    
    // 검색어 필터링
    if (searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (engineer) =>
          engineer.title.toLowerCase().includes(searchLower) ||
          engineer.description.toLowerCase().includes(searchLower) ||
          (engineer.specialty && engineer.specialty.toLowerCase().includes(searchLower)) ||
          (engineer.tags && engineer.tags.some(tag => tag.toLowerCase().includes(searchLower)))
      );
    }
    
    // 정렬 적용
    switch (sortBy) {
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'experience':
        result.sort((a, b) => (b.experience || 0) - (a.experience || 0));
        break;
      case 'hourly_rate':
        result.sort((a, b) => (a.hourlyRate || 0) - (b.hourlyRate || 0));
        break;
      default:
        break;
    }
    
    return result;
  }, [engineers, searchTerm, sortBy]);

  // 로딩 중 표시
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // 에러 표시
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold text-destructive mb-2">오류 발생</h1>
        <p className="text-muted-foreground">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col mb-8">
        <h1 className="text-3xl font-bold">엔지니어 찾기</h1>
        <p className="text-muted-foreground mt-2">
          원하는 제품의 조립이나 수리를 도와줄 전문 엔지니어를 찾아보세요.
        </p>
      </div>
      
      {/* 검색 및 필터 섹션 */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="엔지니어, 전문 분야, 또는 조립/수리할 제품 검색..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-48">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="정렬 기준" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">평점순</SelectItem>
              <SelectItem value="experience">경험순</SelectItem>
              <SelectItem value="hourly_rate">요금순</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* 엔지니어 목록 */}
      {filteredEngineers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEngineers.map((engineer) => (
            <EngineerCard key={engineer.id} engineer={engineer} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">엔지니어를 찾을 수 없습니다</h3>
          <p className="text-muted-foreground mb-4">
            검색어를 변경하거나 다른 필터를 적용해보세요.
          </p>
          <Button onClick={() => setSearchTerm('')}>모든 엔지니어 보기</Button>
        </div>
      )}
    </div>
  );
}

// 엔지니어 카드 컴포넌트
function EngineerCard({ engineer }: { engineer: Service }) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{engineer.title}</CardTitle>
          <div className="flex items-center text-yellow-500">
            <Star className="h-4 w-4 fill-current" />
            <span className="ml-1 text-sm font-medium">
              {engineer.rating?.toFixed(1) || '신규'}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {engineer.specialty && (
            <Badge variant="outline" className="bg-primary/5">
              {engineer.specialty}
            </Badge>
          )}
          {engineer.tags && engineer.tags.slice(0, 2).map((tag, index) => (
            <Badge key={index} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm line-clamp-3">
          {engineer.description}
        </p>
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="flex items-center">
            <Clock className="h-4 w-4 text-muted-foreground mr-2" />
            <span className="text-sm">{engineer.experience || 0}년 경력</span>
          </div>
          <div className="flex items-center">
            <Zap className="h-4 w-4 text-muted-foreground mr-2" />
            <span className="text-sm">{engineer.hourlyRate?.toLocaleString() || '0'}원/시간</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Link href={`/services/${engineer.id}`}>
          <Button variant="outline" className="w-full">상세 정보 보기</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}