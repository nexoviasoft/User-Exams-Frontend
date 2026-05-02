'use client';

import { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Clock, 
  Database,
  Rocket,
  Loader2,
  Sparkles,
  Zap,
  Target,
  FileText,
  BadgeCent,
  Layers,
  BookOpen,
  Info,
  Trophy,
  Activity,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

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

export default function CreateExamPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [useSubject, setUseSubject] = useState(false);
  const [useModelTest, setUseModelTest] = useState(false);
  
  const [examData, setExamData] = useState({
    title: '',
    description: '',
    duration: 60,
    passMark: 40,
    isFree: true,
    priceTaka: 0,
    bankId: '',
    subjectId: '',
    modelTestId: '',
  });

  const { data: banks = [] } = useQuery({
    queryKey: ['teacher-question-banks'],
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

  const scopedBanks = useMemo(() => {
    if (useSubject) {
      if (!examData.subjectId) return [];
      return banks.filter((bank: any) => bank.subject?.id === examData.subjectId);
    }
    if (useModelTest) {
      if (!examData.modelTestId) return [];
      return banks.filter((bank: any) => bank.modelTest?.id === examData.modelTestId);
    }
    return [];
  }, [banks, useSubject, useModelTest, examData.subjectId, examData.modelTestId]);

  const handleCreate = async () => {
    if (!examData.title) return toast.error('Exam Title is required');
    if (!useSubject && !useModelTest) return toast.error('Select a Subject or Model Test source');
    if (useSubject && !examData.subjectId) return toast.error('Select a Subject');
    if (useModelTest && !examData.modelTestId) return toast.error('Select a Model Test');
    if (!examData.bankId) return toast.error('Select a Question Bank');
    if (!examData.isFree && Number(examData.priceTaka || 0) <= 0) return toast.error('Enter a valid price');

    setIsLoading(true);
    try {
      await axiosInstance.post('/exams', {
        title: examData.title,
        description: examData.description || undefined,
        passMark: examData.passMark,
        durationMinutes: Number(examData.duration || 20),
        isFree: examData.isFree,
        price: examData.isFree ? 0 : Math.max(0, Math.round(Number(examData.priceTaka || 0) * 100)),
        questionBankId: String(examData.bankId),
        subjectId: useSubject ? examData.subjectId : undefined,
        modelTestId: useModelTest ? examData.modelTestId : undefined,
      });
      toast.success('Exam created successfully');
      router.push('/teacher/exams');
    } catch (error) {
      toast.error('Failed to create exam');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-full mx-auto space-y-8 relative px-4 pb-20"
      >
        {/* Background Decorative Glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black px-3 py-1 rounded-lg uppercase tracking-widest text-[9px]">
                Orchestration Suite
              </Badge>
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-black tracking-tight text-text-primary leading-tight">
              Create <span className="text-primary">Exam</span> 🚀
            </h1>
          </div>
          <div className="flex bg-bg-card/40 backdrop-blur-xl border border-border/50 p-1.5 rounded-[18px] shadow-inner w-fit">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-500",
                  step === s ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110" : step > s ? "bg-success/20 text-success" : "bg-bg-surface text-text-secondary"
                )}>
                  {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
                </div>
                {s < 3 && <div className="w-8 h-0.5 bg-border/30 mx-1" />}
              </div>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 relative z-10">
              <Card className="border-border/50 bg-bg-card/40 backdrop-blur-xl rounded-[28px] overflow-hidden border-2 shadow-2xl">
                <CardHeader className="p-6 pb-2 border-b border-border/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-display font-black text-text-primary">Identity & Branding</CardTitle>
                      <p className="text-[9px] font-black uppercase tracking-widest text-text-secondary opacity-60">Define your assessment metadata</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                   <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Exam Title</Label>
                     <div className="relative group">
                       <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors" />
                       <input
                        className="w-full bg-bg-surface/50 border border-border/40 rounded-[14px] h-12 pl-12 pr-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-text-primary"
                        placeholder="e.g. BCS Preliminary Master Class"
                        value={examData.title}
                        onChange={(e) => setExamData({ ...examData, title: e.target.value })}
                      />
                     </div>
                   </div>
                   <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Brief Description</Label>
                     <textarea
                      className="w-full bg-bg-surface/50 border border-border/40 rounded-[20px] p-5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-text-primary min-h-[100px] resize-none"
                      placeholder="Highlight key learning outcomes or instructions..."
                      value={examData.description}
                      onChange={(e) => setExamData({ ...examData, description: e.target.value })}
                    />
                   </div>
                </CardContent>
                <CardFooter className="p-6 bg-bg-surface/30 flex justify-end border-t border-border/10">
                   <Button onClick={() => setStep(2)} className="rounded-xl h-11 px-8 bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 transition-all hover:-translate-y-1">
                     Continue Config <ChevronRight className="w-4 h-4 ml-2" />
                   </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 relative z-10">
              <Card className="border-border/50 bg-bg-card/40 backdrop-blur-xl rounded-[28px] overflow-hidden border-2 shadow-2xl">
                <CardHeader className="p-6 pb-2 border-b border-border/20">
                   <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-accent/10 text-accent">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-display font-black text-text-primary">Source Architecture</CardTitle>
                      <p className="text-[9px] font-black uppercase tracking-widest text-text-secondary opacity-60">Map your question repositories</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => { setUseSubject(true); setUseModelTest(false); }}
                        className={cn(
                          "p-4 rounded-[20px] border-2 flex flex-col items-center gap-2 transition-all duration-300",
                          useSubject ? "bg-primary/5 border-primary shadow-lg shadow-primary/5" : "bg-bg-surface/50 border-border/40 grayscale opacity-40 hover:grayscale-0 hover:opacity-100"
                        )}
                      >
                         <div className={cn("p-2 rounded-xl", useSubject ? "bg-primary text-white" : "bg-border/20 text-text-secondary")}>
                            <BookOpen className="w-4 h-4" />
                         </div>
                         <span className="text-[10px] font-black uppercase tracking-widest">Academic Subject</span>
                      </button>
                      <button 
                        onClick={() => { setUseSubject(false); setUseModelTest(true); }}
                        className={cn(
                          "p-4 rounded-[20px] border-2 flex flex-col items-center gap-2 transition-all duration-300",
                          useModelTest ? "bg-accent/5 border-accent shadow-lg shadow-accent/5" : "bg-bg-surface/50 border-border/40 grayscale opacity-40 hover:grayscale-0 hover:opacity-100"
                        )}
                      >
                         <div className={cn("p-2 rounded-xl", useModelTest ? "bg-accent text-white" : "bg-border/20 text-text-secondary")}>
                            <Layers className="w-4 h-4" />
                         </div>
                         <span className="text-[10px] font-black uppercase tracking-widest">Model Test</span>
                      </button>
                   </div>

                   <AnimatePresence mode="wait">
                      {(useSubject || useModelTest) && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                           <div className="space-y-2">
                             <Label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Select {useSubject ? 'Subject' : 'Model Test'}</Label>
                             <select
                              className="w-full bg-bg-surface/50 border border-border/40 rounded-[14px] h-11 px-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none"
                              value={useSubject ? examData.subjectId : examData.modelTestId}
                              onChange={(e) => setExamData({ ...examData, subjectId: useSubject ? e.target.value : '', modelTestId: useModelTest ? e.target.value : '', bankId: '' })}
                            >
                              <option value="">Choose {useSubject ? 'Subject' : 'Model Test'}...</option>
                              {(useSubject ? subjects : modelTests).map((item: any) => (
                                <option key={item.id} value={item.id}>{item.name}</option>
                              ))}
                            </select>
                           </div>

                           <div className="space-y-2">
                             <Label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Target Question Bank</Label>
                             <select
                              className="w-full bg-bg-surface/50 border border-border/40 rounded-[14px] h-11 px-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none"
                              value={examData.bankId}
                              onChange={(e) => setExamData({ ...examData, bankId: e.target.value })}
                              disabled={scopedBanks.length === 0}
                            >
                              <option value="">{scopedBanks.length === 0 ? 'No banks found' : 'Choose Repository...'}</option>
                              {scopedBanks.map((bank: any) => (
                                <option key={bank.id} value={bank.id}>{bank.name}</option>
                              ))}
                            </select>
                           </div>
                        </motion.div>
                      )}
                   </AnimatePresence>
                </CardContent>
                <CardFooter className="p-6 bg-bg-surface/30 flex justify-between border-t border-border/10">
                   <Button onClick={() => setStep(1)} variant="ghost" className="rounded-xl h-11 px-6 font-black uppercase tracking-widest text-[9px] hover:bg-white">
                     <ChevronLeft className="w-4 h-4 mr-2" /> Identity
                   </Button>
                   <Button onClick={() => setStep(3)} className="rounded-xl h-11 px-8 bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 transition-all hover:-translate-y-1">
                     Parameters <ChevronRight className="w-4 h-4 ml-2" />
                   </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 relative z-10">
              <Card className="border-border/50 bg-bg-card/40 backdrop-blur-xl rounded-[28px] overflow-hidden border-2 shadow-2xl">
                <CardHeader className="p-6 pb-2 border-b border-border/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-success/10 text-success">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-display font-black text-text-primary">Rule Configuration</CardTitle>
                      <p className="text-[9px] font-black uppercase tracking-widest text-text-secondary opacity-60">Set pass marks & access tiers</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Time (Mins)</Label>
                        <div className="relative group">
                          <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors" />
                          <input
                            type="number"
                            className="w-full bg-bg-surface/50 border border-border/40 rounded-[14px] h-11 pl-11 pr-4 text-xs font-bold"
                            value={examData.duration}
                            onChange={(e) => setExamData({ ...examData, duration: Number(e.target.value) })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Pass Mark (%)</Label>
                        <div className="relative group">
                          <Trophy className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors" />
                          <input
                            type="number"
                            className="w-full bg-bg-surface/50 border border-border/40 rounded-[14px] h-11 pl-11 pr-4 text-xs font-bold"
                            value={examData.passMark}
                            onChange={(e) => setExamData({ ...examData, passMark: Number(e.target.value) })}
                          />
                        </div>
                      </div>
                   </div>

                   <div className="p-5 rounded-[22px] border border-border/40 bg-white/40 space-y-5">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-xl transition-all", examData.isFree ? "bg-success/10 text-success" : "bg-accent/10 text-accent")}>
                               {examData.isFree ? <CheckCircle2 className="w-4 h-4" /> : <BadgeCent className="w-4 h-4" />}
                            </div>
                            <div>
                               <p className="text-[10px] font-black uppercase tracking-widest text-text-primary">Access Control</p>
                               <p className="text-[9px] font-medium text-text-secondary">{examData.isFree ? 'Public free access enabled' : 'Monetization active'}</p>
                            </div>
                         </div>
                         <div className="flex bg-bg-surface p-1 rounded-xl border border-border/40">
                            <button onClick={() => setExamData({ ...examData, isFree: true })} className={cn("px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all", examData.isFree ? "bg-success text-white shadow-md" : "text-text-secondary")}>Free</button>
                            <button onClick={() => setExamData({ ...examData, isFree: false })} className={cn("px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all", !examData.isFree ? "bg-accent text-white shadow-md" : "text-text-secondary")}>Paid</button>
                         </div>
                      </div>

                      <AnimatePresence>
                         {!examData.isFree && (
                           <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2 pt-2 border-t border-border/10">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Price Listing (৳)</Label>
                              <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-accent group-focus-within:text-accent">৳</span>
                                <input
                                  type="number"
                                  className="w-full bg-bg-surface border-2 border-accent/20 rounded-[14px] h-11 pl-10 pr-4 text-sm font-black text-accent focus:ring-4 focus:ring-accent/10"
                                  placeholder="0.00"
                                  value={examData.priceTaka}
                                  onChange={(e) => setExamData({ ...examData, priceTaka: Number(e.target.value) })}
                                />
                              </div>
                           </motion.div>
                         )}
                      </AnimatePresence>
                   </div>
                </CardContent>
                <CardFooter className="p-6 bg-bg-surface/30 flex justify-between border-t border-border/10">
                   <Button onClick={() => setStep(2)} variant="ghost" className="rounded-xl h-11 px-6 font-black uppercase tracking-widest text-[9px] hover:bg-white">
                     <ChevronLeft className="w-4 h-4 mr-2" /> Architecture
                   </Button>
                   <Button 
                    onClick={handleCreate} 
                    disabled={isLoading}
                    className="rounded-xl h-11 px-10 bg-success text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-success/20 transition-all hover:-translate-y-1"
                   >
                     {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Rocket className="w-4 h-4 mr-2" />}
                     Launch Assessment
                   </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </DashboardLayout>
  );
}
