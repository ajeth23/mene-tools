"use client";

export interface UsageStatus {
  count: number;
  limit: number;
  remaining: number;
}

export function getAIUsage(): UsageStatus {
  if (typeof window === "undefined") {
    return { count: 0, limit: 3, remaining: 3 };
  }

  const today = new Date().toISOString().split("T")[0];
  const storedDate = localStorage.getItem("mene_ai_limit_date");
  let count = 0;

  if (storedDate === today) {
    const storedCount = localStorage.getItem("mene_ai_limit_count");
    count = storedCount ? parseInt(storedCount, 10) : 0;
  } else {
    // New day, reset counter
    localStorage.setItem("mene_ai_limit_date", today);
    localStorage.setItem("mene_ai_limit_count", "0");
  }

  const limit = 3;
  const remaining = Math.max(0, limit - count);

  return { count, limit, remaining };
}

export function incrementAIUsage(): void {
  if (typeof window === "undefined") return;

  const today = new Date().toISOString().split("T")[0];
  const storedDate = localStorage.getItem("mene_ai_limit_date");
  let count = 0;

  if (storedDate === today) {
    const storedCount = localStorage.getItem("mene_ai_limit_count");
    count = storedCount ? parseInt(storedCount, 10) : 0;
  } else {
    localStorage.setItem("mene_ai_limit_date", today);
  }

  const newCount = count + 1;
  localStorage.setItem("mene_ai_limit_count", newCount.toString());
}
