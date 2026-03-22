import { motion } from "motion/react";

const TIPS: Array<{ tip: string; action: string }> = [
  {
    tip: "Protein builds muscle and keeps you full longer.",
    action: "Today: Hit 100g protein. Add 2 boiled eggs + 100g paneer.",
  },
  {
    tip: "Fiber from dal and vegetables supports digestion.",
    action: "Today: Add 1 bowl sambar or 1 cup dal to your lunch.",
  },
  {
    tip: "Coconut water is nature's sports drink — rich in electrolytes.",
    action: "Today: Have 1 coconut water after a workout or in the evening.",
  },
  {
    tip: "Never skip breakfast — it sets your metabolism for the day.",
    action: "Today: Start with 2 idlis + sambar or 1 egg + puttu.",
  },
  {
    tip: "Dehydration slows metabolism and increases cravings.",
    action: "Today: Drink a glass of water before each meal.",
  },
  {
    tip: "Appam with egg curry is one of the most balanced Kerala meals.",
    action: "Today: Choose appam over porotta for fewer refined carbs.",
  },
  {
    tip: "Fish is a superfood — high protein, omega-3, and low fat.",
    action: "Today: Add fish curry to at least one meal.",
  },
  {
    tip: "Sleep is nutrition too — poor sleep raises hunger hormones.",
    action: "Today: Be in bed by 10:30 PM for 7-8 hours of sleep.",
  },
  {
    tip: "Chew slowly. It takes 20 minutes for your brain to register fullness.",
    action: "Today: Put your phone down while eating.",
  },
  {
    tip: "Boiled eggs are the cheapest complete protein source in Kerala.",
    action: "Today: Add 2 boiled eggs to any meal under 500 kcal.",
  },
  {
    tip: "Processed snacks spike insulin and cause energy crashes.",
    action: "Today: Swap chips/biscuits for a banana or handful of peanuts.",
  },
  {
    tip: "Strength training preserves muscle during weight loss.",
    action: "Today: Do 20 push-ups or squats — no gym needed.",
  },
  {
    tip: "Nendran banana is Kerala's superfruit — high potassium, fiber.",
    action: "Today: Have 1 Nendran banana as your afternoon snack.",
  },
  {
    tip: "The biggest meal should be lunch, not dinner.",
    action: "Today: Make lunch your heaviest meal, keep dinner light.",
  },
  {
    tip: "Ghee in small amounts supports fat-soluble vitamin absorption.",
    action: "Today: Add half a teaspoon of ghee to your chapati or rice.",
  },
  {
    tip: "Walking 30 minutes after dinner burns fat and aids digestion.",
    action: "Today: Take a 30-minute walk after your evening meal.",
  },
  {
    tip: "Curd (yogurt) is a probiotic — good for gut health.",
    action: "Today: Have 1 cup of plain curd with lunch.",
  },
  {
    tip: "Skipping meals slows your metabolism and causes overeating.",
    action: "Today: Set a reminder for every 4-5 hours to eat something.",
  },
  {
    tip: "Green tea has antioxidants that support fat metabolism.",
    action: "Today: Replace 1 cup of chai with green tea.",
  },
  {
    tip: "High sugar beverages are the hidden enemy of weight loss.",
    action: "Today: Check nutrition labels — avoid drinks with >10g sugar.",
  },
  {
    tip: "Lentils (dal) are among the highest fiber + protein foods available.",
    action: "Today: Make sure dal is in at least one meal today.",
  },
  {
    tip: "Muscle weighs more than fat — don't panic if scale doesn't move.",
    action: "Today: Take a measurement (waist) instead of weighing.",
  },
  {
    tip: "Cooking at home gives you full control over oil and ingredients.",
    action: "Today: Prepare at least one meal at home from scratch.",
  },
  {
    tip: "A handful of peanuts (30g) gives 8g protein and healthy fats.",
    action: "Today: Keep a small pack of unsalted peanuts as your snack.",
  },
  {
    tip: "Reducing portion of rice by 30% saves ~200 kcal with no sacrifice.",
    action: "Today: Use a smaller plate for rice and fill the rest with curry.",
  },
  {
    tip: "Mornings are the best time for supplements like vitamin D.",
    action: "Today: Step into sunlight for 10-15 minutes in the morning.",
  },
  {
    tip: "Whole wheat or brown rice has more fiber and nutrients than refined.",
    action: "Today: Try replacing white rice with red rice or matta rice.",
  },
  {
    tip: "Spices like turmeric, pepper, and ginger have anti-inflammatory benefits.",
    action: "Today: Add a pinch of turmeric to your rice or milk.",
  },
  {
    tip: "Rest days are as important as workout days for muscle recovery.",
    action: "Today: If you worked out 3+ days in a row, take a rest day.",
  },
  {
    tip: "Social eating leads to 35% more calories on average.",
    action: "Today: When eating out, decide your order before arriving.",
  },
];

export default function MicroCoachingCard() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      86400000,
  );
  const tip = TIPS[dayOfYear % TIPS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="rounded-2xl p-5 text-white shadow-lg"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.72 0.19 45) 0%, oklch(0.77 0.17 75) 100%)",
      }}
      data-ocid="micro_coaching.card"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">
          🎯
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-white/80 uppercase tracking-wider">
              Today's Epic Move
            </span>
          </div>
          <p className="text-sm font-medium text-white mb-2 leading-relaxed">
            {tip.tip}
          </p>
          <div className="bg-white/20 rounded-xl px-3 py-2">
            <p className="text-xs font-bold text-white">⚡ {tip.action}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
