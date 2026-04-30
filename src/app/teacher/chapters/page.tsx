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
  FolderOpen
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

interface Chapter {
  id: string;
  name: string;
  subject: { id: string; name: string };
  candidateType: { id: string; name: string };
}

export default function ChaptersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chapterName, setChapterName] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedCandidateType, setSelectedCandidateType] = useState('');

  const queryClient = useQueryClient();

  const { data: chapters = [], isLoading } = useQuery<Chapter[]>({
    queryKey: ['teacher-chapters'],
    queryFn: async () => {
      const response = await axiosInstance.get('/chapter');
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

  const { data: candidateTypes = [] } = useQuery({
    queryKey: ['candidatetypes'],
    queryFn: async () => {
      const response = await axiosInstance.get('/candidatetype');
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.post('/chapter', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-chapters'] });
      toast.success('Chapter তৈরি হয়েছে!');
      setIsModalOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error('সমস্যা হয়েছে, আবার চেষ্টা করুন।');
    },
  });

  const resetForm = () => {
    setChapterName('');
    setSelectedSubject('');
    setSelectedCandidateType('');
  };

  const handleCreateChapter = () => {
    if (!chapterName || !selectedSubject || !selectedCandidateType) {
      toast.error('সব তথ্য পূরণ করুন');
      return;
    }
    createMutation.mutate({
      name: chapterName,
      subjectId: selectedSubject,
      candidateTypeId: selectedCandidateType,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">Chapters 📑</h1>
            <p className="text-text-secondary mt-1">আপনার সাবজেক্টের চ্যাপ্টারগুলো পরিচালনা করুন।</p>
          </div>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary-light text-white rounded-xl h-12 px-6 font-bold shadow-lg"
          >
            <PlusCircle className="w-5 h-5 mr-2" /> নতুন Chapter
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : chapters.length === 0 ? (
          <div className="text-center p-10 text-text-secondary bg-bg-card/50 rounded-xl border border-border">
            কোনো চ্যাপ্টার পাওয়া যায়নি। নতুন একটি তৈরি করুন।
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {chapters.map((chapter) => (
              <Card key={chapter.id} className="border-border bg-bg-card/50 hover:border-primary/30 transition-all flex flex-col group">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      {chapter.subject?.name}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-display font-bold group-hover:text-primary transition-colors flex items-center gap-2">
                    <FolderOpen className="w-5 h-5 text-primary" />
                    {chapter.name}
                  </CardTitle>
                  <p className="text-xs text-text-secondary mt-2">Candidate: {chapter.candidateType?.name}</p>
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
              <DialogTitle className="text-2xl font-display font-bold">নতুন Chapter</DialogTitle>
              <DialogDescription className="text-text-secondary">
                একটি সাবজেক্টের অধীনে নতুন চ্যাপ্টার তৈরি করুন।
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary ml-1">চ্যাপ্টারের নাম</label>
                <input 
                  type="text" 
                  placeholder="যেমন: Motion (গতি)" 
                  className="w-full bg-bg-surface border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={chapterName}
                  onChange={(e) => setChapterName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary ml-1">Subject</label>
                <select 
                  className="w-full bg-bg-surface border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  <option value="">সিলেক্ট করুন...</option>
                  {subjects.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
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
            </div>

            <DialogFooter>
              <Button 
                onClick={handleCreateChapter}
                disabled={createMutation.isPending}
                className="w-full bg-primary hover:bg-primary-light text-white font-bold h-12 rounded-xl"
              >
                {createMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : 'Chapter তৈরি করো'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
