import React, { useState, useMemo } from 'react';
import { useParams, Link, useLocation as useWouterLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import type { Service } from '@shared/schema';
import LocationCard from '@/components/ui/LocationCard';
import ServiceMap from '@/components/map/ServiceMap';
import { useLocation } from '@/contexts/LocationContext';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { MapPin, AlertTriangle, List, Map, Search, SlidersHorizontal, RefreshCw, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

// 서비스 페이지 속성 정의
interface ServicesProps {
  type?: string;
  lang?: Language;
}

const Services: React.FC<ServicesProps> = (props) => {
  // URL 파라미터 또는 props에서 타입 정보 가져오기
  const params = useParams();
  const typeFromParams = params.type;
  const typeFromProps = props.type;
  
  // props, URL 파라미터 순으로 타입 정보 확인 (우선순위 적용)
  const type = typeFromProps || typeFromParams;
  
  console.log(`[Services] type from props: ${typeFromProps}, type from params: ${typeFromParams}, using: ${type}`);
  
  const { currentLocation, isLoading: locationLoading, error: locationError, getLocation } = useLocation();
  const [_, navigate] = useWouterLocation();
  const { language } = useLanguage();
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
  
  // 서비스 데이터 가져오기 - 위치 기반 API의 다른 응답 구조 처리
  const { data: rawData, isLoading: servicesLoading } = useQuery({
    queryKey: [queryKey],
    enabled: (!locationLoading || !!type || !!manualLocation.city)
  });

  // 응답 형식에 맞게 서비스 데이터 추출
  const services = useMemo(() => {
    if (!rawData) return [];
    
    // 위치 기반 API는 { count, services } 형식으로 응답
    if (typeof rawData === 'object' && 'services' in rawData && Array.isArray(rawData.services)) {
      return rawData.services as Service[];
    }
    
    // 다른 API는 배열로 직접 응답
    if (Array.isArray(rawData)) {
      return rawData as Service[];
    }
    
    return []; // 알 수 없는 형식은 빈 배열 반환
  }, [rawData]);
  
  // 정렬 및 검색 적용된 서비스 목록
  const filteredServices = useMemo(() => {
    // services가 없거나 배열이 아닐 경우 빈 배열 반환
    if (!services || !Array.isArray(services)) return [];
    
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
            (service.tags && Array.isArray(service.tags) && service.tags.some((tag: string) => tag.toLowerCase().includes(term))) ||
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
        return language === 'ko' ? '근처 3D 프린터' : 
               language === 'jp' ? '近くの3Dプリンター' :
               'Nearby 3D Printers';
      case 'electronics':
        return language === 'ko' ? '전자 회로 제작 서비스' : 
               language === 'jp' ? '電子回路製作サービス' :
               'Electronics Circuit Making Service';
      case 'woodworking':
        return language === 'ko' ? '목공 서비스' : 
               language === 'jp' ? '木工サービス' :
               'Woodworking Service';
      case 'metalworking':
        return language === 'ko' ? '금속 가공 서비스' : 
               language === 'jp' ? '金属加工サービス' :
               'Metal Processing Service';
      case 'manufacturing':
        return language === 'ko' ? '생산업체 찾기' : 
               language === 'jp' ? '製造業者を探す' :
               'Find Manufacturers';
      case 'engineer':
        return language === 'ko' ? '엔지니어 찾기' : 
               language === 'jp' ? 'エンジニアを探す' :
               'Find Engineers';
      default:
        return language === 'ko' ? '모든 서비스' : 
               language === 'jp' ? 'すべてのサービス' :
               'All Services';
    }
  };

  // 공통 텍스트 변수
  const resetFiltersText = language === 'ko' ? '필터 초기화' : 
                         language === 'jp' ? 'フィルターをリセット' : 
                         'Reset filters';
  const searchText = language === 'ko' ? '검색' : 
                   language === 'jp' ? '検索' : 
                   'Search';
  const noServicesText = language === 'ko' ? '검색 결과가 없습니다' : 
                       language === 'jp' ? '検索結果がありません' : 
                       'No search results';
  const listViewText = language === 'ko' ? '목록 보기' : 
                     language === 'jp' ? 'リスト表示' : 
                     'List view';
  const mapViewText = language === 'ko' ? '지도 보기' : 
                    language === 'jp' ? 'マップ表示' : 
                    'Map view';
  
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
  
  // 재사용 가능한 필터 초기화 버튼 컴포넌트
  const ResetFilterButton = () => (
    <Button 
      className="bg-primary text-white hover:bg-blue-600"
      onClick={resetFilters}
    >
      {resetFiltersText}
    </Button>
  );
  
  return (
    <>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-3">{getServiceTypeName()}</h1>
            <p className="text-gray-600">
              {language === 'ko' ? '필요한 서비스를 제공하는 가까운 파트너를 찾아보세요.' : 
               language === 'jp' ? '必要なサービスを提供する近くのパートナーを探してください。' :
               'Find nearby partners who provide the services you need.'}
            </p>
          </div>
          <Button 
            onClick={() => navigate(type === '3d_printing' ? '/register-printer' : `/services/register${type ? `/${type}` : ''}`)} 
            className="mt-4 md:mt-0 bg-primary hover:bg-blue-600 text-white"
          >
            {type === '3d_printing' 
              ? (language === 'ko' ? '프린터 등록' : language === 'jp' ? 'プリンター登録' : 'Register Printer')
              : type === 'engineer' 
              ? (language === 'ko' ? '엔지니어 등록' : language === 'jp' ? 'エンジニア登録' : 'Register Engineer')
              : type === 'manufacturing' 
              ? (language === 'ko' ? '생산업체 등록' : language === 'jp' ? '製造業者登録' : 'Register Manufacturer')
              : (language === 'ko' ? '서비스 등록' : language === 'jp' ? 'サービス登録' : 'Register Service')
            }
          </Button>
        </div>
        
        {/* 검색 및 필터 컨트롤 - 쇼핑몰 스타일 */}
        <div className="bg-white rounded-lg shadow mb-8">
          {/* 상단 검색 영역 */}
          <div className="flex items-center p-4 border-b">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={language === 'ko' ? "서비스명, 태그, 설명으로 검색..." : 
                            language === 'jp' ? "サービス名、タグ、説明で検索..." :
                            "Search by service name, tags, description..."}
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              variant="default"
              size="sm"
              className="ml-2 px-4"
              onClick={() => {
                if (searchTerm) {
                  // 검색 실행
                }
              }}
            >
              {searchText}
            </Button>
          </div>
          
          {/* 위치 정보 영역 */}
          <div className="p-4 flex items-center justify-between border-b bg-slate-50">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              {locationLoading ? (
                <div className="flex items-center">
                  <span className="animate-spin mr-2 text-sm">⟳</span>
                  <span className="font-medium">
                    {language === 'ko' ? '위치 확인 중...' : 
                     language === 'jp' ? '位置確認中...' : 
                     'Checking location...'}
                  </span>
                </div>
              ) : currentLocation ? (
                <div className="flex items-center gap-1">
                  <span className="font-medium">
                    {language === 'ko' ? '현재 위치:' : 
                     language === 'jp' ? '現在位置:' : 
                     'Current location:'}
                  </span>
                  <span className="text-gray-600">
                    {currentLocation.address || 
                     (language === 'ko' ? '알 수 없음' : 
                      language === 'jp' ? '不明' : 
                      'Unknown')}
                  </span>
                </div>
              ) : (
                <span className="font-medium">
                  {language === 'ko' ? '위치 정보 사용 불가' : 
                   language === 'jp' ? '位置情報利用不可' : 
                   'Location information unavailable'}
                </span>
              )}
            </div>
            
            <div className="flex gap-2 items-center">
              <Select value={distance} onValueChange={setDistance}>
                <SelectTrigger className="w-24 h-9 bg-white">
                  <SelectValue placeholder={language === 'ko' ? "검색 반경" : 
                                       language === 'jp' ? "検索範囲" : 
                                       "Search radius"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5km</SelectItem>
                  <SelectItem value="10">10km</SelectItem>
                  <SelectItem value="20">20km</SelectItem>
                  <SelectItem value="50">50km</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* 필터 및 정렬 영역 */}
          <div className="p-4 flex flex-wrap justify-between items-center gap-2 border-b">
            <div className="flex gap-2 items-center flex-wrap">
              <Select value={manualLocation.city || "all"} onValueChange={(city) => {
                // 전체를 선택한 경우 빈 문자열로 처리
                const cityValue = city === "all" ? "" : city;
                const updatedLocation = {...manualLocation, city: cityValue, district: ''};
                setManualLocation(updatedLocation);
                
                // 도시를 선택하면 바로 해당 위치 좌표 적용
                const coords = getLocationCoordinates();
                if (coords) {
                  setManualLocation({
                    ...updatedLocation,
                    lat: coords.lat,
                    long: coords.long
                  });
                }
              }}>
                <SelectTrigger className="w-28 h-9">
                  <SelectValue placeholder={language === 'ko' ? "도시 선택" : 
                                       language === 'jp' ? "都市選択" : 
                                       "Select city"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
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
              
              {manualLocation.city && (
                <Select value={manualLocation.district || "all"} onValueChange={(district) => {
                  // 전체를 선택한 경우 빈 문자열로 처리
                  const districtValue = district === "all" ? "" : district;
                  const updatedLocation = {...manualLocation, district: districtValue};
                  setManualLocation(updatedLocation);
                  
                  // 구를 선택하면 바로 해당 위치 좌표 적용
                  const coords = getLocationCoordinates();
                  if (coords) {
                    setManualLocation({
                      ...updatedLocation,
                      lat: coords.lat,
                      long: coords.long
                    });
                  }
                }}>
                  <SelectTrigger className="w-28 h-9">
                    <SelectValue placeholder={language === 'ko' ? "구 선택" : 
                                         language === 'jp' ? "区域選択" : 
                                         "Select district"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    {manualLocation.city === '서울' && (
                      <>
                        <SelectItem value="강남구">강남구</SelectItem>
                        <SelectItem value="강동구">강동구</SelectItem>
                        <SelectItem value="강북구">강북구</SelectItem>
                        <SelectItem value="강서구">강서구</SelectItem>
                        <SelectItem value="관악구">관악구</SelectItem>
                        <SelectItem value="광진구">광진구</SelectItem>
                        <SelectItem value="구로구">구로구</SelectItem>
                        <SelectItem value="금천구">금천구</SelectItem>
                      </>
                    )}
                    {manualLocation.city === '부산' && (
                      <>
                        <SelectItem value="해운대구">해운대구</SelectItem>
                        <SelectItem value="금정구">금정구</SelectItem>
                        <SelectItem value="남구">남구</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              )}
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-28 h-9">
                  <SelectValue placeholder={language === 'ko' ? "정렬 기준" : 
                                       language === 'jp' ? "並べ替え" : 
                                       "Sort by"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{language === 'ko' ? '최신순' : 
                             language === 'jp' ? '最新順' : 
                             'Newest'}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="rating">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      <span>{language === 'ko' ? '평점순' : 
                             language === 'jp' ? '評価順' : 
                             'Top rated'}</span>
                    </div>
                  </SelectItem>
                  {type === '3d_printing' && (
                    <SelectItem value="lowPrice">
                      <div className="flex items-center gap-2">
                        <SlidersHorizontal className="h-4 w-4" />
                        <span>{language === 'ko' ? '낮은 가격순' : 
                               language === 'jp' ? '低価格順' : 
                               'Lowest price'}</span>
                      </div>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
              {searchTerm && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <span>{language === 'ko' ? '검색어:' : 
                         language === 'jp' ? '検索キーワード:' : 
                         'Search:'}</span>
                  <span className="font-medium">{searchTerm}</span>
                </Badge>
              )}
              
              {manualLocation.city && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <span>{language === 'ko' ? '위치:' : 
                         language === 'jp' ? '位置:' : 
                         'Location:'}</span>
                  <span className="font-medium">{manualLocation.city} {manualLocation.district}</span>
                </Badge>
              )}
              
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 px-2"
                onClick={resetFilters}
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1" />
                {resetFiltersText}
              </Button>
            </div>
          </div>
          
          {/* 탭 전환: 목록 보기 / 지도 보기 */}
          <Tabs defaultValue="list" className="w-full mt-4">
            <TabsList className="grid w-48 grid-cols-2 mx-auto mb-4">
              <TabsTrigger value="list" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <List className="h-4 w-4 mr-2" />
                {listViewText}
              </TabsTrigger>
              <TabsTrigger value="map" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <Map className="h-4 w-4 mr-2" />
                {mapViewText}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="list">
              {servicesLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin mx-auto h-8 w-8 border-t-2 border-b-2 border-primary rounded-full"></div>
                  <p className="mt-4 text-gray-600">
                    {language === 'ko' ? '서비스 목록을 불러오는 중...' : 
                     language === 'jp' ? 'サービスリスト読み込み中...' : 
                     'Loading services...'}
                  </p>
                </div>
              ) : locationError ? (
                <div className="bg-yellow-50 p-8 rounded-lg text-center">
                  <AlertTriangle className="h-10 w-10 text-yellow-500 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    {language === 'ko' ? '위치 정보를 가져오는 중 오류가 발생했습니다.' : 
                     language === 'jp' ? '位置情報の取得中にエラーが発生しました。' :
                     'An error occurred while retrieving location information.'}
                  </p>
                  <p className="text-sm text-gray-500 mb-6">
                    {language === 'ko' ? '다시 시도하거나 도시를 수동으로 선택해주세요.' : 
                     language === 'jp' ? '再試行するか、都市を手動で選択してください。' :
                     'Please try again or select a city manually.'}
                  </p>
                  <ResetFilterButton />
                </div>
              ) : filteredServices && filteredServices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredServices.map((service) => (
                    <LocationCard key={service.id} service={service} />
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 p-8 rounded-lg text-center">
                  <p className="text-gray-600 mb-4">
                    {language === 'ko' ? '검색 조건에 맞는 근처 3D 프린터가 없습니다.' : 
                     language === 'jp' ? '検索条件に一致する3Dプリンターが見つかりません。' :
                     'No 3D printers found matching your search criteria.'}
                  </p>
                  <p className="text-sm text-gray-500 mb-6">
                    {language === 'ko' ? '검색어나 필터를 변경해보세요.' : 
                     language === 'jp' ? '検索キーワードまたはフィルターを変更してください。' :
                     'Try changing your search terms or filters.'}
                  </p>
                  <ResetFilterButton />
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="map">
              {servicesLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin mx-auto h-8 w-8 border-t-2 border-b-2 border-primary rounded-full"></div>
                  <p className="mt-4 text-gray-600">
                    {language === 'ko' ? '지도를 불러오는 중...' : 
                     language === 'jp' ? 'マップ読み込み中...' : 
                     'Loading map...'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="h-[70vh] w-full relative rounded-lg overflow-hidden shadow border mb-4">
                    <ServiceMap 
                      center={selectedLocation}
                      zoom={12}
                      services={filteredServices || []}
                    />
                  </div>
                  
                  {filteredServices && filteredServices.length === 0 && (
                    <div className="bg-gray-50 p-8 rounded-lg text-center">
                      <p className="text-gray-600 mb-4">
                        {language === 'ko' ? '이 지역에 이용 가능한 근처 3D 프린터가 없습니다.' : 
                         language === 'jp' ? 'この地域で利用可能な3Dプリンターがありません。' :
                         'No 3D printers available in this area.'}
                      </p>
                      <p className="text-sm text-gray-500 mb-6">
                        {language === 'ko' ? '다른 지역을 검색하거나 필터를 조정해보세요.' : 
                         language === 'jp' ? '別の地域を検索するか、フィルターを調整してください。' :
                         'Try searching in another area or adjusting your filters.'}
                      </p>
                      <ResetFilterButton />
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        {/* 서비스 안내 영역 */}
        {type === '3d_printing' && (
          <>
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">
                {language === 'ko' ? '3D 프린팅 서비스 이용 안내' : 
                 language === 'jp' ? '3Dプリントサービス利用案内' :
                 '3D Printing Service Guide'}
              </h2>
              <p className="text-gray-600 mb-4">
                {language === 'ko' ? '근처의 3D 프린터를 통해 원하는 모델을 출력할 수 있습니다. 사용 방법은 다음과 같습니다:' : 
                 language === 'jp' ? '近くの3Dプリンターを通じて希望するモデルを出力できます。利用方法は次の通りです:' :
                 'You can print your desired models using nearby 3D printers. Here\'s how to use this service:'}
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>
                  {language === 'ko' ? '지도 또는 목록에서 근처 프린터를 찾고 선택하세요.' : 
                   language === 'jp' ? 'マップまたはリストから近くのプリンターを見つけて選択してください。' :
                   'Find and select a nearby printer from the map or list.'}
                </li>
                <li>
                  {language === 'ko' ? '서비스 제공자와 가격, 일정 등을 상의하세요.' : 
                   language === 'jp' ? 'サービス提供者と価格、スケジュールなどを相談してください。' :
                   'Discuss price, schedule, and other details with the service provider.'}
                </li>
                <li>
                  {language === 'ko' ? '3D 모델 파일(.stl, .obj 등)을 업로드하세요.' : 
                   language === 'jp' ? '3Dモデルファイル(.stl、.objなど)をアップロードしてください。' :
                   'Upload your 3D model file (.stl, .obj, etc.).'}
                </li>
                <li>
                  {language === 'ko' ? '결제 후 서비스 제공자가 모델을 출력합니다.' : 
                   language === 'jp' ? '支払い後、サービス提供者がモデルを出力します。' :
                   'After payment, the service provider will print your model.'}
                </li>
                <li>
                  {language === 'ko' ? '완성된 출력물을 수령하거나 배송 받으세요.' : 
                   language === 'jp' ? '完成した出力物を受け取るか配送を受けてください。' :
                   'Receive your completed print in person or via delivery.'}
                </li>
              </ul>
              <div className="mt-6">
                <p className="text-gray-600 mb-2">
                  {language === 'ko' ? '아직 적합한 3D 프린터를 찾지 못하셨나요?' : 
                   language === 'jp' ? 'まだ適切な3Dプリンターが見つかりませんでしたか？' :
                   'Haven\'t found a suitable 3D printer yet?'}
                </p>
                <Button 
                  className="bg-primary text-white hover:bg-blue-600"
                  onClick={resetFilters}
                >
                  {resetFiltersText}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Services;