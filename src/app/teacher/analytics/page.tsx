'use client';

import { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { Users, TrendingUp, Banknote, CheckCircle2, Search, Filter, Info, ChevronRight, BarChart3, PieChart as PieChartIcon, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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

type ExamItem = {
  id: string;
  title: string;
};

type AnalyticsResponse = {
  examTitle: string;
  totalAttempts: number;
  totalCompleted: number;
  averageScore: number;
  averagePercentage: number;
  passCount: number | null;
  failCount: number | null;
  totalRevenueInTaka: number;
  questionWiseStats: Array<{
    questionId: string;
    questionText: string;
    correctPercentage: number;
  }>;
};

const COLORS = ['#0052CC', '#FF4D4F'];

export default function AnalyticsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedExamId = searchParams.get('id') || '';

  const { data: exams = [], isLoading: examsLoading } = useQuery<ExamItem[]>({
    queryKey: ['teacher-exams-for-analytics'],
    queryFn: async () => (await axiosInstance.get('/exams/my')).data,
  });

  const { data: analytics, isLoading: analyticsLoading, isError } = useQuery<AnalyticsResponse>({
    queryKey: ['teacher-exam-analytics', selectedExamId],
    queryFn: async () => (await axiosInstance.get(`/exams/${selectedExamId}/analytics`)).data,
    enabled: !!selectedExamId,
  });

  const questionData = useMemo(
    () =>
      (analytics?.questionWiseStats || []).map((q, idx) => ({
        name: `Q${idx + 1}`,
        correct: Number(q.correctPercentage?.toFixed(2) || 0),
      })),
    [analytics],
  );

  const passFailData = useMemo(
    () => [
      { name: 'Passed', value: analytics?.passCount ?? 0 },
      { name: 'Failed', value: analytics?.failCount ?? 0 },
    ],
    [analytics],
  );

  const trendData = useMemo(
    () => [{ day: 'All Time', attempts: analytics?.totalAttempts || 0 }],
    [analytics],
  );

  return (
    <DashboardLayout>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-10 max-w-7xl mx-auto relative px-4 pb-20"
      >
        {/* Background Decorative Glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black px-3 py-1 rounded-lg uppercase tracking-widest text-[10px]">
                Data Insights
              </Badge>
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-black tracking-tight text-text-primary leading-tight">
              Exam <span className="text-primary">Analytics</span> 📊
            </h1>
            <p className="text-text-secondary text-lg max-w-2xl font-medium">
              Analyze student performance and harvest valuable data insights.
            </p>
          </div>

          <div className="relative group min-w-[240px]">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors" />
            <select
              className="w-full bg-bg-card/40 backdrop-blur-xl border border-border/50 rounded-[18px] py-3.5 pl-12 pr-10 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all shadow-sm appearance-none cursor-pointer"
              value={selectedExamId}
              onChange={(e) => {
                const id = e.target.value;
                router.push(id ? `/teacher/analytics?id=${id}` : '/teacher/analytics');
              }}
              disabled={examsLoading}
            >
              <option value="">{examsLoading ? 'Loading assessments...' : 'Select Assessment to Analyze'}</option>
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.title}
                </option>
              ))}
            </select>
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary pointer-events-none rotate-90" />
          </div>
        </motion.div>

        {!selectedExamId ? (
          <motion.div variants={itemVariants} className="relative z-10">
            <Card className="border-border/50 bg-bg-card/40 backdrop-blur-xl rounded-[32px] p-20 text-center space-y-6 border-dashed border-2">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Search className="w-10 h-10 text-primary opacity-40" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-display font-black text-text-primary">Select an Exam</h3>
                <p className="text-text-secondary font-medium max-w-md mx-auto">
                  Please choose an assessment from the dropdown above to view detailed performance metrics and student analytics.
                </p>
              </div>
            </Card>
          </motion.div>
        ) : analyticsLoading ? (
          <motion.div variants={itemVariants} className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary opacity-20" />
            <p className="text-text-secondary font-black animate-pulse uppercase tracking-widest text-xs">Crunching data numbers...</p>
          </motion.div>
        ) : isError || !analytics ? (
          <motion.div variants={itemVariants} className="relative z-10">
            <Card className="border-danger/20 bg-danger/5 rounded-[32px] p-10 text-center">
              <Info className="w-10 h-10 text-danger mx-auto mb-4" />
              <p className="text-danger font-black uppercase tracking-widest text-xs">Failed to load analytics data. Please try again later.</p>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-8 relative z-10">
            {/* Summary Stats */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'Total Attempts', value: analytics.totalAttempts, icon: Users, color: 'primary', bg: 'bg-primary/10' },
                { label: 'Average Score', value: `${analytics.averagePercentage}%`, icon: TrendingUp, color: 'success', bg: 'bg-success/10' },
                { label: 'Revenue Earned', value: `৳${analytics.totalRevenueInTaka}`, icon: Banknote, color: 'accent', bg: 'bg-accent/10' },
                { label: 'Pass Rate', value: analytics.totalCompleted > 0 && analytics.passCount !== null ? `${Math.round(((analytics.passCount || 0) / analytics.totalCompleted) * 100)}%` : 'N/A', icon: CheckCircle2, color: 'warning', bg: 'bg-warning/10' },
              ].map((stat) => (
                <motion.div key={stat.label} variants={itemVariants}>
                  <Card className="group border-border/50 bg-bg-card/40 backdrop-blur-xl rounded-[24px] overflow-hidden border-2 transition-all duration-500 hover:bg-bg-card/70">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className={cn("p-3 rounded-xl transition-transform group-hover:scale-110 shadow-inner", stat.bg)}>
                        <stat.icon className={cn("w-5 h-5", `text-${stat.color}`)} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-text-secondary">{stat.label}</p>
                        <h3 className="text-2xl font-display font-black text-text-primary">{stat.value}</h3>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid gap-8 md:grid-cols-2">
              <motion.div variants={itemVariants}>
                <Card className="border-border/50 bg-bg-card/40 backdrop-blur-xl rounded-[28px] overflow-hidden border-2 shadow-2xl h-full">
                  <CardHeader className="p-6 pb-2 border-b border-border/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                        <BarChart3 className="w-5 h-5" />
                      </div>
                      <CardTitle className="text-lg font-display font-black text-text-primary">Question Distribution</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={questionData}>
                        <defs>
                          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#0052CC" stopOpacity={1} />
                            <stop offset="100%" stopColor="#0052CC" stopOpacity={0.6} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(138, 153, 184, 0.1)" vertical={false} />
                        <XAxis dataKey="name" stroke="#8A99B8" fontSize={11} fontWeight={800} tickLine={false} axisLine={false} />
                        <YAxis stroke="#8A99B8" fontSize={11} fontWeight={800} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                        <Tooltip
                          cursor={{ fill: 'rgba(0, 82, 204, 0.05)', radius: 10 }}
                          contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: 'none', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '12px' }}
                          itemStyle={{ color: '#0052CC', fontWeight: 900, fontSize: '12px' }}
                        />
                        <Bar dataKey="correct" fill="url(#barGradient)" radius={[8, 8, 4, 4]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="border-border/50 bg-bg-card/40 backdrop-blur-xl rounded-[32px] overflow-hidden border-2 shadow-2xl h-full">
                  <CardHeader className="p-8 pb-4 border-b border-border/20">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-accent/10 text-accent">
                        <PieChartIcon className="w-5 h-5" />
                      </div>
                      <CardTitle className="text-xl font-display font-black text-text-primary">Pass vs Fail Ratio</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 h-[360px] flex items-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={passFailData}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={120}
                          paddingAngle={8}
                          dataKey="value"
                          stroke="none"
                        >
                          {passFailData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="focus:outline-none" />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }} />
                        <Legend 
                          verticalAlign="bottom" 
                          height={36} 
                          formatter={(value) => <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-2">{value}</span>}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants} className="md:col-span-2">
                <Card className="border-border/50 bg-bg-card/40 backdrop-blur-xl rounded-[32px] overflow-hidden border-2 shadow-2xl h-full">
                  <CardHeader className="p-8 pb-4 border-b border-border/20">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-success/10 text-success">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <CardTitle className="text-xl font-display font-black text-text-primary">Engagement Trends</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData}>
                        <defs>
                          <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#0052CC" stopOpacity={0.2} />
                            <stop offset="100%" stopColor="#0052CC" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(138, 153, 184, 0.1)" vertical={false} />
                        <XAxis dataKey="day" stroke="#8A99B8" fontSize={11} fontWeight={800} tickLine={false} axisLine={false} />
                        <YAxis stroke="#8A99B8" fontSize={11} fontWeight={800} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="attempts" 
                          stroke="#0052CC" 
                          strokeWidth={4} 
                          dot={{ r: 6, fill: '#0052CC', strokeWidth: 4, stroke: 'white' }} 
                          activeDot={{ r: 8, strokeWidth: 0 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
