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
    <Card className="h-full bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
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
        {service.location && (
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
              <Star className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-gray-600 ml-1">{service.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        <p className="text-gray-600 text-sm mb-3">{service.description}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {service.tags && service.tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {tag}
            </Badge>
          ))}
        </div>
        <Link href={`/services/${service.id}`}>
          <Button className="w-full py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors">
            연락하기
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default LocationCard;
