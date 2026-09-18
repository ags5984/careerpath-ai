import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, Send, User, Bot, RefreshCw, Star, Loader2, Sparkles } from "lucide-react";
import { auth, db } from "../lib/firebase";
import { collection, addDoc } from "firebase/firestore";

interface Message {
  role: 'ai' | 'user';
  content: string;
}

export default function InterviewPage() {
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem("interview_messages");
    return saved ? JSON.parse(saved) : [
      { role: 'ai', content: "Welcome. I'm your Career Intelligence Coach. Today we'll conduct a high-fidelity mock interview for your target trajectory. Which role are we mapping today?" }
    ];
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(() => localStorage.getItem("interview_finished") === "true");
  const [feedback, setFeedback] = useState<string | null>(() => localStorage.getItem("interview_feedback"));
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem("interview_messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem("interview_finished", isFinished.toString());
  }, [isFinished]);

  useEffect(() => {
    if (feedback) {
      localStorage.setItem("interview_feedback", feedback);
    } else {
      localStorage.removeItem("interview_feedback");
    }
  }, [feedback]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/interview-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: [...messages, userMessage], careerPath: "General" })
      });
      const data = await response.json();
      
      if (messages.length > 6) {
        setIsFinished(true);
        setFeedback(data.feedback);
        
        if (auth.currentUser) {
          await addDoc(collection(db, "interviews"), {
            userId: auth.currentUser.uid,
            timestamp: Date.now(),
            transcript: [...messages, userMessage],
            feedback: data.feedback
          });
        }
      } else {
        const aiResponse: Message = { role: 'ai', content: "Understood. Let's delve into a scenario: Describe a complex project where you had to balance conflicting stakeholder priorities while maintaining architectural integrity." };
        setMessages(prev => [...prev, aiResponse]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetSession = () => {
    localStorage.removeItem("interview_messages");
    localStorage.removeItem("interview_finished");
    localStorage.removeItem("interview_feedback");
    setMessages([{ role: 'ai', content: "Ready for a new session. Which role are we analyzing?" }]);
    setIsFinished(false);
    setFeedback(null);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-160px)] flex flex-col space-y-8">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
           <h1 className="serif text-3xl font-bold text-white italic flex items-center gap-3">
             <MessageSquare className="w-6 h-6 text-gold not-italic" />
             Interview Intelligence
           </h1>
           <p className="text-slate-500 text-sm font-light tracking-wide uppercase">Refine your strategic and technical communication.</p>
        </div>
        <button 
          onClick={resetSession}
          className="text-[10px] font-bold text-gold uppercase tracking-[0.2em] px-5 py-2 glass border-gold/20 hover:bg-gold/5 transition-all"
        >
          Reset Session
        </button>
      </header>

      <div className="flex-1 glass rounded-3xl flex flex-col overflow-hidden relative border-white/5">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8">
          <AnimatePresence>
            {messages.map((m, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${m.role === 'ai' ? 'bg-gold border-gold text-black shadow-lg shadow-gold/10' : 'glass border-white/10 text-slate-400'}`}>
                  {m.role === 'ai' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </div>
                <div className={`p-5 rounded-2xl max-w-[80%] leading-relaxed ${m.role === 'ai' ? 'glass text-slate-200 rounded-tl-none border-white/5' : 'bg-white/5 text-white rounded-tr-none border border-white/10'}`}>
                  <p className="font-light whitespace-pre-wrap">{m.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <div className="flex gap-5">
              <div className="w-10 h-10 rounded-lg bg-gold text-black flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
              <div className="glass p-5 rounded-2xl rounded-tl-none border-white/5">
                 <div className="flex gap-1.5">
                   <div className="w-1.5 h-1.5 bg-gold/50 rounded-full animate-bounce"></div>
                   <div className="w-1.5 h-1.5 bg-gold/50 rounded-full animate-bounce delay-75"></div>
                   <div className="w-1.5 h-1.5 bg-gold/50 rounded-full animate-bounce delay-150"></div>
                 </div>
              </div>
            </div>
          )}
          {isFinished && feedback && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-10 glass border-gold/30 rounded-3xl space-y-8 relative overflow-hidden"
            >
               <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl rounded-full"></div>
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gold rounded-xl flex items-center justify-center text-black shadow-xl shadow-gold/20">
                    <Star className="w-6 h-6 fill-current" />
                  </div>
                  <div>
                    <h3 className="serif text-2xl font-bold text-white italic">Intelligence Feedback</h3>
                    <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">Comprehensive Session Analysis</p>
                  </div>
               </div>
               <div className="prose prose-invert max-w-none">
                 <p className="whitespace-pre-wrap text-slate-300 leading-relaxed font-light italic">{feedback}</p>
               </div>
               <div className="pt-6 flex gap-4">
                 <button className="flex-1 py-4 bg-gold text-black rounded font-bold text-[10px] uppercase tracking-widest hover:bg-gold/90 transition-all flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" /> Log Performance
                 </button>
                 <button className="flex-1 py-4 glass border-white/10 text-white rounded font-bold text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all">
                    Download Transcript
                 </button>
               </div>
            </motion.div>
          )}
        </div>

        {!isFinished && (
          <div className="p-8 border-t border-white/5 bg-white/[0.01]">
            <div className="relative flex items-center">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Compose your response..."
                className="w-full glass border-white/10 p-5 pr-16 rounded-xl focus:outline-none focus:border-gold/50 transition-all text-white font-light"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-4 p-3 text-gold hover:text-white disabled:opacity-30 transition-all"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
