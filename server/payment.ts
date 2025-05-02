import { Request, Response } from 'express';
import { z } from 'zod';
import { storage } from './storage';
import { InsertOrder, InsertTransaction, PaymentMethod } from '@shared/schema';

// 결제 생성 요청 스키마
const createPaymentRequestSchema = z.object({
  serviceId: z.number(),
  providerId: z.number(),
  totalAmount: z.number().min(1),
  quantity: z.number().min(1).default(1),
  details: z.any().optional(),
  paymentMethod: z.enum(['paypal', 'kakao_pay', 'toss', 'credit_card', 'bank_transfer'])
});

// 결제 승인 요청 스키마
const approvePaymentRequestSchema = z.object({
  orderId: z.number(),
  transactionId: z.string(),
  paymentMethod: z.enum(['paypal', 'kakao_pay', 'toss', 'credit_card', 'bank_transfer']),
  paymentGateway: z.enum(['paypal', 'kakao_pay', 'toss', 'stripe', 'bank']),
  metadata: z.any().optional()
});

// 결제 취소 요청 스키마
const cancelPaymentRequestSchema = z.object({
  orderId: z.number(),
  reason: z.string().optional()
});

/**
 * 결제 프로세스 초기화
 * 주문 생성 및 결제 진행을 위한 준비 과정
 */
export async function initializePayment(req: Request, res: Response) {
  try {
    // 인증 확인
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        success: false,
        message: '로그인이 필요한 기능입니다.'
      });
    }

    // 요청 검증
    const paymentData = createPaymentRequestSchema.parse(req.body);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '사용자 정보를 찾을 수 없습니다.'
      });
    }

    // 서비스 정보 확인
    const service = await storage.getServiceById(paymentData.serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: '서비스를 찾을 수 없습니다.'
      });
    }

    // 자기 자신의 서비스를 결제하는 경우 체크
    if (service.userId === userId) {
      return res.status(400).json({
        success: false,
        message: '자신의 서비스는 결제할 수 없습니다.'
      });
    }

    // 웹 수수료 계산 (10%)
    const webFee = Math.round(paymentData.totalAmount * 0.1);
    const providerAmount = paymentData.totalAmount - webFee;

    // 주문 생성
    const orderData: InsertOrder = {
      serviceId: paymentData.serviceId,
      userId: userId,
      providerId: paymentData.providerId,
      totalAmount: paymentData.totalAmount,
      webFee: webFee,
      providerAmount: providerAmount,
      status: 'pending',
      quantity: paymentData.quantity,
      details: paymentData.details,
      paymentMethod: paymentData.paymentMethod as string
    };

    const order = await storage.createOrder(orderData);

    // 결제 방식에 따른 응답 데이터 구성
    let paymentConfig = null;

    switch (paymentData.paymentMethod) {
      case 'paypal':
        paymentConfig = {
          clientId: process.env.PAYPAL_CLIENT_ID,
          currency: 'USD',
          amount: (paymentData.totalAmount / 1200).toFixed(2), // KRW to USD 간단 변환 (실제 환율 적용 필요)
        };
        break;
      
      case 'kakao_pay':
        paymentConfig = {
          cid: process.env.KAKAO_PAY_CID,
          partner_order_id: order.id.toString(),
          partner_user_id: userId.toString(),
          item_name: service.title,
          quantity: paymentData.quantity,
          total_amount: paymentData.totalAmount,
        };
        break;
      
      case 'toss':
        paymentConfig = {
          clientKey: process.env.TOSS_PAYMENTS_CLIENT_KEY,
          amount: paymentData.totalAmount,
          orderId: order.id.toString(),
          orderName: service.title,
        };
        break;
      
      default:
        paymentConfig = {
          amount: paymentData.totalAmount,
          orderId: order.id,
        };
    }

    // 응답 반환
    res.json({
      success: true,
      order: order,
      paymentConfig: paymentConfig,
      message: '결제 정보가 생성되었습니다.'
    });

  } catch (error: any) {
    console.error('결제 초기화 오류:', error);
    res.status(400).json({
      success: false,
      message: error.message || '결제 초기화 중 오류가 발생했습니다.'
    });
  }
}

/**
 * 결제 승인 및 완료 처리
 * 외부 결제 시스템에서 승인된 결제를 완료 처리
 */
export async function approvePayment(req: Request, res: Response) {
  try {
    // 인증 확인
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        success: false,
        message: '로그인이 필요한 기능입니다.'
      });
    }

    // 요청 검증
    const approveData = approvePaymentRequestSchema.parse(req.body);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '사용자 정보를 찾을 수 없습니다.'
      });
    }

    // 주문 정보 확인
    const order = await storage.getOrderById(approveData.orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: '주문 정보를 찾을 수 없습니다.'
      });
    }

    // 주문자 확인
    if (order.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: '해당 주문에 대한 승인 권한이 없습니다.'
      });
    }

    // 이미 처리된 주문인지 확인
    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `이미 ${order.status} 상태인 주문입니다.`
      });
    }

    // 트랜잭션 기록 생성
    const transactionData: InsertTransaction = {
      orderId: order.id,
      userId: userId,
      amount: order.totalAmount,
      paymentMethod: approveData.paymentMethod as string,
      paymentGateway: approveData.paymentGateway as string,
      transactionId: approveData.transactionId,
      status: 'success',
      metadata: approveData.metadata || null
    };

    const transaction = await storage.createTransaction(transactionData);

    // 주문 상태 업데이트
    const updatedOrder = await storage.updateOrder(order.id, {
      status: 'paid'
    });

    // 응답 반환
    res.json({
      success: true,
      order: updatedOrder,
      transaction: transaction,
      message: '결제가 성공적으로 완료되었습니다.'
    });

  } catch (error: any) {
    console.error('결제 승인 오류:', error);
    res.status(400).json({
      success: false,
      message: error.message || '결제 승인 중 오류가 발생했습니다.'
    });
  }
}

/**
 * 결제 취소 처리
 * 결제 전/후 주문 취소 처리
 */
export async function cancelPayment(req: Request, res: Response) {
  try {
    // 인증 확인
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        success: false,
        message: '로그인이 필요한 기능입니다.'
      });
    }

    // 요청 검증
    const cancelData = cancelPaymentRequestSchema.parse(req.body);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '사용자 정보를 찾을 수 없습니다.'
      });
    }

    // 주문 정보 확인
    const order = await storage.getOrderById(cancelData.orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: '주문 정보를 찾을 수 없습니다.'
      });
    }

    // 주문자 또는 서비스 제공자 확인
    if (order.userId !== userId && order.providerId !== userId) {
      return res.status(403).json({
        success: false,
        message: '해당 주문에 대한 취소 권한이 없습니다.'
      });
    }

    // 이미 취소된 주문인지 확인
    if (order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: '이미 취소된 주문입니다.'
      });
    }

    // 완료된 주문인 경우 취소 불가
    if (order.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: '이미 완료된 주문은 취소할 수 없습니다.'
      });
    }

    // 트랜잭션 확인
    const transactions = await storage.getTransactionsByOrderId(order.id);
    const successTransaction = transactions.find(t => t.status === 'success');

    // 실제 결제된 주문인 경우 외부 결제 시스템에서 환불 처리 필요
    if (successTransaction) {
      // 환불 처리 로직 (외부 결제 시스템 API 호출)
      // 환불 트랜잭션 기록
      await storage.createTransaction({
        orderId: order.id,
        userId: userId,
        amount: order.totalAmount,
        paymentMethod: successTransaction.paymentMethod,
        paymentGateway: successTransaction.paymentGateway,
        transactionId: `refund_${successTransaction.transactionId}`,
        status: 'refunded',
        metadata: {
          originalTransactionId: successTransaction.transactionId,
          reason: cancelData.reason || '사용자 요청에 의한 취소'
        }
      });
    }

    // 주문 상태 업데이트
    const updatedOrder = await storage.updateOrder(order.id, {
      status: 'cancelled'
    });

    // 응답 반환
    res.json({
      success: true,
      order: updatedOrder,
      message: '주문이 성공적으로 취소되었습니다.'
    });

  } catch (error: any) {
    console.error('결제 취소 오류:', error);
    res.status(400).json({
      success: false,
      message: error.message || '결제 취소 중 오류가 발생했습니다.'
    });
  }
}

/**
 * 결제 완료 후 서비스 제공자의 작업 완료 처리
 */
export async function completeService(req: Request, res: Response) {
  try {
    // 인증 확인
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        success: false,
        message: '로그인이 필요한 기능입니다.'
      });
    }

    const { orderId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '사용자 정보를 찾을 수 없습니다.'
      });
    }

    // 주문 정보 확인
    const order = await storage.getOrderById(parseInt(orderId));
    if (!order) {
      return res.status(404).json({
        success: false,
        message: '주문 정보를 찾을 수 없습니다.'
      });
    }

    // 서비스 제공자 확인
    if (order.providerId !== userId) {
      return res.status(403).json({
        success: false,
        message: '해당 주문을 완료할 권한이 없습니다.'
      });
    }

    // 유효한 주문 상태 확인
    if (order.status !== 'paid' && order.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: `현재 ${order.status} 상태인 주문은 완료 처리할 수 없습니다.`
      });
    }

    // 주문 상태 업데이트
    const now = new Date();
    const updatedOrder = await storage.updateOrder(order.id, {
      status: 'completed',
      completedAt: now
    });

    // 응답 반환
    res.json({
      success: true,
      order: updatedOrder,
      message: '서비스가 성공적으로 완료되었습니다.'
    });

  } catch (error: any) {
    console.error('서비스 완료 처리 오류:', error);
    res.status(400).json({
      success: false,
      message: error.message || '서비스 완료 처리 중 오류가 발생했습니다.'
    });
  }
}

/**
 * 사용자별 주문 내역 조회
 */
export async function getUserOrders(req: Request, res: Response) {
  try {
    // 인증 확인
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        success: false,
        message: '로그인이 필요한 기능입니다.'
      });
    }

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '사용자 정보를 찾을 수 없습니다.'
      });
    }

    // 사용자의 주문 내역 조회
    const orders = await storage.getOrdersByUserId(userId);

    // 서비스 및 제공자 정보 추가
    const ordersWithDetails = await Promise.all(orders.map(async (order) => {
      const service = await storage.getServiceById(order.serviceId);
      const provider = await storage.getUser(order.providerId);
      
      return {
        ...order,
        service: service ? {
          id: service.id,
          title: service.title,
          description: service.description,
          serviceType: service.serviceType,
          imageUrl: service.imageUrl
        } : null,
        provider: provider ? {
          id: provider.id,
          username: provider.username,
          fullName: provider.fullName,
          email: provider.email
        } : null
      };
    }));

    // 응답 반환
    res.json({
      success: true,
      orders: ordersWithDetails
    });

  } catch (error: any) {
    console.error('주문 내역 조회 오류:', error);
    res.status(400).json({
      success: false,
      message: error.message || '주문 내역 조회 중 오류가 발생했습니다.'
    });
  }
}

/**
 * 서비스 제공자별 주문 내역 조회
 */
export async function getProviderOrders(req: Request, res: Response) {
  try {
    // 인증 확인
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        success: false,
        message: '로그인이 필요한 기능입니다.'
      });
    }

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '사용자 정보를 찾을 수 없습니다.'
      });
    }

    // 서비스 제공자의 주문 내역 조회
    const orders = await storage.getOrdersByProviderId(userId);

    // 서비스 및 사용자 정보 추가
    const ordersWithDetails = await Promise.all(orders.map(async (order) => {
      const service = await storage.getServiceById(order.serviceId);
      const user = await storage.getUser(order.userId);
      
      return {
        ...order,
        service: service ? {
          id: service.id,
          title: service.title,
          description: service.description,
          serviceType: service.serviceType,
          imageUrl: service.imageUrl
        } : null,
        user: user ? {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          email: user.email
        } : null
      };
    }));

    // 응답 반환
    res.json({
      success: true,
      orders: ordersWithDetails
    });

  } catch (error: any) {
    console.error('제공자 주문 내역 조회 오류:', error);
    res.status(400).json({
      success: false,
      message: error.message || '제공자 주문 내역 조회 중 오류가 발생했습니다.'
    });
  }
}