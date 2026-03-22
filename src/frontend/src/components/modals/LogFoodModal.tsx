import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { DrinkEntry } from "../../hooks/useDrinksLog";
import type { FoodLogEntryLocal } from "../../hooks/useFoodLog";
import { MEAL_TYPES } from "../../types";
import type { ExtendedFoodItem, LocalMealType, MealType } from "../../types";

interface Props {
  open: boolean;
  onClose: () => void;
  allFoods: ExtendedFoodItem[];
  preselectedFoodName?: string;
  onLogDrink: (entry: Omit<DrinkEntry, "id" | "timestamp">) => void;
  onLogFood: (entry: Omit<FoodLogEntryLocal, "id" | "timestamp">) => void;
}

function getCurrentTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

export default function LogFoodModal({
  open,
  onClose,
  allFoods,
  preselectedFoodName,
  onLogDrink,
  onLogFood,
}: Props) {
  const [foodName, setFoodName] = useState("");
  const [quantity, setQuantity] = useState("100");
  const [pieces, setPieces] = useState("1");
  const [unit, setUnit] = useState<"grams" | "pieces">("grams");
  const [mealType, setMealType] = useState<LocalMealType>(
    "breakfast" as MealType,
  );
  const [search, setSearch] = useState("");
  const [mealTime, setMealTime] = useState(getCurrentTime);

  const isDrinks = mealType === "drinks";

  useEffect(() => {
    if (open && preselectedFoodName) {
      const isMealType = MEAL_TYPES.some(
        (m) => m.value === preselectedFoodName,
      );
      if (isMealType) {
        setMealType(preselectedFoodName as LocalMealType);
        setFoodName("");
      } else {
        setFoodName(preselectedFoodName);
      }
    }
    if (open) {
      setMealTime(getCurrentTime());
    }
    if (!open) {
      setFoodName("");
      setQuantity("100");
      setPieces("1");
      setUnit("grams");
      setSearch("");
    }
  }, [open, preselectedFoodName]);

  const showDropdown = search.length > 0;
  const filteredFoods = showDropdown
    ? allFoods
        .filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
        .slice(0, 20)
    : [];

  const selectedFood = allFoods.find((f) => f.name === foodName);

  const gramsFromPieces =
    selectedFood && unit === "pieces"
      ? Number(pieces) *
        (selectedFood.servingSize > 0 ? selectedFood.servingSize : 100)
      : null;

  const actualGrams =
    unit === "pieces"
      ? (gramsFromPieces ?? Number(pieces) * 100)
      : Number(quantity);

  const estimatedCals = selectedFood
    ? Math.round((selectedFood.caloriesPer100g / 100) * actualGrams)
    : 0;

  const perPieceCals =
    selectedFood && unit === "pieces"
      ? Math.round(
          (selectedFood.caloriesPer100g / 100) *
            (selectedFood.servingSize > 0 ? selectedFood.servingSize : 100),
        )
      : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName) return;

    if (isDrinks) {
      onLogDrink({
        foodName,
        quantity: actualGrams,
        calories: estimatedCals,
      });
      toast.success(`${foodName} logged to drinks!`);
      onClose();
      return;
    }

    const factor = actualGrams / 100;
    onLogFood({
      foodName,
      quantity: actualGrams,
      mealType: mealType as string,
      calories: estimatedCals,
      protein: selectedFood ? selectedFood.protein * factor : 0,
      carbs: selectedFood ? selectedFood.carbs * factor : 0,
      fat: selectedFood ? selectedFood.fat * factor : 0,
    });
    toast.success(`${foodName} logged to ${mealType}!`);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent data-ocid="log_food.dialog" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log Food</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-sm">Meal</Label>
            <Select
              value={mealType}
              onValueChange={(v) => setMealType(v as LocalMealType)}
            >
              <SelectTrigger data-ocid="log_food.select" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MEAL_TYPES.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!isDrinks && (
            <div>
              <Label className="text-sm">Time of meal</Label>
              <Input
                data-ocid="log_food.time_input"
                type="time"
                value={mealTime}
                onChange={(e) => setMealTime(e.target.value)}
                className="mt-1"
              />
            </div>
          )}

          <div>
            <Label className="text-sm">
              {isDrinks ? "Search Drink" : "Search Food"}
            </Label>
            <Input
              data-ocid="log_food.search_input"
              placeholder={
                isDrinks
                  ? "e.g. Coca-Cola, Orange Juice..."
                  : "Type to search 500+ foods..."
              }
              value={search || (foodName && !search ? foodName : "")}
              onChange={(e) => {
                setSearch(e.target.value);
                if (e.target.value !== "") {
                  setFoodName("");
                }
              }}
              className="mt-1"
            />
            {showDropdown && filteredFoods.length > 0 && (
              <div className="mt-1 border border-border rounded-lg overflow-hidden max-h-48 overflow-y-auto shadow-card z-50">
                {filteredFoods.map((f) => (
                  <button
                    key={f.name}
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center justify-between gap-2"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setFoodName(f.name);
                      setSearch("");
                    }}
                  >
                    <span className="font-medium truncate">{f.name}</span>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {Math.round(f.caloriesPer100g)} kcal/100g
                    </span>
                  </button>
                ))}
              </div>
            )}
            {foodName && !search && (
              <div className="flex items-center gap-2 mt-1.5 bg-accent rounded-lg px-3 py-1.5">
                <span className="text-xs text-muted-foreground">Selected:</span>
                <span className="text-xs font-semibold text-primary flex-1 truncate">
                  {foodName}
                </span>
                <button
                  type="button"
                  onClick={() => setFoodName("")}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <div>
            <Label className="text-sm mb-1 block">Unit</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setUnit("grams")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  unit === "grams"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted text-muted-foreground border-border hover:border-primary"
                }`}
              >
                {isDrinks ? "ml" : "Grams"}
              </button>
              {!isDrinks && (
                <button
                  type="button"
                  onClick={() => setUnit("pieces")}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    unit === "pieces"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground border-border hover:border-primary"
                  }`}
                >
                  Pieces
                </button>
              )}
            </div>
          </div>

          {unit === "grams" || isDrinks ? (
            <div>
              <Label className="text-sm">
                {isDrinks ? "Volume (ml)" : "Quantity (grams)"}
              </Label>
              <Input
                data-ocid="log_food.quantity_input"
                type="number"
                min="1"
                max="2000"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="mt-1"
              />
            </div>
          ) : (
            <div>
              <Label className="text-sm">Number of Pieces</Label>
              <Input
                type="number"
                min="1"
                max="100"
                value={pieces}
                onChange={(e) => setPieces(e.target.value)}
                className="mt-1"
              />
              {selectedFood && (
                <p className="text-xs text-muted-foreground mt-1">
                  1 piece ≈{" "}
                  {selectedFood.servingSize > 0
                    ? selectedFood.servingSize
                    : 100}
                  g{perPieceCals > 0 && ` · ${perPieceCals} kcal`}
                  {selectedFood.servingUnit
                    ? ` (${selectedFood.servingUnit})`
                    : ""}
                </p>
              )}
            </div>
          )}

          {estimatedCals > 0 && (
            <div className="bg-accent rounded-lg p-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Estimated calories
              </span>
              <span className="text-sm font-bold text-primary">
                {estimatedCals} kcal
              </span>
            </div>
          )}

          <DialogFooter>
            <Button
              data-ocid="log_food.cancel_button"
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              data-ocid="log_food.submit_button"
              type="submit"
              disabled={!foodName}
              className="hero-gradient text-white border-0 hover:opacity-90"
            >
              {isDrinks ? "Log Drink" : "Log Food"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
