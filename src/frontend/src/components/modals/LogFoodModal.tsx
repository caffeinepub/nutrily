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
import HonestyBadge from "../HonestyBadge";

// Kerala foods with contextual serving hints
const KERALA_HINTS: Record<string, string> = {
  Appam: "1 piece ≈ 70g",
  Puttu: "1 serving ≈ 100g",
  Idiyappam: "1 piece ≈ 50g",
  Dosa: "1 piece ≈ 90g",
  Parotta: "1 piece ≈ 80g",
  Porotta: "1 piece ≈ 80g",
  "Fish Curry": "1 serving ≈ 150g",
  "Fish Curry (Kerala)": "1 serving ≈ 150g",
  Idli: "1 piece ≈ 60g",
  "Kerala Biryani": "1 plate ≈ 400g",
  "Chicken Biryani": "1 plate ≈ 400g",
};

// Natural language portion sizes → grams
const NATURAL_PORTIONS: Record<
  string,
  { label: string; grams: (food?: ExtendedFoodItem) => number }
> = {
  "1 Plate": {
    label: "1 Plate",
    grams: (food) => {
      const name = (food?.name ?? "").toLowerCase();
      if (name.includes("biryani") || name.includes("rice")) return 400;
      if (name.includes("curry") || name.includes("dal")) return 200;
      return 350;
    },
  },
  "1 Bowl": {
    label: "1 Bowl",
    grams: () => 250,
  },
  "1 Glass": {
    label: "1 Glass",
    grams: () => 240,
  },
  "1 Handful": {
    label: "1 Handful",
    grams: (food) => {
      const name = (food?.name ?? "").toLowerCase();
      if (name.includes("nut") || name.includes("seed")) return 30;
      return 50;
    },
  },
};

const CARBONATED_KEYWORDS = [
  "cola",
  "soda",
  "pepsi",
  "coca",
  "sprite",
  "fanta",
  "mountain dew",
  "energy drink",
  "red bull",
  "monster",
];
const HIDDEN_SUGAR_KEYWORDS = [
  "juice",
  "flavored yogurt",
  "biscuit",
  "cookie",
  "flavoured",
];

function isCarbonated(name: string) {
  const n = name.toLowerCase();
  return CARBONATED_KEYWORDS.some((k) => n.includes(k));
}
function hasHiddenSugar(name: string) {
  const n = name.toLowerCase();
  return HIDDEN_SUGAR_KEYWORDS.some((k) => n.includes(k));
}
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

type Unit = "grams" | "pieces" | "cups" | "natural";

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
  const [naturalPortion, setNaturalPortion] = useState("1 Plate");
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
    if (unit === "natural") {
      const portion = NATURAL_PORTIONS[naturalPortion];
      return portion ? portion.grams(selectedFood) : 350;
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

  const unitOptions: Unit[] = isDrinks
    ? ["grams"]
    : ["grams", "pieces", "cups", "natural"];

  const unitLabels: Record<Unit, string> = {
    grams: isDrinks ? "ml" : "grams",
    pieces: "pieces",
    cups: "cups",
    natural: "portion",
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent data-ocid="log_food.dialog" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{step === 1 ? "Log Food" : "Confirm Entry"}</DialogTitle>
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
                      ? "e.g. Coconut Water, Chai..."
                      : "Type to search Kerala + 500 foods..."
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
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="font-medium truncate">
                              {f.name}
                            </span>
                            {hint && (
                              <span className="text-xs text-muted-foreground flex-shrink-0">
                                ({hint})
                              </span>
                            )}
                            {f.honestyRating && (
                              <HonestyBadge
                                rating={f.honestyRating}
                                size="xs"
                              />
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
                  <div className="flex items-center gap-2 mt-1.5 bg-accent/20 rounded-lg px-3 py-1.5">
                    <span className="text-xs text-muted-foreground">
                      Selected:
                    </span>
                    <span className="text-xs font-semibold text-primary flex-1 truncate">
                      {foodName}
                    </span>
                    {selectedFood?.honestyRating && (
                      <HonestyBadge
                        rating={selectedFood.honestyRating}
                        size="xs"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => setFoodName("")}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      ✕
                    </button>
                  </div>
                )}
                {/* Carbonated drink warning */}
                {foodName && isCarbonated(foodName) && (
                  <div className="mt-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 p-3">
                    <p className="text-xs font-semibold text-amber-800 dark:text-amber-200 mb-1">
                      ⚠️ High sugar drink detected
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-300 mb-2">
                      This contains ~35g sugar with no nutritional value. Try
                      instead: 🥥 Coconut water, 🍋 Lemon water, or 🥛
                      Buttermilk
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setFoodName("Tender Coconut Water");
                        setSearch("");
                      }}
                      className="text-xs bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 px-3 py-1 rounded-full font-semibold hover:bg-amber-300 dark:hover:bg-amber-700 transition-colors"
                    >
                      🔄 Swap to Coconut Water
                    </button>
                  </div>
                )}
                {/* Hidden sugar warning */}
                {foodName &&
                  !isCarbonated(foodName) &&
                  hasHiddenSugar(foodName) && (
                    <div className="mt-1.5 rounded-lg bg-yellow-50 dark:bg-yellow-950/40 border border-yellow-200 dark:border-yellow-700 px-3 py-2">
                      <p className="text-xs text-yellow-800 dark:text-yellow-200">
                        ⚠️ Contains hidden added sugar
                      </p>
                    </div>
                  )}
                {/* Dish ingredient breakdown */}
                {selectedFood?.dishIngredients && (
                  <div className="mt-1.5 px-3 py-1.5 bg-muted/60 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      🧩 <span className="font-medium">Ingredients:</span>{" "}
                      {selectedFood.dishIngredients}
                    </p>
                  </div>
                )}
              </div>

              {/* Unit selector */}
              <div>
                <Label className="text-sm mb-1 block">Unit</Label>
                <div className="flex gap-2 flex-wrap">
                  {unitOptions.map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setUnit(u)}
                      className={`flex-1 min-w-[60px] py-2 rounded-lg text-xs font-medium border transition-colors capitalize ${
                        unit === u
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted text-muted-foreground border-border hover:border-primary"
                      }`}
                    >
                      {unitLabels[u]}
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
              {unit === "natural" && (
                <div>
                  <Label className="text-sm">Portion Size</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {Object.keys(NATURAL_PORTIONS).map((p) => {
                      const gramsVal = NATURAL_PORTIONS[p].grams(selectedFood);
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setNaturalPortion(p)}
                          className={`py-2.5 px-3 rounded-lg text-sm font-medium border transition-colors text-left ${
                            naturalPortion === p
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-muted text-muted-foreground border-border hover:border-primary"
                          }`}
                        >
                          <span className="block font-semibold">{p}</span>
                          <span className="text-xs opacity-75">
                            ≈ {gramsVal}g
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Selected: {naturalPortion} ≈{" "}
                    {NATURAL_PORTIONS[naturalPortion]?.grams(selectedFood) ??
                      350}
                    g
                  </p>
                </div>
              )}

              {/* Live calorie preview */}
              {estimatedCals > 0 && (
                <div className="bg-accent/20 rounded-lg p-3 flex items-center justify-between">
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
                  className="bg-primary text-primary-foreground border-0 hover:bg-primary/90"
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
              <div className="bg-accent/20 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-sm font-bold text-foreground truncate">
                      {foodName}
                    </span>
                    {selectedFood?.honestyRating && (
                      <HonestyBadge
                        rating={selectedFood.honestyRating}
                        size="xs"
                      />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground capitalize flex-shrink-0">
                    {mealType}
                  </span>
                </div>
                {selectedFood?.dishIngredients && (
                  <p className="text-xs text-muted-foreground">
                    🧩 {selectedFood.dishIngredients}
                  </p>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-background rounded-lg p-2.5 text-center">
                    <p className="text-lg font-bold text-primary">
                      {estimatedCals}
                    </p>
                    <p className="text-xs text-muted-foreground">kcal</p>
                  </div>
                  <div className="bg-background rounded-lg p-2.5 text-center">
                    <p className="text-lg font-bold text-primary">
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
                    <p className="text-lg font-bold text-warning">
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
                  {unit === "natural" &&
                    `${naturalPortion} ≈ ${Math.round(actualGrams)}g`}
                </p>
              </div>

              {/* Warnings */}
              {isDuplicate && (
                <div
                  data-ocid="log_food.error_state"
                  className="flex items-start gap-2 bg-status-warning border border-warning/30 rounded-lg px-3 py-2"
                >
                  <span className="text-warning text-sm">⚠️</span>
                  <p className="text-xs text-warning font-medium">
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
              {selectedFood?.healthWarning && (
                <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
                  <span className="text-amber-500 text-sm">ℹ️</span>
                  <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                    {selectedFood.healthWarning}
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
                  className="bg-primary text-primary-foreground border-0 hover:bg-primary/90"
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
