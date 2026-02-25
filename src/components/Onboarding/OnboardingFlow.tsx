import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Lightbulb, Target, ArrowRight, X } from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [step, setStep] = React.useState(0);

  const steps = [
    {
      title: "Welcome to VisualMate AI",
      description: "Transform complex educational topics into clear, professional diagrams in seconds. Guided by AI, designed for clarity.",
      icon: <Sparkles className="w-12 h-12 text-emerald-500" />,
      color: "bg-emerald-50",
    },
    {
      title: "Intelligent Analysis",
      description: "Simply enter a topic. Our AI analyzes the core concepts, relationships, and curriculum alignment to build a structured foundation.",
      icon: <Target className="w-12 h-12 text-blue-500" />,
      color: "bg-blue-50",
    },
    {
      title: "Professional Visuals",
      description: "Export high-quality visuals for classrooms, presentations, or study guides. Choose your style, aspect ratio, and resolution.",
      icon: <Lightbulb className="w-12 h-12 text-amber-500" />,
      color: "bg-amber-50",
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[32px] shadow-2xl max-w-lg w-full overflow-hidden relative"
      >
        <button 
          onClick={onComplete}
          className="absolute top-6 right-6 p-2 hover:bg-zinc-100 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5 text-zinc-400" />
        </button>

        <div className="p-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <div className={`w-24 h-24 ${steps[step].color} rounded-[32px] flex items-center justify-center mx-auto mb-8`}>
                {steps[step].icon}
              </div>
              <h2 className="text-3xl font-bold text-zinc-900 mb-4">{steps[step].title}</h2>
              <p className="text-zinc-600 leading-relaxed mb-12">
                {steps[step].description}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-emerald-600' : 'w-2 bg-zinc-200'}`}
                />
              ))}
            </div>
            <button 
              onClick={handleNext}
              className="flex items-center gap-2 px-8 py-4 bg-zinc-900 text-white font-bold rounded-2xl hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200"
            >
              {step === steps.length - 1 ? 'Get Started' : 'Next'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
