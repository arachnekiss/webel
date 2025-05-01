import { pgTable, text, serial, integer, boolean, timestamp, jsonb, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  location: jsonb("location"), // { lat: number, long: number, address: string }
  isServiceProvider: boolean("is_service_provider").default(false),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Services schema
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  serviceType: text("service_type").notNull(), // 3d_printing, electronics, woodworking, engineer, etc.
  location: jsonb("location").notNull(), // { lat: number, long: number, address: string }
  rating: doublePrecision("rating"),
  ratingCount: integer("rating_count").default(0),
  tags: text("tags").array(),
  imageUrl: text("image_url"),
  // 3D 프린터 관련 정보 추가
  printerModel: text("printer_model"), // 3D 프린터 모델명
  contactPhone: text("contact_phone"), // 연락처 전화번호
  contactEmail: text("contact_email"), // 연락처 이메일
  pricing: text("pricing"), // 이용 비용 (무료 가능)
  isIndividual: boolean("is_individual").default(false), // true면 개인, false면 사업자
  // 엔지니어 서비스 관련 정보
  specialty: text("specialty"), // 전문 분야 (전자, 기계, 소프트웨어 등)
  experience: integer("experience"), // 경력 연수
  hourlyRate: integer("hourly_rate"), // 시간당 요금
  availableItems: text("available_items").array(), // 조립/수리 가능한 아이템 목록
  portfolioUrl: text("portfolio_url"), // 포트폴리오 URL
  isVerified: boolean("is_verified").default(false), // 관리자 검증 여부
  createdAt: timestamp("created_at").defaultNow(),
});

// Resources schema
export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  // 사용자 정보
  userId: integer("user_id").references(() => users.id),
  
  // 기본 정보
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // hardware_design, software, 3d_model, free_content, ai_model, flash_game
  subcategory: text("subcategory"), // 세부 카테고리 
  tags: text("tags").array(),
  
  // 이미지 및 시각 자료
  imageUrl: text("image_url"), // 주요 대표 이미지
  thumbnailUrl: text("thumbnail_url"), // 썸네일 이미지
  galleryImages: jsonb("gallery_images"), // 추가 이미지 목록 (배열)
  
  // 다운로드 정보
  downloadUrl: text("download_url"), // 외부 다운로드 링크
  downloadFile: text("download_file"), // 업로드된 파일 경로
  downloadCount: integer("download_count").default(0), // 다운로드 횟수
  
  // 콘텐츠 상세 정보
  howToUse: text("how_to_use"), // 사용 방법/사용법
  assemblyInstructions: text("assembly_instructions"), // 조립 방법 (텍스트)
  version: text("version"), // 버전 정보
  license: text("license"), // 라이센스 정보
  sourceSite: text("source_site"), // 원본 출처 사이트
  
  // 메타 정보
  createdAt: timestamp("created_at").defaultNow(), // 업로드 일자
  updatedAt: timestamp("updated_at"), // 마지막 수정 일자
  
  // 상태 플래그
  isFeatured: boolean("is_featured").default(false), // 관리자 추천 여부 
  isCrawled: boolean("is_crawled").default(false), // 크롤링된 리소스 여부
  isApproved: boolean("is_approved").default(true), // 승인 여부 (기본값: 승인됨)
  viewCount: integer("view_count").default(0) // 조회수
});

// Auctions schema
export const auctions = pgTable("auctions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id), // Creator of the auction
  title: text("title").notNull(),
  description: text("description").notNull(), 
  auctionType: text("auction_type").notNull(), // 3d_printing, electronics, woodworking, etc.
  location: jsonb("location"), // Preferred location if any
  tags: text("tags").array(),
  deadline: timestamp("deadline").notNull(),
  currentLowestBid: integer("current_lowest_bid"),
  bidCount: integer("bid_count").default(0),
  status: text("status").default("active"), // active, completed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
});

// Bids schema
export const bids = pgTable("bids", {
  id: serial("id").primaryKey(),
  auctionId: integer("auction_id").references(() => auctions.id),
  userId: integer("user_id").references(() => users.id), // Bidder
  amount: integer("amount").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas using zod
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertServiceSchema = createInsertSchema(services).omit({ id: true, createdAt: true, rating: true, ratingCount: true });
export const insertResourceSchema = createInsertSchema(resources).omit({ id: true, createdAt: true, downloadCount: true });
export const insertAuctionSchema = createInsertSchema(auctions).omit({ id: true, createdAt: true, currentLowestBid: true, bidCount: true, status: true });
export const insertBidSchema = createInsertSchema(bids).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;

// Base Resource type from database
export type ResourceBase = typeof resources.$inferSelect;

// Extended Resource type with virtual field
export type Resource = ResourceBase & {
  // Virtual field that mirrors category
  resourceType?: string;
  // 시각화 및 가상 필드
  galleryImages?: string[] | null; // 갤러리 이미지들 (배열)
  uploadDate?: Date; // createdAt의 별칭
  uploadDateFormatted?: string; // 포맷된 업로드 일자 (YYYY년 MM월 DD일 형식)
};

export type InsertResource = z.infer<typeof insertResourceSchema> & {
  // Include resourceType in insert type for backwards compatibility
  resourceType?: string;
};

export type Auction = typeof auctions.$inferSelect;
export type InsertAuction = z.infer<typeof insertAuctionSchema>;

export type Bid = typeof bids.$inferSelect;
export type InsertBid = z.infer<typeof insertBidSchema>;

// Location type used across schemas
export type Location = {
  lat: number;
  long: number;
  address: string;
  city?: string;
  country?: string;
};

// Service and Resource types
export type ServiceType = '3d_printing' | 'electronics' | 'woodworking' | 'metalworking' | 'manufacturing' | 'engineer';
// 카테고리로 통합, 한글명: 하드웨어 설계도, 소프트웨어 오픈소스, 3D 모델링 파일, 프리 콘텐츠, AI 모델, 플래시 게임
export type ResourceType = 'hardware_design' | 'software' | '3d_model' | 'free_content' | 'ai_model' | 'flash_game';
