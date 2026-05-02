'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Pencil, Image as ImageIcon, ArrowLeft, PlusCircle, CheckCircle2, Info, Sparkles, FileText, ChevronRight, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useImgbbUpload } from '@/hooks/useImgbbUpload';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

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

export default function BankQuestionsPage() {
  const params = useParams<{ bankId: string }>();
  const bankId = params.bankId;
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [editText, setEditText] = useState('');
  const [editOptions, setEditOptions] = useState(['', '', '', '']);
  const [editCorrectOption, setEditCorrectOption] = useState<number | null>(null);
  const [editSolutionText, setEditSolutionText] = useState('');
  const [editSolutionImage, setEditSolutionImage] = useState('');
  const { uploadImage, isUploading } = useImgbbUpload();

  const { data: questionList = [], isLoading, refetch } = useQuery({
    queryKey: ['question-list-by-bank', bankId],
    queryFn: async () => (await axiosInstance.get(`/questions/bank/${bankId}`)).data,
    enabled: !!bankId,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) =>
      (await axiosInstance.patch(`/questions/${id}`, payload)).data,
    onSuccess: async () => {
      toast.success('Question updated successfully');
      setIsEditOpen(false);
      await refetch();
    },
    onError: () => {
      toast.error('Failed to update question');
    },
  });

  const openEditModal = (question: any) => {
    setEditingQuestion(question);
    setEditText(question.text || '');
    setEditSolutionText(question.solutionText || '');
    setEditSolutionImage(question.solutionImage || '');
    const options = question.options || [];
    const normalized = [0, 1, 2, 3].map((i) => options[i]?.text || '');
    setEditOptions(normalized);
    const correctIndex = options.findIndex((opt: any) => opt.isCorrect);
    setEditCorrectOption(correctIndex >= 0 ? correctIndex : null);
    setIsEditOpen(true);
  };

  const handleUpdateQuestion = async () => {
    if (!editingQuestion) return;
    if (!editText) return toast.error('Please enter question text');
    if (editOptions.some((opt) => !opt)) return toast.error('Please fill all options');
    if (editCorrectOption === null) return toast.error('Please select the correct answer');

    await updateMutation.mutateAsync({
      id: String(editingQuestion.id),
      payload: {
        text: editText,
        solutionText: editSolutionText || undefined,
        solutionImage: editSolutionImage || undefined,
        options: editOptions.map((opt, idx) => ({
          text: opt,
          isCorrect: idx === editCorrectOption,
        })),
      },
    });
  };

  const handleEditImageUpload = async (file?: File) => {
    if (!file) return;
    try {
      const uploadedUrl = await uploadImage(file);
      setEditSolutionImage(uploadedUrl);
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      toast.error(error?.message || 'Image upload failed');
    }
  };

  return (
    <DashboardLayout>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto space-y-10 relative px-4 pb-20"
      >
        {/* Background Decorative Glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black px-3 py-1 rounded-lg uppercase tracking-widest text-[10px]">
                Bank Repository
              </Badge>
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-black tracking-tight text-text-primary leading-tight">
              Question <span className="text-primary">Library</span> 📖
            </h1>
            <p className="text-text-secondary text-lg max-w-2xl font-medium">
              Browse and refine all assessments within this repository.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/teacher/question-banks">
              <Button variant="ghost" className="rounded-2xl h-12 px-6 font-bold hover:bg-bg-surface border-2 border-border/50 transition-all hover:-translate-x-1">
                <ArrowLeft className="w-5 h-5 mr-2" /> Back
              </Button>
            </Link>
            <Link href={`/teacher/create-question?bankId=${bankId}`}>
              <Button className="bg-primary hover:bg-primary-light text-white rounded-2xl h-12 px-8 font-black shadow-xl shadow-primary/20 transition-all hover:-translate-y-1">
                <PlusCircle className="w-5 h-5 mr-2" /> Add Question
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Question Content */}
        <motion.div variants={itemVariants} className="relative z-10">
          <Card className="border-border/50 bg-bg-card/40 backdrop-blur-xl rounded-[32px] overflow-hidden border-2 shadow-2xl">
            <CardHeader className="p-8 pb-4 border-b border-border/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                    <FileText className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-2xl font-display font-black text-text-primary">Repository Questions</CardTitle>
                </div>
                <Badge variant="outline" className="font-black px-3 py-1 rounded-lg text-[10px] uppercase tracking-widest bg-white/50">
                  {questionList.length} Total Assets
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" />
                  <p className="text-text-secondary font-black animate-pulse uppercase tracking-widest text-[10px]">Synchronizing questions...</p>
                </div>
              ) : questionList.length === 0 ? (
                <div className="text-center py-20 opacity-30">
                  <Info className="w-10 h-10 mx-auto mb-4" />
                  <p className="text-xs font-black uppercase tracking-widest">This repository is currently empty</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  <AnimatePresence mode="popLayout">
                    {questionList.map((question: any, idx: number) => (
                      <motion.div 
                        key={question.id} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="group p-8 rounded-[28px] border border-border/40 bg-bg-surface/30 hover:bg-white/40 transition-all duration-300 relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        <div className="flex items-start justify-between gap-6">
                          <div className="space-y-6 flex-1">
                            <div className="flex items-start gap-4">
                              <Badge className="bg-primary/10 text-primary border-primary/20 font-black px-2 py-0.5 rounded-lg text-[9px] shrink-0 mt-1">
                                Q{idx + 1}
                              </Badge>
                              <p className="font-display font-black text-text-primary text-xl leading-relaxed">{question.text}</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
                              {(question.options || []).map((opt: any, i: number) => (
                                <div key={opt.id || i} className="flex items-center gap-3">
                                  <div className={cn(
                                    "w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black border-2 transition-all shadow-sm shrink-0",
                                    opt.isCorrect 
                                      ? 'bg-success border-success text-white rotate-[360deg]' 
                                      : 'border-border/60 bg-white/50 text-text-secondary'
                                  )}>
                                    {opt.isCorrect ? <Check className="w-4 h-4" /> : String.fromCharCode(65 + i)}
                                  </div>
                                  <span className={cn(
                                    "text-sm font-bold transition-colors", 
                                    opt.isCorrect ? 'text-success' : 'text-text-secondary'
                                  )}>
                                    {opt.text}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-12 w-12 rounded-[18px] hover:bg-primary/10 hover:text-primary text-text-secondary shrink-0 transition-all active:scale-90"
                            onClick={() => openEditModal(question)}
                          >
                            <Pencil className="w-5 h-5" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Edit Modal */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="bg-bg-card/95 backdrop-blur-2xl border-border/50 sm:max-w-[720px] rounded-[32px] overflow-hidden p-0 shadow-2xl">
            <div className="p-10 space-y-8">
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-primary/10 text-primary shadow-inner">
                    <Pencil className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <DialogTitle className="text-3xl font-display font-black text-text-primary">Edit Question</DialogTitle>
                    <p className="text-xs font-bold text-text-secondary uppercase tracking-widest opacity-60">Refining assessment assets</p>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-8 max-h-[65vh] overflow-y-auto pr-4 custom-scrollbar">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Question Prompt</label>
                  <textarea
                    className="w-full bg-bg-surface/50 border border-border/40 rounded-[24px] p-8 text-lg font-display font-black text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40 min-h-[160px] transition-all shadow-inner placeholder:text-text-secondary/20"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    placeholder="Enter question text..."
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Response Options</label>
                  <div className="grid gap-4">
                    {editOptions.map((opt, idx) => {
                      const isSelected = editCorrectOption === idx;
                      return (
                        <div key={idx} className={cn(
                          "flex items-center gap-5 p-3 rounded-[20px] border-2 transition-all duration-300",
                          isSelected ? "border-success bg-success/5 shadow-lg shadow-success/5" : "border-border/40 bg-bg-surface/30"
                        )}>
                          <button
                            className={cn(
                              "w-12 h-12 rounded-[14px] border-2 flex items-center justify-center text-sm font-black transition-all duration-300 shrink-0",
                              isSelected ? "bg-success border-success text-white rotate-[360deg] shadow-lg shadow-success/20" : "border-border/60 hover:border-success/40 text-text-secondary"
                            )}
                            onClick={() => setEditCorrectOption(idx)}
                          >
                            {isSelected ? <Check className="w-6 h-6" /> : String.fromCharCode(65 + idx)}
                          </button>
                          <input
                            className="w-full bg-transparent border-none py-3 text-base font-black text-text-primary focus:outline-none placeholder:text-text-secondary/20"
                            value={opt}
                            onChange={(e) => {
                              const next = [...editOptions];
                              next[idx] = e.target.value;
                              setEditOptions(next);
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 pt-4">
                   <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Solution Context</label>
                    <textarea
                      className="w-full bg-bg-surface/50 border border-border/40 rounded-[20px] p-6 text-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-success/40 min-h-[120px] transition-all shadow-inner"
                      value={editSolutionText}
                      onChange={(e) => setEditSolutionText(e.target.value)}
                      placeholder="Explain the reasoning..."
                    />
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Media Reference</label>
                      <div className="relative group">
                        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors" />
                        <input
                          className="w-full bg-bg-surface/50 border border-border/40 rounded-[14px] h-12 pl-12 pr-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/40"
                          value={editSolutionImage}
                          onChange={(e) => setEditSolutionImage(e.target.value)}
                          placeholder="External image URL..."
                        />
                      </div>
                    </div>
                    <div className="p-6 rounded-[20px] border-2 border-dashed border-border/40 bg-bg-surface/30 text-center space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary block">Direct Media Upload</label>
                       <input
                        type="file"
                        accept="image/*"
                        className="w-full text-[10px] font-black uppercase file:bg-primary file:text-white file:border-none file:rounded-lg file:px-4 file:py-2 file:mr-4 file:cursor-pointer cursor-pointer"
                        onChange={(e) => handleEditImageUpload(e.target.files?.[0])}
                        disabled={isUploading}
                      />
                      {isUploading && <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mt-2" />}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-border/20">
                <Button variant="ghost" className="flex-1 rounded-[18px] h-14 font-black uppercase tracking-widest text-xs" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdateQuestion} 
                  disabled={updateMutation.isPending}
                  className="flex-[2] bg-primary hover:bg-primary-light text-white font-black rounded-[18px] h-14 shadow-2xl shadow-primary/30 uppercase tracking-[0.2em] text-xs"
                >
                  {updateMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <Sparkles className="w-4 h-4 mr-3" />}
                  Commit Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </DashboardLayout>
  );
}
