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

  // Map to FoodLogItem shape for FoodLogCard compatibility
  const foodLogItems = entries.map((e) => ({
    id: e.id,
    entry: {
      foodName: e.foodName,
      quantity: e.quantity,
      mealType: e.mealType as MealType,
    },
  }));

  return { entries, foodLogItems, addFood, removeFood };
}
