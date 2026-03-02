import React from 'react';
import { motion } from 'motion/react';
import { Check, Zap, Shield, Star, Building2 } from 'lucide-react';
import { PlanType, BillingCycle } from '../../types';
import { PLANS } from '../../services/subscriptionService';

interface PricingPageProps {
  currentPlan: PlanType;
  onSelectPlan: (plan: PlanType, cycle: BillingCycle) => void;
  isModal?: boolean;
  isAuthenticated: boolean;
}

export const PricingPage: React.FC<PricingPageProps> = ({ currentPlan, onSelectPlan, isModal, isAuthenticated }) => {
  const [cycle, setCycle] = React.useState<BillingCycle>('yearly');

  const plans = [
    {
      id: 'FREE' as PlanType,
      icon: <Zap className="w-6 h-6 text-zinc-400" />,
      color: 'zinc',
    },
    {
      id: 'PRO' as PlanType,
      icon: <Star className="w-6 h-6 text-emerald-500" />,
      color: 'emerald',
      popular: true,
    },
    {
      id: 'STUDIO' as PlanType,
      icon: <Building2 className="w-6 h-6 text-blue-500" />,
      color: 'blue',
    }
  ];

  return (
    <div className={`w-full ${isModal ? '' : 'max-w-6xl mx-auto px-4 py-8 sm:py-12'}`}>
      {!isModal && (
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">Simple, Transparent Pricing</h1>
          <p className="text-sm sm:text-base text-zinc-600">Choose the plan that's right for your creative journey.</p>
        </div>
      )}

      {/* Toggle */}
      <div className="flex justify-center mb-8 sm:mb-12">
        <div className="bg-zinc-100 p-1 rounded-xl flex items-center gap-1">
          <button
            onClick={() => setCycle('monthly')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all min-h-[40px] ${cycle === 'monthly' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setCycle('yearly')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center gap-2 min-h-[40px] ${cycle === 'yearly' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}
          >
            Yearly
            <span className="text-[9px] sm:text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md">Save 20%</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
        {plans.map((p) => {
          const planData = PLANS[p.id];
          const isCurrent = currentPlan === p.id;
          const price = cycle === 'monthly' ? planData.priceMonthly : Math.floor(planData.priceYearly / 12);

          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`relative bg-white rounded-3xl p-6 sm:p-8 border-2 transition-all flex flex-col ${
                p.popular 
                  ? 'border-emerald-500 shadow-2xl shadow-emerald-100 md:scale-105 z-10' 
                  : 'border-zinc-100 shadow-sm hover:shadow-md'
              }`}
            >
              {p.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[9px] sm:text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                  Most Popular
                </div>
              )}

              <div className="mb-6 sm:mb-8">
                <div className="flex items-center gap-3 mb-4">
                  {p.icon}
                  <h3 className="text-lg sm:text-xl font-bold text-zinc-900">{planData.name}</h3>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-bold text-zinc-900">${price}</span>
                  <span className="text-zinc-500 text-sm">/mo</span>
                </div>
                {cycle === 'yearly' && p.id !== 'FREE' && (
                  <p className="text-emerald-600 text-[10px] sm:text-xs font-medium mt-1">Billed ${planData.priceYearly} annually</p>
                )}
              </div>

              <div className="space-y-3 sm:space-y-4 mb-8 flex-1">
                {planData.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-3 text-xs sm:text-sm text-zinc-600">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  if (p.id === 'FREE' && !isAuthenticated) {
                    onSelectPlan(p.id, cycle);
                  } else if (p.id !== 'FREE' && !isCurrent) {
                    onSelectPlan(p.id, cycle);
                  }
                }}
                disabled={(isCurrent && isAuthenticated) || (p.id === 'FREE' && currentPlan !== 'FREE' && isAuthenticated)}
                className={`w-full py-4 rounded-2xl font-bold transition-all min-h-[44px] ${
                  isCurrent && isAuthenticated
                    ? 'bg-zinc-100 text-zinc-400 cursor-default'
                    : p.id === 'STUDIO'
                      ? 'bg-zinc-900 text-white hover:bg-zinc-800'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-100'
                }`}
              >
                {isCurrent && isAuthenticated ? 'Current Plan' : p.id === 'FREE' ? 'Get Started Free' : p.id === 'STUDIO' ? 'Contact Sales' : 'Upgrade Now'}
              </button>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-zinc-400">
        <div className="flex items-center gap-2 text-[10px] sm:text-xs">
          <Shield className="w-4 h-4" /> Secure SSL Encryption
        </div>
        <div className="flex items-center gap-2 text-[10px] sm:text-xs">
          <Zap className="w-4 h-4" /> Instant Activation
        </div>
      </div>
    </div>
  );
};
