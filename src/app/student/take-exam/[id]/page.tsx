'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function TakeExamPage() {
  const params = useParams();
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes in seconds
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock Questions
  const questions = [
    { id: 1, text: "What is the capital of Bangladesh?", options: ["Dhaka", "Chittagong", "Sylhet", "Rajshahi"] },
    { id: 2, text: "Which language is primarily spoken in Bangladesh?", options: ["Hindi", "English", "Bengali", "Urdu"] },
    { id: 3, text: "When did Bangladesh gain independence?", options: ["1947", "1952", "1971", "1990"] },
    { id: 4, text: "What is the national fruit of Bangladesh?", options: ["Mango", "Jackfruit", "Banana", "Lychee"] },
    { id: 5, text: "Which river is known as the longest in Bangladesh?", options: ["Padma", "Meghna", "Jamuna", "Surma"] },
  ];

  const currentQuestion = questions[currentQuestionIndex];

  // Timer logic
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (option: string) => {
    setAnswers({ ...answers, [currentQuestionIndex]: option });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Simulation
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Exam submitted successfully!');
      router.push(`/student/result/${params.id}`);
    } catch (error) {
      toast.error('Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
      setIsSubmitModalOpen(false);
    }
  };

  const answeredCount = Object.keys(answers).length;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <div className="min-h-screen bg-bg-dark text-text-primary flex flex-col font-sans">
      {/* Top Bar (Fixed) */}
      <header className="h-16 border-b border-border bg-bg-card/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <h1 className="font-display font-bold text-lg hidden md:block">BCS Preliminary Prep</h1>
          <div className="bg-bg-surface px-3 py-1 rounded-full text-xs font-medium border border-border">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
        </div>

        <div className={cn(
          "flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all",
          timeLeft < 300 ? "border-danger/50 bg-danger/10 text-danger animate-pulse" : "border-border bg-bg-surface text-text-primary"
        )}>
          <Clock className="w-4 h-4" />
          <span className="font-display font-bold text-lg">{formatTime(timeLeft)}</span>
        </div>

        <Button 
          variant="outline" 
          className="border-danger/50 text-danger hover:bg-danger/10 h-9 px-4"
          onClick={() => setIsSubmitModalOpen(true)}
        >
          Submit
        </Button>
      </header>

      {/* Main Question Display */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-6 md:p-12 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full space-y-12"
          >
            <div className="flex flex-col items-center text-center gap-8">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-display font-bold shadow-[0_0_20px_rgba(0,82,204,0.3)]">
                {currentQuestionIndex + 1}
              </div>
              <h2 className="text-2xl md:text-3xl font-display font-bold leading-tight max-w-3xl">
                {currentQuestion.text}
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {currentQuestion.options.map((option, idx) => {
                const label = String.fromCharCode(65 + idx);
                const isSelected = answers[currentQuestionIndex] === option;
                
                return (
                  <button
                    key={option}
                    onClick={() => handleOptionSelect(option)}
                    className={cn(
                      "flex items-center gap-4 p-6 rounded-[24px] border-2 text-left transition-all group",
                      isSelected 
                        ? "border-primary bg-primary shadow-[0_10px_20px_rgba(0,82,204,0.2)] text-white" 
                        : "border-border bg-bg-surface hover:border-primary/50 text-text-primary"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 transition-colors",
                      isSelected ? "bg-white text-primary" : "bg-bg-card text-text-secondary group-hover:text-primary"
                    )}>
                      {isSelected ? <CheckCircle2 className="w-6 h-6" /> : label}
                    </div>
                    <span className="text-lg font-medium">{option}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <footer className="border-t border-border bg-bg-card p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-6">
          <Button
            variant="ghost"
            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
            className="text-text-secondary hover:text-text-primary"
          >
            <ChevronLeft className="mr-2 w-5 h-5" /> Previous
          </Button>

          {/* Question Grid */}
          <div className="hidden md:flex gap-2">
            {questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={cn(
                  "w-10 h-10 rounded-lg font-bold text-xs transition-all border",
                  currentQuestionIndex === idx ? "border-primary ring-2 ring-primary/20 bg-primary/10 text-primary" : 
                  answers[idx] ? "border-accent bg-accent/10 text-accent" : "border-border bg-bg-surface text-text-secondary"
                )}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <Button
            onClick={() => {
              if (isLastQuestion) {
                setIsSubmitModalOpen(true);
              } else {
                setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1));
              }
            }}
            className={cn(
              "font-bold px-8 h-12 rounded-xl transition-all",
              isLastQuestion ? "bg-success hover:bg-success-dark text-white" : "bg-primary hover:bg-primary-light text-white"
            )}
          >
            {isLastQuestion ? 'Submit Exam' : 'Next Question'} <ChevronRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </footer>

      {/* Submit Confirmation Modal */}
      <Dialog open={isSubmitModalOpen} onOpenChange={setIsSubmitModalOpen}>
        <DialogContent className="bg-bg-card border-border sm:max-w-[425px]">
          <DialogHeader className="items-center text-center">
            <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center text-warning mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <DialogTitle className="text-2xl font-display font-bold">সত্যিই submit করতে চাও?</DialogTitle>
            <DialogDescription className="text-text-secondary pt-2">
              <div className="flex justify-center gap-6 text-sm">
                <div className="flex flex-col items-center">
                  <span className="text-accent font-bold text-lg">{answeredCount}</span>
                  <span>Answered</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-text-secondary font-bold text-lg">{questions.length - answeredCount}</span>
                  <span>Unanswered</span>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center gap-4 pt-6">
            <Button variant="ghost" onClick={() => setIsSubmitModalOpen(false)} className="px-8 border border-border">না, ফিরে যাই</Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary-light text-white font-bold px-10"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              হ্যাঁ, Submit করি
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
