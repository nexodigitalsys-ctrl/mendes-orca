"use client";

import { useState, useEffect, useCallback } from "react";

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
