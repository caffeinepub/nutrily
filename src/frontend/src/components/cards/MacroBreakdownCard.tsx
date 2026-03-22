import { Progress } from "@/components/ui/progress";
import { DAILY_GOALS } from "../../types";

interface Props {
  protein: number;
  carbs: number;
  fat: number;
}

export default function MacroBreakdownCard({ protein, carbs, fat }: Props) {
  const macros = [
    {
      name: "Protein",
      value: protein,
      goal: DAILY_GOALS.protein,
      unit: "g",
      color: "oklch(0.62 0.14 155)",
      kcalPerG: 4,
    },
    {
      name: "Carbs",
      value: carbs,
      goal: DAILY_GOALS.carbs,
      unit: "g",
      color: "oklch(0.56 0.2 260)",
      kcalPerG: 4,
    },
    {
      name: "Fat",
      value: fat,
      goal: DAILY_GOALS.fat,
      unit: "g",
      color: "oklch(0.73 0.15 60)",
      kcalPerG: 9,
    },
  ];

  const totalKcal = Math.round(protein * 4 + carbs * 4 + fat * 9);

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">
        Macro Breakdown
      </h3>
      <div className="space-y-4">
        {macros.map((m) => {
          const pct = Math.min(100, (m.value / m.goal) * 100);
          const kcal = Math.round(m.value * m.kcalPerG);
          return (
            <div key={m.name}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: m.color }}
                  />
                  <span className="text-xs font-medium text-foreground">
                    {m.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">
                    {Math.round(m.value)}
                    {m.unit} / {m.goal}
                    {m.unit}
                  </span>
                  <span className="text-[10px] text-muted-foreground/60">
                    ({kcal} kcal)
                  </span>
                </div>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, background: m.color }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5 text-right">
                {Math.round(pct)}% of goal
              </p>
            </div>
          );
        })}
      </div>
      {totalKcal > 0 && (
        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Total from macros:
          </span>
          <span className="text-xs font-semibold text-foreground">
            {totalKcal} kcal
          </span>
        </div>
      )}
    </div>
  );
}
