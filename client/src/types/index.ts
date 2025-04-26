export interface Location {
  lat: number;
  long: number;
  address: string;
  city?: string;
  country?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  location?: Location;
  isServiceProvider: boolean;
  createdAt: string;
}

export interface Service {
  id: number;
  userId: number;
  title: string;
  description: string;
  serviceType: string;
  location: Location;
  rating?: number;
  ratingCount?: number;
  tags: string[];
  imageUrl?: string;
  // 3D 프린터 관련 정보
  printerModel?: string;
  contactPhone?: string;
  contactEmail?: string;
  pricing?: string;
  isIndividual?: boolean;
  createdAt: string;
}

export interface Resource {
  id: number;
  title: string;
  description: string;
  resourceType: string;
  tags: string[];
  imageUrl?: string;
  downloadUrl: string;
  downloadCount: number;
  materialsList?: string[];
  recipe?: any; // Step by step assembly or usage instructions
  createdAt: string;
  isCrawled: boolean;
  sourceSite?: string;
}

export interface Auction {
  id: number;
  userId: number;
  title: string;
  description: string;
  auctionType: string;
  location?: Location;
  tags: string[];
  deadline: string;
  currentLowestBid?: number;
  bidCount: number;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface Bid {
  id: number;
  auctionId: number;
  userId: number;
  amount: number;
  description?: string;
  createdAt: string;
}

export type ServiceType = '3d_printing' | 'electronics' | 'woodworking' | 'metalworking' | 'manufacturing';
export type ResourceType = 'hardware_design' | 'software' | '3d_model' | 'free_content' | 'ai_model' | 'flash_game';
