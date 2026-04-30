'use client';

import { FeatureCard } from './FeatureCard';
import { Clock, BarChart3, CreditCard, Trophy, ShieldCheck, FileText, ArrowRight, BookOpen, Target, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const Features = () => {
  return (
    <section id="features" className="py-20 md:py-32 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 md:mb-16 gap-4 md:gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-display font-extrabold mb-3 md:mb-4 tracking-tight">Powerful Features</h2>
            <p className="text-text-secondary">Some special features of our platform built with modern technology</p>
          </div>
          <Link href="/features">
            <Button variant="ghost" className="text-primary font-bold group">
              View all features
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
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
        </div>
      </div>
    </section>
  );
};
