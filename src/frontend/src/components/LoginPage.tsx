import { Button } from "@/components/ui/button";
import { Activity, Heart, Leaf, Loader2, Search } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginPage() {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === "logging-in";

  const features = [
    {
      icon: Activity,
      title: "Track Calories",
      desc: "Monitor daily intake with precision",
    },
    {
      icon: Heart,
      title: "Health Metrics",
      desc: "Weight, steps, heart rate at a glance",
    },
    {
      icon: Search,
      title: "Food Database",
      desc: "Search thousands of food items",
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
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl hero-gradient flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-foreground">Nutrily</span>
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">
          Welcome Back
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
            "Log In to Nutrily"
          )}
        </Button>
      </motion.div>
    </div>
  );
}
