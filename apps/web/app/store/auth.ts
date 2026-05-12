import { type AuthResultDTO, type SigninDTO } from '~/types/api/modules/auth';
import { type UserDTO } from '~/types/api/modules/user';
import cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { useApi } from '~/composables/api/api';

const TOKEN_KEY = 'crm-tenant-web.auth-token';

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<UserDTO | null>(null);

  const isMfaPending = ref<boolean>(false);
  const isSignedIn = computed(() => currentUser.value !== null);

  const signinWithEmailAndPassword = async (data: SigninDTO) => {
    try {
      const res = await useApi().post<AuthResultDTO>('/auth/signin', data);
      handleAuthResult(res.data);
    } catch (err) {
      throw err;
    }
  };

  const signout = async () => {
    setToken(null);
    currentUser.value = null;
  };

  const getCurrentUser = async () => {
    try {
      if (!getToken()) {
        throw new Error('No token found.');
      }

      const res = await useApi().get<UserDTO>('/auth');
      currentUser.value = res.data;
    } catch (err) {
      currentUser.value = null;
    }
  };

  const getToken = (): string | null => {
    return cookies.get(TOKEN_KEY) || null;
  };
  const setToken = (token: string | null) => {
    if (token == null) {
      // clear token from cookies
      cookies.remove(TOKEN_KEY);
    } else {
      const payload = jwtDecode(token);
      const exp = payload.exp ? new Date(payload.exp * 1000) : null;

      // set token in cookies
      cookies.set(TOKEN_KEY, token, {
        expires: exp || 7,
        // secure: true,
        sameSite: 'strict',
      });
    }
  };

  const handleAuthResult = async (data: AuthResultDTO) => {
    const { user, token, mfaPending } = data;
    setToken(token);
    isMfaPending.value = mfaPending;

    if (user && !mfaPending) {
      currentUser.value = user;
    }
  };

  return {
    currentUser,
    mfaPending: isMfaPending,
    isSignedIn,
    signinWithEmailAndPassword,
    signout,
    getCurrentUser,
    getToken,
  };
});
