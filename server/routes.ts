import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { getChatResponse, analyzeImage } from "./openai";
import * as fs from 'fs';
import * as path from 'path';

import { setupAuth } from './auth';

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
    const resources = await storage.getResourcesByType(type);
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

  const httpServer = createServer(app);
  return httpServer;
}
