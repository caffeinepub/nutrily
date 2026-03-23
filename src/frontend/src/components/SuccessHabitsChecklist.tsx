import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useUpdateStreak } from "../hooks/useQueries";

const HABITS: Record<
  "loss" | "gain" | "maintenance",
  { id: string; label: string; emoji: string }[]
> = {
  loss: [
    {
      id: "breakfast",
      emoji: "🌅",
      label: "Ate breakfast within 1 hour of waking",
    },
    { id: "no_sugar", emoji: "🚫", label: "Avoided sugary drinks today" },
    { id: "walk", emoji: "🚶", label: "Walked 30+ minutes" },
    { id: "sleep", emoji: "😴", label: "Slept 7+ hours last night" },
    { id: "log", emoji: "📝", label: "Logged all meals on time" },
  ],
  gain: [
    { id: "protein", emoji: "🥩", label: "Hit protein target today" },
    { id: "meals5", emoji: "🍽️", label: "Ate 5+ meals / snacks" },
    { id: "lifted", emoji: "🏋️", label: "Lifted weights today" },
    { id: "water3l", emoji: "💧", label: "Drank 3L of water" },
    { id: "sleep8", emoji: "😴", label: "Slept 8+ hours last night" },
  ],
  maintenance: [
    {
      id: "balanced",
      emoji: "⚖️",
      label: "Ate a balanced meal (protein + veg + carb)",
    },
    { id: "water2l", emoji: "💧", label: "Drank 2L of water" },
    { id: "exercise", emoji: "🏃", label: "Did 30+ minutes of activity" },
    { id: "no_junk", emoji: "🥗", label: "Avoided ultra-processed foods" },
    { id: "mindful", emoji: "🧘", label: "Ate mindfully without screens" },
  ],
};

interface Props {
  goalType: "loss" | "gain" | "maintenance";
}

export default function SuccessHabitsChecklist({ goalType }: Props) {
  const habits = HABITS[goalType] ?? HABITS.maintenance;
  const today = new Date().toISOString().split("T")[0];
  const storageKey = `doitepic_habits_${goalType}_${today}`;

  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "{}");
    } catch {
      return {};
    }
  });
  const [xpAwarded, setXpAwarded] = useState(
    () => localStorage.getItem(`${storageKey}_xp`) === "1",
  );
  const { mutate: updateStreak } = useUpdateStreak();

  const handleToggle = (id: string) => {
    const next = { ...checked, [id]: !checked[id] };
    setChecked(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
    const allDone = habits.every((h) => next[h.id]);
    if (allDone && !xpAwarded) {
      setXpAwarded(true);
      localStorage.setItem(`${storageKey}_xp`, "1");
      updateStreak({ dateStr: today, points: 15n });
      toast.success("All habits done! +15 XP awarded! 🏆");
    }
  };

  const doneCount = habits.filter((h) => checked[h.id]).length;
  const pct = Math.round((doneCount / habits.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 bg-card rounded-xl border border-border p-4"
      data-ocid="habits.card"
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-bold text-foreground">
            ✅ Daily Success Habits
          </p>
          <p className="text-xs text-muted-foreground">
            {doneCount} / {habits.length} done — Complete all for +15 XP
          </p>
        </div>
        <div className="text-right">
          <span
            className={`text-lg font-black ${
              pct === 100
                ? "text-emerald-500"
                : pct >= 60
                  ? "text-amber-500"
                  : "text-muted-foreground"
            }`}
          >
            {pct}%
          </span>
        </div>
      </div>
      {/* Progress bar */}
      <div className="w-full bg-muted rounded-full h-1.5 mb-3">
        <div
          className={`h-1.5 rounded-full transition-all ${
            pct === 100 ? "bg-emerald-500" : "bg-primary"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="space-y-2">
        {habits.map((h) => (
          <label
            key={h.id}
            htmlFor={`habit-${h.id}`}
            className="flex items-center gap-3 cursor-pointer group"
            data-ocid="habits.checkbox"
          >
            <Checkbox
              id={`habit-${h.id}`}
              checked={!!checked[h.id]}
              onCheckedChange={() => handleToggle(h.id)}
              className="flex-shrink-0"
            />
            <span className="text-sm text-muted-foreground flex-1">
              {h.emoji} {h.label}
            </span>
          </label>
        ))}
      </div>
      {xpAwarded && (
        <div className="mt-3 flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg p-2">
          <span>🏆</span>
          <span className="text-xs font-semibold">
            All habits complete! +15 XP earned today!
          </span>
        </div>
      )}
    </motion.div>
  );
}
