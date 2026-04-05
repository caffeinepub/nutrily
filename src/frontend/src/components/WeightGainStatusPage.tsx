import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, TrendingUp, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getAgeGroup, getUserAge } from "../utils/ageUtils";
import BottomNav from "./BottomNav";
import CalorieSwapCard from "./CalorieSwapCard";
import SuccessHabitsChecklist from "./SuccessHabitsChecklist";

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
  onHome?: () => void;
  onEat?: () => void;
  onThink?: () => void;
  onMove?: () => void;
  onHistory?: () => void;
  onLeaderboard?: () => void;
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
                className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  bodyType === v
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted text-muted-foreground border-border hover:border-primary"
                }`}
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
                className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  workoutType === v
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted text-muted-foreground border-border hover:border-primary"
                }`}
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

// ─── Muscle Gain Diet Plan ────────────────────────────────────────────────────

const MUSCLE_MEALS = [
  {
    time: "🌅 Morning",
    slot: "6–8 AM",
    items: [
      "2–4 whole eggs",
      "1 banana",
      "50–100g oats (with milk)",
      "Tea/coffee (less sugar)",
    ],
    why: "Protein + carbs to start metabolism",
    color: "from-amber-50 to-yellow-50 border-amber-200",
    dot: "bg-amber-400",
  },
  {
    time: "🕙 Mid-Morning Snack",
    slot: "~10 AM",
    items: ["Handful of peanuts or cashews", "1 fruit (banana/apple)"],
    why: "Cheap + calorie-dense",
    color: "from-orange-50 to-amber-50 border-orange-200",
    dot: "bg-orange-400",
  },
  {
    time: "🍛 Lunch",
    slot: "1–2 PM",
    items: [
      "Rice (white/red Kerala rice)",
      "Chicken / fish / 3–4 eggs / dal",
      "Vegetables (thoran, curry, salad)",
      "1 tsp ghee (optional)",
    ],
    why: "This is your main calorie meal",
    color: "from-emerald-50 to-green-50 border-emerald-200",
    dot: "bg-emerald-500",
  },
  {
    time: "☕ Evening Snack",
    slot: "4–5 PM",
    items: ["Banana + peanuts", "OR 2 boiled eggs", "OR Peanut butter bread"],
    why: "Pre-workout fuel",
    color: "from-sky-50 to-blue-50 border-sky-200",
    dot: "bg-sky-500",
  },
  {
    time: "🏋️ Post-Workout",
    slot: "After gym",
    items: ["1 banana", "2–4 eggs OR milk"],
    why: "Fast recovery",
    color: "from-violet-50 to-purple-50 border-violet-200",
    dot: "bg-violet-500",
  },
  {
    time: "🌙 Dinner",
    slot: "8–9 PM",
    items: [
      "Chapati or rice",
      "Chicken / fish / egg curry / dal",
      "Vegetables",
    ],
    why: "Balanced evening fuel",
    color: "from-indigo-50 to-blue-50 border-indigo-200",
    dot: "bg-indigo-500",
  },
  {
    time: "🌌 Before Bed",
    slot: "~10 PM",
    items: ["1 glass milk", "OR handful of nuts"],
    why: "Prevents muscle breakdown overnight",
    color: "from-slate-50 to-gray-50 border-slate-200",
    dot: "bg-slate-500",
  },
];

function MealTimeline({ meals }: { meals: typeof MUSCLE_MEALS }) {
  return (
    <div className="relative pl-4">
      <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-border rounded-full" />
      <div className="space-y-3">
        {meals.map((meal) => (
          <div key={meal.time} className="relative">
            <div
              className={`absolute -left-4 top-3 w-2.5 h-2.5 rounded-full border-2 border-white ${meal.dot}`}
            />
            <div
              className={`ml-1 rounded-xl border bg-gradient-to-br ${meal.color} p-3`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-foreground">
                  {meal.time}
                </span>
                <span className="text-xs text-muted-foreground bg-white/60 rounded-full px-2 py-0.5">
                  {meal.slot}
                </span>
              </div>
              <ul className="space-y-0.5 mb-1.5">
                {meal.items.map((item) => (
                  <li
                    key={item}
                    className="text-xs text-foreground flex items-start gap-1.5"
                  >
                    <span className="text-success mt-0.5 flex-shrink-0">•</span>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground italic">
                👉 {meal.why}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MuscleDietPlan() {
  return (
    <div className="space-y-4">
      {/* Core Principles */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 p-4">
        <h3 className="font-bold text-emerald-800 mb-3 flex items-center gap-2 text-sm">
          <span className="text-base">⚙️</span> Core Principles
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {[
            {
              icon: "🔥",
              text: "Calorie surplus: eat ~300–500 kcal extra daily",
            },
            {
              icon: "💪",
              text: "Protein: 1.6–2.2g per kg body weight (~100–140g/day)",
            },
            { icon: "⏰", text: "Eat every 3–4 hours to fuel muscle growth" },
            {
              icon: "🥗",
              text: "Focus on whole foods — avoid junk/ultra-processed",
            },
          ].map((p) => (
            <div
              key={p.text}
              className="flex items-start gap-2.5 bg-white/70 rounded-xl p-2.5 border border-emerald-100"
            >
              <span className="text-base flex-shrink-0 mt-0.5">{p.icon}</span>
              <p className="text-xs text-emerald-900 font-medium leading-snug">
                {p.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Meal Timeline */}
      <div>
        <h3 className="font-bold text-foreground text-sm mb-3 flex items-center gap-2">
          <span className="text-base">🥗</span> Daily Diet Structure
        </h3>
        <MealTimeline meals={MUSCLE_MEALS} />
      </div>

      {/* Bulking Shake */}
      <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl border border-blue-200 p-4">
        <h3 className="font-bold text-blue-900 mb-1 text-sm flex items-center gap-2">
          <span className="text-base">🥤</span> High-Calorie Bulking Shake
        </h3>
        <p className="text-xs text-blue-700 mb-3">
          Drink once daily — Easy + 400–700 calories
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[
            "Milk (300 ml)",
            "1 banana",
            "2 tbsp peanut butter",
            "Oats (30g)",
            "Honey",
          ].map((ing) => (
            <div
              key={ing}
              className="flex items-center gap-2 bg-white/70 rounded-lg px-2.5 py-2 border border-blue-100"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
              <span className="text-xs text-blue-900 font-medium">{ing}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Avoid These */}
      <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl border border-red-200 p-4">
        <h3 className="font-bold text-red-800 mb-3 text-sm flex items-center gap-2">
          <span className="text-base">🚫</span> Avoid These
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            "Sugary drinks & sodas",
            "Packaged snacks (chips, biscuits)",
            "Deep fried foods daily",
            "Excess bakery items",
          ].map((item) => (
            <div
              key={item}
              className="flex items-start gap-2 bg-white/70 rounded-lg p-2.5 border border-red-100"
            >
              <span className="text-red-500 flex-shrink-0 mt-0.5">✗</span>
              <span className="text-xs text-red-900 font-medium leading-snug">
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Extra Tips */}
      <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl border border-violet-200 p-4">
        <h3 className="font-bold text-violet-800 mb-3 text-sm flex items-center gap-2">
          <span className="text-base">🧠</span> Extra Optimization Tips
        </h3>
        <div className="space-y-2">
          {[
            { icon: "🏋️", tip: "Train 4–5 days/week (progressive overload)" },
            { icon: "😴", tip: "Sleep 7–8 hours for maximum muscle recovery" },
            { icon: "💧", tip: "Drink enough water throughout the day" },
            { icon: "⚖️", tip: "Track weight weekly (aim: +0.5 kg/week)" },
          ].map((t) => (
            <div
              key={t.tip}
              className="flex items-center gap-2.5 bg-white/70 rounded-lg px-2.5 py-2 border border-violet-100"
            >
              <span className="text-base flex-shrink-0">{t.icon}</span>
              <span className="text-xs text-violet-900">{t.tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reality Check */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-300 p-4">
        <h3 className="font-bold text-amber-900 mb-2 text-sm flex items-center gap-2">
          <span className="text-base">⚡</span> Reality Check
        </h3>
        <div className="space-y-1.5">
          <p className="text-xs text-amber-800">
            ⚠️ Gaining 10 kg in 2–3 months is <strong>aggressive</strong>
          </p>
          <p className="text-xs text-amber-800">
            ✅ Realistic lean gain: <strong>4–6 kg in 3 months</strong>
          </p>
          <p className="text-xs text-amber-800">
            📈 Faster gains = more fat stored alongside muscle
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Vegetarian Muscle Gain Diet Plan ────────────────────────────────────────

const VEG_MEALS = [
  {
    time: "🌅 Morning",
    slot: "6–8 AM",
    items: ["50–100g oats + milk", "1 banana", "10 almonds or peanuts"],
    why: "Add 1 tbsp peanut butter if you need more calories",
    color: "from-amber-50 to-yellow-50 border-amber-200",
    dot: "bg-amber-400",
  },
  {
    time: "🕙 Mid-Morning Snack",
    slot: "~10 AM",
    items: ["1 fruit (banana/apple)", "Handful roasted peanuts / chana"],
    why: "Cheap + protein + calories",
    color: "from-orange-50 to-amber-50 border-orange-200",
    dot: "bg-orange-400",
  },
  {
    time: "🍛 Lunch",
    slot: "1–2 PM",
    items: [
      "Rice (Kerala red rice preferred)",
      "1–2 cups dal (very important)",
      "Vegetable curry + thoran",
      "Curd (for protein + digestion)",
    ],
    why: "Dal + rice = better protein quality (complete amino acids)",
    color: "from-emerald-50 to-green-50 border-emerald-200",
    dot: "bg-emerald-500",
  },
  {
    time: "☕ Evening Snack",
    slot: "4–5 PM (Pre-workout)",
    items: [
      "Peanut butter bread",
      "OR Banana + handful peanuts",
      "OR Sprouts salad (green gram)",
    ],
    why: "Pre-workout fuel — pick what's available",
    color: "from-sky-50 to-blue-50 border-sky-200",
    dot: "bg-sky-500",
  },
  {
    time: "🏋️ Post-Workout",
    slot: "After gym",
    items: ["Milk (250–300 ml)", "1 banana"],
    why: "Quick recovery carbs + protein",
    color: "from-violet-50 to-purple-50 border-violet-200",
    dot: "bg-violet-500",
  },
  {
    time: "🌙 Dinner",
    slot: "8–9 PM",
    items: [
      "2–4 chapati",
      "Paneer curry / soya chunks curry / dal",
      "Vegetables",
    ],
    why: "Paneer & soya = your main protein weapons",
    color: "from-indigo-50 to-blue-50 border-indigo-200",
    dot: "bg-indigo-500",
  },
  {
    time: "🌌 Before Bed",
    slot: "~10 PM",
    items: ["1 glass milk", "OR handful of nuts"],
    why: "Slow protein release — prevents muscle breakdown",
    color: "from-slate-50 to-gray-50 border-slate-200",
    dot: "bg-slate-500",
  },
];

function VegetarianMuscleDietPlan() {
  return (
    <div className="space-y-4">
      {/* Targets */}
      <div className="grid grid-cols-3 gap-2">
        {[
          {
            label: "Calories",
            value: "2500–3000",
            unit: "kcal/day",
            color: "bg-emerald-50 border-emerald-200 text-emerald-800",
          },
          {
            label: "Protein",
            value: "90–120g",
            unit: "minimum/day",
            color: "bg-blue-50 border-blue-200 text-blue-800",
          },
          {
            label: "Meals",
            value: "5–6",
            unit: "per day",
            color: "bg-violet-50 border-violet-200 text-violet-800",
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`rounded-xl border p-2.5 text-center ${s.color}`}
          >
            <p className="text-xs font-semibold opacity-70 mb-0.5">{s.label}</p>
            <p className="text-sm font-extrabold leading-tight">{s.value}</p>
            <p className="text-xs opacity-60 mt-0.5">{s.unit}</p>
          </div>
        ))}
      </div>

      {/* Meal Timeline */}
      <div>
        <h3 className="font-bold text-foreground text-sm mb-3 flex items-center gap-2">
          <span className="text-base">🌿</span> Daily Diet Structure
        </h3>
        <MealTimeline meals={VEG_MEALS} />
      </div>

      {/* Veg Bulking Shake */}
      <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl border border-blue-200 p-4">
        <h3 className="font-bold text-blue-900 mb-1 text-sm flex items-center gap-2">
          <span className="text-base">🥤</span> High-Calorie Veg Bulking Shake
        </h3>
        <p className="text-xs text-blue-700 mb-3">
          ~500–800 kcal bomb — drink once daily
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[
            "Milk (300ml)",
            "Banana",
            "Peanut butter (2 tbsp)",
            "Oats (30–50g)",
            "Honey",
          ].map((ing) => (
            <div
              key={ing}
              className="flex items-center gap-2 bg-white/70 rounded-lg px-2.5 py-2 border border-blue-100"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
              <span className="text-xs text-blue-900 font-medium">{ing}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Best Veg Protein Sources */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 p-4">
        <h3 className="font-bold text-emerald-800 mb-1 text-sm flex items-center gap-2">
          <span className="text-base">💪</span> Best Vegetarian Protein Sources
        </h3>
        <p className="text-xs text-emerald-600 mb-3">
          Use daily — combine sources for complete amino acids
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { name: "Soya Chunks", note: "~52g protein/100g" },
            { name: "Paneer", note: "~18g protein/100g" },
            { name: "Milk & Curd", note: "~3–5g per serving" },
            { name: "Dal (all types)", note: "~9g protein/100g" },
            { name: "Chickpeas (Kadala)", note: "~19g protein/100g" },
            { name: "Green Gram (Moong)", note: "~24g protein/100g" },
            { name: "Peanuts", note: "~26g protein/100g" },
          ].map((src) => (
            <div
              key={src.name}
              className="bg-white/70 rounded-xl p-2.5 border border-emerald-100"
            >
              <p className="text-xs font-semibold text-emerald-900">
                {src.name}
              </p>
              <p className="text-xs text-emerald-600">{src.note}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-emerald-700 mt-3 bg-white/60 rounded-lg p-2 border border-emerald-100">
          💡 <strong>Tip:</strong> Combine different sources → better amino acid
          profile
        </p>
      </div>

      {/* Common Mistakes */}
      <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl border border-red-200 p-4">
        <h3 className="font-bold text-red-800 mb-3 text-sm flex items-center gap-2">
          <span className="text-base">⚠️</span> Common Mistakes
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {[
            "Only eating rice + curry (low protein)",
            "Skipping protein-rich foods like soya/paneer",
            "Not eating enough total calories",
            "Relying on junk food for weight gain",
          ].map((item) => (
            <div
              key={item}
              className="flex items-start gap-2 bg-white/70 rounded-lg p-2.5 border border-red-100"
            >
              <span className="text-red-500 flex-shrink-0 mt-0.5">✗</span>
              <span className="text-xs text-red-900 font-medium leading-snug">
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Reality Check */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-300 p-4">
        <h3 className="font-bold text-amber-900 mb-2 text-sm flex items-center gap-2">
          <span className="text-base">⚡</span> Reality Check
        </h3>
        <div className="space-y-1.5">
          <p className="text-xs text-amber-800">
            🌿 Vegetarian muscle gain is slightly slower if protein isn't
            optimized
          </p>
          <p className="text-xs text-amber-800">
            💡 Struggling to hit protein targets? Consider{" "}
            <strong>whey protein</strong> (veg-friendly supplement)
          </p>
          <p className="text-xs text-amber-800">
            ✅ With good planning: <strong>4–5 kg lean gain in 3 months</strong>{" "}
            is achievable
          </p>
        </div>
      </div>

      {/* Smart Upgrade */}
      <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl border border-indigo-200 p-4">
        <h3 className="font-bold text-indigo-800 mb-3 text-sm flex items-center gap-2">
          <span className="text-base">🚀</span> Smart Upgrade (if budget allows)
        </h3>
        <div className="space-y-2">
          {[
            {
              icon: "🥛",
              name: "Whey Protein Isolate",
              desc: "1 scoop/day — easiest way to hit protein target",
            },
            {
              icon: "⚗️",
              name: "Creatine Monohydrate",
              desc: "3–5g/day — proven muscle strength booster",
            },
          ].map((sup) => (
            <div
              key={sup.name}
              className="flex items-start gap-3 bg-white/70 rounded-xl p-3 border border-indigo-100"
            >
              <span className="text-xl flex-shrink-0">{sup.icon}</span>
              <div>
                <p className="text-xs font-bold text-indigo-900">{sup.name}</p>
                <p className="text-xs text-indigo-600 mt-0.5">{sup.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function WeightGainStatusPage({
  onBack,
  userProfile,
  onHome,
  onEat,
  onThink,
  onMove,
  onHistory,
  onLeaderboard,
}: Props) {
  const [logs, setLogs] = useState<GainLog[]>(loadLogs);
  const [currentWeight, setCurrentWeight] = useState(
    String(userProfile?.weightKg ?? ""),
  );
  const [targetWeight, setTargetWeight] = useState("");
  const [meals, setMeals] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [sleepHours, setSleepHours] = useState("8");
  const [waterGlasses, setWaterGlasses] = useState("8");
  const [activeDietPlan, setActiveDietPlan] = useState("muscle");

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

  const DIET_TABS = [
    { id: "muscle", label: "💪 Muscle Gain" },
    { id: "veg", label: "🥦 Vegetarian" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-success px-4 py-4 flex items-center gap-3">
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
          className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-success/30 p-5"
          data-ocid="weight_gain.smart_plan.card"
        >
          <h2 className="font-bold status-healthy mb-3 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-status-healthy flex items-center justify-center text-success">
              <Zap size={14} />
            </span>
            Today's Smart Plan
          </h2>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-white/70 rounded-xl p-3 border border-success/20">
              <p className="text-xs text-success font-semibold uppercase tracking-wide">
                Calorie Target
              </p>
              <p className="text-2xl font-extrabold status-healthy">
                {dailyCalorieGoal}
              </p>
              <p className="text-xs text-success">kcal/day (BMR + 500)</p>
            </div>
            <div className="bg-white/70 rounded-xl p-3 border border-success/20">
              <p className="text-xs text-success font-semibold uppercase tracking-wide">
                Top 3 Foods Today
              </p>
              <p className="text-sm font-bold status-healthy leading-snug mt-1">
                Brown Rice · Chicken Breast · Whole Milk
              </p>
            </div>
          </div>
          <div className="bg-status-healthy/60 rounded-xl px-3 py-2 text-sm status-healthy font-medium">
            {logs.length > 0
              ? `🔥 You've logged ${logs.length} day${logs.length !== 1 ? "s" : ""}. Keep it up!`
              : "📝 Start logging to track your progress"}
          </div>
        </div>

        {/* Current Stats */}
        <div className="bg-card rounded-2xl border border-border shadow-card p-5">
          <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-status-healthy flex items-center justify-center text-success text-sm">
              📊
            </span>
            Current Stats
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-status-healthy rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">
                Current Weight
              </p>
              <p className="text-xl font-extrabold text-success">
                {userProfile?.weightKg ?? "—"}
                <span className="text-xs font-normal ml-0.5">kg</span>
              </p>
            </div>
            <div className="bg-status-healthy rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">BMR</p>
              <p className="text-xl font-extrabold text-success">
                {bmr}
                <span className="text-xs font-normal ml-0.5">kcal</span>
              </p>
            </div>
            <div className="bg-status-healthy rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Daily Goal</p>
              <p className="text-xl font-extrabold text-success">
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
            <div className="bg-status-healthy rounded-xl p-3 flex flex-col justify-center">
              <p className="text-xs text-muted-foreground">To Gain</p>
              <p className="text-sm font-bold text-success">
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
            <span className="w-7 h-7 rounded-lg bg-status-healthy flex items-center justify-center text-success text-sm">
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
                placeholder="e.g. Oats + milk for breakfast, rice + dal + paneer for lunch..."
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
              className="w-full bg-success hover:bg-success/90 text-white"
            >
              💪 Save Today's Progress
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
                  icon: "🏋️",
                  name: "Light Dumbbell Training",
                  desc: "3 sets × 12 reps, focus on form",
                },
                {
                  icon: "🤸",
                  name: "Bodyweight Exercises",
                  desc: "Push-ups, pull-ups, squats",
                },
                {
                  icon: "⚽",
                  name: "Sports & Games",
                  desc: "Football, basketball, badminton",
                },
                {
                  icon: "🏊",
                  name: "Swimming",
                  desc: "Full body workout, 3×/week",
                },
              ],
              tip: "60 min/day of mixed activity. Avoid heavy lifts — focus on growth and fun!",
            },
            youngAdult: {
              title: "Young Adult Training",
              emoji: "💪",
              color: "bg-success",
              lightColor: "bg-status-healthy border-success/20",
              exercises: [
                {
                  icon: "🏋️",
                  name: "Compound Lifts",
                  desc: "Squats, deadlifts, bench press",
                },
                {
                  icon: "⚡",
                  name: "HIIT Sessions",
                  desc: "20–30 min, 3×/week",
                },
                {
                  icon: "🏃",
                  name: "Running / Sprints",
                  desc: "5km runs or interval sprints",
                },
                {
                  icon: "💪",
                  name: "Progressive Overload",
                  desc: "Add weight every 2 weeks",
                },
              ],
              tip: "45–60 min strength + cardio. This is your peak muscle-building window!",
            },
            middleAge: {
              title: "Middle Age Fitness",
              emoji: "🧘",
              color: "bg-accent",
              lightColor: "bg-status-warning border-warning/20",
              exercises: [
                {
                  icon: "🏋️",
                  name: "Moderate Weight Training",
                  desc: "3 sets × 10 reps, controlled pace",
                },
                {
                  icon: "🚴",
                  name: "Cycling",
                  desc: "30–45 min, low-impact cardio",
                },
                {
                  icon: "🧘",
                  name: "Yoga & Mobility",
                  desc: "Flexibility and joint health",
                },
                {
                  icon: "🏊",
                  name: "Swimming",
                  desc: "Easy on joints, full body",
                },
              ],
              tip: "30–45 min moderate exercise. Prioritise recovery and joint health.",
            },
            senior: {
              title: "Senior Wellness Exercise",
              emoji: "🌟",
              color: "bg-teal-600",
              lightColor: "bg-teal-50 border-teal-100",
              exercises: [
                {
                  icon: "🚶",
                  name: "Brisk Walking",
                  desc: "30 min daily walk, gentle pace",
                },
                {
                  icon: "🪑",
                  name: "Chair Exercises",
                  desc: "Seated strength and mobility",
                },
                {
                  icon: "🧘",
                  name: "Gentle Yoga",
                  desc: "Balance, flexibility, breathing",
                },
                {
                  icon: "🏊",
                  name: "Water Aerobics",
                  desc: "Low-impact pool exercises",
                },
              ],
              tip: "30 min light activity. Focus on balance, flexibility and bone strength.",
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
              <span className="w-7 h-7 rounded-lg bg-status-healthy flex items-center justify-center text-success text-sm">
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
                      <span className="text-sm font-bold text-success">
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
            <span className="w-7 h-7 rounded-lg bg-status-healthy flex items-center justify-center text-success text-sm">
              🥗
            </span>
            Best Foods for Weight Gain
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {GAIN_FOODS.map((f) => (
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

        {/* ─── Diet Plans Section ─────────────────────────────────────────── */}
        <div
          className="bg-card rounded-2xl border border-border shadow-card p-5"
          data-ocid="weight_gain.diet_plans.card"
        >
          <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white text-sm">
              🍽️
            </span>
            Diet Plans
          </h2>

          {/* Plan tab switcher */}
          <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
            {DIET_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                data-ocid="weight_gain.diet_plans.tab"
                onClick={() => setActiveDietPlan(tab.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                  activeDietPlan === tab.id
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-muted text-muted-foreground border-border hover:border-primary"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeDietPlan === "muscle" && (
            <div>
              <div className="mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-4 text-white">
                <h3 className="font-extrabold text-base mb-0.5">
                  Muscle Gain Diet Plan
                </h3>
                <p className="text-xs text-emerald-100">
                  Science-backed nutrition for lean muscle growth
                </p>
              </div>
              <MuscleDietPlan />
            </div>
          )}

          {activeDietPlan === "veg" && (
            <div>
              <div className="mb-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-4 text-white">
                <h3 className="font-extrabold text-base mb-0.5">
                  🥦 Vegetarian Muscle Gain Diet Plan
                </h3>
                <p className="text-xs text-green-100">
                  Plant-powered nutrition for building lean muscle
                </p>
              </div>
              <VegetarianMuscleDietPlan />
            </div>
          )}
        </div>

        {/* Success Habits Checklist */}
        <SuccessHabitsChecklist goalType="gain" />
        <CalorieSwapCard goalType="gain" />

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
