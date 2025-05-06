import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';

// 다국어 검색 성능 측정 스크립트
// 
// 이 스크립트는 다국어 검색 API의 성능을 측정합니다.
// Stage 3 요구사항에 맞게 p95 응답 시간이 50ms 이하인지 확인합니다.

// 검색 응답 시간 측정을 위한 커스텀 메트릭
const searchResponseTime = new Trend('search_response_time', true);

export const options = {
  stages: [
    { duration: '10s', target: 1 },    // 1명 사용자로 준비 단계
    { duration: '30s', target: 5 },    // 5명 사용자로 점차 증가
    { duration: '1m', target: 10 },    // 10명 사용자로 1분간 유지
    { duration: '30s', target: 20 },   // 20명 사용자로 부하 테스트
    { duration: '30s', target: 30 },   // 30명 사용자로 최대 부하 테스트
    { duration: '20s', target: 0 },    // 정리 단계
  ],
  thresholds: {
    // p95 응답 시간이 50ms 이하여야 함
    'search_response_time': ['p(95)<50'],
    // HTTP 오류 없이 모든 요청이 성공해야 함
    'http_req_failed': ['rate<0.01'],
    // 총 요청 수행 시간 제한
    'http_req_duration': ['p(95)<200', 'p(99)<500'],
  },
};

// 테스트 데이터: 다양한 언어의 검색 쿼리
const searchQueries = [
  { lang: 'ko', query: '엔지니어링', desc: 'Korean - Engineering' },
  { lang: 'en', query: 'engineering', desc: 'English - Engineering' },
  { lang: 'ja', query: 'エンジニアリング', desc: 'Japanese - Engineering' },
  { lang: 'zh', query: '工程', desc: 'Chinese - Engineering' },
  { lang: 'es', query: 'ingeniería', desc: 'Spanish - Engineering' },
  { lang: 'ko', query: '소프트웨어', desc: 'Korean - Software' },
  { lang: 'en', query: 'software', desc: 'English - Software' },
  { lang: 'en', query: 'open source', desc: 'English - Open Source' },
  { lang: 'ko', query: '오픈소스', desc: 'Korean - Open Source' },
  { lang: 'auto', query: 'hardware', desc: 'Auto - Hardware' },
];

export default function () {
  // 무작위 쿼리 선택
  const queryIndex = Math.floor(Math.random() * searchQueries.length);
  const { lang, query, desc } = searchQueries[queryIndex];
  
  // 검색 API 요청
  const searchUrl = `http://localhost:5000/api/search?q=${encodeURIComponent(query)}&lang=${lang}&limit=5`;
  const response = check(http.get(searchUrl), {
    'search API is responsive': (r) => r.status === 200,
    'response has expected format': (r) => r.json().hasOwnProperty('resources') && r.json().hasOwnProperty('services'),
  });
  
  // 응답 시간 기록
  searchResponseTime.add(response.timings.duration);
  
  // 로그 출력
  if (__ENV.VERBOSE) {
    console.log(`Search "${desc}" - Response time: ${response.timings.duration}ms`);
  }
  
  // 약간의 지연 시간
  sleep(Math.random() * 3);
}