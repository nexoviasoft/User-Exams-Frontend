'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

type ExamItem = {
  id: string;
  title: string;
  status: 'draft' | 'published';
  questionCount?: number;
  attempts?: number;
  subject?: { id: string; name: string } | null;
  modelTest?: { id: string; name: string } | null;
};

export default function SubjectExamsPage() {
  const params = useParams<{ subjectId: string }>();
  const subjectId = params.subjectId;

  const { data: exams = [], isLoading } = useQuery<ExamItem[]>({
    queryKey: ['teacher-subject-exams', subjectId],
    queryFn: async () => (await axiosInstance.get('/exams/my')).data,
    enabled: !!subjectId,
  });

  const scopedExams = useMemo(
    () => exams.filter((exam) => String(exam.subject?.id) === String(subjectId)),
    [exams, subjectId],
  );

  const subjectName = scopedExams[0]?.subject?.name || 'Subject';

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6 pb-20">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">{subjectName} - Exams</h1>
            <p className="text-text-secondary text-sm">এই Subject এর under সব exams</p>
          </div>
          <Link href="/teacher/subjects">
            <Button variant="outline">Back to Subjects</Button>
          </Link>
        </div>

        <Card className="border-border bg-bg-card/50">
          <CardHeader>
            <CardTitle>Exam List</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <div className="py-6 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : scopedExams.length === 0 ? (
              <p className="text-sm text-text-secondary">এই subject-এর জন্য কোনো exam পাওয়া যায়নি।</p>
            ) : (
              scopedExams.map((exam) => (
                <div key={exam.id} className="p-4 rounded-xl border border-border bg-bg-surface flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold">{exam.title}</p>
                    <p className="text-xs text-text-secondary mt-1">
                      Questions: {exam.questionCount || 0} | Attempts: {exam.attempts || 0}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={cn(
                        exam.status === 'published'
                          ? 'bg-success/10 text-success'
                          : 'bg-text-secondary/10 text-text-secondary',
                      )}
                    >
                      {exam.status === 'published' ? 'PUBLISHED' : 'DRAFT'}
                    </Badge>
                    <Link href={`/teacher/exams/${exam.id}`}>
                      <Button size="sm" variant="outline">Details</Button>
                    </Link>
                    <Link href={`/teacher/analytics?id=${exam.id}`}>
                      <Button size="sm" variant="ghost">
                        <BarChart3 className="w-4 h-4 mr-1" /> Analytics
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
