import { UserSettings } from "../types";

const STORAGE_KEY = 'visualmind_settings';

const defaultSettings: UserSettings = {
  onboardingCompleted: false,
  theme: 'light',
};

export const getSettings = (): UserSettings => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : defaultSettings;
};

export const saveSettings = (settings: UserSettings) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
};

export const completeOnboarding = () => {
  const settings = getSettings();
  settings.onboardingCompleted = true;
  saveSettings(settings);
};
