import { Request, Response } from 'express';
import { db } from './db';
import { users, services, resources, auctions, bids } from '@shared/schema';
import { eq, desc, asc, sql } from 'drizzle-orm';
import { isAdmin } from './auth';

// 대시보드 캐시 (5분마다 갱신)
let dashboardCache = {
  data: null as any,
  timestamp: 0,
  ttl: 5 * 60 * 1000 // 5분
};

// 관리자 대시보드 데이터 가져오기
export async function getDashboardData(req: Request, res: Response) {
  try {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "관리자 권한이 필요합니다." });
    }

    // 캐시가 유효한 경우 캐시된 데이터 반환
    const now = Date.now();
    if (dashboardCache.data && (now - dashboardCache.timestamp) < dashboardCache.ttl) {
      return res.json(dashboardCache.data);
    }

    // 모든 카운트 쿼리를 하나의 Promise.all로 병렬 실행
    const [
      usersResult,
      servicesResult, 
      resourcesResult, 
      auctionsResult,
      recentUsers,
      recentResources
    ] = await Promise.all([
      db.select({ count: sql`COUNT(*)` }).from(users),
      db.select({ count: sql`COUNT(*)` }).from(services),
      db.select({ count: sql`COUNT(*)` }).from(resources),
      db.select({ count: sql`COUNT(*)` }).from(auctions),
      // 최근 사용자
      db.select({
        id: users.id,
        username: users.username,
        email: users.email,
        fullName: users.fullName,
        isAdmin: users.isAdmin,
        isServiceProvider: users.isServiceProvider,
        createdAt: users.createdAt
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(5),
      // 최근 리소스
      db.select({
        id: resources.id,
        title: resources.title,
        description: resources.description,
        category: resources.category,
        subcategory: resources.subcategory,
        createdAt: resources.createdAt
      })
      .from(resources)
      .orderBy(desc(resources.createdAt))
      .limit(5)
    ]);

    const usersCount = Number(usersResult[0].count);
    const servicesCount = Number(servicesResult[0].count);
    const resourcesCount = Number(resourcesResult[0].count);
    const auctionsCount = Number(auctionsResult[0].count);

    const result = {
      usersCount,
      servicesCount,
      resourcesCount,
      auctionsCount,
      recentUsers,
      recentResources
    };

    // 결과를 캐시에 저장
    dashboardCache.data = result;
    dashboardCache.timestamp = now;

    res.json(result);
  } catch (error) {
    console.error('관리자 대시보드 조회 에러:', error);
    res.status(500).json({ message: '데이터를 가져오는 중 오류가 발생했습니다.' });
  }
}

// 사용자 목록 캐시 (3분마다 갱신)
let usersCache = {
  data: null as any,
  timestamp: 0,
  ttl: 3 * 60 * 1000 // 3분
};

// 대시보드 캐시 초기화
function invalidateDashboardCache() {
  dashboardCache.data = null;
  dashboardCache.timestamp = 0;
  console.log('대시보드 캐시가 초기화되었습니다.');
}

// 사용자 캐시 초기화
function invalidateUsersCache() {
  usersCache.data = null;
  usersCache.timestamp = 0;
  console.log('사용자 캐시가 초기화되었습니다.');
}

// 모든 캐시 초기화
function invalidateAllCaches() {
  invalidateDashboardCache();
  invalidateUsersCache();
  invalidateResourcesCache();
  invalidateServicesCache();
  console.log('모든 캐시가 초기화되었습니다.');
}

// 모든 사용자 가져오기
export async function getAllUsers(req: Request, res: Response) {
  try {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "관리자 권한이 필요합니다." });
    }
    
    // 캐시가 유효한 경우 캐시된 데이터 반환
    const now = Date.now();
    if (usersCache.data && (now - usersCache.timestamp) < usersCache.ttl) {
      return res.json(usersCache.data);
    }

    const allUsers = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      fullName: users.fullName,
      isAdmin: users.isAdmin,
      isServiceProvider: users.isServiceProvider,
      createdAt: users.createdAt
    })
    .from(users)
    .orderBy(desc(users.createdAt));

    // 결과를 캐시에 저장
    usersCache.data = allUsers;
    usersCache.timestamp = now;

    res.json(allUsers);
  } catch (error) {
    console.error('사용자 목록 조회 에러:', error);
    res.status(500).json({ message: '사용자 목록을 가져오는 중 오류가 발생했습니다.' });
  }
}

// 사용자 삭제
export async function deleteUser(req: Request, res: Response) {
  try {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "관리자 권한이 필요합니다." });
    }

    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: '유효하지 않은 사용자 ID입니다.' });
    }

    // 자기 자신은 삭제할 수 없음
    if (userId === req.user.id) {
      return res.status(400).json({ message: '자신의 계정은 삭제할 수 없습니다.' });
    }

    // 사용자 존재 여부 확인
    const [userExists] = await db.select({ id: users.id }).from(users).where(eq(users.id, userId));
    if (!userExists) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    // 사용자 삭제 (관련 데이터는 데이터베이스 무결성 제약조건에 따라 처리)
    await db.delete(users).where(eq(users.id, userId));
    
    // 캐시 초기화
    invalidateUsersCache();
    invalidateDashboardCache();

    res.status(200).json({ message: '사용자가 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('사용자 삭제 에러:', error);
    res.status(500).json({ message: '사용자 삭제 중 오류가 발생했습니다.' });
  }
}

// 관리자 권한 설정
export async function setAdminStatus(req: Request, res: Response) {
  try {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "관리자 권한이 필요합니다." });
    }

    const { userId, isAdmin } = req.body;
    if (typeof userId !== 'number' || typeof isAdmin !== 'boolean') {
      return res.status(400).json({ message: '잘못된 요청 형식입니다.' });
    }

    // 자기 자신의 관리자 권한은 변경할 수 없음
    if (userId === req.user.id) {
      return res.status(400).json({ message: '자신의 관리자 권한은 변경할 수 없습니다.' });
    }

    // 사용자 존재 여부 확인
    const [userExists] = await db.select({ id: users.id }).from(users).where(eq(users.id, userId));
    if (!userExists) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    // 관리자 권한 업데이트
    await db
      .update(users)
      .set({ isAdmin })
      .where(eq(users.id, userId));
      
    // 캐시 초기화
    invalidateUsersCache();
    invalidateDashboardCache();

    res.status(200).json({ message: '관리자 권한이 성공적으로 변경되었습니다.' });
  } catch (error) {
    console.error('관리자 권한 설정 에러:', error);
    res.status(500).json({ message: '관리자 권한 설정 중 오류가 발생했습니다.' });
  }
}

// 리소스 목록 캐시 관리
let resourcesCache = {
  data: {} as Record<string, any>, // 페이지 번호를 키로 사용
  timestamp: {} as Record<string, number>,
  ttl: 2 * 60 * 1000 // 2분
};

// 모든 리소스 가져오기
export async function getAllResources(req: Request, res: Response) {
  try {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "관리자 권한이 필요합니다." });
    }

    // 필요한 필드만 선택하고 페이징 적용
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    
    // 캐시 키 생성
    const cacheKey = `page_${page}_limit_${limit}`;
    const now = Date.now();
    
    // 캐시가 유효한 경우 캐시된 데이터 반환
    if (resourcesCache.data[cacheKey] && (now - resourcesCache.timestamp[cacheKey]) < resourcesCache.ttl) {
      return res.json(resourcesCache.data[cacheKey]);
    }

    // 병렬로 리소스와 카운트 조회
    const [allResources, countResult] = await Promise.all([
      db.select({
        id: resources.id,
        title: resources.title,
        description: resources.description,
        category: resources.category,
        subcategory: resources.subcategory,
        isFeatured: resources.isFeatured,
        downloadCount: resources.downloadCount,
        createdAt: resources.createdAt
      })
      .from(resources)
      .orderBy(desc(resources.createdAt))
      .limit(limit)
      .offset(offset),
      
      // 전체 카운트
      db.select({
        count: sql`COUNT(*)`
      }).from(resources)
    ]);

    const totalItems = Number(countResult[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    const result = {
      items: allResources,
      meta: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit
      }
    };
    
    // 결과를 캐시에 저장
    resourcesCache.data[cacheKey] = result;
    resourcesCache.timestamp[cacheKey] = now;

    res.json(result);
  } catch (error) {
    console.error('리소스 목록 조회 에러:', error);
    res.status(500).json({ message: '리소스 목록을 가져오는 중 오류가 발생했습니다.' });
  }
}

// 리소스 캐시 초기화
function invalidateResourcesCache() {
  resourcesCache.data = {};
  resourcesCache.timestamp = {};
  console.log('리소스 캐시가 초기화되었습니다.');
}

// 리소스 수정
export async function updateResource(req: Request, res: Response) {
  try {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "관리자 권한이 필요합니다." });
    }

    const resourceId = parseInt(req.params.id);
    if (isNaN(resourceId)) {
      return res.status(400).json({ message: '유효하지 않은 리소스 ID입니다.' });
    }

    // 리소스 존재 여부 확인
    const [resourceExists] = await db.select({ id: resources.id }).from(resources).where(eq(resources.id, resourceId));
    if (!resourceExists) {
      return res.status(404).json({ message: '리소스를 찾을 수 없습니다.' });
    }

    // 업데이트할 필드 추출
    const updateData = {...req.body};
    
    // 업데이트 불가능한 필드 제거
    delete updateData.id;
    delete updateData.createdAt;

    // 리소스 업데이트
    await db
      .update(resources)
      .set(updateData)
      .where(eq(resources.id, resourceId));

    // 업데이트된 리소스 반환
    const [updatedResource] = await db.select().from(resources).where(eq(resources.id, resourceId));
    
    // 캐시 초기화
    invalidateResourcesCache();
    invalidateDashboardCache();
    
    res.status(200).json(updatedResource);
  } catch (error) {
    console.error('리소스 업데이트 에러:', error);
    res.status(500).json({ message: '리소스 업데이트 중 오류가 발생했습니다.' });
  }
}

// 서비스 목록 캐시 관리
let servicesCache = {
  data: {} as Record<string, any>, // 페이지 번호를 키로 사용
  timestamp: {} as Record<string, number>,
  ttl: 2 * 60 * 1000 // 2분
};

// 모든 엔지니어/서비스 가져오기
export async function getAllServices(req: Request, res: Response) {
  try {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "관리자 권한이 필요합니다." });
    }

    // 필요한 필드만 선택하고 페이징 적용
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    
    // 캐시 키 생성
    const cacheKey = `page_${page}_limit_${limit}`;
    const now = Date.now();
    
    // 캐시가 유효한 경우 캐시된 데이터 반환
    if (servicesCache.data[cacheKey] && (now - servicesCache.timestamp[cacheKey]) < servicesCache.ttl) {
      return res.json(servicesCache.data[cacheKey]);
    }

    // 병렬로 서비스와 카운트 조회
    const [allServices, countResult] = await Promise.all([
      db.select({
        id: services.id,
        title: services.title,
        description: services.description,
        serviceType: services.serviceType,
        userId: services.userId,
        rating: services.rating,
        isVerified: services.isVerified,
        createdAt: services.createdAt,
        location: services.location
      })
      .from(services)
      .orderBy(desc(services.createdAt))
      .limit(limit)
      .offset(offset),
      
      // 전체 카운트
      db.select({
        count: sql`COUNT(*)`
      }).from(services)
    ]);

    const totalItems = Number(countResult[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    const result = {
      items: allServices,
      meta: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit
      }
    };
    
    // 결과를 캐시에 저장
    servicesCache.data[cacheKey] = result;
    servicesCache.timestamp[cacheKey] = now;

    res.json(result);
  } catch (error) {
    console.error('서비스 목록 조회 에러:', error);
    res.status(500).json({ message: '서비스 목록을 가져오는 중 오류가 발생했습니다.' });
  }
}

// 서비스 캐시 초기화
function invalidateServicesCache() {
  servicesCache.data = {};
  servicesCache.timestamp = {};
  console.log('서비스 캐시가 초기화되었습니다.');
}

// 서비스 검증 상태 변경
export async function verifyService(req: Request, res: Response) {
  try {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "관리자 권한이 필요합니다." });
    }

    const serviceId = parseInt(req.params.id);
    if (isNaN(serviceId)) {
      return res.status(400).json({ message: '유효하지 않은 서비스 ID입니다.' });
    }

    const { isVerified } = req.body;
    if (typeof isVerified !== 'boolean') {
      return res.status(400).json({ message: '잘못된 요청 형식입니다.' });
    }

    // 서비스 존재 여부 확인
    const [serviceExists] = await db.select({ id: services.id }).from(services).where(eq(services.id, serviceId));
    if (!serviceExists) {
      return res.status(404).json({ message: '서비스를 찾을 수 없습니다.' });
    }

    // 검증 상태 업데이트 (수정: 타입스크립트 오류 해결)
    if ('isVerified' in services) {
      await db
        .update(services)
        .set({ isVerified: isVerified as any })
        .where(eq(services.id, serviceId));
    } else {
      console.warn('isVerified 필드가 서비스 스키마에 존재하지 않습니다.');
    }

    // 업데이트된 서비스 반환
    const [updatedService] = await db.select().from(services).where(eq(services.id, serviceId));
    
    // 캐시 초기화
    invalidateServicesCache();
    invalidateDashboardCache();
    
    res.status(200).json(updatedService);
  } catch (error) {
    console.error('서비스 검증 상태 변경 에러:', error);
    res.status(500).json({ message: '서비스 검증 상태 변경 중 오류가 발생했습니다.' });
  }
}

// 서비스 삭제
export async function deleteService(req: Request, res: Response) {
  try {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "관리자 권한이 필요합니다." });
    }

    const serviceId = parseInt(req.params.id);
    if (isNaN(serviceId)) {
      return res.status(400).json({ message: '유효하지 않은 서비스 ID입니다.' });
    }

    // 서비스 존재 여부 확인
    const [serviceExists] = await db.select({ id: services.id }).from(services).where(eq(services.id, serviceId));
    if (!serviceExists) {
      return res.status(404).json({ message: '서비스를 찾을 수 없습니다.' });
    }

    // 서비스 삭제
    await db.delete(services).where(eq(services.id, serviceId));
    
    // 캐시 초기화
    invalidateServicesCache();
    invalidateDashboardCache();

    res.status(200).json({ message: '서비스가 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('서비스 삭제 에러:', error);
    res.status(500).json({ message: '서비스 삭제 중 오류가 발생했습니다.' });
  }
}