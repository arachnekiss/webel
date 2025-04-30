import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Loader2, Search, Wrench, Star, Clock, Zap, MapPin, Filter } from 'lucide-react';
import { getQueryFn } from '@/lib/queryClient';
import { Service } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

type Location = {
  lat: number;
  long: number;
  address: string;
};

export default function Engineers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest, popularity(rating), distance
  const [location, setLocation] = useState({
    city: '',
    district: '',
    address: '',
  });
  const [maxDistance, setMaxDistance] = useState(30); // km 단위 - 기본값 30km로 설정
  const [hasLocationFilter, setHasLocationFilter] = useState(false);
  const { toast } = useToast();

  // 엔지니어 데이터 가져오기
  const { data: engineers, isLoading, error } = useQuery<Service[]>({
    queryKey: ['/api/services/type/engineer'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
  });

  // 한국의 주요 도시와 구 정보
  const koreaLocations: Record<string, Record<string, { lat: number; long: number }>> = {
    '서울': {
      '강남구': { lat: 37.5172, long: 127.0473 },
      '강동구': { lat: 37.5301, long: 127.1247 },
      '강북구': { lat: 37.6396, long: 127.0258 },
      '강서구': { lat: 37.5509, long: 126.8495 },
      '관악구': { lat: 37.4784, long: 126.9516 },
      '광진구': { lat: 37.5384, long: 127.0825 },
      '구로구': { lat: 37.4954, long: 126.8874 },
      '금천구': { lat: 37.4568, long: 126.8965 },
      '노원구': { lat: 37.6541, long: 127.0568 },
      '도봉구': { lat: 37.6688, long: 127.0471 },
      '동대문구': { lat: 37.5744, long: 127.0400 },
      '동작구': { lat: 37.5121, long: 126.9396 },
      '마포구': { lat: 37.5665, long: 126.9018 },
      '서대문구': { lat: 37.5791, long: 126.9368 },
      '서초구': { lat: 37.4837, long: 127.0324 },
      '성동구': { lat: 37.5633, long: 127.0371 },
      '성북구': { lat: 37.5894, long: 127.0162 },
      '송파구': { lat: 37.5145, long: 127.1060 },
      '양천구': { lat: 37.5169, long: 126.8664 },
      '영등포구': { lat: 37.5260, long: 126.8969 },
      '용산구': { lat: 37.5321, long: 126.9810 },
      '은평구': { lat: 37.6026, long: 126.9291 },
      '종로구': { lat: 37.5720, long: 126.9794 },
      '중구': { lat: 37.5640, long: 126.9975 },
      '중랑구': { lat: 37.6061, long: 127.0926 },
      '전체': { lat: 37.5665, long: 126.9780 },
    },
    '부산': {
      '강서구': { lat: 35.2118, long: 128.9829 },
      '금정구': { lat: 35.2427, long: 129.0905 },
      '남구': { lat: 35.1366, long: 129.0843 },
      '동구': { lat: 35.1291, long: 129.0454 },
      '동래구': { lat: 35.1966, long: 129.0856 },
      '부산진구': { lat: 35.1631, long: 129.0532 },
      '북구': { lat: 35.1971, long: 128.9913 },
      '사상구': { lat: 35.1525, long: 128.9907 },
      '사하구': { lat: 35.1037, long: 128.9744 },
      '서구': { lat: 35.0977, long: 129.0243 },
      '수영구': { lat: 35.1453, long: 129.1132 },
      '연제구': { lat: 35.1761, long: 129.0791 },
      '영도구': { lat: 35.0917, long: 129.0693 },
      '중구': { lat: 35.1060, long: 129.0328 },
      '해운대구': { lat: 35.1629, long: 129.1639 },
      '기장군': { lat: 35.2446, long: 129.2228 },
      '전체': { lat: 35.1796, long: 129.0756 },
    },
    '인천': { '전체': { lat: 37.4563, long: 126.7052 } },
    '대구': { '전체': { lat: 35.8714, long: 128.6014 } },
    '대전': { '전체': { lat: 36.3504, long: 127.3845 } },
    '광주': { '전체': { lat: 35.1595, long: 126.8526 } },
    '울산': { '전체': { lat: 35.5384, long: 129.3114 } },
    '세종': { '전체': { lat: 36.4801, long: 127.2882 } },
    '제주': { '전체': { lat: 33.4996, long: 126.5312 } },
  };

  // 위치 좌표 얻기
  const getLocationCoordinates = (): Location | null => {
    const city = location.city.trim();
    const district = location.district.trim();
    
    // 입력이 없는 경우 null 반환
    if (!city && !district && !location.address.trim()) {
      return null;
    }
    
    // 도시 검색
    for (const cityKey in koreaLocations) {
      if (city.includes(cityKey) || cityKey.includes(city)) {
        // 구 검색
        if (district) {
          for (const districtKey in koreaLocations[cityKey]) {
            if (district.includes(districtKey) || districtKey.includes(district)) {
              return {
                lat: koreaLocations[cityKey][districtKey].lat,
                long: koreaLocations[cityKey][districtKey].long,
                address: `${city} ${district} ${location.address}`.trim(),
              };
            }
          }
        }
        
        // 구가 없거나 매칭되지 않는 경우 도시 전체 위치 사용
        return {
          lat: koreaLocations[cityKey]['전체'].lat,
          long: koreaLocations[cityKey]['전체'].long,
          address: `${city} ${district} ${location.address}`.trim(),
        };
      }
    }
    
    // 도시가 매칭되지 않는 경우 기본값(서울) 사용
    return {
      lat: koreaLocations['서울']['전체'].lat,
      long: koreaLocations['서울']['전체'].long,
      address: `${city} ${district} ${location.address}`.trim() || '위치 미지정',
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

  // 검색어 및 정렬 적용
  const filteredEngineers = React.useMemo(() => {
    if (!engineers) return [];
    
    let result = [...engineers];
    
    // 검색어 필터링
    if (searchTerm.trim() !== '') {
      const searchTerms = searchTerm.toLowerCase().split(/\s+/).filter(term => term.length > 0);
      
      // 각 검색어별로 필터링
      result = result.filter(engineer => {
        // 각 검색어에 대해 하나라도 일치하는지 확인
        return searchTerms.some(term => {
          return (
            engineer.title.toLowerCase().includes(term) ||
            engineer.description.toLowerCase().includes(term) ||
            (engineer.specialty && engineer.specialty.toLowerCase().includes(term)) ||
            (engineer.tags && engineer.tags.some(tag => tag.toLowerCase().includes(term))) ||
            (engineer.experience && typeof engineer.experience === 'string' && engineer.experience.toLowerCase().includes(term)) ||
            (engineer.availableItems && typeof engineer.availableItems === 'string' && engineer.availableItems.toLowerCase().includes(term))
          );
        });
      });
    }
    
    // 위치 기반 필터링
    if (hasLocationFilter) {
      const userLocation = getLocationCoordinates();
      
      if (userLocation) {
        // 각 엔지니어에게 거리 정보 추가
        result.forEach(engineer => {
          if (!engineer.location) return;
          
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
          } catch (error) {
            console.error('위치 계산 오류:', error);
          }
        });
        
        // 거리 필터링 (거리 정보가 있는 경우만)
        result = result.filter(engineer => {
          if (!(engineer as any).distance) return false;
          return parseFloat((engineer as any).distance) <= maxDistance;
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
      case 'distance':
        // 거리순 정렬 (가까운 순)
        if (hasLocationFilter) {
          result.sort((a, b) => {
            const distA = parseFloat((a as any).distance || '9999');
            const distB = parseFloat((b as any).distance || '9999');
            return distA - distB;
          });
        }
        break;
      default:
        break;
    }
    
    return result;
  }, [engineers, searchTerm, sortBy, hasLocationFilter, location, maxDistance]);

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
                    <span>인기순</span>
                  </SelectItem>
                  <SelectItem value="distance" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>거리순</span>
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
                setHasLocationFilter(false);
              }}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* 적용된 필터 표시 */}
        {(searchTerm || sortBy !== "newest" || hasLocationFilter) && (
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
                ) : sortBy === "distance" ? (
                  <MapPin className="h-3 w-3" />
                ) : (
                  <Clock className="h-3 w-3" />
                )}
                <span>
                  정렬: {
                    sortBy === "rating" ? "인기순" : 
                    sortBy === "distance" ? "거리순" : "최신순"
                  }
                </span>
              </Badge>
            )}
            
            {hasLocationFilter && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>위치: {maxDistance}km 이내</span>
              </Badge>
            )}
          </div>
        )}
      </div>
      
      {/* 위치 검색 섹션 */}
      <div className="bg-white rounded-lg shadow p-4 mb-8">
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">지역 검색</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (location.city || location.district) {
                  setHasLocationFilter(!hasLocationFilter);
                } else {
                  toast({
                    title: '위치 정보 필요',
                    description: '위치 필터링을 사용하려면 지역 정보를 입력하세요.',
                    variant: 'destructive',
                  });
                }
              }}
            >
              {hasLocationFilter ? '지역 검색 해제' : '지역 검색 적용'}
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="city" className="text-gray-700">도시</Label>
              <Select 
                value={location.city} 
                onValueChange={(value) => setLocation(prev => ({ ...prev, city: value }))}
              >
                <SelectTrigger id="city">
                  <SelectValue placeholder="도시 선택" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(koreaLocations).map((city) => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="district" className="text-gray-700">구/군</Label>
              <Select 
                value={location.district} 
                onValueChange={(value) => setLocation(prev => ({ ...prev, district: value }))}
                disabled={!location.city}
              >
                <SelectTrigger id="district">
                  <SelectValue placeholder={location.city ? "구/군 선택" : "도시를 먼저 선택하세요"} />
                </SelectTrigger>
                <SelectContent>
                  {location.city && Object.keys(koreaLocations[location.city])
                    .filter(district => district !== '전체')
                    .map((district) => (
                      <SelectItem key={district} value={district}>{district}</SelectItem>
                    ))}
                  <SelectItem value="">전체</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address" className="text-gray-700">상세 주소(선택)</Label>
              <Input
                id="address"
                placeholder="동/읍/면 또는 상세 주소"
                value={location.address}
                onChange={e => setLocation(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-50 p-3 rounded-lg">
            <div className="flex items-center mb-2 md:mb-0">
              <MapPin className="h-4 w-4 mr-2 text-primary" />
              <span className="text-sm font-medium text-gray-700">
                {location.city && (
                  <>
                    검색 위치: {location.city} {location.district} {location.address}
                  </>
                )}
                {!location.city && "도시와 구/군을 선택하면 해당 지역의 엔지니어를 찾을 수 있습니다."}
              </span>
            </div>
            
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">검색 범위:</span>
              <Input
                type="range"
                min="1"
                max="100"
                value={maxDistance}
                onChange={e => setMaxDistance(Number(e.target.value))}
                className="w-32 mr-2"
              />
              <span className="text-sm font-medium w-16 text-right">{maxDistance}km</span>
            </div>
          </div>
          
          {hasLocationFilter && (
            <div className="mt-3 text-sm text-blue-600 flex items-center">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-600 mr-2"></div>
              <span>현재 {location.city} {location.district} 지역 기준 {maxDistance}km 이내의 엔지니어만 표시됩니다.</span>
            </div>
          )}
        </div>
      </div>
      
      {/* 엔지니어 목록 */}
      {filteredEngineers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEngineers.map((engineer) => (
            <EngineerCard 
              key={engineer.id} 
              engineer={engineer} 
              showDistance={hasLocationFilter && (engineer as any).distance !== undefined}
              distance={(engineer as any).distance}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">엔지니어를 찾을 수 없습니다</h3>
          <p className="text-muted-foreground mb-4">
            {hasLocationFilter 
              ? '선택한 지역에 엔지니어가 없거나 검색 범위가 너무 좁습니다. 검색 범위를 넓히거나 다른 지역을 선택해보세요.'
              : '검색어를 변경하거나 다른 필터를 적용해보세요.'}
          </p>
          <Button onClick={() => {
            setSearchTerm('');
            setSortBy('newest');
            setHasLocationFilter(false);
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