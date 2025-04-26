import React from 'react';
import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Service, User } from '@/types';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CategoryNav from '@/components/layout/CategoryNav';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Mail, Phone, MapPin, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const ServiceDetail: React.FC = () => {
  const { id } = useParams();
  const serviceId = parseInt(id);
  
  const { data: service, isLoading: serviceLoading } = useQuery<Service>({
    queryKey: [`/api/services/${serviceId}`],
    enabled: !isNaN(serviceId)
  });
  
  const { data: provider, isLoading: providerLoading } = useQuery<User>({
    queryKey: [`/api/users/${service?.userId}`],
    enabled: !!service?.userId
  });
  
  if (serviceLoading || providerLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <CategoryNav />
        <main className="flex-grow container mx-auto px-4 py-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-300 rounded-lg mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div className="h-10 bg-gray-200 rounded w-1/4"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!service) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <CategoryNav />
        <main className="flex-grow container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">서비스를 찾을 수 없습니다</h2>
            <p className="text-gray-600 mb-6">요청하신 서비스가 존재하지 않거나 삭제되었을 수 있습니다.</p>
            <Link href="/services">
              <Button className="bg-primary text-white hover:bg-blue-600">
                서비스 목록으로 돌아가기
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <CategoryNav />
      
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="mb-6">
          <Link href="/services">
            <a className="inline-flex items-center text-primary hover:underline">
              <ArrowLeft className="h-4 w-4 mr-1" />
              서비스 목록으로 돌아가기
            </a>
          </Link>
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="md:flex">
            <div className="md:w-1/3 relative h-64 md:h-auto">
              {service.imageUrl ? (
                <img 
                  src={service.imageUrl} 
                  alt={service.title} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-500">이미지 없음</span>
                </div>
              )}
            </div>
            <div className="md:w-2/3 p-6 md:p-8">
              <div className="flex items-center mb-4">
                <h1 className="text-3xl font-bold text-gray-800 mr-4">{service.title}</h1>
                {service.rating !== undefined && (
                  <div className="flex items-center bg-yellow-100 px-3 py-1 rounded-full">
                    <Star className="h-5 w-5 text-yellow-500 mr-1" />
                    <span className="font-semibold">{service.rating.toFixed(1)}</span>
                    {service.ratingCount && (
                      <span className="text-sm text-gray-600 ml-1">({service.ratingCount})</span>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {service.tags && service.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <p className="text-gray-700 mb-6">{service.description}</p>
              
              {service.location && (
                <div className="flex items-start mb-6">
                  <MapPin className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-800">위치</h3>
                    <p className="text-gray-600">{service.location.address}</p>
                  </div>
                </div>
              )}
              
              <div className="flex flex-wrap gap-4">
                <Button className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-blue-600 transition-colors flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  문의하기
                </Button>
                <Button variant="outline" className="px-6 py-2 bg-white text-primary font-medium rounded-lg border border-primary hover:bg-blue-50 transition-colors flex items-center">
                  <Phone className="h-5 w-5 mr-2" />
                  전화 연결
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {provider && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">서비스 제공자 정보</h2>
              <div className="flex items-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full mr-4 flex items-center justify-center text-gray-500">
                  {provider.fullName?.charAt(0) || provider.username.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{provider.fullName || provider.username}</h3>
                  <p className="text-gray-600">가입일: {new Date(provider.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* You can add more sections here like reviews, similar services, etc. */}
      </main>
      
      <Footer />
    </div>
  );
};

export default ServiceDetail;
