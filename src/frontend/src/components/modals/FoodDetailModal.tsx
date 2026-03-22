import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ExtendedFoodItem, FoodItem } from "../../types";

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
  indent,
}: {
  label: string;
  value: number | undefined;
  unit: string;
  color: string;
  indent?: boolean;
}) {
  if (value === undefined || value === null) return null;
  return (
    <div
      className={[
        "flex items-center justify-between py-1.5 border-b border-border last:border-0",
        indent ? "pl-4" : "",
      ].join(" ")}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: color }}
        />
        <span
          className={[
            "text-sm text-foreground",
            indent ? "text-muted-foreground" : "",
          ].join(" ")}
        >
          {label}
        </span>
      </div>
      <span className="text-sm font-semibold text-foreground">
        {typeof value === "number" ? value.toFixed(1) : value}
        {unit}
      </span>
    </div>
  );
}

export default function FoodDetailModal({ food, onClose, onAddToLog }: Props) {
  if (!food) return null;
  const ext = food as ExtendedFoodItem;

  return (
    <Dialog open={!!food} onOpenChange={(v) => !v && onClose()}>
      <DialogContent data-ocid="food_detail.dialog" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-xl">{ext.isProcessed ? "⚠️" : "🥘"}</span>
            <span className="truncate">{food.name}</span>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4 pr-2">
            {/* Processed food alert */}
            {ext.isProcessed && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                <span className="text-red-500 text-lg leading-none mt-0.5">
                  ⚠️
                </span>
                <div>
                  <p className="text-sm font-bold text-red-700">
                    Processed Food Alert
                  </p>
                  <p className="text-xs text-red-600 mt-0.5">
                    This is a highly processed food. Limit consumption.
                  </p>
                </div>
              </div>
            )}

            {/* Health warning */}
            {ext.healthWarning && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-amber-800 mb-1">
                  ⚠️ Health Warning
                </p>
                <p className="text-xs text-amber-700 leading-relaxed">
                  {ext.healthWarning}
                </p>
              </div>
            )}

            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="capitalize">
                {food.category}
              </Badge>
              <Badge variant="outline">
                {food.servingSize}
                {food.servingUnit} serving
              </Badge>
              {ext.isProcessed && (
                <Badge variant="destructive" className="text-xs">
                  Processed
                </Badge>
              )}
            </div>

            {/* Calorie hero */}
            <div className="bg-accent rounded-xl p-4 text-center">
              <p className="text-3xl font-extrabold text-primary">
                {Math.round(food.caloriesPer100g)}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                calories per 100g
              </p>
            </div>

            {/* Full nutrition table */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Full Nutrition (per 100g)
              </p>
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="px-3 py-1 bg-muted/40">
                  <NutrientRow
                    label="Energy"
                    value={food.caloriesPer100g}
                    unit=" kcal"
                    color="oklch(0.62 0.18 40)"
                  />
                </div>
                <div className="px-3">
                  <NutrientRow
                    label="Total Fat"
                    value={food.fat}
                    unit="g"
                    color="oklch(0.73 0.15 60)"
                  />
                  <NutrientRow
                    label="Saturated Fat"
                    value={ext.saturatedFat}
                    unit="g"
                    color="oklch(0.65 0.18 55)"
                    indent
                  />
                  <NutrientRow
                    label="Trans Fat"
                    value={ext.transFat}
                    unit="g"
                    color="oklch(0.50 0.22 25)"
                    indent
                  />
                  <NutrientRow
                    label="Cholesterol"
                    value={ext.cholesterol}
                    unit="mg"
                    color="oklch(0.72 0.14 55)"
                  />
                  <NutrientRow
                    label="Sodium"
                    value={ext.sodium}
                    unit="mg"
                    color="oklch(0.68 0.12 250)"
                  />
                  {ext.potassium !== undefined && (
                    <NutrientRow
                      label="Potassium"
                      value={ext.potassium}
                      unit="mg"
                      color="oklch(0.72 0.1 145)"
                    />
                  )}
                  <NutrientRow
                    label="Total Carbohydrates"
                    value={food.carbs}
                    unit="g"
                    color="oklch(0.56 0.2 260)"
                  />
                  <NutrientRow
                    label="Dietary Fiber"
                    value={food.fiber}
                    unit="g"
                    color="oklch(0.68 0.12 145)"
                    indent
                  />
                  <NutrientRow
                    label="Total Sugar"
                    value={food.sugar}
                    unit="g"
                    color="oklch(0.73 0.15 60)"
                    indent
                  />
                  <NutrientRow
                    label="Added Sugar"
                    value={ext.addedSugar}
                    unit="g"
                    color="oklch(0.60 0.22 30)"
                    indent
                  />
                  <NutrientRow
                    label="Protein"
                    value={food.protein}
                    unit="g"
                    color="oklch(0.62 0.14 155)"
                  />
                </div>
              </div>
            </div>

            {/* Additives */}
            {ext.additives && ext.additives.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Additives / Chemicals
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {ext.additives.map((a) => (
                    <span
                      key={a}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Ingredients */}
            {ext.ingredients && ext.ingredients.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                  Ingredients
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {ext.ingredients.join(", ")}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

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
