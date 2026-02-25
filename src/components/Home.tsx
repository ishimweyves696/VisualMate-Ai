import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, BookOpen, Globe, Zap, Shield, Star, Lock, Info, Lightbulb, Search } from 'lucide-react';
import { Subject, GradeLevel, Language, VisualStyle, AspectRatio, Resolution, UserSubscription } from '../types';

interface HomeProps {
  onGenerate: (config: {
    topic: string;
    subject: Subject;
    gradeLevel: GradeLevel;
    language: Language;
    style: VisualStyle;
    aspectRatio: AspectRatio;
    resolution: Resolution;
  }) => void;
  isGenerating: boolean;
  generationStep?: string;
  subscription: UserSubscription;
}

export const Home: React.FC<HomeProps> = ({ onGenerate, isGenerating, generationStep, subscription }) => {
  const [topic, setTopic] = React.useState('');
  const [subject, setSubject] = React.useState<Subject>('General');
  const [gradeLevel, setGradeLevel] = React.useState<GradeLevel>('Middle School');
  const [language, setLanguage] = React.useState<Language>('English');
  const [style, setStyle] = React.useState<VisualStyle>('Diagram');
  const [aspectRatio, setAspectRatio] = React.useState<AspectRatio>('16:9');
  const [resolution, setResolution] = React.useState<Resolution>('1K');

  const isFree = subscription.plan === 'FREE';

  const suggestions = [
    { topic: "The Water Cycle", subject: "Science" as Subject },
    { topic: "Ancient Roman Government", subject: "History" as Subject },
    { topic: "Photosynthesis Process", subject: "Biology" as Subject },
    { topic: "Plate Tectonics", subject: "Geography" as Subject },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    onGenerate({ topic, subject, gradeLevel, language, style, aspectRatio, resolution });
  };

  const handleSuggestionClick = (s: { topic: string; subject: Subject }) => {
    setTopic(s.topic);
    setSubject(s.subject);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="text-center mb-16">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-emerald-100 shadow-sm"
        >
          <Sparkles className="w-3 h-3" /> Powered by Gemini 3.1 Pro
        </motion.div>
        <h1 className="text-5xl md:text-6xl font-bold text-zinc-900 mb-6 tracking-tight flex items-baseline justify-center gap-3">
          VisualMate <span className="text-emerald-600 text-3xl md:text-4xl font-medium">AI</span>
        </h1>
        <p className="text-lg text-zinc-500 max-w-2xl mx-auto font-medium leading-relaxed">
          Your Intelligent Visual Thinking Partner. Transform any complex topic into a professional, structured visual in seconds.
        </p>
      </div>

      <div className="bg-white rounded-[40px] shadow-2xl shadow-zinc-200/50 border border-zinc-100 p-8 md:p-12 relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50/50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
        
        <form onSubmit={handleSubmit} className="relative z-10 space-y-10">
          <div className="space-y-3">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Search className="w-3 h-3" /> What would you like to visualize?
            </label>
            <div className="relative group">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., How a black hole forms, The French Revolution, Human Digestive System..."
                className="w-full p-6 bg-zinc-50 border-2 border-zinc-100 rounded-3xl text-lg font-medium outline-none focus:border-emerald-500 focus:bg-white transition-all placeholder:text-zinc-300"
                disabled={isGenerating}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                <AnimatePresence>
                  {topic && !isGenerating && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      type="submit"
                      className="p-3 bg-zinc-900 text-white rounded-2xl hover:bg-zinc-800 transition-all shadow-xl"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            {/* Suggestions */}
            {!topic && (
              <div className="flex flex-wrap gap-2 pt-2">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSuggestionClick(s)}
                    className="px-4 py-2 bg-zinc-50 hover:bg-zinc-100 text-zinc-500 text-xs font-bold rounded-xl border border-zinc-100 transition-all flex items-center gap-2"
                  >
                    <Lightbulb className="w-3 h-3 text-amber-400" /> {s.topic}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-3">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <BookOpen className="w-3 h-3" /> Subject & Level
              </label>
              <div className="space-y-2">
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value as Subject)}
                  className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-bold outline-none focus:border-emerald-500 transition-all"
                  disabled={isGenerating}
                >
                  {['General', 'Science', 'History', 'Math', 'Geography', 'Biology', 'Physics', 'Art'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value as GradeLevel)}
                  className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-bold outline-none focus:border-emerald-500 transition-all"
                  disabled={isGenerating}
                >
                  {['Elementary', 'Middle School', 'High School', 'University'].map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <Globe className="w-3 h-3" /> Language & Style
              </label>
              <div className="space-y-2">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-bold outline-none focus:border-emerald-500 transition-all"
                  disabled={isGenerating}
                >
                  {['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese'].map(l => (
                    <option key={l} value={l} disabled={isFree && l !== 'English'}>
                      {l} {isFree && l !== 'English' ? '🔒' : ''}
                    </option>
                  ))}
                </select>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value as VisualStyle)}
                  className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-bold outline-none focus:border-emerald-500 transition-all"
                  disabled={isGenerating}
                >
                  {['Diagram', 'Illustration', 'Infographic', 'Sketch', '3D Render', 'Minimalist'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <Zap className="w-3 h-3" /> Format & Quality
              </label>
              <div className="space-y-2">
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                  className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-bold outline-none focus:border-emerald-500 transition-all"
                  disabled={isGenerating}
                >
                  {['1:1', '3:4', '4:3', '9:16', '16:9'].map(a => (
                    <option key={a} value={a}>{a} Ratio</option>
                  ))}
                </select>
                <select
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value as Resolution)}
                  className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-bold outline-none focus:border-emerald-500 transition-all"
                  disabled={isGenerating}
                >
                  {['1K', '2K', '4K'].map(r => (
                    <option key={r} value={r} disabled={isFree && r !== '1K'}>
                      {r} Quality {isFree && r !== '1K' ? '🔒' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isGenerating || !topic.trim()}
            className="w-full py-6 bg-emerald-600 text-white font-bold rounded-[24px] text-xl shadow-2xl shadow-emerald-100 hover:bg-emerald-700 disabled:bg-zinc-200 disabled:shadow-none transition-all relative overflow-hidden group"
          >
            <AnimatePresence mode="wait">
              {isGenerating ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{generationStep || 'Processing...'}</span>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="idle"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center justify-center gap-3"
                >
                  <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                  Generate Visual Assistant
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </form>
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-zinc-100 flex items-center justify-center mx-auto">
            <Shield className="w-6 h-6 text-emerald-600" />
          </div>
          <h3 className="font-bold text-zinc-900">Privacy First</h3>
          <p className="text-xs text-zinc-500 leading-relaxed font-medium">Your data stays in your browser. We process topics securely and never store personal info.</p>
        </div>
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-zinc-100 flex items-center justify-center mx-auto">
            <Star className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-bold text-zinc-900">Expert Quality</h3>
          <p className="text-xs text-zinc-500 leading-relaxed font-medium">AI-driven analysis ensures curriculum alignment and professional visual structure.</p>
        </div>
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-zinc-100 flex items-center justify-center mx-auto">
            <Zap className="w-6 h-6 text-amber-600" />
          </div>
          <h3 className="font-bold text-zinc-900">Instant Results</h3>
          <p className="text-xs text-zinc-500 leading-relaxed font-medium">From complex topic to structured visual in under 20 seconds. Save hours of design work.</p>
        </div>
      </div>
    </div>
  );
};
