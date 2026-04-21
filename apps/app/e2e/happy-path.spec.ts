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

    await page.route('**/setup/status', async (route) => {
      await route.fulfill(
        json({
          body: {
            setupInitialized: true,
            registrationMode: 'OPEN'
          }
        })
      );
    });

    await page.route('**/auth/register', async (route) => {
      await route.fulfill(json({ status: 201, body: tokens }));
    });

    await page.route('**/auth/login', async (route) => {
      await route.fulfill(json({ body: tokens }));
    });

    await page.route('**/auth/me', async (route) => {
      await route.fulfill(json({ body: user }));
    });

    await page.route('**/items/lookup**', async (route) => {
      await route.fulfill(json({ body: scannedItem }));
    });

    await page.goto('/auth/signup');

    await page.locator('input[name="displayName"]').fill('Admin User');
    await page.locator('input[name="email"]').fill(user.email);
    await page.locator('input[name="password"]').fill('adminadminadmin');
    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible();

    await page.goto('/scan');

    await page.locator('#code').fill(scannedItem.qrCodeValue);
    await page.getByRole('button', { name: 'Lookup Code' }).click();

    await expect(page.getByText('Scanned Item')).toBeVisible();
    await expect(page.getByText('Name: Spaghetti Sauce')).toBeVisible();

    await page.locator('#qty').fill('2');
    await page.getByRole('button', { name: 'Apply Action' }).click();

    await expect(page.getByText('Prepared stock-out for Spaghetti Sauce (qty: 2).')).toBeVisible();
  });
});
