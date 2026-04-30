'use client';

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
  Legend
} from 'recharts';
import { 
  Users, 
  TrendingUp, 
  Banknote, 
  CheckCircle2, 
  XCircle,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

const questionData = [
  { name: 'Q1', correct: 85 },
  { name: 'Q2', correct: 42 },
  { name: 'Q3', correct: 76 },
  { name: 'Q4', correct: 60 },
  { name: 'Q5', correct: 30 },
  { name: 'Q6', correct: 92 },
  { name: 'Q7', correct: 55 },
];

const passFailData = [
  { name: 'Passed', value: 780 },
  { name: 'Failed', value: 320 },
];

const COLORS = ['#0052CC', '#E53E3E'];

const trendData = [
  { day: 'Mon', attempts: 120 },
  { day: 'Tue', attempts: 150 },
  { day: 'Wed', attempts: 100 },
  { day: 'Thu', attempts: 180 },
  { day: 'Fri', attempts: 210 },
  { day: 'Sat', attempts: 250 },
  { day: 'Sun', attempts: 200 },
];

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">Exam Analytics 📊</h1>
            <p className="text-text-secondary mt-1">শিক্ষার্থীদের পারফরম্যান্স এবং ডেটা বিশ্লেষণ করুন।</p>
          </div>
          
          <select className="bg-bg-card border border-border rounded-xl py-2 px-4 text-sm focus:outline-none">
            <option>Select Exam to View</option>
            <option>BCS Preliminary Model Test 01</option>
            <option>Medical Prep Full Mock</option>
          </select>
        </div>

        {/* Stats Summary */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border bg-bg-card/50">
            <CardContent className="pt-6">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary font-bold uppercase tracking-wider">Total Attempts</p>
                    <h3 className="text-2xl font-bold">1,100</h3>
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
                    <h3 className="text-2xl font-bold">64.5%</h3>
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
                    <h3 className="text-2xl font-bold">৳1,10,000</h3>
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
                    <h3 className="text-2xl font-bold">71%</h3>
                  </div>
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Question-wise performance */}
          <Card className="border-border bg-bg-card/50">
            <CardHeader><CardTitle className="text-lg">Question-wise Correct %</CardTitle></CardHeader>
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

          {/* Pass vs Fail */}
          <Card className="border-border bg-bg-card/50">
            <CardHeader><CardTitle className="text-lg">Pass vs Fail Ratio</CardTitle></CardHeader>
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
                    {passFailData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #1E2D45', borderRadius: '8px' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Daily Attempts Trend */}
          <Card className="md:col-span-2 border-border bg-bg-card/50">
            <CardHeader><CardTitle className="text-lg">Daily Attempts Trend</CardTitle></CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E2D45" vertical={false} />
                  <XAxis dataKey="day" stroke="#8A99B8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#8A99B8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #1E2D45', borderRadius: '8px' }}
                  />
                  <Line type="monotone" dataKey="attempts" stroke="#0052CC" strokeWidth={3} dot={{ r: 4, fill: '#0052CC' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
