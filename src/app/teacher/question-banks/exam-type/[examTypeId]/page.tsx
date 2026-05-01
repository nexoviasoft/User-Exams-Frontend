'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useGetExamTypesQuery } from '@/store/slices/api/examTypesApi';

export default function ExamTypeScopePage() {
  const params = useParams<{ examTypeId: string }>();
  const examTypeId = params.examTypeId;
  const { data: examTypes = [] } = useGetExamTypesQuery();

  const { data: subjects = [], isLoading: subLoading } = useQuery({
    queryKey: ['teacher-subjects'],
    queryFn: async () => (await axiosInstance.get('/subject')).data,
  });

  const { data: modelTests = [], isLoading: modelLoading } = useQuery({
    queryKey: ['teacher-modeltests'],
    queryFn: async () => (await axiosInstance.get('/modeltest')).data,
  });

  const isLoading = subLoading || modelLoading;
  const examType = examTypes.find((e: any) => e.id === examTypeId);
  const filteredSubjects = subjects.filter((s: any) => s.examType?.id === examTypeId);
  const filteredModelTests = modelTests.filter((m: any) => m.examType?.id === examTypeId);

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{examType?.name || 'Exam Type'}</h1>
            <p className="text-text-secondary text-sm">Subject বা Model Test select করুন।</p>
          </div>
          <Link href="/teacher/question-banks">
            <Button variant="outline">Back</Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Subjects</h2>
              {filteredSubjects.length === 0 ? (
                <p className="text-xs text-text-secondary">No subjects under this exam type.</p>
              ) : (
                filteredSubjects.map((subject: any) => (
                  <Link
                    key={subject.id}
                    href={`/teacher/question-banks/scope/subject/${subject.id}?examTypeId=${examTypeId}`}
                  >
                    <Card className="border-border bg-bg-card/50 hover:border-primary/40 transition-all cursor-pointer">
                      <CardHeader>
                        <CardTitle className="text-base">{subject.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-text-secondary">Click to view question banks</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              )}
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Model Tests</h2>
              {filteredModelTests.length === 0 ? (
                <p className="text-xs text-text-secondary">No model tests under this exam type.</p>
              ) : (
                filteredModelTests.map((modelTest: any) => (
                  <Link
                    key={modelTest.id}
                    href={`/teacher/question-banks/scope/modelTest/${modelTest.id}?examTypeId=${examTypeId}`}
                  >
                    <Card className="border-border bg-bg-card/50 hover:border-primary/40 transition-all cursor-pointer">
                      <CardHeader>
                        <CardTitle className="text-base">{modelTest.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-text-secondary">Click to view question banks</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
