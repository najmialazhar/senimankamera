"use client";

import { useEffect } from "react";
import { logoutAction } from "@/src/modules/auth/actions/login.action";

const TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export function SessionTimeout() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Initialize/reset last activity on component mount
    localStorage.setItem("admin_last_activity", Date.now().toString());

    const updateActivity = () => {
      localStorage.setItem("admin_last_activity", Date.now().toString());
    };

    // Listen to common user activity events
    const activityEvents = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    activityEvents.forEach((event) => {
      window.addEventListener(event, updateActivity, { passive: true });
    });

    // Check inactivity every 10 seconds
    const interval = setInterval(async () => {
      const lastActivityStr = localStorage.getItem("admin_last_activity");
      if (lastActivityStr) {
        const lastActivity = parseInt(lastActivityStr, 10);
        const elapsed = Date.now() - lastActivity;

        if (elapsed >= TIMEOUT_MS) {
          clearInterval(interval);
          localStorage.removeItem("admin_last_activity");

          try {
            await logoutAction();
          } catch (err) {
            console.error("Failed to execute logoutAction:", err);
            // Client-side fallback redirect
            window.location.href = "/login";
          }
        }
      }
    }, 10000);

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, updateActivity);
      });
      clearInterval(interval);
    };
  }, []);

  return null;
}
