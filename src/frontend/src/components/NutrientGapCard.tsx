import { Progress } from "@/components/ui/progress";
import { motion } from "motion/react";

interface Nutrients {
  protein: number;
  fiber: number;
  calories: number;
}

interface Props {
  nutrients: Nutrients;
}

const TARGETS = [
  {
    key: "protein" as const,
    label: "Protein",
    unit: "g",
    target: 60,
    emoji: "🥩",
    fix: "Add eggs, fish curry, or kadala. Even 2 eggs = 12g protein.",
  },
  {
    key: "fiber" as const,
    label: "Fiber",
    unit: "g",
    target: 25,
    emoji: "🥗",
    fix: "Eat more avial, thoran, or a banana. 1 banana = ~3g fiber.",
  },
  {
    key: "calories" as const,
    label: "Energy",
    unit: "kcal",
    target: 1600,
    emoji: "⚡",
    fix: "You need more food today. Add a meal or healthy snack.",
  },
];

export default function NutrientGapCard({ nutrients }: Props) {
  const gaps = TARGETS.filter((t) => nutrients[t.key] < t.target * 0.5);

  if (gaps.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800 p-4"
        data-ocid="nutrient-gap.success_state"
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">✅</span>
          <div>
            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
              Looking great!
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-500">
              All key nutrients are above 50% of daily target.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-border p-4"
      data-ocid="nutrient-gap.card"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">📊</span>
        <div>
          <p className="text-sm font-bold text-foreground">
            Nutrient Gap Analysis
          </p>
          <p className="text-xs text-muted-foreground">
            Nutrients below 50% of daily target
          </p>
        </div>
      </div>
      <div className="space-y-3">
        {gaps.map((g) => {
          const val = nutrients[g.key];
          const pct = Math.min(100, Math.round((val / g.target) * 100));
          return (
            <div key={g.key} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">
                  {g.emoji} {g.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {Math.round(val)}
                  {g.unit} / {g.target}
                  {g.unit}
                </span>
              </div>
              <Progress value={pct} className="h-2" />
              <p className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-900/20 rounded-lg px-2 py-1">
                💡 How to fix: {g.fix}
              </p>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
