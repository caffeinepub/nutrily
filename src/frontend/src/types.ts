import type { FoodItem, FoodLogEntry, MealType } from "./backend";

export type { FoodItem, FoodLogEntry, MealType };

export interface ExtendedFoodItem extends FoodItem {
  addedSugar?: number;
  saturatedFat?: number;
  transFat?: number;
  cholesterol?: number;
  sodium?: number;
  potassium?: number;
  additives?: string[];
  ingredients?: string[];
  healthWarning?: string;
  isProcessed?: boolean;
}

export const DAILY_GOALS = {
  calories: 2300,
  protein: 150,
  carbs: 250,
  fat: 75,
  water: 8,
};

export function getTodayStartNs(): bigint {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return BigInt(today.getTime()) * 1_000_000n;
}

export function calcEntryNutrition(
  entry: FoodLogEntry,
  foodMap: Map<string, ExtendedFoodItem>,
) {
  const food = foodMap.get(entry.foodName);
  if (!food) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const factor = entry.quantity / 100;
  return {
    calories: food.caloriesPer100g * factor,
    protein: food.protein * factor,
    carbs: food.carbs * factor,
    fat: food.fat * factor,
  };
}

export function calcMealQualityScore(
  calories: number,
  protein: number,
  carbs: number,
  fat: number,
): { score: number; grade: string } {
  if (calories === 0) return { score: 0, grade: "—" };
  let score = 100;
  const ratios = [
    calories / DAILY_GOALS.calories,
    protein / DAILY_GOALS.protein,
    carbs / DAILY_GOALS.carbs,
    fat / DAILY_GOALS.fat,
  ];
  for (const r of ratios) {
    if (r > 1.5) score -= 15;
    else if (r < 0.3) score -= 10;
  }
  score = Math.max(0, Math.min(100, score));
  let grade = "F";
  if (score >= 90) grade = "A";
  else if (score >= 75) grade = "B";
  else if (score >= 60) grade = "C";
  else if (score >= 45) grade = "D";
  return { score, grade };
}

export const MEAL_TYPES: { value: MealType; label: string }[] = [
  { value: "breakfast" as MealType, label: "Breakfast" },
  { value: "lunch" as MealType, label: "Lunch" },
  { value: "dinner" as MealType, label: "Dinner" },
  { value: "snack" as MealType, label: "Snack" },
];
