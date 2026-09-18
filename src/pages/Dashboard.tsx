import { useState, useEffect } from "react";
import { collection, query, where, getDocs, orderBy, doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { LayoutDashboard, Award, TrendingUp, History, Star, Clock, ChevronRight, Loader2, CheckCircle2, Circle, IndianRupee } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser) return;
      
      try {
        const assessmentsQ = query(
          collection(db, "assessments"),
          where("userId", "==", auth.currentUser.uid),
          orderBy("timestamp", "desc")
        );
        
        const interviewsQ = query(
          collection(db, "interviews"),
          where("userId", "==", auth.currentUser.uid),
          orderBy("timestamp", "desc")
        );
        
        const [assessmentsSnap, interviewsSnap] = await Promise.all([
          getDocs(assessmentsQ),
          getDocs(interviewsQ)
        ]);

        const assessments = assessmentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const interviews = interviewsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        setData({ assessments, interviews });
      } catch (err: any) {
        console.error("Dashboard Fetch Error:", err);
        // Fallback to simple query if index is missing
        try {
           const assessmentsQ = query(collection(db, "assessments"), where("userId", "==", auth.currentUser.uid));
           const interviewsQ = query(collection(db, "interviews"), where("userId", "==", auth.currentUser.uid));
           const [asSnap, intSnap] = await Promise.all([getDocs(assessmentsQ), getDocs(interviewsQ)]);
           setData({ 
             assessments: asSnap.docs.map(d => d.data()).sort((a:any, b:any) => b.timestamp - a.timestamp),
             interviews: intSnap.docs.map(d => d.data()).sort((a:any, b:any) => b.timestamp - a.timestamp)
           });
        } catch (innerErr) {
           console.error("Critical Dashboard Error:", innerErr);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleStep = async (assessmentId: string, stepIndex: number, currentCompleted: number[]) => {
    try {
      const newCompleted = currentCompleted.includes(stepIndex) 
        ? currentCompleted.filter(i => i !== stepIndex)
        : [...currentCompleted, stepIndex];
      
      await updateDoc(doc(db, "assessments", assessmentId), {
        completedSteps: newCompleted
      });
      
      setData((prev: any) => {
        const newAssessments = prev.assessments.map((a: any) => 
          a.id === assessmentId ? { ...a, completedSteps: newCompleted } : a
        );
        return { ...prev, assessments: newAssessments };
      });
    } catch (err) {
      console.error("Failed to update step", err);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[40vh]">
       <Loader2 className="w-8 h-8 text-gold animate-spin" />
    </div>
  );

  const latestAssessment = data?.assessments?.[0];
  const roadmap = latestAssessment?.roadmapData;
  const completedSteps = latestAssessment?.completedSteps || [];
  const totalSteps = roadmap?.steps?.length || 0;
  const progressPercent = totalSteps > 0 ? Math.round((completedSteps.length / totalSteps) * 100) : 0;
  const indiaData = roadmap?.salaryData?.filter((d: any) => d.region === 'India') || [];

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-1">
           <h1 className="serif text-4xl font-bold text-white italic flex items-center gap-4">
             <LayoutDashboard className="w-8 h-8 text-gold not-italic" />
            Strategic Talent Dashboard
           </h1>
           <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Global Mapping & Milestone Performance</p>
        </div>
        <div className="glass px-10 py-5 rounded-2xl flex items-center gap-10 border-white/5">
           <div className="text-center">
              <div className="text-3xl font-bold text-gold">Level 2</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mt-1">Status: High Potential</div>
           </div>
           <div className="h-10 w-px bg-white/5"></div>
           <div className="text-center">
              <div className="text-3xl font-bold text-emerald-500">85%</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mt-1">Skill Score</div>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Stats */}
        <div className="lg:col-span-2 space-y-10">
           <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass p-10 rounded-3xl space-y-6 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl rounded-full"></div>
                 <div className="w-12 h-12 glass rounded-xl flex items-center justify-center border-gold/20">
                    <TrendingUp className="w-5 h-5 text-gold" />
                 </div>
                 <h3 className="serif text-xl font-bold text-white italic">Mapping Progress</h3>
                 <div className="space-y-3">
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                       <div className="h-full bg-gold transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{progressPercent}% of {roadmap?.careerTitle || "Career"} Roadmap Completed</p>
                 </div>
              </div>
              <div className="glass p-10 rounded-3xl space-y-6">
                 <div className="w-12 h-12 glass rounded-xl flex items-center justify-center border-emerald-500/20">
                    <Award className="w-5 h-5 text-emerald-500" />
                 </div>
                 <h3 className="serif text-xl font-bold text-white italic">Skill Mapping</h3>
                 <div className="flex flex-wrap gap-2 pt-2">
                    {["React", "Node.js", "SQL", "Strategic Planning"].map(s => (
                      <span key={s} className="px-4 py-1.5 glass text-slate-400 rounded-full text-[10px] font-bold border-white/10 uppercase tracking-widest">{s}</span>
                    ))}
                 </div>
              </div>
           </section>

           {indiaData.length > 0 && (
             <section className="glass rounded-3xl p-10 space-y-6 border-white/5">
                <div className="flex items-center justify-between">
                   <h2 className="serif text-2xl font-bold flex items-center gap-3 text-white italic">
                      <IndianRupee className="w-5 h-5 text-emerald-500 not-italic" />
                      Market & Salary Benchmarks
                   </h2>
                   <div className="flex gap-4">
                     <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500"> 
                       <div className="w-2 h-2 bg-gold/60 rounded-full"></div> Entry
                     </div>
                     <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500"> 
                       <div className="w-2 h-2 bg-gold/80 rounded-full"></div> Mid
                     </div>
                     <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500"> 
                       <div className="w-2 h-2 bg-gold rounded-full"></div> Senior
                     </div>
                   </div>
                </div>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={indiaData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="region" hide />
                      <YAxis tick={{fontSize: 10, fill: '#64748b'}} tickFormatter={(val) => `₹${val/100000}L`} stroke="rgba(255,255,255,0.0)" tickMargin={10} />
                      <Tooltip contentStyle={{backgroundColor: '#111', borderColor: 'rgba(255,255,255,0.1)', fontSize: '10px'}} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                      <Bar dataKey="entry" fill="#D4AF37" radius={[4, 4, 0, 0]} name="Entry" opacity={0.6} />
                      <Bar dataKey="mid" fill="#D4AF37" radius={[4, 4, 0, 0]} name="Mid" opacity={0.8} />
                      <Bar dataKey="senior" fill="#D4AF37" radius={[4, 4, 0, 0]} name="Senior" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
             </section>
           )}

           <section className="glass rounded-3xl overflow-hidden border-white/5">
              <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                 <h2 className="serif text-2xl font-bold flex items-center gap-3 text-white italic">
                    <History className="w-5 h-5 text-gold not-italic" />
                    Session Intelligence
                 </h2>
                 <button className="text-[10px] font-bold text-gold uppercase tracking-widest hover:underline">Archive Summary</button>
              </div>
               <div className="divide-y divide-white/5">
                  {data?.assessments?.length > 0 || data?.interviews?.length > 0 ? (
                    <>
                      {data.assessments.map((a: any, i: number) => (
                        <div key={`asm-${i}`} className="p-10 space-y-6 hover:bg-white/[0.02] transition-all">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                              <Award className="w-4 h-4 text-gold" />
                              Career Mapping: {a.roadmapData?.careerTitle}
                            </div>
                            <span className="text-[9px] text-slate-600 font-mono">{new Date(a.timestamp).toLocaleDateString()}</span>
                          </div>
                          <p className="text-slate-400 text-sm font-light leading-relaxed italic line-clamp-2">
                            {a.roadmapData?.description}
                          </p>
                          <Link to="/roadmap" state={{ roadmapData: a.roadmapData }} className="text-[9px] font-bold text-gold uppercase tracking-widest hover:underline inline-flex items-center gap-2">
                            View Deep Roadmap <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                      ))}
                      {data.interviews.map((int: any, i: number) => (
                        <div key={`int-${i}`} className="p-10 space-y-6 hover:bg-white/[0.02] transition-all border-t border-white/5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                              <Star className="w-4 h-4 text-gold" />
                              Interview Simulation
                            </div>
                            <span className="text-[9px] text-slate-600 font-mono">{new Date(int.timestamp).toLocaleDateString()}</span>
                          </div>
                          <div className="p-6 glass rounded-xl border-white/5">
                             <h4 className="text-[9px] font-bold text-gold uppercase tracking-[0.2em] mb-4">Strategic Feedback</h4>
                             <p className="text-slate-300 text-sm font-light leading-relaxed line-clamp-3 italic">
                                {int.feedback}
                             </p>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                   <div className="p-20 text-center space-y-6">
                      <div className="w-20 h-20 glass rounded-full flex items-center justify-center mx-auto border-white/5 opacity-20">
                        <History className="w-10 h-10 text-slate-500" />
                      </div>
                      <p className="text-slate-500 font-light italic text-lg leading-relaxed">No session intelligence logs detected in current trajectory.</p>
                      <Link to="/assessment" className="inline-block text-gold text-[10px] font-bold uppercase tracking-widest border-b border-gold/30 pb-1 hover:border-gold transition-all">Initiate First Assessment</Link>
                   </div>
                 )}
              </div>
           </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
           {latestAssessment && latestAssessment.roadmapData ? (
             <div className="p-10 glass border-white/5 rounded-3xl space-y-8">
               <h3 className="serif text-2xl font-bold italic text-white flex items-center gap-3">
                 <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                 Module Progress
               </h3>
               <div className="space-y-4">
                 {latestAssessment.roadmapData.steps.map((step: any, idx: number) => {
                   const isCompleted = completedSteps.includes(idx);
                   return (
                     <button
                       key={idx}
                       onClick={() => toggleStep(latestAssessment.id, idx, completedSteps)}
                       className={`w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-all ${isCompleted ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'}`}
                     >
                       <div className="mt-1 shrink-0">
                         {isCompleted ? (
                           <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                         ) : (
                           <Circle className="w-4 h-4 text-slate-600" />
                         )}
                       </div>
                       <div>
                         <h4 className={`text-sm font-bold ${isCompleted ? 'text-emerald-500' : 'text-white'}`}>{step.title}</h4>
                         <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">{step.duration}</p>
                       </div>
                     </button>
                   );
                 })}
               </div>
             </div>
           ) : (
             <div className="bg-gold text-black p-10 rounded-3xl space-y-8 shadow-2xl shadow-gold/5 relative overflow-hidden">
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-black/5 blur-3xl rounded-full"></div>
                <h3 className="serif text-2xl font-bold italic">Next Milestone</h3>
                <div className="space-y-6 relative z-10">
                   <div className="p-6 bg-black/5 rounded-2xl border border-black/5">
                      <p className="text-[9px] text-black/50 font-bold uppercase tracking-widest mb-2 italic">Priority Objective</p>
                      <h4 className="font-bold text-lg leading-tight mb-2">Portfolio Mapping</h4>
                      <p className="text-xs text-black/60 leading-relaxed">Structure your strategic artifacts for Principal-level verification.</p>
                   </div>
                   <button className="w-full py-4 bg-black text-white rounded font-bold text-[10px] uppercase tracking-widest hover:opacity-90 transition-all shadow-lg">
                      Execute Milestone
                   </button>
                </div>
             </div>
           )}

           <div className="p-10 glass border-white/5 rounded-3xl space-y-8">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rapid Diagnostics</h3>
              <div className="space-y-2">
                 <Link to="/interview" className="flex items-center justify-between p-4 rounded-xl hover:bg-white/[0.03] transition-all group border border-transparent hover:border-white/5">
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">Practice Session</span>
                    <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-gold group-hover:translate-x-1 transition-all" />
                 </Link>
                 <Link to="/resume" className="flex items-center justify-between p-4 rounded-xl hover:bg-white/[0.03] transition-all group border border-transparent hover:border-white/5">
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">Narrative Align</span>
                    <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-gold group-hover:translate-x-1 transition-all" />
                 </Link>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
