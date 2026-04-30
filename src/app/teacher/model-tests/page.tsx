'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  PlusCircle, 
  Trash2, 
  Loader2,
  FileBadge
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';

interface ModelTest {
  id: string;
  name: string;
  examType: { id: string; name: string };
  candidateType: { id: string; name: string };
  subject?: { id: string; name: string };
}

export default function ModelTestsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modelTestName, setModelTestName] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');
  const [selectedCandidateType, setSelectedCandidateType] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  const queryClient = useQueryClient();

  const { data: modelTests = [], isLoading } = useQuery<ModelTest[]>({
    queryKey: ['teacher-modeltests'],
    queryFn: async () => {
      const response = await axiosInstance.get('/modeltest');
      return response.data;
    },
  });

  const { data: examTypes = [] } = useQuery({
    queryKey: ['examtypes'],
    queryFn: async () => {
      const response = await axiosInstance.get('/examtype');
      return response.data;
    },
  });

  const { data: candidateTypes = [] } = useQuery({
    queryKey: ['candidatetypes'],
    queryFn: async () => {
      const response = await axiosInstance.get('/candidatetype');
      return response.data;
    },
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ['teacher-subjects'],
    queryFn: async () => {
      const response = await axiosInstance.get('/subject');
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.post('/modeltest', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-modeltests'] });
      toast.success('Model Test তৈরি হয়েছে!');
      setIsModalOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error('সমস্যা হয়েছে, আবার চেষ্টা করুন।');
    },
  });

  const resetForm = () => {
    setModelTestName('');
    setSelectedExamType('');
    setSelectedCandidateType('');
    setSelectedSubject('');
  };

  const handleCreateModelTest = () => {
    if (!modelTestName || !selectedExamType || !selectedCandidateType) {
      toast.error('নাম, Exam Type এবং Candidate Type পূরণ করুন');
      return;
    }
    createMutation.mutate({
      name: modelTestName,
      examTypeId: selectedExamType,
      candidateTypeId: selectedCandidateType,
      subjectId: selectedSubject || undefined,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">Model Tests 🎯</h1>
            <p className="text-text-secondary mt-1">আপনার মডেল টেস্ট প্যাকেজগুলো পরিচালনা করুন।</p>
          </div>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary-light text-white rounded-xl h-12 px-6 font-bold shadow-lg"
          >
            <PlusCircle className="w-5 h-5 mr-2" /> নতুন Model Test
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : modelTests.length === 0 ? (
          <div className="text-center p-10 text-text-secondary bg-bg-card/50 rounded-xl border border-border">
            কোনো মডেল টেস্ট পাওয়া যায়নি। নতুন একটি তৈরি করুন।
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {modelTests.map((modelTest) => (
              <Card key={modelTest.id} className="border-border bg-bg-card/50 hover:border-primary/30 transition-all flex flex-col group">
                <CardHeader>
                  <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      {modelTest.examType?.name}
                    </Badge>
                    {modelTest.subject && (
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                        {modelTest.subject.name}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl font-display font-bold group-hover:text-primary transition-colors flex items-center gap-2">
                    <FileBadge className="w-5 h-5 text-primary" />
                    {modelTest.name}
                  </CardTitle>
                  <p className="text-xs text-text-secondary mt-2">Candidate: {modelTest.candidateType?.name}</p>
                </CardHeader>
                <CardFooter className="mt-auto border-t border-border/50 pt-4 flex gap-2">
                  <Button variant="ghost" size="icon" className="text-text-secondary hover:text-danger rounded-xl ml-auto">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isModalOpen} onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) resetForm();
        }}>
          <DialogContent className="bg-bg-card border-border sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-display font-bold">নতুন Model Test</DialogTitle>
              <DialogDescription className="text-text-secondary">
                স্টুডেন্টদের জন্য একটি নতুন মডেল টেস্ট প্যাকেজ তৈরি করুন।
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary ml-1">মডেল টেস্টের নাম</label>
                <input 
                  type="text" 
                  placeholder="যেমন: Weekly Model Test 1" 
                  className="w-full bg-bg-surface border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={modelTestName}
                  onChange={(e) => setModelTestName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary ml-1">Exam Type</label>
                <select 
                  className="w-full bg-bg-surface border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={selectedExamType}
                  onChange={(e) => setSelectedExamType(e.target.value)}
                >
                  <option value="">সিলেক্ট করুন...</option>
                  {examTypes.map((et: any) => (
                    <option key={et.id} value={et.id}>{et.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary ml-1">Candidate Type</label>
                <select 
                  className="w-full bg-bg-surface border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={selectedCandidateType}
                  onChange={(e) => setSelectedCandidateType(e.target.value)}
                >
                  <option value="">সিলেক্ট করুন...</option>
                  {candidateTypes.map((ct: any) => (
                    <option key={ct.id} value={ct.id}>{ct.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary ml-1">Subject (ঐচ্ছিক)</label>
                <select 
                  className="w-full bg-bg-surface border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  <option value="">কোনো নির্দিষ্ট সাবজেক্ট নয়</option>
                  {subjects.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <p className="text-[10px] text-text-secondary ml-1 mt-1">
                  যদি এই মডেল টেস্টটি কোনো নির্দিষ্ট সাবজেক্টের অংশ হয়, তবে সিলেক্ট করুন।
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button 
                onClick={handleCreateModelTest}
                disabled={createMutation.isPending}
                className="w-full bg-primary hover:bg-primary-light text-white font-bold h-12 rounded-xl"
              >
                {createMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : 'Model Test তৈরি করো'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
