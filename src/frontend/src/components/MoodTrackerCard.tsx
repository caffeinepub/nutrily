import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const MOODS = [
  { emoji: "😩", label: "Exhausted", value: 1 },
  { emoji: "😕", label: "Low", value: 2 },
  { emoji: "😐", label: "Okay", value: 3 },
  { emoji: "😊", label: "Good", value: 4 },
  { emoji: "🤩", label: "Amazing", value: 5 },
];

const MOOD_MESSAGES: Record<
  number,
  { title: string; tips: string[]; color: string }
> = {
  1: {
    title: "Rest & Recover 💙",
    color:
      "from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 border-blue-200 dark:border-blue-800",
    tips: [
      "Eat light today — idli, steamed vegetables, or congee",
      "Avoid heavy fried foods that drain more energy",
      "Drink warm water with a pinch of turmeric",
      "Skip intense workouts — gentle stretching is perfect",
    ],
  },
  2: {
    title: "Gentle Progress 🌿",
    color:
      "from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 border-indigo-200 dark:border-indigo-800",
    tips: [
      "Start with a light breakfast — appam or poha",
      "A short 15-minute walk can shift your energy",
      "Drink 2 extra glasses of water today",
      "Log your meals — awareness builds momentum",
    ],
  },
  3: {
    title: "Steady & Consistent 💪",
    color:
      "from-gray-50 to-slate-50 dark:from-gray-950/30 dark:to-slate-950/30 border-gray-200 dark:border-gray-800",
    tips: [
      "Stay on track with your meal plan today",
      "Hit your water target — 2L minimum",
      "30 minutes of moderate exercise works great",
      "Log everything — small days build big results",
    ],
  },
  4: {
    title: "Push It Today! 🚀",
    color:
      "from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 border-emerald-200 dark:border-emerald-800",
    tips: [
      "Great energy! Hit your protein target today",
      "Try a challenging workout — strength or HIIT",
      "Meal prep something healthy for tomorrow too",
      "Share your good habits — positivity is contagious!",
    ],
  },
  5: {
    title: "You're on Fire! 🔥",
    color:
      "from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800",
    tips: [
      "Smash your workout — go heavy or go intense!",
      "Perfect day to hit a new personal record",
      "Eat clean and fuel this amazing energy",
      "This energy? Log it as a streak day!",
    ],
  },
};

const STORAGE_KEY = "doitepic_mood";

export default function MoodTrackerCard() {
  const today = new Date().toISOString().split("T")[0];
  const [selected, setSelected] = useState<number | null>(() => {
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY}_${today}`);
      return raw ? Number(raw) : null;
    } catch {
      return null;
    }
  });

  const handleMood = (value: number) => {
    setSelected(value);
    localStorage.setItem(`${STORAGE_KEY}_${today}`, String(value));
  };

  const message = selected ? MOOD_MESSAGES[selected] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="mb-5 bg-card rounded-xl border border-border shadow-sm p-4"
      data-ocid="mood.card"
    >
      <p className="text-sm font-semibold text-foreground mb-3">
        How are you feeling today? 🌤️
      </p>
      <div className="flex justify-between gap-1">
        {MOODS.map((m) => (
          <button
            key={m.value}
            type="button"
            data-ocid="mood.toggle"
            onClick={() => handleMood(m.value)}
            className={`flex flex-col items-center gap-1 flex-1 py-2 rounded-xl border-2 transition-all ${
              selected === m.value
                ? "border-primary bg-primary/10 scale-105"
                : "border-transparent hover:border-border hover:bg-muted/50"
            }`}
          >
            <span className="text-xl">{m.emoji}</span>
            <span className="text-[10px] font-medium text-muted-foreground">
              {m.label}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {message && (
          <motion.div
            key={selected}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div
              className={`mt-3 rounded-xl bg-gradient-to-r ${message.color} border p-3`}
            >
              <p className="text-sm font-bold text-foreground mb-2">
                {message.title}
              </p>
              <ul className="space-y-1">
                {message.tips.map((tip) => (
                  <li
                    key={tip}
                    className="text-xs text-muted-foreground flex items-start gap-1.5"
                  >
                    <span className="text-primary mt-0.5">→</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
