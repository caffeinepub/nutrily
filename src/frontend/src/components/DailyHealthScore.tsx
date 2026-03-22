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

function calcHealthScore(
  calories: number,
  protein: number,
  fiber: number,
  water: number,
  waterGoal: number,
) {
  const proteinTarget = DAILY_GOALS.protein;
  const calorieTarget = DAILY_GOALS.calories;

  const proteinRatio = Math.min(protein / proteinTarget, 1);
  const proteinScore = Math.round(proteinRatio * 25);

  const fiberRatio = Math.min(fiber / 25, 1);
  const fiberScore = Math.round(fiberRatio * 20);

  const waterRatio = Math.min(water / waterGoal, 1);
  const waterScore = Math.round(waterRatio * 20);

  let calScore = 0;
  if (calories > 0) {
    const ratio = calories / calorieTarget;
    if (ratio <= 1.0) {
      calScore = Math.round(ratio * 35);
    } else {
      const over = ratio - 1;
      calScore = Math.max(0, Math.round(35 - over * 70));
    }
  }

  const total = proteinScore + fiberScore + waterScore + calScore;
  return {
    total: Math.min(100, total),
    proteinScore,
    fiberScore,
    waterScore,
    calScore,
    proteinRatio,
    fiberRatio,
    waterRatio,
    calRatio: Math.min(calories / calorieTarget, 1),
  };
}

function scoreColor(score: number): string {
  if (score >= 80) return "oklch(0.696 0.17 162)";
  if (score >= 60) return "oklch(0.59 0.2 264)";
  if (score >= 40) return "oklch(0.77 0.17 75)";
  return "oklch(0.65 0.25 27)";
}

function scoreLabel(score: number): string {
  if (score >= 80) return "Epic! \uD83D\uDD25";
  if (score >= 60) return "Good Progress";
  if (score >= 40) return "Keep Going";
  return "Let's Start";
}

interface SubBarProps {
  label: string;
  icon: string;
  ratio: number;
  color: string;
  current: number;
  unit: string;
  target: number;
}

function SubBar({
  label,
  icon,
  ratio,
  color,
  current,
  unit,
  target,
}: SubBarProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground flex items-center gap-1">
          <span>{icon}</span> {label}
        </span>
        <span className="font-semibold text-foreground">
          {Math.round(current)}
          {unit} / {Math.round(target)}
          {unit}
        </span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(ratio * 100, 100)}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export default function DailyHealthScore({
  calories,
  protein,
  fiber,
  waterGlasses,
}: Props) {
  const age = getUserAge();
  const waterGoal = getWaterGoalGlasses(age);

  const scores = useMemo(
    () => calcHealthScore(calories, protein, fiber, waterGlasses, waterGoal),
    [calories, protein, fiber, waterGlasses, waterGoal],
  );

  const color = scoreColor(scores.total);
  const label = scoreLabel(scores.total);

  const SIZE = 140;
  const STROKE = 12;
  const R = (SIZE - STROKE) / 2;
  const CIRC = 2 * Math.PI * R;
  const dash = (scores.total / 100) * CIRC;
  const gap = CIRC - dash;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-card rounded-2xl border border-border shadow-card p-5"
      data-ocid="health_score.card"
    >
      <h2 className="text-base font-bold text-foreground mb-4">
        Daily Health Score
      </h2>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Ring gauge */}
        <div
          className="relative flex-shrink-0"
          style={{ width: SIZE, height: SIZE }}
        >
          <svg
            width={SIZE}
            height={SIZE}
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            role="img"
            aria-label={`Health score: ${scores.total} out of 100`}
          >
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              fill="none"
              stroke="oklch(0.91 0.008 247)"
              strokeWidth={STROKE}
              className="dark:stroke-muted"
            />
            <motion.circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              fill="none"
              stroke={color}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={CIRC / 4}
              initial={{ strokeDasharray: `0 ${CIRC}` }}
              animate={{ strokeDasharray: `${dash} ${gap}` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-extrabold" style={{ color }}>
              {scores.total}
            </span>
            <span className="text-xs text-muted-foreground mt-0.5">
              {label}
            </span>
          </div>
        </div>

        {/* Sub-bars */}
        <div className="flex-1 w-full space-y-3">
          <SubBar
            label="Protein"
            icon="&#x1F4AA;"
            ratio={scores.proteinRatio}
            color="oklch(0.59 0.2 264)"
            current={protein}
            unit="g"
            target={DAILY_GOALS.protein}
          />
          <SubBar
            label="Fiber"
            icon="&#x1F966;"
            ratio={scores.fiberRatio}
            color="oklch(0.696 0.17 162)"
            current={fiber}
            unit="g"
            target={25}
          />
          <SubBar
            label="Water"
            icon="&#x1F4A7;"
            ratio={scores.waterRatio}
            color="oklch(0.71 0.18 264)"
            current={waterGlasses * 0.25}
            unit="L"
            target={waterGoal * 0.25}
          />
          <SubBar
            label="Calories"
            icon="&#x1F525;"
            ratio={scores.calRatio}
            color={color}
            current={calories}
            unit=" kcal"
            target={DAILY_GOALS.calories}
          />
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-4 italic">
        &ldquo;Do epic things daily, not perfect things&rdquo; &mdash; DoitEpic
      </p>
    </motion.div>
  );
}
