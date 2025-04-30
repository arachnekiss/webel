import { Request, Response } from 'express';
import { z } from 'zod';
import { storage } from './storage';
import { Service, User } from '@shared/schema';
import { getChatResponse } from './openai';

// 엔지니어 매칭 요청 스키마
const matchRequestSchema = z.object({
  projectDescription: z.string().min(10).max(1000),
  skills: z.array(z.string()).optional(),
  budget: z.number().optional(),
  urgency: z.enum(['low', 'medium', 'high']).optional().default('medium'),
  location: z.object({
    lat: z.number(),
    long: z.number(),
    address: z.string().optional(),
  }).optional(),
  maxDistance: z.number().optional().default(50), // 기본값 50km
  remoteOnly: z.boolean().optional().default(false)
});

interface MatchResult {
  service: Service;
  user: User;
  matchScore: number;
  distance?: number;
  isRemote: boolean;
  skills: string[];
}

/**
 * 엔지니어 매칭 API
 * 프로젝트 설명, 스킬, 예산, 시급성, 위치를 기반으로 적합한 엔지니어를 매칭합니다.
 */
export async function matchEngineers(req: Request, res: Response) {
  try {
    // 요청 검증
    const matchRequest = matchRequestSchema.parse(req.body);
    const { projectDescription, skills, budget, urgency, location, maxDistance, remoteOnly } = matchRequest;

    // 서비스 및 엔지니어 정보 가져오기
    let services: Service[] = [];
    
    // 1. 위치 기반 필터링 (위치가 제공된 경우)
    if (location && !remoteOnly) {
      services = await storage.getServicesByLocation(location, maxDistance, 'engineer');
    } else {
      // 모든 엔지니어 서비스 가져오기
      services = await storage.getServicesByType('engineer');
    }

    // 2. 엔지니어 정보 가져오기
    const matchResults: MatchResult[] = [];
    
    for (const service of services) {
      if (!service.userId) continue;
      
      const user = await storage.getUser(service.userId);
      if (!user) continue;
      
      // 3. 매칭 점수 계산
      const matchScore = calculateMatchScore(
        service, 
        user, 
        projectDescription, 
        skills || [], 
        budget,
        urgency
      );
      
      // 서비스 정보에서 스킬 추출 (tags 필드가 문자열 배열인 경우)
      const serviceSkills = Array.isArray(service.tags) ? service.tags : [];
      
      // 결과 추가
      matchResults.push({
        service,
        user: { ...user, password: '***' } as User, // 비밀번호 제외
        matchScore,
        distance: (service as any).distance, // 위치 기반 검색에서 추가된 거리 정보
        isRemote: service.isRemote === true,
        skills: serviceSkills
      });
    }
    
    // 4. 매칭 점수가 높은 순으로 정렬
    matchResults.sort((a, b) => b.matchScore - a.matchScore);
    
    // 인증된 사용자만 AI 추천을 제공
    let aiRecommendation = null;
    if (req.isAuthenticated() && matchResults.length > 0) {
      // AI 추천 요청
      try {
        aiRecommendation = await generateAIRecommendation(
          projectDescription,
          matchResults.slice(0, 3) // 상위 3개 결과만 AI 분석에 사용
        );
      } catch (error) {
        console.error('AI 추천 생성 오류:', error);
        // AI 추천 실패 시에도 기본 결과는 반환
      }
    }
    
    // 응답 반환
    res.json({
      count: matchResults.length,
      engineers: matchResults.slice(0, 10), // 상위 10개 결과만 반환
      criteria: {
        projectDescription,
        skills,
        budget,
        urgency,
        location: location ? {
          lat: location.lat,
          long: location.long,
          address: location.address || '주소 정보 없음'
        } : null,
        maxDistance,
        remoteOnly
      },
      aiRecommendation
    });
  } catch (error: any) {
    console.error('엔지니어 매칭 오류:', error);
    res.status(400).json({ 
      message: error.message || '엔지니어 매칭 중 오류가 발생했습니다.' 
    });
  }
}

/**
 * 매칭 점수 계산 함수
 * 이 함수는 여러 요소를 고려하여 0-100 사이의 매칭 점수를 계산합니다.
 */
function calculateMatchScore(
  service: Service, 
  user: User, 
  projectDescription: string,
  requestedSkills: string[],
  budget?: number,
  urgency?: string
): number {
  let score = 50; // 기본 점수
  
  // 서비스 설명과 프로젝트 설명의 키워드 매칭
  if (service.description) {
    const serviceKeywords = extractKeywords(service.description.toLowerCase());
    const projectKeywords = extractKeywords(projectDescription.toLowerCase());
    
    // 키워드 일치도 계산
    const keywordMatch = projectKeywords.filter(k => 
      serviceKeywords.some(sk => sk.includes(k) || k.includes(sk))
    ).length;
    
    // 키워드 일치도에 따라 점수 추가 (최대 25점)
    score += Math.min(keywordMatch * 5, 25);
  }
  
  // 스킬 매칭 (최대 25점)
  if (requestedSkills.length > 0 && service.tags && Array.isArray(service.tags)) {
    const serviceSkills = service.tags.map(tag => tag.toLowerCase());
    const matchedSkills = requestedSkills.filter(skill => 
      serviceSkills.some(ss => ss.includes(skill.toLowerCase()) || skill.toLowerCase().includes(ss))
    );
    
    // 스킬 일치율에 따라 점수 추가
    const skillMatchRatio = matchedSkills.length / requestedSkills.length;
    score += skillMatchRatio * 25;
  }
  
  // 예산 고려 (있는 경우, 최대 ±10점)
  if (budget && service.price) {
    const priceDifference = Math.abs(service.price - budget) / budget;
    
    // 예산과 가격이 가까울수록 높은 점수
    if (priceDifference <= 0.1) {
      score += 10; // 10% 이내면 +10점
    } else if (priceDifference <= 0.2) {
      score += 5; // 20% 이내면 +5점
    } else if (priceDifference >= 0.5) {
      score -= 10; // 50% 이상 차이나면 -10점
    }
  }
  
  // 긴급성 고려 (최대 ±5점)
  if (urgency && service.availability) {
    const availabilityScore = {
      immediate: 3,
      within_week: 2,
      within_month: 1,
      not_specified: 0
    }[service.availability] || 0;
    
    const urgencyScore = {
      high: 3,
      medium: 2,
      low: 1
    }[urgency] || 2;
    
    // 긴급성과 가용성 매칭
    if (availabilityScore >= urgencyScore) {
      score += 5; // 가용성이 긴급성보다 좋거나 같으면 +5점
    } else {
      score -= 5; // 가용성이 긴급성보다 낮으면 -5점
    }
  }
  
  // 원격 작업 여부 (요청이 원격 전용인 경우)
  if (service.isRemote !== true && remoteOnly) {
    score -= 20; // 원격 작업 불가능한 엔지니어는 큰 페널티
  }
  
  // 경험 및 평판 고려 (최대 15점)
  if (service.rating && service.ratingCount) {
    // 평점 고려 (최대 10점)
    score += Math.min(service.rating * 2, 10);
    
    // 평가 횟수 고려 (최대 5점)
    score += Math.min(service.ratingCount / 2, 5);
  }
  
  // 최종 점수는 0-100 사이로 제한
  return Math.max(0, Math.min(100, score));
}

/**
 * 문자열에서 키워드를 추출하는 함수
 */
function extractKeywords(text: string): string[] {
  // 불용어(stopwords) 목록
  const stopwords = ['a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 
                     'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'as', 'of'];
  
  // 텍스트를 소문자로 변환하고 단어로 분리
  const words = text.toLowerCase()
    .replace(/[^\w\s가-힣]/g, '') // 특수문자 제거 (한글 포함)
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopwords.includes(word));
  
  // 중복 제거
  return Array.from(new Set(words));
}

/**
 * OpenAI를 사용하여 AI 추천을 생성하는 함수
 */
async function generateAIRecommendation(
  projectDescription: string,
  topMatches: MatchResult[]
): Promise<string | null> {
  if (!topMatches.length) return null;
  
  const messagesForAI = [
    { 
      role: "system", 
      content: "당신은 프로젝트에 가장 적합한 엔지니어를 추천하는 전문가입니다. 제공된 정보를 분석하여 가장 적합한 엔지니어를 추천하고 그 이유를 설명해주세요." 
    },
    { 
      role: "user", 
      content: `다음 프로젝트 설명을 바탕으로 가장 적합한 엔지니어를 추천해주세요:
      
프로젝트 설명: ${projectDescription}

추천 후보 엔지니어 목록:
${topMatches.map((match, index) => `
${index + 1}. ${match.user.username} (매칭 점수: ${match.matchScore})
- 전문 분야: ${match.service.title || '정보 없음'}
- 설명: ${match.service.description || '정보 없음'}
- 스킬: ${match.skills.join(', ') || '정보 없음'}
- 위치: ${match.distance ? `약 ${match.distance.toFixed(1)}km 거리` : (match.isRemote ? '원격 작업 가능' : '위치 정보 없음')}
`).join('\n')}

위 후보들 중에서 이 프로젝트에 가장 적합한 엔지니어를 선택하고, 그 이유를 설명해주세요. 응답은 한국어로 작성하고, 300자 이내로 요약해주세요.`
    }
  ];
  
  try {
    const aiResponse = await getChatResponse(messagesForAI);
    return aiResponse;
  } catch (error) {
    console.error('AI 추천 생성 오류:', error);
    return null;
  }
}

// 엔지니어 검색 API
export async function searchEngineers(req: Request, res: Response) {
  try {
    const searchSchema = z.object({
      query: z.string().optional(),
      skills: z.array(z.string()).optional(),
      serviceType: z.enum(['engineer', 'electronics', 'manufacturing', 'woodworking', 'metalworking', '3d_printing']).optional(),
      location: z.object({
        lat: z.number(),
        long: z.number()
      }).optional(),
      maxDistance: z.number().optional().default(50),
      remoteOnly: z.boolean().optional().default(false)
    });
    
    // URL 쿼리 파라미터 파싱
    const { 
      query, 
      skills, 
      serviceType = 'engineer', 
      location, 
      maxDistance = 50,
      remoteOnly = false
    } = searchSchema.parse({
      query: req.query.query as string,
      skills: req.query.skills ? (req.query.skills as string).split(',') : undefined,
      serviceType: req.query.serviceType as string,
      location: req.query.lat && req.query.long ? {
        lat: parseFloat(req.query.lat as string),
        long: parseFloat(req.query.long as string)
      } : undefined,
      maxDistance: req.query.maxDistance ? parseFloat(req.query.maxDistance as string) : undefined,
      remoteOnly: req.query.remoteOnly === 'true'
    });
    
    // 서비스 필터링
    let services: Service[] = [];
    
    // 1. 위치 기반 필터링
    if (location && !remoteOnly) {
      services = await storage.getServicesByLocation(
        { ...location, address: '' },
        maxDistance,
        serviceType
      );
    } else {
      // 서비스 타입으로 필터링
      services = await storage.getServicesByType(serviceType);
      
      // 원격 작업만 필터링
      if (remoteOnly) {
        services = services.filter(service => service.isRemote === true);
      }
    }
    
    // 2. 키워드 검색
    if (query) {
      const lowerQuery = query.toLowerCase();
      services = services.filter(service => 
        (service.title && service.title.toLowerCase().includes(lowerQuery)) ||
        (service.description && service.description.toLowerCase().includes(lowerQuery))
      );
    }
    
    // 3. 스킬 필터링
    if (skills && skills.length > 0) {
      services = services.filter(service => {
        if (!service.tags || !Array.isArray(service.tags)) return false;
        
        // 스킬 일치 여부 확인
        const serviceSkills = service.tags.map(tag => tag.toLowerCase());
        return skills.some(skill => 
          serviceSkills.some(ss => ss.includes(skill.toLowerCase()) || skill.toLowerCase().includes(ss))
        );
      });
    }
    
    // 엔지니어 정보 추가
    const results = await Promise.all(services.map(async (service) => {
      if (!service.userId) return null;
      
      const user = await storage.getUser(service.userId);
      if (!user) return null;
      
      // 비밀번호 제외
      const { password, ...userWithoutPassword } = user;
      
      return {
        service,
        user: userWithoutPassword,
        skills: Array.isArray(service.tags) ? service.tags : [],
        distance: (service as any).distance
      };
    }));
    
    // null 값 제거 및 거리순 정렬
    const filteredResults = results.filter(r => r !== null);
    if (location) {
      filteredResults.sort((a, b) => {
        const distA = a?.distance || Infinity;
        const distB = b?.distance || Infinity;
        return distA - distB;
      });
    }
    
    res.json({
      count: filteredResults.length,
      engineers: filteredResults,
      filters: {
        query,
        skills,
        serviceType,
        location,
        maxDistance,
        remoteOnly
      }
    });
  } catch (error: any) {
    console.error('엔지니어 검색 오류:', error);
    res.status(400).json({ 
      message: error.message || '엔지니어 검색 중 오류가 발생했습니다.' 
    });
  }
}