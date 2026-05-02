'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  ArrowLeft, 
  FileText, 
  ChevronRight, 
  CheckCircle2, 
  Info, 
  Sparkles, 
  Target, 
  Layers, 
  Database, 
  ExternalLink, 
  ImageIcon, 
  Clock, 
  Trophy,
  Zap,
  Activity,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};

type ExamQuestion = {
  id: string;
  question?: {
    id: string | number;
    text?: string;
    solutionText?: string;
    solutionImage?: string;
  };
};

type ExamDetails = {
  id: string;
  title: string;
  status: 'draft' | 'published';
  questionCount?: number;
  attempts?: number;
  subject?: { id: string; name: string } | null;
  modelTest?: { id: string; name: string } | null;
  examQuestions?: ExamQuestion[];
};

export default function TeacherExamDetailsPage() {
  const params = useParams<{ examId: string }>();
  const examId = params.examId;

  const { data: exam, isLoading } = useQuery<ExamDetails>({
    queryKey: ['teacher-exam-details', examId],
    queryFn: async () => (await axiosInstance.get(`/exams/${examId}`)).data,
    enabled: !!examId,
  });

  return (
    <DashboardLayout>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-full mx-auto space-y-6 relative px-4 pb-20"
      >
        {/* Background Decorative Glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black px-3 py-1 rounded-lg uppercase tracking-widest text-[9px]">
                Assessment Details
              </Badge>
            </div>
            <h1 className="text-2xl md:text-4xl font-display font-black tracking-tight text-text-primary leading-tight">
              Exam <span className="text-primary">Overview</span> 📖
            </h1>
            <p className="text-text-secondary text-sm max-w-2xl font-medium">
              Review configuration and audit assigned questions.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <Link href="/teacher/exams">
               <Button variant="ghost" className="rounded-xl h-10 px-5 font-black uppercase tracking-widest text-[9px] hover:bg-white border border-border/40 transition-all hover:-translate-x-1">
                 <ArrowLeft className="w-4 h-4 mr-2" /> Back to List
               </Button>
             </Link>
             <Badge className={cn(
               "font-black px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-black/5",
               exam?.status === 'published' ? "bg-success text-white" : "bg-warning text-white"
             )}>
               {exam?.status || 'Unknown'}
             </Badge>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary opacity-20" />
            <p className="text-text-secondary font-black animate-pulse uppercase tracking-widest text-xs">Syncing assessment data...</p>
          </div>
        ) : !exam ? (
          <div className="text-center py-32 bg-bg-card/40 backdrop-blur-xl rounded-[28px] border-2 border-border/50 border-dashed">
            <Info className="w-16 h-16 mx-auto mb-4 opacity-10" />
            <p className="text-sm font-black uppercase tracking-[0.2em] text-text-secondary">Exam Entity Not Found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
            {/* Left Column: Stats & Metadata */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="border-border/50 bg-bg-card/40 backdrop-blur-xl rounded-[28px] overflow-hidden border-2 shadow-2xl">
                <CardHeader className="p-6 pb-2 border-b border-border/20">
                  <CardTitle className="text-xs font-display font-black text-text-primary uppercase tracking-widest">Configuration</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary opacity-60">Title</p>
                    <p className="text-lg font-black text-text-primary leading-tight">{exam.title}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="p-4 rounded-2xl bg-bg-surface/50 border border-border/40 hover:border-primary/20 transition-colors">
                      <FileText className="w-4 h-4 text-primary/50 mb-2" />
                      <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary opacity-50">Questions</p>
                      <p className="text-lg font-black text-text-primary">{exam.questionCount || 0}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-bg-surface/50 border border-border/40 hover:border-primary/20 transition-colors">
                      <Activity className="w-4 h-4 text-success/50 mb-2" />
                      <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary opacity-50">Attempts</p>
                      <p className="text-lg font-black text-text-primary">{exam.attempts || 0}</p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-accent/10 text-accent">
                          <Target className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Subject Scope</span>
                      </div>
                      <Badge variant="ghost" className="bg-bg-surface text-[9px] font-black border border-border/40 px-2 py-0.5 rounded-md">
                        {exam.subject?.name || 'Global'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <Layers className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Package</span>
                      </div>
                      <Badge variant="ghost" className="bg-bg-surface text-[9px] font-black border border-border/40 px-2 py-0.5 rounded-md">
                        {exam.modelTest?.name || 'Standalone'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-primary/5 backdrop-blur-xl rounded-[28px] overflow-hidden border-2 border-primary/20">
                 <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                       <Award className="w-5 h-5 text-primary" />
                       <h3 className="text-sm font-black uppercase tracking-widest text-primary">Platform Status</h3>
                    </div>
                    <p className="text-xs font-medium text-text-secondary leading-relaxed mb-4">
                       This exam is currently **{exam.status}** and {exam.status === 'published' ? 'available to all assigned students.' : 'hidden from the public directory.'}
                    </p>
                    <Button className="w-full bg-primary text-white rounded-xl h-10 font-black uppercase tracking-widest text-[9px] shadow-lg shadow-primary/20">
                       Toggle Deployment Status
                    </Button>
                 </CardContent>
              </Card>
            </div>

            {/* Right Column: Question Audit */}
            <div className="lg:col-span-8 space-y-6">
              <Card className="border-border/50 bg-bg-card/40 backdrop-blur-xl rounded-[28px] overflow-hidden border-2 shadow-2xl">
                <CardHeader className="p-6 pb-2 border-b border-border/20 flex flex-row items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-accent/10 text-accent">
                         <FileText className="w-5 h-5" />
                      </div>
                      <div>
                         <CardTitle className="text-sm font-display font-black text-text-primary uppercase tracking-widest">Question Audit</CardTitle>
                         <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary opacity-60">Verified Content Feed</p>
                      </div>
                   </div>
                   <Badge className="bg-accent/10 text-accent text-[10px] font-black border-none px-3 py-1 rounded-lg">
                      {exam.examQuestions?.length || 0} TOTAL
                   </Badge>
                </CardHeader>
                <CardContent className="p-0 max-h-[700px] overflow-y-auto custom-scrollbar">
                  {!exam.examQuestions || exam.examQuestions.length === 0 ? (
                    <div className="text-center py-32 opacity-20">
                      <Zap className="w-16 h-16 mx-auto mb-4" />
                      <p className="text-sm font-black uppercase tracking-[0.2em]">No questions mapped to this exam</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/10">
                      {exam.examQuestions.map((eq, idx) => (
                        <div key={eq.id} className="p-6 hover:bg-white/40 transition-all duration-300 group relative">
                           <div className="absolute top-0 left-0 w-1 h-full bg-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                           <div className="flex items-start gap-4">
                              <span className="text-[10px] font-black text-text-secondary opacity-40 mt-1">#{(idx + 1).toString().padStart(2, '0')}</span>
                              <div className="flex-1 space-y-3">
                                 <p className="text-sm font-bold text-text-primary leading-relaxed">{eq.question?.text || 'Question content missing'}</p>
                                 
                                 {(eq.question?.solutionText || eq.question?.solutionImage) && (
                                   <div className="p-4 rounded-2xl bg-success/5 border border-success/10 space-y-2">
                                      <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-success">
                                         <CheckCircle2 className="w-3 h-3" /> Solution Verified
                                      </div>
                                      {eq.question.solutionText && (
                                        <p className="text-[11px] font-medium text-text-secondary leading-relaxed italic line-clamp-2">
                                          "{eq.question.solutionText}"
                                        </p>
                                      )}
                                      {eq.question.solutionImage && (
                                        <div className="flex items-center gap-2 text-[9px] font-bold text-primary">
                                           <ImageIcon className="w-3.5 h-3.5" />
                                           Asset Link Attached
                                        </div>
                                      )}
                                   </div>
                                 )}
                              </div>
                              <Button variant="ghost" size="icon" className="rounded-lg h-8 w-8 hover:bg-accent/10 text-text-secondary hover:text-accent transition-all">
                                 <ExternalLink className="w-4 h-4" />
                              </Button>
                           </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
