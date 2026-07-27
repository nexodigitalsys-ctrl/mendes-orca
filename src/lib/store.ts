"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useLocalCollection<T extends { [key: string]: any }>(
  key: string,
  seed: T[]
): [T[], (updater: T[] | ((prev: T[]) => T[])) => void] {
  const [items, setItems] = useState<T[]>(seed);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as T[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed);
        }
      }
    } catch {
      // keep seed
    }
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (hydrated) {
      try {
        localStorage.setItem(key, JSON.stringify(items));
      } catch {
        // storage full — ignore
      }
    }
  }, [items, key, hydrated]);

  const set = useCallback(
    (updater: T[] | ((prev: T[]) => T[])) => {
      setItems((prev) => (typeof updater === "function" ? (updater as (p: T[]) => T[])(prev) : updater));
    },
    []
  );

  return [items, set];
}

type SupabaseCollectionOptions<T> = {
  endpoint: string;
  seed: T[];
  localStorageKey?: string;
  migrate?: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useSupabaseCollection<T extends { [key: string]: any }>(
  options: SupabaseCollectionOptions<T>
): [T[], (updater: T[] | ((prev: T[]) => T[])) => void, boolean, string | null] {
  const { endpoint, seed, localStorageKey, migrate = true } = options;
  const [items, setItems] = useState<T[]>(seed);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialLoadDone = useRef(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error(`Erro ao carregar: ${res.status}`);
      const data = (await res.json()) as T[];
      setItems(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      return null;
    }
  }, [endpoint]);

  const saveData = useCallback(
    async (data: T[]) => {
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(`Erro ao salvar: ${res.status}`);
        const saved = (await res.json()) as T[];
        setItems(saved);
        return saved;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
        return null;
      }
    },
    [endpoint]
  );

  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;

    (async () => {
      setLoading(true);
      const remote = await fetchData();

      if (migrate && localStorageKey) {
        try {
          const raw = localStorage.getItem(localStorageKey);
          const local = raw ? (JSON.parse(raw) as T[]) : [];
          if (local.length > 0 && (!remote || remote.length === 0)) {
            await saveData(local);
            localStorage.removeItem(localStorageKey);
          }
        } catch {
          // ignore parse errors
        }
      }

      setLoading(false);
    })();
  }, [fetchData, saveData, migrate, localStorageKey]);

  const set = useCallback(
    (updater: T[] | ((prev: T[]) => T[])) => {
      setItems((prev) => {
        const next = typeof updater === "function" ? (updater as (p: T[]) => T[])(prev) : updater;
        saveData(next).then((saved) => {
          if (!saved) {
            console.error("[useSupabaseCollection] save failed, reverting");
            setItems(prev);
            setError("Falha ao salvar no servidor. Tente novamente.");
          }
        });
        return next;
      });
    },
    [saveData]
  );

  return [items, set, loading, error];
}

export async function uploadImage(file: string, path: string): Promise<string> {
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ file, path }),
  });
  if (!res.ok) throw new Error("Erro ao enviar imagem");
  const data = await res.json();
  return data.url as string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useSupabaseCompany<T extends { [key: string]: any }>(
  seed: T
): [T, (updater: T | ((prev: T) => T)) => void, boolean, string | null] {
  const [item, setItem] = useState<T>(seed);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialLoadDone = useRef(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/company");
      if (!res.ok) throw new Error(`Erro ao carregar: ${res.status}`);
      const data = (await res.json()) as T | null;
      if (data) setItem(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      return null;
    }
  }, []);

  const saveData = useCallback(async (data: T) => {
    try {
      const res = await fetch("/api/company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`Erro ao salvar: ${res.status}`);
      const saved = (await res.json()) as T[];
      if (saved && saved.length > 0) setItem(saved[0]);
      return saved;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      return null;
    }
  }, []);

  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;

    (async () => {
      setLoading(true);
      const remote = await fetchData();

      try {
        const raw = localStorage.getItem("mendes-company");
        const local = raw ? (JSON.parse(raw) as T[]) : [];
        if (local.length > 0 && !remote) {
          await saveData(local[0]);
          localStorage.removeItem("mendes-company");
        }
      } catch {
        // ignore
      }

      setLoading(false);
    })();
  }, [fetchData, saveData]);

  const set = useCallback(
    (updater: T | ((prev: T) => T)) => {
      setItem((prev) => {
        const next = typeof updater === "function" ? (updater as (p: T) => T)(prev) : updater;
        saveData(next).then((saved) => {
          if (!saved) {
            console.error("[useSupabaseCompany] save failed, reverting");
            setItem(prev);
            setError("Falha ao salvar no servidor. Tente novamente.");
          }
        });
        return next;
      });
    },
    [saveData]
  );

  return [item, set, loading, error];
}
