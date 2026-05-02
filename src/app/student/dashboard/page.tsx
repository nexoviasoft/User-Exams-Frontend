'use client';

import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import {
  Loader2,
  Sparkles,
  TrendingUp,
  Layout,
  ArrowRight,
  BookOpen,
  ShoppingBag,
  FileBadge,
  Zap,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { useQuery, useMutation } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { motion } from 'framer-motion';

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

type PurchaseStats = {
  purchasedSubjects: number;
  purchasedExams: number;
};

type StudentExamHistoryItem = {
  studentExamId: string;
  examTitle: string;
  score: number;
  totalQuestions: number;
  percentageScore: number;
  status: string;
  startedAt: string;
  completedAt?: string | null;
};

type SubjectExam = {
  id: string;
  title: string;
  totalQuestions: number;
};

type StudentSubject = {
  id: string;
  name: string;
  isFree: boolean;
  price: number;
};

type StudentModelTest = {
  id: string;
  name: string;
  isFree: boolean;
  price: number;
};

type AvailableExam = {
  id: string;
  title: string;
  questions: number;
  duration: string;
  priceLabel: string;
  bundleId: string;
  bundleType: 'subject' | 'modeltest';
  isPurchased: boolean;
};

export default function StudentDashboard() {
  const router = useRouter();
  const { user } = useAuth();

  const { data: purchaseStats } = useQuery({
    queryKey: ['student-purchase-stats'],
    queryFn: async () => {
      const response = await axiosInstance.get('/payments/student/stats');
      return response.data as PurchaseStats;
    },
    enabled: !!user,
  });

  const { data: history = [], isLoading: isHistoryLoading } = useQuery({
    queryKey: ['student-exam-history'],
    queryFn: async () => {
      const response = await axiosInstance.get('/student-exams/history');
      return response.data as StudentExamHistoryItem[];
    },
    enabled: !!user,
  });

  const { data: myPayments = [] } = useQuery({
    queryKey: ['my-payments'],
    queryFn: async () => {
      const response = await axiosInstance.get('/payments/student/my-payments');
      return response.data;
    },
    enabled: !!user,
  });

  const { data: availableExams = [], isLoading: isAvailableExamsLoading } = useQuery({
    queryKey: ['student-dashboard-available-exams'],
    queryFn: async () => {
      const [subjectsRes, modelTestsRes, paymentsRes] = await Promise.all([
        axiosInstance.get('/subject/student/my-subjects'),
        axiosInstance.get('/modeltest/student/my-modeltests'),
        axiosInstance.get('/payments/student/my-payments'),
      ]);

      const subjects = subjectsRes.data as StudentSubject[];
      const modelTests = modelTestsRes.data as StudentModelTest[];
      const payments = paymentsRes.data as any[];

      const successfulPayments = payments.filter((p: any) => p.status === 'success');
      const purchasedSubjectIds = new Set(successfulPayments.map((p: any) => p.subject?.id).filter(Boolean));
      const purchasedModelTestIds = new Set(successfulPayments.map((p: any) => p.modelTest?.id).filter(Boolean));

      const subjectDetails = await Promise.all(
        subjects.map(async (subject) => {
          const detailsRes = await axiosInstance.get(`/subject/student/${subject.id}`);
          return {
            ...subject,
            exams: (detailsRes.data?.exams || []) as SubjectExam[],
          };
        }),
      );

      const modelTestDetails = await Promise.all(
        modelTests.map(async (modelTest) => {
          const detailsRes = await axiosInstance.get(`/modeltest/student/${modelTest.id}`);
          return {
            ...modelTest,
            exams: (detailsRes.data?.exams || []) as SubjectExam[],
          };
        }),
      );

      const subjectExamCards = subjectDetails.flatMap((subject) =>
        subject.exams.map((exam) => ({
          id: exam.id,
          title: exam.title,
          questions: exam.totalQuestions || 0,
          duration: '-',
          isPurchased: subject.isFree || purchasedSubjectIds.has(subject.id),
          priceLabel: subject.isFree ? 'Free' : `৳${Math.floor((subject.price || 0) / 100)}`,
          bundleId: subject.id,
          bundleType: 'subject',
        })),
      );

      const modelTestExamCards = modelTestDetails.flatMap((modelTest) =>
        modelTest.exams.map((exam) => ({
          id: exam.id,
          title: exam.title,
          questions: exam.totalQuestions || 0,
          duration: '-',
          isPurchased: modelTest.isFree || purchasedModelTestIds.has(modelTest.id),
          priceLabel: modelTest.isFree ? 'Free' : `৳${Math.floor((modelTest.price || 0) / 100)}`,
          bundleId: modelTest.id,
          bundleType: 'modeltest',
        })),
      );

      return [...subjectExamCards, ...modelTestExamCards] as AvailableExam[];
    },
    enabled: !!user,
  });

  const freeExamsRemaining = availableExams.filter((exam) => exam.priceLabel === 'Free').length;

  const stats = [
    { name: 'Total Exams Given', value: history.length.toString(), icon: BookOpen, color: 'text-primary' },
    { name: 'Purchased Subjects', value: purchaseStats?.purchasedSubjects || '0', icon: ShoppingBag, color: 'text-success' },
    { name: 'Purchased Exams/Models', value: purchaseStats?.purchasedExams || '0', icon: FileBadge, color: 'text-accent' },
    { name: 'Free Exams Remaining', value: freeExamsRemaining.toString(), icon: Zap, color: 'text-warning', badge: `${freeExamsRemaining} left` },
  ];

  const recentActivity = history.slice(0, 3).map((item) => ({
    id: item.studentExamId,
    title: item.examTitle,
    score: `${item.score}/${item.totalQuestions}`,
    date: item.completedAt ? new Date(item.completedAt).toLocaleDateString() : 'In progress',
    color: item.percentageScore >= 40 ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger',
  }));

  const displayExams = availableExams.slice(0, 3);

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

  return (
    <DashboardLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-10 max-w-7xl mx-auto"
      >
        {/* Welcome Section */}
        <motion.div variants={itemVariants} className="relative">
          <div className="absolute -left-4 top-0 w-1 h-12 bg-primary rounded-full hidden md:block" />
          <h1 className="text-2xl md:text-4xl font-display font-black tracking-tight text-text-primary">
            Welcome back, <span className="text-primary">{user?.name || 'Student'}</span>! 👋
          </h1>
          <p className="text-text-secondary mt-2 text-lg">Ready for your next exam challenge?</p>
        </motion.div>

        {/* Stats Row */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <motion.div key={stat.name} variants={itemVariants}>
              <Card className="group border-border bg-bg-card/40 backdrop-blur-md hover:bg-bg-card/60 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,82,204,0.1)] hover:-translate-y-1 overflow-hidden relative">
                <div className={cn("absolute inset-x-0 bottom-0 h-1 transition-all duration-300 opacity-0 group-hover:opacity-100",
                  stat.color.replace('text-', 'bg-'))} />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-widest text-text-secondary">
                    {stat.name}
                  </CardTitle>
                  <div className={cn("p-2 rounded-xl transition-colors", stat.color.replace('text-', 'bg-') + '/10')}>
                    <stat.icon className={cn("h-4 w-4", stat.color)} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-3xl font-black text-text-primary">{stat.value}</div>
                    </div>
                    {stat.badge && (
                      <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 font-bold px-2 py-0.5">
                        {stat.badge}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-8 md:grid-cols-7 items-start">
          {/* Recent Activity */}
          <motion.div variants={itemVariants} className="md:col-span-4">
            <Card className="border-border bg-bg-card/40 backdrop-blur-md overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-bg-card/20 px-6 py-5">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-xl font-bold">Recent Activity</CardTitle>
                </div>
                <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10" render={<Link href="/student/history" />}>
                  সব দেখো <ArrowRight className="ml-1 w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {isHistoryLoading ? (
                  <div className="flex items-center justify-center py-12 text-text-secondary">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 rounded-2xl bg-bg-surface/50 border border-border/50 hover:border-primary/30 hover:bg-bg-surface transition-all group">
                      <div className="flex items-center gap-4">
                        <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm', activity.color)}>
                          {activity.score}
                        </div>
                        <div className="flex-1">
                          <Link href={`/student/result/${activity.id}`}>
                            <h4 className="font-bold text-base text-text-primary group-hover:text-primary transition-colors cursor-pointer">{activity.title}</h4>
                          </Link>
                          <p className="text-xs text-text-secondary flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" /> {activity.date}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-xl border-border hover:bg-primary hover:text-white hover:border-primary transition-all"
                        render={<Link href={`/student/result/${activity.id}`} />}
                      >
                        View Result
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-text-secondary flex flex-col items-center gap-3">
                    <Layout className="w-12 h-12 opacity-20" />
                    <p>No exam activity yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Available Exams */}
          <motion.div variants={itemVariants} className="md:col-span-3">
            <Card className="border-border bg-bg-card/40 backdrop-blur-md overflow-hidden h-full">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-bg-card/20 px-6 py-5">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-accent/10 rounded-lg text-accent">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-xl font-bold">New Exams</CardTitle>
                </div>
                <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10" render={<Link href="/student/exams" />}>
                  সব দেখো
                </Button>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {isAvailableExamsLoading ? (
                  <div className="flex items-center justify-center py-12 text-text-secondary">
                    <Loader2 className="w-8 h-8 animate-spin text-accent" />
                  </div>
                ) : displayExams.length > 0 ? (
                  displayExams.map((exam) => (
                    <div key={exam.id} className="p-5 rounded-2xl bg-bg-surface/50 border border-border/50 space-y-4 hover:bg-bg-surface transition-all relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
                        <BookOpen className="w-12 h-12" />
                      </div>
                      <div className="flex justify-between items-start relative z-10">
                        <h4 className="font-black text-sm text-text-primary leading-tight group-hover:text-primary transition-colors">{exam.title}</h4>
                        {!exam.isPurchased && (
                          <Badge className={cn(
                            "font-bold px-2 py-0.5 bg-accent/10 text-accent border-accent/20"
                          )}>
                            {exam.priceLabel}
                          </Badge>
                        )}
                        {exam.isPurchased && (
                          <Badge className="font-bold px-2 py-0.5 bg-success/10 text-success border-success/20">
                            Purchased
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-text-secondary relative z-10">
                        <div className="flex items-center gap-1.5"><Layout className="w-3.5 h-3.5" /> {exam.questions} Qs</div>
                        <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {exam.duration}</div>
                      </div>
                      <Button 
                        onClick={() => {
                          if (exam.isPurchased) {
                            startExamMutation.mutate(exam.id);
                          } else {
                            router.push(`/student/exams/${exam.bundleType}/${exam.bundleId}`);
                          }
                        }}
                        disabled={startExamMutation.isPending}
                        className={cn(
                          "w-full font-bold h-10 rounded-xl shadow-lg relative z-10 transition-all",
                          exam.isPurchased 
                            ? "bg-success hover:bg-success-dark text-white shadow-success/20" 
                            : "bg-primary hover:bg-primary-light text-white shadow-primary/20"
                        )}
                      >
                        {startExamMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        {exam.isPurchased ? "Start Exam" : "Buy Now"}
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-text-secondary flex flex-col items-center gap-3">
                    <Sparkles className="w-12 h-12 opacity-20" />
                    <p>No new exams available.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
