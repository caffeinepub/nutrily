import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import type { DailyCheckIn } from "../backend";
import { FOOD_DATABASE } from "../data/foodDatabase";
import { useActor } from "../hooks/useActor";
import {
  useCallerUserProfile,
  useGetAllFoodItems,
  useTodayFoodLogs,
  useTodayHealthMetrics,
  useTodayWaterIntake,
} from "../hooks/useQueries";
import { calcEntryNutrition, calcMealQualityScore } from "../types";
import type { ExtendedFoodItem, FoodItem } from "../types";
import DailyCheckInCard from "./DailyCheckInCard";
import Footer from "./Footer";
import GoalsSection from "./GoalsSection";
import MyStatsCard from "./MyStatsCard";
import Navbar from "./Navbar";
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
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [metricsOpen, setMetricsOpen] = useState(false);
  const [preselectedMeal, setPreselectedMeal] = useState<string | undefined>();
  const [goalPage, setGoalPage] = useState<"gain" | "loss" | null>(null);

  const { data: backendFoods = [] } = useGetAllFoodItems();
  const { data: foodEntries = [] } = useTodayFoodLogs();
  const { data: waterGlasses = 0 } = useTodayWaterIntake();
  const { data: healthMetrics } = useTodayHealthMetrics();
  const { data: userProfile } = useCallerUserProfile();

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
    return [
      ...backendFoods,
      ...(FOOD_DATABASE as ExtendedFoodItem[]).filter(
        (f) => !backendNames.has(f.name),
      ),
    ] as ExtendedFoodItem[];
  }, [backendFoods]);

  const foodMap = useMemo(
    () => new Map(allFoods.map((f) => [f.name, f])),
    [allFoods],
  );

  const totals = useMemo(() => {
    return foodEntries.reduce(
      (acc, entry) => {
        const n = calcEntryNutrition(entry, foodMap);
        return {
          calories: acc.calories + n.calories,
          protein: acc.protein + n.protein,
          carbs: acc.carbs + n.carbs,
          fat: acc.fat + n.fat,
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );
  }, [foodEntries, foodMap]);

  const { score, grade } = calcMealQualityScore(
    totals.calories,
    totals.protein,
    totals.carbs,
    totals.fat,
  );

  const recentEntry = foodEntries[foodEntries.length - 1];

  const openLogFood = (mealType?: string) => {
    setPreselectedMeal(mealType);
    setLogFoodOpen(true);
  };

  const userProfileForStatus = userProfile
    ? {
        weightKg: Number(userProfile.weightKg),
        heightCm: Number(userProfile.heightCm),
        name: userProfile.name,
      }
    : undefined;

  // Render goal-specific status pages
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

  const greeting = getGreeting();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar userName={userName} onLogFood={() => openLogFood()} />

      {/* Hero */}
      <section className="hero-gradient py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-extrabold text-white mb-3"
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

      {/* Dashboard grid */}
      <main className="max-w-7xl mx-auto w-full px-4 md:px-6 py-8 flex-1">
        {/* My Stats — full width at top */}
        {userProfile && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6"
          >
            <MyStatsCard profile={userProfile} />
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Column 1 */}
          <div className="space-y-5">
            <CalorieTrackerCard calories={totals.calories} />
            <MacroBreakdownCard
              protein={totals.protein}
              carbs={totals.carbs}
              fat={totals.fat}
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
          </div>

          {/* Column 2 */}
          <div className="space-y-5">
            <FoodLogCard
              entries={foodEntries}
              foodMap={foodMap}
              onAddFood={openLogFood}
            />
            <WaterIntakeCard glasses={waterGlasses} />
          </div>

          {/* Column 3 */}
          <div className="space-y-5">
            <MealQualityCard score={score} grade={grade} />
            <SmartCoachCard
              caloriesConsumed={totals.calories}
              protein={totals.protein}
              carbs={totals.carbs}
              fat={totals.fat}
              userProfile={userProfileForStatus}
              allFoods={allFoods}
            />
            <MyMetricsCard
              metrics={healthMetrics}
              onEdit={() => setMetricsOpen(true)}
            />
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

        {/* Daily Check-In */}
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

        {/* Goals Section */}
        <GoalsSection onNavigateToStatus={setGoalPage} />
      </main>

      <Footer />

      <LogFoodModal
        open={logFoodOpen}
        onClose={() => setLogFoodOpen(false)}
        allFoods={allFoods}
        preselectedFoodName={preselectedMeal}
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
