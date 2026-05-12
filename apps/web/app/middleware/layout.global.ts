/**
 * Middleware to set the layout based on the route.
 */
export default defineNuxtRouteMiddleware(async (to, _from) => {
  if (to.path.startsWith('/auth')) {
    setPageLayout('auth');
    return;
  }

  setPageLayout('default');
});
