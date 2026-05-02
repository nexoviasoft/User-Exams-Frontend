'use client';

import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  PlusCircle, 
  Save, 
  Database, 
  FileText,
  Loader2,
  Image as ImageIcon,
  Sparkles,
  Zap,
  Target,
  Layers,
  Check,
  BookOpen,
  X,
  ChevronRight,
  ChevronLeft,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useQuery, useMutation } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { useSearchParams } from 'next/navigation';
import { useImgbbUpload } from '@/hooks/useImgbbUpload';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
};

interface QuestionBank {
  id: string;
  name: string;
  subject?: { id: string; name: string };
  modelTest?: { id: string; name: string };
}

export default function CreateQuestionPage() {
  const searchParams = useSearchParams();
  const bankIdFromUrl = searchParams.get('bankId') || '';
  
  const [step, setStep] = useState(1);
  const [scopeType, setScopeType] = useState<'subject' | 'modelTest'>('subject');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedModelTestId, setSelectedModelTestId] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctOption, setCorrectOption] = useState<number | null>(null);
  const [solutionText, setSolutionText] = useState('');
  const [solutionImage, setSolutionImage] = useState('');
  const [sessionCount, setSessionCount] = useState(0);
  
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [editText, setEditText] = useState('');
  const [editOptions, setEditOptions] = useState(['', '', '', '']);
  const [editCorrectOption, setEditCorrectOption] = useState<number | null>(null);
  const [editSolutionText, setEditSolutionText] = useState('');
  const [editSolutionImage, setEditSolutionImage] = useState('');
  
  const { uploadImage: uploadCreateImage, isUploading: isCreateImageUploading } = useImgbbUpload();
  const { uploadImage: uploadEditImage, isUploading: isEditImageUploading } = useImgbbUpload();

  const { data: banks = [] } = useQuery<QuestionBank[]>({
    queryKey: ['questionbanks'],
    queryFn: async () => (await axiosInstance.get('/question-banks/my')).data,
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ['teacher-subjects'],
    queryFn: async () => (await axiosInstance.get('/subject')).data,
  });

  const { data: modelTests = [] } = useQuery({
    queryKey: ['teacher-modeltests'],
    queryFn: async () => (await axiosInstance.get('/modeltest')).data,
  });

  const { data: questionList = [], isLoading: isLoadingQuestions, refetch: refetchQuestions } = useQuery({
    queryKey: ['question-list-by-bank', selectedBank],
    queryFn: async () => (await axiosInstance.get(`/questions/bank/${selectedBank}`)).data,
    enabled: !!selectedBank,
  });

  const scopedBanks = useMemo(() => {
    if (scopeType === 'subject') {
      if (!selectedSubjectId) return banks.filter((bank) => !!bank.subject?.id);
      return banks.filter((bank) => bank.subject?.id === selectedSubjectId);
    }
    if (!selectedModelTestId) return banks.filter((bank) => !!bank.modelTest?.id);
    return banks.filter((bank) => bank.modelTest?.id === selectedModelTestId);
  }, [banks, scopeType, selectedSubjectId, selectedModelTestId]);

  useEffect(() => {
    if (!bankIdFromUrl || !banks.length) return;
    const target = banks.find((bank) => String(bank.id) === String(bankIdFromUrl));
    if (target) {
      setSelectedBank(String(target.id));
      setStep(2); // Jump to step 2 if bank is in URL
      if (target.subject?.id) {
        setScopeType('subject');
        setSelectedSubjectId(String(target.subject.id));
      } else if (target.modelTest?.id) {
        setScopeType('modelTest');
        setSelectedModelTestId(String(target.modelTest.id));
      }
    }
  }, [bankIdFromUrl, banks]);

  const createMutation = useMutation({
    mutationFn: async (data: any) => (await axiosInstance.post('/questions', data)).data,
    onSuccess: () => {
      refetchQuestions();
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) =>
      (await axiosInstance.patch(`/questions/${id}`, payload)).data,
    onSuccess: async () => {
      toast.success('Question updated');
      setIsEditOpen(false);
      await refetchQuestions();
    },
  });

  const handleSaveQuestion = async (isFinal = false) => {
    if (!selectedBank) return toast.error('Please select a question bank');
    if (!questionText) return toast.error('Question text is required');
    if (options.some(opt => !opt)) return toast.error('Please fill all options');
    if (correctOption === null) return toast.error('Please select correct answer');

    try {
      await createMutation.mutateAsync({
        text: questionText,
        questionBankId: String(selectedBank),
        solutionText: solutionText || undefined,
        solutionImage: solutionImage || undefined,
        options: options.map((opt, idx) => ({
          text: opt,
          isCorrect: idx === correctOption,
        })),
      });
      
      toast.success('Question saved!');
      setSessionCount(prev => prev + 1);
      setQuestionText('');
      setOptions(['', '', '', '']);
      setCorrectOption(null);
      setSolutionText('');
      setSolutionImage('');
      
      if (isFinal) window.location.href = '/teacher/question-banks';
    } catch (error) {
      toast.error('Failed to save question');
    }
  };

  const handleUpdateQuestion = async () => {
    if (!editingQuestion) return;
    if (!editText) return toast.error('Question text is required');
    if (editOptions.some((opt) => !opt)) return toast.error('Please fill all options');
    if (editCorrectOption === null) return toast.error('Please select correct answer');

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

  const openEditModal = (question: any) => {
    setEditingQuestion(question);
    setEditText(question.text || '');
    setEditSolutionText(question.solutionText || '');
    setEditSolutionImage(question.solutionImage || '');
    const opts = question.options || [];
    const normalized = [0, 1, 2, 3].map((i) => opts[i]?.text || '');
    setEditOptions(normalized);
    const correctIndex = opts.findIndex((opt: any) => opt.isCorrect);
    setEditCorrectOption(correctIndex >= 0 ? correctIndex : null);
    setIsEditOpen(true);
  };

  const handleCreateImageUpload = async (file?: File) => {
    if (!file) return;
    try {
      const uploadedUrl = await uploadCreateImage(file);
      setSolutionImage(uploadedUrl);
      toast.success('Image uploaded');
    } catch (error: any) {
      toast.error('Image upload failed');
    }
  };

  const handleEditImageUpload = async (file?: File) => {
    if (!file) return;
    try {
      const uploadedUrl = await uploadEditImage(file);
      setEditSolutionImage(uploadedUrl);
      toast.success('Image uploaded');
    } catch (error: any) {
      toast.error('Image upload failed');
    }
  };

  const selectedBankName = useMemo(() => banks.find(b => b.id === selectedBank)?.name, [banks, selectedBank]);

  const sortedQuestions = useMemo(() => {
    return [...questionList].sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [questionList]);

  return (
    <DashboardLayout>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-full mx-auto space-y-6 relative px-4 pb-20"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black px-3 py-1 rounded-lg uppercase tracking-widest text-[9px]">
                Content Studio
              </Badge>
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-black tracking-tight text-text-primary leading-tight">
              {step === 1 ? 'Target' : 'Create'} <span className="text-primary">Question</span> {step === 1 ? '🎯' : '✍️'}
            </h1>
          </div>
          <div className="flex bg-bg-card/40 backdrop-blur-xl border border-border/50 p-1.5 rounded-[18px] shadow-inner w-fit">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-500",
                  step === s ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110" : step > s ? "bg-success text-white" : "bg-bg-surface text-text-secondary"
                )}>
                  {step > s ? <Check className="w-4 h-4" /> : s}
                </div>
                {s < 2 && <div className="w-8 h-0.5 bg-border/30 mx-1" />}
              </div>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <Card className="border-border/50 bg-bg-card/40 backdrop-blur-xl rounded-[28px] overflow-hidden border-2 shadow-2xl">
                <CardHeader className="p-6 pb-2 border-b border-border/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-accent/10 text-accent">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-display font-black text-text-primary">Source Configuration</CardTitle>
                      <p className="text-[9px] font-black uppercase tracking-widest text-text-secondary opacity-60">Map your question repository</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                   <div className="flex bg-bg-surface p-1 rounded-[14px] border border-border/40 max-w-sm">
                      <button 
                        onClick={() => setScopeType('subject')}
                        className={cn("flex-1 py-2 rounded-[10px] text-[10px] font-black uppercase tracking-widest transition-all", scopeType === 'subject' ? "bg-primary text-white shadow-md" : "text-text-secondary")}
                      >Subject</button>
                      <button 
                        onClick={() => setScopeType('modelTest')}
                        className={cn("flex-1 py-2 rounded-[10px] text-[10px] font-black uppercase tracking-widest transition-all", scopeType === 'modelTest' ? "bg-primary text-white shadow-md" : "text-text-secondary")}
                      >Model Test</button>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Scope Selection</Label>
                        <select 
                          className="w-full h-12 rounded-[14px] bg-bg-surface border border-border/40 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none"
                          value={scopeType === 'subject' ? selectedSubjectId : selectedModelTestId}
                          onChange={(e) => scopeType === 'subject' ? setSelectedSubjectId(e.target.value) : setSelectedModelTestId(e.target.value)}
                        >
                          <option value="">Select {scopeType === 'subject' ? 'Subject' : 'Model Test'}...</option>
                          {(scopeType === 'subject' ? subjects : modelTests).map((item: any) => (
                            <option key={item.id} value={item.id}>{item.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Target Question Bank</Label>
                        <select 
                          className="w-full h-12 rounded-[14px] bg-bg-surface border border-border/40 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none"
                          value={selectedBank}
                          onChange={(e) => setSelectedBank(e.target.value)}
                          disabled={scopedBanks.length === 0}
                        >
                          <option value="">{scopedBanks.length === 0 ? 'No banks found' : 'Choose Repository...'}</option>
                          {scopedBanks.map((bank) => (
                            <option key={bank.id} value={bank.id}>{bank.name}</option>
                          ))}
                        </select>
                      </div>
                   </div>
                </CardContent>
                <CardFooter className="p-6 bg-bg-surface/30 flex justify-end border-t border-border/10">
                   <Button 
                    onClick={() => {
                      if (!selectedBank) return toast.error('Please select a bank');
                      setStep(2);
                    }} 
                    className="rounded-xl h-12 px-8 bg-primary text-white font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20 transition-all hover:-translate-y-1"
                   >
                     Continue Content <ChevronRight className="w-4 h-4 ml-2" />
                   </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ) : (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="flex items-center justify-between px-2">
                 <div className="flex items-center gap-3">
                    <Button onClick={() => setStep(1)} variant="ghost" className="h-9 px-3 rounded-lg hover:bg-white text-text-secondary font-black uppercase tracking-widest text-[9px]">
                       <ChevronLeft className="w-4 h-4 mr-1" /> Change Repository
                    </Button>
                 </div>
                 <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary fill-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">{sessionCount} Added</span>
                 </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                 <div className="lg:col-span-8 space-y-6">
                    <Card className="border-border/50 bg-bg-card/40 backdrop-blur-xl rounded-[28px] overflow-hidden border-2 shadow-2xl">
                      <CardHeader className="p-6 pb-2 border-b border-border/20">
                         <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                               <Database className="w-6 h-6" />
                            </div>
                            <div>
                               <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary mb-1">Active Question Bank</p>
                               <CardTitle className="text-2xl font-display font-black text-text-primary leading-tight">
                                 {selectedBankName}
                               </CardTitle>
                            </div>
                         </div>
                      </CardHeader>
                      <CardContent className="p-6 space-y-5">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Question Prompt</Label>
                          <textarea
                            className="w-full bg-bg-surface/50 border border-border/40 rounded-[20px] p-5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-text-primary shadow-inner min-h-[120px] resize-none"
                            placeholder="Type your question prompt here..."
                            value={questionText}
                            onChange={(e) => setQuestionText(e.target.value)}
                          />
                        </div>

                        <div className="space-y-4">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Options & Answer Key</Label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {options.map((option, idx) => (
                              <div key={idx} className="relative group">
                                <button
                                  type="button"
                                  onClick={() => setCorrectOption(idx)}
                                  className={cn(
                                    "absolute left-4 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all duration-300 font-black text-[10px]",
                                    correctOption === idx 
                                      ? "bg-success border-success text-white scale-110 shadow-lg shadow-success/20" 
                                      : "bg-white border-border/50 text-text-secondary hover:border-success/50"
                                  )}
                                >
                                  {correctOption === idx ? <Check className="w-3.5 h-3.5" /> : String.fromCharCode(65 + idx)}
                                </button>
                                <input
                                  type="text"
                                  className={cn(
                                    "w-full bg-bg-surface/50 border rounded-[16px] h-12 pl-14 pr-6 text-xs font-bold focus:outline-none focus:ring-2 transition-all shadow-sm",
                                    correctOption === idx 
                                      ? "border-success/50 ring-2 ring-success/20 bg-success/[0.02]" 
                                      : "border-border/40 focus:ring-primary/40"
                                  )}
                                  placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                                  value={option}
                                  onChange={(e) => {
                                    const newOptions = [...options];
                                    newOptions[idx] = e.target.value;
                                    setOptions(newOptions);
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2 pt-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Solution Reasoning</Label>
                          <textarea
                            className="w-full bg-bg-surface/50 border border-border/40 rounded-[20px] p-5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-success/40 transition-all text-text-primary shadow-inner min-h-[80px] resize-none"
                            placeholder="Explain the solution steps (Optional)..."
                            value={solutionText}
                            onChange={(e) => setSolutionText(e.target.value)}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <Label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Asset Link</Label>
                             <input
                              className="w-full bg-bg-surface/50 border border-border/40 rounded-[14px] h-10 px-4 text-xs font-bold"
                              placeholder="https://image-url.com"
                              value={solutionImage}
                              onChange={(e) => setSolutionImage(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                             <Label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Direct Upload</Label>
                             <div className="relative">
                               <input
                                type="file"
                                className="w-full text-[10px] bg-bg-surface/30 rounded-[14px] border border-border/40 p-1.5"
                                onChange={(e) => handleCreateImageUpload(e.target.files?.[0])}
                              />
                              {isCreateImageUploading && <Loader2 className="absolute right-3 top-2.5 w-3.5 h-3.5 animate-spin text-primary" />}
                             </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="flex gap-4">
                       <Button 
                        onClick={() => handleSaveQuestion(false)}
                        disabled={createMutation.isPending}
                        className="flex-1 h-12 rounded-2xl border-2 border-primary/20 bg-white text-primary font-black uppercase tracking-widest text-[11px] hover:bg-primary/5"
                       >
                         {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <PlusCircle className="w-4 h-4 mr-2" />}
                         Save & Add Next
                       </Button>
                       <Button 
                        onClick={() => handleSaveQuestion(true)}
                        disabled={createMutation.isPending}
                        className="flex-1 h-12 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20"
                       >
                         {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                         Finalize
                       </Button>
                    </div>
                 </div>

                 <div className="lg:col-span-4">
                    <Card className="border-border/50 bg-bg-card/40 backdrop-blur-xl rounded-[28px] overflow-hidden border-2 shadow-2xl">
                      <CardHeader className="p-5 pb-2 border-b border-border/20 flex flex-row items-center justify-between">
                        <div>
                           <CardTitle className="text-sm font-display font-black text-text-primary uppercase tracking-widest">Question Bank Feed</CardTitle>
                           <p className="text-[7px] font-black text-text-secondary uppercase tracking-widest opacity-60">Latest entries at top</p>
                        </div>
                        <Badge className="bg-primary/10 text-primary text-[8px] border-none">{questionList.length}</Badge>
                      </CardHeader>
                      <CardContent className="p-0 max-h-[500px] overflow-y-auto custom-scrollbar">
                        {isLoadingQuestions ? (
                           <div className="p-10 flex flex-col items-center gap-2 opacity-30">
                              <Loader2 className="w-6 h-6 animate-spin" />
                              <p className="text-[8px] font-black uppercase tracking-widest">Syncing Feed...</p>
                           </div>
                        ) : sortedQuestions.length === 0 ? (
                          <div className="p-12 text-center opacity-30">
                             <Layers className="w-8 h-8 mx-auto mb-2" />
                             <p className="text-[8px] font-black uppercase tracking-widest">No entries yet</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-border/10">
                            {sortedQuestions.map((q: any, i: number) => (
                              <div key={q.id} className="p-4 hover:bg-white/40 transition-colors group">
                                <div className="flex items-start gap-3">
                                   <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between mb-1">
                                         <span className="text-[7px] font-black text-text-secondary uppercase tracking-widest">
                                           {new Date(q.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                         </span>
                                         <button onClick={() => openEditModal(q)} className="text-[8px] font-black text-primary opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest flex items-center gap-1">
                                            Edit <ArrowRight className="w-2.5 h-2.5" />
                                         </button>
                                      </div>
                                      <p className="text-xs font-bold text-text-primary line-clamp-2 leading-relaxed">{q.text}</p>
                                   </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Modal */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
           <DialogContent className="max-w-2xl bg-bg-card/90 backdrop-blur-3xl border-border/50 rounded-[32px] p-0 overflow-hidden shadow-2xl">
              <div className="p-8 space-y-6">
                 <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-display font-black text-text-primary">Update <span className="text-primary">Entry</span></h2>
                 </div>
                 
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Question Content</Label>
                       <textarea 
                        className="w-full bg-bg-surface/50 border border-border/40 rounded-[20px] p-5 text-sm font-bold min-h-[100px] resize-none shadow-inner"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                       />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       {editOptions.map((opt, idx) => (
                         <div key={idx} className="relative">
                            <button 
                              onClick={() => setEditCorrectOption(idx)}
                              className={cn("absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg border-2 flex items-center justify-center text-[9px] font-black", editCorrectOption === idx ? "bg-success border-success text-white" : "bg-white border-border/50")}
                            >
                              {editCorrectOption === idx ? <Check className="w-3" /> : String.fromCharCode(65 + idx)}
                            </button>
                            <input 
                              className="w-full h-10 pl-11 pr-4 bg-bg-surface/50 border border-border/40 rounded-xl text-xs font-bold shadow-sm"
                              value={opt}
                              onChange={(e) => {
                                const next = [...editOptions];
                                next[idx] = e.target.value;
                                setEditOptions(next);
                              }}
                            />
                         </div>
                       ))}
                    </div>

                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Solution Insight</Label>
                       <textarea 
                        className="w-full bg-bg-surface/50 border border-border/40 rounded-[20px] p-4 text-xs font-medium min-h-[80px] resize-none shadow-inner"
                        value={editSolutionText}
                        onChange={(e) => setEditSolutionText(e.target.value)}
                       />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <Label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Asset Link</Label>
                         <input
                          className="w-full bg-bg-surface/50 border border-border/40 rounded-[14px] h-10 px-4 text-xs font-bold"
                          placeholder="https://image-url.com"
                          value={editSolutionImage}
                          onChange={(e) => setEditSolutionImage(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                         <Label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Direct Upload</Label>
                         <div className="relative">
                           <input
                            type="file"
                            className="w-full text-[10px] bg-bg-surface/30 rounded-[14px] border border-border/40 p-1.5"
                            onChange={(e) => handleEditImageUpload(e.target.files?.[0])}
                          />
                          {isEditImageUploading && <Loader2 className="absolute right-3 top-2.5 w-3.5 h-3.5 animate-spin text-primary" />}
                         </div>
                      </div>
                    </div>
                 </div>

                 <div className="flex gap-3 pt-4">
                    <Button onClick={() => setIsEditOpen(false)} variant="outline" className="flex-1 rounded-2xl h-12 font-black uppercase tracking-widest text-[10px] border-2">Cancel</Button>
                    <Button onClick={handleUpdateQuestion} disabled={updateMutation.isPending} className="flex-1 rounded-2xl h-12 bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20">
                      {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                      Update Entry
                    </Button>
                 </div>
              </div>
           </DialogContent>
        </Dialog>
      </motion.div>
    </DashboardLayout>
  );
}
