import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";

export interface ResourceCardProps {
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
  onClick?: () => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({ resource, onClick }) => {
  const { title, description, category, tags, thumbnailUrl, downloadCount } = resource;

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  };

  return (
    <Card className="overflow-hidden transition-shadow duration-300 h-full flex flex-col hover:shadow-md cursor-pointer" onClick={onClick}>
      <div className="h-36 overflow-hidden bg-gray-100 relative">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-blue-50">
            <div className="text-4xl text-blue-200">📄</div>
          </div>
        )}
      </div>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold line-clamp-2 mb-1">
            {title}
          </CardTitle>
        </div>
        {category && (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 text-xs">
            {category}
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
        <div className="flex items-center gap-1">
          <Download size={14} />
          <span>{downloadCount || 0}</span>
        </div>
      </CardFooter>
    </Card>
  );
};