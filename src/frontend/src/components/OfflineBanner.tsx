import { WifiOff } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useNetworkStatus } from "../hooks/useNetworkStatus";

export default function OfflineBanner() {
  const isOnline = useNetworkStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          key="offline-banner"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          data-ocid="offline.error_state"
          className="sticky top-16 z-40 bg-yellow-400 text-yellow-900 px-4 py-2.5 flex items-center justify-center gap-2 text-sm font-medium shadow-md"
        >
          <WifiOff size={16} className="flex-shrink-0" />
          <span>
            You're offline — meals are saved locally and will sync when you're
            back online.
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
