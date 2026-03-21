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
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useLogFoodEntry } from "../../hooks/useQueries";
import { MEAL_TYPES } from "../../types";
import type { FoodItem, MealType } from "../../types";

interface Props {
  open: boolean;
  onClose: () => void;
  allFoods: FoodItem[];
  preselectedFoodName?: string;
}

export default function LogFoodModal({
  open,
  onClose,
  allFoods,
  preselectedFoodName,
}: Props) {
  const [foodName, setFoodName] = useState("");
  const [quantity, setQuantity] = useState("100");
  const [mealType, setMealType] = useState<MealType>("breakfast" as MealType);
  const [search, setSearch] = useState("");
  const { mutateAsync, isPending } = useLogFoodEntry();

  useEffect(() => {
    if (open && preselectedFoodName) {
      // Check if it's a meal type or food name
      const isMealType = MEAL_TYPES.some(
        (m) => m.value === preselectedFoodName,
      );
      if (isMealType) {
        setMealType(preselectedFoodName as MealType);
        setFoodName("");
      } else {
        setFoodName(preselectedFoodName);
      }
    }
    if (!open) {
      setFoodName("");
      setQuantity("100");
      setSearch("");
    }
  }, [open, preselectedFoodName]);

  const filteredFoods = allFoods.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()),
  );

  const selectedFood = allFoods.find((f) => f.name === foodName);
  const estimatedCals = selectedFood
    ? Math.round((selectedFood.caloriesPer100g / 100) * Number(quantity))
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName || !quantity) return;
    try {
      await mutateAsync({
        date: BigInt(Date.now()) * 1_000_000n,
        quantity: Number(quantity),
        mealType,
        foodName,
      });
      toast.success(`${foodName} logged to ${mealType}!`);
      onClose();
    } catch {
      toast.error("Failed to log food. Please try again.");
    }
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
              onValueChange={(v) => setMealType(v as MealType)}
            >
              <SelectTrigger data-ocid="log_food.meal_select" className="mt-1">
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

          <div>
            <Label className="text-sm">Search Food</Label>
            <Input
              data-ocid="log_food.search_input"
              placeholder="Type to search..."
              value={search || foodName}
              onChange={(e) => {
                setSearch(e.target.value);
                setFoodName("");
              }}
              className="mt-1"
            />
            {(search || !foodName) && filteredFoods.length > 0 && (
              <div className="mt-1 border border-border rounded-lg overflow-hidden max-h-40 overflow-y-auto shadow-card">
                {filteredFoods.slice(0, 20).map((f) => (
                  <button
                    key={f.name}
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center justify-between gap-2"
                    onClick={() => {
                      setFoodName(f.name);
                      setSearch("");
                    }}
                  >
                    <span className="font-medium">{f.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(f.caloriesPer100g)} kcal/100g
                    </span>
                  </button>
                ))}
              </div>
            )}
            {foodName && (
              <p className="text-xs text-primary mt-1 font-medium">
                Selected: {foodName}
              </p>
            )}
          </div>

          <div>
            <Label className="text-sm">Quantity (grams)</Label>
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
              disabled={!foodName || !quantity || isPending}
              className="hero-gradient text-white border-0 hover:opacity-90"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging...
                </>
              ) : (
                "Log Food"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
