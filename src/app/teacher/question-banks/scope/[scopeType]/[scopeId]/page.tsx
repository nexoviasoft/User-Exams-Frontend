'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle, ArrowLeft, Database, Sparkles, ChevronRight, FileText, Layout, Info, Target, BookOpen } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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

export default function QuestionBankScopePage() {
  const params = useParams<{ scopeType: string; scopeId: string }>();
  const searchParams = useSearchParams();
  const examTypeId = searchParams.get('examTypeId') || '';
  const { scopeType, scopeId } = params;
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const { data: banks = [], isLoading: banksLoading } = useQuery({
    queryKey: ['teacher-question-banks'],
    queryFn: async () => (await axiosInstance.get('/question-banks/my')).data,
  });

  const { data: subjects = [], isLoading: subLoading } = useQuery({
    queryKey: ['teacher-subjects'],
    queryFn: async () => (await axiosInstance.get('/subject')).data,
  });

  const { data: modelTests = [], isLoading: modelLoading } = useQuery({
    queryKey: ['teacher-modeltests'],
    queryFn: async () => (await axiosInstance.get('/modeltest')).data,
  });

  const createBankMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.post('/question-banks', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-question-banks'] });
      toast.success('Question bank created successfully');
      setOpen(false);
      setName('');
      setDescription('');
    },
    onError: () => {
      toast.error('Failed to create question bank');
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createBankMutation.mutate({
      name,
      description,
      isPublic: false,
      subjectId: scopeType === 'subject' ? scopeId : undefined,
      modelTestId: scopeType === 'modelTest' ? scopeId : undefined,
    });
  };

  const isLoading = banksLoading || subLoading || modelLoading;
  const isSubject = scopeType === 'subject';
  const scopeName = isSubject
    ? subjects.find((s: any) => s.id === scopeId)?.name
    : modelTests.find((m: any) => m.id === scopeId)?.name;

  const scopedBanks = banks.filter((bank: any) =>
    isSubject ? bank.subject?.id === scopeId : bank.modelTest?.id === scopeId,
  );

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
                {isSubject ? 'Subject' : 'Bundle'} Repository
              </Badge>
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-black tracking-tight text-text-primary leading-tight">
              {scopeName || (isSubject ? 'Subject' : 'Bundle')} <span className="text-primary">Banks</span> 📚
            </h1>
            <p className="text-text-secondary text-lg max-w-2xl font-medium">
              Manage individual question repositories within this scope.
            </p>
          </div>
          <div className="flex items-center gap-4">
             <Link href={`/teacher/question-banks/exam-type/${examTypeId}`}>
              <Button variant="ghost" className="rounded-2xl h-12 px-6 font-bold hover:bg-bg-surface border-2 border-border/50 transition-all hover:-translate-x-1">
                <ArrowLeft className="w-5 h-5 mr-2" /> Back
              </Button>
            </Link>
            <Button 
              onClick={() => setOpen(true)}
              className="bg-primary hover:bg-primary-light text-white rounded-2xl h-12 px-8 font-black shadow-xl shadow-primary/20 transition-all hover:-translate-y-1"
            >
              <PlusCircle className="w-5 h-5 mr-2" /> New Bank
            </Button>
          </div>
        </motion.div>

        {/* Modal / Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="bg-bg-card/90 backdrop-blur-2xl border-border/50 sm:max-w-[480px] rounded-[32px] overflow-hidden p-0 shadow-2xl">
            <div className="relative h-24 bg-gradient-to-r from-primary/20 to-accent/20">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg">
                  <Database className="w-6 h-6 text-primary" />
                </div>
              </div>
            </div>

            <form onSubmit={handleCreate} className="p-8 space-y-6">
              <div className="text-center space-y-1">
                <DialogTitle className="text-2xl font-display font-black text-text-primary">Create Question Bank</DialogTitle>
                <DialogDescription className="text-text-secondary font-medium">
                  Add a new container for your academic assessments.
                </DialogDescription>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Bank Designation</label>
                  <div className="relative group">
                    <Layout className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors" />
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Chapter 1: Introduction to Calculus"
                      className="w-full bg-bg-surface/50 border border-border/40 rounded-[14px] h-12 pl-11 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-text-primary placeholder:text-text-secondary/30"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Contextual Description (Optional)</label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Briefly explain the scope of this repository..."
                    className="w-full bg-bg-surface/50 border border-border/40 rounded-[14px] p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 min-h-[100px] transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1 rounded-[14px] h-12 font-bold"
                  onClick={() => setOpen(false)}
                  disabled={createBankMutation.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createBankMutation.isPending}
                  className="flex-[2] bg-primary hover:bg-primary-light text-white font-black rounded-[14px] h-12 shadow-xl shadow-primary/20"
                >
                  {createBankMutation.isPending ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Create Repository
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Content Section */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary opacity-20" />
            <p className="text-text-secondary font-black animate-pulse uppercase tracking-widest text-xs">Accessing repositories...</p>
          </div>
        ) : scopedBanks.length === 0 ? (
          <motion.div variants={itemVariants} className="relative z-10">
            <Card className="border-border/50 bg-bg-card/40 backdrop-blur-xl rounded-[32px] p-20 text-center space-y-6 border-dashed border-2">
              <div className="w-20 h-20 bg-bg-surface rounded-full flex items-center justify-center mx-auto opacity-10">
                <Database className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-display font-black text-text-primary">Repository Empty</h3>
                <p className="text-text-secondary font-medium max-w-md mx-auto">
                  There are no question banks configured for this scope yet. Create your first repository to start adding assessments.
                </p>
              </div>
              <Button 
                onClick={() => setOpen(true)}
                className="bg-primary/10 hover:bg-primary/20 text-primary border-2 border-primary/20 rounded-2xl h-12 px-8 font-black transition-all"
              >
                <PlusCircle className="w-5 h-5 mr-2" /> Start Creating
              </Button>
            </Card>
          </motion.div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 relative z-10">
            {scopedBanks.map((bank: any) => (
              <motion.div key={bank.id} variants={itemVariants} whileHover={{ y: -5 }}>
                <Link href={`/teacher/questions/bank/${bank.id}`}>
                  <Card className="group h-full border-border/50 bg-bg-card/40 backdrop-blur-xl flex flex-col hover:bg-bg-card/70 hover:shadow-[0_20px_50px_rgba(0,82,204,0.1)] transition-all duration-500 rounded-[32px] overflow-hidden border-2 hover:border-primary/30">
                    <CardHeader className="p-8 pb-4">
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform">
                          <Database className="w-5 h-5" />
                        </div>
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black px-3 py-1 rounded-lg uppercase tracking-widest text-[9px]">
                          {bank.questionCount || 0} Questions
                        </Badge>
                      </div>
                      <CardTitle className="text-xl font-display font-black text-text-primary group-hover:text-primary transition-colors leading-tight">
                        {bank.name}
                      </CardTitle>
                      {bank.description && (
                        <p className="text-text-secondary text-xs mt-3 line-clamp-2 font-medium">
                          {bank.description}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent className="mt-auto p-8 pt-4 flex items-center justify-between border-t border-border/10">
                       <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-secondary group-hover:text-primary transition-colors">
                        <Info className="w-3.5 h-3.5" />
                        Manage Assets
                      </div>
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
