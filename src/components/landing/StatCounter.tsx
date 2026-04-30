'use client';

import React, { useEffect, useState } from 'react';

interface StatCounterProps {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
}

export const StatCounter = ({ value, label, prefix = "", suffix = "" }: StatCounterProps) => {
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
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-display font-extrabold text-text-primary">
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-text-secondary mt-1 uppercase tracking-wider font-medium">{label}</div>
    </div>
  );
};
