import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, Sparkles, TrendingUp, UserCheck, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center space-y-8 pt-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 glass text-gold rounded-full text-[10px] font-bold uppercase tracking-widest border-gold/20">
            <Sparkles className="w-3 h-3" />
            AI-Powered Career Intelligence
          </div>
          <h1 className="serif text-6xl md:text-8xl font-bold tracking-tight text-white max-w-5xl mx-auto leading-tight">
            Design Your Future with <span className="italic opacity-50 font-normal">Clarity.</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
            Get personalized career suggestions, detailed roadmaps, and salary trends based on real industry data. Assessment to action in minutes.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-6"
        >
          <Link to="/assessment" className="bg-gold text-black px-10 py-4 rounded font-bold text-xs uppercase tracking-widest hover:bg-gold/90 transition-all flex items-center gap-2 shadow-xl shadow-gold/5">
            Start Free Assessment
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/interview" className="glass text-white px-10 py-4 rounded font-bold text-xs uppercase tracking-widest hover:bg-white/5 transition-all">
            Practice Interview
          </Link>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureCard 
          icon={<TrendingUp className="w-5 h-5 text-gold" />}
          title="Salary Intelligence"
          description="Compare domestic (INR) and global (USD) market trends for accurate expectations."
        />
        <FeatureCard 
          icon={<UserCheck className="w-5 h-5 text-gold" />}
          title="AI Mock Interview"
          description="Practice with an AI coach that adapts to your target role and gives real feedback."
        />
        <FeatureCard 
          icon={<ShieldCheck className="w-5 h-5 text-gold" />}
          title="Resume Optimizer"
          description="Instantly tailor your CV to specific job descriptions with AI-driven suggestions."
        />
      </section>

      {/* Stats Section */}
      <section className="glass rounded-3xl p-12 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-[100px] rounded-full"></div>
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="serif text-4xl font-bold italic">Real Industry Data<span className="text-gold font-normal not-italic text-2xl ml-2">.</span></h2>
            <p className="text-slate-400 text-lg font-light leading-relaxed">
              We analyze thousands of data points across global job markets to provide accuracy in salary trends, required skillsets, and career progression paths.
            </p>
            <div className="grid grid-cols-2 gap-8 pt-4">
              <div>
                <div className="serif text-4xl font-bold text-gold">500+</div>
                <div className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mt-2">Career Paths</div>
              </div>
              <div>
                <div className="serif text-4xl font-bold text-white">10k+</div>
                <div className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mt-2">Data Points</div>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="relative border border-white/5 bg-white/[0.02] p-8 rounded-2xl backdrop-blur-2xl">
               <div className="space-y-4">
                  <div className="h-1.5 w-1/2 bg-white/10 rounded-full"></div>
                  <div className="h-1.5 w-3/4 bg-white/10 rounded-full"></div>
                  <div className="h-1.5 w-1/4 bg-white/10 rounded-full"></div>
                  <div className="pt-6 flex gap-4">
                    <div className="w-10 h-10 glass rounded flex items-center justify-center">
                       <div className="w-4 h-4 bg-gold/20 border border-gold/40 rounded-sm"></div>
                    </div>
                    <div className="w-10 h-10 glass rounded flex items-center justify-center">
                       <div className="w-4 h-4 bg-emerald-500/20 border border-emerald-500/40 rounded-sm"></div>
                    </div>
                    <div className="w-10 h-10 glass rounded flex items-center justify-center">
                       <div className="w-4 h-4 bg-white/20 border border-white/40 rounded-sm"></div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 glass rounded-2xl hover:border-gold/30 hover:bg-white/[0.05] transition-all group">
      <div className="w-10 h-10 glass rounded flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border-white/10">
        {icon}
      </div>
      <h3 className="serif text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-slate-400 text-sm font-light leading-relaxed">{description}</p>
    </div>
  );
}
