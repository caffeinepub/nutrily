import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const STORAGE_KEY = "doitepic_reminders";

interface MealReminder {
  enabled: boolean;
  time: string;
}

interface ReminderSettings {
  breakfast: MealReminder;
  lunch: MealReminder;
  dinner: MealReminder;
  snack: MealReminder;
  waterEnabled: boolean;
  waterIntervalHours: number;
}

const DEFAULT_SETTINGS: ReminderSettings = {
  breakfast: { enabled: false, time: "08:00" },
  lunch: { enabled: false, time: "13:00" },
  dinner: { enabled: false, time: "19:00" },
  snack: { enabled: false, time: "16:00" },
  waterEnabled: false,
  waterIntervalHours: 2,
};

function loadSettings(): ReminderSettings {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) return { ...DEFAULT_SETTINGS, ...JSON.parse(s) };
  } catch (_) {
    // ignore
  }
  return DEFAULT_SETTINGS;
}

const MEAL_LABELS: {
  key: keyof Pick<ReminderSettings, "breakfast" | "lunch" | "dinner" | "snack">;
  label: string;
  emoji: string;
}[] = [
  { key: "breakfast", label: "Breakfast", emoji: "🌅" },
  { key: "lunch", label: "Lunch", emoji: "☀️" },
  { key: "dinner", label: "Dinner", emoji: "🌙" },
  { key: "snack", label: "Snack", emoji: "🍎" },
];

export default function HabitRemindersCard() {
  const [settings, setSettings] = useState<ReminderSettings>(loadSettings);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (_) {
      // ignore
    }
  }, [settings]);

  useEffect(() => {
    const check = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const currentTime = `${hh}:${mm}`;

      for (const { key, label, emoji } of MEAL_LABELS) {
        const rem = settings[key];
        if (rem.enabled && rem.time === currentTime) {
          toast(`Time for ${label}! Log your meal ${emoji}`, {
            duration: 8000,
            icon: "🔔",
          });
        }
      }

      if (settings.waterEnabled) {
        try {
          const lastWater = localStorage.getItem("doitepic_last_water_log");
          const intervalMs = settings.waterIntervalHours * 60 * 60 * 1000;
          const lastTime = lastWater ? Number(lastWater) : 0;
          if (Date.now() - lastTime >= intervalMs) {
            toast("Time to drink water! Stay hydrated 💧", {
              duration: 8000,
              icon: "💧",
            });
            localStorage.setItem("doitepic_last_water_log", String(Date.now()));
          }
        } catch (_) {
          // ignore
        }
      }

      const hour = now.getHours();
      if (hour >= 21) {
        try {
          const logs = localStorage.getItem("doitepic_food_logs");
          const today = new Date().toISOString().split("T")[0];
          let hasTodayLog = false;
          if (logs) {
            const arr = JSON.parse(logs) as Array<{ date: string }>;
            hasTodayLog = arr.some((l) => l.date === today);
          }
          if (!hasTodayLog) {
            const alertedKey = `doitepic_missed_alert_${today}`;
            if (!localStorage.getItem(alertedKey)) {
              toast.warning(
                "You haven't logged any meals today! Don't forget to track your nutrition. 🍽️",
                { duration: 0, id: "missed-log-alert" },
              );
              localStorage.setItem(alertedKey, "1");
            }
          }
        } catch (_) {
          // ignore
        }
      }
    };

    const interval = setInterval(check, 60_000);
    return () => clearInterval(interval);
  }, [settings]);

  const updateMeal = (
    key: keyof Pick<
      ReminderSettings,
      "breakfast" | "lunch" | "dinner" | "snack"
    >,
    patch: Partial<MealReminder>,
  ) => {
    setSettings((prev) => ({
      ...prev,
      [key]: { ...prev[key], ...patch },
    }));
  };

  const activeCount =
    MEAL_LABELS.filter((m) => settings[m.key].enabled).length +
    (settings.waterEnabled ? 1 : 0);

  return (
    <Card data-ocid="reminders.card" className="shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          Reminders
          {activeCount > 0 && (
            <Badge className="ml-auto text-xs bg-primary/10 text-primary border-primary/20">
              {activeCount} active
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Meal Reminders
          </p>
          {MEAL_LABELS.map(({ key, label, emoji }) => (
            <div key={key} className="flex items-center gap-3">
              <span className="text-base w-5 text-center">{emoji}</span>
              <Label
                className="text-sm flex-1 cursor-pointer"
                htmlFor={`reminder-${key}`}
              >
                {label}
              </Label>
              <input
                type="time"
                value={settings[key].time}
                onChange={(e) => updateMeal(key, { time: e.target.value })}
                data-ocid={`reminders.${key}.input`}
                className="text-xs border border-border rounded px-2 py-1 bg-background text-foreground w-24"
                disabled={!settings[key].enabled}
              />
              <Switch
                id={`reminder-${key}`}
                checked={settings[key].enabled}
                onCheckedChange={(checked) =>
                  updateMeal(key, { enabled: checked })
                }
                data-ocid={`reminders.${key}.switch`}
              />
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-3 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Water Reminder
          </p>
          <div className="flex items-center gap-3">
            <span className="text-base w-5 text-center">💧</span>
            <Label
              className="text-sm flex-1 cursor-pointer"
              htmlFor="water-reminder"
            >
              Every
            </Label>
            <Select
              value={String(settings.waterIntervalHours)}
              onValueChange={(v) =>
                setSettings((p) => ({ ...p, waterIntervalHours: Number(v) }))
              }
              disabled={!settings.waterEnabled}
            >
              <SelectTrigger
                className="w-24 h-8 text-xs"
                data-ocid="reminders.water.select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 hour</SelectItem>
                <SelectItem value="2">2 hours</SelectItem>
                <SelectItem value="3">3 hours</SelectItem>
              </SelectContent>
            </Select>
            <Switch
              id="water-reminder"
              checked={settings.waterEnabled}
              onCheckedChange={(checked) =>
                setSettings((p) => ({ ...p, waterEnabled: checked }))
              }
              data-ocid="reminders.water.switch"
            />
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground">
          ⚠️ Reminders use browser-based timers. Keep the app open for
          notifications to work.
        </p>
      </CardContent>
    </Card>
  );
}
