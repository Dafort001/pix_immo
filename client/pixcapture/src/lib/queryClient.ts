import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { getApiBaseUrl } from "@/config/runtime";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

/**
 * Build full API URL from relative path
 * Absolute URLs (e.g., presigned R2 URLs) are returned unchanged
 * @param path - API path (e.g., "/api/orders" or "https://...")
 */
function buildApiUrl(path: string): string {
  // Check if already absolute URL (presigned R2 URLs, etc.)
  try {
    new URL(path);
    // Valid absolute URL - return unchanged
    return path;
  } catch {
    // Relative path - build with base URL
    const baseUrl = getApiBaseUrl();
    
    // Normalize path: remove duplicate slashes ONLY in path portion (before query string)
    // Split on '?' to preserve query parameters containing URLs
    const [pathPart, ...queryParts] = path.split('?');
    const normalizedPathPart = pathPart.replace(/\/+/g, '/');
    const normalizedPath = queryParts.length > 0 
      ? `${normalizedPathPart}?${queryParts.join('?')}`
      : normalizedPathPart;
    
    // If no base URL (development), return normalized path for same-origin requests
    if (baseUrl === '') {
      return normalizedPath;
    }
    
    // Remove leading slash from path if present to avoid double slashes
    const cleanPath = normalizedPath.startsWith('/') ? normalizedPath.slice(1) : normalizedPath;
    return `${baseUrl}/${cleanPath}`;
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Build full URL if it's a relative path
  const fullUrl = url.startsWith('http') ? url : buildApiUrl(url);
  
  const res = await fetch(fullUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Query keys are relative paths like ["/api/orders", "123", "files"]
    // Build full URL from queryKey segments
    const path = queryKey.join("/") as string;
    const fullUrl = buildApiUrl(path);
    
    const res = await fetch(fullUrl, {
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
