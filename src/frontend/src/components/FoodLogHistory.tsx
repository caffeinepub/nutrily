import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  UtensilsCrossed,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { getAllLogs } from "../hooks/useFoodLog";
import BottomNav from "./BottomNav";

interface Props {
  onBack: () => void;
  onHome?: () => void;
  onEat?: () => void;
  onThink?: () => void;
  onMove?: () => void;
  onHistory?: () => void;
  onLeaderboard?: () => void;
}

function formatDateLabel(dateStr: string): string {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (dateStr === today) return "Today";
  if (dateStr === yesterday) return "Yesterday";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

const MEAL_EMOJIS: Record<string, string> = {
  breakfast: "🌅",
  lunch: "☀️",
  dinner: "🌙",
  snack: "🍎",
  "pre-workout": "💪",
  "post-workout": "🏋️",
  drinks: "🥤",
};

export default function FoodLogHistory({
  onBack,
  onHome,
  onEat,
  onThink,
  onMove,
  onHistory,
  onLeaderboard,
}: Props) {
  const logs = getAllLogs().slice(0, 7);
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set([logs[0]?.date]),
  );

  const toggle = (date: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-border shadow-xs">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            type="button"
            data-ocid="history.close_button"
            onClick={onBack}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-base font-bold text-foreground">Meal History</h1>
          <span className="text-xs text-muted-foreground ml-auto">
            Last 7 days
          </span>
        </div>
      </div>

      <main className="max-w-2xl mx-auto w-full px-4 py-6 flex-1 space-y-3 pb-20">
        {logs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            data-ocid="history.empty_state"
            className="flex flex-col items-center justify-center py-20 gap-4 text-center"
          >
            <UtensilsCrossed size={48} className="text-muted-foreground/40" />
            <p className="text-base font-semibold text-muted-foreground">
              No history yet.
            </p>
            <p className="text-sm text-muted-foreground">
              Start logging meals to see your history here!
            </p>
          </motion.div>
        ) : (
          logs.map((log, idx) => {
            const totalCals = log.entries.reduce((s, e) => s + e.calories, 0);
            const isExpanded = expanded.has(log.date);
            const label = formatDateLabel(log.date);

            return (
              <motion.div
                key={log.date}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                data-ocid={`history.item.${idx + 1}`}
                className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
              >
                <button
                  type="button"
                  data-ocid={`history.panel.${idx + 1}`}
                  onClick={() => toggle(log.date)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl hero-gradient flex items-center justify-center text-white text-sm font-bold">
                      {label === "Today"
                        ? "📅"
                        : label === "Yesterday"
                          ? "📆"
                          : "🗓️"}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-foreground">
                        {label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {log.entries.length} items
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-primary">
                      {Math.round(totalCals)} kcal
                    </span>
                    {isExpanded ? (
                      <ChevronUp size={16} className="text-muted-foreground" />
                    ) : (
                      <ChevronDown
                        size={16}
                        className="text-muted-foreground"
                      />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-border"
                  >
                    {log.entries.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg">
                            {MEAL_EMOJIS[entry.mealType] ?? "🍽️"}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {entry.foodName}
                            </p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {entry.mealType} · {entry.quantity}g
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-muted-foreground">
                          {Math.round(entry.calories)} kcal
                        </span>
                      </div>
                    ))}
                    <div className="px-4 py-2 bg-muted/30 flex justify-between items-center border-t border-border">
                      <span className="text-xs text-muted-foreground">
                        Total
                      </span>
                      <span className="text-sm font-bold text-primary">
                        {Math.round(totalCals)} kcal
                      </span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })
        )}
      </main>
      <BottomNav
        activePage="eat"
        onHome={onHome ?? onBack}
        onEat={onEat ?? onBack}
        onThink={onThink ?? onBack}
        onMove={onMove ?? onBack}
        onHistory={onHistory}
        onLeaderboard={onLeaderboard}
      />
    </div>
  );
}
