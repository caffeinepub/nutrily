import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

const FACTS = [
  {
    emoji: "🐟",
    color: "from-blue-500 to-cyan-500",
    text: "Kerala consumes more fish per capita than any other Indian state — 9kg per person per year!",
  },
  {
    emoji: "🥥",
    color: "from-emerald-500 to-teal-500",
    text: "Kerala produces 45% of India's coconut supply. Every part of the coconut — water, oil, meat, shell — is used in cooking.",
  },
  {
    emoji: "🌶️",
    color: "from-red-500 to-orange-500",
    text: "Kerala was the original 'Spice Capital of the World'. Pepper, cardamom, and cloves from here shaped global trade routes.",
  },
  {
    emoji: "🫘",
    color: "from-amber-500 to-yellow-500",
    text: "Kadala curry (black chickpeas) has a Glycemic Index of just 28 — much lower than rice, making it ideal for blood sugar control.",
  },
  {
    emoji: "🍌",
    color: "from-yellow-400 to-amber-400",
    text: "Kerala's Nendran banana has 3x more potassium than a regular banana and has been shown to reduce blood pressure naturally.",
  },
  {
    emoji: "🌿",
    color: "from-green-500 to-emerald-500",
    text: "Curry leaves (kari patta) contain antioxidants that help regulate blood sugar and support liver function. Use them fresh, not dried!",
  },
  {
    emoji: "🎋",
    color: "from-teal-500 to-green-500",
    text: "Tender jackfruit (Chakka) has more protein than most vegetables at 2g per 100g and is often called Kerala's 'superfood'.",
  },
  {
    emoji: "🫚",
    color: "from-orange-400 to-amber-500",
    text: "Coconut milk has lauric acid — the same fatty acid found in breast milk — which supports immune function and brain health.",
  },
];

export default function DidYouKnowCard() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const t = setInterval(
      () => setCurrent((p) => (p + 1) % FACTS.length),
      4500,
    );
    return () => clearInterval(t);
  }, []);

  const fact = FACTS[current];

  return (
    <div
      className="bg-card rounded-xl border border-border overflow-hidden"
      data-ocid="diduknow.card"
    >
      <div className="flex items-center gap-2 px-4 pt-4 pb-3">
        <span className="text-xl">🌟</span>
        <p className="text-sm font-bold text-foreground">Did You Know?</p>
        <span className="ml-auto text-xs text-muted-foreground">
          {current + 1} / {FACTS.length}
        </span>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.35 }}
          className={`mx-4 mb-4 rounded-xl bg-gradient-to-r ${fact.color} p-4`}
        >
          <div className="text-3xl mb-2">{fact.emoji}</div>
          <p className="text-sm text-white font-medium leading-relaxed">
            {fact.text}
          </p>
        </motion.div>
      </AnimatePresence>
      {/* Dot navigation */}
      <div className="flex justify-center gap-1 pb-3">
        {FACTS.map((f, i) => (
          <button
            key={f.text.slice(0, 20)}
            type="button"
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === current ? "w-4 bg-primary" : "w-1.5 bg-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
