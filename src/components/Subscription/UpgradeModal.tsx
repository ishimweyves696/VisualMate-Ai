import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Rocket, Check, Star } from 'lucide-react';
import { PlanType, BillingCycle } from '../../types';
import { PLANS } from '../../services/subscriptionService';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (plan: PlanType, cycle: BillingCycle) => void;
  reason?: string;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, onUpgrade, reason }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-900/60 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white rounded-[32px] shadow-2xl max-w-2xl w-full overflow-hidden border border-zinc-100"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 hover:bg-zinc-100 rounded-full transition-colors z-10"
            >
              <X className="w-5 h-5 text-zinc-400" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Left: Content */}
              <div className="p-10">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                  <Rocket className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-bold text-zinc-900 mb-2">You're Creating Powerful Visuals 🚀</h2>
                <p className="text-zinc-600 mb-8">
                  {reason || "Upgrade to Pro to unlock unlimited creativity and professional features."}
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-sm font-medium text-zinc-700">
                    <div className="w-5 h-5 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3" />
                    </div>
                    No watermarks on exports
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium text-zinc-700">
                    <div className="w-5 h-5 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3" />
                    </div>
                    Priority generation support
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium text-zinc-700">
                    <div className="w-5 h-5 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3" />
                    </div>
                    PDF & Vector exports
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => onUpgrade('PRO', 'yearly')}
                    className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                  >
                    Upgrade to Pro — $12/mo
                  </button>
                  <button 
                    onClick={onClose}
                    className="w-full py-4 text-zinc-500 font-bold hover:bg-zinc-50 rounded-2xl transition-all"
                  >
                    Maybe Later
                  </button>
                </div>
              </div>

              {/* Right: Visual/Comparison */}
              <div className="bg-zinc-50 p-10 flex flex-col justify-center border-l border-zinc-100">
                <div className="space-y-6">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Plan Comparison</h3>
                  
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-zinc-900">Free Starter</span>
                        <span className="text-xs text-zinc-400">Current</span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                        <div className="w-1/3 h-full bg-zinc-300" />
                      </div>
                    </div>

                    <div className="bg-emerald-600 p-4 rounded-2xl shadow-xl shadow-emerald-100 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 opacity-20">
                        <Star className="w-12 h-12 text-white" />
                      </div>
                      <div className="flex items-center justify-between mb-2 relative z-10">
                        <span className="text-sm font-bold text-white">Pro Creator</span>
                        <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-bold">UNLIMITED</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden relative z-10">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="h-full bg-white" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-zinc-200">
                    <p className="text-[10px] text-zinc-400 text-center leading-relaxed">
                      Join 10,000+ creators using VisualMate Pro to build world-class educational content.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
