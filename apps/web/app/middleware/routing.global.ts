import { useAuthStore } from '~/store/auth';
import { Routes } from '~/types/routes';

/**
 * Global routing middleware to handle authentication and route access.
 */
export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore();

  await authStore.getCurrentUser();

  const isSigninPath = to.path === '/auth/signin';
  const isRestrictedPath = !to.fullPath.startsWith('/auth');

  // redirect if user is already signed in
  if (isSigninPath && authStore.isSignedIn) {
    return navigateTo({ name: Routes.Index });
  }

  // redirect to signin if not signed in and trying to access a protected route
  if (isRestrictedPath && !authStore.isSignedIn) {
    return navigateTo({
      name: Routes.AuthSignin,
      query: {
        redirect: to.fullPath,
      },
    });
  }
});
