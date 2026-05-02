'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, FileBadge, LineChart as LineChartIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

interface AnalyticsEntry {
  examTitle: string;
  score: number;
  percentageScore: number;
  totalQuestions: number;
  completedAt: string;
}

export default function ModelTestAnalyticsPage() {
  const params = useParams();
  const modelTestId = params.modelTestId as string;

  const { data: analytics = [], isLoading, error } = useQuery<AnalyticsEntry[]>({
    queryKey: ['modeltest-analytics', modelTestId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/student-exams/analytics/modeltest/${modelTestId}`);
      return response.data;
    },
    enabled: !!modelTestId,
  });

  const chartData = analytics.map((entry, idx) => ({
    name: `Exam ${idx + 1}`,
    score: entry.score,
    percentage: entry.percentageScore,
    title: entry.examTitle
  }));

  const averageScore = analytics.length 
    ? Math.round(analytics.reduce((acc, curr) => acc + curr.percentageScore, 0) / analytics.length)
    : 0;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-20">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-bg-surface">
            <Link href="/student/browse">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight flex items-center gap-2">
              <LineChartIcon className="w-6 h-6 sm:w-8 sm:h-8 text-accent" /> Model Test Analytics
            </h1>
            <p className="text-text-secondary mt-1 flex items-center gap-1">
              <FileBadge className="w-4 h-4" /> Your performance history in this model test
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-20">
            <Loader2 className="w-10 h-10 animate-spin text-accent" />
          </div>
        ) : error ? (
          <div className="text-center p-10 text-danger font-bold">
            Failed to load analytics.
          </div>
        ) : analytics.length === 0 ? (
          <div className="text-center p-10 text-text-secondary bg-bg-card/50 rounded-xl border border-border">
            You haven't completed any exams in this model test yet.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
               <Card className="border-border bg-bg-card/50">
                 <CardContent className="pt-6 flex flex-col items-center text-center">
                   <div className="text-3xl font-bold text-accent">{analytics.length}</div>
                   <div className="text-sm text-text-secondary uppercase tracking-wider font-medium">Exams Taken</div>
                 </CardContent>
               </Card>
               <Card className="border-border bg-bg-card/50">
                 <CardContent className="pt-6 flex flex-col items-center text-center">
                   <div className="text-3xl font-bold text-primary">{averageScore}%</div>
                   <div className="text-sm text-text-secondary uppercase tracking-wider font-medium">Average Score</div>
                 </CardContent>
               </Card>
            </div>

            <Card className="border-border bg-bg-card/50">
              <CardHeader>
                <CardTitle>Performance Over Time (Percentage %)</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px' }}
                      labelStyle={{ color: 'var(--text-secondary)', marginBottom: '4px' }}
                      itemStyle={{ fontWeight: 'bold' }}
                      formatter={(value: number, name: string, props: any) => [`${value}%`, props.payload.title]}
                    />
                    <Line type="monotone" dataKey="percentage" stroke="var(--accent)" strokeWidth={3} dot={{ r: 4, fill: 'var(--accent)', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
