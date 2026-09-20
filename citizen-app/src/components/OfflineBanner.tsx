"use client";

import { useState, useEffect } from "react";
import { WifiOff } from "lucide-react";

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Set initial state
    setIsOffline(!navigator.onLine);

    // Add event listeners
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="bg-yellow-500 text-white px-4 py-2 flex items-center justify-center space-x-2 animate-in slide-in-from-top-full duration-300">
      <WifiOff className="w-4 h-4" />
      <span className="text-sm font-medium">
        You are offline. Complaints will be saved locally.
      </span>
    </div>
  );
}
