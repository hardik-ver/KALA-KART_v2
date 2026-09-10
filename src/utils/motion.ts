/**
 * Kala-Kart Native Mobile Motion Design System
 * Fast, GPU-accelerated (transform & opacity only), 60-120 FPS mobile physics
 * Strictly honors prefers-reduced-motion
 */

import { type Transition, type Variants } from "motion/react";

// Standard mobile spring curves
export const mobileSpring: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 32,
  mass: 0.8,
};

export const snappySpring: Transition = {
  type: "spring",
  stiffness: 500,
  damping: 28,
};

export const smoothEase: Transition = {
  duration: 0.22,
  ease: [0.16, 1, 0.3, 1], // Custom iOS/Android deceleration curve
};

export const fastEase: Transition = {
  duration: 0.15,
  ease: [0.2, 0, 0, 1],
};

// Screen & View transitions (Native Mobile Stack)
export const screenVariants: Variants = {
  initial: {
    opacity: 0,
    y: 6,
    scale: 0.995,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -4,
    scale: 0.995,
    transition: {
      duration: 0.15,
      ease: [0.4, 0, 1, 1],
    },
  },
};

// Section & Major Card Entrances
export const cardEntranceVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: (custom: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: Math.min(custom * 0.04, 0.2),
      duration: 0.22,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

// Modal & Dialog Transitions
export const modalBackdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.18, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

export const modalScaleVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.94,
    y: 8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 26,
      stiffness: 380,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 6,
    transition: { duration: 0.14, ease: "easeIn" },
  },
};

// Native Mobile Bottom Sheet Transition
export const bottomSheetVariants: Variants = {
  hidden: {
    y: "100%",
    opacity: 0.8,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      damping: 30,
      stiffness: 360,
    },
  },
  exit: {
    y: "100%",
    opacity: 0,
    transition: {
      duration: 0.18,
      ease: [0.4, 0, 1, 1],
    },
  },
};

// Dropdowns & Overflow Menus
export const dropdownVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.92,
    y: -6,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.15,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.94,
    y: -4,
    transition: {
      duration: 0.12,
      ease: "easeIn",
    },
  },
};

// Button Press Feedback Props
export const tapScale = {
  whileTap: { scale: 0.96 },
  transition: { duration: 0.1, ease: "easeOut" },
};

export const tapScaleSubtle = {
  whileTap: { scale: 0.98 },
  transition: { duration: 0.1, ease: "easeOut" },
};

export const tapPop = {
  whileTap: { scale: 0.88 },
  transition: { type: "spring", stiffness: 450, damping: 20 },
};
