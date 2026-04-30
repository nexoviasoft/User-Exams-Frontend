'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
  User as UserIcon,
  Calendar,
  Layers,
  ArrowDownRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const revenueData = [
  { date: 'Oct 01', total: 4000, platform: 1200 },
  { date: 'Oct 02', total: 3000, platform: 900 },
  { date: 'Oct 03', total: 5000, platform: 1500 },
  { date: 'Oct 04', total: 8000, platform: 2400 },
  { date: 'Oct 05', total: 7000, platform: 2100 },
  { date: 'Oct 06', total: 9000, platform: 2700 },
  { date: 'Oct 07', total: 12500, platform: 3750 },
];

const transactions = [
  { id: '1', date: 'Oct 12', student: 'Rahim Ahmed', exam: 'BCS Mock 01', teacher: 'Dr. Rahman', total: '৳100', teacherGot: '৳70', platformGot: '৳30', method: 'bKash' },
  { id: '2', date: 'Oct 11', student: 'Karim Ullah', exam: 'Medical Mock', teacher: 'Prof. Karim', total: '৳150', teacherGot: '৳105', platformGot: '৳45', method: 'Nagad' },
  { id: '3', date: 'Oct 10', student: 'Sumaya Akter', exam: 'BCS Mock 01', teacher: 'Dr. Rahman', total: '৳100', teacherGot: '৳70', platformGot: '৳30', method: 'bKash' },
];

export default function AdminRevenuePage() {
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
                   ৳12.50<span className="text-4xl ml-2 uppercase">Lakh</span>
                 </motion.h2>
              </div>
              <div className="bg-bg-card/50 backdrop-blur-md p-6 rounded-[24px] border border-primary/20 min-w-[240px]">
                 <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-text-secondary">Growth</span>
                    <Badge className="bg-success text-white">+24.5%</Badge>
                 </div>
                 <div className="text-2xl font-bold">৳12,500</div>
                 <p className="text-[10px] text-text-secondary mt-1 uppercase font-bold tracking-widest">Revenue Today</p>
              </div>
           </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
           <Card className="border-border bg-bg-card/50">
             <CardContent className="pt-6">
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-2">Teacher Payouts (70%)</p>
                <div className="text-2xl font-bold text-accent">৳8.75L</div>
                <div className="mt-2 flex items-center gap-1 text-[10px] text-text-secondary">
                   <ArrowDownRight className="w-3 h-3" /> Allocated to 500 teachers
                </div>
             </CardContent>
           </Card>
           <Card className="border-border bg-bg-card/50">
             <CardContent className="pt-6">
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-2">Platform Share (30%)</p>
                <div className="text-2xl font-bold text-primary">৳3.75L</div>
                <div className="mt-2 flex items-center gap-1 text-[10px] text-text-secondary">
                   <ArrowUpRight className="w-3 h-3" /> Retained profit
                </div>
             </CardContent>
           </Card>
           <Card className="border-border bg-bg-card/50">
             <CardContent className="pt-6">
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-2">This Month</p>
                <div className="text-2xl font-bold text-text-primary">৳1.2L</div>
                <div className="mt-2 flex items-center gap-1 text-[10px] text-text-secondary">
                   <TrendingUp className="w-3 h-3 text-success" /> Trending upward
                </div>
             </CardContent>
           </Card>
           <Card className="border-border bg-bg-card/50">
             <CardContent className="pt-6">
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-2">Total Transactions</p>
                <div className="text-2xl font-bold text-text-primary">8,450</div>
                <div className="mt-2 flex items-center gap-1 text-[10px] text-text-secondary">
                   <CreditCard className="w-3 h-3" /> Average ৳148 / txn
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
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
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
                 {transactions.map((t) => (
                   <tr key={t.id} className="hover:bg-bg-surface/50 transition-colors">
                     <td className="px-6 py-4 text-text-secondary">{t.date}</td>
                     <td className="px-6 py-4">
                        <div className="font-bold">{t.student}</div>
                        <div className="text-[10px] text-text-secondary">{t.exam}</div>
                     </td>
                     <td className="px-6 py-4 font-medium">{t.teacher}</td>
                     <td className="px-6 py-4 font-bold text-text-primary">{t.total}</td>
                     <td className="px-6 py-4 text-accent font-bold">{t.teacherGot}</td>
                     <td className="px-6 py-4 text-primary font-bold">{t.platformGot}</td>
                     <td className="px-6 py-4">
                        <Badge variant="outline" className="rounded-md bg-bg-surface text-[10px]">{t.method}</Badge>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
