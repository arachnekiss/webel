import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Wifi } from "lucide-react";

export interface ServiceCardProps {
  service: {
    id: number;
    title: string;
    description?: string;
    serviceType?: string;
    tags?: string[];
    imageUrl?: string;
    location?: {
      latitude?: number;
      longitude?: number;
      address?: string;
    } | string;
    rating?: number;
    ratingCount?: number;
    isRemote?: boolean;
    price?: number;
    pricePerHour?: number;
    createdAt?: string | Date;
  };
  onClick?: () => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, onClick }) => {
  const { 
    title, 
    description, 
    serviceType, 
    tags, 
    imageUrl, 
    location, 
    rating, 
    ratingCount,
    isRemote,
    pricePerHour
  } = service;

  const getLocationAddress = () => {
    if (!location) return '';
    if (typeof location === 'string') return location;
    return location.address || '';
  };

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="overflow-hidden transition-shadow duration-300 h-full flex flex-col hover:shadow-md cursor-pointer" onClick={onClick}>
      <div className="h-36 overflow-hidden bg-gray-100 relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-blue-50">
            <div className="text-4xl text-blue-200">🛠️</div>
          </div>
        )}
      </div>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold line-clamp-2 mb-1">
            {title}
          </CardTitle>
        </div>
        {serviceType && (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-100 text-xs">
            {serviceType}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="px-4 py-2 flex-grow">
        <CardDescription className="text-sm text-gray-600 line-clamp-3 mb-2">
          {description}
        </CardDescription>
        <div className="flex flex-wrap gap-1 mt-2">
          {tags && tags.slice(0, 3).map((tag, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs bg-gray-100 text-gray-700 font-normal">
              {tag}
            </Badge>
          ))}
          {tags && tags.length > 3 && (
            <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700 font-normal">
              +{tags.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="px-4 py-2 border-t flex justify-between items-center text-sm text-gray-500">
        <div className="flex items-center gap-2">
          {isRemote && (
            <div className="flex items-center gap-1 text-green-600">
              <Wifi size={14} />
              <span className="text-xs">Remote</span>
            </div>
          )}
          {getLocationAddress() && (
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              <span className="text-xs truncate max-w-[120px]">{getLocationAddress()}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {rating && (
            <div className="flex items-center gap-1">
              <Star size={14} className="text-yellow-400 fill-yellow-400" />
              <span>{rating.toFixed(1)}</span>
              {ratingCount && <span className="text-xs text-gray-400">({ratingCount})</span>}
            </div>
          )}
          {pricePerHour && (
            <div className="text-xs font-medium">
              {formatCurrency(pricePerHour)}/hr
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};