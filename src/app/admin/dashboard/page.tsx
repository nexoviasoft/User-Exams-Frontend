'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  FileText, 
  Banknote, 
  CreditCard, 
  AlertTriangle,
  TrendingUp,
  Clock,
  UserPlus,
  Rocket
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useGetAdminUsersQuery, useGetPendingTeacherRequestsQuery } from '@/store/slices/api/adminApi';
import { useGetPaymentsQuery } from '@/store/slices/api/paymentsApi';
import { useGetPlatformRevenueStatsQuery } from '@/store/slices/api/revenueApi';

const formatCurrency = (amount: number) => `৳${Math.round(amount).toLocaleString('en-US')}`;
const formatLakh = (amountInTaka: number) => `৳${(amountInTaka / 100000).toFixed(2)}L`;
const getRelativeTime = (date: string) => {
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return 'recently';
  const diffMinutes = Math.round((Date.now() - value.getTime()) / 60000);
  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes} mins ago`;
  const hours = Math.round(diffMinutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.round(hours / 24);
  return `${days} days ago`;
};

export default function AdminDashboard() {
  const { data: users = [], isLoading: usersLoading } = useGetAdminUsersQuery();
  const { data: pendingTeachers = [] } = useGetPendingTeacherRequestsQuery();
  const { data: pendingPaymentsRes } = useGetPaymentsQuery('pending');
  const { data: allPaymentsRes } = useGetPaymentsQuery(undefined);
  const { data: revenueStats } = useGetPlatformRevenueStatsQuery();

  const pendingCount = pendingPaymentsRes?.total || 0;
  const studentsCount = users.filter((u) => u.role === 'student').length;
  const teachersCount = users.filter((u) => u.role === 'teacher').length;

  const todayRevenue = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todayPayments = (allPaymentsRes?.items || []).filter((item) => {
      if (item.status !== 'success') return false;
      return new Date(item.createdAt).toISOString().slice(0, 10) === today;
    });
    return todayPayments.reduce((acc, item) => acc + (item.platformAmount || 0) / 100, 0);
  }, [allPaymentsRes]);

  const stats = [
    {
      name: 'Total Users',
      value: usersLoading ? '...' : users.length.toLocaleString('en-US'),
      subValue: `${studentsCount.toLocaleString('en-US')} Students / ${teachersCount.toLocaleString('en-US')} Teachers`,
      icon: Users,
      color: 'text-primary',
    },
    {
      name: 'Teacher Requests',
      value: pendingTeachers.length.toString(),
      subValue: 'Pending admin approval',
      icon: FileText,
      color: 'text-success',
    },
    { name: "Today's Revenue", value: formatCurrency(todayRevenue), icon: Banknote, color: 'text-accent' },
    {
      name: 'Pending Payments',
      value: pendingCount.toString(),
      icon: CreditCard,
      color: 'text-warning',
      isOrange: pendingCount > 0,
    },
    {
      name: 'Total Revenue',
      value: formatLakh(revenueStats?.totalRevenueInTaka || 0),
      icon: TrendingUp,
      color: 'text-success',
    },
  ];

  const recentActivity = useMemo(() => {
    const userActivities = users.slice(0, 2).map((user) => ({
      type: 'register' as const,
      user: user.name,
      time: getRelativeTime(user.createdAt),
      icon: UserPlus,
      color: 'bg-primary/10 text-primary',
    }));

    const paymentActivities = (allPaymentsRes?.items || [])
      .filter((p) => p.status === 'success')
      .slice(0, 2)
      .map((payment) => ({
        type: 'payment' as const,
        user: payment.student?.user?.name || 'Student',
        amount: formatCurrency((payment.totalAmount || 0) / 100),
        time: getRelativeTime(payment.createdAt),
        icon: CreditCard,
        color: 'bg-success/10 text-success',
      }));

    const teacherActivity =
      pendingTeachers.length > 0
        ? [
            {
              type: 'exam' as const,
              title: 'Teacher approval pending',
              teacher: pendingTeachers[0].user?.name || 'Teacher',
              time: getRelativeTime(pendingTeachers[0].user?.createdAt || new Date().toISOString()),
              icon: Rocket,
              color: 'bg-accent/10 text-accent',
            },
          ]
        : [];

    return [...userActivities, ...paymentActivities, ...teacherActivity].slice(0, 4);
  }, [users, allPaymentsRes, pendingTeachers]);

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-20">
        {/* Welcome Header */}
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Admin Command Center 🏛️</h1>
          <p className="text-text-secondary mt-1">প্ল্যাটফর্মের সার্বিক কার্যক্রম পর্যবেক্ষণ এবং নিয়ন্ত্রণ করুন।</p>
        </div>

        {/* Alert Banner */}
        {pendingCount > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-warning/10 border border-warning/20 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3 text-warning font-bold">
              <AlertTriangle className="w-5 h-5" />
              <span>⚠️ {pendingCount} টি payment pending approval এর জন্য অপেক্ষা করছে</span>
            </div>
            <Button className="bg-warning hover:bg-warning/80 text-bg-dark font-bold rounded-xl" render={<Link href="/admin/payments" />}>
              এখনই দেখো
            </Button>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {stats.map((stat) => (
            <Card key={stat.name} className="border-border bg-bg-card/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                  {stat.name}
                </CardTitle>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </CardHeader>
              <CardContent>
                <div className={cn("text-2xl font-bold", stat.isOrange && "text-warning")}>
                  {stat.value}
                </div>
                {stat.subValue && <p className="text-[9px] text-text-secondary mt-1 leading-tight">{stat.subValue}</p>}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-8 md:grid-cols-7">
          {/* Main Chart Placeholder / Left Side */}
          <Card className="md:col-span-4 border-border bg-bg-card/50">
             <CardHeader>
               <CardTitle className="text-xl font-bold">Platform Growth Overview</CardTitle>
             </CardHeader>
             <CardContent className="h-[300px] flex items-center justify-center border-2 border-dashed border-border m-6 rounded-2xl">
                <div className="text-center text-text-secondary">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p className="font-medium">Revenue & User Growth Charts</p>
                  <Button variant="link" className="text-primary" render={<Link href="/admin/revenue" />}>
                    View Detailed Analytics
                  </Button>
                </div>
             </CardContent>
          </Card>

          {/* Recent Activity Feed */}
          <Card className="md:col-span-3 border-border bg-bg-card/50">
            <CardHeader>
              <CardTitle className="text-xl font-bold">System Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex gap-4 relative">
                  {i < recentActivity.length - 1 && (
                    <div className="absolute left-6 top-10 bottom-0 w-[1px] bg-border" />
                  )}
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 z-10 shadow-sm", activity.color)}>
                    <activity.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-sm text-text-primary">
                      {activity.type === 'register' && <span><strong>{activity.user}</strong> joined as a Student</span>}
                      {activity.type === 'payment' && <span><strong>{activity.user}</strong> paid <strong>{activity.amount}</strong></span>}
                      {activity.type === 'exam' && <span><strong>{activity.teacher}</strong> published <strong>{activity.title}</strong></span>}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-text-secondary mt-1 uppercase font-bold tracking-wider">
                      <Clock className="w-3 h-3" /> {activity.time}
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full border-border hover:bg-bg-surface text-text-secondary rounded-xl mt-4">
                View All Logs
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
