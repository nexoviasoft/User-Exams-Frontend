'use client';

import { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  PlusCircle, 
  Eye, 
  Edit, 
  Rocket, 
  BarChart3, 
  Search,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useMutation, useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';

type ApiExam = {
  id: string;
  title: string;
  status: 'draft' | 'published';
  questionCount?: number;
  attempts?: number;
  createdAt?: string;
  isFree?: boolean;
  price?: number;
};

export default function TeacherExamsPage() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const { data: exams = [], isLoading, refetch } = useQuery<ApiExam[]>({
    queryKey: ['teacher-exams'],
    queryFn: async () => (await axiosInstance.get('/exams/my')).data,
  });

  const publishMutation = useMutation({
    mutationFn: async (id: string) => (await axiosInstance.patch(`/exams/${id}/publish`)).data,
    onSuccess: async () => {
      toast.success('Exam published');
      await refetch();
    },
    onError: () => {
      toast.error('Publish failed');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) =>
      (await axiosInstance.patch(`/exams/${id}`, { title })).data,
    onSuccess: async () => {
      toast.success('Exam updated');
      await refetch();
    },
    onError: () => toast.error('Update failed'),
  });

  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const statusMatch =
        filter === 'All' ||
        (filter === 'Published' && exam.status === 'published') ||
        (filter === 'Draft' && exam.status === 'draft');
      const searchMatch = exam.title.toLowerCase().includes(search.toLowerCase());
      return statusMatch && searchMatch;
    });
  }, [exams, filter, search]);


  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">আমার Exams 📋</h1>
            <p className="text-text-secondary mt-1">আপনার তৈরি করা সব পরীক্ষা এখানে ম্যানেজ করুন।</p>
          </div>
          <Link href="/teacher/create-exam">
            <Button className="bg-primary hover:bg-primary-light text-white rounded-xl h-12 px-6 font-bold">
              <PlusCircle className="w-5 h-5 mr-2" /> নতুন Exam তৈরি
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex bg-bg-card border border-border p-1 rounded-xl">
             {['All', 'Published', 'Draft'].map((tab) => (
               <button
                 key={tab}
                 onClick={() => setFilter(tab)}
                 className={cn(
                   "px-6 py-2 rounded-lg text-sm font-bold transition-all",
                   filter === tab ? "bg-primary text-white" : "text-text-secondary hover:text-text-primary"
                 )}
               >
                 {tab}
               </button>
             ))}
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input 
              type="text" 
              placeholder="Search exams..." 
              className="bg-bg-surface border border-border rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-w-[280px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Exams Table */}
        <Card className="border-border bg-bg-card/50 overflow-hidden">
          <CardContent className="p-0 overflow-x-auto">
            {isLoading ? (
              <div className="p-10 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-surface text-text-secondary text-xs uppercase tracking-wider font-bold">
                  <th className="px-6 py-4">Exam Title</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Questions</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Attempts</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredExams.map((exam) => (
                  <tr key={exam.id} className="text-sm hover:bg-bg-surface/50 transition-colors group">
                    <td className="px-6 py-4 font-bold max-w-xs">{exam.title}</td>
                    <td className="px-6 py-4">
                      <Badge className={cn(
                        exam.isFree ? 'bg-success/10 text-success' : 'bg-accent/10 text-accent'
                      )}>
                        {exam.isFree ? 'FREE' : `৳${Math.floor(Number(exam.price || 0) / 100)}`}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">{exam.questionCount || 0} Qs</td>
                    <td className="px-6 py-4">
                       <Badge className={cn(
                        exam.status === 'published' ? "bg-success/10 text-success" : "bg-text-secondary/10 text-text-secondary"
                       )}>
                        {exam.status === 'published' ? 'PUBLISHED' : 'DRAFT'}
                       </Badge>
                    </td>
                    <td className="px-6 py-4 font-bold">{exam.attempts || 0}</td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-2">
                         <Link href={`/teacher/exams/${exam.id}`}>
                           <Button
                             variant="ghost"
                             size="icon"
                             className="text-text-secondary hover:text-primary rounded-lg"
                             title="Preview"
                           >
                             <Eye className="w-4 h-4" />
                           </Button>
                         </Link>
                         {exam.status === 'draft' && (
                           <>
                             <Button
                               variant="ghost"
                               size="icon"
                               className="text-text-secondary hover:text-primary rounded-lg"
                               title="Edit"
                               onClick={() => {
                                 const nextTitle = window.prompt('Update exam title', exam.title);
                                 if (!nextTitle || !nextTitle.trim() || nextTitle.trim() === exam.title) return;
                                 updateMutation.mutate({ id: exam.id, title: nextTitle.trim() });
                               }}
                             >
                               <Edit className="w-4 h-4" />
                             </Button>
                             <Button
                               variant="ghost"
                               size="icon"
                               className="text-text-secondary hover:text-success rounded-lg"
                               title="Publish"
                               onClick={() => publishMutation.mutate(exam.id)}
                             >
                               <Rocket className="w-4 h-4" />
                             </Button>
                           </>
                         )}
                         <Link href={`/teacher/analytics?id=${exam.id}`}>
                           <Button variant="ghost" size="icon" className="text-text-secondary hover:text-accent rounded-lg" title="Analytics">
                             <BarChart3 className="w-4 h-4" />
                           </Button>
                         </Link>
                       </div>
                    </td>
                  </tr>
                ))}
                {filteredExams.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-text-secondary">
                      No exams found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
