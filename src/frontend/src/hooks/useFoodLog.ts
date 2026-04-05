import { useState } from "react";
import type { MealType } from "../types";

export interface FoodLogEntryLocal {
  id: string;
  foodName: string;
  quantity: number;
  mealType: string;
  timestamp: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

function getTodayKey(): string {
  const d = new Date();
  return `doitepic_foodlog_${d.toISOString().slice(0, 10)}`;
}

export function getAllLogs(): { date: string; entries: FoodLogEntryLocal[] }[] {
  const results: { date: string; entries: FoodLogEntryLocal[] }[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("doitepic_foodlog_")) {
        const date = key.replace("doitepic_foodlog_", "");
        const raw = localStorage.getItem(key);
        if (raw) {
          const entries = JSON.parse(raw) as FoodLogEntryLocal[];
          if (entries.length > 0) {
            results.push({ date, entries });
          }
        }
      }
    }
  } catch {
    // ignore parse errors
  }
  return results.sort((a, b) => b.date.localeCompare(a.date));
}

export function useFoodLog() {
  const [entries, setEntries] = useState<FoodLogEntryLocal[]>(() => {
    try {
      const stored = localStorage.getItem(getTodayKey());
      return stored ? (JSON.parse(stored) as FoodLogEntryLocal[]) : [];
    } catch {
      return [];
    }
  });

  const addFood = (entry: Omit<FoodLogEntryLocal, "id" | "timestamp">) => {
    const newEntry: FoodLogEntryLocal = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      timestamp: Date.now(),
    };
    setEntries((prev) => {
      const next = [...prev, newEntry];
      try {
        localStorage.setItem(getTodayKey(), JSON.stringify(next));
      } catch {
        // storage quota exceeded — ignore
      }
      return next;
    });
  };

  const removeFood = (id: string) => {
    setEntries((prev) => {
      const next = prev.filter((e) => e.id !== id);
      try {
        localStorage.setItem(getTodayKey(), JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Map to FoodLogItem shape for FoodLogCard compatibility, preserving stored nutrition
  const foodLogItems = entries.map((e) => ({
    id: e.id,
    entry: {
      foodName: e.foodName,
      quantity: e.quantity,
      mealType: e.mealType as MealType,
      _calories: e.calories,
      _protein: e.protein,
      _carbs: e.carbs,
      _fat: e.fat,
    },
  }));

  return { entries, foodLogItems, addFood, removeFood };
}
