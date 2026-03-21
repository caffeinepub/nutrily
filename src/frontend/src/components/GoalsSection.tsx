import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Apple,
  Dumbbell,
  Moon,
  Quote,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

type GoalType = "gain" | "loss" | null;

const GOALS = {
  gain: {
    id: "gain" as GoalType,
    title: "Weight Gain",
    subtitle: "Build muscle & increase mass",
    Icon: TrendingUp,
    accentClass: "goal-gain",
    exercises: [
      {
        name: "Squats",
        desc: "King of compound lifts — builds quads, glutes, and core simultaneously.",
      },
      {
        name: "Deadlifts",
        desc: "Full-body power move that targets posterior chain and builds raw strength.",
      },
      {
        name: "Bench Press",
        desc: "Primary chest and triceps builder; improves upper-body pushing strength.",
      },
      {
        name: "Pull-ups",
        desc: "Back and bicep developer that adds serious upper-body width.",
      },
      {
        name: "Overhead Press",
        desc: "Builds strong, broad shoulders and improves upper-body stability.",
      },
      {
        name: "Barbell Rows",
        desc: "Thick back muscles and improved posture with this horizontal pull.",
      },
    ],
    dietEat: [
      "Rice",
      "Oats",
      "Eggs",
      "Chicken",
      "Milk",
      "Nuts",
      "Banana",
      "Peanut Butter",
      "Sweet Potato",
      "Avocado",
    ],
    dietAvoid: ["Low-calorie snacks", "Excessive cardio foods", "Diet sodas"],
    sleepHours: "8–9 hours",
    sleepTips: [
      "Sleep is when muscles repair and grow — prioritise it like your workouts.",
      "Growth hormone (GH) peaks during deep sleep; protect your sleep window.",
      "Keep a consistent bedtime and wake time to maximise hormonal rhythm.",
      "Avoid screens 1 hour before bed to improve deep-sleep quality.",
    ],
    quotes: [
      "The only bad workout is the one that didn't happen.",
      "Push yourself because no one else is going to do it for you.",
      "Success is usually the culmination of controlling failure.",
      "Your body can stand almost anything. It's your mind you have to convince.",
      "The pain you feel today will be the strength you feel tomorrow.",
    ],
  },
  loss: {
    id: "loss" as GoalType,
    title: "Weight Loss",
    subtitle: "Burn fat & improve fitness",
    Icon: TrendingDown,
    accentClass: "goal-loss",
    exercises: [
      {
        name: "Running / Jogging",
        desc: "Steady-state cardio that burns significant calories and improves endurance.",
      },
      {
        name: "Cycling",
        desc: "Low-impact cardio that torches fat while protecting joints.",
      },
      {
        name: "HIIT",
        desc: "High-intensity intervals keep metabolism elevated for hours post-workout.",
      },
      {
        name: "Jump Rope",
        desc: "Full-body coordination drill — burns up to 10 calories per minute.",
      },
      {
        name: "Swimming",
        desc: "Total-body workout with zero joint impact; exceptional calorie burn.",
      },
      {
        name: "Yoga / Pilates",
        desc: "Improves flexibility, reduces cortisol, and supports mindful eating habits.",
      },
    ],
    dietEat: [
      "Vegetables",
      "Lean protein",
      "Fruits",
      "Whole grains",
      "Green tea",
      "Water-rich foods",
    ],
    dietAvoid: [
      "Sugary drinks",
      "Fried foods",
      "Processed snacks",
      "White bread",
      "Alcohol",
    ],
    sleepHours: "7–8 hours",
    sleepTips: [
      "Poor sleep spikes ghrelin (hunger hormone) — sleep deprivation drives overeating.",
      "Leptin (fullness hormone) drops when you're under-slept; cravings soar.",
      "Aim for 7–8 hours of uninterrupted sleep every night for optimal fat loss.",
      "A cool, dark room (18–20 °C) dramatically improves sleep quality.",
    ],
    quotes: [
      "It's not about perfect. It's about effort.",
      "Don't stop when you're tired. Stop when you're done.",
      "Take care of your body. It's the only place you have to live.",
      "A year from now you may wish you had started today.",
      "Believe you can and you're halfway there.",
    ],
  },
};

export default function GoalsSection() {
  const [activeGoal, setActiveGoal] = useState<GoalType>(null);

  const handleSelect = (id: GoalType) => {
    setActiveGoal((prev) => (prev === id ? null : id));
  };

  const goal = activeGoal ? GOALS[activeGoal] : null;

  return (
    <section className="mt-10" aria-label="Health Goals">
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="flex items-center gap-3 mb-6"
      >
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <Target className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Your Health Goals
          </h2>
          <p className="text-sm text-muted-foreground">
            Choose a goal to get your personalised plan
          </p>
        </div>
      </motion.div>

      {/* Goal selector cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {(Object.values(GOALS) as (typeof GOALS)["gain"][]).map((g, i) => {
          const isActive = activeGoal === g.id;
          const isGain = g.id === "gain";
          return (
            <motion.button
              key={String(g.id)}
              data-ocid={`goals.${g.id === "gain" ? "gain" : "loss"}_button`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              onClick={() => handleSelect(g.id)}
              className={[
                "relative w-full text-left rounded-2xl border-2 p-5 transition-all duration-300 cursor-pointer overflow-hidden group",
                isActive
                  ? isGain
                    ? "border-emerald-400 bg-emerald-50 shadow-lg shadow-emerald-100"
                    : "border-sky-400 bg-sky-50 shadow-lg shadow-sky-100"
                  : "border-border bg-card hover:border-muted-foreground/30 shadow-sm hover:shadow-md",
              ].join(" ")}
            >
              {/* Background accent blob */}
              <div
                className={[
                  "absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 transition-opacity duration-300 group-hover:opacity-20",
                  isGain ? "bg-emerald-400" : "bg-sky-400",
                ].join(" ")}
              />

              <div className="flex items-start gap-4 relative z-10">
                <div
                  className={[
                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300",
                    isGain
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-sky-100 text-sky-600",
                  ].join(" ")}
                >
                  <g.Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-foreground text-base">
                      {g.title}
                    </span>
                    {isActive && (
                      <Badge
                        className={[
                          "text-xs px-2 py-0.5",
                          isGain
                            ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                            : "bg-sky-100 text-sky-700 border-sky-200",
                        ].join(" ")}
                      >
                        Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{g.subtitle}</p>
                  <p
                    className={[
                      "text-xs font-medium mt-2",
                      isGain ? "text-emerald-600" : "text-sky-600",
                    ].join(" ")}
                  >
                    {isActive
                      ? "Click to deselect ↑"
                      : "Click to explore your plan →"}
                  </p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Expanded goal details */}
      <AnimatePresence mode="wait">
        {goal && (
          <motion.div
            key={String(activeGoal)}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="bg-card rounded-2xl border border-border shadow-card overflow-hidden"
            data-ocid="goals.detail.panel"
          >
            {/* Detail header band */}
            <div
              className={[
                "px-6 py-4 flex items-center gap-3",
                activeGoal === "gain"
                  ? "bg-emerald-50 border-b border-emerald-100"
                  : "bg-sky-50 border-b border-sky-100",
              ].join(" ")}
            >
              <goal.Icon
                className={[
                  "w-6 h-6",
                  activeGoal === "gain" ? "text-emerald-600" : "text-sky-600",
                ].join(" ")}
              />
              <h3 className="font-bold text-foreground text-lg">
                {goal.title} Plan
              </h3>
            </div>

            {/* Tabs */}
            <div className="p-5">
              <Tabs defaultValue="exercises">
                <TabsList
                  className="w-full grid grid-cols-4 mb-6"
                  data-ocid="goals.detail.tab"
                >
                  <TabsTrigger
                    value="exercises"
                    className="flex items-center gap-1.5"
                  >
                    <Dumbbell className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Exercises</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="diet"
                    className="flex items-center gap-1.5"
                  >
                    <Apple className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Diet</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="sleep"
                    className="flex items-center gap-1.5"
                  >
                    <Moon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Sleep</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="motivation"
                    className="flex items-center gap-1.5"
                  >
                    <Quote className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Motivation</span>
                  </TabsTrigger>
                </TabsList>

                {/* Exercises tab */}
                <TabsContent value="exercises">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {goal.exercises.map((ex, i) => (
                      <motion.div
                        key={ex.name}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="flex gap-3 p-3 rounded-xl bg-muted/60 border border-border"
                        data-ocid={`goals.exercise.item.${i + 1}`}
                      >
                        <div
                          className={[
                            "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0",
                            activeGoal === "gain"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-sky-100 text-sky-700",
                          ].join(" ")}
                        >
                          {i + 1}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {ex.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                            {ex.desc}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>

                {/* Diet tab */}
                <TabsContent value="diet">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                        <h4 className="text-sm font-bold text-foreground">
                          Foods to Eat
                        </h4>
                      </div>
                      <ul className="space-y-2">
                        {goal.dietEat.map((item, i) => (
                          <motion.li
                            key={item}
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="flex items-center gap-2 text-sm text-foreground"
                            data-ocid={`goals.diet_eat.item.${i + 1}`}
                          >
                            <span className="text-emerald-500">✓</span>
                            {item}
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-2 h-2 rounded-full bg-destructive shrink-0" />
                        <h4 className="text-sm font-bold text-foreground">
                          Foods to Avoid
                        </h4>
                      </div>
                      <ul className="space-y-2">
                        {goal.dietAvoid.map((item, i) => (
                          <motion.li
                            key={item}
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="flex items-center gap-2 text-sm text-foreground"
                            data-ocid={`goals.diet_avoid.item.${i + 1}`}
                          >
                            <span className="text-destructive">✗</span>
                            {item}
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </TabsContent>

                {/* Sleep tab */}
                <TabsContent value="sleep">
                  <div className="space-y-4">
                    <div
                      className={[
                        "flex items-center gap-4 p-4 rounded-xl",
                        activeGoal === "gain"
                          ? "bg-emerald-50 border border-emerald-100"
                          : "bg-sky-50 border border-sky-100",
                      ].join(" ")}
                    >
                      <Moon
                        className={[
                          "w-8 h-8 shrink-0",
                          activeGoal === "gain"
                            ? "text-emerald-500"
                            : "text-sky-500",
                        ].join(" ")}
                      />
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                          Recommended
                        </p>
                        <p className="text-2xl font-extrabold text-foreground">
                          {goal.sleepHours}
                        </p>
                      </div>
                    </div>
                    <ul className="space-y-3">
                      {goal.sleepTips.map((tip, i) => (
                        <motion.li
                          key={tip}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.07 }}
                          className="flex gap-3 text-sm text-foreground leading-relaxed"
                          data-ocid={`goals.sleep.item.${i + 1}`}
                        >
                          <Moon className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                          {tip}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>

                {/* Motivation tab */}
                <TabsContent value="motivation">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {goal.quotes.map((q, i) => (
                      <motion.div
                        key={q}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          delay: i * 0.07,
                          type: "spring",
                          stiffness: 180,
                        }}
                        className={[
                          "relative p-4 rounded-xl border overflow-hidden",
                          activeGoal === "gain"
                            ? "bg-emerald-50 border-emerald-100"
                            : "bg-sky-50 border-sky-100",
                        ].join(" ")}
                        data-ocid={`goals.quote.item.${i + 1}`}
                      >
                        <Quote
                          className={[
                            "absolute top-3 right-3 w-5 h-5 opacity-20",
                            activeGoal === "gain"
                              ? "text-emerald-600"
                              : "text-sky-600",
                          ].join(" ")}
                        />
                        <p
                          className={[
                            "text-sm font-semibold leading-relaxed pr-6",
                            activeGoal === "gain"
                              ? "text-emerald-900"
                              : "text-sky-900",
                          ].join(" ")}
                        >
                          &ldquo;{q}&rdquo;
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
