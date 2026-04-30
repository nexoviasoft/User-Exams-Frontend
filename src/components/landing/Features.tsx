'use client';

import { FeatureCard } from './FeatureCard';
import { Database, BarChart3, CreditCard, TrendingUp, ShieldCheck, FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const Features = () => {
  return (
    <section id="features" className="py-20 md:py-32 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 md:mb-16 gap-4 md:gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-display font-extrabold mb-3 md:mb-4 tracking-tight">Powerful Features</h2>
            <p className="text-text-secondary">আধুনিক প্রযুক্তির সমন্বয়ে তৈরি আমাদের প্ল্যাটফর্মের বিশেষ কিছু ফিচার</p>
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
            icon={Database} 
            title="MCQ Question Bank" 
            desc="সহজেই হাজার হাজার প্রশ্ন যুক্ত করুন এবং সেগুলো বিভিন্ন পরীক্ষায় ব্যবহার করুন।" 
            delay={0.1}
          />
          <FeatureCard 
            icon={BarChart3} 
            title="Instant Analytics" 
            desc="পরীক্ষা শেষ হওয়া মাত্রই ডিটেইলড রেজাল্ট এবং অ্যানালিটিক্স রিপোর্ট পান।" 
            delay={0.2}
          />
          <FeatureCard 
            icon={CreditCard} 
            title="bKash / Nagad" 
            desc="বিকাশ বা নগদের মাধ্যমে খুব সহজেই পেমেন্ট সম্পন্ন করে পরীক্ষা শুরু করুন।" 
            delay={0.3}
          />
          <FeatureCard 
            icon={TrendingUp} 
            title="Earnings Dashboard" 
            desc="শিক্ষকদের জন্য রয়েছে আলাদা ড্যাশবোর্ড তাদের আয় ট্র্যাক করার জন্য।" 
            delay={0.4}
          />
          <FeatureCard 
            icon={ShieldCheck} 
            title="Free First Exam" 
            desc="যেকোনো সাবস্ক্রিপশনের আগে প্রথম পরীক্ষাটি ফ্রিতে দিয়ে আমাদের প্ল্যাটফর্ম যাচাই করুন।" 
            delay={0.5}
          />
          <FeatureCard 
            icon={FileText} 
            title="Detailed Report" 
            desc="প্রতিটি প্রশ্নের ভুল এবং সঠিক উত্তরের ব্যাখ্যাসহ ডিটেইলড রিপোর্ট পান।" 
            delay={0.6}
          />
        </div>
      </div>
    </section>
  );
};
