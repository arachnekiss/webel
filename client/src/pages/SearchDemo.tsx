import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ResourceCard } from '@/components/ResourceCard';
import { ServiceCard } from '@/components/ServiceCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export default function SearchDemo() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguage] = useState('auto');
  const [searchType, setSearchType] = useState('all');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [timeElapsed, setTimeElapsed] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('resources');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset time elapsed when search params change
  useEffect(() => {
    setTimeElapsed(null);
  }, [debouncedQuery, language, searchType]);

  const { data, isLoading, error, refetch, dataUpdatedAt, isRefetching } = useQuery({
    queryKey: ['/api/search', debouncedQuery, language, searchType],
    queryFn: async () => {
      if (!debouncedQuery) return { resources: [], services: [], totalCount: 0 };
      
      const startTime = performance.now();
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(debouncedQuery)}&lang=${language}&type=${searchType}&limit=10`
      );
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data = await response.json();
      const endTime = performance.now();
      setTimeElapsed(endTime - startTime);
      return data;
    },
    enabled: debouncedQuery.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const handleSearch = () => {
    if (searchQuery.trim() === '') {
      toast({
        title: '검색어를 입력하세요',
        description: '검색할 단어 또는 문장을 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }
    
    refetch();
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">다국어 검색 데모</h1>
        <p className="text-muted-foreground">
          Stage 3: 다국어 검색 최적화 기능을 테스트해보세요. 5개 언어(한국어, 영어, 일본어, 중국어, 스페인어)로 검색할 수 있습니다.
        </p>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>검색 옵션</CardTitle>
          <CardDescription>원하는 검색 옵션을 선택하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="md:col-span-2">
              <div className="flex w-full items-center space-x-2">
                <Input
                  type="text"
                  placeholder="검색어를 입력하세요"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={searchQuery.trim() === '' || isRefetching}>
                  {isRefetching ? '검색 중...' : '검색'}
                </Button>
              </div>
            </div>
            <div>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="언어 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">자동 감지</SelectItem>
                  <SelectItem value="ko">한국어</SelectItem>
                  <SelectItem value="en">영어</SelectItem>
                  <SelectItem value="ja">일본어</SelectItem>
                  <SelectItem value="zh">중국어</SelectItem>
                  <SelectItem value="es">스페인어</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={searchType} onValueChange={setSearchType}>
                <SelectTrigger>
                  <SelectValue placeholder="검색 유형" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 콘텐츠</SelectItem>
                  <SelectItem value="resources">리소스만</SelectItem>
                  <SelectItem value="services">서비스만</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        {timeElapsed !== null && (
          <CardFooter className="flex justify-between">
            <div className="text-sm text-muted-foreground">
              <span>검색 시간: </span>
              <Badge variant="outline">{timeElapsed.toFixed(2)}ms</Badge>
            </div>
            {data && (
              <div className="text-sm">
                <span>검색 결과: </span>
                <Badge>{data.totalCount || 0}개</Badge>
              </div>
            )}
          </CardFooter>
        )}
      </Card>
      
      {error ? (
        <div className="rounded-md bg-destructive/15 p-4">
          <div className="text-destructive font-medium">검색 중 오류가 발생했습니다.</div>
          <div className="text-sm">{(error as Error).message}</div>
        </div>
      ) : isLoading && debouncedQuery ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
      ) : data && debouncedQuery ? (
        <>
          <Tabs defaultValue="resources" value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="resources">
                리소스 ({data.resources?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="services">
                서비스 ({data.services?.length || 0})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="resources">
              {data.resources && data.resources.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.resources.map((resource: any) => (
                    <ResourceCard key={resource.id} resource={resource} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">리소스 검색 결과가 없습니다.</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="services">
              {data.services && data.services.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.services.map((service: any) => (
                    <ServiceCard key={service.id} service={service} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">서비스 검색 결과가 없습니다.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          {data.normalizedQuery && (
            <div className="mt-4 p-4 bg-muted rounded-md">
              <h3 className="font-medium mb-2">검색 상세 정보</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">원본 쿼리:</span> {data.query}
                </div>
                <div>
                  <span className="font-medium">감지된 언어:</span> {data.language}
                </div>
                <div>
                  <span className="font-medium">정규화된 쿼리:</span> {data.normalizedQuery}
                </div>
                <div>
                  <span className="font-medium">총 결과 수:</span> {data.totalCount}
                </div>
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}