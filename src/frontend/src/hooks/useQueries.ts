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
import { getTodayStartNs } from "../types";
import { useActor } from "./useActor";

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

export function useTodayFoodLogs() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["todayFoodLogs"],
    queryFn: async () => {
      if (!actor) return [];
      const logs = await actor.getFoodLogsForDate(getTodayStartNs());
      return logs.flatMap((log) =>
        log.entries.map((entry) => ({ entry, logTimestamp: log.timestamp })),
      );
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTodayWaterIntake() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["todayWater"],
    queryFn: async () => {
      if (!actor) return 0;
      const logs = await actor.getWaterIntakeForDate(getTodayStartNs());
      if (logs.length === 0) return 0;
      const allEntries = logs.flatMap((l) => l.entries);
      if (allEntries.length === 0) return 0;
      return Number(allEntries[allEntries.length - 1].glasses);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTodayHealthMetrics() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["todayMetrics"],
    queryFn: async () => {
      if (!actor) return null;
      const metrics = await actor.getHealthMetricsForDate(getTodayStartNs());
      return metrics.length > 0 ? metrics[metrics.length - 1] : null;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
    staleTime: 1000 * 60,
  });
}

export function useAllCheckIns() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<DailyCheckIn>>({
    queryKey: ["allCheckIns"],
    queryFn: async () => {
      if (!actor) return [];
      return [];
    },
    enabled: !!actor && !isFetching,
  });
}

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

export function useLogFoodEntry() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entry: FoodLogEntry) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.logFoodEntry(entry);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["todayFoodLogs"] }),
  });
}

export function useRemoveFoodLogEntry() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entryTimestamp: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.removeFoodLogEntry(entryTimestamp);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["todayFoodLogs"] }),
  });
}

export function useLogWaterIntake() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (glasses: number) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.logWaterIntake(BigInt(glasses));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["todayWater"] }),
  });
}

export function useLogHealthMetrics() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (metrics: HealthMetrics) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.logHealthMetrics(metrics);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["todayMetrics"] }),
  });
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["currentUserProfile"] }),
  });
}

export function useSaveDailyCheckIn() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (checkIn: DailyCheckIn) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.saveDailyCheckIn(checkIn);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allCheckIns"] }),
  });
}

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

// ─── Streak Hooks ─────────────────────────────────────────────────────────────

export interface UserStreak {
  currentStreak: bigint;
  longestStreak: bigint;
  totalPoints: bigint;
  lastActiveDate: string;
}

export function useCallerStreak() {
  const { actor, isFetching } = useActor();
  return useQuery<UserStreak | null>({
    queryKey: ["callerStreak"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        const result = await (actor as any).getCallerStreak();
        if (Array.isArray(result) && result.length > 0) return result[0];
        return null;
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 1000 * 30,
  });
}

export function useUpdateStreak() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      dateStr,
      points,
    }: { dateStr: string; points: bigint }) => {
      if (!actor) return;
      try {
        await (actor as any).updateStreak(dateStr, points);
      } catch {
        // Silently ignore streak errors — not critical
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["callerStreak"] }),
  });
}

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
