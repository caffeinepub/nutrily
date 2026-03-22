import { useEffect, useState } from "react";
import { useNetworkStatus } from "./useNetworkStatus";

const FOOD_CACHE_KEY = "doitepic_food_cache";
const OFFLINE_QUEUE_KEY = "doitepic_offline_queue";

export function useFoodCache<T>(liveFoods: T[]): T[] {
  useEffect(() => {
    if (liveFoods.length > 0) {
      try {
        localStorage.setItem(FOOD_CACHE_KEY, JSON.stringify(liveFoods));
      } catch (_) {
        // storage full — skip
      }
    }
  }, [liveFoods]);

  const isOnline = useNetworkStatus();

  if (!isOnline && liveFoods.length === 0) {
    try {
      const cached = localStorage.getItem(FOOD_CACHE_KEY);
      if (cached) return JSON.parse(cached) as T[];
    } catch (_) {
      // parse error
    }
  }
  return liveFoods;
}

export function useOfflineQueue() {
  const isOnline = useNetworkStatus();
  const [queueCount, setQueueCount] = useState<number>(() => {
    try {
      const q = localStorage.getItem(OFFLINE_QUEUE_KEY);
      return q ? (JSON.parse(q) as unknown[]).length : 0;
    } catch (_) {
      return 0;
    }
  });

  // Listen to online/offline events to update queue count
  useEffect(() => {
    const update = () => {
      try {
        const q = localStorage.getItem(OFFLINE_QUEUE_KEY);
        setQueueCount(q ? (JSON.parse(q) as unknown[]).length : 0);
      } catch (_) {
        setQueueCount(0);
      }
    };
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  const addToQueue = (item: unknown) => {
    try {
      const q = localStorage.getItem(OFFLINE_QUEUE_KEY);
      const arr: unknown[] = q ? JSON.parse(q) : [];
      arr.push(item);
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(arr));
      setQueueCount(arr.length);
    } catch (_) {
      // ignore
    }
  };

  const flushQueue = () => {
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
    setQueueCount(0);
  };

  return { isOnline, queueCount, addToQueue, flushQueue };
}
