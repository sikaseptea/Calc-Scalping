
"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LoginAnnouncementPage() {
  return (
    <main className="min-h-screen flex items-center justify-center overflow-hidden relative font-sans text-slate-200 bg-[#020617]">
      
      {/* BACKGROUND AURORA TENANG */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="aurora aurora-1"></div>
        <div className="aurora aurora-2"></div>
        <div className="absolute inset-0 bg-[#020617]/60 backdrop-blur-[100px]"></div>
      </div>

      {/* CARD PENGUMUMAN */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="z-10 text-center p-12 bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[3rem] shadow-2xl max-w-md w-full mx-4"
      >
        <div className="mb-8 flex justify-center">
          <motion.span 
            animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-7xl"
          >
            📢
          </motion.span>
        </div>

        <h1 className="text-3xl font-black text-white tracking-widest uppercase mb-4">
          PENGUMUMAN
        </h1>
        
        <div className="h-1 w-20 bg-cyan-500 mx-auto rounded-full mb-6"></div>

        <p className="text-slate-400 leading-relaxed mb-10 font-medium">
          Akses login mandiri telah dinonaktifkan. <br />
          Silakan masuk melalui <span className="text-cyan-400 font-bold">Portal Utama</span> di halaman depan untuk pengalaman yang lebih aman.
        </p>

        <Link href="/">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-black tracking-widest transition-all shadow-lg shadow-cyan-900/40"
          >
            KEMBALI KE BERANDA
          </motion.button>
        </Link>
      </motion.div>

      <style jsx>{`
        .aurora {
          position: absolute;
          width: 800px;
          height: 800px;
          border-radius: 50%;
          filter: blur(150px);
          opacity: 0.2;
          z-index: -1;
        }
        .aurora-1 {
          background: #0ea5e9;
          top: -20%;
          left: -10%;
          animation: drift 15s infinite alternate ease-in-out;
        }
        .aurora-2 {
          background: #6366f1;
          bottom: -20%;
          right: -10%;
          animation: drift 20s infinite alternate-reverse ease-in-out;
        }
        @keyframes drift {
          from { transform: translate(0, 0) scale(1); }
          to { transform: translate(100px, 100px) scale(1.2); }
        }
      `}</style>
    </main>
  );
}