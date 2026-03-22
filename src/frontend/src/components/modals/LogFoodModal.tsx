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
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { DrinkEntry } from "../../hooks/useDrinksLog";
import type { FoodLogEntryLocal } from "../../hooks/useFoodLog";
import { MEAL_TYPES } from "../../types";
import type { ExtendedFoodItem, LocalMealType, MealType } from "../../types";

// Kerala foods with contextual serving hints
const KERALA_HINTS: Record<string, string> = {
  Appam: "1 piece ≈ 70g",
  Puttu: "1 serving ≈ 100g",
  Idiyappam: "1 piece ≈ 50g",
  Dosa: "1 piece ≈ 90g",
  Parotta: "1 piece ≈ 80g",
  "Fish Curry": "1 serving ≈ 150g",
  Idli: "1 piece ≈ 60g",
};

// Cups conversion: liquids = 240ml, grains/rice = 185g, default = 240g
function cupsToGrams(foodName: string, cups: number): number {
  const name = foodName.toLowerCase();
  if (name.includes("rice") || name.includes("grain") || name.includes("oat")) {
    return cups * 185;
  }
  return cups * 240;
}

interface Props {
  open: boolean;
  onClose: () => void;
  allFoods: ExtendedFoodItem[];
  preselectedFoodName?: string;
  onLogDrink: (entry: Omit<DrinkEntry, "id" | "timestamp">) => void;
  onLogFood: (entry: Omit<FoodLogEntryLocal, "id" | "timestamp">) => void;
  existingEntries?: FoodLogEntryLocal[];
}

function getCurrentTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

type Unit = "grams" | "pieces" | "cups";

export default function LogFoodModal({
  open,
  onClose,
  allFoods,
  preselectedFoodName,
  onLogDrink,
  onLogFood,
  existingEntries = [],
}: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [foodName, setFoodName] = useState("");
  const [quantity, setQuantity] = useState("100");
  const [pieces, setPieces] = useState("1");
  const [cups, setCups] = useState("1");
  const [unit, setUnit] = useState<Unit>("grams");
  const [mealType, setMealType] = useState<LocalMealType>(
    "breakfast" as MealType,
  );
  const [search, setSearch] = useState("");
  const [mealTime, setMealTime] = useState(getCurrentTime);
  const [saving, setSaving] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      setStep(1);
    }
    if (!open) {
      setFoodName("");
      setQuantity("100");
      setPieces("1");
      setCups("1");
      setUnit("grams");
      setSearch("");
      setStep(1);
    }
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [open, preselectedFoodName]);

  const showDropdown = search.length > 0;
  const filteredFoods = showDropdown
    ? allFoods
        .filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
        .slice(0, 20)
    : [];

  const selectedFood = allFoods.find((f) => f.name === foodName);

  const actualGrams: number = (() => {
    if (unit === "pieces") {
      return (
        Number(pieces) *
        (selectedFood && selectedFood.servingSize > 0
          ? selectedFood.servingSize
          : 100)
      );
    }
    if (unit === "cups") {
      return cupsToGrams(foodName, Number(cups));
    }
    return Number(quantity);
  })();

  const estimatedCals = selectedFood
    ? Math.round((selectedFood.caloriesPer100g / 100) * actualGrams)
    : 0;

  const factor = actualGrams / 100;
  const estimatedProtein = selectedFood
    ? Math.round(selectedFood.protein * factor * 10) / 10
    : 0;
  const estimatedCarbs = selectedFood
    ? Math.round(selectedFood.carbs * factor * 10) / 10
    : 0;
  const estimatedFat = selectedFood
    ? Math.round(selectedFood.fat * factor * 10) / 10
    : 0;

  const perPieceCals =
    selectedFood && unit === "pieces"
      ? Math.round(
          (selectedFood.caloriesPer100g / 100) *
            (selectedFood.servingSize > 0 ? selectedFood.servingSize : 100),
        )
      : 0;

  const cupGrams = unit === "cups" ? cupsToGrams(foodName, Number(cups)) : 0;
  const isRiceGrain =
    foodName.toLowerCase().includes("rice") ||
    foodName.toLowerCase().includes("grain") ||
    foodName.toLowerCase().includes("oat");
  const cupHint =
    unit === "cups"
      ? `1 cup = ${isRiceGrain ? "185g (grains/rice)" : "240g / 240ml (liquids)"}`
      : "";

  const isDuplicate =
    foodName &&
    existingEntries.some(
      (e) =>
        e.foodName.toLowerCase() === foodName.toLowerCase() &&
        e.mealType === mealType,
    );

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName) return;
    setStep(2);
  };

  const handleSave = () => {
    if (saving) return;
    setSaving(true);
    saveTimer.current = setTimeout(() => setSaving(false), 1500);

    if (isDrinks) {
      onLogDrink({ foodName, quantity: actualGrams, calories: estimatedCals });
      toast.success(`${foodName} logged to drinks!`);
      onClose();
      return;
    }

    onLogFood({
      foodName,
      quantity: actualGrams,
      mealType: mealType as string,
      calories: estimatedCals,
      protein: estimatedProtein,
      carbs: estimatedCarbs,
      fat: estimatedFat,
    });
    toast.success(`${foodName} logged to ${mealType}!`);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent data-ocid="log_food.dialog" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{step === 1 ? "Log Food" : "Confirm Entry"}</DialogTitle>
          {/* Step dots */}
          <div className="flex items-center gap-1.5 mt-1">
            <div
              className={`h-1.5 w-8 rounded-full transition-colors ${step >= 1 ? "bg-primary" : "bg-muted"}`}
            />
            <div
              className={`h-1.5 w-8 rounded-full transition-colors ${step >= 2 ? "bg-primary" : "bg-muted"}`}
            />
          </div>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.form
              key="step1"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleNext}
              className="space-y-4"
            >
              {/* Meal type */}
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

              {/* Meal time */}
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

              {/* Food search */}
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
                    if (e.target.value !== "") setFoodName("");
                  }}
                  className="mt-1"
                />
                {showDropdown && filteredFoods.length > 0 && (
                  <div className="mt-1 border border-border rounded-lg overflow-hidden max-h-48 overflow-y-auto shadow-card z-50">
                    {filteredFoods.map((f) => {
                      const hint = KERALA_HINTS[f.name];
                      return (
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
                          <div>
                            <span className="font-medium">{f.name}</span>
                            {hint && (
                              <span className="text-xs text-muted-foreground ml-1.5">
                                ({hint})
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {Math.round(f.caloriesPer100g)} kcal/100g
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
                {showDropdown &&
                  filteredFoods.length === 0 &&
                  search.length > 1 && (
                    <div className="mt-1 px-3 py-2 text-sm text-muted-foreground border border-border rounded-lg bg-muted/40">
                      Can't find "{search}"?{" "}
                      <button
                        type="button"
                        className="text-primary underline font-medium"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          toast.info(
                            "Suggestion sent! We'll review and add it shortly.",
                          );
                          setSearch("");
                        }}
                      >
                        Suggest this food
                      </button>
                    </div>
                  )}
                {foodName && !search && (
                  <div className="flex items-center gap-2 mt-1.5 bg-accent rounded-lg px-3 py-1.5">
                    <span className="text-xs text-muted-foreground">
                      Selected:
                    </span>
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

              {/* Unit selector */}
              <div>
                <Label className="text-sm mb-1 block">Unit</Label>
                <div className="flex gap-2">
                  {(
                    ["grams", ...(isDrinks ? [] : ["pieces", "cups"])] as Unit[]
                  ).map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setUnit(u)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors capitalize ${
                        unit === u
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted text-muted-foreground border-border hover:border-primary"
                      }`}
                    >
                      {u === "grams" && isDrinks ? "ml" : u}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity inputs */}
              {unit === "grams" && (
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
              )}
              {unit === "pieces" && (
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
                  {KERALA_HINTS[foodName] && (
                    <p className="text-xs text-primary font-medium mt-0.5">
                      💡 {KERALA_HINTS[foodName]}
                    </p>
                  )}
                </div>
              )}
              {unit === "cups" && (
                <div>
                  <Label className="text-sm">Number of Cups</Label>
                  <Input
                    type="number"
                    min="0.25"
                    max="20"
                    step="0.25"
                    value={cups}
                    onChange={(e) => setCups(e.target.value)}
                    className="mt-1"
                  />
                  {cupHint && (
                    <p className="text-xs text-muted-foreground mt-1">
                      ℹ️ {cupHint}
                    </p>
                  )}
                  {cupGrams > 0 && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      ≈ {Math.round(cupGrams)}g total
                    </p>
                  )}
                </div>
              )}

              {/* Live calorie preview */}
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
                  data-ocid="log_food.primary_button"
                  type="submit"
                  disabled={!foodName}
                  className="hero-gradient text-white border-0 hover:opacity-90"
                >
                  Next →
                </Button>
              </DialogFooter>
            </motion.form>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Confirmation summary */}
              <div className="bg-accent rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-foreground">
                    {foodName}
                  </span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {mealType}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-background rounded-lg p-2.5 text-center">
                    <p className="text-lg font-bold text-primary">
                      {estimatedCals}
                    </p>
                    <p className="text-xs text-muted-foreground">kcal</p>
                  </div>
                  <div className="bg-background rounded-lg p-2.5 text-center">
                    <p className="text-lg font-bold text-blue-600">
                      {estimatedProtein}g
                    </p>
                    <p className="text-xs text-muted-foreground">protein</p>
                  </div>
                  <div className="bg-background rounded-lg p-2.5 text-center">
                    <p className="text-lg font-bold text-orange-500">
                      {estimatedCarbs}g
                    </p>
                    <p className="text-xs text-muted-foreground">carbs</p>
                  </div>
                  <div className="bg-background rounded-lg p-2.5 text-center">
                    <p className="text-lg font-bold text-yellow-600">
                      {estimatedFat}g
                    </p>
                    <p className="text-xs text-muted-foreground">fat</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  {unit === "grams" && `${actualGrams}g`}
                  {unit === "pieces" &&
                    `${pieces} piece(s) ≈ ${Math.round(actualGrams)}g`}
                  {unit === "cups" &&
                    `${cups} cup(s) ≈ ${Math.round(actualGrams)}g`}
                </p>
              </div>

              {/* Warnings */}
              {isDuplicate && (
                <div
                  data-ocid="log_food.error_state"
                  className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2"
                >
                  <span className="text-yellow-500 text-sm">⚠️</span>
                  <p className="text-xs text-yellow-700 font-medium">
                    {foodName} is already logged in {mealType} today. Adding
                    again will create a duplicate.
                  </p>
                </div>
              )}
              {estimatedCals === 0 && (
                <div
                  data-ocid="log_food.error_state"
                  className="flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2"
                >
                  <span className="text-orange-500 text-sm">⚠️</span>
                  <p className="text-xs text-orange-700 font-medium">
                    Estimated calories are 0. Check the quantity or food
                    selection.
                  </p>
                </div>
              )}

              <DialogFooter>
                <Button
                  data-ocid="log_food.cancel_button"
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                >
                  ← Back
                </Button>
                <Button
                  data-ocid="log_food.submit_button"
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="hero-gradient text-white border-0 hover:opacity-90"
                >
                  {saving
                    ? "Saving..."
                    : isDrinks
                      ? "Log Drink ✓"
                      : "Save Entry ✓"}
                </Button>
              </DialogFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
