'use client';

import { useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Banknote, 
  TrendingUp, 
  Clock, 
  ArrowUpRight,
  User as UserIcon,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGetMyEarningsQuery } from '@/store/slices/api/teacherDashboardApi';

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

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-20">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Earnings & Payments 💰</h1>
          <p className="text-text-secondary mt-1">আপনার আয়ের হিসাব এবং পেমেন্ট হিস্ট্রি দেখুন।</p>
        </div>

        {/* Earnings Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-border bg-primary/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Banknote className="w-24 h-24 rotate-12" />
            </div>
            <CardHeader>
              <CardTitle className="text-sm font-bold text-primary uppercase tracking-widest">Total Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-display font-extrabold text-primary">৳{totalEarnings.toLocaleString()}</div>
              <div className="mt-4 flex items-center gap-2 text-success font-bold text-sm">
                <ArrowUpRight className="w-4 h-4" /> Live API earnings data
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-bg-card/50">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-text-secondary uppercase tracking-widest">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-display font-bold">৳{thisMonthEarnings.toLocaleString()}</div>
              <p className="text-xs text-text-secondary mt-2 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Based on current billing cycle
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-bg-card/50">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-text-secondary uppercase tracking-widest">Pending Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-display font-bold text-warning">৳{pendingVerification}</div>
              <p className="text-xs text-text-secondary mt-2 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Admin verification in progress
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Payment History */}
        <Card className="border-border bg-bg-card/50 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Recent Payments</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-surface text-text-secondary text-xs uppercase tracking-wider font-bold">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Exam</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td className="px-6 py-6 text-text-secondary" colSpan={6}>Loading payment history...</td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td className="px-6 py-6 text-red-400" colSpan={6}>Failed to load payment history.</td>
                  </tr>
                ) : earningsHistory.length === 0 ? (
                  <tr>
                    <td className="px-6 py-6 text-text-secondary" colSpan={6}>No earnings history found.</td>
                  </tr>
                ) : earningsHistory.map((item) => (
                  <tr key={item.paymentId} className="text-sm hover:bg-bg-surface/50 transition-colors">
                    <td className="px-6 py-4 text-text-secondary">{formatDate(item.approvedAt)}</td>
                    <td className="px-6 py-4 font-bold flex items-center gap-2">
                       <div className="w-8 h-8 rounded-full bg-bg-surface flex items-center justify-center text-text-secondary">
                         <UserIcon className="w-4 h-4" />
                       </div>
                       {item.studentName || 'Unknown Student'}
                    </td>
                    <td className="px-6 py-4 font-medium">{item.examTitle || 'N/A'}</td>
                    <td className="px-6 py-4 font-bold text-success">৳{(item.amountInTaka || 0).toLocaleString()}</td>
                    <td className="px-6 py-4">
                       <Badge variant="outline" className={cn(
                         "rounded-md",
                         (item.method || '').toLowerCase().includes('bkash')
                           ? "bg-[#D12053]/5 text-[#D12053] border-[#D12053]/20"
                           : "bg-[#F7941D]/5 text-[#F7941D] border-[#F7941D]/20"
                       )}>
                         {item.method || 'Manual'}
                       </Badge>
                    </td>
                    <td className="px-6 py-4 text-success font-bold">Completed</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
