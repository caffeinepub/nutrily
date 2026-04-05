import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, TrendingDown, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getAgeGroup, getUserAge } from "../utils/ageUtils";
import BottomNav from "./BottomNav";
import CalorieSwapCard from "./CalorieSwapCard";
import SuccessHabitsChecklist from "./SuccessHabitsChecklist";

interface LossLog {
  date: string;
  weight: number;
  meals: string;
  cardio: string[];
  sleepHours: number;
  waterGlasses: number;
}

interface Props {
  onBack: () => void;
  userProfile?: { weightKg: number; heightCm: number; name: string };
  onHome?: () => void;
  onEat?: () => void;
  onThink?: () => void;
  onMove?: () => void;
  onHistory?: () => void;
  onLeaderboard?: () => void;
}

const CARDIO_OPTIONS = [
  "Running",
  "Cycling",
  "HIIT",
  "Jump Rope",
  "Swimming",
  "Yoga",
  "Brisk Walking",
  "Elliptical",
  "Zumba",
  "Dance Workout",
  "Stair Climbing",
  "Rowing",
];

const FOODS_EAT = [
  { name: "Broccoli (100g)", kcal: 34, emoji: "🥦" },
  { name: "Spinach (100g)", kcal: 23, emoji: "🌿" },
  { name: "Grilled Chicken (100g)", kcal: 165, emoji: "🍗" },
  { name: "Salmon (100g)", kcal: 208, emoji: "🐟" },
  { name: "Lentils / Dal (100g)", kcal: 116, emoji: "🫘" },
  { name: "Apple (medium)", kcal: 95, emoji: "🍎" },
  { name: "Green Tea (cup)", kcal: 2, emoji: "🍵" },
  { name: "Oats (100g)", kcal: 389, emoji: "🌾" },
  { name: "Cucumber (100g)", kcal: 16, emoji: "🥒" },
  { name: "Eggs boiled (2)", kcal: 143, emoji: "🥚" },
  { name: "Greek Yogurt (150g)", kcal: 133, emoji: "🥣" },
  { name: "Mixed Salad (100g)", kcal: 20, emoji: "🥗" },
];

const FOODS_AVOID = [
  { name: "Coca-Cola (330ml)", kcal: 139, emoji: "🥤" },
  { name: "Samosa (1 piece)", kcal: 262, emoji: "🥟" },
  { name: "White Bread (2 slices)", kcal: 160, emoji: "🍞" },
  { name: "Chips / Lays (100g)", kcal: 536, emoji: "🍟" },
  { name: "Biscuits (100g)", kcal: 483, emoji: "🍪" },
  { name: "Instant Noodles", kcal: 385, emoji: "🍜" },
  { name: "Vada Pav", kcal: 290, emoji: "🍔" },
  { name: "Pizza slice", kcal: 285, emoji: "🍕" },
];

function calcBMR(weight: number, height: number) {
  return Math.round(10 * weight + 6.25 * height - 5 * 25 + 5);
}

const STORAGE_KEY = "doitepic_loss_logs";

function loadLogs(): LossLog[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveLogs(logs: LossLog[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

const LOSS_SHAKES = [
  {
    name: "Fat Burner",
    emoji: "🥬",
    kcal: 45,
    protein: 2,
    ingredients: [
      "Spinach handful",
      "Half Green Apple",
      "Half Cucumber",
      "Lemon juice",
      "Small piece Ginger",
      "Water 300ml",
    ],
  },
  {
    name: "Protein Slim",
    emoji: "🍓",
    kcal: 200,
    protein: 28,
    ingredients: [
      "Whey Protein 1 scoop",
      "Skimmed Milk 300ml",
      "Strawberries 100g",
      "Ice cubes",
    ],
  },
  {
    name: "Metabolism Boost",
    emoji: "🍵",
    kcal: 30,
    protein: 1,
    ingredients: [
      "Brewed Green Tea 200ml",
      "Half Lemon juice",
      "Chia Seeds 1 tsp",
      "Honey ½ tsp",
      "Ginger powder pinch",
    ],
  },
];

const BODY_TYPE_ADVICE_LOSS: Record<string, Record<string, string>> = {
  skinny: {
    gym: "Body recomposition: lift weights + mild calorie deficit. 2g protein/kg bodyweight. Avoid over-restricting.",
    home: "Resistance band + bodyweight workouts. Light cardio. Prioritize sleep and protein intake.",
    nongym:
      "Daily 20–30 min walks. Reduce sugar. Eat whole foods. Avoid fad diets.",
  },
  moderate: {
    gym: "Maintain with balanced diet. 150 min cardio/week. Track macros. Strength train to preserve muscle.",
    home: "Home HIIT 3x/week. Yoga for recovery. Balanced nutrition with slight deficit.",
    nongym:
      "Increase daily movement. Reduce processed foods. Drink plenty of water.",
  },
  overweight: {
    gym: "HIIT + strength training combo. Calorie deficit of 300–500 kcal. High protein to preserve muscle.",
    home: "Jump rope, bodyweight circuits, yoga. Walk 10k steps daily. Cut sugar and processed foods.",
    nongym:
      "Start with 30 min daily walks. Reduce portion sizes. Drink water before meals.",
  },
  healthy: {
    gym: "Maintain with regular training. No aggressive cutting needed. Mindful eating.",
    home: "Active lifestyle with home workouts. Focus on whole foods. Avoid excess snacking.",
    nongym:
      "Prioritize natural movement. Balanced eating. Adequate sleep for metabolism.",
  },
};

function BodyTypeWorkoutAdvisor() {
  const [bodyType, setBodyType] = useState<string | null>(null);
  const [workoutType, setWorkoutType] = useState<string | null>(null);

  const adviceMap = BODY_TYPE_ADVICE_LOSS;
  const advice =
    bodyType && workoutType ? adviceMap[bodyType]?.[workoutType] : null;

  return (
    <div className="mt-8 bg-card rounded-xl border border-border shadow-card p-5">
      <h2 className="text-lg font-bold text-foreground mb-1">Find Your Goal</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Select your body type and workout style for personalised advice
      </p>
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Body Type
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { v: "skinny", l: "Skinny", e: "🦴" },
              { v: "moderate", l: "Moderate", e: "⚖️" },
              { v: "healthy", l: "Healthy", e: "💚" },
              { v: "overweight", l: "Overweight / Fat", e: "🎯" },
            ].map(({ v, l, e }) => (
              <button
                key={v}
                type="button"
                onClick={() => setBodyType(v)}
                className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${bodyType === v ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border hover:border-primary"}`}
              >
                {e} {l}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Workout Type
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { v: "gym", l: "Gym Goer", e: "🏋️" },
              { v: "home", l: "Home Workout", e: "🏠" },
              { v: "nongym", l: "Non-Gym", e: "🚶" },
            ].map(({ v, l, e }) => (
              <button
                key={v}
                type="button"
                onClick={() => setWorkoutType(v)}
                className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${workoutType === v ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border hover:border-primary"}`}
              >
                {e} {l}
              </button>
            ))}
          </div>
        </div>
        {advice && (
          <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
            <p className="text-sm text-foreground leading-relaxed">
              💡 {advice}
            </p>
          </div>
        )}
        {(bodyType || workoutType) && !advice && (
          <p className="text-xs text-muted-foreground">
            Select both body type and workout type to see your personalised
            advice.
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Kerala Clean Cut Diet Plan ───────────────────────────────────────────────
function KeralaCleanCutPlan() {
  const meals = [
    {
      time: "🌅 Morning (6–8 AM)",
      items: [
        "2 steamed idli + small sambar (no oil)",
        "1 boiled egg",
        "Black tea or black coffee (no sugar)",
      ],
      note: "Low-calorie, high-satiety Kerala breakfast",
    },
    {
      time: "🕙 Mid-Morning",
      items: ["1 fruit (papaya/guava/watermelon)", "Cucumber sticks"],
      note: "Fibre + hydration, zero guilt",
    },
    {
      time: "🍛 Lunch (12–1 PM)",
      items: [
        "Matta rice (1 cup — measured)",
        "Fish curry (light coconut milk)",
        "Thoran (beans/cabbage — oil-free/minimal)",
        "Rasam",
        "Buttermilk (no sugar)",
      ],
      note: "Smaller rice portion, more fish and vegetables",
    },
    {
      time: "☕ Evening Snack (4 PM)",
      items: [
        "Sprouted moong salad",
        "OR boiled chana (100g) with lemon",
        "Sambaram (spiced buttermilk — no sugar)",
      ],
      note: "Protein snack that keeps you full",
    },
    {
      time: "🌙 Dinner (7–8 PM)",
      items: [
        "2 steamed idiyappam + light fish/chicken stew",
        "OR 2 chapati + vegetable curry",
        "Avoid rice at dinner",
      ],
      note: "Light dinner — digests fast, burns overnight",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="bg-green-50 border border-green-200 rounded-xl p-3">
        <p className="text-xs font-bold text-green-800 mb-1">
          🎯 Clean Cut Targets
        </p>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { label: "Calories", val: "1500–1800 kcal" },
            { label: "Deficit", val: "300–500 kcal" },
            { label: "Meals", val: "5/day" },
          ].map((t) => (
            <div
              key={t.label}
              className="bg-white rounded-lg p-2 border border-green-100"
            >
              <p className="text-xs font-extrabold text-green-700">{t.val}</p>
              <p className="text-xs text-muted-foreground">{t.label}</p>
            </div>
          ))}
        </div>
      </div>
      {meals.map((m) => (
        <div
          key={m.time}
          className="bg-card rounded-xl border border-border p-3"
        >
          <p className="text-xs font-bold text-foreground mb-1">{m.time}</p>
          <ul className="space-y-1 mb-2">
            {m.items.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-xs text-muted-foreground"
              >
                <span className="text-success mt-0.5">•</span>
                {item}
              </li>
            ))}
          </ul>
          <p className="text-xs text-green-700 bg-green-50 rounded px-2 py-1">
            👉 {m.note}
          </p>
        </div>
      ))}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
        <p className="text-xs font-bold text-amber-800 mb-2">🔁 Smart Swaps</p>
        {[
          { from: "Porotta", to: "2 chapati or 2 idiyappam" },
          { from: "Banana chips", to: "Boiled chana or sprouts" },
          { from: "White rice (2 cups)", to: "Matta rice (1 cup)" },
          { from: "Soft drink", to: "Sambaram or tender coconut" },
        ].map((s) => (
          <div key={s.from} className="flex items-center gap-2 text-xs mb-1">
            <span className="text-destructive font-semibold">{s.from}</span>
            <span>→</span>
            <span className="text-success font-semibold">{s.to}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Calorie Deficit Plan ─────────────────────────────────────────────────────
function CalorieDeficitPlan() {
  const rules = [
    {
      icon: "🔢",
      title: "Calculate your deficit",
      desc: "Your BMR × 1.3 (light activity) = maintenance. Eat 400–500 kcal below that.",
    },
    {
      icon: "🍳",
      title: "Protein first",
      desc: "Every meal must have a protein source — eggs, fish, dal, or curd. Protein keeps you full and burns more to digest.",
    },
    {
      icon: "🥗",
      title: "Volume eating",
      desc: "Fill half your plate with vegetables and salads. They have almost no calories but keep your stomach full.",
    },
    {
      icon: "⏰",
      title: "Meal timing matters",
      desc: "Eat biggest meal at lunch. Keep dinner light. No food after 9 PM.",
    },
    {
      icon: "💧",
      title: "Water before meals",
      desc: "Drink 1 glass water 20 mins before each meal — reduces hunger by up to 20%.",
    },
  ];

  const dayPlan = [
    { time: "7 AM", meal: "2 boiled eggs + 1 fruit + black coffee", cal: 180 },
    { time: "10 AM", meal: "Cucumber sticks + buttermilk", cal: 60 },
    {
      time: "1 PM",
      meal: "Rice (1 cup) + fish/dal + vegetables + rasam",
      cal: 450,
    },
    { time: "4 PM", meal: "Sprouted chana + lemon water", cal: 120 },
    { time: "7:30 PM", meal: "2 chapati + vegetable curry + curd", cal: 350 },
    { time: "9 PM", meal: "Warm milk (if needed)", cal: 100 },
  ];

  return (
    <div className="space-y-3">
      <div className="bg-red-50 border border-red-200 rounded-xl p-3">
        <p className="text-xs font-bold text-red-800 mb-1">
          🎯 Deficit Plan Target
        </p>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { label: "Total", val: "1260 kcal" },
            { label: "Protein", val: "80–100g" },
            { label: "Loss/week", val: "0.5 kg" },
          ].map((t) => (
            <div
              key={t.label}
              className="bg-white rounded-lg p-2 border border-red-100"
            >
              <p className="text-xs font-extrabold text-red-700">{t.val}</p>
              <p className="text-xs text-muted-foreground">{t.label}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-card rounded-xl border border-border p-3">
        <p className="text-xs font-bold text-foreground mb-2">📅 Sample Day</p>
        <div className="space-y-2">
          {dayPlan.map((d) => (
            <div
              key={d.time}
              className="flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-semibold text-foreground">{d.time}</span>
                <span className="text-muted-foreground ml-2">{d.meal}</span>
              </div>
              <span className="font-bold text-destructive ml-2 flex-shrink-0">
                {d.cal} kcal
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        {rules.map((r) => (
          <div
            key={r.title}
            className="bg-card rounded-xl border border-border p-3 flex items-start gap-3"
          >
            <span className="text-xl flex-shrink-0">{r.icon}</span>
            <div>
              <p className="text-xs font-bold text-foreground">{r.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{r.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── My Food Log Loss Plan ────────────────────────────────────────────────────
function MyFoodLogLossPlan({ userName }: { userName?: string }) {
  const allLogs: Record<
    string,
    {
      foods: Array<{
        name: string;
        calories: number;
        protein: number;
        fat: number;
      }>;
    }
  > = JSON.parse(localStorage.getItem("doitepic_food_logs") ?? "{}");
  const recentFoods = Object.entries(allLogs)
    .slice(-7)
    .flatMap(([, v]) => v.foods ?? [])
    .reduce(
      (acc, f) => {
        const key = f.name;
        if (!acc[key])
          acc[key] = {
            name: f.name,
            count: 0,
            calories: f.calories ?? 0,
            protein: f.protein ?? 0,
            fat: f.fat ?? 0,
          };
        acc[key].count++;
        return acc;
      },
      {} as Record<
        string,
        {
          name: string;
          count: number;
          calories: number;
          protein: number;
          fat: number;
        }
      >,
    );
  const topFoods = Object.values(recentFoods)
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
  const highCalFoods = topFoods.filter((f) => f.calories > 300);
  const goodFoods = topFoods.filter((f) => f.calories <= 300 && f.protein >= 5);
  const hasLogs = topFoods.length > 0;

  return (
    <div className="space-y-3">
      <div className="bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-xl p-3">
        <p className="text-xs font-bold text-rose-800 mb-1">
          📱 {userName ? `${userName}'s` : "Your"} Fat Loss Plan
        </p>
        <p className="text-xs text-rose-600">
          We analyse your logged foods and tell you exactly what to cut and what
          to keep.
        </p>
      </div>

      {hasLogs ? (
        <>
          {highCalFoods.length > 0 && (
            <div className="bg-card rounded-xl border border-destructive/30 p-3">
              <p className="text-xs font-bold text-destructive mb-2">
                ⚠️ High-Calorie Foods You Eat Often
              </p>
              <p className="text-xs text-muted-foreground mb-2">
                Consider reducing or swapping these:
              </p>
              <div className="space-y-1">
                {highCalFoods.map((f) => (
                  <div
                    key={f.name}
                    className="flex items-center justify-between bg-red-50 rounded-lg px-3 py-2"
                  >
                    <span className="text-xs font-semibold text-foreground">
                      {f.name}
                    </span>
                    <span className="text-xs font-bold text-destructive">
                      {f.calories} kcal
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {goodFoods.length > 0 && (
            <div className="bg-card rounded-xl border border-success/30 p-3">
              <p className="text-xs font-bold text-success mb-2">
                ✅ Great Choices — Keep These!
              </p>
              <div className="space-y-1">
                {goodFoods.map((f) => (
                  <div
                    key={f.name}
                    className="flex items-center justify-between bg-green-50 rounded-lg px-3 py-2"
                  >
                    <span className="text-xs font-semibold text-foreground">
                      {f.name}
                    </span>
                    <div className="text-right">
                      <span className="text-xs font-bold text-success">
                        {f.calories} kcal
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {f.protein}g protein
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-xs font-bold text-amber-800 mb-2">
              💡 Your Personalised Tip
            </p>
            {highCalFoods.length > 2 ? (
              <p className="text-xs text-amber-700">
                You're eating {highCalFoods.length} high-calorie foods
                regularly. Swap 2–3 of them with boiled/steamed alternatives and
                you could cut 400–600 kcal daily effortlessly.
              </p>
            ) : (
              <p className="text-xs text-amber-700">
                Your food choices look reasonable! Focus on portion control —
                use the cup/plate measures in the food log to stay accurate.
                Small reductions add up to big losses.
              </p>
            )}
          </div>
        </>
      ) : (
        <div className="bg-card rounded-xl border border-border p-6 text-center">
          <p className="text-3xl mb-2">📝</p>
          <p className="text-sm font-bold text-foreground mb-1">
            No food logs yet
          </p>
          <p className="text-xs text-muted-foreground">
            Start logging in EatEpic and we'll show exactly which foods to cut
            for weight loss.
          </p>
        </div>
      )}
    </div>
  );
}

type LossTab = "overview" | "meal" | "tips";

const LOSS_TABS: { id: LossTab; label: string }[] = [
  { id: "overview", label: "📊 Overview" },
  { id: "meal", label: "🥗 Meal Plan" },
  { id: "tips", label: "💡 Tips" },
];

export default function WeightLossStatusPage({
  onBack,
  userProfile,
  onHome,
  onEat,
  onThink,
  onMove,
  onHistory,
  onLeaderboard,
}: Props) {
  const [activeTab, setActiveTab] = useState<LossTab>("overview");
  const [activeLossPlan, setActiveLossPlan] = useState("kerala");
  const [logs, setLogs] = useState<LossLog[]>(loadLogs);
  const [currentWeight, setCurrentWeight] = useState(
    String(userProfile?.weightKg ?? ""),
  );
  const [targetWeight, setTargetWeight] = useState("");
  const [meals, setMeals] = useState("");
  const [selectedCardio, setSelectedCardio] = useState<string[]>([]);
  const [sleepHours, setSleepHours] = useState("7");
  const [waterGlasses, setWaterGlasses] = useState("10");

  const bmr = userProfile
    ? calcBMR(userProfile.weightKg, userProfile.heightCm)
    : 1800;
  const dailyCalorieGoal = Math.max(1200, bmr - 500);

  const toggleCardio = (ex: string) => {
    setSelectedCardio((prev) =>
      prev.includes(ex) ? prev.filter((e) => e !== ex) : [...prev, ex],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWeight) {
      toast.error("Please enter your current weight");
      return;
    }
    const newLog: LossLog = {
      date: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      weight: Number(currentWeight),
      meals,
      cardio: selectedCardio,
      sleepHours: Number(sleepHours),
      waterGlasses: Number(waterGlasses),
    };
    const updated = [newLog, ...logs];
    saveLogs(updated);
    setLogs(updated);
    setMeals("");
    setSelectedCardio([]);
    toast.success("Today's progress saved! 🔥");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-primary">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            type="button"
            data-ocid="weight_loss.back_button"
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <TrendingDown className="text-white" size={20} />
          <h1 className="text-base font-bold text-white">Weight Loss Status</h1>
        </div>
        {/* Tab bar */}
        <div className="max-w-2xl mx-auto px-4 pb-2">
          <div className="flex gap-2 overflow-x-auto scrollbar-none">
            {LOSS_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                data-ocid={`weight_loss.${tab.id}_tab`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${activeTab === tab.id ? "bg-white text-primary" : "bg-white/20 text-white/90 hover:bg-white/30"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-3 flex-1 pb-24 w-full">
        {/* TAB: Overview */}
        {activeTab === "overview" && (
          <div className="space-y-3">
            {/* Today's Smart Plan */}
            <div
              className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl border border-sky-200 p-4"
              data-ocid="weight_loss.smart_plan.card"
            >
              <h2 className="font-bold text-sky-800 mb-3 flex items-center gap-2 text-base">
                <span className="w-7 h-7 rounded-lg bg-sky-200 flex items-center justify-center text-sky-700">
                  <Zap size={14} />
                </span>
                Today's Smart Plan
              </h2>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-white/70 rounded-xl p-3 border border-sky-100">
                  <p className="text-xs text-sky-600 font-semibold uppercase tracking-wide">
                    Calorie Target
                  </p>
                  <p className="text-2xl font-extrabold text-sky-800">
                    {dailyCalorieGoal}
                  </p>
                  <p className="text-xs text-sky-600">kcal/day (BMR − 500)</p>
                </div>
                <div className="bg-white/70 rounded-xl p-3 border border-sky-100">
                  <p className="text-xs text-sky-600 font-semibold uppercase tracking-wide">
                    Top 3 Foods
                  </p>
                  <p className="text-sm font-bold text-sky-800 leading-snug mt-1">
                    Grilled Chicken · Broccoli · Green Tea
                  </p>
                </div>
              </div>
              <div className="bg-sky-100/60 rounded-xl px-3 py-2 text-sm text-sky-800 font-medium">
                {logs.length > 0
                  ? `🔥 You've logged ${logs.length} day${logs.length !== 1 ? "s" : ""}. Keep it up!`
                  : "📝 Start logging to track your progress"}
              </div>
            </div>

            {/* Calorie Deficit Tracker */}
            <div className="bg-card rounded-2xl border border-border shadow-card p-4">
              <h2 className="font-bold text-foreground mb-3 flex items-center gap-2 text-base">
                <span className="w-7 h-7 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600 text-sm">
                  📊
                </span>
                Calorie Deficit Tracker
              </h2>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-sky-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Weight</p>
                  <p className="text-lg font-extrabold text-sky-700">
                    {userProfile?.weightKg ?? "—"}
                    <span className="text-xs font-normal ml-0.5">kg</span>
                  </p>
                </div>
                <div className="bg-sky-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">BMR</p>
                  <p className="text-lg font-extrabold text-sky-700">
                    {bmr}
                    <span className="text-xs font-normal ml-0.5">kcal</span>
                  </p>
                </div>
                <div className="bg-sky-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">
                    Daily Goal
                  </p>
                  <p className="text-lg font-extrabold text-sky-700">
                    {dailyCalorieGoal}
                    <span className="text-xs font-normal ml-0.5">kcal</span>
                  </p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Target Weight (kg)</Label>
                  <Input
                    data-ocid="weight_loss.target_input"
                    type="number"
                    placeholder="e.g. 65"
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(e.target.value)}
                    className="mt-1 h-9"
                  />
                </div>
                <div className="bg-sky-50 rounded-xl p-3 flex flex-col justify-center">
                  <p className="text-xs text-muted-foreground">To Lose</p>
                  <p className="text-sm font-bold text-sky-700">
                    {targetWeight && userProfile
                      ? `${(userProfile.weightKg - Number(targetWeight)).toFixed(1)} kg to lose`
                      : "Set target"}
                  </p>
                </div>
              </div>
            </div>

            {/* Log Today */}
            <div className="bg-card rounded-2xl border border-border shadow-card p-4">
              <h2 className="font-bold text-foreground mb-3 flex items-center gap-2 text-base">
                <span className="w-7 h-7 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600 text-sm">
                  📝
                </span>
                Log Today's Progress
              </h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Current Weight (kg)</Label>
                    <Input
                      data-ocid="weight_loss.weight_input"
                      type="number"
                      step="0.1"
                      placeholder="e.g. 70.5"
                      value={currentWeight}
                      onChange={(e) => setCurrentWeight(e.target.value)}
                      className="mt-1 h-9"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Sleep Hours</Label>
                    <Input
                      data-ocid="weight_loss.sleep_input"
                      type="number"
                      min="1"
                      max="12"
                      value={sleepHours}
                      onChange={(e) => setSleepHours(e.target.value)}
                      className="mt-1 h-9"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Meals eaten today</Label>
                  <Textarea
                    data-ocid="weight_loss.meals_textarea"
                    placeholder="e.g. Oats for breakfast, grilled chicken salad for lunch..."
                    value={meals}
                    onChange={(e) => setMeals(e.target.value)}
                    className="mt-1 text-sm resize-none"
                    rows={2}
                  />
                </div>
                <div>
                  <Label className="text-xs mb-2 block">
                    Cardio Done Today
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {CARDIO_OPTIONS.map((ex) => (
                      <div
                        key={ex}
                        className="flex items-center gap-2 cursor-pointer"
                        data-ocid="weight_loss.cardio_checkbox"
                        onClick={() => toggleCardio(ex)}
                        onKeyDown={(e) => e.key === " " && toggleCardio(ex)}
                      >
                        <Checkbox
                          checked={selectedCardio.includes(ex)}
                          onCheckedChange={() => toggleCardio(ex)}
                        />
                        <span className="text-sm">{ex}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Water Glasses</Label>
                  <Input
                    data-ocid="weight_loss.water_input"
                    type="number"
                    min="0"
                    max="20"
                    value={waterGlasses}
                    onChange={(e) => setWaterGlasses(e.target.value)}
                    className="mt-1 h-9"
                  />
                </div>
                <Button
                  data-ocid="weight_loss.submit_button"
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-white"
                >
                  🔥 Save Today's Progress
                </Button>
              </form>
            </div>

            {/* Age Exercise Recommendations */}
            {(() => {
              const age = getUserAge();
              const group = getAgeGroup(age);
              const exerciseMap = {
                teen: {
                  title: "Teen Exercise Plan",
                  emoji: "🧒",
                  color: "bg-pink-600",
                  lightColor: "bg-pink-50 border-pink-100",
                  exercises: [
                    {
                      icon: "🤸",
                      name: "Bodyweight Training",
                      desc: "Push-ups, squats, lunges",
                    },
                    {
                      icon: "🏃",
                      name: "Running & Jogging",
                      desc: "20–30 min cardio",
                    },
                    {
                      icon: "⚽",
                      name: "Team Sports",
                      desc: "Football, basketball",
                    },
                    {
                      icon: "🚴",
                      name: "Cycling",
                      desc: "Leisure rides, 30–40 min",
                    },
                  ],
                  tip: "60 min/day activity. Make it fun!",
                },
                youngAdult: {
                  title: "Young Adult Training",
                  emoji: "🔥",
                  color: "bg-primary",
                  lightColor: "bg-sky-50 border-sky-100",
                  exercises: [
                    {
                      icon: "⚡",
                      name: "HIIT Workouts",
                      desc: "20–30 min, fat burn",
                    },
                    { icon: "🏃", name: "Running", desc: "5–10km, 3–4×/week" },
                    {
                      icon: "🏋️",
                      name: "Compound Lifts",
                      desc: "Squats, deadlifts",
                    },
                    { icon: "🚴", name: "Cycling", desc: "45 min moderate" },
                  ],
                  tip: "45–60 min cardio + strength. HIIT burns fat fast!",
                },
                middleAge: {
                  title: "Middle Age Fitness",
                  emoji: "🧘",
                  color: "bg-accent",
                  lightColor: "bg-status-warning border-warning/20",
                  exercises: [
                    {
                      icon: "🚶",
                      name: "Brisk Walking",
                      desc: "40–45 min daily",
                    },
                    {
                      icon: "🚴",
                      name: "Cycling",
                      desc: "Low-impact, 30–45 min",
                    },
                    {
                      icon: "🧘",
                      name: "Yoga",
                      desc: "Stress reduction + fat loss",
                    },
                    { icon: "🏊", name: "Swimming", desc: "Joint-friendly" },
                  ],
                  tip: "30–45 min moderate exercise.",
                },
                senior: {
                  title: "Senior Wellness Exercise",
                  emoji: "🌟",
                  color: "bg-teal-600",
                  lightColor: "bg-teal-50 border-teal-100",
                  exercises: [
                    {
                      icon: "🚶",
                      name: "Light Walking",
                      desc: "20–30 min gentle",
                    },
                    {
                      icon: "🪑",
                      name: "Chair Exercises",
                      desc: "Seated cardio",
                    },
                    {
                      icon: "🧘",
                      name: "Gentle Yoga",
                      desc: "Balance and flexibility",
                    },
                    {
                      icon: "🏊",
                      name: "Water Aerobics",
                      desc: "Pool exercises",
                    },
                  ],
                  tip: "30 min light daily activity.",
                },
              };
              const agePlan = exerciseMap[group];
              return (
                <div className="bg-card rounded-2xl border border-border shadow-card p-4">
                  <h2 className="font-bold text-foreground mb-1 flex items-center gap-2 text-base">
                    <span
                      className={`w-7 h-7 rounded-lg ${agePlan.color} flex items-center justify-center text-white text-sm`}
                    >
                      {agePlan.emoji}
                    </span>
                    {agePlan.title}
                  </h2>
                  <p className="text-xs text-muted-foreground mb-3">
                    Age {age} · {agePlan.tip}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {agePlan.exercises.map((ex) => (
                      <div
                        key={ex.name}
                        className={`rounded-xl p-3 border ${agePlan.lightColor}`}
                      >
                        <div className="text-xl mb-1">{ex.icon}</div>
                        <p className="text-xs font-semibold text-foreground">
                          {ex.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {ex.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Progress History */}
            {logs.length > 0 && (
              <div className="bg-card rounded-2xl border border-border shadow-card p-4">
                <h2 className="font-bold text-foreground mb-3 flex items-center gap-2 text-base">
                  <span className="w-7 h-7 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600 text-sm">
                    📈
                  </span>
                  Progress History
                </h2>
                <ScrollArea className="max-h-72">
                  <div className="space-y-2">
                    {logs.map((log, i) => (
                      <div
                        key={log.date + String(i)}
                        data-ocid={`weight_loss.item.${i + 1}`}
                        className="bg-muted/50 rounded-xl p-3 border border-border"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs text-muted-foreground">
                            {log.date}
                          </span>
                          <span className="text-sm font-bold text-sky-700">
                            {log.weight} kg
                          </span>
                        </div>
                        {log.cardio.length > 0 && (
                          <p className="text-xs text-foreground">
                            <span className="font-medium">Cardio:</span>{" "}
                            {log.cardio.join(", ")}
                          </p>
                        )}
                        <div className="flex gap-3 mt-1">
                          <span className="text-xs text-muted-foreground">
                            💤 {log.sleepHours}h
                          </span>
                          <span className="text-xs text-muted-foreground">
                            💧 {log.waterGlasses} glasses
                          </span>
                        </div>
                        {log.meals && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {log.meals}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Loss Shake Recipes */}
            <div>
              <h2 className="text-base font-bold text-foreground mb-3">
                🥤 Weight Loss Shake Recipes
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {LOSS_SHAKES.map((shake) => (
                  <div
                    key={shake.name}
                    className="bg-card rounded-xl border border-border p-4"
                  >
                    <div className="text-2xl mb-2">{shake.emoji}</div>
                    <h3 className="font-semibold text-foreground mb-1 text-sm">
                      {shake.name}
                    </h3>
                    <div className="flex gap-2 mb-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-status-healthy text-success font-medium">
                        {shake.kcal} kcal
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-status-info text-primary font-medium">
                        {shake.protein}g protein
                      </span>
                    </div>
                    <ul className="space-y-1">
                      {shake.ingredients.map((ing) => (
                        <li
                          key={ing}
                          className="text-xs text-muted-foreground flex items-center gap-1.5"
                        >
                          <span className="text-success">•</span>
                          {ing}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: Meal Plan */}
        {activeTab === "meal" && (
          <div className="space-y-3" data-ocid="weight_loss.diet_plans.card">
            {/* Plan selector */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {[
                { id: "kerala", label: "🌴 Kerala Clean Cut" },
                { id: "deficit", label: "📉 Calorie Deficit" },
                { id: "foodlog", label: "📱 My Food Log" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveLossPlan(tab.id)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold border transition-all ${activeLossPlan === tab.id ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-muted text-muted-foreground border-border hover:border-primary"}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeLossPlan === "kerala" && (
              <div>
                <div className="mb-3 bg-gradient-to-r from-green-600 to-teal-600 rounded-xl p-4 text-white">
                  <h3 className="font-extrabold text-base mb-0.5">
                    🌴 Kerala Clean Cut
                  </h3>
                  <p className="text-xs text-green-100">
                    Local Kerala foods, smart portions, real fat loss
                  </p>
                </div>
                <KeralaCleanCutPlan />
              </div>
            )}
            {activeLossPlan === "deficit" && (
              <div>
                <div className="mb-3 bg-gradient-to-r from-red-600 to-rose-600 rounded-xl p-4 text-white">
                  <h3 className="font-extrabold text-base mb-0.5">
                    📉 Calorie Deficit Plan
                  </h3>
                  <p className="text-xs text-red-100">
                    Science-backed deficit eating to lose 0.5 kg/week
                  </p>
                </div>
                <CalorieDeficitPlan />
              </div>
            )}
            {activeLossPlan === "foodlog" && (
              <div>
                <div className="mb-3 bg-gradient-to-r from-rose-600 to-pink-600 rounded-xl p-4 text-white">
                  <h3 className="font-extrabold text-base mb-0.5">
                    📱 My Food Log Plan
                  </h3>
                  <p className="text-xs text-rose-100">
                    Personalised from your daily food habits
                  </p>
                </div>
                <MyFoodLogLossPlan userName={userProfile?.name} />
              </div>
            )}

            {/* Foods Reference */}
            <details className="bg-card rounded-2xl border border-border shadow-card">
              <summary className="p-4 font-bold text-foreground text-sm cursor-pointer flex items-center gap-2">
                <span className="text-base">📋</span> Quick Reference — Foods to
                Eat & Avoid
              </summary>
              <div className="px-4 pb-4 space-y-3">
                <div>
                  <p className="text-xs font-bold text-success mb-2">
                    ✅ Foods to Eat
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {FOODS_EAT.map((f) => (
                      <div
                        key={f.name}
                        className="bg-status-healthy rounded-xl p-2 text-center border border-success/20"
                      >
                        <div className="text-xl mb-1">{f.emoji}</div>
                        <p className="text-xs font-medium text-foreground leading-tight">
                          {f.name}
                        </p>
                        <p className="text-xs font-bold text-success mt-0.5">
                          {f.kcal} kcal
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-destructive mb-2">
                    🚫 Foods to Avoid
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {FOODS_AVOID.map((f) => (
                      <div
                        key={f.name}
                        className="bg-status-danger rounded-xl p-2 text-center border border-destructive/20"
                      >
                        <div className="text-xl mb-1">{f.emoji}</div>
                        <p className="text-xs font-medium text-foreground leading-tight">
                          {f.name}
                        </p>
                        <p className="text-xs font-bold text-destructive mt-0.5">
                          {f.kcal} kcal
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </details>
          </div>
        )}

        {/* TAB: Tips */}
        {activeTab === "tips" && (
          <div className="space-y-3">
            <SuccessHabitsChecklist goalType="loss" />
            <CalorieSwapCard goalType="loss" />
            <BodyTypeWorkoutAdvisor />
          </div>
        )}
      </div>

      <BottomNav
        activePage="home"
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
