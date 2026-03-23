import { ArrowLeft, Trophy } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";

interface LeaderboardEntry {
  id: string;
  name: string;
  streak: number;
  points: number;
  weeklyXp: number;
  isCurrentUser?: boolean;
}

interface LeaderboardProps {
  onBack: () => void;
  currentUserName: string;
}

const MOCK_USERS: Omit<LeaderboardEntry, "isCurrentUser">[] = [
  { id: "1", name: "Arjun Nair", streak: 52, points: 1840, weeklyXp: 380 },
  { id: "2", name: "Priya Menon", streak: 45, points: 1620, weeklyXp: 340 },
  { id: "3", name: "Rahul Krishnan", streak: 38, points: 1400, weeklyXp: 295 },
  { id: "4", name: "Ananya Pillai", streak: 33, points: 1210, weeklyXp: 260 },
  { id: "5", name: "Vishnu Raj", streak: 28, points: 980, weeklyXp: 220 },
  { id: "6", name: "Deepa Varma", streak: 24, points: 850, weeklyXp: 185 },
  { id: "7", name: "Arun Kumar", streak: 19, points: 720, weeklyXp: 160 },
  { id: "8", name: "Sreelakshmi T", streak: 15, points: 560, weeklyXp: 130 },
  { id: "9", name: "Midhun Chandran", streak: 12, points: 430, weeklyXp: 95 },
  { id: "10", name: "Kavya Suresh", streak: 9, points: 310, weeklyXp: 70 },
  { id: "11", name: "Jibin George", streak: 7, points: 230, weeklyXp: 55 },
  { id: "12", name: "Aiswarya P", streak: 5, points: 175, weeklyXp: 40 },
  { id: "13", name: "Roshan Mathew", streak: 4, points: 120, weeklyXp: 25 },
  { id: "14", name: "Nithya Rajan", streak: 2, points: 80, weeklyXp: 15 },
];

function getMilestoneBadge(
  streak: number,
): { label: string; color: string } | null {
  if (streak >= 30)
    return {
      label: "Gold",
      color: "bg-yellow-400/20 text-yellow-700 dark:text-yellow-300",
    };
  if (streak >= 7)
    return {
      label: "Silver",
      color: "bg-gray-300/30 text-gray-600 dark:text-gray-300",
    };
  if (streak >= 3)
    return {
      label: "Bronze",
      color: "bg-amber-700/20 text-amber-800 dark:text-amber-400",
    };
  return null;
}

function getRankStyle(rank: number): string {
  if (rank === 1)
    return "bg-gradient-to-r from-yellow-400/20 to-amber-300/10 border-yellow-400/40";
  if (rank === 2)
    return "bg-gradient-to-r from-gray-300/20 to-gray-200/10 border-gray-400/30";
  if (rank === 3)
    return "bg-gradient-to-r from-amber-700/20 to-amber-600/10 border-amber-700/30";
  return "bg-card border-border";
}

function getRankEmoji(rank: number): string {
  if (rank === 1) return "👑";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return String(rank);
}

export default function Leaderboard({
  onBack,
  currentUserName,
}: LeaderboardProps) {
  const [activeTab, setActiveTab] = useState<"streaks" | "points" | "weekly">(
    "streaks",
  );

  // Read current user data from localStorage
  const currentUser: LeaderboardEntry = useMemo(() => {
    const bestStreak = Number(
      localStorage.getItem("doitepic_best_streak") ?? 0,
    );
    let points = 0;
    try {
      const streakData = JSON.parse(
        localStorage.getItem("doitepic_streak_data") ?? "null",
      );
      if (streakData?.points) points = Number(streakData.points);
    } catch {
      /* ignore */
    }
    // Weekly XP: sum of completed missions
    let weeklyXp = 0;
    try {
      const week = new Date()
        .toISOString()
        .slice(0, 10)
        .replace(/-\d{2}$/, "-01");
      const missionsRaw = localStorage.getItem(`doitepic_missions_${week}`);
      if (missionsRaw) {
        const missions = JSON.parse(missionsRaw);
        if (Array.isArray(missions)) {
          weeklyXp = missions
            .filter((m: any) => m.completed)
            .reduce((sum: number, m: any) => sum + (m.xp ?? 0), 0);
        }
      }
    } catch {
      /* ignore */
    }
    return {
      id: "current",
      name: currentUserName || "You",
      streak: bestStreak,
      points,
      weeklyXp,
      isCurrentUser: true,
    };
  }, [currentUserName]);

  const allEntries: LeaderboardEntry[] = useMemo(() => {
    return [
      ...MOCK_USERS.map((u) => ({ ...u, isCurrentUser: false })),
      currentUser,
    ];
  }, [currentUser]);

  const sorted = useMemo(() => {
    const key =
      activeTab === "streaks"
        ? "streak"
        : activeTab === "points"
          ? "points"
          : "weeklyXp";
    return [...allEntries].sort((a, b) => b[key] - a[key]);
  }, [allEntries, activeTab]);

  const top3 = sorted.slice(0, 3);
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);
  const podiumHeights = ["h-20", "h-28", "h-16"];
  const podiumPos = [2, 1, 3];

  const getValue = (entry: LeaderboardEntry) => {
    if (activeTab === "streaks") return `${entry.streak} days`;
    if (activeTab === "points") return `${entry.points} pts`;
    return `${entry.weeklyXp} XP`;
  };

  const tabs = [
    { id: "streaks" as const, label: "🔥 Streaks" },
    { id: "points" as const, label: "⭐ Points" },
    { id: "weekly" as const, label: "⚡ Weekly XP" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] text-white px-4 py-5 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            type="button"
            data-ocid="leaderboard.close_button"
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors flex-shrink-0"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <Trophy size={22} className="text-yellow-300" />
            <div>
              <h1 className="font-extrabold text-xl leading-tight">
                Leaderboard
              </h1>
              <p className="text-xs text-white/75">
                Compete with the DoitEpic community
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-2xl mx-auto mt-4 flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              data-ocid={`leaderboard.${tab.id}.tab`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-white text-[#1E3A8A] shadow"
                  : "bg-white/15 text-white/80 hover:bg-white/25"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        {/* Podium */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-6"
        >
          <div className="flex items-end justify-center gap-3 h-44">
            {podiumOrder.map((entry, i) => {
              if (!entry) return null;
              const rank = sorted.findIndex((e) => e.id === entry.id) + 1;
              const isUser = entry.isCurrentUser;
              return (
                <div
                  key={entry.id}
                  className="flex flex-col items-center gap-1 flex-1 max-w-[120px]"
                >
                  <div className="text-2xl">
                    {rank === 1 ? "👑" : rank === 2 ? "🥈" : "🥉"}
                  </div>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-md ${
                      isUser
                        ? "bg-primary text-white"
                        : "bg-gradient-to-br from-blue-400 to-blue-600 text-white"
                    }`}
                  >
                    {entry.name.slice(0, 2).toUpperCase()}
                  </div>
                  <p
                    className={`text-xs font-semibold text-center truncate w-full text-center ${
                      isUser ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {isUser ? "You" : entry.name.split(" ")[0]}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {getValue(entry)}
                  </p>
                  <div
                    className={`w-full rounded-t-xl flex items-end justify-center pb-2 text-white font-black text-lg ${
                      rank === 1
                        ? "bg-gradient-to-b from-yellow-400 to-amber-500"
                        : rank === 2
                          ? "bg-gradient-to-b from-gray-400 to-gray-500"
                          : "bg-gradient-to-b from-amber-600 to-amber-700"
                    } ${podiumHeights[i]}`}
                  >
                    {podiumPos[i]}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Full list */}
        <div className="space-y-2">
          {sorted.map((entry, index) => {
            const rank = index + 1;
            const badge = getMilestoneBadge(entry.streak);
            const isUser = entry.isCurrentUser;
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: index * 0.03 }}
                data-ocid={`leaderboard.item.${rank}`}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  isUser
                    ? "border-primary bg-primary/8 shadow-sm"
                    : getRankStyle(rank)
                }`}
              >
                {/* Rank */}
                <div
                  className={`w-9 text-center font-black text-sm flex-shrink-0 ${
                    rank <= 3 ? "text-xl" : "text-muted-foreground"
                  }`}
                >
                  {getRankEmoji(rank)}
                </div>

                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    isUser
                      ? "bg-primary text-white"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {entry.name.slice(0, 2).toUpperCase()}
                </div>

                {/* Name + badge */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-semibold truncate ${
                        isUser ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {isUser ? `${entry.name} (You)` : entry.name}
                    </span>
                    {badge && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    🔥 {entry.streak}d · ⭐ {entry.points}pts · ⚡
                    {entry.weeklyXp}XP
                  </p>
                </div>

                {/* Score */}
                <div
                  className={`text-sm font-black flex-shrink-0 ${
                    rank === 1
                      ? "text-yellow-500"
                      : rank === 2
                        ? "text-gray-500"
                        : rank === 3
                          ? "text-amber-700"
                          : isUser
                            ? "text-primary"
                            : "text-foreground"
                  }`}
                >
                  {getValue(entry)}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer tip */}
        <p className="text-center text-xs text-muted-foreground mt-6 pb-4">
          Complete daily check-ins, log meals, and finish workouts to climb the
          ranks! 🚀
        </p>
      </main>
    </div>
  );
}
