'use client';

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

export default function EarningsPage() {
  const earningsHistory = [
    { id: '1', date: 'Oct 12, 2024', student: 'Rahim Ahmed', exam: 'BCS Preliminary 01', amount: '৳100', method: 'bKash' },
    { id: '2', date: 'Oct 11, 2024', student: 'Karim Ullah', exam: 'Medical Prep Mock', amount: '৳150', method: 'Nagad' },
    { id: '3', date: 'Oct 10, 2024', student: 'Sumaya Akter', exam: 'BCS Preliminary 01', amount: '৳100', method: 'bKash' },
    { id: '4', date: 'Oct 09, 2024', student: 'Jamil Hasan', exam: 'DU Admission KA', amount: '৳200', method: 'bKash' },
    { id: '5', date: 'Oct 08, 2024', student: 'Tisha Rahman', exam: 'Medical Prep Mock', amount: '৳150', method: 'Nagad' },
  ];

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
              <div className="text-5xl font-display font-extrabold text-primary">৳45,200</div>
              <div className="mt-4 flex items-center gap-2 text-success font-bold text-sm">
                <ArrowUpRight className="w-4 h-4" /> 12% increase from last month
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-bg-card/50">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-text-secondary uppercase tracking-widest">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-display font-bold">৳12,450</div>
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
              <div className="text-4xl font-display font-bold text-warning">৳1,500</div>
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
                {earningsHistory.map((item) => (
                  <tr key={item.id} className="text-sm hover:bg-bg-surface/50 transition-colors">
                    <td className="px-6 py-4 text-text-secondary">{item.date}</td>
                    <td className="px-6 py-4 font-bold flex items-center gap-2">
                       <div className="w-8 h-8 rounded-full bg-bg-surface flex items-center justify-center text-text-secondary">
                         <UserIcon className="w-4 h-4" />
                       </div>
                       {item.student}
                    </td>
                    <td className="px-6 py-4 font-medium">{item.exam}</td>
                    <td className="px-6 py-4 font-bold text-success">{item.amount}</td>
                    <td className="px-6 py-4">
                       <Badge variant="outline" className={cn(
                         "rounded-md",
                         item.method === 'bKash' ? "bg-[#D12053]/5 text-[#D12053] border-[#D12053]/20" : "bg-[#F7941D]/5 text-[#F7941D] border-[#F7941D]/20"
                       )}>
                         {item.method}
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
