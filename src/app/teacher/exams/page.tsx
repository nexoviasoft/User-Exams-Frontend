'use client';

import { useState } from 'react';
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
  MoreVertical,
  Search
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function TeacherExamsPage() {
  const [filter, setFilter] = useState('All');

  const exams = [
    { id: '1', title: 'BCS Preliminary Model Test 01', questions: 100, price: '৳100', status: 'PUBLISHED', attempts: 124 },
    { id: '2', title: 'HSC Physics Quiz 2024', questions: 30, price: 'Free', status: 'DRAFT', attempts: 0 },
    { id: '3', title: 'Medical Prep Full Mock', questions: 50, price: '৳250', status: 'PUBLISHED', attempts: 85 },
    { id: '4', title: 'University Admission Unit KA', questions: 80, price: '৳150', status: 'DRAFT', attempts: 0 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">আমার Exams 📋</h1>
            <p className="text-text-secondary mt-1">আপনার তৈরি করা সব পরীক্ষা এখানে ম্যানেজ করুন।</p>
          </div>
          <Button className="bg-primary hover:bg-primary-light text-white rounded-xl h-12 px-6 font-bold" render={<Link href="/teacher/create-exam" />}>
            <PlusCircle className="w-5 h-5 mr-2" /> নতুন Exam তৈরি
          </Button>
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
            />
          </div>
        </div>

        {/* Exams Table */}
        <Card className="border-border bg-bg-card/50 overflow-hidden">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-surface text-text-secondary text-xs uppercase tracking-wider font-bold">
                  <th className="px-6 py-4">Exam Title</th>
                  <th className="px-6 py-4">Questions</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Attempts</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {exams.map((exam) => (
                  <tr key={exam.id} className="text-sm hover:bg-bg-surface/50 transition-colors group">
                    <td className="px-6 py-4 font-bold max-w-xs">{exam.title}</td>
                    <td className="px-6 py-4">{exam.questions} Qs</td>
                    <td className="px-6 py-4 font-medium text-accent">{exam.price}</td>
                    <td className="px-6 py-4">
                       <Badge className={cn(
                         exam.status === 'PUBLISHED' ? "bg-success/10 text-success" : "bg-text-secondary/10 text-text-secondary"
                       )}>
                         {exam.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT'}
                       </Badge>
                    </td>
                    <td className="px-6 py-4 font-bold">{exam.attempts}</td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-2">
                         <Button variant="ghost" size="icon" className="text-text-secondary hover:text-primary rounded-lg" title="Preview">
                           <Eye className="w-4 h-4" />
                         </Button>
                         {exam.status === 'DRAFT' && (
                           <>
                             <Button variant="ghost" size="icon" className="text-text-secondary hover:text-primary rounded-lg" title="Edit">
                               <Edit className="w-4 h-4" />
                             </Button>
                             <Button variant="ghost" size="icon" className="text-text-secondary hover:text-success rounded-lg" title="Publish">
                               <Rocket className="w-4 h-4" />
                             </Button>
                           </>
                         )}
                         <Button variant="ghost" size="icon" className="text-text-secondary hover:text-accent rounded-lg" title="Analytics" render={<Link href={`/teacher/analytics?id=${exam.id}`} />}>
                           <BarChart3 className="w-4 h-4" />
                         </Button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
