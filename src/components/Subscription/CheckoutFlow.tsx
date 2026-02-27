import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, Lock, CheckCircle2, ChevronRight, ArrowLeft, Loader2 } from 'lucide-react';
import { PlanType, BillingCycle } from '../../types';
import { PLANS } from '../../services/subscriptionService';

interface CheckoutFlowProps {
  plan: PlanType;
  cycle: BillingCycle;
  userEmail: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const CheckoutFlow: React.FC<CheckoutFlowProps> = ({ plan, cycle, userEmail, onSuccess, onCancel }) => {
  const [step, setStep] = React.useState<1 | 2>(1);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const planData = PLANS[plan];
  const price = cycle === 'monthly' ? planData.priceMonthly : planData.priceYearly;

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/payments/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, cycle, userEmail })
      });
      
      const data = await response.json();
      
      if (data.checkoutUrl) {
        // In a real app, we would redirect:
        // window.location.href = data.checkoutUrl;
        
        // For this demo, we'll simulate the redirect delay and then succeed
        await new Promise(resolve => setTimeout(resolve, 1500));
        onSuccess();
      } else {
        throw new Error(data.error || 'Failed to create payment session');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-zinc-100">
      <div className="flex">
        {/* Left Side: Summary */}
        <div className="w-1/3 bg-zinc-50 p-8 border-r border-zinc-100 hidden md:block">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-6">Order Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-600">{planData.name} Plan</span>
              <span className="font-bold text-zinc-900">${price}</span>
            </div>
            <div className="flex justify-between text-xs text-zinc-500">
              <span>Billing Cycle</span>
              <span className="capitalize">{cycle}</span>
            </div>
            <div className="pt-4 border-t border-zinc-200 flex justify-between items-baseline">
              <span className="font-bold text-zinc-900">Total</span>
              <span className="text-2xl font-bold text-emerald-600">${price}</span>
            </div>
          </div>

          <div className="mt-12 space-y-4">
            {planData.features.slice(0, 4).map((f, i) => (
              <div key={i} className="flex items-start gap-2 text-[10px] text-zinc-500">
                <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Flow */}
        <div className="flex-1 p-8">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-zinc-900">Confirm Plan</h2>
                  <button onClick={onCancel} className="text-zinc-400 hover:text-zinc-600"><ArrowLeft className="w-5 h-5" /></button>
                </div>

                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-8">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-emerald-900">Selected: {planData.name}</span>
                    <span className="text-xs text-emerald-700 bg-white px-2 py-0.5 rounded-full shadow-sm">${price}/{cycle === 'monthly' ? 'mo' : 'yr'}</span>
                  </div>
                  <p className="text-xs text-emerald-700">You'll be billed {cycle === 'monthly' ? 'monthly' : 'annually'}. Cancel anytime.</p>
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="w-full py-4 bg-zinc-900 text-white font-bold rounded-2xl hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 group"
                >
                  Continue to Payment
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-zinc-900">Payment Details</h2>
                  <button onClick={() => setStep(1)} className="text-zinc-400 hover:text-zinc-600"><ArrowLeft className="w-5 h-5" /></button>
                </div>

                <form onSubmit={handlePayment} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Email Address</label>
                    <input 
                      type="email" 
                      required
                      defaultValue={userEmail}
                      placeholder="you@example.com"
                      className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Card Information</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        required
                        placeholder="0000 0000 0000 0000"
                        className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all pl-10"
                      />
                      <CreditCard className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Expiry</label>
                      <input 
                        type="text" 
                        required
                        placeholder="MM/YY"
                        className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">CVC</label>
                      <input 
                        type="text" 
                        required
                        placeholder="123"
                        className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
                    >
                      {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-4 h-4" />}
                      {isProcessing ? 'Processing...' : `Pay $${price}`}
                    </button>
                    <p className="text-center text-[10px] text-zinc-400 mt-4 flex items-center justify-center gap-1">
                      <Lock className="w-3 h-3" /> Secure payment powered by XentriPAY
                    </p>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
