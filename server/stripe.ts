import { Request, Response } from 'express';
import { z } from 'zod';

// 일회성 결제 Intent 생성 (API 키가 없을 때는 안내 메시지 반환)
export async function createPaymentIntent(req: Request, res: Response) {
  return res.status(503).json({ 
    message: 'Stripe 결제 기능을 사용할 수 없습니다. API 키가 설정되어 있지 않습니다.' 
  });
}

// 구독(월간 후원) 생성 (API 키가 없을 때는 안내 메시지 반환)
export async function createSponsorSubscription(req: Request, res: Response) {
  return res.status(503).json({ 
    message: 'Stripe 구독 기능을 사용할 수 없습니다. API 키가 설정되어 있지 않습니다.' 
  });
}

// 일회성 후원 (API 키가 없을 때는 안내 메시지 반환)
export async function createSponsorDonation(req: Request, res: Response) {
  return res.status(503).json({ 
    message: 'Stripe 후원 기능을 사용할 수 없습니다. API 키가 설정되어 있지 않습니다.' 
  });
}

// Stripe webhook 핸들러 (API 키가 없을 때는 안내 메시지 반환)
export async function handleStripeWebhook(req: Request, res: Response) {
  return res.status(503).json({ 
    message: 'Stripe webhook 기능을 사용할 수 없습니다. API 키가 설정되어 있지 않습니다.' 
  });
}

// Stripe 결제 상태 확인 (API 키가 없을 때는 안내 메시지 반환)
export async function checkStripeStatus(req: Request, res: Response) {
  return res.json({ 
    enabled: false,
    message: 'Stripe 결제 기능이 비활성화되어 있습니다. API 키가 설정되어 있지 않습니다.'
  });
}