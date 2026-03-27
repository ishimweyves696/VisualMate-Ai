import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile } from '../services/firestoreService';
import { 
  User, 
  Bell, 
  Shield, 
  Moon, 
  Globe, 
  Mail,
  Trash2,
  ChevronRight,
  Sparkles,
  Check,
  X,
  Loader2
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateUserProfile(user.id, { name: newName });
      setSaveStatus('success');
      setTimeout(() => {
        setIsEditingProfile(false);
        setSaveStatus('idle');
      }, 1500);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const sections = [
    {
      title: 'Account',
      items: [
        { 
          icon: User, 
          label: 'Profile Information', 
          description: 'Update your name and personal details',
          onClick: () => setIsEditingProfile(true)
        },
        { icon: Mail, label: 'Email Preferences', description: 'Manage how we contact you' },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { icon: Moon, label: 'Appearance', description: 'Switch between light and dark mode', value: 'Light' },
        { icon: Globe, label: 'Language', description: 'Choose your preferred language', value: 'English' },
        { icon: Bell, label: 'Notifications', description: 'Configure your alert settings' },
      ]
    },
    {
      title: 'Security & Privacy',
      items: [
        { icon: Shield, label: 'Privacy Settings', description: 'Control your data visibility' },
        { icon: Trash2, label: 'Delete Account', description: 'Permanently remove your data', danger: true },
      ]
    }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <div>
        <h2 className="text-3xl font-bold text-zinc-900 tracking-tight mb-2">Settings</h2>
        <p className="text-zinc-500 font-medium">Manage your account settings and preferences.</p>
      </div>

      {/* Profile Summary */}
      <div className="bg-white rounded-[40px] p-8 border border-zinc-100 shadow-sm flex items-center gap-6">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[32px] flex items-center justify-center text-3xl font-bold">
          {user?.email ? user.email[0].toUpperCase() : 'U'}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-bold text-zinc-900">{user?.email ? user.email.split('@')[0] : 'User'}</h3>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-wider">Active</span>
          </div>
          <p className="text-zinc-500 font-medium flex items-center gap-2">
            <Mail className="w-4 h-4" /> {user?.email || 'No email provided'}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-zinc-50 rounded-xl border border-zinc-100 text-xs font-bold text-zinc-400">
          <Sparkles className="w-3 h-3 text-emerald-500" /> Pro Member
        </div>
      </div>

      <div className="space-y-8">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-4">
            <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-4">{section.title}</h3>
            <div className="bg-white rounded-[32px] border border-zinc-100 shadow-sm overflow-hidden">
              {section.items.map((item, itemIdx) => {
                const Icon = item.icon;
                return (
                  <button 
                    key={itemIdx}
                    onClick={item.onClick}
                    className={`w-full flex items-center justify-between p-5 hover:bg-zinc-50 transition-all group ${
                      itemIdx !== section.items.length - 1 ? 'border-b border-zinc-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                        item.danger ? 'bg-red-50 text-red-600' : 'bg-zinc-50 text-zinc-400 group-hover:text-zinc-900'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className={`text-sm font-bold ${item.danger ? 'text-red-600' : 'text-zinc-900'}`}>{item.label}</p>
                        <p className="text-xs text-zinc-400 font-medium">{item.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {item.value && <span className="text-xs font-bold text-zinc-400">{item.value}</span>}
                      <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-900 transition-colors" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {isEditingProfile && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[32px] shadow-2xl max-w-md w-full overflow-hidden border border-zinc-100"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-zinc-900">Edit Profile</h3>
                  <button 
                    onClick={() => setIsEditingProfile(false)}
                    className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-zinc-400" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-700 ml-1">Display Name</label>
                    <input 
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full px-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button 
                      onClick={handleSaveProfile}
                      disabled={isSaving || !newName.trim()}
                      className="flex-1 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSaving ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : saveStatus === 'success' ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                    <button 
                      onClick={() => setIsEditingProfile(false)}
                      className="flex-1 py-4 bg-zinc-100 text-zinc-600 font-bold rounded-2xl hover:bg-zinc-200 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
