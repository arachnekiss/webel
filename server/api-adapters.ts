import { NextFunction, Request, Response, Router } from 'express';
import { 
  requestVerification,
  verifyPhone,
  registerBankAccount,
  getVerificationStatus
} from './verification';
import { isAuthenticated } from './auth';

/**
 * API 어댑터 라우터
 * 클라이언트가 호출하는 API 경로와 서버 내부 라우팅 경로를 맵핑합니다.
 */
export function setupApiAdapters(router: Router): Router {
  // 사용자 인증 상태 조회 (서로 다른 경로 연결)
  router.get('/api/user/verification', isAuthenticated, (req: Request, res: Response) => {
    return getVerificationStatus(req, res);
  });
  
  // 휴대폰 인증 요청 (서로 다른 경로 연결)
  router.post('/api/user/request-verification', isAuthenticated, (req: Request, res: Response) => {
    return requestVerification(req, res);
  });
  
  // 휴대폰 인증 확인 (서로 다른 경로 연결)
  router.post('/api/user/verify-phone', isAuthenticated, (req: Request, res: Response) => {
    return verifyPhone(req, res);
  });
  
  // 계좌 등록 (서로 다른 경로 연결)
  router.post('/api/user/register-bank-account', isAuthenticated, (req: Request, res: Response) => {
    return registerBankAccount(req, res);
  });
  
  return router;
}