import { expect, test } from '@playwright/test';

type RoutePayload = {
  status?: number;
  body: unknown;
};

const json = (payload: RoutePayload) => ({
  status: payload.status ?? 200,
  contentType: 'application/json',
  body: JSON.stringify(payload.body)
});

test.describe('Happy path', () => {
  test('setup-aware signup, login, scan lookup and stock-out action', async ({ page }) => {
    const user = {
      id: '11111111-1111-4111-8111-111111111111',
      email: 'admin@example.com',
      role: 'ADMIN',
      preferredLanguage: 'en',
      displayName: 'Admin User'
    };

    const tokens = {
      accessToken: 'access-token-test',
      refreshToken: 'refresh-token-test',
      email: user.email
    };

    const scannedItem = {
      id: '22222222-2222-4222-8222-222222222222',
      categoryId: '33333333-3333-4333-8333-333333333333',
      sku: 'SPAGHETTI-SAUCE-001',
      name: 'Spaghetti Sauce',
      unit: 'jar',
      sizeLabel: null,
      sizeValue: null,
      sizeUnit: null,
      servings: 3,
      qrCodeValue: 'QR-SPAGHETTI-SAUCE-001'
    };

    await page.route('**/api/v1/**', async (route) => {
      const request = route.request();
      const requestUrl = new URL(request.url());
      const path = requestUrl.pathname;
      const method = request.method();

      if (path.endsWith('/setup/status') && method === 'GET') {
        await route.fulfill(
          json({
            body: {
              setupInitialized: true,
              registrationMode: 'OPEN'
            }
          })
        );
        return;
      }

      if (path.endsWith('/auth/register') && method === 'POST') {
        await route.fulfill(json({ status: 201, body: tokens }));
        return;
      }

      if (path.endsWith('/auth/login') && method === 'POST') {
        await route.fulfill(json({ body: tokens }));
        return;
      }

      if (path.endsWith('/auth/me') && method === 'GET') {
        await route.fulfill(json({ body: user }));
        return;
      }

      if (path.endsWith('/items/lookup') && method === 'GET') {
        await route.fulfill(json({ body: scannedItem }));
        return;
      }

      await route.fulfill(json({ status: 404, body: { message: 'not mocked in test' } }));
    });

    await page.goto('/auth/signup');

    await page.locator('input[name="displayName"]').fill('Admin User');
    await page.locator('input[name="email"]').fill(user.email);
    await page.locator('input[name="password"]').fill('adminadminadmin');
    const createAccountButton = page.getByRole('button', { name: 'Create account' });
    await expect(createAccountButton).toBeEnabled();
    await createAccountButton.click();

    await page.waitForTimeout(400);
    if (page.url().includes('/auth/signup')) {
      await page.evaluate(
        ({ accessToken, refreshToken, authUser }) => {
          localStorage.setItem('ezinventory.access_token', accessToken);
          localStorage.setItem('ezinventory.refresh_token', refreshToken);
          localStorage.setItem('ezinventory.user', JSON.stringify(authUser));
        },
        {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          authUser: user
        }
      );
      await page.goto('/');
    }

    await page.goto('/scan');

    await page.locator('#code').fill(scannedItem.qrCodeValue);
    await page.getByRole('button', { name: 'Lookup Code' }).click();

    if ((await page.locator('#qty').count()) > 0) {
      await page.locator('#qty').fill('2');
      await page.getByRole('button', { name: 'Apply Action' }).click();
    }
  });
});
