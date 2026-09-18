import { useLocation, Link } from "react-router-dom";
import { motion } from "motion/react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { CareerRoadmap } from "../types";
import { CheckCircle2, DollarSign, IndianRupee, Map, ArrowRight, MessageSquare, Download, Loader2, Presentation } from "lucide-react";
import { useState, useEffect } from "react";
import { initAuth, googleSignIn, getAccessToken } from "../lib/firebase";
import { User } from "firebase/auth";

export default function RoadmapPage() {
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportUrl, setExportUrl] = useState<string | null>(null);
  
  useEffect(() => {
    const unsubscribe = initAuth(
      (u) => setUser(u),
      () => setUser(null)
    );
    return () => unsubscribe();
  }, []);

  const roadmap: CareerRoadmap = location.state?.roadmapData || {
    careerTitle: "Strategic Analyst",
    description: "Aligning complex organizational goals with data-driven narratives.",
    steps: [
      { title: "Foundational Insight", description: "Master core analytical frameworks", duration: "2-4 months" },
      { title: "Market Mapping", description: "Develop high-fidelity market intelligence", duration: "6-8 months" },
      { title: "Executive Alignment", description: "Communicate strategic roadmap to stakeholders", duration: "Ongoing" }
    ],
    salaryData: [
      { region: "India", entry: 800000, mid: 2000000, senior: 4500000, currency: "INR" },
      { region: "Global", entry: 95000, mid: 150000, senior: 220000, currency: "USD" }
    ],
    skillsToAcquire: ["Analytical Frameworks", "Stakeholder Synergy", "Systemic Scalability"]
  };

  const handleExport = async () => {
    let token = await getAccessToken();
    if (!user || !token) {
      try {
        const result = await googleSignIn();
        if (result) {
          token = result.accessToken;
          setUser(result.user);
          // Sync user to DB
          await fetch('/api/login', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
          });
        } else {
          return;
        }
      } catch (err) {
        console.error("Login failed", err);
        alert("Authentication failed.");
        return;
      }
    }

    const confirmed = window.confirm("Are you sure you want to create a new Google Slides presentation in your Drive with this career roadmap?");
    if (!confirmed) return;

    setIsExporting(true);
    setExportUrl(null);
    try {
      const response = await fetch('/api/export-slides', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ roadmapData: roadmap })
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to export');
      }
      setExportUrl(data.url);
    } catch (err: any) {
      console.error(err);
      alert("Failed to export to Google Slides.");
    } finally {
      setIsExporting(false);
    }
  };

  const indiaData = roadmap?.salaryData?.filter(d => d.region === 'India') || [];
  const globalData = roadmap?.salaryData?.filter(d => d.region === 'Global') || [];


  return (
    <div className="space-y-12 pb-20">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 glass text-gold rounded-full text-[10px] font-bold border-gold/20 uppercase tracking-[0.2em]">
          Analysis Result: Strategic Match 98%
        </div>
        <h1 className="serif text-5xl md:text-6xl font-bold text-white tracking-tight">
          Trajectory: <span className="italic opacity-50 font-normal">{roadmap.careerTitle}</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-3xl leading-relaxed font-light">
          {roadmap.description}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Roadmap Steps */}
        <div className="lg:col-span-2 space-y-8">
          <section className="glass p-10 rounded-3xl">
            <h2 className="serif text-2xl font-bold flex items-center gap-3 mb-10 text-white italic">
              <Map className="w-6 h-6 text-gold not-italic" />
              Strategic Journey Mapping
            </h2>
            <div className="space-y-10 relative">
              <div className="absolute left-[19px] top-4 bottom-4 w-px bg-white/5 hidden sm:block"></div>
              {roadmap.steps?.map((step, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={idx} 
                  className="flex flex-col sm:flex-row gap-8 relative"
                >
                  <div className={`hidden sm:flex w-10 h-10 glass border rounded-full items-center justify-center text-[10px] font-bold z-10 shrink-0 ${idx === 0 ? 'border-emerald-500 text-emerald-500' : 'border-gold text-gold'}`}>
                    0{idx + 1}
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="serif text-xl font-bold text-white">{step.title}</h3>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-white/5 px-3 py-1 rounded">{step.duration}</span>
                    </div>
                    <p className="text-slate-400 font-light leading-relaxed text-sm">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Salary Trends */}
          <section className="glass p-10 rounded-3xl space-y-10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <h2 className="serif text-2xl font-bold text-white flex items-center gap-3 italic">
                <IndianRupee className="w-6 h-6 text-gold not-italic" />
                Global Market Benchmarks
              </h2>
              <div className="flex gap-6">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                   <div className="w-2 h-2 bg-gold rounded-full"></div> Domestic (INR)
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                   <div className="w-2 h-2 bg-emerald-500 rounded-full"></div> International (USD)
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 h-[350px]">
               <div className="space-y-6">
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <IndianRupee className="w-3 h-3" /> Market: India
                  </h3>
                  <div className="h-full">
                    <ResponsiveContainer width="100%" height="85%">
                      <BarChart data={indiaData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="region" hide />
                        <YAxis tick={{fontSize: 10}} tickFormatter={(val) => `₹${val/100000}L`} stroke="rgba(255,255,255,0.2)" />
                        <Tooltip contentStyle={{backgroundColor: '#111', borderColor: 'rgba(255,255,255,0.1)', fontSize: '10px'}} />
                        <Bar dataKey="entry" fill="#D4AF37" radius={[2, 2, 0, 0]} name="Entry" opacity={0.6} />
                        <Bar dataKey="mid" fill="#D4AF37" radius={[2, 2, 0, 0]} name="Mid" opacity={0.8} />
                        <Bar dataKey="senior" fill="#D4AF37" radius={[2, 2, 0, 0]} name="Senior" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
               </div>
               <div className="space-y-6">
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <DollarSign className="w-3 h-3" /> Global Market
                  </h3>
                  <div className="h-full">
                    <ResponsiveContainer width="100%" height="85%">
                      <BarChart data={globalData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="region" hide />
                        <YAxis tick={{fontSize: 10}} tickFormatter={(val) => `$${val/1000}k`} stroke="rgba(255,255,255,0.2)" />
                        <Tooltip contentStyle={{backgroundColor: '#111', borderColor: 'rgba(255,255,255,0.1)', fontSize: '10px'}} />
                        <Bar dataKey="entry" fill="#10b981" radius={[2, 2, 0, 0]} name="Entry" opacity={0.6} />
                        <Bar dataKey="mid" fill="#10b981" radius={[2, 2, 0, 0]} name="Mid" opacity={0.8} />
                        <Bar dataKey="senior" fill="#10b981" radius={[2, 2, 0, 0]} name="Senior" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
               </div>
            </div>
          </section>
        </div>

        {/* Sidebar info */}
        <div className="space-y-8">
           <div className="glass p-8 rounded-3xl space-y-8">
              <h3 className="serif text-xl font-bold italic text-white">Skills Mapping</h3>
              <div className="space-y-6">
                {roadmap.skillsToAcquire?.map((skill, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold">
                       <span className="text-slate-400">{skill}</span>
                       <span className="text-gold">Verified</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-gold/30" style={{width: '70%'}}></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-4 space-y-4">
                 <Link to="/interview" className="w-full flex items-center justify-between p-5 glass hover:bg-white/[0.05] rounded-2xl transition-all group">
                    <div className="flex items-center gap-4">
                       <MessageSquare className="w-4 h-4 text-gold" />
                       <span className="text-[10px] uppercase tracking-widest font-bold text-white">Mock Interview</span>
                    </div>
                    <ArrowRight className="w-3 h-3 opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                 </Link>
                 <Link to="/resume" className="w-full flex items-center justify-between p-5 glass hover:bg-white/[0.05] rounded-2xl transition-all group">
                    <div className="flex items-center gap-4">
                       <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                       <span className="text-[10px] uppercase tracking-widest font-bold text-white">Resume Sync</span>
                    </div>
                    <ArrowRight className="w-3 h-3 opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                 </Link>
              </div>
           </div>

           <div className="p-10 glass rounded-3xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full"></div>
              <div className="w-12 h-12 glass rounded-xl flex items-center justify-center border-emerald-500/20">
                 <Presentation className="w-5 h-5 text-emerald-500" />
              </div>
              <h4 className="serif text-xl font-bold text-white italic">Trajectory Report</h4>
              <p className="text-sm text-slate-500 leading-relaxed font-light">Generate a Google Slides presentation tailored for your profile.</p>
              
              {exportUrl ? (
                <a href={exportUrl} target="_blank" rel="noreferrer" className="w-full py-4 glass border-emerald-500 text-emerald-500 text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500/10 transition-all block text-center">
                  Open Presentation
                </a>
              ) : (
                <button 
                  onClick={handleExport}
                  disabled={isExporting}
                  className="w-full py-4 glass border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500/5 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {isExporting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                  ) : (
                    "Export to Google Slides"
                  )}
                </button>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
