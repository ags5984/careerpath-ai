import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import { SpeedInsights } from "@vercel/speed-insights/react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import AssessmentPage from "./pages/AssessmentPage";
import RoadmapPage from "./pages/RoadmapPage";
import InterviewPage from "./pages/InterviewPage";
import ResumePage from "./pages/ResumePage";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-12 h-12 bg-indigo-500 rounded-full mb-4"></div>
        <div className="h-4 w-32 bg-slate-200 rounded"></div>
      </div>
    </div>
  );

  return (
    <Router>
      <div className="min-h-screen bg-dark font-sans text-slate-200">
        <Navbar user={user} />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/assessment" element={<AssessmentPage />} />
            <Route path="/roadmap" element={<RoadmapPage />} />
            <Route path="/interview" element={user ? <InterviewPage /> : <Home />} />
            <Route path="/resume" element={user ? <ResumePage /> : <Home />} />
            <Route path="/dashboard" element={user ? <Dashboard /> : <Home />} />
          </Routes>
        </main>
        <SpeedInsights />
      </div>
    </Router>
  );
}
