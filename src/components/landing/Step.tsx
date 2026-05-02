'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StepProps {
  number: string;
  icon: LucideIcon;
  title: string;
  desc: string;
  delay: number;
}

export const Step = ({ number, icon: Icon, title, desc, delay }: StepProps) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.7, delay, type: "spring", stiffness: 100 }}
    className="relative flex flex-col items-center text-center p-8 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl hover:bg-white/[0.04] transition-colors duration-300 group shadow-2xl"
  >
    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center mb-8 relative z-10 shadow-[0_0_30px_rgba(0,82,204,0.2)] group-hover:scale-110 transition-transform duration-300">
      <Icon className="w-10 h-10 text-primary-light" />
      <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent-light text-white text-xs font-bold flex items-center justify-center shadow-lg">
        {number}
      </div>
    </div>
    <h3 className="text-2xl font-bold mb-4 font-display text-white group-hover:text-primary-light transition-colors">{title}</h3>
    <p className="text-text-secondary text-base leading-relaxed max-w-[240px] font-light">{desc}</p>
  </motion.div>
);
