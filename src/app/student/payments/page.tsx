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
import { CreditCard, Loader2, ArrowRight } from 'lucide-react';

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

const statusStyles: Record<PaymentStatus, string> = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  success: 'bg-success/10 text-success border-success/20',
  failed: 'bg-danger/10 text-danger border-danger/20',
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
      <div className="space-y-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">Payment History</h1>
            <p className="text-text-secondary mt-1">আপনার pending/success/failed সব payment request এখানে দেখুন।</p>
          </div>
          <Link href="/student/exams">
            <Button className="rounded-xl">Go to Exams</Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-border bg-bg-card/50">
            <CardContent className="pt-6">
              <p className="text-sm text-text-secondary">Total</p>
              <p className="text-2xl font-bold mt-1">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="border-border bg-bg-card/50">
            <CardContent className="pt-6">
              <p className="text-sm text-text-secondary">Pending</p>
              <p className="text-2xl font-bold mt-1 text-warning">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card className="border-border bg-bg-card/50">
            <CardContent className="pt-6">
              <p className="text-sm text-text-secondary">Success</p>
              <p className="text-2xl font-bold mt-1 text-success">{stats.success}</p>
            </CardContent>
          </Card>
          <Card className="border-border bg-bg-card/50">
            <CardContent className="pt-6">
              <p className="text-sm text-text-secondary">Failed</p>
              <p className="text-2xl font-bold mt-1 text-danger">{stats.failed}</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {[
            { id: 'all', label: 'All' },
            { id: 'pending', label: 'Pending' },
            { id: 'success', label: 'Success' },
            { id: 'failed', label: 'Failed' },
          ].map((item) => (
            <Button
              key={item.id}
              variant={activeFilter === item.id ? 'primary' : 'outline'}
              className="rounded-xl"
              onClick={() => setActiveFilter(item.id as 'all' | PaymentStatus)}
            >
              {item.label}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredPayments.length === 0 ? (
          <Card className="border-border bg-bg-card/50">
            <CardContent className="py-12 text-center text-text-secondary">
              এই filter এ কোনো payment পাওয়া যায়নি।
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredPayments.map((payment) => {
              const title =
                payment.subject?.name ||
                payment.modelTest?.name ||
                payment.exam?.title ||
                'Payment';

              const type = payment.subject
                ? 'Subject'
                : payment.modelTest
                  ? 'Model Test'
                  : payment.exam
                    ? 'Exam'
                    : 'Payment';

              const destination =
                payment.subject?.id
                  ? `/student/exams/subject/${payment.subject.id}`
                  : payment.modelTest?.id
                    ? `/student/exams/modeltest/${payment.modelTest.id}`
                    : '/student/exams';

              return (
                <Card key={payment.id} className="border-border bg-bg-card/50">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="text-lg">{title}</CardTitle>
                      <Badge className={cn('capitalize', statusStyles[payment.status])}>
                        {payment.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-text-secondary">
                    <p className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" /> {type}
                    </p>
                    <p>Amount: ৳{Math.floor(Number(payment.totalAmount || 0) / 100)}</p>
                    <p>Method: {payment.method || '-'}</p>
                    <p>Transaction ID: {payment.transactionId || '-'}</p>
                    <p>Sender: {payment.senderNumber || '-'}</p>
                    <p>Date: {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : '-'}</p>
                    <div className="pt-2">
                      <Link href={destination}>
                        <Button variant="outline" className="rounded-xl">
                          Open Related Exams <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
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
