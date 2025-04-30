import {
  users, type User, type InsertUser,
  services, type Service, type InsertService,
  resources, type Resource, type InsertResource,
  auctions, type Auction, type InsertAuction,
  bids, type Bid, type InsertBid,
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
    const [service] = await db.insert(services).values({
      ...insertService,
      rating: 0,
      ratingCount: 0
    }).returning();
    return service;
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
    return db.select().from(resources).orderBy(desc(resources.createdAt));
  }

  async getResourceById(id: number): Promise<Resource | undefined> {
    const [resource] = await db.select().from(resources).where(eq(resources.id, id));
    return resource;
  }

  async getResourcesByType(type: string): Promise<Resource[]> {
    // Keep for backwards compatibility but internally use category
    return this.getResourcesByCategory(type);
  }

  async getResourcesByCategory(category: string): Promise<Resource[]> {
    return db.select().from(resources).where(eq(resources.category, category));
  }

  async createResource(insertResource: InsertResource): Promise<Resource> {
    const [resource] = await db.insert(resources).values({
      ...insertResource,
      downloadCount: 0
    }).returning();
    return resource;
  }

  async updateResource(id: number, resourceUpdate: Partial<Resource>): Promise<Resource | undefined> {
    const [updatedResource] = await db
      .update(resources)
      .set(resourceUpdate)
      .where(eq(resources.id, id))
      .returning();
    return updatedResource;
  }

  async incrementDownloadCount(id: number): Promise<Resource | undefined> {
    const [resource] = await db.select().from(resources).where(eq(resources.id, id));
    if (!resource) return undefined;

    const [updatedResource] = await db
      .update(resources)
      .set({
        downloadCount: (resource.downloadCount || 0) + 1
      })
      .where(eq(resources.id, id))
      .returning();
    return updatedResource;
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