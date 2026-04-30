'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  PlusCircle, 
  MinusCircle, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Clock, 
  Database,
  Tag,
  Rocket,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function CreateExamPage() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form State
  const [examData, setExamData] = useState({
    title: '',
    description: '',
    duration: 60,
    passMark: 40,
    type: 'Free', // Free or Paid
    price: 0,
    bankId: '',
  });

  const banks = [
    { id: '1', name: 'BCS English Literature', questions: 120 },
    { id: '2', name: 'Medical Biology (Zoology)', questions: 85 },
    { id: '3', name: 'University Math KA Unit', questions: 45 },
  ];

  const handleCreate = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Exam successfully created!');
      window.location.href = '/teacher/exams';
    } catch (error) {
      toast.error('Something went wrong.');
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
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all",
                  step >= i ? "bg-primary text-white" : "bg-bg-surface border border-border text-text-secondary"
                )}>
                  {step > i ? <CheckCircle2 className="w-6 h-6" /> : i}
                </div>
                {i < 4 && <div className={cn("w-12 h-1 mx-2 rounded-full", step > i ? "bg-primary" : "bg-border")} />}
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
                      <MinusCircle className="w-5 h-5" />
                    </Button>
                    <span className="text-2xl font-bold w-12 text-center">{examData.duration}</span>
                    <Button variant="outline" size="icon" onClick={() => setExamData({...examData, duration: examData.duration + 5})}>
                      <PlusCircle className="w-5 h-5" />
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
            </CardContent>
            <CardFooter><Button className="w-full h-12 rounded-xl bg-primary" onClick={() => setStep(2)}>Next Step <ChevronRight className="ml-2 w-4 h-4" /></Button></CardFooter>
          </Card>
        )}

        {/* STEP 2: Pricing */}
        {step === 2 && (
          <Card className="border-border bg-bg-card/50">
            <CardHeader><CardTitle>Pricing Strategy</CardTitle></CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <div 
                  onClick={() => setExamData({...examData, type: 'Free', price: 0})}
                  className={cn(
                    "cursor-pointer p-8 rounded-[32px] border-2 transition-all flex flex-col items-center gap-4",
                    examData.type === 'Free' ? "border-success bg-success/5 shadow-lg" : "border-border bg-bg-surface"
                  )}
                >
                  <div className={cn("w-16 h-16 rounded-full flex items-center justify-center", examData.type === 'Free' ? "bg-success text-white" : "bg-bg-card text-text-secondary")}>
                    <Rocket className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                    <h4 className="text-xl font-bold">Free Exam</h4>
                    <p className="text-xs text-text-secondary mt-1">সবার জন্য উন্মুক্ত</p>
                  </div>
                </div>
                <div 
                   onClick={() => setExamData({...examData, type: 'Paid'})}
                   className={cn(
                    "cursor-pointer p-8 rounded-[32px] border-2 transition-all flex flex-col items-center gap-4",
                    examData.type === 'Paid' ? "border-accent bg-accent/5 shadow-lg" : "border-border bg-bg-surface"
                  )}
                >
                  <div className={cn("w-16 h-16 rounded-full flex items-center justify-center", examData.type === 'Paid' ? "bg-accent text-white" : "bg-bg-card text-text-secondary")}>
                    <Tag className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                    <h4 className="text-xl font-bold">Paid Exam</h4>
                    <p className="text-xs text-text-secondary mt-1">পেমেন্ট করার পর এক্সেস পাবে</p>
                  </div>
                </div>
              </div>

              {examData.type === 'Paid' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                   <label className="text-sm font-medium text-text-secondary ml-1">Price (৳ Taka)</label>
                   <input 
                    type="number" 
                    placeholder="100" 
                    className="w-full bg-bg-surface border border-border rounded-xl py-4 px-6 text-2xl font-bold text-accent focus:outline-none focus:ring-2 focus:ring-accent/50"
                    value={examData.price}
                    onChange={(e) => setExamData({...examData, price: parseInt(e.target.value)})}
                  />
                  <p className="text-[10px] text-text-secondary ml-1">পেমেন্ট ভেরিফিকেশন প্যানেল অটোমেটিক চালু হয়ে যাবে।</p>
                </motion.div>
              )}
            </CardContent>
            <CardFooter className="flex gap-4">
              <Button variant="ghost" className="flex-1 h-12 rounded-xl" onClick={() => setStep(1)}><ChevronLeft className="mr-2 w-4 h-4" /> Back</Button>
              <Button className="flex-1 h-12 rounded-xl bg-primary" onClick={() => setStep(3)}>Next Step <ChevronRight className="ml-2 w-4 h-4" /></Button>
            </CardFooter>
          </Card>
        )}

        {/* STEP 3: Question Bank Selection */}
        {step === 3 && (
          <Card className="border-border bg-bg-card/50">
            <CardHeader><CardTitle>Select Question Bank</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">Your Question Banks</label>
                <select 
                  className="w-full bg-bg-surface border border-border rounded-xl py-3 px-4 focus:outline-none"
                  value={examData.bankId}
                  onChange={(e) => setExamData({...examData, bankId: e.target.value})}
                >
                  <option value="">একটি ব্যাংক সিলেক্ট করুন</option>
                  {banks.map(bank => <option key={bank.id} value={bank.id}>{bank.name} ({bank.questions} Qs)</option>)}
                </select>
              </div>

              {examData.bankId && (
                <div className="p-6 rounded-2xl bg-bg-surface border border-border border-dashed space-y-4">
                   <h5 className="font-bold flex items-center gap-2"><Database className="w-4 h-4 text-primary" /> Bank Preview</h5>
                   <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 rounded-lg bg-bg-card text-xs">
                        <span>Total Questions to include:</span>
                        <span className="font-bold text-primary">{banks.find(b => b.id === examData.bankId)?.questions} Questions</span>
                      </div>
                      <p className="text-[10px] text-text-secondary">ব্যাবহারকারীরা এই ব্যাংকের সব প্রশ্ন আপনার সেট করা অর্ডারে বা র‍্যান্ডমলি দেখতে পাবে।</p>
                   </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex gap-4">
              <Button variant="ghost" className="flex-1 h-12 rounded-xl" onClick={() => setStep(2)}><ChevronLeft className="mr-2 w-4 h-4" /> Back</Button>
              <Button className="flex-1 h-12 rounded-xl bg-primary" onClick={() => setStep(4)} disabled={!examData.bankId}>Next Step <ChevronRight className="ml-2 w-4 h-4" /></Button>
            </CardFooter>
          </Card>
        )}

        {/* STEP 4: Review */}
        {step === 4 && (
          <Card className="border-border bg-bg-card/50">
            <CardHeader><CardTitle>Review & Finalize</CardTitle></CardHeader>
            <CardContent className="space-y-6">
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
                    <p className="text-xs text-text-secondary uppercase font-bold tracking-widest">Price</p>
                    <p className="font-bold text-accent">{examData.type === 'Free' ? 'FREE' : `৳${examData.price}`}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-bg-surface border border-border space-y-1">
                    <p className="text-xs text-text-secondary uppercase font-bold tracking-widest">Question Bank</p>
                    <p className="font-bold">{banks.find(b => b.id === examData.bankId)?.name}</p>
                  </div>
               </div>
            </CardContent>
            <CardFooter className="flex gap-4">
              <Button variant="ghost" className="flex-1 h-12 rounded-xl" onClick={() => setStep(3)}><ChevronLeft className="mr-2 w-4 h-4" /> Back</Button>
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
