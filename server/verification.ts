import { Request, Response } from "express";
import { storage } from "./storage";
import crypto from "crypto";

// 실제 SMS 발송 및 계좌 확인 대신 테스트용 로직
const verificationCodes: { [key: string]: { code: string; expires: Date } } = {};
const verifiedUsers = new Set<number>();
const verifiedBanks = new Set<number>();

/**
 * 인증번호 요청 처리
 * SMS 발송 기능을 구현해야 함 (현재는 모의 구현)
 */
export async function requestVerification(req: Request, res: Response) {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "인증이 필요합니다" });
    }

    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ message: "전화번호를 입력해주세요" });
    }

    // 전화번호 형식 검증
    const phoneRegex = /^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({ message: "유효한 전화번호 형식이 아닙니다" });
    }

    // 인증번호 생성 (6자리 숫자)
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 만료 시간 설정 (3분)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 3);
    
    // 사용자별 인증번호 저장
    verificationCodes[`${req.user.id}_${phoneNumber}`] = {
      code: verificationCode,
      expires: expiresAt
    };

    console.log(`인증번호 생성: ${verificationCode} (만료: ${expiresAt})`);
    
    // 실제 구현에서는 여기서 SMS 발송 API 호출
    // SMS API 예시: await sendSMS(phoneNumber, `[Webel] 인증번호: ${verificationCode}. 3분 이내에 입력해주세요.`);

    return res.status(200).json({ message: "인증번호가 발송되었습니다", success: true });
  } catch (error) {
    console.error("인증번호 요청 오류:", error);
    return res.status(500).json({ message: "서버 오류가 발생했습니다" });
  }
}

/**
 * 휴대폰 인증번호 검증
 */
export async function verifyPhone(req: Request, res: Response) {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "인증이 필요합니다" });
    }

    const { phoneNumber, verificationCode } = req.body;

    if (!phoneNumber || !verificationCode) {
      return res.status(400).json({ message: "전화번호와 인증번호를 모두 입력해주세요" });
    }

    const key = `${req.user.id}_${phoneNumber}`;
    const storedVerification = verificationCodes[key];

    if (!storedVerification) {
      return res.status(400).json({ message: "인증번호를 요청하세요" });
    }

    // 인증번호 만료 확인
    if (new Date() > storedVerification.expires) {
      delete verificationCodes[key];
      return res.status(400).json({ message: "인증번호가 만료되었습니다" });
    }

    // 인증번호 검증
    if (storedVerification.code !== verificationCode) {
      return res.status(400).json({ message: "인증번호가 일치하지 않습니다" });
    }

    // 인증 성공 처리
    verifiedUsers.add(req.user.id);
    delete verificationCodes[key];

    // 실제 구현에서는 사용자 DB에 인증 상태 업데이트
    // await storage.updateUser(req.user.id, { phoneVerified: true, phoneNumber });

    return res.status(200).json({ message: "휴대폰 인증이 완료되었습니다", success: true });
  } catch (error) {
    console.error("휴대폰 인증 오류:", error);
    return res.status(500).json({ message: "서버 오류가 발생했습니다" });
  }
}

/**
 * 계좌 등록 및 확인
 */
export async function registerBankAccount(req: Request, res: Response) {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "인증이 필요합니다" });
    }

    // 휴대폰 인증 여부 확인
    if (!verifiedUsers.has(req.user.id)) {
      return res.status(400).json({ message: "먼저 휴대폰 인증을 완료해주세요" });
    }

    const { bankName, accountNumber, accountHolder } = req.body;

    if (!bankName || !accountNumber || !accountHolder) {
      return res.status(400).json({ message: "은행명, 계좌번호, 예금주명을 모두 입력해주세요" });
    }

    // 계좌번호 형식 검증
    const cleanedAccountNumber = accountNumber.replace(/-/g, '');
    if (!/^\d+$/.test(cleanedAccountNumber) || cleanedAccountNumber.length < 10) {
      return res.status(400).json({ message: "유효한 계좌번호를 입력해주세요" });
    }

    // 실제 구현에서는 계좌 유효성 검증 API 호출
    // const isValidAccount = await verifyBankAccount(bankName, accountNumber, accountHolder);
    // if (!isValidAccount) {
    //   return res.status(400).json({ message: "유효하지 않은 계좌정보입니다" });
    // }

    // 인증 성공 처리
    verifiedBanks.add(req.user.id);

    // 실제 구현에서는 사용자 DB에 계좌 정보 업데이트
    // await storage.updateUser(req.user.id, { 
    //   bankVerified: true, 
    //   bankName,
    //   accountNumber,
    //   accountHolder
    // });

    return res.status(200).json({ 
      message: "계좌 등록이 완료되었습니다", 
      success: true 
    });
  } catch (error) {
    console.error("계좌 등록 오류:", error);
    return res.status(500).json({ message: "서버 오류가 발생했습니다" });
  }
}

/**
 * 사용자 인증 상태 확인
 */
export async function getVerificationStatus(req: Request, res: Response) {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "인증이 필요합니다" });
    }

    // 인증 상태 조회
    const phoneVerified = verifiedUsers.has(req.user.id);
    const bankVerified = verifiedBanks.has(req.user.id);

    // 실제 구현에서는 DB에서 사용자 인증 정보 조회
    // const user = await storage.getUser(req.user.id);
    // const phoneVerified = user.phoneVerified || false;
    // const bankVerified = user.bankVerified || false;

    return res.status(200).json({
      phoneVerified,
      bankVerified
    });
  } catch (error) {
    console.error("인증 상태 조회 오류:", error);
    return res.status(500).json({ message: "서버 오류가 발생했습니다" });
  }
}