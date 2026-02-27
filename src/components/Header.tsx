import React from 'react';
import { User, LogOut, Settings as SettingsIcon, Bell, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  title: string;
  userEmail: string;
  onLogout?: () => void;
  onSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, userEmail, onLogout, onSettings }) => {
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);

  return (
    <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-zinc-200 sticky top-0 z-40 flex items-center justify-between px-8">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-zinc-900 tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-6">
        {/* Search Bar - Minimalist */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-zinc-100 rounded-lg border border-transparent focus-within:border-zinc-200 focus-within:bg-white transition-all w-64 group">
          <Search className="w-4 h-4 text-zinc-400 group-focus-within:text-zinc-600" />
          <input 
            type="text" 
            placeholder="Search visuals..." 
            className="bg-transparent border-none outline-none text-xs font-medium text-zinc-900 placeholder:text-zinc-400 w-full"
          />
        </div>

        <button className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 rounded-full transition-all relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 p-1 pl-3 bg-zinc-50 border border-zinc-200 rounded-full hover:bg-zinc-100 transition-all group"
          >
            <span className="text-xs font-bold text-zinc-600 group-hover:text-zinc-900 transition-colors hidden sm:block">
              {userEmail.split('@')[0]}
            </span>
            <div className="w-8 h-8 bg-zinc-900 text-white rounded-full flex items-center justify-center text-xs font-bold">
              {userEmail[0].toUpperCase()}
            </div>
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsProfileOpen(false)}
                />
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-zinc-100 p-2 z-50"
                >
                  <div className="px-3 py-3 border-b border-zinc-50 mb-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Logged in as</p>
                    <p className="text-xs font-bold text-zinc-900 truncate">{userEmail}</p>
                  </div>
                  <button 
                    onClick={() => { onSettings?.(); setIsProfileOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-xl transition-all"
                  >
                    <SettingsIcon className="w-4 h-4" /> Settings
                  </button>
                  <button 
                    onClick={() => { onLogout?.(); setIsProfileOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
