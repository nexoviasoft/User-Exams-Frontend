'use client';

import { motion } from 'framer-motion';
import { ChevronRight, BookOpen, Trophy, Sparkles, Play, Users, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { StatCounter } from './StatCounter';

export const Hero = () => {
  return (
    <section className="relative pt-32 md:pt-48 pb-20 md:pb-32 px-4 sm:px-6 overflow-hidden min-h-screen flex flex-col justify-center">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-bg-dark z-0" />
      <div className="absolute inset-0 z-0 opacity-30"
        style={{ 
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)',
          backgroundSize: '48px 48px'
        }} 
      />
      
      {/* Aurora / Glowing Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[600px] bg-primary/20 blur-[120px] rounded-full opacity-50 mix-blend-screen pointer-events-none -z-10 animate-pulse duration-[8000ms]" />
      <div className="absolute -top-40 right-[-10%] w-[500px] h-[500px] bg-accent/20 blur-[150px] rounded-full opacity-40 mix-blend-screen pointer-events-none -z-10" />
      <div className="absolute top-[40%] left-[-10%] w-[400px] h-[400px] bg-[#8B5CF6]/20 blur-[150px] rounded-full opacity-30 mix-blend-screen pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 md:gap-20 items-center relative z-10 w-full">
        {/* Left Content Column */}
        <div className="flex flex-col items-start text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
          >
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-white/80 tracking-wide">পলিটেকনিক ভর্তি প্রস্তুতির নতুন দিগন্ত</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="text-5xl sm:text-7xl md:text-[5.5rem] font-display font-extrabold tracking-tight mb-6 leading-[1.1]"
          >
            <span className="text-white drop-shadow-sm">Poly</span> <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-light to-accent">
              ExamBuzz
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="text-lg sm:text-xl text-text-secondary max-w-xl mb-10 leading-relaxed font-light"
          >
            পলিটেকনিক ভর্তি পরীক্ষায় সেরা ফলাফলের জন্য সঠিক প্রস্তুতি নাও। অধ্যায়ভিত্তিক মডেল টেস্ট, পূর্ববর্তী প্রশ্নপত্র বিশ্লেষণ এবং তাৎক্ষণিক ফলাফলের মাধ্যমে নিজেকে প্রস্তুত করো।
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto"
          >
            <Link href="/register?role=student" className="w-full sm:w-auto">
              <Button size="lg" className="w-full relative overflow-hidden bg-primary hover:bg-primary-light text-white rounded-2xl px-8 h-14 text-base sm:text-lg font-semibold group shadow-[0_0_40px_rgba(0,82,204,0.4)] transition-all duration-300 hover:shadow-[0_0_60px_rgba(0,82,204,0.6)] hover:-translate-y-1 border-0">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                <span className="relative flex items-center justify-center gap-2">
                  ভর্তি প্রস্তুতি শুরু করো
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </Link>
            <Link href="/join-teacher" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-sm text-white rounded-2xl px-8 h-14 text-base sm:text-lg font-medium transition-all duration-300 hover:-translate-y-1">
                শিক্ষক হিসেবে যোগ দাও
              </Button>
            </Link>
          </motion.div>
          
          {/* User Avatars */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-12 flex items-center gap-4"
          >
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-bg-dark bg-gradient-to-br from-bg-surface to-border flex items-center justify-center overflow-hidden">
                   <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}&backgroundColor=transparent`} alt="avatar" className="w-full h-full object-cover opacity-80" />
                </div>
              ))}
            </div>
            <div className="text-sm">
              <div className="flex items-center gap-1 text-warning mb-0.5">
                {[1,2,3,4,5].map(i => <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
              </div>
              <span className="text-text-secondary font-medium"><strong className="text-white">১৫,০০০+</strong> শিক্ষার্থী যুক্ত হয়েছে</span>
            </div>
          </motion.div>
        </div>

        {/* Right Content Column - Modern Mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotateX: 15, rotateY: -15 }}
          animate={{ opacity: 1, scale: 1, rotateX: 0, rotateY: 0 }}
          transition={{ duration: 1, delay: 0.2, type: "spring" as const, stiffness: 100 }}
          style={{ perspective: 1000 }}
          className="hidden lg:flex justify-center items-center relative"
        >
          {/* Main Floating Glass Card */}
          <motion.div
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="w-full max-w-[500px] bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(255,255,255,0.05)] relative overflow-hidden"
          >
            {/* Card inner glow */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            
            {/* Header */}
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white shadow-lg shadow-primary/30">
                  <Play className="w-6 h-6 ml-1" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Live Physics Model Test</h3>
                  <p className="text-text-secondary text-sm">Chapter 4: Work, Energy & Power</p>
                </div>
              </div>
              <div className="px-3 py-1.5 rounded-full bg-success/10 border border-success/20 text-success text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                Live
              </div>
            </div>

            {/* Progress/Question Indicator */}
            <div className="space-y-3 mb-8 relative z-10">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-text-secondary">Progress</span>
                <span className="text-primary font-bold">65%</span>
              </div>
              <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '65%' }}
                  transition={{ duration: 1.5, delay: 1 }}
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full" 
                />
              </div>
            </div>

            {/* Simulated Question */}
            <div className="p-5 rounded-2xl bg-black/20 border border-white/5 mb-6 relative z-10">
              <div className="h-4 bg-white/10 rounded w-5/6 mb-3" />
              <div className="h-4 bg-white/10 rounded w-4/6" />
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-4 relative z-10">
              {[
                { active: false, delay: 0 },
                { active: true, delay: 0.1 },
                { active: false, delay: 0.2 },
                { active: false, delay: 0.3 }
              ].map((opt, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + opt.delay }}
                  className={`h-14 rounded-xl flex items-center px-4 border transition-colors ${opt.active ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(0,82,204,0.2)]' : 'bg-black/20 border-white/5'}`}
                >
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${opt.active ? 'border-primary bg-primary' : 'border-white/20'}`}>
                    {opt.active && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <div className={`h-3 rounded w-1/2 ${opt.active ? 'bg-primary/80' : 'bg-white/10'}`} />
                </motion.div>
              ))}
            </div>

            {/* Floating Elements (Widgets) */}
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -right-6 top-1/4 p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl flex items-center gap-3 z-20"
            >
              <div className="p-2 rounded-lg bg-accent/20 text-accent">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <p className="text-white text-sm font-bold">Top 5%</p>
                <p className="text-white/60 text-xs">Current Rank</p>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="absolute -left-8 bottom-1/4 p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl flex items-center gap-3 z-20"
            >
              <div className="p-2 rounded-lg bg-primary/20 text-primary-light">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-white text-sm font-bold">Analytics</p>
                <p className="text-white/60 text-xs">Updated Live</p>
              </div>
            </motion.div>
          </motion.div>
          
          {/* Ambient Glow behind card */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-primary/30 to-accent/20 blur-[80px] -z-10 rounded-full" />
        </motion.div>
      </div>

      {/* Stats Row - Modernized */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-6xl mx-auto mt-24 md:mt-32 relative z-10 w-full"
      >
        <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 relative z-10 p-8 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl shadow-2xl">
          <StatCounter value={200} label="অভিজ্ঞ শিক্ষক" suffix="+" icon={<Users className="w-6 h-6 text-primary mb-3" />} />
          <StatCounter value={15000} label="শিক্ষার্থী" suffix="+" icon={<Users className="w-6 h-6 text-accent mb-3" />} />
          <StatCounter value={500} label="মডেল টেস্ট" suffix="+" icon={<BookOpen className="w-6 h-6 text-success mb-3" />} />
          <StatCounter value={80000} label="পরীক্ষা সম্পন্ন" suffix="+" icon={<Trophy className="w-6 h-6 text-warning mb-3" />} />
        </div>
      </motion.div>
    </section>
  );
};
