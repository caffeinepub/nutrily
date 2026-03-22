import { Progress } from "@/components/ui/progress";
import { motion } from "motion/react";
import { useCallback, useMemo, useState } from "react";

interface Mission {
  id: string;
  label: string;
  target: number;
  xp: number;
  emoji: string;
}

const MISSIONS: Mission[] = [
  {
    id: "log_meals",
    label: "Log 5 meals this week",
    target: 5,
    xp: 50,
    emoji: "🍽️",
  },
  {
    id: "no_processed",
    label: "No processed foods for 3 days",
    target: 3,
    xp: 75,
    emoji: "🥗",
  },
  {
    id: "water_goal",
    label: "Hit water goal 4 days this week",
    target: 4,
    xp: 100,
    emoji: "💧",
  },
];

function getWeekKey(): string {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNum = Math.ceil(
    ((now.getTime() - startOfYear.getTime()) / 86400000 +
      startOfYear.getDay() +
      1) /
      7,
  );
  return `doitepic_missions_${now.getFullYear()}_w${weekNum}`;
}

function loadProgress(): Record<string, number> {
  try {
    const key = getWeekKey();
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveProgress(progress: Record<string, number>) {
  try {
    localStorage.setItem(getWeekKey(), JSON.stringify(progress));
  } catch {
    // ignore
  }
}

export default function WeeklyMissionsCard() {
  const [progress, setProgress] =
    useState<Record<string, number>>(loadProgress);

  const increment = useCallback((id: string, target: number) => {
    setProgress((prev) => {
      const current = prev[id] ?? 0;
      if (current >= target) return prev;
      const next = { ...prev, [id]: current + 1 };
      saveProgress(next);
      return next;
    });
  }, []);

  const totalXp = useMemo(
    () =>
      MISSIONS.reduce((sum, m) => {
        const prog = progress[m.id] ?? 0;
        return sum + (prog >= m.target ? m.xp : 0);
      }, 0),
    [progress],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="bg-card rounded-2xl border border-border shadow-card p-5"
      data-ocid="weekly_missions.card"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-foreground">Weekly Missions</h3>
        {totalXp > 0 && (
          <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
            +{totalXp} XP earned
          </span>
        )}
      </div>

      <div className="space-y-4">
        {MISSIONS.map((mission, idx) => {
          const prog = progress[mission.id] ?? 0;
          const done = prog >= mission.target;
          const pct = Math.min((prog / mission.target) * 100, 100);

          return (
            <div
              key={mission.id}
              data-ocid={`weekly_missions.item.${(idx + 1) as 1}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-base">{mission.emoji}</span>
                  <span
                    className={`text-sm font-medium ${done ? "line-through text-muted-foreground" : "text-foreground"}`}
                  >
                    {mission.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {done ? (
                    <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                      ✓ +{mission.xp} XP
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {prog}/{mission.target}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={pct} className="h-2 flex-1" />
                {!done && (
                  <button
                    type="button"
                    onClick={() => increment(mission.id, mission.target)}
                    className="text-xs text-primary font-medium hover:opacity-80 transition-opacity"
                    data-ocid={`weekly_missions.toggle.${(idx + 1) as 1}`}
                  >
                    +1
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground mt-3">
        Missions reset every Monday. Keep logging to earn XP! ⭐
      </p>
    </motion.div>
  );
}
