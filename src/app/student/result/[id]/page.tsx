'use client';

import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  XCircle, 
  MinusCircle, 
  Clock, 
  Share2, 
  LayoutDashboard,
  Trophy,
  Loader2,
  HelpCircle,
  ImageIcon,
  Sparkles,
  ArrowLeft,
  Printer,
  ChevronRight,
  Zap,
  Target,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { useParams } from 'next/navigation';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

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

type ExamResult = {
  studentExamId: string;
  examId: string;
  subjectId: string | null;
  modelTestId: string | null;
  examTitle: string;
  totalQuestions: number;
  correct: number;
  wrong: number;
  percentageScore: number;
  isPassed: boolean | null;
  timeTakenSeconds: number;
  passMark: number | null;
  questionAnalytics: Array<{
    questionId: string;
    questionText: string;
    selectedOptionText: string;
    isCorrect: boolean;
    correctOptionText: string;
    solutionText?: string;
    solutionImage?: string;
  }>;
};

export default function ResultPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: result, isLoading, error } = useQuery({
    queryKey: ['exam-result', id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/student-exams/result/${id}`);
      return response.data as ExamResult;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center p-32 space-y-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap className="w-8 h-8 text-primary animate-pulse" />
            </div>
          </div>
          <p className="text-text-secondary font-black animate-pulse uppercase tracking-widest text-xs">Analyzing Your Performance...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !result) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center p-32 space-y-4">
          <XCircle className="w-16 h-16 text-danger opacity-20" />
          <h3 className="text-xl font-black text-text-primary">Failed to load result</h3>
          <Link href="/student/dashboard">
            <Button variant="outline" className="rounded-xl">Go Back Home</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const score = result.correct;
  const total = result.totalQuestions;
  const percentage = result.percentageScore;
  const isPassed = result.isPassed !== null ? result.isPassed : percentage >= 40;

  const stats = [
    { label: 'Correct Answers', value: result.correct, icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Incorrect', value: result.wrong, icon: XCircle, color: 'text-danger', bg: 'bg-danger/10' },
    { label: 'Time Spent', value: `${Math.floor(result.timeTakenSeconds / 60)}m ${result.timeTakenSeconds % 60}s`, icon: Clock, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Accuracy', value: `${percentage}%`, icon: Target, color: 'text-accent', bg: 'bg-accent/10' },
  ];

  const chartData = [
    { name: 'Correct', value: result.correct, color: '#00A651' },
    { name: 'Wrong', value: result.wrong, color: '#E53E3E' },
  ];

  return (
    <DashboardLayout>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto space-y-12 pb-24 px-4 relative"
      >
        {/* Background Glows */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Top Header Actions */}
        <div className="flex items-center justify-between relative z-10">
          <Button variant="ghost" render={<Link href="/student/dashboard" />} className="rounded-2xl w-12 h-12 bg-bg-card/50 backdrop-blur-md border border-border/50 hover:bg-bg-card">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-2xl border-border/50 bg-bg-card/50 hover:bg-bg-card font-black text-xs" onClick={() => window.print()}>
              <Printer className="w-4 h-4 mr-2" /> Print Result
            </Button>
          </div>
        </div>

        {/* Animated Result Hero */}
        <motion.section variants={itemVariants} className="flex flex-col items-center text-center space-y-6 py-8 px-6 relative overflow-hidden bg-bg-card/30 backdrop-blur-xl rounded-[40px] border-2 border-border/40 shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
            <Trophy className="w-48 h-48 text-yellow-500" />
          </div>
          
          <div className="space-y-4 relative z-10">
            <Badge className={cn(
              "px-8 py-2 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl",
              isPassed 
                ? "bg-success text-white shadow-success/20" 
                : "bg-danger text-white shadow-danger/20"
            )}>
              {isPassed ? '🎉 Congratulations! You Passed' : '💪 Keep Pushing Forward'}
            </Badge>
            <h1 className="text-3xl md:text-5xl font-display font-black text-text-primary leading-tight tracking-tight max-w-2xl mx-auto">
              {result.examTitle}
            </h1>
          </div>

          <div className="relative w-64 h-64 flex items-center justify-center my-6">
            <svg className="w-full h-full -rotate-90 transform">
              <circle
                cx="128"
                cy="128"
                r="110"
                fill="transparent"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="10"
              />
              <motion.circle
                cx="128"
                cy="128"
                r="110"
                fill="transparent"
                stroke={isPassed ? "var(--success)" : "var(--danger)"}
                strokeWidth="14"
                strokeDasharray="691.15"
                initial={{ strokeDashoffset: 691.15 }}
                animate={{ strokeDashoffset: 691.15 - (691.15 * percentage) / 100 }}
                transition={{ duration: 2.5, ease: "circOut" }}
                strokeLinecap="round"
                className="drop-shadow-[0_0_15px_rgba(0,166,81,0.3)]"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, duration: 0.5, type: "spring" }}
                className="flex flex-col items-center space-y-1"
              >
                <span className="text-6xl font-display font-black text-text-primary tracking-tighter">
                  {percentage}<span className="text-3xl text-text-secondary opacity-50">%</span>
                </span>
                <span className="text-xs font-black uppercase tracking-[0.3em] text-text-secondary">Accuracy Score</span>
              </motion.div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full max-w-md relative z-10">
            <div className="p-5 rounded-3xl bg-bg-surface/50 border border-border/40 backdrop-blur-md">
              <div className="text-3xl font-display font-black text-text-primary">{score}</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Points Earned</div>
            </div>
            <div className="p-5 rounded-3xl bg-bg-surface/50 border border-border/40 backdrop-blur-md">
              <div className="text-3xl font-display font-black text-text-primary">{total}</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Questions</div>
            </div>
          </div>
        </motion.section>

        {/* Detailed Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 px-2">
          {stats.map((stat) => (
            <motion.div key={stat.label} variants={itemVariants}>
              <Card className="group border-border/50 bg-bg-card/40 backdrop-blur-xl hover:bg-bg-card/70 transition-all duration-500 rounded-[32px] overflow-hidden border-2 flex flex-col items-center text-center p-8">
                <div className={cn("p-4 rounded-2xl mb-4 transition-transform group-hover:scale-110 shadow-lg", stat.bg)}>
                  <stat.icon className={cn("w-6 h-6", stat.color)} />
                </div>
                <div className="text-3xl font-display font-black text-text-primary">{stat.value}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-text-secondary mt-2 opacity-60">{stat.label}</div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Performance Visualization */}
        <div className="grid gap-8 lg:grid-cols-2 relative z-10">
          <motion.div variants={itemVariants} className="h-full">
            <Card className="h-full border-border/50 bg-bg-card/40 backdrop-blur-xl rounded-[40px] overflow-hidden border-2 shadow-xl">
              <CardHeader className="p-8 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-2xl font-display font-black text-text-primary">Performance Pie</CardTitle>
                </div>
                <Badge variant="outline" className="rounded-lg text-[10px] font-black opacity-50">ANALYTICS</Badge>
              </CardHeader>
              <CardContent className="h-80 p-8 pt-0 flex flex-col items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={10}
                      dataKey="value"
                      stroke="none"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} className="drop-shadow-lg" />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255,255,255,0.1)', 
                        borderRadius: '24px',
                        padding: '16px 24px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                      }}
                      itemStyle={{ fontWeight: '900', fontSize: '14px', color: '#fff' }}
                      labelStyle={{ display: 'none' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={40} 
                      iconType="circle"
                      formatter={(value) => <span className="text-xs font-black uppercase tracking-widest text-text-secondary px-3">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} className="h-full">
            <Card className="h-full border-border/50 bg-bg-card/40 backdrop-blur-xl rounded-[40px] overflow-hidden border-2 shadow-xl p-8 flex flex-col justify-center text-center space-y-6">
              <div className="space-y-2">
                <div className="w-20 h-20 bg-primary/10 rounded-[28px] flex items-center justify-center mx-auto text-primary border border-primary/20 shadow-inner">
                  <Sparkles className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-display font-black text-text-primary">What's Next?</h3>
                <p className="text-text-secondary font-medium max-w-xs mx-auto">আপনার স্কোর দেখে লিডারবোর্ড চেক করুন অথবা বন্ধুদের সাথে শেয়ার করুন।</p>
              </div>
              <div className="space-y-4 pt-4">
                <Button
                  className="w-full h-16 bg-primary hover:bg-primary-light text-white font-black rounded-[24px] shadow-2xl shadow-primary/30 transition-all hover:-translate-y-1 group"
                  render={<Link href={`/student/leaderboard/${result.examId}`} />}
                >
                  লিডারবোর্ড দেখুন <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button variant="outline" className="w-full h-16 rounded-[24px] border-2 border-border/50 bg-bg-card/50 hover:bg-bg-card font-black transition-all hover:-translate-y-1 group">
                  ফলাফল শেয়ার করুন <Share2 className="w-5 h-5 ml-2 group-hover:rotate-12 transition-transform" />
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Detailed Breakdown */}
        <motion.div variants={itemVariants} className="relative z-10">
          <Card className="border-border/50 bg-bg-card/40 backdrop-blur-xl rounded-[32px] overflow-hidden border-2 shadow-2xl">
            <CardHeader className="p-6 pb-4 border-b border-border/30 bg-bg-card/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-accent/10 text-accent">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <CardTitle className="text-2xl font-display font-black text-text-primary">Breakdown & Solutions</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/20">
                {result.questionAnalytics.map((item: any, idx: number) => (
                  <div key={item.questionId} className={cn(
                    "p-5 transition-all duration-500 relative group overflow-hidden",
                    item.isCorrect ? "hover:bg-success/[0.03]" : "hover:bg-danger/[0.03]"
                  )}>
                    <div className="flex flex-col md:flex-row items-start gap-4 relative z-10">
                      <div className={cn(
                        "w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0 font-black text-base text-white shadow-2xl transition-transform group-hover:scale-110",
                        item.isCorrect ? "bg-success shadow-success/40" : "bg-danger shadow-danger/40"
                      )}>
                        {idx + 1}
                      </div>
                      
                      <div className="flex-1 space-y-4">
                        <div className="space-y-1">
                          <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest opacity-50 rounded-lg h-4 px-1.5">Q-{idx + 1}</Badge>
                          <h4 className="font-black text-base md:text-lg text-text-primary leading-[1.3] group-hover:text-primary transition-colors">{item.questionText}</h4>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-3">
                          <div className={cn(
                            "p-3 rounded-[16px] border transition-all shadow-sm",
                            item.isCorrect ? "border-success/30 bg-success/5" : "border-danger/30 bg-danger/5"
                          )}>
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-[9px] font-black uppercase tracking-widest text-text-secondary opacity-60">Your Choice</p>
                              {item.isCorrect ? <CheckCircle2 className="w-3.5 h-3.5 text-success" /> : <XCircle className="w-3.5 h-3.5 text-danger" />}
                            </div>
                            <p className={cn("font-black text-sm", item.isCorrect ? "text-success" : "text-danger")}>
                              {item.selectedOptionText}
                            </p>
                          </div>
                          <div className="p-3 rounded-[16px] border border-success/30 bg-success/5 shadow-sm">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-[9px] font-black uppercase tracking-widest text-text-secondary opacity-60">Correct Answer</p>
                              <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                            </div>
                            <p className="font-black text-sm text-success">{item.correctOptionText}</p>
                          </div>
                        </div>

                        {/* Explanation Section */}
                        {(item.solutionText || item.solutionImage) && (
                          <div className="mt-4 p-4 rounded-[20px] bg-bg-surface/40 border border-border/40 relative overflow-hidden group/expl shadow-inner">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/expl:opacity-20 transition-opacity">
                               <HelpCircle className="w-16 h-16" />
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary border border-primary/20">
                                <HelpCircle className="w-4 h-4" />
                              </div>
                              <h5 className="font-black text-primary text-[10px] uppercase tracking-[0.2em]">Explanation</h5>
                            </div>
                            {item.solutionText && (
                              <p className="text-text-secondary text-xs md:text-sm leading-relaxed whitespace-pre-wrap relative z-10 font-medium">
                                {item.solutionText}
                              </p>
                            )}
                            {item.solutionImage && (
                              <div className="mt-4 relative z-10 rounded-[20px] overflow-hidden border-2 border-bg-card shadow-xl">
                                <img 
                                  src={item.solutionImage} 
                                  alt="Solution Visualization" 
                                  className="max-w-full object-contain max-h-[400px] mx-auto hover:scale-105 transition-transform duration-700"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
