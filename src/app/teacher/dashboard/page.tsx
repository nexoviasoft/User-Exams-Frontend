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
  Layers3,
  Loader2,
  Sparkles,
  Zap,
  Target,
  ChevronRight,
  Activity,
  Award,
  Globe
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { motion } from 'framer-motion';
import {
  useGetMyEarningsQuery,
  useGetMyModelTestsQuery,
  useGetMyQuestionBanksQuery,
  useGetMySubjectsQuery,
} from '@/store/slices/api/teacherDashboardApi';
import { Badge } from '@/components/ui/badge';

const formatCurrency = (amount: number) => `৳${Math.round(amount).toLocaleString('en-US')}`;

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

  const totalQuestions = useMemo(() => {
    return banks.reduce((sum, bank: any) => sum + Number(bank.questionCount || 0), 0);
  }, [banks]);

  const stats = [
    { name: 'Question Banks', value: isLoading ? '...' : String(banks.length), icon: Database, color: 'text-primary', bg: 'bg-primary/10', trend: '+12%' },
    { name: 'Total Questions', value: isLoading ? '...' : String(totalQuestions), icon: BookOpen, color: 'text-success', bg: 'bg-success/10', trend: '+8%' },
    { name: 'Active Exams', value: isLoading ? '...' : String(exams.length), subValue: `${subjects.length} Subjects`, icon: FileText, color: 'text-accent', bg: 'bg-accent/10', trend: '+5%' },
    { name: 'Students', value: isLoading ? '...' : String(earnings?.paymentHistory?.length || 0), icon: Users, color: 'text-warning', bg: 'bg-warning/10', trend: '+24%' },
    { name: 'Revenue', value: isLoading ? '...' : formatCurrency(earnings?.totalEarningsInTaka || 0), icon: Banknote, color: 'text-success', bg: 'bg-success/10', trend: '+15%' },
  ];

  return (
    <DashboardLayout>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-full mx-auto space-y-6 relative px-4 pb-20"
      >
        {/* Background Decorative Glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Header Section */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black px-3 py-1 rounded-lg uppercase tracking-[0.2em] text-[9px]">
                Command Center
              </Badge>
            </div>
            <h1 className="text-2xl md:text-4xl font-display font-black tracking-tight text-text-primary leading-tight">
              Control <span className="text-primary">Panel</span> 👨‍🏫
            </h1>
            <p className="text-text-secondary text-sm font-medium">
              Real-time synchronization with your educational assets.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/teacher/create-exam">
              <Button className="bg-primary hover:bg-primary-light text-white rounded-xl h-10 px-6 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 transition-all hover:-translate-y-1 group">
                <PlusCircle className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-300" /> Deploy Exam
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats Registry */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 relative z-10">
          {stats.map((stat) => (
            <motion.div key={stat.name} variants={itemVariants} whileHover={{ y: -5 }}>
              <Card className="group h-full border-border/50 bg-bg-card/40 backdrop-blur-xl hover:bg-bg-card/70 transition-all duration-500 rounded-[28px] overflow-hidden border-2 shadow-2xl relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-primary/10 transition-colors" />
                <CardContent className="p-5 relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={cn("p-2.5 rounded-xl transition-all duration-300 group-hover:scale-110 shadow-inner", stat.bg)}>
                      <stat.icon className={cn("h-4 w-4", stat.color)} />
                    </div>
                    <div className="flex flex-col items-end">
                       <Badge variant="ghost" className="text-[7px] font-black opacity-40 tracking-[0.2em] uppercase p-0">Telemetry</Badge>
                       <span className="text-[9px] font-black text-success mt-0.5">{stat.trend}</span>
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-black uppercase tracking-[0.15em] text-text-secondary opacity-60">{stat.name}</p>
                    <div className="text-2xl font-display font-black text-text-primary tracking-tight leading-none pt-1">
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin opacity-20" /> : stat.value}
                    </div>
                    {stat.subValue && <p className="text-[9px] text-primary font-black uppercase tracking-widest pt-1">{stat.subValue}</p>}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Intelligence Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
           {/* Primary Feed */}
           <div className="lg:col-span-8 space-y-6">
              <Card className="border-border/50 bg-bg-card/40 backdrop-blur-xl rounded-[32px] overflow-hidden border-2 shadow-2xl">
                 <CardHeader className="p-6 pb-2 border-b border-border/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="p-2.5 rounded-xl bg-accent/10 text-accent">
                          <Activity className="w-5 h-5" />
                       </div>
                       <div>
                          <CardTitle className="text-sm font-display font-black text-text-primary uppercase tracking-widest">Active Intelligence</CardTitle>
                          <p className="text-[9px] font-black uppercase tracking-widest text-text-secondary opacity-60">Real-time engagement audit</p>
                       </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-[9px] font-black uppercase tracking-widest hover:bg-bg-surface rounded-lg">View Logs</Button>
                 </CardHeader>
                 <CardContent className="p-0">
                    <div className="divide-y divide-border/10">
                       {[
                         { title: 'HSC Biology Final Mock', status: 'Live', students: 124, avg: '78%' },
                         { title: 'Chemistry MCQ Blast', status: 'Syncing', students: 89, avg: '64%' },
                         { title: 'Physics Numerical Challenge', status: 'Draft', students: 0, avg: '-' },
                       ].map((item, i) => (
                         <div key={i} className="p-5 flex items-center justify-between hover:bg-white/40 transition-colors group">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-bg-surface border border-border/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                                  <Target className="w-4 h-4 text-primary" />
                               </div>
                               <div>
                                  <p className="text-sm font-black text-text-primary">{item.title}</p>
                                  <div className="flex items-center gap-3 mt-1">
                                     <span className="text-[9px] font-bold text-text-secondary uppercase tracking-widest">{item.students} Participants</span>
                                     <span className="w-1 h-1 rounded-full bg-border" />
                                     <span className="text-[9px] font-bold text-primary uppercase tracking-widest">{item.avg} Avg Score</span>
                                  </div>
                               </div>
                            </div>
                            <Badge className={cn(
                              "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md",
                              item.status === 'Live' ? "bg-success/10 text-success border-success/20" : 
                              item.status === 'Syncing' ? "bg-primary/10 text-primary border-primary/20" : "bg-warning/10 text-warning border-warning/20"
                            )}>
                               {item.status}
                            </Badge>
                         </div>
                       ))}
                    </div>
                 </CardContent>
              </Card>
           </div>

           {/* Secondary Actions */}
           <div className="lg:col-span-4 space-y-6">
              <Card className="border-border/50 bg-primary/5 backdrop-blur-xl rounded-[32px] overflow-hidden border-2 border-primary/20 shadow-2xl relative group">
                 <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                 <CardContent className="p-6 relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                       <Award className="w-6 h-6 text-primary" />
                       <div>
                          <h3 className="text-sm font-black uppercase tracking-[0.15em] text-text-primary">Performance Audit</h3>
                          <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary opacity-60">Verified Institutional Data</p>
                       </div>
                    </div>
                    <div className="space-y-4">
                       <div className="p-4 rounded-2xl bg-bg-card/60 border border-border/40 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <Zap className="w-4 h-4 text-accent" />
                             <span className="text-[10px] font-black uppercase tracking-widest">Efficiency</span>
                          </div>
                          <span className="text-xs font-black text-text-primary">94.2%</span>
                       </div>
                       <div className="p-4 rounded-2xl bg-bg-card/60 border border-border/40 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <Globe className="w-4 h-4 text-primary" />
                             <span className="text-[10px] font-black uppercase tracking-widest">Global Rank</span>
                          </div>
                          <span className="text-xs font-black text-text-primary">#12 / 850</span>
                       </div>
                    </div>
                    <Button className="w-full mt-6 bg-primary text-white rounded-xl h-12 font-black uppercase tracking-[0.2em] text-[9px] shadow-lg shadow-primary/20 hover:-translate-y-1 transition-all">
                       Generate Insight Report <ChevronRight className="w-3.5 h-3.5 ml-2" />
                    </Button>
                 </CardContent>
              </Card>

              <Card className="border-border/50 bg-bg-card/40 backdrop-blur-xl rounded-[32px] overflow-hidden border-2 shadow-2xl">
                 <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                       <Sparkles className="w-5 h-5 text-accent" />
                       <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-primary">System Health</h3>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                       <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                       <span className="text-[9px] font-black text-text-secondary uppercase tracking-widest">All services operational</span>
                    </div>
                    <div className="w-full bg-bg-surface h-1 rounded-full overflow-hidden">
                       <div className="bg-success w-[99%] h-full" />
                    </div>
                 </CardContent>
              </Card>
           </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
