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
import { Users, TrendingUp, Banknote, CheckCircle2 } from 'lucide-react';

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

const COLORS = ['#0052CC', '#E53E3E'];

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
      <div className="space-y-8 max-w-7xl mx-auto pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">Exam Analytics 📊</h1>
            <p className="text-text-secondary mt-1">শিক্ষার্থীদের পারফরম্যান্স এবং ডেটা বিশ্লেষণ করুন।</p>
          </div>

          <select
            className="bg-bg-card border border-border rounded-xl py-2 px-4 text-sm focus:outline-none"
            value={selectedExamId}
            onChange={(e) => {
              const id = e.target.value;
              router.push(id ? `/teacher/analytics?id=${id}` : '/teacher/analytics');
            }}
            disabled={examsLoading}
          >
            <option value="">{examsLoading ? 'Loading exams...' : 'Select Exam to View'}</option>
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.title}
              </option>
            ))}
          </select>
        </div>

        {!selectedExamId ? (
          <Card className="border-border bg-bg-card/50">
            <CardContent className="py-10 text-center text-text-secondary">
              Analytics দেখতে আগে একটি exam select করুন।
            </CardContent>
          </Card>
        ) : analyticsLoading ? (
          <Card className="border-border bg-bg-card/50">
            <CardContent className="py-10 text-center text-text-secondary">Analytics loading...</CardContent>
          </Card>
        ) : isError || !analytics ? (
          <Card className="border-border bg-bg-card/50">
            <CardContent className="py-10 text-center text-red-400">Analytics লোড করা যায়নি।</CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-border bg-bg-card/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-text-secondary font-bold uppercase tracking-wider">Total Attempts</p>
                      <h3 className="text-2xl font-bold">{analytics.totalAttempts}</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-bg-card/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center text-success">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-text-secondary font-bold uppercase tracking-wider">Average Score</p>
                      <h3 className="text-2xl font-bold">{analytics.averagePercentage}%</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-bg-card/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                      <Banknote className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-text-secondary font-bold uppercase tracking-wider">Revenue Earned</p>
                      <h3 className="text-2xl font-bold">৳{analytics.totalRevenueInTaka}</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-bg-card/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-warning/10 flex items-center justify-center text-warning">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-text-secondary font-bold uppercase tracking-wider">Pass Rate</p>
                      <h3 className="text-2xl font-bold">
                        {analytics.totalCompleted > 0 && analytics.passCount !== null
                          ? `${Math.round(((analytics.passCount || 0) / analytics.totalCompleted) * 100)}%`
                          : 'N/A'}
                      </h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-border bg-bg-card/50">
                <CardHeader>
                  <CardTitle className="text-lg">Question-wise Correct %</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={questionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E2D45" vertical={false} />
                      <XAxis dataKey="name" stroke="#8A99B8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#8A99B8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#111827', border: '1px solid #1E2D45', borderRadius: '8px' }}
                        itemStyle={{ color: '#F0F4FF' }}
                      />
                      <Bar dataKey="correct" fill="#0052CC" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-border bg-bg-card/50">
                <CardHeader>
                  <CardTitle className="text-lg">Pass vs Fail Ratio</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={passFailData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {passFailData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #1E2D45', borderRadius: '8px' }} />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="md:col-span-2 border-border bg-bg-card/50">
                <CardHeader>
                  <CardTitle className="text-lg">Attempts Trend</CardTitle>
                </CardHeader>
                <CardContent className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E2D45" vertical={false} />
                      <XAxis dataKey="day" stroke="#8A99B8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#8A99B8" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #1E2D45', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="attempts" stroke="#0052CC" strokeWidth={3} dot={{ r: 4, fill: '#0052CC' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
