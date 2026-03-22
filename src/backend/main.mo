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
import Migration "migration";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  type Permissions = {
    #admin;
    #user;
    #anon;
  };
  include MixinAuthorization(accessControlState);

  // ======================== User Profile ========================

  public type ProfileGoal = {
    #weightLoss;
    #muscleGain;
    #maintenance;
  };

  public type UserProfile = {
    name : Text;
    phone : Text;
    weightKg : Float;
    heightCm : Float;
    goal : ?ProfileGoal;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

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
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func deleteCallerUserProfile() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete profiles");
    };
    userProfiles.remove(caller);
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
      Runtime.trap("Unauthorized: Can only view your own check-ins");
    };
    switch (userCheckIns.get(user)) {
      case (null) { [] };
      case (?checkIns) { checkIns.toArray().sort() };
    };
  };

  // ======================== Food Database ========================

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

  public query ({ caller }) func getPendingFoodSuggestions() : async [FoodSuggestion] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view food suggestions");
    };
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
        // Iterate through existing set and remove the matching entry directly.
        // Using the exact log object ensures structural equality matches.
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
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
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
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
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

  // ======================== Helper Functions ========================

  func getFoodByNameInternal(name : Text) : FoodItem {
    switch (foodDatabase.get(name)) {
      case (null) { Runtime.trap("Food item not found") };
      case (?food) { food };
    };
  };

  // ======================== Admin Functions ========================

  public query ({ caller }) func getAllUsers() : async [(Principal, UserProfile)] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };
    userProfiles.toArray();
  };

  public query ({ caller }) func getAllUsersCheckIns() : async [(Principal, [DailyCheckIn])] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all users" # " check-ins");
    };
    userCheckIns.toArray().map(
      func((user, checkIns)) {
        (user, checkIns.toArray().sort());
      }
    );
  };

  // ======================== Get Summaries ========================

  public query ({ caller }) func getAllFoodItems() : async [FoodItem] {
    foodDatabase.values().toArray().sort();
  };

  public query ({ caller }) func getAllFoodLogs(user : Principal) : async [DailyFoodLog] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own food logs");
    };
    switch (userFoodLogs.get(user)) {
      case (null) { [] };
      case (?logs) { logs.toArray().sort() };
    };
  };

  public query ({ caller }) func getAllWaterIntake(user : Principal) : async [DailyWaterIntake] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own water intake logs");
    };
    switch (userWaterIntake.get(user)) {
      case (null) { [] };
      case (?intake) { intake.toArray().sort() };
    };
  };

  public query ({ caller }) func getAllHealthMetrics(user : Principal) : async [HealthMetrics] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own health metrics");
    };
    switch (userHealthMetrics.get(user)) {
      case (null) { [] };
      case (?metrics) { metrics.toArray().sort() };
    };
  };
};
