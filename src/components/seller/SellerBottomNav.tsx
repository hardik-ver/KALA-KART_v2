import React from "react";
import { LayoutDashboard, Boxes, Plus, ClipboardList, User } from "lucide-react";
import { motion } from "motion/react";
import { LanguageCode } from "../../types/artisan";
import type { AppScreen } from "../../App";

interface SellerBottomNavProps {
  currentScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
  language: LanguageCode;
  inventoryCount?: number;
  ordersCount?: number;
  onStartSell?: () => void;
}

interface SellerNavItem {
  id: "home" | "inventory" | "sell" | "orders" | "account";
  screen?: AppScreen;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  labelHi: string;
  labelEn: string;
  badgeCount?: number;
  isActive: boolean;
  isAction?: boolean;
  onClick?: () => void;
}

export const SellerBottomNav: React.FC<SellerBottomNavProps> = ({
  currentScreen,
  onNavigate,
  language,
  inventoryCount = 0,
  ordersCount = 0,
  onStartSell,
}) => {
  // Completely hide the bottom navigation dock during the Add New Craft listing flow
  if (currentScreen.startsWith("sell_")) {
    return null;
  }

  const navItems: SellerNavItem[] = [
    {
      id: "home",
      screen: "dashboard",
      icon: LayoutDashboard,
      labelHi: "डैशबोर्ड",
      labelEn: "Home",
      isActive: currentScreen === "dashboard",
      onClick: () => onNavigate("dashboard"),
    },
    {
      id: "inventory",
      screen: "inventory",
      icon: Boxes,
      labelHi: "इन्वेंट्री",
      labelEn: "Products",
      badgeCount: inventoryCount > 0 ? inventoryCount : undefined,
      isActive: currentScreen === "inventory",
      onClick: () => onNavigate("inventory"),
    },
    ...(onStartSell
      ? [
          {
            id: "sell" as const,
            icon: Plus,
            labelHi: "नया जोड़ें",
            labelEn: "Add Craft",
            isActive: false,
            isAction: true,
            onClick: onStartSell,
          },
        ]
      : []),
    {
      id: "orders",
      screen: "orders",
      icon: ClipboardList,
      labelHi: "ऑर्डर",
      labelEn: "Orders",
      badgeCount: ordersCount > 0 ? ordersCount : undefined,
      isActive: currentScreen === "orders",
      onClick: () => onNavigate("orders"),
    },
    {
      id: "account",
      screen: "account",
      icon: User,
      labelHi: "खाता",
      labelEn: "Account",
      isActive: currentScreen === "account",
      onClick: () => onNavigate("account"),
    },
  ];

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 pointer-events-none flex justify-center items-end px-3"
      style={{
        paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <nav
        role="navigation"
        aria-label="Seller Floating Dock"
        className="pointer-events-auto relative w-full max-w-[390px] sm:max-w-[430px] mx-auto rounded-[26px] p-1.5 flex items-center justify-between gap-1 select-none transition-colors duration-200
          /* Glass / Mirror Effect */
          bg-white/85 dark:bg-[#1C1512]/85
          backdrop-blur-xl
          border border-white/75 dark:border-white/[0.12]
          shadow-[0_10px_35px_-4px_rgba(40,25,18,0.12),0_2px_6px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,0.85)]
          dark:shadow-[0_16px_40px_-4px_rgba(0,0,0,0.65),0_2px_8px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.08)]"
      >
        {/* Subtle glass specular highlight overlay */}
        <div
          aria-hidden="true"
          className="absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent pointer-events-none rounded-full"
        />

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.isActive;
          const isAction = item.isAction;
          const label = language === "hi" ? item.labelHi : item.labelEn;

          // Special styling for center "Add Craft" action button
          if (isAction) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                aria-label={label}
                className="relative flex-1 min-w-0 py-1 px-1 rounded-2xl flex flex-col items-center justify-center group outline-hidden interactive-hover-nav kk-nav-item-interactive"
              >
                <div className="relative p-1 rounded-xl bg-kk-primary text-white shadow-md shadow-kk-primary/30 flex items-center justify-center group-hover:bg-kk-primary-dark transition-colors">
                  <Icon className="w-4 h-4" strokeWidth={2.6} />
                </div>
                <span className="text-[9.5px] leading-tight tracking-tight truncate max-w-full mt-1 font-bold text-kk-primary">
                  {label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={item.onClick}
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
              className="relative flex-1 min-w-0 py-1.5 px-1 rounded-2xl flex flex-col items-center justify-center group outline-hidden interactive-hover-nav kk-nav-item-interactive"
            >
              {/* Sliding Glass Highlight Indicator */}
              {isActive && (
                <motion.div
                  layoutId="sellerDockGlassHighlight"
                  className="absolute inset-0 rounded-2xl bg-kk-primary/12 dark:bg-kk-primary/22 border border-kk-primary/25 dark:border-kk-primary/35 shadow-[0_0_14px_rgba(184,99,50,0.18)] pointer-events-none"
                  transition={{
                    type: "spring",
                    stiffness: 450,
                    damping: 34,
                    mass: 0.8,
                  }}
                />
              )}

              {/* Icon Container with Micro-interactions */}
              <div className="relative flex items-center justify-center z-10">
                <motion.div
                  animate={{
                    scale: isActive ? 1.08 : 1,
                    y: isActive ? -1 : 0,
                  }}
                  transition={{
                    duration: 0.18,
                    ease: "easeOut",
                  }}
                  className={`relative flex items-center justify-center transition-colors duration-150 ${
                    isActive
                      ? "text-kk-primary drop-shadow-[0_1px_6px_rgba(184,99,50,0.35)]"
                      : "text-stone-500 hover:text-stone-800 dark:text-[#9A8B80] dark:hover:text-[#F6EFEA]"
                  }`}
                >
                  <Icon
                    className="w-[18px] h-[18px] sm:w-[19px] sm:h-[19px] shrink-0"
                    strokeWidth={isActive ? 2.3 : 1.85}
                  />

                  {/* Badge Counter */}
                  {item.badgeCount !== undefined && item.badgeCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      className={`absolute -top-1.5 -right-2 text-[8.5px] font-extrabold px-1 min-w-[14px] h-[14px] flex items-center justify-center rounded-full leading-none shadow-2xs border ${
                        isActive
                          ? "bg-kk-primary text-white border-white dark:border-[#241A15]"
                          : "bg-stone-200 dark:bg-[#352C27] text-stone-700 dark:text-[#F6EFEA] border-white dark:border-[#241A15]"
                      }`}
                    >
                      {item.badgeCount > 99 ? "99+" : item.badgeCount}
                    </motion.span>
                  )}
                </motion.div>
              </div>

              {/* Label */}
              <span
                className={`relative z-10 text-[9.5px] leading-tight tracking-tight truncate max-w-full mt-0.5 transition-colors duration-150 ${
                  isActive
                    ? "font-bold text-kk-primary"
                    : "font-medium text-stone-500 dark:text-[#8C7E74] group-hover:text-stone-700 dark:group-hover:text-[#DDD1C8]"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
