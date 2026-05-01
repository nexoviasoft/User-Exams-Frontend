'use client';

import { useEffect, useMemo, useState } from 'react';
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
  Image as ImageIcon,
  Pencil
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
  DialogFooter,
} from "@/components/ui/dialog";

interface QuestionBank {
  id: string;
  name: string;
  subject?: { id: string; name: string };
  modelTest?: { id: string; name: string };
}

export default function CreateQuestionPage() {
  const searchParams = useSearchParams();
  const bankIdFromUrl = searchParams.get('bankId') || '';
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

  // Fetch Question Banks (teacher's own)
  const { data: banks = [], isLoading: isLoadingBanks } = useQuery<QuestionBank[]>({
    queryKey: ['questionbanks'],
    queryFn: async () => {
      const response = await axiosInstance.get('/question-banks/my');
      return response.data;
    },
  });

  const { data: subjects = [], isLoading: isLoadingSubjects } = useQuery({
    queryKey: ['teacher-subjects'],
    queryFn: async () => (await axiosInstance.get('/subject')).data,
  });

  const { data: modelTests = [], isLoading: isLoadingModelTests } = useQuery({
    queryKey: ['teacher-modeltests'],
    queryFn: async () => (await axiosInstance.get('/modeltest')).data,
  });

  const { data: questionList = [], isLoading: isLoadingQuestions, refetch: refetchQuestions } = useQuery({
    queryKey: ['question-list-by-bank', selectedBank],
    queryFn: async () => (await axiosInstance.get(`/questions/bank/${selectedBank}`)).data,
    enabled: !!selectedBank,
  });

  const filteredSubjects = useMemo(
    () => subjects,
    [subjects],
  );

  const filteredModelTests = useMemo(
    () => modelTests,
    [modelTests],
  );

  const scopedBanks = useMemo(() => {
    if (scopeType === 'subject') {
      if (!selectedSubjectId) {
        return banks.filter((bank) => !!bank.subject?.id);
      }
      return banks.filter((bank) => bank.subject?.id === selectedSubjectId);
    }
    if (!selectedModelTestId) {
      return banks.filter((bank) => !!bank.modelTest?.id);
    }
    return banks.filter((bank) => bank.modelTest?.id === selectedModelTestId);
  }, [banks, scopeType, selectedSubjectId, selectedModelTestId]);

  useEffect(() => {
    if (!bankIdFromUrl || !banks.length) return;
    const target = banks.find((bank) => String(bank.id) === String(bankIdFromUrl));
    if (target) {
      setSelectedBank(String(target.id));
      if (target.subject?.id) {
        setScopeType('subject');
        setSelectedSubjectId(String(target.subject.id));
      } else if (target.modelTest?.id) {
        setScopeType('modelTest');
        setSelectedModelTestId(String(target.modelTest.id));
      }
    }
  }, [bankIdFromUrl, banks]);

  // Create Question Mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.post('/questions', data);
      return response.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) =>
      (await axiosInstance.patch(`/questions/${id}`, payload)).data,
    onSuccess: async () => {
      toast.success('Question update হয়েছে');
      setIsEditOpen(false);
      await refetchQuestions();
    },
    onError: () => {
      toast.error('Question update করতে সমস্যা হয়েছে');
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
        questionBankId: String(selectedBank),
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
    if (!editText) return toast.error('প্রশ্নের টেক্সট দিন');
    if (editOptions.some((opt) => !opt)) return toast.error('সবগুলো অপশন পূরণ করুন');
    if (editCorrectOption === null) return toast.error('সঠিক উত্তরটি সিলেক্ট করুন');

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

  const handleCreateImageUpload = async (file?: File) => {
    if (!file) return;
    try {
      const uploadedUrl = await uploadCreateImage(file);
      setSolutionImage(uploadedUrl);
      toast.success('Image upload successful');
    } catch (error: any) {
      toast.error(error?.message || 'Image upload failed');
    }
  };

  const handleEditImageUpload = async (file?: File) => {
    if (!file) return;
    try {
      const uploadedUrl = await uploadEditImage(file);
      setEditSolutionImage(uploadedUrl);
      toast.success('Image upload successful');
    } catch (error: any) {
      toast.error(error?.message || 'Image upload failed');
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
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary ml-1">Scope</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setScopeType('subject');
                    setSelectedModelTestId('');
                    setSelectedBank('');
                  }}
                  className={cn(
                    "rounded-xl border px-4 py-2 text-sm font-bold",
                    scopeType === 'subject' ? 'border-primary bg-primary/10 text-primary' : 'border-border'
                  )}
                >
                  Subject
                </button>
                <button
                  onClick={() => {
                    setScopeType('modelTest');
                    setSelectedSubjectId('');
                    setSelectedBank('');
                  }}
                  className={cn(
                    "rounded-xl border px-4 py-2 text-sm font-bold",
                    scopeType === 'modelTest' ? 'border-primary bg-primary/10 text-primary' : 'border-border'
                  )}
                >
                  Model Test
                </button>
              </div>
            </div>

            {scopeType === 'subject' ? (
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary ml-1">Subject</label>
                <select
                  className="w-full bg-bg-surface border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={selectedSubjectId}
                  onChange={(e) => {
                    setSelectedSubjectId(e.target.value);
                    setSelectedBank('');
                  }}
                >
                  <option value="">Subject সিলেক্ট করুন...</option>
                  {filteredSubjects.map((subject: any) => (
                    <option key={subject.id} value={subject.id}>{subject.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary ml-1">Model Test</label>
                <select
                  className="w-full bg-bg-surface border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={selectedModelTestId}
                  onChange={(e) => {
                    setSelectedModelTestId(e.target.value);
                    setSelectedBank('');
                  }}
                >
                  <option value="">Model Test সিলেক্ট করুন...</option>
                  {filteredModelTests.map((modelTest: any) => (
                    <option key={modelTest.id} value={modelTest.id}>{modelTest.name}</option>
                  ))}
                </select>
              </div>
            )}

            {isLoadingBanks || isLoadingSubjects || isLoadingModelTests ? (
              <div className="text-text-secondary text-sm">Loading banks...</div>
            ) : scopedBanks.length === 0 ? (
              <div className="text-text-secondary text-sm">
                এই {scopeType === 'subject' ? 'subject' : 'model test'} scope-এ কোনো question bank পাওয়া যায়নি।
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scopedBanks.map((bank) => (
                  <div
                    key={bank.id}
                    onClick={() => setSelectedBank(String(bank.id))}
                    className={cn(
                      "cursor-pointer p-4 rounded-xl border-2 transition-all flex items-center justify-between",
                      selectedBank === String(bank.id)
                        ? "border-primary bg-primary/10" 
                        : "border-border bg-bg-surface hover:border-primary/30"
                    )}
                  >
                    <span className="font-bold text-sm">{bank.name}</span>
                    {selectedBank === String(bank.id) && <CheckCircle2 className="w-5 h-5 text-primary" />}
                  </div>
                ))}
              </div>
            )}
            {selectedBank && (
              <p className="text-xs text-success font-medium">
                Selected Bank: {scopedBanks.find((b) => String(b.id) === selectedBank)?.name || selectedBank}
              </p>
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
              <div className="space-y-2">
                <label className="text-xs text-text-secondary">অথবা ইমেজ আপলোড করুন</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full bg-bg-surface border border-border rounded-xl p-2 text-sm"
                  onChange={(e) => handleCreateImageUpload(e.target.files?.[0])}
                  disabled={isCreateImageUploading}
                />
                {isCreateImageUploading && (
                  <p className="text-xs text-primary">Uploading image...</p>
                )}
              </div>
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

        {/* Question List under selected bank */}
        {selectedBank && (
          <Card className="border-border bg-bg-card/50">
            <CardHeader>
              <CardTitle className="text-lg">Selected Bank-এর Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoadingQuestions ? (
                <div className="text-sm text-text-secondary">Questions loading...</div>
              ) : questionList.length === 0 ? (
                <div className="text-sm text-text-secondary">এই bank-এ এখনো কোনো question নেই।</div>
              ) : (
                questionList.map((question: any, idx: number) => (
                  <div key={question.id} className="p-4 rounded-xl border border-border bg-bg-surface">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-sm">Q{idx + 1}. {question.text}</p>
                        <ul className="mt-2 space-y-1 text-xs text-text-secondary">
                          {(question.options || []).map((opt: any, i: number) => (
                            <li key={opt.id || i} className={opt.isCorrect ? 'text-success font-semibold' : ''}>
                              {String.fromCharCode(65 + i)}. {opt.text}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => openEditModal(question)}>
                        <Pencil className="w-4 h-4 mr-1" /> Edit
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="bg-bg-card border-border sm:max-w-[640px]">
            <DialogHeader>
              <DialogTitle>Question Update</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <textarea
                className="w-full bg-bg-surface border border-border rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[100px]"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                placeholder="Question text"
              />
              <div className="space-y-2">
                {editOptions.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <button
                      className={cn(
                        "w-7 h-7 rounded-full border text-xs",
                        editCorrectOption === idx ? "bg-success text-white border-success" : "border-border"
                      )}
                      onClick={() => setEditCorrectOption(idx)}
                    >
                      {String.fromCharCode(65 + idx)}
                    </button>
                    <input
                      className="w-full bg-bg-surface border border-border rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
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
              <textarea
                className="w-full bg-bg-surface border border-border rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px]"
                value={editSolutionText}
                onChange={(e) => setEditSolutionText(e.target.value)}
                placeholder="Solution text (optional)"
              />
              <input
                className="w-full bg-bg-surface border border-border rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={editSolutionImage}
                onChange={(e) => setEditSolutionImage(e.target.value)}
                placeholder="Solution image URL (optional)"
              />
              <div className="space-y-2">
                <label className="text-xs text-text-secondary">অথবা ইমেজ আপলোড করুন</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full bg-bg-surface border border-border rounded-xl p-2 text-sm"
                  onChange={(e) => handleEditImageUpload(e.target.files?.[0])}
                  disabled={isEditImageUploading}
                />
                {isEditImageUploading && (
                  <p className="text-xs text-primary">Uploading image...</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleUpdateQuestion} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Update Question
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
