import React from 'react';
import { motion } from 'motion/react';
import { 
  PlusCircle, 
  ArrowRight,
  BookOpen,
  Sparkles,
  Zap,
  Star,
  ChevronRight,
  Download,
  Loader2
} from 'lucide-react';
import { VisualData, UserSubscription } from '../types';
import { SampleGallery } from './SampleGallery';
import { PLANS } from '../services/subscriptionService';
import { downloadVisual } from '../services/downloadService';

interface DashboardProps {
  history: VisualData[];
  subscription: UserSubscription;
  onCreateNew: (sample?: VisualData) => void;
  onViewHistory: () => void;
  onOpenVisual: (visual: VisualData) => void;
  isAuthenticated: boolean;
  onAuthRequired: (title: string, description: string) => void;
  onUpgrade: () => void;
  user?: { id: string; name: string; email: string } | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  history, 
  subscription, 
  onCreateNew, 
  onViewHistory,
  onOpenVisual,
  isAuthenticated,
  onAuthRequired,
  onUpgrade,
  user
}) => {
  const [downloadingId, setDownloadingId] = React.useState<string | null>(null);
  const recentVisuals = history.slice(0, 5);
  const planInfo = PLANS[subscription.plan];
  const userName = user?.name || user?.email?.split('@')[0] || 'Creator';

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

  return (
    <div className="max-w-[1200px] mx-auto space-y-10 sm:space-y-16 lg:space-y-24 px-0 pb-24">
      {/* SECTION 2 — WELCOME & PRIMARY ACTION */}
      <section className="text-center space-y-6 sm:space-y-8 pt-6 sm:pt-12">
        <div className="space-y-2 sm:space-y-3">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-bold text-zinc-900 tracking-tight px-4"
          >
            👋 Welcome back, {userName}!
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base sm:text-lg lg:text-xl text-zinc-500 font-medium px-6"
          >
            You’ve created <span className="text-emerald-600 font-bold">{history.length}</span> {history.length === 1 ? 'visual' : 'visuals'} so far.
          </motion.p>
        </div>
        
        <div className="flex flex-col items-center gap-4 px-4">
          <motion.button 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            onClick={() => onCreateNew()}
            className="w-full max-w-lg flex items-center justify-center gap-3 px-8 py-5 sm:py-6 bg-emerald-600 text-white font-bold rounded-[20px] hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-100 group text-lg sm:text-xl"
          >
            <PlusCircle className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-90 transition-transform duration-300" />
            Create New Visual
          </motion.button>
          <p className="text-xs sm:text-sm text-zinc-400 font-medium italic">
            "Let’s make your next masterpiece!"
          </p>
        </div>
      </section>

      {/* SECTION 3 — USAGE */}
      <section className="max-w-2xl mx-auto w-full px-4">
        <div className="bg-white p-6 sm:p-8 rounded-[28px] sm:rounded-[32px] border border-zinc-100 shadow-sm hover:shadow-md transition-shadow space-y-5 sm:space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500" /> Today's Usage
            </h3>
            <span className="text-xs sm:text-sm font-bold text-zinc-900">
              {subscription.usedToday} of {planInfo.dailyQuota} visuals used today
            </span>
          </div>
          <div className="h-3 sm:h-4 w-full bg-zinc-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(subscription.usedToday / planInfo.dailyQuota) * 100}%` }}
              transition={{ duration: 1.2, ease: "circOut" }}
              className="h-full bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)]"
            />
          </div>
          <p className="text-[10px] sm:text-xs text-zinc-400 font-medium text-center">
            {subscription.usedToday >= planInfo.dailyQuota 
              ? "You've reached your daily limit. Upgrade to keep creating!" 
              : `You've used ${subscription.usedToday} of ${planInfo.dailyQuota} visuals today. Keep going!`}
          </p>
        </div>
      </section>

      {/* SECTION 4 — RECENT & SAMPLE VISUALS */}
      <section className="space-y-6 sm:space-y-8">
        <div className="flex items-center justify-between px-4 sm:px-2">
          <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
            {history.length > 0 ? "Your latest creations" : "Get inspired by these samples"}
          </h3>
          {history.length > 0 && (
            <button 
              onClick={onViewHistory}
              className="text-xs sm:text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1 min-h-[40px] px-4 bg-emerald-50 rounded-full"
            >
              View Library <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          )}
        </div>

        {history.length > 0 ? (
          <div className="flex overflow-x-auto pb-6 gap-4 sm:gap-6 snap-x no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:overflow-visible">
            {recentVisuals.map((item) => (
              <motion.div 
                key={item.id}
                whileHover={{ y: -8 }}
                onClick={() => onOpenVisual(item)}
                className="min-w-[260px] sm:min-w-0 snap-center group bg-white rounded-[24px] sm:rounded-[28px] border border-zinc-100 shadow-sm hover:shadow-2xl transition-all cursor-pointer overflow-hidden"
              >
                <div className="aspect-video bg-zinc-100 relative overflow-hidden">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-300"><BookOpen className="w-8 h-8 sm:w-10 sm:h-10" /></div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]">
                    <span className="bg-white text-zinc-900 px-5 py-2 sm:px-6 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-transform">Open Visual</span>
                    <button 
                      onClick={(e) => handleQuickDownload(e, item)}
                      disabled={downloadingId === item.id}
                      className="bg-emerald-600 text-white p-2.5 rounded-full shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-transform delay-75 hover:bg-emerald-700 disabled:opacity-50"
                      title="Quick Download PNG"
                    >
                      {downloadingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="p-5 sm:p-6">
                  <h4 className="font-bold text-zinc-900 mb-1 line-clamp-1 group-hover:text-emerald-600 transition-colors text-sm sm:text-base">{item.title}</h4>
                  <p className="text-[10px] sm:text-xs text-zinc-400 font-medium">{new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-10 sm:space-y-12 px-4 sm:px-0">
            <div className="bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-[32px] sm:rounded-[48px] p-8 sm:p-12 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white text-emerald-600 rounded-[24px] sm:rounded-[32px] flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-sm">
                <Sparkles className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 mb-2 sm:mb-3">Your creative journey starts here</h3>
              <p className="text-sm sm:text-base text-zinc-500 font-medium max-w-sm mx-auto mb-6 sm:mb-8 leading-relaxed">
                Transform any topic into a professional visual in seconds. Let's make something amazing together.
              </p>
              <button 
                onClick={() => onCreateNew()}
                className="px-8 py-3.5 sm:px-10 sm:py-4 bg-emerald-600 text-white font-bold rounded-xl sm:rounded-2xl hover:bg-emerald-700 transition-all shadow-xl inline-flex items-center gap-2 group text-sm sm:text-base"
              >
                Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            <SampleGallery onCreateClick={onCreateNew} limit={3} />
          </div>
        )}
      </section>

      {/* SECTION 3 (Part 2) — PLAN & UPGRADE CTA */}
      <section className="max-w-4xl mx-auto w-full px-4">
        <div className="bg-zinc-900 p-6 sm:p-10 lg:p-12 rounded-[32px] sm:rounded-[40px] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-colors duration-700" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
            <div className="space-y-2 sm:space-y-3 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">
                <Star className="w-3 h-3 fill-current" /> {subscription.plan === 'FREE' ? 'Free Plan' : `${planInfo.name} Plan`}
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">
                {subscription.plan === 'FREE' ? 'Unlock Unlimited Creativity' : 'You have full access to VisualMate'}
              </h3>
              <p className="text-xs sm:text-sm lg:text-base text-zinc-400 font-medium max-w-md">
                {subscription.plan === 'FREE' 
                  ? 'Upgrade to Pro to unlock unlimited visuals, high-res exports, and priority generation.' 
                  : 'Enjoy your premium features and priority generation. Thank you for being a Pro member!'}
              </p>
            </div>
            
            <button 
              onClick={onUpgrade}
              className="shrink-0 w-full md:w-auto px-8 py-4 bg-white text-zinc-900 font-bold rounded-xl sm:rounded-2xl hover:bg-zinc-100 transition-all shadow-xl flex items-center justify-center gap-2 group text-sm sm:text-base"
            >
              {subscription.plan === 'FREE' ? (
                <>
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" /> Upgrade to Pro
                </>
              ) : (
                'Manage Subscription'
              )}
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
