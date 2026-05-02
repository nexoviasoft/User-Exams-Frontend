'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  PlusCircle, 
  Trash2, 
  Loader2,
  FileBadge,
  DollarSign,
  Edit2,
  Eye,
  Target,
  Sparkles,
  Layers,
  Users,
  BookOpen,
  Globe,
  Zap,
  Info,
  FileText,
  Pencil
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
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

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
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

interface ModelTest {
  id: string;
  name: string;
  price: number;
  isFree: boolean;
  isPublic: boolean;
  examType: { id: string; name: string };
  candidateType: { id: string; name: string };
  subject?: { id: string; name: string };
}

export default function ModelTestsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModelTestId, setEditingModelTestId] = useState<string | null>(null);
  const [modelTestName, setModelTestName] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');
  const [selectedCandidateType, setSelectedCandidateType] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [isFree, setIsFree] = useState(true);
  const [isPublic, setIsPublic] = useState(false);
  const [price, setPrice] = useState('0');
  const [testToDelete, setTestToDelete] = useState<ModelTest | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: modelTests = [], isLoading } = useQuery<ModelTest[]>({
    queryKey: ['teacher-modeltests'],
    queryFn: async () => {
      const response = await axiosInstance.get('/modeltest');
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

  const { data: subjects = [] } = useQuery({
    queryKey: ['teacher-subjects'],
    queryFn: async () => {
      const response = await axiosInstance.get('/subject');
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.post('/modeltest', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-modeltests'] });
      toast.success('Model test created successfully');
      setIsModalOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error('Failed to create model test');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await axiosInstance.patch(`/modeltest/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-modeltests'] });
      toast.success('Model test updated successfully');
      setIsModalOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error('Update failed');
    },
  });

  const resetForm = () => {
    setEditingModelTestId(null);
    setModelTestName('');
    setSelectedExamType('');
    setSelectedCandidateType('');
    setSelectedSubject('');
    setIsFree(true);
    setIsPublic(false);
    setPrice('0');
  };

  const handleCreateModelTest = () => {
    if (!modelTestName || !selectedExamType || !selectedCandidateType) {
      toast.error('Please fill all required fields');
      return;
    }
    if (!isFree && (!price || Number(price) <= 0)) {
      toast.error('Please enter a valid price for paid tests');
      return;
    }
    const payload = {
      name: modelTestName,
      examTypeId: selectedExamType,
      candidateTypeId: selectedCandidateType,
      subjectId: selectedSubject || undefined,
      isFree,
      isPublic,
      price: isFree ? 0 : parseInt(price || '0') * 100,
    };

    if (editingModelTestId) {
      updateMutation.mutate({ id: editingModelTestId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleEditModelTest = (modelTest: ModelTest) => {
    setEditingModelTestId(modelTest.id);
    setModelTestName(modelTest.name);
    setSelectedExamType(modelTest.examType?.id || '');
    setSelectedCandidateType(modelTest.candidateType?.id || '');
    setSelectedSubject(modelTest.subject?.id || '');
    setIsFree(modelTest.isFree);
    setIsPublic(modelTest.isPublic);
    setPrice(String(Math.round((modelTest.price || 0) / 100)));
    setIsModalOpen(true);
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/modeltest/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-modeltests'] });
      toast.success('Model test deleted');
      setIsDeleteConfirmOpen(false);
      setTestToDelete(null);
    },
    onError: () => {
      toast.error('Failed to delete package');
    }
  });

  const confirmDelete = () => {
    if (testToDelete) {
      deleteMutation.mutate(testToDelete.id);
    }
  };

  return (
    <DashboardLayout>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-full mx-auto space-y-6 relative px-4 pb-20"
      >
        {/* Background Decorative Glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black px-3 py-1 rounded-lg uppercase tracking-widest text-[9px]">
                Package Architect
              </Badge>
            </div>
            <h1 className="text-2xl md:text-4xl font-display font-black tracking-tight text-text-primary leading-tight">
              My <span className="text-primary">Model Tests</span> 🎯
            </h1>
            <p className="text-text-secondary text-sm max-w-2xl font-medium">
              Bundle subjects and exams into comprehensive preparation packages.
            </p>
          </div>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary-light text-white rounded-xl h-10 px-6 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 transition-all hover:-translate-y-1"
          >
            <PlusCircle className="w-4 h-4 mr-2" /> New Model Test
          </Button>
        </motion.div>

        {/* Content Section */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary opacity-20" />
            <p className="text-text-secondary font-black animate-pulse uppercase tracking-widest text-xs">Loading packages...</p>
          </div>
        ) : modelTests.length === 0 ? (
          <motion.div variants={itemVariants} className="text-center py-32 bg-bg-card/40 backdrop-blur-xl rounded-[28px] border-2 border-border/50 border-dashed">
            <div className="w-20 h-20 bg-bg-surface rounded-full flex items-center justify-center mx-auto opacity-10 mb-6">
              <Target className="w-10 h-10" />
            </div>
            <p className="text-text-secondary font-black uppercase tracking-widest text-sm">No packages found. Create your first preparation bundle.</p>
          </motion.div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 relative z-10">
            {modelTests.map((modelTest) => (
              <motion.div key={modelTest.id} variants={itemVariants} whileHover={{ y: -5 }} className="h-full">
                <Card className="group h-full border-border/50 bg-bg-card/40 backdrop-blur-xl flex flex-col hover:bg-bg-card/70 transition-all duration-500 rounded-[28px] overflow-hidden border-2 shadow-2xl relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-accent/10 transition-colors" />
                  
                  <CardHeader className="p-6 pb-2 relative z-10">
                    <div className="flex items-start justify-between">
                      <div className="relative">
                         <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                         <div className="relative p-3 rounded-[18px] bg-gradient-to-br from-bg-surface to-bg-card border border-border/40 text-accent shadow-inner">
                            <Target className="w-5 h-5" />
                         </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <Badge className={cn(
                          "font-black px-2.5 py-1 rounded-lg text-[9px] uppercase tracking-[0.15em] shadow-lg shadow-black/5", 
                          modelTest.isFree ? "bg-success text-white" : "bg-accent text-white"
                        )}>
                          {modelTest.isFree ? 'FREE' : `৳${Math.round((modelTest.price || 0) / 100)}`}
                        </Badge>
                        <Badge variant="outline" className="bg-white/40 backdrop-blur-md border-border/40 text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest opacity-60">
                          {modelTest.isPublic ? 'Public Package' : 'Internal Use'}
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-xl font-display font-black text-text-primary mt-5 group-hover:text-primary transition-colors line-clamp-1 tracking-tight">{modelTest.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-3 flex-1 relative z-10">
                    <div className="grid grid-cols-2 gap-3">
                       <div className="p-3 rounded-2xl bg-bg-surface/50 border border-border/20 flex flex-col gap-1 hover:border-primary/20 transition-colors">
                          <BookOpen className="w-3.5 h-3.5 text-primary/50" />
                          <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary opacity-50">Type</p>
                          <p className="text-[10px] font-black text-text-primary truncate">{modelTest.examType?.name || 'Academic'}</p>
                       </div>
                       <div className="p-3 rounded-2xl bg-bg-surface/50 border border-border/20 flex flex-col gap-1 hover:border-primary/20 transition-colors">
                          <Layers className="w-3.5 h-3.5 text-accent/50" />
                          <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary opacity-50">Scope</p>
                          <p className="text-[10px] font-black text-text-primary truncate">{modelTest.candidateType?.name || 'Professional'}</p>
                       </div>
                    </div>
                    {modelTest.subject && (
                       <div className="mt-3 p-3 rounded-2xl bg-success/5 border border-success/10 flex items-center gap-3">
                          <FileText className="w-3.5 h-3.5 text-success/50" />
                          <p className="text-[10px] font-bold text-text-secondary truncate">{modelTest.subject.name}</p>
                       </div>
                    )}
                  </CardContent>
                  <CardFooter className="p-6 pt-0 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-2">
                      <Link href={`/teacher/model-tests/${modelTest.id}/exams`}>
                        <Button className="bg-bg-surface border border-border/40 hover:bg-primary hover:text-white text-text-primary w-9 h-9 rounded-xl transition-all shadow-sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button 
                        onClick={() => handleEditModelTest(modelTest)}
                        className="bg-bg-surface border border-border/40 hover:bg-accent hover:text-white text-text-primary w-9 h-9 rounded-xl transition-all shadow-sm"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button 
                      onClick={() => {
                        setTestToDelete(modelTest);
                        setIsDeleteConfirmOpen(true);
                      }}
                      className="bg-bg-surface border border-border/40 hover:bg-danger hover:text-white text-text-primary w-9 h-9 rounded-xl transition-all shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Modal / Dialog */}
        <Dialog open={isModalOpen} onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) resetForm();
        }}>
          <DialogContent className="bg-bg-card/90 backdrop-blur-2xl border-border/50 sm:max-w-[500px] rounded-[32px] overflow-hidden p-0 shadow-2xl">
            <div className="relative h-24 bg-gradient-to-r from-primary/20 to-accent/20">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg">
                  {editingModelTestId ? <Edit2 className="w-6 h-6 text-primary" /> : <PlusCircle className="w-6 h-6 text-primary" />}
                </div>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="text-center space-y-1">
                <DialogTitle className="text-2xl font-display font-black text-text-primary">
                  {editingModelTestId ? 'Update Model Test' : 'New Model Test'}
                </DialogTitle>
                <DialogDescription className="text-text-secondary font-medium">
                  {editingModelTestId ? 'Refine your package settings and metadata.' : 'Bundle exams into a comprehensive mock test.'}
                </DialogDescription>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Package Name</label>
                  <div className="relative group">
                    <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors" />
                    <input 
                      type="text" 
                      placeholder="e.g., Final Mock Exam 2024" 
                      className="w-full bg-bg-surface/50 border border-border/40 rounded-[14px] h-12 pl-11 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-text-primary placeholder:text-text-secondary/30"
                      value={modelTestName}
                      onChange={(e) => setModelTestName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Exam Type</label>
                    <div className="relative group">
                      <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors" />
                      <select 
                        className="w-full bg-bg-surface/50 border border-border/40 rounded-[14px] h-12 pl-11 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none cursor-pointer"
                        value={selectedExamType}
                        onChange={(e) => setSelectedExamType(e.target.value)}
                      >
                        <option value="">Select...</option>
                        {examTypes.map((et: any) => (
                          <option key={et.id} value={et.id}>{et.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Candidate</label>
                    <div className="relative group">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors" />
                      <select 
                        className="w-full bg-bg-surface/50 border border-border/40 rounded-[14px] h-12 pl-11 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none cursor-pointer"
                        value={selectedCandidateType}
                        onChange={(e) => setSelectedCandidateType(e.target.value)}
                      >
                        <option value="">Select...</option>
                        {candidateTypes.map((ct: any) => (
                          <option key={ct.id} value={ct.id}>{ct.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Parent Subject (Optional)</label>
                  <div className="relative group">
                    <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors" />
                    <select 
                      className="w-full bg-bg-surface/50 border border-border/40 rounded-[14px] h-12 pl-11 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none cursor-pointer"
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                    >
                      <option value="">None (Independent Package)</option>
                      {subjects.map((s: any) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div 
                    onClick={() => setIsFree(!isFree)}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all cursor-pointer group",
                      isFree ? "bg-primary/5 border-primary/40" : "bg-bg-surface/50 border-border/40 opacity-60 grayscale-[0.5]"
                    )}
                  >
                    <Zap className={cn("w-5 h-5 mb-2 transition-transform group-hover:scale-110", isFree ? "text-primary" : "text-text-secondary")} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Free Access</span>
                  </div>

                  <div 
                    onClick={() => setIsPublic(!isPublic)}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all cursor-pointer group",
                      isPublic ? "bg-success/5 border-success/40" : "bg-bg-surface/50 border-border/40 opacity-60 grayscale-[0.5]"
                    )}
                  >
                    <Globe className={cn("w-5 h-5 mb-2 transition-transform group-hover:scale-110", isPublic ? "text-success" : "text-text-secondary")} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Publicity</span>
                  </div>
                </div>

                <AnimatePresence>
                  {!isFree && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-1.5"
                    >
                      <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Price (Taka)</label>
                      <div className="relative group">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-accent transition-colors" />
                        <input 
                          type="number" 
                          placeholder="e.g., 500" 
                          className="w-full bg-bg-surface/50 border border-border/40 rounded-[14px] h-12 pl-11 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-accent/40 text-text-primary"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  variant="ghost" 
                  className="flex-1 rounded-[14px] h-12 font-bold" 
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateModelTest}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-[2] bg-primary hover:bg-primary-light text-white font-black rounded-[14px] h-12 shadow-xl shadow-primary/20"
                >
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      {editingModelTestId ? 'Update Package' : 'Create Package'}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
          <DialogContent className="bg-bg-card/90 backdrop-blur-2xl border-border/50 sm:max-w-[400px] rounded-[32px] overflow-hidden p-0 shadow-2xl">
            <div className="relative h-20 bg-danger/10 flex items-center justify-center">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg">
                <Trash2 className="w-5 h-5 text-danger" />
              </div>
            </div>
            <div className="p-8 space-y-6">
              <div className="text-center space-y-2">
                <DialogTitle className="text-xl font-display font-black text-text-primary uppercase tracking-tight">
                  Confirm Deletion
                </DialogTitle>
                <DialogDescription className="text-text-secondary font-medium text-xs leading-relaxed">
                  Are you sure you want to delete <span className="text-text-primary font-black">"{testToDelete?.name}"</span>? 
                  This action is permanent and will remove all associated exams and data.
                </DialogDescription>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="ghost" 
                  className="flex-1 rounded-xl h-12 font-bold text-[10px] uppercase tracking-widest" 
                  onClick={() => setIsDeleteConfirmOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={confirmDelete}
                  disabled={deleteMutation.isPending}
                  className="flex-1 bg-danger hover:bg-danger/80 text-white font-black rounded-xl h-12 shadow-xl shadow-danger/20 text-[10px] uppercase tracking-widest"
                >
                  {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Delete'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </DashboardLayout>
  );
}
