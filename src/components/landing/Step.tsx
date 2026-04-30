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
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="relative flex flex-col items-center text-center px-4"
  >
    <div className="w-16 h-16 rounded-full bg-bg-surface border-2 border-primary flex items-center justify-center mb-6 relative z-10 shadow-[0_0_20px_rgba(0,82,204,0.3)]">
      <Icon className="w-8 h-8 text-primary" />
      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center border-2 border-bg-dark">
        {number}
      </div>
    </div>
    <h3 className="text-xl font-bold mb-3 font-display">{title}</h3>
    <p className="text-text-secondary text-sm leading-relaxed max-w-[200px]">{desc}</p>
  </motion.div>
);
