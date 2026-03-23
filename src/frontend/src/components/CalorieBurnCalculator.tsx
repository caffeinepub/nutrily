import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

const EXERCISES = [
  { label: "Walking (moderate)", metFactor: 3.5 },
  { label: "Running (8 km/h)", metFactor: 8.0 },
  { label: "Cycling (moderate)", metFactor: 6.0 },
  { label: "Swimming (laps)", metFactor: 7.0 },
  { label: "Yoga / Stretching", metFactor: 2.5 },
  { label: "Strength Training", metFactor: 5.0 },
  { label: "HIIT / Circuit Training", metFactor: 10.0 },
  { label: "Skipping / Jump Rope", metFactor: 11.0 },
  { label: "Zumba / Dance", metFactor: 6.5 },
];

export default function CalorieBurnCalculator() {
  const [exerciseIdx, setExerciseIdx] = useState<number | null>(null);
  const [minutes, setMinutes] = useState("");

  const weightKg = 70; // default
  const mins = Number(minutes);
  const kcal =
    exerciseIdx !== null && mins > 0
      ? Math.round((EXERCISES[exerciseIdx].metFactor * weightKg * mins) / 200)
      : null;

  return (
    <div
      className="bg-card rounded-xl border border-border p-4 mb-6"
      data-ocid="cbc.card"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">🔥</span>
        <div>
          <p className="text-sm font-bold text-foreground">
            Calorie Burn Calculator
          </p>
          <p className="text-xs text-muted-foreground">
            Based on a 70 kg person
          </p>
        </div>
      </div>
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground font-medium mb-1">
            Exercise type
          </p>
          <Select onValueChange={(v) => setExerciseIdx(Number(v))}>
            <SelectTrigger data-ocid="cbc.select" className="h-9 text-sm">
              <SelectValue placeholder="Choose exercise..." />
            </SelectTrigger>
            <SelectContent>
              {EXERCISES.map((ex, i) => (
                <SelectItem key={ex.label} value={String(i)}>
                  {ex.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-24">
          <p className="text-xs text-muted-foreground font-medium mb-1">
            Minutes
          </p>
          <input
            data-ocid="cbc.input"
            type="number"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            placeholder="30"
            min={1}
            max={240}
            className="w-full h-9 text-sm px-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>
      {kcal !== null && (
        <div className="mt-3 flex items-center gap-3 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 rounded-xl border border-orange-200 dark:border-orange-800 px-4 py-3">
          <span className="text-2xl">🔥</span>
          <div>
            <p className="text-lg font-bold text-foreground">{kcal} kcal</p>
            <p className="text-xs text-muted-foreground">
              estimated burn for {mins} min of {EXERCISES[exerciseIdx!].label}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
