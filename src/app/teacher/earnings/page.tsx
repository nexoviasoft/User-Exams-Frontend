'use client';

import { useMemo } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Banknote, 
  TrendingUp, 
  Clock, 
  ArrowUpRight,
  User as UserIcon,
  Calendar,
  Download,
  Wallet,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Sparkles,
  Zap,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGetMyEarningsQuery } from '@/store/slices/api/teacherDashboardApi';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15
    }
  }
};

export default function EarningsPage() {
  const { data, isLoading, isError } = useGetMyEarningsQuery();
  const earningsHistory = data?.paymentHistory || [];
  const totalEarnings = data?.totalEarningsInTaka || 0;

  const thisMonthEarnings = useMemo(() => {
    const now = new Date();
    return earningsHistory.reduce((sum, item) => {
      if (!item.approvedAt) return sum;
      const date = new Date(item.approvedAt);
      if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
        return sum + (item.amountInTaka || 0);
      }
      return sum;
    }, 0);
  }, [earningsHistory]);

  const pendingVerification = 0;

  const formatDate = (iso?: string | null) => {
    if (!iso) return 'N/A';
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDownloadInvoice = (item: any) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Header & Branding
      doc.setFillColor(0, 82, 204); // Primary Theme Color
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(24);
      doc.text('POLY-EXAM', 15, 25);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('SETTLEMENT INVOICE', 15, 32);
      
      doc.setTextColor(255, 255, 255);
      doc.text(`ID: #${item.paymentId?.slice(-8).toUpperCase()}`, pageWidth - 15, 25, { align: 'right' });
      doc.text(`Date: ${formatDate(item.approvedAt)}`, pageWidth - 15, 32, { align: 'right' });

      // Merchant Info
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Teacher Statement', 15, 55);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(item.studentName || 'N/A', 15, 62);
      doc.text(item.method || 'Manual Portal', 15, 67);

      // Main Table
      const tableData = [
        ['Description', 'Participant', 'Gateway', 'Net Amount'],
        [
          item.examTitle || 'Exam Contribution',
          item.studentName || 'N/A',
          item.method || 'Manual',
          `BDT ${item.amountInTaka?.toLocaleString()}`
        ]
      ];

      autoTable(doc, {
        startY: 80,
        head: [tableData[0]],
        body: [tableData[1]],
        theme: 'striped',
        headStyles: { fillColor: [0, 82, 204], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 5 },
      });

      // Summary
      const finalY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('Total Settlement Amount:', pageWidth - 60, finalY, { align: 'right' });
      doc.setFontSize(12);
      doc.setTextColor(0, 82, 204);
      doc.text(`BDT ${item.amountInTaka?.toLocaleString()}`, pageWidth - 15, finalY, { align: 'right' });

      // Footer
      doc.setDrawColor(230, 230, 230);
      doc.line(15, 270, pageWidth - 15, 270);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('This is a computer-generated document and does not require a signature.', pageWidth / 2, 280, { align: 'center' });
      doc.text('Thank you for contributing to the Poly-Exam Ecosystem.', pageWidth / 2, 285, { align: 'center' });

      doc.save(`Invoice_${item.paymentId?.slice(-6)}.pdf`);
      toast.success('Invoice downloaded successfully!');
    } catch (error) {
      console.error('PDF Generation Error:', error);
      toast.error('Failed to generate invoice. Please try again.');
    }
  };

  return (
    <DashboardLayout>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-10 max-w-7xl mx-auto relative px-4 pb-20"
      >
        {/* Background Decorative Glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black px-3 py-1 rounded-lg uppercase tracking-widest text-[10px]">
                Financial Hub
              </Badge>
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-black tracking-tight text-text-primary leading-tight">
              Revenue <span className="text-primary">& Payouts</span> 💰
            </h1>
            <p className="text-text-secondary text-lg max-w-2xl font-medium">
              Track your earnings, manage invoices, and monitor financial growth.
            </p>
          </div>
          <Button className="bg-primary hover:bg-primary-light text-white rounded-2xl h-12 px-8 font-black shadow-xl shadow-primary/20 transition-all hover:-translate-y-1">
            <Download className="w-5 h-5 mr-2" /> Export Statement
          </Button>
        </motion.div>

        {/* Earnings Stats */}
        <div className="grid gap-6 md:grid-cols-3 relative z-10">
          <motion.div variants={itemVariants}>
            <Card className="border-border/50 bg-primary/10 backdrop-blur-xl rounded-[28px] overflow-hidden border-2 shadow-2xl relative group h-full">
              <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 group-hover:rotate-12 transition-all duration-700 pointer-events-none">
                <Wallet className="w-40 h-40" />
              </div>
              <CardHeader className="p-5 pb-2">
                <CardTitle className="text-[9px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                   <Sparkles className="w-3 h-3" /> Cumulative Revenue
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <div className="text-3xl font-display font-black text-primary tracking-tight">৳{totalEarnings.toLocaleString()}</div>
                <div className="mt-4 flex items-center gap-2 text-primary/70 font-black text-[9px] uppercase tracking-widest bg-white/40 w-fit px-2.5 py-1 rounded-lg border border-primary/10">
                  <ArrowUpRight className="w-3 h-3" /> Verified Lifetime Earnings
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="border-border/50 bg-bg-card/40 backdrop-blur-xl rounded-[28px] overflow-hidden border-2 shadow-2xl h-full">
              <CardHeader className="p-5 pb-2">
                <CardTitle className="text-[9px] font-black text-text-secondary uppercase tracking-[0.2em] flex items-center gap-2">
                   <Calendar className="w-3 h-3" /> Current Cycle
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <div className="text-3xl font-display font-black text-text-primary">৳{thisMonthEarnings.toLocaleString()}</div>
                <div className="mt-4 flex items-center gap-2 text-text-secondary font-black text-[9px] uppercase tracking-widest">
                  <TrendingUp className="w-3 h-3 text-success" /> Active monthly performance
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="border-border/50 bg-bg-card/40 backdrop-blur-xl rounded-[28px] overflow-hidden border-2 shadow-2xl h-full">
              <CardHeader className="p-5 pb-2">
                <CardTitle className="text-[9px] font-black text-text-secondary uppercase tracking-[0.2em] flex items-center gap-2">
                   <Clock className="w-3 h-3" /> Locked Balance
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <div className="text-3xl font-display font-black text-warning">৳{pendingVerification}</div>
                <div className="mt-4 flex items-center gap-2 text-text-secondary font-black text-[9px] uppercase tracking-widest">
                  <Zap className="w-3 h-3 text-warning" /> Awaiting administrator audit
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Payment History */}
        <motion.div variants={itemVariants} className="relative z-10">
          <Card className="border-border/50 bg-bg-card/40 backdrop-blur-xl rounded-[28px] overflow-hidden border-2 shadow-2xl">
            <CardHeader className="p-6 pb-2 border-b border-border/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-success/10 text-success">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-xl font-display font-black text-text-primary">Transaction History</CardTitle>
                </div>
                <Badge variant="outline" className="font-black px-2 py-0.5 rounded-lg text-[9px] uppercase tracking-widest bg-white/50">
                  {earningsHistory.length} Total Settlements
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                  <Loader2 className="w-12 h-12 animate-spin text-primary opacity-20" />
                  <p className="text-text-secondary font-black animate-pulse uppercase tracking-widest text-xs">Fetching payment records...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-border/40 text-text-secondary text-[9px] uppercase tracking-[0.2em] font-black">
                        <th className="px-6 py-4">Settlement Date</th>
                        <th className="px-6 py-4">Contributor Details</th>
                        <th className="px-6 py-4">Asset Assessment</th>
                        <th className="px-6 py-4">Net Earnings</th>
                        <th className="px-6 py-4">Payment Portal</th>
                        <th className="px-6 py-4 text-right">Documents</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      <AnimatePresence mode="popLayout">
                        {earningsHistory.map((item: any) => (
                          <motion.tr 
                            key={item.paymentId}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="group hover:bg-primary/[0.02] transition-colors"
                          >
                            <td className="px-6 py-4">
                              <span className="text-[10px] font-bold text-text-secondary bg-bg-surface px-2.5 py-1 rounded-lg border border-border/40 group-hover:bg-primary/5 transition-colors">
                                {formatDate(item.approvedAt)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-xl bg-bg-surface border border-border/40 flex items-center justify-center text-text-secondary group-hover:scale-110 transition-transform">
                                  <UserIcon className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="font-display font-black text-text-primary text-sm group-hover:text-primary transition-colors">{item.studentName || 'Student Entity'}</p>
                                  <p className="text-[9px] font-black uppercase tracking-widest text-text-secondary opacity-60">Verified Participant</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <Badge variant="ghost" className="bg-accent/5 text-accent border border-accent/10 font-bold text-[9px] rounded-lg">
                                  {item.examTitle || 'Legacy Exam'}
                                </Badge>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-display font-black text-success group-hover:scale-105 transition-transform inline-block">৳{(item.amountInTaka || 0).toLocaleString()}</span>
                            </td>
                            <td className="px-6 py-4">
                               <Badge className={cn(
                                 "font-black px-2 py-0.5 rounded-lg text-[8px] uppercase tracking-wider",
                                 (item.method || '').toLowerCase().includes('bkash')
                                   ? "bg-[#D12053]/10 text-[#D12053] border-[#D12053]/20"
                                   : "bg-[#F7941D]/10 text-[#F7941D] border-[#F7941D]/20"
                               )}>
                                 {item.method || 'Manual Portal'}
                               </Badge>
                            </td>
                            <td className="px-6 py-4 text-right">
                               <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-9 px-3 rounded-lg hover:bg-primary hover:text-white text-primary font-black uppercase tracking-widest text-[8px] transition-all active:scale-95"
                                onClick={() => handleDownloadInvoice(item)}
                               >
                                 <Download className="w-3 h-3 mr-1.5" /> Invoice
                               </Button>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                      {earningsHistory.length === 0 && !isLoading && (
                        <tr>
                          <td colSpan={6} className="px-8 py-32 text-center">
                            <div className="flex flex-col items-center gap-4 opacity-20">
                              <Wallet className="w-16 h-16" />
                              <p className="text-xs font-black uppercase tracking-[0.2em]">Zero settlement history found</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
