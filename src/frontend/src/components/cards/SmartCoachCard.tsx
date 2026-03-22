import { Badge } from "@/components/ui/badge";
import { Brain, Flame, Info, Lightbulb, Sparkles, Target } from "lucide-react";
import { motion } from "motion/react";

interface SmartCoachCardProps {
  caloriesConsumed: number;
  protein: number;
  carbs: number;
  fat: number;
  userProfile?: {
    weightKg: number;
    heightCm: number;
    name: string;
    gender?: string;
  } | null;
  allFoods: Array<{
    name: string;
    caloriesPer100g: number;
    category?: string;
    protein?: number;
  }>;
}

const DAILY_TIPS = [
  "💧 Drink water before each meal — it reduces overeating by up to 30%.",
  "🌅 Eat your largest meal earlier in the day for better metabolism.",
  "🥦 Fill half your plate with vegetables at every meal.",
  "😴 Poor sleep increases hunger hormones — aim for 7–8 hours.",
  "🚶 A 10-minute walk after meals improves blood sugar and digestion.",
  "🍽️ Eat slowly — it takes 20 minutes for your brain to register fullness.",
  "🌾 Swap refined carbs for whole grains to stay full longer.",
];

function calcBMR(weight: number, height: number, gender: string): number {
  const age = 30;
  if (gender === "female") {
    return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
  }
  // male (default)
  return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
}

function calcProteinTarget(weight: number, gender: string): number {
  return Math.round(weight * (gender === "female" ? 1.6 : 1.8));
}

function calcFatRange(
  calories: number,
  gender: string,
): { min: number; max: number } {
  const minPct = gender === "female" ? 0.28 : 0.25;
  const maxPct = gender === "female" ? 0.35 : 0.3;
  return {
    min: Math.round((calories * minPct) / 9),
    max: Math.round((calories * maxPct) / 9),
  };
}

function calcBMI(weight: number, height: number): number {
  const h = height / 100;
  return weight / (h * h);
}

function getBMICategory(bmi: number): {
  label: string;
  color: string;
  badge: string;
} {
  if (bmi < 18.5)
    return {
      label: "Underweight",
      color: "text-blue-600",
      badge: "bg-blue-100 text-blue-700 border-blue-200",
    };
  if (bmi < 25)
    return {
      label: "Normal",
      color: "text-emerald-600",
      badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    };
  if (bmi < 30)
    return {
      label: "Overweight",
      color: "text-yellow-600",
      badge: "bg-yellow-100 text-yellow-700 border-yellow-200",
    };
  return {
    label: "Obese",
    color: "text-orange-600",
    badge: "bg-orange-100 text-orange-700 border-orange-200",
  };
}

export default function SmartCoachCard({
  caloriesConsumed,
  protein,
  carbs,
  fat,
  userProfile,
  allFoods,
}: SmartCoachCardProps) {
  const activeGoal = localStorage.getItem("doitepic_active_goal") as
    | "gain"
    | "loss"
    | null;
  const todayTip = DAILY_TIPS[new Date().getDay() % DAILY_TIPS.length];

  if (!userProfile) {
    return (
      <div
        className="bg-card rounded-2xl border border-border shadow-card overflow-hidden"
        data-ocid="smart_coach.card"
      >
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-white" />
          <h3 className="font-bold text-white text-sm">Smart Coach</h3>
          <Badge className="ml-auto text-xs bg-white/20 text-white border-white/30">
            AI
          </Badge>
        </div>
        <div className="p-4 text-center">
          <Brain className="w-10 h-10 text-violet-300 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Complete your profile to unlock personalised coaching.
          </p>
        </div>
      </div>
    );
  }

  const gender =
    userProfile.gender ?? localStorage.getItem("doitepic_gender") ?? "male";
  const bmr = calcBMR(userProfile.weightKg, userProfile.heightCm, gender);
  const bmi = calcBMI(userProfile.weightKg, userProfile.heightCm);
  const bmiInfo = getBMICategory(bmi);

  let calorieTarget = bmr;
  let goalLabel = "Maintenance";
  if (activeGoal === "gain") {
    calorieTarget = bmr + 500;
    goalLabel = "Weight Gain";
  } else if (activeGoal === "loss") {
    calorieTarget = Math.max(1200, bmr - 500);
    goalLabel = "Weight Loss";
  }

  const proteinTarget = calcProteinTarget(userProfile.weightKg, gender);
  const fatRange = calcFatRange(calorieTarget, gender);

  const calorieGap = calorieTarget - caloriesConsumed;
  const goalReached = calorieGap <= 0;

  // Smart food suggestions
  const suggestions =
    activeGoal === "gain"
      ? allFoods.filter((f) => f.caloriesPer100g > 250).slice(0, 3)
      : allFoods
          .filter((f) => f.caloriesPer100g < 150 && (f.protein ?? 0) > 5)
          .slice(0, 3);

  // Macro insight
  let macroInsight = "Great macro balance today! Keep it up. 🎯";
  let macroColor = "bg-emerald-50 border-emerald-100 text-emerald-700";
  if (protein < proteinTarget * 0.5) {
    macroInsight = `Protein is low — target ${proteinTarget}g/day. Add eggs, chicken or dal. 🥚`;
    macroColor = "bg-orange-50 border-orange-100 text-orange-700";
  } else if (carbs < 100) {
    macroInsight = "Carbs are low — have rice, oats or whole wheat. 🌾";
    macroColor = "bg-yellow-50 border-yellow-100 text-yellow-700";
  } else if (fat < fatRange.min) {
    macroInsight = `Healthy fats needed — target ${fatRange.min}–${fatRange.max}g/day. Try nuts, avocado or ghee. 🥜`;
    macroColor = "bg-blue-50 border-blue-100 text-blue-700";
  }

  // Gender-specific insights
  const genderInsights =
    gender === "female"
      ? [
          {
            icon: "🩸",
            text: "Include iron-rich foods: spinach, lentils, fish — vital for hormonal health.",
          },
          {
            icon: "🥑",
            text: "Healthy fats (avocado, flaxseed, olive oil) support estrogen balance.",
          },
          {
            icon: "🥦",
            text: "Cruciferous veggies (broccoli, cauliflower) help metabolise excess estrogen.",
          },
          {
            icon: "💪",
            text: "HIIT + strength training 3×/week is optimal for female metabolism.",
          },
          {
            icon: "💧",
            text: "Hydration needs increase during certain phases — aim for 2.5L/day.",
          },
        ]
      : [
          {
            icon: "🥩",
            text: `Aim for ${proteinTarget}g protein/day — higher targets support testosterone production.`,
          },
          {
            icon: "🥜",
            text: "Zinc-rich foods (eggs, meat, pumpkin seeds) support testosterone levels.",
          },
          {
            icon: "🏋️",
            text: "Compound lifts (squats, deadlifts, bench press) maximise hormonal response.",
          },
          {
            icon: "🧠",
            text: "Healthy fats from nuts and fish support hormone synthesis.",
          },
          {
            icon: "😴",
            text: "7–9 hrs sleep boosts testosterone by up to 15% — prioritise rest.",
          },
        ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-card rounded-2xl border border-border shadow-card overflow-hidden"
      data-ocid="smart_coach.card"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-white" />
        <h3 className="font-bold text-white text-sm">Smart Coach</h3>
        {activeGoal && (
          <span className="text-xs text-white/70 ml-1">· {goalLabel}</span>
        )}
        <Badge className="ml-auto text-xs bg-white/20 text-white border-white/30">
          AI
        </Badge>
      </div>

      <div className="p-4 space-y-3">
        {/* BMI + Calorie row */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">BMI</span>
            <span className={`text-sm font-bold ${bmiInfo.color}`}>
              {bmi.toFixed(1)}
            </span>
            <Badge className={`text-xs px-1.5 py-0 border ${bmiInfo.badge}`}>
              {bmiInfo.label}
            </Badge>
          </div>
          <span className="text-border">·</span>
          <div className="flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {calorieTarget} kcal target
            </span>
          </div>
        </div>

        {/* Gender-specific macro targets */}
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="bg-violet-50 border border-violet-100 text-violet-700 rounded-full px-2.5 py-0.5 font-medium">
            🥩 Protein: {proteinTarget}g
          </span>
          <span className="bg-amber-50 border border-amber-100 text-amber-700 rounded-full px-2.5 py-0.5 font-medium">
            🧈 Fat: {fatRange.min}–{fatRange.max}g
          </span>
          <span className="bg-sky-50 border border-sky-100 text-sky-700 rounded-full px-2.5 py-0.5 font-medium capitalize">
            {gender === "female" ? "👩" : "👨"} {gender}
          </span>
        </div>

        {/* Calorie gap */}
        <div
          className={[
            "flex items-center gap-2 rounded-xl px-3 py-2.5 border text-sm font-semibold",
            goalReached
              ? "bg-emerald-50 border-emerald-100 text-emerald-700"
              : "bg-orange-50 border-orange-100 text-orange-700",
          ].join(" ")}
          data-ocid="smart_coach.calorie_gap"
        >
          <Flame className="w-4 h-4 shrink-0" />
          {goalReached
            ? "🎉 Calorie goal reached today!"
            : `You need ${Math.round(calorieGap)} more kcal today`}
        </div>

        {/* No goal selected */}
        {!activeGoal && (
          <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
            💡 Select a goal (Weight Gain / Weight Loss) below for personalised
            suggestions.
          </p>
        )}

        {/* Food suggestions */}
        {suggestions.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1.5">
              Suggested foods now
            </p>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((f) => (
                <span
                  key={f.name}
                  className="inline-flex items-center gap-1 text-xs bg-violet-50 border border-violet-100 text-violet-700 rounded-full px-2.5 py-1 font-medium"
                  data-ocid="smart_coach.food_suggestion"
                >
                  {f.name.length > 18 ? `${f.name.slice(0, 18)}…` : f.name}
                  <span className="text-violet-400">
                    · {f.caloriesPer100g} kcal
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Macro insight */}
        <div
          className={`flex items-start gap-2 rounded-xl px-3 py-2 border text-xs ${macroColor}`}
          data-ocid="smart_coach.macro_insight"
        >
          <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>{macroInsight}</span>
        </div>

        {/* Gender Insights */}
        <div
          className="border border-border rounded-xl overflow-hidden"
          data-ocid="smart_coach.gender_insights"
        >
          <div className="bg-gradient-to-r from-pink-500 to-violet-500 px-3 py-2 flex items-center gap-1.5">
            <span className="text-sm">{gender === "female" ? "👩" : "👨"}</span>
            <p className="text-xs font-bold text-white">
              {gender === "female" ? "Female" : "Male"} Health Insights
            </p>
          </div>
          <div className="p-2.5 space-y-1.5 bg-card">
            {genderInsights.slice(0, 3).map((insight) => (
              <div key={insight.text} className="flex items-start gap-1.5">
                <span className="text-sm leading-none mt-0.5">
                  {insight.icon}
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {insight.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Daily tip */}
        <div
          className="flex items-start gap-2 bg-muted/40 rounded-xl px-3 py-2 border border-border"
          data-ocid="smart_coach.daily_tip"
        >
          <Lightbulb className="w-3.5 h-3.5 text-yellow-500 mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            {todayTip}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
