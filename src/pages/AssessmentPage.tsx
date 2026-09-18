import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { assessmentQuestions } from "../data/questions";
import { ChevronRight, ChevronLeft, Loader2, Sparkles, CheckCircle } from "lucide-react";
import { auth, db } from "../lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function AssessmentPage() {
  const [currentStep, setCurrentStep] = useState(() => {
    const saved = localStorage.getItem("assessment_step");
    const val = saved ? parseInt(saved, 10) : 0;
    // Safety check to ensure we don't start out of bounds
    return (val >= 0 && val < assessmentQuestions.length) ? val : 0;
  });
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem("assessment_answers");
    return saved ? JSON.parse(saved) : {};
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("assessment_step", currentStep.toString());
  }, [currentStep]);

  useEffect(() => {
    localStorage.setItem("assessment_answers", JSON.stringify(answers));
  }, [answers]);

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    
    if (currentStep < assessmentQuestions.length - 1) {
      setTimeout(() => setCurrentStep(prev => prev + 1), 150);
    }
  };

  const [error, setError] = useState<string | null>(null);

  const submitAssessment = async () => {
    setIsAnalyzing(true);
    setError(null);
    
    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 50);

    try {
      const response = await fetch("/api/analyze-career", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers })
      });
      
      if (!response.ok) throw new Error("Failed to analyze career data.");
      
      const roadmapData = await response.json();
      
      if (auth.currentUser) {
        await addDoc(collection(db, "assessments"), {
          userId: auth.currentUser.uid,
          timestamp: Date.now(),
          answers,
          roadmapData
        });
      }

      // Clear persistence on success
      localStorage.removeItem("assessment_step");
      localStorage.removeItem("assessment_answers");

      setAnalysisProgress(100);
      navigate("/roadmap", { state: { roadmapData } });

    } catch (err: any) {
      console.error("Analysis failed:", err);
      setError(err.message || "An unexpected error occurred. Please try again.");
      setIsAnalyzing(false);
      clearInterval(interval);
    }
  };

  const currentQuestion = assessmentQuestions[currentStep];
  const progress = ((currentStep + 1) / assessmentQuestions.length) * 100;

  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 max-w-2xl mx-auto">
        <div className="relative">
          <div className="w-32 h-32 glass rounded-full flex items-center justify-center overflow-hidden border-gold/20">
             <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
               className="absolute inset-0 border-t-4 border-gold rounded-full"
             />
             <Sparkles className="w-12 h-12 text-gold animate-pulse" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="serif text-3xl font-bold text-white">Analyzing Your Potential...</h2>
          <p className="text-slate-400 text-lg font-light leading-relaxed">
            Our AI is processing your responses against global industry data. 
            This usually takes a few moments to ensure high-fidelity results.
          </p>
        </div>

        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${analysisProgress}%` }}
            className="h-full bg-gold shadow-[0_0_10px_rgba(212,175,55,0.5)]"
          />
        </div>
        <div className="text-slate-500 font-mono text-xs tracking-widest">{analysisProgress}% COMPLETE</div>
      </div>
    );
  }

  if (!currentQuestion && !isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 max-w-2xl mx-auto">
        {error && (
          <div className="p-4 glass border-red-500/20 text-red-400 text-sm rounded-xl flex items-center justify-between w-full">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="font-bold">Dismiss</button>
          </div>
        )}
        <div className="w-20 h-20 glass rounded-full flex items-center justify-center mx-auto border-emerald-500/20">
          <CheckCircle className="w-10 h-10 text-emerald-500" />
        </div>
        <div className="space-y-2">
          <h2 className="serif text-4xl font-bold text-white italic">Assessment Complete</h2>
          <p className="text-slate-400 text-lg font-light">All intelligence parameters have been mapped. Ready to synthesize your career trajectory?</p>
        </div>
        <button 
          onClick={submitAssessment}
          className="bg-gold text-black px-12 py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-gold/90 transition-all shadow-xl shadow-gold/20"
        >
          Synthesize Final Analysis
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 space-y-12">
      {error && (
        <div className="p-4 glass border-red-500/20 text-red-400 text-sm rounded-xl flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="font-bold">Dismiss</button>
        </div>
      )}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-gold uppercase tracking-[0.2em]">Skill & Interest Mapping</span>
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Question {currentStep + 1} of {assessmentQuestions.length}</span>
        </div>
        <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
          <motion.div 
            animate={{ width: `${progress}%` }}
            className="h-full bg-gold"
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-10"
        >
          <h2 className="serif text-4xl md:text-5xl font-bold text-white leading-tight">
            {currentQuestion?.question}
          </h2>

          <div className="grid grid-cols-1 gap-4">
            {currentQuestion?.options?.map((option) => (
              <button
                key={option}
                onClick={() => handleAnswer(currentQuestion.id, option)}
                className={`p-6 rounded-xl border transition-all text-left group ${
                  answers[currentQuestion.id] === option
                    ? "border-gold bg-gold/10 shadow-[0_0_20px_rgba(212,175,55,0.05)]"
                    : "border-white/10 hover:border-white/20 glass"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-lg font-light ${answers[currentQuestion.id] === option ? 'text-white font-medium' : 'text-slate-400'}`}>{option}</span>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                    answers[currentQuestion.id] === option ? 'border-gold bg-gold' : 'border-white/20'
                  }`}>
                    {answers[currentQuestion.id] === option && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between pt-8">
        <button
          onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
          disabled={currentStep === 0}
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white disabled:opacity-0 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        {currentStep === assessmentQuestions.length - 1 && currentQuestion && answers[currentQuestion.id] ? (
          <button
            onClick={submitAssessment}
            className="bg-gold text-black px-10 py-3 rounded font-bold text-xs uppercase tracking-widest hover:bg-gold/90 transition-all flex items-center gap-2 shadow-lg shadow-gold/10"
          >
            Final Analysis
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="text-slate-600 text-[10px] uppercase tracking-widest font-bold italic">Selection Required</div>
        )}
      </div>
    </div>
  );
}
