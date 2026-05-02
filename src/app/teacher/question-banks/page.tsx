'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Layers, Plus, Database, Sparkles, ArrowRight, BookOpen, Target, Info } from 'lucide-react';
import { useGetExamTypesQuery } from '@/store/slices/api/examTypesApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
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
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

export default function QuestionBanksPage() {
  const { data: examTypes = [], isLoading } = useGetExamTypesQuery();
  const { data: subjects = [] } = useQuery({ 
    queryKey: ['teacher-subjects'], 
    queryFn: async () => (await axiosInstance.get('/subject')).data 
  });
  const { data: modelTests = [] } = useQuery({ 
    queryKey: ['teacher-modeltests'], 
    queryFn: async () => (await axiosInstance.get('/modeltest')).data 
  });
  
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [examTypeId, setExamTypeId] = useState('');
  const [scopeId, setScopeId] = useState('');

  const filteredSubjects = subjects.filter((s: any) => s.examType?.id === examTypeId);
  const filteredModelTests = modelTests.filter((m: any) => m.examType?.id === examTypeId);

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
      setExamTypeId('');
      setScopeId('');
    },
    onError: () => {
      toast.error('Failed to create question bank');
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !scopeId) {
      toast.error('Please fill all required fields');
      return;
    }
    const [selectedScopeType, selectedScopeId] = scopeId.split(':');
    createBankMutation.mutate({
      name,
      description,
      isPublic: false,
      subjectId: selectedScopeType === 'subject' ? selectedScopeId : undefined,
      modelTestId: selectedScopeType === 'modelTest' ? selectedScopeId : undefined,
    });
  };

  return (
    <DashboardLayout>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-10 max-w-7xl mx-auto relative px-4"
      >
        {/* Background Decorative Glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black px-3 py-1 rounded-lg uppercase tracking-widest text-[10px]">
                Library Management
              </Badge>
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-black tracking-tight text-text-primary leading-tight">
              Question <span className="text-primary">Banks</span> 📚
            </h1>
            <p className="text-text-secondary text-lg max-w-2xl font-medium">
              Organize your curriculum by exam types, subjects, and model tests.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button 
              className="bg-bg-card/40 border-2 border-border/50 hover:bg-bg-card/60 text-text-primary rounded-2xl h-12 px-6 font-black shadow-xl backdrop-blur-xl transition-all hover:-translate-y-1"
              variant="outline" 
              onClick={() => setOpen(true)}
            >
              <Plus className="w-5 h-5 mr-2 text-primary" />
              New Bank
            </Button>
            <Link href="/teacher/create-question">
              <Button className="bg-primary hover:bg-primary-light text-white rounded-2xl h-12 px-8 font-black shadow-xl shadow-primary/20 transition-all hover:-translate-y-1">
                <Plus className="w-5 h-5 mr-2" /> Add Question
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Categories Section */}
        <motion.div variants={itemVariants} className="relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-8 bg-primary rounded-full" />
            <h2 className="text-xl font-display font-black text-text-primary uppercase tracking-widest">By Exam Type</h2>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary opacity-20" />
              <p className="text-text-secondary font-black animate-pulse uppercase tracking-widest text-xs">Loading categories...</p>
            </div>
          ) : examTypes.length === 0 ? (
            <Card className="border-border/50 bg-bg-card/40 backdrop-blur-xl rounded-[24px] p-10 text-center space-y-4">
              <div className="w-16 h-16 bg-bg-surface rounded-full flex items-center justify-center mx-auto opacity-20">
                <Database className="w-8 h-8" />
              </div>
              <p className="text-text-secondary font-bold">No Exam Types found. Please create one first.</p>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {examTypes.map((examType: any) => (
                <motion.div key={examType.id} whileHover={{ y: -5 }} className="h-full">
                  <Link href={`/teacher/question-banks/exam-type/${examType.id}`}>
                    <Card className="group h-full border-border/50 bg-bg-card/40 backdrop-blur-xl flex flex-col hover:bg-bg-card/70 hover:shadow-[0_20px_50px_rgba(0,82,204,0.1)] transition-all duration-500 rounded-[28px] overflow-hidden border-2 hover:border-primary/30 cursor-pointer">
                      <CardHeader className="p-5">
                        <div className="flex justify-between items-start mb-3">
                          <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-500 shadow-inner">
                            <Layers className="w-5 h-5" />
                          </div>
                          <Badge variant="outline" className="text-[8px] font-black opacity-30 tracking-[0.2em]">CATALOG</Badge>
                        </div>
                        <CardTitle className="text-xl font-display font-black text-text-primary group-hover:text-primary transition-colors leading-tight">
                          {examType.name}
                        </CardTitle>
                        <div className="pt-3 flex items-center justify-between text-[11px] font-bold text-text-secondary">
                          <span className="flex items-center gap-2 group-hover:text-primary transition-colors">
                            Explore Assets <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Modal / Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="bg-bg-card/90 backdrop-blur-2xl border-border/50 sm:max-w-[500px] rounded-[32px] overflow-hidden p-0 shadow-2xl">
            <div className="relative h-24 bg-gradient-to-r from-primary/20 to-accent/20">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg">
                  <Plus className="w-6 h-6 text-primary" />
                </div>
              </div>
            </div>

            <form onSubmit={handleCreate} className="p-8 space-y-6">
              <div className="text-center space-y-1">
                <DialogTitle className="text-2xl font-display font-black text-text-primary">Create New Bank</DialogTitle>
                <DialogDescription className="text-text-secondary font-medium">
                  Set up a dedicated repository for your questions.
                </DialogDescription>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Exam Type</Label>
                  <div className="relative group">
                    <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors" />
                    <select
                      className="flex h-12 w-full rounded-[14px] border border-border/50 bg-bg-surface/50 pl-11 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all appearance-none cursor-pointer"
                      value={examTypeId}
                      onChange={(e) => {
                        setExamTypeId(e.target.value);
                        setScopeId('');
                      }}
                      required
                    >
                      <option value="">Select Exam Type</option>
                      {examTypes.map((et: any) => (
                        <option key={et.id} value={et.id}>
                          {et.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <AnimatePresence>
                  {examTypeId && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2 overflow-hidden"
                    >
                      <Label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Subject / Model Test</Label>
                      <div className="relative group">
                        <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors" />
                        <select
                          className="flex h-12 w-full rounded-[14px] border border-border/50 bg-bg-surface/50 pl-11 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all appearance-none cursor-pointer"
                          value={scopeId}
                          onChange={(e) => setScopeId(e.target.value)}
                          required
                        >
                          <option value="">Choose scope...</option>
                          {filteredSubjects.length > 0 && <optgroup label="Subjects" className="font-bold">
                            {filteredSubjects.map((s: any) => (
                              <option key={`subject-${s.id}`} value={`subject:${s.id}`}>
                                {s.name}
                              </option>
                            ))}
                          </optgroup>}
                          {filteredModelTests.length > 0 && <optgroup label="Model Tests" className="font-bold">
                            {filteredModelTests.map((m: any) => (
                              <option key={`modelTest-${m.id}`} value={`modelTest:${m.id}`}>
                                {m.name}
                              </option>
                            ))}
                          </optgroup>}
                        </select>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Bank Name</Label>
                  <div className="relative group">
                    <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors" />
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Physics MCQ Library"
                      className="h-12 pl-11 rounded-[14px] border-border/50 bg-bg-surface/50 font-bold focus:ring-primary/40"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Description (Optional)</Label>
                  <div className="relative group">
                    <Info className="absolute left-4 top-3 w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors" />
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add brief details about this bank..."
                      className="min-h-[100px] pl-11 rounded-[14px] border-border/50 bg-bg-surface/50 font-medium focus:ring-primary/40 pt-2.5"
                    />
                  </div>
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
                  className="flex-[2] bg-primary hover:bg-primary-light text-white font-black rounded-[14px] h-12 shadow-xl shadow-primary/20"
                  disabled={createBankMutation.isPending || !scopeId}
                >
                  {createBankMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  Create Bank
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>
    </DashboardLayout>
  );
}
