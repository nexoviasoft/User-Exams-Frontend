'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { 
  Database, 
  BookOpen, 
  FileText, 
  Users, 
  Banknote, 
  PlusCircle,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function TeacherDashboard() {
  const { user } = useAuth();

  const stats = [
    { name: 'Total Question Banks', value: '8', icon: Database, color: 'text-primary' },
    { name: 'Total Questions', value: '450', icon: BookOpen, color: 'text-success' },
    { name: 'Total Exams', value: '12', subValue: '8 Pub / 4 Draft', icon: FileText, color: 'text-accent' },
    { name: 'Students Attempted', value: '1,284', icon: Users, color: 'text-warning' },
    { name: 'Total Earnings', value: '৳45,200', icon: Banknote, color: 'text-success' },
  ];

  const recentPerformance = [
    { title: 'BCS Model Test 01', attempts: 124, avgScore: '68%', revenue: '৳6,200' },
    { title: 'HSC Physics Quiz', attempts: 85, avgScore: '72%', revenue: '৳0 (Free)' },
    { title: 'Medical Prep Mock', attempts: 210, avgScore: '62%', revenue: '৳31,500' },
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
            <Button className="bg-primary hover:bg-primary-light text-white rounded-xl h-11" render={<Link href="/teacher/create-exam" />}>
              <PlusCircle className="w-4 h-4 mr-2" /> নতুন Exam
            </Button>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        </div>

        {/* Recent Performance Table */}
        <Card className="border-border bg-bg-card/50 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-bold">Recent Exam Performance</CardTitle>
            <Button variant="ghost" size="sm" className="text-primary" render={<Link href="/teacher/analytics" />}>
              সব দেখুন <ArrowRight className="ml-1 w-4 h-4" />
            </Button>
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
                {recentPerformance.map((exam, i) => (
                  <tr key={i} className="text-sm hover:bg-bg-surface/50 transition-colors">
                    <td className="px-6 py-4 font-bold">{exam.title}</td>
                    <td className="px-6 py-4">{exam.attempts}</td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2">
                         <div className="flex-1 h-1.5 w-16 bg-bg-surface rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: exam.avgScore }} />
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
