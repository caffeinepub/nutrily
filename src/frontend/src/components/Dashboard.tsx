import { useQuery } from "@tanstack/react-query";
import { Brain, Dumbbell, History, Home, Trophy } from "lucide-react";
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
import BottomNav from "./BottomNav";
import CollapsibleSection from "./CollapsibleSection";
import DailyCheckInCard from "./DailyCheckInCard";
import DailyHealthScore from "./DailyHealthScore";
import EpicChallengeCard from "./EpicChallengeCard";
import FoodLogHistory from "./FoodLogHistory";
import Footer from "./Footer";
import GoalVisualizationCard from "./GoalVisualizationCard";
import GoalsSection from "./GoalsSection";
import HabitRemindersCard from "./HabitRemindersCard";
import Leaderboard from "./Leaderboard";
import MicroCoachingCard from "./MicroCoachingCard";
import MoodTrackerCard from "./MoodTrackerCard";
import MyStatsCard from "./MyStatsCard";
import Navbar from "./Navbar";
import NutritionSummaryPage from "./NutritionSummaryPage";
import OfflineBanner from "./OfflineBanner";
import PrivacySettingsModal from "./PrivacySettingsModal";
import ReviewSection from "./ReviewSection";
import SmartSuggestionsCard from "./SmartSuggestionsCard";
import StreakWidget from "./StreakWidget";
import ThinkEpicPage from "./ThinkEpicPage";
import WeeklyMissionsCard from "./WeeklyMissionsCard";
import WeightGainStatusPage from "./WeightGainStatusPage";
import WeightLossStatusPage from "./WeightLossStatusPage";
import WorkoutPage from "./WorkoutPage";
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
  const [thinkEpicPage, setThinkEpicPage] = useState(false);
  const [workoutPage, setWorkoutPage] = useState(false);
  const [leaderboardPage, setLeaderboardPage] = useState(false);
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
        onHome={() => setGoalPage(null)}
        onEat={() => {
          setGoalPage(null);
          openLogFood();
        }}
        onThink={() => {
          setGoalPage(null);
          setThinkEpicPage(true);
        }}
        onMove={() => {
          setGoalPage(null);
          setWorkoutPage(true);
        }}
        onHistory={() => {
          setGoalPage(null);
          setHistoryPage(true);
        }}
        onLeaderboard={() => {
          setGoalPage(null);
          setLeaderboardPage(true);
        }}
      />
    );
  }
  if (goalPage === "loss") {
    return (
      <WeightLossStatusPage
        onBack={() => setGoalPage(null)}
        userProfile={userProfileForStatus}
        onHome={() => setGoalPage(null)}
        onEat={() => {
          setGoalPage(null);
          openLogFood();
        }}
        onThink={() => {
          setGoalPage(null);
          setThinkEpicPage(true);
        }}
        onMove={() => {
          setGoalPage(null);
          setWorkoutPage(true);
        }}
        onHistory={() => {
          setGoalPage(null);
          setHistoryPage(true);
        }}
        onLeaderboard={() => {
          setGoalPage(null);
          setLeaderboardPage(true);
        }}
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
        onHome={() => setNutritionPage(false)}
        onEat={() => {
          setNutritionPage(false);
          openLogFood();
        }}
        onThink={() => {
          setNutritionPage(false);
          setThinkEpicPage(true);
        }}
        onMove={() => {
          setNutritionPage(false);
          setWorkoutPage(true);
        }}
        onHistory={() => {
          setNutritionPage(false);
          setHistoryPage(true);
        }}
        onLeaderboard={() => {
          setNutritionPage(false);
          setLeaderboardPage(true);
        }}
      />
    );
  }
  if (historyPage) {
    return (
      <FoodLogHistory
        onBack={() => setHistoryPage(false)}
        onHome={() => setHistoryPage(false)}
        onEat={() => {
          setHistoryPage(false);
          openLogFood();
        }}
        onThink={() => {
          setHistoryPage(false);
          setThinkEpicPage(true);
        }}
        onMove={() => {
          setHistoryPage(false);
          setWorkoutPage(true);
        }}
        onHistory={() => {}}
        onLeaderboard={() => {
          setHistoryPage(false);
          setLeaderboardPage(true);
        }}
      />
    );
  }
  if (workoutPage) {
    return (
      <WorkoutPage
        onBack={() => setWorkoutPage(false)}
        onHome={() => setWorkoutPage(false)}
        onEat={() => {
          setWorkoutPage(false);
          openLogFood();
        }}
        onThink={() => {
          setWorkoutPage(false);
          setThinkEpicPage(true);
        }}
        onMove={() => {}}
        onHistory={() => {
          setWorkoutPage(false);
          setHistoryPage(true);
        }}
        onLeaderboard={() => {
          setWorkoutPage(false);
          setLeaderboardPage(true);
        }}
      />
    );
  }
  if (thinkEpicPage) {
    return (
      <ThinkEpicPage
        onBack={() => setThinkEpicPage(false)}
        onHome={() => setThinkEpicPage(false)}
        onEat={() => {
          setThinkEpicPage(false);
          openLogFood();
        }}
        onThink={() => {}}
        onMove={() => {
          setThinkEpicPage(false);
          setWorkoutPage(true);
        }}
        onHistory={() => {
          setThinkEpicPage(false);
          setHistoryPage(true);
        }}
        onLeaderboard={() => {
          setThinkEpicPage(false);
          setLeaderboardPage(true);
        }}
      />
    );
  }
  if (leaderboardPage) {
    return (
      <Leaderboard
        onBack={() => setLeaderboardPage(false)}
        currentUserName={userName}
        onHome={() => setLeaderboardPage(false)}
        onEat={() => {
          setLeaderboardPage(false);
          openLogFood();
        }}
        onThink={() => {
          setLeaderboardPage(false);
          setThinkEpicPage(true);
        }}
        onMove={() => {
          setLeaderboardPage(false);
          setWorkoutPage(true);
        }}
        onHistory={() => {
          setLeaderboardPage(false);
          setHistoryPage(true);
        }}
        onLeaderboard={() => {}}
      />
    );
  }

  const greeting = getGreeting();
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
        onThinkEpic={() => setThinkEpicPage(true)}
        onMoveEpic={() => setWorkoutPage(true)}
        onLeaderboard={() => setLeaderboardPage(true)}
      />
      <OfflineBanner />

      {/* Hero */}
      <section className="hero-gradient py-6 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-display font-extrabold text-white mb-2"
          >
            {greeting}, {userName}! 🌱
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-base md:text-lg text-white/80 font-light"
          >
            Track your nutrition and stay on top of your health goals today.
          </motion.p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto w-full px-4 md:px-6 py-4 flex-1 pb-24">
        {/* Always visible: Streak */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-3"
        >
          <StreakWidget />
        </motion.div>

        {/* Always visible: Daily Health Score */}
        <div className="mb-3">
          <DailyHealthScore
            calories={totals.calories}
            protein={totals.protein}
            fiber={totals.fiber}
            waterGlasses={waterGlasses}
          />
        </div>

        {/* Always visible: My Stats */}
        {userProfile && (
          <div className="mb-3">
            <MyStatsCard profile={userProfile} />
          </div>
        )}

        {/* Always visible: Calorie + Macro grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <CalorieTrackerCard calories={totals.calories} />
          <MacroBreakdownCard
            protein={totals.protein}
            carbs={totals.carbs}
            fat={totals.fat}
          />
        </div>

        {/* Always visible: Food Log */}
        <div className="mb-3">
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

        {/* Compact 3-column nav grid */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <button
            type="button"
            data-ocid="thinkepic.open_modal_button"
            onClick={() => setThinkEpicPage(true)}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] text-white shadow-sm hover:shadow-md hover:opacity-95 transition-all"
          >
            <span className="text-xl">🧠</span>
            <span className="text-xs font-semibold">ThinkEpic</span>
          </button>
          <button
            type="button"
            data-ocid="moveepic.open_modal_button"
            onClick={() => setWorkoutPage(true)}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] text-white shadow-sm hover:shadow-md hover:opacity-95 transition-all"
          >
            <span className="text-xl">💪</span>
            <span className="text-xs font-semibold">MoveEpic</span>
          </button>
          <button
            type="button"
            data-ocid="leaderboard.open_modal_button"
            onClick={() => setLeaderboardPage(true)}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] text-white shadow-sm hover:shadow-md hover:opacity-95 transition-all"
          >
            <span className="text-xl">🏆</span>
            <span className="text-xs font-semibold">Leaderboard</span>
          </button>
        </div>

        {/* Collapsible: Daily Activities */}
        <CollapsibleSection
          title="Daily Activities"
          icon="⚡"
          defaultOpen={false}
        >
          <EpicChallengeCard />
          <MoodTrackerCard />
          <MicroCoachingCard />
        </CollapsibleSection>

        {/* Collapsible: Progress & Goals */}
        <CollapsibleSection
          title="Progress & Goals"
          icon="📈"
          defaultOpen={false}
        >
          <GoalVisualizationCard
            currentWeight={currentWeightKg}
            goalType={userGoalType}
            caloriesConsumed={totals.calories}
          />
          <SmartSuggestionsCard
            calories={totals.calories}
            protein={totals.protein}
            fiber={totals.fiber}
            waterGlasses={waterGlasses}
          />
          <WeeklyMissionsCard />
        </CollapsibleSection>

        {/* Collapsible: Health Tools */}
        <CollapsibleSection title="Health Tools" icon="🔧" defaultOpen={false}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <WaterIntakeCard glasses={waterGlasses} />
            <MealQualityCard score={score} grade={grade} />
            <HabitRemindersCard />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <SmartCoachCard
              caloriesConsumed={totals.calories}
              protein={totals.protein}
              carbs={totals.carbs}
              fat={totals.fat}
              userProfile={userProfileForStatus}
              allFoods={allFoods}
            />
            <div className="space-y-3">
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
          <DailyCheckInCard recentCheckIns={checkIns} />
        </CollapsibleSection>

        {/* Collapsible: Goals & Community */}
        <CollapsibleSection
          title="Goals & Community"
          icon="🎯"
          defaultOpen={false}
        >
          <GoalsSection onNavigateToStatus={setGoalPage} />
          <ReviewSection />
        </CollapsibleSection>

        <div className="flex justify-center py-2">
          <PrivacySettingsModal />
        </div>
        <Footer />
      </main>

      <BottomNav
        activePage="home"
        onHome={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        onEat={() => openLogFood()}
        onThink={() => setThinkEpicPage(true)}
        onMove={() => setWorkoutPage(true)}
        onHistory={() => setHistoryPage(true)}
        onLeaderboard={() => setLeaderboardPage(true)}
      />

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
