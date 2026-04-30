'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  FileBadge, 
  Loader2,
  DollarSign,
  Trophy,
  LineChart
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function BrowsePage() {
  const [activeTab, setActiveTab] = useState<string>('');

  const { data: examTypes = [], isLoading: isLoadingExamTypes } = useQuery({
    queryKey: ['examtypes'],
    queryFn: async () => {
      const response = await axiosInstance.get('/examtype');
      return response.data;
    },
  });

  const { data: subjects = [], isLoading: isLoadingSubjects } = useQuery({
    queryKey: ['student-subjects'],
    queryFn: async () => {
      const response = await axiosInstance.get('/subject/student/my-subjects');
      return response.data;
    },
  });

  const { data: modelTests = [], isLoading: isLoadingModelTests } = useQuery({
    queryKey: ['student-modeltests'],
    queryFn: async () => {
      const response = await axiosInstance.get('/modeltest/student/my-modeltests');
      return response.data;
    },
  });

  // Set default tab when data loads
  if (examTypes.length > 0 && !activeTab) {
    setActiveTab(examTypes[0].id);
  }

  const isLoading = isLoadingExamTypes || isLoadingSubjects || isLoadingModelTests;

  const filteredSubjects = subjects.filter((sub: any) => sub.examType?.id === activeTab);
  const filteredModelTests = modelTests.filter((mt: any) => mt.examType?.id === activeTab);

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-20">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Browse Courses & Exams 📚</h1>
          <p className="text-text-secondary mt-1">আপনার জন্য নির্ধারিত সাবজেক্ট এবং মডেল টেস্টগুলো দেখুন।</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-border pb-4">
              {examTypes.map((et: any) => (
                <button
                  key={et.id}
                  onClick={() => setActiveTab(et.id)}
                  className={cn(
                    "px-6 py-3 rounded-xl font-bold text-sm transition-all",
                    activeTab === et.id 
                      ? "bg-primary text-white shadow-lg" 
                      : "bg-bg-surface text-text-secondary hover:bg-primary/10 hover:text-primary"
                  )}
                >
                  {et.name}
                </button>
              ))}
            </div>

            <div className="space-y-8">
              {/* Subjects Section */}
              <div>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-primary" /> Subjects
                </h2>
                {filteredSubjects.length === 0 ? (
                  <p className="text-text-secondary text-sm">এই ক্যাটাগরিতে কোনো সাবজেক্ট পাওয়া যায়নি।</p>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredSubjects.map((subject: any) => (
                      <Card key={subject.id} className="border-border bg-bg-card/50 hover:border-primary/30 transition-all flex flex-col group">
                        <CardHeader>
                          <div className="flex justify-between items-start mb-2">
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                              {subject.examType?.name}
                            </Badge>
                            <Badge className={subject.isFree ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}>
                              {subject.isFree ? 'Free' : `৳${subject.price / 100}`}
                            </Badge>
                          </div>
                          <CardTitle className="text-xl font-display font-bold group-hover:text-primary transition-colors">
                            {subject.name}
                          </CardTitle>
                          <p className="text-xs text-text-secondary mt-2">By {subject.teacher?.user?.name}</p>
                        </CardHeader>
                        <CardFooter className="mt-auto border-t border-border/50 pt-4 flex flex-col gap-2">
                          <Button className="w-full bg-primary hover:bg-primary-light text-white rounded-xl h-10 font-bold shadow-lg" asChild>
                            <Link href={`/student/browse/subject/${subject.id}`}>
                              বিস্তারিত দেখুন
                            </Link>
                          </Button>
                          <div className="flex gap-2 w-full">
                            <Button variant="outline" className="flex-1 rounded-xl h-9 text-xs font-bold" asChild>
                              <Link href={`/student/leaderboard/subject/${subject.id}`}>
                                <Trophy className="w-3 h-3 mr-1 text-yellow-500" /> Leaderboard
                              </Link>
                            </Button>
                            <Button variant="outline" className="flex-1 rounded-xl h-9 text-xs font-bold" asChild>
                              <Link href={`/student/analytics/subject/${subject.id}`}>
                                <LineChart className="w-3 h-3 mr-1 text-primary" /> Analytics
                              </Link>
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Model Tests Section */}
              <div>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <FileBadge className="w-6 h-6 text-accent" /> Model Tests
                </h2>
                {filteredModelTests.length === 0 ? (
                  <p className="text-text-secondary text-sm">এই ক্যাটাগরিতে কোনো মডেল টেস্ট পাওয়া যায়নি।</p>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredModelTests.map((modelTest: any) => (
                      <Card key={modelTest.id} className="border-border bg-bg-card/50 hover:border-accent/30 transition-all flex flex-col group">
                        <CardHeader>
                          <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                            <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                              {modelTest.examType?.name}
                            </Badge>
                            {modelTest.subject && (
                              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                {modelTest.subject.name}
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-xl font-display font-bold group-hover:text-accent transition-colors">
                            {modelTest.name}
                          </CardTitle>
                          <p className="text-xs text-text-secondary mt-2">By {modelTest.teacher?.user?.name}</p>
                        </CardHeader>
                        <CardFooter className="mt-auto border-t border-border/50 pt-4 flex flex-col gap-2">
                          <Button className="w-full bg-accent hover:bg-accent/90 text-white rounded-xl h-10 font-bold shadow-lg" asChild>
                            <Link href={`/student/browse/model-test/${modelTest.id}`}>
                              এক্সাম দিন
                            </Link>
                          </Button>
                          <div className="flex gap-2 w-full">
                            <Button variant="outline" className="flex-1 rounded-xl h-9 text-xs font-bold" asChild>
                              <Link href={`/student/leaderboard/model-test/${modelTest.id}`}>
                                <Trophy className="w-3 h-3 mr-1 text-yellow-500" /> Leaderboard
                              </Link>
                            </Button>
                            <Button variant="outline" className="flex-1 rounded-xl h-9 text-xs font-bold" asChild>
                              <Link href={`/student/analytics/model-test/${modelTest.id}`}>
                                <LineChart className="w-3 h-3 mr-1 text-accent" /> Analytics
                              </Link>
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
