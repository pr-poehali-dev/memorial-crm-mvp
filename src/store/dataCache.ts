import { useEffect, useRef, useState, useCallback } from "react";

/*
  Лёгкий кэш данных (stale-while-revalidate).
  - При первом заходе грузим с сервера и показываем спиннер.
  - При повторных заходах на вкладку — мгновенно отдаём данные из памяти,
    а свежие подгружаем в фоне (без спиннера).
  Это убирает «моргание загрузки» при каждом переходе между вкладками.
*/

type CacheEntry<T> = { data: T; ts: number };

const store = new Map<string, CacheEntry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

export function getCached<T>(key: string): T | undefined {
  return store.get(key)?.data as T | undefined;
}

export function setCached<T>(key: string, data: T) {
  store.set(key, { data, ts: Date.now() });
}

/** Сбросить кэш (например, после мутации) */
export function invalidateCache(key?: string) {
  if (key) store.delete(key);
  else store.clear();
}

/**
 * Загружает данные с дедупликацией одновременных запросов.
 * Если запрос с тем же ключом уже летит — переиспользуем его промис.
 */
export function fetchCached<T>(key: string, loader: () => Promise<T>): Promise<T> {
  const existing = inflight.get(key);
  if (existing) return existing as Promise<T>;

  const p = loader()
    .then(data => {
      setCached(key, data);
      return data;
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, p);
  return p;
}

type Options = {
  /** Кэш считается свежим в течение N мс — фоновое обновление пропускается */
  staleMs?: number;
};

/**
 * Хук с мгновенной отдачей кэша и фоновым обновлением.
 * loading=true только когда данных в кэше ещё нет.
 */
export function useCachedData<T>(
  key: string,
  loader: () => Promise<T>,
  options: Options = {},
) {
  const { staleMs = 15_000 } = options;
  const cached = getCached<T>(key);
  const [data, setData] = useState<T | undefined>(cached);
  const [loading, setLoading] = useState<boolean>(cached === undefined);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  const refresh = useCallback((silent = false) => {
    if (!silent && getCached<T>(key) === undefined) setLoading(true);
    return fetchCached<T>(key, () => loaderRef.current())
      .then(fresh => {
        setData(fresh);
        return fresh;
      })
      .catch(err => { console.error(err); throw err; })
      .finally(() => setLoading(false));
     
  }, [key]);

  useEffect(() => {
    const entry = store.get(key);
    const isFresh = entry && Date.now() - entry.ts < staleMs;

    if (entry === undefined) {
      // данных нет — грузим со спиннером
      refresh(false);
    } else {
      // данные есть — показываем мгновенно, обновляем в фоне если устарели
      setData(entry.data as T);
      setLoading(false);
      if (!isFresh) refresh(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { data, loading, refresh, setData };
}
