import type { FoodItem, FoodLogEntry, MealType } from "./backend";

export type { FoodItem, FoodLogEntry, MealType };

// LocalMealType extends the backend MealType with frontend-only "drinks"
export type LocalMealType = MealType | "drinks";

// Local entry type for localStorage-based food log (no backend `date` field needed)
export interface LocalFoodEntry {
  foodName: string;
  quantity: number;
  mealType: string;
}

// ExtendedFoodItem omits the required `region` from FoodItem so legacy food database
// entries (which don't have a region) remain valid. Region is re-declared as optional.
export interface ExtendedFoodItem extends Omit<FoodItem, "region"> {
  region?: string;
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
  /** Honesty rating for Food Honesty Meter */
  honestyRating?: "clean" | "moderate" | "processed";
  /** Ingredient breakdown string e.g. "Rice 60% · Chicken 25% · Oil 15%" */
  dishIngredients?: string;
}

export const DAILY_GOALS = {
  calories: 2300,
  protein: 150,
  carbs: 250,
  fat: 75,
  water: 8,
};

export function getTodayStartNs(): bigint {
  const now = new Date();
  const utcMidnight = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  return BigInt(utcMidnight) * 1_000_000n;
}

export function calcEntryNutrition(
  entry: LocalFoodEntry,
  foodMap: Map<string, ExtendedFoodItem>,
) {
  const food = foodMap.get(entry.foodName);
  if (!food) return { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
  const factor = entry.quantity / 100;
  return {
    calories: food.caloriesPer100g * factor,
    protein: food.protein * factor,
    carbs: food.carbs * factor,
    fat: food.fat * factor,
    fiber: (food.fiber ?? 0) * factor,
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

// MEAL_TYPES includes all backend types + frontend-only "drinks"
export const MEAL_TYPES: { value: LocalMealType; label: string }[] = [
  { value: "breakfast" as MealType, label: "Breakfast" },
  { value: "lunch" as MealType, label: "Lunch" },
  { value: "dinner" as MealType, label: "Dinner" },
  { value: "snack" as MealType, label: "Snack" },
  { value: "drinks", label: "Drinks" },
];

// ─── Extended Types (backend.d.ts declarations not yet in generated backend.ts) ──

export type Time = bigint;

export enum AnnouncementTarget {
  all = "all",
  weightLoss = "weightLoss",
  muscleGain = "muscleGain",
  maintenance = "maintenance",
}

export enum ReportStatus {
  pending = "pending",
  resolved = "resolved",
  dismissed = "dismissed",
}

export interface DietPlan {
  id: bigint;
  name: string;
  goalType: import("./backend").ProfileGoal;
  description: string;
  dailyCalorieTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
  recommendedFoods: Array<string>;
  mealTimingSuggestions: Array<string>;
}

export interface Article {
  id: bigint;
  title: string;
  category: string;
  body: string;
  imageUrl: string;
  createdAt: Time;
}

export interface Announcement {
  id: bigint;
  title: string;
  message: string;
  targetGoal: AnnouncementTarget;
  createdAt: Time;
  isActive: boolean;
}

export interface UserReport {
  id: bigint;
  reportedBy: import("@icp-sdk/core/principal").Principal;
  reportType: string;
  description: string;
  targetFoodName: string | null;
  status: ReportStatus;
  createdAt: Time;
}
