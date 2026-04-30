'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
  Calendar
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface TeacherRequest {
  id: string;
  phone: string;
  education: string;
  platformName: string;
  location: string;
  photo: string;
  user: {
    name: string;
    email: string;
    createdAt: string;
  };
}

export default function TeacherRequestsPage() {
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading, error } = useQuery<TeacherRequest[]>({
    queryKey: ['admin-teacher-requests'],
    queryFn: async () => {
      const response = await axiosInstance.get('/admin/teachers/pending');
      return response.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.post(`/admin/teachers/${id}/approve`);
    },
    onSuccess: () => {
      toast.success('Teacher approved successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-teacher-requests'] });
    },
    onError: () => {
      toast.error('Failed to approve teacher.');
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.post(`/admin/teachers/${id}/reject`);
    },
    onSuccess: () => {
      toast.success('Teacher request rejected.');
      queryClient.invalidateQueries({ queryKey: ['admin-teacher-requests'] });
    },
    onError: () => {
      toast.error('Failed to reject teacher.');
    }
  });

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-20">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
            <UserPlus className="w-8 h-8 text-primary" /> Teacher Requests
          </h1>
          <p className="text-text-secondary mt-1">Review and approve new teacher registrations.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center p-10 text-danger font-bold">
            Failed to load requests.
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center p-10 text-text-secondary bg-bg-card/50 rounded-xl border border-border">
            No pending teacher requests at the moment.
          </div>
        ) : (
          <div className="grid gap-6">
            {requests.map((request) => (
              <Card key={request.id} className="border-border bg-bg-card/50 hover:border-primary/30 transition-all">
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

                    <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
                      <Button 
                        variant="outline" 
                        onClick={() => rejectMutation.mutate(request.id)}
                        disabled={rejectMutation.isPending || approveMutation.isPending}
                        className="flex-1 md:flex-none border-danger text-danger hover:bg-danger hover:text-white"
                      >
                        <XCircle className="w-4 h-4 mr-2" /> Reject
                      </Button>
                      <Button 
                        onClick={() => approveMutation.mutate(request.id)}
                        disabled={approveMutation.isPending || rejectMutation.isPending}
                        className="flex-1 md:flex-none bg-success hover:bg-success/90 text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" /> Approve
                      </Button>
                    </div>

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
