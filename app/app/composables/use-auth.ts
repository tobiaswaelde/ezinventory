import type { FetchOptions } from 'ofetch';

import type { AuthTokens, AuthUser, LoginPayload } from '~/types/api/auth';
import type { RegisterPayload } from '~/types/api/auth';

const ACCESS_TOKEN_KEY = 'ezinventory.access_token';
const REFRESH_TOKEN_KEY = 'ezinventory.refresh_token';
const USER_KEY = 'ezinventory.user';

export function useAuth() {
  const baseURL = useRuntimeConfig().public.apiBaseUrl;

  const accessToken = useState<string | null>('auth.access-token', () => null);
  const refreshToken = useState<string | null>('auth.refresh-token', () => null);
  const user = useState<AuthUser | null>('auth.user', () => null);
  const initialized = useState<boolean>('auth.initialized', () => false);
  const refreshing = useState<boolean>('auth.refreshing', () => false);

  const isAuthenticated = computed(() => Boolean(accessToken.value && refreshToken.value && user.value));

  const persist = (): void => {
    if (!process.client) return;

    if (accessToken.value) {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken.value);
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }

    if (refreshToken.value) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken.value);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }

    if (user.value) {
      localStorage.setItem(USER_KEY, JSON.stringify(user.value));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  };

  const restore = (): void => {
    if (!process.client) return;

    accessToken.value = localStorage.getItem(ACCESS_TOKEN_KEY);
    refreshToken.value = localStorage.getItem(REFRESH_TOKEN_KEY);

    const rawUser = localStorage.getItem(USER_KEY);
    if (!rawUser) {
      user.value = null;
      return;
    }

    try {
      user.value = JSON.parse(rawUser) as AuthUser;
    } catch {
      user.value = null;
    }
  };

  const clearSession = (): void => {
    accessToken.value = null;
    refreshToken.value = null;
    user.value = null;
    persist();
  };

  const setTokens = (tokens: AuthTokens): void => {
    accessToken.value = tokens.accessToken;
    refreshToken.value = tokens.refreshToken;
  };

  const fetchMe = async (): Promise<AuthUser> => {
    if (!accessToken.value) {
      throw new Error('Missing access token.');
    }

    const me = await $fetch<AuthUser>('/auth/me', {
      method: 'GET',
      baseURL,
      headers: {
        Authorization: `Bearer ${accessToken.value}`
      }
    });

    user.value = me;
    persist();

    return me;
  };

  const login = async (payload: LoginPayload): Promise<AuthUser> => {
    const tokens = await $fetch<AuthTokens>('/auth/login', {
      method: 'POST',
      baseURL,
      body: payload
    });

    setTokens(tokens);
    const me = await fetchMe();
    persist();

    return me;
  };

  const register = async (payload: RegisterPayload): Promise<AuthUser> => {
    const tokens = await $fetch<AuthTokens>('/auth/register', {
      method: 'POST',
      baseURL,
      body: payload
    });

    setTokens(tokens);
    const me = await fetchMe();
    persist();

    return me;
  };

  const refreshSession = async (): Promise<void> => {
    if (refreshing.value) {
      return;
    }

    if (!refreshToken.value) {
      throw new Error('Missing refresh token.');
    }

    refreshing.value = true;

    try {
      const tokens = await $fetch<AuthTokens>('/auth/refresh', {
        method: 'POST',
        baseURL,
        body: { refreshToken: refreshToken.value }
      });

      setTokens(tokens);
      await fetchMe();
      persist();
    } catch (error) {
      clearSession();
      throw error;
    } finally {
      refreshing.value = false;
    }
  };

  const logout = async (): Promise<void> => {
    if (refreshToken.value) {
      try {
        await $fetch('/auth/logout', {
          method: 'POST',
          baseURL,
          body: { refreshToken: refreshToken.value }
        });
      } catch {
        // No-op: we always clear local auth state afterwards.
      }
    }

    clearSession();
  };

  const initAuth = async (): Promise<void> => {
    if (initialized.value) {
      return;
    }

    restore();

    if (!accessToken.value || !refreshToken.value) {
      initialized.value = true;
      return;
    }

    try {
      await fetchMe();
    } catch {
      try {
        await refreshSession();
      } catch {
        clearSession();
      }
    }

    initialized.value = true;
  };

  const authorizedFetch = async <T>(path: string, options: FetchOptions<'json'> = {}, retry = true): Promise<T> => {
    if (!accessToken.value) {
      throw new Error('Not authenticated.');
    }

    try {
      return await $fetch<T>(path, {
        ...options,
        baseURL,
        headers: {
          ...(options.headers ?? {}),
          Authorization: `Bearer ${accessToken.value}`
        }
      });
    } catch (error: unknown) {
      const statusCode = (error as { statusCode?: number } | undefined)?.statusCode;

      if (retry && statusCode === 401 && refreshToken.value) {
        await refreshSession();
        return await authorizedFetch<T>(path, options, false);
      }

      throw error;
    }
  };

  return {
    user,
    initialized,
    isAuthenticated,
    login,
    register,
    logout,
    initAuth,
    fetchMe,
    refreshSession,
    authorizedFetch
  };
}
