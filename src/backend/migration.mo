import Map "mo:core/Map";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Principal "mo:core/Principal";

module {
  type OldProfileGoal = {
    #weightLoss;
    #muscleGain;
    #maintenance;
  };

  type OldUserProfile = {
    name : Text.Text;
    phone : Text.Text;
    weightKg : Float;
    heightCm : Float;
    goal : ?OldProfileGoal;
  };

  type OldPersistent = {
    userProfiles : Map.Map<Principal, OldUserProfile>;
  };

  type NewUserProfile = {
    name : Text.Text;
    phone : Text.Text;
    weightKg : Float;
    heightCm : Float;
    goal : ?OldProfileGoal;
    gender : ?Text.Text;
  };

  type NewPersistent = {
    userProfiles : Map.Map<Principal, NewUserProfile>;
  };

  public func run(old : OldPersistent) : NewPersistent {
    let newUserProfiles = old.userProfiles.map<Principal, OldUserProfile, NewUserProfile>(
      func(_principal, oldProfile) {
        { oldProfile with gender = null };
      }
    );
    { userProfiles = newUserProfiles };
  };
};
