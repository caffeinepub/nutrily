import { Activity, Heart, Scale } from "lucide-react";
import type { HealthMetrics } from "../../backend";

interface Props {
  metrics: HealthMetrics | null | undefined;
  onEdit: () => void;
}

export default function MyMetricsCard({ metrics, onEdit }: Props) {
  const stats = [
    {
      icon: Scale,
      label: "Weight",
      value: metrics?.weight ? `${metrics.weight}` : "—",
      unit: "kg",
      color: "oklch(0.62 0.14 155)",
    },
    {
      icon: Activity,
      label: "Steps",
      value: metrics?.steps ? Number(metrics.steps).toLocaleString() : "—",
      unit: "steps",
      color: "oklch(0.56 0.2 260)",
    },
    {
      icon: Heart,
      label: "Heart Rate",
      value: metrics?.heartRate ? `${metrics.heartRate}` : "—",
      unit: "bpm",
      color: "oklch(0.577 0.245 27.325)",
    },
  ];

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">My Metrics</h3>
        <button
          type="button"
          data-ocid="metrics.edit_button"
          onClick={onEdit}
          className="text-xs text-primary font-medium hover:opacity-80 transition-opacity"
        >
          Update
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {stats.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={onEdit}
            className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-muted hover:bg-accent transition-colors text-center"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: `${s.color}18` }}
            >
              <s.icon size={15} style={{ color: s.color }} />
            </div>
            <span className="text-base font-bold text-foreground leading-none">
              {s.value}
            </span>
            <span className="text-[10px] text-muted-foreground">{s.unit}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
