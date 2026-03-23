import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

interface Exercise {
  name: string;
  emoji: string;
  muscle: string;
  sets: string;
  rest: string;
  difficulty: string;
  tip: string;
}

interface WorkoutTimerProps {
  exercises: Exercise[];
  planName: string;
  onClose: () => void;
  onSaveHistory?: (durationSeconds: number) => void;
}

type TimerState = "exercise" | "rest" | "complete";

function parseSets(setsStr: string): { count: number; duration: number } {
  const minMatch = setsStr.match(/(\d+)\s*min/);
  if (minMatch)
    return { count: 1, duration: Number.parseInt(minMatch[1]) * 60 };

  const crossMatch = setsStr.match(/(\d+)[×x](\d+)(s?)/);
  if (crossMatch) {
    const sets = Number.parseInt(crossMatch[1]);
    const repsOrSecs = Number.parseInt(crossMatch[2]);
    const isSeconds = crossMatch[3] === "s";
    return {
      count: sets,
      duration: isSeconds ? repsOrSecs : Math.max(repsOrSecs * 3, 15),
    };
  }

  return { count: 3, duration: 30 };
}

function parseRestSeconds(restStr: string): number {
  const match = restStr.match(/(\d+)s/);
  if (match) return Number.parseInt(match[1]);
  const minMatch = restStr.match(/(\d+)\s*min/);
  if (minMatch) return Number.parseInt(minMatch[1]) * 60;
  return 30;
}

const CIRCLE_R = 54;
const CIRCLE_C = 2 * Math.PI * CIRCLE_R;

function CountdownRing({
  total,
  remaining,
  state,
}: {
  total: number;
  remaining: number;
  state: TimerState;
}) {
  const progress = total > 0 ? remaining / total : 0;
  const dashOffset = CIRCLE_C * (1 - progress);
  const color = state === "rest" ? "#F59E0B" : "#10B981";

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: 140, height: 140 }}
    >
      <svg
        width="140"
        height="140"
        className="-rotate-90"
        role="img"
        aria-label="Countdown timer"
      >
        <circle
          cx="70"
          cy="70"
          r={CIRCLE_R}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-muted/30"
        />
        <circle
          cx="70"
          cy="70"
          r={CIRCLE_R}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={CIRCLE_C}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 1s linear" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold tabular-nums" style={{ color }}>
          {remaining}
        </span>
        <span className="text-xs text-muted-foreground font-medium">sec</span>
      </div>
    </div>
  );
}

export default function WorkoutTimer({
  exercises,
  planName,
  onClose,
  onSaveHistory,
}: WorkoutTimerProps) {
  const [exIdx, setExIdx] = useState(0);
  const [setIdx, setSetIdx] = useState(0);
  const [timerState, setTimerState] = useState<TimerState>("exercise");
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [setsCompleted, setSetsCompleted] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentExercise = exercises[exIdx];
  const parsedSets = parseSets(currentExercise?.sets ?? "3×10");

  const startExercisePhase = useCallback(
    (eIdx: number, _sIdx: number) => {
      const ex = exercises[eIdx];
      if (!ex) {
        setTimerState("complete");
        return;
      }
      const { duration } = parseSets(ex.sets);
      setTimerState("exercise");
      setTimeLeft(duration);
      setTotalTime(duration);
    },
    [exercises],
  );

  const startRestPhase = useCallback(
    (eIdx: number) => {
      const ex = exercises[eIdx];
      if (!ex) {
        setTimerState("complete");
        return;
      }
      const restSecs = parseRestSeconds(ex.rest);
      setTimerState("rest");
      setTimeLeft(restSecs);
      setTotalTime(restSecs);
    },
    [exercises],
  );

  // Initialise
  useEffect(() => {
    startExercisePhase(0, 0);
  }, [startExercisePhase]);

  // Tick
  useEffect(() => {
    if (paused || timerState === "complete") return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return t - 1;
      });
      setElapsed((e) => e + 1);
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paused, timerState]);

  // When timeLeft hits 0, advance state
  useEffect(() => {
    if (timeLeft !== 0 || timerState === "complete") return;

    const ex = exercises[exIdx];
    if (!ex) {
      setTimerState("complete");
      return;
    }
    const { count } = parseSets(ex.sets);

    if (timerState === "exercise") {
      setSetsCompleted((s) => s + 1);
      const nextSet = setIdx + 1;
      if (nextSet < count) {
        setSetIdx(nextSet);
        startRestPhase(exIdx);
      } else {
        const nextEx = exIdx + 1;
        if (nextEx >= exercises.length) {
          setTimerState("complete");
        } else {
          setExIdx(nextEx);
          setSetIdx(0);
          startRestPhase(exIdx);
        }
      }
    } else if (timerState === "rest") {
      startExercisePhase(exIdx, setIdx);
    }
  }, [
    timeLeft,
    timerState,
    exIdx,
    setIdx,
    exercises,
    startExercisePhase,
    startRestPhase,
  ]);

  const handlePause = () => {
    setPaused((p) => !p);
  };

  const handlePrev = () => {
    if (exIdx === 0 && setIdx === 0) return;
    if (setIdx > 0) {
      setSetIdx(setIdx - 1);
      startExercisePhase(exIdx, setIdx - 1);
    } else {
      const prevEx = exIdx - 1;
      const { count } = parseSets(exercises[prevEx].sets);
      setExIdx(prevEx);
      setSetIdx(count - 1);
      startExercisePhase(prevEx, count - 1);
    }
    setPaused(false);
  };

  const handleSkip = () => {
    if (timerState === "rest") {
      startExercisePhase(exIdx, setIdx);
    } else {
      const { count } = parsedSets;
      const nextSet = setIdx + 1;
      if (nextSet < count) {
        setSetIdx(nextSet);
        startRestPhase(exIdx);
      } else {
        const nextEx = exIdx + 1;
        if (nextEx >= exercises.length) {
          setTimerState("complete");
        } else {
          setExIdx(nextEx);
          setSetIdx(0);
          startExercisePhase(nextEx, 0);
        }
      }
    }
    setPaused(false);
  };

  const handleClose = () => {
    if (timerState === "complete") {
      try {
        const raw = localStorage.getItem("doitepic_streak");
        const data = raw ? JSON.parse(raw) : { points: 0 };
        data.points = (data.points || 0) + 20;
        localStorage.setItem("doitepic_streak", JSON.stringify(data));
      } catch {
        // ignore storage errors
      }
      onSaveHistory?.(elapsed);
    }
    onClose();
  };

  const totalExercises = exercises.length;
  const overallProgress =
    timerState === "complete"
      ? 100
      : ((exIdx + setIdx / Math.max(parsedSets.count, 1)) / totalExercises) *
        100;

  const isComplete = timerState === "complete";
  const elapsedMin = Math.floor(elapsed / 60);
  const elapsedSec = elapsed % 60;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-background"
      data-ocid="workout_timer.modal"
    >
      {/* Overall progress bar */}
      <div className="h-1 bg-muted w-full">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-600 to-emerald-500"
          animate={{ width: `${overallProgress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <div>
          <p className="text-xs text-muted-foreground font-medium">
            {planName}
          </p>
          {!isComplete && (
            <p className="text-sm font-bold text-foreground">
              Exercise {exIdx + 1} of {totalExercises}
            </p>
          )}
        </div>
        <button
          type="button"
          data-ocid="workout_timer.close_button"
          onClick={handleClose}
          className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors text-lg"
        >
          ✕
        </button>
      </div>

      {/* Main content */}
      <AnimatePresence mode="wait">
        {isComplete ? (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-5"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="text-7xl"
            >
              🎉
            </motion.div>
            <h2 className="text-3xl font-bold text-foreground">
              Workout Complete!
            </h2>
            <p className="text-muted-foreground text-sm max-w-xs">
              Amazing effort! You crushed every set. Keep up the momentum!
            </p>

            <div className="grid grid-cols-3 gap-4 w-full max-w-sm mt-2">
              <div className="bg-card border border-border rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-foreground">
                  {elapsedMin}:{String(elapsedSec).padStart(2, "0")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Total Time</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-foreground">
                  {totalExercises}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Exercises</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-foreground">
                  {setsCompleted}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Sets Done</p>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-5 py-2.5 rounded-full font-bold text-sm"
            >
              ⚡ +20 XP Earned!
            </motion.div>

            <button
              type="button"
              data-ocid="workout_timer.confirm_button"
              onClick={handleClose}
              className="mt-2 px-8 py-3 bg-[#1E3A8A] hover:bg-[#1e40af] text-white font-semibold rounded-full transition-colors"
            >
              Close
            </button>
          </motion.div>
        ) : (
          <motion.div
            key={`ex-${exIdx}-set-${setIdx}-${timerState}`}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="flex-1 flex flex-col items-center justify-between px-6 py-6"
          >
            {/* State badge */}
            <div className="w-full flex justify-center">
              <span
                className={`text-xs font-bold tracking-widest px-4 py-1.5 rounded-full ${
                  timerState === "exercise"
                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                    : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                }`}
              >
                {timerState === "exercise" ? "▶ EXERCISE" : "⏸ REST"}
              </span>
            </div>

            {/* Exercise demo area */}
            <div className="flex flex-col items-center text-center gap-3 mt-2">
              <motion.div
                key={currentExercise.name}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="text-7xl"
              >
                {currentExercise.emoji}
              </motion.div>
              <h2 className="text-2xl font-bold text-foreground leading-tight">
                {timerState === "rest"
                  ? exercises[exIdx + 1]
                    ? `Next: ${exercises[exIdx + 1].name}`
                    : "Last rest!"
                  : currentExercise.name}
              </h2>
              {timerState === "exercise" && (
                <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                  💡 {currentExercise.tip}
                </p>
              )}
              {timerState === "rest" && (
                <p className="text-sm text-muted-foreground">
                  Breathe. Recover. Get ready.
                </p>
              )}
            </div>

            {/* Countdown ring */}
            <div className="flex flex-col items-center gap-3">
              <CountdownRing
                total={totalTime}
                remaining={timeLeft}
                state={timerState}
              />
              {timerState === "exercise" && (
                <p className="text-sm font-semibold text-foreground">
                  Set {setIdx + 1} of {parsedSets.count}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {currentExercise.muscle}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-6 mt-4">
              <button
                type="button"
                data-ocid="workout_timer.secondary_button"
                onClick={handlePrev}
                disabled={exIdx === 0 && setIdx === 0}
                className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-foreground text-xl disabled:opacity-30 hover:bg-muted/80 transition-colors"
              >
                ⏮
              </button>
              <button
                type="button"
                data-ocid="workout_timer.primary_button"
                onClick={handlePause}
                className="w-16 h-16 rounded-full bg-[#1E3A8A] hover:bg-[#1e40af] flex items-center justify-center text-white text-2xl shadow-lg transition-colors"
              >
                {paused ? "▶" : "⏸"}
              </button>
              <button
                type="button"
                data-ocid="workout_timer.toggle"
                onClick={handleSkip}
                className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-foreground text-xl hover:bg-muted/80 transition-colors"
              >
                ⏭
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
