import {
  users, type User, type InsertUser,
  services, type Service, type InsertService,
  resources, type Resource, type InsertResource,
  auctions, type Auction, type InsertAuction,
  bids, type Bid, type InsertBid,
  type Location
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, inArray, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
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
  getResourcesByType(type: string): Promise<Resource[]>;
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

// In-memory implementation of storage interface
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private services: Map<number, Service>;
  private resources: Map<number, Resource>;
  private auctions: Map<number, Auction>;
  private bids: Map<number, Bid>;
  
  private userIdCounter: number;
  private serviceIdCounter: number;
  private resourceIdCounter: number;
  private auctionIdCounter: number;
  private bidIdCounter: number;

  constructor() {
    this.users = new Map();
    this.services = new Map();
    this.resources = new Map();
    this.auctions = new Map();
    this.bids = new Map();
    
    this.userIdCounter = 1;
    this.serviceIdCounter = 1;
    this.resourceIdCounter = 1;
    this.auctionIdCounter = 1;
    this.bidIdCounter = 1;
    
    // Add some initial data
    this.seedData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  // Service operations
  async getServices(): Promise<Service[]> {
    return Array.from(this.services.values());
  }
  
  async getServiceById(id: number): Promise<Service | undefined> {
    return this.services.get(id);
  }
  
  async getServicesByType(type: string): Promise<Service[]> {
    return Array.from(this.services.values()).filter(
      service => service.serviceType === type
    );
  }
  
  async getServicesByLocation(location: Location, maxDistance: number): Promise<Service[]> {
    // Simple distance calculation for demo
    return Array.from(this.services.values()).filter(service => {
      if (!service.location || !location) return false;
      // Calculate distance with Haversine formula (in km)
      const distance = this.calculateDistance(
        location.lat, 
        location.long, 
        (service.location as Location).lat, 
        (service.location as Location).long
      );
      return distance <= maxDistance;
    });
  }
  
  async createService(insertService: InsertService): Promise<Service> {
    const id = this.serviceIdCounter++;
    const service: Service = { 
      ...insertService, 
      id, 
      rating: 0, 
      ratingCount: 0, 
      createdAt: new Date() 
    };
    this.services.set(id, service);
    return service;
  }
  
  async updateService(id: number, serviceUpdate: Partial<Service>): Promise<Service | undefined> {
    const service = this.services.get(id);
    if (!service) return undefined;
    
    const updatedService = { ...service, ...serviceUpdate };
    this.services.set(id, updatedService);
    return updatedService;
  }

  // Resource operations
  async getResources(): Promise<Resource[]> {
    return Array.from(this.resources.values());
  }
  
  async getResourceById(id: number): Promise<Resource | undefined> {
    return this.resources.get(id);
  }
  
  async getResourcesByType(type: string): Promise<Resource[]> {
    return Array.from(this.resources.values()).filter(
      resource => resource.resourceType === type
    );
  }
  
  async createResource(insertResource: InsertResource): Promise<Resource> {
    const id = this.resourceIdCounter++;
    const resource: Resource = { 
      ...insertResource, 
      id, 
      downloadCount: 0, 
      createdAt: new Date() 
    };
    this.resources.set(id, resource);
    return resource;
  }
  
  async updateResource(id: number, resourceUpdate: Partial<Resource>): Promise<Resource | undefined> {
    const resource = this.resources.get(id);
    if (!resource) return undefined;
    
    const updatedResource = { ...resource, ...resourceUpdate };
    this.resources.set(id, updatedResource);
    return updatedResource;
  }
  
  async incrementDownloadCount(id: number): Promise<Resource | undefined> {
    const resource = this.resources.get(id);
    if (!resource) return undefined;
    
    const updatedResource = { 
      ...resource, 
      downloadCount: (resource.downloadCount || 0) + 1 
    };
    this.resources.set(id, updatedResource);
    return updatedResource;
  }

  // Auction operations
  async getAuctions(): Promise<Auction[]> {
    return Array.from(this.auctions.values());
  }
  
  async getAuctionById(id: number): Promise<Auction | undefined> {
    return this.auctions.get(id);
  }
  
  async getAuctionsByType(type: string): Promise<Auction[]> {
    return Array.from(this.auctions.values()).filter(
      auction => auction.auctionType === type
    );
  }
  
  async getActiveAuctions(): Promise<Auction[]> {
    return Array.from(this.auctions.values()).filter(
      auction => auction.status === 'active' && new Date(auction.deadline) > new Date()
    );
  }
  
  async createAuction(insertAuction: InsertAuction): Promise<Auction> {
    const id = this.auctionIdCounter++;
    const auction: Auction = { 
      ...insertAuction, 
      id, 
      bidCount: 0, 
      status: 'active', 
      createdAt: new Date() 
    };
    this.auctions.set(id, auction);
    return auction;
  }
  
  async updateAuction(id: number, auctionUpdate: Partial<Auction>): Promise<Auction | undefined> {
    const auction = this.auctions.get(id);
    if (!auction) return undefined;
    
    const updatedAuction = { ...auction, ...auctionUpdate };
    this.auctions.set(id, updatedAuction);
    return updatedAuction;
  }

  // Bid operations
  async getBidsByAuctionId(auctionId: number): Promise<Bid[]> {
    return Array.from(this.bids.values()).filter(
      bid => bid.auctionId === auctionId
    );
  }
  
  async createBid(insertBid: InsertBid): Promise<Bid> {
    const id = this.bidIdCounter++;
    const bid: Bid = { ...insertBid, id, createdAt: new Date() };
    this.bids.set(id, bid);
    
    // Update auction with new bid info
    const auction = await this.getAuctionById(insertBid.auctionId);
    if (auction) {
      const currentLowestBid = auction.currentLowestBid;
      const bidCount = auction.bidCount || 0;
      
      await this.updateAuction(auction.id, {
        bidCount: bidCount + 1,
        currentLowestBid: currentLowestBid === null || insertBid.amount < currentLowestBid 
          ? insertBid.amount 
          : currentLowestBid
      });
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

  // Seed data for development
  private seedData() {
    // Sample users
    const user1: User = {
      id: this.userIdCounter++,
      username: 'engineer1',
      password: 'password',
      email: 'engineer1@example.com',
      fullName: '엔지니어 1',
      isServiceProvider: true,
      location: { lat: 37.5665, long: 126.9780, address: '서울 중구' },
      createdAt: new Date()
    };
    this.users.set(user1.id, user1);

    const user2: User = {
      id: this.userIdCounter++,
      username: 'maker1',
      password: 'password',
      email: 'maker1@example.com',
      fullName: '메이커 1',
      isServiceProvider: true,
      location: { lat: 37.5113, long: 127.0980, address: '서울 송파구' },
      createdAt: new Date()
    };
    this.users.set(user2.id, user2);

    // Sample services
    const service1: Service = {
      id: this.serviceIdCounter++,
      userId: user1.id,
      title: '대림동 3D 프린팅 서비스',
      description: 'FDM, SLA 3D 프린팅 서비스를 제공합니다. 일반 플라스틱부터 특수 소재까지 다양한 출력 옵션 이용 가능합니다.',
      serviceType: '3d_printing',
      location: { lat: 37.4912, long: 126.9042, address: '서울 영등포구 대림동' },
      rating: 4.8,
      ratingCount: 15,
      tags: ['FDM', 'SLA', '빠른 배송'],
      imageUrl: 'https://images.unsplash.com/photo-1566287448846-b6d60cf420cf',
      printerModel: 'Prusa i3 MK3S+',
      contactPhone: '010-1234-5678',
      contactEmail: 'daelim3d@example.com',
      pricing: '10,000원 ~ 50,000원',
      isIndividual: true,
      createdAt: new Date()
    };
    this.services.set(service1.id, service1);

    const service2: Service = {
      id: this.serviceIdCounter++,
      userId: user2.id,
      title: '구로 전자회로 제작소',
      description: '소형 PCB 제작부터 조립까지 한번에 해결해 드립니다. Arduino, Raspberry Pi 등 다양한 임베디드 개발 지원.',
      serviceType: 'electronics',
      location: { lat: 37.4858, long: 126.8951, address: '서울 구로구' },
      rating: 4.6,
      ratingCount: 12,
      tags: ['PCB 제작', '회로 설계', '소량 생산'],
      imageUrl: 'https://images.unsplash.com/photo-1580983556037-a543ccce3417',
      createdAt: new Date()
    };
    this.services.set(service2.id, service2);

    const service3: Service = {
      id: this.serviceIdCounter++,
      userId: user1.id,
      title: '신도림 목공방',
      description: '맞춤형 가구 및 목재 제품 제작. 레이저 커팅, CNC 가공 서비스도 함께 제공합니다.',
      serviceType: 'woodworking',
      location: { lat: 37.5087, long: 126.8909, address: '서울 구로구 신도림동' },
      rating: 4.9,
      ratingCount: 23,
      tags: ['가구 제작', '레이저 커팅', 'CNC 가공'],
      imageUrl: 'https://images.unsplash.com/photo-1624913503273-5f9c4e980ddd',
      createdAt: new Date()
    };
    this.services.set(service3.id, service3);

    const service4: Service = {
      id: this.serviceIdCounter++,
      userId: user2.id,
      title: '영등포 금속 가공',
      description: '알루미늄, 스테인리스 스틸 등 다양한 금속 가공 서비스. 소량 주문부터 중규모 생산까지 가능합니다.',
      serviceType: 'metalworking',
      location: { lat: 37.5200, long: 126.9102, address: '서울 영등포구' },
      rating: 4.5,
      ratingCount: 18,
      tags: ['금속 가공', 'CNC 밀링', '용접'],
      imageUrl: 'https://images.unsplash.com/photo-1621046260073-28cf109e4e7c',
      createdAt: new Date()
    };
    this.services.set(service4.id, service4);

    // Sample resources
    const resource1: Resource = {
      id: this.resourceIdCounter++,
      title: '아두이노 기반 스마트 홈 시스템',
      description: '모션 센서, 온도 센서, 습도 센서를 활용한 실내 환경 모니터링 및 제어 시스템 설계도입니다.',
      resourceType: 'hardware_design',
      tags: ['Arduino', 'IoT', '스마트홈'],
      imageUrl: 'https://images.unsplash.com/photo-1615164950603-93f06fb5562d',
      downloadUrl: '/api/resources/1/download',
      downloadCount: 2500,
      materialsList: [
        'Arduino Uno',
        'DHT22 온습도 센서',
        'PIR 모션 센서',
        '릴레이 모듈'
      ],
      recipe: {
        steps: [
          { title: '회로 연결', description: 'Arduino와 센서를 설계도에 따라 연결합니다.' },
          { title: '코드 업로드', description: '제공된 소스코드를 Arduino IDE를 통해 업로드합니다.' },
          { title: '케이스 조립', description: '3D 프린팅한 케이스에 부품들을 조립합니다.' }
        ]
      },
      createdAt: new Date(),
      isCrawled: false,
      sourceSite: null
    };
    this.resources.set(resource1.id, resource1);

    const resource2: Resource = {
      id: this.resourceIdCounter++,
      title: '모듈형 수납 시스템',
      description: '다양한 크기의 컴포넌트를 조합할 수 있는 모듈식 수납 시스템 3D 모델 파일입니다.',
      resourceType: '3d_model',
      tags: ['STL', '3D 프린팅', '수납'],
      imageUrl: 'https://images.unsplash.com/photo-1626218174358-7769486c4b79',
      downloadUrl: '/api/resources/2/download',
      downloadCount: 1800,
      materialsList: [
        'PLA 필라멘트 500g',
        '3D 프린터'
      ],
      createdAt: new Date(),
      isCrawled: true,
      sourceSite: 'Thingiverse'
    };
    this.resources.set(resource2.id, resource2);

    const resource3: Resource = {
      id: this.resourceIdCounter++,
      title: '오픈소스 데이터 시각화 라이브러리',
      description: '센서 데이터를 실시간으로 시각화할 수 있는 JavaScript 기반 라이브러리입니다.',
      resourceType: 'software',
      tags: ['JavaScript', '데이터 시각화', 'MIT 라이선스'],
      imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97',
      downloadUrl: '/api/resources/3/download',
      downloadCount: 3200,
      materialsList: null,
      createdAt: new Date(),
      isCrawled: true,
      sourceSite: 'GitHub'
    };
    this.resources.set(resource3.id, resource3);

    const resource4: Resource = {
      id: this.resourceIdCounter++,
      title: '로열티 프리 BGM 컬렉션',
      description: '상업적 이용 가능한 무료 배경 음악 50곡이 포함된 컬렉션입니다.',
      resourceType: 'free_content',
      tags: ['BGM', '로열티 프리', 'MP3'],
      imageUrl: 'https://images.unsplash.com/photo-1606676539940-12768ce0e762',
      downloadUrl: '/api/resources/4/download',
      downloadCount: 5700,
      materialsList: null,
      createdAt: new Date(),
      isCrawled: true,
      sourceSite: 'Freesound'
    };
    this.resources.set(resource4.id, resource4);

    // Sample featured resource
    const featuredResource: Resource = {
      id: this.resourceIdCounter++,
      title: 'AI 기반 자동화 작물 관리 시스템',
      description: '이 설계는 카메라와 다양한 센서로 작물 상태를 실시간으로 모니터링하고, AI 알고리즘을 통해 작물의 건강 상태를 분석하여 자동으로 물과 영양분을 공급하는 시스템입니다. 라즈베리 파이와 오픈소스 소프트웨어로 구성되어 있으며, 모든 설계도와 소스 코드가 포함되어 있습니다.',
      resourceType: 'hardware_design',
      tags: ['라즈베리 파이', 'IoT', '스마트 농업', 'AI'],
      imageUrl: 'https://images.unsplash.com/photo-1638815401319-690010ac2ffc',
      downloadUrl: '/api/resources/5/download',
      downloadCount: 3400,
      materialsList: [
        '라즈베리 파이 4B',
        '라즈베리 파이 카메라 모듈',
        '토양 습도 센서',
        '온도 및 습도 센서 (DHT22)',
        '물 펌프 및 릴레이 모듈',
        '광량 센서'
      ],
      createdAt: new Date(),
      isCrawled: false,
      sourceSite: null
    };
    this.resources.set(featuredResource.id, featuredResource);

    // Sample auctions
    const auction1: Auction = {
      id: this.auctionIdCounter++,
      userId: user1.id,
      title: '소형 드론 케이스 제작',
      description: '3D 프린팅 가능한 소형 드론용 보호 케이스 제작 요청. 완충 구조와 쉬운 조립이 필요합니다. STL 파일 제공 가능합니다.',
      auctionType: '3d_printing',
      location: { lat: 37.5665, long: 126.9780, address: '서울 지역' },
      tags: ['3D 프린팅', '소량 생산', '서울 지역'],
      deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      currentLowestBid: 45000,
      bidCount: 7,
      status: 'active',
      createdAt: new Date()
    };
    this.auctions.set(auction1.id, auction1);

    const auction2: Auction = {
      id: this.auctionIdCounter++,
      userId: user2.id,
      title: '스마트 홈 컨트롤러 PCB 제작',
      description: '스마트 홈 시스템용 PCB 설계 및 소량 생산(10개). 와이파이 모듈과 센서 인터페이스가 포함된 설계도 제공.',
      auctionType: 'electronics',
      location: null,
      tags: ['PCB 제작', '전자 회로', '소량 생산'],
      deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
      currentLowestBid: 120000,
      bidCount: 4,
      status: 'active',
      createdAt: new Date()
    };
    this.auctions.set(auction2.id, auction2);

    const auction3: Auction = {
      id: this.auctionIdCounter++,
      userId: user1.id,
      title: 'CNC 목재 가구 부품 제작',
      description: '모듈형 책장용 연결 부품 20세트 제작 필요. 오크 목재 사용. CAD 파일 제공됨.',
      auctionType: 'woodworking',
      location: { lat: 37.4563, long: 126.7052, address: '인천 지역' },
      tags: ['CNC 가공', '목재 가공', '인천 지역'],
      deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
      currentLowestBid: 85000,
      bidCount: 5,
      status: 'active',
      createdAt: new Date()
    };
    this.auctions.set(auction3.id, auction3);

    // Add bids for auctions
    for (let i = 1; i <= 7; i++) {
      const bidAmount = 45000 + (i * 5000); // increasing amounts
      const bid: Bid = {
        id: this.bidIdCounter++,
        auctionId: auction1.id,
        userId: (i % 2 === 0) ? user1.id : user2.id,
        amount: bidAmount,
        description: `견적 ${i}: ${bidAmount}원에 제작 가능합니다.`,
        createdAt: new Date(Date.now() - i * 60 * 60 * 1000) // decreasing times
      };
      this.bids.set(bid.id, bid);
    }

    for (let i = 1; i <= 4; i++) {
      const bidAmount = 120000 + (i * 10000);
      const bid: Bid = {
        id: this.bidIdCounter++,
        auctionId: auction2.id,
        userId: (i % 2 === 0) ? user1.id : user2.id,
        amount: bidAmount,
        description: `견적 ${i}: ${bidAmount}원에 제작 가능합니다.`,
        createdAt: new Date(Date.now() - i * 60 * 60 * 1000)
      };
      this.bids.set(bid.id, bid);
    }

    for (let i = 1; i <= 5; i++) {
      const bidAmount = 85000 + (i * 7500);
      const bid: Bid = {
        id: this.bidIdCounter++,
        auctionId: auction3.id,
        userId: (i % 2 === 0) ? user1.id : user2.id,
        amount: bidAmount,
        description: `견적 ${i}: ${bidAmount}원에 제작 가능합니다.`,
        createdAt: new Date(Date.now() - i * 60 * 60 * 1000)
      };
      this.bids.set(bid.id, bid);
    }
  }
}

// Database implementation of storage interface
export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
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

  async getServicesByLocation(location: Location, maxDistance: number): Promise<Service[]> {
    // 먼저 모든 서비스를 가져온 다음 거리 계산
    const allServices = await this.getServices();
    
    return allServices.filter(service => {
      if (!service.location) return false;
      const serviceLocation = service.location as Location;
      
      // 하버사인 공식으로 거리 계산
      const distance = this.calculateDistance(
        location.lat,
        location.long,
        serviceLocation.lat,
        serviceLocation.long
      );
      
      return distance <= maxDistance;
    });
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
    return db.select().from(resources).where(eq(resources.resourceType, type));
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
      
      await this.updateAuction(auction.id, {
        bidCount: bidCount + 1,
        currentLowestBid: currentLowestBid === null || insertBid.amount < currentLowestBid
          ? insertBid.amount
          : currentLowestBid
      });
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

// Use Database Storage instead of MemStorage
export const storage = new DatabaseStorage();
