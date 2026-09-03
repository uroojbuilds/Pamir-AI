/**
 * Core API Client for PamirAI Trade Engine
 * 
 * Features:
 * - Configurable BASE_URL via environment variable (VITE_API_BASE_URL)
 * - Automatic Authorization: Bearer <token> header injection
 * - Automatic response unwrapping from { success: true, data: { ... } }
 * - Strong TypeScript types and standardized error handling
 */

export interface ApiResponseEnvelope<T> {
  success?: boolean;
  status?: string;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
  [key: string]: unknown;
}

export class ApiError extends Error {
  public status: number;
  public data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  skipAuth?: boolean;
  timeoutMs?: number;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    // 1. Configurable BASE_URL from env. Defaults to the real Pamir AI FastAPI
    // backend running locally (see Pamir_AI_Backend/main.py, `uvicorn main:app
    // --port 8000`). This client talks to that backend directly - it is NOT
    // the same as this app's own server.ts (which only serves the frontend
    // bundle and no longer fakes any /api business routes).
    const envBaseUrl = typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL;
    this.baseUrl = (envBaseUrl || 'http://localhost:8000/api').replace(/\/+$/, '');

    // 2. Initialize Auth Token from environment or local storage only.
    // There is no valid hardcoded fallback token - the backend issues real
    // per-user JWTs from /api/signup and /api/login (see authService.ts),
    // and unauthenticated requests are expected to fail with 401 until
    // ensureAuthenticated() has run.
    const envToken = typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_AUTH_TOKEN;
    if (envToken) {
      this.token = envToken;
    } else {
      try {
        this.token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
      } catch {
        this.token = null;
      }
    }
  }

  /**
   * Get the current configurable base URL
   */
  public getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Set or override the base URL at runtime
   */
  public setBaseUrl(url: string): void {
    this.baseUrl = url.replace(/\/+$/, '');
  }

  /**
   * Get the active authorization token
   */
  public getAuthToken(): string | null {
    return this.token;
  }

  /**
   * Set active Bearer authorization token
   */
  public setAuthToken(token: string | null): void {
    this.token = token;
    try {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    } catch {
      // safe fallback if storage is restricted in iframe
    }
  }

  /**
   * Core request dispatcher with automatic Bearer auth header injection and response unwrapping
   */
  public async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, skipAuth = false, timeoutMs = 15000, headers: customHeaders, ...fetchOptions } = options;

    // Build URL with query params
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    let url = this.baseUrl ? `${this.baseUrl}${cleanEndpoint}` : cleanEndpoint;

    // If endpoint is already an absolute URL (e.g. https://...), use it directly
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      url = endpoint;
    }

    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          searchParams.append(key, String(val));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }

    // Prepare Request Headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Automatically inject 'Authorization: Bearer <token>' on authenticated requests
    if (!skipAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    // Merge with any custom headers
    if (customHeaders) {
      if (customHeaders instanceof Headers) {
        customHeaders.forEach((v, k) => { headers[k] = v; });
      } else if (Array.isArray(customHeaders)) {
        customHeaders.forEach(([k, v]) => { headers[k] = v; });
      } else {
        Object.assign(headers, customHeaders);
      }
    }

    // Timeout controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle 204 No Content
      if (response.status === 204) {
        return undefined as unknown as T;
      }

      // Parse JSON response safely
      let responseBody: ApiResponseEnvelope<T> | T;
      const text = await response.text();
      try {
        responseBody = text ? JSON.parse(text) : {};
      } catch {
        throw new ApiError(`Invalid JSON response from ${url}`, response.status, text);
      }

      // Check HTTP Status
      if (!response.ok) {
        const errorMsg = (typeof responseBody === 'object' && responseBody !== null)
          ? ((responseBody as ApiResponseEnvelope<T>).error || (responseBody as ApiResponseEnvelope<T>).message || `HTTP Error ${response.status}`)
          : `HTTP Error ${response.status}`;
        throw new ApiError(errorMsg, response.status, responseBody);
      }

      // Automatically unwrap backend responses from { success: true, data: { ... } }
      if (typeof responseBody === 'object' && responseBody !== null) {
        const envelope = responseBody as ApiResponseEnvelope<T>;
        
        // Handle explicit success: false in 200 responses
        if (envelope.success === false) {
          throw new ApiError(envelope.error || envelope.message || 'Operation failed', response.status, envelope);
        }

        // Unwrap data property if present
        if ('data' in envelope && envelope.data !== undefined) {
          return envelope.data;
        }
      }

      // If already raw data or no envelope wrapper, return directly
      return responseBody as T;
    } catch (err) {
      clearTimeout(timeoutId);
      if (err instanceof ApiError) {
        throw err;
      }
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw new ApiError(`Request to ${url} timed out after ${timeoutMs}ms`, 408);
      }
      throw new ApiError(err instanceof Error ? err.message : 'Network request failed', 0, err);
    }
  }

  /**
   * HTTP GET Helper
   */
  public get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * HTTP POST Helper
   */
  public post<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * HTTP PUT Helper
   */
  public put<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * HTTP PATCH Helper
   */
  public patch<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * HTTP DELETE Helper
   */
  public delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// Export singleton instance as default client
export const apiClient = new ApiClient();
