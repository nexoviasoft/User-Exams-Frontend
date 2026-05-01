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
  ImageIcon
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { useParams } from 'next/navigation';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

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
        <div className="flex justify-center p-20">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !result) {
    return (
      <DashboardLayout>
        <div className="flex justify-center p-20 text-danger font-bold">
          Failed to load result.
        </div>
      </DashboardLayout>
    );
  }

  const score = result.correct;
  const total = result.totalQuestions;
  const percentage = result.percentageScore;
  const isPassed = result.isPassed !== null ? result.isPassed : percentage >= 40;

  const stats = [
    { label: 'Correct', value: result.correct, icon: CheckCircle2, color: 'text-success' },
    { label: 'Wrong', value: result.wrong, icon: XCircle, color: 'text-danger' },
    { label: 'Time Taken', value: `${Math.floor(result.timeTakenSeconds / 60)}m ${result.timeTakenSeconds % 60}s`, icon: Clock, color: 'text-primary' },
  ];

  const chartData = [
    { name: 'Correct', value: result.correct, color: '#00A651' },
    { name: 'Wrong', value: result.wrong, color: '#E53E3E' },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-12 pb-20">
        {/* Animated Score Reveal */}
        <section className="flex flex-col items-center text-center space-y-6 py-8">
          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* SVG Arc Progress */}
            <svg className="w-full h-full -rotate-90 transform">
              <circle
                cx="128"
                cy="128"
                r="110"
                fill="transparent"
                stroke="var(--border)"
                strokeWidth="12"
              />
              <motion.circle
                cx="128"
                cy="128"
                r="110"
                fill="transparent"
                stroke={isPassed ? "var(--success)" : "var(--danger)"}
                strokeWidth="12"
                strokeDasharray="690.8"
                initial={{ strokeDashoffset: 690.8 }}
                animate={{ strokeDashoffset: 690.8 - (690.8 * percentage) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="text-6xl font-display font-extrabold text-text-primary"
              >
                {score}/{total}
              </motion.span>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="text-xl font-bold text-text-secondary"
              >
                Score: {percentage}%
              </motion.div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8 }}
            className="space-y-4"
          >
            <Badge className={cn(
              "px-8 py-2 text-lg font-bold rounded-full",
              isPassed ? "bg-success text-white shadow-[0_5px_15px_rgba(0,166,81,0.3)]" : "bg-danger text-white shadow-[0_5px_15px_rgba(229,62,62,0.3)]"
            )}>
              {isPassed ? 'PASSED' : 'FAILED'}
            </Badge>
            <h1 className="text-3xl font-display font-bold">{result.examTitle}</h1>
          </motion.div>
        </section>

        {/* Stats Row */}
        <div className="flex justify-center gap-4 flex-wrap">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-border bg-bg-card/50 min-w-[150px]">
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <stat.icon className={cn("w-6 h-6 mb-2", stat.color)} />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-text-secondary uppercase tracking-wider font-medium">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Analytics Chart */}
        <Card className="border-border bg-bg-card/50">
          <CardHeader>
            <CardTitle>Performance Chart</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center items-center h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Breakdown Table with Explanations */}
        <Card className="border-border bg-bg-card/50 overflow-hidden">
          <CardHeader>
            <CardTitle>Question Breakdown & Solutions</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <div className="divide-y divide-border">
              {result.questionAnalytics.map((item: any, idx: number) => (
                <div key={item.questionId} className={cn(
                  "p-6 transition-colors",
                  item.isCorrect ? "hover:bg-success/5" : "hover:bg-danger/5"
                )}>
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-white",
                      item.isCorrect ? "bg-success" : "bg-danger"
                    )}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 space-y-4">
                      <h4 className="font-bold text-lg">{item.questionText}</h4>
                      
                      <div className="grid sm:grid-cols-2 gap-4 text-sm">
                        <div className="p-3 rounded-xl border border-border bg-bg-surface/50">
                          <p className="text-text-secondary font-medium mb-1">Your Answer:</p>
                          <p className={cn("font-bold", item.isCorrect ? "text-success" : "text-danger")}>
                            {item.selectedOptionText}
                          </p>
                        </div>
                        <div className="p-3 rounded-xl border border-border bg-bg-surface/50">
                          <p className="text-text-secondary font-medium mb-1">Correct Answer:</p>
                          <p className="font-bold text-success">{item.correctOptionText}</p>
                        </div>
                      </div>

                      {/* Explanation Section */}
                      {(item.solutionText || item.solutionImage) && (
                        <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
                          <h5 className="font-bold text-primary flex items-center gap-2 mb-2">
                            <HelpCircle className="w-4 h-4" /> Explanation
                          </h5>
                          {item.solutionText && (
                            <p className="text-text-secondary text-sm mb-3 whitespace-pre-wrap">
                              {item.solutionText}
                            </p>
                          )}
                          {item.solutionImage && (
                            <div className="mt-2">
                              <img 
                                src={item.solutionImage} 
                                alt="Solution Explanation" 
                                className="max-w-full rounded-xl border border-border object-contain max-h-64"
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

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" className="border-border hover:bg-bg-surface h-12 px-8 rounded-xl font-bold">
            <Share2 className="mr-2 w-4 h-4" /> Share Result
          </Button>
          <Button
            className="bg-accent hover:bg-accent-light text-white h-12 px-8 rounded-xl font-bold shadow-lg"
            render={<Link href={`/student/leaderboard/${result.examId}`} />}
          >
            <Trophy className="mr-2 w-4 h-4" /> Leaderboard
          </Button>
          <Button variant="ghost" className="text-primary hover:bg-primary/10 h-12 px-8 rounded-xl font-bold" render={<Link href="/student/dashboard" />}>
              <LayoutDashboard className="mr-2 w-4 h-4" /> Dashboard
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
