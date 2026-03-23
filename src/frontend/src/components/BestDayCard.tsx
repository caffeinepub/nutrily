import { TrendingUp } from "lucide-react";
import { motion } from "motion/react";

interface Props {
  todayScore: number;
}

function getBestDay(): { day: string; score: number } | null {
  const results: { day: string; score: number }[] = [];
  try {
    for (let i = 1; i <= 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      const raw = localStorage.getItem(`doitepic_foodlog_${key}`);
      if (!raw) continue;
      const entries = JSON.parse(raw) as {
        calories: number;
        protein: number;
      }[];
      if (entries.length === 0) continue;
      const calories = entries.reduce((s, e) => s + e.calories, 0);
      const protein = entries.reduce((s, e) => s + e.protein, 0);
      // simple score
      let score = 0;
      if (calories >= 1200 && calories <= 2200) score += 40;
      else if (calories >= 800) score += 20;
      if (protein >= 50) score += 30;
      else if (protein >= 30) score += 15;
      if (entries.length >= 3) score += 30;
      else if (entries.length >= 2) score += 15;
      results.push({
        day: d.toLocaleDateString(undefined, {
          weekday: "long",
          month: "short",
          day: "numeric",
        }),
        score,
      });
    }
  } catch {
    // ignore
  }
  if (results.length === 0) return null;
  return results.reduce((best, r) => (r.score > best.score ? r : best));
}

export default function BestDayCard({ todayScore }: Props) {
  const best = getBestDay();
  if (!best) return null;

  const isBetter = todayScore > best.score;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-border p-4"
      data-ocid="best-day.card"
    >
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="w-5 h-5 text-primary" />
        <p className="text-sm font-bold text-foreground">Best Day This Week</p>
      </div>
      <div className="flex items-center justify-between bg-gradient-to-r from-primary/10 to-emerald-500/10 rounded-xl p-3">
        <div>
          <p className="text-xs text-muted-foreground">7-day best</p>
          <p className="text-sm font-bold text-foreground">{best.day}</p>
          <p className="text-xs text-primary font-semibold">
            {best.score} / 100 score
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Today</p>
          <p
            className={`text-xl font-black ${
              isBetter ? "text-emerald-500" : "text-foreground"
            }`}
          >
            {todayScore}
          </p>
          {isBetter && (
            <p className="text-xs text-emerald-500 font-semibold">
              🏆 New best!
            </p>
          )}
        </div>
      </div>
      {!isBetter && (
        <p className="text-xs text-muted-foreground mt-2">
          💪 Beat {best.day}'s score of {best.score} — you're{" "}
          {best.score - todayScore} points away!
        </p>
      )}
    </motion.div>
  );
}
