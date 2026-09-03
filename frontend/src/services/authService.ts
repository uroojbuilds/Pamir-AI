import { apiClient } from './apiClient';

/**
 * Bootstraps a real, backend-issued JWT session for this browser session.
 *
 * The FastAPI backend (Pamir_AI_Backend/main.py) requires a Bearer token on
 * every business endpoint except /api/signup and /api/login. This app has no
 * user-facing login screen yet, so - for the demo/hackathon build - we sign
 * in (or, on first run, sign up) a single fixed demo account automatically
 * and cache the resulting token. This is a real login against real backend
 * auth (bcrypt + JWT), not a bypass: swap in a login form later by calling
 * login()/signup() with user-entered credentials instead.
 */

interface AuthPayload {
  email: string;
  token: string;
  message: string;
}

const DEMO_EMAIL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_DEMO_EMAIL) || 'demo@pamirai.app';
const DEMO_PASSWORD =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_DEMO_PASSWORD) || 'PamirDemo#2026';

let inFlight: Promise<string> | null = null;

async function login(email: string, password: string): Promise<AuthPayload> {
  return apiClient.post<AuthPayload>('/login', { email, password }, { skipAuth: true });
}

async function signup(email: string, password: string): Promise<AuthPayload> {
  return apiClient.post<AuthPayload>('/signup', { email, password }, { skipAuth: true });
}

export const authService = {
  /**
   * Ensures apiClient holds a valid Bearer token, logging in (or signing up
   * on first run) the demo account if necessary. Safe to call many times -
   * concurrent callers share one in-flight request, and a cached token from
   * localStorage is reused across page reloads without hitting the network.
   */
  async ensureAuthenticated(): Promise<string> {
    const existing = apiClient.getAuthToken();
    if (existing) return existing;

    if (!inFlight) {
      inFlight = (async () => {
        try {
          const { token } = await login(DEMO_EMAIL, DEMO_PASSWORD);
          apiClient.setAuthToken(token);
          return token;
        } catch {
          // Demo account doesn't exist yet on this backend instance - create it.
          const { token } = await signup(DEMO_EMAIL, DEMO_PASSWORD);
          apiClient.setAuthToken(token);
          return token;
        }
      })().finally(() => {
        inFlight = null;
      });
    }
    return inFlight;
  },

  logout(): void {
    apiClient.setAuthToken(null);
  },
};
