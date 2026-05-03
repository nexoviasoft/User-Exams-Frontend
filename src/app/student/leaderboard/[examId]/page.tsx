'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Clock, Loader2, ArrowLeft, Medal, User, Crown, Star, Target, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

interface LeaderboardEntry {
  rank: number;
  studentName: string;
  score: number;
  timeTakenSeconds: number;
  completedAt: string;
}

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
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 12
    }
  }
};

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
      case 1: return "from-yellow-400 to-yellow-600 text-white shadow-[0_10px_30px_rgba(250,204,21,0.3)]";
      case 2: return "from-slate-300 to-slate-500 text-slate-900 shadow-[0_10px_30px_rgba(203,213,225,0.3)]";
      case 3: return "from-amber-600 to-amber-800 text-white shadow-[0_10px_30px_rgba(217,119,6,0.3)]";
      default: return "bg-bg-surface text-text-primary border border-border/50";
    }
  };

  const topThree = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  return (
    <DashboardLayout>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto space-y-10 pb-24 px-4 relative"
      >
        {/* Decorative Background Glows */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <Button variant="ghost" size="icon" render={<Link href="/student/dashboard" />} className="rounded-2xl w-12 h-12 bg-bg-card/50 backdrop-blur-md border border-border/50 hover:bg-bg-card transition-all">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black px-3 py-1 rounded-lg uppercase tracking-widest text-[10px]">
                  Competitive Arena
                </Badge>
              </div>
              <h1 className="text-3xl sm:text-5xl font-display font-black tracking-tight flex items-center gap-3 text-text-primary leading-tight">
                Leaderboard <Trophy className="w-8 h-8 sm:w-12 sm:h-12 text-yellow-500 animate-bounce" />
              </h1>
              <p className="text-text-secondary font-medium">শীর্ষ ১০০ মেধাবী শিক্ষার্থীর তালিকা</p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-32 space-y-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Trophy className="w-8 h-8 text-primary animate-pulse" />
              </div>
            </div>
            <p className="text-text-secondary font-black animate-pulse uppercase tracking-widest text-xs">Loading Rankings...</p>
          </div>
        ) : error ? (
          <div className="text-center p-16 bg-danger/5 border-2 border-danger/20 rounded-[32px] space-y-4">
            <div className="w-16 h-16 bg-danger/10 text-danger rounded-full flex items-center justify-center mx-auto">
              <Star className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-text-primary">Failed to load leaderboard</h3>
              <p className="text-text-secondary font-medium">দয়া করে কিছুক্ষণ পর আবার চেষ্টা করুন।</p>
            </div>
            <Button variant="outline" className="rounded-xl border-danger/30 text-danger hover:bg-danger hover:text-white" onClick={() => window.location.reload()}>Retry</Button>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center p-20 bg-bg-card/40 backdrop-blur-xl rounded-[32px] border-2 border-dashed border-border/50 space-y-6">
            <div className="w-24 h-24 bg-bg-surface/50 rounded-full flex items-center justify-center mx-auto">
              <Crown className="w-12 h-12 text-text-secondary opacity-20" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-text-primary">No Champions Yet</h3>
              <p className="text-text-secondary font-medium max-w-xs mx-auto">এখনো কেউ এই পরীক্ষাটি সম্পন্ন করেনি। আপনি কি প্রথম হতে চান?</p>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Podium Section */}
            {topThree.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end px-4">
                {/* 2nd Place */}
                {topThree[1] && (
                  <motion.div variants={itemVariants} className="order-2 md:order-1">
                    <div className="flex flex-col items-center gap-4 group">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-slate-200 to-slate-400 p-1 shadow-xl group-hover:scale-105 transition-transform">
                          <div className="w-full h-full bg-bg-card rounded-[28px] flex items-center justify-center overflow-hidden">
                            <User className="w-12 h-12 text-slate-400" />
                          </div>
                        </div>
                        <div className="absolute -bottom-3 -right-3 w-10 h-10 rounded-2xl bg-slate-400 border-4 border-bg-card flex items-center justify-center text-white font-black text-xs">2</div>
                      </div>
                      <div className="text-center space-y-1">
                        <p className="font-black text-lg text-text-primary truncate max-w-[150px]">{topThree[1].studentName}</p>
                        <Badge className="bg-slate-400/10 text-slate-500 border-slate-400/20 font-black">{topThree[1].score} Score</Badge>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 1st Place */}
                {topThree[0] && (
                  <motion.div variants={itemVariants} className="order-1 md:order-2 scale-110 mb-6 md:mb-12">
                    <div className="flex flex-col items-center gap-6 group">
                      <div className="relative">
                        <motion.div 
                          animate={{ y: [0, -10, 0] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute -top-10 left-1/2 -translate-x-1/2 text-yellow-500"
                        >
                          <Crown className="w-10 h-10 fill-current" />
                        </motion.div>
                        <div className="w-32 h-32 rounded-[40px] bg-gradient-to-br from-yellow-400 to-yellow-600 p-1.5 shadow-[0_20px_50px_rgba(250,204,21,0.3)] group-hover:scale-105 transition-transform ring-4 ring-yellow-400/20">
                          <div className="w-full h-full bg-bg-card rounded-[34px] flex items-center justify-center overflow-hidden">
                            <User className="w-16 h-16 text-yellow-500" />
                          </div>
                        </div>
                        <div className="absolute -bottom-4 -right-4 w-12 h-12 rounded-2xl bg-yellow-500 border-4 border-bg-card flex items-center justify-center text-white font-black text-sm">1</div>
                      </div>
                      <div className="text-center space-y-1">
                        <p className="font-black text-2xl text-text-primary tracking-tight">{topThree[0].studentName}</p>
                        <Badge className="bg-yellow-400 text-white border-yellow-500 font-black px-4 h-7 text-sm shadow-lg shadow-yellow-400/30">{topThree[0].score} Score</Badge>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 3rd Place */}
                {topThree[2] && (
                  <motion.div variants={itemVariants} className="order-3 md:order-3">
                    <div className="flex flex-col items-center gap-4 group">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-amber-600 to-amber-800 p-1 shadow-xl group-hover:scale-105 transition-transform">
                          <div className="w-full h-full bg-bg-card rounded-[24px] flex items-center justify-center overflow-hidden">
                            <User className="w-10 h-10 text-amber-700" />
                          </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-amber-700 border-4 border-bg-card flex items-center justify-center text-white font-black text-[10px]">3</div>
                      </div>
                      <div className="text-center space-y-1">
                        <p className="font-black text-base text-text-primary truncate max-w-[150px]">{topThree[2].studentName}</p>
                        <Badge className="bg-amber-600/10 text-amber-700 border-amber-600/20 font-black">{topThree[2].score} Score</Badge>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* List Section */}
            <motion.div variants={itemVariants} className="relative z-10">
              <Card className="border-border/50 bg-bg-card/40 backdrop-blur-xl rounded-[40px] overflow-hidden border-2 shadow-2xl">
                <CardContent className="p-0 overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-bg-surface/30 text-text-secondary text-[10px] sm:text-[11px] uppercase tracking-[0.2em] font-black border-b border-border/40">
                        <th className="px-8 py-6 text-center w-24">Rank</th>
                        <th className="px-6 py-6">Student Champion</th>
                        <th className="px-6 py-6 text-center">Final Score</th>
                        <th className="px-8 py-6 text-center">Efficiency</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {leaderboard.map((entry) => (
                        <motion.tr 
                          key={entry.rank} 
                          whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
                          className="transition-colors group"
                        >
                          <td className="px-8 py-6 text-center">
                            <div className={cn(
                              "w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-2xl flex items-center justify-center font-black text-xs sm:text-sm bg-gradient-to-br transition-transform group-hover:scale-110",
                              getRankStyle(entry.rank)
                            )}>
                              {entry.rank <= 3 ? <Medal className="w-5 h-5 sm:w-6 sm:h-6" /> : entry.rank}
                            </div>
                          </td>
                          <td className="px-6 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 font-black text-xs">
                                {entry.studentName.charAt(0).toUpperCase()}
                              </div>
                              <div className="space-y-0.5">
                                <p className="font-black text-sm sm:text-lg text-text-primary group-hover:text-primary transition-colors">{entry.studentName}</p>
                                <div className="flex items-center gap-2 text-[10px] text-text-secondary font-bold">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(entry.completedAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' })}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-6 text-center">
                            <div className="inline-flex items-center justify-center px-4 py-2 rounded-2xl bg-success/10 text-success border border-success/20 font-black text-sm sm:text-xl">
                              {entry.score}
                            </div>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <div className="flex items-center gap-1.5 text-text-primary font-black text-xs sm:text-sm">
                                <Clock className="w-3.5 h-3.5 text-accent" />
                                <span>{Math.floor(entry.timeTakenSeconds / 60)}m {entry.timeTakenSeconds % 60}s</span>
                              </div>
                              <Badge variant="outline" className="text-[9px] h-4 py-0 font-black bg-accent/5 border-accent/20 text-accent/80">COMPLETED</Badge>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
