import React from 'react';
import { motion } from 'motion/react';
import { 
  PlusCircle, 
  History, 
  TrendingUp, 
  Zap, 
  Clock, 
  ArrowRight,
  BookOpen,
  Star
} from 'lucide-react';
import { VisualData, UserSubscription } from '../types';

interface DashboardProps {
  history: VisualData[];
  subscription: UserSubscription;
  onCreateNew: () => void;
  onViewHistory: () => void;
  onOpenVisual: (visual: VisualData) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  history, 
  subscription, 
  onCreateNew, 
  onViewHistory,
  onOpenVisual
}) => {
  const recentVisuals = history.slice(0, 3);

  return (
    <div className="space-y-10">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-zinc-900 tracking-tight mb-2">Welcome back!</h2>
          <p className="text-zinc-500 font-medium">Ready to create something amazing today?</p>
        </div>
        <button 
          onClick={onCreateNew}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
        >
          <PlusCircle className="w-5 h-5" /> Create New Visual
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6" />
          </div>
          <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total Visuals</p>
          <h3 className="text-3xl font-bold text-zinc-900">{history.length}</h3>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
            <Zap className="w-6 h-6" />
          </div>
          <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-1">Plan Status</p>
          <h3 className="text-3xl font-bold text-zinc-900 capitalize">{subscription.plan.toLowerCase()}</h3>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
            <Star className="w-6 h-6" />
          </div>
          <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-1">Usage Today</p>
          <h3 className="text-3xl font-bold text-zinc-900">{subscription.usedToday}</h3>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-zinc-900 tracking-tight">Recent Visuals</h3>
          <button 
            onClick={onViewHistory}
            className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1"
          >
            View All <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {recentVisuals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentVisuals.map((item) => (
              <div 
                key={item.id}
                onClick={() => onOpenVisual(item)}
                className="group bg-white rounded-[32px] border border-zinc-100 shadow-sm hover:shadow-xl transition-all cursor-pointer overflow-hidden"
              >
                <div className="aspect-video bg-zinc-100 relative overflow-hidden">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-300"><BookOpen className="w-10 h-10" /></div>
                  )}
                </div>
                <div className="p-5">
                  <h4 className="font-bold text-zinc-900 mb-1 line-clamp-1">{item.title}</h4>
                  <p className="text-xs text-zinc-400 font-medium">{new Date(item.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-zinc-50 border border-dashed border-zinc-200 rounded-[32px] p-12 text-center">
            <Clock className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
            <p className="text-zinc-500 font-medium">No recent visuals. Start creating to see them here!</p>
          </div>
        )}
      </div>
    </div>
  );
};
