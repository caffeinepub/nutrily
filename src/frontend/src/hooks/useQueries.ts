import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  DailyCheckIn,
  FoodItem,
  FoodLogEntry,
  FoodSuggestion,
  HealthMetrics,
  ProfileGoal,
  Review,
  UserProfile,
} from "../backend";
import type { Announcement, Article, DietPlan, UserReport } from "../types";
import { useActor } from "./useActor";

// ─── localStorage helpers ─────────────────────────────────────────────────────

function getTodayDateStr(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`;
}

interface LocalFoodLogItem {
  foodName: string;
  quantity: number;
  mealType: string;
  logTimestamp: number;
  date: string;
}

interface LocalWaterLog {
  glasses: number;
  date: string;
}

interface LocalHealthMetrics {
  weight: number;
  steps: number;
  heartRate: number;
  timestamp: number;
  date: string;
}

interface LocalCheckIn extends DailyCheckIn {
  savedAt: number;
}

interface LocalStreak {
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  lastActiveDate: string;
}

function readLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeLS<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ─── Food database (backend, works anonymously) ───────────────────────────────

export function useGetAllFoodItems() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allFoodItems"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllFoodItems();
    },
    enabled: !!actor && !isFetching,
    staleTime: 1000 * 60 * 5,
  });
}

export function useAllFoodItems() {
  return useGetAllFoodItems();
}

export function useSearchFood(name: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["searchFood", name],
    queryFn: async () => {
      if (!actor || !name.trim()) return [];
      return actor.searchFoodByName(name);
    },
    enabled: !!actor && !isFetching && name.trim().length > 0,
    staleTime: 1000 * 30,
  });
}

// ─── User profile (localStorage) ─────────────────────────────────────────────

export function useCallerUserProfile() {
  return useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      const raw = localStorage.getItem("doitepic_user");
      if (!raw) return null;
      const u = JSON.parse(raw);
      return {
        name: u.name ?? "",
        phone: u.phone ?? "",
        weightKg: u.weightKg ?? 0,
        heightCm: u.heightCm ?? 0,
        gender: u.gender ?? "",
        goal: u.goal ?? undefined,
      } as UserProfile;
    },
    staleTime: 1000 * 60,
  });
}

export function useIsCallerAdmin() {
  // Always returns false for non-admin users; admin access is via secret modal
  return useQuery<boolean>({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => false,
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function useSaveUserProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      const existing = readLS<Record<string, unknown>>("doitepic_user", {});
      writeLS("doitepic_user", { ...existing, ...profile });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["currentUserProfile"] }),
  });
}

// ─── Food logs (localStorage) ─────────────────────────────────────────────────

export function useTodayFoodLogs() {
  return useQuery({
    queryKey: ["todayFoodLogs"],
    queryFn: async () => {
      const today = getTodayDateStr();
      const logs = readLS<LocalFoodLogItem[]>("doitepic_food_logs", []);
      return logs
        .filter((l) => l.date === today)
        .map((l) => ({
          entry: {
            foodName: l.foodName,
            quantity: l.quantity,
            mealType: l.mealType,
            date: BigInt(l.logTimestamp) * 1_000_000n,
          } as FoodLogEntry,
          logTimestamp: BigInt(l.logTimestamp),
        }));
    },
    staleTime: 0,
  });
}

export function useLogFoodEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entry: FoodLogEntry) => {
      const today = getTodayDateStr();
      const logs = readLS<LocalFoodLogItem[]>("doitepic_food_logs", []);
      const item: LocalFoodLogItem = {
        foodName: entry.foodName,
        quantity: entry.quantity,
        mealType: entry.mealType as string,
        logTimestamp: Date.now(),
        date: today,
      };
      writeLS("doitepic_food_logs", [...logs, item]);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["todayFoodLogs"] }),
  });
}

export function useRemoveFoodLogEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entryTimestamp: bigint) => {
      const tsMs = Number(entryTimestamp);
      const logs = readLS<LocalFoodLogItem[]>("doitepic_food_logs", []);
      writeLS(
        "doitepic_food_logs",
        logs.filter((l) => l.logTimestamp !== tsMs),
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["todayFoodLogs"] }),
  });
}

// ─── Water intake (localStorage) ──────────────────────────────────────────────

export function useTodayWaterIntake() {
  return useQuery({
    queryKey: ["todayWater"],
    queryFn: async () => {
      const today = getTodayDateStr();
      const logs = readLS<LocalWaterLog[]>("doitepic_water", []);
      const todayLog = logs.find((l) => l.date === today);
      return todayLog?.glasses ?? 0;
    },
    staleTime: 0,
  });
}

export function useLogWaterIntake() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (glasses: number) => {
      const today = getTodayDateStr();
      const logs = readLS<LocalWaterLog[]>("doitepic_water", []);
      const idx = logs.findIndex((l) => l.date === today);
      if (idx >= 0) {
        logs[idx].glasses = glasses;
      } else {
        logs.push({ glasses, date: today });
      }
      writeLS("doitepic_water", logs);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["todayWater"] }),
  });
}

// ─── Health metrics (localStorage) ────────────────────────────────────────────

export function useTodayHealthMetrics() {
  return useQuery({
    queryKey: ["todayMetrics"],
    queryFn: async () => {
      const today = getTodayDateStr();
      const logs = readLS<LocalHealthMetrics[]>("doitepic_health_metrics", []);
      const todayLog = logs.find((l) => l.date === today);
      if (!todayLog) return null;
      return {
        weight: todayLog.weight,
        steps: BigInt(todayLog.steps),
        heartRate: todayLog.heartRate,
        timestamp: BigInt(todayLog.timestamp),
      } as HealthMetrics;
    },
    staleTime: 0,
  });
}

export function useLogHealthMetrics() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (metrics: HealthMetrics) => {
      const today = getTodayDateStr();
      const logs = readLS<LocalHealthMetrics[]>("doitepic_health_metrics", []);
      const item: LocalHealthMetrics = {
        weight: metrics.weight,
        steps: Number(metrics.steps),
        heartRate: metrics.heartRate,
        timestamp: Number(metrics.timestamp) || Date.now(),
        date: today,
      };
      const idx = logs.findIndex((l) => l.date === today);
      if (idx >= 0) logs[idx] = item;
      else logs.push(item);
      writeLS("doitepic_health_metrics", logs);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["todayMetrics"] }),
  });
}

// ─── Daily check-ins (localStorage) ───────────────────────────────────────────

export function useAllCheckIns() {
  return useQuery<Array<DailyCheckIn>>({
    queryKey: ["allCheckIns"],
    queryFn: async () => {
      return readLS<LocalCheckIn[]>("doitepic_checkins", []).map(
        ({ savedAt: _s, ...ci }) => ci as DailyCheckIn,
      );
    },
    staleTime: 0,
  });
}

export function useSaveDailyCheckIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (checkIn: DailyCheckIn) => {
      const checkins = readLS<LocalCheckIn[]>("doitepic_checkins", []);
      const idx = checkins.findIndex((c) => c.date === checkIn.date);
      const item: LocalCheckIn = { ...checkIn, savedAt: Date.now() };
      if (idx >= 0) checkins[idx] = item;
      else checkins.push(item);
      writeLS("doitepic_checkins", checkins);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allCheckIns"] }),
  });
}

// ─── Streak (localStorage) ────────────────────────────────────────────────────

export interface UserStreak {
  currentStreak: bigint;
  longestStreak: bigint;
  totalPoints: bigint;
  lastActiveDate: string;
}

export function useCallerStreak() {
  return useQuery<UserStreak | null>({
    queryKey: ["callerStreak"],
    queryFn: async () => {
      const s = readLS<LocalStreak | null>("doitepic_streak", null);
      if (!s) return null;
      return {
        currentStreak: BigInt(s.currentStreak),
        longestStreak: BigInt(s.longestStreak),
        totalPoints: BigInt(s.totalPoints),
        lastActiveDate: s.lastActiveDate,
      };
    },
    staleTime: 1000 * 30,
  });
}

export function useUpdateStreak() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      dateStr,
      points,
    }: { dateStr: string; points: bigint }) => {
      const existing = readLS<LocalStreak>("doitepic_streak", {
        currentStreak: 0,
        longestStreak: 0,
        totalPoints: 0,
        lastActiveDate: "",
      });
      const lastDate = existing.lastActiveDate;
      const yesterday = new Date();
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);
      const yStr = `${yesterday.getUTCFullYear()}-${String(yesterday.getUTCMonth() + 1).padStart(2, "0")}-${String(yesterday.getUTCDate()).padStart(2, "0")}`;

      let newStreak = existing.currentStreak;
      if (lastDate === dateStr) {
        // already updated today — just add points
      } else if (lastDate === yStr) {
        newStreak += 1;
      } else if (lastDate === "") {
        newStreak = 1;
      } else {
        newStreak = 1;
      }

      const newLongest = Math.max(existing.longestStreak, newStreak);
      const updated: LocalStreak = {
        currentStreak: newStreak,
        longestStreak: newLongest,
        totalPoints: existing.totalPoints + Number(points),
        lastActiveDate: dateStr,
      };
      writeLS("doitepic_streak", updated);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["callerStreak"] }),
  });
}

// ─── Admin-only hooks (keep using actor) ──────────────────────────────────────

export function useAllUsersCheckIns() {
  const { actor, isFetching } = useActor();
  return useQuery<
    Array<[import("@icp-sdk/core/principal").Principal, Array<DailyCheckIn>]>
  >({
    queryKey: ["allUsersCheckIns"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAllUsersCheckIns();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllUsers() {
  const { actor, isFetching } = useActor();
  return useQuery<
    Array<
      [
        import("@icp-sdk/core/principal").Principal,
        import("../backend").UserProfile,
      ]
    >
  >({
    queryKey: ["allUsers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserJoinTimes() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<[import("@icp-sdk/core/principal").Principal, bigint]>>(
    {
      queryKey: ["userJoinTimes"],
      queryFn: async () => {
        if (!actor) return [];
        return (actor as any).getUserJoinTimes();
      },
      enabled: !!actor && !isFetching,
    },
  );
}

// ─── Reviews (actor, public) ──────────────────────────────────────────────────

export function useGetPublicReviews() {
  const { actor, isFetching } = useActor();
  return useQuery<Review[]>({
    queryKey: ["publicReviews"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPublicReviews();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitReview() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      authorName,
      text,
      reviewType,
    }: {
      authorName: string;
      text: string;
      reviewType: string;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.submitReview(authorName, text, reviewType);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["publicReviews"] }),
  });
}

// ─── Food Database Admin Hooks ────────────────────────────────────────────────

export function useAddFoodItem() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (food: FoodItem) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.addFoodItem(food);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allFoodItems"] }),
  });
}

export function useUpdateFoodItem() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (food: FoodItem) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.updateFoodItem(food);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allFoodItems"] }),
  });
}

export function useDeleteFoodItem() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.deleteFoodItem(name);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allFoodItems"] }),
  });
}

export function usePendingFoodSuggestions() {
  const { actor, isFetching } = useActor();
  return useQuery<FoodSuggestion[]>({
    queryKey: ["pendingFoodSuggestions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPendingFoodSuggestions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useApproveFoodSuggestion() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (suggestionId: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.approveFoodSuggestion(suggestionId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pendingFoodSuggestions"] });
      qc.invalidateQueries({ queryKey: ["allFoodItems"] });
    },
  });
}

export function useRejectFoodSuggestion() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (suggestionId: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.rejectFoodSuggestion(suggestionId);
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["pendingFoodSuggestions"] }),
  });
}

export function useSubmitFoodSuggestion() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (food: FoodItem) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.submitFoodSuggestion(food);
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["pendingFoodSuggestions"] }),
  });
}

// ─── Diet Plans Hooks ─────────────────────────────────────────────────────────

export function useAllDietPlans() {
  const { actor, isFetching } = useActor();
  return useQuery<DietPlan[]>({
    queryKey: ["allDietPlans"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAllDietPlans();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useDietPlansByGoal(goal: ProfileGoal) {
  const { actor, isFetching } = useActor();
  return useQuery<DietPlan[]>({
    queryKey: ["dietPlansByGoal", goal],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getDietPlansByGoal(goal);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateDietPlan() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (plan: DietPlan) => {
      if (!actor) throw new Error("Not authenticated");
      return (actor as any).createDietPlan(plan);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allDietPlans"] }),
  });
}

export function useUpdateDietPlan() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (plan: DietPlan) => {
      if (!actor) throw new Error("Not authenticated");
      return (actor as any).updateDietPlan(plan);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allDietPlans"] }),
  });
}

export function useDeleteDietPlan() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return (actor as any).deleteDietPlan(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allDietPlans"] }),
  });
}

// ─── Articles Hooks ───────────────────────────────────────────────────────────

export function useAllArticles() {
  const { actor, isFetching } = useActor();
  return useQuery<Article[]>({
    queryKey: ["allArticles"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAllArticles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateArticle() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (article: Article) => {
      if (!actor) throw new Error("Not authenticated");
      return (actor as any).createArticle(article);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allArticles"] }),
  });
}

export function useUpdateArticle() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (article: Article) => {
      if (!actor) throw new Error("Not authenticated");
      return (actor as any).updateArticle(article);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allArticles"] }),
  });
}

export function useDeleteArticle() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return (actor as any).deleteArticle(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allArticles"] }),
  });
}

// ─── Announcements Hooks ──────────────────────────────────────────────────────

export function useAllAnnouncements() {
  const { actor, isFetching } = useActor();
  return useQuery<Announcement[]>({
    queryKey: ["allAnnouncements"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAllAnnouncements();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useActiveAnnouncements(goal: ProfileGoal | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Announcement[]>({
    queryKey: ["activeAnnouncements", goal],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getActiveAnnouncementsForGoal(goal);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateAnnouncement() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (announcement: Announcement) => {
      if (!actor) throw new Error("Not authenticated");
      return (actor as any).createAnnouncement(announcement);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allAnnouncements"] }),
  });
}

export function useUpdateAnnouncement() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (announcement: Announcement) => {
      if (!actor) throw new Error("Not authenticated");
      return (actor as any).updateAnnouncement(announcement);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allAnnouncements"] }),
  });
}

export function useDeleteAnnouncement() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return (actor as any).deleteAnnouncement(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allAnnouncements"] }),
  });
}

export function useToggleAnnouncement() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return (actor as any).toggleAnnouncement(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allAnnouncements"] }),
  });
}

// ─── Reports & Moderation Hooks ───────────────────────────────────────────────

export function useAllReports() {
  const { actor, isFetching } = useActor();
  return useQuery<UserReport[]>({
    queryKey: ["allReports"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAllReports();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useResolveReport() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return (actor as any).resolveReport(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allReports"] }),
  });
}

export function useDismissReport() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return (actor as any).dismissReport(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allReports"] }),
  });
}

export function useSubmitUserReport() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      reportType,
      description,
      targetFoodName,
    }: {
      reportType: string;
      description: string;
      targetFoodName: string | null;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return (actor as any).submitUserReport(
        reportType,
        description,
        targetFoodName,
      );
    },
  });
}

export function useFlaggedUsers() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<[import("@icp-sdk/core/principal").Principal, string]>>(
    {
      queryKey: ["flaggedUsers"],
      queryFn: async () => {
        if (!actor) return [];
        return (actor as any).getFlaggedUsers();
      },
      enabled: !!actor && !isFetching,
    },
  );
}

export function useFlagUser() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      user,
      reason,
    }: {
      user: import("@icp-sdk/core/principal").Principal;
      reason: string;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return (actor as any).flagUser(user, reason);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["flaggedUsers"] });
      qc.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });
}

export function useUnflagUser() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (user: import("@icp-sdk/core/principal").Principal) => {
      if (!actor) throw new Error("Not authenticated");
      return (actor as any).unflagUser(user);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["flaggedUsers"] }),
  });
}

export function useDeleteUserAccount() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (user: import("@icp-sdk/core/principal").Principal) => {
      if (!actor) throw new Error("Not authenticated");
      return (actor as any).deleteUserAccount(user);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allUsers"] });
      qc.invalidateQueries({ queryKey: ["flaggedUsers"] });
    },
  });
}

// ─── User Streak admin view ────────────────────────────────────────────────────

export function useAllUserStreaks() {
  const { actor, isFetching } = useActor();
  return useQuery<
    Array<[import("@icp-sdk/core/principal").Principal, UserStreak]>
  >({
    queryKey: ["allUserStreaks"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await (actor as any).getAllUserStreaks();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export interface PublicUserRecord {
  name: string;
  phone: string;
  age: bigint;
  weightKg: number;
  heightCm: number;
  gender: string;
  goal: string;
  joinedAt: bigint;
  lastSeenAt: bigint;
}

export function useAllPublicUsers() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<[string, PublicUserRecord]>>({
    queryKey: ["allPublicUsers"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await (actor as any).getAllPublicUsers();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}
