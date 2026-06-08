import { useState, useEffect, useCallback, useRef } from "react";

/* ── Глобальный in-memory кэш ──
   Ключ = строка (обычно имя endpoint'а).
   TTL = 60 секунд — данные считаются свежими.
   При загрузке мгновенно отдаём кэш, фоном обновляем. */
const CACHE_TTL = 60_000; // 60 сек

interface CacheEntry<T> {
  data: T;
  ts: number;
}

const globalCache = new Map<string, CacheEntry<unknown>>();

function getCached<T>(key: string): T | null {
  const entry = globalCache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) { globalCache.delete(key); return null; }
  return entry.data;
}

function setCache<T>(key: string, data: T) {
  globalCache.set(key, { data, ts: Date.now() });
}

export function invalidateCache(key: string) {
  globalCache.delete(key);
}

export function invalidateAll() {
  globalCache.clear();
}

/* ── Хук ──
   cacheKey: уникальный ключ для кэширования (необязательный).
   Если передан — при наличии кэша сразу отдаёт данные (loading=false),
   фоном делает refresh и тихо обновляет. */
export function useApiData<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
  cacheKey?: string,
) {
  const cached = cacheKey ? getCached<T>(cacheKey) : null;

  const [data, setData]       = useState<T | null>(cached);
  const [loading, setLoading] = useState<boolean>(!cached);
  const [error, setError]     = useState<string | null>(null);
  const backgroundRef = useRef(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
      if (cacheKey) setCache(cacheKey, result);
    } catch (e) {
      if (!silent) setError((e as Error).message);
    } finally {
      if (!silent) setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (cached && !backgroundRef.current) {
      // Уже есть кэш — грузим тихо в фоне
      backgroundRef.current = true;
      load(true);
    } else {
      load(false);
    }
  }, [load]);

  const reload = useCallback(() => {
    if (cacheKey) invalidateCache(cacheKey);
    return load(false);
  }, [load, cacheKey]);

  return { data, loading, error, reload };
}
