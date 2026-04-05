import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Ruler, Scale, User } from "lucide-react";
import type { UserProfile } from "../backend";

interface Props {
  profile: UserProfile | null | undefined;
}

function bmi(weight: number, height: number) {
  if (!weight || !height) return null;
  const h = height / 100;
  return (weight / (h * h)).toFixed(1);
}

function bmiLabel(bmiVal: string) {
  const n = Number.parseFloat(bmiVal);
  if (n < 18.5) return { label: "Underweight", color: "text-warning" };
  if (n < 25) return { label: "Normal", color: "text-primary" };
  if (n < 30) return { label: "Overweight", color: "text-orange-500" };
  return { label: "Obese", color: "text-destructive" };
}

export default function MyStatsCard({ profile }: Props) {
  if (!profile) return null;
  const bmiVal = bmi(profile.weightKg, profile.heightCm);
  const bmiInfo = bmiVal ? bmiLabel(bmiVal) : null;

  return (
    <Card className="border-border shadow-card" data-ocid="stats.card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <User className="w-4 h-4 text-primary" />
          My Stats
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2.5 bg-muted/40 rounded-lg p-2.5">
            <User className="w-4 h-4 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground">Name</p>
              <p className="text-sm font-semibold text-foreground truncate">
                {profile.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 bg-muted/40 rounded-lg p-2.5">
            <Phone className="w-4 h-4 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground">User Code</p>
              <p className="text-sm font-semibold text-foreground truncate">
                {(profile as any).username ?? (profile as any).phone}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 bg-muted/40 rounded-lg p-2.5">
            <Scale className="w-4 h-4 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground">Weight</p>
              <p className="text-sm font-semibold text-foreground">
                {profile.weightKg} kg
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 bg-muted/40 rounded-lg p-2.5">
            <Ruler className="w-4 h-4 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground">Height</p>
              <p className="text-sm font-semibold text-foreground">
                {profile.heightCm} cm
              </p>
            </div>
          </div>
        </div>
        {bmiInfo && (
          <div className="mt-3 flex items-center justify-between bg-muted/40 rounded-lg p-2.5">
            <span className="text-xs text-muted-foreground">BMI</span>
            <span className={`text-sm font-bold ${bmiInfo.color}`}>
              {bmiVal} — {bmiInfo.label}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
