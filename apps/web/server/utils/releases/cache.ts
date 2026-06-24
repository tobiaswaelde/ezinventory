interface CacheEntry<T> {
  expiresAt: number;
  value: T;
}

const cache = new Map<string, CacheEntry<unknown>>();

export function getCachedValue<T>(key: string): T | null {
  const entry = cache.get(key);

  if (!entry) {
    return null;
  }

  if (entry.expiresAt <= Date.now()) {
    return null;
  }

  return entry.value as T;
}

export function getStaleCachedValue<T>(key: string): T | null {
  const entry = cache.get(key);
  return (entry?.value as T | undefined) ?? null;
}

export function setCachedValue<T>(key: string, value: T, ttlMs: number): T {
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });

  return value;
}

export function clearReleaseCache(): void {
  cache.clear();
}
