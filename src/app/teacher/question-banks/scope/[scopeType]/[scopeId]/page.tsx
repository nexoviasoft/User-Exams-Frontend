'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function QuestionBankScopePage() {
  const params = useParams<{ scopeType: string; scopeId: string }>();
  const searchParams = useSearchParams();
  const examTypeId = searchParams.get('examTypeId') || '';
  const { scopeType, scopeId } = params;
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const { data: banks = [], isLoading: banksLoading } = useQuery({
    queryKey: ['teacher-question-banks'],
    queryFn: async () => (await axiosInstance.get('/question-banks/my')).data,
  });

  const { data: subjects = [], isLoading: subLoading } = useQuery({
    queryKey: ['teacher-subjects'],
    queryFn: async () => (await axiosInstance.get('/subject')).data,
  });

  const { data: modelTests = [], isLoading: modelLoading } = useQuery({
    queryKey: ['teacher-modeltests'],
    queryFn: async () => (await axiosInstance.get('/modeltest')).data,
  });

  const createBankMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.post('/question-banks', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-question-banks'] });
      setOpen(false);
      setName('');
      setDescription('');
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createBankMutation.mutate({
      name,
      description,
      isPublic: false,
      subjectId: scopeType === 'subject' ? scopeId : undefined,
      modelTestId: scopeType === 'modelTest' ? scopeId : undefined,
    });
  };

  const isLoading = banksLoading || subLoading || modelLoading;
  const isSubject = scopeType === 'subject';
  const scopeName = isSubject
    ? subjects.find((s: any) => s.id === scopeId)?.name
    : modelTests.find((m: any) => m.id === scopeId)?.name;

  const scopedBanks = banks.filter((bank: any) =>
    isSubject ? bank.subject?.id === scopeId : bank.modelTest?.id === scopeId,
  );

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              {isSubject ? 'Subject' : 'Model Test'}: {scopeName || 'Unknown'}
            </h1>
            <p className="text-text-secondary text-sm">এই scope এর Question Banks</p>
          </div>
          <div className="flex items-center gap-3">
            <Button className="rounded-xl" onClick={() => setOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              নতুন Bank
            </Button>

            <Link href={`/teacher/question-banks/exam-type/${examTypeId}`}>
              <Button variant="outline">Back</Button>
            </Link>
          </div>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>নতুন Question Bank তৈরি করুন</DialogTitle>
                <DialogDescription>
                  এই Question Bank এর অধীনে আপনি অনেকগুলো Question যুক্ত করতে পারবেন।
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Bank Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="যেমন: Physics Chapter 1 MCQ"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="অতিরিক্ত কোনো তথ্য থাকলে দিন..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={createBankMutation.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createBankMutation.isPending}>
                  {createBankMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Create
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {isLoading ? (
          <div className="flex justify-center p-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : scopedBanks.length === 0 ? (
          <div className="rounded-xl border border-border bg-bg-card/50 p-6 text-sm text-text-secondary">
            কোনো Question Bank নেই। নতুন Bank তৈরি করুন।
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {scopedBanks.map((bank: any) => (
              <Link key={bank.id} href={`/teacher/questions/bank/${bank.id}`}>
                <Card className="border-border bg-bg-card/50 hover:border-primary/40 transition-all cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-base">{bank.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-text-secondary">{bank.questionCount || 0} questions</p>
                    <p className="text-[11px] text-primary mt-1">Click to open question list page</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
