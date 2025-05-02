import React from 'react';
import { Link } from 'wouter';
import { Service } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';

interface LocationCardProps {
  service: Service;
}

const LocationCard: React.FC<LocationCardProps> = ({ service }) => {
  return (
    <Link href={`/services/${service.id}`} className="block h-full">
      <Card className="h-full bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        <div className="relative h-48 bg-gray-200">
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
          {service.location && service.location.address && (
            <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              {service.location.address} 
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-800 flex-grow">{service.title}</h3>
            {service.rating !== undefined && (
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm text-gray-600 ml-1">{service.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{service.description}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {service.serviceType === '3d_printing' && (
              <>
                {service.isIndividual !== undefined && (
                  <Badge variant="secondary" className={`text-xs ${service.isIndividual ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'} px-2 py-1 rounded-full`}>
                    {service.isIndividual ? '개인' : '비즈니스'}
                  </Badge>
                )}
                {service.printerModel && (
                  <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                    {service.printerModel}
                  </Badge>
                )}
                {service.pricing && (
                  <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                    {service.pricing}
                  </Badge>
                )}
              </>
            )}
            {service.tags && service.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {tag}
              </Badge>
            ))}
          </div>
          <Button className="w-full py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors">
            상세보기
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
};

export default LocationCard;
