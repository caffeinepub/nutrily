import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain, Flame, ShieldAlert, Sparkles, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ProfileGoal } from "../backend";
import { useActor } from "../hooks/useActor";
import type { LocalUser } from "../hooks/useLocalAuth";
import { useLocalAuth } from "../hooks/useLocalAuth";
import HealthFactBanner from "./HealthFactBanner";

interface LoginPageProps {
  onAdminAccess?: () => void;
  onLogin?: (profile: LocalUser) => void;
}

const GOALS = [
  { value: ProfileGoal.weightLoss, label: "Weight Loss", emoji: "🔥" },
  { value: ProfileGoal.muscleGain, label: "Muscle Gain", emoji: "💪" },
  { value: ProfileGoal.maintenance, label: "Maintenance", emoji: "⚖️" },
];

export default function LoginPage({ onAdminAccess, onLogin }: LoginPageProps) {
  const { login: localLogin } = useLocalAuth();
  const login = onLogin ?? localLogin;
  const { actor } = useActor();

  const goalToString = (g: ProfileGoal | "") => {
    if (g === ProfileGoal.weightLoss) return "Weight Loss";
    if (g === ProfileGoal.muscleGain) return "Muscle Gain";
    return "Maintenance";
  };

  const syncUserToBackend = (profile: LocalUser) => {
    if (!actor) return;
    try {
      let deviceId = localStorage.getItem("doitepic_device_id");
      if (!deviceId) {
        deviceId = crypto.randomUUID();
        localStorage.setItem("doitepic_device_id", deviceId);
      }
      (actor as any)
        .savePublicUser(deviceId, {
          name: profile.name,
          phone: profile.phone,
          age: BigInt(profile.age),
          weightKg: profile.weightKg,
          heightCm: profile.heightCm,
          gender: profile.gender,
          goal: goalToString(profile.goal as ProfileGoal),
          joinedAt: BigInt(Date.now()),
          lastSeenAt: BigInt(Date.now()),
        })
        .catch(() => {});
    } catch {
      // silently ignore
    }
  };

  // Step 1 fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [step1Error, setStep1Error] = useState("");

  // Whether to show Step 2 (new user profile setup)
  const [showStep2, setShowStep2] = useState(false);

  // Step 2 fields
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [gender, setGender] = useState("");
  const [goal, setGoal] = useState<ProfileGoal | "">("");
  const [step2Error, setStep2Error] = useState("");

  // Admin modal state
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [adminError, setAdminError] = useState("");

  const handleLogoClick = () => {
    const next = logoClickCount + 1;
    setLogoClickCount(next);
    if (next >= 5) {
      setLogoClickCount(0);
      setShowAdminModal(true);
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      adminName.trim().toLowerCase() === "doitepic" &&
      adminCode.trim() === "doitepicshit"
    ) {
      setShowAdminModal(false);
      setAdminName("");
      setAdminCode("");
      setAdminError("");
      onAdminAccess?.();
    } else {
      setAdminError("Invalid credentials. Access denied.");
    }
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setStep1Error("");

    if (!name.trim()) {
      setStep1Error("Please enter your name.");
      return;
    }
    if (!phone.trim()) {
      setStep1Error("Please enter your phone number.");
      return;
    }

    const stored = localStorage.getItem("doitepic_user");
    if (!stored) {
      // No user yet — expand Step 2 for profile setup
      setShowStep2(true);
      return;
    }

    const profile: LocalUser = JSON.parse(stored);
    const nameMatch =
      profile.name.trim().toLowerCase() === name.trim().toLowerCase();
    const phoneMatch = profile.phone.trim() === phone.trim();

    if (nameMatch && phoneMatch) {
      login(profile);
      syncUserToBackend(profile);
    } else {
      setStep1Error("Name or phone doesn't match your saved profile.");
    }
  };

  const handleGetStarted = (e: React.FormEvent) => {
    e.preventDefault();
    setStep2Error("");

    if (!name.trim()) {
      setStep2Error("Please enter your name.");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      setStep2Error("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    const ageNum = Number.parseInt(age, 10);
    if (Number.isNaN(ageNum) || ageNum < 10 || ageNum > 100) {
      setStep2Error("Enter a valid age (10–100 years).");
      return;
    }
    const wt = Number.parseFloat(weight);
    if (Number.isNaN(wt) || wt < 20 || wt > 300) {
      setStep2Error("Enter a valid weight (20–300 kg).");
      return;
    }
    const ht = Number.parseFloat(height);
    if (Number.isNaN(ht) || ht < 100 || ht > 250) {
      setStep2Error("Enter a valid height (100–250 cm).");
      return;
    }
    if (!gender) {
      setStep2Error("Please select your gender.");
      return;
    }
    if (!goal) {
      setStep2Error("Please select your health goal.");
      return;
    }

    const profile: LocalUser = {
      name: name.trim(),
      phone: phone.trim(),
      age: ageNum,
      weightKg: wt,
      heightCm: ht,
      gender,
      goal: goal as ProfileGoal,
      joinedAt: new Date().toISOString(),
    };
    login(profile);
    syncUserToBackend(profile);
  };

  const features = [
    {
      icon: Flame,
      title: "EatEpic",
      desc: "Fuel your body with the right nutrition every day",
    },
    {
      icon: Brain,
      title: "ThinkEpic",
      desc: "Build healthy habits and a powerful mindset",
    },
    {
      icon: Sparkles,
      title: "BeEpic",
      desc: "Become the best version of yourself",
    },
  ];

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center"
      >
        {/* Logo */}
        <button
          type="button"
          onClick={handleLogoClick}
          className="flex items-center justify-center mb-6 mx-auto focus:outline-none select-none"
          aria-label="App logo"
        >
          <img
            src="/assets/uploads/file_0000000091b4720b8ab0302490c69f98-1.png"
            alt="DoitEpic"
            className="h-16 w-auto object-contain"
          />
        </button>
        <HealthFactBanner showStep2={showStep2} />

        <AnimatePresence mode="wait">
          {!showStep2 ? (
            <motion.div
              key="step1-header"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="text-2xl font-bold text-foreground mb-1">
                Welcome back!
              </h1>
              <p className="text-muted-foreground mb-6 text-sm">
                Your personal health and nutrition dashboard
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="step2-header"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <h1 className="text-2xl font-bold text-foreground mb-1">
                Let's set up your profile!
              </h1>
              <p className="text-muted-foreground mb-6 text-sm">
                Just a few details to personalise your experience
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <form
          onSubmit={showStep2 ? handleGetStarted : handleContinue}
          className="space-y-4 text-left"
        >
          {/* Step 1 fields — always visible */}
          <div>
            <label
              htmlFor="login-name"
              className="text-xs font-medium text-foreground block mb-1"
            >
              Your Name
            </label>
            <Input
              id="login-name"
              data-ocid="login.input"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setStep1Error("");
              }}
              placeholder="Enter your name"
              autoFocus
              disabled={showStep2}
              className={showStep2 ? "opacity-60" : ""}
            />
          </div>
          <div>
            <label
              htmlFor="login-phone"
              className="text-xs font-medium text-foreground block mb-1"
            >
              Phone Number
            </label>
            <Input
              id="login-phone"
              data-ocid="login.input"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setStep1Error("");
              }}
              placeholder="10-digit mobile number"
              type="tel"
              inputMode="numeric"
              disabled={showStep2}
              className={showStep2 ? "opacity-60" : ""}
            />
          </div>

          {step1Error && !showStep2 && (
            <p
              data-ocid="login.error_state"
              className="text-destructive text-xs"
            >
              {step1Error}
            </p>
          )}

          {/* Step 2 — animated expansion for new users */}
          <AnimatePresence>
            {showStep2 && (
              <motion.div
                key="step2-fields"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label
                        htmlFor="reg-age"
                        className="text-xs font-medium text-foreground block mb-1"
                      >
                        Age (yrs)
                      </label>
                      <Input
                        id="reg-age"
                        data-ocid="register.input"
                        value={age}
                        onChange={(e) => {
                          setAge(e.target.value);
                          setStep2Error("");
                        }}
                        placeholder="25"
                        type="number"
                        min={10}
                        max={100}
                        autoFocus
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="reg-weight"
                        className="text-xs font-medium text-foreground block mb-1"
                      >
                        Weight (kg)
                      </label>
                      <Input
                        id="reg-weight"
                        data-ocid="register.input"
                        value={weight}
                        onChange={(e) => {
                          setWeight(e.target.value);
                          setStep2Error("");
                        }}
                        placeholder="70"
                        type="number"
                        min={20}
                        max={300}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="reg-height"
                        className="text-xs font-medium text-foreground block mb-1"
                      >
                        Height (cm)
                      </label>
                      <Input
                        id="reg-height"
                        data-ocid="register.input"
                        value={height}
                        onChange={(e) => {
                          setHeight(e.target.value);
                          setStep2Error("");
                        }}
                        placeholder="170"
                        type="number"
                        min={100}
                        max={250}
                      />
                    </div>
                  </div>

                  {/* Gender */}
                  <div>
                    <p className="text-xs font-medium text-foreground block mb-2">
                      Gender
                    </p>
                    <div className="flex gap-3">
                      {["male", "female"].map((g) => (
                        <button
                          key={g}
                          type="button"
                          data-ocid="register.toggle"
                          onClick={() => {
                            setGender(g);
                            setStep2Error("");
                          }}
                          className={`flex-1 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                            gender === g
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:border-primary/50"
                          }`}
                        >
                          {g === "male" ? "👨 Male" : "👩 Female"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Health Goal */}
                  <div>
                    <p className="text-xs font-medium text-foreground block mb-2">
                      Health Goal
                    </p>
                    <div className="space-y-2">
                      {GOALS.map((g) => (
                        <button
                          key={g.value}
                          type="button"
                          data-ocid="register.radio"
                          onClick={() => {
                            setGoal(g.value);
                            setStep2Error("");
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                            goal === g.value
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:border-primary/50"
                          }`}
                        >
                          <span className="text-lg">{g.emoji}</span>
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {step2Error && (
                    <p
                      data-ocid="register.error_state"
                      className="text-destructive text-xs"
                    >
                      {step2Error}
                    </p>
                  )}

                  <p className="text-center text-xs text-muted-foreground">
                    🔒 Your data is stored securely on your device
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            data-ocid="login.primary_button"
            type="submit"
            className="w-full h-11 rounded-full hero-gradient text-white font-semibold text-base border-0 hover:opacity-90 transition-opacity"
          >
            {showStep2 ? "Get Started" : "Continue"}
          </Button>
        </form>

        {/* Features section — only shown in Step 1 */}
        <AnimatePresence>
          {!showStep2 && (
            <motion.div
              key="features"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-6 space-y-2 overflow-hidden"
            >
              {features.map((f) => (
                <div
                  key={f.title}
                  className="flex items-center gap-3 text-left p-3 rounded-xl bg-[#1E3A8A]"
                >
                  <div className="w-8 h-8 rounded-lg hero-gradient flex items-center justify-center flex-shrink-0">
                    <f.icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {f.title}
                    </p>
                    <p className="text-xs text-blue-200">{f.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Hidden Admin Access Modal */}
      <AnimatePresence>
        {showAdminModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowAdminModal(false);
                setAdminError("");
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-950 border border-gray-700 rounded-2xl p-8 max-w-sm w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-destructive" />
                  <h2 className="text-white font-bold text-lg">
                    Restricted Access
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminModal(false);
                    setAdminError("");
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-muted-foreground text-xs mb-6">
                This area is restricted. Unauthorized access is not permitted.
              </p>
              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="admin-name"
                    className="text-xs text-muted-foreground block mb-1"
                  >
                    Access Name
                  </label>
                  <Input
                    id="admin-name"
                    data-ocid="admin.input"
                    value={adminName}
                    onChange={(e) => {
                      setAdminName(e.target.value);
                      setAdminError("");
                    }}
                    placeholder="Enter access name"
                    className="bg-gray-900 border-gray-700 text-white placeholder:text-muted-foreground focus:border-red-500"
                    autoComplete="off"
                    autoFocus
                  />
                </div>
                <div>
                  <label
                    htmlFor="admin-code"
                    className="text-xs text-muted-foreground block mb-1"
                  >
                    Secret Code
                  </label>
                  <Input
                    id="admin-code"
                    data-ocid="admin.input"
                    type="password"
                    value={adminCode}
                    onChange={(e) => {
                      setAdminCode(e.target.value);
                      setAdminError("");
                    }}
                    placeholder="Enter secret code"
                    className="bg-gray-900 border-gray-700 text-white placeholder:text-muted-foreground focus:border-red-500"
                    autoComplete="off"
                  />
                </div>
                {adminError && (
                  <p
                    data-ocid="admin.error_state"
                    className="text-destructive text-xs"
                  >
                    {adminError}
                  </p>
                )}
                <Button
                  data-ocid="admin.submit_button"
                  type="submit"
                  className="w-full bg-destructive hover:bg-destructive/90 text-white border-0 font-semibold"
                >
                  Access Admin Panel
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
