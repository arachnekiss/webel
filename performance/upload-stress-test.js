import http from 'k6/http';
import { sleep, check } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { randomString } from 'https://jslib.k6.io/k6-utils/1.1.0/index.js';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.1.0/index.js';

// 커스텀 메트릭 정의
const errorRate = new Rate('upload_error_rate');
const uploadTime = new Trend('upload_response_time');
const tusCreateTime = new Trend('tus_create_time');
const tusPatchTime = new Trend('tus_patch_time');

// 테스트 설정
export const options = {
  // TUS 업로드는 리소스를, 소요되므로 더 보수적인 설정 사용
  stages: [
    { duration: '30s', target: 5 },  // 30초 동안 5명의 가상 사용자로 램프업
    { duration: '2m', target: 5 },   // 2분 동안 5명의 가상 사용자 유지
    { duration: '30s', target: 0 },  // 30초 동안 0명으로 램프다운
  ],
  thresholds: {
    // 오류율 임계값
    'upload_error_rate': ['rate<0.1'], // 10% 미만 오류율 목표
    // 업로드 시간 임계값
    'upload_response_time': ['p(95)<10000'], // 95%의 업로드가 10초 이내 완료
    'tus_create_time': ['p(95)<1000'], // TUS 생성 요청 시간
    'tus_patch_time': ['p(95)<5000'], // TUS 패치(데이터 업로드) 시간
    'http_req_duration': ['p(95)<5000'], // 전체 요청 시간
  },
};

// 가짜 파일 데이터 생성 함수
function generateFakeFileData(sizeKB) {
  return randomString(sizeKB * 1024); // 단순한 랜덤 문자열
}

// TUS 프로토콜을 사용한 파일 업로드 시뮬레이션
export default function() {
  // 테스트용 파일 메타데이터
  const fileSize = randomIntBetween(10, 500) * 1024; // 10KB ~ 500KB 랜덤 사이즈
  const fileName = `test-${randomString(8)}.jpg`;
  const fileType = 'image/jpeg';
  
  // 파일 메타데이터를 base64 인코딩
  const fileMetadata = btoa(`filename ${fileName}\nfiletype ${fileType}`);
  
  // 1. TUS 프로토콜 업로드 생성 요청
  const createStart = new Date().getTime();
  const createResponse = http.post('http://localhost:5000/uploads/', null, {
    headers: {
      'Tus-Resumable': '1.0.0',
      'Upload-Length': fileSize.toString(),
      'Upload-Metadata': `filename ${fileMetadata}`,
      'Content-Type': 'application/offset+octet-stream',
    },
  });
  const createTime = new Date().getTime() - createStart;
  
  // 응답 확인
  const createSuccess = check(createResponse, {
    'create TUS upload status is 201': (r) => r.status === 201,
    'Location header exists': (r) => r.headers['Location'] !== undefined,
  });
  
  // 생성 시간 기록
  tusCreateTime.add(createTime);
  
  if (!createSuccess) {
    errorRate.add(true);
    console.log(`Failed to create TUS upload: ${createResponse.status} ${createResponse.body}`);
    return;
  }
  
  // 생성된 업로드 위치
  const uploadLocation = createResponse.headers['Location'];
  const uploadId = uploadLocation.split('/').pop();
  
  // 2. 파일 데이터 업로드 (PATCH 요청)
  // 실제 TUS 구현에서는 chunk로 나누어 전송하지만,
  // 테스트를 단순화하기 위해 여기서는 한 번에 전송
  const fileData = generateFakeFileData(Math.min(fileSize / 1024, 100)); // 최대 100KB로 제한
  
  const patchStart = new Date().getTime();
  const patchResponse = http.patch(uploadLocation, fileData, {
    headers: {
      'Tus-Resumable': '1.0.0',
      'Upload-Offset': '0',
      'Content-Type': 'application/offset+octet-stream',
    },
  });
  const patchTime = new Date().getTime() - patchStart;
  
  // 응답 확인
  const patchSuccess = check(patchResponse, {
    'PATCH request status is 204': (r) => r.status === 204,
    'Upload-Offset header exists': (r) => r.headers['Upload-Offset'] !== undefined,
  });
  
  // PATCH 시간 기록
  tusPatchTime.add(patchTime);
  
  if (!patchSuccess) {
    errorRate.add(true);
    console.log(`Failed to upload file data: ${patchResponse.status}`);
    return;
  }
  
  // 총 업로드 시간 기록
  uploadTime.add(createTime + patchTime);
  
  // 업로드 완료 후 파일 정보 확인 요청 (선택적)
  const fileInfoResponse = http.get(`http://localhost:5000/api/tus/status/${uploadId}`);
  check(fileInfoResponse, {
    'file info request successful': (r) => r.status === 200,
  });
  
  // 사용자 행동 시뮬레이션
  sleep(randomIntBetween(1, 3));
}

// 테스트 시작 전 초기화
export function setup() {
  // 서버가 실행 중인지 확인
  const healthCheck = http.get('http://localhost:5000/api/resources?limit=1');
  if (healthCheck.status !== 200) {
    throw new Error('API server is not responding correctly');
  }
  
  console.log('Upload stress test is starting...');
  return {};
}

// 테스트 완료 후 정리
export function teardown(data) {
  console.log('Upload stress test completed.');
}