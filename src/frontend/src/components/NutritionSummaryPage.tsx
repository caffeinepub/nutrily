import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Droplets,
  Info,
} from "lucide-react";
import { useState } from "react";
import type { DrinkEntry } from "../hooks/useDrinksLog";
import type { ExtendedFoodItem } from "../types";
import { calcEntryNutrition } from "../types";
import BestDayCard from "./BestDayCard";
import BottomNav from "./BottomNav";
import Footer from "./Footer";
import MealTimingCard from "./MealTimingCard";
import NutrientGapCard from "./NutrientGapCard";
import type { FoodLogItem } from "./cards/FoodLogCard";

interface Props {
  entries: FoodLogItem[];
  foodMap: Map<string, ExtendedFoodItem>;
  onBack: () => void;
  drinkEntries?: DrinkEntry[];
  onHome?: () => void;
  onEat?: () => void;
  onThink?: () => void;
  onMove?: () => void;
  onHistory?: () => void;
  onLeaderboard?: () => void;
}

type NutritionTab = "today" | "weekly" | "analysis";

const NUTRITION_TABS: { id: NutritionTab; label: string }[] = [
  { id: "today", label: "📋 Today" },
  { id: "weekly", label: "📅 Weekly" },
  { id: "analysis", label: "🔬 Analysis" },
];

function getHealthBadge(food: ExtendedFoodItem | undefined) {
  if (!food)
    return { label: "Unknown", color: "bg-gray-100 text-muted-foreground" };
  if (food.healthWarning)
    return { label: "Avoid", color: "bg-status-danger text-destructive" };
  if (food.isProcessed || (food.additives && food.additives.length > 0))
    return {
      label: "Caution",
      color:
        "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    };
  if ((food.sugar ?? 0) > 15 || (food.fat ?? 0) > 20)
    return { label: "Moderate", color: "bg-status-warning text-warning" };
  return { label: "Excellent", color: "bg-status-healthy text-success" };
}

function getDrinkHealthBadge(name: string): {
  label: string;
  color: string;
  note: string;
} {
  const lower = name.toLowerCase();
  if (
    ["cola", "pepsi", "sprite", "fanta", "soda", "energy", "red bull"].some(
      (k) => lower.includes(k),
    )
  )
    return {
      label: "Caution",
      color:
        "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
      note: "High sugar / additive content — limit intake",
    };
  if (["juice", "smoothie", "protein", "milk"].some((k) => lower.includes(k)))
    return {
      label: "Good",
      color: "bg-status-healthy text-success",
      note: "Wholesome choice",
    };
  return {
    label: "Moderate",
    color: "bg-status-warning text-warning",
    note: "Moderate — check sugar content",
  };
}

function NutrientRow({
  label,
  value,
  unit,
}: { label: string; value: number | undefined; unit: string }) {
  if (value === undefined || value === null) return null;
  return (
    <div className="flex items-center justify-between py-1 border-b border-border last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-semibold text-foreground">
        {Math.round(value * 10) / 10}
        {unit}
      </span>
    </div>
  );
}

function WeeklyHistoryView() {
  const days: { label: string; calories: number; items: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateKey = d.toISOString().slice(0, 10);
    const label =
      i === 0 ? "Today" : d.toLocaleDateString("en-IN", { weekday: "short" });
    try {
      const raw = localStorage.getItem(`doitepic_foodlog_${dateKey}`);
      const entries = raw ? JSON.parse(raw) : [];
      const calories = entries.reduce(
        (s: number, e: any) => s + (e.calories || 0),
        0,
      );
      days.push({
        label,
        calories: Math.round(calories),
        items: entries.length,
      });
    } catch {
      days.push({ label, calories: 0, items: 0 });
    }
  }

  const maxCal = Math.max(...days.map((d) => d.calories), 1);

  return (
    <div className="bg-card rounded-2xl border border-border p-4">
      <h3 className="text-base font-bold text-foreground mb-3">
        📅 7-Day Calorie History
      </h3>
      <div className="flex items-end gap-2 h-32 mb-2">
        {days.map((day) => {
          const pct = (day.calories / maxCal) * 100;
          const barColor =
            day.calories > 2500
              ? "bg-red-400"
              : day.calories > 1800
                ? "bg-amber-400"
                : day.calories > 0
                  ? "bg-emerald-500"
                  : "bg-muted";
          return (
            <div
              key={day.label}
              className="flex flex-col items-center flex-1 gap-1"
            >
              <span className="text-[9px] text-muted-foreground">
                {day.calories > 0 ? `${day.calories}` : ""}
              </span>
              <div
                className="w-full flex flex-col justify-end"
                style={{ height: "80px" }}
              >
                <div
                  className={`w-full rounded-t-sm ${barColor}`}
                  style={{ height: `${Math.max(4, pct * 0.8)}px` }}
                />
              </div>
              <span className="text-[9px] text-muted-foreground">
                {day.label}
              </span>
              <span className="text-[9px] text-muted-foreground/60">
                {day.items}×
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-emerald-500 inline-block" />
          Normal
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-amber-400 inline-block" />
          High
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-red-400 inline-block" />
          Very High
        </span>
      </div>
    </div>
  );
}

export default function NutritionSummaryPage({
  entries,
  foodMap,
  onBack,
  drinkEntries = [],
  onHome,
  onEat,
  onThink,
  onMove,
  onHistory,
  onLeaderboard,
}: Props) {
  const [activeTab, setActiveTab] = useState<NutritionTab>("today");

  const foodTotals = entries.reduce(
    (acc, item) => {
      const n = calcEntryNutrition(item.entry, foodMap);
      return {
        calories: acc.calories + n.calories,
        protein: acc.protein + n.protein,
        carbs: acc.carbs + n.carbs,
        fat: acc.fat + n.fat,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  const drinkCalories = drinkEntries.reduce((sum, d) => sum + d.calories, 0);
  const totals = {
    ...foodTotals,
    calories: foodTotals.calories + drinkCalories,
  };
  const totalItemCount = entries.length + drinkEntries.length;

  const processedCount = entries.filter((item) => {
    const food = foodMap.get(item.entry.foodName) as
      | ExtendedFoodItem
      | undefined;
    return (
      food?.isProcessed ||
      (food?.additives && food.additives.length > 0) ||
      !!food?.healthWarning
    );
  }).length;

  let overallAssessment = {
    label: "Great Day!",
    color: "text-success",
    icon: CheckCircle,
  };
  if (processedCount >= 3)
    overallAssessment = {
      label: "Watch Out",
      color: "text-destructive",
      icon: AlertTriangle,
    };
  else if (processedCount >= 1)
    overallAssessment = {
      label: "Mostly Good",
      color: "text-warning",
      icon: Info,
    };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 hero-gradient">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            data-ocid="nutrition.back.button"
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-base font-bold text-white">
              🧔 Nutrition Report
            </h1>
            <p className="text-xs text-white/70">
              {totalItemCount} items logged today
            </p>
          </div>
        </div>
        {/* Tab bar */}
        <div className="max-w-4xl mx-auto px-4 pb-2">
          <div className="flex gap-2 overflow-x-auto scrollbar-none">
            {NUTRITION_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                data-ocid={`nutrition.${tab.id}_tab`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${activeTab === tab.id ? "bg-white text-[#1E3A8A]" : "bg-white/20 text-white/90 hover:bg-white/30"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto w-full px-4 py-4 flex-1 space-y-3 pb-24">
        {/* TAB: Today */}
        {activeTab === "today" && (
          <div className="space-y-3">
            {totalItemCount === 0 ? (
              <div
                data-ocid="nutrition.empty_state"
                className="bg-card rounded-xl border border-border p-10 text-center"
              >
                <p className="text-muted-foreground">
                  No foods logged today. Start logging to see your nutrition
                  report.
                </p>
              </div>
            ) : (
              <>
                {/* Summary card */}
                <div className="bg-card rounded-xl border border-border p-4">
                  <h3 className="font-semibold text-foreground mb-3 text-base">
                    Total Nutrition Summary
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    {[
                      {
                        label: "Calories",
                        value: Math.round(totals.calories),
                        unit: "kcal",
                      },
                      {
                        label: "Protein",
                        value: Math.round(totals.protein),
                        unit: "g",
                      },
                      {
                        label: "Carbs",
                        value: Math.round(totals.carbs),
                        unit: "g",
                      },
                      {
                        label: "Fat",
                        value: Math.round(totals.fat),
                        unit: "g",
                      },
                    ].map(({ label, value, unit }) => (
                      <div
                        key={label}
                        className="text-center bg-muted/50 rounded-lg p-3"
                      >
                        <p className="text-xl font-bold text-primary">
                          {value}
                          <span className="text-xs font-normal text-muted-foreground ml-1">
                            {unit}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">{label}</p>
                      </div>
                    ))}
                  </div>
                  {drinkEntries.length > 0 && (
                    <div className="flex items-center justify-between bg-status-info rounded-lg px-4 py-2 mb-3">
                      <span className="text-xs text-primary flex items-center gap-1">
                        <Droplets size={12} /> Drinks calories included
                      </span>
                      <span className="text-xs font-semibold text-primary">
                        +{Math.round(drinkCalories)} kcal
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-3">
                    <overallAssessment.icon
                      size={18}
                      className={overallAssessment.color}
                    />
                    <div>
                      <p
                        className={`font-semibold text-sm ${overallAssessment.color}`}
                      >
                        {overallAssessment.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {processedCount === 0
                          ? "No processed foods detected. Well balanced day!"
                          : processedCount === 1
                            ? "1 processed item detected. Try whole food alternatives."
                            : `${processedCount} processed/additive items detected. Consider cleaner choices tomorrow.`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Food items */}
                {entries.length > 0 && (
                  <>
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      🥗 Foods
                    </h2>
                    {entries.map((item, idx) => {
                      const food = foodMap.get(item.entry.foodName) as
                        | ExtendedFoodItem
                        | undefined;
                      const nutrition = calcEntryNutrition(item.entry, foodMap);
                      const badge = getHealthBadge(food);
                      const factor = item.entry.quantity / 100;
                      return (
                        <div
                          key={`${item.entry.foodName}-${item.id}-${idx}`}
                          data-ocid={`nutrition.item.${idx + 1}`}
                          className="bg-card rounded-xl border border-border p-4"
                        >
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div>
                              <h3 className="font-semibold text-foreground">
                                {item.entry.foodName}
                              </h3>
                              <p className="text-xs text-muted-foreground capitalize mt-0.5">
                                {item.entry.mealType} · {item.entry.quantity}g
                                consumed
                              </p>
                            </div>
                            <span
                              className={`text-xs px-2 py-1 rounded-full font-semibold flex-shrink-0 ${badge.color}`}
                            >
                              {badge.label}
                            </span>
                          </div>
                          {food?.healthWarning && (
                            <div className="mb-3 flex items-start gap-2 bg-status-danger border border-destructive/30 rounded-lg p-3">
                              <AlertTriangle
                                size={14}
                                className="text-destructive flex-shrink-0 mt-0.5"
                              />
                              <p className="text-xs text-destructive">
                                {food.healthWarning}
                              </p>
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-x-4">
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                                Nutrients
                              </p>
                              <NutrientRow
                                label="Calories"
                                value={nutrition.calories}
                                unit=" kcal"
                              />
                              <NutrientRow
                                label="Protein"
                                value={nutrition.protein}
                                unit="g"
                              />
                              <NutrientRow
                                label="Carbohydrates"
                                value={nutrition.carbs}
                                unit="g"
                              />
                              <NutrientRow
                                label="Fat"
                                value={nutrition.fat}
                                unit="g"
                              />
                              {food && (
                                <NutrientRow
                                  label="Fiber"
                                  value={food.fiber * factor}
                                  unit="g"
                                />
                              )}
                              {food && (
                                <NutrientRow
                                  label="Sugar"
                                  value={food.sugar * factor}
                                  unit="g"
                                />
                              )}
                              {food?.sodium !== undefined && (
                                <NutrientRow
                                  label="Sodium"
                                  value={food.sodium * factor}
                                  unit="mg"
                                />
                              )}
                            </div>
                            <div>
                              {food?.additives && food.additives.length > 0 && (
                                <div className="mb-2">
                                  <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-1">
                                    Additives
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {food.additives.map((a) => (
                                      <span
                                        key={a}
                                        className="text-[10px] px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                                      >
                                        {a}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {food?.ingredients &&
                                food.ingredients.length > 0 && (
                                  <div>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                                      Ingredients
                                    </p>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                      {food.ingredients.join(", ")}
                                    </p>
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}

                {/* Drinks */}
                {drinkEntries.length > 0 && (
                  <>
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2 pt-1">
                      <Droplets size={16} className="text-primary" /> Drinks
                    </h2>
                    {drinkEntries.map((drink, idx) => {
                      const badge = getDrinkHealthBadge(drink.foodName);
                      return (
                        <div
                          key={drink.id}
                          data-ocid={`nutrition.item.${entries.length + idx + 1}`}
                          className="bg-card rounded-xl border border-border p-4"
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div>
                              <h3 className="font-semibold text-foreground">
                                {drink.foodName}
                              </h3>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Drinks · {drink.quantity} ml consumed
                              </p>
                            </div>
                            <span
                              className={`text-xs px-2 py-1 rounded-full font-semibold flex-shrink-0 ${badge.color}`}
                            >
                              {badge.label}
                            </span>
                          </div>
                          <div className="flex items-start gap-2 bg-status-info border border-primary/20 rounded-lg p-2.5 mb-2">
                            <Droplets
                              size={12}
                              className="text-primary flex-shrink-0 mt-0.5"
                            />
                            <p className="text-xs text-primary">{badge.note}</p>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-xs text-muted-foreground">
                              Calories
                            </span>
                            <span className="text-xs font-semibold">
                              {drink.calories} kcal
                            </span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-xs text-muted-foreground">
                              Volume
                            </span>
                            <span className="text-xs font-semibold">
                              {drink.quantity} ml
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* TAB: Weekly */}
        {activeTab === "weekly" && (
          <div className="space-y-3">
            <WeeklyHistoryView />
          </div>
        )}

        {/* TAB: Analysis */}
        {activeTab === "analysis" && (
          <div className="space-y-3">
            {totalItemCount === 0 ? (
              <div
                data-ocid="nutrition.empty_state"
                className="bg-card rounded-xl border border-border p-10 text-center"
              >
                <p className="text-muted-foreground">
                  Log foods today to see your nutrition analysis.
                </p>
              </div>
            ) : (
              <>
                <NutrientGapCard
                  nutrients={{
                    protein: totals.protein,
                    fiber: 0,
                    calories: totals.calories,
                  }}
                />
                <MealTimingCard
                  entries={entries.map((item) => ({
                    mealType: item.entry.mealType,
                    timestamp: undefined,
                  }))}
                />
                <BestDayCard
                  todayScore={Math.min(
                    100,
                    Math.round(
                      (totals.calories / 2000) * 30 +
                        (totals.protein / 60) * 40 +
                        (entries.length >= 3 ? 30 : entries.length * 10),
                    ),
                  )}
                />
              </>
            )}
          </div>
        )}
      </main>

      <Footer />
      <BottomNav
        activePage="eat"
        onHome={onHome ?? onBack}
        onEat={onEat ?? onBack}
        onThink={onThink ?? onBack}
        onMove={onMove ?? onBack}
        onHistory={onHistory}
        onLeaderboard={onLeaderboard}
      />
    </div>
  );
}
