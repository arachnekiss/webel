import { Request, Response } from 'express';
import { cache, staticCache, userCache, clearAllCaches, getCacheStats, clearCacheByPrefix } from './cache';

/**
 * 캐시 상태 정보를 가져오는 API
 */
export async function getCacheStatus(req: Request, res: Response) {
  try {
    const stats = getCacheStats();
    
    // 테이블별 캐시 항목 수 계산
    const resourcesCount = cache.keys().filter(key => key.startsWith('resource')).length;
    const servicesCount = cache.keys().filter(key => key.startsWith('service')).length;
    const usersCount = userCache.keys().filter(key => key.startsWith('user')).length;
    const otherCount = cache.keys().length - resourcesCount - servicesCount;
    
    res.json({
      status: 'success',
      stats,
      tables: {
        resources: resourcesCount,
        services: servicesCount,
        users: usersCount,
        other: otherCount
      },
      cacheKeys: {
        general: cache.keys(),
        static: staticCache.keys(),
        user: userCache.keys()
      }
    });
  } catch (error) {
    console.error('캐시 상태 조회 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '캐시 상태를 조회하는 중 오류가 발생했습니다.'
    });
  }
}

/**
 * 모든 캐시를 비우는 API
 */
export async function clearAllCache(req: Request, res: Response) {
  try {
    clearAllCaches();
    res.json({
      status: 'success',
      message: '모든 캐시가 성공적으로 초기화되었습니다.'
    });
  } catch (error) {
    console.error('캐시 초기화 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '캐시를 초기화하는 중 오류가 발생했습니다.'
    });
  }
}

/**
 * 특정 테이블의 캐시를 비우는 API
 */
export async function clearTableCache(req: Request, res: Response) {
  try {
    const { table } = req.params;
    
    if (!table) {
      return res.status(400).json({
        status: 'error',
        message: '테이블 이름이 필요합니다.'
      });
    }
    
    switch (table) {
      case 'resources':
        clearCacheByPrefix('resource');
        break;
      case 'services':
        clearCacheByPrefix('service');
        break;
      case 'users':
        clearCacheByPrefix('user', userCache);
        break;
      default:
        return res.status(400).json({
          status: 'error',
          message: '지원하지 않는 테이블 이름입니다. (resources, services, users 중 하나를 사용하세요)'
        });
    }
    
    res.json({
      status: 'success',
      message: `${table} 테이블 관련 캐시가 성공적으로 초기화되었습니다.`
    });
  } catch (error) {
    console.error('테이블 캐시 초기화 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '테이블 캐시를 초기화하는 중 오류가 발생했습니다.'
    });
  }
}