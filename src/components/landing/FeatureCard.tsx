'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  desc: string;
  delay: number;
}

export const FeatureCard = ({ icon: Icon, title, desc, delay }: FeatureCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="p-8 rounded-3xl bg-bg-surface/50 border border-border hover:border-primary/50 hover:bg-bg-surface transition-all duration-300 group"
  >
    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
      <Icon className="w-6 h-6" />
    </div>
    <h3 className="text-xl font-bold mb-3 text-text-primary font-display">{title}</h3>
    <p className="text-text-secondary leading-relaxed">{desc}</p>
  </motion.div>
);
