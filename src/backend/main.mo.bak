import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Set "mo:core/Set";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Float "mo:core/Float";
import Int "mo:core/Int";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";



// Add migration module and entry

actor {
  type Permissions = {
    #admin;
    #user;
    #anon;
  };

  // ======================== Authorization ========================
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ======================== User Profile ========================

  public type ProfileGoal = {
    #weightLoss;
    #muscleGain;
    #maintenance;
  };

  // NOTE: UserProfile kept identical to previous version for stable compatibility.
  // age, gender fields are managed in frontend localStorage.
  public type UserProfile = {
    name : Text;
    phone : Text;
    weightKg : Float;
    heightCm : Float;
    goal : ?ProfileGoal;
    gender : ?Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let userJoinTimes = Map.empty<Principal, Time.Time>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    if (not userJoinTimes.containsKey(caller)) {
      userJoinTimes.add(caller, Time.now());
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func deleteCallerUserProfile() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete profiles");
    };
    userProfiles.remove(caller);
  };

  // ======================== Public User Registry (no auth, phone-based) ========================
  // Stores user profiles keyed by a device UUID so admin can see all registered users.

  public type ExtendedPublicUserRecord = {
    name : Text;
    phone : Text;
    age : Nat;
    weightKg : Float;
    heightCm : Float;
    gender : Text;
    goal : Text;
    joinedAt : Int;
    lastSeenAt : Int;
    role : Text; // "superAdmin" | "admin" | "moderator" | "user"
    status : Text; // "active" | "banned" | "suspended"
    loginCount : Nat;
  };

  let publicUserRegistry = Map.empty<Text, ExtendedPublicUserRecord>();

  // Called from frontend on register/login — no auth required
  public shared func savePublicUser(deviceId : Text, record : ExtendedPublicUserRecord) : async () {
    let newRecord : ExtendedPublicUserRecord = {
      record with
      joinedAt = Time.now();
      lastSeenAt = Time.now();
    };
    publicUserRegistry.add(deviceId, newRecord);
  };

  public query func getPublicUser(deviceId : Text) : async ?ExtendedPublicUserRecord {
    publicUserRegistry.get(deviceId);
  };

  public query func getAllPublicUsers() : async [(Text, ExtendedPublicUserRecord)] {
    publicUserRegistry.toArray();
  };

  public query func getPublicUserCount() : async Nat {
    publicUserRegistry.size();
  };

  // ======================== New Public User Registry Methods ========================
  // Extended fields: role, status, loginCount

  public type PublicUserRole = {
    #superAdmin;
    #admin;
    #moderator;
    #user;
  };

  public type PublicUserStatus = {
    #active;
    #banned;
    #suspended;
  };

  public shared ({ caller }) func updatePublicUserRole(deviceId : Text, role : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update user roles");
    };
    switch (publicUserRegistry.get(deviceId)) {
      case (null) { Runtime.trap("User not found") };
      case (?record) {
        let updatedRecord = {
          record with
          role = role;
        };
        publicUserRegistry.add(deviceId, updatedRecord);
      };
    };
  };

  public shared ({ caller }) func updatePublicUserStatus(deviceId : Text, status : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update user status");
    };
    switch (publicUserRegistry.get(deviceId)) {
      case (null) { Runtime.trap("User not found") };
      case (?record) {
        let updatedRecord = {
          record with
          status = status;
        };
        publicUserRegistry.add(deviceId, updatedRecord);
      };
    };
  };

  public shared func incrementUserLoginCount(deviceId : Text) : async () {
    switch (publicUserRegistry.get(deviceId)) {
      case (null) { Runtime.trap("User not found") };
      case (?record) {
        let updatedRecord = {
          record with
          loginCount = record.loginCount + 1;
          lastSeenAt = Time.now();
        };
        publicUserRegistry.add(deviceId, updatedRecord);
      };
    };
  };

  public query ({ caller }) func getActiveUsersLastDays(days : Nat) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can fetch user activity stats");
    };
    let now = Time.now();
    let dayNanos = days * 24 * 60 * 60 * 1000000000;
    publicUserRegistry.values().toArray().filter(
      func(user) {
        let lastSeen = Int.abs(user.lastSeenAt);
        let currentTime = Int.abs(now);
        currentTime - lastSeen <= dayNanos;
      }
    ).size();
  };

  public query ({ caller }) func getUsersByStatus(status : Text) : async [ExtendedPublicUserRecord] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can fetch users by status");
    };
    publicUserRegistry.values().toArray().filter(
      func(u) { u.status == status }
    );
  };

  // ======================== Daily Check-In ========================

  public type DailyCheckIn = {
    date : Text;
    dietNotes : Text;
    exercisesDone : Text;
    waterGlasses : Nat;
    sleepHours : Float;
  };

  module DailyCheckIn {
    public func compare(c1 : DailyCheckIn, c2 : DailyCheckIn) : Order.Order {
      Text.compare(c1.date, c2.date);
    };
  };

  let userCheckIns = Map.empty<Principal, Set.Set<DailyCheckIn>>();

  public shared ({ caller }) func saveDailyCheckIn(checkIn : DailyCheckIn) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save check-ins");
    };
    let currentCheckIns = switch (userCheckIns.get(caller)) {
      case (null) { Set.empty<DailyCheckIn>() };
      case (?checkIns) { checkIns };
    };
    currentCheckIns.add(checkIn);
    userCheckIns.add(caller, currentCheckIns);
  };

  public query ({ caller }) func getCheckInsForDate(date : Text) : async [DailyCheckIn] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch check-ins");
    };
    switch (userCheckIns.get(caller)) {
      case (null) { [] };
      case (?checkInsList) {
        checkInsList.toArray().filter(
          func(checkIn) { checkIn.date == date }
        );
      };
    };
  };

  public query ({ caller }) func getAllCheckIns(user : Principal) : async [DailyCheckIn] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only users can view check-ins");
    };
    switch (userCheckIns.get(user)) {
      case (null) { [] };
      case (?checkIns) { checkIns.toArray().sort() };
    };
  };

  // ======================== Food Database ========================

  // NOTE: FoodItem kept identical to previous version for stable compatibility.
  // honestyRating, dishIngredients, portionPresets are managed in frontend data.
  public type FoodItem = {
    name : Text;
    category : Text;
    caloriesPer100g : Float;
    protein : Float;
    carbs : Float;
    fat : Float;
    fiber : Float;
    sugar : Float;
    servingSize : Float;
    servingUnit : Text;
    region : Text;
  };

  module FoodItem {
    public func compare(f1 : FoodItem, f2 : FoodItem) : Order.Order {
      Text.compare(f1.name, f2.name);
    };
  };

  let foodDatabase = Map.empty<Text, FoodItem>();

  public shared ({ caller }) func addFoodItem(food : FoodItem) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add food items");
    };
    foodDatabase.add(food.name.toLower(), food);
  };

  public shared ({ caller }) func updateFoodItem(food : FoodItem) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update food items");
    };
    if (not foodDatabase.containsKey(food.name.toLower())) {
      Runtime.trap("Food item not found");
    };
    foodDatabase.add(food.name.toLower(), food);
  };

  public query ({ caller }) func getFoodByName(name : Text) : async ?FoodItem {
    foodDatabase.get(name);
  };

  public query ({ caller }) func searchFoodByName(name : Text) : async [FoodItem] {
    foodDatabase.values().toArray().filter(func(f) { f.name.contains(#text name) });
  };

  public query ({ caller }) func getFoodByCategory(category : Text) : async [FoodItem] {
    foodDatabase.values().toArray().filter(func(f) { f.category == category });
  };

  public query ({ caller }) func getFoodByRegion(region : Text) : async [FoodItem] {
    foodDatabase.values().toArray().filter(func(f) { f.region == region });
  };

  public query ({ caller }) func getFoodByMacronutrients(minProtein : Float, maxCarbs : Float, maxFat : Float) : async [FoodItem] {
    foodDatabase.values().toArray().filter(
      func(f) {
        f.protein >= minProtein and f.carbs <= maxCarbs and f.fat <= maxFat;
      }
    );
  };

  public shared ({ caller }) func deleteFoodItem(name : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete food items");
    };
    if (not foodDatabase.containsKey(name)) {
      Runtime.trap("Food item not found");
    };
    foodDatabase.remove(name);
  };

  // ======================== Food Suggestions ========================

  public type FoodSuggestionStatus = { #pending; #approved; #rejected };

  public type FoodSuggestion = {
    foodItem : FoodItem;
    status : FoodSuggestionStatus;
    submittedBy : Principal;
    timestamp : Time.Time;
  };

  let foodSuggestions = Map.empty<Nat, FoodSuggestion>();
  var nextSuggestionId = 1;

  public shared ({ caller }) func submitFoodSuggestion(food : FoodItem) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can submit food suggestions");
    };
    let suggestion : FoodSuggestion = {
      foodItem = food;
      status = #pending;
      submittedBy = caller;
      timestamp = Time.now();
    };
    let id = nextSuggestionId;
    foodSuggestions.add(id, suggestion);
    nextSuggestionId += 1;
    id;
  };

  public shared ({ caller }) func approveFoodSuggestion(suggestionId : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can approve food suggestions");
    };
    switch (foodSuggestions.get(suggestionId)) {
      case (null) { Runtime.trap("Suggestion not found") };
      case (?suggestion) {
        let updatedSuggestion = {
          suggestion with status = #approved;
        };
        foodSuggestions.add(suggestionId, updatedSuggestion);
        foodDatabase.add(suggestion.foodItem.name.toLower(), suggestion.foodItem);
      };
    };
  };

  public shared ({ caller }) func rejectFoodSuggestion(suggestionId : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can reject food suggestions");
    };
    switch (foodSuggestions.get(suggestionId)) {
      case (null) { Runtime.trap("Suggestion not found") };
      case (?suggestion) {
        let updatedSuggestion = {
          suggestion with status = #rejected;
        };
        foodSuggestions.add(suggestionId, updatedSuggestion);
      };
    };
  };

  public query func getPendingFoodSuggestions() : async [FoodSuggestion] {
    foodSuggestions.values().toArray().filter(
      func(s) { s.status == #pending }
    );
  };

  // ======================== Food Logging ========================

  public type MealType = { #breakfast; #lunch; #dinner; #snack };

  public type FoodLogEntry = {
    foodName : Text;
    quantity : Float;
    mealType : MealType;
    date : Time.Time;
  };

  public type DailyFoodLog = {
    entries : [FoodLogEntry];
    timestamp : Time.Time;
  };

  module DailyFoodLog {
    public func compare(log1 : DailyFoodLog, log2 : DailyFoodLog) : Order.Order {
      Int.compare(log1.timestamp, log2.timestamp);
    };
  };

  let userFoodLogs = Map.empty<Principal, Set.Set<DailyFoodLog>>();

  public shared ({ caller }) func logFoodEntry(entry : FoodLogEntry) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can log food entries");
    };
    let currentLogs = switch (userFoodLogs.get(caller)) {
      case (null) { Set.empty<DailyFoodLog>() };
      case (?logs) { logs };
    };
    let newEntry = {
      entries = [entry];
      timestamp = Time.now();
    };
    currentLogs.add(newEntry);
    userFoodLogs.add(caller, currentLogs);
  };

  public shared ({ caller }) func removeFoodLogEntry(entryTimestamp : Time.Time) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can remove food entries");
    };
    switch (userFoodLogs.get(caller)) {
      case (null) {};
      case (?logsList) {
        let arr = logsList.toArray();
        for (log in arr.vals()) {
          if (log.timestamp == entryTimestamp) {
            logsList.remove(log);
          };
        };
      };
    };
  };

  public query ({ caller }) func getFoodLogsForDate(date : Time.Time) : async [DailyFoodLog] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can fetch food logs");
    };
    switch (userFoodLogs.get(caller)) {
      case (null) { [] };
      case (?logsList) {
        logsList.toArray().sort().filter(
          func(log) {
            let logDay = log.timestamp / (24 * 60 * 60 * 1000000000);
            let targetDay = date / (24 * 60 * 60 * 1000000000);
            logDay == targetDay;
          }
        );
      };
    };
  };

  // ======================== Water Tracking ========================

  public type WaterIntakeEntry = {
    glasses : Nat;
    timestamp : Time.Time;
  };

  public type DailyWaterIntake = {
    entries : [WaterIntakeEntry];
    timestamp : Time.Time;
  };

  let userWaterIntake = Map.empty<Principal, Set.Set<DailyWaterIntake>>();

  module WaterIntakeEntry {
    public func compare(entry1 : WaterIntakeEntry, entry2 : WaterIntakeEntry) : Order.Order {
      Int.compare(entry1.timestamp, entry2.timestamp);
    };
  };
  module DailyWaterIntake {
    public func compare(log1 : DailyWaterIntake, log2 : DailyWaterIntake) : Order.Order {
      Int.compare(log1.timestamp, log2.timestamp);
    };
  };

  public shared ({ caller }) func logWaterIntake(glasses : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can log water intake");
    };
    let currentIntake = switch (userWaterIntake.get(caller)) {
      case (null) { Set.empty<DailyWaterIntake>() };
      case (?intake) { intake };
    };
    let newEntry = {
      entries = [
        {
          glasses;
          timestamp = Time.now();
        },
      ];
      timestamp = Time.now();
    };
    currentIntake.add(newEntry);
    userWaterIntake.add(caller, currentIntake);
  };

  public query ({ caller }) func getWaterIntakeForDate(date : Time.Time) : async [DailyWaterIntake] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can fetch water intake logs");
    };
    switch (userWaterIntake.get(caller)) {
      case (null) { [] };
      case (?intakeList) {
        intakeList.toArray().sort().filter(
          func(intake) {
            let intakeDay = intake.timestamp / (24 * 60 * 60 * 1000000000);
            intakeDay == (date / (24 * 60 * 60 * 1000000000));
          }
        );
      };
    };
  };

  // ======================== Health Metrics ========================

  public type HealthMetrics = {
    weight : Float;
    steps : Nat;
    heartRate : Float;
    timestamp : Time.Time;
  };

  module HealthMetrics {
    public func compare(metrics1 : HealthMetrics, metrics2 : HealthMetrics) : Order.Order {
      Int.compare(metrics1.timestamp, metrics2.timestamp);
    };
  };

  let userHealthMetrics = Map.empty<Principal, Set.Set<HealthMetrics>>();

  public shared ({ caller }) func logHealthMetrics(metrics : HealthMetrics) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can log health metrics");
    };
    let currentMetrics = switch (userHealthMetrics.get(caller)) {
      case (null) { Set.empty<HealthMetrics>() };
      case (?metrics) { metrics };
    };
    currentMetrics.add(metrics);
    userHealthMetrics.add(caller, currentMetrics);
  };

  public query ({ caller }) func getHealthMetricsForDate(date : Time.Time) : async [HealthMetrics] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch health metrics");
    };
    switch (userHealthMetrics.get(caller)) {
      case (null) { [] };
      case (?metricsList) {
        metricsList.toArray().sort().filter(
          func(metrics) {
            let metricsDay = metrics.timestamp / (24 * 60 * 60 * 1000000000);
            let targetDay = date / (24 * 60 * 60 * 1000000000);
            metricsDay == targetDay;
          }
        );
      };
    };
  };

  // ======================== Reviews & Q&A ========================

  public type Review = {
    authorName : Text;
    text : Text;
    reviewType : Text;
    timestamp : Time.Time;
  };

  module Review {
    public func compare(r1 : Review, r2 : Review) : Order.Order {
      Int.compare(r1.timestamp, r2.timestamp);
    };
  };

  let reviews = Set.empty<Review>();

  public shared ({ caller }) func submitReview(authorName : Text, text : Text, reviewType : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can submit reviews");
    };
    let review = {
      authorName;
      text;
      reviewType;
      timestamp = Time.now();
    };
    reviews.add(review);
  };

  public query func getPublicReviews() : async [Review] {
    reviews.toArray().sort();
  };

  // ======================== Diet Plans ========================

  public type DietPlan = {
    id : Nat;
    name : Text;
    goalType : ProfileGoal;
    description : Text;
    dailyCalorieTarget : Float;
    proteinTarget : Float;
    carbsTarget : Float;
    fatTarget : Float;
    recommendedFoods : [Text];
    mealTimingSuggestions : [Text];
  };

  module DietPlan {
    public func compare(p1 : DietPlan, p2 : DietPlan) : Order.Order {
      Nat.compare(p1.id, p2.id);
    };
  };

  let dietPlans = Map.empty<Nat, DietPlan>();
  var nextDietPlanId = 1;

  public shared ({ caller }) func createDietPlan(plan : DietPlan) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create diet plans");
    };
    let id = nextDietPlanId;
    let newPlan = { plan with id };
    dietPlans.add(id, newPlan);
    nextDietPlanId += 1;
    id;
  };

  public shared ({ caller }) func updateDietPlan(plan : DietPlan) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update diet plans");
    };
    if (not dietPlans.containsKey(plan.id)) {
      Runtime.trap("Diet plan not found");
    };
    dietPlans.add(plan.id, plan);
  };

  public shared ({ caller }) func deleteDietPlan(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete diet plans");
    };
    dietPlans.remove(id);
  };

  public query func getAllDietPlans() : async [DietPlan] {
    dietPlans.values().toArray().sort();
  };

  public query func getDietPlansByGoal(goalType : ProfileGoal) : async [DietPlan] {
    dietPlans.values().toArray().filter(func(p) { p.goalType == goalType }).sort();
  };

  // ======================== Articles ========================

  public type Article = {
    id : Nat;
    title : Text;
    category : Text;
    body : Text;
    imageUrl : Text;
    createdAt : Time.Time;
  };

  module Article {
    public func compare(a1 : Article, a2 : Article) : Order.Order {
      Int.compare(a2.createdAt, a1.createdAt);
    };
  };

  let articles = Map.empty<Nat, Article>();
  var nextArticleId = 1;

  public shared ({ caller }) func createArticle(article : Article) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create articles");
    };
    let id = nextArticleId;
    let newArticle = { article with id; createdAt = Time.now() };
    articles.add(id, newArticle);
    nextArticleId += 1;
    id;
  };

  public shared ({ caller }) func updateArticle(article : Article) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update articles");
    };
    if (not articles.containsKey(article.id)) {
      Runtime.trap("Article not found");
    };
    articles.add(article.id, article);
  };

  public shared ({ caller }) func deleteArticle(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete articles");
    };
    articles.remove(id);
  };

  public query func getAllArticles() : async [Article] {
    articles.values().toArray().sort();
  };

  public query func getArticlesByCategory(category : Text) : async [Article] {
    articles.values().toArray().filter(func(a) { a.category == category }).sort();
  };

  // ======================== Announcements ========================

  public type AnnouncementTarget = { #all; #weightLoss; #muscleGain; #maintenance };

  public type Announcement = {
    id : Nat;
    title : Text;
    message : Text;
    targetGoal : AnnouncementTarget;
    createdAt : Time.Time;
    isActive : Bool;
  };

  module Announcement {
    public func compare(a1 : Announcement, a2 : Announcement) : Order.Order {
      Int.compare(a2.createdAt, a1.createdAt);
    };
  };

  let announcements = Map.empty<Nat, Announcement>();
  var nextAnnouncementId = 1;

  public shared ({ caller }) func createAnnouncement(announcement : Announcement) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create announcements");
    };
    let id = nextAnnouncementId;
    let newAnnouncement = { announcement with id; createdAt = Time.now(); isActive = true };
    announcements.add(id, newAnnouncement);
    nextAnnouncementId += 1;
    id;
  };

  public shared ({ caller }) func updateAnnouncement(announcement : Announcement) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update announcements");
    };
    if (not announcements.containsKey(announcement.id)) {
      Runtime.trap("Announcement not found");
    };
    announcements.add(announcement.id, announcement);
  };

  public shared ({ caller }) func deleteAnnouncement(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete announcements");
    };
    announcements.remove(id);
  };

  public shared ({ caller }) func toggleAnnouncement(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can toggle announcements");
    };
    switch (announcements.get(id)) {
      case (null) { Runtime.trap("Announcement not found") };
      case (?a) {
        announcements.add(id, { a with isActive = not a.isActive });
      };
    };
  };

  public query func getAllAnnouncements() : async [Announcement] {
    announcements.values().toArray().sort();
  };

  public query func getActiveAnnouncementsForGoal(goal : ?ProfileGoal) : async [Announcement] {
    announcements.values().toArray().filter(
      func(a) {
        if (not a.isActive) { return false };
        switch (a.targetGoal) {
          case (#all) { true };
          case (#weightLoss) { goal == ?(#weightLoss) };
          case (#muscleGain) { goal == ?(#muscleGain) };
          case (#maintenance) { goal == ?(#maintenance) };
        };
      }
    ).sort();
  };

  // ======================== User Reports ========================

  public type ReportStatus = { #pending; #resolved; #dismissed };

  public type UserReport = {
    id : Nat;
    reportedBy : Principal;
    reportType : Text;
    description : Text;
    targetFoodName : ?Text;
    status : ReportStatus;
    createdAt : Time.Time;
  };

  module UserReport {
    public func compare(r1 : UserReport, r2 : UserReport) : Order.Order {
      Int.compare(r2.createdAt, r1.createdAt);
    };
  };

  let userReports = Map.empty<Nat, UserReport>();
  var nextReportId = 1;

  public shared ({ caller }) func submitUserReport(reportType : Text, description : Text, targetFoodName : ?Text) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can submit reports");
    };
    let id = nextReportId;
    let report : UserReport = {
      id;
      reportedBy = caller;
      reportType;
      description;
      targetFoodName;
      status = #pending;
      createdAt = Time.now();
    };
    userReports.add(id, report);
    nextReportId += 1;
    id;
  };

  public shared ({ caller }) func resolveReport(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can resolve reports");
    };
    switch (userReports.get(id)) {
      case (null) { Runtime.trap("Report not found") };
      case (?r) { userReports.add(id, { r with status = #resolved }) };
    };
  };

  public shared ({ caller }) func dismissReport(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can dismiss reports");
    };
    switch (userReports.get(id)) {
      case (null) { Runtime.trap("Report not found") };
      case (?r) { userReports.add(id, { r with status = #dismissed }) };
    };
  };

  public query ({ caller }) func getAllReports() : async [UserReport] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view reports");
    };
    userReports.values().toArray().sort();
  };

  // ======================== User Flagging ========================

  let flaggedUsers = Map.empty<Principal, Text>();

  public shared ({ caller }) func flagUser(user : Principal, reason : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can flag users");
    };
    flaggedUsers.add(user, reason);
  };

  public shared ({ caller }) func unflagUser(user : Principal) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can unflag users");
    };
    flaggedUsers.remove(user);
  };

  public query ({ caller }) func getFlaggedUsers() : async [(Principal, Text)] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view flagged users");
    };
    flaggedUsers.toArray();
  };

  public shared ({ caller }) func deleteUserAccount(user : Principal) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete user accounts");
    };
    userProfiles.remove(user);
    userCheckIns.remove(user);
    userFoodLogs.remove(user);
    userWaterIntake.remove(user);
    userHealthMetrics.remove(user);
    flaggedUsers.remove(user);
  };

  // ======================== Weekly Missions ========================
  // New stable variables -- safe to add (no existing data to migrate)

  public type WeeklyMission = {
    id : Nat;
    title : Text;
    description : Text;
    missionType : Text;
    targetCount : Nat;
    xpReward : Nat;
  };

  module WeeklyMission {
    public func compare(m1 : WeeklyMission, m2 : WeeklyMission) : Order.Order {
      Nat.compare(m1.id, m2.id);
    };
  };

  public type WeeklyMissionProgress = {
    missionId : Nat;
    weekKey : Text;
    currentCount : Nat;
    completed : Bool;
  };

  module WeeklyMissionProgress {
    public func compare(p1 : WeeklyMissionProgress, p2 : WeeklyMissionProgress) : Order.Order {
      Nat.compare(p1.missionId, p2.missionId);
    };
  };

  let weeklyMissions = Map.empty<Nat, WeeklyMission>();
  var nextMissionId = 1;
  let userMissionProgress = Map.empty<Principal, Set.Set<WeeklyMissionProgress>>();

  public shared ({ caller }) func createWeeklyMission(mission : WeeklyMission) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create missions");
    };
    let id = nextMissionId;
    let newMission = { mission with id };
    weeklyMissions.add(id, newMission);
    nextMissionId += 1;
    id;
  };

  public query func getAllWeeklyMissions() : async [WeeklyMission] {
    weeklyMissions.values().toArray().sort();
  };

  public query ({ caller }) func getUserMissionProgress(weekKey : Text) : async [WeeklyMissionProgress] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view mission progress");
    };
    switch (userMissionProgress.get(caller)) {
      case (null) { [] };
      case (?progressSet) {
        progressSet.toArray().filter(func(p) { p.weekKey == weekKey });
      };
    };
  };

  public shared ({ caller }) func updateMissionProgress(missionId : Nat, weekKey : Text, increment : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update mission progress");
    };
    let mission = switch (weeklyMissions.get(missionId)) {
      case (null) { Runtime.trap("Mission not found") };
      case (?m) { m };
    };
    let progressSet = switch (userMissionProgress.get(caller)) {
      case (null) { Set.empty<WeeklyMissionProgress>() };
      case (?s) { s };
    };
    let existing = progressSet.toArray().filter(func(p) { p.missionId == missionId and p.weekKey == weekKey });
    let currentCount = if (existing.size() > 0) { existing[0].currentCount } else { 0 };
    let newCount = currentCount + increment;
    let completed = newCount >= mission.targetCount;
    if (existing.size() > 0) {
      progressSet.remove(existing[0]);
    };
    progressSet.add({
      missionId;
      weekKey;
      currentCount = newCount;
      completed;
    });
    userMissionProgress.add(caller, progressSet);
  };

  // ======================== Helper Functions ========================

  func getFoodByNameInternal(name : Text) : FoodItem {
    switch (foodDatabase.get(name)) {
      case (null) { Runtime.trap("Food item not found") };
      case (?food) { food };
    };
  };

  // ======================== Admin Functions ========================

  public query func getAllUsers() : async [(Principal, UserProfile)] {
    userProfiles.toArray();
  };

  public query func getAllUsersCheckIns() : async [(Principal, [DailyCheckIn])] {
    userCheckIns.toArray().map(
      func((user, checkIns)) {
        (user, checkIns.toArray().sort());
      }
    );
  };

  public query func getUserJoinTimes() : async [(Principal, Time.Time)] {
    userJoinTimes.toArray();
  };

  // ======================== Get Summaries ========================
  public query ({ caller }) func getAllFoodItems() : async [FoodItem] {
    foodDatabase.values().toArray().sort();
  };

  public query ({ caller }) func getAllFoodLogs(user : Principal) : async [DailyFoodLog] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only users can view food logs");
    };
    switch (userFoodLogs.get(user)) {
      case (null) { [] };
      case (?logs) { logs.toArray().sort() };
    };
  };

  public query ({ caller }) func getAllWaterIntake(user : Principal) : async [DailyWaterIntake] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only users can view water intake");
    };
    switch (userWaterIntake.get(user)) {
      case (null) { [] };
      case (?intake) { intake.toArray().sort() };
    };
  };

  public query ({ caller }) func getAllHealthMetrics(user : Principal) : async [HealthMetrics] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only users can view health metrics");
    };
    switch (userHealthMetrics.get(user)) {
      case (null) { [] };
      case (?metrics) { metrics.toArray().sort() };
    };
  };

  // ======================== Public Food Wish System ========================

  // NEW public food wish system to allow everyone to submit food or requests.

  public type PublicFoodWish = {
    id : Nat;
    submitterName : Text;
    submitterPhone : Text;
    foodName : Text;
    category : Text;
    description : Text;
    reason : Text;
    submittedAt : Int;
  };

  let publicFoodWishes = Map.empty<Nat, PublicFoodWish>();
  var nextFoodWishId = 1;

  public shared func submitPublicFoodWish(
    submitterName : Text,
    submitterPhone : Text,
    foodName : Text,
    category : Text,
    description : Text,
    reason : Text,
  ) : async Nat {
    let id = nextFoodWishId;
    let wish : PublicFoodWish = {
      id;
      submitterName;
      submitterPhone;
      foodName;
      category;
      description;
      reason;
      submittedAt = Time.now();
    };
    publicFoodWishes.add(id, wish);
    nextFoodWishId += 1;
    id;
  };

  public query func getAllPublicFoodWishes() : async [PublicFoodWish] {
    publicFoodWishes.values().toArray();
  };

  public query func getPublicFoodWishCount() : async Nat {
    publicFoodWishes.size();
  };
};
