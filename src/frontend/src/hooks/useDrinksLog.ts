import { useState } from "react";

export interface DrinkEntry {
  id: string;
  foodName: string;
  quantity: number; // ml / grams
  calories: number;
  timestamp: number;
}

function getTodayKey(): string {
  const d = new Date();
  return `doitepic_drinks_${d.toISOString().slice(0, 10)}`;
}

export function useDrinksLog() {
  const [drinks, setDrinks] = useState<DrinkEntry[]>(() => {
    try {
      const stored = localStorage.getItem(getTodayKey());
      return stored ? (JSON.parse(stored) as DrinkEntry[]) : [];
    } catch {
      return [];
    }
  });

  const addDrink = (entry: Omit<DrinkEntry, "id" | "timestamp">) => {
    const newEntry: DrinkEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      timestamp: Date.now(),
    };
    setDrinks((prev) => {
      const next = [...prev, newEntry];
      try {
        localStorage.setItem(getTodayKey(), JSON.stringify(next));
      } catch {
        // storage quota exceeded — ignore
      }
      return next;
    });
  };

  const removeDrink = (id: string) => {
    setDrinks((prev) => {
      const next = prev.filter((d) => d.id !== id);
      try {
        localStorage.setItem(getTodayKey(), JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const totalDrinkCalories = drinks.reduce((sum, d) => sum + d.calories, 0);

  return { drinks, addDrink, removeDrink, totalDrinkCalories };
}
