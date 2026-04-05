import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Brain,
  Dumbbell,
  History,
  Home,
  MoreHorizontal,
  Shield,
  Trophy,
  UtensilsCrossed,
} from "lucide-react";
import { useState } from "react";
import PrivacySettingsModal from "./PrivacySettingsModal";

export type ActivePage = "home" | "eat" | "think" | "move" | "more";

interface BottomNavProps {
  activePage: ActivePage;
  onHome: () => void;
  onEat: () => void;
  onThink: () => void;
  onMove: () => void;
  onHistory?: () => void;
  onLeaderboard?: () => void;
}

export default function BottomNav({
  activePage,
  onHome,
  onEat,
  onThink,
  onMove,
  onHistory,
  onLeaderboard,
}: BottomNavProps) {
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);

  const btnClass = (page: ActivePage) =>
    `flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors relative ${
      activePage === page
        ? "text-primary"
        : "text-muted-foreground hover:text-primary"
    }`;

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-lg md:hidden">
        <div className="flex items-stretch h-14">
          <button
            type="button"
            data-ocid="bottomnav.home_button"
            onClick={onHome}
            className={btnClass("home")}
          >
            {activePage === "home" && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-b-full" />
            )}
            <Home size={18} />
            <span className="text-[10px] font-medium">Home</span>
          </button>
          <button
            type="button"
            data-ocid="bottomnav.eatepic_button"
            onClick={onEat}
            className={btnClass("eat")}
          >
            {activePage === "eat" && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-b-full" />
            )}
            <UtensilsCrossed size={18} />
            <span className="text-[10px] font-medium">EatEpic</span>
          </button>
          <button
            type="button"
            data-ocid="bottomnav.thinkepic_button"
            onClick={onThink}
            className={btnClass("think")}
          >
            {activePage === "think" && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-b-full" />
            )}
            <Brain size={18} />
            <span className="text-[10px] font-medium">ThinkEpic</span>
          </button>
          <button
            type="button"
            data-ocid="bottomnav.moveepic_button"
            onClick={onMove}
            className={btnClass("move")}
          >
            {activePage === "move" && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-b-full" />
            )}
            <Dumbbell size={18} />
            <span className="text-[10px] font-medium">MoveEpic</span>
          </button>
          <button
            type="button"
            data-ocid="bottomnav.more_button"
            onClick={() => setMoreSheetOpen(true)}
            className={btnClass("more")}
          >
            {activePage === "more" && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-b-full" />
            )}
            <MoreHorizontal size={18} />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>

      <Sheet open={moreSheetOpen} onOpenChange={setMoreSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader className="mb-4">
            <SheetTitle>More Options</SheetTitle>
          </SheetHeader>
          <div className="space-y-2 pb-6">
            {onHistory && (
              <button
                type="button"
                data-ocid="more.history_button"
                onClick={() => {
                  setMoreSheetOpen(false);
                  onHistory();
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors text-left"
              >
                <History size={20} className="text-primary" />
                <span className="font-medium text-foreground">History</span>
              </button>
            )}
            {onLeaderboard && (
              <button
                type="button"
                data-ocid="more.leaderboard_button"
                onClick={() => {
                  setMoreSheetOpen(false);
                  onLeaderboard();
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors text-left"
              >
                <Trophy size={20} className="text-primary" />
                <span className="font-medium text-foreground">Leaderboard</span>
              </button>
            )}
            <button
              type="button"
              data-ocid="more.privacy_button"
              onClick={() => setMoreSheetOpen(false)}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors text-left"
            >
              <Shield size={20} className="text-primary" />
              <PrivacySettingsModal />
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
