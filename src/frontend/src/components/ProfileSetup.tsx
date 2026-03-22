import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dumbbell, Loader2, Target, TrendingDown, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ProfileGoal } from "../backend";
import { useSaveUserProfile } from "../hooks/useQueries";

const GOALS = [
  {
    value: ProfileGoal.weightLoss,
    label: "Weight Loss",
    tagline: "Burn fat & get lean",
    Icon: TrendingDown,
    border: "border-green-400",
    bg: "bg-green-50",
    iconBg: "bg-green-100 text-green-600",
    activeShadow: "shadow-green-100",
  },
  {
    value: ProfileGoal.muscleGain,
    label: "Muscle Gain",
    tagline: "Build strength & size",
    Icon: Dumbbell,
    border: "border-blue-400",
    bg: "bg-blue-50",
    iconBg: "bg-blue-100 text-blue-600",
    activeShadow: "shadow-blue-100",
  },
  {
    value: ProfileGoal.maintenance,
    label: "Maintenance",
    tagline: "Stay healthy & balanced",
    Icon: Target,
    border: "border-orange-400",
    bg: "bg-orange-50",
    iconBg: "bg-orange-100 text-orange-600",
    activeShadow: "shadow-orange-100",
  },
];

function validatePhone(value: string): string {
  const digits = value
    .replace(/^\+91/, "")
    .replace(/\s/g, "")
    .replace(/-/g, "");
  if (digits.length === 0) return "Phone number is required.";
  if (digits.length !== 10 || !/^[6-9]\d{9}$/.test(digits))
    return "Enter a valid 10-digit Indian mobile number.";
  return "";
}

function validateWeight(value: string): string {
  const n = Number(value);
  if (!value.trim()) return "Weight is required.";
  if (Number.isNaN(n) || n < 20 || n > 300)
    return "Weight must be between 20–300 kg.";
  return "";
}

function validateHeight(value: string): string {
  const n = Number(value);
  if (!value.trim()) return "Height is required.";
  if (Number.isNaN(n) || n < 100 || n > 250)
    return "Height must be between 100–250 cm.";
  return "";
}

export default function ProfileSetup() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [selectedGoal, setSelectedGoal] = useState<ProfileGoal | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [rateLimited, setRateLimited] = useState(false);
  const rateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { mutateAsync, isPending } = useSaveUserProfile();

  const phoneError = touched.phone ? validatePhone(phone) : "";
  const weightError = touched.weightKg ? validateWeight(weightKg) : "";
  const heightError = touched.heightCm ? validateHeight(heightCm) : "";

  const isValid =
    name.trim().length > 0 &&
    !validatePhone(phone) &&
    !validateWeight(weightKg) &&
    !validateHeight(heightCm) &&
    gender !== "" &&
    selectedGoal !== null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ phone: true, weightKg: true, heightCm: true });
    if (!isValid || selectedGoal === null || rateLimited) return;

    setRateLimited(true);
    rateTimer.current = setTimeout(() => setRateLimited(false), 1500);

    // Also store locally as fallback
    localStorage.setItem("doitepic_gender", gender);

    try {
      await mutateAsync({
        name: name.trim(),
        phone: phone.trim(),
        weightKg: Number.parseFloat(weightKg),
        heightCm: Number.parseFloat(heightCm),
        goal: selectedGoal,
        gender: gender as string,
      });
      toast.success("Profile saved! Welcome to DOITEPIC.");
    } catch {
      toast.error("Failed to save profile. Please try again.");
      setRateLimited(false);
    }
  };

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-10"
      >
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl hero-gradient flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-foreground">DOITEPIC</span>
        </div>
        <h2 className="text-xl font-bold text-foreground mb-1 text-center">
          Set Up Your Profile
        </h2>
        <p className="text-sm text-muted-foreground mb-6 text-center">
          Fill in your details to get started
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-sm font-medium">
              Full Name
            </Label>
            <Input
              data-ocid="profile.input"
              id="name"
              placeholder="e.g. Arun Kumar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 h-10"
              autoFocus
              autoComplete="name"
            />
          </div>

          <div>
            <Label htmlFor="phone" className="text-sm font-medium">
              Phone Number
            </Label>
            <Input
              data-ocid="profile.phone_input"
              id="phone"
              type="tel"
              inputMode="numeric"
              placeholder="e.g. +91 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onBlur={() => setTouched((p) => ({ ...p, phone: true }))}
              className={`mt-1 h-10 ${phoneError ? "border-red-400 focus-visible:ring-red-400" : ""}`}
              autoComplete="tel"
            />
            {phoneError && (
              <p className="text-xs text-red-500 mt-1">{phoneError}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="weight" className="text-sm font-medium">
                Weight (kg)
              </Label>
              <Input
                data-ocid="profile.weight_input"
                id="weight"
                type="number"
                inputMode="decimal"
                min="20"
                max="300"
                step="0.1"
                placeholder="e.g. 65"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, weightKg: true }))}
                className={`mt-1 h-10 ${weightError ? "border-red-400 focus-visible:ring-red-400" : ""}`}
              />
              {weightError && (
                <p className="text-xs text-red-500 mt-1">{weightError}</p>
              )}
            </div>
            <div>
              <Label htmlFor="height" className="text-sm font-medium">
                Height (cm)
              </Label>
              <Input
                data-ocid="profile.height_input"
                id="height"
                type="number"
                inputMode="decimal"
                min="100"
                max="250"
                step="0.1"
                placeholder="e.g. 170"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, heightCm: true }))}
                className={`mt-1 h-10 ${heightError ? "border-red-400 focus-visible:ring-red-400" : ""}`}
              />
              {heightError && (
                <p className="text-xs text-red-500 mt-1">{heightError}</p>
              )}
            </div>
          </div>

          {/* Gender selector */}
          <div>
            <Label className="text-sm font-medium block mb-2">Gender *</Label>
            <div className="grid grid-cols-2 gap-3">
              {(["male", "female"] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  data-ocid={`profile.${g}.toggle`}
                  onClick={() => setGender(g)}
                  className={[
                    "flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition-all duration-200 capitalize",
                    gender === g
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border text-muted-foreground hover:border-primary/40 bg-background",
                  ].join(" ")}
                >
                  <span>{g === "male" ? "👨" : "👩"}</span> {g}
                </button>
              ))}
            </div>
            {gender === "" && touched.phone && (
              <p className="text-xs text-muted-foreground mt-1">
                Please select your gender.
              </p>
            )}
          </div>

          {/* Goal Selection */}
          <div>
            <Label className="text-sm font-medium block mb-2">
              Your Primary Goal *
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {GOALS.map((goal) => {
                const isSelected = selectedGoal === goal.value;
                return (
                  <button
                    key={goal.value}
                    type="button"
                    data-ocid={`profile.${goal.value}.toggle`}
                    onClick={() => setSelectedGoal(goal.value)}
                    className={[
                      "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer text-center",
                      isSelected
                        ? `${goal.border} ${goal.bg} shadow-md ${goal.activeShadow}`
                        : "border-border hover:border-muted-foreground/30 bg-background",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        isSelected
                          ? goal.iconBg
                          : "bg-muted text-muted-foreground",
                      ].join(" ")}
                    >
                      <goal.Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground leading-tight">
                        {goal.label}
                      </p>
                      <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                        {goal.tagline}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
            {selectedGoal === null && (
              <p className="text-xs text-muted-foreground mt-2">
                Please select a goal to continue.
              </p>
            )}
          </div>

          {/* Privacy notice */}
          <p className="text-xs text-muted-foreground text-center bg-muted/60 rounded-lg px-3 py-2">
            🔒 Your data is stored securely on the Internet Computer blockchain.
            We never sell your personal data.
          </p>

          <Button
            data-ocid="profile.submit_button"
            type="submit"
            disabled={!isValid || isPending || rateLimited}
            className="w-full h-11 rounded-full hero-gradient text-white font-semibold border-0 hover:opacity-90"
          >
            {isPending || rateLimited ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Get Started"
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
