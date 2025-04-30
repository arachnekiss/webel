import { Request, Response } from 'express';
import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

export async function deleteUserByUsername(req: Request, res: Response) {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isProduction) {
      return res.status(403).json({ message: "이 기능은 개발 환경에서만 사용 가능합니다." });
    }
    
    const { username } = req.params;
    
    // 사용자 조회
    const [user] = await db.select().from(users).where(eq(users.username, username));
    
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }
    
    // 사용자 삭제
    await db.delete(users).where(eq(users.id, user.id));
    
    res.status(200).json({ message: `사용자 '${username}'이(가) 삭제되었습니다.` });
  } catch (error) {
    console.error('사용자 삭제 중 오류 발생:', error);
    res.status(500).json({ message: "사용자 삭제 중 오류가 발생했습니다." });
  }
}