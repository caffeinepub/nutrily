import { motion } from "motion/react";

const SWAPS: Record<
  "loss" | "gain" | "maintenance",
  {
    from: string;
    to: string;
    save: string;
    fromEmoji: string;
    toEmoji: string;
  }[]
> = {
  loss: [
    {
      fromEmoji: "🫓",
      from: "Porotta (350 kcal)",
      toEmoji: "🫔",
      to: "Chapati (120 kcal)",
      save: "Save 230 kcal",
    },
    {
      fromEmoji: "🥤",
      from: "Soft Drink (150 kcal)",
      toEmoji: "🫗",
      to: "Tender Coconut (45 kcal)",
      save: "Save 105 kcal",
    },
    {
      fromEmoji: "🍟",
      from: "Banana Chips (540 kcal)",
      toEmoji: "🍌",
      to: "Fresh Banana (89 kcal)",
      save: "Save 451 kcal",
    },
  ],
  gain: [
    {
      fromEmoji: "🥛",
      from: "Skimmed Milk (34 kcal)",
      toEmoji: "🥛",
      to: "Whole Milk (61 kcal)",
      save: "Add 27 kcal",
    },
    {
      fromEmoji: "🥗",
      from: "Plain Salad (25 kcal)",
      toEmoji: "🥗",
      to: "Salad + Nuts (175 kcal)",
      save: "Add 150 kcal",
    },
    {
      fromEmoji: "🍚",
      from: "Plain Rice (130 kcal)",
      toEmoji: "🍚",
      to: "Rice + Ghee (220 kcal)",
      save: "Add 90 kcal",
    },
  ],
  maintenance: [
    {
      fromEmoji: "🍟",
      from: "Fried Snack (300 kcal)",
      toEmoji: "🥜",
      to: "Mixed Nuts (170 kcal)",
      save: "Save 130 kcal",
    },
    {
      fromEmoji: "🧃",
      from: "Packaged Juice (110 kcal)",
      toEmoji: "🍊",
      to: "Whole Orange (47 kcal)",
      save: "Save 63 kcal",
    },
    {
      fromEmoji: "🍞",
      from: "White Bread (265 kcal)",
      toEmoji: "🌾",
      to: "Matta Rice Roti (200 kcal)",
      save: "Save 65 kcal",
    },
  ],
};

interface Props {
  goalType: "loss" | "gain" | "maintenance";
}

export default function CalorieSwapCard({ goalType }: Props) {
  const swaps = SWAPS[goalType] ?? SWAPS.maintenance;
  const isGain = goalType === "gain";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 bg-card rounded-xl border border-border p-4"
      data-ocid="swaps.card"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">🔄</span>
        <div>
          <p className="text-sm font-bold text-foreground">
            Calorie Swap Suggestions
          </p>
          <p className="text-xs text-muted-foreground">
            {isGain
              ? "Smart upgrades to add more calories"
              : "Easy swaps to cut calories"}
          </p>
        </div>
      </div>
      <div className="space-y-3">
        {swaps.map((s) => (
          <div key={s.from} className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
              <span>{s.fromEmoji}</span>
              <span className="text-xs text-foreground/80 font-medium">
                {s.from}
              </span>
            </div>
            <span className="text-lg">→</span>
            <div className="flex-1 flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg px-3 py-2">
              <span>{s.toEmoji}</span>
              <span className="text-xs text-foreground/80 font-medium">
                {s.to}
              </span>
            </div>
            <span
              className={`text-xs font-bold flex-shrink-0 ${
                isGain
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-blue-600 dark:text-blue-400"
              }`}
            >
              {s.save}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
