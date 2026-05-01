'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle2, Clock, AlertTriangle, Loader2 } from 'lucide-react';
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

    // Last 10 seconds countdown beep
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
      <div className="min-h-screen bg-bg-dark text-text-primary flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (isSessionError || !session || questions.length === 0) {
    return (
      <div className="min-h-screen bg-bg-dark text-text-primary flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <p className="text-danger font-bold">Exam session load করা যায়নি।</p>
          <Button onClick={() => router.push('/student/exams')} variant="outline">
            Back to Exams
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-dark text-text-primary flex flex-col font-sans">
      <header className="border-b border-border bg-bg-card/80 backdrop-blur-md sticky top-0 z-50 px-3 py-2 md:px-6 md:py-3">
        <div className="flex items-center justify-between gap-2 md:gap-4">
          <div className="min-w-0 flex items-center gap-2 md:gap-3">
            <h1 className="font-display font-semibold text-xs md:text-base truncate max-w-[38vw] sm:max-w-none">
              {session.examTitle}
            </h1>
            <div className="bg-bg-surface px-2 py-0.5 rounded-full text-[10px] md:text-xs font-medium border border-border">
            Total Questions: {questions.length}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={cn(
                'flex items-center gap-1.5 px-2 py-1 md:px-3 md:py-1.5 rounded-full border transition-all',
                timeLeft < 300
                  ? 'border-danger/50 bg-danger/10 text-danger animate-pulse'
                  : 'border-border bg-bg-surface text-text-primary'
              )}
            >
              <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="font-display font-semibold text-xs md:text-base">{formatTime(timeLeft)}</span>
            </div>

            <Button
              variant="outline"
              className="border-danger/50 text-danger hover:bg-danger/10 h-8 px-2.5 text-xs md:h-9 md:px-4 md:text-sm"
              onClick={() => setIsSubmitModalOpen(true)}
            >
              Submit
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-3 md:p-8 lg:p-10">
        <div className="grid grid-cols-1 md:grid-cols-[84px_1fr] gap-2 md:gap-3 items-start">
          <aside className="md:sticky md:top-[76px] rounded-xl md:rounded-2xl border border-border bg-bg-card/70 p-2 md:p-3">
            <div className="flex md:flex-col flex-wrap md:flex-nowrap gap-1.5 max-h-[210px] md:max-h-[420px] overflow-y-auto pr-0.5">
              {questions.map((question, index) => {
                const isAnswered = !!answers[question.id];
                return (
                  <button
                    key={question.id}
                    onClick={() => jumpToQuestion(question.id)}
                    className={cn(
                      'h-7 w-7 md:h-9 md:w-9 rounded-md md:rounded-lg text-[10px] md:text-xs font-semibold md:font-bold border transition-all shrink-0',
                      isAnswered
                        ? 'border-accent/60 bg-accent/10 text-accent hover:bg-accent/20'
                        : 'border-border bg-bg-surface text-text-secondary hover:border-primary/50 hover:text-primary'
                    )}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="w-full space-y-3 md:space-y-4">
            <section className="rounded-xl md:rounded-2xl border border-border bg-gradient-to-r from-primary/10 via-bg-card to-accent/10 p-3 md:p-5">
              <div className="flex items-center justify-between gap-3 mb-2 md:mb-3">
                <p className="text-xs md:text-sm text-text-secondary">Progress</p>
                <p className="text-xs md:text-sm font-semibold text-primary">{progressPercentage}% Complete</p>
              </div>
              <div className="h-1.5 md:h-2.5 w-full rounded-full bg-bg-surface overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="mt-2 md:mt-3 text-[11px] md:text-sm text-text-secondary">
                Answered <span className="font-semibold text-accent">{answeredCount}</span> of {questions.length} questions
              </div>
            </section>

          {questions.map((question, questionIdx) => (
            <section
              key={question.id}
              id={`question-${question.id}`}
              className={cn(
                'w-full space-y-3 rounded-lg md:rounded-xl border bg-bg-card/45 p-2.5 md:p-4',
                answers[question.id] ? 'border-accent/30' : 'border-border'
              )}
            >
              <div className="flex items-start text-left gap-2.5 md:gap-3">
                <div
                  className={cn(
                    'w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-white text-xs md:text-sm font-display font-semibold shrink-0',
                    'bg-primary'
                  )}
                >
                  {questionIdx + 1}
                </div>
                <h2 className="text-[13px] md:text-base font-display font-semibold leading-snug w-full pt-0.5">
                  {question.text}
                </h2>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {question.options.map((option, idx) => {
                  const label = String.fromCharCode(65 + idx);
                  const isSelected = answers[question.id] === option.id;

                  return (
                    <button
                      key={option.id}
                      onClick={() => handleOptionSelect(question.id, option.id)}
                      className={cn(
                        'flex items-center gap-2 p-2 md:p-3 rounded-lg border text-left transition-all group min-h-10 md:min-h-12',
                        isSelected
                          ? 'border-primary bg-primary text-white'
                          : 'border-border bg-bg-surface hover:border-primary/50 text-text-primary'
                      )}
                    >
                      <div
                        className={cn(
                          'w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center text-[10px] md:text-xs font-semibold shrink-0 transition-colors',
                          isSelected
                            ? 'bg-white text-primary'
                            : 'bg-bg-card text-text-secondary group-hover:text-primary'
                        )}
                      >
                        {isSelected ? <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4" /> : label}
                      </div>
                      <span className="text-[11px] md:text-sm font-medium leading-snug">{option.text}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-border bg-bg-card/85 backdrop-blur-md sticky bottom-0 z-40 p-3 md:p-5 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="w-full flex items-center justify-between gap-3 md:gap-4 flex-wrap">
          <div className="text-xs md:text-sm text-text-secondary">
            Answered <span className="font-bold text-accent">{answeredCount}</span> / {questions.length} • Unanswered{' '}
            <span className="font-bold text-danger">{questions.length - answeredCount}</span>
          </div>

          <Button
            onClick={() => setIsSubmitModalOpen(true)}
            className="font-semibold w-full sm:w-auto px-4 md:px-8 h-9 md:h-12 rounded-lg md:rounded-xl transition-all bg-success hover:bg-success-dark text-white text-sm md:text-base"
          >
            Submit Exam
          </Button>
        </div>
      </footer>

      <Dialog open={isSubmitModalOpen} onOpenChange={setIsSubmitModalOpen}>
        <DialogContent className="bg-bg-card border-border max-w-[92vw] sm:max-w-[425px] p-4 md:p-6">
          <DialogHeader className="items-center text-center">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-warning/10 flex items-center justify-center text-warning mb-3 md:mb-4">
              <AlertTriangle className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <DialogTitle className="text-lg md:text-2xl font-display font-bold">সত্যিই submit করতে চাও?</DialogTitle>
            <DialogDescription className="text-text-secondary pt-1.5 md:pt-2">
              <div className="flex justify-center gap-5 md:gap-6 text-xs md:text-sm">
                <div className="flex flex-col items-center">
                  <span className="text-accent font-bold text-base md:text-lg">{answeredCount}</span>
                  <span>Answered</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-text-secondary font-bold text-base md:text-lg">
                    {questions.length - answeredCount}
                  </span>
                  <span>Unanswered</span>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center gap-2 md:gap-4 pt-4 md:pt-6">
            <Button
              variant="ghost"
              onClick={() => setIsSubmitModalOpen(false)}
              className="w-full sm:w-auto px-5 md:px-8 border border-border h-9 md:h-10 text-xs md:text-sm"
            >
              না, ফিরে যাই
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
              className="bg-primary hover:bg-primary-light text-white font-bold w-full sm:w-auto px-6 md:px-10 h-9 md:h-10 text-xs md:text-sm"
            >
              {submitMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              হ্যাঁ, Submit করি
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
