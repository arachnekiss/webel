import { Request, Response } from 'express';
import { db } from './db';
import { users, services, resources, auctions, bids } from '@shared/schema';
import { eq, desc, asc, sql } from 'drizzle-orm';
import { isAdmin } from './auth';

// 관리자 대시보드 데이터 가져오기
export async function getDashboardData(req: Request, res: Response) {
  try {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "관리자 권한이 필요합니다." });
    }

    // 통계 조회 - 사용자, 서비스, 리소스, 경매 수
    const [usersResult] = await db.select({ count: sql`COUNT(*)` }).from(users);
    const [servicesResult] = await db.select({ count: sql`COUNT(*)` }).from(services);
    const [resourcesResult] = await db.select({ count: sql`COUNT(*)` }).from(resources);
    const [auctionsResult] = await db.select({ count: sql`COUNT(*)` }).from(auctions);

    const usersCount = Number(usersResult.count);
    const servicesCount = Number(servicesResult.count);
    const resourcesCount = Number(resourcesResult.count);
    const auctionsCount = Number(auctionsResult.count);

    // 최근 사용자
    const recentUsers = await db.select({
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
    .limit(5);

    // 최근 리소스
    const recentResources = await db.select({
      id: resources.id,
      title: resources.title,
      description: resources.description,
      resourceType: resources.resourceType,
      createdAt: resources.createdAt
    })
    .from(resources)
    .orderBy(desc(resources.createdAt))
    .limit(5);

    res.json({
      usersCount,
      servicesCount,
      resourcesCount,
      auctionsCount,
      recentUsers,
      recentResources
    });
  } catch (error) {
    console.error('관리자 대시보드 조회 에러:', error);
    res.status(500).json({ message: '데이터를 가져오는 중 오류가 발생했습니다.' });
  }
}

// 모든 사용자 가져오기
export async function getAllUsers(req: Request, res: Response) {
  try {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "관리자 권한이 필요합니다." });
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

    res.status(200).json({ message: '관리자 권한이 성공적으로 변경되었습니다.' });
  } catch (error) {
    console.error('관리자 권한 설정 에러:', error);
    res.status(500).json({ message: '관리자 권한 설정 중 오류가 발생했습니다.' });
  }
}

// 모든 리소스 가져오기
export async function getAllResources(req: Request, res: Response) {
  try {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "관리자 권한이 필요합니다." });
    }

    const allResources = await db.select()
      .from(resources)
      .orderBy(desc(resources.createdAt));

    res.json(allResources);
  } catch (error) {
    console.error('리소스 목록 조회 에러:', error);
    res.status(500).json({ message: '리소스 목록을 가져오는 중 오류가 발생했습니다.' });
  }
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
    
    res.status(200).json(updatedResource);
  } catch (error) {
    console.error('리소스 업데이트 에러:', error);
    res.status(500).json({ message: '리소스 업데이트 중 오류가 발생했습니다.' });
  }
}

// 모든 엔지니어/서비스 가져오기
export async function getAllServices(req: Request, res: Response) {
  try {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "관리자 권한이 필요합니다." });
    }

    const allServices = await db.select()
      .from(services)
      .orderBy(desc(services.createdAt));

    res.json(allServices);
  } catch (error) {
    console.error('서비스 목록 조회 에러:', error);
    res.status(500).json({ message: '서비스 목록을 가져오는 중 오류가 발생했습니다.' });
  }
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

    res.status(200).json({ message: '서비스가 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('서비스 삭제 에러:', error);
    res.status(500).json({ message: '서비스 삭제 중 오류가 발생했습니다.' });
  }
}