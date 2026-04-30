'use client';

import { GraduationCap, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';

export const Footer = () => {
  return (
    <footer className="py-16 md:py-20 px-4 sm:px-6 border-t border-border bg-bg-dark">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-12">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="text-white w-5 h-5" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">PolyExamBuzz</span>
          </div>
          <p className="text-text-secondary max-w-sm mb-8 leading-relaxed">
            বাংলাদেশের সেরা অনলাইন এক্সাম প্ল্যাটফর্ম। আধুনিক প্রযুক্তি এবং সহজ ইউজার ইন্টারফেসের মাধ্যমে শিক্ষা ব্যবস্থার মান উন্নয়নে আমরা অঙ্গীকারবদ্ধ।
          </p>
          <div className="flex items-center gap-4">
             {/* Social icons placeholder */}
             <div className="w-10 h-10 rounded-full bg-bg-surface border border-border flex items-center justify-center hover:text-primary cursor-pointer transition-all"><TrendingUp className="w-4 h-4" /></div>
             <div className="w-10 h-10 rounded-full bg-bg-surface border border-border flex items-center justify-center hover:text-primary cursor-pointer transition-all"><Users className="w-4 h-4" /></div>
          </div>
        </div>
        
        <div>
          <h4 className="font-bold mb-6 text-text-primary">Links</h4>
          <ul className="space-y-4 text-text-secondary text-sm">
            <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            <li><Link href="#" className="hover:text-primary transition-colors">Terms & Conditions</Link></li>
            <li><Link href="#" className="hover:text-primary transition-colors">Contact Us</Link></li>
            <li><Link href="#" className="hover:text-primary transition-colors">Help Center</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-bold mb-6 text-text-primary">Contact</h4>
          <p className="text-text-secondary text-sm mb-4 leading-relaxed">
            Support: support@exambd.com <br />
            Dhaka, Bangladesh
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-bg-surface border border-border text-xs font-medium">
            Made in Bangladesh 🇧🇩
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto border-t border-border mt-16 pt-8 text-center text-text-secondary text-xs">
        © 2024 PolyExamBuzz. All rights reserved.
      </div>
    </footer>
  );
};
