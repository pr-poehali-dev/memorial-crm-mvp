import { useState, useEffect, useCallback } from "react";
import { getCached, fetchCached, invalidateCache } from "@/store/dataCache";

/*
  Если передан cacheKey — данные кэшируются между переходами по вкладкам
  (мгновенный показ из памяти + фоновое обновление). Без cacheKey работает как раньше.
*/
export function useApiData<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
  cacheKey?: string,
) {
  const cached = cacheKey ? getCached<T>(cacheKey) : undefined;
  const [data, setData]       = useState<T | null>(cached ?? null);
  const [loading, setLoading] = useState(cached === undefined);
  const [error, setError]     = useState<string | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const result = cacheKey
        ? await fetchCached<T>(cacheKey, fetcher)
        : await fetcher();
      setData(result);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (cacheKey) {
      const entry = getCached<T>(cacheKey);
      if (entry !== undefined) {
        setData(entry);
        setLoading(false);
        load(true); // фоновое обновление без спиннера
        return;
      }
    }
    load(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load]);

  const reload = useCallback(() => {
    if (cacheKey) invalidateCache(cacheKey);
    return load(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load]);

  return { data, loading, error, reload };
}