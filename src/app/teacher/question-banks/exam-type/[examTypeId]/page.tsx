'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, BookOpen, Target, Sparkles, ChevronRight, Layers, FileText } from 'lucide-react';
import { useGetExamTypesQuery } from '@/store/slices/api/examTypesApi';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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

export default function ExamTypeScopePage() {
  const params = useParams<{ examTypeId: string }>();
  const examTypeId = params.examTypeId;
  const { data: examTypes = [] } = useGetExamTypesQuery();

  const { data: subjects = [], isLoading: subLoading } = useQuery({
    queryKey: ['teacher-subjects'],
    queryFn: async () => (await axiosInstance.get('/subject')).data,
  });

  const { data: modelTests = [], isLoading: modelLoading } = useQuery({
    queryKey: ['teacher-modeltests'],
    queryFn: async () => (await axiosInstance.get('/modeltest')).data,
  });

  const isLoading = subLoading || modelLoading;
  const examType = examTypes.find((e: any) => e.id === examTypeId);
  const filteredSubjects = subjects.filter((s: any) => s.examType?.id === examTypeId);
  const filteredModelTests = modelTests.filter((m: any) => m.examType?.id === examTypeId);

  return (
    <DashboardLayout>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-10 max-w-7xl mx-auto relative px-4 pb-20"
      >
        {/* Background Decorative Glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black px-3 py-1 rounded-lg uppercase tracking-widest text-[10px]">
                Library Scope
              </Badge>
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-black tracking-tight text-text-primary leading-tight">
              {examType?.name || 'Category'} <span className="text-primary">Banks</span> 📁
            </h1>
            <p className="text-text-secondary text-lg max-w-2xl font-medium">
              Select a Subject or Model Test to manage its question repositories.
            </p>
          </div>
          <Link href="/teacher/question-banks">
            <Button variant="ghost" className="rounded-2xl h-12 px-6 font-bold hover:bg-bg-surface border-2 border-border/50 transition-all hover:-translate-x-1">
              <ArrowLeft className="w-5 h-5 mr-2" /> Back to Overview
            </Button>
          </Link>
        </motion.div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary opacity-20" />
            <p className="text-text-secondary font-black animate-pulse uppercase tracking-widest text-xs">Loading resources...</p>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-2 relative z-10">
            {/* Subjects Column */}
            <motion.div variants={itemVariants} className="space-y-6">
              <div className="flex items-center gap-3 px-2">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-inner">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-display font-black text-text-primary">Academic Subjects</h2>
              </div>
              
              <div className="grid gap-4">
                {filteredSubjects.length === 0 ? (
                  <div className="p-10 text-center bg-bg-card/30 backdrop-blur-xl rounded-[32px] border-2 border-border/40 border-dashed">
                    <p className="text-xs font-black uppercase tracking-widest text-text-secondary opacity-40">No subjects found in this category</p>
                  </div>
                ) : (
                  filteredSubjects.map((subject: any) => (
                    <Link
                      key={subject.id}
                      href={`/teacher/question-banks/scope/subject/${subject.id}?examTypeId=${examTypeId}`}
                      className="group"
                    >
                      <Card className="border-border/50 bg-bg-card/40 backdrop-blur-xl rounded-[24px] overflow-hidden border-2 transition-all duration-300 hover:bg-bg-card/70 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5">
                        <CardHeader className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-bg-surface flex items-center justify-center border border-border/40 group-hover:scale-110 transition-transform">
                                <Layers className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <CardTitle className="text-lg font-display font-black text-text-primary group-hover:text-primary transition-colors">{subject.name}</CardTitle>
                                <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Explore repositories</p>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-text-secondary group-hover:translate-x-1 transition-transform" />
                          </div>
                        </CardHeader>
                      </Card>
                    </Link>
                  ))
                )}
              </div>
            </motion.div>

            {/* Model Tests Column */}
            <motion.div variants={itemVariants} className="space-y-6">
              <div className="flex items-center gap-3 px-2">
                <div className="p-3 rounded-2xl bg-accent/10 text-accent shadow-inner">
                  <Target className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-display font-black text-text-primary">Model Test Bundles</h2>
              </div>

              <div className="grid gap-4">
                {filteredModelTests.length === 0 ? (
                  <div className="p-10 text-center bg-bg-card/30 backdrop-blur-xl rounded-[32px] border-2 border-border/40 border-dashed">
                    <p className="text-xs font-black uppercase tracking-widest text-text-secondary opacity-40">No model test bundles found</p>
                  </div>
                ) : (
                  filteredModelTests.map((modelTest: any) => (
                    <Link
                      key={modelTest.id}
                      href={`/teacher/question-banks/scope/modelTest/${modelTest.id}?examTypeId=${examTypeId}`}
                      className="group"
                    >
                      <Card className="border-border/50 bg-bg-card/40 backdrop-blur-xl rounded-[24px] overflow-hidden border-2 transition-all duration-300 hover:bg-bg-card/70 hover:border-accent/40 hover:shadow-xl hover:shadow-accent/5">
                        <CardHeader className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-bg-surface flex items-center justify-center border border-border/40 group-hover:scale-110 transition-transform">
                                <FileText className="w-5 h-5 text-accent" />
                              </div>
                              <div>
                                <CardTitle className="text-lg font-display font-black text-text-primary group-hover:text-accent transition-colors">{modelTest.name}</CardTitle>
                                <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Manage bundle banks</p>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-text-secondary group-hover:translate-x-1 transition-transform" />
                          </div>
                        </CardHeader>
                      </Card>
                    </Link>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
