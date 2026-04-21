import { expect, test } from '@playwright/test';

test.describe('Auth pages', () => {
  test('signin page renders auth form and actions', async ({ page }) => {
    await page.goto('/auth/signin');

    await expect(page.locator('[data-slot=\"title\"]', { hasText: 'Sign in' })).toBeVisible();
    await expect(page.locator('input[name=\"email\"]').first()).toBeVisible();
    await expect(page.locator('input[name=\"password\"]').first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in with passkey' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Create one' })).toBeVisible();
  });

  test('signup page renders auth form and passkey action', async ({ page }) => {
    await page.goto('/auth/signup');

    await expect(page.locator('[data-slot=\"title\"]', { hasText: 'Sign up' })).toBeVisible();
    await expect(page.locator('input[name=\"displayName\"]').first()).toBeVisible();
    await expect(page.locator('input[name=\"email\"]').first()).toBeVisible();
    await expect(page.locator('input[name=\"password\"]').first()).toBeVisible();
    await expect(page.getByText('Preferred language')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create account' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Register passkey' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();
  });
});
