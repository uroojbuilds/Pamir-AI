import { apiClient, ApiError } from './apiClient';

/** Real login/signup against the FastAPI backend (bcrypt + JWT). */

interface AuthPayload {
  email: string;
  token: string;
  message: string;
}

async function login(email: string, password: string): Promise<AuthPayload> {
  return apiClient.post<AuthPayload>('/login', { email, password }, { skipAuth: true });
}

async function signup(email: string, password: string): Promise<AuthPayload> {
  return apiClient.post<AuthPayload>('/signup', { email, password }, { skipAuth: true });
}

export const authService = {
  /**
   * Real login against the backend with user-entered credentials.
   * Caches the resulting token so subsequent requests are authenticated.
   */
  async login(email: string, password: string): Promise<AuthPayload> {
    const result = await login(email, password);
    apiClient.setAuthToken(result.token);
    return result;
  },

  /**
   * Real signup against the backend with user-entered credentials.
   * Caches the resulting token so subsequent requests are authenticated.
   */
  async signup(email: string, password: string): Promise<AuthPayload> {
    const result = await signup(email, password);
    apiClient.setAuthToken(result.token);
    return result;
  },

  /**
   * Returns true if a session token is already cached (user is signed in).
   */
  isAuthenticated(): boolean {
    return !!apiClient.getAuthToken();
  },

  /**
   * Returns the cached JWT, or throws a 401 ApiError if the user is not signed in.
   * (There is no shared/demo account: every session uses real user credentials.)
   */
  async ensureAuthenticated(): Promise<string> {
    const existing = apiClient.getAuthToken();
    if (existing) return existing;
    throw new ApiError('Please sign in to continue.', 401);
  },

  logout(): void {
    apiClient.setAuthToken(null);
  },
};