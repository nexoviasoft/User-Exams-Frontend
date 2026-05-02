'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, BarChart3, ArrowLeft, FileText, ChevronRight, CheckCircle2, Info, Sparkles, Target, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

type ExamItem = {
  id: string;
  title: string;
  status: 'draft' | 'published';
  questionCount?: number;
  attempts?: number;
  modelTest?: { id: string; name: string } | null;
};

export default function ModelTestExamsPage() {
  const params = useParams<{ modelTestId: string }>();
  const modelTestId = params.modelTestId;

  const { data: exams = [], isLoading } = useQuery<ExamItem[]>({
    queryKey: ['teacher-modeltest-exams', modelTestId],
    queryFn: async () => (await axiosInstance.get('/exams/my')).data,
    enabled: !!modelTestId,
  });

  const scopedExams = useMemo(
    () => exams.filter((exam) => String(exam.modelTest?.id) === String(modelTestId)),
    [exams, modelTestId],
  );

  const modelTestName = scopedExams[0]?.modelTest?.name || 'Model Test';

  return (
    <DashboardLayout>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto space-y-10 relative px-4 pb-20"
      >
        {/* Background Decorative Glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black px-3 py-1 rounded-lg uppercase tracking-widest text-[10px]">
                Bundle Assets
              </Badge>
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-black tracking-tight text-text-primary leading-tight">
              {modelTestName} <span className="text-primary">Exams</span> 📑
            </h1>
            <p className="text-text-secondary text-lg max-w-2xl font-medium">
              Browse and manage all assessments associated with this model test bundle.
            </p>
          </div>
          <Link href="/teacher/model-tests">
            <Button variant="ghost" className="rounded-2xl h-12 px-6 font-bold hover:bg-bg-surface border-2 border-border/50 transition-all hover:-translate-x-1">
              <ArrowLeft className="w-5 h-5 mr-2" /> Back to Bundles
            </Button>
          </Link>
        </motion.div>

        {/* Content Section */}
        <motion.div variants={itemVariants} className="relative z-10">
          <Card className="border-border/50 bg-bg-card/40 backdrop-blur-xl rounded-[32px] overflow-hidden border-2 shadow-2xl">
            <CardHeader className="p-8 pb-4 border-b border-border/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                    <FileText className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-2xl font-display font-black text-text-primary">Assigned Assessments</CardTitle>
                </div>
                <Badge variant="outline" className="font-black px-3 py-1 rounded-lg text-[10px] uppercase tracking-widest bg-white/50">
                  {scopedExams.length} Total Exams
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" />
                  <p className="text-text-secondary font-black animate-pulse uppercase tracking-widest text-[10px]">Retrieving assessments...</p>
                </div>
              ) : scopedExams.length === 0 ? (
                <div className="text-center py-20 opacity-30">
                  <Info className="w-10 h-10 mx-auto mb-4" />
                  <p className="text-xs font-black uppercase tracking-widest">No exams found for this bundle</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  <AnimatePresence mode="popLayout">
                    {scopedExams.map((exam) => (
                      <motion.div 
                        key={exam.id} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="group p-6 rounded-[24px] border border-border/40 bg-bg-surface/30 hover:bg-white/40 transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-2xl bg-bg-surface flex items-center justify-center border border-border/40 group-hover:scale-110 transition-transform">
                            <Target className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-display font-black text-lg text-text-primary group-hover:text-primary transition-colors leading-tight">
                              {exam.title}
                            </h3>
                            <div className="flex items-center gap-3 mt-1">
                              <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary opacity-60">
                                {exam.questionCount || 0} Questions
                              </p>
                              <span className="w-1 h-1 rounded-full bg-border" />
                              <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary opacity-60">
                                {exam.attempts || 0} Attempts
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                          <Badge
                            className={cn(
                              "font-black px-3 py-1 rounded-lg text-[9px] uppercase tracking-wider",
                              exam.status === 'published'
                                ? 'bg-success/10 text-success border-success/20'
                                : 'bg-text-secondary/10 text-text-secondary border-border/40',
                            )}
                          >
                            {exam.status === 'published' ? 'PUBLISHED' : 'DRAFT'}
                          </Badge>
                          
                          <div className="flex items-center gap-2 flex-1 md:flex-none">
                            <Link href={`/teacher/exams/${exam.id}`} className="flex-1 md:flex-none">
                              <Button variant="ghost" size="sm" className="w-full md:w-auto h-10 px-4 rounded-xl hover:bg-primary/10 hover:text-primary text-text-secondary font-black uppercase tracking-widest text-[9px] transition-all">
                                Details
                              </Button>
                            </Link>
                            <Link href={`/teacher/analytics?id=${exam.id}`} className="flex-1 md:flex-none">
                              <Button variant="ghost" size="sm" className="w-full md:w-auto h-10 px-4 rounded-xl hover:bg-accent/10 hover:text-accent text-text-secondary font-black uppercase tracking-widest text-[9px] transition-all">
                                <BarChart3 className="w-3.5 h-3.5 mr-2" /> Analytics
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
