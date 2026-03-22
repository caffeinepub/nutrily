import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import type { DailyCheckIn } from "../backend";
import { FOOD_DATABASE } from "../data/foodDatabase";
import { KERALA_SUPPLEMENT } from "../data/keralaSupplement";
import { useActor } from "../hooks/useActor";
import { useDrinksLog } from "../hooks/useDrinksLog";
import { useFoodLog } from "../hooks/useFoodLog";
import type { FoodLogEntryLocal } from "../hooks/useFoodLog";
import {
  useCallerUserProfile,
  useGetAllFoodItems,
  useTodayHealthMetrics,
  useTodayWaterIntake,
  useUpdateStreak,
} from "../hooks/useQueries";
import { calcEntryNutrition, calcMealQualityScore } from "../types";
import type { ExtendedFoodItem } from "../types";
import DailyCheckInCard from "./DailyCheckInCard";
import DailyHealthScore from "./DailyHealthScore";
import FoodLogHistory from "./FoodLogHistory";
import Footer from "./Footer";
import GoalVisualizationCard from "./GoalVisualizationCard";
import GoalsSection from "./GoalsSection";
import HabitRemindersCard from "./HabitRemindersCard";
import MicroCoachingCard from "./MicroCoachingCard";
import MyStatsCard from "./MyStatsCard";
import Navbar from "./Navbar";
import NutritionSummaryPage from "./NutritionSummaryPage";
import OfflineBanner from "./OfflineBanner";
import PrivacySettingsModal from "./PrivacySettingsModal";
import ReviewSection from "./ReviewSection";
import SmartSuggestionsCard from "./SmartSuggestionsCard";
import StreakWidget from "./StreakWidget";
import WeeklyMissionsCard from "./WeeklyMissionsCard";
import WeightGainStatusPage from "./WeightGainStatusPage";
import WeightLossStatusPage from "./WeightLossStatusPage";
import CalorieTrackerCard from "./cards/CalorieTrackerCard";
import FoodLogCard from "./cards/FoodLogCard";
import FoodSearchCard from "./cards/FoodSearchCard";
import MacroBreakdownCard from "./cards/MacroBreakdownCard";
import MealQualityCard from "./cards/MealQualityCard";
import MyMetricsCard from "./cards/MyMetricsCard";
import SmartCoachCard from "./cards/SmartCoachCard";
import WaterIntakeCard from "./cards/WaterIntakeCard";
import FoodDetailModal from "./modals/FoodDetailModal";
import HealthMetricsModal from "./modals/HealthMetricsModal";
import LogFoodModal from "./modals/LogFoodModal";

interface DashboardProps {
  userName: string;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17 && hour < 21) return "Good evening";
  return "Hello";
}

export default function Dashboard({ userName }: DashboardProps) {
  const [logFoodOpen, setLogFoodOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState<ExtendedFoodItem | null>(
    null,
  );
  const [metricsOpen, setMetricsOpen] = useState(false);
  const [preselectedMeal, setPreselectedMeal] = useState<string | undefined>();
  const [goalPage, setGoalPage] = useState<"gain" | "loss" | null>(null);
  const [nutritionPage, setNutritionPage] = useState(false);
  const [historyPage, setHistoryPage] = useState(false);

  const { data: backendFoods = [] } = useGetAllFoodItems();
  const { data: waterGlasses = 0 } = useTodayWaterIntake();
  const { data: healthMetrics } = useTodayHealthMetrics();
  const { data: userProfile } = useCallerUserProfile();
  const { mutate: updateStreak } = useUpdateStreak();
  const { drinks, addDrink, removeDrink, totalDrinkCalories } = useDrinksLog();
  const {
    entries: rawFoodEntries,
    foodLogItems,
    addFood,
    removeFood,
  } = useFoodLog();

  const { actor, isFetching } = useActor();
  const { data: checkIns = [] } = useQuery<DailyCheckIn[]>({
    queryKey: ["myCheckIns"],
    queryFn: async () => {
      if (!actor) return [];
      return [];
    },
    enabled: !!actor && !isFetching,
  });

  const allFoods = useMemo(() => {
    const backendNames = new Set(backendFoods.map((f) => f.name));
    // Build merged set: backend > kerala supplement > main database
    const keralaNamesInBackend = new Set([...backendFoods.map((f) => f.name)]);
    const supplementFiltered = KERALA_SUPPLEMENT.filter(
      (f) => !keralaNamesInBackend.has(f.name),
    );
    const keralAndBackendNames = new Set([
      ...backendFoods.map((f) => f.name),
      ...KERALA_SUPPLEMENT.map((f) => f.name),
    ]);
    const mainFiltered = (FOOD_DATABASE as ExtendedFoodItem[]).filter(
      (f) => !keralAndBackendNames.has(f.name) && !backendNames.has(f.name),
    );
    return [
      ...backendFoods,
      ...supplementFiltered,
      ...mainFiltered,
    ] as ExtendedFoodItem[];
  }, [backendFoods]);

  const foodMap = useMemo(
    () => new Map(allFoods.map((f) => [f.name, f])),
    [allFoods],
  );

  const totals = useMemo(() => {
    const foodTotals = rawFoodEntries.reduce(
      (acc, e) => {
        const food = foodMap.get(e.foodName);
        const factor = e.quantity / 100;
        return {
          calories: acc.calories + e.calories,
          protein: acc.protein + e.protein,
          carbs: acc.carbs + e.carbs,
          fat: acc.fat + e.fat,
          fiber: acc.fiber + (food ? (food.fiber ?? 0) * factor : 0),
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
    );
    return {
      ...foodTotals,
      calories: foodTotals.calories + totalDrinkCalories,
    };
  }, [rawFoodEntries, totalDrinkCalories, foodMap]);

  const { score, grade } = calcMealQualityScore(
    totals.calories,
    totals.protein,
    totals.carbs,
    totals.fat,
  );

  const recentEntry =
    foodLogItems.length > 0
      ? foodLogItems[foodLogItems.length - 1].entry
      : undefined;

  const openLogFood = (mealType?: string) => {
    setPreselectedMeal(mealType);
    setLogFoodOpen(true);
  };

  const handleLogFood = (
    entry: Omit<FoodLogEntryLocal, "id" | "timestamp">,
  ) => {
    addFood(entry);
    const today = new Date().toISOString().split("T")[0];
    updateStreak({ dateStr: today, points: 5n });
  };

  const gender =
    (userProfile as any)?.gender ??
    localStorage.getItem("doitepic_gender") ??
    "male";

  const userProfileForStatus = userProfile
    ? {
        weightKg: Number(userProfile.weightKg),
        heightCm: Number(userProfile.heightCm),
        name: userProfile.name,
        gender,
      }
    : undefined;

  if (goalPage === "gain") {
    return (
      <WeightGainStatusPage
        onBack={() => setGoalPage(null)}
        userProfile={userProfileForStatus}
      />
    );
  }
  if (goalPage === "loss") {
    return (
      <WeightLossStatusPage
        onBack={() => setGoalPage(null)}
        userProfile={userProfileForStatus}
      />
    );
  }
  if (nutritionPage) {
    return (
      <NutritionSummaryPage
        entries={foodLogItems}
        foodMap={foodMap}
        onBack={() => setNutritionPage(false)}
        drinkEntries={drinks}
      />
    );
  }
  if (historyPage) {
    return <FoodLogHistory onBack={() => setHistoryPage(false)} />;
  }

  const greeting = getGreeting();

  // Get goal type for GoalVisualizationCard
  const userGoalType = (userProfile as any)?.goal ?? null;
  const currentWeightKg = userProfile
    ? Number(userProfile.weightKg)
    : undefined;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar
        userName={userName}
        onLogFood={() => openLogFood()}
        onHistory={() => setHistoryPage(true)}
      />
      <OfflineBanner />

      {/* Hero */}
      <section className="hero-gradient py-10 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-display font-extrabold text-white mb-3"
          >
            {greeting}, {userName}! 🌱
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl md:text-2xl text-white/80 font-light"
          >
            Track your nutrition and stay on top of your health goals today.
          </motion.p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto w-full px-4 md:px-6 py-8 flex-1">
        {/* 1. Streak Widget */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-5"
        >
          <StreakWidget />
        </motion.div>

        {/* 2. Daily Health Score */}
        <div className="mb-5">
          <DailyHealthScore
            calories={totals.calories}
            protein={totals.protein}
            fiber={totals.fiber}
            waterGlasses={waterGlasses}
          />
        </div>

        {/* 3. Micro Coaching Card */}
        <div className="mb-5">
          <MicroCoachingCard />
        </div>

        {/* 4. My Stats */}
        {userProfile && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-5"
          >
            <MyStatsCard profile={userProfile} />
          </motion.div>
        )}

        {/* 5. Calorie + Macro grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
          <CalorieTrackerCard calories={totals.calories} />
          <MacroBreakdownCard
            protein={totals.protein}
            carbs={totals.carbs}
            fat={totals.fat}
          />
        </div>

        {/* 6. Smart Suggestions */}
        <div className="mb-5">
          <SmartSuggestionsCard
            calories={totals.calories}
            protein={totals.protein}
            fiber={totals.fiber}
            waterGlasses={waterGlasses}
          />
        </div>

        {/* 7. Goal Visualization */}
        <div className="mb-5">
          <GoalVisualizationCard
            currentWeight={currentWeightKg}
            goalType={userGoalType}
            caloriesConsumed={totals.calories}
          />
        </div>

        {/* 8. Weekly Missions */}
        <div className="mb-5">
          <WeeklyMissionsCard />
        </div>

        {/* 9. Food Log */}
        <div className="mb-5">
          <FoodLogCard
            entries={foodLogItems}
            foodMap={foodMap}
            onAddFood={openLogFood}
            onRemoveEntry={removeFood}
            drinkEntries={drinks}
            onRemoveDrink={removeDrink}
          />
          <button
            type="button"
            onClick={() => setNutritionPage(true)}
            data-ocid="nutrition.open_modal_button"
            className="w-full text-xs text-primary font-medium hover:opacity-80 transition-opacity text-center py-2"
          >
            📊 View Full Nutrition Report
          </button>
        </div>

        {/* 10. Water + Recent + Habit */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
          <WaterIntakeCard glasses={waterGlasses} />
          <MealQualityCard score={score} grade={grade} />
          <HabitRemindersCard />
        </div>

        {/* 11. Smart Coach + Metrics + Food Search */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <SmartCoachCard
            caloriesConsumed={totals.calories}
            protein={totals.protein}
            carbs={totals.carbs}
            fat={totals.fat}
            userProfile={userProfileForStatus}
            allFoods={allFoods}
          />
          <div className="space-y-5">
            <MyMetricsCard
              metrics={healthMetrics}
              onEdit={() => setMetricsOpen(true)}
            />
            {recentEntry && (
              <div className="bg-card rounded-xl border border-border shadow-card p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  Recent Activity
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center text-sm">
                    🥗
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {recentEntry.foodName}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {recentEntry.mealType} · {recentEntry.quantity}g
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-primary">
                    {Math.round(
                      calcEntryNutrition(recentEntry, foodMap).calories,
                    )}{" "}
                    kcal
                  </span>
                </div>
              </div>
            )}
            <FoodSearchCard
              allFoods={allFoods}
              onFoodSelect={setSelectedFood}
              onAddToLog={(food) => {
                setSelectedFood(null);
                setPreselectedMeal(food.name);
                setLogFoodOpen(true);
              }}
            />
          </div>
        </div>

        {/* 12. Check-In */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-8"
        >
          <h2 className="text-xl font-bold text-foreground mb-4">
            Today's Check-In
          </h2>
          <div className="max-w-lg">
            <DailyCheckInCard recentCheckIns={checkIns} />
          </div>
        </motion.div>

        {/* 13-15: Goals, Reviews, Privacy */}
        <GoalsSection onNavigateToStatus={setGoalPage} />
        <ReviewSection />
      </main>

      <div className="max-w-7xl mx-auto w-full px-4 md:px-6 pb-2 flex justify-center">
        <PrivacySettingsModal />
      </div>
      <Footer />

      <LogFoodModal
        open={logFoodOpen}
        onClose={() => setLogFoodOpen(false)}
        allFoods={allFoods}
        preselectedFoodName={preselectedMeal}
        onLogDrink={addDrink}
        onLogFood={handleLogFood}
        existingEntries={rawFoodEntries}
      />
      <FoodDetailModal
        food={selectedFood}
        onClose={() => setSelectedFood(null)}
        onAddToLog={() => {
          if (selectedFood) {
            setPreselectedMeal(selectedFood.name);
            setSelectedFood(null);
            setLogFoodOpen(true);
          }
        }}
      />
      <HealthMetricsModal
        open={metricsOpen}
        onClose={() => setMetricsOpen(false)}
      />
    </div>
  );
}
