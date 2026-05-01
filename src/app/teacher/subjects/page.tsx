'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  PlusCircle, 
  Edit2, 
  Trash2, 
  Loader2,
  DollarSign,
  Eye
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
import { cn } from '@/lib/utils';

interface Subject {
  id: string;
  name: string;
  price: number;
  isFree: boolean;
  isPublic: boolean;
  examType: { id: string; name: string };
  candidateType: { id: string; name: string };
}

export default function SubjectsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [subjectName, setSubjectName] = useState('');
  const [price, setPrice] = useState('0');
  const [isFree, setIsFree] = useState(true);
  const [isPublic, setIsPublic] = useState(false);
  const [selectedExamType, setSelectedExamType] = useState('');
  const [selectedCandidateType, setSelectedCandidateType] = useState('');

  const queryClient = useQueryClient();

  const { data: subjects = [], isLoading } = useQuery<Subject[]>({
    queryKey: ['teacher-subjects'],
    queryFn: async () => {
      const response = await axiosInstance.get('/subject');
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

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.post('/subject', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-subjects'] });
      toast.success('Subject তৈরি হয়েছে!');
      setIsModalOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error('সমস্যা হয়েছে, আবার চেষ্টা করুন।');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await axiosInstance.patch(`/subject/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-subjects'] });
      toast.success('Subject update হয়েছে!');
      setIsModalOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error('Update করতে সমস্যা হয়েছে।');
    },
  });

  const resetForm = () => {
    setEditingSubjectId(null);
    setSubjectName('');
    setPrice('0');
    setIsFree(true);
    setIsPublic(false);
    setSelectedExamType('');
    setSelectedCandidateType('');
  };

  const handleCreateSubject = () => {
    if (!subjectName || !selectedExamType || !selectedCandidateType) {
      toast.error('সব তথ্য পূরণ করুন');
      return;
    }
    if (!isFree && (!price || Number(price) <= 0)) {
      toast.error('Paid Subject হলে valid price দিন');
      return;
    }

    const payload = {
      name: subjectName,
      price: isFree ? 0 : parseInt(price) * 100, // storing in paisa
      isFree,
      isPublic,
      examTypeId: selectedExamType,
      candidateTypeId: selectedCandidateType,
    };

    if (editingSubjectId) {
      updateMutation.mutate({ id: editingSubjectId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleEditSubject = (subject: Subject) => {
    setEditingSubjectId(subject.id);
    setSubjectName(subject.name);
    setIsFree(subject.isFree);
    setIsPublic(subject.isPublic);
    setPrice(String(Math.round((subject.price || 0) / 100)));
    setSelectedExamType(subject.examType?.id || '');
    setSelectedCandidateType(subject.candidateType?.id || '');
    setIsModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">Subjects 📚</h1>
            <p className="text-text-secondary mt-1">আপনার সাবজেক্টগুলো পরিচালনা করুন।</p>
          </div>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary-light text-white rounded-xl h-12 px-6 font-bold shadow-lg"
          >
            <PlusCircle className="w-5 h-5 mr-2" /> নতুন Subject
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : subjects.length === 0 ? (
          <div className="text-center p-10 text-text-secondary bg-bg-card/50 rounded-xl border border-border">
            কোনো সাবজেক্ট পাওয়া যায়নি। নতুন একটি তৈরি করুন।
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject) => (
              <Card key={subject.id} className="border-border bg-bg-card/50 hover:border-primary/30 transition-all flex flex-col group">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      {subject.examType?.name}
                    </Badge>
                    <Badge className={subject.isFree ? "bg-success/10 text-success" : "bg-primary/10 text-primary"}>
                      {subject.isFree ? 'Free' : `৳${subject.price / 100}`}
                    </Badge>
                    <Badge className={subject.isPublic ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}>
                      {subject.isPublic ? 'Public' : 'Private'}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-display font-bold group-hover:text-primary transition-colors">
                    {subject.name}
                  </CardTitle>
                  <p className="text-xs text-text-secondary mt-2">Candidate: {subject.candidateType?.name}</p>
                </CardHeader>
                <CardFooter className="mt-auto border-t border-border/50 pt-4 flex gap-2">
                  <Link href={`/teacher/subjects/${subject.id}/exams`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-text-secondary hover:text-primary rounded-xl"
                      title="View Exams"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-text-secondary hover:text-primary rounded-xl"
                    onClick={() => handleEditSubject(subject)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
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
              <DialogTitle className="text-2xl font-display font-bold">
                {editingSubjectId ? 'Subject Update' : 'নতুন Subject'}
              </DialogTitle>
              <DialogDescription className="text-text-secondary">
                {editingSubjectId
                  ? 'Subject তথ্য update করুন।'
                  : 'আপনার স্টুডেন্টদের জন্য একটি নতুন সাবজেক্ট তৈরি করুন।'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary ml-1">সাবজেক্টের নাম</label>
                <input 
                  type="text" 
                  placeholder="যেমন: Physics 1st Paper" 
                  className="w-full bg-bg-surface border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
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

              <div className="flex items-center justify-between p-4 rounded-xl bg-bg-surface border border-border">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-bold">Free Subject?</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsFree(!isFree)}
                  className={cn(
                    "w-12 h-6 rounded-full relative transition-all duration-300",
                    isFree ? "bg-primary" : "bg-bg-card"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                    isFree ? "left-7" : "left-1"
                  )} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-bg-surface border border-border">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-bold">Public for Students?</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPublic(!isPublic)}
                  className={cn(
                    "w-12 h-6 rounded-full relative transition-all duration-300",
                    isPublic ? "bg-success" : "bg-bg-card"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                    isPublic ? "left-7" : "left-1"
                  )} />
                </button>
              </div>

              {!isFree && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary ml-1">মূল্য (Taka)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 500" 
                    className="w-full bg-bg-surface border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button 
                onClick={handleCreateSubject}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="w-full bg-primary hover:bg-primary-light text-white font-bold h-12 rounded-xl"
              >
                {(createMutation.isPending || updateMutation.isPending) ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  editingSubjectId ? 'Subject Update করো' : 'Subject তৈরি করো'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
