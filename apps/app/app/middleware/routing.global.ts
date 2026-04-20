export default defineNuxtRouteMiddleware(async (to) => {
  if (process.server) {
    return;
  }

  const { initAuth, initialized, isAuthenticated } = useAuth();

  if (!initialized.value) {
    await initAuth();
  }

  const isAuthRoute = to.path.startsWith('/auth');

  if (isAuthRoute && isAuthenticated.value) {
    return navigateTo('/', { replace: true });
  }

  if (!isAuthRoute && !isAuthenticated.value) {
    return navigateTo(
      {
        path: '/auth/signin',
        query: {
          redirect: to.fullPath
        }
      },
      { replace: true }
    );
  }
});
