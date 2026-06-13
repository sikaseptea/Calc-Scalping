
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase"; 
import { motion } from "framer-motion";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password) {
      alert("Email dan password harus diisi.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      alert("Registrasi berhasil! Silakan cek email Anda untuk verifikasi.");
    }
  };

  return (
    <main className="min-h-screen bg-[#09090b] text-white flex items-center justify-center relative overflow-hidden p-4">
      {/* Background Decor */}
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/10 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="z-10 w-full max-w-md bg-zinc-900/40 border border-zinc-800 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">Join Us</h1>
          <p className="text-zinc-500 mt-2">Mulai perjalanan trading disiplin Anda</p>
        </div>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-zinc-950/50 border border-zinc-800 p-4 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          />
          <input
            type="password"
            placeholder="Create Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-zinc-950/50 border border-zinc-800 p-4 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          />

          <button
            onClick={handleRegister}
            disabled={loading}
            className={`w-full py-4 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-bold shadow-lg shadow-emerald-600/20 transition-all flex justify-center items-center ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? "Processing..." : "Create Account"}
          </button>
        </div>

        <p className="text-center mt-6 text-zinc-500">
          Sudah punya akun? <a className="text-emerald-400 hover:text-emerald-300 font-medium" href="/login">Login Sekarang</a>
        </p>
      </motion.div>
    </main>
  );
}