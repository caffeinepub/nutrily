import Map "mo:core/Map";
import Time "mo:core/Time";
import Set "mo:core/Set";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

module {
  // Old types
  type OldUserProfile = {
    name : Text;
    phone : Text;
    weightKg : Float;
    heightCm : Float;
  };

  type OldFoodItem = {
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
  };

  type OldActor = {
    userProfiles : Map.Map<Principal.Principal, OldUserProfile>;
    foodDatabase : Map.Map<Text, OldFoodItem>;
  };

  // New types
  type ProfileGoal = {
    #weightLoss;
    #muscleGain;
    #maintenance;
  };

  type NewUserProfile = {
    name : Text;
    phone : Text;
    weightKg : Float;
    heightCm : Float;
    goal : ?ProfileGoal;
  };

  type NewFoodItem = {
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

  type FoodSuggestionStatus = { #pending; #approved; #rejected };

  type FoodSuggestion = {
    foodItem : NewFoodItem;
    status : FoodSuggestionStatus;
    submittedBy : Principal.Principal;
    timestamp : Time.Time;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal.Principal, NewUserProfile>;
    foodDatabase : Map.Map<Text, NewFoodItem>;
    foodSuggestions : Map.Map<Nat, FoodSuggestion>;
    nextSuggestionId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    let newUserProfiles = old.userProfiles.map<Principal.Principal, OldUserProfile, NewUserProfile>(
      func(_p, oldProfile) {
        { oldProfile with goal = null };
      }
    );

    let newFoodDatabase = old.foodDatabase.map<Text, OldFoodItem, NewFoodItem>(
      func(_name, oldItem) {
        { oldItem with region = "Unknown" };
      }
    );

    {
      userProfiles = newUserProfiles;
      foodDatabase = newFoodDatabase;
      foodSuggestions = Map.empty<Nat, FoodSuggestion>();
      nextSuggestionId = 1;
    };
  };
};
