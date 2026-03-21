import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CalendarDays,
  CheckCircle2,
  Droplets,
  Dumbbell,
  Loader2,
  Moon,
  Salad,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { DailyCheckIn } from "../backend";
import { useSaveDailyCheckIn } from "../hooks/useQueries";

interface Props {
  recentCheckIns: DailyCheckIn[];
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function CheckInHistory({ checkIns }: { checkIns: DailyCheckIn[] }) {
  if (checkIns.length === 0) return null;
  const sorted = [...checkIns].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <div className="mt-4 space-y-3">
      <h4 className="text-sm font-semibold text-foreground">Past Check-ins</h4>
      {sorted.slice(0, 7).map((ci, i) => (
        <div
          key={ci.date}
          data-ocid={`checkin.item.${i + 1}`}
          className="bg-muted/50 rounded-lg p-3 text-xs space-y-1.5"
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground flex items-center gap-1">
              <CalendarDays className="w-3 h-3" />
              {ci.date}
            </span>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-[10px] py-0">
                <Droplets className="w-2.5 h-2.5 mr-1" />
                {Number(ci.waterGlasses)} glasses
              </Badge>
              <Badge variant="outline" className="text-[10px] py-0">
                <Moon className="w-2.5 h-2.5 mr-1" />
                {ci.sleepHours}h sleep
              </Badge>
            </div>
          </div>
          {ci.dietNotes && (
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">Diet:</span>{" "}
              {ci.dietNotes}
            </p>
          )}
          {ci.exercisesDone && (
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">Exercise:</span>{" "}
              {ci.exercisesDone}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export default function DailyCheckInCard({ recentCheckIns }: Props) {
  const today = todayStr();
  const alreadyCheckedIn = recentCheckIns.some((c) => c.date === today);

  const [dietNotes, setDietNotes] = useState("");
  const [exercisesDone, setExercisesDone] = useState("");
  const [waterGlasses, setWaterGlasses] = useState("8");
  const [sleepHours, setSleepHours] = useState("7");
  const [showHistory, setShowHistory] = useState(false);

  const { mutateAsync, isPending } = useSaveDailyCheckIn();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await mutateAsync({
        date: today,
        dietNotes: dietNotes.trim(),
        exercisesDone: exercisesDone.trim(),
        waterGlasses: BigInt(Math.round(Number(waterGlasses) || 0)),
        sleepHours: Number.parseFloat(sleepHours) || 0,
      });
      toast.success("Daily check-in saved!");
      setDietNotes("");
      setExercisesDone("");
      setWaterGlasses("8");
      setSleepHours("7");
    } catch {
      toast.error("Failed to save check-in.");
    }
  };

  return (
    <Card className="border-border shadow-card" data-ocid="checkin.card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            Daily Check-In
          </CardTitle>
          <Badge
            variant={alreadyCheckedIn ? "default" : "outline"}
            className="text-xs"
          >
            {alreadyCheckedIn ? "✓ Done today" : "Pending"}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{today}</p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label className="text-xs font-medium flex items-center gap-1 mb-1">
              <Salad className="w-3 h-3" /> Diet Notes
            </Label>
            <Textarea
              data-ocid="checkin.diet_textarea"
              placeholder="What did you eat today?"
              value={dietNotes}
              onChange={(e) => setDietNotes(e.target.value)}
              className="text-sm resize-none h-16"
            />
          </div>

          <div>
            <Label className="text-xs font-medium flex items-center gap-1 mb-1">
              <Dumbbell className="w-3 h-3" /> Exercises Done
            </Label>
            <Textarea
              data-ocid="checkin.exercise_textarea"
              placeholder="What exercises did you do?"
              value={exercisesDone}
              onChange={(e) => setExercisesDone(e.target.value)}
              className="text-sm resize-none h-16"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium flex items-center gap-1 mb-1">
                <Droplets className="w-3 h-3" /> Water (glasses)
              </Label>
              <Input
                data-ocid="checkin.water_input"
                type="number"
                min="0"
                max="30"
                value={waterGlasses}
                onChange={(e) => setWaterGlasses(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs font-medium flex items-center gap-1 mb-1">
                <Moon className="w-3 h-3" /> Sleep (hours)
              </Label>
              <Input
                data-ocid="checkin.sleep_input"
                type="number"
                min="0"
                max="24"
                step="0.5"
                value={sleepHours}
                onChange={(e) => setSleepHours(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
          </div>

          <Button
            data-ocid="checkin.submit_button"
            type="submit"
            disabled={isPending}
            className="w-full h-9 text-sm hero-gradient text-white border-0 hover:opacity-90"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              "Submit Check-In"
            )}
          </Button>
        </form>

        {recentCheckIns.length > 0 && (
          <button
            type="button"
            data-ocid="checkin.history_toggle"
            onClick={() => setShowHistory((v) => !v)}
            className="mt-3 text-xs text-primary hover:underline font-medium"
          >
            {showHistory ? "Hide" : "Show"} history ({recentCheckIns.length})
          </button>
        )}
        {showHistory && <CheckInHistory checkIns={recentCheckIns} />}
      </CardContent>
    </Card>
  );
}
