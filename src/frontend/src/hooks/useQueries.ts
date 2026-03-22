import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  DailyCheckIn,
  FoodLogEntry,
  HealthMetrics,
  Review,
  UserProfile,
} from "../backend";
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
      return actor.getAllUsersCheckIns();
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
