import { motion } from "motion/react";
import { useMemo } from "react";
import { DAILY_GOALS } from "../types";

interface Props {
  currentWeight?: number;
  goalType?: string;
  caloriesConsumed: number;
}

function predictGoal(
  currentWeight: number,
  goalType: string,
  calories: number,
) {
  const calorieTarget = DAILY_GOALS.calories;
  const deficit = calorieTarget - calories;

  if (goalType === "weightLoss") {
    // 500 kcal deficit/day = 0.5 kg/week
    const dailyDeficit = Math.max(0, deficit);
    const weeklyLoss = (dailyDeficit / 500) * 0.5;
    const goalWeight = Math.max(currentWeight - 10, 55);
    const kgToLose = currentWeight - goalWeight;
    if (weeklyLoss <= 0) {
      return {
        message: "At your current pace...",
        days: null,
        goalWeight,
        tagline:
          "Create a calorie deficit by reducing portions or adding exercise.",
      };
    }
    const weeksNeeded = kgToLose / weeklyLoss;
    const days = Math.round(weeksNeeded * 7);
    return {
      message: `At your current pace, you'll reach ${goalWeight}kg in ~${days} days`,
      days,
      goalWeight,
      tagline: "Stay consistent — every healthy meal counts!",
    };
  }

  if (goalType === "muscleGain") {
    // 300 kcal surplus/day = 0.3 kg/week muscle gain
    const dailySurplus = Math.max(0, calories - calorieTarget);
    const weeklyGain = (dailySurplus / 300) * 0.3;
    const goalWeight = currentWeight + 5;
    if (weeklyGain <= 0) {
      return {
        message: "Eat more to fuel muscle growth!",
        days: null,
        goalWeight,
        tagline: "Aim for a 200-300 kcal surplus with high protein.",
      };
    }
    const weeksNeeded = 5 / weeklyGain;
    const days = Math.round(weeksNeeded * 7);
    return {
      message: `At your current pace, you'll gain 5kg in ~${days} days`,
      days,
      goalWeight,
      tagline: "Keep hitting your protein goals daily!",
    };
  }

  return {
    message: "You're maintaining well! 💪",
    days: null,
    goalWeight: currentWeight,
    tagline: "Consistency is your superpower. Keep it up!",
  };
}

export default function GoalVisualizationCard({
  currentWeight,
  goalType,
  caloriesConsumed,
}: Props) {
  const prediction = useMemo(() => {
    if (!currentWeight || !goalType) return null;
    return predictGoal(currentWeight, goalType, caloriesConsumed);
  }, [currentWeight, goalType, caloriesConsumed]);

  if (!currentWeight || !goalType) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="bg-card rounded-2xl border border-border shadow-card p-5"
        data-ocid="goal_viz.card"
      >
        <h3 className="text-base font-bold text-foreground mb-2">
          Your Progress Prediction
        </h3>
        <p className="text-sm text-muted-foreground">
          Complete your profile with weight and health goal to see your
          prediction timeline. 🎯
        </p>
      </motion.div>
    );
  }

  const goalWeight = prediction?.goalWeight ?? currentWeight;
  const progressRatio =
    goalType === "maintenance"
      ? 1
      : goalType === "weightLoss"
        ? Math.max(
            0,
            Math.min(
              1,
              1 -
                (currentWeight - goalWeight) /
                  Math.max(currentWeight - goalWeight, 1),
            ),
          )
        : 0.1; // starting muscle gain

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="bg-card rounded-2xl border border-border shadow-card p-5"
      data-ocid="goal_viz.card"
    >
      <h3 className="text-base font-bold text-foreground mb-3">
        Your Progress Prediction
      </h3>

      <p className="text-sm font-semibold text-foreground mb-3">
        {prediction?.message}
      </p>

      {/* Timeline bar */}
      <div className="relative mb-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
          <span>Now: {currentWeight}kg</span>
          <span>Goal: {goalWeight}kg</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background:
                "linear-gradient(90deg, oklch(0.34 0.152 264), oklch(0.696 0.17 162))",
            }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(progressRatio * 100, 5)}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        {/* Progress dot */}
        <motion.div
          className="absolute top-5 w-4 h-4 rounded-full border-2 border-card shadow"
          style={{
            background: "oklch(0.696 0.17 162)",
            left: `calc(${Math.max(progressRatio * 100, 5)}% - 8px)`,
          }}
          initial={{ left: "0%" }}
          animate={{ left: `calc(${Math.max(progressRatio * 100, 5)}% - 8px)` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>

      <p className="text-xs text-muted-foreground italic">
        {prediction?.tagline}
      </p>
    </motion.div>
  );
}
