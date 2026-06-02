"use client";

import { useState, useEffect, useCallback } from "react";

export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
): [T, (value: T) => void] {
  const [stored, setStored] = useState<T>(defaultValue);

  useEffect(() => {
    try {
      const item = localStorage.getItem(key);
      if (item !== null) {
        setStored(JSON.parse(item) as T);
      }
    } catch {
      // corrupted storage — stay with default
    }
  }, [key]);

  const setValue = useCallback(
    (value: T) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // storage full or unavailable — still update state
      }
      setStored(value);
    },
    [key],
  );

  return [stored, setValue];
}
