'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Clock, Loader2, ArrowLeft, Medal } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LeaderboardEntry {
  rank: number;
  studentName: string;
  score: number;
  timeTakenSeconds: number;
  completedAt: string;
}

export default function LeaderboardPage() {
  const params = useParams();
  const examId = params.examId as string;

  const { data: leaderboard = [], isLoading, error } = useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard', examId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/student-exams/leaderboard/${examId}`);
      return response.data;
    },
    enabled: !!examId,
  });

  const getRankStyle = (rank: number) => {
    switch(rank) {
      case 1: return "bg-yellow-400 text-white shadow-[0_0_15px_rgba(250,204,21,0.5)]";
      case 2: return "bg-slate-300 text-slate-800 shadow-[0_0_15px_rgba(203,213,225,0.5)]";
      case 3: return "bg-amber-600 text-white shadow-[0_0_15px_rgba(217,119,6,0.5)]";
      default: return "bg-bg-surface text-text-primary";
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-20">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-bg-surface">
            <Link href="/student/dashboard">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-2">
              <Trophy className="w-8 h-8 text-yellow-500" /> Leaderboard
            </h1>
            <p className="text-text-secondary mt-1">Top 100 Students</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center p-10 text-danger font-bold">
            Failed to load leaderboard.
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center p-10 text-text-secondary bg-bg-card/50 rounded-xl border border-border">
            No one has completed this exam yet.
          </div>
        ) : (
          <Card className="border-border bg-bg-card/50 overflow-hidden">
            <CardContent className="p-0">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-bg-surface text-text-secondary text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-bold text-center w-20">Rank</th>
                    <th className="px-6 py-4 font-bold">Student Name</th>
                    <th className="px-6 py-4 font-bold text-center">Score</th>
                    <th className="px-6 py-4 font-bold text-center">Time Taken</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {leaderboard.map((entry) => (
                    <tr key={entry.rank} className="hover:bg-bg-surface/50 transition-colors">
                      <td className="px-6 py-4 text-center">
                        <div className={cn(
                          "w-10 h-10 mx-auto rounded-full flex items-center justify-center font-bold",
                          getRankStyle(entry.rank)
                        )}>
                          {entry.rank <= 3 ? <Medal className="w-5 h-5" /> : entry.rank}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-lg">{entry.studentName}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-success font-bold text-lg">{entry.score}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1 text-text-secondary">
                          <Clock className="w-4 h-4" />
                          <span>{Math.floor(entry.timeTakenSeconds / 60)}m {entry.timeTakenSeconds % 60}s</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
