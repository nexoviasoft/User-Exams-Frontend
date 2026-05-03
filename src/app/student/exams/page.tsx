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
  ArrowRight,
  ShoppingBag,
  TrendingUp,
  Layout,
  MapPin,
  Mail,
  Phone,
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
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15
    }
  }
};

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
  candidateType?: { id: string; name: string };
  subject?: { id: string; name: string };
  teacher?: { 
    user?: { name?: string; email?: string };
    platformName?: string;
    location?: string;
    photo?: string;
    education?: string;
    phone?: string;
  };
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
  const [activeExamType, setActiveExamType] = useState<string>('all');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState<BundleItem | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad'>('bkash');
  const [transactionId, setTransactionId] = useState('');
  const [senderNumber, setSenderNumber] = useState('');
  const [selectedExamIdsForPayment, setSelectedExamIdsForPayment] = useState<string[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<BundleItem['teacher'] | null>(null);

  const { data: examTypes = [], isLoading: isExamTypesLoading } = useQuery({
    queryKey: ['examtypes'],
    queryFn: async () => {
      const response = await axiosInstance.get('/examtype');
      const list = response.data as ExamType[];
      const allTypes = [{ id: 'all', name: 'All Exams' }, ...list];
      if (!activeExamType || activeExamType === '') {
        setActiveExamType('all');
      }
      return allTypes;
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
      toast.success('Payment submitted. You can access the exam once approved.');
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
    let list = bundles;
    if (activeExamType && activeExamType !== 'all') {
      list = list.filter((item) => item.examType?.id === activeExamType);
    }
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
      toast.error('Please fill in all details');
      return;
    }
    requestPaymentMutation.mutate();
  };

  return (
    <DashboardLayout>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-10 max-w-7xl mx-auto relative"
      >
        {/* Background Decorative Glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Header & Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <motion.div variants={itemVariants} className="relative">
            <div className="absolute -left-4 top-0 w-1.5 h-full bg-gradient-to-b from-primary to-accent rounded-full hidden md:block" />
            <h1 className="text-3xl md:text-5xl font-display font-black tracking-tight text-text-primary">All Exams</h1>
            <p className="text-text-secondary mt-2 text-base md:text-lg">Explore and enroll in subjects or model tests</p>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-auto group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search exams..." 
                className="bg-bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl py-3.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all w-full md:w-auto md:min-w-[340px] shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 h-[52px]">
              <div className="relative">
                <select 
                  className="bg-bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl pl-4 pr-10 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all h-full appearance-none cursor-pointer"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option>All Types</option>
                  <option>Free Only</option>
                  <option>Paid Only</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">
                  <Layout className="w-4 h-4" />
                </div>
              </div>

              <div className="relative">
                <select 
                  className="bg-bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl pl-4 pr-10 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all h-full appearance-none cursor-pointer"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option>Default Sort</option>
                  <option>Price: Low-High</option>
                  <option>Price: High-Low</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Exam Type Tabs */}
        <motion.div variants={itemVariants} className="flex flex-wrap gap-2 p-2 bg-bg-card/20 backdrop-blur-xl border border-border/40 rounded-[24px] w-fit relative z-10">
          {examTypes.map((type) => {
            const isActive = activeExamType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => setActiveExamType(type.id)}
                className={cn(
                  'relative px-10 py-3 rounded-[20px] text-sm font-black transition-all duration-300',
                  isActive ? 'text-white' : 'text-text-secondary hover:text-text-primary'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-primary to-primary-light rounded-[20px] shadow-lg shadow-primary/30"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{type.name}</span>
              </button>
            );
          })}
        </motion.div>

        {/* Bundle Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary animate-pulse" />
              </div>
            </div>
            <p className="text-text-secondary font-bold animate-pulse">Loading exams...</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 relative z-10">
            {filteredBundles.map((bundle) => (
              (() => {
                const isPurchased =
                  bundle.type === 'subject'
                    ? purchasedSubjectIds.has(bundle.id)
                    : purchasedModelTestIds.has(bundle.id);
                return (
              <motion.div key={`${bundle.type}-${bundle.id}`} variants={itemVariants} className="h-full">
                <Card className="group h-full border-border/50 bg-bg-card/40 backdrop-blur-xl flex flex-col hover:bg-bg-card/70 hover:shadow-[0_20px_50px_rgba(0,82,204,0.15)] hover:-translate-y-2 transition-all duration-500 rounded-[32px] overflow-hidden border-2 hover:border-primary/30">
                  <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity rotate-12 scale-150">
                    <BookOpen className="w-24 h-24" />
                  </div>
                  
                  <CardHeader className="relative z-10 p-6 pb-2">
                    <div className="flex justify-between items-center mb-4">
                      <Badge className={cn(
                        "font-black px-4 py-1.5 rounded-xl text-[11px] shadow-sm",
                        bundle.isFree ? 'bg-success/10 text-success border-success/20' : 'bg-accent/10 text-accent border-accent/20'
                      )}>
                        {bundle.isFree ? 'FREE ACCESS' : `৳${Math.floor(bundle.price / 100)}`}
                      </Badge>
                      <div 
                        className="flex items-center gap-2 group/teacher cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setSelectedTeacher(bundle.teacher)}
                      >
                        {bundle.teacher?.photo && (
                          <div className="w-8 h-8 rounded-full border border-border/50 overflow-hidden shadow-sm ring-2 ring-primary/10 group-hover/teacher:ring-primary/30 transition-all">
                            <img src={bundle.teacher.photo} alt={bundle.teacher?.user?.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="text-[11px] text-text-secondary font-black flex flex-col">
                          <span className="text-text-primary group-hover/teacher:text-primary transition-colors">{bundle.teacher?.user?.name || 'Teacher'}</span>
                          {bundle.teacher?.platformName && <span className="text-[9px] opacity-70 italic">{bundle.teacher.platformName}</span>}
                        </div>
                      </div>
                    </div>
                    
                    <CardTitle className="text-xl font-display font-black text-text-primary group-hover:text-primary transition-colors leading-tight mb-3">
                      {bundle.name}
                    </CardTitle>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest bg-bg-surface/40 border-border/60 text-text-secondary px-3 py-1 rounded-lg">
                        {bundle.type === 'subject' ? 'Subject' : 'Model Test'}
                      </Badge>
                      {bundle.candidateType?.name && (
                        <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest bg-primary/5 border-primary/20 text-primary px-3 py-1 rounded-lg">
                          {bundle.candidateType.name}
                        </Badge>
                      )}
                    </div>
                    
                    {!bundle.isFree && (
                      <div className="mt-4 p-4 rounded-2xl bg-bg-surface/40 border border-border/50">
                        {isPurchased ? (
                          <div className="flex items-center gap-2.5 text-success font-black text-sm">
                             <div className="w-2 h-2 rounded-full bg-success animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" /> 
                             Purchased & Unlocked
                          </div>
                        ) : (
                          <div className="flex items-center gap-2.5 text-warning font-black text-sm">
                             <div className="w-2 h-2 rounded-full bg-warning shadow-[0_0_8px_rgba(234,179,8,0.3)]" /> 
                             Not Purchased
                          </div>
                        )}
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className="flex-1 relative z-10 px-6 py-2">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-bg-surface/50 to-bg-surface/30 border border-border/40 flex items-center justify-between group-hover:border-primary/20 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                          <Layout className="w-4 h-4" />
                        </div>
                        <div className="text-xs font-black text-text-secondary uppercase tracking-wider">Content</div>
                      </div>
                      <div className="text-lg font-black text-text-primary">{bundleExamCounts[getBundleKey(bundle.type, bundle.id)] || 0} Exams</div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex gap-3 relative z-10 p-6 pt-1">
                    <Button
                      onClick={() => handleOpenBundle(bundle)}
                      className="flex-1 bg-primary hover:bg-primary-light text-white font-black rounded-2xl h-12 transition-all shadow-xl shadow-primary/20 text-sm group/btn overflow-hidden relative"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        Browse Exams <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </span>
                    </Button>
                    {!bundle.isFree && !isPurchased && (
                      <Button
                        onClick={() => handleOpenPayment(bundle)}
                        variant="outline"
                        className="rounded-2xl h-12 w-12 p-0 border-2 border-border/60 bg-bg-surface/50 hover:bg-bg-surface hover:border-primary/40 transition-all flex items-center justify-center"
                      >
                        <ShoppingBag className="w-5 h-5 text-text-primary" />
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
                );
              })()
            ))}
          </div>
        )}
      </motion.div>

        {!isLoading && filteredBundles.length === 0 && (
          <div className="text-center text-text-secondary py-10">
            No items found for this exam type.
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
          <DialogContent className="bg-bg-card/90 backdrop-blur-2xl border-border/50 sm:max-w-[480px] rounded-[32px] overflow-hidden p-0">
            <div className="relative h-24 bg-gradient-to-r from-primary/20 to-accent/20">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg">
                  <Smartphone className="w-6 h-6 text-primary" />
                </div>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="text-center space-y-1">
                <DialogTitle className="text-2xl font-display font-black text-text-primary">Make Payment</DialogTitle>
                <DialogDescription className="text-text-secondary font-bold">
                  {selectedBundle ? (
                    <>Selected: <span className="text-primary font-black uppercase tracking-tight">{selectedBundle.name}</span></>
                  ) : (
                    <>Bulk Purchase: <span className="text-primary font-black tracking-tight">{selectedExamIdsForPayment.length} Exams Selected</span></>
                  )}
                  <div className="mt-1 text-accent font-black">Amount: ৳{Math.floor(paymentAmountInPaisa / 100)}</div>
                </DialogDescription>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bkash')}
                    className={cn(
                      "flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all",
                      paymentMethod === 'bkash' ? "border-primary bg-primary/5 text-primary" : "border-border/40 bg-bg-surface/50 text-text-secondary hover:border-border"
                    )}
                  >
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", paymentMethod === 'bkash' ? "bg-primary text-white" : "bg-bg-card")}>
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <span className="font-black text-sm uppercase tracking-wider">bKash</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('nagad')}
                    className={cn(
                      "flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all",
                      paymentMethod === 'nagad' ? "border-primary bg-primary/5 text-primary" : "border-border/40 bg-bg-surface/50 text-text-secondary hover:border-border"
                    )}
                  >
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", paymentMethod === 'nagad' ? "bg-primary text-white" : "bg-bg-card")}>
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <span className="font-black text-sm uppercase tracking-wider">Nagad</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-bg-surface/50 border border-border/40 space-y-2">
                  <div className="flex justify-between items-center text-xs font-black text-text-secondary uppercase tracking-widest">
                    <span>Send Money Number</span>
                    <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20 text-[9px] px-2 py-0">Official</Badge>
                  </div>
                  <div className="text-xl font-display font-black text-text-primary tracking-widest text-center py-2">
                    {paymentInstructions?.[paymentMethod]?.number || '01581782193'}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <input
                      className="w-full bg-bg-surface/50 border border-border/40 rounded-2xl py-3.5 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all shadow-sm"
                      placeholder="Transaction ID"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                    />
                  </div>
                  <div className="relative">
                    <input
                      className="w-full bg-bg-surface/50 border border-border/40 rounded-2xl py-3.5 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all shadow-sm"
                      placeholder="Sender Number (01XXXXXXXXX)"
                      value={senderNumber}
                      onChange={(e) => setSenderNumber(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="ghost" className="flex-1 rounded-2xl h-12 font-bold" onClick={() => setIsPaymentModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="flex-[2] bg-primary hover:bg-primary-light text-white font-black rounded-2xl h-12 shadow-xl shadow-primary/20"
                  onClick={handlePaymentSubmit}
                  disabled={requestPaymentMutation.isPending}
                >
                  {requestPaymentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Payment Submit"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={!!selectedTeacher} onOpenChange={(open) => !open && setSelectedTeacher(null)}>
          <DialogContent className="bg-bg-card/90 backdrop-blur-2xl border-border/50 sm:max-w-[480px] rounded-[32px] overflow-hidden p-0">
            <div className="relative h-32 bg-gradient-to-r from-primary/20 to-accent/20">
              <div className="absolute -bottom-12 left-8">
                <div className="w-24 h-24 rounded-3xl border-4 border-bg-card bg-bg-card shadow-2xl overflow-hidden">
                  {selectedTeacher?.photo ? (
                    <img src={selectedTeacher.photo} alt={selectedTeacher.user?.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                      <UserIcon className="w-10 h-10 text-primary" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="pt-16 px-8 pb-8 space-y-6">
              <div>
                <h3 className="text-2xl font-display font-black text-text-primary">{selectedTeacher?.user?.name}</h3>
                <p className="text-primary font-bold text-sm">{selectedTeacher?.platformName || 'Independent Instructor'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-bg-surface/50 border border-border/40 space-y-1">
                  <div className="text-[10px] uppercase font-black text-text-secondary tracking-widest">Education</div>
                  <div className="text-sm font-bold text-text-primary">{selectedTeacher?.education || 'N/A'}</div>
                </div>
                <div className="p-4 rounded-2xl bg-bg-surface/50 border border-border/40 space-y-1">
                  <div className="text-[10px] uppercase font-black text-text-secondary tracking-widest">Location</div>
                  <div className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-accent" /> {selectedTeacher?.location || 'Global'}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-bg-surface/30 border border-border/40 group hover:bg-bg-surface/50 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] uppercase font-black text-text-secondary tracking-widest">Email Address</div>
                    <div className="text-sm font-bold text-text-primary break-all">{selectedTeacher?.user?.email || 'ashikurovi.ph@gmail.com'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-2xl bg-bg-surface/30 border border-border/40 group hover:bg-bg-surface/50 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] uppercase font-black text-text-secondary tracking-widest">Phone Number</div>
                    <div className="text-sm font-bold text-text-primary">{selectedTeacher?.phone || '01581782193'}</div>
                  </div>
                </div>
              </div>

              <Button className="w-full bg-primary hover:bg-primary-light text-white font-black rounded-2xl h-12 shadow-xl shadow-primary/20" onClick={() => setSelectedTeacher(null)}>
                Close Profile
              </Button>
            </div>
          </DialogContent>
        </Dialog>

    </DashboardLayout>
  );
}
