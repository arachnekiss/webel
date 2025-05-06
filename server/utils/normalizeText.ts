/**
 * 다국어 텍스트 정규화 유틸리티
 * 
 * 이 모듈은 한국어(ko), 영어(en), 일본어(ja) 텍스트를 검색에 적합한 형태로 정규화하는 기능을 제공합니다.
 * PostgreSQL의 정규화 함수와 동일한 로직을 JavaScript로 구현하여 클라이언트-서버 일관성을 유지합니다.
 * 
 * 중국어(zh)와 스페인어(es) 지원은 제거되었습니다. 
 * 언어 코드 참고: 일본어는 ISO 코드 'ja'를 사용하지만, 시스템 내부적으로는 'jp'로도 참조될 수 있습니다.
 */

// 한글 정규화
export function normalizeKorean(text: string): string {
  if (!text) return '';
  
  // 소문자 변환, 공백 정규화, 한글 정규화(NFC)
  return text.toLowerCase()
    .normalize('NFC')
    .replace(/\s+/g, ' ');
}

// 영어 정규화
export function normalizeEnglish(text: string): string {
  if (!text) return '';
  
  // 소문자 변환, 특수문자 제거, 공백 정규화
  return text.toLowerCase()
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, ' ');
}

// 일본어 정규화
export function normalizeJapanese(text: string): string {
  if (!text) return '';
  
  // 일본어 문자 정규화, 소문자 변환
  return text.toLowerCase()
    .normalize('NFKC')
    .replace(/\s+/g, ' ');
}

/**
 * 언어 코드에 따라 적절한 정규화 함수를 선택하여 텍스트 정규화
 * @param text 정규화할 텍스트
 * @param lang 언어 코드 (ko, en, ja)
 * @returns 정규화된 텍스트
 */
export function normalizeText(text: string, lang: string = 'en'): string {
  if (!text) return '';
  
  switch (lang.toLowerCase()) {
    case 'ko':
      return normalizeKorean(text);
    case 'ja':
      return normalizeJapanese(text);
    case 'en':
    default:
      return normalizeEnglish(text);
  }
}

/**
 * 브라우저의 Accept-Language 헤더에서 언어 코드 추출
 * @param acceptLanguage Accept-Language 헤더 문자열
 * @returns 감지된 언어 코드 (지원하는 언어가 없을 경우 'en')
 */
export function detectLanguageFromHeader(acceptLanguage: string | undefined): string {
  if (!acceptLanguage) return 'en';
  
  // 지원하는 언어 목록 - 한국어, 영어, 일본어만 지원
  const supportedLanguages = ['ko', 'en', 'ja'];
  
  // Accept-Language 헤더 파싱
  // 예: "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7"
  const languages = acceptLanguage.split(',')
    .map(lang => {
      const [langCode, weight] = lang.trim().split(';q=');
      return {
        code: langCode.split('-')[0], // 'ko-KR' -> 'ko'
        weight: weight ? parseFloat(weight) : 1.0
      };
    })
    .sort((a, b) => b.weight - a.weight); // 가중치 내림차순 정렬
  
  // 지원하는 언어 중 가장 높은 가중치를 가진 언어 선택
  for (const lang of languages) {
    if (supportedLanguages.includes(lang.code)) {
      return lang.code;
    }
  }
  
  // 기본값은 영어
  return 'en';
}

/**
 * 다국어 텍스트 컬렉션에서 검색 점수 계산
 * @param item 검색 대상 항목
 * @param query 검색어
 * @param lang 언어 코드
 * @param weights 필드별 가중치
 * @returns 계산된 검색 점수
 */
export function calculateSearchScore(
  item: { title: string; description: string; tags?: string[] },
  query: string,
  lang: string = 'en',
  weights = { title: 3, description: 1, tags: 2 }
): number {
  // 검색어 정규화
  const normalizedQuery = normalizeText(query, lang);
  
  // 제목 점수 계산
  const titleScore = textSimilarity(
    normalizeText(item.title, lang),
    normalizedQuery
  ) * weights.title;
  
  // 설명 점수 계산
  const descScore = textSimilarity(
    normalizeText(item.description, lang),
    normalizedQuery
  ) * weights.description;
  
  // 태그 점수 계산
  let tagScore = 0;
  if (item.tags && item.tags.length > 0) {
    const normalizedTags = item.tags.map(tag => normalizeText(tag, lang));
    const tagMatches = normalizedTags.reduce((score, tag) => 
      score + textSimilarity(tag, normalizedQuery), 0);
    tagScore = (tagMatches / item.tags.length) * weights.tags;
  }
  
  return titleScore + descScore + tagScore;
}

/**
 * 두 텍스트 간의 유사도 계산 (간단한 포함 여부 기반)
 * @param text 정규화된 원본 텍스트
 * @param query 정규화된 검색어
 * @returns 유사도 점수 (0-1)
 */
function textSimilarity(text: string, query: string): number {
  if (!text || !query) return 0;
  
  // 검색어가 텍스트에 완전히 일치하는 경우
  if (text === query) return 1;
  
  // 검색어가 텍스트에 포함되는 경우
  if (text.includes(query)) {
    // 검색어 길이와 위치에 따라 점수 조정
    const position = text.indexOf(query) / text.length;
    const lengthRatio = query.length / text.length;
    
    // 시작 부분에 있을수록, 길이 비율이 클수록 높은 점수
    return 0.8 * (1 - position) * lengthRatio;
  }
  
  // 검색어의 각 단어가 텍스트에 포함되는지 확인
  const queryWords = query.split(' ').filter(w => w.length > 0);
  if (queryWords.length > 1) {
    let wordMatches = 0;
    for (const word of queryWords) {
      if (text.includes(word)) {
        wordMatches++;
      }
    }
    return 0.6 * (wordMatches / queryWords.length);
  }
  
  return 0;
}