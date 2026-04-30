'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Database, 
  PlusCircle, 
  Edit2, 
  Trash2, 
  Eye, 
  Lock, 
  Globe,
  Loader2
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
import { cn } from '@/lib/utils';

export default function QuestionBanksPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [bankName, setBankName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  const [banks, setBanks] = useState([
    { id: '1', name: 'BCS English Literature', questions: 120, isPublic: true, description: 'Questions covering 1500-present' },
    { id: '2', name: 'Medical Biology (Zoology)', questions: 85, isPublic: false, description: 'HSC standard Zoology questions' },
    { id: '3', name: 'University Math KA Unit', questions: 45, isPublic: true, description: 'Previous year admission questions' },
  ]);

  const handleCreateBank = async () => {
    if (!bankName) {
      toast.error('ব্যাংকের নাম দিন');
      return;
    }
    setIsLoading(true);
    try {
      // Simulation
      await new Promise(resolve => setTimeout(resolve, 1500));
      const newBank = {
        id: Math.random().toString(),
        name: bankName,
        questions: 0,
        isPublic,
        description
      };
      setBanks([newBank, ...banks]);
      toast.success('Question Bank তৈরি হয়েছে!');
      setIsModalOpen(false);
      setBankName('');
      setDescription('');
    } catch (error) {
      toast.error('সমস্যা হয়েছে, আবার চেষ্টা করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">Question Banks 📚</h1>
            <p className="text-text-secondary mt-1">আপনার সব প্রশ্নের সংগ্রহশালা এখানে পরিচালনা করুন।</p>
          </div>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary-light text-white rounded-xl h-12 px-6 font-bold shadow-lg"
          >
            <PlusCircle className="w-5 h-5 mr-2" /> নতুন Bank তৈরি
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {banks.map((bank) => (
            <Card key={bank.id} className="border-border bg-bg-card/50 hover:border-primary/30 transition-all flex flex-col group">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    <Database className="w-3 h-3 mr-1" /> {bank.questions} Questions
                  </Badge>
                  <Badge className={cn(
                    bank.isPublic ? "bg-success/10 text-success" : "bg-text-secondary/10 text-text-secondary"
                  )}>
                    {bank.isPublic ? <Globe className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
                    {bank.isPublic ? 'Public' : 'Private'}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-display font-bold group-hover:text-primary transition-colors">
                  {bank.name}
                </CardTitle>
                <p className="text-xs text-text-secondary mt-2 line-clamp-2">{bank.description}</p>
              </CardHeader>
              <CardFooter className="mt-auto border-t border-border/50 pt-4 flex gap-2">
                <Button className="flex-1 bg-bg-surface hover:bg-primary text-text-primary hover:text-white border border-border hover:border-primary rounded-xl transition-all">
                  Questions দেখো
                </Button>
                <Button variant="ghost" size="icon" className="text-text-secondary hover:text-primary rounded-xl">
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-text-secondary hover:text-danger rounded-xl">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Create Bank Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="bg-bg-card border-border sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-display font-bold">নতুন Question Bank</DialogTitle>
              <DialogDescription className="text-text-secondary">
                আপনার প্রশ্নের জন্য একটি নতুন ক্যাটাগরি বা ব্যাংক তৈরি করুন।
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary ml-1">ব্যাংকের নাম</label>
                <input 
                  type="text" 
                  placeholder="যেমন: BCS English Grammar" 
                  className="w-full bg-bg-surface border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary ml-1">বিবরণ (ঐচ্ছিক)</label>
                <textarea 
                  placeholder="এই ব্যাংকে কী ধরণের প্রশ্ন থাকবে..." 
                  className="w-full bg-bg-surface border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[100px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-bg-surface border border-border">
                <div className="flex items-center gap-3">
                  <Globe className={cn("w-5 h-5", isPublic ? "text-primary" : "text-text-secondary")} />
                  <div>
                    <p className="text-sm font-bold">Public Bank?</p>
                    <p className="text-[10px] text-text-secondary">অন্য টিচাররা আপনার প্রশ্ন দেখতে পারবে</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPublic(!isPublic)}
                  className={cn(
                    "w-12 h-6 rounded-full relative transition-all duration-300",
                    isPublic ? "bg-primary" : "bg-bg-card"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                    isPublic ? "left-7" : "left-1"
                  )} />
                </button>
              </div>
            </div>

            <DialogFooter>
              <Button 
                onClick={handleCreateBank}
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary-light text-white font-bold h-12 rounded-xl"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : 'Bank তৈরি করো'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
