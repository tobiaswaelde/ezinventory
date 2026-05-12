import axios, { type AxiosInstance } from 'axios';
import { useAuthStore } from '~/store/auth';

type ApiVersion = 'v1';

/**
 * Provides a composable for making API requests.
 * It sets the API base URL and includes an interceptor to add the auth token to the request headers.
 * @param {ApiVersion} version The API version to use (default is 'v1').
 * @returns {AxiosInstance} The configured Axios instance for making API requests.
 */
export const useApi = (version: ApiVersion = 'v1'): AxiosInstance => {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();

  const baseUrl = computed<string>(() => {
    return config.public.API_BASE_URL;
  });

  // create an Axios instance with the base URL from the runtime config
  const api = axios.create({
    baseURL: `${baseUrl.value}/api/${version}`,
  });

  // add a request interceptor to set the auth token in the headers
  api.interceptors.request.use((config) => {
    // set request source header
    config.headers['Request-Source'] = 'web';

    // send timetzone info
    config.headers['Timezone'] = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // try to inject auth token
    const token = authStore.getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  });

  return api;
};
