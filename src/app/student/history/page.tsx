'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  LineChart,
  Line,
  BarChart,
  Bar,
} from 'recharts';
import { Loader2, TrendingUp, Trophy, Target, Clock, ArrowRight, Info, Calendar, BarChart3, LineChart as LineIcon, User as UserIcon } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
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
      type: "spring" as const,
      stiffness: 100,
      damping: 15
    }
  }
};

type StudentExamHistoryItem = {
  studentExamId: string;
  examTitle: string;
  teacherName: string;
  score: number;
  totalQuestions: number;
  percentageScore: number;
  status: string;
  isPaid: boolean;
  startedAt: string;
  completedAt?: string | null;
};

export default function StudentHistoryPage() {
  const { data: history = [], isLoading, error } = useQuery({
    queryKey: ['student-exam-history'],
    queryFn: async () => {
      const response = await axiosInstance.get('/student-exams/history');
      return response.data as StudentExamHistoryItem[];
    },
  });

  const completedHistory = useMemo(
    () => history.filter((item) => item.status === 'completed'),
    [history],
  );

  const summary = useMemo(() => {
    if (!completedHistory.length) {
      return {
        totalExams: 0,
        avgScore: 0,
        highestScore: 0,
        avgTimeMinutes: 0,
      };
    }

    const totalPercentage = completedHistory.reduce(
      (sum, exam) => sum + exam.percentageScore,
      0,
    );
    const highestScore = Math.max(...completedHistory.map((exam) => exam.percentageScore));

    return {
      totalExams: completedHistory.length,
      avgScore: Math.round(totalPercentage / completedHistory.length),
      highestScore,
      avgTimeMinutes: 0,
    };
  }, [completedHistory]);

  const chartData = useMemo(
    () =>
      completedHistory
        .slice()
        .reverse()
        .map((item, index) => ({
          attempt: index + 1,
          examTitle:
            item.examTitle.length > 24 ? `${item.examTitle.slice(0, 24)}...` : item.examTitle,
          percentageScore: item.percentageScore,
          scoreLabel: `${item.score}/${item.totalQuestions}`,
        })),
    [completedHistory],
  );

  const stats = [
    { label: 'Total Exams', value: summary.totalExams, icon: Trophy, color: 'text-primary' },
    { label: 'Average Score', value: `${summary.avgScore}%`, icon: Target, color: 'text-success' },
    {
      label: 'Best Score',
      value: `${summary.highestScore}%`,
      icon: TrendingUp,
      color: 'text-accent',
    },
    { label: 'Completed', value: completedHistory.length, icon: Clock, color: 'text-warning' },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center p-20">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center p-20 text-danger font-bold">
          Failed to load your results.
        </div>
      </DashboardLayout>
    );
  }

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

        <motion.div variants={itemVariants} className="relative z-10 space-y-2">
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black px-3 py-1 rounded-lg uppercase tracking-widest text-[10px]">
              Performance Hub
            </Badge>
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-black tracking-tight text-text-primary leading-tight">
            My Results <span className="text-primary">&</span> History
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl font-medium">
            View all your completed exam results and track your performance trends in one place.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 relative z-10">
          {stats.map((stat) => (
            <motion.div key={stat.label} variants={itemVariants}>
              <Card className="group border-border/50 bg-bg-card/40 backdrop-blur-xl hover:bg-bg-card/70 hover:shadow-[0_20px_50px_rgba(0,82,204,0.1)] transition-all duration-500 rounded-[32px] overflow-hidden border-2 hover:border-primary/30">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className={cn("p-4 rounded-2xl transition-transform group-hover:scale-110", stat.color.replace('text-', 'bg-').concat('/10'))}>
                      <stat.icon className={cn("w-6 h-6", stat.color)} />
                    </div>
                    <Badge variant="outline" className="text-[10px] font-black opacity-50">STAT</Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-black uppercase tracking-widest text-text-secondary">{stat.label}</p>
                    <p className="text-4xl font-display font-black text-text-primary">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid gap-8 lg:grid-cols-2 relative z-10">
          <motion.div variants={itemVariants} className="h-full">
            <Card className="h-full border-border/50 bg-bg-card/40 backdrop-blur-xl rounded-[32px] overflow-hidden border-2 hover:border-primary/20 transition-all">
              <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                    <LineIcon className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-xl font-display font-black text-text-primary">Score Trend</CardTitle>
                </div>
                <div className="text-[10px] font-black text-text-secondary uppercase tracking-widest bg-bg-surface/50 px-3 py-1 rounded-lg border border-border/40">Last 10 Attempts</div>
              </CardHeader>
              <CardContent className="h-80 p-8 pt-4">
                {chartData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <defs>
                        <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} opacity={0.5} />
                      <XAxis 
                        dataKey="attempt" 
                        stroke="var(--text-secondary)" 
                        fontSize={10} 
                        fontWeight="bold"
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        stroke="var(--text-secondary)" 
                        domain={[0, 100]} 
                        fontSize={10} 
                        fontWeight="bold"
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: 'rgba(15, 23, 42, 0.9)',
                          backdropFilter: 'blur(16px)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '16px',
                          boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
                        }}
                        itemStyle={{ color: '#fff', fontWeight: 'bold', fontSize: '12px' }}
                        labelStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="percentageScore"
                        stroke="var(--primary)"
                        strokeWidth={4}
                        dot={{ r: 6, fill: 'var(--primary)', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 8, strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-text-secondary text-sm gap-4">
                    <div className="p-6 rounded-full bg-bg-surface/40">
                      <Info className="w-10 h-10 opacity-20" />
                    </div>
                    No completed exam results found.
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} className="h-full">
            <Card className="h-full border-border/50 bg-bg-card/40 backdrop-blur-xl rounded-[32px] overflow-hidden border-2 hover:border-primary/20 transition-all">
              <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-accent/10 text-accent">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-xl font-display font-black text-text-primary">Score Comparison</CardTitle>
                </div>
                <div className="text-[10px] font-black text-text-secondary uppercase tracking-widest bg-bg-surface/50 px-3 py-1 rounded-lg border border-border/40">Performance Bar</div>
              </CardHeader>
              <CardContent className="h-80 p-8 pt-4">
                {chartData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} opacity={0.5} />
                      <XAxis 
                        dataKey="attempt" 
                        stroke="var(--text-secondary)" 
                        fontSize={10} 
                        fontWeight="bold"
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        stroke="var(--text-secondary)" 
                        domain={[0, 100]} 
                        fontSize={10} 
                        fontWeight="bold"
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <RechartsTooltip
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        contentStyle={{
                          backgroundColor: 'rgba(15, 23, 42, 0.9)',
                          backdropFilter: 'blur(16px)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '16px',
                          boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
                        }}
                        itemStyle={{ color: '#fff', fontWeight: 'bold', fontSize: '12px' }}
                        labelStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}
                      />
                      <Bar 
                        dataKey="percentageScore" 
                        fill="var(--accent)" 
                        radius={[8, 8, 4, 4]}
                        className="transition-all hover:opacity-80"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-text-secondary text-sm gap-4">
                    <div className="p-6 rounded-full bg-bg-surface/40">
                      <Info className="w-10 h-10 opacity-20" />
                    </div>
                    No data available for chart.
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Full History Table/List */}
        <motion.div variants={itemVariants} className="relative z-10">
          <Card className="border-border/50 bg-bg-card/40 backdrop-blur-xl rounded-[32px] overflow-hidden border-2">
            <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                  <Calendar className="w-5 h-5" />
                </div>
                <CardTitle className="text-2xl font-display font-black text-text-primary">All Exam Results</CardTitle>
              </div>
              <Badge variant="outline" className="bg-bg-surface/50 border-border/60 text-text-secondary font-black">
                {completedHistory.length} ATTEMPTS
              </Badge>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
              {completedHistory.length === 0 ? (
                <div className="text-text-secondary font-bold py-20 text-center flex flex-col items-center gap-4">
                  <div className="p-8 rounded-full bg-bg-surface/40">
                    <Trophy className="w-16 h-16 opacity-10" />
                  </div>
                  You have no completed exam history yet.
                </div>
              ) : (
                <div className="grid gap-4">
                  {completedHistory.map((item) => (
                    <motion.div
                      key={item.studentExamId}
                      whileHover={{ x: 8 }}
                      className="rounded-[28px] border border-border/40 bg-bg-surface/30 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6 hover:bg-bg-surface/50 hover:border-primary/30 transition-all group relative overflow-hidden"
                    >
                      {/* Interactive background shine */}
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6 flex-1">
                        <div className={cn(
                          "w-16 h-16 rounded-[18px] flex flex-col items-center justify-center font-black shadow-lg transition-transform group-hover:scale-105",
                          item.percentageScore >= 40
                            ? 'bg-success/10 text-success border border-success/20'
                            : 'bg-danger/10 text-danger border border-danger/20'
                        )}>
                          <div className="text-xl">{item.score}</div>
                          <div className="text-[9px] opacity-70 uppercase tracking-widest">Score</div>
                        </div>

                        <div className="space-y-1.5">
                          <h3 className="font-black text-lg text-text-primary group-hover:text-primary transition-colors leading-tight">
                            {item.examTitle}
                          </h3>
                          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-text-secondary">
                            <span className="flex items-center gap-1.5">
                              <UserIcon className="w-3.5 h-3.5 text-primary/60" /> {item.teacherName}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-border" />
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-accent/60" /> 
                              {item.completedAt ? new Date(item.completedAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                            </span>
                            {item.percentageScore >= 40 ? (
                              <Badge className="bg-success/10 text-success border-success/20 py-0 h-5 text-[9px] font-black uppercase">Passed</Badge>
                            ) : (
                              <Badge className="bg-danger/10 text-danger border-danger/20 py-0 h-5 text-[9px] font-black uppercase">Failed</Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="relative z-10 flex items-center gap-3">
                        <Button
                          variant="outline"
                          className="rounded-[20px] h-12 px-8 border-2 border-border/60 bg-bg-card/50 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 font-black shadow-sm group/btn"
                          render={<Link href={`/student/result/${item.studentExamId}`} />}
                        >
                          Details Result 
                          <ArrowRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
