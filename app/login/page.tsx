"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase"; // Pastikan path ini sesuai dengan file konfigurasi supabase Anda
import { motion } from "framer-motion";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Harap isi email dan password.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      // Redirect ke dashboard atau home setelah berhasil login
      window.location.href = "/calculator";
    }
  };

  return (
    <main className="min-h-screen bg-[#09090b] text-white flex items-center justify-center relative overflow-hidden p-4">
      {/* Efek Cahaya Latar Belakang */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full"></div>

      <motion.div 
        initial={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        className="z-10 w-full max-w-md bg-zinc-900/40 border border-zinc-800 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-zinc-500 mt-2">Masuk untuk mengelola risiko trading Anda</p>
        </div>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-zinc-950/50 border border-zinc-800 p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-zinc-950/50 border border-zinc-800 p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />

          {/* Bagian Captcha Telah Dihapus Sesuai Permintaan */}

          <button
            onClick={handleLogin}
            disabled={loading}
            className={`w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold shadow-lg shadow-blue-600/20 transition-all flex justify-center items-center ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </div>

        <p className="text-center mt-6 text-zinc-500">
          Belum punya akun?{" "}
          <Link className="text-blue-400 hover:text-blue-300 font-medium" href="/register">
            Buat Akun
          </Link>
        </p>
      </motion.div>
    </main>
  );
}