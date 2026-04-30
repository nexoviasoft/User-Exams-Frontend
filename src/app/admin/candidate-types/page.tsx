'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Database,
  PlusCircle,
  Edit2,
  Trash2,
  Calendar,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';

interface CandidateType {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export default function CandidateTypesPage() {
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<CandidateType | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const queryClient = useQueryClient();

  // Fetch Candidate Types
  const { data: candidateTypes = [], isLoading } = useQuery<CandidateType[]>({
    queryKey: ['candidatetypes'],
    queryFn: async () => {
      const response = await axiosInstance.get('/candidatetype');
      return response.data;
    },
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: async (data: { name: string; description: string }) => {
      const response = await axiosInstance.post('/candidatetype', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidatetypes'] });
      toast.success('Candidate Type created successfully!');
      setIsAddModalOpen(false);
      setFormData({ name: '', description: '' });
    },
    onError: () => {
      toast.error('Failed to create Candidate Type.');
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; name: string; description: string }) => {
      const response = await axiosInstance.patch(`/candidatetype/${data.id}`, {
        name: data.name,
        description: data.description,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidatetypes'] });
      toast.success('Candidate Type updated successfully!');
      setIsEditModalOpen(false);
      setSelectedType(null);
      setFormData({ name: '', description: '' });
    },
    onError: () => {
      toast.error('Failed to update Candidate Type.');
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.delete(`/candidatetype/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidatetypes'] });
      toast.success('Candidate Type deleted successfully!');
    },
    onError: () => {
      toast.error('Failed to delete Candidate Type.');
    },
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Name is required');
      return;
    }
    createMutation.mutate(formData);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Name is required');
      return;
    }
    if (selectedType) {
      updateMutation.mutate({ id: selectedType.id, ...formData });
    }
  };

  const handleEditClick = (type: CandidateType) => {
    setSelectedType(type);
    setFormData({ name: type.name, description: type.description || '' });
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    if (confirm('Are you sure you want to delete this candidate type?')) {
      deleteMutation.mutate(id);
    }
  };

  const filteredTypes = candidateTypes.filter(type =>
    type.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">Candidate Types 🗂️</h1>
            <p className="text-text-secondary mt-1">Manage platform candidate categories and types.</p>
          </div>

          <div className="flex items-center gap-3">
             <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
               <input 
                 type="text" 
                 placeholder="Search types..." 
                 className="bg-bg-surface border border-border rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-w-[280px]"
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
               />
             </div>
             
             <Dialog open={isAddModalOpen} onOpenChange={(open) => {
               setIsAddModalOpen(open);
               if (!open) {
                 setFormData({ name: '', description: '' });
                 setSelectedType(null);
               }
             }}>
               <DialogTrigger render={<Button className="bg-primary hover:bg-primary/90 text-white rounded-xl gap-2" />}>
                   <PlusCircle className="w-4 h-4" />
                   Add New
               </DialogTrigger>
               <DialogContent className="sm:max-w-[425px]">
                 <DialogHeader>
                   <DialogTitle>Add Candidate Type</DialogTitle>
                 </DialogHeader>
                 <form onSubmit={handleAddSubmit} className="space-y-4 mt-4">
                   <div className="space-y-2">
                     <label className="text-sm font-medium text-text-primary">Name</label>
                     <input
                       type="text"
                       value={formData.name}
                       onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                       className="w-full bg-bg-surface border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                       placeholder="e.g. Science Group, Arts Group"
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-sm font-medium text-text-primary">Description (Optional)</label>
                     <textarea
                       value={formData.description}
                       onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                       className="w-full bg-bg-surface border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[100px]"
                       placeholder="Enter description..."
                     />
                   </div>
                   <DialogFooter>
                     <Button 
                        type="submit" 
                        className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl"
                        disabled={createMutation.isPending}
                     >
                       {createMutation.isPending ? 'Saving...' : 'Save Candidate Type'}
                     </Button>
                   </DialogFooter>
                 </form>
               </DialogContent>
             </Dialog>
          </div>
        </div>

        {/* Types Table */}
        <Card className="border-border bg-bg-card/50 overflow-hidden">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-surface text-text-secondary text-[10px] uppercase tracking-widest font-bold">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-text-secondary">
                      Loading candidate types...
                    </td>
                  </tr>
                ) : filteredTypes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-text-secondary">
                      No candidate types found. Add a new one.
                    </td>
                  </tr>
                ) : (
                  filteredTypes.map((type) => (
                    <tr key={type.id} className="text-sm hover:bg-bg-surface/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                            {type.name?.charAt(0) || '?'}
                          </div>
                          <div className="font-bold text-text-primary">{type.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-text-secondary max-w-[300px] truncate">
                         {type.description || '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                         <div className="flex items-center justify-end gap-2">
                           <Button 
                             variant="ghost" 
                             size="icon" 
                             className="text-text-secondary hover:text-primary rounded-lg"
                             onClick={() => handleEditClick(type)}
                           >
                             <Edit2 className="w-4 h-4" />
                           </Button>
                           <Button 
                             variant="ghost" 
                             size="icon" 
                             className="text-text-secondary hover:text-danger rounded-lg"
                             onClick={() => handleDeleteClick(type.id)}
                           >
                             <Trash2 className="w-4 h-4" />
                           </Button>
                         </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={(open) => {
        setIsEditModalOpen(open);
        if (!open) {
          setFormData({ name: '', description: '' });
          setSelectedType(null);
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Candidate Type</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-bg-surface border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g. Science Group, Arts Group"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Description (Optional)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-bg-surface border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[100px]"
                placeholder="Enter description..."
              />
            </div>
            <DialogFooter>
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Updating...' : 'Update Candidate Type'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </DashboardLayout>
  );
}
