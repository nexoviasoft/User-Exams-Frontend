'use client';

import { ArrowRight, GraduationCap } from 'lucide-react';
import Link from 'next/link';

export const Footer = () => {
  return (
    <footer className="relative py-16 md:py-24 px-4 sm:px-6 overflow-hidden border-t border-white/5">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-bg-dark z-0" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-primary/10 blur-[150px] rounded-[100%] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 md:gap-16">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-[0_0_20px_rgba(0,82,204,0.3)]">
              <GraduationCap className="text-white w-6 h-6" />
            </div>
            <span className="font-display font-extrabold text-2xl tracking-tight text-white drop-shadow-sm">
              Poly<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-accent">ExamBuzz</span>
            </span>
          </div>
          <p className="text-text-secondary max-w-sm mb-8 leading-relaxed font-light text-lg">
            বাংলাদেশের সেরা অনলাইন এক্সাম প্ল্যাটফর্ম। আধুনিক প্রযুক্তি এবং সহজ ইউজার ইন্টারফেসের মাধ্যমে শিক্ষা ব্যবস্থার মান উন্নয়নে আমরা অঙ্গীকারবদ্ধ।
          </p>
          {/* <div className="flex items-center gap-4">
            <Link href="#" className="w-12 h-12 rounded-full bg-white/[0.02] border border-white/10 backdrop-blur-md flex items-center justify-center hover:bg-primary/20 hover:border-primary/50 text-text-secondary hover:text-primary-light transition-all duration-300 group shadow-lg">
              <Facebook className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </Link>
            <Link href="#" className="w-12 h-12 rounded-full bg-white/[0.02] border border-white/10 backdrop-blur-md flex items-center justify-center hover:bg-accent/20 hover:border-accent/50 text-text-secondary hover:text-accent-light transition-all duration-300 group shadow-lg">
              <Twitter className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </Link>
            <Link href="#" className="w-12 h-12 rounded-full bg-white/[0.02] border border-white/10 backdrop-blur-md flex items-center justify-center hover:bg-pink-500/20 hover:border-pink-500/50 text-text-secondary hover:text-pink-400 transition-all duration-300 group shadow-lg">
              <Instagram className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </Link>
          </div> */}
        </div>

        <div>
          <h4 className="font-bold mb-6 text-white text-lg tracking-wide">Quick Links</h4>
          <ul className="space-y-4 text-text-secondary font-light">
            <li><Link href="#" className="hover:text-white flex items-center gap-2 group transition-colors"><ArrowRight className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 -ml-5 group-hover:ml-0 transition-all duration-300" /> Privacy Policy</Link></li>
            <li><Link href="#" className="hover:text-white flex items-center gap-2 group transition-colors"><ArrowRight className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 -ml-5 group-hover:ml-0 transition-all duration-300" /> Terms & Conditions</Link></li>
            <li><Link href="#" className="hover:text-white flex items-center gap-2 group transition-colors"><ArrowRight className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 -ml-5 group-hover:ml-0 transition-all duration-300" /> Contact Us</Link></li>
            <li><Link href="#" className="hover:text-white flex items-center gap-2 group transition-colors"><ArrowRight className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 -ml-5 group-hover:ml-0 transition-all duration-300" /> Help Center</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-6 text-white text-lg tracking-wide">Contact</h4>
          <div className="text-text-secondary space-y-4 font-light">
            <p className="flex flex-col">
              <span className="text-sm text-text-secondary/70 uppercase tracking-widest font-bold mb-1">Email Support</span>
              <a href="mailto:support@exambd.com" className="text-white hover:text-primary-light transition-colors">support@exambd.com</a>
            </p>
            <p className="flex flex-col">
              <span className="text-sm text-text-secondary/70 uppercase tracking-widest font-bold mb-1">Location</span>
              <span className="text-white">Dhaka, Bangladesh</span>
            </p>
          </div>

          <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-md shadow-inner">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm font-medium text-white/90">Made in Bangladesh 🇧🇩</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10 mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-center md:text-left">
          <p className="text-text-secondary/60 text-sm font-light">
            © {new Date().getFullYear()} PolyExamBuzz. All rights reserved.
          </p>
        </div>
        <div className="flex flex-col items-center md:items-end gap-1">
          <p className="text-text-secondary/60 text-sm font-light flex items-center gap-1">
            Designed with <span className="text-danger mx-1 animate-pulse">❤️</span> for Students
          </p>
          <p className="text-text-secondary/60 text-xs font-light">
            Developed by <a href="https://www.nexoviasoft.com" target="_blank" rel="noopener noreferrer" className="text-primary-light hover:text-white transition-colors">Nexoviasoft</a>
          </p>
        </div>
      </div>
    </footer>
  );
};
