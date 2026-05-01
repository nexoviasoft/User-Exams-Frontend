'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wallet, CalendarClock } from 'lucide-react';
import { useGetTeacherEarningsOverviewQuery } from '@/store/slices/api/adminApi';

const formatCurrency = (amount: number) => `৳${Math.round(amount).toLocaleString('en-US')}`;

export default function TeacherEarningsDetailsPage() {
  const { data = [], isLoading, isError } = useGetTeacherEarningsOverviewQuery();

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-20">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Teacher Earnings Details</h1>
          <p className="text-text-secondary mt-1">Approved teacher-রা কে কত earned করেছে তা এখানে দেখা যাবে।</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <div className="text-center p-10 text-danger font-bold">Failed to load earnings data.</div>
        ) : data.length === 0 ? (
          <div className="text-center p-10 text-text-secondary bg-bg-card/50 rounded-xl border border-border">
            No approved teacher earnings data found.
          </div>
        ) : (
          <div className="grid gap-4">
            {data.map((item) => (
              <Card key={item.teacherId} className="border-border bg-bg-card/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between gap-3">
                    <span>{item.name}</span>
                    <Badge className="bg-success/10 text-success border border-success/20">Approved</Badge>
                  </CardTitle>
                  <p className="text-sm text-text-secondary">{item.email}</p>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-bg-surface border border-border rounded-xl p-4">
                    <p className="text-xs uppercase tracking-wider text-text-secondary">Total Earned</p>
                    <p className="text-xl font-bold text-accent mt-1">{formatCurrency(item.totalEarningsInTaka)}</p>
                  </div>
                  <div className="bg-bg-surface border border-border rounded-xl p-4">
                    <p className="text-xs uppercase tracking-wider text-text-secondary">Successful Payments</p>
                    <p className="text-xl font-bold mt-1">{item.successPayments}</p>
                  </div>
                  <div className="bg-bg-surface border border-border rounded-xl p-4">
                    <p className="text-xs uppercase tracking-wider text-text-secondary">Phone</p>
                    <p className="text-sm font-medium mt-1">{item.phone || 'N/A'}</p>
                  </div>
                  <div className="bg-bg-surface border border-border rounded-xl p-4">
                    <p className="text-xs uppercase tracking-wider text-text-secondary flex items-center gap-1">
                      <CalendarClock className="w-3 h-3" /> Last Approved
                    </p>
                    <p className="text-sm font-medium mt-1">
                      {item.lastApprovedAt
                        ? new Date(item.lastApprovedAt).toLocaleString('en-US', {
                            month: 'short',
                            day: '2-digit',
                            year: 'numeric',
                          })
                        : 'N/A'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
