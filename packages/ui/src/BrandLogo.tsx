"use client";

import { useState, useRef, useEffect } from "react";

let useAdminFallback = () => {
  return {
    setIsAdminMode: (mode: boolean) => {},
    isStealthUnlocked: false,
    setIsStealthUnlocked: (unlocked: boolean) => {},
    setVaultPath: (path: string) => {},
  };
};

let toastFallback = {
  info: (message: string, options?: { description?: string; duration?: number }) => {
    console.log(`[Toast] ${message}: ${options?.description || ""}`);
  }
};

export function BrandLogo({ className = "", showText = true, iconClassName = "" }: { className?: string; showText?: boolean; iconClassName?: string }) {
  const { setIsAdminMode, isStealthUnlocked, setIsStealthUnlocked, setVaultPath } = useAdminFallback();
  const [clickCount, setClickCount] = useState(0);
  const lastClickTime = useRef<number>(0);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, []);

  const toggleAdminMode = () => {
    if (isStealthUnlocked) {
      setIsStealthUnlocked(false);
      setIsAdminMode(false);
      toastFallback.info("Exiting Admin Mode", {
        description: "Returning to public view.",
        duration: 3000,
      });
    } else {
      setVaultPath("/vault");
      setIsStealthUnlocked(true);
      setIsAdminMode(true);
      toastFallback.info("Admin Mode Activated", {
        description: "Secret portal revealed.",
        duration: 3000,
      });
    }
  };

  const handleTouchStart = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    longPressTimer.current = setTimeout(() => {
      toggleAdminMode();
    }, 3000);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    if (!e.isTrusted) return;

    const now = Date.now();
    const timeSinceLastClick = now - lastClickTime.current;

    if (timeSinceLastClick > 0 && timeSinceLastClick < 50) return;

    if (timeSinceLastClick > 2000) {
      setClickCount(1);
    } else {
      const newCount = clickCount + 1;
      setClickCount(newCount);
      
      if (newCount === 5) {
        toggleAdminMode();
        setClickCount(0);
      }
    }
    lastClickTime.current = now;
  };

  return (
    <div 
      className={`group flex items-center gap-3 cursor-pointer select-none ${className}`}
      onClick={handleLogoClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
    >
      <img
        src="/mene_tools_circle.png"
        alt="Mene Tools Logo"
        className={`${iconClassName || "h-[36px] w-[36px] md:h-[42px] md:w-[42px]"} rounded-full object-contain transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}
      />
      {showText && (
        <span className="text-xl md:text-2xl font-sans font-black tracking-tighter text-slate-900 dark:text-zinc-50 transition-colors">
          Mene.
        </span>
      )}
    </div>
  );
}

