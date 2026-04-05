import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface PublicFoodWish {
    id: bigint;
    submitterPhone: string;
    submitterName: string;
    submittedAt: bigint;
    description: string;
    category: string;
    foodName: string;
    reason: string;
}
export interface UserProfile {
    heightCm: number;
    goal?: ProfileGoal;
    name: string;
    weightKg: number;
    gender?: string;
    phone: string;
}
export interface UserReport {
    id: bigint;
    status: ReportStatus;
    targetFoodName?: string;
    createdAt: Time;
    description: string;
    reportType: string;
    reportedBy: Principal;
}
export type Time = bigint;
export interface FoodLogEntry {
    date: Time;
    quantity: number;
    mealType: MealType;
    foodName: string;
}
export interface DailyWaterIntake {
    entries: Array<WaterIntakeEntry>;
    timestamp: Time;
}
export interface Article {
    id: bigint;
    title: string;
    body: string;
    createdAt: Time;
    imageUrl: string;
    category: string;
}
export interface HealthMetrics {
    weight: number;
    steps: bigint;
    heartRate: number;
    timestamp: Time;
}
export interface PublicUserRecord {
    age: bigint;
    lastSeenAt: bigint;
    heightCm: number;
    goal: string;
    name: string;
    joinedAt: bigint;
    weightKg: number;
    gender: string;
    phone: string;
}
export interface Announcement {
    id: bigint;
    title: string;
    createdAt: Time;
    isActive: boolean;
    message: string;
    targetGoal: AnnouncementTarget;
}
export interface WaterIntakeEntry {
    glasses: bigint;
    timestamp: Time;
}
export interface WeeklyMission {
    id: bigint;
    title: string;
    missionType: string;
    xpReward: bigint;
    description: string;
    targetCount: bigint;
}
export interface FoodSuggestion {
    status: FoodSuggestionStatus;
    submittedBy: Principal;
    timestamp: Time;
    foodItem: FoodItem;
}
export interface FoodItem {
    fat: number;
    region: string;
    fiber: number;
    carbs: number;
    name: string;
    sugar: number;
    servingSize: number;
    servingUnit: string;
    caloriesPer100g: number;
    category: string;
    protein: number;
}
export interface DietPlan {
    id: bigint;
    proteinTarget: number;
    goalType: ProfileGoal;
    name: string;
    fatTarget: number;
    description: string;
    mealTimingSuggestions: Array<string>;
    recommendedFoods: Array<string>;
    dailyCalorieTarget: number;
    carbsTarget: number;
}
export interface DailyFoodLog {
    entries: Array<FoodLogEntry>;
    timestamp: Time;
}
export interface DailyCheckIn {
    waterGlasses: bigint;
    date: string;
    exercisesDone: string;
    dietNotes: string;
    sleepHours: number;
}
export interface Review {
    text: string;
    authorName: string;
    reviewType: string;
    timestamp: Time;
}
export interface WeeklyMissionProgress {
    weekKey: string;
    completed: boolean;
    currentCount: bigint;
    missionId: bigint;
}
export enum AnnouncementTarget {
    all = "all",
    weightLoss = "weightLoss",
    muscleGain = "muscleGain",
    maintenance = "maintenance"
}
export enum FoodSuggestionStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum MealType {
    breakfast = "breakfast",
    lunch = "lunch",
    snack = "snack",
    dinner = "dinner"
}
export enum ProfileGoal {
    weightLoss = "weightLoss",
    muscleGain = "muscleGain",
    maintenance = "maintenance"
}
export enum ReportStatus {
    resolved = "resolved",
    pending = "pending",
    dismissed = "dismissed"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addFoodItem(food: FoodItem): Promise<void>;
    approveFoodSuggestion(suggestionId: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createAnnouncement(announcement: Announcement): Promise<bigint>;
    createArticle(article: Article): Promise<bigint>;
    createDietPlan(plan: DietPlan): Promise<bigint>;
    createWeeklyMission(mission: WeeklyMission): Promise<bigint>;
    deleteAnnouncement(id: bigint): Promise<void>;
    deleteArticle(id: bigint): Promise<void>;
    deleteCallerUserProfile(): Promise<void>;
    deleteDietPlan(id: bigint): Promise<void>;
    deleteFoodItem(name: string): Promise<void>;
    deleteUserAccount(user: Principal): Promise<void>;
    dismissReport(id: bigint): Promise<void>;
    flagUser(user: Principal, reason: string): Promise<void>;
    getActiveAnnouncementsForGoal(goal: ProfileGoal | null): Promise<Array<Announcement>>;
    getAllAnnouncements(): Promise<Array<Announcement>>;
    getAllArticles(): Promise<Array<Article>>;
    getAllCheckIns(user: Principal): Promise<Array<DailyCheckIn>>;
    getAllDietPlans(): Promise<Array<DietPlan>>;
    getAllFoodItems(): Promise<Array<FoodItem>>;
    getAllFoodLogs(user: Principal): Promise<Array<DailyFoodLog>>;
    getAllHealthMetrics(user: Principal): Promise<Array<HealthMetrics>>;
    getAllPublicFoodWishes(): Promise<Array<PublicFoodWish>>;
    getAllPublicUsers(): Promise<Array<[string, PublicUserRecord]>>;
    getAllReports(): Promise<Array<UserReport>>;
    getAllUsers(): Promise<Array<[Principal, UserProfile]>>;
    getAllUsersCheckIns(): Promise<Array<[Principal, Array<DailyCheckIn>]>>;
    getAllWaterIntake(user: Principal): Promise<Array<DailyWaterIntake>>;
    getAllWeeklyMissions(): Promise<Array<WeeklyMission>>;
    getArticlesByCategory(category: string): Promise<Array<Article>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCheckInsForDate(date: string): Promise<Array<DailyCheckIn>>;
    getDietPlansByGoal(goalType: ProfileGoal): Promise<Array<DietPlan>>;
    getFlaggedUsers(): Promise<Array<[Principal, string]>>;
    getFoodByCategory(category: string): Promise<Array<FoodItem>>;
    getFoodByMacronutrients(minProtein: number, maxCarbs: number, maxFat: number): Promise<Array<FoodItem>>;
    getFoodByName(name: string): Promise<FoodItem | null>;
    getFoodByRegion(region: string): Promise<Array<FoodItem>>;
    getFoodLogsForDate(date: Time): Promise<Array<DailyFoodLog>>;
    getHealthMetricsForDate(date: Time): Promise<Array<HealthMetrics>>;
    getPendingFoodSuggestions(): Promise<Array<FoodSuggestion>>;
    getPublicFoodWishCount(): Promise<bigint>;
    getPublicReviews(): Promise<Array<Review>>;
    getPublicUser(deviceId: string): Promise<PublicUserRecord | null>;
    getPublicUserCount(): Promise<bigint>;
    getUserJoinTimes(): Promise<Array<[Principal, Time]>>;
    getUserMissionProgress(weekKey: string): Promise<Array<WeeklyMissionProgress>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWaterIntakeForDate(date: Time): Promise<Array<DailyWaterIntake>>;
    isCallerAdmin(): Promise<boolean>;
    logFoodEntry(entry: FoodLogEntry): Promise<void>;
    logHealthMetrics(metrics: HealthMetrics): Promise<void>;
    logWaterIntake(glasses: bigint): Promise<void>;
    rejectFoodSuggestion(suggestionId: bigint): Promise<void>;
    removeFoodLogEntry(entryTimestamp: Time): Promise<void>;
    resolveReport(id: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveDailyCheckIn(checkIn: DailyCheckIn): Promise<void>;
    savePublicUser(deviceId: string, record: PublicUserRecord): Promise<void>;
    searchFoodByName(name: string): Promise<Array<FoodItem>>;
    submitFoodSuggestion(food: FoodItem): Promise<bigint>;
    submitPublicFoodWish(submitterName: string, submitterPhone: string, foodName: string, category: string, description: string, reason: string): Promise<bigint>;
    submitReview(authorName: string, text: string, reviewType: string): Promise<void>;
    submitUserReport(reportType: string, description: string, targetFoodName: string | null): Promise<bigint>;
    toggleAnnouncement(id: bigint): Promise<void>;
    unflagUser(user: Principal): Promise<void>;
    updateAnnouncement(announcement: Announcement): Promise<void>;
    updateArticle(article: Article): Promise<void>;
    updateDietPlan(plan: DietPlan): Promise<void>;
    updateFoodItem(food: FoodItem): Promise<void>;
    updateMissionProgress(missionId: bigint, weekKey: string, increment: bigint): Promise<void>;
}
