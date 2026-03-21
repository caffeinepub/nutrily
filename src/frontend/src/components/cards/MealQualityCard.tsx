interface Props {
  score: number;
  grade: string;
}

export default function MealQualityCard({ score, grade }: Props) {
  const gradeColor =
    score >= 90
      ? "oklch(0.62 0.14 155)"
      : score >= 75
        ? "oklch(0.62 0.14 155)"
        : score >= 60
          ? "oklch(0.73 0.15 60)"
          : score >= 45
            ? "oklch(0.73 0.15 60)"
            : "oklch(0.577 0.245 27.325)";

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">
        Meal Quality Score
      </h3>

      <div className="flex items-center gap-4 mb-4">
        <div className="text-4xl font-extrabold" style={{ color: gradeColor }}>
          {score > 0 ? `${score}%` : "—"}
        </div>
        <div>
          <div
            className="text-2xl font-bold px-3 py-1 rounded-lg"
            style={{ background: `${gradeColor}18`, color: gradeColor }}
          >
            {grade}
          </div>
        </div>
      </div>

      <div className="h-2.5 rounded-full bg-muted overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, background: gradeColor }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {score === 0
          ? "Log some food to see your score"
          : score >= 75
            ? "Great nutritional balance today!"
            : "Keep logging to improve your balance"}
      </p>
    </div>
  );
}
