import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useLocation as useWouterLocation } from 'wouter';
import type { Service } from '@shared/schema';
import { Loader2, MapPin, Phone, Mail, Calendar, Clock, Tag, DollarSign, Wrench, Award, Star, User, Briefcase, Building, Home, CreditCard, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardFooter, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import ServiceMap from '@/components/map/ServiceMap';

const ServiceDetail: React.FC = () => {
  const { id } = useParams();
  const [_, navigate] = useWouterLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('details');
  const [isPaymentEnabled, setIsPaymentEnabled] = useState(false);

  // 서비스 데이터 가져오기
  console.log('ServiceDetail 컴포넌트 로드됨, ID 파라미터:', id);
  const { 
    data: service, 
    isLoading, 
    error 
  } = useQuery<Service>({
    queryKey: [`/api/services/${id}`],
    enabled: !!id
  });

  // 오류 처리
  if (error) {
    const errorMessage = error instanceof Error ? 
      error.message : 
      '알 수 없는 오류가 발생했습니다';
      
    console.error('ServiceDetail 오류:', errorMessage);
    
    return (
      <div className="container mx-auto py-10 px-4 text-center">
        <div className="mb-6 text-red-500">
          <span className="text-xl">서비스를 불러오는데 실패했습니다</span>
          <p className="mt-2 text-sm text-gray-600">{errorMessage}</p>
        </div>
        <Button onClick={() => navigate('/services/type/3d_printing')}>
          서비스 목록으로 돌아가기
        </Button>
      </div>
    );
  }

  // 로딩 화면
  if (isLoading || !service) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">서비스 정보를 불러오는 중...</span>
      </div>
    );
  }

  // 서비스 유형에 따른 페이지 레이블 표시
  const getServiceTypeLabel = () => {
    switch (service.serviceType) {
      case '3d_printing':
        return '3D 프린팅 서비스';
      case 'electronics':
        return '전자회로 제작 서비스';
      case 'woodworking':
        return '목공 서비스';
      case 'metalworking':
        return '금속 가공 서비스';
      case 'manufacturing':
        return '생산업체 서비스';
      case 'engineer':
        return '엔지니어 서비스';
      default:
        return '서비스';
    }
  };

  // 서비스 유형에 맞는 아이콘 가져오기
  const getServiceTypeIcon = () => {
    switch (service.serviceType) {
      case '3d_printing':
        return <Wrench className="h-5 w-5 text-primary" />;
      case 'electronics':
        return <Wrench className="h-5 w-5 text-primary" />;
      case 'woodworking':
        return <Wrench className="h-5 w-5 text-primary" />;
      case 'metalworking':
        return <Wrench className="h-5 w-5 text-primary" />;
      case 'manufacturing':
        return <Building className="h-5 w-5 text-primary" />;
      case 'engineer':
        return <Briefcase className="h-5 w-5 text-primary" />;
      default:
        return <Wrench className="h-5 w-5 text-primary" />;
    }
  };

  // 연락하기 버튼 클릭 이벤트
  const handleContactClick = () => {
    if (service.contactEmail) {
      window.location.href = `mailto:${service.contactEmail}?subject=문의: ${service.title}`;
    } else if (service.contactPhone) {
      window.location.href = `tel:${service.contactPhone}`;
    } else {
      toast({
        title: '연락처 정보가 없습니다',
        description: '이 서비스는 연락처 정보를 제공하지 않습니다.',
        variant: 'destructive',
      });
    }
  };

  // 안전하게 데이터 객체에 접근 (타입 오류 방지)
  const location = service.location || {};
  const materials = service.materials || [];
  const fileFormats = service.fileFormats || [];
  const availableHours = service.availableHours || '';
  const otherSpecialty = service.otherSpecialty || '';
  const otherItems = service.otherItems || '';
  
  // 위치 맵 표시 여부 (안전하게 접근)
  const hasLocation = location && typeof location === 'object' && location.lat && location.long;

  // 서비스 유형별 추가 정보
  const renderServiceTypeSpecificInfo = () => {
    switch (service.serviceType) {
      case '3d_printing':
        return (
          <div className="space-y-4">
            {service.printerModel && (
              <div className="flex items-start">
                <Wrench className="h-5 w-5 text-primary mr-2 mt-1" />
                <div>
                  <span className="font-medium">프린터 모델</span>
                  <p className="text-gray-700">{service.printerModel}</p>
                </div>
              </div>
            )}
            
            {service.materials && service.materials.length > 0 && (
              <div className="flex items-start">
                <Wrench className="h-5 w-5 text-primary mr-2 mt-1" />
                <div>
                  <span className="font-medium">사용 가능한 재료</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {service.materials.map((material, index) => (
                      <Badge key={index} variant="outline" className="bg-gray-100">
                        {material}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {service.fileFormats && service.fileFormats.length > 0 && (
              <div className="flex items-start">
                <Wrench className="h-5 w-5 text-primary mr-2 mt-1" />
                <div>
                  <span className="font-medium">지원 파일 형식</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {service.fileFormats.map((format, index) => (
                      <Badge key={index} variant="outline" className="bg-gray-100">
                        {format}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      
      case 'engineer':
        return (
          <div className="space-y-4">
            {service.specialty && (
              <div className="flex items-start">
                <Award className="h-5 w-5 text-primary mr-2 mt-1" />
                <div>
                  <span className="font-medium">전문 분야</span>
                  <p className="text-gray-700">{service.specialty}</p>
                  {service.otherSpecialty && (
                    <p className="text-gray-700 mt-1">기타: {service.otherSpecialty}</p>
                  )}
                </div>
              </div>
            )}
            
            {service.experience !== null && service.experience !== undefined && (
              <div className="flex items-start">
                <Briefcase className="h-5 w-5 text-primary mr-2 mt-1" />
                <div>
                  <span className="font-medium">경력</span>
                  <p className="text-gray-700">{service.experience}년</p>
                </div>
              </div>
            )}
            
            {service.hourlyRate !== null && service.hourlyRate !== undefined && service.hourlyRate > 0 && (
              <div className="flex items-start">
                <DollarSign className="h-5 w-5 text-primary mr-2 mt-1" />
                <div>
                  <span className="font-medium">시간당 요금</span>
                  <p className="text-gray-700">{service.hourlyRate.toLocaleString()}원/시간</p>
                </div>
              </div>
            )}
            
            {service.availableItems && (
              <div className="flex items-start">
                <Wrench className="h-5 w-5 text-primary mr-2 mt-1" />
                <div>
                  <span className="font-medium">제공 가능 서비스</span>
                  <p className="text-gray-700">{service.availableItems}</p>
                </div>
              </div>
            )}
            
            {service.portfolioUrl && (
              <div className="flex items-start">
                <Award className="h-5 w-5 text-primary mr-2 mt-1" />
                <div>
                  <span className="font-medium">포트폴리오</span>
                  <p>
                    <a 
                      href={service.portfolioUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      포트폴리오 바로가기
                    </a>
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      
      case 'manufacturing':
        return (
          <div className="space-y-4">
            {service.availableItems && (
              <div className="flex items-start">
                <Building className="h-5 w-5 text-primary mr-2 mt-1" />
                <div>
                  <span className="font-medium">생산 가능 품목</span>
                  <p className="text-gray-700">{service.availableItems}</p>
                  {service.otherItems && (
                    <p className="text-gray-700 mt-1">기타: {service.otherItems}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      
      // 전자, 목공, 금속가공 등 다른 서비스 유형
      case 'electronics':
      case 'woodworking':
      case 'metalworking':
        return (
          <div className="space-y-4">
            {service.specialty && (
              <div className="flex items-start">
                <Award className="h-5 w-5 text-primary mr-2 mt-1" />
                <div>
                  <span className="font-medium">전문 분야</span>
                  <p className="text-gray-700">{service.specialty}</p>
                  {service.otherSpecialty && (
                    <p className="text-gray-700 mt-1">기타: {service.otherSpecialty}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* 상단 네비게이션 */}
      <div className="mb-6 flex items-center text-sm text-gray-500">
        <Button 
          variant="link" 
          className="p-0 text-gray-500 hover:text-primary" 
          onClick={() => navigate('/')}
        >
          홈
        </Button>
        <span className="mx-2">/</span>
        <Button 
          variant="link" 
          className="p-0 text-gray-500 hover:text-primary" 
          onClick={() => navigate(`/services/type/${service.serviceType}`)}
        >
          {getServiceTypeLabel()}
        </Button>
        <span className="mx-2">/</span>
        <span className="text-gray-600 truncate max-w-[150px]">{service.title || '서비스 상세'}</span>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 왼쪽 콘텐츠 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 서비스 이미지 및 제목 */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="aspect-video relative">
              <img 
                src={service.imageUrl || "https://via.placeholder.com/800x450?text=Service+Image"} 
                alt={service.title} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <div className="flex items-center mb-4">
                {getServiceTypeIcon()}
                <Badge className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-100">
                  {getServiceTypeLabel()}
                </Badge>
                {service.isIndividual ? (
                  <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">
                    <User className="h-3 w-3 mr-1" />
                    개인
                  </Badge>
                ) : (
                  <Badge className="ml-2 bg-purple-100 text-purple-800 hover:bg-purple-100">
                    <Building className="h-3 w-3 mr-1" />
                    업체
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl font-bold mb-2">
                {service.title || getServiceTypeLabel()}
              </h1>
              <div className="flex items-center text-gray-500 mb-4">
                <MapPin className="h-4 w-4 mr-1" />
                <span>
                  {location && location.address ? 
                    location.address : 
                    '위치 정보 없음'}
                </span>
              </div>
              {service.tags && service.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {service.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="bg-gray-100">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 상세 정보 탭 */}
          <Tabs defaultValue="details" className="bg-white rounded-lg shadow">
            <div className="px-6 pt-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">상세 정보</TabsTrigger>
                <TabsTrigger value="location">위치 정보</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="details" className="p-6 pt-4">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">서비스 설명</h3>
                  <p className="text-gray-700 whitespace-pre-line">
                    {service.description || '등록된 서비스 설명이 없습니다.'}
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-4">서비스 정보</h3>
                  <div className="space-y-4">
                    {/* 서비스 유형별 특화 정보 */}
                    {renderServiceTypeSpecificInfo()}
                    
                    {/* 공통 정보 */}
                    {service.pricing && (
                      <div className="flex items-start">
                        <DollarSign className="h-5 w-5 text-primary mr-2 mt-1" />
                        <div>
                          <span className="font-medium">가격 정책</span>
                          <p className="text-gray-700">{service.pricing}</p>
                        </div>
                      </div>
                    )}
                    
                    {availableHours && (
                      <div className="flex items-start">
                        <Clock className="h-5 w-5 text-primary mr-2 mt-1" />
                        <div>
                          <span className="font-medium">운영 시간</span>
                          <p className="text-gray-700">{availableHours}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="location" className="p-6 pt-4">
              {hasLocation ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">위치 정보</h3>
                  <div className="rounded-md overflow-hidden border h-[300px]">
                    {/* 위치 정보가 정확히 있는 경우만 맵 표시 */}
                    {location && location.lat && location.long ? 
                      <ServiceMap services={[{...service, location: {lat: location.lat, long: location.long}}]} /> :
                      <div className="flex h-full items-center justify-center bg-gray-100">
                        <p className="text-gray-500">위치 정보를 불러올 수 없습니다</p>
                      </div>
                    }
                  </div>
                  <div className="flex items-center mt-2">
                    <MapPin className="h-5 w-5 text-primary mr-2" />
                    <span>{location && location.address ? location.address : '주소 정보 없음'}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>위치 정보가 등록되지 않았습니다.</p>
                </div>
              )}
            </TabsContent>
            

          </Tabs>
        </div>

        {/* 오른쪽 사이드바 */}
        <div className="space-y-6">
          {/* 연락처 정보 카드 */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">연락처 정보</h3>
              <div className="space-y-4">
                {service.contactPhone && (
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-primary mr-3" />
                    <span>{service.contactPhone}</span>
                  </div>
                )}
                
                {service.contactEmail && (
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-primary mr-3" />
                    <span className="break-all">{service.contactEmail}</span>
                  </div>
                )}
                
                {availableHours && (
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-primary mr-3 mt-1" />
                    <div>
                      <span className="font-medium">운영 시간</span>
                      <p className="text-sm text-gray-600 mt-1">{availableHours}</p>
                    </div>
                  </div>
                )}
                
                {(!service.contactPhone && !service.contactEmail) && (
                  <div className="text-center py-4 text-gray-500">
                    <p>등록된 연락처 정보가 없습니다.</p>
                  </div>
                )}
                
                <Button 
                  className="w-full mt-2" 
                  onClick={handleContactClick}
                  disabled={!service.contactPhone && !service.contactEmail}
                >
                  연락하기
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* 가격 및 결제 카드 */}
          <Card className="border-primary">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-primary" />
                가격 및 결제
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="space-y-2">
                {/* 기본 요금 */}
                <div className="flex justify-between items-baseline">
                  <span className="text-muted-foreground">기본 요금</span>
                  <span className="font-semibold text-xl">
                    {service.isFreeService ? '무료' : '문의 필요'}
                  </span>
                </div>
                
                {/* 시간당 요금 (있는 경우) */}
                {service.hourlyRate && service.hourlyRate > 0 && (
                  <div className="flex justify-between items-baseline">
                    <span className="text-muted-foreground">시간당 요금</span>
                    <span className="font-medium">{service.hourlyRate.toLocaleString()}원/시간</span>
                  </div>
                )}
                
                {/* 수수료 정보 */}
                <div className="flex justify-between items-baseline text-sm">
                  <span className="text-muted-foreground">Webel 수수료(10%)</span>
                  <span className="text-muted-foreground">
                    {service.isFreeService ? '0원' : '-'}
                  </span>
                </div>
                
                <Separator className="my-2" />
                
                {/* 총 결제 금액 */}
                <div className="flex justify-between items-baseline">
                  <span className="font-medium">총 결제 금액</span>
                  <span className="font-bold text-primary text-2xl">
                    {service.isFreeService ? '무료' : '문의 필요'}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2 pt-0">
              {/* 결제하기 버튼 - 사용자의 자신의 서비스가 아닐 때만 표시 */}
              {user && service.userId !== user.id ? (
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => navigate(`/payment/service/${service.id}`)}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {service.isFreeService ? '무료 이용하기' : '문의하기'}
                </Button>
              ) : user && service.userId === user.id ? (
                <div className="text-center w-full p-2 bg-amber-50 text-amber-700 rounded-md text-sm">
                  ⓘ 자신의 서비스는 결제할 수 없습니다
                </div>
              ) : (
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => navigate('/login')}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  로그인 후 {service.isFreeService ? '이용하기' : '문의하기'}
                </Button>
              )}
              
              {/* 문의하기 버튼 */}
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleContactClick}
              >
                문의하기
              </Button>
              
              <div className="text-xs text-center text-muted-foreground mt-2">
                결제는 안전하게 처리되며, 서비스 완료 후 제공자에게 금액이 전달됩니다.
              </div>
            </CardFooter>
          </Card>
          
          {/* 제공자 정보 카드 */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">제공자 정보</h3>
              <div className="flex items-center mb-4">
                <Avatar className="h-12 w-12 mr-4">
                  <AvatarImage src="/default-avatar.png" />
                  <AvatarFallback>
                    {service.isIndividual ? 
                      <User className="h-6 w-6" /> : 
                      <Building className="h-6 w-6" />}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {service.isIndividual ? '개인 제공자' : '업체'}
                  </p>
                  <p className="text-sm text-gray-500">
                    서비스 {service.createdAt ? 
                      `등록일: ${new Date(service.createdAt).toLocaleDateString('ko-KR')}` : 
                      '등록 정보 없음'}
                  </p>
                </div>
              </div>
              
              <div className="text-sm">
                <span className="text-gray-500">서비스 유형</span>
                <div className="mt-1 font-medium flex items-center">
                  {getServiceTypeIcon()}
                  <span className="ml-1">{getServiceTypeLabel()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;