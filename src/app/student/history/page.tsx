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
import { Loader2, TrendingUp, Trophy, Target, Clock, ArrowRight } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
      <div className="space-y-8 max-w-7xl mx-auto">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">আমার Results</h1>
          <p className="text-text-secondary mt-1">
            আপনার সব completed exam result একসাথে দেখুন এবং performance trend track করুন।
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-border bg-bg-card/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-text-secondary">{stat.label}</p>
                  <stat.icon className={cn('w-4 h-4', stat.color)} />
                </div>
                <p className="text-2xl font-bold mt-2">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border bg-bg-card/50">
            <CardHeader>
              <CardTitle>Score Trend (Line)</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              {chartData.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="attempt" stroke="var(--text-secondary)" />
                    <YAxis stroke="var(--text-secondary)" domain={[0, 100]} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="percentageScore"
                      stroke="var(--primary)"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-text-secondary text-sm">
                  কোনো completed exam result পাওয়া যায়নি।
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border bg-bg-card/50">
            <CardHeader>
              <CardTitle>Score Comparison (Bar)</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              {chartData.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="attempt" stroke="var(--text-secondary)" />
                    <YAxis stroke="var(--text-secondary)" domain={[0, 100]} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="percentageScore" fill="var(--accent)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-text-secondary text-sm">
                  চার্ট দেখানোর মতো data নেই।
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-border bg-bg-card/50">
          <CardHeader>
            <CardTitle>সব Exam Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {completedHistory.length === 0 ? (
              <div className="text-text-secondary text-sm">Completed exam history empty.</div>
            ) : (
              completedHistory.map((item) => (
                <div
                  key={item.studentExamId}
                  className="rounded-2xl border border-border bg-bg-surface p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >
                  <div>
                    <h3 className="font-bold">{item.examTitle}</h3>
                    <p className="text-sm text-text-secondary">
                      Teacher: {item.teacherName} •{' '}
                      {item.completedAt
                        ? new Date(item.completedAt).toLocaleDateString()
                        : 'Not completed'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge
                      className={cn(
                        'font-bold',
                        item.percentageScore >= 40
                          ? 'bg-success/10 text-success border-success/20'
                          : 'bg-danger/10 text-danger border-danger/20',
                      )}
                    >
                      {item.score}/{item.totalQuestions} ({item.percentageScore}%)
                    </Badge>

                    <Button
                      variant="outline"
                      className="rounded-xl"
                      render={<Link href={`/student/result/${item.studentExamId}`} />}
                    >
                      View Result <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
