'use client';

import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';
import Link from 'next/link';

interface AuthLayoutProps {
  children: React.ReactNode;
  tagline: string;
}

export const AuthLayout = ({ children, tagline }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen w-full flex overflow-hidden bg-bg-dark">
      {/* Left Panel - Branding (40%) */}
      <div className="hidden lg:flex w-[40%] bg-bg-dark relative overflow-hidden items-center justify-center border-r border-border">
        {/* Diagonal Accent Stripe */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-[-50%] left-[-20%] w-[140%] h-[200%] bg-gradient-to-br from-primary via-transparent to-accent rotate-[30deg]" />
        </div>

        {/* Floating Shapes */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute top-20 left-20 w-32 h-32 rounded-3xl bg-primary/10 border border-primary/20 blur-sm"
        />
        <motion.div
          animate={{ y: [0, 30, 0], rotate: [0, -20, 0] }}
          transition={{ duration: 7, repeat: Infinity }}
          className="absolute bottom-40 right-10 w-24 h-24 rounded-full bg-accent/10 border border-accent/20 blur-sm"
        />

        <div className="relative z-10 text-center px-12">
          <Link href="/" className="flex flex-col items-center gap-6 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-24 h-24 rounded-[32px] bg-primary flex items-center justify-center shadow-[0_20px_40px_rgba(0,82,204,0.3)] transition-all"
            >
              <GraduationCap className="text-white w-14 h-14" />
            </motion.div>
            <div className="space-y-2">
              <h1 className="text-5xl font-display font-extrabold tracking-tight text-text-primary">
                Poly<span className="text-primary">Exam</span><span className="text-accent">Buzz</span>
              </h1>
              <p className="text-2xl font-medium text-text-secondary mt-4">
                {tagline}
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Right Panel - Form (60%) */}
      <div className="w-full lg:w-[60%] flex items-center justify-center p-6 md:p-12 bg-bg-card/30">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
};
