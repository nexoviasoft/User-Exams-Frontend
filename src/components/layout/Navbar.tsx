'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/button';
import { LogOut, User, Bell, Search, Menu, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export const Navbar = ({ onMenuClick }: { onMenuClick?: () => void }) => {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  return (
    <nav className="h-16 border-b border-border bg-bg-card/50 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4 flex-1">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-text-secondary"
          onClick={onMenuClick}
        >
          <Menu className="w-6 h-6" />
        </Button>

        {/* Brand logo — shown on mobile when sidebar is hidden */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <GraduationCap className="text-white w-4 h-4" />
          </div>
          <span className="font-display font-bold text-base text-text-primary">
            PolyExam<span className="text-accent">Buzz</span>
          </span>
        </div>

        <div className="relative max-w-md w-full hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Search exams, questions..."
            className="w-full bg-bg-surface border border-border rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-text-secondary hover:text-text-primary">
          <Bell className="w-5 h-5" />
        </Button>
        
        <div className="h-8 w-[1px] bg-border mx-2" />
        
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-text-primary">{mounted ? (user?.name || 'Guest User') : ''}</p>
            <p className="text-xs text-text-secondary capitalize">{mounted ? (user?.role || 'Guest') : ''}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
            <User className="w-6 h-6" />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-danger hover:bg-danger/10"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
};
