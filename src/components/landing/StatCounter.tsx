'use client';

import React, { useEffect, useState } from 'react';

interface StatCounterProps {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  icon?: React.ReactNode;
}

export const StatCounter = ({ value, label, prefix = "", suffix = "", icon }: StatCounterProps) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 2000;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="flex flex-col items-center justify-center text-center p-4">
      {icon && <div className="flex justify-center">{icon}</div>}
      <div className="text-3xl md:text-5xl font-display font-extrabold text-white drop-shadow-sm">
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm md:text-base text-text-secondary mt-2 uppercase tracking-widest font-bold">{label}</div>
    </div>
  );
};
