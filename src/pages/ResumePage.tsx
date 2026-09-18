import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { FileText, Sparkles, Wand2, Download, CheckCircle, Loader2 } from "lucide-react";
import { auth, db } from "../lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function ResumePage() {
  const [resumeText, setResumeText] = useState(() => localStorage.getItem("resume_text") || "");
  const [targetCareer, setTargetCareer] = useState(() => localStorage.getItem("resume_target") || "");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [result, setResult] = useState<{ optimizedText: string, suggestions: string[], keywordsAdded: string[] } | null>(null);

  useEffect(() => {
    localStorage.setItem("resume_text", resumeText);
  }, [resumeText]);

  useEffect(() => {
    localStorage.setItem("resume_target", targetCareer);
  }, [targetCareer]);

  const handleOptimize = async () => {
    if (!resumeText || !targetCareer) return;
    setIsOptimizing(true);
    setResult(null);
    
    try {
      const response = await fetch("/api/optimize-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, targetCareer })
      });
      const data = await response.json();
      setResult(data);

      if (auth.currentUser) {
        await addDoc(collection(db, "resumes"), {
          userId: auth.currentUser.uid,
          originalText: resumeText,
          optimizedText: data.optimizedText,
          suggestions: data.suggestions,
          keywordsAdded: data.keywordsAdded,
          targetCareer,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <header className="text-center space-y-4">
        <h1 className="serif text-5xl font-bold text-white tracking-tight">Resume <span className="italic opacity-50 font-normal">Optimization</span></h1>
        <p className="text-slate-500 max-w-2xl mx-auto font-light leading-relaxed">Align your professional narrative with industry-leading trajectory patterns and AI-verified keyword mapping.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Input Area */}
        <div className="space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
               Target Trajectory
            </label>
            <input 
              placeholder="e.g. Director of Engineering, Lead Architect..."
              value={targetCareer}
              onChange={(e) => setTargetCareer(e.target.value)}
              className="w-full p-5 glass border-white/10 rounded-xl focus:outline-none focus:border-gold/50 text-white font-light"
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
               Professional Narrative
            </label>
            <textarea 
              rows={12}
              placeholder="Paste your professional experience here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="w-full p-6 glass border-white/10 rounded-2xl focus:outline-none focus:border-gold/50 text-white font-light resize-none leading-relaxed"
            />
          </div>
          <button 
            onClick={handleOptimize}
            disabled={isOptimizing || !resumeText || !targetCareer}
            className="w-full py-5 bg-gold text-black rounded font-bold text-[10px] uppercase tracking-widest hover:bg-gold/90 transition-all flex items-center justify-center gap-3 disabled:opacity-30 shadow-xl shadow-gold/5"
          >
            {isOptimizing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
            {isOptimizing ? "Processing Alignment..." : "Generate Strategic Roadmap"}
          </button>
        </div>

        {/* Results Area */}
        <div className={`glass border-dashed rounded-3xl p-10 flex flex-col ${!result ? 'justify-center items-center text-center' : ''}`}>
           {!result ? (
             <div className="space-y-6 max-w-xs opacity-40">
                <div className="w-20 h-20 glass border-white/5 rounded-full flex items-center justify-center mx-auto">
                   <Sparkles className="w-10 h-10 text-slate-500" />
                </div>
                <h3 className="serif text-2xl font-bold text-slate-400 italic">Optimized Narrative</h3>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Waiting for strategic input...</p>
             </div>
           ) : (
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="h-full flex flex-col space-y-8"
             >
                <div className="flex items-center justify-between border-b border-white/5 pb-6">
                   <div className="flex items-center gap-3 text-emerald-500 text-[10px] font-bold uppercase tracking-widest">
                      <CheckCircle className="w-4 h-4" /> Strategic Match Verified
                   </div>
                   <button className="flex items-center gap-2 text-gold text-[10px] font-bold uppercase tracking-widest hover:underline">
                      <Download className="w-4 h-4" /> Export Report
                   </button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Strategic Suggestions</h4>
                    <ul className="space-y-2">
                      {result.suggestions.map((s, i) => (
                        <li key={i} className="text-sm text-slate-300 font-light flex gap-2">
                          <span className="text-gold">•</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Added Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.keywordsAdded.map((k, i) => (
                        <span key={i} className="px-2 py-1 glass border-white/10 text-[9px] text-gold rounded font-bold uppercase tracking-tighter">{k}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex-1 bg-white/[0.02] p-8 rounded-2xl overflow-y-auto whitespace-pre-wrap font-mono text-[11px] leading-loose text-slate-300 border border-white/5">
                  {result.optimizedText}
                </div>
             </motion.div>
           )}
        </div>
      </div>
    </div>
  );
}
