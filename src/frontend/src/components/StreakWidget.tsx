import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";
import { useEffect } from "react";
import { useCallerStreak, useUpdateStreak } from "../hooks/useQueries";

interface MilestoneBadge {
  days: number;
  label: string;
  emoji: string;
  color: string;
}

const MILESTONES: MilestoneBadge[] = [
  {
    days: 3,
    label: "Bronze",
    emoji: "🥉",
    color: "bg-amber-100 text-amber-700 border-amber-200",
  },
  {
    days: 7,
    label: "Silver",
    emoji: "🥈",
    color: "bg-slate-100 text-slate-700 border-slate-300",
  },
  {
    days: 30,
    label: "Gold",
    emoji: "🥇",
    color: "bg-yellow-100 text-yellow-700 border-yellow-300",
  },
];

function getBestStreak(currentStreak: number, longestStreak: number): number {
  try {
    const stored = Number(localStorage.getItem("doitepic_best_streak") ?? "0");
    const candidate = Math.max(stored, currentStreak, longestStreak);
    if (candidate > stored) {
      localStorage.setItem("doitepic_best_streak", String(candidate));
    }
    return candidate;
  } catch (_) {
    return longestStreak;
  }
}

function checkMissedYesterday(): boolean {
  try {
    const logs = localStorage.getItem("doitepic_food_logs");
    if (!logs) return false;
    const arr = JSON.parse(logs) as Array<{ date: string }>;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().split("T")[0];
    return !arr.some((l) => l.date === yStr);
  } catch (_) {
    return false;
  }
}

export default function StreakWidget() {
  const { data: streak } = useCallerStreak();
  const { mutate: updateStreak } = useUpdateStreak();

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    updateStreak({ dateStr: today, points: 0n });
  }, [updateStreak]);

  const currentStreak = streak ? Number(streak.currentStreak) : 0;
  const longestStreak = streak ? Number(streak.longestStreak) : 0;
  const totalPoints = streak ? Number(streak.totalPoints) : 0;

  const bestStreak = getBestStreak(currentStreak, longestStreak);
  const missedYesterday = currentStreak > 0 && checkMissedYesterday();

  const earnedMilestones = MILESTONES.filter((m) => bestStreak >= m.days);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-2xl p-4 text-white shadow-lg"
      data-ocid="streak.card"
    >
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Streak count */}
        <div className="flex items-center gap-3">
          <span className="text-4xl leading-none">🔥</span>
          <div>
            <div className="text-2xl font-extrabold leading-none">
              {currentStreak} Day{currentStreak !== 1 ? "s" : ""} Streak!
            </div>
            <div className="text-xs text-white/75 mt-0.5">
              Best: {bestStreak} day{bestStreak !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {/* Points */}
        <div
          className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1.5"
          data-ocid="streak.points"
        >
          <span className="text-lg">⭐</span>
          <span className="text-base font-bold">{totalPoints} pts</span>
        </div>
      </div>

      {/* Missed yesterday warning */}
      {missedYesterday && (
        <div
          className="mt-2.5 bg-white/20 rounded-xl px-3 py-1.5 flex items-center gap-2"
          data-ocid="streak.warning"
        >
          <span className="text-sm">⚠️</span>
          <span className="text-xs font-semibold">
            Missed yesterday — log today to keep your streak!
          </span>
        </div>
      )}

      {/* Milestone badges */}
      {earnedMilestones.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3" data-ocid="streak.badges">
          {earnedMilestones.map((m) => (
            <Badge
              key={m.label}
              className={`text-xs border font-semibold ${m.color}`}
            >
              {m.emoji} {m.label} Badge
            </Badge>
          ))}
        </div>
      )}

      {currentStreak === 0 && (
        <p className="text-xs text-white/70 mt-2">
          Log food or complete a check-in to start your streak!
        </p>
      )}
    </motion.div>
  );
}
