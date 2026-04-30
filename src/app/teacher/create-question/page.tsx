'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  PlusCircle, 
  Save, 
  Database, 
  FileText,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useQuery, useMutation } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';

interface QuestionBank {
  id: string;
  name: string;
}

export default function CreateQuestionPage() {
  const [selectedBank, setSelectedBank] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctOption, setCorrectOption] = useState<number | null>(null);
  const [solutionText, setSolutionText] = useState('');
  const [solutionImage, setSolutionImage] = useState('');
  const [sessionCount, setSessionCount] = useState(0);

  // Fetch Question Banks
  const { data: banks = [], isLoading: isLoadingBanks } = useQuery<QuestionBank[]>({
    queryKey: ['questionbanks'],
    queryFn: async () => {
      const response = await axiosInstance.get('/question-banks');
      return response.data;
    },
  });

  // Create Question Mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.post('/questions', data);
      return response.data;
    },
  });

  const handleSaveQuestion = async (isFinal = false) => {
    if (!selectedBank) return toast.error('দয়া করে একটি ব্যাংক সিলেক্ট করুন');
    if (!questionText) return toast.error('প্রশ্নের টেক্সট দিন');
    if (options.some(opt => !opt)) return toast.error('সবগুলো অপশন পূরণ করুন');
    if (correctOption === null) return toast.error('সঠিক উত্তরটি সিলেক্ট করুন');

    try {
      await createMutation.mutateAsync({
        text: questionText,
        questionBankId: selectedBank,
        solutionText: solutionText || undefined,
        solutionImage: solutionImage || undefined,
        options: options.map((opt, idx) => ({
          text: opt,
          isCorrect: idx === correctOption,
        })),
      });
      
      toast.success('Question সফলভাবে সেভ হয়েছে!');
      setSessionCount(prev => prev + 1);
      
      // Clear form for next question
      setQuestionText('');
      setOptions(['', '', '', '']);
      setCorrectOption(null);
      setSolutionText('');
      setSolutionImage('');
      
      if (isFinal) {
        window.location.href = '/teacher/question-banks';
      }
    } catch (error) {
      toast.error('সমস্যা হয়েছে, আবার চেষ্টা করুন।');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">Question তৈরি করুন ➕</h1>
            <p className="text-text-secondary mt-1">ব্যাংকে নতুন প্রশ্ন যোগ করুন।</p>
          </div>
          <div className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold">
             এই session এ {sessionCount} questions যোগ করা হয়েছে
          </div>
        </div>

        {/* Step 1: Select Bank */}
        <Card className="border-border bg-bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" /> ১. Question Bank সিলেক্ট করুন
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingBanks ? (
              <div className="text-text-secondary text-sm">Loading banks...</div>
            ) : banks.length === 0 ? (
              <div className="text-text-secondary text-sm">No banks found. Please create a Question Bank first.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {banks.map((bank) => (
                  <div
                    key={bank.id}
                    onClick={() => setSelectedBank(bank.id)}
                    className={cn(
                      "cursor-pointer p-4 rounded-xl border-2 transition-all flex items-center justify-between",
                      selectedBank === bank.id 
                        ? "border-primary bg-primary/10" 
                        : "border-border bg-bg-surface hover:border-primary/30"
                    )}
                  >
                    <span className="font-bold text-sm">{bank.name}</span>
                    {selectedBank === bank.id && <CheckCircle2 className="w-5 h-5 text-primary" />}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Question Form */}
        <Card className="border-border bg-bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> ২. প্রশ্নের তথ্য দিন
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-3">
              <label className="text-sm font-medium text-text-secondary ml-1">প্রশ্নের টেক্সট</label>
              <textarea
                placeholder="আপনার প্রশ্নটি এখানে লিখুন..."
                className="w-full bg-bg-surface border border-border rounded-[24px] p-6 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[150px] transition-all"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium text-text-secondary ml-1">অপশনগুলো সেট করুন (সঠিক উত্তরটি সিলেক্ট করুন)</label>
              <div className="grid gap-4">
                {options.map((option, idx) => (
                  <div 
                    key={idx}
                    className={cn(
                      "flex items-center gap-4 p-2 rounded-2xl border-2 transition-all",
                      correctOption === idx ? "border-success bg-success/5" : "border-border bg-bg-surface"
                    )}
                  >
                    <div className="w-12 h-12 flex items-center justify-center shrink-0">
                       <button
                         onClick={() => setCorrectOption(idx)}
                         className={cn(
                           "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
                           correctOption === idx ? "bg-success border-success text-white" : "border-border hover:border-success/50"
                         )}
                       >
                         {correctOption === idx ? <CheckCircle2 className="w-5 h-5" /> : String.fromCharCode(65 + idx)}
                       </button>
                    </div>
                    <input
                      type="text"
                      placeholder={`অপশন ${String.fromCharCode(65 + idx)}`}
                      className="w-full bg-transparent border-none py-3 px-2 text-text-primary focus:outline-none font-medium"
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
          </CardContent>
        </Card>

        {/* Step 3: Solution Explanation */}
        <Card className="border-border bg-bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-success" /> ৩. উত্তরের ব্যাখ্যা (ঐচ্ছিক)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-text-secondary ml-1">ব্যাখ্যার টেক্সট</label>
              <textarea
                placeholder="সঠিক উত্তরের ব্যাখ্যা এখানে লিখুন..."
                className="w-full bg-bg-surface border border-border rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[100px]"
                value={solutionText}
                onChange={(e) => setSolutionText(e.target.value)}
              />
            </div>
            
            <div className="space-y-3">
              <label className="text-sm font-medium text-text-secondary ml-1 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> ব্যাখ্যার ইমেজ লিংক
              </label>
              <input
                type="text"
                placeholder="https://example.com/image.png"
                className="w-full bg-bg-surface border border-border rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={solutionImage}
                onChange={(e) => setSolutionImage(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={() => handleSaveQuestion(false)}
            disabled={createMutation.isPending}
            className="flex-1 bg-primary/10 hover:bg-primary/20 text-primary border-2 border-primary/20 h-14 rounded-2xl font-bold transition-all"
          >
            {createMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <PlusCircle className="w-5 h-5 mr-2" />}
            আরেকটা Question যোগ করো
          </Button>
          <Button 
            onClick={() => handleSaveQuestion(true)}
            disabled={createMutation.isPending}
            className="flex-1 bg-primary hover:bg-primary-light text-white h-14 rounded-2xl font-bold shadow-lg transition-all"
          >
            {createMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
            সব সেভ করে শেষ করো
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
