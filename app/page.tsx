
"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#09090b] text-white flex items-center justify-center overflow-hidden relative">
      {/* 1. Animasi Detak Jantung (SVG Path) */}
      <div className="absolute inset-0 z-0 opacity-20">
        <svg className="w-full h-full" viewBox="0 0 1000 100" preserveAspectRatio="none">
          <motion.path
            d="M0,50 L200,50 L220,20 L240,80 L260,50 L500,50 L520,10 L540,90 L560,50 L800,50 L820,30 L840,70 L860,50 L1000,50"
            fill="transparent"
            stroke="#3b82f6"
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: [0, 1, 1], 
              opacity: [0, 1, 0],
              x: [0, 10, 0] 
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          />
        </svg>
      </div>

      {/* 2. Efek Cahaya Latar Belakang */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />

      {/* 3. Main Panel */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="z-10 text-center p-8 bg-zinc-900/60 border border-zinc-800 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-lg w-full mx-4"
      >
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 via-emerald-400 to-purple-500 bg-clip-text text-transparent mb-2">
            Analisa Calculator Report
          </h1>
          <div className="h-1 w-20 bg-blue-500 mx-auto rounded-full mb-6" />
        </motion.div>

        <p className="text-zinc-400 text-lg font-light tracking-wide mb-8">
          Trading Risk Manager <br />
          <span className="text-zinc-500 text-sm italic">By Sikasep Ado</span>
        </p>

        {/* Tombol Login & Register */}
        <div className="grid grid-cols-2 gap-4 mt-8">
          <Link href="/login">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20"
            >
              Login
            </motion.button>
          </Link>
          
          <Link href="/register">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl font-bold transition-all shadow-lg"
            >
              Register
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </main>
  );
}