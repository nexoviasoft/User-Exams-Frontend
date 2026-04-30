'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Filter, 
  BookOpen, 
  Clock, 
  User as UserIcon,
  CheckCircle2,
  Wallet,
  Smartphone,
  Info
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function ExamListPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [sort, setSort] = useState('Newest');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad'>('bkash');
  const [transactionId, setTransactionId] = useState('');
  const [senderNumber, setSenderNumber] = useState('');

  const exams = [
    { id: '1', title: 'BCS Preliminary Model Test 01', teacher: 'Dr. Rahman', questions: 100, duration: '120m', price: 0, type: 'Free' },
    { id: '2', title: 'Medical Admission Mock 2024', teacher: 'Prof. Karim', questions: 50, duration: '60m', price: 150, type: 'Paid' },
    { id: '3', title: 'HSC Physics Chapter 1-5', teacher: 'Engr. Jamil', questions: 30, duration: '45m', price: 0, type: 'Free' },
    { id: '4', title: 'IELTS Listening Practice', teacher: 'Ms. Sarah', questions: 40, duration: '30m', price: 200, type: 'Paid' },
    { id: '5', title: 'DU Admission KA Unit', teacher: 'Admission Pro', questions: 80, duration: '90m', price: 100, type: 'Paid' },
    { id: '6', title: 'General Knowledge Daily', teacher: 'GK Master', questions: 20, duration: '15m', price: 0, type: 'Free' },
  ];

  const handleStartExam = (exam: any) => {
    if (exam.price === 0) {
      window.location.href = `/student/take-exam/${exam.id}`;
    } else {
      setSelectedExam(exam);
      setIsPaymentModalOpen(true);
    }
  };

  const handlePaymentSubmit = () => {
    if (!transactionId || !senderNumber) {
      toast.error('সবগুলো তথ্য পূরণ করুন');
      return;
    }
    toast.success('Payment submitted! Admin verify করার পর exam শুরু করতে পারবে।');
    setIsPaymentModalOpen(false);
    setTransactionId('');
    setSenderNumber('');
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header & Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">সব Exam</h1>
            <p className="text-text-secondary mt-1">আপনার পছন্দের পরীক্ষাটি খুঁজে নিন</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input 
                type="text" 
                placeholder="Search exams..." 
                className="bg-bg-surface border border-border rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-w-[240px]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <select 
              className="bg-bg-surface border border-border rounded-xl py-2 px-4 text-sm focus:outline-none"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option>All</option>
              <option>Free</option>
              <option>Paid</option>
            </select>

            <select 
              className="bg-bg-surface border border-border rounded-xl py-2 px-4 text-sm focus:outline-none"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option>Newest</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Exams Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => (
            <Card key={exam.id} className="border-border bg-bg-card/50 flex flex-col hover:border-primary/30 transition-all group">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge className={cn(
                    exam.price === 0 ? "bg-success/10 text-success border-success/20" : "bg-accent/10 text-accent border-accent/20"
                  )}>
                    {exam.price === 0 ? 'FREE' : `৳${exam.price}`}
                  </Badge>
                  <div className="text-xs text-text-secondary font-medium flex items-center gap-1">
                    <UserIcon className="w-3 h-3" /> {exam.teacher}
                  </div>
                </div>
                <CardTitle className="text-xl font-display font-bold group-hover:text-primary transition-colors">
                  {exam.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex items-center gap-6 text-sm text-text-secondary">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary/70" />
                    <span>{exam.questions} Questions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary/70" />
                    <span>{exam.duration}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => handleStartExam(exam)}
                  className="w-full bg-bg-surface hover:bg-primary text-text-primary hover:text-white border border-border hover:border-primary font-bold rounded-xl h-12 transition-all"
                >
                  Exam দাও
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Payment Modal */}
        <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
          <DialogContent className="bg-bg-card border-border sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-display font-bold">Payment করুন</DialogTitle>
              <DialogDescription className="text-text-secondary">
                {selectedExam?.title} — <span className="text-accent font-bold">৳{selectedExam?.price}</span>
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Step 1: Select Method */}
              <div className="space-y-3">
                <p className="text-sm font-medium">১. পেমেন্ট মেথড সিলেক্ট করুন</p>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setPaymentMethod('bkash')}
                    className={cn(
                      "flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all",
                      paymentMethod === 'bkash' ? "border-[#D12053] bg-[#D12053]/10" : "border-border bg-bg-surface"
                    )}
                  >
                    <Smartphone className={cn("w-4 h-4", paymentMethod === 'bkash' ? "text-[#D12053]" : "")} />
                    <span className="font-bold text-sm">bKash</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('nagad')}
                    className={cn(
                      "flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all",
                      paymentMethod === 'nagad' ? "border-[#F7941D] bg-[#F7941D]/10" : "border-border bg-bg-surface"
                    )}
                  >
                    <Smartphone className={cn("w-4 h-4", paymentMethod === 'nagad' ? "text-[#F7941D]" : "")} />
                    <span className="font-bold text-sm">Nagad</span>
                  </button>
                </div>
              </div>

              {/* Step 2: Instructions */}
              <div className="p-4 rounded-2xl bg-bg-surface border border-border space-y-2">
                <div className="flex items-center gap-2 text-primary font-bold">
                  <Info className="w-4 h-4" />
                  <span className="text-sm">নির্দেশনা:</span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  এই নম্বরে <span className="text-text-primary font-bold">Send Money</span> করুন: <br />
                  <span className="text-lg font-display font-bold text-text-primary">01700-000000</span> <br />
                  Amount: <span className="text-accent font-bold">৳{selectedExam?.price}</span>
                </p>
              </div>

              {/* Step 3: Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-secondary ml-1">Transaction ID</label>
                  <input 
                    type="text" 
                    placeholder="Enter TrxID" 
                    className="w-full bg-bg-surface border border-border rounded-xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-secondary ml-1">Sender Number</label>
                  <input 
                    type="text" 
                    placeholder="01XXXXXXXXX" 
                    className="w-full bg-bg-surface border border-border rounded-xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    value={senderNumber}
                    onChange={(e) => setSenderNumber(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button 
                onClick={handlePaymentSubmit}
                className="w-full bg-primary hover:bg-primary-light text-white font-bold h-12 rounded-xl"
              >
                Submit Payment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
