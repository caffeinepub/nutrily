import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, TrendingUp, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface GainLog {
  date: string;
  weight: number;
  meals: string;
  exercises: string[];
  sleepHours: number;
  waterGlasses: number;
}

interface Props {
  onBack: () => void;
  userProfile?: { weightKg: number; heightCm: number; name: string };
}

const EXERCISES = [
  "Squats",
  "Deadlifts",
  "Bench Press",
  "Pull-ups",
  "Overhead Press",
  "Barbell Rows",
  "Dips",
  "Leg Press",
  "Incline Bench Press",
  "Bicep Curls",
  "Tricep Extensions",
  "Face Pulls",
];

const GAIN_FOODS = [
  { name: "Brown Rice (100g)", kcal: 216, emoji: "🍚" },
  { name: "Eggs (2 whole)", kcal: 143, emoji: "🥚" },
  { name: "Chicken Breast (100g)", kcal: 165, emoji: "🍗" },
  { name: "Whole Milk (250ml)", kcal: 150, emoji: "🥛" },
  { name: "Banana (1 medium)", kcal: 105, emoji: "🍌" },
  { name: "Oats (100g)", kcal: 389, emoji: "🌾" },
  { name: "Peanut Butter (30g)", kcal: 188, emoji: "🥜" },
  { name: "Almonds (30g)", kcal: 173, emoji: "🌰" },
  { name: "Potato (100g)", kcal: 77, emoji: "🥔" },
  { name: "Avocado (100g)", kcal: 160, emoji: "🥑" },
  { name: "Ghee Rice (150g)", kcal: 280, emoji: "🍛" },
  { name: "Paneer (100g)", kcal: 265, emoji: "🧀" },
  { name: "Soy Chunks (100g)", kcal: 345, emoji: "🫘" },
  { name: "Sweet Potato (100g)", kcal: 86, emoji: "🍠" },
  { name: "Greek Yogurt (150g)", kcal: 133, emoji: "🥣" },
  { name: "Tuna (100g)", kcal: 132, emoji: "🐟" },
];

function calcBMR(weight: number, height: number) {
  return Math.round(10 * weight + 6.25 * height - 5 * 25 + 5);
}

const STORAGE_KEY = "doitepic_gain_logs";

function loadLogs(): GainLog[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveLogs(logs: GainLog[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

const GAIN_SHAKES = [
  {
    name: "Mass Builder",
    emoji: "💪",
    kcal: 750,
    protein: 45,
    ingredients: [
      "1 Banana",
      "Oats 50g",
      "Peanut Butter 2 tbsp",
      "Whole Milk 400ml",
      "Whey Protein 1 scoop",
      "Honey 1 tbsp",
    ],
  },
  {
    name: "Calorie Bomb",
    emoji: "🔥",
    kcal: 680,
    protein: 22,
    ingredients: [
      "4 Dates",
      "Almonds 30g",
      "Full-Fat Yogurt 200g",
      "Oats 40g",
      "Cocoa Powder 1 tbsp",
      "Milk 300ml",
    ],
  },
  {
    name: "Night Gainer",
    emoji: "🌙",
    kcal: 580,
    protein: 40,
    ingredients: [
      "Casein Protein 1 scoop",
      "Peanut Butter 2 tbsp",
      "1 Banana",
      "Milk 350ml",
      "Chia Seeds 1 tbsp",
    ],
  },
];

const BODY_TYPE_ADVICE_GAIN: Record<string, Record<string, string>> = {
  skinny: {
    gym: "Focus on compound lifts (Squats, Deadlifts, Bench Press). Eat at 500+ calorie surplus. Aim for 1.6g protein/kg body weight.",
    home: "Bodyweight progressions: Push-ups, Pull-ups, Dips. Add resistance bands. Eat 5–6 meals/day with calorie-dense foods.",
    nongym:
      "Daily walks + calorie-dense foods. Nuts, avocado, whole milk. Gradually increase activity level.",
  },
  moderate: {
    gym: "Progressive overload with compound exercises. Track weekly progress. Eat in slight surplus (250–300 kcal).",
    home: "Home resistance training with dumbbells or bands. Focus on progressive tension. 5 meals a day.",
    nongym:
      "Increase caloric intake slowly. Focus on nutrient-dense whole foods. Yoga or stretching to stay active.",
  },
  overweight: {
    gym: "Body recomposition approach. Lift weights to build muscle while reducing fat. High protein diet, moderate deficit.",
    home: "Bodyweight HIIT + resistance exercises. Prioritize protein. Avoid excess processed carbs.",
    nongym:
      "Start with daily 30-min walks. Increase protein intake. Reduce sugar and junk food gradually.",
  },
  healthy: {
    gym: "Maintain with strength training 3–4x/week. Slight calorie surplus on training days.",
    home: "Full-body home workouts. Progressive calisthenics. Balanced macro intake.",
    nongym:
      "Stay active with daily movement. Focus on nutritious, balanced meals. Avoid sedentary lifestyle.",
  },
};

function BodyTypeWorkoutAdvisor() {
  const [bodyType, setBodyType] = useState<string | null>(null);
  const [workoutType, setWorkoutType] = useState<string | null>(null);

  const adviceMap = BODY_TYPE_ADVICE_GAIN;
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

export default function WeightGainStatusPage({ onBack, userProfile }: Props) {
  const [logs, setLogs] = useState<GainLog[]>(loadLogs);
  const [currentWeight, setCurrentWeight] = useState(
    String(userProfile?.weightKg ?? ""),
  );
  const [targetWeight, setTargetWeight] = useState("");
  const [meals, setMeals] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [sleepHours, setSleepHours] = useState("8");
  const [waterGlasses, setWaterGlasses] = useState("8");

  const bmr = userProfile
    ? calcBMR(userProfile.weightKg, userProfile.heightCm)
    : 1800;
  const dailyCalorieGoal = bmr + 500;

  const toggleExercise = (ex: string) => {
    setSelectedExercises((prev) =>
      prev.includes(ex) ? prev.filter((e) => e !== ex) : [...prev, ex],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWeight) {
      toast.error("Please enter your current weight");
      return;
    }
    const newLog: GainLog = {
      date: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      weight: Number(currentWeight),
      meals,
      exercises: selectedExercises,
      sleepHours: Number(sleepHours),
      waterGlasses: Number(waterGlasses),
    };
    const updated = [newLog, ...logs];
    saveLogs(updated);
    setLogs(updated);
    setMeals("");
    setSelectedExercises([]);
    toast.success("Today's progress saved! 💪");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-emerald-600 px-4 py-4 flex items-center gap-3">
        <button
          type="button"
          data-ocid="weight_gain.back_button"
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <TrendingUp className="text-white" size={22} />
        <h1 className="text-xl font-bold text-white">Weight Gain Status</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Today's Smart Plan */}
        <div
          className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 p-5"
          data-ocid="weight_gain.smart_plan.card"
        >
          <h2 className="font-bold text-emerald-800 mb-3 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-200 flex items-center justify-center text-emerald-700">
              <Zap size={14} />
            </span>
            Today's Smart Plan
          </h2>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-white/70 rounded-xl p-3 border border-emerald-100">
              <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wide">
                Calorie Target
              </p>
              <p className="text-2xl font-extrabold text-emerald-800">
                {dailyCalorieGoal}
              </p>
              <p className="text-xs text-emerald-600">kcal/day (BMR + 500)</p>
            </div>
            <div className="bg-white/70 rounded-xl p-3 border border-emerald-100">
              <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wide">
                Top 3 Foods Today
              </p>
              <p className="text-sm font-bold text-emerald-800 leading-snug mt-1">
                Brown Rice · Chicken Breast · Whole Milk
              </p>
            </div>
          </div>
          <div className="bg-emerald-100/60 rounded-xl px-3 py-2 text-sm text-emerald-800 font-medium">
            {logs.length > 0
              ? `🔥 You've logged ${logs.length} day${logs.length !== 1 ? "s" : ""}. Keep it up!`
              : "📝 Start logging to track your progress"}
          </div>
        </div>

        {/* Current Stats */}
        <div className="bg-card rounded-2xl border border-border shadow-card p-5">
          <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 text-sm">
              📊
            </span>
            Current Stats
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-emerald-50 rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">
                Current Weight
              </p>
              <p className="text-xl font-extrabold text-emerald-700">
                {userProfile?.weightKg ?? "—"}
                <span className="text-xs font-normal ml-0.5">kg</span>
              </p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">BMR</p>
              <p className="text-xl font-extrabold text-emerald-700">
                {bmr}
                <span className="text-xs font-normal ml-0.5">kcal</span>
              </p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Daily Goal</p>
              <p className="text-xl font-extrabold text-emerald-700">
                {dailyCalorieGoal}
                <span className="text-xs font-normal ml-0.5">kcal</span>
              </p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Target Weight (kg)</Label>
              <Input
                data-ocid="weight_gain.target_input"
                type="number"
                placeholder="e.g. 75"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                className="mt-1 h-9"
              />
            </div>
            <div className="bg-emerald-50 rounded-xl p-3 flex flex-col justify-center">
              <p className="text-xs text-muted-foreground">To Gain</p>
              <p className="text-sm font-bold text-emerald-700">
                {targetWeight && userProfile
                  ? `${(Number(targetWeight) - userProfile.weightKg).toFixed(1)} kg needed`
                  : "Set target weight"}
              </p>
            </div>
          </div>
        </div>

        {/* Log Today */}
        <div className="bg-card rounded-2xl border border-border shadow-card p-5">
          <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 text-sm">
              📝
            </span>
            Log Today's Progress
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Current Weight (kg)</Label>
                <Input
                  data-ocid="weight_gain.weight_input"
                  type="number"
                  step="0.1"
                  placeholder="e.g. 68.5"
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(e.target.value)}
                  className="mt-1 h-9"
                />
              </div>
              <div>
                <Label className="text-xs">Sleep Hours</Label>
                <Input
                  data-ocid="weight_gain.sleep_input"
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
                data-ocid="weight_gain.meals_textarea"
                placeholder="e.g. Oats + milk for breakfast, rice + chicken + dal for lunch..."
                value={meals}
                onChange={(e) => setMeals(e.target.value)}
                className="mt-1 text-sm resize-none"
                rows={3}
              />
            </div>

            <div>
              <Label className="text-xs mb-2 block">Exercises Done Today</Label>
              <div className="grid grid-cols-2 gap-2">
                {EXERCISES.map((ex) => (
                  <div
                    key={ex}
                    className="flex items-center gap-2 cursor-pointer"
                    data-ocid="weight_gain.exercise_checkbox"
                    onClick={() => toggleExercise(ex)}
                    onKeyDown={(e) => e.key === " " && toggleExercise(ex)}
                  >
                    <Checkbox
                      checked={selectedExercises.includes(ex)}
                      onCheckedChange={() => toggleExercise(ex)}
                    />
                    <span className="text-sm">{ex}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs">Water Glasses</Label>
              <Input
                data-ocid="weight_gain.water_input"
                type="number"
                min="0"
                max="20"
                value={waterGlasses}
                onChange={(e) => setWaterGlasses(e.target.value)}
                className="mt-1 h-9"
              />
            </div>

            <Button
              data-ocid="weight_gain.submit_button"
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              💪 Save Today's Progress
            </Button>
          </form>
        </div>

        {/* Progress History */}
        {logs.length > 0 && (
          <div className="bg-card rounded-2xl border border-border shadow-card p-5">
            <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 text-sm">
                📈
              </span>
              Progress History
            </h2>
            <ScrollArea className="max-h-72">
              <div className="space-y-3">
                {logs.map((log, i) => (
                  <div
                    key={log.date + String(i)}
                    data-ocid={`weight_gain.item.${i + 1}`}
                    className="bg-muted/50 rounded-xl p-3 border border-border"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">
                        {log.date}
                      </span>
                      <span className="text-sm font-bold text-emerald-700">
                        {log.weight} kg
                      </span>
                    </div>
                    {log.exercises.length > 0 && (
                      <p className="text-xs text-foreground">
                        <span className="font-medium">Exercises:</span>{" "}
                        {log.exercises.join(", ")}
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

        {/* Recommended Foods */}
        <div className="bg-card rounded-2xl border border-border shadow-card p-5">
          <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 text-sm">
              🥗
            </span>
            Best Foods for Weight Gain
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {GAIN_FOODS.map((f) => (
              <div
                key={f.name}
                className="bg-emerald-50 rounded-xl p-2.5 text-center border border-emerald-100"
              >
                <div className="text-2xl mb-1">{f.emoji}</div>
                <p className="text-xs font-medium text-foreground leading-tight">
                  {f.name}
                </p>
                <p className="text-xs font-bold text-emerald-700 mt-0.5">
                  {f.kcal} kcal
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Meal Plan Guide */}
        <div className="bg-card rounded-2xl border border-border shadow-card p-5">
          <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 text-sm">
              🗓️
            </span>
            Daily Meal Plan Guide
          </h2>
          <div className="space-y-3">
            {[
              {
                time: "🌅 Morning (7–8 AM)",
                items: [
                  "3–5 eggs scrambled",
                  "Oats + milk + banana",
                  "1 glass whole milk",
                ],
              },
              {
                time: "🍱 Lunch (12–1 PM)",
                items: [
                  "Rice + dal + chicken/fish",
                  "Vegetables on the side",
                  "Curd / buttermilk",
                ],
              },
              {
                time: "🥤 Post-Workout (4–5 PM)",
                items: [
                  "Banana + peanut butter shake",
                  "Or: eggs + fruit",
                  "Protein-rich snack",
                ],
              },
              {
                time: "🌙 Dinner (7–8 PM)",
                items: [
                  "Chapati + paneer / chicken",
                  "Mixed vegetables",
                  "Salad on the side",
                ],
              },
              {
                time: "🌜 Before Bed (9–10 PM)",
                items: [
                  "Glass of warm milk",
                  "Or: curd + honey",
                  "Optional: a few almonds",
                ],
              },
            ].map((meal) => (
              <div
                key={meal.time}
                className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3"
              >
                <p className="text-sm font-semibold text-emerald-800 mb-1">
                  {meal.time}
                </p>
                <ul className="space-y-0.5">
                  {meal.items.map((item) => (
                    <li
                      key={item}
                      className="text-xs text-foreground flex items-center gap-1.5"
                    >
                      <span className="text-emerald-400">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Body Type & Workout Finder */}
        <BodyTypeWorkoutAdvisor />

        {/* Weight Gain Shake Recipes */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-foreground mb-1">
            Weight Gain Shake Recipes
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            High-calorie shakes to fuel muscle growth
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {GAIN_SHAKES.map((shake) => (
              <div
                key={shake.name}
                className="bg-card rounded-xl border border-border shadow-card p-4"
              >
                <div className="text-2xl mb-2">{shake.emoji}</div>
                <h3 className="font-semibold text-foreground mb-1">
                  {shake.name}
                </h3>
                <div className="flex gap-2 mb-3">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                    {shake.kcal} kcal
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                    {shake.protein}g protein
                  </span>
                </div>
                <ul className="space-y-1">
                  {shake.ingredients.map((ing) => (
                    <li
                      key={ing}
                      className="text-xs text-muted-foreground flex items-center gap-1.5"
                    >
                      <span className="text-emerald-400">•</span>
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
