'use client';

import { motion } from 'framer-motion';
import { GraduationCap, Sparkles, Zap, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface AuthLayoutProps {
  children: React.ReactNode;
  tagline: string;
}

export const AuthLayout = ({ children, tagline }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen w-full flex overflow-hidden bg-[#0A0A0B] relative">
      {/* Back Button */}
      <Link 
        href="/"
        className="fixed top-8 left-8 z-50 group flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xl text-white hover:bg-white/10 transition-all shadow-xl active:scale-95"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-xs font-black uppercase tracking-widest">Back</span>
      </Link>
      {/* Left Panel - Branding (45%) */}
      <div className="hidden lg:flex w-[45%] relative overflow-hidden items-center justify-center border-r border-white/5 bg-[#0D0D0E]">
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
              opacity: [0.15, 0.25, 0.15]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-20%] left-[-20%] w-[100%] h-[100%] bg-gradient-to-br from-primary via-transparent to-accent blur-[120px] rounded-full"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, -90, 0],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-gradient-to-tr from-accent via-transparent to-primary blur-[100px] rounded-full"
          />
        </div>

        {/* Floating Glass Widgets */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 15, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-12 w-40 h-40 rounded-[40px] bg-white/[0.03] border border-white/10 backdrop-blur-2xl shadow-2xl flex items-center justify-center"
        >
          <Zap className="w-12 h-12 text-primary/40" />
        </motion.div>

        <motion.div
          animate={{ y: [0, 30, 0], rotate: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-40 right-10 w-32 h-32 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-2xl shadow-2xl flex items-center justify-center"
        >
          <Sparkles className="w-10 h-10 text-accent/40" />
        </motion.div>

        <div className="relative z-10 text-center px-12">
          <Link href="/" className="flex flex-col items-center gap-8 group">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-28 h-28 rounded-[36px] bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-[0_25px_50px_rgba(0,82,204,0.4)] transition-all relative"
            >
              <div className="absolute inset-0 bg-white/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              <GraduationCap className="text-white w-16 h-16 relative z-10" />
            </motion.div>
            <div className="space-y-4">
              <h1 className="text-6xl font-display font-black tracking-tight text-white leading-none">
                Poly<span className="text-primary">Exam</span><br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Buzz</span>
              </h1>
              <p className="text-xl font-medium text-text-secondary max-w-xs mx-auto leading-relaxed opacity-70">
                {tagline}
              </p>
            </div>
          </Link>
          <div className="mt-12 flex flex-col items-center">
            <p className="text-text-secondary/60 text-sm mb-4 font-medium uppercase tracking-widest">Are you an educator?</p>
            <Link href="/join-teacher">
              <motion.div
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-3xl hover:bg-primary/10 hover:border-primary/30 transition-all group shadow-2xl"
              >
                <span className="font-black text-white uppercase tracking-tighter">Join as a Teacher</span>
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary transition-colors">
                  <ArrowRight className="w-4 h-4 text-primary group-hover:text-white transition-all" />
                </div>
              </motion.div>
            </Link>
          </div>
        </div>
      </div>

      {/* Right Panel - Form (55%) */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-6 md:p-12 bg-[#0A0A0B] relative overflow-hidden">
        {/* Subtle background texture for right panel */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-lg relative z-10"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
};
