import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { db } from "./db";
import { users, services, resources, auctions } from "@shared/schema";
import { desc } from "drizzle-orm";
import type { User } from "@shared/schema";
import createMemoryStore from "memorystore";

// Express 타입 확장
declare global {
  namespace Express {
    interface User extends User {}
  }
}

// 비동기 scrypt 함수
const scryptAsync = promisify(scrypt);

// 비밀번호 해싱
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// 비밀번호 비교
async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// 인증 설정
export function setupAuth(app: Express): void {
  // 세션 스토어 생성
  const MemoryStore = createMemoryStore(session);
  const sessionStore = new MemoryStore({
    checkPeriod: 86400000 // 24시간 후 만료된 세션 정리
  });

  // 세션 설정
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'webel-secret-key',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24시간
      sameSite: 'lax'
    }
  };

  // HTTPS 환경에서는 secure 쿠키 사용
  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
    if (sessionSettings.cookie) sessionSettings.cookie.secure = true;
  }

  // 세션 미들웨어 설정
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // LocalStrategy 설정
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "유효하지 않은 사용자 이름입니다." });
        }
        
        const isValid = await comparePasswords(password, user.password);
        if (!isValid) {
          return done(null, false, { message: "비밀번호가 일치하지 않습니다." });
        }
        
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  // 사용자 직렬화
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // 사용자 역직렬화
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // 회원가입 라우트
  app.post("/api/register", async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 사용자 이름 중복 확인
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "이미 사용 중인 사용자 이름입니다." });
      }

      // 이메일 중복 확인
      const existingEmail = await storage.getUserByEmail(req.body.email);
      if (existingEmail) {
        return res.status(400).json({ message: "이미 사용 중인 이메일입니다." });
      }

      // 비밀번호 해싱
      const hashedPassword = await hashPassword(req.body.password);

      // 사용자 생성
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword
      });

      // 로그인 처리
      req.login(user, (err) => {
        if (err) return next(err);
        return res.status(201).json(user);
      });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ message: "회원가입 처리 중 오류가 발생했습니다." });
    }
  });

  // 로그인 라우트
  app.post("/api/login", (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info?.message || "로그인에 실패했습니다." });
      }
      
      req.login(user, (err) => {
        if (err) return next(err);
        return res.status(200).json(user);
      });
    })(req, res, next);
  });

  // 로그아웃 라우트
  app.post("/api/logout", (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "로그아웃 처리 중 오류가 발생했습니다." });
      }
      res.status(200).json({ message: "성공적으로 로그아웃되었습니다." });
    });
  });

  // 현재 사용자 정보 라우트
  app.get("/api/user", (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "인증되지 않은 사용자입니다." });
    }
    res.status(200).json(req.user);
  });

  // 관리자 권한 설정 라우트 (관리자만 접근 가능)
  app.post("/api/admin/set-admin", isAdmin, async (req: Request, res: Response) => {
    try {
      const { userId, isAdmin } = req.body;
      
      if (!userId || typeof isAdmin !== 'boolean') {
        return res.status(400).json({ message: "유효하지 않은 요청입니다." });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
      }

      const updatedUser = await storage.setAdminStatus(userId, isAdmin);
      res.status(200).json(updatedUser);
    } catch (error) {
      console.error("Admin setting error:", error);
      res.status(500).json({ message: "관리자 권한 설정 중 오류가 발생했습니다." });
    }
  });

  // 시드 관리자 생성 라우트 (최초 관리자 계정 생성용)
  app.post("/api/create-admin", async (req: Request, res: Response) => {
    try {
      const { username, password, email } = req.body;
      
      // 필수 필드 검증
      if (!username || !password || !email) {
        return res.status(400).json({ message: "모든 필드를 입력해주세요." });
      }

      // 기존 관리자 확인
      const usersList = await db.select().from(users);
      const adminExists = usersList.some(user => user.isAdmin);
      
      // 이미 관리자가 있는 경우 접근 거부
      if (adminExists) {
        return res.status(403).json({ message: "이미 관리자 계정이 존재합니다." });
      }

      // 사용자 중복 확인
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "이미 사용 중인 사용자 이름입니다." });
      }

      // 이메일 중복 확인
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "이미 사용 중인 이메일입니다." });
      }

      // 관리자 계정 생성
      const hashedPassword = await hashPassword(password);
      const adminUser = await storage.createUser({
        username,
        password: hashedPassword,
        email,
        isAdmin: true,
        fullName: "관리자"
      });

      // 로그인 처리
      req.login(adminUser, (err) => {
        if (err) throw err;
        return res.status(201).json(adminUser);
      });
    } catch (error) {
      console.error("Admin creation error:", error);
      res.status(500).json({ message: "관리자 생성 중 오류가 발생했습니다." });
    }
  });

  // 관리자 대시보드 데이터 라우트
  app.get("/api/admin/dashboard", isAdmin, async (req: Request, res: Response) => {
    try {
      // 여기서 관리자 대시보드에 필요한 데이터를 가져옵니다
      const usersCount = (await db.select().from(users)).length;
      const servicesCount = (await db.select().from(services)).length;
      const resourcesCount = (await db.select().from(resources)).length;
      const auctionsCount = (await db.select().from(auctions)).length;

      res.status(200).json({
        usersCount,
        servicesCount,
        resourcesCount,
        auctionsCount,
        recentUsers: await db.select().from(users).orderBy(desc(users.createdAt)).limit(5),
        recentResources: await db.select().from(resources).orderBy(desc(resources.createdAt)).limit(5)
      });
    } catch (error) {
      console.error("Admin dashboard error:", error);
      res.status(500).json({ message: "대시보드 데이터 조회 중 오류가 발생했습니다." });
    }
  });
}

// 인증 확인 미들웨어
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "로그인이 필요합니다." });
}

// 관리자 권한 확인 미들웨어
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && req.user && req.user.isAdmin) {
    return next();
  }
  res.status(403).json({ message: "관리자 권한이 필요합니다." });
}