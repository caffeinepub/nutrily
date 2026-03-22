import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Brain,
  Flame,
  Loader2,
  ShieldAlert,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface LoginPageProps {
  onAdminAccess?: () => void;
}

export default function LoginPage({ onAdminAccess }: LoginPageProps) {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === "logging-in";

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
      login();
    } else {
      setAdminError("Invalid credentials. Access denied.");
    }
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
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-10 text-center"
      >
        {/* Logo - click 5 times to open hidden admin panel */}
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

        <h1 className="text-2xl font-bold text-foreground mb-2">
          Welcome to DoitEpic
        </h1>
        <p className="text-muted-foreground mb-8 text-sm">
          Your personal health and nutrition tracking dashboard
        </p>

        <div className="space-y-3 mb-8">
          {features.map((f) => (
            <div
              key={f.title}
              className="flex items-center gap-3 text-left p-3 rounded-xl bg-accent"
            >
              <div className="w-9 h-9 rounded-lg hero-gradient flex items-center justify-center flex-shrink-0">
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

        <Button
          data-ocid="login.primary_button"
          onClick={() => login()}
          disabled={isLoggingIn}
          className="w-full h-11 rounded-full hero-gradient text-white font-semibold text-base border-0 hover:opacity-90 transition-opacity"
        >
          {isLoggingIn ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...
            </>
          ) : (
            "Log In to DOITEPIC"
          )}
        </Button>
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
                  <p className="text-red-400 text-xs">{adminError}</p>
                )}

                <Button
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
