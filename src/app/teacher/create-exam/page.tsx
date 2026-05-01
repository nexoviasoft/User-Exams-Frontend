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
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { useRouter } from 'next/navigation';

export default function CreateExamPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [useSubject, setUseSubject] = useState(false);
  const [useModelTest, setUseModelTest] = useState(false);
  
  // Form State
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

  const selectedBankDetails = useMemo(
    () => banks.find((b: any) => String(b.id) === String(examData.bankId)),
    [banks, examData.bankId],
  );

  const handleCreate = async () => {
    if (!examData.title) {
      toast.error('Exam Title দিন');
      return;
    }
    if (!useSubject && !useModelTest) {
      toast.error('Subject অথবা Model Test source select করুন');
      return;
    }
    if (useSubject && !examData.subjectId) {
      toast.error('Subject select করুন');
      return;
    }
    if (useModelTest && !examData.modelTestId) {
      toast.error('Model Test select করুন');
      return;
    }
    if (!examData.bankId) {
      toast.error('Question Bank select করুন');
      return;
    }
    if (!examData.isFree && Number(examData.priceTaka || 0) <= 0) {
      toast.error('Paid exam এর জন্য price দিন');
      return;
    }
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
      toast.success('Exam তৈরি হয়েছে');
      router.push('/teacher/exams');
    } catch (error) {
      toast.error('Exam create করতে সমস্যা হয়েছে');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-20">
        <div className="flex flex-col items-center text-center space-y-4">
          <h1 className="text-4xl font-display font-bold tracking-tight text-text-primary">নতুন Exam তৈরি করুন 🚀</h1>
          
          {/* Progress Indicator */}
          <div className="flex items-center gap-4 py-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all",
                  step >= i ? "bg-primary text-white" : "bg-bg-surface border border-border text-text-secondary"
                )}>
                  {step > i ? <CheckCircle2 className="w-6 h-6" /> : i}
                </div>
                {i < 3 && <div className={cn("w-12 h-1 mx-2 rounded-full", step > i ? "bg-primary" : "bg-border")} />}
              </div>
            ))}
          </div>
        </div>

        {/* STEP 1: Basic Info */}
        {step === 1 && (
          <Card className="border-border bg-bg-card/50">
            <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">Exam Title</label>
                <input 
                  type="text" 
                  placeholder="যেমন: BCS Model Test 01" 
                  className="w-full bg-bg-surface border border-border rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={examData.title}
                  onChange={(e) => setExamData({...examData, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">Description</label>
                <textarea 
                  placeholder="পরীক্ষা সম্পর্কে বিস্তারিত..." 
                  className="w-full bg-bg-surface border border-border rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[100px]"
                  value={examData.description}
                  onChange={(e) => setExamData({...examData, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Duration (minutes)</label>
                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => setExamData({...examData, duration: Math.max(1, examData.duration - 5)})}>
                      -
                    </Button>
                    <span className="text-2xl font-bold w-12 text-center">{examData.duration}</span>
                    <Button variant="outline" size="icon" onClick={() => setExamData({...examData, duration: examData.duration + 5})}>
                      +
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Pass Mark (%)</label>
                  <input 
                    type="number" 
                    placeholder="40" 
                    className="w-full bg-bg-surface border border-border rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    value={examData.passMark}
                    onChange={(e) => setExamData({...examData, passMark: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-medium text-text-secondary">Exam Pricing</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setExamData((prev) => ({ ...prev, isFree: true, priceTaka: 0 }))}
                    className={cn(
                      'rounded-xl border px-4 py-2 text-sm font-bold',
                      examData.isFree ? 'border-success bg-success/10 text-success' : 'border-border',
                    )}
                  >
                    Free Exam
                  </button>
                  <button
                    type="button"
                    onClick={() => setExamData((prev) => ({ ...prev, isFree: false }))}
                    className={cn(
                      'rounded-xl border px-4 py-2 text-sm font-bold',
                      !examData.isFree ? 'border-accent bg-accent/10 text-accent' : 'border-border',
                    )}
                  >
                    Paid Exam
                  </button>
                </div>
                {!examData.isFree && (
                  <div className="space-y-2">
                    <label className="text-xs text-text-secondary">Exam Price (Taka)</label>
                    <input
                      type="number"
                      min={0}
                      className="w-full bg-bg-surface border border-border rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      value={examData.priceTaka}
                      onChange={(e) => setExamData((prev) => ({ ...prev, priceTaka: Number(e.target.value || 0) }))}
                    />
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter><Button className="w-full h-12 rounded-xl bg-primary" onClick={() => setStep(2)}>Next Step <ChevronRight className="ml-2 w-4 h-4" /></Button></CardFooter>
          </Card>
        )}

        {/* STEP 2: Subject / ModelTest Link */}
        {step === 2 && (
          <Card className="border-border bg-bg-card/50">
            <CardHeader><CardTitle>Subject / Model Test Setup</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">Select Source</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setUseSubject(true);
                      setUseModelTest(false);
                      setExamData((prev) => ({ ...prev, modelTestId: '', bankId: '' }));
                    }}
                    className={cn(
                      "rounded-xl border px-4 py-2 text-sm font-bold",
                      useSubject ? "border-primary bg-primary/10 text-primary" : "border-border"
                    )}
                  >
                    Subject
                  </button>
                  <button
                    onClick={() => {
                      setUseModelTest(true);
                      setUseSubject(false);
                      setExamData((prev) => ({ ...prev, subjectId: '', bankId: '' }));
                    }}
                    className={cn(
                      "rounded-xl border px-4 py-2 text-sm font-bold",
                      useModelTest ? "border-primary bg-primary/10 text-primary" : "border-border"
                    )}
                  >
                    Model Test
                  </button>
                </div>
              </div>

              {useSubject && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">Attach to Subject</label>
                <select
                  className="w-full bg-bg-surface border border-border rounded-xl py-3 px-4 focus:outline-none"
                  value={examData.subjectId}
                  onChange={(e) => setExamData({ ...examData, subjectId: e.target.value, bankId: '' })}
                >
                  <option value="">Subject সিলেক্ট করুন...</option>
                  {subjects.map((subject: any) => (
                    <option key={subject.id} value={subject.id}>{subject.name}</option>
                  ))}
                </select>
              </div>
              )}

              {useModelTest && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">Attach to Model Test</label>
                <select
                  className="w-full bg-bg-surface border border-border rounded-xl py-3 px-4 focus:outline-none"
                  value={examData.modelTestId}
                  onChange={(e) => setExamData({ ...examData, modelTestId: e.target.value, bankId: '' })}
                >
                  <option value="">Model Test সিলেক্ট করুন...</option>
                  {modelTests.map((mt: any) => (
                    <option key={mt.id} value={mt.id}>{mt.name}</option>
                  ))}
                </select>
              </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">Question Bank (selected scope under)</label>
                <select
                  className="w-full bg-bg-surface border border-border rounded-xl py-3 px-4 focus:outline-none"
                  value={examData.bankId}
                  onChange={(e) => setExamData({ ...examData, bankId: e.target.value })}
                  disabled={scopedBanks.length === 0}
                >
                  <option value="">
                    {scopedBanks.length === 0 ? 'আগে Subject/Model Test select করুন' : 'Question Bank সিলেক্ট করুন'}
                  </option>
                  {scopedBanks.map((bank: any) => (
                    <option key={bank.id} value={bank.id}>
                      {bank.name} ({bank.questionCount || 0} Qs)
                    </option>
                  ))}
                </select>
              </div>

              <p className="text-xs text-text-secondary">
                Selected Subject/Model Test under question bank দিয়েই exam create payload যাবে।
              </p>
            </CardContent>
            <CardFooter className="flex gap-4">
              <Button variant="ghost" className="flex-1 h-12 rounded-xl" onClick={() => setStep(1)}><ChevronLeft className="mr-2 w-4 h-4" /> Back</Button>
              <Button className="flex-1 h-12 rounded-xl bg-primary" onClick={() => setStep(3)}>Review <ChevronRight className="ml-2 w-4 h-4" /></Button>
            </CardFooter>
          </Card>
        )}

        {/* STEP 3: Review */}
        {step === 3 && (
          <Card className="border-border bg-bg-card/50">
            <CardHeader><CardTitle>Review</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              {examData.bankId && (
                <div className="p-6 rounded-2xl bg-bg-surface border border-border border-dashed space-y-4">
                   <h5 className="font-bold flex items-center gap-2"><Database className="w-4 h-4 text-primary" /> Bank Preview</h5>
                   <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 rounded-lg bg-bg-card text-xs">
                        <span>Total Questions to include:</span>
                        <span className="font-bold text-primary">{selectedBankDetails?.questionCount || 0} Questions</span>
                      </div>
                      <p className="text-[10px] text-text-secondary">ব্যাবহারকারীরা এই ব্যাংকের সব প্রশ্ন আপনার সেট করা অর্ডারে বা র‍্যান্ডমলি দেখতে পাবে।</p>
                   </div>
                </div>
              )}
               <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 rounded-xl bg-bg-surface border border-border space-y-1">
                    <p className="text-xs text-text-secondary uppercase font-bold tracking-widest">Exam Title</p>
                    <p className="font-bold">{examData.title}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-bg-surface border border-border space-y-1">
                    <p className="text-xs text-text-secondary uppercase font-bold tracking-widest">Duration</p>
                    <p className="font-bold flex items-center gap-2"><Clock className="w-4 h-4" /> {examData.duration} Minutes</p>
                  </div>
                  <div className="p-4 rounded-xl bg-bg-surface border border-border space-y-1">
                    <p className="text-xs text-text-secondary uppercase font-bold tracking-widest">Source</p>
                    <p className="font-bold">{useSubject ? 'Subject' : useModelTest ? 'Model Test' : 'Not selected'}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-bg-surface border border-border space-y-1">
                    <p className="text-xs text-text-secondary uppercase font-bold tracking-widest">Question Bank</p>
                    <p className="font-bold">{selectedBankDetails?.name || 'Not selected'}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-bg-surface border border-border space-y-1">
                    <p className="text-xs text-text-secondary uppercase font-bold tracking-widest">
                      {useSubject ? 'Attached Subject' : useModelTest ? 'Attached Model Test' : 'Attached Source'}
                    </p>
                    <p className="font-bold">
                      {useSubject
                        ? (subjects.find((s: any) => s.id === examData.subjectId)?.name || 'None')
                        : useModelTest
                          ? (modelTests.find((m: any) => m.id === examData.modelTestId)?.name || 'None')
                          : 'None'}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-bg-surface border border-border space-y-1">
                    <p className="text-xs text-text-secondary uppercase font-bold tracking-widest">Exam Price</p>
                    <p className="font-bold">{examData.isFree ? 'Free' : `৳${Number(examData.priceTaka || 0)}`}</p>
                  </div>
               </div>
            </CardContent>
            <CardFooter className="flex gap-4">
              <Button variant="ghost" className="flex-1 h-12 rounded-xl" onClick={() => setStep(2)}><ChevronLeft className="mr-2 w-4 h-4" /> Back</Button>
              <Button 
                onClick={handleCreate}
                disabled={isLoading}
                className="flex-1 h-12 rounded-xl bg-success hover:bg-success-dark text-white font-bold shadow-xl"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Rocket className="w-5 h-5 mr-2" />}
                Exam তৈরি করো
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
