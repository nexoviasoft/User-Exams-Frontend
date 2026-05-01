'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';
import { ArrowLeft, BookOpen, Loader2, Smartphone, Trophy } from 'lucide-react';

type PaymentInstruction = {
  number: string;
  instruction: string;
};

type ExamItem = {
  id: string;
  title: string;
  totalQuestions: number;
  isFree?: boolean;
  price?: number; // paisa
};

type BundleDetail = {
  id: string;
  name: string;
  isFree: boolean;
  price: number;
  exams: ExamItem[];
  teacher?: { user?: { name?: string } };
  examType?: { name?: string };
};

type StudentExamHistoryItem = {
  studentExamId: string;
  examId: string;
  score: number;
  totalQuestions: number;
  percentageScore: number;
  status: string;
  completedAt?: string | null;
};

export default function BundleExamListPage() {
  const params = useParams();
  const router = useRouter();
  const bundleType = params.bundleType as string;
  const bundleId = params.bundleId as string;
  const isSubject = bundleType === 'subject';

  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad'>('bkash');
  const [transactionId, setTransactionId] = useState('');
  const [senderNumber, setSenderNumber] = useState('');
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const { data: bundle, isLoading } = useQuery({
    queryKey: ['bundle-page', bundleType, bundleId],
    queryFn: async () => {
      const endpoint = isSubject ? `/subject/student/${bundleId}` : `/modeltest/student/${bundleId}`;
      const response = await axiosInstance.get(endpoint);
      return response.data as BundleDetail;
    },
    enabled: !!bundleId && (bundleType === 'subject' || bundleType === 'modeltest'),
  });

  const { data: paymentInstructions } = useQuery({
    queryKey: ['payment-instructions'],
    queryFn: async () => {
      const response = await axiosInstance.get('/payments/instructions');
      return response.data as Record<'bkash' | 'nagad', PaymentInstruction>;
    },
  });

  const { data: myPayments = [] } = useQuery({
    queryKey: ['my-payments-for-bundle-page'],
    queryFn: async () => {
      const response = await axiosInstance.get('/payments/my');
      return response.data as any[];
    },
  });

  const { data: examHistory = [] } = useQuery({
    queryKey: ['student-exam-history-for-bundle-page'],
    queryFn: async () => {
      const response = await axiosInstance.get('/student-exams/history');
      return response.data as StudentExamHistoryItem[];
    },
  });

  const successfulPayments = myPayments.filter((p: any) => p.status === 'success');
  const hasBundleAccess = useMemo(() => {
    return successfulPayments.some((p: any) =>
      isSubject ? p.subject?.id === bundleId : p.modelTest?.id === bundleId,
    );
  }, [successfulPayments, isSubject, bundleId]);

  const paidExamIds = useMemo(
    () => new Set(successfulPayments.flatMap((p: any) => [p.exam?.id, ...(p.selectedExamIds || [])]).filter(Boolean)),
    [successfulPayments],
  );

  const latestCompletedResultByExamId = useMemo(() => {
    const map = new Map<string, StudentExamHistoryItem>();
    examHistory
      .filter((item) => item.status === 'completed')
      .forEach((item) => {
        const prev = map.get(item.examId);
        if (!prev) {
          map.set(item.examId, item);
          return;
        }
        const prevTime = prev.completedAt ? new Date(prev.completedAt).getTime() : 0;
        const currTime = item.completedAt ? new Date(item.completedAt).getTime() : 0;
        if (currTime >= prevTime) {
          map.set(item.examId, item);
        }
      });
    return map;
  }, [examHistory]);

  const startExamMutation = useMutation({
    mutationFn: async (examId: string) => {
      const response = await axiosInstance.post('/student-exams/start', { examId });
      return response.data as { studentExamId?: string };
    },
    onSuccess: (data, examId) => {
      toast.success('Exam started');
      router.push(`/student/take-exam/${data.studentExamId || examId}`);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Exam start failed');
    },
  });

  const paymentAmountInPaisa = useMemo(() => {
    if (!bundle) return 0;
    if (!selectedExamId) return Number(bundle.price || 0);
    const selectedExam = (bundle.exams || []).find((e) => e.id === selectedExamId);
    if (!selectedExam) return Number(bundle.price || 0);
    return Number(selectedExam.price || 0);
  }, [bundle, selectedExamId]);

  const paymentMutation = useMutation({
    mutationFn: async () => {
      if (!bundle) return null;
      const payload = isSubject
        ? {
            subjectId: bundle.id,
            method: paymentMethod,
            transactionId,
            senderNumber,
            selectedExamIds: selectedExamId ? [selectedExamId] : [],
          }
        : {
            modelTestId: bundle.id,
            method: paymentMethod,
            transactionId,
            senderNumber,
            selectedExamIds: selectedExamId ? [selectedExamId] : [],
          };
      const response = await axiosInstance.post('/payments/request', payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Payment request submitted');
      setTransactionId('');
      setSenderNumber('');
      setSelectedExamId(null);
      setIsPaymentModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Payment request failed');
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center p-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!bundle) {
    return (
      <DashboardLayout>
        <div className="text-center text-danger py-16">এই bundle পাওয়া যায়নি।</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <Button variant="outline" className="rounded-xl" onClick={() => router.push('/student/exams')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Exam Types
        </Button>

        <Card className="border-border bg-bg-card/60">
          <CardHeader>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <CardTitle className="text-2xl font-display">{bundle.name}</CardTitle>
              <Badge className={cn(bundle.isFree ? 'bg-success/10 text-success border-success/20' : 'bg-accent/10 text-accent border-accent/20')}>
                {bundle.isFree ? 'FREE' : `৳${Math.floor(bundle.price / 100)}`}
              </Badge>
            </div>
            <p className="text-sm text-text-secondary">
              By {bundle.teacher?.user?.name || 'Teacher'} • {bundle.examType?.name || '-'} • {bundle.exams?.length || 0} Exams
            </p>
            {!bundle.isFree && (
              <div>
                {hasBundleAccess ? (
                  <Badge className="bg-success/10 text-success border-success/20">Purchased (All Exams Unlocked)</Badge>
                ) : (
                  <Badge className="bg-warning/10 text-warning border-warning/20">Not Purchased</Badge>
                )}
              </div>
            )}
          </CardHeader>
        </Card>

        {!bundle.isFree && !hasBundleAccess && (
          <Card className="border-border bg-bg-card/60">
            <CardHeader>
              <CardTitle className="text-lg">এই {isSubject ? 'Subject' : 'Model Test'} টি Paid</CardTitle>
              <p className="text-sm text-text-secondary">
                সব exam unlock করতে <span className="font-bold text-accent">সব কিনুন</span> চাপুন, অথবা নির্দিষ্ট exam কিনতে ওই exam card থেকে
                <span className="font-bold"> এইটা কিনুন</span> চাপুন।
              </p>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-3">
              <Button
                onClick={() => {
                  setSelectedExamId(null);
                  setIsPaymentModalOpen(true);
                }}
                className="rounded-xl"
              >
                সব কিনুন (৳{Math.floor((bundle.price || 0) / 100)})
              </Button>
              <p className="text-xs text-text-secondary">
                Payment method: bKash / Nagad, তারপর Transaction ID দিয়ে submit করুন।
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {(bundle.exams || []).map((exam) => {
            const canStart = bundle.isFree || hasBundleAccess || paidExamIds.has(exam.id);
            const latestResult = latestCompletedResultByExamId.get(exam.id);
            return (
              <Card key={exam.id} className="border-border bg-bg-card/40 hover:border-primary/30 transition-all">
                <CardHeader>
                  <CardTitle className="text-lg">{exam.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="space-y-2">
                    <div className="text-sm text-text-secondary flex items-center gap-2">
                      <BookOpen className="w-4 h-4" /> {exam.totalQuestions || 0} Questions
                    </div>
                    {latestResult ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          className={cn(
                            latestResult.percentageScore >= 40
                              ? 'bg-success/10 text-success border-success/20'
                              : 'bg-danger/10 text-danger border-danger/20',
                          )}
                        >
                          Your Result: {latestResult.score}/{latestResult.totalQuestions} ({latestResult.percentageScore}%)
                        </Badge>
                        <Link href={`/student/result/${latestResult.studentExamId}`}>
                          <Button variant="outline" size="sm">
                            Result দেখুন
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <p className="text-xs text-text-secondary">এখনও result নেই</p>
                    )}
                  </div>
                  <Badge className={cn(
                    exam.isFree ? 'bg-success/10 text-success border-success/20' : 'bg-accent/10 text-accent border-accent/20'
                  )}>
                    {exam.isFree ? 'FREE' : `৳${Math.floor(Number(exam.price || 0) / 100)}`}
                  </Badge>
                  {canStart ? (
                    <div className="flex gap-2">
                      <Button onClick={() => startExamMutation.mutate(exam.id)} disabled={startExamMutation.isPending}>
                        {startExamMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                        Exam দিন
                      </Button>
                      <Link href={`/student/leaderboard/${exam.id}`}>
                        <Button variant="outline">
                          <Trophy className="w-4 h-4 mr-1" /> Leaderboard
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedExamId(exam.id);
                          setIsPaymentModalOpen(true);
                        }}
                      >
                        এইটা কিনুন
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedExamId(null);
                          setIsPaymentModalOpen(true);
                        }}
                      >
                        সব কিনুন
                      </Button>
                      <Link href={`/student/leaderboard/${exam.id}`}>
                        <Button variant="outline">
                          <Trophy className="w-4 h-4 mr-1" /> Leaderboard
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Dialog
          open={isPaymentModalOpen && !bundle.isFree && !hasBundleAccess}
          onOpenChange={(open) => {
            setIsPaymentModalOpen(open);
            if (!open) {
              setSelectedExamId(null);
            }
          }}
        >
          <DialogContent className="bg-bg-card border-border sm:max-w-[460px]">
            <DialogHeader>
              <DialogTitle>Payment করুন</DialogTitle>
              <DialogDescription>
                {selectedExamId ? 'Selected exam purchase' : 'Full bundle purchase'} • Amount: ৳{Math.floor(paymentAmountInPaisa / 100)}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant={paymentMethod === 'bkash' ? 'primary' : 'outline'}
                  onClick={() => setPaymentMethod('bkash')}
                >
                  <Smartphone className="w-4 h-4 mr-1" /> bKash
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === 'nagad' ? 'primary' : 'outline'}
                  onClick={() => setPaymentMethod('nagad')}
                >
                  <Smartphone className="w-4 h-4 mr-1" /> Nagad
                </Button>
              </div>
              <p className="text-xs text-text-secondary">
                Send Money: <span className="font-bold">{paymentInstructions?.[paymentMethod]?.number || '01XXXXXXXXX'}</span>
              </p>
              <input
                className="w-full bg-bg-surface border border-border rounded-xl py-2 px-4 text-sm"
                placeholder="Transaction ID"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
              />
              <input
                className="w-full bg-bg-surface border border-border rounded-xl py-2 px-4 text-sm"
                placeholder="Sender Number"
                value={senderNumber}
                onChange={(e) => setSenderNumber(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!transactionId || !senderNumber) {
                    toast.error('Transaction ID এবং Sender Number দিন');
                    return;
                  }
                  paymentMutation.mutate();
                }}
                disabled={paymentMutation.isPending}
              >
                {paymentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Submit Payment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
