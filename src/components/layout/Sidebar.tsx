'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  BookOpen, 
  History, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  GraduationCap,
  FileText,
  Users,
  CreditCard,
  PieChart,
  Banknote,
  Database,
  PlusCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

export const Sidebar = ({ onAction }: { onAction?: () => void }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { role } = useAuth();

  const menuItems = {
    student: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/student/dashboard' },
      { name: 'সব Exam', icon: BookOpen, path: '/student/exams' },
      { name: 'আমার Results', icon: PieChart, path: '/student/history' },
      { name: 'Payment History', icon: CreditCard, path: '/student/payments' },
      { name: 'Profile', icon: Users, path: '/student/profile' },
    ],
    teacher: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/teacher/dashboard' },
      { name: 'Question Banks', icon: Database, path: '/teacher/question-banks' },
      { name: 'Question তৈরি', icon: PlusCircle, path: '/teacher/create-question' },
      { name: 'আমার Exams', icon: FileText, path: '/teacher/exams' },
      { name: 'Exam তৈরি', icon: PlusCircle, path: '/teacher/create-exam' },
      { name: 'Analytics', icon: PieChart, path: '/teacher/analytics' },
      { name: 'Earnings', icon: Banknote, path: '/teacher/earnings' },
    ],
    admin: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
      { name: 'Payments', icon: CreditCard, path: '/admin/payments', badge: '3' },
      { name: 'Users', icon: Users, path: '/admin/users' },
      { name: 'All Exams', icon: FileText, path: '/admin/exams' },
      { name: 'Revenue', icon: Banknote, path: '/admin/revenue' },
    ],
  };

  const currentMenu = role ? menuItems[role as keyof typeof menuItems] : [];

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      className="h-screen bg-bg-card border-r border-border flex flex-col sticky top-0 z-50 overflow-hidden"
    >
      {/* Logo Section */}
      <div className="h-16 flex items-center px-6 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <GraduationCap className="text-white w-5 h-5" />
        </div>
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="ml-3 font-display font-bold text-xl text-text-primary whitespace-nowrap"
          >
            PolyExam<span className="text-accent">Buzz</span>
          </motion.span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-2">
        {currentMenu.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link key={item.path} href={item.path} onClick={onAction}>
              <div className={cn(
                "flex items-center px-3 py-3 rounded-xl transition-all duration-200 group relative",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-text-secondary hover:bg-bg-surface hover:text-text-primary"
              )}>
                <item.icon className={cn(
                  "w-5 h-5 shrink-0",
                  isActive ? "text-primary" : "group-hover:text-text-primary"
                )} />
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="ml-3 flex-1 flex items-center justify-between"
                  >
                    <span className="font-medium text-sm">{item.name}</span>
                    {item.badge && (
                      <span className="bg-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-lg">
                        {item.badge}
                      </span>
                    )}
                  </motion.div>
                )}
                
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 w-1 h-8 bg-accent rounded-r-full"
                  />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Toggle */}
      <div className="p-4 border-t border-border">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center py-2 rounded-lg bg-bg-surface hover:bg-bg-surface/80 text-text-secondary transition-all"
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : (
            <div className="flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Collapse</span>
            </div>
          )}
        </button>
      </div>
    </motion.aside>
  );
};
