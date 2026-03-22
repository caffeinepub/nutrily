import { WifiOff } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { useOfflineQueue } from "../hooks/useOfflineCache";

export default function OfflineBanner() {
  const isOnline = useNetworkStatus();
  const { queueCount, flushQueue } = useOfflineQueue();
  const [syncing, setSyncing] = useState(false);
  const [justSynced, setJustSynced] = useState(false);

  useEffect(() => {
    if (isOnline && queueCount > 0) {
      setSyncing(true);
      // Simulate a short sync delay then clear queue
      const t = setTimeout(() => {
        flushQueue();
        setSyncing(false);
        setJustSynced(true);
        toast.success("All synced! Your offline logs are now saved. ✅");
        setTimeout(() => setJustSynced(false), 4000);
      }, 1500);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [isOnline, queueCount, flushQueue]);

  const showBanner = !isOnline || syncing || justSynced;

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          key="offline-banner"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          data-ocid="offline.error_state"
          className={[
            "sticky top-16 z-40 px-4 py-2.5 flex items-center justify-center gap-2 text-sm font-medium shadow-md",
            justSynced
              ? "bg-success text-success-foreground"
              : syncing
                ? "bg-primary text-primary-foreground"
                : "bg-warning text-warning-foreground",
          ].join(" ")}
        >
          {!isOnline && !syncing && (
            <>
              <WifiOff size={16} className="flex-shrink-0" />
              <span>
                Offline
                {queueCount > 0
                  ? ` — ${queueCount} item${queueCount !== 1 ? "s" : ""} queued for sync`
                  : " — meals saved locally and will sync when you're back online"}
              </span>
            </>
          )}
          {syncing && (
            <span>
              🔄 Back online! Syncing {queueCount} pending item
              {queueCount !== 1 ? "s" : ""}...
            </span>
          )}
          {justSynced && !syncing && <span>✅ All synced!</span>}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
