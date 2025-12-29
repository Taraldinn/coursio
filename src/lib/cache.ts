import { unstable_cache } from 'next/cache';

type Callback<T> = (...args: any[]) => Promise<T>;

/**
 * Cache a function result using Next.js unstable_cache
 * @param req The function to cache
 * @param keys Keys to identify the cache entry
 * @param revalidateTTL Time in seconds to revalidate
 */
export function cacheRequest<T>(
    req: Callback<T>,
    keys: string[],
    revalidateTTL: number = 3600 // 1 hour default
): Callback<T> {
    return unstable_cache(req, keys, {
        revalidate: revalidateTTL,
    });
}

/**
 * In-memory cache for things that shouldn't persist across rebuilds/server restarts
 * or for very short lived cache
 */
const memoryCache = new Map<string, { data: any; expires: number }>();

export function getMemoryCache<T>(key: string): T | null {
    const item = memoryCache.get(key);
    if (!item) return null;

    if (Date.now() > item.expires) {
        memoryCache.delete(key);
        return null;
    }

    return item.data as T;
}

export function setMemoryCache<T>(key: string, data: T, ttlSeconds: number): void {
    memoryCache.set(key, {
        data,
        expires: Date.now() + ttlSeconds * 1000,
    });
}
