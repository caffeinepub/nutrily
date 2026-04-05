import { getExerciseDetail } from "@/data/exerciseDetails";
import type { ExerciseCategory } from "@/data/exerciseDetails";
import { FlipHorizontal, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Suspense, lazy, useCallback, useState } from "react";
import { ExerciseAnimation } from "./ExerciseAnimation";

const HumanAnimation3D = lazy(() => import("./HumanAnimation3D"));

interface Exercise {
  name: string;
  emoji: string;
  muscle: string;
  sets: string;
  rest: string;
  difficulty: string;
  tip: string;
}

interface ExerciseDetailModalProps {
  exercise: Exercise | null;
  onClose: () => void;
}

type SpeedOption = 0.5 | 1 | 1.5;
type TabOption = "steps" | "muscles" | "mistakes";

const CATEGORY_CONFIG: Record<
  ExerciseCategory,
  { label: string; className: string }
> = {
  beginner: {
    label: "Beginner",
    className:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  },
  muscleGain: {
    label: "Muscle Gain",
    className:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  },
  fatLoss: {
    label: "Fat Loss",
    className:
      "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  },
};

function saveCompletion(exerciseName: string): void {
  const key = "doitepic_exercise_completions";
  const existing = JSON.parse(localStorage.getItem(key) || "{}");
  const today = new Date().toISOString().split("T")[0];
  if (!existing[today]) existing[today] = [];
  if (!existing[today].includes(exerciseName))
    existing[today].push(exerciseName);
  localStorage.setItem(key, JSON.stringify(existing));

  const xpKey = "doitepic_xp";
  const currentXp = Number.parseInt(localStorage.getItem(xpKey) || "0", 10);
  localStorage.setItem(xpKey, String(currentXp + 15));

  const pointsKey = "doitepic_points";
  const currentPoints = Number.parseInt(
    localStorage.getItem(pointsKey) || "0",
    10,
  );
  localStorage.setItem(pointsKey, String(currentPoints + 15));
}

function isCompletedToday(exerciseName: string): boolean {
  const key = "doitepic_exercise_completions";
  const existing = JSON.parse(localStorage.getItem(key) || "{}");
  const today = new Date().toISOString().split("T")[0];
  return (
    Array.isArray(existing[today]) && existing[today].includes(exerciseName)
  );
}

export default function ExerciseDetailModal({
  exercise,
  onClose,
}: ExerciseDetailModalProps) {
  const [speed, setSpeed] = useState<SpeedOption>(1);
  const [mirror, setMirror] = useState(false);
  const [activeTab, setActiveTab] = useState<TabOption>("steps");
  const [repCount, setRepCount] = useState(10);
  const [currentSet, setCurrentSet] = useState(1);
  const [completedSets, setCompletedSets] = useState<number[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [view3D, setView3D] = useState(false);

  const totalSets = 3;

  const handleMarkSetDone = useCallback(() => {
    setCompletedSets((prev) => {
      if (prev.includes(currentSet)) return prev;
      const next = [...prev, currentSet];
      if (currentSet < totalSets) setCurrentSet((s) => s + 1);
      return next;
    });
  }, [currentSet]);

  const handleDidComplete = useCallback(() => {
    if (!exercise) return;
    saveCompletion(exercise.name);
    setAlreadyDone(true);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
    window.dispatchEvent(new Event("doitepic_exercise_completed"));
  }, [exercise]);

  if (!exercise) return null;

  const detail = getExerciseDetail(exercise.name);
  const catConfig = CATEGORY_CONFIG[detail.category];
  const completedToday = alreadyDone || isCompletedToday(exercise.name);

  const speedOptions: { value: SpeedOption; label: string }[] = [
    { value: 0.5, label: "0.5× Slow" },
    { value: 1, label: "1× Normal" },
    { value: 1.5, label: "1.5× Fast" },
  ];

  const tabs: { id: TabOption; label: string; emoji: string }[] = [
    { id: "steps", label: "Steps", emoji: "📋" },
    { id: "muscles", label: "Muscles", emoji: "💪" },
    { id: "mistakes", label: "Mistakes", emoji: "⚠️" },
  ];

  return (
    <AnimatePresence>
      <motion.div
        key="exercise-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        data-ocid="exercise_detail.modal"
      >
        <motion.div
          key="exercise-modal-card"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: "spring", damping: 28, stiffness: 280 }}
          className="bg-card w-full sm:max-w-lg max-h-[95dvh] rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header gradient with animation */}
          <div
            className="relative flex flex-col items-center pt-6 pb-4 px-4"
            style={{
              background: "linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)",
            }}
          >
            <button
              type="button"
              data-ocid="exercise_detail.close_button"
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
            >
              <X size={16} />
            </button>

            {/* 2D / 3D toggle */}
            <div
              className="flex items-center gap-1 mb-3 bg-white/10 rounded-full p-1"
              data-ocid="exercise_detail.toggle"
            >
              <button
                type="button"
                onClick={() => setView3D(false)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  !view3D
                    ? "bg-white text-[#1E3A8A]"
                    : "text-white/70 hover:text-white"
                }`}
              >
                2D Demo
              </button>
              <button
                type="button"
                onClick={() => setView3D(true)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  view3D
                    ? "bg-white text-[#1E3A8A]"
                    : "text-white/70 hover:text-white"
                }`}
              >
                🧍 3D View
              </button>
            </div>

            {/* Animation area */}
            <div className="mb-3 flex justify-center">
              {view3D ? (
                <div
                  style={{
                    width: 200,
                    height: 280,
                    borderRadius: 12,
                    overflow: "hidden",
                  }}
                >
                  <Suspense
                    fallback={
                      <div
                        style={{
                          width: 200,
                          height: 280,
                          background: "#0f172a",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#60A5FA",
                          fontSize: 12,
                          borderRadius: 12,
                        }}
                      >
                        Loading 3D...
                      </div>
                    }
                  >
                    <HumanAnimation3D
                      exerciseType={exercise.name}
                      speed={speed}
                      mirrored={mirror}
                    />
                  </Suspense>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <ExerciseAnimation
                    name={exercise.name}
                    size={
                      exercise.name.toLowerCase().includes("push") ? 160 : 100
                    }
                    speed={speed}
                    mirror={mirror}
                  />
                  {exercise.name.toLowerCase().includes("push") && (
                    <div
                      style={{
                        background: "#1a1a2e",
                        borderRadius: 8,
                        padding: "6px 12px",
                        textAlign: "center",
                        border: "1px solid #ef4444",
                      }}
                    >
                      <p
                        style={{
                          fontSize: 11,
                          color: "#ef4444",
                          fontWeight: 700,
                          margin: 0,
                        }}
                      >
                        💪 Muscles: Chest, Triceps, Shoulders
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Speed + Mirror controls */}
            <div
              className="flex items-center gap-2 mb-3 flex-wrap justify-center"
              data-ocid="exercise_detail.speed_control"
            >
              {speedOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSpeed(opt.value)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                    speed === opt.value
                      ? "bg-white text-[#1E3A8A] border-white font-bold"
                      : "border-white/40 text-white/80 hover:border-white hover:text-white"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
              <button
                type="button"
                data-ocid="exercise_detail.mirror_toggle"
                onClick={() => setMirror((m) => !m)}
                title="Mirror mode"
                className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1 transition-all ${
                  mirror
                    ? "bg-white text-[#1E3A8A] border-white"
                    : "border-white/40 text-white/80 hover:border-white hover:text-white"
                }`}
              >
                <FlipHorizontal size={12} />
                Mirror
              </button>
            </div>

            {/* Name + Badges */}
            <div className="text-center">
              <h2 className="text-lg font-bold text-white mb-1.5">
                {exercise.emoji} {exercise.name}
              </h2>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/20 text-white font-medium">
                  {exercise.difficulty}
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${catConfig.className}`}
                >
                  {catConfig.label}
                </span>
              </div>
            </div>
          </div>

          {/* Scrollable body */}
          <div className="overflow-y-auto flex-1">
            {/* Tab navigation */}
            <div className="flex border-b border-border px-4 pt-3">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  data-ocid={`exercise_detail.${tab.id}_tab`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 pb-2.5 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? "border-[#1E3A8A] text-[#1E3A8A] dark:border-blue-400 dark:text-blue-400"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.emoji} {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="p-4 min-h-[180px]">
              {activeTab === "steps" && (
                <motion.div
                  key="steps"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-3"
                >
                  {detail.steps.map((step, i) => (
                    <div key={step} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#1E3A8A] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm text-foreground leading-relaxed">
                        {step}
                      </p>
                    </div>
                  ))}
                </motion.div>
              )}

              {activeTab === "muscles" && (
                <motion.div
                  key="muscles"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Primary Muscles
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {detail.muscles.primary.map((m) => (
                        <span
                          key={m}
                          className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 text-sm font-semibold"
                        >
                          💪 {m}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Secondary / Stabilizers
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {detail.muscles.secondary.map((m) => (
                        <span
                          key={m}
                          className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-sm"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-muted rounded-xl">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        Muscle group:{" "}
                      </span>
                      {exercise.muscle}
                    </p>
                  </div>
                </motion.div>
              )}

              {activeTab === "mistakes" && (
                <motion.div
                  key="mistakes"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-3"
                >
                  {detail.mistakes.map((item) => (
                    <div
                      key={item.mistake}
                      className="rounded-xl border border-border overflow-hidden"
                    >
                      <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20">
                        <span className="text-red-500 font-bold text-base flex-shrink-0">
                          ✕
                        </span>
                        <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                          {item.mistake}
                        </p>
                      </div>
                      <div className="flex items-start gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20">
                        <span className="text-emerald-600 font-bold text-base flex-shrink-0">
                          ✓
                        </span>
                        <p className="text-sm text-emerald-700 dark:text-emerald-300">
                          {item.fix}
                        </p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Reps Counter */}
            <div className="mx-4 mb-4 p-4 bg-muted rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Reps Counter
                </p>
                <p className="text-xs text-muted-foreground">
                  Set {currentSet} of {totalSets}
                </p>
              </div>

              {/* Set progress dots */}
              <div className="flex justify-center gap-2 mb-4">
                {Array.from({ length: totalSets }, (_, i) => i + 1).map((s) => (
                  <div
                    key={s}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      completedSets.includes(s)
                        ? "bg-emerald-500 text-white"
                        : s === currentSet
                          ? "bg-[#1E3A8A] text-white"
                          : "bg-border text-muted-foreground"
                    }`}
                  >
                    {completedSets.includes(s) ? "✓" : s}
                  </div>
                ))}
              </div>

              {/* Big rep counter */}
              <div className="flex items-center justify-center gap-6 mb-4">
                <button
                  type="button"
                  data-ocid="exercise_detail.rep_decrease_button"
                  onClick={() => setRepCount((r) => Math.max(1, r - 1))}
                  className="w-12 h-12 rounded-full bg-card border-2 border-border hover:border-[#1E3A8A] text-2xl font-bold text-foreground transition-colors active:scale-90"
                >
                  −
                </button>
                <span className="text-5xl font-bold text-foreground w-16 text-center tabular-nums">
                  {repCount}
                </span>
                <button
                  type="button"
                  data-ocid="exercise_detail.rep_increase_button"
                  onClick={() => setRepCount((r) => r + 1)}
                  className="w-12 h-12 rounded-full bg-card border-2 border-border hover:border-[#1E3A8A] text-2xl font-bold text-foreground transition-colors active:scale-90"
                >
                  +
                </button>
              </div>
              <p className="text-center text-xs text-muted-foreground mb-3">
                reps per set
              </p>

              <button
                type="button"
                data-ocid="exercise_detail.mark_set_done_button"
                disabled={completedSets.includes(currentSet)}
                onClick={handleMarkSetDone}
                className="w-full py-2.5 rounded-xl bg-[#1E3A8A] text-white text-sm font-semibold transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1e40af]"
              >
                {completedSets.includes(currentSet)
                  ? "✓ Set Done!"
                  : `Mark Set ${currentSet} Done`}
              </button>
            </div>

            {/* Did You Complete? */}
            <div className="px-4 pb-6">
              <AnimatePresence mode="wait">
                {showConfetti ? (
                  <motion.div
                    key="confetti"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-center"
                    data-ocid="exercise_detail.success_state"
                  >
                    <p className="text-2xl mb-1">🎉</p>
                    <p className="font-bold text-lg">Epic! +15 XP</p>
                    <p className="text-sm text-white/80">
                      Completion saved for today
                    </p>
                  </motion.div>
                ) : (
                  <motion.button
                    key="complete-btn"
                    type="button"
                    data-ocid="exercise_detail.complete_button"
                    onClick={handleDidComplete}
                    disabled={completedToday}
                    whileTap={{ scale: 0.97 }}
                    className={`w-full py-4 rounded-2xl text-white font-bold text-base transition-all ${
                      completedToday
                        ? "bg-emerald-400/60 cursor-not-allowed"
                        : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg"
                    }`}
                  >
                    {completedToday
                      ? "✓ Completed Today! (+15 XP)"
                      : "✅ Did You Complete? +15 XP"}
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
