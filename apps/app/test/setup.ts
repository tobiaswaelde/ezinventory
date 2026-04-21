import { vi } from 'vitest';

vi.stubGlobal('computed', <T>(fn: () => T) => ({
  get value() {
    return fn();
  }
}));
