'use client';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useGetTeacherEarningsDetailsQuery } from '@/store/slices/api/adminApi';

const formatCurrency = (amount: number) => `৳${Math.round(amount).toLocaleString('en-US')}`;

export default function TeacherEarningsByIdPage() {
  const router = useRouter();
  const params = useParams<{ teacherId: string }>();
  const teacherId = params?.teacherId;

  const { data, isLoading, isError } = useGetTeacherEarningsDetailsQuery(teacherId || '', {
    skip: !teacherId,
  });

  const totals = useMemo(() => {
    const history = data?.paymentHistory || [];
    const gross = history.reduce((acc, item) => acc + (item.totalAmountInTaka || 0), 0);
    const platform = history.reduce((acc, item) => acc + (item.platformAmountInTaka || 0), 0);
    return { gross, platform };
  }, [data]);

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-20">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">Teacher Earnings Details</h1>
            <p className="text-text-secondary mt-1">এই teacher কত earning করেছে তার full breakdown।</p>
          </div>
          <Button variant="outline" className="rounded-xl border-border" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : isError || !data ? (
          <div className="text-center p-10 text-danger font-bold">Failed to load teacher earnings details.</div>
        ) : (
          <>
            <Card className="border-border bg-bg-card/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <span>{data.teacher.name}</span>
                  <Badge className="bg-success/10 text-success border border-success/20">Approved</Badge>
                </CardTitle>
                <p className="text-sm text-text-secondary">{data.teacher.email}</p>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-bg-surface border border-border rounded-xl p-4">
                  <p className="text-xs text-text-secondary uppercase tracking-wider">Teacher Earned</p>
                  <p className="text-xl font-bold text-accent mt-1">{formatCurrency(data.teacher.totalEarningsInTaka)}</p>
                </div>
                <div className="bg-bg-surface border border-border rounded-xl p-4">
                  <p className="text-xs text-text-secondary uppercase tracking-wider">Gross Sales</p>
                  <p className="text-xl font-bold mt-1">{formatCurrency(totals.gross)}</p>
                </div>
                <div className="bg-bg-surface border border-border rounded-xl p-4">
                  <p className="text-xs text-text-secondary uppercase tracking-wider">Platform Share</p>
                  <p className="text-xl font-bold text-primary mt-1">{formatCurrency(totals.platform)}</p>
                </div>
                <div className="bg-bg-surface border border-border rounded-xl p-4">
                  <p className="text-xs text-text-secondary uppercase tracking-wider">Successful Payments</p>
                  <p className="text-xl font-bold mt-1">{data.successPayments}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-bg-card/50 overflow-hidden">
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-bg-surface text-text-secondary text-[10px] uppercase tracking-widest font-bold">
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Student</th>
                      <th className="px-6 py-4">Exam</th>
                      <th className="px-6 py-4">Total</th>
                      <th className="px-6 py-4">Teacher</th>
                      <th className="px-6 py-4">Platform</th>
                      <th className="px-6 py-4">Method</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-sm">
                    {data.paymentHistory.map((item) => (
                      <tr key={item.paymentId} className="hover:bg-bg-surface/50 transition-colors">
                        <td className="px-6 py-4 text-text-secondary">
                          {item.approvedAt
                            ? new Date(item.approvedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: '2-digit',
                                year: 'numeric',
                              })
                            : 'N/A'}
                        </td>
                        <td className="px-6 py-4 font-medium">{item.studentName}</td>
                        <td className="px-6 py-4">{item.examTitle}</td>
                        <td className="px-6 py-4 font-bold">{formatCurrency(item.totalAmountInTaka)}</td>
                        <td className="px-6 py-4 text-accent font-bold">{formatCurrency(item.teacherAmountInTaka)}</td>
                        <td className="px-6 py-4 text-primary font-bold">{formatCurrency(item.platformAmountInTaka)}</td>
                        <td className="px-6 py-4 uppercase text-[10px] tracking-wider">{item.method}</td>
                      </tr>
                    ))}
                    {data.paymentHistory.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-text-secondary">
                          No successful payment history found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
