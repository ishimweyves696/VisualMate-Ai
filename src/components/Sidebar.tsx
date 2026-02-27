import React from 'react';
import { motion } from 'motion/react';
import { 
  Layout, 
  History, 
  CreditCard, 
  Settings, 
  Sparkles, 
  ChevronRight, 
  Zap,
  PlusCircle,
  BarChart3
} from 'lucide-react';
import { UserSubscription } from '../types';
import { PLANS } from '../services/subscriptionService';

interface SidebarProps {
  view: string;
  setView: (view: any) => void;
  subscription: UserSubscription;
  onUpgrade: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  view, 
  setView, 
  subscription, 
  onUpgrade,
  isCollapsed,
  setIsCollapsed
}) => {
  const navItems = [
    { id: 'home', label: 'Create Visual', icon: PlusCircle },
    { id: 'dashboard', label: 'Dashboard', icon: Layout },
    { id: 'history', label: 'History', icon: History },
    { id: 'pricing', label: 'Pricing Plans', icon: BarChart3 },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const usagePercent = subscription.plan === 'FREE' 
    ? (subscription.usedToday / PLANS.FREE.dailyQuota) * 100
    : (subscription.usedThisMonth / PLANS.PRO.monthlyQuota) * 100;

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      className="fixed left-0 top-0 h-screen bg-white border-r border-zinc-200 z-[100] flex flex-col transition-all duration-300 ease-in-out"
    >
      {/* Logo Section */}
      <div className="h-16 flex items-center px-6 border-b border-zinc-50 shrink-0 overflow-hidden">
        <div 
          className="flex items-center gap-3 cursor-pointer group min-w-max" 
          onClick={() => setView('home')}
        >
          <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-100 shrink-0">V</div>
          {!isCollapsed && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-baseline gap-1"
            >
              <span className="font-bold text-xl tracking-tight text-zinc-900">VisualMate</span>
              <span className="text-xs font-medium text-zinc-400">AI</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = view === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                isActive 
                  ? 'bg-emerald-50 text-emerald-700' 
                  : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-emerald-600' : 'text-zinc-400 group-hover:text-zinc-600'}`} />
              {!isCollapsed && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm font-bold tracking-tight"
                >
                  {item.label}
                </motion.span>
              )}
              {isActive && !isCollapsed && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute right-2 w-1.5 h-1.5 bg-emerald-600 rounded-full"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Section: Usage & Plan */}
      <div className="p-4 border-t border-zinc-50 space-y-4">
        {!isCollapsed ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                {subscription.plan} Plan
              </span>
              <span className="text-[10px] font-bold text-zinc-900">
                {subscription.plan === 'FREE' ? subscription.usedToday : subscription.usedThisMonth} / {subscription.plan === 'FREE' ? PLANS.FREE.dailyQuota : PLANS.PRO.monthlyQuota}
              </span>
            </div>
            <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden mb-3">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(usagePercent, 100)}%` }}
                className={`h-full transition-all duration-500 ${usagePercent > 90 ? 'bg-red-500' : 'bg-emerald-500'}`}
              />
            </div>
            {subscription.plan === 'FREE' && (
              <button 
                onClick={onUpgrade}
                className="w-full py-2 bg-zinc-900 text-white text-xs font-bold rounded-lg hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-3 h-3 text-emerald-400" /> Upgrade to Pro
              </button>
            )}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center border border-zinc-100 relative group">
              <BarChart3 className="w-5 h-5 text-zinc-400" />
              <div className="absolute left-full ml-2 px-2 py-1 bg-zinc-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                Usage: {Math.floor(usagePercent)}%
              </div>
            </div>
            {subscription.plan === 'FREE' && (
              <button 
                onClick={onUpgrade}
                className="w-10 h-10 bg-zinc-900 text-white rounded-xl flex items-center justify-center hover:bg-zinc-800 transition-all group relative"
              >
                <Zap className="w-5 h-5 text-emerald-400" />
                <div className="absolute left-full ml-2 px-2 py-1 bg-zinc-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  Upgrade
                </div>
              </button>
            )}
          </div>
        )}
        
        {/* Collapse Toggle */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center py-2 text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`} />
        </button>
      </div>
    </motion.aside>
  );
};
