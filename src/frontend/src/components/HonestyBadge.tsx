interface Props {
  rating: "clean" | "moderate" | "processed";
  size?: "sm" | "xs";
}

const BADGE_CONFIG = {
  clean: {
    emoji: "🟢",
    label: "Clean",
    className:
      "text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30",
  },
  moderate: {
    emoji: "🟡",
    label: "Moderate",
    className:
      "text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30",
  },
  processed: {
    emoji: "🔴",
    label: "Processed",
    className: "text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30",
  },
};

export default function HonestyBadge({ rating, size = "sm" }: Props) {
  const cfg = BADGE_CONFIG[rating];
  const sizeClass =
    size === "xs" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-0.5";
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full font-semibold ${sizeClass} ${cfg.className}`}
    >
      {cfg.emoji} {cfg.label}
    </span>
  );
}
