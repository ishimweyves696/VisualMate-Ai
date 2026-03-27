import { UserSettings } from "../types";

export const defaultSettings: UserSettings = {
  onboardingCompleted: false,
  theme: 'light',
};

export const getSettings = (): UserSettings => {
  return defaultSettings;
};

export const saveSettings = (settings: UserSettings) => {
  // Persistence handled by App.tsx
};

export const completeOnboarding = () => {
  // Handled by App.tsx state update
};
