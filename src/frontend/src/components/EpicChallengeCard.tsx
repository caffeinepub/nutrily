import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useUpdateStreak } from "../hooks/useQueries";

const WEEKLY_CHALLENGES = [
  {
    day: "Sunday",
    emoji: "🧘",
    title: "Rest & Reflect",
    desc: "Take 10 minutes to reflect on your week. Rest is part of the epic journey!",
    xp: 10,
  },
  {
    day: "Monday",
    emoji: "💧",
    title: "Drink 2L Water Today",
    desc: "Start your week hydrated. Carry a water bottle everywhere you go today.",
    xp: 10,
  },
  {
    day: "Tuesday",
    emoji: "🚫",
    title: "No Fried Snacks Today",
    desc: "Skip the chips and vada. Choose steamed idli, boiled kappa, or fresh fruit.",
    xp: 10,
  },
  {
    day: "Wednesday",
    emoji: "🚶",
    title: "30 Minute Walk",
    desc: "Walk briskly for 30 minutes. Kerala tip: walk by the backwaters for extra peace!",
    xp: 10,
  },
  {
    day: "Thursday",
    emoji: "🥦",
    title: "Eat 3 Servings of Veggies",
    desc: "Load up with avial, thoran, or vegetable stew — Kerala's veggie cuisine is world-class.",
    xp: 10,
  },
  {
    day: "Friday",
    emoji: "📝",
    title: "Log All Meals on Time",
    desc: "Track every meal today — breakfast, lunch, snacks, and dinner. Consistency is power.",
    xp: 10,
  },
  {
    day: "Saturday",
    emoji: "🍛",
    title: "Try a New Kerala Dish",
    desc: "Explore Kerala cuisine! Try Olan, Kaalan, or Erissery if you haven't had them this week.",
    xp: 10,
  },
];

const STORAGE_KEY = "doitepic_challenge_done";

export default function EpicChallengeCard() {
  const dayIndex = new Date().getDay(); // 0=Sun
  const challenge = WEEKLY_CHALLENGES[dayIndex];
  const today = new Date().toISOString().split("T")[0];
  const storageKey = `${STORAGE_KEY}_${today}`;
  const [done, setDone] = useState(
    () => localStorage.getItem(storageKey) === "1",
  );
  const { mutate: updateStreak } = useUpdateStreak();

  const handleMarkDone = () => {
    if (done) return;
    setDone(true);
    localStorage.setItem(storageKey, "1");
    updateStreak({ dateStr: today, points: 10n });
    toast.success("+10 XP earned! Challenge completed! 🎉");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-5 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 p-4"
      data-ocid="challenge.card"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <span className="text-2xl">{challenge.emoji}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                Today's Epic Challenge
              </p>
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 font-medium">
                +10 XP
              </span>
            </div>
            <p className="text-sm font-bold text-foreground">
              {challenge.title}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              {challenge.desc}
            </p>
          </div>
        </div>
        <button
          type="button"
          data-ocid="challenge.primary_button"
          onClick={handleMarkDone}
          disabled={done}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
            done
              ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 cursor-default"
              : "bg-amber-500 hover:bg-amber-600 text-white active:scale-95"
          }`}
        >
          {done ? "✅ Done!" : "Mark Done"}
        </button>
      </div>
    </motion.div>
  );
}
