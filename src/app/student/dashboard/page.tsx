'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { 
  BookOpen, 
  Trophy, 
  TrendingUp, 
  Zap, 
  ArrowRight,
  Clock,
  ChevronRight,
  ShoppingBag,
  FileBadge
} from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';

export default function StudentDashboard() {
  const { user } = useAuth();

  const { data: purchaseStats } = useQuery({
    queryKey: ['student-purchase-stats'],
    queryFn: async () => {
      const response = await axiosInstance.get('/payments/student/stats');
      return response.data;
    },
    enabled: !!user,
  });

  const stats = [
    { name: 'Total Exams Given', value: '12', icon: BookOpen, color: 'text-primary' },
    { name: 'Purchased Subjects', value: purchaseStats?.purchasedSubjects || '0', icon: ShoppingBag, color: 'text-success' },
    { name: 'Purchased Exams/Models', value: purchaseStats?.purchasedExams || '0', icon: FileBadge, color: 'text-accent' },
    { name: 'Free Exams Remaining', value: '2', icon: Zap, color: 'text-warning', badge: '2 বাকি' },
  ];

  const recentActivity = [
    { id: '1', title: 'Mathematics Final', score: '18/20', status: 'Passed', date: '2 hours ago', color: 'bg-success/10 text-success' },
    { id: '2', title: 'Physics Quiz', score: '12/20', status: 'Failed', date: 'Yesterday', color: 'bg-danger/10 text-danger' },
    { id: '3', title: 'English Grammar', score: '15/20', status: 'Passed', date: '2 days ago', color: 'bg-success/10 text-success' },
  ];

  const availableExams = [
    { id: '1', title: 'BCS Preliminary Prep', questions: 100, duration: '120m', price: 'Free' },
    { id: '2', title: 'University Admission Quiz', questions: 50, duration: '60m', price: '৳50' },
    { id: '3', title: 'English Vocabulary Master', questions: 30, duration: '20m', price: 'Free' },
  ];

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
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-4 rounded-2xl bg-bg-surface border border-border hover:border-primary/20 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className={cn("px-3 py-1 rounded-full text-xs font-bold", activity.color)}>
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
              ))}
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
              {availableExams.map((exam) => (
                <div key={exam.id} className="p-4 rounded-2xl bg-bg-surface border border-border space-y-3">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-sm max-w-[70%]">{exam.title}</h4>
                    <Badge className={cn(
                      exam.price === 'Free' ? "bg-success/10 text-success border-success/20" : "bg-accent/10 text-accent border-accent/20"
                    )}>
                      {exam.price}
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
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
