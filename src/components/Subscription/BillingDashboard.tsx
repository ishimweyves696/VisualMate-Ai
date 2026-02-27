import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, CheckCircle2, X } from 'lucide-react';
import { UserSubscription, PlanType } from '../../types';
import { PLANS } from '../../services/subscriptionService';

interface BillingDashboardProps {
  subscription: UserSubscription;
  onUpgrade: () => void;
  onCancel: () => void;
}

export const BillingDashboard: React.FC<BillingDashboardProps> = ({ subscription, onUpgrade, onCancel }) => {
  const [showCancelConfirm, setShowCancelConfirm] = React.useState(false);
  const [cancelReason, setCancelReason] = React.useState('');
  const planData = PLANS[subscription.plan];
  
  const usagePercent = subscription.plan === 'FREE' 
    ? (subscription.usedToday / planData.dailyQuota) * 100
    : (subscription.usedThisMonth / planData.monthlyQuota) * 100;

  const handleCancelClick = () => {
    if (subscription.plan === 'FREE') return;
    setShowCancelConfirm(true);
  };

  const isPaid = subscription.plan !== 'FREE';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Plan Overview */}
      <div className="bg-white rounded-[32px] p-10 border border-zinc-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-10">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold text-zinc-900">{planData.name} Plan</h2>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                  subscription.plan === 'FREE' ? 'bg-zinc-100 text-zinc-500' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {subscription.plan === 'FREE' ? 'Free' : 'Active'}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-zinc-500 font-medium">
                  Status: <span className="text-zinc-900">Active</span>
                </p>
                {isPaid && (
                  <p className="text-zinc-500 font-medium">
                    Next renewal: <span className="text-zinc-900">{new Date(subscription.renewalDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {subscription.plan === 'FREE' ? (
              <button 
                onClick={onUpgrade}
                className="px-8 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
              >
                View Pricing Plans
              </button>
            ) : (
              <>
                <button 
                  onClick={onUpgrade}
                  className="px-8 py-4 bg-zinc-900 text-white font-bold rounded-2xl hover:bg-zinc-800 transition-all shadow-xl"
                >
                  Manage Plan
                </button>
                {subscription.status === 'active' && (
                  <button 
                    onClick={handleCancelClick}
                    className="px-8 py-4 border border-zinc-200 text-zinc-600 font-bold rounded-2xl hover:bg-zinc-50 transition-all"
                  >
                    Cancel Subscription
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="pt-10 border-t border-zinc-100">
          <div className="max-w-md space-y-4">
            <div className="flex items-center justify-between text-sm font-bold">
              <div className="flex items-center gap-2 text-zinc-400 uppercase tracking-widest text-[10px]">
                <Activity className="w-3 h-3" /> Usage Overview
              </div>
              <span className="text-zinc-900">
                {subscription.plan === 'FREE' ? subscription.usedToday : subscription.usedThisMonth} / {subscription.plan === 'FREE' ? planData.dailyQuota : planData.monthlyQuota} visuals {subscription.plan === 'FREE' ? 'today' : 'this month'}
              </span>
            </div>
            <div className="w-full h-3 bg-zinc-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(usagePercent, 100)}%` }}
                className={`h-full transition-colors duration-500 ${usagePercent > 90 ? 'bg-red-500' : 'bg-emerald-500'}`}
              />
            </div>
            <p className="text-xs text-zinc-400 font-medium">
              {subscription.plan === 'FREE' 
                ? "Your daily limit resets every 24 hours." 
                : `You have used ${Math.floor(usagePercent)}% of your monthly generation quota.`}
            </p>
          </div>
        </div>
      </div>

      {/* Cancellation Modal */}
      <AnimatePresence>
        {showCancelConfirm && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[32px] shadow-2xl max-w-md w-full overflow-hidden border border-zinc-100"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-zinc-900">Wait, don't go! 🥺</h3>
                  <button onClick={() => setShowCancelConfirm(false)} className="p-2 hover:bg-zinc-100 rounded-full"><X className="w-5 h-5" /></button>
                </div>
                
                <p className="text-zinc-600 mb-6">We're sad to see you go. Is there anything we can do to keep you? Here's a special offer just for you:</p>
                
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 mb-8 text-center">
                  <h4 className="text-emerald-900 font-bold text-lg mb-1">Get 20% OFF for 3 months</h4>
                  <p className="text-emerald-700 text-sm mb-4">Stay with us and keep creating amazing visuals.</p>
                  <button 
                    onClick={() => setShowCancelConfirm(false)}
                    className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                  >
                    Stay & Save 20%
                  </button>
                </div>

                <div className="space-y-4">
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">Why are you canceling?</label>
                  <select 
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select a reason...</option>
                    <option value="expensive">Too expensive</option>
                    <option value="unused">Not using enough</option>
                    <option value="missing">Missing features</option>
                    <option value="other">Other</option>
                  </select>
                  
                  <button 
                    onClick={onCancel}
                    disabled={!cancelReason}
                    className="w-full py-3 text-red-600 font-bold hover:bg-red-50 rounded-xl transition-all disabled:opacity-50"
                  >
                    Confirm Cancellation
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Remove unused FileText component

