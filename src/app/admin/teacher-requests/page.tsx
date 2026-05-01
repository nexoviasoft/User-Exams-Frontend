'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  UserPlus, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Mail,
  Phone,
  BookOpen,
  Monitor,
  MapPin,
  PlusCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useApproveTeacherRequestMutation,
  useCreateTeacherRequestMutation,
  useGetApprovedTeacherRequestsQuery,
  useGetPendingTeacherRequestsQuery,
  useRejectTeacherRequestMutation,
} from '@/store/slices/api/adminApi';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';

export default function TeacherRequestsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'Pending' | 'Approved'>('Pending');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    education: '',
    platformName: '',
    location: '',
    photo: '',
  });

  const {
    data: pendingRequests = [],
    isLoading: isPendingLoading,
    isError: isPendingError,
  } = useGetPendingTeacherRequestsQuery();
  const {
    data: approvedRequests = [],
    isLoading: isApprovedLoading,
    isError: isApprovedError,
  } = useGetApprovedTeacherRequestsQuery();
  const [approveTeacherRequest, { isLoading: isApproving }] = useApproveTeacherRequestMutation();
  const [rejectTeacherRequest, { isLoading: isRejecting }] = useRejectTeacherRequestMutation();
  const [createTeacherRequest, { isLoading: isCreating }] = useCreateTeacherRequestMutation();

  const handleApprove = async (id: string) => {
    try {
      await approveTeacherRequest(id).unwrap();
      toast.success('Teacher approved successfully!');
    } catch {
      toast.error('Failed to approve teacher.');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectTeacherRequest(id).unwrap();
      toast.success('Teacher request rejected.');
    } catch {
      toast.error('Failed to reject teacher.');
    }
  };

  useEffect(() => {
    if (isPendingError || isApprovedError) {
      toast.error('Failed to load requests.');
    }
  }, [isPendingError, isApprovedError]);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      education: '',
      platformName: '',
      location: '',
      photo: '',
    });
  };

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Name, Email, Password required');
      return;
    }

    try {
      await createTeacherRequest(formData).unwrap();
      toast.success('Teacher request created successfully!');
      setIsCreateModalOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to create teacher request.');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
              <UserPlus className="w-8 h-8 text-primary" /> Teacher Requests
            </h1>
            <p className="text-text-secondary mt-1">Review and approve new teacher registrations.</p>
          </div>

          <Dialog
            open={isCreateModalOpen}
            onOpenChange={(open) => {
              setIsCreateModalOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger render={<Button className="bg-primary hover:bg-primary/90 text-white rounded-xl gap-2" />}>
              <PlusCircle className="w-4 h-4" />
              Create Teacher
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px]">
              <DialogHeader>
                <DialogTitle>Create Teacher Request</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleCreateTeacher} className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Name *"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-bg-surface border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <input
                    type="email"
                    placeholder="Email *"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-bg-surface border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <input
                    type="password"
                    placeholder="Password *"
                    value={formData.password}
                    onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                    className="w-full bg-bg-surface border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <input
                    type="text"
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-bg-surface border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <input
                    type="text"
                    placeholder="Education"
                    value={formData.education}
                    onChange={(e) => setFormData((prev) => ({ ...prev, education: e.target.value }))}
                    className="w-full bg-bg-surface border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <input
                    type="text"
                    placeholder="Platform Name"
                    value={formData.platformName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, platformName: e.target.value }))}
                    className="w-full bg-bg-surface border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <input
                    type="text"
                    placeholder="Location"
                    value={formData.location}
                    onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                    className="w-full bg-bg-surface border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 md:col-span-2"
                  />
                  <input
                    type="text"
                    placeholder="Photo URL"
                    value={formData.photo}
                    onChange={(e) => setFormData((prev) => ({ ...prev, photo: e.target.value }))}
                    className="w-full bg-bg-surface border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 md:col-span-2"
                  />
                </div>

                <DialogFooter>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl" disabled={isCreating}>
                    {isCreating ? 'Creating...' : 'Create Teacher'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex bg-bg-card border border-border p-1 rounded-xl w-fit">
          {(['Pending', 'Approved'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                tab === t ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {t}
              {t === 'Pending' && pendingRequests.length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 rounded-full text-[10px] bg-accent text-white">
                  {pendingRequests.length}
                </span>
              )}
            </button>
          ))}
        </div>
        {(tab === 'Pending' ? isPendingLoading : isApprovedLoading) ? (
          <div className="flex justify-center p-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : (tab === 'Pending' ? isPendingError : isApprovedError) ? (
          <div className="text-center p-10 text-danger font-bold">
            Failed to load requests.
          </div>
        ) : (tab === 'Pending' ? pendingRequests : approvedRequests).length === 0 ? (
          <div className="text-center p-10 text-text-secondary bg-bg-card/50 rounded-xl border border-border">
            {tab === 'Pending' ? 'No pending teacher requests at the moment.' : 'No approved teachers yet.'}
          </div>
        ) : (
          <div className="grid gap-6">
            {(tab === 'Pending' ? pendingRequests : approvedRequests).map((request) => (
              <Card
                key={request.id}
                className={`border-border bg-bg-card/50 hover:border-primary/30 transition-all ${
                  tab === 'Approved' ? 'cursor-pointer' : ''
                }`}
                onClick={() => {
                  if (tab === 'Approved') {
                    router.push(`/admin/teacher-requests/earnings/${request.id}`);
                  }
                }}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                    
                    <div className="flex items-center gap-4">
                      {request.photo ? (
                        <img src={request.photo} alt={request.user.name} className="w-16 h-16 rounded-full object-cover border-2 border-primary/20" />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold">
                          {request.user.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h3 className="text-xl font-bold text-text-primary">{request.user.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-text-secondary mt-1">
                          <Mail className="w-3 h-3" /> {request.user.email}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm w-full md:w-auto">
                      <div className="flex flex-col gap-1">
                        <span className="text-text-secondary flex items-center gap-1"><Phone className="w-3 h-3" /> Phone</span>
                        <span className="font-medium">{request.phone || 'N/A'}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-text-secondary flex items-center gap-1"><BookOpen className="w-3 h-3" /> Education</span>
                        <span className="font-medium">{request.education || 'N/A'}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-text-secondary flex items-center gap-1"><Monitor className="w-3 h-3" /> Platform</span>
                        <span className="font-medium">{request.platformName || 'N/A'}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-text-secondary flex items-center gap-1"><MapPin className="w-3 h-3" /> Location</span>
                        <span className="font-medium">{request.location || 'N/A'}</span>
                      </div>
                    </div>

                    {tab === 'Pending' ? (
                      <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
                        <Button 
                          variant="outline" 
                          onClick={() => handleReject(request.id)}
                          disabled={isRejecting || isApproving}
                          className="flex-1 md:flex-none border-danger text-danger hover:bg-danger hover:text-white"
                        >
                          <XCircle className="w-4 h-4 mr-2" /> Reject
                        </Button>
                        <Button 
                          onClick={() => handleApprove(request.id)}
                          disabled={isApproving || isRejecting}
                          className="flex-1 md:flex-none bg-success hover:bg-success/90 text-white"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" /> Approve
                        </Button>
                      </div>
                    ) : (
                      <div className="w-full md:w-auto mt-4 md:mt-0">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-success/10 text-success border border-success/20">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Approved
                        </span>
                      </div>
                    )}

                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
