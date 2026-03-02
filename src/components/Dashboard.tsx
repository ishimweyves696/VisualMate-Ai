import React from 'react';
import { motion } from 'motion/react';
import { 
  PlusCircle, 
  ArrowRight,
  BookOpen,
  Sparkles,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { VisualData, UserSubscription } from '../types';
import { SampleGallery } from './SampleGallery';
import { PLANS } from '../services/subscriptionService';

interface DashboardProps {
  history: VisualData[];
  subscription: UserSubscription;
  onCreateNew: (sample?: VisualData) => void;
  onViewHistory: () => void;
  onOpenVisual: (visual: VisualData) => void;
  isAuthenticated: boolean;
  onAuthRequired: (title: string, description: string) => void;
  onUpgrade: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  history, 
  subscription, 
  onCreateNew, 
  onViewHistory,
  onOpenVisual,
  isAuthenticated,
  onAuthRequired,
  onUpgrade
}) => {
  const recentVisuals = history.slice(0, 3);
  const planInfo = PLANS[subscription.plan];

  return (
    <div className="max-w-[1200px] mx-auto space-y-12 px-4 sm:px-0">
      {/* Human Welcome Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-8 pt-4">
        <div className="space-y-2">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight">
            {isAuthenticated ? 'Welcome back' : 'Welcome to VisualMate'}
          </h2>
          <p className="text-lg text-zinc-500 font-medium">
            You’ve created <span className="text-zinc-900 font-bold">{history.length}</span> {history.length === 1 ? 'visual' : 'visuals'} so far.
          </p>
        </div>
        
        <button 
          onClick={() => onCreateNew()}
          className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 group"
        >
          <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          Create New Visual
        </button>
      </section>

      {/* Compact Status Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Usage Display */}
        <div className="bg-white p-6 rounded-[24px] border border-zinc-100 shadow-sm hover:shadow-md transition-shadow space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Today's Usage</h3>
            <span className="text-xs font-bold text-zinc-900">{subscription.usedToday} / {planInfo.dailyQuota} visuals</span>
          </div>
          <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(subscription.usedToday / planInfo.dailyQuota) * 100}%` }}
              className="h-full bg-emerald-500 rounded-full"
            />
          </div>
          <p className="text-xs text-zinc-400 font-medium">Resetting at midnight local time.</p>
        </div>

        {/* Plan Section */}
        <div className="bg-white p-6 rounded-[24px] border border-zinc-100 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-zinc-900">
              {subscription.plan === 'FREE' ? 'You’re on the Free Plan' : `You’re on the ${planInfo.name} Plan`}
            </h3>
            <p className="text-xs text-zinc-500 font-medium">
              {subscription.plan === 'FREE' ? 'Upgrade to unlock unlimited visuals.' : 'Enjoy your premium features and priority generation.'}
            </p>
          </div>
          <button 
            onClick={onUpgrade}
            className="shrink-0 px-4 py-2 bg-zinc-50 text-zinc-900 text-xs font-bold rounded-xl hover:bg-zinc-100 border border-zinc-200 transition-all"
          >
            {subscription.plan === 'FREE' ? 'View Pricing Plans' : 'Manage Plan'}
          </button>
        </div>
      </div>

      {/* Recent Activity / Empty State */}
      <div className="space-y-6">
        {history.length > 0 ? (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-zinc-900 tracking-tight">Your Recent Visuals</h3>
              <button 
                onClick={onViewHistory}
                className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1 min-h-[44px] px-2"
              >
                View All <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentVisuals.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => onOpenVisual(item)}
                  className="group bg-white rounded-[24px] border border-zinc-100 shadow-sm hover:shadow-xl transition-all cursor-pointer overflow-hidden"
                >
                  <div className="aspect-video bg-zinc-100 relative overflow-hidden">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-300"><BookOpen className="w-10 h-10" /></div>
                    )}
                  </div>
                  <div className="p-6">
                    <h4 className="font-bold text-zinc-900 mb-1 line-clamp-1">{item.title}</h4>
                    <p className="text-xs text-zinc-400 font-medium">{new Date(item.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-12">
            <div className="bg-white border border-zinc-100 rounded-[40px] p-8 sm:p-12 text-center shadow-sm">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[32px] flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-zinc-900 mb-3">Create Your First Visual</h3>
              <p className="text-zinc-500 font-medium max-w-md mx-auto mb-8">
                Transform complex topics into beautiful educational visuals in seconds. Start your creative journey now.
              </p>
              <button 
                onClick={onCreateNew}
                className="px-8 py-4 bg-zinc-900 text-white font-bold rounded-2xl hover:bg-zinc-800 transition-all shadow-xl inline-flex items-center gap-2 group"
              >
                Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Sample Gallery Section - Only shown on empty state */}
            <SampleGallery onCreateClick={onCreateNew} />
          </div>
        )}
      </div>
    </div>
  );
};
