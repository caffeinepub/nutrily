import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain, Flame, ShieldAlert, Sparkles, X, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ProfileGoal } from "../backend";
import { useLocalAuth } from "../hooks/useLocalAuth";
import type { LocalUser } from "../hooks/useLocalAuth";

interface LoginPageProps {
  onAdminAccess?: () => void;
}

const GOALS = [
  { value: ProfileGoal.weightLoss, label: "Weight Loss", emoji: "🔥" },
  { value: ProfileGoal.muscleGain, label: "Muscle Gain", emoji: "💪" },
  { value: ProfileGoal.maintenance, label: "Maintenance", emoji: "⚖️" },
];

export default function LoginPage({ onAdminAccess }: LoginPageProps) {
  const { login } = useLocalAuth();
  const [isNewUser, setIsNewUser] = useState(false);

  // Login form state
  const [loginName, setLoginName] = useState("");
  const [loginPhone, setLoginPhone] = useState("");
  const [loginError, setLoginError] = useState("");

  // Registration form state
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regAge, setRegAge] = useState("");
  const [regWeight, setRegWeight] = useState("");
  const [regHeight, setRegHeight] = useState("");
  const [regGender, setRegGender] = useState("");
  const [regGoal, setRegGoal] = useState<ProfileGoal | "">("");
  const [regError, setRegError] = useState("");

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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const stored = localStorage.getItem("doitepic_user");
    if (!stored) {
      setLoginError("No account found. Please register below.");
      setIsNewUser(true);
      return;
    }
    const profile: LocalUser = JSON.parse(stored);
    const nameMatch =
      profile.name.trim().toLowerCase() === loginName.trim().toLowerCase();
    const phoneMatch = profile.phone.trim() === loginPhone.trim();
    if (nameMatch && phoneMatch) {
      login(profile);
    } else {
      setLoginError(
        "Name or phone number doesn't match. Try again or register.",
      );
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");

    if (!regName.trim()) {
      setRegError("Please enter your name.");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(regPhone.trim())) {
      setRegError("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    const age = Number.parseInt(regAge, 10);
    if (Number.isNaN(age) || age < 10 || age > 100) {
      setRegError("Enter a valid age (10–100 years).");
      return;
    }
    const wt = Number.parseFloat(regWeight);
    if (Number.isNaN(wt) || wt < 20 || wt > 300) {
      setRegError("Enter a valid weight (20–300 kg).");
      return;
    }
    const ht = Number.parseFloat(regHeight);
    if (Number.isNaN(ht) || ht < 100 || ht > 250) {
      setRegError("Enter a valid height (100–250 cm).");
      return;
    }
    if (!regGender) {
      setRegError("Please select your gender.");
      return;
    }
    if (!regGoal) {
      setRegError("Please select your health goal.");
      return;
    }

    const profile: LocalUser = {
      name: regName.trim(),
      phone: regPhone.trim(),
      age,
      weightKg: wt,
      heightCm: ht,
      gender: regGender,
      goal: regGoal as ProfileGoal,
      joinedAt: new Date().toISOString(),
    };
    login(profile);
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
          className="flex items-center justify-center gap-2 mb-6 mx-auto focus:outline-none select-none"
          aria-label="App logo"
        >
          <div className="w-10 h-10 rounded-xl hero-gradient flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-foreground">DOITEPIC</span>
        </button>

        <h1 className="text-2xl font-bold text-foreground mb-1">
          {isNewUser ? "Create your account" : "Welcome back!"}
        </h1>
        <p className="text-muted-foreground mb-6 text-sm">
          {isNewUser
            ? "Set up your health profile to get started"
            : "Your personal health and nutrition dashboard"}
        </p>

        <AnimatePresence mode="wait">
          {!isNewUser ? (
            <motion.form
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleLogin}
              className="space-y-4 text-left"
            >
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
                  value={loginName}
                  onChange={(e) => {
                    setLoginName(e.target.value);
                    setLoginError("");
                  }}
                  placeholder="Enter your name"
                  autoFocus
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
                  value={loginPhone}
                  onChange={(e) => {
                    setLoginPhone(e.target.value);
                    setLoginError("");
                  }}
                  placeholder="10-digit mobile number"
                  type="tel"
                  inputMode="numeric"
                />
              </div>
              {loginError && (
                <p
                  data-ocid="login.error_state"
                  className="text-red-500 text-xs"
                >
                  {loginError}
                </p>
              )}
              <Button
                data-ocid="login.primary_button"
                type="submit"
                className="w-full h-11 rounded-full hero-gradient text-white font-semibold text-base border-0 hover:opacity-90 transition-opacity"
              >
                Enter DOITEPIC
              </Button>
              <p className="text-center text-sm text-muted-foreground pt-1">
                New here?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsNewUser(true);
                    setLoginError("");
                  }}
                  className="text-primary font-semibold hover:underline"
                >
                  Register
                </button>
              </p>
            </motion.form>
          ) : (
            <motion.form
              key="register"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleRegister}
              className="space-y-4 text-left"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label
                    htmlFor="reg-name"
                    className="text-xs font-medium text-foreground block mb-1"
                  >
                    Full Name
                  </label>
                  <Input
                    id="reg-name"
                    data-ocid="register.input"
                    value={regName}
                    onChange={(e) => {
                      setRegName(e.target.value);
                      setRegError("");
                    }}
                    placeholder="Your full name"
                    autoFocus
                  />
                </div>
                <div className="col-span-2">
                  <label
                    htmlFor="reg-phone"
                    className="text-xs font-medium text-foreground block mb-1"
                  >
                    Phone Number
                  </label>
                  <Input
                    id="reg-phone"
                    data-ocid="register.input"
                    value={regPhone}
                    onChange={(e) => {
                      setRegPhone(e.target.value);
                      setRegError("");
                    }}
                    placeholder="10-digit mobile number"
                    type="tel"
                    inputMode="numeric"
                  />
                </div>
                <div>
                  <label
                    htmlFor="reg-age"
                    className="text-xs font-medium text-foreground block mb-1"
                  >
                    Age (years)
                  </label>
                  <Input
                    id="reg-age"
                    data-ocid="register.input"
                    value={regAge}
                    onChange={(e) => {
                      setRegAge(e.target.value);
                      setRegError("");
                    }}
                    placeholder="e.g. 25"
                    type="number"
                    min={10}
                    max={100}
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
                    value={regWeight}
                    onChange={(e) => {
                      setRegWeight(e.target.value);
                      setRegError("");
                    }}
                    placeholder="e.g. 70"
                    type="number"
                    min={20}
                    max={300}
                  />
                </div>
                <div className="col-span-2">
                  <label
                    htmlFor="reg-height"
                    className="text-xs font-medium text-foreground block mb-1"
                  >
                    Height (cm)
                  </label>
                  <Input
                    id="reg-height"
                    data-ocid="register.input"
                    value={regHeight}
                    onChange={(e) => {
                      setRegHeight(e.target.value);
                      setRegError("");
                    }}
                    placeholder="e.g. 170"
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
                        setRegGender(g);
                        setRegError("");
                      }}
                      className={`flex-1 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                        regGender === g
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {g === "male" ? "👨 Male" : "👩 Female"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Goal */}
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
                        setRegGoal(g.value);
                        setRegError("");
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                        regGoal === g.value
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

              {regError && (
                <p
                  data-ocid="register.error_state"
                  className="text-red-500 text-xs"
                >
                  {regError}
                </p>
              )}

              <Button
                data-ocid="register.submit_button"
                type="submit"
                className="w-full h-11 rounded-full hero-gradient text-white font-semibold text-base border-0 hover:opacity-90 transition-opacity"
              >
                Get Started
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                🔒 Your data is stored securely on your device
              </p>
              <p className="text-center text-sm text-muted-foreground">
                Already registered?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsNewUser(false);
                    setRegError("");
                  }}
                  className="text-primary font-semibold hover:underline"
                >
                  Login
                </button>
              </p>
            </motion.form>
          )}
        </AnimatePresence>

        {!isNewUser && (
          <div className="mt-6 space-y-2">
            {features.map((f) => (
              <div
                key={f.title}
                className="flex items-center gap-3 text-left p-3 rounded-xl bg-accent"
              >
                <div className="w-8 h-8 rounded-lg hero-gradient flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {f.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}
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
                  <ShieldAlert className="w-5 h-5 text-red-400" />
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
                  className="text-gray-500 hover:text-gray-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-gray-400 text-xs mb-6">
                This area is restricted. Unauthorized access is not permitted.
              </p>
              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="admin-name"
                    className="text-xs text-gray-400 block mb-1"
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
                    className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-600 focus:border-red-500"
                    autoComplete="off"
                    autoFocus
                  />
                </div>
                <div>
                  <label
                    htmlFor="admin-code"
                    className="text-xs text-gray-400 block mb-1"
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
                    className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-600 focus:border-red-500"
                    autoComplete="off"
                  />
                </div>
                {adminError && (
                  <p
                    data-ocid="admin.error_state"
                    className="text-red-400 text-xs"
                  >
                    {adminError}
                  </p>
                )}
                <Button
                  data-ocid="admin.submit_button"
                  type="submit"
                  className="w-full bg-red-700 hover:bg-red-600 text-white border-0 font-semibold"
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
