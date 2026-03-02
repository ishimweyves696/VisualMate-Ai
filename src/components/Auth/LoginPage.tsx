import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { Sparkles, AlertCircle, Loader2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const { login, error, isLoading, user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      setLoginSuccess(true);
    } catch (err) {
      // Error is handled by context
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex flex-col items-center justify-center p-6 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[400px] flex flex-col items-center"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-zinc-100 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-2 tracking-tight">VisualMate AI</h1>
          <p className="text-zinc-500 font-medium text-sm">Welcome back. Let’s create.</p>
        </div>

        {/* Success Feedback */}
        <AnimatePresence>
          {loginSuccess && user && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 text-sm font-medium text-center w-full"
            >
              Welcome back, {user.email.split('@')[0]}! Redirecting...
            </motion.div>
          )}
        </AnimatePresence>

        {/* Login Form */}
        <div className="w-full bg-white rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100">
          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700 ml-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-[14px] outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 focus:bg-white transition-all font-medium text-zinc-900 placeholder:text-zinc-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700 ml-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-[14px] outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 focus:bg-white transition-all font-medium text-zinc-900 placeholder:text-zinc-400"
                  required
                />
                <div className="flex justify-end px-1">
                  <button type="button" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
                    Forgot your password?
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col items-center space-y-8">
              <button
                type="submit"
                disabled={isLoading || loginSuccess}
                className="w-full md:w-[80%] py-4 bg-zinc-900 text-white font-bold rounded-[14px] hover:bg-zinc-800 active:scale-[0.98] transition-all shadow-lg shadow-zinc-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Logging In...
                  </>
                ) : (
                  'Log In'
                )}
              </button>

              {/* Error Handling */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-red-500 text-sm font-semibold"
                  >
                    <AlertCircle className="w-4 h-4" />
                    Invalid email or password. Please try again.
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="text-center">
                <p className="text-sm text-zinc-500 font-medium">
                  New to VisualMate AI? <button type="button" className="text-emerald-600 font-bold hover:underline">Sign up here.</button>
                </p>
              </div>
            </div>
          </form>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <p className="text-xs text-zinc-400 font-medium mb-2">
            Professional SaaS Visual Thinking Platform
          </p>
          <div className="flex items-center justify-center gap-4 text-[10px] font-bold text-zinc-300 uppercase tracking-widest">
            <span>Secure</span>
            <span className="w-1 h-1 bg-zinc-200 rounded-full" />
            <span>Private</span>
            <span className="w-1 h-1 bg-zinc-200 rounded-full" />
            <span>Encrypted</span>
          </div>
        </div>

        {/* Demo Credentials Helper */}
        <div className="mt-8 p-4 bg-zinc-100/50 rounded-2xl border border-zinc-200/50">
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider text-center mb-1">Demo Access</p>
          <p className="text-xs text-zinc-500 font-medium text-center">
            ishimweyves217@gmail.com / password123
          </p>
        </div>
      </motion.div>
    </div>
  );
};
