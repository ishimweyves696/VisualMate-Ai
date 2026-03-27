import { AppAnalytics } from "../types";

export const defaultAnalytics: AppAnalytics = {
  totalGenerations: 0,
  mostFrequentTopics: [],
  upgradeModalTriggers: 0,
  sessionCount: 0,
};

export const getAnalytics = (): AppAnalytics => {
  return defaultAnalytics;
};

export const saveAnalytics = (analytics: AppAnalytics) => {
  // Persistence handled by App.tsx
};

export const trackGeneration = (topic: string) => {
  // Handled by App.tsx state update
};

export const trackUpgradeTrigger = () => {
  // Handled by App.tsx state update
};

export const trackSession = () => {
  // Handled by App.tsx state update
};
