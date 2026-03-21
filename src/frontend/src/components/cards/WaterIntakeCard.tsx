import { useLogWaterIntake } from "../../hooks/useQueries";
import { DAILY_GOALS } from "../../types";

interface Props {
  glasses: number;
}

const GLASS_INDICES = [0, 1, 2, 3, 4, 5, 6, 7];

export default function WaterIntakeCard({ glasses }: Props) {
  const goal = DAILY_GOALS.water;
  const { mutate } = useLogWaterIntake();

  const handleToggle = (index: number) => {
    const newCount = index < glasses ? index : index + 1;
    mutate(newCount);
  };

  const pct = Math.round((glasses / goal) * 100);

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Water Intake</h3>
        <span className="text-xs text-muted-foreground">
          Daily Goal: {goal} glasses
        </span>
      </div>

      <div className="flex gap-2 mb-4">
        {GLASS_INDICES.slice(0, goal).map((i) => (
          <button
            key={`glass-${i}`}
            type="button"
            data-ocid={`water.toggle.${(i + 1) as 1}`}
            onClick={() => handleToggle(i)}
            title={`Glass ${i + 1}`}
            className="flex-1 flex flex-col items-center gap-1 transition-transform hover:scale-110"
          >
            <svg
              viewBox="0 0 24 32"
              className="w-full max-w-[22px]"
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
        Glasses tracked{" "}
        <span className="font-semibold text-foreground">
          {glasses}/{goal}
        </span>
      </p>
    </div>
  );
}
