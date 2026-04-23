/**
 * Jest setup file: sets all required environment variables before any module is imported.
 * `dotenv.config()` (called inside ~/config/env) does NOT override existing process.env values,
 * so these values take precedence over the .env file during tests.
 */

// Suppress dotenv v17 console output during tests
const _origLog = console.log;
console.log = (...args: any[]) => {
  if (typeof args[0] === 'string' && args[0].startsWith('[dotenv')) return;
  _origLog(...args);
};

process.env.NODE_ENV = 'test';

// Database (required, no default)
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.SHADOW_DATABASE_URL = 'postgresql://test:test@localhost:5432/test_shadow_db';

// Redis (required, no default)
process.env.REDIS_URL = 'redis://localhost:6379';

// S3 (required, no default)
process.env.S3_ENDPOINT = 'http://localhost:9000';
process.env.S3_ACCESS_KEY_ID = 'test-access-key';
process.env.S3_SECRET_KEY = 'test-secret-key';

// Admin API (required, no default)
process.env.ADMIN_API_BASE_URL = 'http://localhost:4011';
process.env.ORGANIZATION_TOKEN = 'test-org-token';

// Init (required, no default)
process.env.INIT_ADMIN_EMAIL = 'admin@test.local';
process.env.INIT_ADMIN_PASSWORD = 'TestAdmin123!';

// Auth (have devDefaults, but set explicitly for clarity)
process.env.AUTH_JWT_SECRET = '00000000000000000000000000000000';
process.env.AUTH_JWT_ISSUER = 'test-issuer';
process.env.AUTH_RP_NAME = 'Test App';
process.env.AUTH_RP_ID = 'localhost';
process.env.AUTH_ORIGIN = 'http://localhost:3200';
process.env.AUTH_BCRYPT_ROUNDS = '4'; // low rounds for fast tests
process.env.CORS_ORIGIN = '*';
