
"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence, useSpring } from "framer-motion";
import confetti from "canvas-confetti";

export default function ZenAuroraLandingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [captchaNums, setCaptchaNums] = useState({ a: 0, b: 0 });
  const [userCaptcha, setUserCaptcha] = useState("");

  // --- ANIMASI KURSOR (AWAN CAHAYA) ---
  const springConfig = { damping: 25, stiffness: 120 };
  const cursorX = useSpring(0, springConfig);
  const cursorY = useSpring(0, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };
    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, [cursorX, cursorY]);
  // ------------------------------------

  const generateCaptcha = () => {
    setCaptchaNums({
      a: Math.floor(Math.random() * 9) + 1,
      b: Math.floor(Math.random() * 9) + 1
    });
    setUserCaptcha("");
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleLogin = async () => {
    setErrorMsg("");
    if (parseInt(userCaptcha) !== captchaNums.a + captchaNums.b) {
      setErrorMsg("VERIFIKASI GAGAL");
      generateCaptcha();
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setTimeout(() => {
      setLoading(false);
      if (error) {
        setErrorMsg("AKSES DITOLAK");
        generateCaptcha();
      } else {
        confetti({ particleCount: 50, spread: 60, colors: ['#22d3ee', '#818cf8'] });
        window.location.href = "/calculator";
      }
    }, 1000);
  };

  return (
    <main className="min-h-screen flex items-center justify-center overflow-hidden relative font-sans text-slate-200 bg-[#020617] cursor-none">
      
      {/* 1. CAHAYA AWAN MENGIKUTI KURSOR */}
      <motion.div 
        className="pointer-events-none fixed top-0 left-0 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px] z-[2]"
        style={{ x: cursorX, y: cursorY, translateX: "-50%", translateY: "-50%" }}
      />
      <motion.div 
        className="pointer-events-none fixed top-0 left-0 w-[20px] h-[20px] bg-white/40 rounded-full blur-[4px] z-[50]"
        style={{ x: cursorX, y: cursorY, translateX: "-50%", translateY: "-50%" }}
      />

      {/* 2. ANIMASI AURORA (LAYERING) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="aurora aurora-cyan"></div>
        <div className="aurora aurora-purple"></div>
        <div className="aurora aurora-green"></div>
      </div>

      {/* 3. SILUET GUNUNG */}
      <div className="absolute bottom-0 left-0 w-full z-[1] opacity-40 pointer-events-none">
        <svg viewBox="0 0 1440 320" className="w-full h-auto">
          <path fill="#020617" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,250.7C960,235,1056,181,1152,165.3C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>

      {/* CONTENT */}
      <div className="z-10 text-center space-y-12 p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.5 }}>
          <h1 className="text-5xl md:text-7xl font-thin text-white tracking-[0.5em] uppercase drop-shadow-2xl">
            Sikasep
          </h1>
          <p className="text-cyan-500/60 mt-4 tracking-[0.8em] text-xs font-bold">THE SILENT TRADER</p>
        </motion.div>

        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { setIsModalOpen(true); setErrorMsg(""); }}
          className="relative px-16 py-5 bg-transparent border border-white/10 rounded-full group overflow-hidden transition-all backdrop-blur-sm pointer-events-auto"
        >
          <div className="absolute inset-0 bg-white/5 group-hover:bg-cyan-500/10 transition-colors"></div>
          <span className="relative z-10 text-white font-light tracking-[0.4em] text-sm">Check-In</span>
        </motion.button>
      </div>

      {/* MODAL LOGIN */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.9 }} 
              className="z-50 w-full max-w-md bg-slate-900/40 border border-white/10 p-12 rounded-[3rem] shadow-2xl relative pointer-events-auto"
            >
              <AnimatePresence>{errorMsg && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute -top-10 left-0 right-0 text-center text-red-400 text-[10px] font-black tracking-[0.4em]">
                  🙅‍♂️ {errorMsg}
                </motion.div>
              )}</AnimatePresence>
              <h2 className="text-xl font-light text-center text-white mb-10 tracking-[0.5em]">OTENTIKASI</h2>
              <div className="space-y-6">
                <input type="email" placeholder="USER ID" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-transparent border-b border-white/10 p-3 outline-none focus:border-cyan-500 text-white text-center tracking-widest uppercase text-xs" />
                <input type="password" placeholder="ACCESS KEY" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-transparent border-b border-white/10 p-3 outline-none focus:border-cyan-500 text-white text-center tracking-widest uppercase text-xs" />
                <div className="pt-6 flex flex-col items-center gap-4 text-slate-500 uppercase text-[10px] tracking-widest">
                  <span>Validasi: {captchaNums.a} + {captchaNums.b}</span>
                  <input type="number" value={userCaptcha} onChange={(e) => setUserCaptcha(e.target.value)} className="w-20 bg-slate-800/50 border border-white/10 p-2 rounded-lg text-center text-white outline-none focus:border-cyan-500" />
                </div>
                <button onClick={handleLogin} disabled={loading} className="w-full py-4 bg-white text-slate-950 rounded-full font-bold tracking-[0.3em] text-xs hover:bg-cyan-400 transition-all">
                  {loading ? "PROSES..." : "BUKA AKSES"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .aurora { position: absolute; width: 1000px; height: 1000px; border-radius: 50%; filter: blur(120px); opacity: 0.15; z-index: -1; will-change: transform; }
        .aurora-cyan { background: #22d3ee; top: -30%; left: -10%; animation: drift 20s infinite alternate ease-in-out; }
        .aurora-purple { background: #818cf8; bottom: -20%; right: -10%; animation: drift 25s infinite alternate-reverse ease-in-out; }
        .aurora-green { background: #4ade80; top: 20%; left: 20%; animation: drift 30s infinite alternate ease-in-out; opacity: 0.1; }
        @keyframes drift {
          from { transform: translate(-10%, -10%) rotate(0deg) scale(1); }
          to { transform: translate(10%, 10%) rotate(20deg) scale(1.2); }
        }
      `}</style>
    </main>
  );
}