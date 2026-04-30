'use client';

import React from 'react';

import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Features } from '@/components/landing/Features';
import { Reviews } from '@/components/landing/Reviews';
import { Footer } from '@/components/landing/Footer';
import { Navbar } from '@/components/landing/Navbar';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-dark text-text-primary selection:bg-primary/30 overflow-x-hidden font-sans">
      <Navbar />

      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <Reviews />
      </main>

      <Footer />
    </div>
  );
}
