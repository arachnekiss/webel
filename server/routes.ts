import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
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
  
  app.get('/api/services/:id', async (req: Request, res: Response) => {
    const serviceId = parseInt(req.params.id);
    const service = await storage.getServiceById(serviceId);
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    res.json(service);
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

  // Resources routes
  app.get('/api/resources', async (_req: Request, res: Response) => {
    const resources = await storage.getResources();
    res.json(resources);
  });
  
  app.get('/api/resources/:id', async (req: Request, res: Response) => {
    const resourceId = parseInt(req.params.id);
    const resource = await storage.getResourceById(resourceId);
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    res.json(resource);
  });
  
  app.get('/api/resources/type/:type', async (req: Request, res: Response) => {
    const type = req.params.type;
    const resources = await storage.getResourcesByType(type);
    res.json(resources);
  });
  
  app.get('/api/resources/:id/download', async (req: Request, res: Response) => {
    const resourceId = parseInt(req.params.id);
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

  // Auctions routes
  app.get('/api/auctions', async (_req: Request, res: Response) => {
    const auctions = await storage.getAuctions();
    res.json(auctions);
  });
  
  app.get('/api/auctions/active', async (_req: Request, res: Response) => {
    const auctions = await storage.getActiveAuctions();
    res.json(auctions);
  });
  
  app.get('/api/auctions/:id', async (req: Request, res: Response) => {
    const auctionId = parseInt(req.params.id);
    const auction = await storage.getAuctionById(auctionId);
    
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }
    
    res.json(auction);
  });
  
  app.get('/api/auctions/type/:type', async (req: Request, res: Response) => {
    const type = req.params.type;
    const auctions = await storage.getAuctionsByType(type);
    res.json(auctions);
  });

  // Bids routes
  app.get('/api/auctions/:id/bids', async (req: Request, res: Response) => {
    const auctionId = parseInt(req.params.id);
    const auction = await storage.getAuctionById(auctionId);
    
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }
    
    const bids = await storage.getBidsByAuctionId(auctionId);
    res.json(bids);
  });

  const httpServer = createServer(app);
  return httpServer;
}
