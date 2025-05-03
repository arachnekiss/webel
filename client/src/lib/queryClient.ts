import { QueryClient, QueryFunction } from "@tanstack/react-query";

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

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  options?: ApiRequestOptions | boolean
): Promise<Response> {
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
  // 자주 변경되지 않는 데이터는 더 오래 캐싱
  if (url.includes('/resources/type/') || url.includes('/static/')) {
    return 1000 * 60 * 30; // 30분
  }
  
  // 사용자 데이터는 짧게 캐싱
  if (url.includes('/user')) {
    return 1000 * 60 * 5; // 5분
  }
  
  // 기본값
  return 1000 * 60 * 15; // 15분
};

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey, meta }) => {
    try {
      // 쿼리 키가 문자열인지 확인하고 안전하게 처리
      const queryKeyStr = typeof queryKey[0] === 'string' ? queryKey[0] : String(queryKey[0]);
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

// 무거운 데이터 로딩을 위한 프리로더
// 이 함수는 사용자 상호작용 중에 백그라운드에서 실행되어 lazy loading 효과를 구현
export async function preloadHeavyData() {
  return new Promise<boolean>(resolve => {
    // 앱이 안정화된 후 무거운 데이터 로딩 시작
    setTimeout(async () => {
      try {
        const heavyDataEndpoints = [
          '/api/resources?limit=20',
          '/api/services?limit=20',
          '/api/resources/type/hardware_design?limit=12'
        ];
        
        await Promise.all(
          heavyDataEndpoints.map((endpoint, index) => 
            new Promise<void>((r) => {
              // 요청을 250ms 간격으로 더 많이 분산
              setTimeout(() => {
                queryClient.prefetchQuery({
                  queryKey: [endpoint],
                  staleTime: determineStaleTime(endpoint),
                }).then(() => r());
              }, index * 250);
            })
          )
        );
        
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

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: isProduction ? true : false, // 프로덕션에서는 윈도우 포커스 시 리페치 활성화
      staleTime: 1000 * 60 * 15, // 15분으로 증가 (더 오래 캐시 유지)
      gcTime: 1000 * 60 * 30, // 30분으로 증가 (캐시 오래 유지)
      retry: (failureCount, error) => {
        // 서버 에러(5xx)는 2번까지 재시도, 클라이언트 에러(4xx)는 재시도하지 않음
        if (error instanceof Error) {
          const statusMatch = error.message.match(/^(\d{3}):/);
          if (statusMatch) {
            const status = parseInt(statusMatch[1]);
            // 5xx 에러는 최대 2번까지 재시도
            if (status >= 500 && status < 600) {
              return failureCount < 2;
            }
            // 4xx 에러는 재시도하지 않음 (401, 403, 404 등)
            if (status >= 400 && status < 500) {
              return false;
            }
          }
        }
        // 기타 에러는 1번만 재시도
        return failureCount < 1;
      },
      networkMode: 'always',
    },
    mutations: {
      retry: false,
      onError: (error) => {
        console.error('Mutation error:', error);
        // 여기에 글로벌 에러 핸들링 로직 추가 가능
      }
    },
  },
});
