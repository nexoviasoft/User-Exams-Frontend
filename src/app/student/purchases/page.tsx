'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { CreditCard, Loader2 } from 'lucide-react';
import Link from 'next/link';

type Payment = {
  id: string;
  status: 'pending' | 'success' | 'failed';
  createdAt: string;
  subject?: { id: string; name: string } | null;
  modelTest?: { id: string; name: string } | null;
  exam?: { id: string; title: string } | null;
  totalAmount: number;
};

export default function StudentPurchasesPage() {
  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['student-my-purchases'],
    queryFn: async () => (await axiosInstance.get('/payments/my')).data as Payment[],
  });

  const successfulPayments = payments.filter((p) => p.status === 'success');

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">My Purchases</h1>
            <p className="text-text-secondary mt-1">আপনি যেগুলো কিনেছেন, সেগুলো এখান থেকে দেখুন।</p>
          </div>
          <Link href="/student/exams">
            <Button className="rounded-xl">Go to Exams</Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : successfulPayments.length === 0 ? (
          <Card className="border-border bg-bg-card/50">
            <CardContent className="py-12 text-center text-text-secondary">
              এখনো কোনো successful purchase নেই।
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {successfulPayments.map((payment) => {
              const title =
                payment.subject?.name ||
                payment.modelTest?.name ||
                payment.exam?.title ||
                'Purchase';
              const type = payment.subject
                ? 'Subject'
                : payment.modelTest
                  ? 'Model Test'
                  : payment.exam
                    ? 'Exam'
                    : 'Purchase';
              const destination =
                payment.subject?.id
                  ? `/student/exams/subject/${payment.subject.id}`
                  : payment.modelTest?.id
                    ? `/student/exams/modeltest/${payment.modelTest.id}`
                    : '/student/exams';
              const leaderboardLink =
                payment.subject?.id
                  ? `/student/leaderboard/subject/${payment.subject.id}`
                  : payment.modelTest?.id
                    ? `/student/leaderboard/model-test/${payment.modelTest.id}`
                    : null;
              const analyticsLink =
                payment.subject?.id
                  ? `/student/analytics/subject/${payment.subject.id}`
                  : payment.modelTest?.id
                    ? `/student/analytics/model-test/${payment.modelTest.id}`
                    : null;

              return (
                <Card key={payment.id} className="border-border bg-bg-card/50">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="text-lg">{title}</CardTitle>
                      <Badge className="bg-success/10 text-success border-success/20">Paid</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-text-secondary">
                    <p className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" /> {type}
                    </p>
                    <p>Amount: ৳{Math.floor(Number(payment.totalAmount || 0) / 100)}</p>
                    <p>Date: {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : '-'}</p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Link href={destination}>
                        <Button variant="outline" className="rounded-xl">Open Exams</Button>
                      </Link>
                      {leaderboardLink && (
                        <Link href={leaderboardLink}>
                          <Button variant="outline" className="rounded-xl">Leaderboard</Button>
                        </Link>
                      )}
                      {analyticsLink && (
                        <Link href={analyticsLink}>
                          <Button variant="outline" className="rounded-xl">Analytics</Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
