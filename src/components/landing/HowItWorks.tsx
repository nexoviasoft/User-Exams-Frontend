'use client';

import { Step } from './Step';
import { Database, Wallet, CheckCircle2 } from 'lucide-react';

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 md:py-32 px-4 sm:px-6 bg-bg-card/30 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-20">
          <h2 className="text-3xl md:text-5xl font-display font-extrabold mb-3 md:mb-4 tracking-tight">How it works</h2>
          <p className="text-text-secondary max-w-2xl mx-auto text-sm md:text-base">সহজ তিনটি ধাপে শুরু করুন আপনার পরীক্ষা যাত্রা</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16 relative">
          {/* Dashed Connector Line */}
          <div className="hidden md:block absolute top-[18%] left-[20%] right-[20%] h-[2px] border-t-2 border-dashed border-border z-0" />
          
          <Step 
            number="01" 
            icon={Database} 
            title="Create Exam" 
            desc="Teacher creates QuestionBank and sets up the exam schedule." 
            delay={0.1}
          />
          <Step 
            number="02" 
            icon={Wallet} 
            title="Student Pays" 
            desc="Student pays via bKash/Nagad to unlock the exam session." 
            delay={0.2}
          />
          <Step 
            number="03" 
            icon={CheckCircle2} 
            title="Get Results" 
            desc="Student gives exam and receives instant performance report." 
            delay={0.3}
          />
        </div>
      </div>
    </section>
  );
};
