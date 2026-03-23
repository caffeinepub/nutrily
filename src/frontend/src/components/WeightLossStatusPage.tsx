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

export default function WeightLossStatusPage({ onBack, userProfile }: Props) {
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary px-4 py-4 flex items-center gap-3">
        <button
          type="button"
          data-ocid="weight_loss.back_button"
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <TrendingDown className="text-white" size={22} />
        <h1 className="text-xl font-bold text-white">Weight Loss Status</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Today's Smart Plan */}
        <div
          className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl border border-sky-200 p-5"
          data-ocid="weight_loss.smart_plan.card"
        >
          <h2 className="font-bold text-sky-800 mb-3 flex items-center gap-2">
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
                Top 3 Foods Today
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
        <div className="bg-card rounded-2xl border border-border shadow-card p-5">
          <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600 text-sm">
              📊
            </span>
            Calorie Deficit Tracker
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-sky-50 rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">
                Current Weight
              </p>
              <p className="text-xl font-extrabold text-sky-700">
                {userProfile?.weightKg ?? "—"}
                <span className="text-xs font-normal ml-0.5">kg</span>
              </p>
            </div>
            <div className="bg-sky-50 rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">BMR</p>
              <p className="text-xl font-extrabold text-sky-700">
                {bmr}
                <span className="text-xs font-normal ml-0.5">kcal</span>
              </p>
            </div>
            <div className="bg-sky-50 rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Daily Goal</p>
              <p className="text-xl font-extrabold text-sky-700">
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
                  : "Set target weight"}
              </p>
            </div>
          </div>
        </div>

        {/* Log Today */}
        <div className="bg-card rounded-2xl border border-border shadow-card p-5">
          <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600 text-sm">
              📝
            </span>
            Log Today's Progress
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                rows={3}
              />
            </div>

            <div>
              <Label className="text-xs mb-2 block">Cardio Done Today</Label>
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

        {/* Age-Based Exercise Recommendations */}
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
                  desc: "20–30 min cardio, fun pace",
                },
                {
                  icon: "⚽",
                  name: "Team Sports",
                  desc: "Football, basketball, badminton",
                },
                {
                  icon: "🚴",
                  name: "Cycling",
                  desc: "Leisure rides, 30–40 min",
                },
              ],
              tip: "60 min/day activity. Make it fun — sports, dance, outdoor play.",
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
                  desc: "20–30 min, maximum fat burn",
                },
                { icon: "🏃", name: "Running", desc: "5–10km, 3–4×/week" },
                {
                  icon: "🏋️",
                  name: "Compound Lifts",
                  desc: "Squats, deadlifts for metabolism",
                },
                {
                  icon: "🚴",
                  name: "Cycling",
                  desc: "45 min moderate intensity",
                },
              ],
              tip: "45–60 min cardio + strength. HIIT burns fat fast at this age!",
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
                  desc: "40–45 min daily, good pace",
                },
                { icon: "🚴", name: "Cycling", desc: "Low-impact, 30–45 min" },
                {
                  icon: "🧘",
                  name: "Yoga",
                  desc: "Stress reduction + fat loss",
                },
                {
                  icon: "🏊",
                  name: "Swimming",
                  desc: "Joint-friendly full body",
                },
              ],
              tip: "30–45 min moderate exercise. Yoga reduces cortisol which aids fat loss.",
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
                  desc: "20–30 min, gentle daily walk",
                },
                {
                  icon: "🪑",
                  name: "Chair Exercises",
                  desc: "Seated cardio and stretches",
                },
                {
                  icon: "🧘",
                  name: "Gentle Yoga",
                  desc: "Balance and flexibility",
                },
                {
                  icon: "🏊",
                  name: "Water Aerobics",
                  desc: "Pool exercises, easy joints",
                },
              ],
              tip: "30 min light daily activity. Consistency matters more than intensity.",
            },
          };
          const plan = exerciseMap[group];
          return (
            <div className="bg-card rounded-2xl border border-border shadow-card p-5">
              <h2 className="font-bold text-foreground mb-1 flex items-center gap-2">
                <span
                  className={`w-7 h-7 rounded-lg ${plan.color} flex items-center justify-center text-white text-sm`}
                >
                  {plan.emoji}
                </span>
                {plan.title}
              </h2>
              <p className="text-xs text-muted-foreground mb-4">
                Age {age} · {plan.tip}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {plan.exercises.map((ex) => (
                  <div
                    key={ex.name}
                    className={`rounded-xl p-3 border ${plan.lightColor}`}
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
          <div className="bg-card rounded-2xl border border-border shadow-card p-5">
            <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600 text-sm">
                📈
              </span>
              Progress History
            </h2>
            <ScrollArea className="max-h-72">
              <div className="space-y-3">
                {logs.map((log, i) => (
                  <div
                    key={log.date + String(i)}
                    data-ocid={`weight_loss.item.${i + 1}`}
                    className="bg-muted/50 rounded-xl p-3 border border-border"
                  >
                    <div className="flex items-center justify-between mb-2">
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

        {/* Foods to Eat */}
        <div className="bg-card rounded-2xl border border-border shadow-card p-5">
          <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-status-healthy flex items-center justify-center text-success text-sm">
              ✅
            </span>
            Foods to Eat
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {FOODS_EAT.map((f) => (
              <div
                key={f.name}
                className="bg-status-healthy rounded-xl p-2.5 text-center border border-success/20"
              >
                <div className="text-2xl mb-1">{f.emoji}</div>
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

        {/* Foods to Avoid */}
        <div className="bg-card rounded-2xl border border-border shadow-card p-5">
          <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-status-danger flex items-center justify-center text-destructive text-sm">
              🚫
            </span>
            Foods to Avoid
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {FOODS_AVOID.map((f) => (
              <div
                key={f.name}
                className="bg-status-danger rounded-xl p-2.5 text-center border border-destructive/20"
              >
                <div className="text-2xl mb-1">{f.emoji}</div>
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

        {/* Success Habits Checklist */}
        <SuccessHabitsChecklist goalType="loss" />
        <CalorieSwapCard goalType="loss" />

        {/* Body Type & Workout Finder */}
        <BodyTypeWorkoutAdvisor />

        {/* Weight Loss Shake Recipes */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-foreground mb-1">
            Weight Loss Shake Recipes
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Low-calorie, metabolism-boosting shakes
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {LOSS_SHAKES.map((shake) => (
              <div
                key={shake.name}
                className="bg-card rounded-xl border border-border shadow-card p-4"
              >
                <div className="text-2xl mb-2">{shake.emoji}</div>
                <h3 className="font-semibold text-foreground mb-1">
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
    </div>
  );
}
