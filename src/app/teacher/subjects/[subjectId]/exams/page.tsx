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
  Users,
  Zap,
  Eye,
  Trophy
} from 'lucide-react';
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
      type: "spring" as const,
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
  subject?: { id: string; name: string } | null;
  modelTest?: { id: string; name: string } | null;
};

export default function SubjectExamsPage() {
  const params = useParams<{ subjectId: string }>();
  const subjectId = params.subjectId;

  const { data: exams = [], isLoading } = useQuery<ExamItem[]>({
    queryKey: ['teacher-subject-exams', subjectId],
    queryFn: async () => (await axiosInstance.get('/exams/my')).data,
    enabled: !!subjectId,
  });

  const scopedExams = useMemo(
    () => exams.filter((exam) => String(exam.subject?.id) === String(subjectId)),
    [exams, subjectId],
  );

  const subjectName = scopedExams[0]?.subject?.name || 'Subject';

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
                Subject Assets
              </Badge>
            </div>
            <h1 className="text-2xl md:text-4xl font-display font-black tracking-tight text-text-primary leading-tight">
              {subjectName} <span className="text-primary">Exams</span> 📑
            </h1>
            <p className="text-text-secondary text-sm max-w-2xl font-medium">
              Manage all assessments associated with this subject scope.
            </p>
          </div>
          <Link href="/teacher/subjects">
            <Button variant="ghost" className="rounded-xl h-10 px-5 font-black uppercase tracking-widest text-[9px] hover:bg-white border border-border/40 transition-all hover:-translate-x-1">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Subjects
            </Button>
          </Link>
        </motion.div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative z-10">
           <div className="lg:col-span-12">
              <Card className="border-border/50 bg-bg-card/40 backdrop-blur-xl rounded-[28px] overflow-hidden border-2 shadow-2xl">
                <CardHeader className="p-6 pb-2 border-b border-border/20 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                        <Target className="w-5 h-5" />
                     </div>
                     <div>
                        <CardTitle className="text-sm font-display font-black text-text-primary uppercase tracking-widest">Active Assessments</CardTitle>
                        <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary opacity-60">Verified Content Scope</p>
                     </div>
                  </div>
                  <Badge className="bg-primary/10 text-primary text-[10px] font-black border-none px-3 py-1 rounded-lg">
                    {scopedExams.length} TOTAL
                  </Badge>
                </CardHeader>
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                      <Loader2 className="w-12 h-12 animate-spin text-primary opacity-20" />
                      <p className="text-text-secondary font-black animate-pulse uppercase tracking-widest text-xs">Retrieving assessments...</p>
                    </div>
                  ) : scopedExams.length === 0 ? (
                    <div className="text-center py-32 opacity-20 flex flex-col items-center gap-4">
                      <Zap className="w-16 h-16" />
                      <p className="text-sm font-black uppercase tracking-[0.2em]">No exams found in this scope</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/10">
                      <AnimatePresence mode="popLayout">
                        {scopedExams.map((exam) => (
                          <motion.div 
                            key={exam.id} 
                            variants={itemVariants}
                            className="group p-5 hover:bg-white/40 transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative"
                          >
                            <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                            
                            <div className="flex items-center gap-5">
                              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-bg-surface to-bg-card flex items-center justify-center border border-border/40 group-hover:scale-110 transition-transform shadow-inner">
                                <Database className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-display font-black text-lg text-text-primary group-hover:text-primary transition-colors leading-tight tracking-tight">
                                  {exam.title}
                                </h3>
                                <div className="flex items-center gap-3 mt-1.5">
                                   <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-text-secondary">
                                      <FileText className="w-3 h-3 text-accent/50" />
                                      {exam.questionCount || 0} Questions
                                   </div>
                                   <div className="w-1 h-1 rounded-full bg-border" />
                                   <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-text-secondary">
                                      <Users className="w-3 h-3 text-success/50" />
                                      {exam.attempts || 0} Participants
                                   </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto">
                              <Badge className={cn(
                                "font-black px-3 py-1 rounded-lg text-[8px] uppercase tracking-wider",
                                exam.status === 'published' ? "bg-success/10 text-success border-success/20" : "bg-warning/10 text-warning border-warning/20"
                              )}>
                                {exam.status}
                              </Badge>
                              <Link href={`/teacher/exams/${exam.id}`} className="flex-1 md:flex-none">
                                <Button className="w-full md:w-auto h-10 px-6 rounded-xl bg-bg-surface border border-border/40 hover:bg-primary hover:text-white text-text-primary font-black uppercase tracking-widest text-[9px] transition-all group-hover:shadow-lg group-hover:shadow-primary/20">
                                   Manage <ChevronRight className="w-4 h-4 ml-1.5" />
                                </Button>
                              </Link>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </CardContent>
              </Card>
           </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
