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
import { db, pool } from "./db";
import { eq, and, desc, asc, inArray, sql } from "drizzle-orm";

import session from 'express-session';
import { Store } from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import createMemoryStore from 'memorystore';

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
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values({
      ...insertUser,
      isAdmin: false
    }).returning();
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  async setAdminStatus(id: number, isAdmin: boolean): Promise<User | undefined> {
    return this.updateUser(id, { isAdmin });
  }
  
  async deleteUser(id: number): Promise<boolean> {
    try {
      await db.delete(users).where(eq(users.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  // Service operations
  async getServices(): Promise<Service[]> {
    return db.select().from(services).orderBy(desc(services.createdAt));
  }

  async getServiceById(id: number): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service;
  }

  async getServicesByType(type: string): Promise<Service[]> {
    return db.select().from(services).where(eq(services.serviceType, type));
  }

  async getServicesByLocation(location: Location, maxDistance: number, serviceType?: string): Promise<Service[]> {
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
    
    return servicesWithDistance;
  }

  async createService(insertService: InsertService): Promise<Service> {
    try {
      // 배열 타입 필드 정확하게 처리
      const processedData = {
        ...insertService,
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
      
      const [service] = await db.insert(services).values(processedData).returning();
      return service;
    } catch (error) {
      console.error('서비스 생성 DB 오류:', error);
      throw error;
    }
  }

  async updateService(id: number, serviceUpdate: Partial<Service>): Promise<Service | undefined> {
    const [updatedService] = await db
      .update(services)
      .set(serviceUpdate)
      .where(eq(services.id, id))
      .returning();
    return updatedService;
  }

  // Resource operations
  async getResources(): Promise<Resource[]> {
    try {
      const results = await db.select().from(resources).orderBy(desc(resources.createdAt));
      
      // Add resourceType field to match category for type safety
      return results.map(resource => {
        if (resource.category) {
          (resource as any).resourceType = resource.category;
        }
        return resource;
      });
    } catch (error) {
      console.error('Error getting all resources:', error);
      return [];
    }
  }

  async getResourceById(id: number): Promise<Resource | undefined> {
    try {
      const [resource] = await db.select().from(resources).where(eq(resources.id, id));
      
      if (resource && resource.category) {
        // Add resourceType field based on category for type compatibility
        (resource as any).resourceType = resource.category;
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

  async getResourcesByCategory(category: string): Promise<Resource[]> {
    // Query only by the category column that exists in the database
    try {
      // Use sql to construct a query with only the columns that exist in the database
      const query = db
        .select()
        .from(resources)
        .where(eq(resources.category, category));
      
      const results = await query;
      
      // Add resourceType field to each resource for type compatibility
      return results.map(resource => {
        if (resource) {
          (resource as any).resourceType = category;
        }
        return resource;
      });
    } catch (error) {
      console.error(`Error getting resources by category '${category}':`, error);
      return []; // Return empty array instead of throwing error to avoid breaking the UI
    }
  }

  async createResource(insertResource: InsertResource): Promise<Resource> {
    try {
      // Check if resourceType is provided but category is not
      if (insertResource.resourceType && !insertResource.category) {
        // Set category to match resourceType for consistency
        insertResource.category = insertResource.resourceType;
      }
      
      // Remove resourceType if it's included to avoid DB errors
      const sanitizedResource = { ...insertResource };
      delete (sanitizedResource as any).resourceType;
      
      const [resource] = await db.insert(resources).values({
        ...sanitizedResource,
        downloadCount: 0
      }).returning();
      
      // For TypeScript compatibility, add resourceType back to the returned object
      // since the schema expects it (even though DB doesn't have it)
      if (resource && resource.category) {
        (resource as any).resourceType = resource.category;
      }
      
      return resource;
    } catch (error) {
      console.error('Error creating resource:', error);
      throw error;
    }
  }

  async updateResource(id: number, resourceUpdate: Partial<Resource>): Promise<Resource | undefined> {
    try {
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
      
      return updatedResource;
    } catch (error) {
      console.error(`Error updating resource with id ${id}:`, error);
      throw error;
    }
  }

  async incrementDownloadCount(id: number): Promise<Resource | undefined> {
    try {
      const [resource] = await db.select().from(resources).where(eq(resources.id, id));
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
      
      return updatedResource;
    } catch (error) {
      console.error(`Error incrementing download count for resource ${id}:`, error);
      return undefined;
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

  async createAuction(insertAuction: InsertAuction): Promise<Auction> {
    const [auction] = await db.insert(auctions).values({
      ...insertAuction,
      bidCount: 0,
      status: 'active'
    }).returning();
    return auction;
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

  async createBid(insertBid: InsertBid): Promise<Bid> {
    const [bid] = await db.insert(bids).values(insertBid).returning();
    
    // Update auction with new bid info
    const auction = await this.getAuctionById(insertBid.auctionId);
    if (auction) {
      const bidCount = auction.bidCount || 0;
      const currentLowestBid = auction.currentLowestBid;
      
      // 타입 안전성을 위해 auction.id가 있는지 확인
      if (auction.id !== undefined) {
        await this.updateAuction(auction.id, {
          bidCount: bidCount + 1,
          currentLowestBid: currentLowestBid === null || insertBid.amount < currentLowestBid
            ? insertBid.amount
            : currentLowestBid
        });
      }
    }
    
    return bid;
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

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    // 수수료 계산 로직 (10%)
    if (!insertOrder.webFee) {
      insertOrder.webFee = Math.round(insertOrder.totalAmount * 0.1);
    }
    
    // 제공자 정산액 계산 (90%)
    if (!insertOrder.providerAmount) {
      insertOrder.providerAmount = insertOrder.totalAmount - insertOrder.webFee;
    }
    
    const [order] = await db.insert(orders).values(insertOrder).returning();
    return order;
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

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    // 현재 시간 업데이트
    const now = new Date();
    
    const [transaction] = await db.insert(transactions).values({
      ...insertTransaction,
      updatedAt: now
    }).returning();
    return transaction;
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
        phoneNumber: user.phoneNumber,
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