import { authClient } from '../authHelper';

/**
 * Resilient fetch utility that automatically retries the operation
 * when a transient network error (like "Failed to fetch" or name "TypeError") or offline status is detected.
 */
export async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
  retries = 3,
  delay = 2500
): Promise<Response> {
  const urlStr = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
  let finalInit = { ...init };

  // Only attach JWT to our own /api endpoints
  if (urlStr.includes('/api/')) {
    let token = null;
    try {
      token = await (authClient as any).getJWTToken?.();
    } catch (err) {
      console.warn("Neon Auth token fetch failed:", err);
    }
    const headers = new Headers(finalInit.headers || {});
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    finalInit.headers = headers;
  }

  for (let i = 0; i < retries; i++) {
    try {
      return await fetch(input, finalInit);
    } catch (e: any) {
      if (i === retries - 1) throw e;
      
      // "Failed to fetch" is typically thrown when a network error occurs or server is restarting
      const isNetworkError =
        e.message === "Failed to fetch" ||
        e.name === "TypeError" ||
        (typeof navigator !== "undefined" && !navigator.onLine);
        
      if (isNetworkError) {
        console.warn(`Transient fetch error. Retrying ${i + 1}/${retries} in ${delay}ms...`, e);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw e;
      }
    }
  }
  throw new Error("Failed to fetch after retries");
}
