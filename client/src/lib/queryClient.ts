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
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
