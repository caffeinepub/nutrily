import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

interface MealEntry {
  mealType: string;
  timestamp?: string | number;
}

interface Props {
  entries: MealEntry[];
}

export default function MealTimingCard({ entries }: Props) {
  const timestamps = entries
    .filter((e) => e.timestamp != null)
    .map((e) => new Date(e.timestamp as any));

  if (timestamps.length === 0) {
    return null;
  }

  const earliest = new Date(Math.min(...timestamps.map((d) => d.getTime())));
  const latest = new Date(Math.max(...timestamps.map((d) => d.getTime())));
  const earliestHour = earliest.getHours();
  const latestHour = latest.getHours() + latest.getMinutes() / 60;

  const breakfastSkipped = earliestHour > 10;
  const lateMeal = latestHour > 21;
  const mealSpan = latestHour - earliestHour;

  const issues: { emoji: string; msg: string; type: "warn" | "ok" }[] = [];

  if (breakfastSkipped) {
    issues.push({
      emoji: "⚠️",
      type: "warn",
      msg: `First meal logged at ${earliest.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} — breakfast may have been skipped. Eating early boosts metabolism.`,
    });
  } else {
    issues.push({
      emoji: "✅",
      type: "ok",
      msg: `Good start! First meal at ${earliest.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.`,
    });
  }

  if (lateMeal) {
    issues.push({
      emoji: "⚠️",
      type: "warn",
      msg: `Last meal logged after 9 PM (${latest.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}). Late meals can disrupt sleep and digestion.`,
    });
  } else if (timestamps.length > 0) {
    issues.push({
      emoji: "✅",
      type: "ok",
      msg: "Last meal before 9 PM — great timing for digestion and sleep!",
    });
  }

  if (mealSpan > 0 && mealSpan < 8 && timestamps.length >= 3) {
    issues.push({
      emoji: "💡",
      type: "ok",
      msg: `Your ${timestamps.length} meals are spread over ${Math.round(mealSpan)} hours — consistent meal spacing supports stable energy.`,
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-border p-4"
      data-ocid="meal-timing.card"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">⏰</span>
        <div>
          <p className="text-sm font-bold text-foreground">
            Meal Timing Analysis
          </p>
          <p className="text-xs text-muted-foreground">
            {timestamps.length} meals logged today
          </p>
        </div>
      </div>
      <div className="space-y-2">
        {issues.map((issue) => (
          <div
            key={issue.msg.slice(0, 20)}
            className={`flex items-start gap-2 rounded-lg p-2.5 ${
              issue.type === "warn"
                ? "bg-amber-50 dark:bg-amber-900/20"
                : "bg-emerald-50 dark:bg-emerald-900/20"
            }`}
          >
            {issue.type === "warn" ? (
              <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
            )}
            <p className="text-xs text-foreground/80 leading-relaxed">
              {issue.msg}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
