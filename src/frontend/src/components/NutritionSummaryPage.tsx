import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Droplets,
  Info,
} from "lucide-react";
import type { DrinkEntry } from "../hooks/useDrinksLog";
import type { ExtendedFoodItem } from "../types";
import { calcEntryNutrition } from "../types";
import Footer from "./Footer";
import type { FoodLogItem } from "./cards/FoodLogCard";

interface Props {
  entries: FoodLogItem[];
  foodMap: Map<string, ExtendedFoodItem>;
  onBack: () => void;
  drinkEntries?: DrinkEntry[];
}

function getHealthBadge(food: ExtendedFoodItem | undefined) {
  if (!food) return { label: "Unknown", color: "bg-gray-100 text-gray-600" };
  if (food.healthWarning)
    return {
      label: "Avoid",
      color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    };
  if (food.isProcessed || (food.additives && food.additives.length > 0))
    return {
      label: "Caution",
      color:
        "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    };
  if ((food.sugar ?? 0) > 15 || (food.fat ?? 0) > 20)
    return {
      label: "Moderate",
      color:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    };
  return {
    label: "Excellent",
    color:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  };
}

function getDrinkHealthBadge(name: string): {
  label: string;
  color: string;
  note: string;
} {
  const lower = name.toLowerCase();
  if (
    lower.includes("cola") ||
    lower.includes("pepsi") ||
    lower.includes("sprite") ||
    lower.includes("fanta") ||
    lower.includes("soda") ||
    lower.includes("energy") ||
    lower.includes("red bull")
  ) {
    return {
      label: "Caution",
      color:
        "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
      note: "High sugar / additive content — limit intake",
    };
  }
  if (
    lower.includes("juice") ||
    lower.includes("smoothie") ||
    lower.includes("protein") ||
    lower.includes("milk")
  ) {
    return {
      label: "Good",
      color:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      note: "Wholesome choice",
    };
  }
  return {
    label: "Moderate",
    color:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
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

export default function NutritionSummaryPage({
  entries,
  foodMap,
  onBack,
  drinkEntries = [],
}: Props) {
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
    color: "text-green-600",
    icon: CheckCircle,
  };
  if (processedCount >= 3)
    overallAssessment = {
      label: "Watch Out",
      color: "text-red-600",
      icon: AlertTriangle,
    };
  else if (processedCount >= 1)
    overallAssessment = {
      label: "Mostly Good",
      color: "text-yellow-600",
      icon: Info,
    };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="hero-gradient py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <button
            type="button"
            onClick={onBack}
            data-ocid="nutrition.back.button"
            className="flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors text-sm"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <h1 className="text-3xl font-extrabold text-white">
            🧔 Today's Nutrition Report
          </h1>
          <p className="text-white/70 mt-1 text-sm">
            {totalItemCount} items logged today
          </p>
        </div>
      </div>

      <main className="max-w-4xl mx-auto w-full px-4 md:px-6 py-8 flex-1 space-y-5">
        {totalItemCount === 0 ? (
          <div
            data-ocid="nutrition.empty_state"
            className="bg-card rounded-xl border border-border shadow-card p-10 text-center"
          >
            <p className="text-muted-foreground">
              No foods logged today. Start logging to see your nutrition report.
            </p>
          </div>
        ) : (
          <>
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
                      className="bg-card rounded-xl border border-border shadow-card p-5"
                    >
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {item.entry.foodName}
                          </h3>
                          <p className="text-xs text-muted-foreground capitalize mt-0.5">
                            {item.entry.mealType} &middot; {item.entry.quantity}
                            g consumed
                          </p>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-semibold flex-shrink-0 ${badge.color}`}
                        >
                          {badge.label}
                        </span>
                      </div>

                      {food?.healthWarning && (
                        <div className="mb-4 flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                          <AlertTriangle
                            size={14}
                            className="text-red-600 flex-shrink-0 mt-0.5"
                          />
                          <p className="text-xs text-red-700 dark:text-red-400">
                            {food.healthWarning}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-x-6">
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                            Nutrients (consumed)
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
                          {food?.saturatedFat !== undefined && (
                            <NutrientRow
                              label="Saturated Fat"
                              value={food.saturatedFat * factor}
                              unit="g"
                            />
                          )}
                          {food?.transFat !== undefined && (
                            <NutrientRow
                              label="Trans Fat"
                              value={food.transFat * factor}
                              unit="g"
                            />
                          )}
                          {food?.cholesterol !== undefined && (
                            <NutrientRow
                              label="Cholesterol"
                              value={food.cholesterol * factor}
                              unit="mg"
                            />
                          )}
                          {food?.sodium !== undefined && (
                            <NutrientRow
                              label="Sodium"
                              value={food.sodium * factor}
                              unit="mg"
                            />
                          )}
                          {food?.addedSugar !== undefined && (
                            <NutrientRow
                              label="Added Sugar"
                              value={food.addedSugar * factor}
                              unit="g"
                            />
                          )}
                          {food?.potassium !== undefined && (
                            <NutrientRow
                              label="Potassium"
                              value={food.potassium * factor}
                              unit="mg"
                            />
                          )}
                        </div>
                        <div>
                          {food?.additives && food.additives.length > 0 && (
                            <div className="mb-3">
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
                          {food?.ingredients && food.ingredients.length > 0 && (
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

            {drinkEntries.length > 0 && (
              <>
                <h2 className="text-base font-bold text-foreground flex items-center gap-2 pt-2">
                  <Droplets size={16} className="text-blue-500" /> Drinks
                </h2>
                {drinkEntries.map((drink, idx) => {
                  const badge = getDrinkHealthBadge(drink.foodName);
                  return (
                    <div
                      key={drink.id}
                      data-ocid={`nutrition.item.${entries.length + idx + 1}`}
                      className="bg-card rounded-xl border border-border shadow-card p-5"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {drink.foodName}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Drinks &middot; {drink.quantity} ml consumed
                          </p>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-semibold flex-shrink-0 ${badge.color}`}
                        >
                          {badge.label}
                        </span>
                      </div>

                      <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-3 mb-3">
                        <Droplets
                          size={13}
                          className="text-blue-500 flex-shrink-0 mt-0.5"
                        />
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          {badge.note}
                        </p>
                      </div>

                      <div className="border-b border-border pb-1">
                        <div className="flex items-center justify-between py-1">
                          <span className="text-xs text-muted-foreground">
                            Calories
                          </span>
                          <span className="text-xs font-semibold text-foreground">
                            {drink.calories} kcal
                          </span>
                        </div>
                        <div className="flex items-center justify-between py-1">
                          <span className="text-xs text-muted-foreground">
                            Volume
                          </span>
                          <span className="text-xs font-semibold text-foreground">
                            {drink.quantity} ml
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            <div className="bg-card rounded-xl border border-border shadow-card p-5">
              <h3 className="font-semibold text-foreground mb-4">
                Total Nutrition Summary
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
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
                  { label: "Fat", value: Math.round(totals.fat), unit: "g" },
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
                <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 rounded-lg px-4 py-2 mb-3">
                  <span className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-1">
                    <Droplets size={12} /> Drinks calories included
                  </span>
                  <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
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
                        ? "1 processed item detected. Try to replace with whole food alternatives."
                        : `${processedCount} processed/additive items detected. Consider cleaner choices tomorrow.`}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
