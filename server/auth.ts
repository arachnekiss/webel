import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import createMemoryStore from "memorystore";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);
const MemoryStore = createMemoryStore(session);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionStore = new MemoryStore({
    checkPeriod: 86400000, // 24시간마다 만료된 세션 정리
  });

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "webel-secret-key",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1주일
      sameSite: 'lax',
    }
  };

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        
        if (!user) {
          return done(null, false, { message: "사용자 이름 또는 비밀번호가 올바르지 않습니다." });
        }
        
        const isMatch = await comparePasswords(password, user.password);
        
        if (!isMatch) {
          return done(null, false, { message: "사용자 이름 또는 비밀번호가 올바르지 않습니다." });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // 로그인 API 엔드포인트
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }
      
      if (!user) {
        return res.status(401).json({ message: info?.message || "로그인에 실패했습니다." });
      }
      
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        
        return res.status(200).json(user);
      });
    })(req, res, next);
  });

  // 회원가입 API 엔드포인트
  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, email, password, fullName } = req.body;
      
      // 사용자 이름 중복 확인
      const existingUser = await storage.getUserByUsername(username);
      
      if (existingUser) {
        return res.status(409).json({ message: "이미 사용 중인 사용자 이름입니다." });
      }
      
      // 비밀번호 해싱
      const hashedPassword = await hashPassword(password);
      
      // 새 사용자 생성
      const newUser = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        fullName,
        isServiceProvider: false,
      });
      
      // 자동 로그인
      req.login(newUser, (err) => {
        if (err) {
          return next(err);
        }
        
        return res.status(201).json(newUser);
      });
    } catch (error) {
      next(error);
    }
  });

  // 로그아웃 API 엔드포인트
  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "로그아웃 처리 중 오류가 발생했습니다." });
      }
      
      res.status(200).json({ message: "로그아웃 되었습니다." });
    });
  });

  // 현재 사용자 정보 API 엔드포인트
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "인증되지 않은 사용자입니다." });
    }
    
    res.status(200).json(req.user);
  });
}