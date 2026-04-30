'use client';

import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const Pricing = () => {
  return (
    <section id="pricing" className="py-20 md:py-32 px-4 sm:px-6 bg-gradient-to-b from-bg-dark to-bg-card">
      <div className="max-w-5xl mx-auto bg-bg-surface/50 border border-border rounded-[30px] md:rounded-[40px] p-6 sm:p-8 md:p-16 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 md:p-8">
          <div className="bg-accent/20 text-accent text-xs font-bold px-4 py-2 rounded-full border border-accent/30 uppercase tracking-widest">
            Revenue Split Model
          </div>
        </div>
        
        <div className="relative z-10 mt-6 md:mt-0">
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-display font-extrabold mb-6 md:mb-8 tracking-tight">Fair Earnings for <br className="hidden sm:block" />Every <span className="text-primary">Teacher</span></h2>
          
          <div className="space-y-8 md:space-y-10 mt-10 md:mt-16">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-lg sm:text-xl font-bold font-display gap-2 sm:gap-0">
              <span className="text-primary">Teacher পাবেন 70%</span>
              <span className="text-text-secondary">Platform নেবে 30%</span>
            </div>
            
            <div className="h-4 bg-bg-surface rounded-full overflow-hidden flex border border-border">
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: '70%' }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-primary shadow-[0_0_20px_rgba(0,82,204,0.5)]" 
              />
              <motion.div 
                 initial={{ width: 0 }}
                 whileInView={{ width: '30%' }}
                 viewport={{ once: true }}
                 transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                className="h-full bg-bg-card" 
              />
            </div>

            <div className="flex flex-col md:flex-row gap-8 pt-8 items-center justify-between">
              <div className="flex items-center gap-4 p-6 rounded-2xl bg-success/10 border border-success/20">
                <div className="w-10 h-10 rounded-full bg-success flex items-center justify-center text-white">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-success">প্রথম exam টা free!</h4>
                  <p className="text-xs text-text-secondary mt-1">সবাইকে আমাদের সিস্টেম যাচাই করার সুযোগ দিচ্ছি।</p>
                </div>
              </div>
              
              <Link href="/register?role=teacher" className="w-full md:w-auto">
                <Button size="lg" className="w-full md:w-auto bg-primary hover:bg-primary-light text-white rounded-full px-8 md:px-12 h-14 font-bold shadow-xl">
                  Join as a Teacher
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
