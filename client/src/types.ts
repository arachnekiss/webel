import { Resource as DbResource } from "@shared/schema";

// Resource 타입 확장 - DbResource의 필드들에 추가 필드 정의
export interface Resource extends Omit<DbResource, 'category'> {
  resourceType?: string;
  category: string;
  uploadDate?: Date; 
  galleryImages?: string[] | null;
  uploadDateFormatted?: string;
  howToUse?: string;
  assemblyInstructions?: string | {
    steps?: Array<{
      title: string;
      description: string;
      imageUrl?: string;
    }>;
    materials?: string[];
    tools?: string[];
    notes?: string;
  };
}

export interface InsertResource {
  title: string;
  description: string;
  category: string;
  resourceType?: string;
  tags?: string[];
  imageUrl?: string;
  thumbnailUrl?: string;
  downloadUrl?: string;
  downloadFile?: string;
  howToUse?: string;
  assemblyInstructions?: string | any;
  sourceSite?: string;
  subcategory?: string;
  isFeatured?: boolean;
  isCrawled?: boolean;
}

// 서비스 타입 정의
export interface Service {
  id: number;
  title: string;
  description: string;
  providerName?: string;
  providerId?: number;
  location?: {
    lat: number;
    long: number;
    address?: string;
  };
  serviceType?: string;
  price?: number;
  priceUnit?: string;
  currency?: string;
  availability?: string;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  tags?: string[] | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  isVerified?: boolean | null;
  distance?: number;
}