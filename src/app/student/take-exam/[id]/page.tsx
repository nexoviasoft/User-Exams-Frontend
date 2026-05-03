'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle2, Clock, AlertTriangle, Loader2, ShieldCheck, Zap, ChevronRight, LayoutGrid, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useMutation, useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

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
      type: "spring" as const,
      stiffness: 100,
      damping: 15
    }
  }
};

type SessionQuestion = {
  id: string;
  text: string;
  options: Array<{ id: string; text: string }>;
};

type ExamSession = {
  studentExamId: string;
  examId: string;
  examTitle: string;
  startedAt: string;
  totalQuestions: number;
  durationMinutes?: number;
  durationSeconds?: number;
  questions: SessionQuestion[];
};

export default function TakeExamPage() {
  const IDLE_LIMIT_MS = 60 * 1000;
  const params = useParams();
  const router = useRouter();
  const studentExamId = params.id as string;
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(20 * 60);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [lastInteractionAt, setLastInteractionAt] = useState(() => Date.now());
  const [isIdleAutoSubmitting, setIsIdleAutoSubmitting] = useState(false);
  const lastBeepedSecondRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const {
    data: session,
    isLoading: isSessionLoading,
    isError: isSessionError,
  } = useQuery({
    queryKey: ['student-exam-session', studentExamId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/student-exams/session/${studentExamId}`);
      return response.data as ExamSession;
    },
    enabled: !!studentExamId,
  });

  const questions = session?.questions || [];
  const examDurationSeconds = Number(session?.durationSeconds || 20 * 60);
  const answeredCount = Object.keys(answers).length;
  const progressPercentage =
    questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  const submitMutation = useMutation({
    mutationFn: async (forceSubmit: boolean) => {
      if (!session) throw new Error('Exam session not loaded');
      const answerItems = session.questions
        .map((q) => ({
          questionId: String(q.id),
          selectedOptionId: answers[q.id],
        }))
        .filter((a) => !!a.selectedOptionId);

      if (!forceSubmit && !hasTimedOut && answerItems.length !== session.questions.length) {
        throw new Error('সব প্রশ্নের উত্তর দিন');
      }

      const elapsed = Math.max(1, examDurationSeconds - Math.max(0, timeLeft));
      const response = await axiosInstance.post('/student-exams/submit', {
        studentExamId: session.studentExamId,
        timeTakenSeconds: elapsed,
        answers: answerItems,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Exam submitted successfully!');
      router.push(`/student/result/${studentExamId}`);
    },
    onError: (error: any) => {
      const msg =
        error?.message ||
        error?.response?.data?.message ||
        'Submission failed. Please try again.';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    },
    onSettled: () => {
      setIsSubmitModalOpen(false);
    },
  });

  useEffect(() => {
    if (!session) return;
    setTimeLeft(examDurationSeconds);
    setHasTimedOut(false);
  }, [session?.studentExamId, examDurationSeconds]);

  useEffect(() => {
    if (!session) return;
    if (timeLeft <= 0) {
      if (!hasTimedOut) {
        playBeep(520, 260, 'triangle');
        setHasTimedOut(true);
        setIsSubmitModalOpen(false);
        toast.error('সময় শেষ। Exam auto submit হচ্ছে...');
        submitMutation.mutate(true);
      }
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, session, hasTimedOut, submitMutation]);

  useEffect(() => {
    if (!session || hasTimedOut) return;

    if (timeLeft > 0 && timeLeft <= 10 && lastBeepedSecondRef.current !== timeLeft) {
      lastBeepedSecondRef.current = timeLeft;
      playBeep(940, 90, 'square');
    }

    if (timeLeft > 10) {
      lastBeepedSecondRef.current = null;
    }
  }, [timeLeft, session, hasTimedOut]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const playBeep = (frequency = 880, durationMs = 120, type: OscillatorType = 'sine') => {
    if (typeof window === 'undefined') return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContextClass();
      }
      const audioContext = audioContextRef.current;
      if (!audioContext) return;
      if (audioContext.state === 'suspended') {
        audioContext.resume().catch(() => undefined);
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = type;
      oscillator.frequency.value = frequency;
      gainNode.gain.value = 0.03;
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + durationMs / 1000);
    } catch {
      // ignore sound failure silently
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const unlockAudio = () => {
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContextClass();
        }
        if (audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume().catch(() => undefined);
        }
      } catch {
        // ignore unlock failures
      }
    };

    window.addEventListener('pointerdown', unlockAudio, { passive: true });
    window.addEventListener('keydown', unlockAudio);
    window.addEventListener('touchstart', unlockAudio, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => undefined);
        audioContextRef.current = null;
      }
    };
  }, []);

  const handleOptionSelect = (questionId: string, optionId: string) => {
    setLastInteractionAt(Date.now());
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = () => {
    submitMutation.mutate(hasTimedOut);
  };

  const jumpToQuestion = (questionId: string) => {
    setLastInteractionAt(Date.now());
    const questionElement = document.getElementById(`question-${questionId}`);
    if (!questionElement) return;
    questionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    if (!session || hasTimedOut || isIdleAutoSubmitting || submitMutation.isPending) return;

    const idleWatcher = setInterval(() => {
      const isIdle = Date.now() - lastInteractionAt >= IDLE_LIMIT_MS;
      if (!isIdle) return;

      setIsIdleAutoSubmitting(true);
      setHasTimedOut(true);
      setIsSubmitModalOpen(false);
      toast.error('১ মিনিট কোনো interaction না থাকায় exam auto submit করা হচ্ছে।');
      submitMutation.mutate(true);
    }, 1000);

    return () => clearInterval(idleWatcher);
  }, [
    session,
    hasTimedOut,
    isIdleAutoSubmitting,
    lastInteractionAt,
    submitMutation,
    IDLE_LIMIT_MS,
  ]);

  useEffect(() => {
    if (!session || hasTimedOut || submitMutation.isPending) return;

    const handleTabSwitch = () => {
      if (document.visibilityState !== 'hidden') return;
      if (hasTimedOut || submitMutation.isPending) return;

      setHasTimedOut(true);
      setIsSubmitModalOpen(false);
      toast.error('Tab switch detect হয়েছে। Exam auto submit করা হচ্ছে।');
      submitMutation.mutate(true);
    };

    document.addEventListener('visibilitychange', handleTabSwitch);
    return () => {
      document.removeEventListener('visibilitychange', handleTabSwitch);
    };
  }, [session, hasTimedOut, submitMutation]);

  if (isSessionLoading) {
    return (
      <div className="min-h-screen bg-bg-dark text-text-primary flex flex-col items-center justify-center p-6 space-y-6">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap className="w-6 h-6 text-primary animate-pulse" />
          </div>
        </div>
        <p className="text-text-secondary font-black animate-pulse uppercase tracking-[0.2em] text-[10px]">Loading Exam Environment...</p>
      </div>
    );
  }

  if (isSessionError || !session || questions.length === 0) {
    return (
      <div className="min-h-screen bg-bg-dark text-text-primary flex items-center justify-center p-6">
        <div className="text-center space-y-6 p-10 rounded-[32px] bg-bg-card/40 border border-border/50 backdrop-blur-xl max-w-md">
          <div className="w-20 h-20 bg-danger/10 rounded-3xl flex items-center justify-center mx-auto text-danger">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-text-primary uppercase tracking-tight">Access Error</h3>
            <p className="text-text-secondary font-medium leading-relaxed">Exam session load করা যায়নি। দয়া করে ড্যাশবোর্ড থেকে আবার চেষ্টা করুন।</p>
          </div>
          <Button onClick={() => router.push('/student/exams')} className="w-full bg-primary h-14 rounded-2xl font-black">
            Back to Exams
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-dark text-text-primary flex flex-col font-sans selection:bg-primary/30 relative">
      {/* Background Decorative Elements */}
      <div className="fixed -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 -left-24 w-72 h-72 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Modern Slim Header */}
      <header className="border-b border-border/40 bg-bg-card/30 backdrop-blur-2xl sticky top-0 z-50 px-4 py-2 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 h-14 md:h-16">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
               <Zap className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="font-display font-black text-sm md:text-lg truncate text-text-primary leading-tight">
                {session.examTitle}
              </h1>
              <div className="flex items-center gap-3 mt-0.5">
                <Badge variant="outline" className="bg-success/5 border-success/20 text-success text-[8px] px-1.5 h-4 font-black flex items-center gap-1">
                  <ShieldCheck className="w-2.5 h-2.5" /> SECURE MODE
                </Badge>
                <span className="text-[9px] font-black text-text-secondary uppercase tracking-[0.15em] opacity-60 hidden sm:block">
                  Q: {answeredCount}/{questions.length}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl border transition-all shadow-lg backdrop-blur-md',
                timeLeft < 300
                  ? 'border-danger/40 bg-danger/10 text-danger animate-pulse'
                  : 'border-border/60 bg-bg-surface/40 text-text-primary'
              )}
            >
              <Timer className={cn("w-4 h-4", timeLeft < 300 ? "animate-spin-slow" : "text-primary")} />
              <span className="font-display font-black text-base md:text-lg tabular-nums tracking-tighter">{formatTime(timeLeft)}</span>
            </div>

            <Button
              className="bg-primary hover:bg-primary-light text-white h-10 px-6 rounded-xl font-black shadow-xl shadow-primary/20 transition-all active:scale-95 text-xs uppercase tracking-widest"
              onClick={() => setIsSubmitModalOpen(true)}
            >
              Submit
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-[80px_1fr] gap-6 items-start">
          {/* Compact Sidebar Navigation */}
          <aside className="hidden lg:block sticky top-24">
            <div className="p-3 rounded-2xl border border-border/30 bg-bg-card/40 backdrop-blur-xl">
              <div className="grid grid-cols-1 gap-2">
                {questions.map((question, index) => {
                  const isAnswered = !!answers[question.id];
                  return (
                    <button
                      key={question.id}
                      onClick={() => jumpToQuestion(question.id)}
                      title={`Question ${index + 1}`}
                      className={cn(
                        'w-10 h-10 rounded-xl text-[10px] font-black transition-all border relative group overflow-hidden',
                        isAnswered
                          ? 'border-primary bg-primary/10 text-primary hover:bg-primary/20'
                          : 'border-border/40 bg-bg-surface/30 text-text-secondary hover:border-primary/40'
                      )}
                    >
                      {index + 1}
                      {isAnswered && (
                        <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-primary rounded-bl-sm" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          <div className="w-full space-y-6 relative z-10">
            {/* Slim Progress Tracker */}
            <motion.section 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-border/40 bg-bg-card/40 backdrop-blur-xl p-5 md:p-6 relative overflow-hidden group"
            >
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-accent/10 text-accent">
                    <LayoutGrid className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-text-primary uppercase tracking-tight leading-none">Answer Progress</h3>
                    <p className="text-[10px] text-text-secondary font-bold mt-1 opacity-60">Review before final submission</p>
                  </div>
                </div>
                <div className="text-right flex items-baseline gap-1">
                  <span className="text-2xl font-display font-black text-primary leading-none">{progressPercentage}</span>
                  <span className="text-[10px] font-black text-text-secondary opacity-40 uppercase tracking-widest">%</span>
                </div>
              </div>
              <div className="h-2 w-full rounded-full bg-bg-surface/50 border border-border/30 overflow-hidden p-0.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1, ease: "circOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-primary via-primary-light to-accent shadow-[0_0_10px_rgba(0,82,204,0.3)]"
                />
              </div>
            </motion.section>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              {questions.map((question, questionIdx) => (
                <motion.section
                  key={question.id}
                  variants={itemVariants}
                  id={`question-${question.id}`}
                  className={cn(
                    'w-full space-y-4 rounded-[32px] border bg-bg-card/30 backdrop-blur-xl p-5 md:p-6 transition-all duration-500 hover:border-primary/20',
                    answers[question.id] ? 'border-primary/30 bg-bg-card/50 shadow-lg shadow-primary/[0.03]' : 'border-border/40'
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-black text-sm text-white shadow-xl transition-transform group-hover:scale-105",
                      answers[question.id] ? "bg-primary shadow-primary/30" : "bg-bg-surface border border-border/50 text-text-secondary"
                    )}>
                      {questionIdx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest opacity-40 rounded-md mb-2 h-4 px-1.5">Question {questionIdx + 1}</Badge>
                      <h2 className="text-base md:text-xl font-black text-text-primary leading-[1.3] group-hover:text-primary transition-colors">
                        {question.text}
                      </h2>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {question.options.map((option, idx) => {
                      const label = String.fromCharCode(65 + idx);
                      const isSelected = answers[question.id] === option.id;

                      return (
                        <button
                          key={option.id}
                          onClick={() => handleOptionSelect(question.id, option.id)}
                          className={cn(
                            'flex items-center gap-4 p-4 rounded-2xl border transition-all group relative overflow-hidden group/opt',
                            isSelected
                              ? 'border-primary/50 bg-primary/5 shadow-inner'
                              : 'border-border/40 bg-bg-surface/20 hover:border-primary/30 hover:bg-bg-surface/40'
                          )}
                        >
                          <div className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0 transition-all border',
                            isSelected
                              ? 'bg-primary border-primary text-white scale-105 shadow-lg shadow-primary/20'
                              : 'bg-bg-card border-border/40 text-text-secondary group-hover/opt:border-primary/40 group-hover/opt:text-primary'
                          )}>
                            {isSelected ? <CheckCircle2 className="w-4 h-4" /> : label}
                          </div>
                          <span className={cn(
                            "text-sm md:text-base font-bold transition-colors flex-1",
                            isSelected ? "text-text-primary" : "text-text-secondary group-hover/opt:text-text-primary"
                          )}>
                            {option.text}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </motion.section>
              ))}
            </motion.div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border/40 bg-bg-card/50 backdrop-blur-2xl sticky bottom-0 z-40 p-4 md:p-5 shadow-[0_-10px_30px_rgba(0,0,0,0.2)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
          <div className="hidden sm:flex items-center gap-6">
            <div className="space-y-0.5">
              <p className="text-[9px] font-black uppercase tracking-widest text-text-secondary opacity-60">Answered</p>
              <p className="text-lg font-black text-primary leading-none">{answeredCount} <span className="text-[10px] text-text-secondary opacity-40">/ {questions.length}</span></p>
            </div>
            <div className="w-px h-6 bg-border/40" />
            <div className="space-y-0.5">
              <p className="text-[9px] font-black uppercase tracking-widest text-text-secondary opacity-60">Remaining</p>
              <p className="text-lg font-black text-danger/80 leading-none">{questions.length - answeredCount}</p>
            </div>
          </div>

          <Button
            onClick={() => setIsSubmitModalOpen(true)}
            className="w-full sm:w-auto px-10 h-12 rounded-xl font-black text-xs uppercase tracking-widest bg-primary hover:bg-primary-light text-white shadow-xl shadow-primary/20 transition-all hover:-translate-y-0.5 active:scale-95"
          >
            Final Submit <ChevronRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </footer>

      <AnimatePresence>
        {isSubmitModalOpen && (
          <Dialog open={isSubmitModalOpen} onOpenChange={setIsSubmitModalOpen}>
            <DialogContent className="bg-bg-card/95 backdrop-blur-2xl border-border/40 max-w-[92vw] sm:max-w-[440px] p-0 overflow-hidden rounded-[40px] shadow-2xl">
              <div className="p-8 space-y-8">
                <div className="flex flex-col items-center text-center space-y-5">
                  <div className="w-16 h-16 rounded-3xl bg-warning/10 flex items-center justify-center text-warning shadow-inner border border-warning/20">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <DialogTitle className="text-2xl font-black text-text-primary tracking-tight">Confirm Submission</DialogTitle>
                    <DialogDescription className="text-text-secondary text-xs font-medium px-4">
                      You still have time left. Would you like to review your answers or submit now?
                    </DialogDescription>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-bg-surface/40 p-5 rounded-[24px] border border-border/40 text-center">
                    <div className="text-2xl font-black text-primary">{answeredCount}</div>
                    <div className="text-[9px] font-black uppercase tracking-widest text-text-secondary mt-1">Answered</div>
                  </div>
                  <div className="bg-bg-surface/40 p-5 rounded-[24px] border border-border/40 text-center">
                    <div className="text-2xl font-black text-danger">{questions.length - answeredCount}</div>
                    <div className="text-[9px] font-black uppercase tracking-widest text-text-secondary mt-1">Skipped</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    variant="ghost"
                    onClick={() => setIsSubmitModalOpen(false)}
                    className="flex-1 h-12 rounded-xl border-2 border-border/40 font-black text-[10px] uppercase tracking-widest text-text-secondary hover:bg-bg-surface"
                  >
                    Review
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={submitMutation.isPending}
                    className="flex-1 bg-primary hover:bg-primary-light text-white font-black h-12 rounded-xl shadow-xl shadow-primary/20 text-[10px] uppercase tracking-widest"
                  >
                    {submitMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Confirm"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}
