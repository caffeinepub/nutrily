import { useState } from "react";
import type { ExtendedFoodItem } from "../types";

interface Props {
  allFoods: ExtendedFoodItem[];
  onAddToLog: (food: ExtendedFoodItem) => void;
}

const EGG_NAMES = [
  "Boiled Eggs",
  "Eggs",
  "Egg Bhurji",
  "Egg Curry",
  "Egg Roast",
];

const EGG_BENEFITS = [
  {
    icon: "💪",
    label: "High Protein",
    value: "13g per 100g",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: "🧠",
    label: "Brain Health",
    value: "Rich in Choline",
    color: "from-purple-500 to-purple-600",
  },
  {
    icon: "👁️",
    label: "Eye Health",
    value: "Lutein & Zeaxanthin",
    color: "from-amber-500 to-amber-600",
  },
  {
    icon: "🦴",
    label: "Strong Bones",
    value: "Vitamin D",
    color: "from-emerald-500 to-emerald-600",
  },
];

const EGG_FACTS = [
  "1 whole egg = ~6g protein + all 9 essential amino acids",
  "Eggs are the gold standard for protein quality (PDCAAS = 1.0)",
  "2 boiled eggs post-workout = fast muscle recovery",
  "Yolk has Vitamin B12, Selenium, and Choline — don't skip it!",
  "Eggs keep you full longer — ideal for weight management",
];

const EGG_MEALS = [
  { name: "Morning", suggestion: "2-4 boiled eggs with banana", emoji: "🌅" },
  {
    name: "Post-Workout",
    suggestion: "3 eggs scrambled or boiled",
    emoji: "🏋️",
  },
  { name: "Lunch", suggestion: "Egg curry with rice", emoji: "🍛" },
  { name: "Snack", suggestion: "1-2 boiled eggs with tea", emoji: "☕" },
];

export default function EggSpotlightCard({ allFoods, onAddToLog }: Props) {
  const [factIndex, setFactIndex] = useState(0);
  const [tab, setTab] = useState<"quick" | "benefits" | "when">("quick");

  const eggFoods = allFoods.filter((f) =>
    EGG_NAMES.some((n) => f.name.toLowerCase().includes(n.toLowerCase())),
  );

  const fallbackEggFoods: ExtendedFoodItem[] = EGG_NAMES.map((name) => ({
    name,
    category: "Protein",
    caloriesPer100g: 155,
    protein: 13,
    carbs: 1.1,
    fat: 11,
    fiber: 0,
    sugar: 1,
    servingSize: 50,
    servingUnit: "g",
    isProcessed: false,
    additives: [],
    ingredients: ["egg"],
    dishIngredients: "Egg 100%",
    region: "Global",
  }));

  const displayFoods = eggFoods.length > 0 ? eggFoods : fallbackEggFoods;

  const nextFact = () => setFactIndex((i) => (i + 1) % EGG_FACTS.length);

  return (
    <div className="rounded-2xl overflow-hidden border border-amber-200/60 dark:border-amber-800/40 shadow-md bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 mb-3">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🥚</span>
          <div>
            <h3 className="text-white font-bold text-base leading-tight">
              Egg Power Zone
            </h3>
            <p className="text-white/80 text-[11px]">
              Nature's most complete protein
            </p>
          </div>
        </div>
        <div className="bg-white/20 rounded-full px-3 py-1">
          <span className="text-white text-[11px] font-semibold">
            ⭐ Superfood
          </span>
        </div>
      </div>

      {/* Rotating Fact Banner */}
      <button
        type="button"
        onClick={nextFact}
        className="w-full bg-amber-100/70 dark:bg-amber-900/30 px-4 py-2.5 text-left hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors group"
      >
        <div className="flex items-start gap-2">
          <span className="text-amber-600 font-bold text-xs mt-0.5 flex-shrink-0">
            💡 DID YOU KNOW
          </span>
          <p className="text-xs text-amber-900 dark:text-amber-200 font-medium flex-1 leading-relaxed">
            {EGG_FACTS[factIndex]}
          </p>
          <span className="text-amber-500 text-[10px] opacity-70 group-hover:opacity-100 flex-shrink-0 mt-0.5">
            tap for more ›
          </span>
        </div>
      </button>

      {/* Tabs */}
      <div className="flex gap-1 px-3 pt-3">
        {(["quick", "benefits", "when"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              tab === t
                ? "bg-amber-500 text-white shadow-sm"
                : "bg-white/60 dark:bg-white/10 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40"
            }`}
          >
            {t === "quick"
              ? "Quick Add"
              : t === "benefits"
                ? "Benefits"
                : "Best Times"}
          </button>
        ))}
      </div>

      <div className="px-3 pt-2 pb-3">
        {/* Quick Add Tab */}
        {tab === "quick" && (
          <div className="space-y-1.5">
            {displayFoods.slice(0, 5).map((food) => {
              const perEgg = food.caloriesPer100g * (food.servingSize / 100);
              const proteinPerEgg = food.protein * (food.servingSize / 100);
              return (
                <div
                  key={food.name}
                  className="flex items-center gap-2 bg-white/70 dark:bg-white/10 rounded-xl px-3 py-2.5 hover:bg-white dark:hover:bg-white/20 transition-colors"
                >
                  <span className="text-lg flex-shrink-0">🥚</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {food.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-orange-600 font-medium">
                        {Math.round(perEgg)} kcal
                      </span>
                      <span className="text-[10px] text-blue-600 font-medium">
                        {proteinPerEgg.toFixed(1)}g protein
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        per serving
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onAddToLog(food)}
                    className="bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-colors flex-shrink-0"
                  >
                    + Log
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Benefits Tab */}
        {tab === "benefits" && (
          <div className="grid grid-cols-2 gap-2 mt-1">
            {EGG_BENEFITS.map((b) => (
              <div
                key={b.label}
                className={`bg-gradient-to-br ${b.color} rounded-xl p-3 text-white`}
              >
                <div className="text-xl mb-1">{b.icon}</div>
                <p className="text-xs font-bold leading-tight">{b.label}</p>
                <p className="text-[10px] opacity-90 mt-0.5">{b.value}</p>
              </div>
            ))}
            <div className="col-span-2 bg-white/60 dark:bg-white/10 rounded-xl p-3">
              <p className="text-xs font-bold text-amber-800 dark:text-amber-200 mb-1">
                🥚 Whole Egg Nutrition (per egg ~50g)
              </p>
              <div className="grid grid-cols-4 gap-1">
                {[
                  {
                    label: "Calories",
                    value: "78 kcal",
                    color: "text-orange-600",
                  },
                  { label: "Protein", value: "6.5g", color: "text-blue-600" },
                  { label: "Fat", value: "5.5g", color: "text-purple-600" },
                  { label: "Carbs", value: "0.6g", color: "text-green-600" },
                ].map((n) => (
                  <div key={n.label} className="text-center">
                    <p className={`text-xs font-bold ${n.color}`}>{n.value}</p>
                    <p className="text-[9px] text-muted-foreground">
                      {n.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Best Times Tab */}
        {tab === "when" && (
          <div className="space-y-2 mt-1">
            {EGG_MEALS.map((m) => (
              <div
                key={m.name}
                className="flex items-center gap-3 bg-white/70 dark:bg-white/10 rounded-xl px-3 py-2.5"
              >
                <span className="text-xl flex-shrink-0">{m.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground">{m.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {m.suggestion}
                  </p>
                </div>
                <span className="text-[10px] font-semibold text-amber-600 bg-amber-100 dark:bg-amber-900/40 px-2 py-1 rounded-full flex-shrink-0">
                  Ideal
                </span>
              </div>
            ))}
            <div className="bg-amber-100/70 dark:bg-amber-900/30 rounded-xl p-3 mt-1">
              <p className="text-[11px] text-amber-800 dark:text-amber-200 font-medium text-center">
                🎯 Target: <span className="font-bold">3–5 eggs/day</span> for
                muscle gain goals
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
