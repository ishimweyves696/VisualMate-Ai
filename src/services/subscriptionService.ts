import { UserSubscription, PlanType } from '../types';

const STORAGE_KEY = 'visualmind_subscription';

export const PLANS = {
  FREE: {
    name: 'Starter',
    dailyQuota: 5,
    monthlyQuota: 0,
    features: ['5 visuals per day', 'Watermarked exports', 'Standard resolution', '1 language', 'No history'],
    priceMonthly: 0,
    priceYearly: 0,
  },
  PRO: {
    name: 'Creator',
    dailyQuota: 9999, // Effectively unlimited daily
    monthlyQuota: 200,
    features: ['200 visuals per month', 'No watermark', 'High resolution', 'PDF export', 'Multi-language', '30-day history', 'Priority generation'],
    priceMonthly: 15,
    priceYearly: 144,
  },
  STUDIO: {
    name: 'Business',
    dailyQuota: 9999,
    monthlyQuota: 1000,
    features: ['1000 visuals per month', 'Brand kit', 'Batch generation', 'Commercial license', 'Team seats'],
    priceMonthly: 49, // Example price
    priceYearly: 470,
  }
};

const DEFAULT_SUBSCRIPTION: UserSubscription = {
  plan: 'FREE',
  billingCycle: 'monthly',
  usedToday: 0,
  usedThisMonth: 0,
  lastResetDate: Date.now(),
  status: 'active',
  renewalDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
};

export function getSubscription(): UserSubscription {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return DEFAULT_SUBSCRIPTION;
  
  const sub: UserSubscription = JSON.parse(saved);
  return checkAndResetQuota(sub);
}

export function saveSubscription(sub: UserSubscription) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sub));
}

function checkAndResetQuota(sub: UserSubscription): UserSubscription {
  const now = new Date();
  const lastReset = new Date(sub.lastResetDate);
  
  // Daily reset
  if (now.toDateString() !== lastReset.toDateString()) {
    sub.usedToday = 0;
    sub.lastResetDate = now.getTime();
  }
  
  // Monthly reset
  if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
    sub.usedThisMonth = 0;
    sub.lastResetDate = now.getTime();
  }
  
  return sub;
}

export function canGenerate(sub: UserSubscription): boolean {
  const plan = PLANS[sub.plan];
  if (sub.plan === 'FREE') {
    return sub.usedToday < plan.dailyQuota;
  }
  return sub.usedThisMonth < plan.monthlyQuota;
}

export function incrementUsage(sub: UserSubscription): UserSubscription {
  sub.usedToday += 1;
  sub.usedThisMonth += 1;
  saveSubscription(sub);
  return sub;
}

export function upgradePlan(sub: UserSubscription, plan: PlanType, cycle: 'monthly' | 'yearly'): UserSubscription {
  const newSub: UserSubscription = {
    ...sub,
    plan,
    billingCycle: cycle,
    status: 'active',
    renewalDate: Date.now() + (cycle === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000,
  };
  saveSubscription(newSub);
  return newSub;
}
