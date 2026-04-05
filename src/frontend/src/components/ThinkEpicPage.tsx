import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Brain, CheckCircle2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import type { FoodLogEntryLocal } from "../hooks/useFoodLog";
import type { LocalUser } from "../hooks/useLocalAuth";
import BottomNav from "./BottomNav";
import DidYouKnowCard from "./DidYouKnowCard";
import FoodMythBustersCard from "./FoodMythBustersCard";
import HealthQuizCard from "./HealthQuizCard";

interface ThinkEpicPageProps {
  onBack: () => void;
  onHome?: () => void;
  onEat?: () => void;
  onThink?: () => void;
  onMove?: () => void;
  onHistory?: () => void;
  onLeaderboard?: () => void;
}

function readTodayLog(): FoodLogEntryLocal[] {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const raw = localStorage.getItem(`doitepic_foodlog_${today}`);
    return raw ? (JSON.parse(raw) as FoodLogEntryLocal[]) : [];
  } catch {
    return [];
  }
}

function readAllRecentLogs(): FoodLogEntryLocal[] {
  const all: FoodLogEntryLocal[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("doitepic_foodlog_")) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const entries = JSON.parse(raw) as FoodLogEntryLocal[];
          all.push(...entries);
        }
      }
    }
  } catch {
    // ignore
  }
  return all;
}

function readUserProfile(): LocalUser | null {
  try {
    const raw = localStorage.getItem("doitepic_user");
    return raw ? (JSON.parse(raw) as LocalUser) : null;
  } catch {
    return null;
  }
}

const FRIED_KEYWORDS = [
  "chips",
  "pazham pori",
  "vada",
  "porotta",
  "parotta",
  "puri",
  "samosa",
  "bajji",
  "bonda",
  "fried",
  "fry",
  "bhaji",
  "pakoda",
  "parippu vada",
  "uzhunnu vada",
  "banana chips",
  "tapioca chips",
  "unniyappam",
  "achappam",
];
const FISH_KEYWORDS = [
  "fish",
  "meen",
  "karimeen",
  "prawn",
  "crab",
  "seafood",
  "tuna",
  "salmon",
  "sardine",
  "mackerel",
  "squid",
  "mussel",
  "kallummakkaya",
];
const RICE_KEYWORDS = [
  "rice",
  "kanji",
  "biryani",
  "pulao",
  "fried rice",
  "matta rice",
  "kanjivellam",
];

function isFried(name: string) {
  const n = name.toLowerCase();
  return FRIED_KEYWORDS.some((k) => n.includes(k));
}
function isFishItem(name: string) {
  const n = name.toLowerCase();
  return FISH_KEYWORDS.some((k) => n.includes(k));
}
function isRiceItem(name: string) {
  const n = name.toLowerCase();
  return RICE_KEYWORDS.some((k) => n.includes(k));
}

function getSeasonalAlert(): {
  text: string;
  color: "red" | "blue" | "green";
  emoji: string;
  title: string;
} {
  const month = new Date().getMonth() + 1;
  if (month >= 6 && month <= 9)
    return {
      title: "🌧️ Rainy Season Alert",
      text: "Food poisoning risk is higher during monsoon. Avoid street food and day-old leftovers. Store cooked food in the fridge within 2 hours.",
      color: "red",
      emoji: "🌧️",
    };
  if (month >= 3 && month <= 5)
    return {
      title: "☀️ Summer Alert",
      text: "Stay hydrated! Aim for at least 3L of water today. Foods spoil faster in the heat — refrigerate leftovers immediately.",
      color: "blue",
      emoji: "☀️",
    };
  return {
    title: "🍃 Winter Wellness Tip",
    text: "Boost your immunity with turmeric, ginger, and warm foods. Great time for pepper rasam and ginger tea!",
    color: "green",
    emoji: "🍃",
  };
}

type FoodType =
  | ""
  | "leftover_rice"
  | "street_food"
  | "fish_today"
  | "packaged_snack"
  | "coconut_curry"
  | "fried_snack";

const SAFETY_RESULTS: Record<
  Exclude<FoodType, "">,
  { risk: "safe" | "moderate" | "high"; title: string; advice: string }
> = {
  leftover_rice: {
    risk: "high",
    title: "Leftover Rice",
    advice:
      "Rice kept at room temperature for more than 2 hours can cause food poisoning (Bacillus cereus). Refrigerate immediately or discard. In Kerala's humid climate, this risk is even higher.",
  },
  street_food: {
    risk: "moderate",
    title: "Street Food",
    advice:
      "Moderate risk. Always choose busy stalls — high turnover means fresher food. Avoid cut fruits or items exposed to flies. Prefer cooked-to-order dishes.",
  },
  fish_today: {
    risk: "safe",
    title: "Fish (Bought Today)",
    advice:
      "Safe if stored properly in the fridge. Cook within 24 hours. Check for freshness: firm texture, no strong smell, bright eyes on whole fish. Buy from a busy fish market.",
  },
  packaged_snack: {
    risk: "moderate",
    title: "Packaged Snack",
    advice:
      "Check the expiry date before eating. Look out for high sodium, sugar, and artificial preservatives in the ingredient list. Occasional consumption is fine.",
  },
  coconut_curry: {
    risk: "moderate",
    title: "Coconut Curry",
    advice:
      "Coconut milk spoils quickly. Refrigerate within 4 hours of cooking. Reheat thoroughly before eating. Do not reheat more than once. Discard if it smells sour.",
  },
  fried_snack: {
    risk: "moderate",
    title: "Fried Snack",
    advice:
      "Occasional consumption is fine. Avoid if the oil smells rancid or the snack tastes stale. Reused oil in commercial snacks can form toxic compounds. Prefer home-cooked fried foods.",
  },
};

const FRESHNESS_CHECKLIST = [
  "No strong or ammonia smell",
  "Firm, not slimy texture",
  "Bright, clear eyes (whole fish)",
  "Bought today from a busy market",
  "Stored immediately in fridge",
];

const RICE_KEYWORDS_TIMER = [
  "rice",
  "biryani",
  "kanji",
  "pulao",
  "idiyappam",
  "puttu",
];
const COCONUT_KEYWORDS_TIMER = [
  "coconut curry",
  "fish molee",
  "stew",
  "avial",
  "olan",
  "kaalan",
  "erissery",
  "pulissery",
  "fish curry",
  "chicken stew",
];
function isRiceTimer(name: string) {
  const n = name.toLowerCase();
  return RICE_KEYWORDS_TIMER.some((k) => n.includes(k));
}
function isCoconutTimer(name: string) {
  const n = name.toLowerCase();
  return COCONUT_KEYWORDS_TIMER.some((k) => n.includes(k));
}

type TabId = "alerts" | "sugar" | "safety" | "learn";

const TABS: { id: TabId; label: string }[] = [
  { id: "alerts", label: "⚡ Alerts" },
  { id: "sugar", label: "🍬 Sugar" },
  { id: "safety", label: "🛡️ Safety" },
  { id: "learn", label: "🧩 Learn" },
];

export default function ThinkEpicPage({
  onBack,
  onHome,
  onEat,
  onThink,
  onMove,
  onHistory,
  onLeaderboard,
}: ThinkEpicPageProps) {
  const [activeTab, setActiveTab] = useState<TabId>("alerts");
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodType>("");
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [timerTick, setTimerTick] = useState(0);
  const [sugarDetoxMode, setSugarDetoxMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem("doitepic_sugar_detox_mode") === "true";
    } catch {
      return false;
    }
  });
  const [sugarDetoxStart, setSugarDetoxStart] = useState<string>(() => {
    try {
      return localStorage.getItem("doitepic_sugar_detox_start") ?? "";
    } catch {
      return "";
    }
  });

  const todayLog = useMemo(() => readTodayLog(), []);
  const allLog = useMemo(() => readAllRecentLogs(), []);
  const user = useMemo(() => readUserProfile(), []);
  const seasonal = getSeasonalAlert();

  useEffect(() => {
    const interval = setInterval(() => setTimerTick((t) => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  const sugarDetoxStreak = useMemo(() => {
    if (!sugarDetoxStart) return 0;
    const start = new Date(sugarDetoxStart);
    const now = new Date();
    const diff = Math.floor(
      (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    return Math.max(0, diff);
  }, [sugarDetoxStart]);

  const safetyTimers = (() => {
    void timerTick;
    return todayLog
      .filter((e) => isRiceTimer(e.foodName) || isCoconutTimer(e.foodName))
      .map((e) => {
        const limitMs = isRiceTimer(e.foodName)
          ? 2 * 60 * 60 * 1000
          : 4 * 60 * 60 * 1000;
        const elapsed = Date.now() - e.timestamp;
        const remaining = Math.max(0, limitMs - elapsed);
        const pct = Math.min(100, (elapsed / limitMs) * 100);
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        return {
          id: e.id,
          foodName: e.foodName,
          limitLabel: isRiceTimer(e.foodName) ? "2 hour" : "4 hour",
          pct,
          expired: elapsed >= limitMs,
          timeLeft: remaining > 0 ? `${hours}h ${mins}m left` : "Expired",
          status:
            pct < 50
              ? ("green" as const)
              : pct < 90
                ? ("amber" as const)
                : ("red" as const),
        };
      });
  })();

  const todaySugar = useMemo(
    () => todayLog.reduce((sum, e) => sum + e.carbs * 0.3, 0),
    [todayLog],
  );

  const weeklySugar = useMemo(() => {
    const days: { date: string; label: string; sugar: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().slice(0, 10);
      const label =
        i === 0 ? "Today" : d.toLocaleDateString("en-IN", { weekday: "short" });
      try {
        const raw = localStorage.getItem(`doitepic_foodlog_${dateKey}`);
        const entries: FoodLogEntryLocal[] = raw ? JSON.parse(raw) : [];
        const sugar = entries.reduce((s, e) => s + e.carbs * 0.3, 0);
        days.push({ date: dateKey, label, sugar });
      } catch {
        days.push({ date: dateKey, label, sugar: 0 });
      }
    }
    return days;
  }, []);

  const hasCarbonatedDrink = todayLog.some((e) => {
    const n = e.foodName.toLowerCase();
    return [
      "cola",
      "soda",
      "pepsi",
      "coca",
      "sprite",
      "fanta",
      "mountain dew",
      "energy drink",
      "red bull",
      "monster",
    ].some((k) => n.includes(k));
  });

  const todayFried = todayLog.filter((e) => isFried(e.foodName));
  const todayProtein = todayLog.reduce((s, e) => s + (e.protein || 0), 0);
  const todayCarbs = todayLog.reduce((s, e) => s + (e.carbs || 0), 0);
  const todayFat = todayLog.reduce((s, e) => s + (e.fat || 0), 0);
  const totalMacroCalories = todayProtein * 4 + todayCarbs * 4 + todayFat * 9;
  const carbPercent =
    totalMacroCalories > 0
      ? Math.round((todayCarbs * 4 * 100) / totalMacroCalories)
      : 0;
  const hasFish = todayLog.some((e) => isFishItem(e.foodName));
  const hasRice = todayLog.some((e) => isRiceItem(e.foodName));
  const oilScore =
    todayFried.length === 0 ? 100 : todayFried.length === 1 ? 55 : 20;
  const oilLabel =
    todayFried.length === 0
      ? "Clean"
      : todayFried.length === 1
        ? "Moderate"
        : "High";
  const oilColor =
    todayFried.length === 0
      ? "bg-emerald-500"
      : todayFried.length === 1
        ? "bg-amber-500"
        : "bg-red-500";
  const proteinScore = Math.min(100, Math.round((todayProtein / 60) * 100));
  const proteinLabel =
    todayProtein >= 60 ? "Good" : todayProtein >= 30 ? "Low" : "Very Low";
  const proteinColor =
    todayProtein >= 60
      ? "bg-emerald-500"
      : todayProtein >= 30
        ? "bg-amber-500"
        : "bg-red-500";
  const freshnessScore = hasFish || hasRice ? (hasFish ? 65 : 80) : -1;
  const freshnessLabel =
    freshnessScore === -1
      ? "No fish/rice logged"
      : hasFish
        ? "Check freshness before eating"
        : "Store within 2 hours";
  const allFried = allLog.filter((e) => isFried(e.foodName));
  const allProtein = allLog.reduce((s, e) => s + (e.protein || 0), 0);
  const logDays = new Set(
    allLog.map((e) => new Date(e.timestamp).toISOString().slice(0, 10)),
  ).size;
  const avgProteinPerDay = logDays > 0 ? allProtein / logDays : 0;
  const avgFriedPerDay = logDays > 0 ? allFried.length / logDays : 0;
  const safetyResult = selectedFood ? SAFETY_RESULTS[selectedFood] : null;

  const seasonalBannerCls =
    seasonal.color === "red"
      ? "bg-red-50 border-red-200 dark:bg-red-950/40 dark:border-red-800"
      : seasonal.color === "blue"
        ? "bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800"
        : "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800";
  const seasonalTextCls =
    seasonal.color === "red"
      ? "text-red-800 dark:text-red-200"
      : seasonal.color === "blue"
        ? "text-blue-800 dark:text-blue-200"
        : "text-emerald-800 dark:text-emerald-200";

  // silence unused variable warning
  void user;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            type="button"
            data-ocid="thinkepic.close_button"
            onClick={onBack}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <h1 className="text-base font-bold text-foreground">
              ThinkEpic 🧠
            </h1>
          </div>
        </div>
        {/* Tab bar — sticky below header */}
        <div className="max-w-3xl mx-auto px-4 pb-2">
          <div className="flex gap-2 overflow-x-auto scrollbar-none">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                data-ocid={`thinkepic.${tab.id}_tab`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto w-full px-4 py-4 space-y-3 flex-1 pb-24">
        {/* TAB: Alerts */}
        {activeTab === "alerts" && (
          <motion.div
            key="alerts"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {/* Seasonal Banner */}
            <AnimatePresence>
              {!bannerDismissed && (
                <motion.div
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`relative rounded-xl border px-4 py-3 pr-10 ${seasonalBannerCls}`}
                  data-ocid="thinkepic.panel"
                >
                  <p className={`font-bold text-sm mb-0.5 ${seasonalTextCls}`}>
                    {seasonal.title}
                  </p>
                  <p className={`text-xs leading-relaxed ${seasonalTextCls}`}>
                    {seasonal.text}
                  </p>
                  <button
                    type="button"
                    onClick={() => setBannerDismissed(true)}
                    data-ocid="thinkepic.close_button"
                    className={`absolute top-2.5 right-3 ${seasonalTextCls} opacity-60 hover:opacity-100`}
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Smart Alerts */}
            <section data-ocid="thinkepic.section">
              <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
                ⚡ Smart Alerts
              </h2>
              <div className="space-y-2">
                {todayLog.length === 0 ? (
                  <div
                    data-ocid="thinkepic.empty_state"
                    className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground text-center"
                  >
                    No food logged today. Start logging to get real-time alerts!
                  </div>
                ) : (
                  <>
                    {todayFried.length >= 2 && (
                      <motion.div
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex gap-3 items-start rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 p-3"
                        data-ocid="thinkepic.card"
                      >
                        <span className="text-xl">🔴</span>
                        <div>
                          <p className="text-sm font-semibold text-red-800 dark:text-red-200">
                            High oil intake today
                          </p>
                          <p className="text-xs text-red-700 dark:text-red-300 mt-0.5">
                            You've had {todayFried.length} fried items (
                            {todayFried.map((e) => e.foodName).join(", ")}). Try
                            steamed or boiled options for the rest of the day.
                          </p>
                        </div>
                      </motion.div>
                    )}
                    {todayProtein < 50 && (
                      <motion.div
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 }}
                        className="flex gap-3 items-start rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-3"
                        data-ocid="thinkepic.card"
                      >
                        <span className="text-xl">🟡</span>
                        <div>
                          <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                            Protein is low today
                          </p>
                          <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                            Only {Math.round(todayProtein)}g so far. Add eggs,
                            chicken, or kadala to boost your intake.
                          </p>
                        </div>
                      </motion.div>
                    )}
                    {carbPercent > 60 && (
                      <motion.div
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex gap-3 items-start rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-3"
                        data-ocid="thinkepic.card"
                      >
                        <span className="text-xl">🟡</span>
                        <div>
                          <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                            Carb-heavy day ({carbPercent}% carbs)
                          </p>
                          <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                            Balance with protein-rich foods like dal, eggs, or
                            grilled fish.
                          </p>
                        </div>
                      </motion.div>
                    )}
                    {todayFried.length < 2 &&
                      todayProtein >= 50 &&
                      carbPercent <= 60 && (
                        <div
                          className="flex gap-3 items-start rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-3"
                          data-ocid="thinkepic.card"
                        >
                          <span className="text-xl">🟢</span>
                          <div>
                            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                              Looking good today!
                            </p>
                            <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                              Your food choices are balanced. Keep it up!
                            </p>
                          </div>
                        </div>
                      )}
                  </>
                )}
              </div>
            </section>

            {/* Food Safety Timer */}
            <section data-ocid="thinkepic.section">
              <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
                ⏱️ Food Safety Timer
              </h2>
              {safetyTimers.length === 0 ? (
                <div
                  data-ocid="thinkepic.empty_state"
                  className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground text-center"
                >
                  No rice or coconut curry logged today. Log a meal to start a
                  safety timer.
                </div>
              ) : (
                <div className="space-y-3">
                  {safetyTimers.map((timer) => (
                    <motion.div
                      key={timer.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`rounded-xl border p-4 ${timer.status === "green" ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800" : timer.status === "amber" ? "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800" : "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800"}`}
                      data-ocid="thinkepic.card"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p
                            className={`text-sm font-bold ${timer.status === "green" ? "text-emerald-800 dark:text-emerald-200" : timer.status === "amber" ? "text-amber-800 dark:text-amber-200" : "text-red-800 dark:text-red-200"}`}
                          >
                            {timer.status === "green"
                              ? "🟢"
                              : timer.status === "amber"
                                ? "🟡"
                                : "🔴"}{" "}
                            {timer.foodName}
                          </p>
                          <p
                            className={`text-xs mt-0.5 ${timer.status === "green" ? "text-emerald-700 dark:text-emerald-300" : timer.status === "amber" ? "text-amber-700 dark:text-amber-300" : "text-red-700 dark:text-red-300"}`}
                          >
                            {timer.limitLabel} food safety limit
                          </p>
                        </div>
                        <p
                          className={`text-sm font-bold ${timer.status === "red" ? "text-red-700 dark:text-red-300" : "text-foreground"}`}
                        >
                          {timer.expired ? "Expired" : timer.timeLeft}
                        </p>
                      </div>
                      <div className="h-2 rounded-full bg-white/60 dark:bg-black/20 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${timer.status === "green" ? "bg-emerald-500" : timer.status === "amber" ? "bg-amber-500" : "bg-red-500"}`}
                          style={{ width: `${timer.pct}%` }}
                        />
                      </div>
                      {timer.status === "red" && (
                        <p className="text-xs font-semibold text-red-800 dark:text-red-200 mt-2">
                          ⚠️ Time's up! Refrigerate or discard this food
                          immediately.
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </section>

            {/* Visual Scores */}
            <section data-ocid="thinkepic.section">
              <h2 className="text-base font-bold text-foreground mb-3">
                📊 Visual Scores
              </h2>
              <Card className="border border-border">
                <CardContent className="p-4 space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold text-foreground">
                        🍳 Oil Score
                      </span>
                      <Badge
                        className={
                          oilLabel === "Clean"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 border-0"
                            : oilLabel === "Moderate"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border-0"
                              : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-0"
                        }
                      >
                        {oilLabel}
                      </Badge>
                    </div>
                    <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${oilColor}`}
                        style={{ width: `${oilScore}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {todayFried.length === 0
                        ? "No fried foods logged today — great!"
                        : `${todayFried.length} fried item(s) logged.`}
                    </p>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold text-foreground">
                        💪 Protein Score
                      </span>
                      <Badge
                        className={
                          proteinLabel === "Good"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 border-0"
                            : proteinLabel === "Low"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border-0"
                              : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-0"
                        }
                      >
                        {proteinLabel}
                      </Badge>
                    </div>
                    <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${proteinColor}`}
                        style={{ width: `${Math.max(4, proteinScore)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {Math.round(todayProtein)}g of recommended 60g+ today.
                    </p>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold text-foreground">
                        🐟 Freshness Score
                      </span>
                      <Badge className="bg-muted text-muted-foreground border-0">
                        {freshnessScore === -1
                          ? "No data"
                          : hasFish
                            ? "Check"
                            : "Store safely"}
                      </Badge>
                    </div>
                    {freshnessScore === -1 ? (
                      <p className="text-xs text-muted-foreground mt-1">
                        Log fish, seafood, or rice to see freshness guidance.
                      </p>
                    ) : (
                      <>
                        <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700 bg-amber-500"
                            style={{ width: `${freshnessScore}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {freshnessLabel}
                        </p>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* AI-style habit suggestions */}
            <section data-ocid="thinkepic.section">
              <h2 className="text-base font-bold text-foreground mb-3">
                🤖 AI Habit Suggestions
              </h2>
              <div className="space-y-2">
                {allLog.length === 0 ? (
                  <div
                    data-ocid="thinkepic.empty_state"
                    className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground text-center"
                  >
                    Log meals over a few days to get personalised habit
                    insights.
                  </div>
                ) : (
                  <>
                    {avgProteinPerDay < 40 && (
                      <Card
                        className="border border-amber-200 dark:border-amber-800"
                        data-ocid="thinkepic.card"
                      >
                        <CardContent className="p-4">
                          <div className="flex gap-3 items-start">
                            <span className="text-2xl">🤖</span>
                            <div>
                              <p className="text-sm font-semibold text-foreground">
                                Your protein intake is consistently low
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Add 2 eggs or 100g of chicken/fish daily. Even
                                kadala curry with puttu adds significant
                                protein. Aim for at least 60g protein every day.
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    {carbPercent > 55 && totalMacroCalories > 0 && (
                      <Card
                        className="border border-amber-200 dark:border-amber-800"
                        data-ocid="thinkepic.card"
                      >
                        <CardContent className="p-4">
                          <div className="flex gap-3 items-start">
                            <span className="text-2xl">🤖</span>
                            <div>
                              <p className="text-sm font-semibold text-foreground">
                                Your diet is carb-heavy today
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Kerala tip: replace 1 serving of rice with more
                                vegetable sabzi or protein. Avial, thoran, or
                                fish curry are excellent low-carb additions.
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    {avgFriedPerDay < 1.5 &&
                      avgProteinPerDay >= 40 &&
                      carbPercent <= 55 && (
                        <Card
                          className="border border-emerald-200 dark:border-emerald-800"
                          data-ocid="thinkepic.card"
                        >
                          <CardContent className="p-4">
                            <div className="flex gap-3 items-start">
                              <span className="text-2xl">🤖</span>
                              <div>
                                <p className="text-sm font-semibold text-foreground">
                                  Great eating habits!
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  Your logged data shows balanced eating
                                  patterns. Keep maintaining this consistency
                                  for long-term health benefits.
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                  </>
                )}
              </div>
            </section>
          </motion.div>
        )}

        {/* TAB: Sugar */}
        {activeTab === "sugar" && (
          <motion.div
            key="sugar"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {/* Daily Sugar Tracker */}
            <Card className="border border-border">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-foreground">
                    📊 Daily Sugar Tracker
                  </p>
                  <Badge
                    className={
                      todaySugar < 15
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 border-0"
                        : todaySugar < 25
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border-0"
                          : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-0"
                    }
                  >
                    {todaySugar < 15
                      ? "🟢 Low"
                      : todaySugar < 25
                        ? "🟡 Moderate"
                        : "🔴 High"}
                  </Badge>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>{Math.round(todaySugar)}g consumed</span>
                    <span>25g WHO daily limit</span>
                  </div>
                  <Progress
                    value={Math.min(100, (todaySugar / 25) * 100)}
                    className="h-2.5"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round(todaySugar)}g / 25g WHO daily limit
                    {todaySugar > 25 && " — limit exceeded!"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Sugar Trend */}
            <Card className="border border-border">
              <CardContent className="p-4 space-y-3">
                <p className="text-sm font-bold text-foreground">
                  📈 Weekly Sugar Trend
                </p>
                <div className="flex items-end gap-1.5 h-24">
                  {weeklySugar.map((day) => {
                    const pct = Math.min(100, (day.sugar / 40) * 100);
                    const barColor =
                      day.sugar < 15
                        ? "bg-emerald-500"
                        : day.sugar < 25
                          ? "bg-amber-400"
                          : "bg-red-500";
                    return (
                      <div
                        key={day.date}
                        className="flex flex-col items-center flex-1 gap-1"
                      >
                        <span className="text-[9px] text-muted-foreground font-medium">
                          {day.sugar > 0 ? `${Math.round(day.sugar)}g` : ""}
                        </span>
                        <div
                          className="w-full flex flex-col justify-end"
                          style={{ height: "64px" }}
                        >
                          <div
                            className={`w-full rounded-t-sm transition-all ${barColor}`}
                            style={{ height: `${Math.max(4, pct * 0.64)}px` }}
                          />
                        </div>
                        <span className="text-[9px] text-muted-foreground">
                          {day.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
                    Under 15g
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block" />
                    15–25g
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-red-500 inline-block" />
                    Over 25g
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Sugar Score Labels */}
            <Card className="border border-border">
              <CardContent className="p-4">
                <p className="text-sm font-bold text-foreground mb-3">
                  🏷️ Sugar Score Labels
                </p>
                <div className="space-y-2">
                  {[
                    {
                      food: "Tender Coconut Water",
                      score: "🟢 Low",
                      cls: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200",
                    },
                    {
                      food: "Tea with Sugar",
                      score: "🟡 Moderate",
                      cls: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200",
                    },
                    {
                      food: "Soft Drink / Cola",
                      score: "🔴 High",
                      cls: "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200",
                    },
                  ].map((item) => (
                    <div
                      key={item.food}
                      className={`flex items-center justify-between rounded-lg border px-3 py-2 ${item.cls}`}
                    >
                      <span className="text-xs font-medium">{item.food}</span>
                      <span className="text-xs font-bold">{item.score}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Smart Sugar Alerts */}
            {(hasCarbonatedDrink || todaySugar > 25) && (
              <div className="space-y-2">
                {hasCarbonatedDrink && (
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-3 items-start rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 p-3"
                    data-ocid="thinkepic.card"
                  >
                    <span className="text-xl">🔴</span>
                    <div>
                      <p className="text-sm font-semibold text-red-800 dark:text-red-200">
                        High sugar drink detected
                      </p>
                      <p className="text-xs text-red-700 dark:text-red-300 mt-0.5">
                        High sugar + no nutritional value.
                        <br />
                        <strong>Try instead:</strong> 🥥 Coconut water, 🍋 Lemon
                        water, or 🥛 Buttermilk
                      </p>
                    </div>
                  </motion.div>
                )}
                {todaySugar > 25 && (
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-3 items-start rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 p-3"
                    data-ocid="thinkepic.card"
                  >
                    <span className="text-xl">⚠️</span>
                    <div>
                      <p className="text-sm font-semibold text-red-800 dark:text-red-200">
                        Daily sugar limit exceeded!
                      </p>
                      <p className="text-xs text-red-700 dark:text-red-300 mt-0.5">
                        You've consumed {Math.round(todaySugar)}g sugar today
                        (WHO limit: 25g).
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* Sugar Detox Mode */}
            <Card className="border border-border">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      🔥 Sugar Detox Mode
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {sugarDetoxMode
                        ? "Daily sugar limit: 25g (strict mode)"
                        : "Enable to track your sugar-free streak"}
                    </p>
                  </div>
                  <Switch
                    data-ocid="thinkepic.switch"
                    checked={sugarDetoxMode}
                    onCheckedChange={(v) => {
                      setSugarDetoxMode(v);
                      localStorage.setItem(
                        "doitepic_sugar_detox_mode",
                        String(v),
                      );
                      if (v && !sugarDetoxStart) {
                        const now = new Date().toISOString().slice(0, 10);
                        setSugarDetoxStart(now);
                        localStorage.setItem("doitepic_sugar_detox_start", now);
                      }
                      if (!v) {
                        setSugarDetoxStart("");
                        localStorage.removeItem("doitepic_sugar_detox_start");
                      }
                    }}
                  />
                </div>
                {sugarDetoxMode && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-3"
                  >
                    <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-3 text-center">
                      <p className="text-3xl font-black text-amber-800 dark:text-amber-200">
                        {sugarDetoxStreak}
                      </p>
                      <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                        day streak 🔥
                      </p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {[
                        {
                          days: 3,
                          badge: "🥉 3-Day Streak",
                          active: sugarDetoxStreak >= 3,
                        },
                        {
                          days: 7,
                          badge: "🥈 7-Day Streak",
                          active: sugarDetoxStreak >= 7,
                        },
                        {
                          days: 30,
                          badge: "🥇 30-Day Streak",
                          active: sugarDetoxStreak >= 30,
                        },
                      ].map((b) => (
                        <span
                          key={b.days}
                          className={`flex-1 text-center text-xs py-2 px-3 rounded-lg font-semibold border ${b.active ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700" : "bg-muted text-muted-foreground border-border opacity-50"}`}
                        >
                          {b.badge}
                        </span>
                      ))}
                    </div>
                    {todaySugar > 25 && (
                      <div className="rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 p-2.5">
                        <p className="text-xs text-red-800 dark:text-red-200 font-medium">
                          ⚠️ You've exceeded 25g sugar today. Streak at risk!
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* TAB: Safety */}
        {activeTab === "safety" && (
          <motion.div
            key="safety"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            <section data-ocid="thinkepic.section">
              <h2 className="text-base font-bold text-foreground mb-3">
                🛡️ Kerala Food Safety Hub
              </h2>
              <div className="space-y-2">
                {[
                  {
                    id: "rice",
                    emoji: "🍚",
                    title: "Cooked Rice",
                    risk: "high" as const,
                    riskLabel: "High Risk",
                    summary:
                      "Bacterial growth risk in Kerala's humidity. Don't leave cooked rice outside for more than 2 hours.",
                    detail:
                      "Bacillus cereus spores survive cooking and multiply rapidly at room temperature. In Kerala's humid climate, cooked rice should be refrigerated within 2 hours. Never leave rice in the rice cooker overnight without refrigerating.",
                    checklist: undefined,
                  },
                  {
                    id: "fish",
                    emoji: "🐟",
                    title: "Fish & Seafood",
                    risk: "high" as const,
                    riskLabel: "High Risk",
                    summary:
                      "Check before cooking: no strong smell, firm texture. Buy from busy shops with high turnover.",
                    detail:
                      "Fish spoils rapidly in hot weather. Histamine poisoning from spoiled fish causes severe reactions. Always buy from a busy market. Refrigerate immediately. Cook within 24 hours.",
                    checklist: FRESHNESS_CHECKLIST,
                  },
                  {
                    id: "oil",
                    emoji: "🍗",
                    title: "Reused Cooking Oil",
                    risk: "moderate" as const,
                    riskLabel: "Moderate Risk",
                    summary:
                      "Common in fried snacks. Reused oil forms toxic compounds. Avoid frequent fried snacks.",
                    detail:
                      "Oil reheated multiple times forms acrolein, trans fats, and other toxic compounds. Commercial fried snacks are often made with repeatedly reused oil. Limit to 2–3 times a week maximum.",
                    checklist: undefined,
                  },
                  {
                    id: "coconut",
                    emoji: "🥥",
                    title: "Coconut-Based Curries",
                    risk: "moderate" as const,
                    riskLabel: "Moderate Risk",
                    summary:
                      "Spoils quickly. Refrigerate within 4–6 hours. Never reheat more than once.",
                    detail:
                      "The high fat content in coconut milk provides a perfect environment for bacterial growth. Curries like fish molee, stew, or avial should be refrigerated within 4 hours and consumed within 24 hours.",
                    checklist: undefined,
                  },
                  {
                    id: "street",
                    emoji: "🧊",
                    title: "Street Food",
                    risk: "moderate" as const,
                    riskLabel: "Moderate Risk",
                    summary:
                      "Choose busy stalls (high turnover = fresher food). Avoid cut fruits from roadside.",
                    detail:
                      "Street food risk varies widely. Busy stalls with high customer turnover prepare fresh batches more frequently. Avoid cut fruits and pre-prepared salads exposed to air and insects.",
                    checklist: undefined,
                  },
                ].map((item) => (
                  <Card
                    key={item.id}
                    className="border border-border cursor-pointer hover:shadow-sm transition-shadow"
                    data-ocid="thinkepic.card"
                  >
                    <button
                      type="button"
                      className="w-full text-left"
                      onClick={() =>
                        setExpandedCard(
                          expandedCard === item.id ? null : item.id,
                        )
                      }
                    >
                      <CardHeader className="p-4 pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{item.emoji}</span>
                            <CardTitle className="text-sm font-bold text-foreground">
                              {item.title}
                            </CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={
                                item.risk === "high"
                                  ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 border-0 text-xs"
                                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 border-0 text-xs"
                              }
                            >
                              {item.riskLabel}
                            </Badge>
                            <span className="text-muted-foreground text-xs">
                              {expandedCard === item.id ? "▲" : "▼"}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 ml-8">
                          {item.summary}
                        </p>
                      </CardHeader>
                    </button>
                    <AnimatePresence>
                      {expandedCard === item.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <CardContent className="px-4 pb-4 pt-0">
                            <div className="ml-8">
                              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                                {item.detail}
                              </p>
                              {item.checklist && (
                                <div>
                                  <p className="text-xs font-semibold text-foreground mb-2">
                                    ✅ Freshness Checklist
                                  </p>
                                  <ul className="space-y-1.5">
                                    {item.checklist.map((check) => (
                                      <li
                                        key={check}
                                        className="flex items-center gap-2 text-xs text-muted-foreground"
                                      >
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                                        {check}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                ))}
              </div>
            </section>

            {/* Is This Safe? */}
            <section data-ocid="thinkepic.section">
              <h2 className="text-base font-bold text-foreground mb-3">
                🧪 Is This Safe?
              </h2>
              <Card className="border border-border">
                <CardContent className="p-4 space-y-4">
                  <p className="text-xs text-muted-foreground">
                    Select a food item to get an instant safety assessment.
                  </p>
                  <Select
                    value={selectedFood}
                    onValueChange={(v) => setSelectedFood(v as FoodType)}
                  >
                    <SelectTrigger
                      data-ocid="thinkepic.select"
                      className="w-full"
                    >
                      <SelectValue placeholder="Choose a food type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="leftover_rice">
                        🍚 Leftover Rice
                      </SelectItem>
                      <SelectItem value="street_food">
                        🍢 Street Food
                      </SelectItem>
                      <SelectItem value="fish_today">
                        🐟 Fish (Bought Today)
                      </SelectItem>
                      <SelectItem value="packaged_snack">
                        📦 Packaged Snack
                      </SelectItem>
                      <SelectItem value="coconut_curry">
                        🥥 Coconut Curry
                      </SelectItem>
                      <SelectItem value="fried_snack">
                        🍗 Fried Snack
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <AnimatePresence>
                    {safetyResult && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`rounded-xl border p-4 ${safetyResult.risk === "high" ? "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800" : safetyResult.risk === "moderate" ? "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800" : "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800"}`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">
                            {safetyResult.risk === "high"
                              ? "🔴"
                              : safetyResult.risk === "moderate"
                                ? "🟡"
                                : "🟢"}
                          </span>
                          <div>
                            <p
                              className={`text-sm font-bold ${safetyResult.risk === "high" ? "text-red-800 dark:text-red-200" : safetyResult.risk === "moderate" ? "text-amber-800 dark:text-amber-200" : "text-emerald-800 dark:text-emerald-200"}`}
                            >
                              {safetyResult.title}
                            </p>
                            <Badge
                              className={`text-xs border-0 ${safetyResult.risk === "high" ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" : safetyResult.risk === "moderate" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"}`}
                            >
                              {safetyResult.risk === "high"
                                ? "High Risk"
                                : safetyResult.risk === "moderate"
                                  ? "Moderate Risk"
                                  : "Safe"}
                            </Badge>
                          </div>
                        </div>
                        <p
                          className={`text-xs leading-relaxed ${safetyResult.risk === "high" ? "text-red-700 dark:text-red-300" : safetyResult.risk === "moderate" ? "text-amber-700 dark:text-amber-300" : "text-emerald-700 dark:text-emerald-300"}`}
                        >
                          {safetyResult.advice}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </section>
          </motion.div>
        )}

        {/* TAB: Learn */}
        {activeTab === "learn" && (
          <motion.div
            key="learn"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            <section data-ocid="thinkepic.section" className="space-y-3">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                🧩 Health Quiz of the Day
              </h2>
              <HealthQuizCard />
            </section>
            <section data-ocid="thinkepic.section" className="space-y-3">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                💥 Food Myth Busters
              </h2>
              <FoodMythBustersCard />
            </section>
            <section data-ocid="thinkepic.section" className="space-y-3">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                🌟 Kerala Food Facts
              </h2>
              <DidYouKnowCard />
            </section>
          </motion.div>
        )}

        <div className="pb-2 pt-2">
          <Button
            variant="outline"
            onClick={onBack}
            data-ocid="thinkepic.secondary_button"
            className="w-full"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </main>

      <BottomNav
        activePage="think"
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
