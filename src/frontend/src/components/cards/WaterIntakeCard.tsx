import { useLogWaterIntake } from "../../hooks/useQueries";
import {
  getUserAge,
  getWaterGoalGlasses,
  getWaterGoalLitres,
} from "../../utils/ageUtils";

interface Props {
  glasses: number;
}

export default function WaterIntakeCard({ glasses }: Props) {
  const age = getUserAge();
  const goalGlasses = getWaterGoalGlasses(age);
  const goalLitres = getWaterGoalLitres(age);
  const { mutate } = useLogWaterIntake();

  const handleToggle = (index: number) => {
    const newCount = index < glasses ? index : index + 1;
    mutate(newCount);
  };

  const mlConsumed = glasses * 250;
  const mlGoal = goalGlasses * 250;
  const litresConsumed = mlConsumed / 1000;
  const pct = Math.min(Math.round((glasses / goalGlasses) * 100), 100);

  // Age-based label
  let ageNote = "";
  if (age < 18) ageNote = "Teen: 1.5L daily";
  else if (age <= 55) ageNote = "Adult: 2.0L daily";
  else ageNote = "Senior: 1.8L daily";

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-5">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-foreground">Water Intake</h3>
        <span className="text-xs text-muted-foreground">{ageNote}</span>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Goal:{" "}
        <span className="font-semibold text-foreground">
          {goalLitres.toFixed(1)} L
        </span>{" "}
        · {goalGlasses} glasses of 250ml
      </p>

      <div className="flex gap-1.5 mb-4 flex-wrap">
        {Array.from({ length: goalGlasses }, (_, i) => i).map((i) => (
          <button
            key={`glass-${i}`}
            type="button"
            data-ocid={`water.toggle.${(i + 1) as 1}`}
            onClick={() => handleToggle(i)}
            title={`${(i + 1) * 250}ml`}
            className="flex flex-col items-center gap-1 transition-transform hover:scale-110"
            style={{
              width: `${Math.max(14, Math.min(22, Math.floor(100 / (goalGlasses + 1))))}px`,
            }}
          >
            <svg
              viewBox="0 0 24 32"
              className="w-full"
              fill="none"
              aria-hidden="true"
            >
              <title>Water glass {i + 1}</title>
              <path
                d="M4 6L6 28H18L20 6H4Z"
                fill={
                  i < glasses ? "oklch(0.56 0.2 260)" : "oklch(0.91 0.008 225)"
                }
                stroke={
                  i < glasses ? "oklch(0.48 0.18 260)" : "oklch(0.75 0.015 225)"
                }
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M4 6C4 4 7 2 12 2C17 2 20 4 20 6"
                stroke={
                  i < glasses ? "oklch(0.48 0.18 260)" : "oklch(0.75 0.015 225)"
                }
                strokeWidth="1.5"
                fill="none"
              />
            </svg>
          </button>
        ))}
      </div>

      <div className="h-2 rounded-full bg-muted overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: "oklch(0.56 0.2 260)" }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Consumed{" "}
        <span className="font-semibold text-foreground">
          {litresConsumed >= 1
            ? `${litresConsumed.toFixed(2)}L`
            : `${mlConsumed}ml`}
        </span>{" "}
        / {goalLitres.toFixed(1)}L{" "}
        <span className="text-muted-foreground/60">({mlGoal}ml goal)</span>
      </p>
    </div>
  );
}
