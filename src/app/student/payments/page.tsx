'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import axiosInstance from '@/lib/axios';
import { cn } from '@/lib/utils';
import { CreditCard, Loader2, ArrowRight, Wallet, History, CheckCircle2, Clock, XCircle, Info, Smartphone, Calendar, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type PaymentStatus = 'pending' | 'success' | 'failed';

type Payment = {
  id: string;
  status: PaymentStatus;
  createdAt: string;
  method?: string;
  transactionId?: string;
  senderNumber?: string;
  subject?: { id: string; name: string } | null;
  modelTest?: { id: string; name: string } | null;
  exam?: { id: string; title: string } | null;
  totalAmount: number;
};

const statusStyles: Record<PaymentStatus, { bg: string; text: string; icon: any }> = {
  pending: { bg: 'bg-warning/10 border-warning/20', text: 'text-warning', icon: Clock },
  success: { bg: 'bg-success/10 border-success/20', text: 'text-success', icon: CheckCircle2 },
  failed: { bg: 'bg-danger/10 border-danger/20', text: 'text-danger', icon: XCircle },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 12
    }
  }
};

export default function StudentPaymentsPage() {
  const [activeFilter, setActiveFilter] = useState<'all' | PaymentStatus>('all');

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['student-my-payments-history'],
    queryFn: async () => (await axiosInstance.get('/payments/my')).data as Payment[],
  });

  const stats = useMemo(() => {
    const pending = payments.filter((p) => p.status === 'pending').length;
    const success = payments.filter((p) => p.status === 'success').length;
    const failed = payments.filter((p) => p.status === 'failed').length;
    return {
      total: payments.length,
      pending,
      success,
      failed,
    };
  }, [payments]);

  const filteredPayments = useMemo(() => {
    if (activeFilter === 'all') return payments;
    return payments.filter((payment) => payment.status === activeFilter);
  }, [payments, activeFilter]);

  return (
    <DashboardLayout>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-10 max-w-6xl mx-auto pb-24 px-4 relative"
      >
        {/* Decorative Background Glows */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black px-2 py-0.5 rounded-lg uppercase tracking-widest text-[9px]">
                Billing Center
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-black tracking-tight text-text-primary leading-tight flex items-center gap-3">
              Payment <span className="text-primary">History</span> <History className="w-6 h-6 md:w-8 md:h-8 text-primary/40" />
            </h1>
            <p className="text-text-secondary text-sm max-w-2xl font-medium">
              আপনার সব pending/success/failed payment request এবং details এখানে দেখুন।
            </p>
          </div>
          <Link href="/student/exams">
            <Button className="bg-primary hover:bg-primary-light text-white font-black rounded-xl h-12 px-6 shadow-xl shadow-primary/20 transition-all active:scale-95 text-xs uppercase tracking-widest">
              Exams ব্রাউজ করুন <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 relative z-10">
          {[
            { label: 'Total', value: stats.total, color: 'text-primary', icon: Wallet },
            { label: 'Pending', value: stats.pending, color: 'text-warning', icon: Clock },
            { label: 'Approved', value: stats.success, color: 'text-success', icon: CheckCircle2 },
            { label: 'Failed', value: stats.failed, color: 'text-danger', icon: XCircle },
          ].map((stat) => (
            <motion.div key={stat.label} variants={itemVariants}>
              <Card className="group border-border/50 bg-bg-card/40 backdrop-blur-xl hover:bg-bg-card/70 transition-all duration-500 rounded-[20px] overflow-hidden border-2">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className={cn("p-2 rounded-xl transition-transform group-hover:scale-110", stat.color.replace('text-', 'bg-').concat('/10'))}>
                      <stat.icon className={cn("w-5 h-5", stat.color)} />
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-text-secondary">{stat.label}</p>
                    <p className={cn("text-xl font-display font-black", stat.color)}>{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <motion.div variants={itemVariants} className="flex items-center gap-2 flex-wrap relative z-10">
          {[
            { id: 'all', label: 'সব History' },
            { id: 'pending', label: 'Pending' },
            { id: 'success', label: 'Approved' },
            { id: 'failed', label: 'Failed' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveFilter(item.id as 'all' | PaymentStatus)}
              className={cn(
                "px-5 py-2 rounded-xl text-[11px] font-black transition-all border-2 uppercase tracking-wider",
                activeFilter === item.id 
                  ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105" 
                  : "bg-bg-card/40 border-border/50 text-text-secondary hover:border-primary/30 hover:bg-bg-card/60"
              )}
            >
              {item.label}
            </button>
          ))}
        </motion.div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-32 space-y-6">
            <Loader2 className="w-12 h-12 animate-spin text-primary opacity-20" />
            <p className="text-text-secondary font-black animate-pulse uppercase tracking-widest text-xs">Loading Transactions...</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <motion.div variants={itemVariants}>
            <Card className="border-border/50 bg-bg-card/40 backdrop-blur-xl rounded-[32px] border-2 border-dashed">
              <CardContent className="py-24 text-center space-y-6">
                <div className="w-20 h-20 bg-bg-surface/50 rounded-full flex items-center justify-center mx-auto">
                  <CreditCard className="w-10 h-10 text-text-secondary opacity-20" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-text-primary">No Transactions Found</h3>
                  <p className="text-text-secondary font-medium">এই ক্যাটাগরিতে কোনো পেমেন্ট হিস্ট্রি নেই।</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 relative z-10">
            <AnimatePresence mode="popLayout">
              {filteredPayments.map((payment) => {
                const title = payment.subject?.name || payment.modelTest?.name || payment.exam?.title || 'Payment Request';
                const type = payment.subject ? 'Subject Bundle' : payment.modelTest ? 'Model Test Bundle' : payment.exam ? 'Single Exam' : 'Service Payment';
                const destination = payment.subject?.id ? `/student/exams/subject/${payment.subject.id}` : payment.modelTest?.id ? `/student/exams/modeltest/${payment.modelTest.id}` : '/student/exams';
                const StatusIcon = statusStyles[payment.status].icon;

                return (
                  <motion.div
                    key={payment.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="h-full"
                  >
                    <Card className="h-full group border-border/50 bg-bg-card/40 backdrop-blur-xl hover:bg-bg-card/70 transition-all duration-300 rounded-[24px] overflow-hidden border-2 flex flex-col">
                      <CardHeader className="p-5 pb-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-0.5 flex-1">
                            <div className="flex items-center gap-2 text-primary">
                              <div className="p-1.5 rounded-lg bg-primary/10">
                                <CreditCard className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-[9px] font-black uppercase tracking-[0.1em]">{type}</span>
                            </div>
                            <CardTitle className="text-lg font-display font-black text-text-primary group-hover:text-primary transition-colors leading-tight">
                              {title}
                            </CardTitle>
                          </div>
                          <Badge className={cn(
                            'px-3 py-1 rounded-lg font-black text-[9px] uppercase tracking-widest border shadow-sm',
                            statusStyles[payment.status].bg,
                            statusStyles[payment.status].text
                          )}>
                            <StatusIcon className="w-3 h-3 mr-1" /> {payment.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-5 pt-2 space-y-4 flex-1 flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl bg-bg-surface/50 border border-border/40 space-y-0.5">
                              <div className="text-[8px] uppercase font-black text-text-secondary tracking-widest opacity-60">Amount</div>
                              <div className="text-base font-black text-text-primary">৳{Math.floor(Number(payment.totalAmount || 0) / 100)}</div>
                            </div>
                            <div className="p-3 rounded-xl bg-bg-surface/50 border border-border/40 space-y-0.5">
                              <div className="text-[8px] uppercase font-black text-text-secondary tracking-widest opacity-60">Method</div>
                              <div className="text-base font-black text-text-primary flex items-center gap-1.5 capitalize">
                                <Smartphone className="w-3.5 h-3.5 text-accent" /> {payment.method || 'Digital'}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-bg-surface/30 border border-border/40 text-[10px] font-bold">
                              <div className="flex items-center gap-2 text-text-secondary">
                                <Info className="w-3.5 h-3.5" /> Trans. ID
                              </div>
                              <div className="text-text-primary font-black uppercase tracking-tight">{payment.transactionId || 'N/A'}</div>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-bg-surface/30 border border-border/40 text-[10px] font-bold">
                              <div className="flex items-center gap-2 text-text-secondary">
                                <Smartphone className="w-3.5 h-3.5" /> Sender
                              </div>
                              <div className="text-text-primary font-black">{payment.senderNumber || 'N/A'}</div>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-bg-surface/30 border border-border/40 text-[10px] font-bold">
                              <div className="flex items-center gap-2 text-text-secondary">
                                <Calendar className="w-3.5 h-3.5" /> Date
                              </div>
                              <div className="text-text-primary font-black">
                                {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2">
                          <Link href={destination}>
                            <Button 
                              variant="outline" 
                              className="w-full rounded-xl h-11 border-2 border-border/60 bg-bg-card/50 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 font-black shadow-sm group/btn text-[10px] uppercase tracking-widest"
                            >
                              Open Exams 
                              <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
