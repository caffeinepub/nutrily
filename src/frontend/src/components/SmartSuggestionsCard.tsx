import { motion } from "motion/react";
import { useMemo } from "react";
import { DAILY_GOALS } from "../types";
import { getUserAge, getWaterGoalGlasses } from "../utils/ageUtils";

interface Props {
  calories: number;
  protein: number;
  fiber: number;
  waterGlasses: number;
}

interface Suggestion {
  key: string;
  icon: string;
  text: string;
  type: "info" | "warning" | "success";
}

function buildSuggestions(
  calories: number,
  protein: number,
  fiber: number,
  water: number,
  waterGoal: number,
): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const proteinTarget = DAILY_GOALS.protein;
  const calorieTarget = DAILY_GOALS.calories;

  if (protein < proteinTarget * 0.5) {
    suggestions.push({
      key: "protein",
      icon: "\u{1F4AA}",
      text: "Protein is low today \u2192 add 2 boiled eggs or 100g paneer to your next meal",
      type: "info",
    });
  }

  if (fiber < 25 * 0.3) {
    suggestions.push({
      key: "fiber",
      icon: "\u{1F966}",
      text: "Fiber is low \u2192 add a banana, 1 bowl dal, or a vegetable curry",
      type: "info",
    });
  }

  if (water < waterGoal * 0.4) {
    suggestions.push({
      key: "water",
      icon: "\u{1F4A7}",
      text: "Stay hydrated \u2192 drink 2 more glasses of water now",
      type: "warning",
    });
  }

  if (calories > calorieTarget * 1.1) {
    suggestions.push({
      key: "over",
      icon: "\u26A0\uFE0F",
      text: "Over calorie limit today \u2192 skip the evening snack and take a short walk",
      type: "warning",
    });
  }

  if (suggestions.length === 0 && calories > 0) {
    suggestions.push({
      key: "ontrack",
      icon: "\u{1F525}",
      text: "You're on track today! Keep it epic \u2014 DoitEpic!",
      type: "success",
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({
      key: "start",
      icon: "\u{1F3AF}",
      text: "Start logging your meals to get personalized suggestions",
      type: "info",
    });
  }

  return suggestions.slice(0, 3);
}

const TYPE_STYLES: Record<string, string> = {
  info: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
  warning:
    "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
  success:
    "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800",
};

export default function SmartSuggestionsCard({
  calories,
  protein,
  fiber,
  waterGlasses,
}: Props) {
  const age = getUserAge();
  const waterGoal = getWaterGoalGlasses(age);

  const suggestions = useMemo(
    () => buildSuggestions(calories, protein, fiber, waterGlasses, waterGoal),
    [calories, protein, fiber, waterGlasses, waterGoal],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="bg-card rounded-2xl border border-border shadow-card p-5"
      data-ocid="smart_suggestions.card"
    >
      <h3 className="text-base font-bold text-foreground mb-3">
        Smart Suggestions
      </h3>
      <div className="space-y-2">
        {suggestions.map((s) => (
          <div
            key={s.key}
            className={`flex items-start gap-3 rounded-xl border px-3 py-2.5 ${TYPE_STYLES[s.type]}`}
          >
            <span className="text-base flex-shrink-0 mt-0.5">{s.icon}</span>
            <p className="text-sm text-foreground leading-relaxed">{s.text}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
