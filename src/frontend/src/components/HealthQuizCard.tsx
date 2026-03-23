import { CheckCircle2, XCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const QUIZZES = [
  {
    q: "How long can cooked rice be safely left at room temperature?",
    options: ["30 minutes", "2 hours", "6 hours", "12 hours"],
    answer: 1,
    explanation:
      "Cooked rice can harbor Bacillus cereus spores. In Kerala's humid climate, rice left for more than 2 hours at room temperature becomes risky. Refrigerate immediately!",
  },
  {
    q: "Which Kerala breakfast is considered a complete protein meal?",
    options: [
      "Dosa with chutney",
      "Puttu with kadala curry",
      "Bread with butter",
      "Upma with pickle",
    ],
    answer: 1,
    explanation:
      "Puttu (rice) + Kadala curry (chickpeas) together form a complete protein with all essential amino acids — a nutritional powerhouse traditional to Kerala!",
  },
  {
    q: "What is the safest sign that fish is fresh in Kerala markets?",
    options: [
      "Bright red gills & firm flesh",
      "Strong smell & soft texture",
      "Grey gills & loose flesh",
      "Any smell is normal",
    ],
    answer: 0,
    explanation:
      "Fresh fish has bright red gills, clear eyes, firm flesh, and a mild sea smell. Avoid fish with a strong ammonia odor, cloudy eyes, or slimy, soft texture.",
  },
];

const SCORE_MESSAGES = [
  {
    emoji: "😅",
    msg: "Keep learning! Food safety protects you and your family.",
  },
  { emoji: "🙂", msg: "Not bad! One more and you'd have a perfect score." },
  {
    emoji: "😊",
    msg: "Great! Two correct shows strong food safety awareness.",
  },
  { emoji: "🏆", msg: "Perfect score! You're a Kerala food safety expert!" },
];

const STORAGE_KEY = "doitepic_quiz_done";

export default function HealthQuizCard() {
  const today = new Date().toISOString().split("T")[0];
  const storageKey = `${STORAGE_KEY}_${today}`;
  const savedScore = (() => {
    try {
      const r = localStorage.getItem(storageKey);
      return r !== null ? Number(r) : null;
    } catch {
      return null;
    }
  })();

  const [answers, setAnswers] = useState<(number | null)[]>([null, null, null]);
  const [qIndex, setQIndex] = useState(0);
  const [finished, setFinished] = useState(savedScore !== null);
  const [score, setScore] = useState(savedScore ?? 0);

  const handleAnswer = (optionIdx: number) => {
    if (answers[qIndex] !== null) return;
    const newAnswers = [...answers];
    newAnswers[qIndex] = optionIdx;
    setAnswers(newAnswers);

    setTimeout(() => {
      if (qIndex < QUIZZES.length - 1) {
        setQIndex(qIndex + 1);
      } else {
        const finalScore = newAnswers.reduce(
          (acc, a, i) => (acc ?? 0) + ((a ?? -1) === QUIZZES[i].answer ? 1 : 0),
          0,
        );
        setScore(finalScore ?? 0);
        setFinished(true);
        localStorage.setItem(storageKey, String(finalScore));
      }
    }, 1200);
  };

  const quiz = QUIZZES[qIndex];
  const answered = answers[qIndex];

  return (
    <div
      className="bg-card rounded-xl border border-border p-4"
      data-ocid="quiz.card"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🧪</span>
        <div>
          <p className="text-sm font-bold text-foreground">
            Health Quiz of the Day
          </p>
          <p className="text-xs text-muted-foreground">
            Test your Kerala food safety knowledge
          </p>
        </div>
        {!finished && (
          <span className="ml-auto text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            {qIndex + 1} / {QUIZZES.length}
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!finished ? (
          <motion.div
            key={`q-${qIndex}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-sm font-medium text-foreground mb-3">{quiz.q}</p>
            <div className="space-y-2">
              {quiz.options.map((opt, i) => {
                const isSelected = answered === i;
                const isCorrect = i === quiz.answer;
                const showResult = answered !== null;
                return (
                  <button
                    key={opt}
                    type="button"
                    data-ocid="quiz.radio"
                    disabled={answered !== null}
                    onClick={() => handleAnswer(i)}
                    className={`w-full text-left text-sm px-3 py-2 rounded-lg border-2 transition-all flex items-center justify-between ${
                      showResult && isCorrect
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                        : showResult && isSelected && !isCorrect
                          ? "border-red-400 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                          : isSelected
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50 text-foreground"
                    }`}
                  >
                    <span>{opt}</span>
                    {showResult && isCorrect && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    )}
                    {showResult && isSelected && !isCorrect && (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </button>
                );
              })}
            </div>
            {answered !== null && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-muted-foreground mt-2 bg-muted/50 rounded-lg p-2 leading-relaxed"
              >
                💡 {quiz.explanation}
              </motion.p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-3"
            data-ocid="quiz.success_state"
          >
            <div className="text-4xl mb-2">{SCORE_MESSAGES[score].emoji}</div>
            <p className="text-xl font-bold text-foreground">
              {score} / {QUIZZES.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {SCORE_MESSAGES[score].msg}
            </p>
            <div className="flex justify-center gap-1 mt-3">
              {QUIZZES.map((qItem, i) => (
                <div
                  key={`qr-${qItem.answer}`}
                  className={`w-3 h-3 rounded-full ${
                    answers[i] === QUIZZES[i].answer
                      ? "bg-emerald-500"
                      : savedScore !== null
                        ? "bg-gray-300"
                        : "bg-red-400"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Come back tomorrow for new questions!
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
