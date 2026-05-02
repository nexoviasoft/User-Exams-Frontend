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
import { ArrowLeft, BookOpen, Loader2, Smartphone, Trophy, User as UserIcon, Calendar, CheckCircle2, Lock, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

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
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-10 max-w-7xl mx-auto relative px-4"
      >
        {/* Background Decorative Glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Back Button & Header */}
        <div className="flex flex-col gap-6 relative z-10">
          <motion.div variants={itemVariants}>
            <Button 
              variant="ghost" 
              className="rounded-xl hover:bg-bg-card/60 group w-fit -ml-2" 
              onClick={() => router.push('/student/exams')}
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              সব Exams-এ ফিরে যান
            </Button>
          </motion.div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <motion.div variants={itemVariants} className="space-y-3">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black px-3 py-1 rounded-lg">
                  {isSubject ? 'SUBJECT BUNDLE' : 'MODEL TEST BUNDLE'}
                </Badge>
                {bundle.isFree && (
                  <Badge className="bg-success/10 text-success border-success/20 font-black px-3 py-1 rounded-lg">
                    FREE ACCESS
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-display font-black tracking-tight text-text-primary leading-tight">
                {bundle.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-text-secondary">
                <div className="flex items-center gap-2 font-bold bg-bg-card/40 px-3 py-1.5 rounded-xl border border-border/50">
                  <UserIcon className="w-4 h-4 text-primary" /> {bundle.teacher?.user?.name || 'Teacher'}
                </div>
                <div className="flex items-center gap-2 font-bold bg-bg-card/40 px-3 py-1.5 rounded-xl border border-border/50">
                   <BookOpen className="w-4 h-4 text-accent" /> {bundle.exams?.length || 0} Exams Available
                </div>
              </div>
            </motion.div>

            {!bundle.isFree && (
              <motion.div variants={itemVariants}>
                {hasBundleAccess ? (
                  <div className="flex items-center gap-3 bg-success/10 border border-success/20 p-4 rounded-[24px]">
                    <div className="w-12 h-12 rounded-2xl bg-success/20 flex items-center justify-center text-success">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-success uppercase tracking-widest">Ownership</div>
                      <div className="text-lg font-black text-text-primary">Purchased & Unlocked</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-end gap-3">
                    <div className="text-right">
                      <div className="text-xs font-black text-text-secondary uppercase tracking-widest mb-1">Full Bundle Price</div>
                      <div className="text-3xl font-display font-black text-primary">৳{Math.floor((bundle.price || 0) / 100)}</div>
                    </div>
                    <Button
                      onClick={() => {
                        setSelectedExamId(null);
                        setIsPaymentModalOpen(true);
                      }}
                      className="rounded-[20px] h-14 px-8 bg-primary hover:bg-primary-light shadow-xl shadow-primary/20 font-black text-base"
                    >
                      পুরো Bundle কিনুন
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Purchase CTA for non-owners */}
        {!bundle.isFree && !hasBundleAccess && (
          <motion.div variants={itemVariants}>
            <div className="p-8 rounded-[32px] bg-gradient-to-r from-bg-card/40 to-bg-card/20 backdrop-blur-xl border-2 border-border/50 relative overflow-hidden group">
              <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-primary/10 rounded-full blur-[60px] group-hover:bg-primary/20 transition-all" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-display font-black text-text-primary">এই {isSubject ? 'Subject' : 'Model Test'} টি Paid</h3>
                  <p className="text-text-secondary font-medium max-w-xl">
                    সবগুলো exam একসাথে পেতে <span className="text-primary font-bold">পুরো Bundle</span> কিনুন, অথবা আপনার প্রয়োজন অনুযায়ী নির্দিষ্ট exam টি আলাদাভাবেও কিনতে পারেন।
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-xs text-text-secondary font-black bg-bg-surface/50 px-4 py-2 rounded-xl border border-border/40">
                    PAYMENT: bKash / Nagad
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Exams Grid */}
        <div className="grid gap-6 md:grid-cols-2 relative z-10">
          <AnimatePresence mode="popLayout">
            {(bundle.exams || []).map((exam) => {
              const canStart = bundle.isFree || hasBundleAccess || paidExamIds.has(exam.id);
              const latestResult = latestCompletedResultByExamId.get(exam.id);
              return (
                <motion.div key={exam.id} variants={itemVariants} layout className="h-full">
                  <Card className="group border-border/50 bg-bg-card/40 backdrop-blur-xl hover:bg-bg-card/60 transition-all duration-300 rounded-[32px] overflow-hidden border-2 hover:border-primary/30 h-full flex flex-col">
                    <CardHeader className="p-8 pb-4">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                          <BookOpen className="w-6 h-6" />
                        </div>
                        <Badge className={cn(
                          "font-black px-4 py-1.5 rounded-xl text-[11px]",
                          exam.isFree ? 'bg-success/10 text-success border-success/20' : 'bg-accent/10 text-accent border-accent/20'
                        )}>
                          {exam.isFree ? 'FREE' : `৳${Math.floor(Number(exam.price || 0) / 100)}`}
                        </Badge>
                      </div>
                      <CardTitle className="text-2xl font-display font-black text-text-primary group-hover:text-primary transition-colors mb-2">
                        {exam.title}
                      </CardTitle>
                      <div className="flex items-center gap-3 text-sm font-bold text-text-secondary">
                        <span>{exam.totalQuestions || 0} Questions</span>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span>Duration: 20 Mins</span>
                      </div>
                    </CardHeader>

                    <CardContent className="px-8 pb-8 flex-1 flex flex-col justify-between gap-8">
                      {/* Result Section */}
                      <div className="min-h-[60px]">
                        {latestResult ? (
                          <div className="p-4 rounded-2xl bg-bg-surface/50 border border-border/40 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Latest Score</span>
                              <span className={cn(
                                "text-xs font-black px-2 py-0.5 rounded-lg",
                                latestResult.percentageScore >= 40 ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                              )}>
                                {latestResult.percentageScore >= 40 ? 'PASSED' : 'FAILED'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <div className="text-lg font-black text-text-primary">
                                {latestResult.score} <span className="text-text-secondary text-sm font-bold">/ {latestResult.totalQuestions}</span>
                              </div>
                              <Link href={`/student/result/${latestResult.studentExamId}`}>
                                <Button variant="outline" size="sm" className="rounded-xl font-bold h-9 bg-bg-card hover:bg-bg-surface transition-all">
                                  Result দেখুন
                                </Button>
                              </Link>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-text-secondary/60 text-sm italic py-2">
                            <Info className="w-4 h-4" /> এখনও exam দেয়া হয়নি
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3">
                        {canStart ? (
                          <>
                            <Button 
                              onClick={() => startExamMutation.mutate(exam.id)} 
                              disabled={startExamMutation.isPending}
                              className="flex-1 bg-primary hover:bg-primary-light text-white font-black rounded-2xl h-14 shadow-xl shadow-primary/20 text-base"
                            >
                              {startExamMutation.isPending ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                "Exam দিন"
                              )}
                            </Button>
                            <Link href={`/student/leaderboard/${exam.id}`}>
                              <Button variant="outline" className="rounded-2xl h-14 w-14 p-0 border-2 border-border/60 bg-bg-surface/50 hover:border-primary/40 transition-all flex items-center justify-center">
                                <Trophy className="w-6 h-6 text-accent" />
                              </Button>
                            </Link>
                          </>
                        ) : (
                          <>
                            <Button
                              onClick={() => {
                                setSelectedExamId(exam.id);
                                setIsPaymentModalOpen(true);
                              }}
                              className="flex-1 bg-bg-surface hover:bg-bg-card text-text-primary border-2 border-border/60 hover:border-primary/40 font-black rounded-2xl h-14 transition-all"
                            >
                              এইটা কিনুন
                            </Button>
                            <Button
                              onClick={() => {
                                setSelectedExamId(null);
                                setIsPaymentModalOpen(true);
                              }}
                              variant="outline"
                              className="flex-1 border-2 border-border/60 font-black rounded-2xl h-14 hover:bg-bg-card transition-all"
                            >
                              পুরো Bundle কিনুন
                            </Button>
                            <Link href={`/student/leaderboard/${exam.id}`}>
                              <Button variant="outline" className="rounded-2xl h-14 w-14 p-0 border-2 border-border/60 flex items-center justify-center">
                                <Trophy className="w-6 h-6 text-text-secondary" />
                              </Button>
                            </Link>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Payment Modal */}
        <Dialog
          open={isPaymentModalOpen && !bundle.isFree && !hasBundleAccess}
          onOpenChange={(open) => {
            setIsPaymentModalOpen(open);
            if (!open) {
              setSelectedExamId(null);
            }
          }}
        >
          <DialogContent className="bg-bg-card/90 backdrop-blur-2xl border-border/50 sm:max-w-[480px] rounded-[32px] overflow-hidden p-0">
            <div className="relative h-24 bg-gradient-to-r from-primary/20 to-accent/20">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg">
                  <Smartphone className="w-6 h-6 text-primary" />
                </div>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="text-center space-y-1">
                <DialogTitle className="text-2xl font-display font-black text-text-primary">Payment করুন</DialogTitle>
                <DialogDescription className="text-text-secondary font-bold">
                  {selectedExamId ? 'Selected exam purchase' : 'Full bundle purchase'} • <span className="text-primary">Amount: ৳{Math.floor(paymentAmountInPaisa / 100)}</span>
                </DialogDescription>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bkash')}
                    className={cn(
                      "flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all",
                      paymentMethod === 'bkash' ? "border-primary bg-primary/5 text-primary" : "border-border/40 bg-bg-surface/50 text-text-secondary hover:border-border"
                    )}
                  >
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", paymentMethod === 'bkash' ? "bg-primary text-white" : "bg-bg-card")}>
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <span className="font-black text-sm uppercase tracking-wider">bKash</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('nagad')}
                    className={cn(
                      "flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all",
                      paymentMethod === 'nagad' ? "border-primary bg-primary/5 text-primary" : "border-border/40 bg-bg-surface/50 text-text-secondary hover:border-border"
                    )}
                  >
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", paymentMethod === 'nagad' ? "bg-primary text-white" : "bg-bg-card")}>
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <span className="font-black text-sm uppercase tracking-wider">Nagad</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-bg-surface/50 border border-border/40 space-y-2">
                  <div className="flex justify-between items-center text-xs font-black text-text-secondary uppercase tracking-widest">
                    <span>Send Money Number</span>
                    <span className="text-accent">Official</span>
                  </div>
                  <div className="text-xl font-display font-black text-text-primary tracking-widest text-center py-2">
                    {paymentInstructions?.[paymentMethod]?.number || '01581782193'}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <input
                      className="w-full bg-bg-surface/50 border border-border/40 rounded-2xl py-3.5 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all shadow-sm"
                      placeholder="Transaction ID"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                    />
                  </div>
                  <div className="relative">
                    <input
                      className="w-full bg-bg-surface/50 border border-border/40 rounded-2xl py-3.5 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all shadow-sm"
                      placeholder="Sender Number (Bkash/Nagad Number)"
                      value={senderNumber}
                      onChange={(e) => setSenderNumber(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="ghost" className="flex-1 rounded-2xl h-12 font-bold" onClick={() => setIsPaymentModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="flex-[2] bg-primary hover:bg-primary-light text-white font-black rounded-2xl h-12 shadow-xl shadow-primary/20"
                  onClick={() => {
                    if (!transactionId || !senderNumber) {
                      toast.error('Transaction ID এবং Sender Number দিন');
                      return;
                    }
                    paymentMutation.mutate();
                  }}
                  disabled={paymentMutation.isPending}
                >
                  {paymentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Payment Submit"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </DashboardLayout>
  );
}
