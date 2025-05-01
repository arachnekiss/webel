import { Resource as DbResource } from "@shared/schema";

// Resource 타입 확장
export interface Resource extends DbResource {
  resourceType?: string;
  category?: string;
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