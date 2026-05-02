'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { GraduationCap, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <>
      <nav className={cn(
        "fixed top-0 left-0 right-0 h-20 z-50 transition-all duration-500 flex items-center justify-between px-4 sm:px-6 md:px-12",
        isScrolled ? "bg-bg-dark/40 backdrop-blur-2xl border-b border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.5)]" : "bg-transparent py-2"
      )}>
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(0,82,204,0.4)] group-hover:scale-105 transition-transform duration-300">
              <GraduationCap className="text-white w-6 h-6" />
            </div>
            <span className="font-display font-extrabold text-2xl tracking-tight text-white drop-shadow-sm">
              Poly<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-accent">ExamBuzz</span>
            </span>
          </Link>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-10 font-medium text-sm text-text-secondary/90">
          <Link href="/#features" className="hover:text-white transition-colors relative group">
            Features
            <span className="absolute -bottom-1.5 left-0 w-0 h-[2px] bg-primary transition-all duration-300 group-hover:w-full" />
          </Link>
          <Link href="/#how-it-works" className="hover:text-white transition-colors relative group">
            How it works
            <span className="absolute -bottom-1.5 left-0 w-0 h-[2px] bg-primary transition-all duration-300 group-hover:w-full" />
          </Link>
          <Link href="/#reviews" className="hover:text-white transition-colors relative group">
            Reviews
            <span className="absolute -bottom-1.5 left-0 w-0 h-[2px] bg-primary transition-all duration-300 group-hover:w-full" />
          </Link>
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/login">
            <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-sm text-white rounded-full px-6 h-10 font-medium transition-all duration-300 hover:border-primary/30">
              Login
            </Button>
          </Link>
          <Link href="/register">
            <Button className="relative overflow-hidden bg-primary hover:bg-primary-light text-white rounded-full px-6 h-10 font-bold group shadow-[0_0_20px_rgba(0,82,204,0.4)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,82,204,0.6)] hover:-translate-y-0.5 border-0">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              <span className="relative">Get Started</span>
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden p-2 rounded-xl text-white bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile Menu Fullscreen Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(24px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-bg-dark/80 flex flex-col items-center justify-center gap-8 md:hidden pointer-events-auto"
          >
            {[
              { href: '/#features', label: 'Features' },
              { href: '/#how-it-works', label: 'How it works' },
              { href: '/#reviews', label: 'Reviews' },
            ].map((item, idx) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 + 0.1 }}
              >
                <Link
                  href={item.href}
                  className="text-3xl font-display font-bold text-white hover:text-primary-light transition-colors relative group"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-primary transition-all duration-300 group-hover:w-1/2" />
                </Link>
              </motion.div>
            ))}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col gap-4 w-64 mt-8"
            >
              <Link href="/login" onClick={() => setMenuOpen(false)}>
                <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-sm text-white rounded-full w-full h-14 text-lg font-medium transition-all">
                  Login
                </Button>
              </Link>
              <Link href="/register" onClick={() => setMenuOpen(false)}>
                <Button className="relative overflow-hidden bg-primary hover:bg-primary-light text-white rounded-full w-full h-14 text-lg font-bold group shadow-[0_0_30px_rgba(0,82,204,0.4)] border-0">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                  <span className="relative">Get Started</span>
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
