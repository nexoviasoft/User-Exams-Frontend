'use client';

import { useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Database, 
  BookOpen, 
  FileText, 
  Users, 
  Banknote, 
  PlusCircle,
  TrendingUp,
  ArrowRight,
  Layers3
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import {
  useGetMyEarningsQuery,
  useGetMyModelTestsQuery,
  useGetMyQuestionBanksQuery,
  useGetMySubjectsQuery,
} from '@/store/slices/api/teacherDashboardApi';

const formatCurrency = (amount: number) => `৳${Math.round(amount).toLocaleString('en-US')}`;

export default function TeacherDashboard() {
  const { data: banks = [], isLoading: banksLoading } = useGetMyQuestionBanksQuery();
  const { data: subjects = [], isLoading: subjectsLoading } = useGetMySubjectsQuery();
  const { data: modelTests = [], isLoading: modelTestsLoading } = useGetMyModelTestsQuery();
  const { data: earnings, isLoading: earningsLoading } = useGetMyEarningsQuery();
  const { data: exams = [], isLoading: examsLoading } = useQuery({
    queryKey: ['teacher-dashboard-exams'],
    queryFn: async () => (await axiosInstance.get('/exams/my')).data,
  });

  const isLoading = banksLoading || subjectsLoading || modelTestsLoading || earningsLoading || examsLoading;

  const recentPerformance = useMemo(() => {
    const history = earnings?.paymentHistory || [];
    return history.slice(0, 5).map((item) => ({
      title: item.examTitle || 'N/A',
      attempts: '-',
      avgScore: '-',
      revenue: formatCurrency(item.amountInTaka || 0),
    }));
  }, [earnings]);

  const totalQuestions = useMemo(() => {
    return banks.reduce((sum, bank: any) => sum + Number(bank.questionCount || 0), 0);
  }, [banks]);

  const stats = [
    { name: 'Total Question Banks', value: isLoading ? '...' : String(banks.length), icon: Database, color: 'text-primary' },
    { name: 'Total Questions', value: isLoading ? '...' : String(totalQuestions), icon: BookOpen, color: 'text-success' },
    { name: 'Total Exams', value: isLoading ? '...' : String(exams.length), subValue: `${subjects.length} Subjects`, icon: FileText, color: 'text-accent' },
    { name: 'Students Attempted', value: isLoading ? '...' : String(earnings?.paymentHistory?.length || 0), icon: Users, color: 'text-warning' },
    { name: 'Total Earnings', value: isLoading ? '...' : formatCurrency(earnings?.totalEarningsInTaka || 0), icon: Banknote, color: 'text-success' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">Teacher Control Center 👨‍🏫</h1>
            <p className="text-text-secondary mt-1">আপনার কন্টেন্ট এবং শিক্ষার্থীদের পারফরম্যান্স পরিচালনা করুন।</p>
          </div>
          <div className="flex gap-3">
            <Link href="/teacher/create-exam">
              <Button className="bg-primary hover:bg-primary-light text-white rounded-xl h-11">
                <PlusCircle className="w-4 h-4 mr-2" /> নতুন Exam
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {stats.map((stat) => (
            <Card key={stat.name} className="border-border bg-bg-card/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                  {stat.name}
                </CardTitle>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.subValue && <p className="text-[10px] text-text-secondary mt-1">{stat.subValue}</p>}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/teacher/question-banks">
            <div className="p-6 rounded-[24px] bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all flex items-center gap-4 group cursor-pointer">
               <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                 <Database className="w-6 h-6" />
               </div>
               <div>
                 <h4 className="font-bold text-primary">নতুন Question Bank</h4>
                 <p className="text-xs text-text-secondary">প্রশ্নগুলো গুছিয়ে রাখার জন্য</p>
               </div>
            </div>
          </Link>
          <Link href="/teacher/create-question">
            <div className="p-6 rounded-[24px] bg-success/10 border border-success/20 hover:bg-success/20 transition-all flex items-center gap-4 group cursor-pointer">
               <div className="w-12 h-12 rounded-2xl bg-success flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                 <PlusCircle className="w-6 h-6" />
               </div>
               <div>
                 <h4 className="font-bold text-success">নতুন Question</h4>
                 <p className="text-xs text-text-secondary">ব্যাংকে প্রশ্ন যোগ করুন</p>
               </div>
            </div>
          </Link>
          <Link href="/teacher/create-exam">
            <div className="p-6 rounded-[24px] bg-accent/10 border border-accent/20 hover:bg-accent/20 transition-all flex items-center gap-4 group cursor-pointer">
               <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                 <FileText className="w-6 h-6" />
               </div>
               <div>
                 <h4 className="font-bold text-accent">নতুন Exam</h4>
                 <p className="text-xs text-text-secondary">শিক্ষার্থীদের জন্য পরীক্ষা পাবলিশ করুন</p>
               </div>
            </div>
          </Link>
          <Link href="/teacher/subjects">
            <div className="p-6 rounded-[24px] bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all flex items-center gap-4 group cursor-pointer">
               <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                 <BookOpen className="w-6 h-6" />
               </div>
               <div>
                 <h4 className="font-bold text-primary">নতুন Subject</h4>
                 <p className="text-xs text-text-secondary">নতুন সাবজেক্ট তৈরি করুন</p>
               </div>
            </div>
          </Link>
          <Link href="/teacher/model-tests">
            <div className="p-6 rounded-[24px] bg-accent/10 border border-accent/20 hover:bg-accent/20 transition-all flex items-center gap-4 group cursor-pointer">
               <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                 <TrendingUp className="w-6 h-6" />
               </div>
               <div>
                 <h4 className="font-bold text-accent">নতুন Model Test</h4>
                 <p className="text-xs text-text-secondary">দ্রুত model test তৈরি করুন</p>
               </div>
            </div>
          </Link>
        </div>

        {/* Content Creation System */}
        <Card className="border-border bg-bg-card/50">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Layers3 className="w-5 h-5 text-primary" />
              Subject → Model Test → Exam Create System
            </CardTitle>
            <p className="text-sm text-text-secondary">
              নতুন pricing flow অনুযায়ী আগে Subject/Model Test তৈরি করুন, তারপর Exam publish করুন।
            </p>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 space-y-3">
              <p className="text-xs font-bold text-primary">STEP 1</p>
              <h4 className="font-bold">Create Subject</h4>
              <p className="text-xs text-text-secondary">
                Subject level price/free সেট করুন। Student subject কিনে সব exam access পাবে।
              </p>
              <Link href="/teacher/subjects">
                <Button size="sm" className="w-full">Subject তৈরি করুন</Button>
              </Link>
            </div>

            <div className="p-4 rounded-2xl border border-accent/20 bg-accent/5 space-y-3">
              <p className="text-xs font-bold text-accent">STEP 2</p>
              <h4 className="font-bold">Create Model Test</h4>
              <p className="text-xs text-text-secondary">
                প্রয়োজনে subject এর সাথে model test attach করুন এবং model test price configure করুন।
              </p>
              <Link href="/teacher/model-tests">
                <Button size="sm" variant="secondary" className="w-full">Model Test তৈরি করুন</Button>
              </Link>
            </div>

            <div className="p-4 rounded-2xl border border-success/20 bg-success/5 space-y-3">
              <p className="text-xs font-bold text-success">STEP 3</p>
              <h4 className="font-bold">Create & Publish Exam</h4>
              <p className="text-xs text-text-secondary">
                Exam বানিয়ে subject/model test এর ভিতরে publish করুন। exam level price/free সেট করতে পারবেন।
              </p>
              <Link href="/teacher/create-exam">
                <Button size="sm" variant="outline" className="w-full border-success/40 text-success hover:bg-success/10">
                  Exam তৈরি করুন
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Performance Table */}
        <Card className="border-border bg-bg-card/50 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-bold">Recent Exam Performance</CardTitle>
            <Link href="/teacher/analytics">
              <Button variant="ghost" size="sm" className="text-primary">
                সব দেখুন <ArrowRight className="ml-1 w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-surface text-text-secondary text-xs uppercase tracking-wider font-bold">
                  <th className="px-6 py-4">Exam Name</th>
                  <th className="px-6 py-4">Attempts</th>
                  <th className="px-6 py-4">Avg Score</th>
                  <th className="px-6 py-4">Revenue</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(recentPerformance.length > 0 ? recentPerformance : [{ title: 'No paid activity yet', attempts: '-', avgScore: '-', revenue: '৳0' }]).map((exam, i) => (
                  <tr key={i} className="text-sm hover:bg-bg-surface/50 transition-colors">
                    <td className="px-6 py-4 font-bold">{exam.title}</td>
                    <td className="px-6 py-4">{exam.attempts}</td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2">
                         <div className="flex-1 h-1.5 w-16 bg-bg-surface rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: exam.avgScore === '-' ? '0%' : exam.avgScore }} />
                         </div>
                         {exam.avgScore}
                       </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-success">{exam.revenue}</td>
                    <td className="px-6 py-4">
                       <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10">
                         <TrendingUp className="w-4 h-4" />
                       </Button>
                    </td>
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
