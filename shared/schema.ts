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
  location: jsonb("location"), // { lat: number, long, address: string }
  isServiceProvider: boolean("is_service_provider").default(false),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  // 본인 인증 관련 필드
  isPhoneVerified: boolean("is_phone_verified").default(false),
  phoneNumber: text("phone_number"),
  // 결제 정보 관련 필드
  bankAccountInfo: jsonb("bank_account_info"), // { bank: string, accountNumber: string, accountHolder: string }
  isAccountVerified: boolean("is_account_verified").default(false),
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
  
  // 가격 및 결제 관련 필드
  isFreeService: boolean("is_free_service").default(false), // 무료 서비스 여부
  pricing: text("pricing"), // 이용 비용 텍스트 설명 (무료 가능)
  price: integer("price"), // 고정 가격 (원 단위)
  pricePerHour: integer("price_per_hour"), // 시간당 가격 (원 단위)
  pricePerUnit: integer("price_per_unit"), // 단위당 가격 (원 단위)
  pricingUnit: text("pricing_unit"), // 단위 (예: 그램, 개수 등)
  pricingNotes: text("pricing_notes"), // 가격 관련 추가 정보
  isNegotiable: boolean("is_negotiable").default(false), // 가격 협상 가능 여부
  isRemote: boolean("is_remote").default(false), // 원격 작업 가능 여부
  availability: text("availability"), // 가용성 (immediate, within_week, within_month, not_specified)
  paymentOptions: text("payment_options").array(), // 지원하는 결제 옵션 (예: paypal, kakao_pay, toss)
  
  isIndividual: boolean("is_individual").default(false), // true면 개인, false면 사업자
  // 엔지니어 서비스 관련 정보
  specialty: text("specialty"), // 전문 분야 (전자, 기계, 소프트웨어 등)
  experience: integer("experience"), // 경력 연수
  hourlyRate: integer("hourly_rate"), // 시간당 요금 (이전 필드, price_per_hour와 통합 예정)
  availableItems: text("available_items").array(), // 조립/수리 가능한 아이템 목록
  portfolioUrl: text("portfolio_url"), // 포트폴리오 URL
  isVerified: boolean("is_verified").default(false), // 관리자 검증 여부
  createdAt: timestamp("created_at").defaultNow(),
});

// Resources schema
// We'll define this based on the actual database structure
export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  // userId는 실제 DB에 아직 없음 - 추후 마이그레이션으로 추가 예정
  // userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  // Note: resourceType doesn't exist in the actual DB, but we need it for type safety
  // We'll manually add it when fetching data
  category: text("category").notNull(), // hardware_design, software, 3d_model, free_content, ai_model, flash_game
  tags: text("tags").array(),
  imageUrl: text("image_url"),
  thumbnailUrl: text("thumbnail_url"), // New field for storing thumbnail images
  // 아직 실제 DB에 없는 필드들 - 추후 마이그레이션으로 추가 예정
  // thumbnails: jsonb("thumbnails"),
  downloadUrl: text("download_url"),
  downloadFile: text("download_file"), // Path or reference to the uploaded file
  downloadCount: integer("download_count").default(0),
  howToUse: text("how_to_use"), // Instructions for using the resource
  assemblyInstructions: jsonb("assembly_instructions"), // Step by step assembly instructions
  // version: text("version"),
  // license: text("license"),
  sourceSite: text("source_site"), // Original source website
  createdAt: timestamp("created_at").defaultNow(), // This serves as the uploadDate
  subcategory: text("subcategory"), // More specific categorization within category
  isFeatured: boolean("is_featured").default(false), // 관리자 추천 여부 
  isCrawled: boolean("is_crawled").default(false) // Flag for automatically crawled resources
  
  // Add a virtual field to mirror category for backwards compatibility
  // This is not in the database, but we'll add it in our code
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

// 주문(서비스 요청) 테이블
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  serviceId: integer("service_id").references(() => services.id),
  userId: integer("user_id").references(() => users.id), // 구매자
  providerId: integer("provider_id").references(() => users.id), // 서비스 제공자
  status: text("status").default("pending"), // pending, paid, in_progress, completed, cancelled
  totalAmount: integer("total_amount").notNull(), // 총 결제 금액 (원 단위)
  webFee: integer("web_fee").notNull(), // Webel 수수료 (원 단위, 총액의 10%)
  providerAmount: integer("provider_amount").notNull(), // 제공자 정산 금액 (원 단위, 총액의 90%)
  quantity: integer("quantity").default(1), // 서비스 수량/시간
  details: jsonb("details"), // 주문 상세 정보 (추가 요청사항 등)
  paymentMethod: text("payment_method"), // 결제 수단 (paypal, kakao_pay, toss 등)
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"), // 완료 시간
});

// 결제 트랜잭션 테이블
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id),
  userId: integer("user_id").references(() => users.id), // 결제자
  amount: integer("amount").notNull(), // 결제 금액
  currency: text("currency").default("KRW"), // 통화 (KRW, USD, JPY 등)
  paymentMethod: text("payment_method").notNull(), // 결제 수단
  paymentGateway: text("payment_gateway").notNull(), // 결제 게이트웨이 (paypal, kakao_pay, toss 등)
  transactionId: text("transaction_id"), // 외부 결제 시스템 트랜잭션 ID
  status: text("status").notNull(), // pending, success, failed, refunded
  errorMessage: text("error_message"), // 실패 시 오류 메시지
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  metadata: jsonb("metadata"), // 추가 정보 (영수증 URL 등)
});

// Insert schemas using zod
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertServiceSchema = createInsertSchema(services).omit({ id: true, createdAt: true, rating: true, ratingCount: true });
export const insertResourceSchema = createInsertSchema(resources).omit({ id: true, createdAt: true, downloadCount: true });
export const insertAuctionSchema = createInsertSchema(auctions).omit({ id: true, createdAt: true, currentLowestBid: true, bidCount: true, status: true });
export const insertBidSchema = createInsertSchema(bids).omit({ id: true, createdAt: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, completedAt: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, createdAt: true, updatedAt: true });

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
  
  // 추가 리소스 정보 필드 (UI용)
  fileType?: string; // 파일 형식 (예: ZIP, PDF, STL 등)
  fileSize?: string; // 파일 크기 (예: 10MB, 2.5GB 등)
  version?: string; // 버전 정보 (예: 1.0.0, 2022년 버전 등)
  license?: string; // 라이센스 정보 (예: MIT, CC-BY 등)
  requirements?: string; // 요구사항 (예: Windows 10 이상, Arduino IDE 등)
  compatibility?: string; // 호환성 정보 (예: Arduino, Raspberry Pi, Windows/Mac/Linux 등)
  difficulty?: string; // 난이도 정보 (예: 초급, 중급, 고급 등)
};

export type InsertResource = z.infer<typeof insertResourceSchema> & {
  // Include resourceType in insert type for backwards compatibility
  resourceType?: string;
};

export type Auction = typeof auctions.$inferSelect;
export type InsertAuction = z.infer<typeof insertAuctionSchema>;

export type Bid = typeof bids.$inferSelect;
export type InsertBid = z.infer<typeof insertBidSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

// 결제 방법 타입 정의
export type PaymentMethod = 'paypal' | 'kakao_pay' | 'toss' | 'credit_card' | 'bank_transfer';

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
