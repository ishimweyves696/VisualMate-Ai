import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home } from './components/Home';
import { Generator } from './components/Generator';
import { PricingPage } from './components/Subscription/PricingPage';
import { CheckoutFlow } from './components/Subscription/CheckoutFlow';
import { BillingDashboard } from './components/Subscription/BillingDashboard';
import { UpgradeModal } from './components/Subscription/UpgradeModal';
import { OnboardingFlow } from './components/Onboarding/OnboardingFlow';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { Settings } from './components/Settings';
import { VisualData, Subject, GradeLevel, Language, VisualStyle, VisualNode, AspectRatio, UserSubscription, PlanType, BillingCycle, UserSettings, AppAnalytics } from './types';
import { analyzeTopic, generateVisualImage } from './services/geminiService';
import { getSubscription, saveSubscription, canGenerate, incrementUsage, upgradePlan, PLANS } from './services/subscriptionService';
import { getSettings, completeOnboarding as markOnboardingComplete } from './services/onboardingService';
import { 
  saveVisual, 
  deleteVisual, 
  subscribeToUserVisuals, 
  getUserData,
  updateUserSubscription,
  updateUserSettings,
  updateUserAnalytics
} from './services/firestoreService';
import { uploadImage } from './services/storageService';
import { downloadVisual } from './services/downloadService';
import { History, Layout, BookOpen, Clock, Trash2, CreditCard, CheckCircle2, X, Lock, ShieldCheck, Info, ArrowRight, Sparkles, ChevronRight, Zap, Star, Check, AlertCircle, Shield, Download, Loader2 } from 'lucide-react';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './components/Auth/LoginPage';
import { AuthModal } from './components/Auth/AuthModal';

type ViewType = 'dashboard' | 'home' | 'generator' | 'history' | 'pricing' | 'checkout' | 'billing' | 'settings' | 'login';

function AppContent() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [view, setView] = React.useState<ViewType>('dashboard');
  const [currentVisual, setCurrentVisual] = React.useState<VisualData | null>(null);
  const [downloadingId, setDownloadingId] = React.useState<string | null>(null);
  const [subscription, setSubscription] = React.useState<UserSubscription>(getSubscription());
  const [settings, setSettings] = React.useState<UserSettings>(getSettings());
  const [checkoutConfig, setCheckoutConfig] = React.useState<{ plan: PlanType; cycle: BillingCycle } | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = React.useState(false);
  const [upgradeReason, setUpgradeReason] = React.useState<string | undefined>();
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [showPrivacy, setShowPrivacy] = React.useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [history, setHistory] = React.useState<VisualData[]>([]);
  const [analytics, setAnalytics] = React.useState<AppAnalytics>(() => {
    const saved = localStorage.getItem('visualmind_analytics');
    return saved ? JSON.parse(saved) : {
      totalGenerations: 0,
      mostFrequentTopics: [],
      upgradeModalTriggers: 0,
      sessionCount: 0,
    };
  });
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generationStep, setGenerationStep] = React.useState<string>('');
  const [prefillData, setPrefillData] = React.useState<{ topic: string; subject: Subject } | null>(null);

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const [authModalConfig, setAuthModalConfig] = React.useState<{ title: string; description: string; onSuccess?: () => void }>({
    title: "Create an account to continue",
    description: "Save your visual and unlock full access to all features."
  });

  // Guest Usage Tracking
  const [guestUsage, setGuestUsage] = React.useState<number>(() => {
    const saved = localStorage.getItem('visualmind_guest_usage');
    return saved ? parseInt(saved) : 0;
  });

  React.useEffect(() => {
    localStorage.setItem('visualmind_guest_usage', guestUsage.toString());
  }, [guestUsage]);

  // Firebase Sync
  React.useEffect(() => {
    if (isAuthenticated && user) {
      // Subscribe to visuals
      const unsubscribeVisuals = subscribeToUserVisuals(user.id, (visuals) => {
        setHistory(visuals);
      });

      // Fetch user data (subscription, settings, analytics)
      const fetchUserDataFull = async () => {
        const data = await getUserData(user.id);
        if (data) {
          if (data.subscription) setSubscription(data.subscription);
          if (data.settings) setSettings(data.settings);
          if (data.analytics) setAnalytics(data.analytics);
        }
      };
      fetchUserDataFull();

      return () => {
        unsubscribeVisuals();
      };
    } else {
      // Load local history for guest if needed, or clear
      const saved = localStorage.getItem('visualmind_history');
      setHistory(saved ? JSON.parse(saved) : []);
    }
  }, [isAuthenticated, user]);

  React.useEffect(() => {
    if (isAuthenticated && user) {
      updateUserSubscription(user.id, subscription);
    }
  }, [subscription, isAuthenticated, user]);

  React.useEffect(() => {
    if (isAuthenticated && user) {
      updateUserSettings(user.id, settings);
    } else {
      localStorage.setItem('visualmind_settings', JSON.stringify(settings));
    }
  }, [settings, isAuthenticated, user]);

  React.useEffect(() => {
    if (isAuthenticated && user) {
      updateUserAnalytics(user.id, analytics);
    } else {
      localStorage.setItem('visualmind_analytics', JSON.stringify(analytics));
    }
  }, [analytics, isAuthenticated, user]);

  React.useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('visualmind_history', JSON.stringify(history));
    }
  }, [history, isAuthenticated]);

  React.useEffect(() => {
    setAnalytics(prev => ({ ...prev, sessionCount: prev.sessionCount + 1 }));
  }, []);

  React.useEffect(() => {
    if (view !== 'home' && view !== 'generator') {
      setPrefillData(null);
    }
  }, [view]);

  React.useEffect(() => {
    if (isAuthenticated && view === 'login') {
      setView('dashboard');
    }
  }, [isAuthenticated, view]);

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated && (view === 'history' || view === 'billing' || view === 'settings')) {
      setView('login');
    }
  }, [isAuthenticated, isLoading, view]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          <p className="text-zinc-500 font-medium animate-pulse">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && view === 'login') {
    return <LoginPage />;
  }

  const triggerAuthModal = (config: { title: string; description: string; onSuccess?: () => void }) => {
    setAuthModalConfig(config);
    setIsAuthModalOpen(true);
  };

  const handleLogout = async () => {
    await logout();
    setView('login');
  };

  const handleCreateNew = (sample?: VisualData) => {
    if (sample) {
      setPrefillData({ topic: sample.topic, subject: sample.subject });
    } else {
      setPrefillData(null);
    }
    setView('home');
  };

  const handleGenerate = async (config: { 
    topic: string; 
    subject: Subject; 
    gradeLevel: GradeLevel; 
    language: Language; 
    style: VisualStyle;
    aspectRatio: AspectRatio;
  }) => {
    // Guest Limit Check
    if (!isAuthenticated && guestUsage >= 2) {
      triggerAuthModal({
        title: "You've reached the free preview limit",
        description: "Create an account to continue generating professional visuals and save your progress.",
        onSuccess: () => setView('home')
      });
      return;
    }

    // Plan Enforcement: Quota Check
    if (isAuthenticated && !canGenerate(subscription)) {
      setUpgradeReason("You've reached your daily limit on the Free plan.");
      setIsUpgradeModalOpen(true);
      setAnalytics(prev => ({ ...prev, upgradeModalTriggers: prev.upgradeModalTriggers + 1 }));
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
      const imageUrl = await generateVisualImage(analysis, config.style, config.aspectRatio);
      
      let finalImageUrl = imageUrl;
      if (isAuthenticated && user) {
        setGenerationStep('Saving to cloud...');
        finalImageUrl = await uploadImage(imageUrl, `visuals/${newVisual.id}.png`);
      }
      
      const updatedVisual = { ...newVisual, imageUrl: finalImageUrl };
      setCurrentVisual(updatedVisual);
      
      // Update usage & analytics
      if (isAuthenticated && user) {
        const updatedSub = incrementUsage(subscription);
        setSubscription({ ...updatedSub });
        await updateUserSubscription(user.id, updatedSub);
        await saveVisual(updatedVisual);
      } else {
        setGuestUsage(prev => prev + 1);
      }
      
      // Track generation
      setAnalytics(prev => {
        const topics = [...prev.mostFrequentTopics, config.topic];
        const topicCounts = topics.reduce((acc, t) => {
          acc[t] = (acc[t] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        const mostFrequentTopics = Object.entries(topicCounts)
          .sort((a, b) => (b[1] as number) - (a[1] as number))
          .slice(0, 10)
          .map(([t]) => t);

        return {
          ...prev,
          totalGenerations: prev.totalGenerations + 1,
          mostFrequentTopics
        };
      });

      // Only save to local history if not authenticated
      if (!isAuthenticated) {
        setHistory(prev => [updatedVisual, ...prev]);
      }
    } catch (error: any) {
      console.error("Generation failed:", error);
      const errorStr = JSON.stringify(error).toLowerCase();
      const msg = (error.message || "").toLowerCase();
      
      let errorMessage = "Failed to generate visual. Please check your topic and try again.";
      
      if (msg.includes('rpc failed') || errorStr.includes('rpc failed') || msg.includes('500') || msg.includes('xhr')) {
        errorMessage = "The AI service is temporarily busy or unavailable. We've tried retrying, but it's still failing. Please wait a moment and try again.";
      } else if (msg.includes('invalid response format')) {
        errorMessage = "The AI provided an unexpected response. Please try refining your topic or trying again.";
      } else if (msg.includes('no image data')) {
        errorMessage = "The AI analyzed your topic but failed to generate the final image. Please try again.";
      }
      
      alert(errorMessage);
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
      const imageUrl = await generateVisualImage(currentVisual, currentVisual.style, currentVisual.aspectRatio);
      
      let finalImageUrl = imageUrl;
      if (isAuthenticated && user) {
        setGenerationStep('Updating cloud storage...');
        finalImageUrl = await uploadImage(imageUrl, `visuals/${currentVisual.id}.png`);
      }
      
      const updatedVisual = { ...currentVisual, imageUrl: finalImageUrl };
      setCurrentVisual(updatedVisual);
      
      if (isAuthenticated && user) {
        await saveVisual(updatedVisual);
      } else {
        setHistory(prev => prev.map(h => h.id === updatedVisual.id ? updatedVisual : h));
      }
    } catch (error: any) {
      console.error("Regeneration failed:", error);
      const errorStr = JSON.stringify(error).toLowerCase();
      const msg = (error.message || "").toLowerCase();
      
      let errorMessage = "Failed to regenerate visual. Please try again.";
      
      if (msg.includes('rpc failed') || errorStr.includes('rpc failed') || msg.includes('500') || msg.includes('xhr')) {
        errorMessage = "The AI service is temporarily busy. Please wait a moment and try again.";
      } else if (msg.includes('no image data')) {
        errorMessage = "The AI failed to generate the new image. Please try again.";
      }
      
      alert(errorMessage);
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const handleUpdateNodes = async (nodes: VisualNode[]) => {
    if (!currentVisual) return;
    let updated = { ...currentVisual, nodes };
    
    if (isAuthenticated && user) {
      // If the image is still base64 (e.g. from guest session), upload it now
      if (updated.imageUrl?.startsWith('data:image')) {
        try {
          const cloudUrl = await uploadImage(updated.imageUrl, `visuals/${updated.id}.png`);
          updated = { ...updated, imageUrl: cloudUrl };
        } catch (e) {
          console.error("Failed to migrate image to cloud storage:", e);
        }
      }
      setCurrentVisual(updated);
      await saveVisual(updated);
    } else {
      setCurrentVisual(updated);
      setHistory(prev => prev.map(h => h.id === updated.id ? updated : h));
    }
  };

  const handleQuickDownload = async (e: React.MouseEvent, item: VisualData) => {
    e.stopPropagation();
    if (!item.imageUrl) return;
    
    setDownloadingId(item.id);
    try {
      const isFree = subscription.plan === 'FREE' || !isAuthenticated;
      const fileName = `VisualMate_${item.topic.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`;
      await downloadVisual(item.imageUrl, fileName, 'png', isFree, item.title);
    } catch (error) {
      console.error("Quick download failed:", error);
    } finally {
      setDownloadingId(null);
    }
  };

  const deleteFromHistory = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAuthenticated && user) {
      await deleteVisual(id);
    } else {
      setHistory(prev => prev.filter(h => h.id !== id));
    }
  };

  const handleCheckoutSuccess = async () => {
    if (!checkoutConfig) return;
    const updatedSub = upgradePlan(subscription, checkoutConfig.plan, checkoutConfig.cycle);
    setSubscription({ ...updatedSub });
    
    if (isAuthenticated && user) {
      await updateUserSubscription(user.id, updatedSub);
    }
    
    setShowSuccess(true);
    setView('dashboard');
  };

  const handleSelectPlan = (plan: PlanType, cycle: BillingCycle) => {
    if (!isAuthenticated) {
      triggerAuthModal({
        title: "Sign up to upgrade",
        description: "You need an account to subscribe to a paid plan and unlock all features.",
        onSuccess: () => {
          setCheckoutConfig({ plan, cycle });
          setView('checkout');
        }
      });
      return;
    }
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

  const getPageTitle = () => {
    switch (view) {
      case 'dashboard': return 'Dashboard';
      case 'home': return 'Create Visual';
      case 'generator': return 'Visual Editor';
      case 'history': return 'Your Library';
      case 'pricing': return 'Pricing Plans';
      case 'checkout': return 'Checkout';
      case 'billing': return 'Billing & Subscription';
      case 'settings': return 'Settings';
      default: return 'VisualMate AI';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-emerald-100 selection:text-emerald-900 flex">
      <AnimatePresence>
        {!settings.onboardingCompleted && (
          <OnboardingFlow onComplete={handleOnboardingComplete} />
        )}
      </AnimatePresence>

      <Sidebar 
        view={view} 
        setView={(v) => { 
          if (!isAuthenticated && (v === 'history' || v === 'billing' || v === 'settings')) {
            setView('login');
            return;
          }
          setView(v); 
          setIsMobileMenuOpen(false); 
        }} 
        subscription={subscription} 
        onUpgrade={() => { 
          if (!isAuthenticated) {
            triggerAuthModal({
              title: "Sign up to upgrade",
              description: "Unlock high-quality downloads, unlimited generations, and more.",
              onSuccess: () => setView('pricing')
            });
          } else {
            setView('pricing'); 
          }
          setIsMobileMenuOpen(false); 
        }}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
        isAuthenticated={isAuthenticated}
      />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-[260px]'} ml-0`}>
        <Header 
          title={getPageTitle()} 
          userEmail={user?.email || ''} 
          onLogout={handleLogout}
          onLogin={() => setView('login')}
          onSettings={() => {
            if (!isAuthenticated) {
              triggerAuthModal({
                title: "Sign in to manage settings",
                description: "Access your account preferences and billing information."
              });
            } else {
              setView('settings');
            }
          }}
          onMenuClick={() => setIsMobileMenuOpen(true)}
          isAuthenticated={isAuthenticated}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
            <AnimatePresence mode="wait">
              {view === 'dashboard' && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Dashboard 
                    history={history}
                    subscription={subscription}
                    onCreateNew={() => handleCreateNew()}
                    onViewHistory={() => setView('history')}
                    onOpenVisual={(visual) => { setCurrentVisual(visual); setView('generator'); }}
                    isAuthenticated={isAuthenticated}
                    onAuthRequired={(title, description) => triggerAuthModal({ title, description })}
                    onUpgrade={() => setView(subscription.plan === 'FREE' ? 'pricing' : 'billing')}
                    user={user}
                  />
                </motion.div>
              )}

              {view === 'home' && (
                <motion.div
                  key="home"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Home 
                    onGenerate={handleGenerate} 
                    isGenerating={isGenerating} 
                    generationStep={generationStep}
                    subscription={subscription}
                    initialTopic={prefillData?.topic}
                    initialSubject={prefillData?.subject}
                    isAuthenticated={isAuthenticated}
                    onAuthRequired={(title, description) => triggerAuthModal({ title, description })}
                  />
                </motion.div>
              )}

              {view === 'generator' && currentVisual && (
                <motion.div
                  key="generator"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <Generator 
                    data={currentVisual} 
                    onBack={() => setView('dashboard')}
                    onRegenerate={handleRegenerate}
                    onUpdateNodes={handleUpdateNodes}
                    isRegenerating={isGenerating}
                    generationStep={generationStep}
                    subscription={subscription}
                    onUpgradeRequest={(reason) => {
                      if (!isAuthenticated) {
                        triggerAuthModal({
                          title: "Sign up to upgrade",
                          description: reason || "Unlock high-quality downloads and more features."
                        });
                      } else {
                        setUpgradeReason(reason);
                        setIsUpgradeModalOpen(true);
                        setAnalytics(prev => ({ ...prev, upgradeModalTriggers: prev.upgradeModalTriggers + 1 }));
                      }
                    }}
                    isAuthenticated={isAuthenticated}
                    onAuthRequired={(title, description) => triggerAuthModal({ title, description })}
                  />
                </motion.div>
              )}

              {view === 'history' && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-12">
                    <div>
                      <h2 className="text-3xl font-bold text-zinc-900 mb-2 tracking-tight">Your Library</h2>
                      <p className="text-zinc-500 font-medium">{history.length} professional visuals saved to your account</p>
                    </div>
                  </div>

                  {history.length === 0 ? (
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
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                              <button 
                                onClick={(e) => handleQuickDownload(e, item)}
                                disabled={downloadingId === item.id}
                                className="p-2.5 bg-white/90 backdrop-blur text-emerald-600 rounded-xl shadow-xl hover:bg-emerald-50 transition-colors disabled:opacity-50"
                                title="Quick Download PNG"
                              >
                                {downloadingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                              </button>
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

              {view === 'pricing' && (
                <motion.div
                  key="pricing"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <PricingPage 
                    currentPlan={subscription.plan} 
                    onSelectPlan={handleSelectPlan}
                    isAuthenticated={isAuthenticated}
                  />
                </motion.div>
              )}

              {view === 'checkout' && checkoutConfig && (
                <motion.div
                  key="checkout"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <CheckoutFlow 
                    plan={checkoutConfig.plan}
                    cycle={checkoutConfig.cycle}
                    userEmail="ishimweyves217@gmail.com"
                    onSuccess={handleCheckoutSuccess}
                    onCancel={() => setView('pricing')}
                  />
                </motion.div>
              )}

              {view === 'billing' && (
                <motion.div
                  key="billing"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <BillingDashboard 
                    subscription={subscription}
                    onUpgrade={() => setView('pricing')}
                    onCancel={handleCancelSubscription}
                  />
                </motion.div>
              )}

              {view === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Settings />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

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

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        title={authModalConfig.title}
        description={authModalConfig.description}
        onSuccess={authModalConfig.onSuccess}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

