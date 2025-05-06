import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'wouter';
import { MapPin, Star } from 'lucide-react';

interface ServiceCardProps {
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
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  const {
    id,
    title,
    description,
    serviceType,
    tags,
    imageUrl,
    location,
    rating,
    ratingCount,
    isRemote,
    price,
    pricePerHour,
    createdAt,
  } = service;

  // Format tags if they exist as a string or an array
  const formattedTags = tags
    ? typeof tags === 'string'
      ? [tags]
      : tags
    : [];

  // Format created date
  const formattedDate = createdAt
    ? formatDistanceToNow(new Date(createdAt), { addSuffix: true })
    : '';

  // Parse location
  let locationText = '';
  if (location) {
    if (typeof location === 'string') {
      locationText = location;
    } else if (typeof location === 'object' && location.address) {
      locationText = location.address;
    }
  }

  return (
    <Link href={`/services/${id}`}>
      <Card className="h-full overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md">
        <div className="aspect-video relative overflow-hidden bg-muted">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
              No Image
            </div>
          )}
          {isRemote && (
            <Badge className="absolute top-2 right-2 bg-green-500">
              Remote
            </Badge>
          )}
        </div>
        <CardHeader className="p-4 pb-0">
          <CardTitle className="line-clamp-2 text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          {description && (
            <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
              {description}
            </p>
          )}
          <div className="flex justify-between items-center mb-2">
            {serviceType && (
              <Badge variant="secondary">{serviceType}</Badge>
            )}
            {rating !== undefined && (
              <div className="flex items-center text-amber-500">
                <Star className="w-4 h-4 fill-current mr-1" />
                <span>{rating.toFixed(1)}</span>
                {ratingCount !== undefined && (
                  <span className="text-xs text-muted-foreground ml-1">
                    ({ratingCount})
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {formattedTags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center text-sm">
          <div className="flex items-center text-muted-foreground">
            {locationText && (
              <>
                <MapPin className="w-3 h-3 mr-1" />
                <span className="truncate max-w-[120px]">{locationText}</span>
              </>
            )}
          </div>
          <div className="font-semibold">
            {price !== undefined && <span>{price.toLocaleString()}₩</span>}
            {pricePerHour !== undefined && (
              <span>{pricePerHour.toLocaleString()}₩/hr</span>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};