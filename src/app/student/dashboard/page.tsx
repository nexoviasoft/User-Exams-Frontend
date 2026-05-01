'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { 
  BookOpen, 
  Zap, 
  ArrowRight,
  Clock,
  ShoppingBag,
  FileBadge,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';

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
};

export default function StudentDashboard() {
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
      const [subjectsRes, modelTestsRes] = await Promise.all([
        axiosInstance.get('/subject/student/my-subjects'),
        axiosInstance.get('/modeltest/student/my-modeltests'),
      ]);

      const subjects = subjectsRes.data as StudentSubject[];
      const modelTests = modelTestsRes.data as StudentModelTest[];

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
          priceLabel: subject.isFree ? 'Free' : `৳${Math.floor((subject.price || 0) / 100)}`,
        })),
      );

      const modelTestExamCards = modelTestDetails.flatMap((modelTest) =>
        modelTest.exams.map((exam) => ({
          id: exam.id,
          title: exam.title,
          questions: exam.totalQuestions || 0,
          duration: '-',
          priceLabel: modelTest.isFree ? 'Free' : `৳${Math.floor((modelTest.price || 0) / 100)}`,
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
    { name: 'Free Exams Remaining', value: freeExamsRemaining.toString(), icon: Zap, color: 'text-warning', badge: `${freeExamsRemaining} বাকি` },
  ];

  const recentActivity = history.slice(0, 3).map((item) => ({
    id: item.studentExamId,
    title: item.examTitle,
    score: `${item.score}/${item.totalQuestions}`,
    date: item.completedAt ? new Date(item.completedAt).toLocaleDateString() : 'In progress',
    color: item.percentageScore >= 40 ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger',
  }));

  const displayExams = availableExams.slice(0, 3);

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">স্বাগতম, {user?.name || 'Student'}! 👋</h1>
          <p className="text-text-secondary mt-2">আপনার আজকের পরীক্ষার প্রস্তুতি কেমন?</p>
        </div>

        {/* Stats Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.name} className="border-border bg-bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-text-secondary">
                  {stat.name}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  {stat.badge && (
                    <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                      {stat.badge}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-8 md:grid-cols-7">
          {/* Recent Activity */}
          <Card className="md:col-span-4 border-border bg-bg-card/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-bold">Recent Activity</CardTitle>
              <Button variant="ghost" size="sm" className="text-primary" render={<Link href="/student/history" />}>
                সব দেখো <ArrowRight className="ml-1 w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {isHistoryLoading ? (
                <div className="flex items-center justify-center py-8 text-text-secondary">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading activity...
                </div>
              ) : recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 rounded-2xl bg-bg-surface border border-border hover:border-primary/20 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className={cn('px-3 py-1 rounded-full text-xs font-bold', activity.color)}>
                        {activity.score}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">{activity.title}</h4>
                        <p className="text-xs text-text-secondary">{activity.date}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-full group-hover:bg-primary group-hover:text-white transition-all">
                      Result দেখো
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-sm text-text-secondary py-6">No exam activity yet.</div>
              )}
            </CardContent>
          </Card>

          {/* Available Exams */}
          <Card className="md:col-span-3 border-border bg-bg-card/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-bold">Available Exams</CardTitle>
              <Button variant="ghost" size="sm" className="text-primary" render={<Link href="/student/exams" />}>
                সব দেখো
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {isAvailableExamsLoading ? (
                <div className="flex items-center justify-center py-8 text-text-secondary">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading exams...
                </div>
              ) : displayExams.length > 0 ? (
                displayExams.map((exam) => (
                  <div key={exam.id} className="p-4 rounded-2xl bg-bg-surface border border-border space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-sm max-w-[70%]">{exam.title}</h4>
                      <Badge className={cn(
                        exam.priceLabel === 'Free' ? 'bg-success/10 text-success border-success/20' : 'bg-accent/10 text-accent border-accent/20',
                      )}>
                        {exam.priceLabel}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-text-secondary">
                      <div className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {exam.questions} Qs</div>
                      <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> {exam.duration}</div>
                    </div>
                    <Button className="w-full bg-primary hover:bg-primary-light text-white text-xs h-9 rounded-xl">
                      Exam দাও
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-sm text-text-secondary py-6">No published exams available yet.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
