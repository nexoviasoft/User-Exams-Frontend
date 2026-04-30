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
  RotateCcw, 
  LayoutDashboard 
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function ResultPage() {
  const score = 15;
  const total = 20;
  const percentage = (score / total) * 100;
  const isPassed = percentage >= 40;

  const stats = [
    { label: 'Correct', value: '15', icon: CheckCircle2, color: 'text-success' },
    { label: 'Wrong', value: '3', icon: XCircle, color: 'text-danger' },
    { label: 'Skipped', value: '2', icon: MinusCircle, color: 'text-text-secondary' },
    { label: 'Time Taken', value: '12:45', icon: Clock, color: 'text-primary' },
  ];

  const breakdown = [
    { id: 1, question: "What is the capital of Bangladesh?", your: "Dhaka", correct: "Dhaka", status: "Correct" },
    { id: 2, question: "Which language is primarily spoken in Bangladesh?", your: "Bengali", correct: "Bengali", status: "Correct" },
    { id: 3, question: "When did Bangladesh gain independence?", your: "1952", correct: "1971", status: "Wrong" },
    { id: 4, question: "What is the national fruit of Bangladesh?", your: "Jackfruit", correct: "Jackfruit", status: "Correct" },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-12">
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
            <h1 className="text-3xl font-display font-bold">Excellent Effort!</h1>
          </motion.div>
        </section>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-border bg-bg-card/50">
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <stat.icon className={cn("w-6 h-6 mb-2", stat.color)} />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-text-secondary uppercase tracking-wider font-medium">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Breakdown Table */}
        <Card className="border-border bg-bg-card/50 overflow-hidden">
          <CardHeader>
            <CardTitle>Question Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-surface text-text-secondary text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-bold">#</th>
                  <th className="px-6 py-4 font-bold">Question</th>
                  <th className="px-6 py-4 font-bold">Your Answer</th>
                  <th className="px-6 py-4 font-bold">Correct Answer</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {breakdown.map((item) => (
                  <tr key={item.id} className={cn(
                    "text-sm transition-colors",
                    item.status === 'Wrong' ? "bg-danger/5" : "hover:bg-bg-surface/50"
                  )}>
                    <td className="px-6 py-4 font-medium text-text-secondary">{item.id}</td>
                    <td className="px-6 py-4 font-bold max-w-xs">{item.question}</td>
                    <td className="px-6 py-4 text-text-secondary">{item.your}</td>
                    <td className="px-6 py-4 text-success font-bold">{item.correct}</td>
                    <td className="px-6 py-4">
                      <div className={cn(
                        "flex items-center gap-1 font-bold",
                        item.status === 'Correct' ? "text-success" : "text-danger"
                      )}>
                        {item.status === 'Correct' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        {item.status}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pb-20">
          <Button variant="outline" className="border-border hover:bg-bg-surface h-12 px-8 rounded-xl font-bold">
            <Share2 className="mr-2 w-4 h-4" /> Share Result
          </Button>
          <Button className="bg-accent hover:bg-accent-light text-white h-12 px-8 rounded-xl font-bold shadow-lg">
            <RotateCcw className="mr-2 w-4 h-4" /> আবার Exam দাও
          </Button>
          <Button variant="ghost" className="text-primary hover:bg-primary/10 h-12 px-8 rounded-xl font-bold" asChild>
            <Link href="/student/dashboard">
              <LayoutDashboard className="mr-2 w-4 h-4" /> Dashboard এ ফিরে যাও
            </Link>
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
