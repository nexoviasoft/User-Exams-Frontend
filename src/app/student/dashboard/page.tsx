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
  Clock,
  Target,
  Trophy,
  Activity,
  Award,
  ChevronRight,
  Layers
} from 'lucide-react';
import Link from 'next/link';
import { useQuery, useMutation } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

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
    { name: 'Assessments Done', value: history.length.toString(), icon: Target, color: 'text-primary', bg: 'bg-primary/10', trend: '+4' },
    { name: 'Premium Subjects', value: purchaseStats?.purchasedSubjects || '0', icon: Award, color: 'text-success', bg: 'bg-success/10', trend: 'Active' },
    { name: 'Bundle Access', value: purchaseStats?.purchasedExams || '0', icon: Layers, color: 'text-accent', bg: 'bg-accent/10', trend: 'Lifetime' },
    { name: 'Bonus Sessions', value: freeExamsRemaining.toString(), icon: Zap, color: 'text-warning', bg: 'bg-warning/10', trend: 'Available' },
  ];

  const recentActivity = history.slice(0, 4).map((item) => ({
    id: item.studentExamId,
    title: item.examTitle,
    score: `${item.score}/${item.totalQuestions}`,
    percent: item.percentageScore,
    date: item.completedAt ? new Date(item.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Pending',
    color: item.percentageScore >= 40 ? 'text-success' : 'text-danger',
    bgColor: item.percentageScore >= 40 ? 'bg-success/10' : 'bg-danger/10',
  }));

  const startExamMutation = useMutation({
    mutationFn: async (examId: string) => {
      const response = await axiosInstance.post('/student-exams/start', { examId });
      return response.data as { studentExamId?: string };
    },
    onSuccess: (data, examId) => {
      toast.success('Exam session initialized');
      router.push(`/student/take-exam/${data.studentExamId || examId}`);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Initialization failed');
    },
  });

  return (
    <DashboardLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-full mx-auto space-y-8 relative px-4 pb-20"
      >
        {/* Background Decorative Glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Header Section */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black px-3 py-1 rounded-lg uppercase tracking-[0.2em] text-[9px]">
                Student Hub
              </Badge>
            </div>
            <h1 className="text-2xl md:text-4xl font-display font-black tracking-tight text-text-primary leading-tight">
              Academic <span className="text-primary">Dashboard</span> 🚀
            </h1>
            <p className="text-text-secondary text-sm font-medium">
              Welcome back, <span className="text-text-primary font-black">{user?.name || 'Candidate'}</span>. Your progress is synced.
            </p>
          </div>
          <div className="flex gap-3">
             <Link href="/student/exams">
                <Button className="bg-primary hover:bg-primary-light text-white rounded-xl h-10 px-6 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 transition-all hover:-translate-y-1 group">
                   Browse All Exams <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
             </Link>
          </div>
        </motion.div>

        {/* Stats Registry */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 relative z-10">
          {stats.map((stat) => (
            <motion.div key={stat.name} variants={itemVariants} whileHover={{ y: -5 }}>
              <Card className="group h-full border-border/50 bg-bg-card/40 backdrop-blur-xl hover:bg-bg-card/70 transition-all duration-500 rounded-[24px] overflow-hidden border-2 shadow-xl relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-primary/10 transition-colors" />
                <CardContent className="p-5 relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={cn("p-2.5 rounded-xl transition-all duration-300 group-hover:scale-110 shadow-inner", stat.bg)}>
                      <stat.icon className={cn("h-4 w-4", stat.color)} />
                    </div>
                    <Badge variant="ghost" className="text-[7px] font-black opacity-40 tracking-[0.2em] uppercase p-0">{stat.trend}</Badge>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-black uppercase tracking-[0.15em] text-text-secondary opacity-60">{stat.name}</p>
                    <div className="text-2xl font-display font-black text-text-primary tracking-tight leading-none pt-1">
                      {stat.value}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
          {/* Main Feed - Activity Audit */}
          <motion.div variants={itemVariants} className="lg:col-span-7">
            <Card className="border-border/50 bg-bg-card/40 backdrop-blur-xl rounded-[32px] overflow-hidden border-2 shadow-2xl">
              <CardHeader className="p-6 pb-2 border-b border-border/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-accent/10 text-accent">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-display font-black text-text-primary uppercase tracking-widest">Performance Audit</CardTitle>
                    <p className="text-[9px] font-black uppercase tracking-widest text-text-secondary opacity-60">Latest exam completions</p>
                  </div>
                </div>
                <Link href="/student/history">
                   <Button variant="ghost" size="sm" className="text-[9px] font-black uppercase tracking-widest hover:bg-white rounded-lg group">
                     Full History <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                   </Button>
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/10">
                   {isHistoryLoading ? (
                      <div className="p-20 flex flex-col items-center gap-2 opacity-30">
                         <Loader2 className="w-6 h-6 animate-spin" />
                         <p className="text-[8px] font-black uppercase tracking-widest">Syncing activity...</p>
                      </div>
                   ) : recentActivity.length > 0 ? (
                      recentActivity.map((activity) => (
                        <Link key={activity.id} href={`/student/result/${activity.id}`}>
                           <div className="p-5 flex items-center justify-between hover:bg-white/40 transition-all group">
                              <div className="flex items-center gap-4">
                                 <div className={cn("w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-black transition-transform group-hover:scale-105 shadow-inner", activity.bgColor)}>
                                    <span className={cn("text-xs", activity.color)}>{activity.score}</span>
                                    <span className="text-[7px] opacity-40 uppercase tracking-tighter">Correct</span>
                                 </div>
                                 <div>
                                    <h4 className="font-display font-black text-sm text-text-primary group-hover:text-primary transition-colors leading-tight">{activity.title}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                       <span className="text-[9px] font-bold text-text-secondary uppercase tracking-widest flex items-center gap-1">
                                          <Clock className="w-2.5 h-2.5" /> {activity.date}
                                       </span>
                                       <span className="w-1 h-1 rounded-full bg-border" />
                                       <span className={cn("text-[9px] font-black uppercase tracking-widest", activity.color)}>
                                          {activity.percent}% Accuracy
                                       </span>
                                    </div>
                                 </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-text-secondary opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                           </div>
                        </Link>
                      ))
                   ) : (
                      <div className="p-20 text-center opacity-20">
                         <Trophy className="w-12 h-12 mx-auto mb-4" />
                         <p className="text-[10px] font-black uppercase tracking-widest">No activity logged yet</p>
                      </div>
                   )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Side Feed - Available Opportunities */}
          <motion.div variants={itemVariants} className="lg:col-span-5 space-y-6">
            <Card className="border-border/50 bg-bg-card/40 backdrop-blur-xl rounded-[32px] overflow-hidden border-2 shadow-2xl relative group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
               <CardHeader className="p-6 pb-2 flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                     <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                        <Sparkles className="w-5 h-5" />
                     </div>
                     <div>
                        <CardTitle className="text-sm font-display font-black text-text-primary uppercase tracking-widest">New Challenges</CardTitle>
                        <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary opacity-60">Curated recommendations</p>
                     </div>
                  </div>
               </CardHeader>
               <CardContent className="p-6 pt-2 space-y-4 relative z-10">
                  {isAvailableExamsLoading ? (
                     <div className="py-12 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary/30" />
                     </div>
                  ) : availableExams.length > 0 ? (
                     availableExams.slice(0, 3).map((exam) => (
                       <div key={exam.id} className="p-4 rounded-2xl bg-bg-surface/50 border border-border/40 hover:bg-bg-surface hover:border-primary/30 transition-all group/exam relative overflow-hidden shadow-sm">
                          <div className="flex justify-between items-start mb-3">
                             <h4 className="text-xs font-black text-text-primary group-hover/exam:text-primary transition-colors leading-tight max-w-[70%]">{exam.title}</h4>
                             <Badge className={cn(
                               "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md shadow-sm",
                               exam.isPurchased ? "bg-success text-white" : "bg-accent text-white"
                             )}>
                               {exam.isPurchased ? "Unlocked" : exam.priceLabel}
                             </Badge>
                          </div>
                          <div className="flex items-center gap-4 mb-4">
                             <div className="flex items-center gap-1 text-[9px] font-bold text-text-secondary">
                                <BookOpen className="w-3 h-3 opacity-40" /> {exam.questions} Questions
                             </div>
                             <div className="flex items-center gap-1 text-[9px] font-bold text-text-secondary">
                                <Clock className="w-3 h-3 opacity-40" /> Competitive
                             </div>
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
                              "w-full h-10 rounded-xl font-black uppercase tracking-[0.15em] text-[9px] transition-all shadow-lg",
                              exam.isPurchased 
                                ? "bg-success hover:bg-success-dark text-white shadow-success/20" 
                                : "bg-primary hover:bg-primary-light text-white shadow-primary/20"
                            )}
                          >
                             {startExamMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : <Zap className="w-3.5 h-3.5 mr-2" />}
                             {exam.isPurchased ? "Engage Now" : "Acquire Access"}
                          </Button>
                       </div>
                     ))
                  ) : (
                     <div className="py-12 text-center opacity-30">
                        <Layers className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-[8px] font-black uppercase tracking-widest">No new exams</p>
                     </div>
                  )}
               </CardContent>
            </Card>

            {/* Performance Analytics Widget */}
            <Card className="border-border/50 bg-accent/5 backdrop-blur-xl rounded-[32px] overflow-hidden border-2 border-accent/20 shadow-2xl relative group">
               <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                     <TrendingUp className="w-6 h-6 text-accent" />
                     <div>
                        <h3 className="text-sm font-black uppercase tracking-[0.15em] text-text-primary">Learning Curve</h3>
                        <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary opacity-60">Weekly growth assessment</p>
                     </div>
                  </div>
                  <div className="space-y-3">
                     <div className="flex justify-between items-end mb-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Percentile</span>
                        <span className="text-xs font-black text-text-primary">82nd</span>
                     </div>
                     <div className="h-2 w-full bg-bg-surface rounded-full overflow-hidden border border-border/10">
                        <motion.div initial={{ width: 0 }} animate={{ width: '82%' }} transition={{ duration: 1.5 }} className="h-full bg-accent" />
                     </div>
                  </div>
               </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
