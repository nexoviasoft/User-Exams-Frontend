'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Pencil, Image as ImageIcon } from 'lucide-react';
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
      toast.success('Question update হয়েছে');
      setIsEditOpen(false);
      await refetch();
    },
    onError: () => {
      toast.error('Question update করতে সমস্যা হয়েছে');
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

  const handleEditImageUpload = async (file?: File) => {
    if (!file) return;
    try {
      const uploadedUrl = await uploadImage(file);
      setEditSolutionImage(uploadedUrl);
      toast.success('Image upload successful');
    } catch (error: any) {
      toast.error(error?.message || 'Image upload failed');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6 pb-20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Question List</h1>
            <p className="text-text-secondary text-sm">এই question bank-এর সব questions</p>
          </div>
          <div className="flex gap-2">
            <Link href="/teacher/question-banks">
              <Button variant="outline">Back</Button>
            </Link>
            <Link href={`/teacher/create-question?bankId=${bankId}`}>
              <Button>নতুন Question যোগ করুন</Button>
            </Link>
          </div>
        </div>

        <Card className="border-border bg-bg-card/50">
          <CardHeader>
            <CardTitle>Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
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
                        'w-7 h-7 rounded-full border text-xs',
                        editCorrectOption === idx ? 'bg-success text-white border-success' : 'border-border'
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
                <label className="text-xs text-text-secondary flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" /> অথবা ইমেজ আপলোড করুন
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full bg-bg-surface border border-border rounded-xl p-2 text-sm"
                  onChange={(e) => handleEditImageUpload(e.target.files?.[0])}
                  disabled={isUploading}
                />
                {isUploading && <p className="text-xs text-primary">Uploading image...</p>}
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
