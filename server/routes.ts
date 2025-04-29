import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { getChatResponse, analyzeImage } from "./openai";
import * as fs from 'fs';
import * as path from 'path';

import { setupAuth, isAdmin } from './auth';

export async function registerRoutes(app: Express): Promise<Server> {
  // 인증 관련 라우트 설정
  setupAuth(app);
  // User routes
  app.get('/api/users/:id', async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Don't expose password
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  // Services routes
  app.get('/api/services', async (_req: Request, res: Response) => {
    const services = await storage.getServices();
    res.json(services);
  });
  
  app.post('/api/services', async (req: Request, res: Response) => {
    try {
      // 인증된 사용자만 서비스 등록 가능
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: '로그인이 필요합니다.' });
      }
      
      const serviceData = {
        ...req.body,
        userId: req.user.id
      };
      
      const service = await storage.createService(serviceData);
      res.status(201).json(service);
    } catch (error) {
      console.error('서비스 등록 에러:', error);
      res.status(500).json({ message: '서비스 등록에 실패했습니다.' });
    }
  });
  
  app.get('/api/services/type/:type', async (req: Request, res: Response) => {
    const type = req.params.type;
    const services = await storage.getServicesByType(type);
    res.json(services);
  });
  
  app.get('/api/services/nearby', async (req: Request, res: Response) => {
    const locationSchema = z.object({
      lat: z.number(),
      long: z.number(),
      maxDistance: z.number().default(10) // default 10km
    });
    
    try {
      const { lat, long, maxDistance } = locationSchema.parse({
        lat: parseFloat(req.query.lat as string),
        long: parseFloat(req.query.long as string),
        maxDistance: req.query.maxDistance ? parseFloat(req.query.maxDistance as string) : 10
      });
      
      const services = await storage.getServicesByLocation(
        { lat, long, address: '' },
        maxDistance
      );
      
      res.json(services);
    } catch (error) {
      res.status(400).json({ message: 'Invalid location parameters' });
    }
  });
  
  app.get('/api/services/:id', async (req: Request, res: Response) => {
    const serviceId = parseInt(req.params.id);
    if (isNaN(serviceId)) {
      return res.status(400).json({ message: 'Invalid service ID' });
    }
    
    const service = await storage.getServiceById(serviceId);
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    res.json(service);
  });

  // Resources routes
  app.get('/api/resources', async (_req: Request, res: Response) => {
    const resources = await storage.getResources();
    res.json(resources);
  });
  
  app.get('/api/resources/type/:type', async (req: Request, res: Response) => {
    const type = req.params.type;
    let resources = await storage.getResourcesByType(type);
    
    // 플래시 게임 요청인 경우 샘플 데이터 추가
    if (type === 'flash_game' && resources.length === 0) {
      const flashGames = [
        {
          id: 1001,
          title: '픽셀 어드벤처',
          description: '레트로 픽셀 그래픽의 2D 플랫폼 게임입니다. 장애물을 뛰어넘고 적을 물리치며 보물을 찾아보세요.',
          resourceType: 'flash_game',
          tags: ['플랫폼', '레트로', '액션', '어드벤처'],
          imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f',
          downloadUrl: 'https://html5games.com/Game/Pixel-Adventure/d1c395bd-3767-4c5e-845e-761b7b2508fa',
          downloadCount: 321,
          createdAt: new Date()
        },
        {
          id: 1002,
          title: '바운스 볼',
          description: '물리 기반의 퍼즐 게임입니다. 공을 발사하여 모든 장애물을 제거하세요. 다양한 각도와 힘을 조절하는 전략이 필요합니다.',
          resourceType: 'flash_game',
          tags: ['퍼즐', '물리', '전략', '캐주얼'],
          imageUrl: 'https://images.unsplash.com/photo-1614465000772-1b1a4a12812d',
          downloadUrl: 'https://html5games.com/Game/Bounce-Ball/2fc4db72-c137-4857-9d77-25c32d60aed0',
          downloadCount: 245,
          createdAt: new Date()
        },
        {
          id: 1003,
          title: '스페이스 슈터',
          description: '우주를 배경으로 한 클래식 슈팅 게임입니다. 적 우주선을 물리치고 다양한 무기를 수집하세요.',
          resourceType: 'flash_game',
          tags: ['슈팅', '우주', '아케이드', '액션'],
          imageUrl: 'https://images.unsplash.com/photo-1604871000636-074fa5117945',
          downloadUrl: 'https://html5games.com/Game/Space-Shooter/a8c31639-e2d4-4ccd-b6ad-cf3b4a0e8a5a',
          downloadCount: 189,
          createdAt: new Date()
        },
        {
          id: 1004,
          title: '블록 브레이커',
          description: '현대적인 디자인의 브릭 브레이커 게임입니다. 다양한 파워업과 난이도로 즐길 수 있습니다.',
          resourceType: 'flash_game',
          tags: ['아케이드', '클래식', '캐주얼', '리플렉스'],
          imageUrl: 'https://images.unsplash.com/photo-1577279549270-b9e297533cdd',
          downloadUrl: 'https://html5games.com/Game/Block-Breaker/5e259cf7-cf9d-4a3e-a7f5-2e4da59a8c11',
          downloadCount: 267,
          createdAt: new Date()
        },
        {
          id: 1005,
          title: '퍼즐 매니아',
          description: '다양한 퍼즐을 해결하는 두뇌 게임입니다. 시간 제한과 함께 집중력과 논리력을 테스트하세요.',
          resourceType: 'flash_game',
          tags: ['퍼즐', '두뇌', '로직', '교육'],
          imageUrl: 'https://images.unsplash.com/photo-1591635566278-10dca0ca76ee',
          downloadUrl: 'https://html5games.com/Game/Puzzle-Mania/f57c21b7-49ef-4fe5-b4a4-e9886b77a25a',
          downloadCount: 178,
          createdAt: new Date()
        }
      ];
      
      resources = flashGames;
    }
    
    res.json(resources);
  });
  
  app.get('/api/resources/:id/download', async (req: Request, res: Response) => {
    const resourceId = parseInt(req.params.id);
    if (isNaN(resourceId)) {
      return res.status(400).json({ message: 'Invalid resource ID' });
    }
    
    const resource = await storage.getResourceById(resourceId);
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    // Increment download count
    await storage.incrementDownloadCount(resourceId);
    
    // In a real system, we would redirect to the actual file or serve it
    // For this demo, we'll just return a success message
    res.json({ 
      success: true, 
      message: `Download initiated for ${resource.title}`, 
      resourceId 
    });
  });
  
  app.get('/api/resources/:id', async (req: Request, res: Response) => {
    const resourceId = parseInt(req.params.id);
    if (isNaN(resourceId)) {
      return res.status(400).json({ message: 'Invalid resource ID' });
    }
    
    const resource = await storage.getResourceById(resourceId);
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    res.json(resource);
  });

  // Auctions routes
  app.get('/api/auctions', async (_req: Request, res: Response) => {
    const auctions = await storage.getAuctions();
    res.json(auctions);
  });
  
  app.get('/api/auctions/active', async (_req: Request, res: Response) => {
    const auctions = await storage.getActiveAuctions();
    res.json(auctions);
  });
  
  app.get('/api/auctions/type/:type', async (req: Request, res: Response) => {
    const type = req.params.type;
    const auctions = await storage.getAuctionsByType(type);
    res.json(auctions);
  });
  
  app.get('/api/auctions/:id', async (req: Request, res: Response) => {
    const auctionId = parseInt(req.params.id);
    if (isNaN(auctionId)) {
      return res.status(400).json({ message: 'Invalid auction ID' });
    }
    
    const auction = await storage.getAuctionById(auctionId);
    
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }
    
    res.json(auction);
  });

  // Bids routes
  app.get('/api/auctions/:id/bids', async (req: Request, res: Response) => {
    const auctionId = parseInt(req.params.id);
    if (isNaN(auctionId)) {
      return res.status(400).json({ message: 'Invalid auction ID' });
    }
    
    const auction = await storage.getAuctionById(auctionId);
    
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }
    
    const bids = await storage.getBidsByAuctionId(auctionId);
    res.json(bids);
  });

  // AI Assembly 관련 엔드포인트
  app.post('/api/assembly/chat', async (req: Request, res: Response) => {
    try {
      const { messages } = req.body;
      
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ message: '유효한 메시지 형식이 아닙니다.' });
      }
      
      const response = await getChatResponse(messages);
      res.json({ response });
    } catch (error: any) {
      console.error('AI 어셈블리 채팅 에러:', error);
      res.status(500).json({ message: error.message || '서버 오류가 발생했습니다.' });
    }
  });

  // 이미지 분석 엔드포인트
  app.post('/api/assembly/analyze-image', async (req: Request, res: Response) => {
    try {
      const { imageData, prompt } = req.body;
      
      if (!imageData || !prompt) {
        return res.status(400).json({ message: '이미지 데이터와 프롬프트가 필요합니다.' });
      }
      
      // Base64 형식 확인
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
      
      const analysis = await analyzeImage(base64Data, prompt);
      res.json({ analysis });
    } catch (error: any) {
      console.error('이미지 분석 에러:', error);
      res.status(500).json({ message: error.message || '이미지 분석 중 오류가 발생했습니다.' });
    }
  });

  // 관리자 대시보드 API
  app.get('/api/admin/dashboard', isAdmin, async (req: Request, res: Response) => {
    try {
      // 대시보드에 필요한 데이터 취합
      const users = await storage.getUsers();
      const services = await storage.getServices();
      const resources = await storage.getResources();
      const auctions = await storage.getAuctions();
      
      // 최근 가입 사용자 (최대 5명)
      const recentUsers = users
        .sort((a: any, b: any) => {
          const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
          const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, 5)
        .map(({ password, ...user }: any) => user); // 비밀번호 제외
      
      // 최근 등록된 리소스 (최대 5개)
      const recentResources = resources
        .sort((a: any, b: any) => {
          const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
          const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, 5);
      
      // 대시보드 데이터 응답
      res.json({
        usersCount: users.length,
        servicesCount: services.length,
        resourcesCount: resources.length,
        auctionsCount: auctions.length,
        recentUsers,
        recentResources
      });
    } catch (error: any) {
      console.error('관리자 대시보드 데이터 조회 에러:', error);
      res.status(500).json({ message: error.message || '서버 오류가 발생했습니다.' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
