type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

type CacheStore = Map<string, CacheEntry<unknown>>;

declare global {
  // eslint-disable-next-line no-var
  var __WARPDIG_CACHE__: CacheStore | undefined;
}

const DEFAULT_TTL = 1000 * 60 * 5; // 5 minutes

function getStore(): CacheStore {
  if (!globalThis.__WARPDIG_CACHE__) {
    globalThis.__WARPDIG_CACHE__ = new Map();
  }
  return globalThis.__WARPDIG_CACHE__;
}

export function getCache<T>(key: string): T | null {
  const store = getStore();
  const entry = store.get(key);

  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }

  return entry.value as T;
}

export function setCache<T>(
  key: string,
  value: T,
  ttl: number = DEFAULT_TTL
): void {
  const store = getStore();
  store.set(key, {
    value,
    expiresAt: Date.now() + ttl,
  });
}

export function clearCache(key?: string) {
  const store = getStore();
  if (typeof key === "string") {
    store.delete(key);
    return;
  }
  store.clear();
}
