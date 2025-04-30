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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

const Services: React.FC = () => {
  const { type } = useParams();
  const { currentLocation, isLoading: locationLoading, error: locationError, getLocation } = useLocation();
  const [distance, setDistance] = useState<string>("10");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // newest, rating, price
  const [useManualLocation, setUseManualLocation] = useState(false);
  const [manualLocation, setManualLocation] = useState({
    address: "",
    city: "서울",
    lat: 37.5665,
    long: 126.9780
  });
  
  // Define query key based on parameters
  const queryKey = type 
    ? `/api/services/type/${type}`
    : (currentLocation && !useManualLocation)
      ? `/api/services/nearby?lat=${currentLocation.lat}&long=${currentLocation.long}&maxDistance=${distance}`
      : useManualLocation
        ? `/api/services/nearby?lat=${manualLocation.lat}&long=${manualLocation.long}&maxDistance=${distance}`
        : '/api/services';
  
  const { data: services, isLoading: servicesLoading } = useQuery<Service[]>({
    queryKey: [queryKey],
    enabled: (!locationLoading || !!type || useManualLocation)
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
      case "price":
        // 가격순 정렬 (3D 프린터의 경우)
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
                      <SelectItem value="price" className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>가격순</span>
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
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="w-full md:w-auto flex-grow">
              <div className="flex items-center gap-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="use-manual-location"
                    checked={useManualLocation}
                    onCheckedChange={setUseManualLocation}
                  />
                  <Label htmlFor="use-manual-location" className="font-medium">수동 위치 입력</Label>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 w-full md:w-auto">
              <div className="w-24">
                <Select value={distance} onValueChange={setDistance}>
                  <SelectTrigger>
                    <SelectValue placeholder="거리" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5km</SelectItem>
                    <SelectItem value="10">10km</SelectItem>
                    <SelectItem value="20">20km</SelectItem>
                    <SelectItem value="50">50km</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                className="whitespace-nowrap"
                onClick={() => getLocation()}
                disabled={locationLoading || useManualLocation}
              >
                위치 새로고침
              </Button>
            </div>
          </div>
          
          {useManualLocation ? (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">도시</Label>
                <Input
                  id="city"
                  placeholder="서울, 부산 등"
                  className="mt-1"
                  value={manualLocation.city}
                  onChange={(e) => setManualLocation({...manualLocation, city: e.target.value})}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="address">상세 주소</Label>
                <Input
                  id="address"
                  placeholder="구/동 및 상세 주소"
                  className="mt-1"
                  value={manualLocation.address}
                  onChange={(e) => setManualLocation({...manualLocation, address: e.target.value})}
                />
              </div>
            </div>
          ) : (
            <div className="mt-3 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="font-medium">현재 위치:</span>
              <span className="text-gray-600">
                {locationLoading 
                  ? '위치 가져오는 중...' 
                  : locationError 
                    ? '위치 정보를 가져올 수 없습니다. 수동 위치 입력을 활성화해보세요.' 
                    : currentLocation?.address || '내 위치'}
              </span>
            </div>
          )}
          
          {locationError && !useManualLocation && (
            <div className="mt-3 flex items-center text-amber-600 gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">{locationError}</span>
            </div>
          )}
          
          {/* 적용된 필터 표시 */}
          {(searchTerm || sortBy !== "newest" || useManualLocation) && (
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
                    정렬: {sortBy === "rating" ? "평점순" : sortBy === "price" ? "가격순" : "최신순"}
                  </span>
                </Badge>
              )}
              
              {useManualLocation && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>
                    위치: {manualLocation.city} {manualLocation.address}
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
                    onClick={() => {
                      setSearchTerm("");
                      setSortBy("newest");
                      if (!useManualLocation) getLocation();
                    }}
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
                    onClick={() => {
                      setSearchTerm("");
                      setSortBy("newest");
                      if (!useManualLocation) getLocation();
                    }}
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
                  onClick={() => {
                    setSearchTerm("");
                    setSortBy("newest");
                    if (!useManualLocation) getLocation();
                  }}
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
