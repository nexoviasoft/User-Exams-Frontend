'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type ExamQuestion = {
  id: string;
  question?: {
    id: string | number;
    text?: string;
    solutionText?: string;
    solutionImage?: string;
  };
};

type ExamDetails = {
  id: string;
  title: string;
  status: 'draft' | 'published';
  questionCount?: number;
  attempts?: number;
  subject?: { id: string; name: string } | null;
  modelTest?: { id: string; name: string } | null;
  examQuestions?: ExamQuestion[];
};

export default function TeacherExamDetailsPage() {
  const params = useParams<{ examId: string }>();
  const examId = params.examId;

  const { data: exam, isLoading } = useQuery<ExamDetails>({
    queryKey: ['teacher-exam-details', examId],
    queryFn: async () => (await axiosInstance.get(`/exams/${examId}`)).data,
    enabled: !!examId,
  });

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6 pb-20">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Exam Details</h1>
            <p className="text-text-secondary text-sm">এই exam এর question bank-এর সব প্রশ্ন দেখুন।</p>
          </div>
          <Link href="/teacher/exams">
            <Button variant="outline">Back to Exams</Button>
          </Link>
        </div>

        {isLoading ? (
          <Card className="border-border bg-bg-card/50">
            <CardContent className="py-10 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </CardContent>
          </Card>
        ) : !exam ? (
          <Card className="border-border bg-bg-card/50">
            <CardContent className="py-10 text-center text-text-secondary">Exam পাওয়া যায়নি।</CardContent>
          </Card>
        ) : (
          <>
            <Card className="border-border bg-bg-card/50">
              <CardHeader>
                <CardTitle>{exam.title}</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-3 text-sm">
                <p>
                  <span className="font-semibold">Status:</span>{' '}
                  <Badge
                    className={cn(
                      exam.status === 'published'
                        ? 'bg-success/10 text-success'
                        : 'bg-text-secondary/10 text-text-secondary',
                    )}
                  >
                    {exam.status === 'published' ? 'PUBLISHED' : 'DRAFT'}
                  </Badge>
                </p>
                <p><span className="font-semibold">Questions:</span> {exam.questionCount || exam.examQuestions?.length || 0}</p>
                <p><span className="font-semibold">Attempts:</span> {exam.attempts || 0}</p>
                <p><span className="font-semibold">Subject:</span> {exam.subject?.name || 'None'}</p>
                <p><span className="font-semibold">Model Test:</span> {exam.modelTest?.name || 'None'}</p>
              </CardContent>
            </Card>

            <Card className="border-border bg-bg-card/50">
              <CardHeader>
                <CardTitle>Question List</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {!exam.examQuestions?.length ? (
                  <p className="text-sm text-text-secondary">এই exam-এ কোনো question পাওয়া যায়নি।</p>
                ) : (
                  exam.examQuestions.map((item, idx) => (
                    <div key={item.id} className="rounded-xl border border-border bg-bg-surface p-4 space-y-2">
                      <p className="font-semibold text-sm">Q{idx + 1}. {item.question?.text || 'No question text'}</p>
                      {item.question?.solutionText ? (
                        <p className="text-xs text-text-secondary">
                          <span className="font-semibold">Solution:</span> {item.question.solutionText}
                        </p>
                      ) : null}
                      {item.question?.solutionImage ? (
                        <a
                          className="text-xs text-primary hover:underline break-all"
                          href={item.question.solutionImage}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Solution Image Link
                        </a>
                      ) : null}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
