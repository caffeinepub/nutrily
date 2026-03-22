import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Flame,
  Info,
  Lightbulb,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import {
  getAgeGroup,
  getAgeGroupLabel,
  getUserAge,
} from "../../utils/ageUtils";

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

interface FoodLog {
  date: string;
  calories: number;
  items: unknown[];
}

const AGE_GROUP_ADVICE = {
  teen: {
    emoji: "🧒",
    badge: "bg-pink-100 text-pink-700 border-pink-200",
    title: "Teen Nutrition",
    tips: [
      {
        icon: "🦴",
        text: "Focus on calcium, iron & protein for growth — milk, eggs, leafy greens daily.",
      },
      {
        icon: "🚫",
        text: "Avoid crash diets — your body needs all nutrients for healthy development.",
      },
      {
        icon: "⚡",
        text: "Exercise: 60 min/day of mixed cardio + light strength training + sports.",
      },
      {
        icon: "🍌",
        text: "Best foods: milk, eggs, leafy greens, whole grains, banana, fish.",
      },
    ],
  },
  youngAdult: {
    emoji: "💪",
    badge: "bg-violet-100 text-violet-700 border-violet-200",
    title: "Young Adult Plan",
    tips: [
      {
        icon: "🥩",
        text: "Build muscle with high protein (1.8g/kg) — chicken breast, eggs, paneer.",
      },
      {
        icon: "🌾",
        text: "Complex carbs fuel energy: brown rice, oats, whole wheat rotis.",
      },
      {
        icon: "🏋️",
        text: "Exercise: 45–60 min strength training + HIIT 4–5 times/week.",
      },
      {
        icon: "🥦",
        text: "Best foods: chicken breast, brown rice, oats, broccoli, nuts.",
      },
    ],
  },
  middleAge: {
    emoji: "🧘",
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    title: "Middle Age Focus",
    tips: [
      {
        icon: "🔥",
        text: "Manage metabolism slowdown with more fiber, lean protein & antioxidants.",
      },
      {
        icon: "🐟",
        text: "Anti-inflammatory foods: salmon, berries, olive oil, spinach, turmeric.",
      },
      {
        icon: "🧘",
        text: "Exercise: 30–45 min moderate cardio + yoga + resistance bands.",
      },
      {
        icon: "🫐",
        text: "Best foods: salmon, quinoa, berries, olive oil, spinach, seeds.",
      },
    ],
  },
  senior: {
    emoji: "🌟",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    title: "Senior Wellness",
    tips: [
      {
        icon: "🦷",
        text: "Bone health: calcium + vitamin D from curd, milk, sunlight, soft fish.",
      },
      {
        icon: "🍲",
        text: "Choose soft, easily digestible foods: dal, soft rice, steamed veggies, soups.",
      },
      {
        icon: "🚶",
        text: "Exercise: 30 min light walking + gentle yoga + stretching daily.",
      },
      {
        icon: "💧",
        text: "Stay hydrated — thirst sensation decreases with age. Drink regularly.",
      },
    ],
  },
};

const AGE_FOOD_SUGGESTIONS: Record<string, string[]> = {
  teen: ["Milk", "Eggs", "Spinach", "Whole Grain Bread", "Banana"],
  youngAdult: ["Chicken Breast", "Brown Rice", "Oats", "Broccoli", "Almonds"],
  middleAge: ["Salmon", "Quinoa", "Blueberries", "Olive Oil", "Spinach"],
  senior: ["Rice (Soft)", "Dal", "Curd", "Steamed Vegetables", "Warm Soup"],
};

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

  const userAge = getUserAge();
  const ageGroup = getAgeGroup(userAge);
  const ageGroupLabel = getAgeGroupLabel(ageGroup);
  const ageAdvice = AGE_GROUP_ADVICE[ageGroup];
  const ageFoodNames = AGE_FOOD_SUGGESTIONS[ageGroup];

  // Compute calorie target for goal adjustment (always at top level)
  const gender =
    userProfile?.gender ?? localStorage.getItem("doitepic_gender") ?? "male";
  const bmrBase = userProfile
    ? calcBMR(userProfile.weightKg, userProfile.heightCm, gender)
    : 2000;
  let calorieTargetBase = bmrBase;
  if (activeGoal === "gain") calorieTargetBase = bmrBase + 500;
  else if (activeGoal === "loss")
    calorieTargetBase = Math.max(1200, bmrBase - 500);

  // Goal Adjustment Engine — hook always at top level
  const goalAdjustment = useMemo(() => {
    try {
      const raw = localStorage.getItem("doitepic_food_logs");
      if (!raw) return null;
      const logs: FoodLog[] = JSON.parse(raw);
      if (logs.length < 5) return null;

      const last7 = logs.slice(-7);
      const avg = last7.reduce((s, l) => s + l.calories, 0) / last7.length;

      const withinTarget = last7.filter(
        (l) => Math.abs(l.calories - avg) / Math.max(avg, 1) < 0.05,
      );
      if (withinTarget.length >= 5) {
        return {
          type: "plateau" as const,
          avg: Math.round(avg),
          message:
            "Plateau Detected! Your calorie intake has been stable for 5+ days. Try increasing protein by 10g/day and adding 200 kcal from complex carbs.",
        };
      }

      const under300 = last7.filter(
        (l) => calorieTargetBase - l.calories > 300,
      );
      if (under300.length >= 5) {
        return {
          type: "under" as const,
          avg: Math.round(avg),
          message:
            "You're eating well below target. Increase by 150–200 kcal with healthy fats like nuts or avocado.",
        };
      }

      const over300 = last7.filter((l) => l.calories - calorieTargetBase > 300);
      if (over300.length >= 5) {
        return {
          type: "over" as const,
          avg: Math.round(avg),
          message:
            "Reduce portion sizes. Cut 150–200 kcal from refined carbs to get back on track.",
        };
      }
    } catch (_) {
      // ignore
    }
    return null;
  }, [calorieTargetBase]);

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

  // Blend goal-based suggestions with age-specific foods
  const goalSuggestions =
    activeGoal === "gain"
      ? allFoods.filter((f) => f.caloriesPer100g > 250).slice(0, 3)
      : allFoods
          .filter((f) => f.caloriesPer100g < 150 && (f.protein ?? 0) > 5)
          .slice(0, 3);

  const ageSuggestions = ageFoodNames
    .map((name) =>
      allFoods.find((f) => f.name.toLowerCase().includes(name.toLowerCase())),
    )
    .filter(Boolean)
    .slice(0, 3) as typeof allFoods;

  const suggestions =
    goalSuggestions.length > 0 ? goalSuggestions : ageSuggestions;

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

  const adjustmentStyles = {
    plateau: "bg-amber-50 border-amber-200 text-amber-800",
    under: "bg-blue-50 border-blue-200 text-blue-800",
    over: "bg-red-50 border-red-200 text-red-800",
  };
  const adjustmentIcons = {
    plateau: <TrendingDown className="w-4 h-4 shrink-0" />,
    under: <TrendingDown className="w-4 h-4 shrink-0" />,
    over: <TrendingUp className="w-4 h-4 shrink-0" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-card rounded-2xl border border-border shadow-card overflow-hidden"
      data-ocid="smart_coach.card"
    >
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-white" />
        <h3 className="font-bold text-white text-sm">Smart Coach</h3>
        {activeGoal && (
          <span className="text-xs text-white/70 ml-1">· {goalLabel}</span>
        )}
        <div className="ml-auto flex items-center gap-1.5">
          {goalAdjustment && (
            <Badge className="text-xs bg-amber-400/90 text-amber-900 border-amber-300">
              Smart Goal
            </Badge>
          )}
          <Badge className={`text-xs border ${ageAdvice.badge}`}>
            {ageAdvice.emoji} {ageGroupLabel}
          </Badge>
          <Badge className="text-xs bg-white/20 text-white border-white/30">
            AI
          </Badge>
        </div>
      </div>

      <div className="p-4 space-y-3">
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
          <span className="bg-rose-50 border border-rose-100 text-rose-700 rounded-full px-2.5 py-0.5 font-medium">
            🎂 Age {userAge}
          </span>
        </div>

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

        {!activeGoal && (
          <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
            💡 Select a goal (Weight Gain / Weight Loss) below for personalised
            suggestions.
          </p>
        )}

        {suggestions.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1.5">
              Suggested foods for you
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

        {/* Age-specific advice section */}
        <div
          className="border border-border rounded-xl overflow-hidden"
          data-ocid="smart_coach.age_insights"
        >
          <div
            className="px-3 py-2 flex items-center gap-1.5"
            style={{
              background:
                "linear-gradient(to right, oklch(0.65 0.18 300), oklch(0.58 0.2 260))",
            }}
          >
            <span className="text-sm">{ageAdvice.emoji}</span>
            <p className="text-xs font-bold text-white">{ageAdvice.title}</p>
            <Badge className={`ml-auto text-xs border ${ageAdvice.badge}`}>
              {ageGroupLabel}
            </Badge>
          </div>
          <div className="p-2.5 space-y-1.5 bg-card">
            {ageAdvice.tips.map((tip) => (
              <div key={tip.text} className="flex items-start gap-1.5">
                <span className="text-sm leading-none mt-0.5">{tip.icon}</span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {tip.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div
          className={`flex items-start gap-2 rounded-xl px-3 py-2 border text-xs ${macroColor}`}
          data-ocid="smart_coach.macro_insight"
        >
          <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>{macroInsight}</span>
        </div>

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

        <div
          className="flex items-start gap-2 bg-muted/40 rounded-xl px-3 py-2 border border-border"
          data-ocid="smart_coach.daily_tip"
        >
          <Lightbulb className="w-3.5 h-3.5 text-yellow-500 mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            {todayTip}
          </p>
        </div>

        {goalAdjustment && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className={`flex items-start gap-2 rounded-xl px-3 py-3 border text-xs font-medium ${adjustmentStyles[goalAdjustment.type]}`}
            data-ocid="smart_coach.goal_adjustment"
          >
            {adjustmentIcons[goalAdjustment.type]}
            <div>
              <p className="font-bold mb-0.5">
                {goalAdjustment.type === "plateau"
                  ? "📊 Goal Adjustment Suggested"
                  : goalAdjustment.type === "under"
                    ? "📉 Calorie Intake Too Low"
                    : "📈 Calorie Intake Too High"}
              </p>
              <p className="leading-relaxed">{goalAdjustment.message}</p>
              <p className="mt-1 opacity-70">
                7-day avg: {goalAdjustment.avg} kcal · Target: {calorieTarget}{" "}
                kcal
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
