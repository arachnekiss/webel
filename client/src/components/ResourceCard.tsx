import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'wouter';

interface ResourceCardProps {
  resource: {
    id: number;
    title: string;
    description?: string;
    category?: string;
    tags?: string[];
    imageUrl?: string;
    thumbnailUrl?: string;
    downloadCount?: number;
    createdAt?: string | Date;
  };
}

export const ResourceCard: React.FC<ResourceCardProps> = ({ resource }) => {
  const {
    id,
    title,
    description,
    category,
    tags,
    thumbnailUrl,
    imageUrl,
    downloadCount,
    createdAt,
  } = resource;

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

  return (
    <Link href={`/resources/${id}`}>
      <Card className="h-full overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md">
        <div className="aspect-video relative overflow-hidden bg-muted">
          {(thumbnailUrl || imageUrl) ? (
            <img
              src={thumbnailUrl || imageUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
              No Image
            </div>
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
          <div className="flex flex-wrap gap-1 mt-2">
            {category && (
              <Badge variant="secondary" className="mr-1">
                {category}
              </Badge>
            )}
            {formattedTags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center text-sm text-muted-foreground">
          <div>
            {downloadCount !== undefined && (
              <span>{downloadCount} downloads</span>
            )}
          </div>
          {formattedDate && <div>{formattedDate}</div>}
        </CardFooter>
      </Card>
    </Link>
  );
};