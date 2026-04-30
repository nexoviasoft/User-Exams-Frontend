'use client';

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
  ArrowRight,
  TrendingUp,
  Clock,
  UserPlus,
  Rocket
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function AdminDashboard() {
  const pendingCount = 3;

  const stats = [
    { name: 'Total Users', value: '11,284', subValue: '10,784 Students / 500 Teachers', icon: Users, color: 'text-primary' },
    { name: 'Exams Published', value: '156', icon: FileText, color: 'text-success' },
    { name: "Today's Revenue", value: '৳12,500', icon: Banknote, color: 'text-accent' },
    { name: 'Pending Payments', value: pendingCount.toString(), icon: CreditCard, color: 'text-warning', isOrange: pendingCount > 0 },
    { name: 'Total Revenue', value: '৳12.5L', icon: TrendingUp, color: 'text-success' },
  ];

  const recentActivity = [
    { type: 'register', user: 'Rahim Ahmed', time: '2 mins ago', icon: UserPlus, color: 'bg-primary/10 text-primary' },
    { type: 'payment', user: 'Karim Ullah', amount: '৳150', time: '15 mins ago', icon: CreditCard, color: 'bg-success/10 text-success' },
    { type: 'exam', title: 'IELTS Vocabulary Mock', teacher: 'Ms. Sarah', time: '1 hour ago', icon: Rocket, color: 'bg-accent/10 text-accent' },
    { type: 'register', user: 'Tisha Rahman', time: '3 hours ago', icon: UserPlus, color: 'bg-primary/10 text-primary' },
  ];

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
            <Button className="bg-warning hover:bg-warning/80 text-bg-dark font-bold rounded-xl" asChild>
              <Link href="/admin/payments">এখনই দেখো</Link>
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
                  <Button variant="link" className="text-primary" asChild>
                    <Link href="/admin/revenue">View Detailed Analytics</Link>
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
