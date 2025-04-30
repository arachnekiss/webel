import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { getChatResponse, analyzeImage } from "./openai";
import * as fs from 'fs';
import * as path from 'path';
import { db } from './db';
import { users, services, resources, auctions, bids } from '@shared/schema';
import { eq } from 'drizzle-orm';
import multer from 'multer';

// 파일 업로드 설정
const storage_config = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage_config,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB 제한
  }
});

import { setupAuth, isAdmin, isAuthenticated } from './auth';
import { deleteUserByUsername } from './userDelete';
import { 
  getDashboardData,
  getAllUsers,
  deleteUser,
  setAdminStatus,
  getAllResources,
  updateResource,
  getAllServices,
  verifyService,
  deleteService
} from './admin';

export async function registerRoutes(app: Express): Promise<Server> {
  // 데이터베이스 초기화 엔드포인트 (개발 환경에서만 사용)
  app.post('/api/reset-database', async (_req: Request, res: Response) => {
    try {
      if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ message: "이 작업은 개발 환경에서만 허용됩니다." });
      }
      
      // 모든 테이블 truncate
      await db.delete(bids);
      await db.delete(auctions);
      await db.delete(resources);
      await db.delete(services);
      await db.delete(users);
      
      res.status(200).json({ message: "데이터베이스가 초기화되었습니다." });
    } catch (error) {
      console.error("Database reset error:", error);
      res.status(500).json({ message: "데이터베이스 초기화 중 오류가 발생했습니다." });
    }
  });
  // 인증 관련 라우트 설정
  setupAuth(app);
  
  // 특정 사용자 삭제 엔드포인트 (개발 환경에서만 사용 가능)
  app.delete('/api/dev/users/:username', deleteUserByUsername);
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
  
  // 리소스 생성 - 인증 필요
  app.post('/api/resources', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const resourceData = {
        ...req.body,
        createdAt: new Date()
      };
      
      // 필수 필드 검증
      if (!resourceData.title || !resourceData.description || !resourceData.resourceType) {
        return res.status(400).json({
          message: '필수 필드가 누락되었습니다. (title, description, resourceType)'
        });
      }
      
      const resource = await storage.createResource(resourceData);
      res.status(201).json(resource);
    } catch (error) {
      console.error('리소스 생성 에러:', error);
      res.status(500).json({ message: '리소스 생성 중 오류가 발생했습니다.' });
    }
  });
  
  // 리소스 파일 업로드 - 인증 필요
  app.post('/api/resources/upload', isAuthenticated, upload.single('file'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: '파일이 업로드되지 않았습니다.' });
      }
      
      // 파일 메타데이터 반환
      res.status(200).json({
        fileName: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        path: req.file.path
      });
    } catch (error) {
      console.error('파일 업로드 에러:', error);
      res.status(500).json({ message: '파일 업로드 중 오류가 발생했습니다.' });
    }
  });
  
  // 리소스 이미지 업로드 - 인증 필요
  app.post('/api/resources/upload-image', isAuthenticated, upload.single('image'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: '이미지가 업로드되지 않았습니다.' });
      }
      
      // 이미지 파일 확장자 검증
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        // 업로드된 파일 삭제
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: '지원하지 않는 이미지 형식입니다. JPG, PNG, GIF, WEBP 형식만 지원합니다.' });
      }
      
      // 상대 경로 반환 (프론트엔드에서 접근 가능하도록)
      const relativePath = `/uploads/${req.file.filename}`;
      
      // 이미지 메타데이터 반환
      res.status(200).json({
        fileName: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        path: relativePath,
        url: `${req.protocol}://${req.get('host')}${relativePath}`
      });
    } catch (error) {
      console.error('이미지 업로드 에러:', error);
      res.status(500).json({ message: '이미지 업로드 중 오류가 발생했습니다.' });
    }
  });
  
  // 리소스 수정 - 인증 및 관리자 권한 필요
  app.put('/api/resources/:id', isAdmin, async (req: Request, res: Response) => {
    try {
      const resourceId = parseInt(req.params.id);
      if (isNaN(resourceId)) {
        return res.status(400).json({ message: '유효하지 않은 리소스 ID입니다.' });
      }
      
      const resource = await storage.getResourceById(resourceId);
      if (!resource) {
        return res.status(404).json({ message: '리소스를 찾을 수 없습니다.' });
      }
      
      const updatedResource = await storage.updateResource(resourceId, req.body);
      res.json(updatedResource);
    } catch (error) {
      console.error('리소스 수정 에러:', error);
      res.status(500).json({ message: '리소스 수정 중 오류가 발생했습니다.' });
    }
  });
  
  // 리소스 삭제 - 관리자 권한 필요
  app.delete('/api/resources/:id', isAdmin, async (req: Request, res: Response) => {
    try {
      const resourceId = parseInt(req.params.id);
      if (isNaN(resourceId)) {
        return res.status(400).json({ message: '유효하지 않은 리소스 ID입니다.' });
      }
      
      const resource = await storage.getResourceById(resourceId);
      if (!resource) {
        return res.status(404).json({ message: '리소스를 찾을 수 없습니다.' });
      }
      
      // 스토리지 인터페이스에 deleteResource 메서드 추가 필요
      await db.delete(resources).where(eq(resources.id, resourceId));
      
      res.status(200).json({ message: '리소스가 성공적으로 삭제되었습니다.' });
    } catch (error) {
      console.error('리소스 삭제 에러:', error);
      res.status(500).json({ message: '리소스 삭제 중 오류가 발생했습니다.' });
    }
  });
  
  // 리소스 타입별 조회
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
          createdAt: new Date(),
          downloadFile: null,
          howToUse: '화살표 키로 이동, 스페이스바로 점프, Z키로 공격합니다.',
          assemblyInstructions: null,
          category: '게임',
          isCrawled: true,
          sourceSite: 'html5games.com'
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
          createdAt: new Date(),
          downloadFile: null,
          howToUse: '마우스로 방향과 힘을 조절하여 공을 발사합니다.',
          assemblyInstructions: null,
          category: '게임',
          isCrawled: true,
          sourceSite: 'html5games.com'
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
          createdAt: new Date(),
          downloadFile: null,
          howToUse: 'WASD 키로 이동, 스페이스바로 발사, 1-5 키로 무기 변경.',
          assemblyInstructions: null,
          category: '게임',
          isCrawled: true,
          sourceSite: 'html5games.com'
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
          createdAt: new Date(),
          downloadFile: null,
          howToUse: '마우스 또는 터치로 패들을 움직입니다.',
          assemblyInstructions: null,
          category: '게임',
          isCrawled: true,
          sourceSite: 'html5games.com'
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
          createdAt: new Date(),
          downloadFile: null,
          howToUse: '마우스로 조각을 끌어다 놓고 퍼즐을 완성하세요.',
          assemblyInstructions: null,
          category: '게임',
          isCrawled: true,
          sourceSite: 'html5games.com'
        }
      ];
      
      resources = flashGames;
    }
    
    res.json(resources);
  });
  
  // 리소스 카테고리별 조회
  app.get('/api/resources/category/:category', async (req: Request, res: Response) => {
    try {
      const category = req.params.category;
      // 데이터베이스에서 카테고리별 리소스 조회
      const resourcesResult = await db.select().from(resources).where(eq(resources.category, category));
      res.json(resourcesResult);
    } catch (error) {
      console.error('카테고리별 리소스 조회 에러:', error);
      res.status(500).json({ message: '리소스 조회 중 오류가 발생했습니다.' });
    }
  });
  
  // 리소스 다운로드 엔드포인트
  app.get('/api/resources/:id/download', async (req: Request, res: Response) => {
    const resourceId = parseInt(req.params.id);
    if (isNaN(resourceId)) {
      return res.status(400).json({ message: '유효하지 않은 리소스 ID입니다.' });
    }
    
    const resource = await storage.getResourceById(resourceId);
    
    if (!resource) {
      return res.status(404).json({ message: '리소스를 찾을 수 없습니다.' });
    }
    
    // 다운로드 횟수 증가
    await storage.incrementDownloadCount(resourceId);
    
    // 외부 다운로드 URL이 있는 경우 리다이렉트
    if (resource.downloadUrl) {
      return res.json({
        success: true,
        message: `'${resource.title}' 다운로드가 시작됩니다.`,
        redirectUrl: resource.downloadUrl
      });
    }
    
    // 서버에 저장된 파일 다운로드
    if (resource.downloadFile) {
      try {
        const filePath = `./uploads/${resource.downloadFile}`;
        if (fs.existsSync(filePath)) {
          return res.download(filePath, resource.downloadFile);
        } else {
          return res.status(404).json({ message: '파일을 찾을 수 없습니다.' });
        }
      } catch (error) {
        console.error('File download error:', error);
        return res.status(500).json({ message: '파일 다운로드 중 오류가 발생했습니다.' });
      }
    }
    
    return res.status(404).json({ message: '다운로드 가능한 파일 또는 URL이 없습니다.' });
  });
  
  // 리소스 상세 조회
  app.get('/api/resources/:id', async (req: Request, res: Response) => {
    const resourceId = parseInt(req.params.id);
    if (isNaN(resourceId)) {
      return res.status(400).json({ message: '유효하지 않은 리소스 ID입니다.' });
    }
    
    const resource = await storage.getResourceById(resourceId);
    
    if (!resource) {
      return res.status(404).json({ message: '리소스를 찾을 수 없습니다.' });
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

  // 관리자 API 엔드포인트
  app.get('/api/admin/dashboard', isAdmin, getDashboardData);
  app.get('/api/admin/users', isAdmin, getAllUsers);
  app.post('/api/admin/set-admin', isAdmin, setAdminStatus);
  app.delete('/api/admin/users/:id', isAdmin, deleteUser);
  app.get('/api/admin/resources', isAdmin, getAllResources);
  app.get('/api/admin/services', isAdmin, getAllServices);
  app.put('/api/admin/services/:id/verify', isAdmin, verifyService);
  app.delete('/api/admin/services/:id', isAdmin, deleteService);

  const httpServer = createServer(app);
  return httpServer;
}
