import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { FoodItem } from "../../types";

interface Props {
  food: FoodItem | null;
  onClose: () => void;
  onAddToLog: () => void;
}

function NutrientRow({
  label,
  value,
  unit,
  color,
}: { label: string; value: number; unit: string; color: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full" style={{ background: color }} />
        <span className="text-sm text-foreground">{label}</span>
      </div>
      <span className="text-sm font-semibold text-foreground">
        {value.toFixed(1)}
        {unit}
      </span>
    </div>
  );
}

export default function FoodDetailModal({ food, onClose, onAddToLog }: Props) {
  if (!food) return null;

  return (
    <Dialog open={!!food} onOpenChange={(v) => !v && onClose()}>
      <DialogContent data-ocid="food_detail.dialog" className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-xl">🥘</span>
            {food.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="capitalize">
              {food.category}
            </Badge>
            <Badge variant="outline">
              {food.servingSize}
              {food.servingUnit} serving
            </Badge>
          </div>

          <div className="bg-accent rounded-xl p-4 text-center">
            <p className="text-3xl font-extrabold text-primary">
              {Math.round(food.caloriesPer100g)}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              calories per 100g
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Nutritional Info (per 100g)
            </p>
            <NutrientRow
              label="Protein"
              value={food.protein}
              unit="g"
              color="oklch(0.62 0.14 155)"
            />
            <NutrientRow
              label="Carbohydrates"
              value={food.carbs}
              unit="g"
              color="oklch(0.56 0.2 260)"
            />
            <NutrientRow
              label="Fat"
              value={food.fat}
              unit="g"
              color="oklch(0.73 0.15 60)"
            />
            <NutrientRow
              label="Fiber"
              value={food.fiber}
              unit="g"
              color="oklch(0.68 0.12 145)"
            />
            <NutrientRow
              label="Sugar"
              value={food.sugar}
              unit="g"
              color="oklch(0.73 0.15 60)"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            data-ocid="food_detail.cancel_button"
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            data-ocid="food_detail.add_button"
            onClick={onAddToLog}
            className="hero-gradient text-white border-0 hover:opacity-90"
          >
            Add to Log
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
