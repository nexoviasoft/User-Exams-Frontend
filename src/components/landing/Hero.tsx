'use client';

import { motion } from 'framer-motion';
import { ChevronRight, BookOpen, Trophy, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { StatCounter } from './StatCounter';

export const Hero = () => {
  return (
    <section className="relative pt-32 md:pt-40 pb-16 md:pb-20 px-4 sm:px-6 overflow-hidden">
      {/* CSS Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-20"
        style={{ backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-bg-dark/50 to-bg-dark" />

      {/* Decorative Blobs */}
      <div className="absolute top-[20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[120px] -z-10" />

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 md:gap-16 items-center relative z-10">
        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-accent font-display font-bold text-lg mb-4 flex items-center gap-2"
          >
            <span className="w-12 h-[2px] bg-accent" />
            পলিটেকনিক ভর্তি প্রস্তুতির জন্য
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-8xl font-display font-extrabold tracking-tight mb-4 md:mb-6 leading-[1.05]"
          >
            Poly <br />
            <span className="text-primary italic">ExamBuzz</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl md:text-2xl text-text-secondary max-w-xl mb-8 md:mb-12 leading-relaxed"
          >
            পলিটেকনিক ভর্তি পরীক্ষায় সেরা ফলাফলের জন্য সঠিক প্রস্তুতি নাও। অধ্যায়ভিত্তিক মডেল টেস্ট, পূর্ববর্তী প্রশ্নপত্র বিশ্লেষণ এবং তাৎক্ষণিক ফলাফলের মাধ্যমে নিজেকে প্রস্তুত করো।
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <Link href="/register?role=student">
              <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary-light text-white rounded-full px-8 sm:px-10 h-14 text-base sm:text-lg font-bold group shadow-[0_10px_20px_rgba(0,82,204,0.3)]">
                ভর্তি প্রস্তুতি শুরু করো
                <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/join-teacher">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-border hover:bg-bg-surface text-text-primary rounded-full px-8 sm:px-10 h-14 text-base sm:text-lg font-bold">
                শিক্ষক হিসেবে যোগ দাও
              </Button>
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="hidden lg:flex justify-center items-center"
        >
          {/* Animated Exam Card Mockup */}
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-[450px] bg-bg-card border-2 border-border p-8 rounded-[40px] shadow-[0_40px_80px_rgba(0,0,0,0.5)] relative"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="px-4 py-1.5 rounded-full bg-success/10 text-success text-xs font-bold uppercase tracking-wider">
                Live Exam
              </div>
            </div>

            <div className="space-y-6">
              <div className="h-4 bg-bg-surface rounded-full w-3/4" />
              <div className="h-4 bg-bg-surface rounded-full w-full opacity-60" />
              <div className="h-4 bg-bg-surface rounded-full w-1/2 opacity-40" />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-12">
              <div className="h-14 rounded-2xl border border-border bg-bg-surface/50" />
              <div className="h-14 rounded-2xl border border-border bg-bg-surface/50" />
              <div className="h-14 rounded-2xl border border-primary bg-primary/10" />
              <div className="h-14 rounded-2xl border border-border bg-bg-surface/50" />
            </div>

            <div className="mt-10 flex items-center justify-between">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-bg-card bg-bg-surface" />)}
                <div className="w-8 h-8 rounded-full border-2 border-bg-card bg-primary flex items-center justify-center text-[10px] font-bold">+12</div>
              </div>
              <div className="text-text-secondary text-sm font-medium">১২৪ জন পরীক্ষার্থী যোগ দিয়েছে</div>
            </div>

            {/* Floating elements */}
            <motion.div
              animate={{ y: [0, 10, 0], x: [0, 10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-10 -right-10 p-4 rounded-2xl bg-accent border border-accent-light shadow-xl"
            >
              <Trophy className="text-white w-6 h-6" />
            </motion.div>
            <motion.div
              animate={{ y: [0, -15, 0], x: [0, -5, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute bottom-10 -left-16 p-4 rounded-2xl bg-bg-surface border border-border shadow-xl flex items-center gap-3"
            >
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs font-bold text-text-primary whitespace-nowrap">Instant Result</span>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Stats Row */}
      <div className="max-w-7xl mx-auto mt-20 md:mt-32 relative z-10 border-t border-border/50 pt-10 md:pt-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <StatCounter value={200} label="শিক্ষক" suffix="+" />
          <StatCounter value={15000} label="শিক্ষার্থী" suffix="+" />
          <StatCounter value={80000} label="পরীক্ষা দেওয়া হয়েছে" suffix="+" />
        </div>
      </div>
    </section>
  );
};
