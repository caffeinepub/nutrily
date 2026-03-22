import { Plus } from "lucide-react";
import { MEAL_TYPES, calcEntryNutrition } from "../../types";
import type { FoodItem, FoodLogEntry, MealType } from "../../types";

interface Props {
  entries: FoodLogEntry[];
  foodMap: Map<string, FoodItem>;
  onAddFood: (mealType: string) => void;
}

export default function FoodLogCard({ entries, foodMap, onAddFood }: Props) {
  const byMeal = MEAL_TYPES.map(({ value, label }) => ({
    type: value as MealType,
    label,
    items: entries.filter((e) => e.mealType === value),
  }));

  const totalCalories = entries.reduce(
    (sum, entry) => sum + calcEntryNutrition(entry, foodMap).calories,
    0,
  );

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Food Log</h3>
        <button
          type="button"
          data-ocid="food_log.open_modal_button"
          onClick={() => onAddFood("")}
          className="text-xs text-primary font-medium hover:opacity-80 transition-opacity"
        >
          + Add
        </button>
      </div>

      <div className="space-y-4">
        {byMeal.map(({ type, label, items }) => (
          <div key={type}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              {label}
            </p>
            {items.length === 0 ? (
              <button
                type="button"
                data-ocid={`food_log.${type}.open_modal_button`}
                onClick={() => onAddFood(type)}
                className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg py-3 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors group"
              >
                <Plus
                  size={14}
                  className="group-hover:scale-110 transition-transform"
                />
                Add {label}
              </button>
            ) : (
              <div className="space-y-1">
                {items.map((entry, idx) => {
                  const nutrition = calcEntryNutrition(entry, foodMap);
                  return (
                    <div
                      key={`${entry.foodName}-${idx}`}
                      data-ocid={`food_log.item.${(idx + 1) as 1}`}
                      className="flex items-center gap-2 py-2 border-b border-border last:border-0"
                    >
                      <div className="w-7 h-7 rounded bg-accent text-sm flex items-center justify-center flex-shrink-0">
                        🥘
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {entry.foodName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {entry.quantity}g
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-foreground">
                        {Math.round(nutrition.calories)} kcal
                      </span>
                    </div>
                  );
                })}
                <button
                  type="button"
                  data-ocid={`food_log.${type}.open_modal_button`}
                  onClick={() => onAddFood(type)}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  <Plus size={12} /> Add more
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {entries.length > 0 && (
        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Total today:</span>
          <span className="text-xs font-semibold text-primary">
            {Math.round(totalCalories)} kcal
          </span>
        </div>
      )}
    </div>
  );
}
