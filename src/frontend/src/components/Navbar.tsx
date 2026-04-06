import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Bell,
  Brain,
  Clock,
  Dumbbell,
  LogOut,
  Moon,
  Sun,
  Trophy,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocalAuth } from "../hooks/useLocalAuth";

interface NavbarProps {
  userName: string;
  onLogFood: () => void;
  onHistory?: () => void;
  onThinkEpic?: () => void;
  onMoveEpic?: () => void;
  onLeaderboard?: () => void;
}

export default function Navbar({
  userName,
  onLogFood,
  onHistory,
  onThinkEpic,
  onMoveEpic,
  onLeaderboard,
}: NavbarProps) {
  const { logout } = useLocalAuth();
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );

  useEffect(() => {
    const stored = localStorage.getItem("doitepic-theme");
    if (stored === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("doitepic-theme", next ? "dark" : "light");
  };

  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-xs">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <img
              src="/assets/uploads/file_0000000091b4720b8ab0302490c69f98-1.png"
              alt="DoitEpic"
              className="h-7 w-auto object-contain"
            />
            <div className="flex items-baseline gap-1">
              <span
                style={{ fontFamily: "'Cinzel', serif" }}
                className="text-sm font-medium tracking-wide text-muted-foreground select-none"
              >
                Do it the{" "}
              </span>
              <span
                style={{ fontFamily: "'Cinzel', serif" }}
                className="epic-text text-lg select-none"
              >
                Epic
              </span>
            </div>
          </div>
          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1">
            <span
              data-ocid="nav.link"
              className="px-3 py-1.5 text-sm font-medium text-primary border-b-2 border-primary cursor-pointer"
            >
              Dashboard
            </span>
            {onThinkEpic && (
              <button
                type="button"
                data-ocid="nav.thinkepic_button"
                onClick={onThinkEpic}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
              >
                <Brain size={14} />
                ThinkEpic
              </button>
            )}
            {onMoveEpic && (
              <button
                type="button"
                data-ocid="nav.moveepic_button"
                onClick={onMoveEpic}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
              >
                <Dumbbell size={14} />
                MoveEpic
              </button>
            )}
            {onLeaderboard && (
              <button
                type="button"
                data-ocid="nav.leaderboard_button"
                onClick={onLeaderboard}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
              >
                <Trophy size={14} />
                Leaderboard
              </button>
            )}
          </nav>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Desktop-only history */}
          {onHistory && (
            <button
              type="button"
              data-ocid="nav.history_button"
              onClick={onHistory}
              title="Meal History"
              className="hidden md:flex w-8 h-8 rounded-full items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
            >
              <Clock size={16} />
            </button>
          )}

          <button
            type="button"
            data-ocid="nav.bell_button"
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
          >
            <Bell size={16} />
          </button>

          <button
            type="button"
            data-ocid="nav.theme_toggle"
            onClick={toggleTheme}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <div className="flex items-center gap-2">
            <Avatar className="w-7 h-7">
              <AvatarFallback className="text-xs font-semibold bg-accent text-accent-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:block text-sm font-medium text-foreground max-w-[100px] truncate">
              {userName}
            </span>
          </div>

          <Button
            data-ocid="nav.log_food_button"
            onClick={onLogFood}
            size="sm"
            className="hidden sm:flex rounded-full px-4 bg-primary text-primary-foreground border-0 font-semibold hover:bg-primary/90 transition-opacity text-xs h-8"
          >
            Log Food
          </Button>

          <button
            type="button"
            data-ocid="nav.logout_button"
            onClick={() => logout()}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
            title="Logout"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </header>
  );
}
