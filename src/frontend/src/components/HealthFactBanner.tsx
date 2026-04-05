import { Lightbulb } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

const HEALTH_FACTS = [
  {
    emoji: "🥥",
    fact: "Coconut oil has medium-chain fatty acids that boost metabolism and provide quick energy.",
  },
  {
    emoji: "🌿",
    fact: "Turmeric's curcumin reduces inflammation and supports joint health — add it to daily cooking.",
  },
  {
    emoji: "🐟",
    fact: "Kerala fish like mackerel and sardines are rich in omega-3s that protect heart health.",
  },
  {
    emoji: "🍌",
    fact: "Nendran banana is high in potassium and resistant starch — great pre-workout fuel.",
  },
  {
    emoji: "🥣",
    fact: "Matta rice (Kerala red rice) has 3x more fiber than polished white rice.",
  },
  {
    emoji: "🌾",
    fact: "Puttu with kadala curry is a complete protein meal — one of Kerala's healthiest combos.",
  },
  {
    emoji: "🫚",
    fact: "Coconut water has natural electrolytes better than most sports drinks — zero additives.",
  },
  {
    emoji: "🥗",
    fact: "Avial combines 8+ vegetables in one dish — one of the most nutrient-dense Kerala preparations.",
  },
  {
    emoji: "🌶️",
    fact: "Black pepper enhances curcumin absorption by 2000% — always pair turmeric with pepper.",
  },
  {
    emoji: "🫁",
    fact: "Deep breathing for 5 minutes before meals improves digestion and reduces overeating by 30%.",
  },
];

interface Props {
  showStep2: boolean;
  compact?: boolean;
}

export default function HealthFactBanner({ showStep2, compact }: Props) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (showStep2) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % HEALTH_FACTS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [showStep2]);

  if (showStep2) return null;

  const fact = HEALTH_FACTS[current];

  // Compact mode: just a small subtle note
  if (compact) {
    return (
      <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-blue-50/60 border border-blue-100">
        <Lightbulb className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
        <AnimatePresence mode="wait">
          <motion.p
            key={current}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="text-xs text-muted-foreground leading-relaxed"
          >
            {fact.emoji} {fact.fact}
          </motion.p>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="mb-5 space-y-2">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-950/40 dark:to-emerald-950/40 border border-blue-100 dark:border-blue-900/50 p-3">
        <div className="flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs font-semibold text-[#1E3A8A] dark:text-blue-300 mb-0.5">
            Fact of the Day
          </p>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.4 }}
            className="flex items-start gap-2 mt-1"
          >
            <span className="text-lg flex-shrink-0">{fact.emoji}</span>
            <p className="text-xs text-foreground/80 leading-relaxed">
              {fact.fact}
            </p>
          </motion.div>
        </AnimatePresence>
        <div className="flex justify-center gap-1 mt-2">
          {HEALTH_FACTS.map((hf, i) => (
            <button
              key={hf.emoji}
              type="button"
              onClick={() => setCurrent(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${i === current ? "bg-[#1E3A8A] w-3" : "bg-border"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
