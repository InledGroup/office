import type { XHRMiddleware } from "./xhr";

export type FetchProxy = typeof fetch & {
  use(middleware: XHRMiddleware): void;
  clearMiddlewares(): void;
};

/**
 * Creates a fetch proxy function that supports middleware
 * @param BaseFetch The original fetch function
 * @returns The enhanced fetch function
 */
export function createFetchProxy(
  target: (Window & { fetch: typeof fetch }) | typeof fetch = globalThis.fetch,
): FetchProxy {
  const middlewares: XHRMiddleware[] = [];
  const BaseFetch =
    typeof target === "function" ? target : target.fetch.bind(target);

  const proxy = (async (input: RequestInfo | URL, init?: RequestInit) => {
    let request: Request;
    try {
      request = new Request(input, init);
    } catch (e) {
      // If request cannot be created, fallback to native fetch
      return BaseFetch(input, init);
    }

    try {
      for (const mw of middlewares) {
        const response = await mw(request.clone());
        if (response) {
          return response;
        }
      }
    } catch (err) {
      console.error("ProxyFetch middleware error:", err);
    }

    const response = await BaseFetch(request);
    
    // Strip CSP and security headers from all responses to prevent blocking
    const newHeaders = new Headers(response.headers);
    newHeaders.delete("content-security-policy");
    newHeaders.delete("content-security-policy-report-only");
    newHeaders.delete("x-frame-options");
    newHeaders.delete("x-content-type-options");
    
    // Create a new response with the stripped headers
    // Note: for some responses (like opaque ones), we might not be able to read the body easily
    // but for same-origin it should be fine.
    try {
      const body = await response.blob();
      return new Response(body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    } catch (e) {
      // Fallback if body cannot be read as blob
      return response;
    }
  }) as FetchProxy;

  proxy.use = (middleware: XHRMiddleware) => {
    middlewares.push(middleware);
  };

  proxy.clearMiddlewares = () => {
    middlewares.length = 0;
  };

  return proxy;
}
