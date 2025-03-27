import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    try {
      // Try to parse as JSON first
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await res.json();
        const errorMessage = errorData.error || errorData.message || res.statusText;
        throw new Error(`${res.status}: ${errorMessage}`);
      } else {
        // If not JSON, get text
        const text = (await res.text()) || res.statusText;
        throw new Error(`${res.status}: ${text}`);
      }
    } catch (jsonError) {
      // If JSON parsing fails, throw the original error or the parsing error
      if (jsonError instanceof Error && jsonError.message.includes(res.status.toString())) {
        throw jsonError;
      }
      throw new Error(`${res.status}: ${res.statusText}`);
    }
  }
}

export async function apiRequest<T = any>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  console.log(`Making API request to: ${url}`);
  const res = await fetch(url, {
    ...options,
    headers: options?.body ? { "Content-Type": "application/json", ...options.headers } : {...options?.headers},
    body: options?.body ? JSON.stringify(options.body) : undefined,
    credentials: "include",
  });

  console.log(`Response status for ${url}:`, res.status);
  await throwIfResNotOk(res);
  return await res.json();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    console.log(`Executing query for: ${queryKey[0]}`);
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
      headers: {
        "Cache-Control": "no-cache",
        "Pragma": "no-cache"
      }
    });

    console.log(`Query response status for ${queryKey[0]}:`, res.status);
    
    if (res.status === 401) {
      console.log(`Authentication error (401) for ${queryKey[0]}`);
      if (unauthorizedBehavior === "returnNull") {
        return null;
      }
      
      // Special handling for 401 to make error messages more friendly
      throw new Error(`Authentication required. Please log in to access this data.`);
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: true, // Enable refetching on window focus
      staleTime: 1000 * 60 * 15, // 15 minutes instead of Infinity to ensure fresh data
      retry: 1, // Retry failed queries once before giving up
    },
    mutations: {
      retry: 1, // Retry failed mutations once
    },
  },
});
