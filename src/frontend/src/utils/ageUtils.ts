export type AgeGroup = "teen" | "youngAdult" | "middleAge" | "senior";

export function getAgeGroup(age: number): AgeGroup {
  if (age < 18) return "teen";
  if (age <= 35) return "youngAdult";
  if (age <= 55) return "middleAge";
  return "senior";
}

export function getAgeGroupLabel(group: AgeGroup): string {
  switch (group) {
    case "teen":
      return "Teen (13–17)";
    case "youngAdult":
      return "Young Adult (18–35)";
    case "middleAge":
      return "Middle Age (36–55)";
    case "senior":
      return "Senior (56+)";
  }
}

export function getWaterGoalLitres(age: number): number {
  if (age < 18) return 1.5;
  if (age <= 55) return 2.0;
  return 1.8;
}

/** Returns number of 250ml glasses for daily water goal */
export function getWaterGoalGlasses(age: number): number {
  return Math.round(getWaterGoalLitres(age) * 4); // 1L = 4 glasses
}

export function getUserAge(): number {
  try {
    const raw = localStorage.getItem("doitepic_user");
    if (!raw) return 25;
    const parsed = JSON.parse(raw);
    return typeof parsed.age === "number" ? parsed.age : 25;
  } catch {
    return 25;
  }
}
