import {
  users, type User, type InsertUser,
  services, type Service, type InsertService,
  resources, type Resource, type InsertResource,
  auctions, type Auction, type InsertAuction,
  bids, type Bid, type InsertBid,
  orders, type Order, type InsertOrder,
  transactions, type Transaction, type InsertTransaction,
  type Location
} from "@shared/schema";
import { db, pool, executeWithRetry } from "./db";
import { eq, and, desc, asc, inArray, sql } from "drizzle-orm";

import session from 'express-session';
import { Store } from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import createMemoryStore from 'memorystore';

// 캐싱 시스템 임포트
import { 
  cache, 
  staticCache, 
  userCache, 
  generateCacheKey, 
  clearCacheByPrefix 
} from './cache';

// Interface for storage operations
export interface IStorage {
  // Session store for persistence
  sessionStore: Store;
  
  // User operations
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  setAdminStatus(id: number, isAdmin: boolean): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // 사용자 인증 관련 메서드
  verifyPhone(id: number, phoneNumber: string): Promise<User | undefined>;
  registerBankAccount(id: number, bankInfo: any): Promise<User | undefined>;
  getVerificationStatus(id: number): Promise<{
    isPhoneVerified: boolean;
    isAccountVerified: boolean;
    phoneNumber?: string;
    bankAccountInfo?: any;
  } | undefined>;
  
  // Service operations
  getServices(): Promise<Service[]>;
  getServiceById(id: number): Promise<Service | undefined>;
  getServicesByType(type: string): Promise<Service[]>;
  getServicesByLocation(location: Location, maxDistance: number): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<Service>): Promise<Service | undefined>;
  
  // Resource operations
  getResources(): Promise<Resource[]>;
  getResourceById(id: number): Promise<Resource | undefined>;
  getResourcesByCategory(category: string): Promise<Resource[]>;
  createResource(resource: InsertResource): Promise<Resource>;
  updateResource(id: number, resource: Partial<Resource>): Promise<Resource | undefined>;
  incrementDownloadCount(id: number): Promise<Resource | undefined>;
  deleteResource(id: number): Promise<boolean>;
  
  // Auction operations
  getAuctions(): Promise<Auction[]>;
  getAuctionById(id: number): Promise<Auction | undefined>;
  getAuctionsByType(type: string): Promise<Auction[]>;
  getActiveAuctions(): Promise<Auction[]>;
  createAuction(auction: InsertAuction): Promise<Auction>;
  updateAuction(id: number, auction: Partial<Auction>): Promise<Auction | undefined>;
  
  // Bid operations
  getBidsByAuctionId(auctionId: number): Promise<Bid[]>;
  createBid(bid: InsertBid): Promise<Bid>;
  
  // Order operations
  getOrders(): Promise<Order[]>;
  getOrderById(id: number): Promise<Order | undefined>;
  getOrdersByUserId(userId: number): Promise<Order[]>;
  getOrdersByProviderId(providerId: number): Promise<Order[]>;
  getOrdersByServiceId(serviceId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, order: Partial<Order>): Promise<Order | undefined>;
  
  // Transaction operations
  getTransactions(): Promise<Transaction[]>;
  getTransactionById(id: number): Promise<Transaction | undefined>;
  getTransactionsByUserId(userId: number): Promise<Transaction[]>;
  getTransactionsByOrderId(orderId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, transaction: Partial<Transaction>): Promise<Transaction | undefined>;
}

// Database implementation of storage interface
export class DatabaseStorage implements IStorage {
  sessionStore: Store;
  
  constructor() {
    // PostgreSQL 세션 스토어 설정
    const PostgresStore = connectPgSimple(session);
    this.sessionStore = new PostgresStore({
      pool, // From db.ts
      createTableIfMissing: true
    });
  }
  
  // User operations
  async getUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }
  
  async getUser(id: number): Promise<User | undefined> {
    // 캐시 키 생성
    const cacheKey = generateCacheKey('user', { id });
    
    // 캐시에서 데이터 확인
    const cachedUser = userCache.get<User>(cacheKey);
    if (cachedUser) {
      return cachedUser;
    }
    
    try {
      // 재시도 로직 사용
      const [user] = await executeWithRetry(async () => {
        return db.select().from(users).where(eq(users.id, id));
      });
      
      // 결과 캐싱
      if (user) {
        userCache.set(cacheKey, user);
      }
      
      return user;
    } catch (error) {
      console.error(`Error retrieving user with ID ${id}:`, error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // 캐시 키 생성
    const cacheKey = generateCacheKey('user_by_username', { username });
    
    // 캐시에서 데이터 확인
    const cachedUser = userCache.get<User>(cacheKey);
    if (cachedUser) {
      return cachedUser;
    }
    
    try {
      // 재시도 로직 사용
      const [user] = await executeWithRetry(async () => {
        return db.select().from(users).where(eq(users.username, username));
      });
      
      // 결과 캐싱
      if (user) {
        userCache.set(cacheKey, user);
        // ID 기반 캐싱도 추가
        userCache.set(generateCacheKey('user', { id: user.id }), user);
      }
      
      return user;
    } catch (error) {
      console.error(`Error retrieving user by username ${username}:`, error);
      return undefined;
    }
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    // 캐시 키 생성
    const cacheKey = generateCacheKey('user_by_email', { email });
    
    // 캐시에서 데이터 확인
    const cachedUser = userCache.get<User>(cacheKey);
    if (cachedUser) {
      return cachedUser;
    }
    
    try {
      // 재시도 로직 사용
      const [user] = await executeWithRetry(async () => {
        return db.select().from(users).where(eq(users.email, email));
      });
      
      // 결과 캐싱
      if (user) {
        userCache.set(cacheKey, user);
        // ID 기반 캐싱도 추가
        userCache.set(generateCacheKey('user', { id: user.id }), user);
      }
      
      return user;
    } catch (error) {
      console.error(`Error retrieving user by email ${email}:`, error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      // 재시도 로직 사용
      const [user] = await executeWithRetry(async () => {
        return db.insert(users).values({
          ...insertUser,
          isAdmin: false
        }).returning();
      });
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error; // Registration should fail if database operation fails
    }
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    // 기존 사용자 정보 가져오기
    const existingUser = await this.getUser(id);
    if (!existingUser) return undefined;
    
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
      
    if (updatedUser) {
      // 사용자 관련 캐시 무효화
      userCache.del(generateCacheKey('user', { id }));
      
      if (existingUser.username) {
        userCache.del(generateCacheKey('user_by_username', { username: existingUser.username }));
      }
      
      if (existingUser.email) {
        userCache.del(generateCacheKey('user_by_email', { email: existingUser.email }));
      }
      
      // 새로운 캐시 설정
      userCache.set(generateCacheKey('user', { id }), updatedUser);
      
      if (updatedUser.username) {
        userCache.set(generateCacheKey('user_by_username', { username: updatedUser.username }), updatedUser);
      }
      
      if (updatedUser.email) {
        userCache.set(generateCacheKey('user_by_email', { email: updatedUser.email }), updatedUser);
      }
    }
    
    return updatedUser;
  }
  
  async setAdminStatus(id: number, isAdmin: boolean): Promise<User | undefined> {
    return this.updateUser(id, { isAdmin });
  }
  
  async deleteUser(id: number): Promise<boolean> {
    try {
      // 기존 사용자 정보 가져오기
      const existingUser = await this.getUser(id);
      if (!existingUser) return false;
      
      await db.delete(users).where(eq(users.id, id));
      
      // 사용자 관련 캐시 무효화
      userCache.del(generateCacheKey('user', { id }));
      
      if (existingUser.username) {
        userCache.del(generateCacheKey('user_by_username', { username: existingUser.username }));
      }
      
      if (existingUser.email) {
        userCache.del(generateCacheKey('user_by_email', { email: existingUser.email }));
      }
      
      // 사용자 목록 캐시 무효화
      clearCacheByPrefix('users_');
      
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  // Service operations
  async getServices(limit?: number): Promise<Service[]> {
    // 캐시 키 생성
    const cacheKey = generateCacheKey('services', { limit });
      
    // 캐시에서 데이터 확인
    const cachedData = cache.get<Service[]>(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    // DB에서 가져오기
    let query = db.select().from(services).orderBy(desc(services.createdAt));
    
    // 결과 제한
    if (limit) {
      query = query.limit(limit);
    }
    
    const results = await query;
    
    // 결과 캐싱
    cache.set(cacheKey, results);
    
    return results;
  }

  async getServiceById(id: number): Promise<Service | undefined> {
    // 캐시 키 생성
    const cacheKey = generateCacheKey('service', { id });
      
    // 캐시에서 데이터 확인
    const cachedData = cache.get<Service>(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    const [service] = await db.select().from(services).where(eq(services.id, id));
    
    // 결과 캐싱
    if (service) {
      cache.set(cacheKey, service);
    }
    
    return service;
  }

  async getServicesByType(type: string, limit?: number): Promise<Service[]> {
    // 캐시 키 생성
    const cacheKey = generateCacheKey('services_by_type', { type, limit });
      
    // 캐시에서 데이터 확인
    const cachedData = staticCache.get<Service[]>(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    // DB에서 가져오기
    let query = db.select().from(services).where(eq(services.serviceType, type));
    
    // 결과 제한
    if (limit) {
      query = query.limit(limit);
    }
    
    const results = await query;
    
    // 결과 캐싱
    staticCache.set(cacheKey, results);
    
    return results;
  }

  async getServicesByLocation(location: Location, maxDistance: number, serviceType?: string): Promise<Service[]> {
    // 캐시 키 생성
    const cacheKey = generateCacheKey('services_by_location', { 
      lat: location.lat, 
      long: location.long, 
      maxDistance, 
      serviceType 
    });
      
    // 캐시에서 데이터 확인 - 짧은 TTL 사용
    const cachedData = cache.get<Service[]>(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    // 먼저 모든 서비스 또는 특정 타입의 서비스를 가져옴
    const allServices = serviceType 
      ? await this.getServicesByType(serviceType) 
      : await this.getServices();
    
    // 거리와 함께 결과 반환
    const servicesWithDistance = allServices
      .filter(service => {
        if (!service.location) return false;
        const serviceLocation = service.location as Location;
        
        // 하버사인 공식으로 거리 계산
        const distance = this.calculateDistance(
          location.lat,
          location.long,
          serviceLocation.lat,
          serviceLocation.long
        );
        
        // 거리 정보 추가 및 최대 거리 이내인 서비스만 필터링
        (service as any).distance = parseFloat(distance.toFixed(1));
        return distance <= maxDistance;
      })
      // 가까운 순으로 정렬
      .sort((a, b) => (a as any).distance - (b as any).distance);
    
    // 결과 캐싱
    cache.set(cacheKey, servicesWithDistance);
    
    return servicesWithDistance;
  }

  async createService(service: InsertService): Promise<Service> {
    try {
      // 배열 타입 필드 정확하게 처리
      const processedData = {
        ...service,
        rating: 0,
        ratingCount: 0
      };
      
      // tags가 null이거나 undefined인 경우 빈 배열로 설정
      if (!processedData.tags) {
        processedData.tags = [];
      }
      
      // availableItems가 null이거나 undefined인 경우 빈 배열로 설정
      if (!processedData.availableItems) {
        processedData.availableItems = [];
      }
      
      // DB 삽입 전 로그 출력
      console.log('서비스 생성 데이터(정제 후):', {
        ...processedData,
        userId: processedData.userId ? '사용자 ID' : null // 로그에는 민감 정보 제외
      });
      
      const [createdService] = await db.insert(services).values(processedData).returning();
      
      // 서비스 목록 관련 캐시 무효화
      clearCacheByPrefix('services');
      
      // 서비스 타입별 캐시 무효화
      if (createdService.serviceType) {
        clearCacheByPrefix(`services_by_type-${JSON.stringify({ type: createdService.serviceType })}`);
      }
      
      return createdService;
    } catch (error) {
      console.error('서비스 생성 DB 오류:', error);
      throw error;
    }
  }

  async updateService(id: number, serviceUpdate: Partial<Service>): Promise<Service | undefined> {
    // 기존 서비스 정보 가져오기
    const existingService = await this.getServiceById(id);
    if (!existingService) return undefined;
    
    const [updatedService] = await db
      .update(services)
      .set(serviceUpdate)
      .where(eq(services.id, id))
      .returning();
      
    if (updatedService) {
      // 서비스 캐시 무효화
      cache.del(generateCacheKey('service', { id }));
      
      // 서비스 목록 관련 캐시 무효화
      clearCacheByPrefix('services');
      
      // 서비스 타입이 변경된 경우, 이전 타입 및 새 타입 관련 캐시 무효화
      if (existingService.serviceType) {
        clearCacheByPrefix(`services_by_type-${JSON.stringify({ type: existingService.serviceType })}`);
      }
      
      if (updatedService.serviceType && existingService.serviceType !== updatedService.serviceType) {
        clearCacheByPrefix(`services_by_type-${JSON.stringify({ type: updatedService.serviceType })}`);
      }
      
      // 위치 기반 서비스 캐시 무효화
      clearCacheByPrefix('services_by_location');
    }
    
    return updatedService;
  }

  // Resource operations
  async getResources(limit?: number): Promise<Resource[]> {
    try {
      // 캐시 키 생성
      const cacheKey = generateCacheKey('resources', { limit });
      
      // 캐시에서 데이터 확인
      const cachedData = cache.get<Resource[]>(cacheKey);
      if (cachedData) {
        return cachedData;
      }
      
      // 삭제되지 않은 리소스만 가져오기 (deleted_at이 null인 경우)
      let query = db.select()
        .from(resources)
        .where(sql`${resources.deletedAt} IS NULL`)
        .orderBy(desc(resources.createdAt));
        
      // 결과 제한
      if (limit) {
        query = query.limit(limit);
      }
      
      const results = await query;
      
      // Add resourceType field to match category for type safety
      const processedResults = results.map(resource => {
        if (resource.category) {
          (resource as any).resourceType = resource.category;
        }
        return resource;
      });
      
      // 결과 캐싱
      cache.set(cacheKey, processedResults);
      
      return processedResults;
    } catch (error) {
      console.error('Error getting all resources:', error);
      return [];
    }
  }

  async getResourceById(id: number): Promise<Resource | undefined> {
    try {
      // 캐시 키 생성
      const cacheKey = generateCacheKey('resource', { id });
      
      // 캐시에서 데이터 확인
      const cachedData = cache.get<Resource>(cacheKey);
      if (cachedData) {
        return cachedData;
      }
      
      const [resource] = await db.select()
        .from(resources)
        .where(
          and(
            eq(resources.id, id),
            sql`${resources.deletedAt} IS NULL` // 삭제되지 않은 리소스만 조회
          )
        );
      
      if (resource && resource.category) {
        // Add resourceType field based on category for type compatibility
        (resource as any).resourceType = resource.category;
      }
      
      // 결과 캐싱
      if (resource) {
        cache.set(cacheKey, resource);
      }
      
      return resource;
    } catch (error) {
      console.error(`Error getting resource with id ${id}:`, error);
      return undefined;
    }
  }

  async getResourcesByType(type: string): Promise<Resource[]> {
    // Keep for backwards compatibility but internally use category
    return this.getResourcesByCategory(type);
  }

  async getResourcesByCategory(category: string, limit?: number): Promise<Resource[]> {
    // Query only by the category column that exists in the database
    try {
      // 캐시 키 생성
      const cacheKey = generateCacheKey('resources_by_category', { category, limit });
      
      // 캐시에서 데이터 확인
      const cachedData = staticCache.get<Resource[]>(cacheKey);
      if (cachedData) {
        return cachedData;
      }
      
      // Use sql to construct a query with only the columns that exist in the database
      let query = db
        .select()
        .from(resources)
        .where(
          and(
            eq(resources.category, category),
            sql`${resources.deletedAt} IS NULL` // 삭제되지 않은 리소스만 조회
          )
        );
        
      // 결과 제한
      if (limit) {
        query = query.limit(limit);
      }
      
      const results = await query;
      
      // Add resourceType field to each resource for type compatibility
      const processedResults = results.map(resource => {
        if (resource) {
          (resource as any).resourceType = category;
        }
        return resource;
      });
      
      // 결과 캐싱
      staticCache.set(cacheKey, processedResults);
      
      return processedResults;
    } catch (error) {
      console.error(`Error getting resources by category '${category}':`, error);
      return []; // Return empty array instead of throwing error to avoid breaking the UI
    }
  }

  async createResource(resource: InsertResource): Promise<Resource> {
    try {
      // Check if resourceType is provided but category is not
      if (resource.resourceType && !resource.category) {
        // Set category to match resourceType for consistency
        resource.category = resource.resourceType;
      }
      
      // Remove resourceType if it's included to avoid DB errors
      const sanitizedResource = { ...resource };
      delete (sanitizedResource as any).resourceType;
      
      const [createdResource] = await db.insert(resources).values({
        ...sanitizedResource,
        downloadCount: 0
      }).returning();
      
      // For TypeScript compatibility, add resourceType back to the returned object
      // since the schema expects it (even though DB doesn't have it)
      if (createdResource && createdResource.category) {
        (createdResource as any).resourceType = createdResource.category;
      }
      
      // 리소스 목록 관련 캐시 무효화
      clearCacheByPrefix('resources');
      
      // 카테고리별 리소스 캐시 무효화
      if (createdResource.category) {
        clearCacheByPrefix(`resources_by_category-${JSON.stringify({ category: createdResource.category })}`);
      }
      
      return createdResource;
    } catch (error) {
      console.error('Error creating resource:', error);
      throw error;
    }
  }

  async updateResource(id: number, resourceUpdate: Partial<Resource>): Promise<Resource | undefined> {
    try {
      // 기존 리소스 정보 가져오기
      const existingResource = await this.getResourceById(id);
      if (!existingResource) return undefined;
      
      // Handle resourceType to category mapping
      if (resourceUpdate.resourceType && !resourceUpdate.category) {
        resourceUpdate.category = resourceUpdate.resourceType;
      }
      
      // Remove resourceType field to avoid DB errors
      const sanitizedUpdate = { ...resourceUpdate };
      delete (sanitizedUpdate as any).resourceType;
      
      const [updatedResource] = await db
        .update(resources)
        .set(sanitizedUpdate)
        .where(eq(resources.id, id))
        .returning();
      
      // Add resourceType back to the returned object for type compatibility
      if (updatedResource && updatedResource.category) {
        (updatedResource as any).resourceType = updatedResource.category;
      }
      
      // 리소스 캐시 무효화
      cache.del(generateCacheKey('resource', { id }));
      
      // 리소스 목록 관련 캐시 무효화
      clearCacheByPrefix('resources');
      
      // 카테고리가 변경된 경우, 이전 카테고리 및 새 카테고리 관련 캐시 무효화
      const oldCategory = existingResource?.category;
      const newCategory = updatedResource?.category;
      
      if (oldCategory) {
        clearCacheByPrefix(`resources_by_category-${JSON.stringify({ category: oldCategory })}`);
      }
      
      if (newCategory && oldCategory !== newCategory) {
        clearCacheByPrefix(`resources_by_category-${JSON.stringify({ category: newCategory })}`);
      }
      
      return updatedResource;
    } catch (error) {
      console.error(`Error updating resource with id ${id}:`, error);
      throw error;
    }
  }

  async incrementDownloadCount(id: number): Promise<Resource | undefined> {
    try {
      const [resource] = await db.select()
        .from(resources)
        .where(
          and(
            eq(resources.id, id),
            sql`${resources.deletedAt} IS NULL`
          )
        );
      if (!resource) return undefined;

      const [updatedResource] = await db
        .update(resources)
        .set({
          downloadCount: (resource.downloadCount || 0) + 1
        })
        .where(eq(resources.id, id))
        .returning();
      
      // Add resourceType back for type compatibility
      if (updatedResource && updatedResource.category) {
        (updatedResource as any).resourceType = updatedResource.category;
      }
      
      // 리소스 캐시 업데이트
      const cacheKey = generateCacheKey('resource', { id });
      cache.set(cacheKey, updatedResource);
      
      return updatedResource;
    } catch (error) {
      console.error(`Error incrementing download count for resource ${id}:`, error);
      return undefined;
    }
  }
  
  // 소프트 삭제 - deleted_at 타임스탬프만 설정
  async deleteResource(id: number): Promise<boolean> {
    try {
      // 기존 리소스 정보 가져오기
      const existingResource = await this.getResourceById(id);
      if (!existingResource) return false;
      
      // 현재 시간으로 deleted_at 필드 설정
      const now = new Date();
      
      const [deleted] = await db
        .update(resources)
        .set({
          deletedAt: now
        })
        .where(
          and(
            eq(resources.id, id),
            sql`${resources.deletedAt} IS NULL` // 이미 삭제된 리소스를 다시 삭제하지 않도록 함
          )
        )
        .returning();
      
      if (deleted) {
        // 리소스 캐시 무효화
        cache.del(generateCacheKey('resource', { id }));
        
        // 리소스 목록 관련 캐시 무효화
        clearCacheByPrefix('resources');
        
        // 카테고리별 리소스 캐시 무효화
        if (existingResource.category) {
          clearCacheByPrefix(`resources_by_category-${JSON.stringify({ category: existingResource.category })}`);
        }
      }
      
      return !!deleted; // 삭제된 리소스가 있으면 true, 없으면 false 반환
    } catch (error) {
      console.error(`Error soft-deleting resource with id ${id}:`, error);
      return false;
    }
  }

  // Auction operations
  async getAuctions(): Promise<Auction[]> {
    return db.select().from(auctions).orderBy(desc(auctions.createdAt));
  }

  async getAuctionById(id: number): Promise<Auction | undefined> {
    const [auction] = await db.select().from(auctions).where(eq(auctions.id, id));
    return auction;
  }

  async getAuctionsByType(type: string): Promise<Auction[]> {
    return db.select().from(auctions).where(eq(auctions.auctionType, type));
  }

  async getActiveAuctions(): Promise<Auction[]> {
    return db
      .select()
      .from(auctions)
      .where(
        and(
          eq(auctions.status, 'active'),
          sql`${auctions.deadline} > NOW()`
        )
      );
  }

  async createAuction(auction: InsertAuction): Promise<Auction> {
    const [createdAuction] = await db.insert(auctions).values({
      ...auction,
      bidCount: 0,
      status: 'active'
    }).returning();
    return createdAuction;
  }

  async updateAuction(id: number, auctionUpdate: Partial<Auction>): Promise<Auction | undefined> {
    const [updatedAuction] = await db
      .update(auctions)
      .set(auctionUpdate)
      .where(eq(auctions.id, id))
      .returning();
    return updatedAuction;
  }

  // Bid operations
  async getBidsByAuctionId(auctionId: number): Promise<Bid[]> {
    return db
      .select()
      .from(bids)
      .where(eq(bids.auctionId, auctionId))
      .orderBy(asc(bids.amount));
  }

  async createBid(bid: InsertBid): Promise<Bid> {
    const [createdBid] = await db.insert(bids).values(bid).returning();
    
    // Update auction with new bid info
    // 타입 안전성을 위해 auctionId가 number인지 확인
    if (typeof bid.auctionId === 'number') {
      const auction = await this.getAuctionById(bid.auctionId);
      if (auction) {
        const bidCount = auction.bidCount || 0;
        const currentLowestBid = auction.currentLowestBid;
        
        // 타입 안전성을 위해 auction.id가 있는지 확인
        if (auction.id !== undefined) {
          await this.updateAuction(auction.id, {
            bidCount: bidCount + 1,
            currentLowestBid: currentLowestBid === null || bid.amount < currentLowestBid
              ? bid.amount
              : currentLowestBid
          });
        }
      }
    }
    
    return createdBid;
  }

  // Order operations
  async getOrders(): Promise<Order[]> {
    return db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getOrdersByUserId(userId: number): Promise<Order[]> {
    return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  }

  async getOrdersByProviderId(providerId: number): Promise<Order[]> {
    return db.select().from(orders).where(eq(orders.providerId, providerId)).orderBy(desc(orders.createdAt));
  }

  async getOrdersByServiceId(serviceId: number): Promise<Order[]> {
    return db.select().from(orders).where(eq(orders.serviceId, serviceId)).orderBy(desc(orders.createdAt));
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    // 수수료 계산 로직 (10%)
    if (!order.webFee) {
      order.webFee = Math.round(order.totalAmount * 0.1);
    }
    
    // 제공자 정산액 계산 (90%)
    if (!order.providerAmount) {
      order.providerAmount = order.totalAmount - order.webFee;
    }
    
    const [createdOrder] = await db.insert(orders).values(order).returning();
    return createdOrder;
  }

  async updateOrder(id: number, orderUpdate: Partial<Order>): Promise<Order | undefined> {
    const [updatedOrder] = await db
      .update(orders)
      .set(orderUpdate)
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }
  
  // Transaction operations
  async getTransactions(): Promise<Transaction[]> {
    return db.select().from(transactions).orderBy(desc(transactions.createdAt));
  }

  async getTransactionById(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction;
  }

  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    return db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.createdAt));
  }

  async getTransactionsByOrderId(orderId: number): Promise<Transaction[]> {
    return db.select().from(transactions).where(eq(transactions.orderId, orderId)).orderBy(desc(transactions.createdAt));
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    // 현재 시간 업데이트
    const now = new Date();
    
    const [createdTransaction] = await db.insert(transactions).values({
      ...transaction,
      updatedAt: now
    }).returning();
    return createdTransaction;
  }

  async updateTransaction(id: number, transactionUpdate: Partial<Transaction>): Promise<Transaction | undefined> {
    // 업데이트된 시간 자동 설정
    const now = new Date();
    
    const [updatedTransaction] = await db
      .update(transactions)
      .set({
        ...transactionUpdate,
        updatedAt: now
      })
      .where(eq(transactions.id, id))
      .returning();
    return updatedTransaction;
  }

  // 인증 관련 메서드
  async verifyPhone(id: number, phoneNumber: string): Promise<User | undefined> {
    try {
      // 사용자 업데이트
      const [user] = await db
        .update(users)
        .set({
          phoneNumber,
          isPhoneVerified: true
        })
        .where(eq(users.id, id))
        .returning();
      
      return user;
    } catch (error) {
      console.error('휴대폰 인증 업데이트 오류:', error);
      return undefined;
    }
  }

  async registerBankAccount(id: number, bankInfo: any): Promise<User | undefined> {
    try {
      // 유효성 검사
      if (!bankInfo || !bankInfo.bank || !bankInfo.accountNumber || !bankInfo.accountHolder) {
        throw new Error('은행 계좌 정보가 불완전합니다');
      }
      
      // 사용자 업데이트
      const [user] = await db
        .update(users)
        .set({
          bankAccountInfo: bankInfo,
          isAccountVerified: true
        })
        .where(eq(users.id, id))
        .returning();
      
      return user;
    } catch (error) {
      console.error('계좌 등록 오류:', error);
      return undefined;
    }
  }

  async getVerificationStatus(id: number): Promise<{
    isPhoneVerified: boolean;
    isAccountVerified: boolean;
    phoneNumber?: string;
    bankAccountInfo?: any;
  } | undefined> {
    try {
      const user = await this.getUser(id);
      
      if (!user) {
        return undefined;
      }
      
      return {
        isPhoneVerified: user.isPhoneVerified || false,
        isAccountVerified: user.isAccountVerified || false,
        phoneNumber: user.phoneNumber || undefined,
        bankAccountInfo: user.bankAccountInfo
      };
    } catch (error) {
      console.error('인증 상태 조회 오류:', error);
      return undefined;
    }
  }

  // Helper functions
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d;
  }
  
  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
}

// Use Database Storage
export const storage = new DatabaseStorage();