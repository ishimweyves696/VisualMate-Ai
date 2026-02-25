import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home } from './components/Home';
import { Generator } from './components/Generator';
import { PricingPage } from './components/Subscription/PricingPage';
import { CheckoutFlow } from './components/Subscription/CheckoutFlow';
import { BillingDashboard } from './components/Subscription/BillingDashboard';
import { UpgradeModal } from './components/Subscription/UpgradeModal';
import { OnboardingFlow } from './components/Onboarding/OnboardingFlow';
import { VisualData, Subject, GradeLevel, Language, VisualStyle, VisualNode, AspectRatio, Resolution, UserSubscription, PlanType, BillingCycle, UserSettings } from './types';
import { analyzeTopic, generateVisualImage } from './services/geminiService';
import { getSubscription, saveSubscription, canGenerate, incrementUsage, upgradePlan, PLANS } from './services/subscriptionService';
import { getSettings, completeOnboarding as markOnboardingComplete } from './services/onboardingService';
import { trackGeneration, trackUpgradeTrigger, trackSession } from './services/analyticsService';
import { History, Layout, BookOpen, Clock, Trash2, CreditCard, CheckCircle2, X, Lock, ShieldCheck, Info, ArrowRight, Sparkles, ChevronRight, Zap, Star, Check, AlertCircle, Shield } from 'lucide-react';

export default function App() {
  const [view, setView] = React.useState<'home' | 'generator' | 'history' | 'pricing' | 'checkout' | 'billing'>('home');
  const [currentVisual, setCurrentVisual] = React.useState<VisualData | null>(null);
  const [subscription, setSubscription] = React.useState<UserSubscription>(getSubscription());
  const [settings, setSettings] = React.useState<UserSettings>(getSettings());
  const [checkoutConfig, setCheckoutConfig] = React.useState<{ plan: PlanType; cycle: BillingCycle } | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = React.useState(false);
  const [upgradeReason, setUpgradeReason] = React.useState<string | undefined>();
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [showPrivacy, setShowPrivacy] = React.useState(false);
  const [history, setHistory] = React.useState<VisualData[]>(() => {
    const saved = localStorage.getItem('visualmind_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generationStep, setGenerationStep] = React.useState<string>('');

  React.useEffect(() => {
    localStorage.setItem('visualmind_history', JSON.stringify(history));
  }, [history]);

  React.useEffect(() => {
    trackSession();
  }, []);

  const handleGenerate = async (config: { 
    topic: string; 
    subject: Subject; 
    gradeLevel: GradeLevel; 
    language: Language; 
    style: VisualStyle;
    aspectRatio: AspectRatio;
    resolution: Resolution;
  }) => {
    // Plan Enforcement: Quota Check
    if (!canGenerate(subscription)) {
      setUpgradeReason("You've reached your daily limit on the Free plan.");
      setIsUpgradeModalOpen(true);
      trackUpgradeTrigger();
      return;
    }

    // Plan Enforcement: Resolution Check
    if (subscription.plan === 'FREE' && config.resolution !== '1K') {
      setUpgradeReason("High resolution visuals are only available on Pro plans.");
      setIsUpgradeModalOpen(true);
      trackUpgradeTrigger();
      return;
    }

    setIsGenerating(true);
    setGenerationStep('Analyzing your topic...');
    
    try {
      // Step 1: Analysis
      const analysis = await analyzeTopic(config.topic, config.subject, config.gradeLevel, config.language);
      
      setGenerationStep('Identifying key concepts...');
      await new Promise(r => setTimeout(r, 800)); // Perception design
      
      setGenerationStep('Designing visual structure...');
      const newVisual: VisualData = {
        id: Math.random().toString(36).substr(2, 9),
        ...config,
        ...analysis,
        createdAt: Date.now(),
      };

      setCurrentVisual(newVisual);
      setView('generator');
      
      setGenerationStep('Optimizing clarity...');
      // Step 2: Image Generation
      const imageUrl = await generateVisualImage(analysis, config.style, config.aspectRatio, config.resolution);
      const updatedVisual = { ...newVisual, imageUrl };
      setCurrentVisual(updatedVisual);
      
      // Update usage & analytics
      const updatedSub = incrementUsage(subscription);
      setSubscription({ ...updatedSub });
      trackGeneration(config.topic);

      // Only save to history if not on Free plan
      if (subscription.plan !== 'FREE') {
        setHistory(prev => [updatedVisual, ...prev]);
      }
    } catch (error) {
      console.error("Generation failed:", error);
      alert("Failed to generate visual. Please try again.");
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const handleRegenerate = async () => {
    if (!currentVisual) return;
    setIsGenerating(true);
    setGenerationStep('Reimagining visual structure...');
    try {
      const imageUrl = await generateVisualImage(currentVisual, currentVisual.style, currentVisual.aspectRatio, currentVisual.resolution);
      const updatedVisual = { ...currentVisual, imageUrl };
      setCurrentVisual(updatedVisual);
      setHistory(prev => prev.map(h => h.id === updatedVisual.id ? updatedVisual : h));
    } catch (error) {
      console.error("Regeneration failed:", error);
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const handleUpdateNodes = (nodes: VisualNode[]) => {
    if (!currentVisual) return;
    const updated = { ...currentVisual, nodes };
    setCurrentVisual(updated);
    setHistory(prev => prev.map(h => h.id === updated.id ? updated : h));
  };

  const deleteFromHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(h => h.id !== id));
  };

  const handleCheckoutSuccess = () => {
    if (!checkoutConfig) return;
    const updatedSub = upgradePlan(subscription, checkoutConfig.plan, checkoutConfig.cycle);
    setSubscription({ ...updatedSub });
    setShowSuccess(true);
    setView('home');
  };

  const handleSelectPlan = (plan: PlanType, cycle: BillingCycle) => {
    setCheckoutConfig({ plan, cycle });
    setView('checkout');
    setIsUpgradeModalOpen(false);
  };

  const handleCancelSubscription = () => {
    const updatedSub: UserSubscription = { ...subscription, status: 'canceled' };
    saveSubscription(updatedSub);
    setSubscription(updatedSub);
  };

  const handleOnboardingComplete = () => {
    markOnboardingComplete();
    setSettings(prev => ({ ...prev, onboardingCompleted: true }));
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <AnimatePresence>
        {!settings.onboardingCompleted && (
          <OnboardingFlow onComplete={handleOnboardingComplete} />
        )}
      </AnimatePresence>

      {/* Success Screen Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[40px] p-12 max-w-lg w-full text-center shadow-2xl relative"
            >
              <button onClick={() => setShowSuccess(false)} className="absolute top-6 right-6 p-2 hover:bg-zinc-100 rounded-full transition-colors"><X className="w-5 h-5 text-zinc-400" /></button>
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-4xl font-bold text-zinc-900 mb-4">Welcome to Pro</h2>
              <p className="text-zinc-600 mb-8">You've successfully upgraded. Professional-grade educational visuals are now at your fingertips.</p>
              
              <div className="bg-zinc-50 rounded-2xl p-6 mb-8 text-left space-y-3">
                <div className="flex items-center gap-3 text-sm font-bold text-zinc-700">
                  <div className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0"><CheckCircle2 className="w-3 h-3" /></div>
                  Unlimited High-Res Generations
                </div>
                <div className="flex items-center gap-3 text-sm font-bold text-zinc-700">
                  <div className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0"><CheckCircle2 className="w-3 h-3" /></div>
                  No Watermarks on Exports
                </div>
                <div className="flex items-center gap-3 text-sm font-bold text-zinc-700">
                  <div className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0"><CheckCircle2 className="w-3 h-3" /></div>
                  PDF & Vector Support
                </div>
              </div>

              <button 
                onClick={() => setShowSuccess(false)}
                className="w-full py-4 bg-zinc-900 text-white font-bold rounded-2xl hover:bg-zinc-800 transition-all shadow-xl"
              >
                Create Your First Pro Visual
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Privacy Notice Modal */}
      <AnimatePresence>
        {showPrivacy && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl relative"
            >
              <button onClick={() => setShowPrivacy(false)} className="absolute top-6 right-6 p-2 hover:bg-zinc-100 rounded-full transition-colors"><X className="w-5 h-5 text-zinc-400" /></button>
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 mb-4">Your Privacy Matters</h2>
              <div className="space-y-4 text-zinc-600 text-sm leading-relaxed mb-8">
                <p>VisualMate AI is designed with privacy at its core. All your visual history is stored locally in your browser.</p>
                <p>We do not sell your data. Your topics are processed by Gemini AI to generate visuals, and no personal information is shared with third parties.</p>
                <p>You can clear your local history at any time from the History tab.</p>
              </div>
              <button 
                onClick={() => setShowPrivacy(false)}
                className="w-full py-3 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 transition-all"
              >
                I Understand
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <UpgradeModal 
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        onUpgrade={handleSelectPlan}
        reason={upgradeReason}
      />

      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-zinc-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => setView('home')}
          >
            <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-100 group-hover:scale-105 transition-transform">V</div>
            <div className="flex items-baseline gap-1">
              <span className="font-bold text-xl tracking-tight text-zinc-900">VisualMate</span>
              <span className="text-xs font-medium text-zinc-400">AI</span>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <button 
              onClick={() => setView('home')}
              className={`flex items-center gap-2 text-sm font-bold transition-all ${view === 'home' ? 'text-emerald-600' : 'text-zinc-500 hover:text-zinc-900'}`}
            >
              <Layout className="w-4 h-4" /> Create
            </button>
            <button 
              onClick={() => setView('history')}
              className={`flex items-center gap-2 text-sm font-bold transition-all ${view === 'history' ? 'text-emerald-600' : 'text-zinc-500 hover:text-zinc-900'}`}
            >
              <History className="w-4 h-4" /> History
            </button>
            <button 
              onClick={() => setView('billing')}
              className={`flex items-center gap-2 text-sm font-bold transition-all ${view === 'billing' ? 'text-emerald-600' : 'text-zinc-500 hover:text-zinc-900'}`}
            >
              <CreditCard className="w-4 h-4" /> Billing
            </button>
          </div>
        </div>
      </nav>

      <main className="pb-20">
        {/* Usage Counter Banner */}
        {subscription.plan === 'FREE' && (
          <div className="bg-zinc-900 text-white py-2.5 px-6 text-center text-[11px] font-bold tracking-wide uppercase">
            <div className="max-w-7xl mx-auto flex items-center justify-center gap-6">
              <span className="opacity-70">{PLANS.FREE.dailyQuota - subscription.usedToday} of {PLANS.FREE.dailyQuota} daily visuals remaining</span>
              <div className="w-px h-3 bg-white/20" />
              <button 
                onClick={() => setView('pricing')}
                className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5"
              >
                Upgrade for Unlimited <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Home 
                onGenerate={handleGenerate} 
                isGenerating={isGenerating} 
                generationStep={generationStep}
                subscription={subscription}
              />
              
              {/* Trust Footer */}
              <div className="max-w-4xl mx-auto px-6 mt-20 pt-12 border-t border-zinc-100">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
                      <ShieldCheck className="w-4 h-4" /> Secure Processing
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
                      <Info className="w-4 h-4" /> Local History
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <button onClick={() => setShowPrivacy(true)} className="text-xs font-bold text-zinc-400 hover:text-zinc-600 transition-colors">Privacy Policy</button>
                    <button className="text-xs font-bold text-zinc-400 hover:text-zinc-600 transition-colors">Terms of Service</button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'generator' && currentVisual && (
            <motion.div
              key="generator"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
            >
              <Generator 
                data={currentVisual} 
                onBack={() => setView('home')}
                onRegenerate={handleRegenerate}
                onUpdateNodes={handleUpdateNodes}
                isRegenerating={isGenerating}
                generationStep={generationStep}
                subscription={subscription}
                onUpgradeRequest={(reason) => {
                  setUpgradeReason(reason);
                  setIsUpgradeModalOpen(true);
                  trackUpgradeTrigger();
                }}
              />
            </motion.div>
          )}

          {view === 'pricing' && (
            <motion.div
              key="pricing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="py-12"
            >
              <PricingPage 
                currentPlan={subscription.plan} 
                onSelectPlan={handleSelectPlan}
              />
            </motion.div>
          )}

          {view === 'checkout' && checkoutConfig && (
            <motion.div
              key="checkout"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-12 px-4"
            >
              <CheckoutFlow 
                plan={checkoutConfig.plan}
                cycle={checkoutConfig.cycle}
                onSuccess={handleCheckoutSuccess}
                onCancel={() => setView('pricing')}
              />
            </motion.div>
          )}

          {view === 'billing' && (
            <motion.div
              key="billing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="py-12 px-4"
            >
              <BillingDashboard 
                subscription={subscription}
                onUpgrade={() => setView('pricing')}
                onCancel={handleCancelSubscription}
              />
            </motion.div>
          )}

          {view === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-6xl mx-auto px-6 py-12"
            >
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h1 className="text-4xl font-bold text-zinc-900 mb-2">Your Library</h1>
                  <p className="text-zinc-500 font-medium">{subscription.plan === 'FREE' ? '0' : history.length} professional visuals saved locally</p>
                </div>
              </div>

              {subscription.plan === 'FREE' ? (
                <div className="text-center py-24 bg-white rounded-[40px] border border-zinc-100 shadow-sm overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-12 opacity-5">
                    <History className="w-80 h-80" />
                  </div>
                  <div className="relative z-10 max-w-md mx-auto">
                    <div className="w-20 h-20 bg-zinc-50 text-zinc-300 rounded-3xl flex items-center justify-center mx-auto mb-8">
                      <Lock className="w-10 h-10" />
                    </div>
                    <h3 className="text-3xl font-bold text-zinc-900 mb-4">History is a Pro Feature</h3>
                    <p className="text-zinc-500 mb-10 leading-relaxed">Upgrade to Pro to save your visuals, access them anytime, and build a personal library of educational content.</p>
                    <button 
                      onClick={() => setView('pricing')}
                      className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100"
                    >
                      Unlock History with Pro
                    </button>
                  </div>
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-[40px] border border-dashed border-zinc-200">
                  <Clock className="w-16 h-16 text-zinc-200 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-zinc-900 mb-2">No visuals yet</h3>
                  <p className="text-zinc-500 mb-10">Start by generating your first educational diagram.</p>
                  <button 
                    onClick={() => setView('home')}
                    className="px-10 py-4 bg-zinc-900 text-white font-bold rounded-2xl shadow-xl hover:bg-zinc-800 transition-all"
                  >
                    Create New Visual
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {history.map(item => (
                    <div 
                      key={item.id}
                      onClick={() => { setCurrentVisual(item); setView('generator'); }}
                      className="group bg-white rounded-[32px] border border-zinc-100 shadow-sm hover:shadow-2xl transition-all cursor-pointer overflow-hidden"
                    >
                      <div className="aspect-video bg-zinc-100 relative overflow-hidden">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-300"><BookOpen className="w-12 h-12" /></div>
                        )}
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => deleteFromHistory(item.id, e)}
                            className="p-2.5 bg-white/90 backdrop-blur text-red-600 rounded-xl shadow-xl hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-lg uppercase tracking-wider">{item.subject}</span>
                          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-lg uppercase tracking-wider">{item.gradeLevel}</span>
                        </div>
                        <h3 className="font-bold text-zinc-900 mb-2 text-lg line-clamp-1">{item.title}</h3>
                        <p className="text-sm text-zinc-500 line-clamp-2 mb-6 leading-relaxed">{item.description}</p>
                        <div className="flex items-center justify-between pt-5 border-t border-zinc-50">
                          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{new Date(item.createdAt).toLocaleDateString()}</span>
                          <span className="text-emerald-600 text-xs font-bold flex items-center gap-1">Open Visual <ArrowRight className="w-3 h-3" /></span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
