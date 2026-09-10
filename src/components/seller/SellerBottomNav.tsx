import React from "react";
import { Home, Boxes, ClipboardList, User } from "lucide-react";
import { LanguageCode } from "../../types/artisan";
import type { AppScreen } from "../../App";
import { motion } from "motion/react";

interface SellerBottomNavProps {
  currentScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
  language: LanguageCode;
  inventoryCount?: number;
  ordersCount?: number;
}

export const SellerBottomNav: React.FC<SellerBottomNavProps> = ({
  currentScreen,
  onNavigate,
  language,
  inventoryCount = 0,
  ordersCount = 0,
}) => {
  // Completely hide the bottom navigation bar during the Add New Craft workflow
  if (currentScreen.startsWith("sell_")) {
    return null;
  }

  const navItems: Array<{
    id: "home" | "inventory" | "orders" | "account";
    screen: AppScreen;
    icon: React.ComponentType<{ className?: string }>;
    labelHi: string;
    labelEn: string;
    badgeCount?: number;
    isActive: boolean;
  }> = [
    {
      id: "home",
      screen: "dashboard",
      icon: Home,
      labelHi: "होम",
      labelEn: "Home",
      isActive: currentScreen === "dashboard",
    },
    {
      id: "inventory",
      screen: "inventory",
      icon: Boxes,
      labelHi: "इन्वेंट्री",
      labelEn: "Inventory",
      badgeCount: inventoryCount > 0 ? inventoryCount : undefined,
      isActive: currentScreen === "inventory",
    },
    {
      id: "orders",
      screen: "orders",
      icon: ClipboardList,
      labelHi: "ऑर्डर",
      labelEn: "Orders",
      badgeCount: ordersCount > 0 ? ordersCount : undefined,
      isActive: currentScreen === "orders",
    },
    {
      id: "account",
      screen: "account",
      icon: User,
      labelHi: "खाता",
      labelEn: "Account",
      isActive: currentScreen === "account",
    },
  ];

  return (
    <nav
      role="navigation"
      aria-label="Seller Mobile Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#1C1614]/95 backdrop-blur-md rounded-t-2xl border-t border-kk-line dark:border-[#382E28] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.5)] px-1.5 pt-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] flex items-center justify-around select-none w-full max-w-full box-border"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = item.isActive;
        const label = language === "hi" ? item.labelHi : item.labelEn;

        return (
          <motion.button
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.screen)}
            whileTap={{ scale: 0.92 }}
            aria-label={label}
            aria-current={active ? "page" : undefined}
            className={`flex-1 min-w-0 py-1 px-1 rounded-xl flex flex-col items-center justify-center transition-colors tap-press ${
              active
                ? "text-kk-primary font-bold"
                : "text-stone-500 hover:text-kk-ink dark:text-[#877C73] dark:hover:text-[#F6EFEA] font-medium"
            }`}
          >
            <div className="relative p-1 rounded-xl">
              {active && (
                <motion.div
                  layoutId="seller-bottom-nav-active-pill"
                  className="absolute inset-0 bg-kk-primary-soft/80 dark:bg-[#352C27] rounded-xl dark:border dark:border-[#4D3F37] dark:shadow-xs"
                  transition={{ type: "spring", stiffness: 480, damping: 34 }}
                />
              )}
              <motion.div
                animate={{ scale: active ? 1.12 : 1, y: active ? -1 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                className="relative z-10"
              >
                <Icon className="w-4 h-4 shrink-0" />
              </motion.div>
              {item.badgeCount !== undefined && item.badgeCount > 0 && (
                <motion.span
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className={`absolute -top-1 -right-1.5 text-[8px] font-bold px-1 min-w-[14px] h-3.5 flex items-center justify-center rounded-full leading-none shadow-2xs z-20 ${
                    active
                      ? "bg-kk-primary text-white"
                      : "bg-stone-200 dark:bg-[#352C27] text-stone-700 dark:text-[#F6EFEA]"
                  }`}
                >
                  {item.badgeCount > 99 ? "99+" : item.badgeCount}
                </motion.span>
              )}
            </div>
            <motion.span
              animate={{ scale: active ? 1.04 : 1 }}
              transition={{ duration: 0.15 }}
              className="text-[10px] leading-tight tracking-tight truncate max-w-full mt-0.5"
            >
              {label}
            </motion.span>
          </motion.button>
        );
      })}
    </nav>
  );
};
