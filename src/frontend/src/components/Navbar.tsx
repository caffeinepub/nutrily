import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, Clock, LogOut, Zap } from "lucide-react";
import { useLocalAuth } from "../hooks/useLocalAuth";

interface NavbarProps {
  userName: string;
  onLogFood: () => void;
  onHistory?: () => void;
}

export default function Navbar({
  userName,
  onLogFood,
  onHistory,
}: NavbarProps) {
  const { logout } = useLocalAuth();

  const handleLogout = () => {
    logout();
  };

  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-xs">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg hero-gradient flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground">DOITEPIC</span>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            <span
              data-ocid="nav.link"
              className="px-4 py-2 text-sm font-medium text-primary border-b-2 border-primary cursor-pointer"
            >
              Dashboard
            </span>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {onHistory && (
            <button
              type="button"
              data-ocid="nav.history_button"
              onClick={onHistory}
              title="Meal History"
              className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
            >
              <Clock size={18} />
            </button>
          )}

          <button
            type="button"
            data-ocid="nav.bell_button"
            className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
          >
            <Bell size={18} />
          </button>

          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="text-xs font-semibold bg-accent text-accent-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:block text-sm font-medium text-foreground">
              {userName}
            </span>
          </div>

          <Button
            data-ocid="nav.log_food_button"
            onClick={onLogFood}
            size="sm"
            className="rounded-full px-5 hero-gradient text-white border-0 font-semibold hover:opacity-90 transition-opacity"
          >
            Log Food
          </Button>

          <button
            type="button"
            data-ocid="nav.logout_button"
            onClick={handleLogout}
            className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
