import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Loader2, Search, Wrench, Star, Clock, Zap, MapPin, Compass } from 'lucide-react';
import { getQueryFn } from '@/lib/queryClient';
import { Service } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

type Location = {
  lat: number;
  long: number;
  address: string;
};

export default function Engineers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest, rating, experience, hourly_rate
  const [useLocation, setUseLocation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [manualLocation, setManualLocation] = useState({
    address: '',
    city: '',
    country: '대한민국',
  });
  const [locationTab, setLocationTab] = useState('auto');
  const [maxDistance, setMaxDistance] = useState(10); // km 단위
  const { toast } = useToast();

  // 엔지니어 데이터 가져오기
  const { data: engineers, isLoading, error } = useQuery<Service[]>({
    queryKey: ['/api/services/type/engineer'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
  });

  // 현재 위치 정보 가져오기
  const fetchCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            long: position.coords.longitude,
            address: '현재 위치',
          });
          toast({
            title: '위치 확인 완료',
            description: '현재 위치를 기반으로 가까운 엔지니어를 찾습니다.',
          });
        },
        (error) => {
          console.error('위치 가져오기 오류:', error);
          toast({
            variant: 'destructive',
            title: '위치 확인 실패',
            description: '위치 정보를 가져올 수 없습니다. 권한을 확인하거나 수동으로 위치를 입력해주세요.',
          });
          setLocationTab('manual');
        }
      );
    } else {
      toast({
        variant: 'destructive',
        title: '위치 서비스 지원 안됨',
        description: '브라우저가 위치 서비스를 지원하지 않습니다. 수동으로 위치를 입력해주세요.',
      });
      setLocationTab('manual');
    }
  };

  // 수동 위치 입력을 위도/경도로 변환 (간단한 구현)
  const getLocationFromAddress = (): Location | null => {
    // 실제로는 지오코딩 API를 사용하는 것이 좋지만, 
    // 여기서는 간단한 한국 주요 도시의 좌표를 사용합니다.
    const cityCoordinates: Record<string, { lat: number; long: number }> = {
      '서울': { lat: 37.5665, long: 126.9780 },
      '부산': { lat: 35.1796, long: 129.0756 },
      '인천': { lat: 37.4563, long: 126.7052 },
      '대구': { lat: 35.8714, long: 128.6014 },
      '대전': { lat: 36.3504, long: 127.3845 },
      '광주': { lat: 35.1595, long: 126.8526 },
      '울산': { lat: 35.5384, long: 129.3114 },
      '세종': { lat: 36.4801, long: 127.2882 },
      '제주': { lat: 33.4996, long: 126.5312 },
    };

    // 도시 이름이 포함된 경우 해당 도시의 좌표 사용
    for (const city in cityCoordinates) {
      if (manualLocation.address.includes(city) || manualLocation.city.includes(city)) {
        return {
          lat: cityCoordinates[city].lat,
          long: cityCoordinates[city].long,
          address: `${manualLocation.city} ${manualLocation.address}`,
        };
      }
    }

    // 기본 위치 (서울 시청)
    return {
      lat: 37.5665,
      long: 126.9780,
      address: `${manualLocation.city} ${manualLocation.address}`,
    };
  };

  // 두 지점 간 거리 계산 (Haversine 공식)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // 지구의 반경 (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c; // 거리 (km)
    return d;
  };

  // 위치 탭 변경 시 처리
  useEffect(() => {
    if (locationTab === 'auto' && useLocation) {
      fetchCurrentLocation();
    }
  }, [locationTab, useLocation]);

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
    
    // 위치 기반 필터링
    if (useLocation) {
      const userLocation = locationTab === 'auto' ? currentLocation : getLocationFromAddress();
      
      if (userLocation) {
        // 각 엔지니어와의 거리 계산 및 필터링
        result = result.filter(engineer => {
          if (!engineer.location) return true;
          
          // 위치 정보가 있는 경우에만 거리 계산
          try {
            const engineerLocation = typeof engineer.location === 'string' 
              ? JSON.parse(engineer.location) 
              : engineer.location;
            
            const distance = calculateDistance(
              userLocation.lat, 
              userLocation.long, 
              engineerLocation.lat, 
              engineerLocation.long
            );
            
            // 거리 정보 추가 (UI 표시용)
            (engineer as any).distance = distance.toFixed(1);
            
            return distance <= maxDistance;
          } catch (error) {
            console.error('위치 계산 오류:', error);
            return true;
          }
        });
      }
    }
    
    // 정렬 적용
    switch (sortBy) {
      case 'newest':
        // 최신순 정렬 (생성일 기준 내림차순)
        result.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB.getTime() - dateA.getTime();
        });
        break;
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
  }, [engineers, searchTerm, sortBy, useLocation, currentLocation, manualLocation, maxDistance, locationTab]);

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
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        {/* 검색어 입력 필드 */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="엔지니어, 전문 분야, 또는 조립/수리할 제품 검색..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <div className="w-48">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="정렬 기준" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>최신순</span>
                  </SelectItem>
                  <SelectItem value="rating" className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    <span>평점순</span>
                  </SelectItem>
                  <SelectItem value="experience" className="flex items-center gap-2">
                    <Wrench className="h-4 w-4" />
                    <span>경력순</span>
                  </SelectItem>
                  <SelectItem value="hourly_rate" className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    <span>요금순</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              variant="outline"
              size="icon"
              className="h-10 w-10"
              onClick={() => {
                setSearchTerm("");
                setSortBy("newest");
              }}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* 적용된 필터 표시 */}
        {(searchTerm || sortBy !== "newest") && (
          <div className="mt-4 flex flex-wrap gap-2">
            {searchTerm && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Search className="h-3 w-3" />
                <span>검색어: {searchTerm}</span>
              </Badge>
            )}
            
            {sortBy !== "newest" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {sortBy === "rating" ? (
                  <Star className="h-3 w-3" />
                ) : sortBy === "experience" ? (
                  <Wrench className="h-3 w-3" />
                ) : (
                  <Zap className="h-3 w-3" />
                )}
                <span>
                  정렬: {
                    sortBy === "rating" ? "평점순" : 
                    sortBy === "experience" ? "경력순" : 
                    sortBy === "hourly_rate" ? "요금순" : "최신순"
                  }
                </span>
              </Badge>
            )}
          </div>
        )}
      </div>
      
      {/* 위치 필터링 섹션 */}
      <div className="bg-white rounded-lg shadow p-4 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 mb-4">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Switch
              id="use-location"
              checked={useLocation}
              onCheckedChange={setUseLocation}
            />
            <Label htmlFor="use-location" className="font-medium text-gray-800">위치 기반 필터링</Label>
            <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
              지역 전문가 찾기
            </Badge>
          </div>
          
          {useLocation && (
            <div className="flex items-center space-x-4">
              <div className="flex flex-col space-y-1">
                <Label htmlFor="max-distance" className="text-sm text-gray-600">최대 검색 거리</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="max-distance"
                    type="range"
                    min="1"
                    max="50"
                    value={maxDistance}
                    onChange={e => setMaxDistance(Number(e.target.value))}
                    className="w-32"
                  />
                  <span className="text-sm font-medium w-16 text-right">{maxDistance}km</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {useLocation && (
          <Tabs value={locationTab} onValueChange={setLocationTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="auto" className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>현재 위치 사용</span>
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center gap-1">
                <Compass className="h-4 w-4" />
                <span>수동 위치 입력</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="auto" className="space-y-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-slate-50 rounded-lg p-3">
                <div>
                  {currentLocation ? (
                    <div className="flex items-center text-sm text-gray-700">
                      <MapPin className="h-4 w-4 mr-1 text-primary" />
                      <span className="font-medium">현재 위치:</span>
                      <span className="ml-1">{currentLocation.address || '내 위치'}</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-sm text-gray-700">
                      <Compass className="h-4 w-4 mr-1 text-amber-500" />
                      <span className="text-amber-600">위치 정보를 불러오지 못했습니다.</span>
                    </div>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchCurrentLocation}
                  className="mt-2 md:mt-0"
                >
                  <MapPin className="h-4 w-4 mr-1" />
                  위치 새로고침
                </Button>
              </div>
              
              {useLocation && currentLocation && (
                <div className="text-sm text-blue-600 mt-2 flex items-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-600 mr-2"></div>
                  <span>반경 {maxDistance}km 이내의 엔지니어만 표시됩니다.</span>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="manual">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-gray-700">도시</Label>
                    <Input
                      id="city"
                      placeholder="서울, 부산 등"
                      value={manualLocation.city}
                      onChange={e => setManualLocation({...manualLocation, city: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-gray-700">상세 주소</Label>
                    <Input
                      id="address"
                      placeholder="구/동 및 상세 주소"
                      value={manualLocation.address}
                      onChange={e => setManualLocation({...manualLocation, address: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="bg-slate-50 rounded-lg p-3 flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-primary" />
                  <span className="text-sm font-medium text-gray-700">
                    입력한 위치: {manualLocation.city || '도시를 입력하세요'} {manualLocation.address || '(상세 주소를 입력하세요)'}
                  </span>
                </div>
                
                {useLocation && manualLocation.city && (
                  <div className="text-sm text-blue-600 mt-2 flex items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-600 mr-2"></div>
                    <span>반경 {maxDistance}km 이내의 엔지니어만 표시됩니다.</span>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
      
      {/* 엔지니어 목록 */}
      {filteredEngineers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEngineers.map((engineer) => (
            <EngineerCard 
              key={engineer.id} 
              engineer={engineer} 
              showDistance={useLocation && (engineer as any).distance !== undefined}
              distance={(engineer as any).distance}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">엔지니어를 찾을 수 없습니다</h3>
          <p className="text-muted-foreground mb-4">
            검색어를 변경하거나 다른 필터를 적용해보세요.
          </p>
          <Button onClick={() => {
            setSearchTerm('');
            setUseLocation(false);
          }}>모든 엔지니어 보기</Button>
        </div>
      )}
    </div>
  );
}

// 엔지니어 카드 컴포넌트
function EngineerCard({ 
  engineer, 
  showDistance = false, 
  distance 
}: { 
  engineer: Service; 
  showDistance?: boolean; 
  distance?: string;
}) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg border-slate-200 hover:border-primary/20">
      <div className="relative">
        {/* 엔지니어 이미지 (있는 경우) */}
        <div className="h-40 bg-gradient-to-br from-primary/5 to-primary/10">
          {engineer.imageUrl && (
            <img 
              src={engineer.imageUrl} 
              alt={engineer.title} 
              className="w-full h-full object-cover" 
            />
          )}
          
          {/* 평점 배지 */}
          <div className="absolute top-2 right-2 bg-white shadow-md rounded-full p-1 px-2 flex items-center">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
            <span className="text-sm font-semibold">
              {engineer.rating?.toFixed(1) || '신규'}
            </span>
          </div>
          
          {/* 거리 배지 */}
          {showDistance && distance && (
            <div className="absolute top-2 left-2 bg-white shadow-md rounded-full p-1 px-2 flex items-center">
              <MapPin className="h-4 w-4 text-primary mr-1" /> 
              <span className="text-sm font-semibold">{distance}km</span>
            </div>
          )}
        </div>
        
        {/* 콘텐츠 */}
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{engineer.title}</CardTitle>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {engineer.specialty && (
              <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary">
                {engineer.specialty}
              </Badge>
            )}
            {engineer.tags && engineer.tags.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="outline" className="bg-slate-50">
                {tag}
              </Badge>
            ))}
          </div>
        </CardHeader>
        
        <CardContent>
          <p className="text-muted-foreground text-sm line-clamp-3">
            {engineer.description}
          </p>
          
          <div className="grid grid-cols-2 gap-4 mt-4 bg-slate-50 p-3 rounded-lg">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-primary mr-2" />
              <span className="text-sm font-medium">{engineer.experience || 0}년 경력</span>
            </div>
            <div className="flex items-center">
              <Zap className="h-4 w-4 text-amber-500 mr-2" />
              <span className="text-sm font-medium">{engineer.hourlyRate?.toLocaleString() || '0'}원/시간</span>
            </div>
          </div>
          
          {/* 가용 품목이 있으면 표시 */}
          {engineer.availableItems && engineer.availableItems.length > 0 && (
            <div className="mt-4">
              <h4 className="text-xs font-medium text-gray-500 mb-1">취급 가능 품목</h4>
              <div className="flex flex-wrap gap-1">
                {engineer.availableItems.slice(0, 3).map((item, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-100">
                    {item}
                  </Badge>
                ))}
                {engineer.availableItems.length > 3 && (
                  <Badge variant="outline" className="text-xs bg-slate-50">
                    +{engineer.availableItems.length - 3}개 더
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="pt-0">
          <Link href={`/services/${engineer.id}`} className="w-full">
            <Button variant="default" className="w-full bg-primary text-white hover:bg-primary/90">
              상세 정보 보기
            </Button>
          </Link>
        </CardFooter>
      </div>
    </Card>
  );
}