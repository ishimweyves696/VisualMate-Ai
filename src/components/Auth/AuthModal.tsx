import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, CheckCircle2, Mail, Lock, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  title = "Create an account to continue",
  description = "Save your visual and unlock full access to all features.",
  onSuccess
}) => {
  const [isLogin, setIsLogin] = React.useState(true);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const { login, error, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      onSuccess?.();
      onClose();
    } catch (err) {
      // Error handled by context
    }
  };

  const benefits = [
    { icon: CheckCircle2, text: "Save your creations permanently" },
    { icon: ShieldCheck, text: "Access your history anywhere" },
    { icon: Zap, text: "High-quality downloads & exports" },
    { icon: Sparkles, text: "Upgrade to Pro anytime" }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-[48px] shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col md:flex-row border border-white/20"
          >
            {/* Left Side: Benefits */}
            <div className="md:w-5/12 bg-zinc-900 p-10 lg:p-12 text-white flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
              
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest mb-8 border border-white/10">
                  <Sparkles className="w-3 h-3 text-emerald-400" /> VisualMate AI
                </div>
                <h2 className="text-3xl font-bold mb-6 tracking-tight leading-tight">Unlock the full power of VisualMate.</h2>
                <div className="space-y-5">
                  {benefits.map((b, i) => (
                    <div key={i} className="flex items-center gap-3 text-zinc-300 text-sm font-medium">
                      <b.icon className="w-5 h-5 text-emerald-500 shrink-0" />
                      {b.text}
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative z-10 mt-12 pt-8 border-t border-white/10">
                <p className="text-xs text-zinc-500 font-medium leading-relaxed italic">
                  "VisualMate has completely transformed how I explain complex engineering concepts to my team."
                </p>
                <p className="text-[10px] font-bold text-zinc-400 mt-2 uppercase tracking-widest">— Senior Architect</p>
              </div>
            </div>

            {/* Right Side: Form */}
            <div className="md:w-7/12 p-10 lg:p-12 relative">
              <button 
                onClick={onClose}
                className="absolute top-8 right-8 p-2 hover:bg-zinc-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-zinc-400" />
              </button>

              <div className="mb-10">
                <h3 className="text-2xl font-bold text-zinc-900 mb-2 tracking-tight">{title}</h3>
                <p className="text-zinc-500 font-medium text-sm">{description}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-medium">
                    <X className="w-5 h-5 shrink-0" />
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-zinc-900 text-white font-bold rounded-2xl hover:bg-zinc-800 transition-all shadow-xl flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
                  {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </button>
              </form>

              <div className="mt-8 pt-8 border-t border-zinc-50 text-center">
                <p className="text-sm text-zinc-500 font-medium">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                  <button 
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-emerald-600 font-bold hover:underline"
                  >
                    {isLogin ? 'Sign up for free' : 'Sign in here'}
                  </button>
                </p>
                <p className="text-[10px] text-zinc-400 mt-4 font-medium">
                  Demo Credentials: <span className="text-zinc-500">ishimweyves217@gmail.com / password123</span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
