import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Brain,
  Check,
  Copy,
  Flame,
  Phone,
  ShieldAlert,
  Sparkles,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ProfileGoal } from "../backend";
import { useActor } from "../hooks/useActor";
import type { LocalUser } from "../hooks/useLocalAuth";
import {
  lookupByCode,
  lookupByPhone,
  saveToRegistry,
  useLocalAuth,
} from "../hooks/useLocalAuth";
import { generateUsername } from "../utils/generateUsername";
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

function normalizePhone(p: string): string {
  return p.replace(/\D/g, "");
}

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
          phone: profile.phone ?? profile.username,
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
  const [userCode, setUserCode] = useState("");
  const [step1Error, setStep1Error] = useState("");

  // Step states
  const [showStep2, setShowStep2] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [showCodeReveal, setShowCodeReveal] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  // Step 2 fields
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [gender, setGender] = useState("");
  const [goal, setGoal] = useState<ProfileGoal | "">("");
  const [phone, setPhone] = useState("");
  const [step2Error, setStep2Error] = useState("");

  // Pending profile to log in after code reveal
  const [pendingProfile, setPendingProfile] = useState<LocalUser | null>(null);

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

    if (!userCode.trim()) {
      // No code entered → new user registration
      setShowStep2(true);
      return;
    }

    const trimmedCode = userCode.trim();
    const trimmedName = name.trim().toLowerCase();

    // --- Try registry lookup first (works after logout) ---
    const byCode = lookupByCode(trimmedCode);
    if (byCode && byCode.name.trim().toLowerCase() === trimmedName) {
      login(byCode);
      syncUserToBackend(byCode);
      return;
    }

    // --- Try phone lookup ---
    const normalized = normalizePhone(trimmedCode);
    if (normalized.length >= 10) {
      const byPhone = lookupByPhone(normalized);
      if (byPhone && byPhone.name.trim().toLowerCase() === trimmedName) {
        login(byPhone);
        syncUserToBackend(byPhone);
        return;
      }
    }

    // --- Fallback: check active session (legacy path) ---
    const stored = localStorage.getItem("doitepic_user");
    if (stored) {
      try {
        const profile: LocalUser = JSON.parse(stored);
        const storedUsername =
          (profile as any).username ?? (profile as any).phone ?? "";
        const nameMatch = profile.name.trim().toLowerCase() === trimmedName;
        const codeMatch =
          storedUsername.trim().toUpperCase() === trimmedCode.toUpperCase();

        if (nameMatch && codeMatch) {
          // Migrate this profile into the registry now
          saveToRegistry({ ...profile, username: storedUsername });
          login({ ...profile, username: storedUsername });
          syncUserToBackend({ ...profile, username: storedUsername });
          return;
        }

        if (profile.phone) {
          const phoneMatch = normalizePhone(profile.phone) === normalized;
          if (nameMatch && phoneMatch) {
            saveToRegistry(profile);
            login(profile);
            syncUserToBackend(profile);
            return;
          }
        }
      } catch {
        // ignore parse errors
      }
    }

    setStep1Error(
      "Name or User Code / Phone Number doesn't match. Check your saved code.",
    );
  };

  const handleGetStarted = (e: React.FormEvent) => {
    e.preventDefault();
    setStep2Error("");

    if (!name.trim()) {
      setStep2Error("Please enter your name.");
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
    if (phone.trim() && normalizePhone(phone).length < 10) {
      setStep2Error("Enter a valid phone number (at least 10 digits).");
      return;
    }

    const username = generateUsername();
    const profile: LocalUser = {
      name: name.trim(),
      username,
      phone: phone.trim() ? normalizePhone(phone) : undefined,
      age: ageNum,
      weightKg: wt,
      heightCm: ht,
      gender,
      goal: goal as ProfileGoal,
      joinedAt: new Date().toISOString(),
    };

    // Save to registry immediately so the code works after logout
    saveToRegistry(profile);

    setGeneratedCode(username);
    setPendingProfile(profile);
    setShowCodeReveal(true);
  };

  const handleGoToDashboard = () => {
    if (pendingProfile) {
      login(pendingProfile);
      syncUserToBackend(pendingProfile);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const features = [
    { icon: Flame, title: "EatEpic" },
    { icon: Brain, title: "ThinkEpic" },
    { icon: Sparkles, title: "BeEpic" },
  ];

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6"
      >
        {/* Logo */}
        <button
          type="button"
          onClick={handleLogoClick}
          className="flex items-center justify-center mb-4 mx-auto focus:outline-none select-none"
          aria-label="App logo"
        >
          <img
            src="/assets/uploads/file_0000000091b4720b8ab0302490c69f98-1.png"
            alt="DoitEpic"
            className="h-12 w-auto object-contain"
          />
        </button>

        {/* Code Reveal Screen */}
        <AnimatePresence mode="wait">
          {showCodeReveal ? (
            <motion.div
              key="code-reveal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <div className="mb-3">
                <div className="w-12 h-12 rounded-full bg-green-100 border-2 border-green-400 flex items-center justify-center mx-auto mb-2">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-lg font-bold text-foreground mb-0.5">
                  Profile Created! 🎉
                </h2>
                <p className="text-muted-foreground text-sm">
                  Welcome to DoitEpic, {name.trim()}!
                </p>
              </div>

              <div className="bg-blue-50 border-2 border-blue-400 rounded-xl p-4 mb-3 text-left">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1.5">
                  Your User Code
                </p>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xl font-bold font-mono text-blue-800 tracking-widest">
                    {generatedCode}
                  </span>
                  <button
                    type="button"
                    data-ocid="login.primary_button"
                    onClick={handleCopyCode}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors flex-shrink-0"
                  >
                    {codeCopied ? (
                      <>
                        <Check className="w-3 h-3" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

              {pendingProfile?.phone ? (
                <div className="bg-green-50 border border-green-300 rounded-lg p-2.5 mb-3 text-left">
                  <p className="text-green-800 text-xs font-semibold flex items-center gap-1">
                    <Phone className="w-3 h-3" /> Phone saved for login
                  </p>
                </div>
              ) : null}

              <div className="bg-amber-50 border border-amber-300 rounded-lg p-2.5 mb-4 text-left">
                <p className="text-amber-800 text-xs font-semibold">
                  ⚠️ Save this code — you'll need it to log in after logout!
                </p>
              </div>

              <Button
                data-ocid="login.primary_button"
                type="button"
                onClick={handleGoToDashboard}
                className="w-full h-10 rounded-full hero-gradient text-white font-semibold text-sm border-0 hover:opacity-90 transition-opacity"
              >
                Go to Dashboard →
              </Button>
            </motion.div>
          ) : (
            <>
              <AnimatePresence mode="wait">
                {!showStep2 ? (
                  <motion.div
                    key="step1-header"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-center mb-4"
                  >
                    <h1 className="text-xl font-bold text-foreground mb-1">
                      Welcome back!
                    </h1>
                    <p className="text-muted-foreground text-sm">
                      Your personal health dashboard
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step2-header"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="text-center mb-4"
                  >
                    <h1 className="text-xl font-bold text-foreground mb-1">
                      Set up your profile
                    </h1>
                    <p className="text-muted-foreground text-sm">
                      A few details to personalise your experience
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <form
                onSubmit={showStep2 ? handleGetStarted : handleContinue}
                className="space-y-3 text-left"
              >
                {/* Step 1 fields */}
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
                    autoComplete="name"
                  />
                </div>

                {!showStep2 && (
                  <div>
                    <label
                      htmlFor="login-code"
                      className="text-xs font-medium text-foreground block mb-1"
                    >
                      User Code or Phone Number
                    </label>
                    <Input
                      id="login-code"
                      data-ocid="login.input"
                      value={userCode}
                      onChange={(e) => {
                        setUserCode(e.target.value);
                        setStep1Error("");
                      }}
                      placeholder="e.g. EPIC-A3X9KZ or 9876543210"
                      autoComplete="off"
                      className="font-mono tracking-wide"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      New here? Leave this blank
                    </p>
                  </div>
                )}

                {step1Error && (
                  <p
                    data-ocid="login.error_state"
                    className="text-destructive text-xs"
                  >
                    {step1Error}
                  </p>
                )}

                {/* Step 2 expanded fields */}
                <AnimatePresence>
                  {showStep2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden space-y-3"
                    >
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label
                            htmlFor="reg-age"
                            className="text-xs font-medium text-foreground block mb-1"
                          >
                            Age
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

                      <div>
                        <label
                          htmlFor="reg-phone"
                          className="text-xs font-medium text-foreground block mb-1"
                        >
                          Phone Number{" "}
                          <span className="text-muted-foreground font-normal">
                            (optional, for login)
                          </span>
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                          <Input
                            id="reg-phone"
                            data-ocid="register.input"
                            value={phone}
                            onChange={(e) => {
                              setPhone(e.target.value);
                              setStep2Error("");
                            }}
                            placeholder="9876543210"
                            type="tel"
                            className="pl-8"
                            autoComplete="tel"
                          />
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-foreground block mb-1.5">
                          Gender
                        </p>
                        <div className="flex gap-2">
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

                      <div>
                        <p className="text-xs font-medium text-foreground block mb-1.5">
                          Health Goal
                        </p>
                        <div className="space-y-1.5">
                          {GOALS.map((g) => (
                            <button
                              key={String(g.value)}
                              type="button"
                              data-ocid="register.radio"
                              onClick={() => {
                                setGoal(g.value);
                                setStep2Error("");
                              }}
                              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                                goal === g.value
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-border text-muted-foreground hover:border-primary/50"
                              }`}
                            >
                              <span className="text-base">{g.emoji}</span>
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
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button
                  data-ocid="login.primary_button"
                  type="submit"
                  className="w-full h-10 rounded-full hero-gradient text-white font-semibold text-sm border-0 hover:opacity-90 transition-opacity"
                >
                  {showStep2 ? "Get Started" : "Continue"}
                </Button>
              </form>

              {/* Feature pills — compact horizontal row, only in Step 1 */}
              <AnimatePresence>
                {!showStep2 && (
                  <motion.div
                    key="features"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="mt-4 overflow-hidden"
                  >
                    <div className="flex gap-2 justify-center">
                      {features.map((f) => (
                        <div
                          key={f.title}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1E3A8A] text-white"
                        >
                          <f.icon className="w-3 h-3" />
                          <span className="text-xs font-semibold">
                            {f.title}
                          </span>
                        </div>
                      ))}
                    </div>
                    {/* Health Fact — subtle note below */}
                    <div className="mt-3">
                      <HealthFactBanner showStep2={false} compact />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
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
                    className="text-xs font-medium text-muted-foreground block mb-1"
                  >
                    Admin Name
                  </label>
                  <Input
                    id="admin-name"
                    data-ocid="admin.input"
                    value={adminName}
                    onChange={(e) => {
                      setAdminName(e.target.value);
                      setAdminError("");
                    }}
                    placeholder="Enter admin name"
                    className="bg-gray-900 border-gray-700 text-white"
                    autoComplete="off"
                  />
                </div>
                <div>
                  <label
                    htmlFor="admin-code"
                    className="text-xs font-medium text-muted-foreground block mb-1"
                  >
                    Access Code
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
                    placeholder="Enter access code"
                    className="bg-gray-900 border-gray-700 text-white"
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
                  className="w-full bg-destructive hover:bg-destructive/90 text-white"
                >
                  Access Panel
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
