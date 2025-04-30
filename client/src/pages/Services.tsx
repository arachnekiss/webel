import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Service } from '@/types';
import LocationCard from '@/components/ui/LocationCard';
import ServiceMap from '@/components/map/ServiceMap';
import { useLocation } from '@/contexts/LocationContext';
import { MapPin, AlertTriangle, List, Map, Search, SlidersHorizontal, RefreshCw, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

const Services: React.FC = () => {
  const { type } = useParams();
  const { currentLocation, isLoading: locationLoading, error: locationError, getLocation } = useLocation();
  const [distance, setDistance] = useState<string>("10");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // newest, rating, lowPrice
  const [manualLocation, setManualLocation] = useState({
    address: "",
    city: "",
    district: "",
    lat: 37.5665,
    long: 126.9780
  });
  
  // 입력된 도시/지역 기반 좌표 구하기
  const getLocationCoordinates = () => {
    // 실제 위치 데이터 검색 로직 (간단한 예시로 대체)
    const koreaLocations: Record<string, Record<string, { lat: number; long: number }>> = {
      '서울': {
        '강남구': { lat: 37.5172, long: 127.0473 },
        '강동구': { lat: 37.5301, long: 127.1247 },
        '강북구': { lat: 37.6396, long: 127.0258 },
        '강서구': { lat: 37.5509, long: 126.8495 },
        '관악구': { lat: 37.4784, long: 126.9516 },
        '전체': { lat: 37.5665, long: 126.9780 },
      },
      '부산': {
        '해운대구': { lat: 35.1631, long: 129.1637 },
        '금정구': { lat: 35.2475, long: 129.0922 },
        '남구': { lat: 35.1368, long: 129.0843 },
        '전체': { lat: 35.1796, long: 129.0756 },
      },
      '인천': {
        '전체': { lat: 37.4563, long: 126.7052 },
      },
      '대전': {
        '전체': { lat: 36.3504, long: 127.3845 },
      },
    };
    
    const city = manualLocation.city || '서울';
    const district = manualLocation.district || '전체';
    
    // 도시/구 매칭
    if (koreaLocations[city] && koreaLocations[city][district]) {
      return {
        lat: koreaLocations[city][district].lat,
        long: koreaLocations[city][district].long
      };
    }
    
    // 도시만 매칭되는 경우 도시 전체 좌표 사용
    if (koreaLocations[city] && koreaLocations[city]['전체']) {
      return {
        lat: koreaLocations[city]['전체'].lat,
        long: koreaLocations[city]['전체'].long
      };
    }
    
    // 기본값으로 서울 좌표 반환
    return { lat: 37.5665, long: 126.9780 };
  };

  // 위치 데이터 준비
  const selectedLocation = manualLocation.city 
    ? getLocationCoordinates() 
    : (currentLocation ? { lat: currentLocation.lat, long: currentLocation.long } : { lat: 37.5665, long: 126.9780 });
    
  // Define query key based on parameters
  const queryKey = type 
    ? `/api/services/type/${type}`
    : selectedLocation
      ? `/api/services/nearby?lat=${selectedLocation.lat}&long=${selectedLocation.long}&maxDistance=${distance}`
      : '/api/services';
  
  const { data: services, isLoading: servicesLoading } = useQuery<Service[]>({
    queryKey: [queryKey],
    enabled: (!locationLoading || !!type || !!manualLocation.city)
  });
  
  // 정렬 및 검색 적용된 서비스 목록
  const filteredServices = useMemo(() => {
    if (!services) return [];
    
    let result = [...services];
    
    // 검색어 필터링
    if (searchTerm) {
      const searchTerms = searchTerm.toLowerCase().split(/\s+/).filter(term => term.length > 0);
      
      // 각 검색어별로 필터링
      result = result.filter(service => {
        // 각 검색어에 대해 하나라도 일치하는지 확인
        return searchTerms.some(term => {
          return (
            service.title.toLowerCase().includes(term) ||
            service.description.toLowerCase().includes(term) ||
            (service.tags && service.tags.some(tag => tag.toLowerCase().includes(term))) ||
            (service.printerModel && service.printerModel.toLowerCase().includes(term)) ||
            (service.contactPhone && service.contactPhone.toLowerCase().includes(term)) ||
            (service.contactEmail && service.contactEmail.toLowerCase().includes(term)) ||
            (service.pricing && service.pricing.toLowerCase().includes(term))
          );
        });
      });
    }
    
    // 정렬 적용
    switch (sortBy) {
      case "newest":
        // 최신순 정렬 (생성일 기준 내림차순)
        result.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB.getTime() - dateA.getTime();
        });
        break;
      case "rating":
        // 평점순 정렬
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "lowPrice":
        // 낮은 가격순 정렬 (3D 프린터의 경우)
        if (type === "3d_printing") {
          // 문자열에서 숫자만 추출하는 함수 (예: "10,000원" -> 10000)
          const extractPrice = (service: Service) => {
            if (!service.pricing) return Infinity;
            const match = service.pricing.match(/\d+/g);
            return match ? parseInt(match[0]) : Infinity;
          };
          
          result.sort((a, b) => extractPrice(a) - extractPrice(b));
        }
        break;
      default:
        break;
    }
    
    return result;
  }, [services, searchTerm, sortBy]);
  
  // Get service type name for display
  const getServiceTypeName = () => {
    switch (type) {
      case '3d_printing':
        return '3D 프린팅 서비스';
      case 'electronics':
        return '전자 회로 제작 서비스';
      case 'woodworking':
        return '목공 서비스';
      case 'metalworking':
        return '금속 가공 서비스';
      case 'manufacturers':
        return '생산업체';
      default:
        return '모든 서비스';
    }
  };

  // 필터 초기화 함수
  const resetFilters = () => {
    setSearchTerm("");
    setSortBy("newest");
    getLocation();
    setManualLocation({
      city: "",
      district: "",
      address: "",
      lat: 37.5665,
      long: 126.9780
    });
  };
  
  return (
    <>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-3">{getServiceTypeName()}</h1>
          <p className="text-gray-600">
            필요한 서비스를 제공하는 가까운 파트너를 찾아보세요.
          </p>
        </div>
        
        {/* 검색 및 필터 컨트롤 */}
        <div className="bg-white rounded-lg shadow p-4 mb-8">
          {/* 검색어 입력 필드 */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="서비스명, 태그, 설명으로 검색..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <div className="w-36">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="정렬 기준" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest" className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4" />
                      <span>최신순</span>
                    </SelectItem>
                    <SelectItem value="rating" className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      <span>평점순</span>
                    </SelectItem>
                    {type === '3d_printing' && (
                      <SelectItem value="lowPrice" className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>낮은가격순</span>
                      </SelectItem>
                    )}
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
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* 위치 관련 컨트롤 */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="font-medium">위치 설정</span>
              </div>
              
              <div className="flex gap-2">
                <Select value={distance} onValueChange={setDistance}>
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="검색 반경" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5km</SelectItem>
                    <SelectItem value="10">10km</SelectItem>
                    <SelectItem value="20">20km</SelectItem>
                    <SelectItem value="50">50km</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button 
                  variant="outline"
                  size="sm"
                  className="whitespace-nowrap"
                  onClick={() => getLocation()}
                  disabled={locationLoading}
                >
                  <MapPin className="h-4 w-4 mr-1" />
                  내 위치 사용
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">도시</Label>
                <Select value={manualLocation.city} onValueChange={(city) => setManualLocation({...manualLocation, city})}>
                  <SelectTrigger>
                    <SelectValue placeholder="도시 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="서울">서울</SelectItem>
                    <SelectItem value="부산">부산</SelectItem>
                    <SelectItem value="인천">인천</SelectItem>
                    <SelectItem value="대전">대전</SelectItem>
                    <SelectItem value="대구">대구</SelectItem>
                    <SelectItem value="광주">광주</SelectItem>
                    <SelectItem value="울산">울산</SelectItem>
                    <SelectItem value="세종">세종</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="md:col-span-1">
                <Label htmlFor="district">지역구</Label>
                {manualLocation.city === '서울' ? (
                  <Select 
                    value={manualLocation.district} 
                    onValueChange={(district) => setManualLocation({...manualLocation, district})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="지역구 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="전체">전체</SelectItem>
                      <SelectItem value="강남구">강남구</SelectItem>
                      <SelectItem value="강동구">강동구</SelectItem>
                      <SelectItem value="강북구">강북구</SelectItem>
                      <SelectItem value="강서구">강서구</SelectItem>
                      <SelectItem value="관악구">관악구</SelectItem>
                      <SelectItem value="광진구">광진구</SelectItem>
                      <SelectItem value="구로구">구로구</SelectItem>
                      <SelectItem value="금천구">금천구</SelectItem>
                      <SelectItem value="노원구">노원구</SelectItem>
                      <SelectItem value="도봉구">도봉구</SelectItem>
                      <SelectItem value="동대문구">동대문구</SelectItem>
                      <SelectItem value="동작구">동작구</SelectItem>
                      <SelectItem value="마포구">마포구</SelectItem>
                      <SelectItem value="서대문구">서대문구</SelectItem>
                      <SelectItem value="서초구">서초구</SelectItem>
                      <SelectItem value="성동구">성동구</SelectItem>
                      <SelectItem value="성북구">성북구</SelectItem>
                      <SelectItem value="송파구">송파구</SelectItem>
                      <SelectItem value="양천구">양천구</SelectItem>
                      <SelectItem value="영등포구">영등포구</SelectItem>
                      <SelectItem value="용산구">용산구</SelectItem>
                      <SelectItem value="은평구">은평구</SelectItem>
                      <SelectItem value="종로구">종로구</SelectItem>
                      <SelectItem value="중구">중구</SelectItem>
                      <SelectItem value="중랑구">중랑구</SelectItem>
                    </SelectContent>
                  </Select>
                ) : manualLocation.city === '부산' ? (
                  <Select 
                    value={manualLocation.district} 
                    onValueChange={(district) => setManualLocation({...manualLocation, district})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="지역구 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="전체">전체</SelectItem>
                      <SelectItem value="금정구">금정구</SelectItem>
                      <SelectItem value="남구">남구</SelectItem>
                      <SelectItem value="동구">동구</SelectItem>
                      <SelectItem value="동래구">동래구</SelectItem>
                      <SelectItem value="부산진구">부산진구</SelectItem>
                      <SelectItem value="북구">북구</SelectItem>
                      <SelectItem value="사상구">사상구</SelectItem>
                      <SelectItem value="사하구">사하구</SelectItem>
                      <SelectItem value="서구">서구</SelectItem>
                      <SelectItem value="수영구">수영구</SelectItem>
                      <SelectItem value="연제구">연제구</SelectItem>
                      <SelectItem value="영도구">영도구</SelectItem>
                      <SelectItem value="중구">중구</SelectItem>
                      <SelectItem value="해운대구">해운대구</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="district"
                    placeholder="지역구"
                    className="mt-1"
                    value={manualLocation.district}
                    onChange={(e) => setManualLocation({...manualLocation, district: e.target.value})}
                  />
                )}
              </div>
              
              <div className="md:col-span-1">
                <Label htmlFor="address">상세 주소</Label>
                <Input
                  id="address"
                  placeholder="동/읍/면 또는 상세주소"
                  className="mt-1"
                  value={manualLocation.address}
                  onChange={(e) => setManualLocation({...manualLocation, address: e.target.value})}
                />
              </div>
            </div>
            
            {/* 위치 검색 버튼 추가 */}
            <div className="mt-4 flex justify-end">
              <Button 
                className="bg-primary text-white hover:bg-blue-600"
                onClick={() => {
                  // 위치 정보로 검색 실행
                  if (manualLocation.city) {
                    const coords = getLocationCoordinates();
                    if (coords) {
                      setManualLocation({
                        ...manualLocation,
                        lat: coords.lat,
                        long: coords.long
                      });
                    }
                  }
                }}
              >
                <MapPin className="h-4 w-4 mr-2" />
                이 위치로 검색
              </Button>
            </div>
            
            {currentLocation && (
              <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-md">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">현재 위치:</span>
                  <span className="text-sm text-gray-600">
                    {locationLoading 
                      ? '위치 가져오는 중...' 
                      : currentLocation?.address || '알 수 없음'}
                  </span>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8"
                  onClick={() => {
                    if (currentLocation) {
                      const address = currentLocation.address || "";
                      const city = address.split(" ")[0] || "서울";
                      setManualLocation({
                        city,
                        district: "",
                        address: currentLocation.address || "",
                        lat: currentLocation.lat,
                        long: currentLocation.long
                      });
                    }
                  }}
                >
                  이 위치 사용
                </Button>
              </div>
            )}

            {locationError && (
              <div className="flex items-center text-amber-600 gap-2 bg-amber-50 p-2 rounded">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">{locationError}</span>
              </div>
            )}
          </div>
          
          {/* 적용된 필터 표시 */}
          {(searchTerm || sortBy !== "newest" || manualLocation.city) && (
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
                  ) : (
                    <Clock className="h-3 w-3" />
                  )}
                  <span>
                    정렬: {sortBy === "rating" ? "평점순" : sortBy === "lowPrice" ? "낮은가격순" : "최신순"}
                  </span>
                </Badge>
              )}
              
              {manualLocation.city && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>
                    위치: {manualLocation.city} {manualLocation.district ? manualLocation.district + ' ' : ''}{manualLocation.address}
                  </span>
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* 3D 프린터 페이지에서는 목록 뷰를 기본값으로 하고 지도 옵션도 제공 */}
        {type === '3d_printing' ? (
          <Tabs defaultValue="list" className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <SlidersHorizontal className="h-5 w-5 text-primary mr-2" />
                <h3 className="text-lg font-medium">프린터 모델 필터</h3>
              </div>
              
              <TabsList>
                <TabsTrigger value="list" className="flex items-center gap-1">
                  <List className="h-4 w-4" />
                  <span>목록 보기</span>
                </TabsTrigger>
                <TabsTrigger value="map" className="flex items-center gap-1">
                  <Map className="h-4 w-4" />
                  <span>지도 보기</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            {/* 프린터 모델 필터 버튼들 */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Button 
                variant={searchTerm === "" ? "default" : "outline"} 
                size="sm"
                onClick={() => setSearchTerm("")}
              >
                전체
              </Button>
              <Button 
                variant={searchTerm === "Prusa" ? "default" : "outline"} 
                size="sm"
                onClick={() => setSearchTerm("Prusa")}
              >
                Prusa
              </Button>
              <Button 
                variant={searchTerm === "Creality" ? "default" : "outline"} 
                size="sm"
                onClick={() => setSearchTerm("Creality")}
              >
                Creality
              </Button>
              <Button 
                variant={searchTerm === "Ultimaker" ? "default" : "outline"} 
                size="sm"
                onClick={() => setSearchTerm("Ultimaker")}
              >
                Ultimaker
              </Button>
              <Button 
                variant={searchTerm === "Formlabs" ? "default" : "outline"} 
                size="sm"
                onClick={() => setSearchTerm("Formlabs")}
              >
                Formlabs
              </Button>
              <Button 
                variant={searchTerm === "Anycubic" ? "default" : "outline"} 
                size="sm"
                onClick={() => setSearchTerm("Anycubic")}
              >
                Anycubic
              </Button>
            </div>

            <TabsContent value="list">
              {servicesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Array(8).fill(0).map((_, i) => (
                    <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : filteredServices && filteredServices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredServices.map((service) => (
                    <LocationCard key={service.id} service={service} />
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 p-8 rounded-lg text-center">
                  <p className="text-gray-600 mb-4">검색 조건에 맞는 3D 프린터 서비스가 없습니다.</p>
                  <p className="text-sm text-gray-500 mb-6">검색어나 필터를 변경해보세요.</p>
                  <Button 
                    className="bg-primary text-white hover:bg-blue-600"
                    onClick={resetFilters}
                  >
                    필터 초기화
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="map">
              {servicesLoading ? (
                <div className="h-[500px] bg-gray-200 rounded-lg animate-pulse"></div>
              ) : filteredServices && filteredServices.length > 0 ? (
                <ServiceMap services={filteredServices} />
              ) : (
                <div className="bg-gray-50 p-8 rounded-lg text-center">
                  <p className="text-gray-600 mb-4">이 지역에 이용 가능한 3D 프린터 서비스가 없습니다.</p>
                  <p className="text-sm text-gray-500 mb-6">다른 지역을 검색하거나 필터를 조정해보세요.</p>
                  <Button 
                    className="bg-primary text-white hover:bg-blue-600"
                    onClick={resetFilters}
                  >
                    필터 초기화
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          // 다른 서비스 유형은 일반 목록 뷰만 표시
          <>
            {servicesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array(8).fill(0).map((_, i) => (
                  <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : filteredServices && filteredServices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredServices.map((service) => (
                  <LocationCard key={service.id} service={service} />
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 p-8 rounded-lg text-center">
                <p className="text-gray-600 mb-4">검색 조건에 맞는 서비스가 없습니다.</p>
                <p className="text-sm text-gray-500 mb-6">검색어나 필터를 변경해보세요.</p>
                <Button 
                  className="bg-primary text-white hover:bg-blue-600"
                  onClick={resetFilters}
                >
                  필터 초기화
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Services;