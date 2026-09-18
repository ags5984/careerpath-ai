import { Link } from "react-router-dom";
import { auth } from "../lib/firebase";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { LayoutDashboard, Compass, MessageSquare, FileText, LogIn, LogOut } from "lucide-react";

export default function Navbar({ user }: { user: any }) {
  const login = () => signInWithPopup(auth, new GoogleAuthProvider());
  const logout = () => signOut(auth);

  return (
    <nav className="border-b border-border-subtle glass sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gold rounded flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-black rotate-45"></div>
          </div>
          <span className="serif text-xl font-bold tracking-tight text-white">CareerPulse<span className="text-gold">.</span></span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-[10px] uppercase tracking-widest font-semibold opacity-70">
          <Link to="/assessment" className="hover:text-gold transition-colors">
            Assessment
          </Link>
          <Link to="/interview" className="hover:text-gold transition-colors">
            Mock Interview
          </Link>
          <Link to="/resume" className="hover:text-gold transition-colors">
            Optimizer
          </Link>
          <Link to="/dashboard" className="hover:text-gold transition-colors">
            Dashboard
          </Link>
        </div>

        <div>
          {user ? (
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-white">{user.displayName}</div>
                <div className="text-[10px] opacity-50">Member Since {new Date(user.metadata.creationTime).getFullYear()}</div>
              </div>
              <div className="w-10 h-10 rounded-full glass flex items-center justify-center border border-gold/30">
                <img src={user.photoURL} alt={user.displayName} className="w-8 h-8 rounded-full" />
              </div>
              <button onClick={logout} className="text-slate-400 hover:text-gold transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button onClick={login} className="bg-gold text-black px-6 py-2 rounded text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-gold/10 hover:bg-gold/90 transition-all flex items-center gap-2">
              <LogIn className="w-3 h-3" />
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
