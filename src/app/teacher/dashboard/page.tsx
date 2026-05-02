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
  ChevronRight
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
    { name: 'Question Banks', value: isLoading ? '...' : String(banks.length), icon: Database, color: 'text-primary', bg: 'bg-primary/10' },
    { name: 'Total Questions', value: isLoading ? '...' : String(totalQuestions), icon: BookOpen, color: 'text-success', bg: 'bg-success/10' },
    { name: 'Active Exams', value: isLoading ? '...' : String(exams.length), subValue: `${subjects.length} Subjects`, icon: FileText, color: 'text-accent', bg: 'bg-accent/10' },
    { name: 'Students', value: isLoading ? '...' : String(earnings?.paymentHistory?.length || 0), icon: Users, color: 'text-warning', bg: 'bg-warning/10' },
    { name: 'Revenue', value: isLoading ? '...' : formatCurrency(earnings?.totalEarningsInTaka || 0), icon: Banknote, color: 'text-success', bg: 'bg-success/10' },
  ];

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

        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black px-3 py-1 rounded-lg uppercase tracking-widest text-[10px]">
                Teacher Hub
              </Badge>
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-black tracking-tight text-text-primary leading-tight">
              Control <span className="text-primary">Center</span> 👨‍🏫
            </h1>
            <p className="text-text-secondary text-lg max-w-2xl font-medium">
              Manage your educational content and monitor student performance.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/teacher/create-exam">
              <Button className="bg-primary hover:bg-primary-light text-white rounded-2xl h-12 px-8 font-black shadow-xl shadow-primary/20 transition-all hover:-translate-y-1">
                <PlusCircle className="w-5 h-5 mr-2" /> New Exam
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 relative z-10">
          {stats.map((stat) => (
            <motion.div key={stat.name} variants={itemVariants}>
              <Card className="group border-border/50 bg-bg-card/40 backdrop-blur-xl hover:bg-bg-card/70 transition-all duration-500 rounded-[28px] overflow-hidden border-2 hover:border-primary/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className={cn("p-2 rounded-xl transition-transform group-hover:scale-110", stat.bg)}>
                      <stat.icon className={cn("h-4 w-4", stat.color)} />
                    </div>
                    <Badge variant="outline" className="text-[8px] font-black opacity-30 tracking-widest">STAT</Badge>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">{stat.name}</p>
                    <div className="text-2xl font-display font-black text-text-primary">
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin opacity-20" /> : stat.value}
                    </div>
                    {stat.subValue && <p className="text-[9px] text-primary font-bold">{stat.subValue}</p>}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 relative z-10">
          {[
            { href: "/teacher/question-banks", icon: Database, label: "Question Banks", sub: "Organize Questions", color: "primary" },
            { href: "/teacher/create-question", icon: Zap, label: "Add Question", sub: "Expand Library", color: "success" },
            { href: "/teacher/create-exam", icon: FileText, label: "Create Exam", sub: "Publish Assessment", color: "accent" },
            { href: "/teacher/subjects", icon: BookOpen, label: "My Subjects", sub: "Course Management", color: "primary" },
            { href: "/teacher/model-tests", icon: Target, label: "Model Tests", sub: "Mock Assessments", color: "accent" },
          ].map((action) => (
            <motion.div key={action.label} variants={itemVariants}>
              <Link href={action.href}>
                <div className={cn(
                  "p-4 rounded-[22px] border-2 transition-all duration-300 flex flex-col gap-3 group cursor-pointer h-full backdrop-blur-md",
                  action.color === 'primary' ? "bg-primary/5 border-primary/20 hover:bg-primary/10 hover:border-primary/40" :
                  action.color === 'success' ? "bg-success/5 border-success/20 hover:bg-success/10 hover:border-success/40" :
                  "bg-accent/5 border-accent/20 hover:bg-accent/10 hover:border-accent/40"
                )}>
                   <div className={cn(
                     "w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 duration-500",
                     action.color === 'primary' ? "bg-primary" : action.color === 'success' ? "bg-success" : "bg-accent"
                   )}>
                     <action.icon className="w-5 h-5" />
                   </div>
                   <div>
                     <h4 className={cn("font-black text-sm uppercase tracking-wider", 
                       action.color === 'primary' ? "text-primary" : action.color === 'success' ? "text-success" : "text-accent"
                     )}>{action.label}</h4>
                     <p className="text-[10px] text-text-secondary font-medium mt-0.5">{action.sub}</p>
                   </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Workflow System */}
        <motion.div variants={itemVariants} className="relative z-10">
          <Card className="border-border/50 bg-bg-card/40 backdrop-blur-xl rounded-[32px] overflow-hidden border-2 shadow-2xl">
            <CardHeader className="p-6 pb-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <Layers3 className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-display font-black text-text-primary">
                    Content Creation Workflow
                  </CardTitle>
                  <p className="text-xs font-medium text-text-secondary mt-0.5">
                    Follow these steps to efficiently publish your assessments.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 grid gap-4 md:grid-cols-3">
              {[
                { step: "01", label: "Create Subject", desc: "Set pricing and initial configuration for a group of exams.", href: "/teacher/subjects", color: "primary" },
                { step: "02", label: "Model Test", desc: "Bundle multiple exams into a comprehensive model test.", href: "/teacher/model-tests", color: "accent" },
                { step: "03", label: "Publish Exam", desc: "Finalize your questions and make the assessment live.", href: "/teacher/create-exam", color: "success" },
              ].map((step, i) => (
                <div key={step.step} className="group relative">
                  <div className="p-5 rounded-[24px] border border-border/40 bg-bg-surface/30 space-y-3 hover:bg-bg-surface/50 hover:border-primary/30 transition-all h-full">
                    <div className="flex items-center justify-between">
                      <p className={cn("text-[10px] font-black tracking-[0.2em]", 
                        step.color === 'primary' ? "text-primary" : step.color === 'accent' ? "text-accent" : "text-success"
                      )}>STEP {step.step}</p>
                      <Sparkles className={cn("w-3.5 h-3.5 opacity-20", 
                        step.color === 'primary' ? "text-primary" : step.color === 'accent' ? "text-accent" : "text-success"
                      )} />
                    </div>
                    <h4 className="text-lg font-display font-black text-text-primary">{step.label}</h4>
                    <p className="text-[11px] text-text-secondary font-medium leading-relaxed">
                      {step.desc}
                    </p>
                    <Link href={step.href} className="block pt-1">
                      <Button variant="ghost" className={cn("w-full rounded-lg h-9 font-black text-[9px] uppercase tracking-widest", 
                        step.color === 'primary' ? "text-primary hover:bg-primary/10 hover:text-primary" : 
                        step.color === 'accent' ? "text-accent hover:bg-accent/10 hover:text-accent" : 
                        "text-success hover:bg-success/10 hover:text-success"
                      )}>
                        Get Started <ChevronRight className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                  {i < 2 && (
                    <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-20">
                      <div className="w-6 h-6 rounded-full bg-border/20 border border-border flex items-center justify-center">
                        <ArrowRight className="w-3 h-3 text-text-secondary" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Performance Table */}
        <motion.div variants={itemVariants} className="relative z-10">
          <Card className="border-border/50 bg-bg-card/40 backdrop-blur-xl rounded-[32px] overflow-hidden border-2 shadow-2xl">
            <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-accent/10 text-accent">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <CardTitle className="text-xl font-display font-black text-text-primary">Recent Performance</CardTitle>
              </div>
              <Link href="/teacher/analytics">
                <Button variant="outline" size="sm" className="rounded-lg h-8 border-border/50 hover:bg-primary hover:text-white transition-all font-black text-[9px] uppercase tracking-widest px-3">
                  Full Analytics <ArrowRight className="ml-1.5 w-3 h-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border/40 text-text-secondary text-[9px] uppercase tracking-[0.2em] font-black">
                      <th className="px-6 py-4">Assessment</th>
                      <th className="px-6 py-4">Attempts</th>
                      <th className="px-6 py-4">Avg Score</th>
                      <th className="px-6 py-4 text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {(recentPerformance.length > 0 ? recentPerformance : [{ title: 'No paid activity yet', attempts: '-', avgScore: '-', revenue: '৳0' }]).map((exam, i) => (
                      <tr key={i} className="group hover:bg-primary/[0.02] transition-colors">
                        <td className="px-6 py-4 font-black text-text-primary text-xs group-hover:text-primary transition-colors">{exam.title}</td>
                        <td className="px-6 py-4 text-xs text-text-secondary font-bold">{exam.attempts}</td>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-2">
                             <div className="flex-1 h-1 w-20 bg-bg-surface rounded-full overflow-hidden">
                                <div className="h-full bg-primary" style={{ width: exam.avgScore === '-' ? '0%' : exam.avgScore }} />
                             </div>
                             <span className="text-[10px] font-black text-text-secondary">{exam.avgScore === '-' ? '0%' : exam.avgScore}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4 font-black text-success text-right text-xs">{exam.revenue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
