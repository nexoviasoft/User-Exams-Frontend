'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { CreditCard, Loader2, Library, BookOpen, TrendingUp, Trophy, ArrowRight, Sparkles, Calendar, CheckCircle2, Download, FileText, Printer } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

type Payment = {
  id: string;
  status: 'pending' | 'success' | 'failed';
  createdAt: string;
  method?: string;
  transactionId?: string;
  senderNumber?: string;
  subject?: { id: string; name: string } | null;
  modelTest?: { id: string; name: string } | null;
  exam?: { id: string; title: string } | null;
  totalAmount: number;
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

export default function StudentPurchasesPage() {
  const { data: profile } = useQuery({
    queryKey: ['student-profile'],
    queryFn: async () => (await axiosInstance.get('/auth/me')).data,
  });

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['student-my-purchases'],
    queryFn: async () => (await axiosInstance.get('/payments/my')).data as Payment[],
  });

  const successfulPayments = payments.filter((p) => p.status === 'success');

  const handleDownloadInvoice = (payment: Payment) => {
    const title = payment.subject?.name || payment.modelTest?.name || payment.exam?.title || 'Course Access';
    const amount = Math.floor(Number(payment.totalAmount || 0) / 100);
    const date = new Date(payment.createdAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' });
    
    const invoiceHtml = `
      <html>
        <head>
          <title>Invoice - ${payment.id}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; color: #1e293b; padding: 40px; line-height: 1.6; }
            .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 20px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
            .logo { font-size: 28px; font-weight: 900; color: #3b82f6; letter-spacing: -1px; }
            .invoice-details { text-align: right; }
            .section { margin-bottom: 30px; }
            .section-title { font-size: 14px; font-weight: 900; text-transform: uppercase; color: #64748b; margin-bottom: 10px; letter-spacing: 1px; }
            .info-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; }
            .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .table th { background: #f8fafc; text-align: left; padding: 12px; border-bottom: 2px solid #e2e8f0; font-size: 12px; font-weight: 900; color: #64748b; }
            .table td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
            .total-row { background: #f1f5f9; font-weight: 900; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #94a3b8; }
            .badge { display: inline-block; padding: 4px 12px; border-radius: 999px; background: #dcfce7; color: #166534; font-size: 10px; font-weight: 900; text-transform: uppercase; }
            @media print { body { padding: 0; } .invoice-box { border: none; box-shadow: none; } }
          </style>
        </head>
        <body onload="window.print()">
          <div class="invoice-box">
            <div class="header">
              <div class="logo">POLY EXAM BUZZ</div>
              <div class="invoice-details">
                <div class="badge">Paid Official</div>
                <div style="font-weight: 900; margin-top: 8px;">INVOICE #${payment.id.slice(-8).toUpperCase()}</div>
                <div style="font-size: 12px; color: #64748b;">Issued on ${date}</div>
              </div>
            </div>

            <div class="info-grid">
              <div class="section">
                <div class="section-title">Billed To:</div>
                <div style="font-weight: 700; font-size: 18px;">${profile?.name || 'Student Name'}</div>
                <div style="font-size: 14px; color: #475569;">${profile?.email || 'student@example.com'}</div>
                <div style="font-size: 14px; color: #475569;">Phone: ${payment.senderNumber || 'N/A'}</div>
              </div>
              <div class="section" style="text-align: right;">
                <div class="section-title">Payment Method:</div>
                <div style="font-weight: 700;">${payment.method || 'Online Payment'}</div>
                <div style="font-size: 14px; color: #475569;">Trans ID: ${payment.transactionId || 'N/A'}</div>
              </div>
            </div>

            <table class="table">
              <thead>
                <tr>
                  <th>DESCRIPTION</th>
                  <th style="text-align: right;">TOTAL AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div style="font-weight: 700;">${title}</div>
                    <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Lifetime Access - Full Course & Exams</div>
                  </td>
                  <td style="text-align: right; font-weight: 700;">৳${amount}</td>
                </tr>
                <tr class="total-row">
                  <td style="text-align: right;">GRAND TOTAL</td>
                  <td style="text-align: right; color: #3b82f6;">৳${amount}</td>
                </tr>
              </tbody>
            </table>

            <div class="footer">
              <p>Thank you for choosing Poly Exam Buzz. This is a computer-generated invoice.</p>
              <p>&copy; 2026 Nexo Products | polyexambuzz.com</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(invoiceHtml);
      printWindow.document.close();
    }
  };

  return (
    <DashboardLayout>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 md:space-y-10 max-w-6xl mx-auto pb-24 px-4 relative"
      >
        {/* Decorative Background Glows */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black px-3 py-1 rounded-lg uppercase tracking-widest text-[10px]">
                My Library
              </Badge>
            </div>
            <h1 className="text-2xl md:text-5xl font-display font-black tracking-tight text-text-primary leading-tight flex items-center gap-4">
              আমার <span className="text-primary">কেনা</span> কোর্সসমূহ <Library className="w-8 h-8 md:w-12 md:h-12 text-primary/40" />
            </h1>
            <p className="text-text-secondary text-lg max-w-2xl font-medium">
              আপনার সফলভাবে কেনা সব সাবজেক্ট এবং মডেল টেস্ট একসাথে এখান থেকে এক্সেস করুন।
            </p>
          </div>
          <Link href="/student/exams">
            <Button className="bg-primary hover:bg-primary-light text-white font-black rounded-2xl h-14 px-8 shadow-xl shadow-primary/20 transition-all hover:-translate-y-1">
              নতুন কোর্স দেখুন <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-32 space-y-6">
            <Loader2 className="w-12 h-12 animate-spin text-primary opacity-20" />
            <p className="text-text-secondary font-black animate-pulse uppercase tracking-widest text-xs">Accessing Library...</p>
          </div>
        ) : successfulPayments.length === 0 ? (
          <motion.div variants={itemVariants}>
            <Card className="border-border/50 bg-bg-card/40 backdrop-blur-xl rounded-[32px] border-2 border-dashed">
              <CardContent className="py-24 text-center space-y-6">
                <div className="w-20 h-20 bg-bg-surface/50 rounded-full flex items-center justify-center mx-auto">
                  <BookOpen className="w-10 h-10 text-text-secondary opacity-20" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-text-primary">Library is Empty</h3>
                  <p className="text-text-secondary font-medium">আপনার কেনা কোনো আইটেম এখনো নেই। আজই আপনার প্রথম কোর্সটি কিনুন!</p>
                </div>
                <Link href="/student/exams">
                  <Button variant="outline" className="rounded-xl font-black px-8">Browse Exams</Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 relative z-10">
            <AnimatePresence>
              {successfulPayments.map((payment) => {
                const title = payment.subject?.name || payment.modelTest?.name || payment.exam?.title || 'Course Access';
                const type = payment.subject ? 'Subject Access' : payment.modelTest ? 'Model Test Series' : payment.exam ? 'Single Exam' : 'Full Access';
                const destination = payment.subject?.id ? `/student/exams/subject/${payment.subject.id}` : payment.modelTest?.id ? `/student/exams/modeltest/${payment.modelTest.id}` : '/student/exams';
                const leaderboardLink = payment.subject?.id ? `/student/leaderboard/subject/${payment.subject.id}` : payment.modelTest?.id ? `/student/leaderboard/model-test/${payment.modelTest.id}` : null;
                const analyticsLink = payment.subject?.id ? `/student/analytics/subject/${payment.subject.id}` : payment.modelTest?.id ? `/student/analytics/model-test/${payment.modelTest.id}` : null;

                return (
                  <motion.div
                    key={payment.id}
                    variants={itemVariants}
                    layout
                    className="h-full"
                  >
                    <Card className="h-full group border-border/50 bg-bg-card/40 backdrop-blur-xl hover:bg-bg-card/70 transition-all duration-300 rounded-[32px] overflow-hidden border-2 flex flex-col">
                      <CardHeader className="p-8 pb-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2 text-primary">
                              <div className="p-2 rounded-lg bg-primary/10">
                                <Sparkles className="w-4 h-4" />
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-[0.1em]">{type}</span>
                            </div>
                            <CardTitle className="text-xl font-display font-black text-text-primary group-hover:text-primary transition-colors leading-tight">
                              {title}
                            </CardTitle>
                          </div>
                          <Badge className="bg-success text-white px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest border-none shadow-lg shadow-success/20">
                            <CheckCircle2 className="w-3 h-3 mr-1.5" /> Lifetime
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-8 pt-4 space-y-8 flex-1 flex flex-col justify-between">
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-bg-surface/50 border border-border/40 space-y-1">
                              <div className="text-[9px] uppercase font-black text-text-secondary tracking-widest">Investment</div>
                              <div className="text-lg font-black text-text-primary">৳{Math.floor(Number(payment.totalAmount || 0) / 100)}</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-bg-surface/50 border border-border/40 space-y-1">
                              <div className="text-[9px] uppercase font-black text-text-secondary tracking-widest">Enrolled On</div>
                              <div className="text-lg font-black text-text-primary flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-accent" /> 
                                {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' }) : '-'}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <Link href={destination} className="flex-1">
                              <Button 
                                className="w-full rounded-[20px] h-14 bg-primary hover:bg-primary-light text-white font-black shadow-lg shadow-primary/20 transition-all group/btn"
                              >
                                পরীক্ষা শুরু করুন 
                                <ArrowRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                              </Button>
                            </Link>
                            <Button 
                              variant="outline"
                              onClick={() => handleDownloadInvoice(payment)}
                              className="rounded-[20px] h-14 w-14 border-2 border-border/60 bg-bg-card/50 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 shadow-sm flex items-center justify-center p-0"
                              title="Download Invoice"
                            >
                              <Printer className="w-5 h-5" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            {leaderboardLink && (
                              <Link href={leaderboardLink}>
                                <Button variant="outline" className="w-full rounded-xl h-12 border-2 border-border/60 bg-bg-card/50 hover:bg-bg-card hover:border-primary/30 transition-all font-black text-xs">
                                  <Trophy className="w-3.5 h-3.5 mr-2 text-yellow-500" /> Leaderboard
                                </Button>
                              </Link>
                            )}
                            {analyticsLink && (
                              <Link href={analyticsLink}>
                                <Button variant="outline" className="w-full rounded-xl h-12 border-2 border-border/60 bg-bg-card/50 hover:bg-bg-card hover:border-primary/30 transition-all font-black text-xs">
                                  <TrendingUp className="w-3.5 h-3.5 mr-2 text-success" /> Analytics
                                </Button>
                              </Link>
                            )}
                          </div>
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
