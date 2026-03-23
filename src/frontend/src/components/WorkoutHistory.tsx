import { CalendarDays, Dumbbell, Trophy, Zap } from "lucide-react";
import { useEffect, useState } from "react";

export interface WorkoutHistoryEntry {
  id: string;
  date: string;
  planName: string;
  audience: string;
  workoutType: "Home" | "Gym";
  durationSeconds: number;
  xpEarned: number;
}

const STORAGE_KEY = "doitepic_workout_history";

export function saveWorkoutHistory(entry: WorkoutHistoryEntry): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr: WorkoutHistoryEntry[] = raw ? JSON.parse(raw) : [];
    arr.push(entry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  } catch {
    // ignore
  }
}

export function getWorkoutHistory(): WorkoutHistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  if (s === 0) return `${m} min`;
  return `${m}m ${s}s`;
}

function formatDateLabel(isoDate: string): string {
  const d = new Date(isoDate);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(d, today)) return "Today";
  if (sameDay(d, yesterday)) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function formatTime(isoDate: string): string {
  return new Date(isoDate).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function computeStreak(entries: WorkoutHistoryEntry[]): number {
  if (entries.length === 0) return 0;
  const days = new Set(
    entries.map((e) => {
      const d = new Date(e.date);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    }),
  );
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (days.has(key)) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

export default function WorkoutHistory() {
  const [history, setHistory] = useState<WorkoutHistoryEntry[]>([]);

  useEffect(() => {
    setHistory(getWorkoutHistory());
    const handler = () => setHistory(getWorkoutHistory());
    window.addEventListener("doitepic_workout_saved", handler);
    return () => window.removeEventListener("doitepic_workout_saved", handler);
  }, []);

  const totalXP = history.reduce((s, e) => s + e.xpEarned, 0);
  const streak = computeStreak(history);

  // Group by date label (with original date for sorting)
  const groups: Record<
    string,
    { label: string; entries: WorkoutHistoryEntry[] }
  > = {};
  const sorted = [...history].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  for (const entry of sorted) {
    const d = new Date(entry.date);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (!groups[key]) {
      groups[key] = { label: formatDateLabel(entry.date), entries: [] };
    }
    groups[key].entries.push(entry);
  }

  const groupKeys = Object.keys(groups).sort((a, b) => {
    const [ayear, amon, aday] = a.split("-").map(Number);
    const [byear, bmon, bday] = b.split("-").map(Number);
    const da = new Date(ayear, amon, aday);
    const db = new Date(byear, bmon, bday);
    return db.getTime() - da.getTime();
  });

  return (
    <section
      className="mt-10"
      data-ocid="workout_history.section"
      aria-label="Workout History"
    >
      {/* Title */}
      <div className="flex items-center gap-2 mb-5">
        <CalendarDays className="w-5 h-5 text-[#1E3A8A] dark:text-blue-400" />
        <h2 className="text-xl font-bold text-foreground">Workout History</h2>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm text-center">
          <div className="flex justify-center mb-1">
            <Dumbbell className="w-5 h-5 text-[#1E3A8A] dark:text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-foreground">{history.length}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Total Workouts</p>
        </div>
        <div className="bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm text-center">
          <div className="flex justify-center mb-1">
            <Zap className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">{totalXP}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Total XP</p>
        </div>
        <div className="bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm text-center">
          <div className="flex justify-center mb-1">
            <Trophy className="w-5 h-5 text-[#10B981]" />
          </div>
          <p className="text-2xl font-bold text-foreground">{streak}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Day Streak</p>
        </div>
      </div>

      {/* History list */}
      {history.length === 0 ? (
        <div
          className="bg-white dark:bg-[#1E293B] border border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center"
          data-ocid="workout_history.empty_state"
        >
          <p className="text-4xl mb-3">💪</p>
          <p className="text-foreground font-semibold">
            No workouts logged yet.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Complete your first workout above!
          </p>
        </div>
      ) : (
        <div className="space-y-6" data-ocid="workout_history.list">
          {groupKeys.map((key) => {
            const group = groups[key];
            return (
              <div key={key}>
                <p className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                  {group.label}
                </p>
                <div className="space-y-3">
                  {group.entries.map((entry, idx) => (
                    <div
                      key={entry.id}
                      data-ocid={`workout_history.item.${idx + 1}`}
                      className="bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm flex items-center gap-4"
                    >
                      <div className="text-3xl flex-shrink-0">💪</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm truncate">
                          {entry.planName}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              entry.workoutType === "Gym"
                                ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                                : "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                            }`}
                          >
                            {entry.workoutType === "Gym" ? "🏋️ Gym" : "🏠 Home"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ⏱ {formatDuration(entry.durationSeconds)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            🕐 {formatTime(entry.date)}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2.5 py-1 rounded-full">
                          +{entry.xpEarned} XP
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
