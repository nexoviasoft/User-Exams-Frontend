'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Search,
  BookOpen,
  Loader2,
  User as UserIcon,
  Smartphone,
  Info,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useMutation, useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';

type ExamType = {
  id: string;
  name: string;
};

type BundleItem = {
  id: string;
  name: string;
  isFree: boolean;
  price: number;
  examType?: { id: string; name: string };
  teacher?: { user?: { name?: string } };
  type: 'subject' | 'modeltest';
};

type PaymentInstruction = {
  number: string;
  type: string;
  instruction: string;
};

type ExamEntry = {
  id: string;
  title: string;
  totalQuestions: number;
};

const getBundleKey = (type: 'subject' | 'modeltest', id: string) => `${type}-${id}`;

export default function ExamListPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [sort, setSort] = useState('Default');
  const [activeExamType, setActiveExamType] = useState<string>('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState<BundleItem | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad'>('bkash');
  const [transactionId, setTransactionId] = useState('');
  const [senderNumber, setSenderNumber] = useState('');
  const [selectedExamIdsForPayment, setSelectedExamIdsForPayment] = useState<string[]>([]);

  const { data: examTypes = [], isLoading: isExamTypesLoading } = useQuery({
    queryKey: ['examtypes'],
    queryFn: async () => {
      const response = await axiosInstance.get('/examtype');
      const list = response.data as ExamType[];
      if (!activeExamType && list.length > 0) {
        setActiveExamType(list[0].id);
      }
      return list;
    },
  });

  const { data: subjects = [], isLoading: isSubjectsLoading } = useQuery({
    queryKey: ['student-subjects-for-exams-page'],
    queryFn: async () => {
      const response = await axiosInstance.get('/subject/student/my-subjects');
      return (response.data || []) as Omit<BundleItem, 'type' | 'name'>[] & { name: string }[];
    },
  });

  const { data: modelTests = [], isLoading: isModelTestsLoading } = useQuery({
    queryKey: ['student-modeltests-for-exams-page'],
    queryFn: async () => {
      const response = await axiosInstance.get('/modeltest/student/my-modeltests');
      return (response.data || []) as Omit<BundleItem, 'type' | 'name'>[] & { name: string }[];
    },
  });

  const { data: paymentInstructions } = useQuery({
    queryKey: ['payment-instructions'],
    queryFn: async () => {
      const response = await axiosInstance.get('/payments/instructions');
      return response.data as Record<'bkash' | 'nagad', PaymentInstruction>;
    },
  });

  const { data: myPayments = [] } = useQuery({
    queryKey: ['student-my-payments-for-exams-page'],
    queryFn: async () => (await axiosInstance.get('/payments/my')).data,
  });

  const { data: bundleExamCounts = {} } = useQuery({
    queryKey: [
      'bundle-exam-counts',
      subjects.map((s: any) => s.id).join(','),
      modelTests.map((m: any) => m.id).join(','),
    ],
    queryFn: async () => {
      const allBundles: BundleItem[] = [
        ...subjects.map((item: any) => ({ ...item, name: item.name, type: 'subject' as const })),
        ...modelTests.map((item: any) => ({ ...item, name: item.name, type: 'modeltest' as const })),
      ];
      const entries = await Promise.all(
        allBundles.map(async (bundle) => {
          const endpoint =
            bundle.type === 'subject'
              ? `/subject/student/${bundle.id}`
              : `/modeltest/student/${bundle.id}`;
          const response = await axiosInstance.get(endpoint);
          const exams = (response.data?.exams || []) as ExamEntry[];
          return [getBundleKey(bundle.type, bundle.id), exams.length] as const;
        }),
      );
      return Object.fromEntries(entries) as Record<string, number>;
    },
    enabled: subjects.length + modelTests.length > 0,
  });

  const requestPaymentMutation = useMutation({
    mutationFn: async () => {
      if (!selectedBundle) return null;
      const payload =
        selectedBundle.type === 'subject'
          ? {
              subjectId: selectedBundle.id,
              method: paymentMethod,
              transactionId,
              senderNumber,
              selectedExamIds: selectedExamIdsForPayment,
            }
          : {
              modelTestId: selectedBundle.id,
              method: paymentMethod,
              transactionId,
              senderNumber,
              selectedExamIds: selectedExamIdsForPayment,
            };
      const response = await axiosInstance.post('/payments/request', payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Payment submitted. Admin approve করলে exam দিতে পারবেন।');
      setIsPaymentModalOpen(false);
      setTransactionId('');
      setSenderNumber('');
      setSelectedBundle(null);
      setSelectedExamIdsForPayment([]);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Payment submit failed');
    },
  });

  const bundles: BundleItem[] = useMemo(() => {
    const subjectItems: BundleItem[] = subjects.map((item: any) => ({
      ...item,
      name: item.name,
      type: 'subject',
    }));
    const modelTestItems: BundleItem[] = modelTests.map((item: any) => ({
      ...item,
      name: item.name,
      type: 'modeltest',
    }));
    return [...subjectItems, ...modelTestItems];
  }, [subjects, modelTests]);

  const filteredBundles = useMemo(() => {
    let list = bundles.filter((item) => item.examType?.id === activeExamType);
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      list = list.filter((item) => item.name.toLowerCase().includes(s));
    }
    if (filter === 'Free') list = list.filter((item) => item.isFree);
    if (filter === 'Paid') list = list.filter((item) => !item.isFree);
    if (sort === 'Price: Low to High') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'Price: High to Low') list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [activeExamType, bundles, filter, search, sort]);

  const isLoading = isExamTypesLoading || isSubjectsLoading || isModelTestsLoading;
  const successfulPayments = myPayments.filter((p: any) => p.status === 'success');
  const purchasedSubjectIds = new Set(successfulPayments.map((p: any) => p.subject?.id).filter(Boolean));
  const purchasedModelTestIds = new Set(successfulPayments.map((p: any) => p.modelTest?.id).filter(Boolean));
  const selectedBundleExamCount = selectedBundle
    ? bundleExamCounts[getBundleKey(selectedBundle.type, selectedBundle.id)] || 0
    : 0;
  const selectedExamCount = selectedExamIdsForPayment.length;
  const paymentAmountInPaisa =
    selectedBundle && selectedExamCount > 0 && selectedBundleExamCount > 0
      ? Math.floor(Math.floor((selectedBundle.price * selectedExamCount) / selectedBundleExamCount) * 0.9)
      : selectedBundle?.price || 0;

  const handleOpenBundle = (bundle: BundleItem) => {
    router.push(`/student/exams/${bundle.type}/${bundle.id}`);
  };

  const handleOpenPayment = (bundle: BundleItem, examId?: string) => {
    setSelectedBundle(bundle);
    setSelectedExamIdsForPayment(examId ? [examId] : []);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = () => {
    if (!transactionId || !senderNumber) {
      toast.error('সবগুলো তথ্য পূরণ করুন');
      return;
    }
    requestPaymentMutation.mutate();
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header & Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">সব Exam</h1>
            <p className="text-text-secondary mt-1">Exam Type ধরে Subject/Model Test দেখুন, Paid হলে কিনে exam দিন</p>
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
              <option>Default</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Exam Type Tabs */}
        <div className="flex flex-wrap gap-2">
          {examTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setActiveExamType(type.id)}
              className={cn(
                'px-5 py-2 rounded-xl text-sm font-bold transition-all border',
                activeExamType === type.id
                  ? 'bg-primary text-white border-primary'
                  : 'bg-bg-surface text-text-secondary border-border hover:text-primary hover:border-primary/30',
              )}
            >
              {type.name}
            </button>
          ))}
        </div>

        {/* Bundle Grid */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredBundles.map((bundle) => (
              (() => {
                const isPurchased =
                  bundle.type === 'subject'
                    ? purchasedSubjectIds.has(bundle.id)
                    : purchasedModelTestIds.has(bundle.id);
                return (
              <Card key={`${bundle.type}-${bundle.id}`} className="border-border bg-bg-card/50 flex flex-col hover:border-primary/30 transition-all group">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={cn(bundle.isFree ? 'bg-success/10 text-success border-success/20' : 'bg-accent/10 text-accent border-accent/20')}>
                      {bundle.isFree ? 'FREE' : `৳${Math.floor(bundle.price / 100)}`}
                    </Badge>
                    <div className="text-xs text-text-secondary font-medium flex items-center gap-1">
                      <UserIcon className="w-3 h-3" /> {bundle.teacher?.user?.name || 'Teacher'}
                    </div>
                  </div>
                  <CardTitle className="text-xl font-display font-bold group-hover:text-primary transition-colors">
                    {bundle.name}
                  </CardTitle>
                  <p className="text-xs text-text-secondary mt-2">
                    {bundle.type === 'subject' ? 'Subject' : 'Model Test'} • {bundle.examType?.name}
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    Price: {bundle.isFree ? 'Free' : `৳${Math.floor(bundle.price / 100)}`} • By {bundle.teacher?.user?.name || 'Unknown'} • Exams: {bundleExamCounts[getBundleKey(bundle.type, bundle.id)] || 0}
                  </p>
                  {!bundle.isFree && (
                    <div className="mt-2">
                      {(bundle.type === 'subject' ? purchasedSubjectIds.has(bundle.id) : purchasedModelTestIds.has(bundle.id)) ? (
                        <Badge className="bg-success/10 text-success border-success/20">Purchased</Badge>
                      ) : (
                        <Badge className="bg-warning/10 text-warning border-warning/20">Not Purchased</Badge>
                      )}
                    </div>
                  )}
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <BookOpen className="w-4 h-4 text-primary/70" />
                    <span>ভিতরের exam list দেখুন</span>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button
                    onClick={() => handleOpenBundle(bundle)}
                    className="flex-1 bg-bg-surface hover:bg-primary text-text-primary hover:text-white border border-border hover:border-primary font-bold rounded-xl h-11 transition-all"
                  >
                    Exam গুলো দেখুন
                  </Button>
                  {!bundle.isFree && !isPurchased && (
                    <Button
                      onClick={() => handleOpenPayment(bundle)}
                      variant="outline"
                      className="rounded-xl h-11"
                    >
                      কিনুন
                    </Button>
                  )}
                </CardFooter>
              </Card>
                );
              })()
            ))}
          </div>
        )}

        {!isLoading && filteredBundles.length === 0 && (
          <div className="text-center text-text-secondary py-10">
            এই exam type এর জন্য কোনো item পাওয়া যায়নি।
          </div>
        )}

        <Dialog
          open={isPaymentModalOpen}
          onOpenChange={(open) => {
            setIsPaymentModalOpen(open);
            if (!open) {
              setSelectedBundle(null);
              setSelectedExamIdsForPayment([]);
            }
          }}
        >
          <DialogContent className="bg-bg-card border-border sm:max-w-[460px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-display font-bold">Payment করুন</DialogTitle>
              <DialogDescription className="text-text-secondary">
                {selectedBundle?.name} — <span className="text-accent font-bold">৳{Math.floor(paymentAmountInPaisa / 100)}</span>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentMethod('bkash')}
                  className={cn(
                    'flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all',
                    paymentMethod === 'bkash' ? 'border-[#D12053] bg-[#D12053]/10' : 'border-border bg-bg-surface',
                  )}
                >
                  <Smartphone className={cn('w-4 h-4', paymentMethod === 'bkash' ? 'text-[#D12053]' : '')} />
                  <span className="font-bold text-sm">bKash</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('nagad')}
                  className={cn(
                    'flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all',
                    paymentMethod === 'nagad' ? 'border-[#F7941D] bg-[#F7941D]/10' : 'border-border bg-bg-surface',
                  )}
                >
                  <Smartphone className={cn('w-4 h-4', paymentMethod === 'nagad' ? 'text-[#F7941D]' : '')} />
                  <span className="font-bold text-sm">Nagad</span>
                </button>
              </div>
              <div className="p-4 rounded-xl bg-bg-surface border border-border space-y-2">
                <p className="text-xs text-text-secondary">
                  <Info className="w-4 h-4 inline mr-1" />
                  Send Money: <span className="font-bold">{paymentInstructions?.[paymentMethod]?.number || '01XXXXXXXXX'}</span>
                </p>
                <p className="text-xs text-text-secondary">
                  Amount: <span className="font-bold text-accent">৳{Math.floor(paymentAmountInPaisa / 100)}</span>
                </p>
              </div>
              <input
                type="text"
                placeholder="Transaction ID"
                className="w-full bg-bg-surface border border-border rounded-xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
              />
              <input
                type="text"
                placeholder="Sender Number (01XXXXXXXXX)"
                className="w-full bg-bg-surface border border-border rounded-xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={senderNumber}
                onChange={(e) => setSenderNumber(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handlePaymentSubmit} disabled={requestPaymentMutation.isPending}>
                {requestPaymentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Submit Payment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </DashboardLayout>
  );
}
