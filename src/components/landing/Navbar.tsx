'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { GraduationCap, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
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
        "fixed top-0 left-0 right-0 h-16 sm:h-20 z-50 transition-all duration-300 flex items-center justify-between px-4 sm:px-6 md:px-12",
        isScrolled ? "bg-bg-dark/80 backdrop-blur-xl border-b border-border shadow-lg" : "bg-transparent"
      )}>
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
              <GraduationCap className="text-white w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="font-display font-bold text-lg sm:text-2xl tracking-tight text-text-primary">
              PolyExam<span className="text-primary">Buzz</span><span className="text-accent ml-[1px]">.</span>
            </span>
          </Link>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8 font-medium text-sm text-text-secondary">
          <Link href="/#features" className="hover:text-primary transition-colors">Features</Link>
          <Link href="/#how-it-works" className="hover:text-primary transition-colors">How it works</Link>
          <Link href="/#reviews" className="hover:text-primary transition-colors">Reviews</Link>
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/login">
            <Button variant="outline" className="border-border text-text-primary hover:bg-bg-surface rounded-full px-6 h-10">
              Login
            </Button>
          </Link>
          <Link href="/register">
            <Button className="bg-accent hover:bg-accent-light text-white rounded-full px-6 h-10 font-bold shadow-[0_4px_14px_rgba(255,107,0,0.4)]">
              Get Started
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-text-primary hover:bg-bg-surface/60 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Menu Fullscreen Drawer */}
      <div className={cn(
        "fixed inset-0 z-40 bg-bg-dark/98 backdrop-blur-2xl flex flex-col items-center justify-center gap-8 md:hidden transition-all duration-300",
        menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}>
        {[
          { href: '/#features', label: 'Features' },
          { href: '/#how-it-works', label: 'How it works' },
          { href: '/#reviews', label: 'Reviews' },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-2xl font-display font-bold hover:text-primary transition-colors text-text-primary"
            onClick={() => setMenuOpen(false)}
          >
            {item.label}
          </Link>
        ))}
        <div className="flex flex-col gap-3 w-56 mt-4">
          <Link href="/login" onClick={() => setMenuOpen(false)}>
            <Button variant="outline" className="border-border text-text-primary hover:bg-bg-surface rounded-full w-full h-12 text-base">
              Login
            </Button>
          </Link>
          <Link href="/register" onClick={() => setMenuOpen(false)}>
            <Button className="bg-accent hover:bg-accent-light text-white rounded-full w-full h-12 text-base font-bold shadow-[0_4px_14px_rgba(255,107,0,0.4)]">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
};
