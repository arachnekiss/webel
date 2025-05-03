import { QueryClient, QueryFunction } from "@tanstack/react-query";

// 네트워크 상태 감지 함수
const getNetworkStatus = (): 'online' | 'offline' | 'slow' => {
  if (!navigator.onLine) return 'offline';
  
  // 네트워크 정보 API 사용 가능한 경우 연결 상태 확인
  // @ts-ignore - 일부 브라우저에서 지원하지 않는 API
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (connection) {
    // 느린 연결 감지 (2G 또는 저속 연결)
    // @ts-ignore
    if (connection.effectiveType === '2g' || connection.downlink < 0.5) {
      return 'slow';
    }
  }
  return 'online';
};

// API 응답 처리를 위한 유틸리티 함수
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorText;
    try {
      // JSON 응답인지 확인하여 처리
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await res.json();
        errorText = errorData.message || errorData.error || JSON.stringify(errorData);
      } else {
        errorText = await res.text() || res.statusText;
      }
    } catch (e) {
      // 파싱 오류 발생 시 기본 상태 텍스트 사용
      errorText = res.statusText;
    }
    
    throw new Error(`${res.status}: ${errorText}`);
  }
}

// 로깅 유틸리티 함수 (개발 환경에서만 로그 표시)
const logRequest = (method: string, url: string, data?: unknown) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🚀 API ${method}: ${url}`, data ? { data } : '');
  }
};

// 로깅 유틸리티 함수 (개발 환경에서만 로그 표시)
const logResponse = (method: string, url: string, response: any) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`✅ API ${method} Response: ${url}`, response);
  }
};

// 로깅 유틸리티 함수 (개발 환경에서만 로그 표시)
const logError = (method: string, url: string, error: any) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error(`❌ API ${method} Error: ${url}`, error);
  }
};

interface ApiRequestOptions {
  isFormData?: boolean;
  onProgress?: (progress: number) => void;
  timeout?: number;
  retry?: number;
  headers?: Record<string, string>;
}

// 성능 모니터링 모듈 가져오기
import { measureApiCall } from './performance';

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  options?: ApiRequestOptions | boolean
): Promise<Response> {
  // 성능 측정 래핑
  return measureApiCall(`${method} ${url}`, async () => {
    // 옵션 초기화
    const opts: ApiRequestOptions = typeof options === 'boolean' 
      ? { isFormData: options } 
      : options || {};
      
    const {
      isFormData = false,
      onProgress,
      timeout = 30000, // 기본 30초 타임아웃
      retry = 0,
      headers: customHeaders = {}
    } = opts;
    
    const headers: Record<string, string> = { ...customHeaders };
    let body: string | FormData | undefined = undefined;

    logRequest(method, url, data);

    // 요청 바디 준비
    if (data) {
      if (isFormData && data instanceof FormData) {
        // FormData는 자동으로 적절한 Content-Type 헤더를 설정
        body = data;
      } else {
        headers["Content-Type"] = "application/json";
        try {
          body = JSON.stringify(data);
        } catch (error) {
          logError(method, url, 'JSON 직렬화 오류');
          throw new Error('JSON 직렬화 오류: 데이터를 JSON으로 변환할 수 없습니다.');
        }
      }
    }

    // Implement retry logic
    const executeRequest = async (attempt: number = 0): Promise<Response> => {
      try {
        // XMLHttpRequest를 사용하여 업로드 진행률 처리
        if (onProgress && method.toUpperCase() === 'POST' && data instanceof FormData) {
          return await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open(method, url);
            xhr.withCredentials = true;
            
            // 커스텀 헤더 추가
            Object.entries(headers).forEach(([key, value]) => {
              xhr.setRequestHeader(key, value);
            });
            
            // 타임아웃 설정
            xhr.timeout = timeout;
            
            // 진행률 이벤트 리스너 추가
            xhr.upload.addEventListener('progress', (event) => {
              if (event.lengthComputable) {
                const progress = (event.loaded / event.total) * 100;
                onProgress(progress);
              }
            });
            
            xhr.onload = () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                const response = new Response(xhr.response, {
                  status: xhr.status,
                  statusText: xhr.statusText,
                  headers: new Headers({
                    'Content-Type': xhr.getResponseHeader('Content-Type') || 'application/json'
                  })
                });
                resolve(response);
              } else {
                reject(new Error(`${xhr.status}: ${xhr.statusText}`));
              }
            };
            
            xhr.ontimeout = () => {
              reject(new Error('요청 시간이 초과되었습니다.'));
            };
            
            xhr.onerror = () => {
              reject(new Error('네트워크 요청 실패'));
            };
            
            xhr.send(body as FormData);
          });
        } else {
          // 일반적인 fetch 사용
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeout);
          
          try {
            const res = await fetch(url, {
              method,
              headers,
              body,
              credentials: "include",
              signal: controller.signal,
            });
            
            clearTimeout(timeoutId);
            await throwIfResNotOk(res);
            return res;
          } catch (error) {
            clearTimeout(timeoutId);
            throw error;
          }
        }
      } catch (error) {
        // 에러 발생 시 재시도 로직
        if (attempt < retry) {
          // 지수 백오프 (exponential backoff) 적용
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
          logRequest(method, url, `요청 실패, ${delay}ms 후 재시도 (${attempt + 1}/${retry})`);
          
          await new Promise(resolve => setTimeout(resolve, delay));
          return executeRequest(attempt + 1);
        }
        
        // 재시도 횟수 초과 또는 재시도 없음
        logError(method, url, error);
        throw error;
      }
    };
    
    return executeRequest();
  }, { method, dataSize: data ? JSON.stringify(data).length : 0 });
}

// API 타임아웃 결정 함수
const determineTimeout = (url: string): number => {
  // 리소스나 서비스 관련 API는 더 긴 타임아웃 적용
  if (url.includes('/services/') || url.includes('/resources/')) {
    return 30000; // 30초
  }
  
  // 이미지나 파일 업로드는 더 긴 타임아웃 적용
  if (url.includes('/upload')) {
    return 60000; // 60초
  }
  
  // 기본 API는 짧은 타임아웃 적용
  return 15000; // 15초
};

// 캐시 수명 결정 함수
const determineStaleTime = (url: string): number => {
  // 정적 리소스 및 타입별 리소스는 매우 오래 캐싱 (업데이트가 적음)
  if (url.includes('/static/') || url.includes('/assets/')) {
    return 1000 * 60 * 60 * 24; // 24시간
  }
  
  // 카테고리별 리소스는 오래 캐싱 (변경이 적은 데이터)
  if (url.includes('/resources/type/') || url.includes('/services/type/')) {
    return 1000 * 60 * 60; // 60분
  }
  
  // 리소스 목록 및 서비스 목록 (특히 메인 페이지에 표시되는)
  if (url.match(/\/resources(\?|$)/) || url.match(/\/services(\?|$)/)) {
    return 1000 * 60 * 15; // 15분
  }
  
  // 사용자 관련 데이터는 상대적으로 짧게 캐싱
  if (url.includes('/user') || url.includes('/account')) {
    return 1000 * 60 * 5; // 5분
  }
  
  // 주문 및 트랜잭션 정보는 빠르게 업데이트 필요
  if (url.includes('/orders') || url.includes('/transactions')) {
    return 1000 * 60 * 2; // 2분
  }
  
  // 기본값
  return 1000 * 60 * 10; // 10분
};

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey, meta }) => {
    // 쿼리 키가 문자열인지 확인하고 안전하게 처리
    const queryKeyStr = typeof queryKey[0] === 'string' ? queryKey[0] : String(queryKey[0]);
    
    // 성능 측정을 위한 래핑
    return measureApiCall(`GET ${queryKeyStr}`, async () => {
      try {
        const timeoutMs = meta?.timeout || determineTimeout(queryKeyStr);
        
        logRequest('GET', queryKeyStr);
        
        // 컨트롤러와 타임아웃 설정
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs as number);
        
        try {
          // HeadersInit 타입과 호환되는 헤더 객체 생성
          const requestHeaders: Record<string, string> | undefined = 
            meta?.headers && Object.keys(meta.headers).length > 0 
              ? Object.entries(meta.headers).reduce((acc, [key, value]) => {
                  if (typeof value === 'string') {
                    acc[key] = value;
                  }
                  return acc;
                }, {} as Record<string, string>)
              : undefined;
          
          const res = await fetch(queryKeyStr, {
            credentials: "include",
            signal: controller.signal,
            headers: requestHeaders,
          });
          
          clearTimeout(timeoutId);
          
          // 401 처리 (인증 실패)
          if (unauthorizedBehavior === "returnNull" && res.status === 401) {
            return null;
          }
          
          // 응답 검증
          await throwIfResNotOk(res);
          
          // 응답 데이터 파싱
          try {
            const data = await res.json();
            logResponse('GET', queryKeyStr, data);
            return data;
          } catch (jsonError) {
            logError('GET', queryKeyStr, 'JSON 파싱 오류');
            throw new Error("응답을 처리하는 중 오류가 발생했습니다: 유효하지 않은 JSON 데이터");
          }
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
      } catch (error) {
        // 오류 처리 및 가독성 있는 에러 메시지 생성
        let friendlyError = error;
        
        if (error instanceof DOMException && error.name === "AbortError") {
          friendlyError = new Error("요청 시간이 초과되었습니다. 네트워크 연결을 확인해주세요.");
        } else if (error instanceof TypeError && error.message.includes("fetch")) {
          friendlyError = new Error("네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요.");
        }
        
        logError('GET', String(queryKey[0]), friendlyError);
        throw friendlyError;
      }
    }, { queryKey: queryKey as string[], metaOptions: meta });
  };

/**
 * 애플리케이션에서 자주 사용되는 데이터를 미리 캐싱하기 위한 함수들
 */

// 카테고리별 데이터를 미리 캐싱하기 위한 프리페치 함수
export async function prefetchCategories() {
  try {
    const categoriesToPrefetch = [
      '/api/resources/type/hardware_design',
      '/api/resources/type/software',
      '/api/resources/type/ai_model',
      '/api/resources/type/3d_model',
      '/api/resources/type/free_content',
      '/api/resources/type/flash_game',
      '/api/services/type/3d_printing',
      '/api/services/type/engineer',
      '/api/services/type/manufacturing'
    ];
    
    // 모든 카테고리를 병렬로 프리페치하되 네트워크 부하를 분산하기 위해 약간의 지연 추가
    return Promise.all(
      categoriesToPrefetch.map((category, index) => 
        new Promise<void>((resolve) => {
          // 요청을 100ms 간격으로 분산 (명시적 숫자 타입 지정)
          setTimeout(() => {
            queryClient.prefetchQuery({
              queryKey: [category],
              staleTime: determineStaleTime(category), // 동적으로 캐시 수명 결정
            }).then(() => resolve());
          }, index * 100);
        })
      )
    );
  } catch (error) {
    logError('PREFETCH', 'categories', error);
    // 오류 발생 시 빈 프로미스 반환
    return Promise.resolve();
  }
}

// 사용자 데이터 및 중요 초기 데이터 프리페치
export async function prefetchInitialData() {
  try {
    // 중요 초기 데이터 (유저, 홈화면 필수 데이터 등)
    const initialDataToFetch = [
      '/api/user',
      '/api/resources?limit=6', // 홈화면 인기 리소스
      '/api/services?limit=6'   // 홈화면 인기 서비스
    ];
    
    return Promise.all(
      initialDataToFetch.map(endpoint => 
        queryClient.prefetchQuery({
          queryKey: [endpoint],
          staleTime: determineStaleTime(endpoint),
        })
      )
    );
  } catch (error) {
    logError('PREFETCH', 'initialData', error);
    // 에러가 발생해도 Promise.all 형태의 결과를 반환
    return Promise.resolve([]);
  }
}

/**
 * 최적화된 데이터 프리로딩 시스템
 * 사용자의 상호작용과 네트워크 상태에 따라 지능적으로 데이터를 미리 로드합니다.
 */

// 현재 네트워크 연결 상태 기반으로 프리로딩 전략 결정
const getPreloadStrategy = (): 'aggressive' | 'moderate' | 'conservative' => {
  const networkStatus = getNetworkStatus();
  
  // 오프라인 또는 느린 연결에서는 최소한의 데이터만 로드
  if (networkStatus === 'offline') return 'conservative';
  if (networkStatus === 'slow') return 'moderate';
  
  // 데이터 절약 모드 확인 (일부 브라우저 지원)
  // @ts-ignore
  const connection = navigator.connection;
  if (connection && connection.saveData) return 'conservative';
  
  // 배터리 상태 확인 (지원되는 브라우저에서)
  // @ts-ignore
  if (navigator.getBattery) {
    try {
      // @ts-ignore
      const battery = navigator.getBattery();
      if (battery && battery.level < 0.15 && !battery.charging) {
        return 'moderate'; // 배터리 부족 시 적당한 전략
      }
    } catch (e) {
      // getBattery API 지원하지 않는 경우 무시
    }
  }
  
  return 'aggressive'; // 기본적으로 적극적인 프리로딩
};

// 현재 페이지 위치 기반으로 프리로딩할 데이터 결정
const getContextualEndpoints = (currentPath: string): string[] => {
  // 현재 경로가 리소스 목록 페이지인 경우
  if (currentPath.includes('/resources')) {
    return [
      '/api/resources?limit=20',
      '/api/resources/type/hardware_design?limit=12',
      '/api/resources/type/software?limit=12',
      '/api/resources/type/3d_model?limit=12'
    ];
  }
  
  // 현재 경로가 서비스 목록 페이지인 경우
  if (currentPath.includes('/services')) {
    return [
      '/api/services?limit=20',
      '/api/services/type/3d_printing?limit=12',
      '/api/services/type/engineer?limit=12',
      '/api/services/type/manufacturing?limit=12'
    ];
  }
  
  // 현재 경로가 사용자 페이지인 경우
  if (currentPath.includes('/user') || currentPath.includes('/account')) {
    return [
      '/api/user',
      '/api/user/orders',
      '/api/user/services'
    ];
  }
  
  // 기본 홈페이지인 경우
  return [
    '/api/resources?limit=20',
    '/api/services?limit=20',
    '/api/resources/type/hardware_design?limit=12'
  ];
};

// 무거운 데이터 로딩을 위한 개선된 프리로더
export async function preloadHeavyData(contextPath?: string) {
  return new Promise<boolean>(resolve => {
    // 앱이 안정화된 후 무거운 데이터 로딩 시작
    setTimeout(async () => {
      try {
        // 현재 네트워크 상태 및 사용자 컨텍스트 기반으로 로딩 전략 결정
        const strategy = getPreloadStrategy();
        const currentPath = contextPath || window.location.pathname;
        
        // 프리로딩할 엔드포인트 결정
        let heavyDataEndpoints = getContextualEndpoints(currentPath);
        
        // 보수적 전략에서는 필수 데이터만 로드
        if (strategy === 'conservative') {
          heavyDataEndpoints = heavyDataEndpoints.slice(0, 1);
        }
        // 중간 전략에서는 일부 데이터만 로드
        else if (strategy === 'moderate') {
          heavyDataEndpoints = heavyDataEndpoints.slice(0, 2);
        }
        
        // 네트워크 상태에 따라 요청 간격 조정
        const delayBetweenRequests = 
          strategy === 'conservative' ? 500 :
          strategy === 'moderate' ? 250 : 100;
        
        // 병렬 요청 수 제한
        const maxParallelRequests = 
          strategy === 'conservative' ? 1 : 
          strategy === 'moderate' ? 2 : 3;
        
        // 병렬 처리 대신 일정 개수씩 순차 처리하여 네트워크 부하 감소
        for (let i = 0; i < heavyDataEndpoints.length; i += maxParallelRequests) {
          const batch = heavyDataEndpoints.slice(i, i + maxParallelRequests);
          
          await Promise.all(
            batch.map((endpoint, index) => 
              new Promise<void>((r) => {
                setTimeout(() => {
                  queryClient.prefetchQuery({
                    queryKey: [endpoint],
                    staleTime: determineStaleTime(endpoint),
                    gcTime: determineGCTime(endpoint)
                  }).then(() => r());
                }, index * delayBetweenRequests);
              })
            )
          );
          
          // 배치 간 간격 추가
          if (i + maxParallelRequests < heavyDataEndpoints.length) {
            await new Promise(r => setTimeout(r, 300));
          }
        }
        
        resolve(true);
      } catch (error) {
        logError('PRELOAD', 'heavyData', error);
        resolve(false);
      }
    }, 2000); // 메인 UI가 렌더링된 후 2초 후에 시작
  });
}

// 개발/프로덕션 환경에 따라 다른 설정 사용
const isProduction = process.env.NODE_ENV === 'production';

// 메모리 사용량 최적화를 위한 gc 조절 함수
const determineGCTime = (url: string): number => {
  // 카테고리와 정적 리소스는 오래 보관
  if (url.includes('/static/') || url.includes('/resources/type/') || url.includes('/services/type/')) {
    return 1000 * 60 * 60 * 6; // 6시간
  }
  
  // 자주 방문하는 페이지 데이터는 중간 정도 유지
  if (url.match(/\/resources(\?|$)/) || url.match(/\/services(\?|$)/)) {
    return 1000 * 60 * 60 * 2; // 2시간
  }
  
  // 그 외에는 표준 시간 사용
  return 1000 * 60 * 60; // 60분
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      
      // 기본 설정
      refetchInterval: false,
      refetchOnWindowFocus: isProduction,
      
      // 동적 만료 시간 - 기본값 (실제로는 URL별로 determineStaleTime 함수에서 결정)
      staleTime: 1000 * 60 * 10, // 10분
      
      // 가비지 컬렉션 시간 - 기본값 (실제로는 각 쿼리별로 조정)
      gcTime: 1000 * 60 * 60, // 60분
      
      // 네트워크 오류 재시도 전략
      retry: (failureCount, error) => {
        // 네트워크 상태 확인
        const networkStatus = getNetworkStatus();
        
        // 오프라인 상태에서는 재시도하지 않음 (불필요한 시도 방지)
        if (networkStatus === 'offline') return false;
        
        // 느린 연결에서는 더 적은 재시도
        const maxRetryBasedOnNetwork = networkStatus === 'slow' ? 1 : 2;
        
        // HTTP 상태 코드 기반 재시도 전략
        if (error instanceof Error) {
          const statusMatch = error.message.match(/^(\d{3}):/);
          if (statusMatch) {
            const status = parseInt(statusMatch[1]);
            
            // 서버 오류(5xx)는 네트워크 상태에 따라 재시도
            if (status >= 500 && status < 600) {
              return failureCount < maxRetryBasedOnNetwork;
            }
            
            // 특정 4xx 오류는 재시도하지 않음
            if ([400, 401, 403, 404, 409, 422].includes(status)) {
              return false;
            }
            
            // 기타 4xx 오류는 한 번만 재시도
            if (status >= 400 && status < 500) {
              return failureCount < 1;
            }
          }
        }
        
        // 타임아웃 오류는 네트워크 상태에 따라 재시도
        if (error instanceof DOMException && error.name === "AbortError") {
          return failureCount < maxRetryBasedOnNetwork;
        }
        
        // 기타 네트워크 오류는 최대 1번 재시도
        return failureCount < 1;
      },
      
      // 성능 최적화를 위한 추가 설정
      refetchOnReconnect: true,  // 네트워크 재연결 시 자동 리페치
      refetchOnMount: true,      // 컴포넌트 마운트 시 필요한 경우 리페치
      networkMode: 'always',     // 오프라인 상태에서도 쿼리 시도
    },
    
    mutations: {
      retry: (failureCount, error) => {
        // 네트워크 상태 확인
        const networkStatus = getNetworkStatus();
        
        // 오프라인 상태에서는 재시도하지 않음
        if (networkStatus === 'offline') return false;
        
        // 느린 연결에서는 최대 1번 재시도
        if (networkStatus === 'slow') return failureCount < 1;
        
        // 특정 에러는 재시도하지 않음
        if (error instanceof Error) {
          const statusMatch = error.message.match(/^(\d{3}):/);
          if (statusMatch) {
            const status = parseInt(statusMatch[1]);
            // 4xx 오류는 재시도하지 않음
            if (status >= 400 && status < 500) return false;
          }
        }
        
        // 그 외에는 1번 재시도
        return failureCount < 1;
      },
      
      onError: (error) => {
        console.error('Mutation error:', error);
        // 여기에 글로벌 에러 핸들링 로직 추가 가능
      }
    },
  },
});
