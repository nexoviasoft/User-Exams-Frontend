'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Layers, Plus } from 'lucide-react';
import { useGetExamTypesQuery } from '@/store/slices/api/examTypesApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function QuestionBanksPage() {
  const { data: examTypes = [], isLoading } = useGetExamTypesQuery();
  const { data: subjects = [] } = useQuery({ queryKey: ['teacher-subjects'], queryFn: async () => (await axiosInstance.get('/subject')).data });
  const { data: modelTests = [] } = useQuery({ queryKey: ['teacher-modeltests'], queryFn: async () => (await axiosInstance.get('/modeltest')).data });
  
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [examTypeId, setExamTypeId] = useState('');
  const [scopeId, setScopeId] = useState('');

  const filteredSubjects = subjects.filter((s: any) => s.examType?.id === examTypeId);
  const filteredModelTests = modelTests.filter((m: any) => m.examType?.id === examTypeId);

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
      setExamTypeId('');
      setScopeId('');
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !scopeId) return;
    const [selectedScopeType, selectedScopeId] = scopeId.split(':');
    createBankMutation.mutate({
      name,
      description,
      isPublic: false,
      subjectId: selectedScopeType === 'subject' ? selectedScopeId : undefined,
      modelTestId: selectedScopeType === 'modelTest' ? selectedScopeId : undefined,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">Question Banks</h1>
            <p className="text-text-secondary mt-1">প্রথমে Exam Type সিলেক্ট করুন অথবা সরাসরি Bank তৈরি করুন।</p>
          </div>
          <div className="flex items-center gap-3">
            <Button className="rounded-xl" variant="outline" onClick={() => setOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              নতুন Bank তৈরি করুন
            </Button>
            <Link href="/teacher/create-question">
              <Button className="rounded-xl">নতুন Question যোগ করুন</Button>
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
                  <Label>Exam Type</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={examTypeId}
                    onChange={(e) => {
                      setExamTypeId(e.target.value);
                      setScopeId('');
                    }}
                    required
                  >
                    <option value="">Select Exam Type</option>
                    {examTypes.map((et: any) => (
                      <option key={et.id} value={et.id}>
                        {et.name}
                      </option>
                    ))}
                  </select>
                </div>

                {examTypeId && (
                  <>
                    <div className="space-y-2">
                      <Label>Subject / Model Test</Label>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={scopeId}
                        onChange={(e) => setScopeId(e.target.value)}
                        required
                      >
                        <option value="">Select Subject or Model Test</option>
                        {filteredSubjects.map((s: any) => (
                          <option key={`subject-${s.id}`} value={`subject:${s.id}`}>
                            Subject: {s.name}
                          </option>
                        ))}
                        {filteredModelTests.map((m: any) => (
                          <option key={`modelTest-${m.id}`} value={`modelTest:${m.id}`}>
                            Model Test: {m.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

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
                <Button type="submit" disabled={createBankMutation.isPending || !scopeId}>
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
        ) : examTypes.length === 0 ? (
          <div className="rounded-xl border border-border bg-bg-card/50 p-6 text-sm text-text-secondary">
            কোনো Exam Type পাওয়া যায়নি।
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {examTypes.map((examType: any) => (
              <Link key={examType.id} href={`/teacher/question-banks/exam-type/${examType.id}`}>
                <Card className="border-border bg-bg-card/50 hover:border-primary/40 transition-all cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Layers className="w-5 h-5 text-primary" />
                      {examType.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-text-secondary">Click করলে Subject / Model Test list দেখাবে</p>
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
