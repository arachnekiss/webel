import http from 'k6/http';
import { sleep, check } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.1.0/index.js';

// 커스텀 메트릭 정의
const errorRate = new Rate('error_rate');
const apiResponseTime = new Trend('api_response_time');
const resourcesRequests = new Counter('resources_requests');
const servicesRequests = new Counter('services_requests');

// 테스트 설정
export const options = {
  stages: [
    { duration: '30s', target: 30 }, // 30초 동안 30명의 가상 사용자로 램프업
    { duration: '1m', target: 30 },  // 1분 동안 30명의 가상 사용자 유지
    { duration: '30s', target: 0 },  // 30초 동안 0명으로 램프다운
  ],
  thresholds: {
    // 오류율 임계값
    'error_rate': ['rate<0.05'], // 5% 미만 오류율 목표
    // 응답 시간 임계값
    'http_req_duration': ['p(95)<200'], // 95%의 요청이 200ms 이내 응답
    'api_response_time{endpoint:resources}': ['p(95)<200'],
    'api_response_time{endpoint:services}': ['p(95)<200'],
  },
};

// API 엔드포인트 목록
const API_ENDPOINTS = [
  { name: 'resources', url: '/api/resources?limit=10' },
  { name: 'services', url: '/api/services?limit=10' },
  { name: 'resources_hardware', url: '/api/resources/type/hardware_design?limit=10' },
  { name: 'resources_software', url: '/api/resources/type/software?limit=10' },
  { name: 'resources_3d_model', url: '/api/resources/type/3d_model?limit=10' },
  { name: 'services_3d_printing', url: '/api/services/type/3d_printing?limit=10' },
  { name: 'services_engineer', url: '/api/services/type/engineer?limit=10' },
  { name: 'services_manufacturing', url: '/api/services/type/manufacturing?limit=10' },
];

// 기본 테스트 함수
export default function() {
  // 랜덤하게 API 엔드포인트 선택
  const endpoint = API_ENDPOINTS[randomIntBetween(0, API_ENDPOINTS.length - 1)];
  const url = `http://localhost:5000${endpoint.url}`;
  
  // API 요청 보내기
  const startTime = new Date().getTime();
  const response = http.get(url);
  const responseTime = new Date().getTime() - startTime;
  
  // 응답 결과 검사
  const checkResult = check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 1000ms': (r) => r.timings.duration < 1000,
  });
  
  // 메트릭 기록
  errorRate.add(!checkResult);
  apiResponseTime.add(responseTime, { endpoint: endpoint.name });
  
  // 엔드포인트별 카운터 증가
  if (endpoint.name.startsWith('resources')) {
    resourcesRequests.add(1);
  } else if (endpoint.name.startsWith('services')) {
    servicesRequests.add(1);
  }
  
  // 사용자 행동 시뮬레이션 (페이지 탐색 등)
  sleep(randomIntBetween(1, 5));
}

// 테스트가 시작되기 전 초기화 함수
export function setup() {
  // 서버가 실행 중인지 확인
  const healthCheck = http.get('http://localhost:5000/api/resources?limit=1');
  if (healthCheck.status !== 200) {
    throw new Error('API server is not responding correctly');
  }
  
  console.log('Load test is starting...');
  return {};
}

// 테스트 완료 후 정리 함수
export function teardown(data) {
  console.log('Load test completed.');
}