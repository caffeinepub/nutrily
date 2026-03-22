import { DAILY_GOALS } from "../../types";

interface Props {
  calories: number;
}

export default function CalorieTrackerCard({ calories }: Props) {
  const goal = DAILY_GOALS.calories;
  const remaining = Math.max(0, goal - calories);
  const progress = Math.min(1, calories / goal);

  const r = 58;
  const cx = 80;
  const cy = 80;
  const circumference = 2 * Math.PI * r;
  const arcLen = circumference * 0.75;
  const gapLen = circumference - arcLen;
  const filledLen = arcLen * progress;
  const remainLen = circumference - filledLen;

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">
          Calorie Tracker
        </h3>
        <span className="text-xs text-muted-foreground">Today</span>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="relative flex-shrink-0">
          <svg
            width="160"
            height="110"
            viewBox="0 0 160 130"
            aria-label="Calorie gauge"
          >
            <title>Calorie progress gauge</title>
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke="oklch(0.91 0.008 225)"
              strokeWidth="11"
              strokeLinecap="round"
              strokeDasharray={`${arcLen} ${gapLen}`}
              transform={`rotate(135 ${cx} ${cy})`}
            />
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke="oklch(0.62 0.14 155)"
              strokeWidth="11"
              strokeLinecap="round"
              strokeDasharray={`${filledLen} ${remainLen}`}
              transform={`rotate(135 ${cx} ${cy})`}
              style={{ transition: "stroke-dasharray 0.6s ease" }}
            />
            <text
              x={cx}
              y={cy - 4}
              textAnchor="middle"
              fontSize="20"
              fontWeight="700"
              fill="oklch(0.23 0.02 245)"
            >
              {Math.round(calories)}
            </text>
            <text
              x={cx}
              y={cy + 14}
              textAnchor="middle"
              fontSize="10"
              fill="oklch(0.52 0.02 240)"
            >
              / {goal} kcal
            </text>
          </svg>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
            <span className="text-xs font-semibold text-primary">
              {remaining} Left
            </span>
          </div>
        </div>

        <div className="w-full">
          {calories === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-2">
              Log food to start tracking
            </p>
          ) : null}
          <div className="grid grid-cols-3 divide-x divide-border border border-border rounded-lg overflow-hidden">
            <div className="flex flex-col items-center py-3 px-2">
              <span className="text-[10px] text-muted-foreground mb-1">
                Consumed
              </span>
              <span className="text-sm font-bold text-foreground">
                {Math.round(calories)}
              </span>
              <span className="text-[10px] text-muted-foreground">kcal</span>
            </div>
            <div className="flex flex-col items-center py-3 px-2">
              <span className="text-[10px] text-muted-foreground mb-1">
                Goal
              </span>
              <span className="text-sm font-bold text-foreground">{goal}</span>
              <span className="text-[10px] text-muted-foreground">kcal</span>
            </div>
            <div className="flex flex-col items-center py-3 px-2">
              <span className="text-[10px] text-muted-foreground mb-1">
                Remaining
              </span>
              <span className="text-sm font-bold text-primary">
                {remaining}
              </span>
              <span className="text-[10px] text-muted-foreground">kcal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
