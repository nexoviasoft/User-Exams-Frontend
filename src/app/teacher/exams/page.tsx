'use client';

import { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  PlusCircle, 
  Eye, 
  Edit, 
  Rocket, 
  BarChart3, 
  Search,
  Loader2,
  Calendar,
  FileText,
  Filter,
  ArrowRight,
  Sparkles,
  Zap,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useMutation, useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
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

type ApiExam = {
  id: string;
  title: string;
  status: 'draft' | 'published';
  questionCount?: number;
  attempts?: number;
  createdAt?: string;
  isFree?: boolean;
  price?: number;
};

export default function TeacherExamsPage() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const { data: exams = [], isLoading, refetch } = useQuery<ApiExam[]>({
    queryKey: ['teacher-exams'],
    queryFn: async () => (await axiosInstance.get('/exams/my')).data,
  });

  const publishMutation = useMutation({
    mutationFn: async (id: string) => (await axiosInstance.patch(`/exams/${id}/publish`)).data,
    onSuccess: async () => {
      toast.success('Exam published successfully');
      await refetch();
    },
    onError: () => {
      toast.error('Publishing failed');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) =>
      (await axiosInstance.patch(`/exams/${id}`, { title })).data,
    onSuccess: async () => {
      toast.success('Exam title updated');
      await refetch();
    },
    onError: () => toast.error('Update failed'),
  });

  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const statusMatch =
        filter === 'All' ||
        (filter === 'Published' && exam.status === 'published') ||
        (filter === 'Draft' && exam.status === 'draft');
      const searchMatch = exam.title.toLowerCase().includes(search.toLowerCase());
      return statusMatch && searchMatch;
    });
  }, [exams, filter, search]);

  return (
    <DashboardLayout>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 max-w-full mx-auto relative px-4 pb-20"
      >
        {/* Background Decorative Glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black px-3 py-1 rounded-lg uppercase tracking-widest text-[10px]">
                Exam Management
              </Badge>
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-black tracking-tight text-text-primary leading-tight">
              My <span className="text-primary">Exams</span> 📋
            </h1>
            <p className="text-text-secondary text-lg max-w-2xl font-medium">
              Manage, publish, and track the performance of your assessments.
            </p>
          </div>
          <Link href="/teacher/create-exam">
            <Button className="bg-primary hover:bg-primary-light text-white rounded-2xl h-12 px-8 font-black shadow-xl shadow-primary/20 transition-all hover:-translate-y-1">
              <PlusCircle className="w-5 h-5 mr-2" /> Create New Exam
            </Button>
          </Link>
        </motion.div>

        {/* Filter Bar */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 relative z-10">
          <div className="flex bg-bg-card/40 backdrop-blur-xl border border-border/50 p-1.5 rounded-[20px] shadow-inner w-fit">
             {['All', 'Published', 'Draft'].map((tab) => {
               const isActive = filter === tab;
               return (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={cn(
                    "relative px-8 py-2.5 rounded-[14px] text-xs font-black uppercase tracking-widest transition-all duration-300",
                    isActive ? "text-white" : "text-text-secondary hover:text-text-primary"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeExamTab"
                      className="absolute inset-0 bg-primary rounded-[14px] shadow-lg shadow-primary/20"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10">{tab}</span>
                </button>
               );
             })}
          </div>
          
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search by title..." 
              className="bg-bg-card/40 backdrop-blur-xl border border-border/50 rounded-[20px] py-3.5 pl-12 pr-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all w-full md:w-[360px] shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </motion.div>

        {/* Exams Content */}
        <motion.div variants={itemVariants} className="relative z-10">
          <Card className="border-border/50 bg-bg-card/40 backdrop-blur-xl rounded-[32px] overflow-hidden border-2 shadow-2xl">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                  <Loader2 className="w-12 h-12 animate-spin text-primary opacity-20" />
                  <p className="text-text-secondary font-black animate-pulse uppercase tracking-widest text-xs">Loading assessments...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-border/40 text-text-secondary text-[9px] uppercase tracking-[0.2em] font-black">
                        <th className="px-6 py-4">Assessment Details</th>
                        <th className="px-6 py-4">Price Model</th>
                        <th className="px-6 py-4">Structure</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      <AnimatePresence mode="popLayout">
                        {filteredExams.map((exam) => (
                          <motion.tr 
                            key={exam.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="group hover:bg-primary/[0.02] transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-0.5">
                                <span className="font-black text-text-primary text-sm group-hover:text-primary transition-colors line-clamp-1">{exam.title}</span>
                                <div className="flex items-center gap-2 text-[9px] text-text-secondary font-bold uppercase tracking-wider">
                                  <span className="flex items-center gap-1"><Calendar className="w-2.5 h-2.5" /> {new Date(exam.createdAt || '').toLocaleDateString()}</span>
                                  <span className="w-1 h-1 rounded-full bg-border" />
                                  <span className="flex items-center gap-1"><Users className="w-2.5 h-2.5" /> {exam.attempts || 0} Attempts</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <Badge className={cn(
                                "font-black px-2 py-0.5 rounded-lg text-[9px] tracking-wider",
                                exam.isFree ? 'bg-success/10 text-success border-success/20' : 'bg-accent/10 text-accent border-accent/20'
                              )}>
                                {exam.isFree ? 'FREE ACCESS' : `৳${Math.floor(Number(exam.price || 0) / 100)}`}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-xs font-bold text-text-primary">
                                <div className="p-1.5 rounded-lg bg-bg-surface border border-border/40">
                                  <FileText className="w-3 h-3 text-primary" />
                                </div>
                                {exam.questionCount || 0} Questions
                              </div>
                            </td>
                            <td className="px-6 py-4">
                               <Badge className={cn(
                                 "font-black px-2 py-0.5 rounded-lg text-[9px] tracking-wider",
                                 exam.status === 'published' ? "bg-success/10 text-success border-success/20" : "bg-text-secondary/10 text-text-secondary border-border/40"
                               )}>
                                {exam.status === 'published' ? 'PUBLISHED' : 'DRAFT'}
                               </Badge>
                            </td>
                            <td className="px-6 py-4">
                               <div className="flex items-center justify-end gap-1">
                                 <Link href={`/teacher/exams/${exam.id}`}>
                                   <Button
                                     variant="ghost"
                                     size="icon"
                                     className="h-9 w-9 rounded-lg hover:bg-primary/10 hover:text-primary text-text-secondary transition-all"
                                     title="Preview"
                                   >
                                     <Eye className="w-4 h-4" />
                                   </Button>
                                 </Link>
                                 {exam.status === 'draft' && (
                                   <>
                                     <Button
                                       variant="ghost"
                                       size="icon"
                                       className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary text-text-secondary transition-all"
                                       title="Edit Title"
                                       onClick={() => {
                                         const nextTitle = window.prompt('Update exam title', exam.title);
                                         if (!nextTitle || !nextTitle.trim() || nextTitle.trim() === exam.title) return;
                                         updateMutation.mutate({ id: exam.id, title: nextTitle.trim() });
                                       }}
                                     >
                                       <Edit className="w-4 h-4" />
                                     </Button>
                                     <Button
                                       variant="ghost"
                                       size="icon"
                                       className="h-10 w-10 rounded-xl hover:bg-success/10 hover:text-success text-text-secondary transition-all"
                                       title="Go Live"
                                       onClick={() => publishMutation.mutate(exam.id)}
                                     >
                                       <Rocket className="w-4 h-4" />
                                     </Button>
                                   </>
                                 )}
                                 <Link href={`/teacher/analytics?id=${exam.id}`}>
                                   <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-10 w-10 rounded-xl hover:bg-accent/10 hover:text-accent text-text-secondary transition-all" 
                                    title="Analytics"
                                   >
                                     <BarChart3 className="w-4 h-4" />
                                   </Button>
                                 </Link>
                               </div>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                      {filteredExams.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-8 py-32 text-center">
                            <div className="flex flex-col items-center gap-4">
                              <div className="w-20 h-20 rounded-full bg-bg-surface flex items-center justify-center opacity-10">
                                <Search className="w-10 h-10" />
                              </div>
                              <p className="text-text-secondary font-black uppercase tracking-widest text-xs">No matching exams found</p>
                              <Button 
                                variant="outline" 
                                className="rounded-xl border-border/50 font-bold text-xs"
                                onClick={() => { setSearch(''); setFilter('All'); }}
                              >
                                Clear All Filters
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
