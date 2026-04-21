import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../..');
const outputDir = path.join(repoRoot, 'docs/public/images/admin');
const appUrl = 'http://127.0.0.1:3000';

const user = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'admin@example.com',
  role: 'ADMIN',
  preferredLanguage: 'en',
  displayName: 'Admin User'
};

const tokens = {
  accessToken: 'access-token-test',
  refreshToken: 'refresh-token-test'
};

const locations = [
  {
    id: 'loc-1',
    name: 'Main Storage',
    code: 'MAIN',
    description: 'Main room'
  }
];

const containers = [
  {
    id: 'con-1',
    locationId: 'loc-1',
    parentContainerId: null,
    type: 'SHELF',
    name: 'Shelf A',
    code: 'SHELF-A',
    description: 'Top shelf',
    qrCodeValue: 'QR-SHELF-A'
  },
  {
    id: 'con-2',
    locationId: 'loc-1',
    parentContainerId: 'con-1',
    type: 'BOX',
    name: 'Box 1',
    code: 'BOX-1',
    description: 'Pasta box',
    qrCodeValue: 'QR-BOX-1'
  }
];

const items = [
  {
    id: 'item-1',
    categoryId: 'cat-1',
    sku: 'SPAGHETTI-SAUCE-001',
    name: 'Spaghetti Sauce',
    unit: 'jar',
    sizeLabel: null,
    sizeValue: null,
    sizeUnit: null,
    servings: 3,
    qrCodeValue: 'QR-SPAGHETTI-SAUCE-001'
  },
  {
    id: 'item-2',
    categoryId: 'cat-1',
    sku: 'PASTA-500G-001',
    name: 'Pasta 500g',
    unit: 'pack',
    sizeLabel: '500',
    sizeValue: 500,
    sizeUnit: 'g',
    servings: 5,
    qrCodeValue: 'QR-PASTA-500G-001'
  }
];

const managedUsers = [
  {
    id: 'user-1',
    email: 'admin@example.com',
    displayName: 'Admin User',
    role: 'ADMIN',
    preferredLanguage: 'en',
    policyIds: ['policy-1']
  },
  {
    id: 'user-2',
    email: 'staff@example.com',
    displayName: 'Warehouse Staff',
    role: 'STAFF',
    preferredLanguage: 'de',
    policyIds: []
  }
];

const permissionPolicies = [
  {
    id: 'policy-1',
    action: 'read',
    subject: 'Item',
    inverted: false,
    reason: 'Inventory read access',
    conditions: null
  },
  {
    id: 'policy-2',
    action: 'stock-out',
    subject: 'Stock',
    inverted: false,
    reason: 'Allow stock-out via scan',
    conditions: null
  }
];

const passkeys = [
  {
    id: 'passkey-1',
    deviceName: 'MacBook Touch ID',
    createdAt: '2026-04-20T10:00:00.000Z',
    lastUsedAt: '2026-04-21T09:15:00.000Z'
  }
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isServerReachable = async () => {
  try {
    const response = await fetch(appUrl, { method: 'GET' });
    return response.ok;
  } catch {
    return false;
  }
};

const waitForServer = async () => {
  const timeoutMs = 90_000;
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    if (await isServerReachable()) {
      return;
    }

    await sleep(1_000);
  }

  throw new Error(`Nuxt server did not start within ${timeoutMs}ms.`);
};

const createJsonResponse = (body, status = 200) => ({
  status,
  contentType: 'application/json',
  body: JSON.stringify(body)
});

const attachApiMocks = async (page) => {
  await page.route('**/api/v1/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();
    const pathname = url.pathname;

    if (pathname.endsWith('/auth/me') && method === 'GET') {
      await route.fulfill(createJsonResponse(user));
      return;
    }

    if (pathname.endsWith('/setup/status') && method === 'GET') {
      await route.fulfill(createJsonResponse({ setupInitialized: true, registrationMode: 'OPEN' }));
      return;
    }

    if (pathname.endsWith('/locations') && method === 'GET') {
      await route.fulfill(createJsonResponse(locations));
      return;
    }

    if (pathname.endsWith('/containers') && method === 'GET') {
      await route.fulfill(createJsonResponse(containers));
      return;
    }

    if (pathname.endsWith('/items') && method === 'GET') {
      await route.fulfill(createJsonResponse(items));
      return;
    }

    if (pathname.endsWith('/items/lookup') && method === 'GET') {
      await route.fulfill(createJsonResponse(items[0]));
      return;
    }

    if (pathname.endsWith('/setup/users') && method === 'GET') {
      await route.fulfill(createJsonResponse(managedUsers));
      return;
    }

    if (pathname.endsWith('/setup/permission-policies') && method === 'GET') {
      await route.fulfill(createJsonResponse(permissionPolicies));
      return;
    }

    if (pathname.endsWith('/auth/passkeys') && method === 'GET') {
      await route.fulfill(createJsonResponse(passkeys));
      return;
    }

    if (pathname.endsWith('/setup/registration-mode') && method === 'PATCH') {
      const body = request.postDataJSON();
      await route.fulfill(createJsonResponse({ mode: body?.mode ?? 'OPEN' }));
      return;
    }

    await route.fulfill(createJsonResponse({ message: 'Not implemented in screenshot mocks.' }, 404));
  });
};

const run = async () => {
  await mkdir(outputDir, { recursive: true });

  let serverProcess = null;

  if (!(await isServerReachable())) {
    serverProcess = spawn(
      'pnpm',
      ['--filter', '@ezinventory/app', 'exec', 'nuxt', 'dev', '--host', '127.0.0.1', '--port', '3000'],
      {
        cwd: repoRoot,
        stdio: 'inherit',
        shell: false
      }
    );

    await waitForServer();
  }

  const browser = await chromium.launch({ headless: true });

  try {
    const unauthContext = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
    const unauthPage = await unauthContext.newPage();
    await unauthPage.goto(`${appUrl}/auth/signin`, { waitUntil: 'networkidle' });
    await unauthPage.screenshot({
      path: path.join(outputDir, 'signin.png'),
      fullPage: true
    });
    await unauthContext.close();

    const authContext = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
    await authContext.addInitScript(
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

    const page = await authContext.newPage();
    await attachApiMocks(page);

    await page.goto(appUrl, { waitUntil: 'networkidle' });
    await page.screenshot({
      path: path.join(outputDir, 'dashboard.png'),
      fullPage: true
    });

    await page.goto(`${appUrl}/inventory`, { waitUntil: 'networkidle' });
    await page.screenshot({
      path: path.join(outputDir, 'inventory.png'),
      fullPage: true
    });

    await page.goto(`${appUrl}/scan`, { waitUntil: 'networkidle' });
    await page.locator('#code').fill('QR-SPAGHETTI-SAUCE-001');
    await page.getByRole('button', { name: 'Lookup Code' }).click();
    await page.locator('#qty').fill('2');
    await page.screenshot({
      path: path.join(outputDir, 'scan.png'),
      fullPage: true
    });

    await page.goto(`${appUrl}/labels`, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Select All' }).click();
    await page.getByRole('button', { name: 'Generate Labels' }).click();
    await page.locator('.label-card').first().waitFor({ state: 'visible' });
    await page.screenshot({
      path: path.join(outputDir, 'labels.png'),
      fullPage: true
    });

    await page.goto(`${appUrl}/settings`, { waitUntil: 'networkidle' });
    await page.screenshot({
      path: path.join(outputDir, 'settings-overview.png'),
      fullPage: true
    });

    await page.locator('h2', { hasText: 'User Permissions' }).scrollIntoViewIfNeeded();
    const permissionsCard = page.locator('section.card').filter({ hasText: 'User Permissions' });
    await permissionsCard.screenshot({
      path: path.join(outputDir, 'settings-user-permissions.png')
    });

    await authContext.close();
  } finally {
    await browser.close();

    if (serverProcess) {
      serverProcess.kill('SIGTERM');
    }
  }
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
