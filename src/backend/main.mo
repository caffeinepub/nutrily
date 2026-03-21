import Map "mo:core/Map";
import Set "mo:core/Set";
import Option "mo:core/Option";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Float "mo:core/Float";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  let accessControlState = AccessControl.initState();
  type Permissions = {
    #admin;
    #user;
    #anon;
  };
  include MixinAuthorization(accessControlState);

  // ======================== User Profile ========================

  public type UserProfile = {
    name : Text;
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

  // ======================== Data Types ========================

  type FoodItem = {
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

  // ======================== Food Database ========================

  module FoodItem {
    public func compareByName(f1 : FoodItem, f2 : FoodItem) : Order.Order {
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

  public query ({ caller }) func searchFoodByName(name : Text) : async [FoodItem] {
    foodDatabase.values().toArray().filter(func(f) { f.name.contains(#text name) });
  };

  public query ({ caller }) func getFoodByCategory(category : Text) : async [FoodItem] {
    foodDatabase.values().toArray().filter(func(f) { f.category == category });
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

  // ======================== Data Seeding ========================

  system func preupgrade() {};
  system func postupgrade() {
    let sampleFoods : [FoodItem] = [
      // ---- Common foods ----
      {
        name = "Apple";
        category = "Fruit";
        caloriesPer100g = 52;
        protein = 0.3;
        carbs = 14;
        fat = 0.2;
        fiber = 2.4;
        sugar = 10.4;
        servingSize = 100;
        servingUnit = "g";
      },
      {
        name = "Banana";
        category = "Fruit";
        caloriesPer100g = 89;
        protein = 1.1;
        carbs = 23;
        fat = 0.3;
        fiber = 2.6;
        sugar = 12.2;
        servingSize = 100;
        servingUnit = "g";
      },
      {
        name = "Chicken Breast";
        category = "Protein";
        caloriesPer100g = 165;
        protein = 31;
        carbs = 0;
        fat = 3.6;
        fiber = 0;
        sugar = 0;
        servingSize = 100;
        servingUnit = "g";
      },
      {
        name = "Brown Rice";
        category = "Grain";
        caloriesPer100g = 111;
        protein = 2.6;
        carbs = 23;
        fat = 0.9;
        fiber = 1.8;
        sugar = 0.4;
        servingSize = 100;
        servingUnit = "g";
      },
      {
        name = "Egg";
        category = "Protein";
        caloriesPer100g = 155;
        protein = 13;
        carbs = 1.1;
        fat = 11;
        fiber = 0;
        sugar = 1.1;
        servingSize = 100;
        servingUnit = "g";
      },
      {
        name = "Milk";
        category = "Dairy";
        caloriesPer100g = 42;
        protein = 3.4;
        carbs = 5;
        fat = 1;
        fiber = 0;
        sugar = 5;
        servingSize = 100;
        servingUnit = "ml";
      },
      {
        name = "Broccoli";
        category = "Vegetable";
        caloriesPer100g = 34;
        protein = 2.8;
        carbs = 7;
        fat = 0.4;
        fiber = 2.6;
        sugar = 1.7;
        servingSize = 100;
        servingUnit = "g";
      },
      {
        name = "Salmon";
        category = "Protein";
        caloriesPer100g = 208;
        protein = 20;
        carbs = 0;
        fat = 13;
        fiber = 0;
        sugar = 0;
        servingSize = 100;
        servingUnit = "g";
      },
      {
        name = "Oats";
        category = "Grain";
        caloriesPer100g = 389;
        protein = 16.9;
        carbs = 66;
        fat = 6.9;
        fiber = 10.6;
        sugar = 0;
        servingSize = 100;
        servingUnit = "g";
      },
      {
        name = "Yogurt";
        category = "Dairy";
        caloriesPer100g = 59;
        protein = 3.5;
        carbs = 3.6;
        fat = 3.3;
        fiber = 0;
        sugar = 3.2;
        servingSize = 100;
        servingUnit = "g";
      },
      {
        name = "Bread";
        category = "Bread";
        caloriesPer100g = 265;
        protein = 9;
        carbs = 49;
        fat = 3.2;
        fiber = 2.7;
        sugar = 5;
        servingSize = 100;
        servingUnit = "g";
      },
      {
        name = "Orange";
        category = "Fruit";
        caloriesPer100g = 43;
        protein = 0.9;
        carbs = 8.8;
        fat = 0.2;
        fiber = 2.2;
        sugar = 8.6;
        servingSize = 100;
        servingUnit = "g";
      },
      {
        name = "Spinach";
        category = "Vegetable";
        caloriesPer100g = 23;
        protein = 2.9;
        carbs = 3.6;
        fat = 0.4;
        fiber = 2.2;
        sugar = 0.4;
        servingSize = 100;
        servingUnit = "g";
      },
      {
        name = "Almonds";
        category = "Nut";
        caloriesPer100g = 579;
        protein = 21;
        carbs = 22;
        fat = 50;
        fiber = 12.5;
        sugar = 3.9;
        servingSize = 28;
        servingUnit = "g";
      },
      {
        name = "Sweet Potato";
        category = "Vegetable";
        caloriesPer100g = 86;
        protein = 1.6;
        carbs = 20.1;
        fat = 0.1;
        fiber = 3;
        sugar = 4.2;
        servingSize = 100;
        servingUnit = "g";
      },
      {
        name = "Lentils";
        category = "Grain";
        caloriesPer100g = 116;
        protein = 9.02;
        carbs = 20.13;
        fat = 0.38;
        fiber = 7.9;
        sugar = 1.8;
        servingSize = 100;
        servingUnit = "g";
      },
      {
        name = "Avocado";
        category = "Fruit";
        caloriesPer100g = 160;
        protein = 2;
        carbs = 8.5;
        fat = 14.7;
        fiber = 6.7;
        sugar = 0.7;
        servingSize = 100;
        servingUnit = "g";
      },
      {
        name = "Cheese";
        category = "Dairy";
        caloriesPer100g = 402;
        protein = 25;
        carbs = 1.3;
        fat = 33;
        fiber = 0;
        sugar = 1;
        servingSize = 28;
        servingUnit = "g";
      },
      {
        name = "Tomato";
        category = "Vegetable";
        caloriesPer100g = 18;
        protein = 0.9;
        carbs = 3.9;
        fat = 0.2;
        fiber = 1.2;
        sugar = 2.6;
        servingSize = 100;
        servingUnit = "g";
      },
      {
        name = "Carrot";
        category = "Vegetable";
        caloriesPer100g = 41;
        protein = 0.9;
        carbs = 9.6;
        fat = 0.2;
        fiber = 2.8;
        sugar = 4.7;
        servingSize = 100;
        servingUnit = "g";
      },

      // ======================== Kerala Foods ========================

      // --- Rice & Staples ---
      {
        name = "Kerala Red Rice";
        category = "Kerala Staple";
        caloriesPer100g = 362;
        protein = 7.5;
        carbs = 77;
        fat = 2;
        fiber = 3.5;
        sugar = 0.5;
        servingSize = 100;
        servingUnit = "g";
      },
      {
        name = "Puttu";
        category = "Kerala Breakfast";
        caloriesPer100g = 350;
        protein = 6;
        carbs = 74;
        fat = 2.5;
        fiber = 2;
        sugar = 0.5;
        servingSize = 100;
        servingUnit = "g";
      },
      {
        name = "Appam";
        category = "Kerala Breakfast";
        caloriesPer100g = 160;
        protein = 3.5;
        carbs = 30;
        fat = 3;
        fiber = 0.8;
        sugar = 1;
        servingSize = 100;
        servingUnit = "g";
      },
      {
        name = "Idiyappam";
        category = "Kerala Breakfast";
        caloriesPer100g = 175;
        protein = 3.2;
        carbs = 37;
        fat = 0.5;
        fiber = 0.6;
        sugar = 0.3;
        servingSize = 100;
        servingUnit = "g";
      },
      {
        name = "Dosa";
        category = "Kerala Breakfast";
        caloriesPer100g = 168;
        protein = 3.8;
        carbs = 30;
        fat = 3.7;
        fiber = 1;
        sugar = 0.5;
        servingSize = 100;
        servingUnit = "g";
      },
      {
        name = "Idli";
        category = "Kerala Breakfast";
        caloriesPer100g = 130;
        protein = 3.4;
        carbs = 25;
        fat = 1.5;
        fiber = 0.7;
        sugar = 0.4;
        servingSize = 100;
        servingUnit = "g";
      },
      {
        name = "Pathiri";
        category = "Kerala Bread";
        caloriesPer100g = 320;
        protein = 6;
        carbs = 66;
        fat = 2;
        fiber = 1.5;
        sugar = 0.5;
        servingSize = 100;
        servingUnit = "g";
      },
      {
        name = "Porotta";
        category = "Kerala Bread";
        caloriesPer100g = 330;
        protein = 7;
        carbs = 55;
        fat = 9;
        fiber = 1.5;
        sugar = 1;
        servingSize = 100;
        servingUnit = "g";
      },
      {
        name = "Kanji (Rice Porridge)";
        category = "Kerala Staple";
        caloriesPer100g = 60;
        protein = 1.2;
        carbs = 13;
        fat = 0.2;
        fiber = 0.3;
        sugar = 0.2;
        servingSize = 200;
        servingUnit = "ml";
      },

      // --- Curries & Gravies ---
      {
        name = "Kerala Fish Curry";
        category = "Kerala Curry";
        caloriesPer100g = 120;
        protein = 14;
        carbs = 5;
        fat = 6;
        fiber = 1;
        sugar = 2;
        servingSize = 150;
        servingUnit = "g";
      },
      {
        name = "Meen Moilee";
        category = "Kerala Curry";
        caloriesPer100g = 115;
        protein = 13;
        carbs = 4;
        fat = 6;
        fiber = 0.8;
        sugar = 2;
        servingSize = 150;
        servingUnit = "g";
      },
      {
        name = "Kerala Prawn Curry";
        category = "Kerala Curry";
        caloriesPer100g = 130;
        protein = 16;
        carbs = 5;
        fat = 6;
        fiber = 1;
        sugar = 2;
        servingSize = 150;
        servingUnit = "g";
      },
      {
        name = "Chicken Stew";
        category = "Kerala Curry";
        caloriesPer100g = 110;
        protein = 14;
        carbs = 6;
        fat = 5;
        fiber = 1;
        sugar = 2;
        servingSize = 150;
        servingUnit = "g";
      },
      {
        name = "Mutton Curry Kerala";
        category = "Kerala Curry";
        caloriesPer100g = 180;
        protein = 18;
        carbs = 5;
        fat = 11;
        fiber = 1;
        sugar = 2;
        servingSize = 150;
        servingUnit = "g";
      },
      {
        name = "Beef Curry Kerala";
        category = "Kerala Curry";
        caloriesPer100g = 190;
        protein = 19;
        carbs = 5;
        fat = 12;
        fiber = 1;
        sugar = 2;
        servingSize = 150;
        servingUnit = "g";
      },
      {
        name = "Sambar";
        category = "Kerala Curry";
        caloriesPer100g = 50;
        protein = 3;
        carbs = 7;
        fat = 1.5;
        fiber = 2;
        sugar = 2;
        servingSize = 150;
        servingUnit = "ml";
      },
      {
        name = "Rasam";
        category = "Kerala Curry";
        caloriesPer100g = 30;
        protein = 1.5;
        carbs = 4;
        fat = 0.8;
        fiber = 0.5;
        sugar = 1;
        servingSize = 150;
        servingUnit = "ml";
      },
      {
        name = "Olan";
        category = "Kerala Vegetarian";
        caloriesPer100g = 75;
        protein = 2;
        carbs = 8;
        fat = 4;
        fiber = 2;
        sugar = 2;
        servingSize = 100;
        servingUnit = "g";
      },
      {
        name = "Avial";
        category = "Kerala Vegetarian";
        caloriesPer100g = 85;
        protein = 2;
        carbs = 9;
        fat = 4.5;
        fiber = 2.5;
        sugar = 3;
        servingSize = 100;
        servingUnit = "g";
      },
      {
        name = "Thoran (Cabbage)";
        category = "Kerala Vegetarian";
        caloriesPer100g = 80;
        protein = 2.5;
        carbs = 7;
        fat = 4.5;
        fiber = 3;
        sugar = 2;
        servingSize = 100;
        servingUnit = "g";
      },
      {
        name = "Thoran (Beans)";
        category = "Kerala Vegetarian";
        caloriesPer100g = 85;
        protein = 3;
        carbs = 8;
        fat = 4.5;
        fiber = 3.5;
        sugar = 2;
        servingSize = 100;
        servingUnit = "g";
      },
      {
        name = "Erissery";
        category = "Kerala Vegetarian";
        caloriesPer100g = 120;
        protein = 3.5;
        carbs = 14;
        fat = 6;
        fiber = 4;
        sugar = 3;
        servingSize = 100;
        servingUnit = "g";
      },
      {
        name = "Kalan";
        category = "Kerala Vegetarian";
        caloriesPer100g = 110;
        protein = 2;
        carbs = 10;
        fat = 7;
        fiber = 2;
        sugar = 4;
        servingSize = 100;
        servingUnit = "g";
      },
      {
        name = "Kootu Curry";
        category = "Kerala Vegetarian";
        caloriesPer100g = 130;
        protein = 4;
        carbs = 14;
        fat = 7;
        fiber = 4;
        sugar = 3;
        servingSize = 100;
        servingUnit = "g";
      },
      {
        name = "Pachadi";
        category = "Kerala Vegetarian";
        caloriesPer100g = 90;
        protein = 2;
        carbs = 9;
        fat = 5;
        fiber = 1.5;
        sugar = 5;
        servingSize = 100;
        servingUnit = "g";
      },
      {
        name = "Pulissery";
        category = "Kerala Vegetarian";
        caloriesPer100g = 80;
        protein = 2;
        carbs = 8;
        fat = 4.5;
        fiber = 0.5;
        sugar = 4;
        servingSize = 100;
        servingUnit = "ml";
      },
      {
        name = "Dal Tadka Kerala";
        category = "Kerala Vegetarian";
        caloriesPer100g = 100;
        protein = 6;
        carbs = 12;
        fat = 3;
        fiber = 3;
        sugar = 1;
        servingSize = 150;
        servingUnit = "ml";
      },

      // --- Snacks & Street Food ---
      {
        name = "Banana Chips";
        category = "Kerala Snack";
        caloriesPer100g = 519;
        protein = 2;
        carbs = 60;
        fat = 30;
        fiber = 5;
        sugar = 3;
        servingSize = 30;
        servingUnit = "g";
      },
      {
        name = "Pazham Pori (Banana Fritter)";
        category = "Kerala Snack";
        caloriesPer100g = 230;
        protein = 2.5;
        carbs = 35;
        fat = 9;
        fiber = 1.5;
        sugar = 12;
        servingSize = 60;
        servingUnit = "g";
      },
      {
        name = "Uzhunnu Vada";
        category = "Kerala Snack";
        caloriesPer100g = 310;
        protein = 10;
        carbs = 38;
        fat = 14;
        fiber = 3;
        sugar = 1;
        servingSize = 50;
        servingUnit = "g";
      },
      {
        name = "Parippu Vada";
        category = "Kerala Snack";
        caloriesPer100g = 295;
        protein = 12;
        carbs = 36;
        fat = 13;
        fiber = 4;
        sugar = 1;
        servingSize = 50;
        servingUnit = "g";
      },
      {
        name = "Kuzhalappam";
        category = "Kerala Snack";
        caloriesPer100g = 430;
        protein = 5;
        carbs = 65;
        fat = 16;
        fiber = 2;
        sugar = 2;
        servingSize = 30;
        servingUnit = "g";
      },
      {
        name = "Achappam";
        category = "Kerala Snack";
        caloriesPer100g = 450;
        protein = 6;
        carbs = 60;
        fat = 20;
        fiber = 1.5;
        sugar = 15;
        servingSize = 30;
        servingUnit = "g";
      },
      {
        name = "Murukku";
        category = "Kerala Snack";
        caloriesPer100g = 450;
        protein = 9;
        carbs = 63;
        fat = 18;
        fiber = 3;
        sugar = 1;
        servingSize = 30;
        servingUnit = "g";
      },
      {
        name = "Neyyappam";
        category = "Kerala Snack";
        caloriesPer100g = 290;
        protein = 4;
        carbs = 48;
        fat = 9;
        fiber = 1;
        sugar = 20;
        servingSize = 50;
        servingUnit = "g";
      },
      {
        name = "Unniyappam";
        category = "Kerala Snack";
        caloriesPer100g = 270;
        protein = 3.5;
        carbs = 46;
        fat = 8;
        fiber = 1.5;
        sugar = 18;
        servingSize = 40;
        servingUnit = "g";
      },
      {
        name = "Parippupayasam";
        category = "Kerala Dessert";
        caloriesPer100g = 200;
        protein = 5;
        carbs = 35;
        fat = 5;
        fiber = 2;
        sugar = 20;
        servingSize = 100;
        servingUnit = "ml";
      },

      // --- Seafood ---
      {
        name = "Karimeen (Pearl Spot Fish)";
        category = "Kerala Seafood";
        caloriesPer100g = 105;
        protein = 20;
        carbs = 0;
        fat = 2.5;
        fiber = 0;
        sugar = 0;
        servingSize = 100;
        servingUnit = "g";
      },
      {
        name = "Netholi (Anchovies)";
        category = "Kerala Seafood";
        caloriesPer100g = 131;
        protein = 20;
        carbs = 0;
        fat = 5;
        fiber = 0;
        sugar = 0;
        servingSize = 100;
        servingUnit = "g";
      },
      {
        name = "Mathi (Sardine)";
        category = "Kerala Seafood";
        caloriesPer100g = 185;
        protein = 21;
        carbs = 0;
        fat = 11;
        fiber = 0;
        sugar = 0;
        servingSize = 100;
        servingUnit = "g";
      },
      {
        name = "Konju (Prawns)";
        category = "Kerala Seafood";
        caloriesPer100g = 99;
        protein = 21;
        carbs = 0.9;
        fat = 1.5;
        fiber = 0;
        sugar = 0;
        servingSize = 100;
        servingUnit = "g";
      },
      {
        name = "Njandu (Crab)";
        category = "Kerala Seafood";
        caloriesPer100g = 87;
        protein = 18;
        carbs = 0;
        fat = 1.5;
        fiber = 0;
        sugar = 0;
        servingSize = 100;
        servingUnit = "g";
      },
      {
        name = "Ayala (Mackerel)";
        category = "Kerala Seafood";
        caloriesPer100g = 205;
        protein = 19;
        carbs = 0;
        fat = 14;
        fiber = 0;
        sugar = 0;
        servingSize = 100;
        servingUnit = "g";
      },

      // --- Desserts & Sweets ---
      {
        name = "Payasam (Kheer)";
        category = "Kerala Dessert";
        caloriesPer100g = 145;
        protein = 3.5;
        carbs = 25;
        fat = 4;
        fiber = 0.5;
        sugar = 18;
        servingSize = 100;
        servingUnit = "ml";
      },
      {
        name = "Halwa (Wheat)";
        category = "Kerala Dessert";
        caloriesPer100g = 350;
        protein = 4;
        carbs = 58;
        fat = 12;
        fiber = 1;
        sugar = 35;
        servingSize = 60;
        servingUnit = "g";
      },
      {
        name = "Kozhukatta";
        category = "Kerala Snack";
        caloriesPer100g = 190;
        protein = 3;
        carbs = 38;
        fat = 3;
        fiber = 1.5;
        sugar = 10;
        servingSize = 60;
        servingUnit = "g";
      },
      {
        name = "Paal Payasam";
        category = "Kerala Dessert";
        caloriesPer100g = 130;
        protein = 4;
        carbs = 22;
        fat = 3.5;
        fiber = 0;
        sugar = 16;
        servingSize = 100;
        servingUnit = "ml";
      },

      // --- Rice Dishes ---
      {
        name = "Kerala Biryani";
        category = "Kerala Rice";
        caloriesPer100g = 200;
        protein = 10;
        carbs = 28;
        fat = 6;
        fiber = 1;
        sugar = 1;
        servingSize = 250;
        servingUnit = "g";
      },
      {
        name = "Ghee Rice";
        category = "Kerala Rice";
        caloriesPer100g = 220;
        protein = 4;
        carbs = 38;
        fat = 6;
        fiber = 0.5;
        sugar = 0.5;
        servingSize = 200;
        servingUnit = "g";
      },
      {
        name = "Tamarind Rice";
        category = "Kerala Rice";
        caloriesPer100g = 180;
        protein = 3;
        carbs = 33;
        fat = 4.5;
        fiber = 1.5;
        sugar = 2;
        servingSize = 200;
        servingUnit = "g";
      },

      // --- Vegetables ---
      {
        name = "Raw Banana";
        category = "Kerala Vegetable";
        caloriesPer100g = 110;
        protein = 1.3;
        carbs = 26;
        fat = 0.3;
        fiber = 2.6;
        sugar = 12;
        servingSize = 100;
        servingUnit = "g";
      },
      {
        name = "Drumstick (Muringakka)";
        category = "Kerala Vegetable";
        caloriesPer100g = 37;
        protein = 2.1;
        carbs = 8.5;
        fat = 0.2;
        fiber = 3.2;
        sugar = 3;
        servingSize = 100;
        servingUnit = "g";
      },
      {
        name = "Elephant Yam (Chena)";
        category = "Kerala Vegetable";
        caloriesPer100g = 118;
        protein = 1.5;
        carbs = 27;
        fat = 0.2;
        fiber = 4;
        sugar = 0.5;
        servingSize = 100;
        servingUnit = "g";
      },
      {
        name = "Jackfruit (Chakka)";
        category = "Kerala Vegetable";
        caloriesPer100g = 95;
        protein = 1.7;
        carbs = 23;
        fat = 0.6;
        fiber = 1.5;
        sugar = 19;
        servingSize = 100;
        servingUnit = "g";
      },
      {
        name = "Bitter Gourd (Pavakka)";
        category = "Kerala Vegetable";
        caloriesPer100g = 17;
        protein = 1;
        carbs = 3.7;
        fat = 0.2;
        fiber = 2.8;
        sugar = 1.7;
        servingSize = 100;
        servingUnit = "g";
      },
      {
        name = "Snake Gourd (Padavalanga)";
        category = "Kerala Vegetable";
        caloriesPer100g = 18;
        protein = 0.5;
        carbs = 3.9;
        fat = 0.1;
        fiber = 0.6;
        sugar = 2;
        servingSize = 100;
        servingUnit = "g";
      },
      {
        name = "Ash Gourd (Kumbalanga)";
        category = "Kerala Vegetable";
        caloriesPer100g = 13;
        protein = 0.4;
        carbs = 3;
        fat = 0.2;
        fiber = 2.9;
        sugar = 1.5;
        servingSize = 100;
        servingUnit = "g";
      },
      {
        name = "Tapioca (Kappa)";
        category = "Kerala Staple";
        caloriesPer100g = 160;
        protein = 1.4;
        carbs = 38;
        fat = 0.3;
        fiber = 1.8;
        sugar = 1.7;
        servingSize = 100;
        servingUnit = "g";
      },

      // --- Beverages ---
      {
        name = "Coconut Water";
        category = "Kerala Beverage";
        caloriesPer100g = 19;
        protein = 0.7;
        carbs = 3.7;
        fat = 0.2;
        fiber = 1.1;
        sugar = 2.6;
        servingSize = 240;
        servingUnit = "ml";
      },
      {
        name = "Sulaimani Tea";
        category = "Kerala Beverage";
        caloriesPer100g = 5;
        protein = 0.1;
        carbs = 1;
        fat = 0;
        fiber = 0;
        sugar = 0.5;
        servingSize = 200;
        servingUnit = "ml";
      },
      {
        name = "Kerala Black Tea";
        category = "Kerala Beverage";
        caloriesPer100g = 2;
        protein = 0;
        carbs = 0.5;
        fat = 0;
        fiber = 0;
        sugar = 0;
        servingSize = 200;
        servingUnit = "ml";
      },

      // --- Condiments & Chutneys ---
      {
        name = "Coconut Chutney";
        category = "Kerala Condiment";
        caloriesPer100g = 200;
        protein = 2;
        carbs = 8;
        fat = 18;
        fiber = 4;
        sugar = 3;
        servingSize = 50;
        servingUnit = "g";
      },
      {
        name = "Mango Pickle (Achar)";
        category = "Kerala Condiment";
        caloriesPer100g = 120;
        protein = 1;
        carbs = 15;
        fat = 7;
        fiber = 2;
        sugar = 8;
        servingSize = 20;
        servingUnit = "g";
      },
      {
        name = "Pappadam";
        category = "Kerala Condiment";
        caloriesPer100g = 400;
        protein = 20;
        carbs = 60;
        fat = 8;
        fiber = 6;
        sugar = 1;
        servingSize = 10;
        servingUnit = "g";
      },
    ];

    for (food in sampleFoods.values()) {
      foodDatabase.add(food.name.toLower(), food);
    };
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

  let userFoodLogs = Map.empty<Principal, Set.Set<DailyFoodLog>>();

  module DailyFoodLog {
    public func compare(log1 : DailyFoodLog, log2 : DailyFoodLog) : Order.Order {
      Int.compare(log1.timestamp, log2.timestamp);
    };
  };

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

  public query ({ caller }) func getFoodLogsForDate(date : Time.Time) : async [DailyFoodLog] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can fetch food logs");
    };
    switch (userFoodLogs.get(caller)) {
      case (null) { [] };
      case (?logsList) {
        logsList.toArray().sort().filter(
          func(log) {
            let logDay = log.timestamp / (24 * 60 * 60 * 1000000000); // Convert to days
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
            let metricsDay = metrics.timestamp / (24 * 60 * 60 * 1000000000); // Convert to days
            let targetDay = date / (24 * 60 * 60 * 1000000000);
            metricsDay == targetDay;
          }
        );
      };
    };
  };

  // ======================== Helper Functions ========================

  func getFoodByNameInternal(name : Text) : FoodItem {
    switch (foodDatabase.get(name)) {
      case (null) { Runtime.trap("Food item not found") };
      case (?food) { food };
    };
  };

  // ======================== Get Summaries ========================

  public query ({ caller }) func getAllFoodItems() : async [FoodItem] {
    foodDatabase.values().toArray().sort(FoodItem.compareByName);
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
