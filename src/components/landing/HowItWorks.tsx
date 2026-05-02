'use client';

import { Step } from './Step';
import { Wallet, Trophy, UserPlus, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 md:py-32 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-bg-dark z-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-bg-dark z-0" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 md:mb-24 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6"
          >
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-white/80 tracking-wide">Simple Process</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-display font-extrabold mb-6 tracking-tight"
          >
            <span className="text-white">How it works</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-text-secondary max-w-2xl mx-auto text-lg md:text-xl font-light"
          >
            Start your exam journey in three easy steps.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
          {/* Animated Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-[45%] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-y-1/2 z-0" />
          
          <Step 
            number="01" 
            icon={UserPlus} 
            title="Register & Select Goal" 
            desc="Create your account and choose your target (e.g., DUET Admission, Job Prep)." 
            delay={0.1}
          />
          <Step 
            number="02" 
            icon={Wallet} 
            title="Choose Exam & Pay" 
            desc="Select subjects or model tests specific to your goal and complete payment." 
            delay={0.2}
          />
          <Step 
            number="03" 
            icon={Trophy} 
            title="Participate & Track" 
            desc="Give exams, get instant analytics, and track your leaderboard ranking." 
            delay={0.3}
          />
        </div>
      </div>
    </section>
  );
};
