'use client';

import { FeatureCard } from './FeatureCard';
import { Clock, BarChart3, CreditCard, Trophy, ShieldCheck, FileText, ArrowRight, BookOpen, Target, TrendingUp, Library, Sparkles, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';

export const Features = () => {
  return (
    <section id="features" className="py-24 md:py-32 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-bg-dark z-0" />
      <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-[40%] -left-[10%] w-[500px] h-[500px] bg-accent/5 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 md:mb-20 gap-8">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-white/80 tracking-wide">Modern Capabilities</span>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-display font-extrabold mb-4 tracking-tight text-white"
            >
              Powerful Features
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-text-secondary text-lg font-light"
            >
              Some special features of our platform built with modern technology
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Link href="/features">
              <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-sm text-white rounded-full px-8 h-12 font-medium group transition-all duration-300 hover:border-primary/50">
                View all features
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          <FeatureCard 
            icon={Clock} 
            title="Real-time Environment" 
            desc="Assess yourself with live timers and a real-time exam environment." 
            delay={0.1}
          />
          <FeatureCard 
            icon={BarChart3} 
            title="Instant Analytics" 
            desc="Get detailed results and analytics reports as soon as the exam ends." 
            delay={0.2}
          />
          <FeatureCard 
            icon={CreditCard} 
            title="bKash / Nagad" 
            desc="Easily complete payment via bKash or Nagad to start the exam." 
            delay={0.3}
          />
          <FeatureCard 
            icon={Trophy} 
            title="Leaderboard Ranking" 
            desc="Check your position against other candidates on the leaderboard after each exam." 
            delay={0.4}
          />
          <FeatureCard 
            icon={ShieldCheck} 
            title="Free First Exam" 
            desc="Verify our platform by taking your first exam for free before any subscription." 
            delay={0.5}
          />
          <FeatureCard 
            icon={FileText} 
            title="Detailed Report" 
            desc="Get detailed reports with explanations for right and wrong answers to every question." 
            delay={0.6}
          />
          <FeatureCard 
            icon={BookOpen} 
            title="Subject-wise Leaderboard" 
            desc="Compete in specific subjects and see your ranking across the platform." 
            delay={0.7}
          />
          <FeatureCard 
            icon={Target} 
            title="Model Tests" 
            desc="Take comprehensive model tests to prepare for the final exams." 
            delay={0.8}
          />
          <FeatureCard 
            icon={TrendingUp} 
            title="Performance Tracking" 
            desc="Track your progress over time with interactive and detailed charts." 
            delay={0.9}
          />
          <FeatureCard 
            icon={Library} 
            title="Teacher Question Banks" 
            desc="Teachers can easily create, manage, and share structured question banks for their students." 
            delay={1.0}
          />
          <FeatureCard 
            icon={ShieldAlert} 
            title="Anti-Cheating System" 
            desc="Advanced monitoring to prevent tab switching, copy-pasting, and unfair means during exams." 
            delay={1.1}
          />
        </div>
      </div>
    </section>
  );
};
