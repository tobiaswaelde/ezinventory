import { afterEach, describe, expect, it, vi } from 'vitest';

import { HealthController } from '../../src/modules/health/health.controller.js';
import { HealthStatus } from '../../src/modules/health/dto/health-status.js';

describe('HealthController', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.npm_package_name;
    delete process.env.npm_package_version;
    delete process.env.npm_package_description;
    delete process.env.npm_package_author_name;
    delete process.env.npm_package_author_email;
    delete process.env.npm_package_author_url;
  });

  it('returns process metadata and formatted uptime', async () => {
    process.env.npm_package_name = '@ezinventory/api';
    process.env.npm_package_version = '0.1.0';
    process.env.npm_package_description = 'EZ Inventory API';
    process.env.npm_package_author_name = 'Tobias';
    process.env.npm_package_author_email = 't@example.com';
    process.env.npm_package_author_url = 'https://example.com';

    vi.spyOn(process, 'uptime').mockReturnValue(3661.8);

    const controller = new HealthController();
    const result = await controller.getHealth();

    expect(result).toEqual({
      name: '@ezinventory/api',
      version: '0.1.0',
      status: HealthStatus.Online,
      description: 'EZ Inventory API',
      author: {
        name: 'Tobias',
        email: 't@example.com',
        url: 'https://example.com'
      },
      uptime: 3661.8,
      uptimeFormatted: '1h 1m 1s'
    });
  });

  it('falls back to default package name when env variable is missing', async () => {
    vi.spyOn(process, 'uptime').mockReturnValue(0.2);

    const controller = new HealthController();
    const result = await controller.getHealth();

    expect(result.name).toBe('@ezinventory/api');
    expect(result.uptimeFormatted).toBe('0h 0m 0s');
  });
});
