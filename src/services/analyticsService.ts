import { AppAnalytics } from "../types";

const STORAGE_KEY = 'visualmind_analytics';

const defaultAnalytics: AppAnalytics = {
  totalGenerations: 0,
  mostFrequentTopics: [],
  upgradeModalTriggers: 0,
  sessionCount: 0,
};

export const getAnalytics = (): AppAnalytics => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : defaultAnalytics;
};

export const saveAnalytics = (analytics: AppAnalytics) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(analytics));
};

export const trackGeneration = (topic: string) => {
  const analytics = getAnalytics();
  analytics.totalGenerations += 1;
  
  const topics = [...analytics.mostFrequentTopics, topic];
  // Keep top 10 most frequent
  const topicCounts = topics.reduce((acc, t) => {
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  analytics.mostFrequentTopics = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([t]) => t);
    
  saveAnalytics(analytics);
};

export const trackUpgradeTrigger = () => {
  const analytics = getAnalytics();
  analytics.upgradeModalTriggers += 1;
  saveAnalytics(analytics);
};

export const trackSession = () => {
  const analytics = getAnalytics();
  analytics.sessionCount += 1;
  saveAnalytics(analytics);
};
