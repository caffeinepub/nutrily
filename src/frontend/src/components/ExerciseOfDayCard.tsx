import { motion } from "motion/react";
import { useEffect, useState } from "react";

const FEATURED_EXERCISES = [
  {
    emoji: "💪",
    name: "Push-ups",
    muscle: "Chest & Triceps",
    cal10: 58,
    tip: "Keep your core tight throughout the movement",
  },
  {
    emoji: "🦵",
    name: "Squats",
    muscle: "Quads & Glutes",
    cal10: 70,
    tip: "Keep your chest up and push your knees outward",
  },
  {
    emoji: "⚡",
    name: "Plank Hold",
    muscle: "Core & Shoulders",
    cal10: 45,
    tip: "Squeeze your glutes and don't let hips sag",
  },
  {
    emoji: "🏃",
    name: "High Knees",
    muscle: "Full Body",
    cal10: 100,
    tip: "Drive your knees above hip height for max burn",
  },
  {
    emoji: "🔺",
    name: "Burpees",
    muscle: "Full Body",
    cal10: 115,
    tip: "Land softly and maintain a fast, controlled pace",
  },
  {
    emoji: "🧘",
    name: "Mountain Climbers",
    muscle: "Core & Cardio",
    cal10: 95,
    tip: "Drive knees to chest as fast as you can",
  },
  {
    emoji: "🏋️",
    name: "Lunges",
    muscle: "Legs & Glutes",
    cal10: 65,
    tip: "Keep your front knee above your ankle, not beyond toes",
  },
];

const STORAGE_KEY = "doitepic_eod_timer";

export default function ExerciseOfDayCard() {
  const dayIdx = new Date().getDay();
  const ex = FEATURED_EXERCISES[dayIdx];
  const [timerActive, setTimerActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setDone(localStorage.getItem(`${STORAGE_KEY}_${today}`) === "1");
  }, []);

  useEffect(() => {
    if (!timerActive) return;
    if (seconds >= 30) {
      setTimerActive(false);
      const today = new Date().toISOString().split("T")[0];
      localStorage.setItem(`${STORAGE_KEY}_${today}`, "1");
      setDone(true);
      return;
    }
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [timerActive, seconds]);

  const handleTryIt = () => {
    setSeconds(0);
    setTimerActive(true);
  };

  const pct = Math.round((seconds / 30) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 rounded-xl bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] text-white p-4"
      data-ocid="exercise-of-day.card"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-blue-200 uppercase tracking-wide mb-1">
            Exercise of the Day
          </p>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-3xl">{ex.emoji}</span>
            <p className="text-xl font-bold">{ex.name}</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs mb-2">
            <span className="px-2 py-0.5 rounded-full bg-white/20 font-medium">
              💪 {ex.muscle}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/20 font-medium">
              🔥 ~{ex.cal10} kcal / 10 min
            </span>
          </div>
          <p className="text-xs text-blue-100">💡 {ex.tip}</p>
        </div>

        <div className="flex-shrink-0">
          {!timerActive && !done && (
            <button
              type="button"
              data-ocid="exercise-of-day.primary_button"
              onClick={handleTryIt}
              className="px-4 py-2 bg-white text-[#1E3A8A] font-bold text-sm rounded-full hover:bg-blue-50 active:scale-95 transition-all"
            >
              Try It!
            </button>
          )}
          {timerActive && (
            <div className="flex flex-col items-center gap-1">
              <div className="relative w-12 h-12">
                <svg
                  className="w-12 h-12 -rotate-90"
                  viewBox="0 0 40 40"
                  aria-label="Timer progress"
                  role="img"
                >
                  <title>Timer</title>
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    fill="none"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="4"
                  />
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    fill="none"
                    stroke="white"
                    strokeWidth="4"
                    strokeDasharray={`${2 * Math.PI * 16}`}
                    strokeDashoffset={`${2 * Math.PI * 16 * (1 - pct / 100)}`}
                    className="transition-all"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                  {30 - seconds}
                </span>
              </div>
              <span className="text-xs text-blue-200">secs left</span>
            </div>
          )}
          {done && !timerActive && (
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl">✅</span>
              <span className="text-xs text-blue-200">Done today!</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
