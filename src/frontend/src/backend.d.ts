import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface DailyWaterIntake {
    entries: Array<WaterIntakeEntry>;
    timestamp: Time;
}
export interface WaterIntakeEntry {
    glasses: bigint;
    timestamp: Time;
}
export type Time = bigint;
export interface DailyCheckIn {
    waterGlasses: bigint;
    date: string;
    exercisesDone: string;
    dietNotes: string;
    sleepHours: number;
}
export interface HealthMetrics {
    weight: number;
    steps: bigint;
    heartRate: number;
    timestamp: Time;
}
export interface FoodItem {
    fat: number;
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
export interface DailyFoodLog {
    entries: Array<FoodLogEntry>;
    timestamp: Time;
}
export interface FoodLogEntry {
    date: Time;
    quantity: number;
    mealType: MealType;
    foodName: string;
}
export interface UserProfile {
    heightCm: number;
    name: string;
    weightKg: number;
    phone: string;
}
export interface Review {
    authorName: string;
    text: string;
    reviewType: string;
    timestamp: Time;
}
export enum MealType {
    breakfast = "breakfast",
    lunch = "lunch",
    snack = "snack",
    dinner = "dinner"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addFoodItem(food: FoodItem): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteCallerUserProfile(): Promise<void>;
    deleteFoodItem(name: string): Promise<void>;
    getAllCheckIns(user: Principal): Promise<Array<DailyCheckIn>>;
    getAllFoodItems(): Promise<Array<FoodItem>>;
    getAllFoodLogs(user: Principal): Promise<Array<DailyFoodLog>>;
    getAllHealthMetrics(user: Principal): Promise<Array<HealthMetrics>>;
    getAllUsers(): Promise<Array<[Principal, UserProfile]>>;
    getAllUsersCheckIns(): Promise<Array<[Principal, Array<DailyCheckIn>]>>;
    getAllWaterIntake(user: Principal): Promise<Array<DailyWaterIntake>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCheckInsForDate(date: string): Promise<Array<DailyCheckIn>>;
    getFoodByCategory(category: string): Promise<Array<FoodItem>>;
    getFoodLogsForDate(date: Time): Promise<Array<DailyFoodLog>>;
    getHealthMetricsForDate(date: Time): Promise<Array<HealthMetrics>>;
    getPublicReviews(): Promise<Array<Review>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWaterIntakeForDate(date: Time): Promise<Array<DailyWaterIntake>>;
    isCallerAdmin(): Promise<boolean>;
    logFoodEntry(entry: FoodLogEntry): Promise<void>;
    logHealthMetrics(metrics: HealthMetrics): Promise<void>;
    logWaterIntake(glasses: bigint): Promise<void>;
    removeFoodLogEntry(entryTimestamp: Time): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveDailyCheckIn(checkIn: DailyCheckIn): Promise<void>;
    searchFoodByName(name: string): Promise<Array<FoodItem>>;
    submitReview(authorName: string, text: string, reviewType: string): Promise<void>;
}
