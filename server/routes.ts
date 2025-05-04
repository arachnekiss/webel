import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { 
  getChatResponse, 
  analyzeImage, 
  analyzeImageWithStructuredResponse, 
  transcribeAudio,
  generateImage 
} from "./openai";
import * as fs from 'fs';
import * as path from 'path';
import { db } from './db';
import { users, services, resources, auctions, bids } from '@shared/schema';
import { eq } from 'drizzle-orm';
import multer from 'multer';
import { 
  createPaymentIntent, 
  createSponsorSubscription, 
  createSponsorDonation, 
  handleStripeWebhook,
  checkStripeStatus
} from './stripe';

// 다중 결제 시스템 라우트 핸들러
import {
  initializePayment,
  approvePayment,
  cancelPayment,
  completeService,
  getUserOrders,
  getProviderOrders
} from './payment';

// 본인 인증 관련 함수
import {
  requestVerification,
  verifyPhone,
  registerBankAccount,
  getVerificationStatus
} from './verification';

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
import { setupApiAdapters } from './api-adapters';
import { Router } from 'express';

export async function registerRoutes(app: Express): Promise<Server> {
  // API 어댑터 라우터 설정
  const apiRouter = Router();
  setupApiAdapters(apiRouter);
  app.use(apiRouter);
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
  
  // 본인 인증 관련 라우트
  app.post('/api/verification/request', isAuthenticated, requestVerification);
  app.post('/api/verification/phone', isAuthenticated, verifyPhone);
  app.post('/api/verification/bank-account', isAuthenticated, registerBankAccount);
  app.get('/api/verification/status', isAuthenticated, getVerificationStatus);
  
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
      // 유료 서비스인 경우 로그인된 사용자만 가능 & 본인 인증이 필요한지 확인
      if ((req.body.isFreeService === false || req.body.basePrice > 0) && req.user) {
        // 인증 상태 확인
        const verificationStatus = await storage.getVerificationStatus(req.user.id);
        
        if (!verificationStatus) {
          return res.status(500).json({ message: '인증 상태 확인 중 오류가 발생했습니다.' });
        }
        
        // 필요한 인증이 누락된 경우
        if (!verificationStatus.isPhoneVerified || !verificationStatus.isAccountVerified) {
          const missingVerifications = [];
          if (!verificationStatus.isPhoneVerified) missingVerifications.push('휴대폰 인증');
          if (!verificationStatus.isAccountVerified) missingVerifications.push('계좌 인증');
          
          return res.status(400).json({ 
            message: `유료 서비스를 등록하기 위해서는 ${missingVerifications.join(' 및 ')}이 필요합니다.`,
            verificationType: 'required',
            verificationStatus: {
              isPhoneVerified: verificationStatus.isPhoneVerified,
              isAccountVerified: verificationStatus.isAccountVerified
            }
          });
        }
      }
      
      // 데이터 정제
      const serviceData = {
        ...req.body,
        userId: req.user ? req.user.id : null
      };
      
      // tags 배열 처리
      if (serviceData.tags && !Array.isArray(serviceData.tags)) {
        if (typeof serviceData.tags === 'string') {
          serviceData.tags = serviceData.tags.split(',').map(tag => tag.trim());
        } else {
          // 다른 형태의 데이터라면 빈 배열로 설정
          serviceData.tags = [];
        }
      }
      
      // availableItems 배열 처리
      if (serviceData.availableItems && !Array.isArray(serviceData.availableItems)) {
        if (typeof serviceData.availableItems === 'string') {
          serviceData.availableItems = serviceData.availableItems.split(',').map(item => item.trim());
        } else {
          serviceData.availableItems = [];
        }
      }
      
      // 필수 필드가 비어있는지 확인 및 기본값 설정
      if (!serviceData.title) serviceData.title = '제목 없음';
      if (!serviceData.description) serviceData.description = '설명 없음'; 
      
      console.log('서비스 데이터 처리:', {
        ...serviceData,
        userId: '사용자 ID', // 로그에는 민감 정보 제외
      });
      
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
      maxDistance: z.number().default(10), // default 10km
      serviceType: z.string().optional() // 특정 서비스 타입 필터링 가능
    });
    
    try {
      // 요청 파라미터 파싱
      const { lat, long, maxDistance, serviceType } = locationSchema.parse({
        lat: parseFloat(req.query.lat as string),
        long: parseFloat(req.query.long as string),
        maxDistance: req.query.maxDistance ? parseFloat(req.query.maxDistance as string) : 10,
        serviceType: req.query.serviceType as string || undefined
      });
      
      // 위치와 서비스 타입 기반으로 서비스 검색
      const services = await storage.getServicesByLocation(
        { lat, long, address: '' },
        maxDistance,
        serviceType
      );
      
      res.json({
        count: services.length,
        services,
        searchInfo: {
          lat,
          long,
          maxDistance,
          serviceType: serviceType || 'all'
        }
      });
    } catch (error) {
      console.error('서비스 위치 검색 오류:', error);
      res.status(400).json({ message: 'Invalid location parameters' });
    }
  });
  
  app.get('/api/services/:id', async (req: Request, res: Response) => {
    try {
      const serviceId = parseInt(req.params.id);
      if (isNaN(serviceId)) {
        return res.status(400).json({ message: 'Invalid service ID' });
      }
      
      const service = await storage.getServiceById(serviceId);
      
      if (!service) {
        return res.status(404).json({ message: 'Service not found' });
      }
      
      res.json(service);
    } catch (error) {
      console.error('서비스 상세 정보 조회 오류:', error);
      res.status(500).json({ message: '서비스 정보를 불러오는데 실패했습니다' });
    }
  });

  // Resources routes
  app.get('/api/resources', async (_req: Request, res: Response) => {
    const resources = await storage.getResources();
    res.json(resources);
  });
  
  // 리소스 생성 - 인증 필요
  app.post('/api/resources', isAuthenticated, upload.none(), async (req: Request, res: Response) => {
    try {
      // 필수 필드 검증
      if (!req.body.title || !req.body.description) {
        return res.status(400).json({
          message: '필수 필드가 누락되었습니다. (title, description)'
        });
      }
      
      // 리소스 데이터 준비
      const resourceData: any = {
        title: req.body.title,
        description: req.body.description,
        userId: req.user?.id || null,
        createdAt: new Date()
      };
      
      // resourceType 필드와 category 필드 모두 설정 (일관성을 위해)
      if (req.body.resourceType) {
        resourceData.category = req.body.resourceType;
        resourceData.resourceType = req.body.resourceType;
      }
      
      // 선택적 필드 추가
      if (req.body.category) resourceData.category = req.body.category;
      if (req.body.imageUrl) resourceData.imageUrl = req.body.imageUrl;
      if (req.body.downloadUrl) resourceData.downloadUrl = req.body.downloadUrl;
      if (req.body.howToUse) resourceData.howToUse = req.body.howToUse;
      if (req.body.assemblyInstructions) resourceData.assemblyInstructions = req.body.assemblyInstructions;
      if (req.body.license) resourceData.license = req.body.license;
      if (req.body.version) resourceData.version = req.body.version;
      
      // 태그 처리
      if (req.body.tags) {
        try {
          resourceData.tags = Array.isArray(req.body.tags) 
            ? req.body.tags 
            : JSON.parse(req.body.tags);
        } catch (e) {
          resourceData.tags = typeof req.body.tags === 'string'
            ? req.body.tags.split(',').map((tag: string) => tag.trim())
            : [];
        }
      }

      // 리소스 유형별 추가 데이터
      const additionalFields = [
        'programmingLanguage', 'dependencies', 'softwareRequirements',
        'aiModelType', 'trainingData', 'modelAccuracy',
        'fileFormat', 'polygonCount', 'dimensions'
      ];
      
      additionalFields.forEach(field => {
        if (req.body[field]) resourceData[field] = req.body[field];
      });
      
      // 멀티미디어 데이터 처리
      if (req.body.multimedia) {
        try {
          resourceData.multimedia = JSON.parse(req.body.multimedia);
        } catch (e) {
          console.error('멀티미디어 데이터 파싱 에러:', e);
        }
      }
      
      const resource = await storage.createResource(resourceData);
      res.status(201).json(resource);
    } catch (error) {
      console.error('리소스 생성 에러:', error);
      res.status(500).json({ message: '리소스 생성 중 오류가 발생했습니다.' });
    }
  });
  
  // 리소스 업로드 - 인증 필요
  app.post('/api/resources/upload', isAuthenticated, upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'downloadFile', maxCount: 1 }
  ]), async (req: Request, res: Response) => {
    try {
      console.log('리소스 업로드 요청 데이터:', {
        body: req.body,
        files: req.files,
        user: req.user ? { id: req.user.id } : null
      });
      
      // 필수 필드 검증 완화 - 빈 문자열도 허용
      if (req.body.title === undefined || req.body.description === undefined) {
        return res.status(400).json({ 
          message: '필수 필드가 누락되었습니다. 제목, 설명은 필수입니다.' 
        });
      }
      
      // 기본값 설정
      const title = req.body.title || '제목 없음';
      const description = req.body.description || '설명 없음';
      
      // 업로드된 파일들
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      // 리소스 데이터 준비
      const resourceData: any = {
        title: title,
        description: description,
        userId: req.user?.id,
        createdAt: new Date()
      };
      
      // resourceType 필드와 category 필드 모두 설정 (일관성을 위해)
      if (req.body.resourceType) {
        resourceData.category = req.body.resourceType;
        resourceData.resourceType = req.body.resourceType;
      }
      
      // 태그 처리
      if (req.body.tags) {
        try {
          resourceData.tags = req.body.tags.split(',').map((tag: string) => tag.trim());
        } catch (e) {
          resourceData.tags = [];
        }
      }
      
      // 다운로드 URL 처리
      if (req.body.downloadUrl) {
        resourceData.downloadUrl = req.body.downloadUrl;
      }
      
      // 이미지 파일 처리
      if (files.image && files.image[0]) {
        const imageFile = files.image[0];
        const relativePath = `/uploads/${imageFile.filename}`;
        resourceData.imageUrl = `${req.protocol}://${req.get('host')}${relativePath}`;
      }
      
      // 다운로드 파일 처리
      if (files.downloadFile && files.downloadFile[0]) {
        const downloadFile = files.downloadFile[0];
        const relativePath = `/uploads/${downloadFile.filename}`;
        resourceData.downloadFile = relativePath;
      }
      
      // 사용법과 조립방법 처리 (JSON 문자열을 파싱)
      if (req.body.howToUse) {
        try {
          const howToUseData = JSON.parse(req.body.howToUse);
          resourceData.howToUse = howToUseData.text;
          // 멀티미디어 정보는 별도 필드에 저장할 수 있음
          if (howToUseData.multimedia) {
            resourceData.howToUseMultimedia = JSON.stringify(howToUseData.multimedia);
          }
        } catch (e) {
          resourceData.howToUse = req.body.howToUse;
        }
      }
      
      if (req.body.assemblyInstructions) {
        try {
          const assemblyData = JSON.parse(req.body.assemblyInstructions);
          resourceData.assemblyInstructions = assemblyData.text;
          // 멀티미디어 정보는 별도 필드에 저장할 수 있음
          if (assemblyData.multimedia) {
            resourceData.assemblyMultimedia = JSON.stringify(assemblyData.multimedia);
          }
        } catch (e) {
          resourceData.assemblyInstructions = req.body.assemblyInstructions;
        }
      }
      
      // 리소스 생성
      const resource = await storage.createResource(resourceData);
      res.status(201).json(resource);
    } catch (error) {
      console.error('리소스 업로드 에러:', error);
      res.status(500).json({ message: '리소스 업로드 중 오류가 발생했습니다.' });
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
        imageUrl: relativePath
      });
    } catch (error) {
      console.error('이미지 업로드 에러:', error);
      res.status(500).json({ message: '이미지 업로드 중 오류가 발생했습니다.' });
    }
  });
  
  // 파일 업로드 API - 인증 필요
  app.post('/api/resources/upload-file', isAuthenticated, upload.single('file'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: '파일이 없습니다.' });
      }
      
      // 파일 경로 생성
      const relativePath = `/uploads/${req.file.filename}`;
      
      res.status(200).json({ 
        fileName: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        path: relativePath,
        downloadUrl: relativePath,
        message: '파일이 성공적으로 업로드되었습니다.'
      });
    } catch (error) {
      console.error('파일 업로드 에러:', error);
      res.status(500).json({ message: '파일 업로드 중 오류가 발생했습니다.' });
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
  
  // 리소스 카테고리별 조회 (새 엔드포인트)
  app.get('/api/resources/category/:category', async (req: Request, res: Response) => {
    try {
      const category = req.params.category;
      let resources = await storage.getResourcesByCategory(category);
      res.json(resources);
    } catch (error) {
      console.error('카테고리별 리소스 조회 에러:', error);
      res.status(500).json({ message: '리소스 조회 중 오류가 발생했습니다.' });
    }
  });
    
  // 이전 API 경로 호환성 유지 (나중에 제거 가능)
  app.get('/api/resources/type/:type', async (req: Request, res: Response) => {
    try {
      const type = req.params.type;
      let resources = await storage.getResourcesByCategory(type);
    
    // 데이터베이스에서 찾은 리소스 사용
    res.json(resources);
    } catch (error) {
      console.error('리소스 타입별 조회 에러:', error);
      res.status(500).json({ message: '리소스 조회 중 오류가 발생했습니다.' });
    }
  });
  
  // 이 엔드포인트는 위에서 이미 정의되었으므로 제거합니다.
  
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
  
  // 구조화된 이미지 분석 엔드포인트 (JSON 응답)
  app.post('/api/assembly/analyze-image-json', async (req: Request, res: Response) => {
    try {
      const { imageData, prompt } = req.body;
      
      if (!imageData || !prompt) {
        return res.status(400).json({ message: '이미지 데이터와 프롬프트가 필요합니다.' });
      }
      
      // Base64 형식 확인
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
      
      const analysis = await analyzeImageWithStructuredResponse(base64Data, prompt);
      res.json({ analysis });
    } catch (error: any) {
      console.error('구조화된 이미지 분석 에러:', error);
      res.status(500).json({ message: error.message || '이미지 분석 중 오류가 발생했습니다.' });
    }
  });
  
  // 음성 인식 엔드포인트
  app.post('/api/assembly/transcribe-audio', async (req: Request, res: Response) => {
    try {
      const { audioData } = req.body;
      
      if (!audioData) {
        return res.status(400).json({ message: '오디오 데이터가 필요합니다.' });
      }
      
      const transcription = await transcribeAudio(audioData);
      res.json({ transcription });
    } catch (error: any) {
      console.error('음성 인식 에러:', error);
      res.status(500).json({ message: error.message || '음성 인식 중 오류가 발생했습니다.' });
    }
  });
  
  // 이미지 생성 엔드포인트
  app.post('/api/assembly/generate-image', async (req: Request, res: Response) => {
    try {
      const { prompt } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ message: '이미지 생성을 위한 프롬프트가 필요합니다.' });
      }
      
      const imageUrl = await generateImage(prompt);
      res.json({ imageUrl });
    } catch (error: any) {
      console.error('이미지 생성 에러:', error);
      res.status(500).json({ message: error.message || '이미지 생성 중 오류가 발생했습니다.' });
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

  // ==================== Stripe 결제 관련 라우트 ====================
  // (Stripe API 키가 없어 비활성화됨, 단순 응답만 반환)

  // Stripe 결제 인텐트 생성 (일회성 결제) 
  app.post('/api/payment/create-payment-intent', createPaymentIntent);
  
  // Webel 후원 - 일회성 후원
  app.post('/api/sponsor/donate', createSponsorDonation);
  
  // Webel 후원 - 구독 생성
  app.post('/api/sponsor/subscribe', createSponsorSubscription);
  
  // Stripe 결제 상태 확인
  app.get('/api/sponsor/status', checkStripeStatus);
  
  // ==================== 다중 결제 시스템 라우트 ====================
  // 주문 및 결제 관련 라우트 (PayPal, KakaoPay, Toss 등 지원)
  
  // 결제 초기화 (주문 생성 및 결제 정보 반환)
  app.post('/api/payments/initialize', isAuthenticated, initializePayment);
  
  // 결제 승인 완료
  app.post('/api/payments/approve', isAuthenticated, approvePayment);
  
  // 결제/주문 취소
  app.post('/api/payments/cancel', isAuthenticated, cancelPayment);
  
  // 서비스 제공자가 작업 완료 처리
  app.post('/api/orders/:orderId/complete', isAuthenticated, completeService);
  
  // 사용자별 주문 내역 조회
  app.get('/api/user/orders', isAuthenticated, getUserOrders);
  
  // 서비스 제공자별 주문 내역 조회
  app.get('/api/provider/orders', isAuthenticated, getProviderOrders);

  // 본인 인증 관련 API 라우트
  // 인증 상태 조회
  app.get('/api/user/verification', isAuthenticated, getVerificationStatus);
  
  // 인증번호 요청
  app.post('/api/user/request-verification', isAuthenticated, requestVerification);
  
  // 휴대폰 인증 완료
  app.post('/api/user/verify-phone', isAuthenticated, verifyPhone);
  
  // 계좌 등록
  app.post('/api/user/register-bank-account', isAuthenticated, registerBankAccount);

  const httpServer = createServer(app);
  return httpServer;
}
