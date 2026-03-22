import { Plus, Trash2 } from "lucide-react";
import type { DrinkEntry } from "../../hooks/useDrinksLog";
import { MEAL_TYPES, calcEntryNutrition } from "../../types";
import type { ExtendedFoodItem, LocalFoodEntry, MealType } from "../../types";

export interface FoodLogItem {
  id: string;
  entry: LocalFoodEntry;
}

interface Props {
  entries: FoodLogItem[];
  foodMap: Map<string, ExtendedFoodItem>;
  onAddFood: (mealType: string) => void;
  onRemoveEntry: (id: string) => void;
  drinkEntries: DrinkEntry[];
  onRemoveDrink: (id: string) => void;
}

export default function FoodLogCard({
  entries,
  foodMap,
  onAddFood,
  onRemoveEntry,
  drinkEntries,
  onRemoveDrink,
}: Props) {
  const backendMealTypes = MEAL_TYPES.filter((m) => m.value !== "drinks");

  const byMeal = backendMealTypes.map(({ value, label }) => ({
    type: value as MealType,
    label,
    items: entries.filter((e) => e.entry.mealType === value),
  }));

  const totalFoodCalories = entries.reduce(
    (sum, item) => sum + calcEntryNutrition(item.entry, foodMap).calories,
    0,
  );
  const totalDrinkCalories = drinkEntries.reduce(
    (sum, d) => sum + d.calories,
    0,
  );
  const totalCalories = totalFoodCalories + totalDrinkCalories;
  const hasAny = entries.length > 0 || drinkEntries.length > 0;

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
                {items.map((item, idx) => {
                  const nutrition = calcEntryNutrition(item.entry, foodMap);
                  return (
                    <div
                      key={item.id}
                      data-ocid={`food_log.item.${(idx + 1) as 1}`}
                      className="flex items-center gap-2 py-2 border-b border-border last:border-0"
                    >
                      <div className="w-7 h-7 rounded bg-accent text-sm flex items-center justify-center flex-shrink-0">
                        🥘
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {item.entry.foodName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.entry.quantity}g
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-foreground">
                        {Math.round(nutrition.calories)} kcal
                      </span>
                      <button
                        type="button"
                        onClick={() => onRemoveEntry(item.id)}
                        className="ml-1 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        title="Remove"
                      >
                        <Trash2 size={13} />
                      </button>
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

        {/* Drinks section (localStorage-based) */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Drinks
          </p>
          {drinkEntries.length === 0 ? (
            <button
              type="button"
              onClick={() => onAddFood("drinks")}
              className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg py-3 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors group"
            >
              <Plus
                size={14}
                className="group-hover:scale-110 transition-transform"
              />
              Add Drinks
            </button>
          ) : (
            <div className="space-y-1">
              {drinkEntries.map((drink) => (
                <div
                  key={drink.id}
                  className="flex items-center gap-2 py-2 border-b border-border last:border-0"
                >
                  <div className="w-7 h-7 rounded bg-accent text-sm flex items-center justify-center flex-shrink-0">
                    🥤
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {drink.foodName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {drink.quantity}ml
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {Math.round(drink.calories)} kcal
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemoveDrink(drink.id)}
                    className="ml-1 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    title="Remove"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => onAddFood("drinks")}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <Plus size={12} /> Add more
              </button>
            </div>
          )}
        </div>
      </div>

      {hasAny && (
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
