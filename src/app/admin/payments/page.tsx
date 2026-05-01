'use client';

import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  XCircle, 
  Search, 
  Filter, 
  Smartphone, 
  Loader2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  useApprovePaymentMutation,
  useGetPaymentsQuery,
  useRejectPaymentMutation,
  type ApiPayment,
  type PaymentStatusFilter,
} from '@/store/slices/api/paymentsApi';

type PaymentStatusTab = 'Pending' | 'Approved' | 'Rejected' | 'All';

type PaymentRow = {
  id: string;
  student: string;
  exam: string;
  method: string;
  txnId: string;
  sender: string;
  amount: string;
  createdAt: string;
  status: string;
};

const statusQueryMap: Record<Exclude<PaymentStatusTab, 'All'>, PaymentStatusFilter> = {
  Pending: 'pending',
  Approved: 'success',
  Rejected: 'failed',
};

const statusLabelMap: Record<string, string> = {
  pending: 'Pending',
  success: 'Approved',
  failed: 'Rejected',
};

const formatMethod = (method?: string) => {
  if (!method) return 'N/A';
  const lower = method.toLowerCase();
  if (lower === 'bkash') return 'bKash';
  if (lower === 'nagad') return 'Nagad';
  return method;
};

const formatAmount = (amountInPaisa?: number) => `৳${((amountInPaisa || 0) / 100).toFixed(0)}`;

const formatRelativeTime = (isoDate?: string) => {
  if (!isoDate) return 'N/A';
  const value = new Date(isoDate);
  if (Number.isNaN(value.getTime())) return 'N/A';

  const diffMs = value.getTime() - Date.now();
  const diffSeconds = Math.round(diffMs / 1000);
  const absSeconds = Math.abs(diffSeconds);
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  if (absSeconds < 60) return rtf.format(diffSeconds, 'second');
  const diffMinutes = Math.round(diffSeconds / 60);
  if (Math.abs(diffMinutes) < 60) return rtf.format(diffMinutes, 'minute');
  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, 'hour');
  const diffDays = Math.round(diffHours / 24);
  return rtf.format(diffDays, 'day');
};

export default function AdminPaymentsPage() {
  const [tab, setTab] = useState<PaymentStatusTab>('Pending');
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRow | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const statusFilter: PaymentStatusFilter | undefined = tab === 'All' ? undefined : statusQueryMap[tab];
  const {
    data: paymentsResponse,
    isLoading,
    isFetching,
    error,
  } = useGetPaymentsQuery(statusFilter);
  const [approvePayment] = useApprovePaymentMutation();
  const [rejectPayment] = useRejectPaymentMutation();

  const payments = useMemo<PaymentRow[]>(
    () =>
      (paymentsResponse?.items || []).map((item: ApiPayment) => ({
        id: item.id,
        student: item.student?.user?.name || 'N/A',
        exam: item.exam?.title || 'N/A',
        method: formatMethod(item.method),
        txnId: item.transactionId || 'N/A',
        sender: item.senderNumber || 'N/A',
        amount: formatAmount(item.totalAmount),
        createdAt: item.createdAt,
        status: statusLabelMap[item.status] || item.status || 'N/A',
      })),
    [paymentsResponse]
  );

  const isPageLoading = isLoading || isFetching;

  const filteredPayments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return payments;
    return payments.filter((p) => p.txnId.toLowerCase().includes(query) || p.sender.toLowerCase().includes(query));
  }, [payments, searchQuery]);

  const handleApprove = async () => {
    if (!selectedPayment) return;
    setIsSubmitting(true);
    try {
      await approvePayment(selectedPayment.id).unwrap();
      toast.success('Payment approved successfully!');
      setIsApproveModalOpen(false);
      setSelectedPayment(null);
    } catch (error) {
      toast.error('Approval failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason) return toast.error('রিজেক্ট করার কারণ লিখুন');
    if (!selectedPayment) return;

    setIsSubmitting(true);
    try {
      await rejectPayment({
        paymentId: selectedPayment.id,
        rejectionReason: rejectReason,
      }).unwrap();
      toast.success('Payment rejected.');
      setIsRejectModalOpen(false);
      setRejectReason('');
      setSelectedPayment(null);
    } catch (error) {
      toast.error('Rejection failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (error) {
      toast.error('Payment data load করতে সমস্যা হয়েছে।');
    }
  }, [error]);

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">Payments Approval 💳</h1>
            <p className="text-text-secondary mt-1">শিক্ষার্থীদের পাঠানো পেমেন্টগুলো যাচাই করুন।</p>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
               <input 
                 type="text" 
                 placeholder="Search by TxnID or Phone..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="bg-bg-surface border border-border rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-w-[280px]"
               />
             </div>
             <Button variant="outline" className="border-border rounded-xl h-10"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-bg-card border border-border p-1 rounded-xl w-fit">
           {(['Pending', 'Approved', 'Rejected', 'All'] as PaymentStatusTab[]).map((t) => (
             <button
               key={t}
               onClick={() => setTab(t)}
               className={cn(
                 "px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
                 tab === t ? "bg-primary text-white" : "text-text-secondary hover:text-text-primary"
               )}
             >
               {t}
               {t === 'Pending' && filteredPayments.length > 0 && (
                 <span className={cn("px-1.5 py-0.5 rounded-full text-[10px]", tab === t ? "bg-white text-primary" : "bg-accent text-white")}>
                   {filteredPayments.length}
                 </span>
               )}
             </button>
           ))}
        </div>

        {/* Payments Table */}
        <Card className="border-border bg-bg-card/50 overflow-hidden">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-surface text-text-secondary text-[10px] uppercase tracking-widest font-bold">
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Exam</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4">TxnID / Sender</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isPageLoading && (
                  <tr>
                    <td colSpan={7} className="px-6 py-14 text-center">
                      <div className="flex items-center justify-center gap-2 text-text-secondary">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading payments...
                      </div>
                    </td>
                  </tr>
                )}
                {!isPageLoading && filteredPayments.map((p) => (
                  <tr key={p.id} className="text-sm hover:bg-bg-surface/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-text-primary">{p.student}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-[180px] truncate text-text-secondary font-medium">{p.exam}</div>
                    </td>
                    <td className="px-6 py-4">
                       <Badge variant="outline" className={cn(
                         "rounded-md text-[10px]",
                         p.method === 'bKash' ? "bg-[#D12053]/5 text-[#D12053] border-[#D12053]/20" : "bg-[#F7941D]/5 text-[#F7941D] border-[#F7941D]/20"
                       )}>
                         <Smartphone className="w-3 h-3 mr-1" /> {p.method}
                       </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-display font-bold text-xs text-primary">{p.txnId}</div>
                      <div className="text-[10px] text-text-secondary mt-1">{p.sender}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-accent">{p.amount}</td>
                    <td className="px-6 py-4 text-[10px] text-text-secondary uppercase font-bold tracking-wider">{formatRelativeTime(p.createdAt)}</td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-2">
                         {p.status === 'Pending' ? (
                           <>
                         <Button 
                           variant="outline" 
                           size="sm" 
                           className="bg-success/10 text-success border-success/20 hover:bg-success hover:text-white rounded-lg font-bold"
                           onClick={() => { setSelectedPayment(p); setIsApproveModalOpen(true); }}
                         >
                           <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
                         </Button>
                         <Button 
                           variant="outline" 
                           size="sm" 
                           className="bg-danger/10 text-danger border-danger/20 hover:bg-danger hover:text-white rounded-lg font-bold"
                           onClick={() => { setSelectedPayment(p); setIsRejectModalOpen(true); }}
                         >
                           <XCircle className="w-4 h-4 mr-1" /> Reject
                         </Button>
                           </>
                         ) : (
                           <Badge variant="outline" className="rounded-md text-[10px]">
                             {p.status}
                           </Badge>
                         )}
                       </div>
                    </td>
                  </tr>
                ))}
                {!isPageLoading && filteredPayments.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-20 text-center">
                       <div className="flex flex-col items-center gap-4 opacity-30">
                         <CheckCircle2 className="w-16 h-16" />
                         <p className="font-bold">সব পেমেন্ট ভেরিফাই করা হয়েছে!</p>
                       </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Approve Modal */}
        <Dialog open={isApproveModalOpen} onOpenChange={setIsApproveModalOpen}>
          <DialogContent className="bg-bg-card border-border sm:max-w-[400px]">
            <DialogHeader className="items-center text-center">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center text-success mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <DialogTitle className="text-2xl font-display font-bold">নিশ্চিত করুন</DialogTitle>
              <DialogDescription className="text-text-secondary pt-2">
                এই payment approve করবেন?
              </DialogDescription>
            </DialogHeader>
            <div className="bg-bg-surface p-4 rounded-2xl border border-border space-y-3">
               <div className="flex justify-between text-sm"><span className="text-text-secondary">Student:</span> <span className="font-bold">{selectedPayment?.student}</span></div>
               <div className="flex justify-between text-sm"><span className="text-text-secondary">Amount:</span> <span className="font-bold text-accent">{selectedPayment?.amount}</span></div>
               <div className="flex justify-between text-sm"><span className="text-text-secondary">TxnID:</span> <span className="font-bold text-primary">{selectedPayment?.txnId}</span></div>
            </div>
            <DialogFooter className="sm:justify-center gap-4 pt-6">
              <Button variant="ghost" onClick={() => setIsApproveModalOpen(false)} className="px-8">না</Button>
              <Button onClick={handleApprove} disabled={isSubmitting} className="bg-success hover:bg-success-dark text-white font-bold px-10">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                হ্যাঁ, Approve করি
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Modal */}
        <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
          <DialogContent className="bg-bg-card border-border sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-display font-bold">Payment Reject করুন</DialogTitle>
              <DialogDescription className="text-text-secondary">
                রিজেক্ট করার কারণ উল্লেখ করুন। স্টুডেন্ট এটি দেখতে পারবে।
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <textarea 
                placeholder="যেমন: ভুল Transaction ID, ইনভ্যালিড এমাউন্ট..." 
                className="w-full bg-bg-surface border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-danger/50 min-h-[100px]"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            <DialogFooter className="gap-4">
              <Button variant="ghost" onClick={() => setIsRejectModalOpen(false)} className="flex-1">বাতিল</Button>
              <Button onClick={handleReject} disabled={isSubmitting} className="flex-1 bg-danger hover:bg-danger-dark text-white font-bold">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Confirm Reject'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
