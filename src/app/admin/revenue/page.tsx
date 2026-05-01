'use client';

import { useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { 
  Banknote, 
  TrendingUp, 
  ArrowUpRight, 
  CreditCard, 
  Calendar,
  Loader2,
  ArrowDownRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  useGetPlatformRevenueStatsQuery,
  useGetRevenuePaymentsQuery,
  type RevenuePayment,
} from '@/store/slices/api/revenueApi';

const formatCurrency = (amount: number) => `৳${Math.round(amount).toLocaleString('en-US')}`;
const formatLakh = (amountInTaka: number) => `${(amountInTaka / 100000).toFixed(2)}L`;
const formatMethod = (method?: string) => {
  if (!method) return 'N/A';
  const lower = method.toLowerCase();
  if (lower === 'bkash') return 'bKash';
  if (lower === 'nagad') return 'Nagad';
  return method;
};

const getMonthKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}`;

export default function AdminRevenuePage() {
  const {
    data: stats,
    isLoading: isStatsLoading,
    isError: isStatsError,
  } = useGetPlatformRevenueStatsQuery();
  const {
    data: paymentsResponse,
    isLoading: isPaymentsLoading,
    isError: isPaymentsError,
  } = useGetRevenuePaymentsQuery();

  const successfulPayments = paymentsResponse?.items || [];
  const isLoading = isStatsLoading || isPaymentsLoading;
  const hasError = isStatsError || isPaymentsError;

  const derived = useMemo(() => {
    const sortedPayments = [...successfulPayments].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const now = new Date();
    const currentMonthKey = getMonthKey(now);
    const todayKey = now.toISOString().slice(0, 10);

    const byDate = new Map<string, { total: number; platform: number }>();
    let grossTotalInTaka = 0;
    let teacherTotalInTaka = 0;
    let platformTodayInTaka = 0;
    let thisMonthPlatformInTaka = 0;

    for (const payment of sortedPayments) {
      const created = new Date(payment.createdAt);
      if (Number.isNaN(created.getTime())) continue;

      const dateKey = created.toISOString().slice(0, 10);
      const chartPoint = byDate.get(dateKey) || { total: 0, platform: 0 };
      const totalInTaka = (payment.totalAmount || 0) / 100;
      const platformInTaka = (payment.platformAmount || 0) / 100;
      const teacherInTaka = (payment.teacherAmount || 0) / 100;

      chartPoint.total += totalInTaka;
      chartPoint.platform += platformInTaka;
      byDate.set(dateKey, chartPoint);

      grossTotalInTaka += totalInTaka;
      teacherTotalInTaka += teacherInTaka;

      if (dateKey === todayKey) {
        platformTodayInTaka += platformInTaka;
      }
      if (getMonthKey(created) === currentMonthKey) {
        thisMonthPlatformInTaka += platformInTaka;
      }
    }

    const chartData = Array.from(byDate.entries())
      .map(([dateKey, value]) => ({
        date: new Date(dateKey).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
        total: Math.round(value.total),
        platform: Math.round(value.platform),
      }))
      .slice(-7);

    return {
      chartData,
      grossTotalInTaka,
      teacherTotalInTaka,
      platformTodayInTaka,
      thisMonthPlatformInTaka,
      transactions: [...successfulPayments]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 8),
    };
  }, [successfulPayments]);

  const totalTransactions = stats?.totalTransactions || 0;
  const averagePerTxn =
    totalTransactions > 0 ? Math.round(derived.grossTotalInTaka / totalTransactions) : 0;
  const totalRevenueLakh = formatLakh(stats?.totalRevenueInTaka || 0);
  const growthText = totalTransactions > 0 ? `${stats?.successCount || 0} success` : 'No data';

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight text-text-primary">Financial Analytics 💰</h1>
            <p className="text-text-secondary mt-1">প্ল্যাটফর্মের আয় এবং শেয়ার ডিস্ট্রিবিউশন ট্র্যাক করুন।</p>
          </div>
          <Button variant="outline" className="border-border rounded-xl">
             <Calendar className="w-4 h-4 mr-2" /> Last 30 Days
          </Button>
        </div>
        {hasError && (
          <div className="text-center p-4 text-danger font-bold bg-danger/5 rounded-xl border border-danger/20">
            Revenue data load করতে সমস্যা হয়েছে।
          </div>
        )}

        {/* Big Revenue Card */}
        <Card className="border-border bg-primary/10 relative overflow-hidden p-8 md:p-12">
           <div className="absolute top-0 right-0 p-12 opacity-5">
             <Banknote className="w-64 h-64 -rotate-12" />
           </div>
           <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="space-y-4">
                 <p className="text-sm font-bold text-primary uppercase tracking-[0.2em]">Platform Total Revenue</p>
                 <motion.h2 
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="text-6xl md:text-8xl font-display font-extrabold text-primary"
                 >
                  {isLoading ? '...' : `৳${totalRevenueLakh.replace('L', '')}`}<span className="text-4xl ml-2 uppercase">Lakh</span>
                 </motion.h2>
              </div>
              <div className="bg-bg-card/50 backdrop-blur-md p-6 rounded-[24px] border border-primary/20 min-w-[240px]">
                 <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-text-secondary">Growth</span>
                    <Badge className="bg-success text-white">{growthText}</Badge>
                 </div>
                 <div className="text-2xl font-bold">{isLoading ? '...' : formatCurrency(derived.platformTodayInTaka)}</div>
                 <p className="text-[10px] text-text-secondary mt-1 uppercase font-bold tracking-widest">Revenue Today</p>
              </div>
           </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
           <Card className="border-border bg-bg-card/50">
             <CardContent className="pt-6">
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-2">Teacher Payouts (70%)</p>
                <div className="text-2xl font-bold text-accent">{isLoading ? '...' : `৳${formatLakh(derived.teacherTotalInTaka)}`}</div>
                <div className="mt-2 flex items-center gap-1 text-[10px] text-text-secondary">
                   <ArrowDownRight className="w-3 h-3" /> Based on approved payments
                </div>
             </CardContent>
           </Card>
           <Card className="border-border bg-bg-card/50">
             <CardContent className="pt-6">
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-2">Platform Share (30%)</p>
                <div className="text-2xl font-bold text-primary">{isLoading ? '...' : `৳${formatLakh(stats?.totalRevenueInTaka || 0)}`}</div>
                <div className="mt-2 flex items-center gap-1 text-[10px] text-text-secondary">
                   <ArrowUpRight className="w-3 h-3" /> Retained profit
                </div>
             </CardContent>
           </Card>
           <Card className="border-border bg-bg-card/50">
             <CardContent className="pt-6">
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-2">This Month</p>
                <div className="text-2xl font-bold text-text-primary">{isLoading ? '...' : `৳${formatLakh(derived.thisMonthPlatformInTaka)}`}</div>
                <div className="mt-2 flex items-center gap-1 text-[10px] text-text-secondary">
                   <TrendingUp className="w-3 h-3 text-success" /> Trending upward
                </div>
             </CardContent>
           </Card>
           <Card className="border-border bg-bg-card/50">
             <CardContent className="pt-6">
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-2">Total Transactions</p>
                <div className="text-2xl font-bold text-text-primary">{isLoading ? '...' : totalTransactions.toLocaleString('en-US')}</div>
                <div className="mt-2 flex items-center gap-1 text-[10px] text-text-secondary">
                   <CreditCard className="w-3 h-3" /> Average {formatCurrency(averagePerTxn)} / txn
                </div>
             </CardContent>
           </Card>
        </div>

        {/* Charts */}
        <Card className="border-border bg-bg-card/50">
           <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Revenue Stream Distribution</CardTitle>
              <div className="flex items-center gap-4 text-xs font-bold">
                 <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-primary" /> Platform Share</div>
                 <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-primary/20" /> Total Revenue</div>
              </div>
           </CardHeader>
           <CardContent className="h-[400px]">
             {isLoading ? (
               <div className="h-full flex items-center justify-center text-text-secondary">
                 <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading chart...
               </div>
             ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={derived.chartData}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0052CC" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#0052CC" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPlatform" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0052CC" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#0052CC" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E2D45" vertical={false} />
                  <XAxis dataKey="date" stroke="#8A99B8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#8A99B8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #1E2D45', borderRadius: '8px' }}
                  />
                  <Area type="monotone" dataKey="total" stroke="#0052CC" strokeOpacity={0.3} fillOpacity={1} fill="url(#colorTotal)" />
                  <Area type="monotone" dataKey="platform" stroke="#0052CC" fillOpacity={1} fill="url(#colorPlatform)" />
                </AreaChart>
              </ResponsiveContainer>
             )}
           </CardContent>
        </Card>

        {/* Detailed Transactions */}
        <Card className="border-border bg-bg-card/50 overflow-hidden">
           <CardHeader><CardTitle>Detailed Transactions</CardTitle></CardHeader>
           <CardContent className="p-0 overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="bg-bg-surface text-text-secondary text-[10px] uppercase tracking-widest font-bold">
                   <th className="px-6 py-4">Date</th>
                   <th className="px-6 py-4">Student / Exam</th>
                   <th className="px-6 py-4">Teacher</th>
                   <th className="px-6 py-4">Total</th>
                   <th className="px-6 py-4">Teacher (70%)</th>
                   <th className="px-6 py-4">Platform (30%)</th>
                   <th className="px-6 py-4">Method</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-border text-sm">
                {isLoading && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-text-secondary">
                      <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                      Loading transactions...
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  derived.transactions.map((t: RevenuePayment) => (
                    <tr key={t.id} className="hover:bg-bg-surface/50 transition-colors">
                      <td className="px-6 py-4 text-text-secondary">
                        {new Date(t.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: '2-digit',
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold">{t.student?.user?.name || 'N/A'}</div>
                        <div className="text-[10px] text-text-secondary">{t.exam?.title || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 font-medium">{t.teacher?.user?.name || 'N/A'}</td>
                      <td className="px-6 py-4 font-bold text-text-primary">{formatCurrency((t.totalAmount || 0) / 100)}</td>
                      <td className="px-6 py-4 text-accent font-bold">{formatCurrency((t.teacherAmount || 0) / 100)}</td>
                      <td className="px-6 py-4 text-primary font-bold">{formatCurrency((t.platformAmount || 0) / 100)}</td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="rounded-md bg-bg-surface text-[10px]">
                          {formatMethod(t.method)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                {!isLoading && derived.transactions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-text-secondary">
                      No successful transactions found.
                    </td>
                  </tr>
                )}
               </tbody>
             </table>
           </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
