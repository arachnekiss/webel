import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

interface ApiRequestOptions {
  isFormData?: boolean;
  onProgress?: (progress: number) => void;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  options?: ApiRequestOptions | boolean
): Promise<Response> {
  const headers: Record<string, string> = {};
  let body: string | FormData | undefined = undefined;
  
  // 호환성을 위해 boolean 타입도 지원
  const isFormData = typeof options === 'boolean' ? options : options?.isFormData || false;
  const onProgress = typeof options === 'object' ? options.onProgress : undefined;

  if (data) {
    if (isFormData && data instanceof FormData) {
      // FormData는 자동으로 적절한 Content-Type 헤더를 설정
      body = data;
    } else {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(data);
    }
  }

  // XMLHttpRequest를 사용하여 업로드 진행률 처리
  if (onProgress && method.toUpperCase() === 'POST' && data instanceof FormData) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(method, url);
      xhr.withCredentials = true;
      
      // 진행률 이벤트 리스너 추가
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      });
      
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(new Response(xhr.response, {
            status: xhr.status,
            statusText: xhr.statusText,
            headers: new Headers({
              'Content-Type': xhr.getResponseHeader('Content-Type') || 'application/json'
            })
          }));
        } else {
          reject(new Error(`${xhr.status}: ${xhr.statusText}`));
        }
      };
      
      xhr.onerror = () => {
        reject(new Error('Network request failed'));
      };
      
      xhr.send(body as FormData);
    });
  } else {
    // 일반적인 fetch 사용
    const res = await fetch(url, {
      method,
      headers,
      body,
      credentials: "include",
    });

    await throwIfResNotOk(res);
    return res;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      // 특정 API에 대해 더 긴 타임아웃 설정
      // 쿼리 키가 문자열인지 확인하고 안전하게 처리
      const queryKeyStr = typeof queryKey[0] === 'string' ? queryKey[0] : String(queryKey[0]);
      const timeoutMs = queryKeyStr.includes('/services/') || 
                      queryKeyStr.includes('/resources/') ? 
                      30000 : 15000; // 30초 또는 15초
                      
      console.log(`API 요청: ${queryKeyStr} (타임아웃: ${timeoutMs}ms)`);
      
      const res = await fetch(queryKeyStr, {
        credentials: "include",
        // 요청 시간 초과 설정
        signal: AbortSignal.timeout(timeoutMs),
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      
      // JSON 파싱 오류를 방지하기 위한 추가 처리
      try {
        return await res.json();
      } catch (jsonError) {
        console.error("JSON 파싱 오류:", jsonError);
        throw new Error("응답을 처리하는 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("API 요청 오류:", error);
      
      // 타임아웃 또는 네트워크 오류인 경우 더 명확한 오류 메시지 표시
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new Error("요청 시간이 초과되었습니다. 네트워크 연결을 확인해주세요.");
      } else if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요.");
      }
      
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5분 후 데이터를 stale로 표시
      gcTime: 1000 * 60 * 10, // 10분 동안 캐시 유지 (v5에서는 cacheTime 대신 gcTime 사용)
      retry: 1, // 실패 시 한 번만 재시도
    },
    mutations: {
      retry: false,
    },
  },
});
