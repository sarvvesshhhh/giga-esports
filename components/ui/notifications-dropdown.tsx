"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Trophy, AlertTriangle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getRecentNotifications } from "@/actions/notifications";
import { formatDistanceToNow } from "date-fns";

type Notification = {
  id: string;
  changeAmount: number;
  newScore: number;
  reason: string;
  timestamp: Date;
};

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = async () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    
    if (nextState && notifications.length === 0) {
      setLoading(true);
      const data = await getRecentNotifications();
      setNotifications(data);
      setUnread(false);
      setLoading(false);
    }
  };

  // Helper to determine the icon/color based on the reason
  const getIcon = (reason: string, change: number) => {
    if (reason.includes("HIT") || change > 0) return <Trophy className="w-4 h-4 text-emerald-500" />;
    if (reason.includes("MISS") || change < 0) return <AlertTriangle className="w-4 h-4 text-red-500" />;
    return <Info className="w-4 h-4 text-zinc-400" />;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button 
        onClick={handleToggle}
        className="relative p-2 text-zinc-400 hover:text-red-600 transition-colors rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900"
      >
        <Bell className="w-4 h-4 md:w-5 md:h-5" />
        {unread && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full border border-white dark:border-zinc-950 animate-pulse" />
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-md overflow-hidden z-50 origin-top-right"
          >
            {/* Header */}
            <div className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                System Updates
              </span>
            </div>

            {/* Content list */}
            <div className="max-h-[300px] overflow-y-auto">
              {loading ? (
                <div className="p-6 flex flex-col items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-[10px] uppercase font-mono text-zinc-500">Decrypting...</span>
                </div>
              ) : notifications.length > 0 ? (
                <div className="flex flex-col">
                  {notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      className="flex gap-3 items-start p-4 border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
                    >
                      <div className="mt-0.5 bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-full">
                        {getIcon(notif.reason, notif.changeAmount)}
                      </div>
                      <div className="flex flex-col gap-1 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wide">
                            {notif.reason.replace(/_/g, " ")}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-mono">
                            {formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-500 dark:text-zinc-400">GigaScore Adjustment</span>
                          <span className={`font-mono font-bold ${notif.changeAmount > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {notif.changeAmount > 0 ? '+' : ''}{notif.changeAmount} PTS
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center flex flex-col items-center gap-2">
                  <Bell className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mb-2" />
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">No Alerts</span>
                  <p className="text-[10px] text-zinc-400 max-w-[200px]">
                    Your operations channel is currently quiet. Awaiting new intel.
                  </p>
                </div>
              )}
            </div>
            
            {/* Footer */}
            {notifications.length > 0 && (
              <div className="bg-zinc-50 dark:bg-zinc-900/50 px-4 py-2 border-t border-zinc-200 dark:border-zinc-800 text-center">
                <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest">
                  End of transmission
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
