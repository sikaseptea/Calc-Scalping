"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";
import { LogIn, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Login Berhasil!");
      router.push("/actual");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Toaster theme="dark" position="top-center" richColors />
      <div className="w-full max-w-md bg-zinc-900/50 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl shadow-2xl">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">Terminal Pro</h1>
          <p className="text-zinc-500 text-[10px] font-bold tracking-[0.3em] mt-2">SECURE ACCESS SYSTEM</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 ml-2 uppercase tracking-widest">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-green-500 transition-colors" size={18} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-black border border-white/5 rounded-2xl p-4 pl-12 text-white outline-none focus:border-green-500/50 transition-all" placeholder="your@email.com" required />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 ml-2 uppercase tracking-widest">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-green-500 transition-colors" size={18} />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black border border-white/5 rounded-2xl p-4 pl-12 text-white outline-none focus:border-green-500/50 transition-all" placeholder="••••••••" required />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full h-[60px] bg-green-500 text-black rounded-2xl font-black mt-6 hover:bg-green-400 transition-all flex items-center justify-center gap-3 shadow-lg shadow-green-500/20 active:scale-95">
            {loading ? "AUTHENTICATING..." : <><LogIn size={20}/> START SESSION</>}
          </button>
        </form>
        <p className="text-center text-[10px] text-zinc-600 font-bold mt-8 tracking-widest uppercase italic">Authorized Personnel Only</p>
      </div>
    </div>
  );
}
