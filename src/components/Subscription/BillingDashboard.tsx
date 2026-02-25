import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, Calendar, Activity, Download, AlertCircle, CheckCircle2, X } from 'lucide-react';
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

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Plan Overview */}
      <div className="bg-white rounded-3xl p-8 border border-zinc-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold text-zinc-900">{planData.name} Plan</h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                  subscription.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                }`}>
                  {subscription.status}
                </span>
              </div>
              <p className="text-zinc-500 text-sm">Your next renewal is on {new Date(subscription.renewalDate).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex gap-3">
            {subscription.plan !== 'STUDIO' && (
              <button 
                onClick={onUpgrade}
                className="px-6 py-3 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 transition-all"
              >
                Change Plan
              </button>
            )}
            {subscription.plan !== 'FREE' && subscription.status === 'active' && (
              <button 
                onClick={handleCancelClick}
                className="px-6 py-3 border border-zinc-200 text-zinc-600 font-bold rounded-xl hover:bg-zinc-50 transition-all"
              >
                Cancel Subscription
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-zinc-50">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-widest">
              <Activity className="w-3 h-3" /> Usage
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-zinc-900">
                {subscription.plan === 'FREE' ? subscription.usedToday : subscription.usedThisMonth}
              </span>
              <span className="text-zinc-400 text-sm">/ {subscription.plan === 'FREE' ? planData.dailyQuota : planData.monthlyQuota} visuals</span>
            </div>
            <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(usagePercent, 100)}%` }}
                className={`h-full ${usagePercent > 90 ? 'bg-red-500' : 'bg-emerald-500'}`}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-widest">
              <Calendar className="w-3 h-3" /> Billing Cycle
            </div>
            <div className="text-lg font-bold text-zinc-900 capitalize">{subscription.billingCycle}</div>
            <p className="text-zinc-500 text-xs">Started on {new Date(subscription.lastResetDate).toLocaleDateString()}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-widest">
              <CreditCard className="w-3 h-3" /> Payment Method
            </div>
            <div className="flex items-center gap-2 text-lg font-bold text-zinc-900">
              <div className="w-8 h-5 bg-zinc-100 rounded border border-zinc-200 flex items-center justify-center text-[8px] font-bold">VISA</div>
              •••• 4242
            </div>
            <button className="text-emerald-600 text-xs font-bold hover:underline">Update Payment Method</button>
          </div>
        </div>
      </div>

      {/* Invoices */}
      <div className="bg-white rounded-3xl p-8 border border-zinc-100 shadow-sm">
        <h3 className="text-lg font-bold text-zinc-900 mb-6">Recent Invoices</h3>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center justify-between p-4 hover:bg-zinc-50 rounded-2xl transition-all border border-transparent hover:border-zinc-100">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-zinc-900">Invoice #VM-202{i}-00{i}</div>
                  <div className="text-zinc-500 text-xs">Paid on Feb {25 - i}, 2026</div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span className="font-bold text-zinc-900">${planData.priceMonthly}</span>
                <button className="p-2 text-zinc-400 hover:text-emerald-600 transition-colors">
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
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
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-zinc-100"
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

const FileText = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);
