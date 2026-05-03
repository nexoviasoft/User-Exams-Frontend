'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Camera, User, Mail, Phone, School, Building, CheckCircle2, Loader2, Sparkles, ShieldCheck, CreditCard } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';
import { useImgbbUpload } from '@/hooks/useImgbbUpload';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
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
      type: "spring" as const,
      stiffness: 100,
      damping: 15
    }
  }
};

type StudentProfileResponse = {
  id: string;
  name: string;
  email: string;
  role: string;
  student?: {
    id: string;
    phone?: string;
    institute?: string;
    department?: string;
    photo?: string;
    freeExamsRemaining?: number;
  } | null;
};

export default function StudentProfilePage() {
  const { uploadImage, isUploading } = useImgbbUpload();
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useQuery<StudentProfileResponse>({
    queryKey: ['student-profile'],
    queryFn: async () => (await axiosInstance.get('/auth/me')).data,
  });

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [institute, setInstitute] = useState('');
  const [department, setDepartment] = useState('');
  const [photo, setPhoto] = useState('');

  useEffect(() => {
    if (!profile) return;
    setName(profile.name || '');
    setPhone(profile.student?.phone || '');
    setInstitute(profile.student?.institute || '');
    setDepartment(profile.student?.department || '');
    setPhoto(profile.student?.photo || '');
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: async () =>
      (
        await axiosInstance.patch('/auth/student/profile', {
          name,
          phone,
          institute,
          department,
          photo,
        })
      ).data,
    onSuccess: async () => {
      toast.success('Profile updated');
      await refetchProfile();
    },
    onError: () => toast.error('Profile update failed'),
  });

  const handleProfilePhotoUpload = async (file?: File) => {
    if (!file) return;
    try {
      const uploadedUrl = await uploadImage(file);
      setPhoto(uploadedUrl);
      toast.success('Profile image uploaded');
    } catch (error: any) {
      toast.error(error?.message || 'Image upload failed');
    }
  };

  return (
    <DashboardLayout>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto space-y-4 md:space-y-6 pb-20 px-4 relative"
      >
        {/* Decorative Background Glows */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
        
        <motion.div variants={itemVariants} className="relative z-10 space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black px-2 py-0.5 rounded-lg uppercase tracking-widest text-[9px]">
              Account Settings
            </Badge>
          </div>
          <h1 className="text-xl md:text-3xl font-display font-black tracking-tight text-text-primary leading-tight flex items-center gap-3">
            My <span className="text-primary">Profile</span> <User className="w-6 h-6 md:w-8 md:h-8 text-primary/40" />
          </h1>
          <p className="text-text-secondary text-sm max-w-2xl font-medium">
            Update your personal and academic information.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="relative z-10">
          <Card className="border-border/50 bg-bg-card/40 backdrop-blur-xl rounded-[24px] overflow-hidden border-2 shadow-xl">
            <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Sparkles className="w-4 h-4" />
                </div>
                <CardTitle className="text-xl font-display font-black text-text-primary">Personal Information</CardTitle>
              </div>
              <Badge variant="outline" className="bg-success/5 border-success/20 text-success font-black px-3 py-1 rounded-lg uppercase tracking-widest text-[9px]">
                Active Student
              </Badge>
            </CardHeader>
            <CardContent className="p-5 space-y-6">
              {profileLoading ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-4">
                   <Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" />
                   <p className="text-text-secondary font-black animate-pulse uppercase tracking-widest text-[9px]">Fetching Profile...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Photo Upload Section */}
                  <div className="flex flex-col md:flex-row items-center gap-6 p-4 rounded-[20px] bg-bg-surface/30 border border-border/40 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="relative z-10">
                      <div className="w-24 h-24 rounded-[24px] p-1 bg-gradient-to-br from-primary/50 to-accent/50 shadow-xl">
                        <div className="w-full h-full bg-bg-card rounded-[20px] overflow-hidden border-2 border-bg-card">
                          <img
                            src={photo || 'https://api.dicebear.com/7.x/avataaars/svg?seed=student'}
                            alt="Student profile"
                            className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                          />
                        </div>
                      </div>
                      <label className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center shadow-xl cursor-pointer hover:scale-110 active:scale-95 transition-all">
                        <Camera className="w-5 h-5" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleProfilePhotoUpload(e.target.files?.[0])}
                          disabled={isUploading}
                        />
                      </label>
                    </div>

                    <div className="space-y-1.5 flex-1 text-center md:text-left z-10">
                      <div>
                        <h3 className="text-lg font-black text-text-primary flex items-center justify-center md:justify-start gap-2">
                          Profile Photo <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                        </h3>
                        <p className="text-text-secondary text-[11px] font-medium leading-relaxed">
                          Use a clear profile picture. Maximum size 5MB.
                        </p>
                      </div>
                      {isUploading && (
                        <div className="flex items-center gap-2 text-primary font-black text-[9px] uppercase tracking-widest animate-pulse">
                          <Loader2 className="w-3 h-3 animate-spin" /> Uploading Image...
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Form Grid */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1.5 group">
                      <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary ml-3 flex items-center gap-2">
                        <User className="w-2.5 h-2.5" /> Full Name
                      </label>
                      <div className="relative">
                        <input
                          className="w-full bg-bg-surface/50 border border-border/40 rounded-[14px] h-11 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all font-black text-text-primary placeholder:text-text-secondary/30"
                          placeholder="Enter your name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 opacity-70 group">
                      <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary ml-3 flex items-center gap-2">
                        <Mail className="w-2.5 h-2.5" /> Email Address
                      </label>
                      <div className="relative">
                        <input
                          className="w-full bg-bg-card/20 border border-border/40 rounded-[14px] h-11 px-4 text-sm font-black text-text-primary cursor-not-allowed"
                          value={profile?.email || ''}
                          readOnly
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          <ShieldCheck className="w-4 h-4 text-success/60" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 group">
                      <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary ml-3 flex items-center gap-2">
                        <Phone className="w-2.5 h-2.5" /> Phone Number
                      </label>
                      <div className="relative">
                        <input
                          className="w-full bg-bg-surface/50 border border-border/40 rounded-[14px] h-11 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all font-black text-text-primary placeholder:text-text-secondary/30"
                          placeholder="Enter phone number"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 group">
                      <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary ml-3 flex items-center gap-2">
                        <School className="w-2.5 h-2.5" /> Educational Institute
                      </label>
                      <div className="relative">
                        <input
                          className="w-full bg-bg-surface/50 border border-border/40 rounded-[14px] h-11 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all font-black text-text-primary placeholder:text-text-secondary/30"
                          placeholder="Enter your institute"
                          value={institute}
                          onChange={(e) => setInstitute(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 md:col-span-2 group">
                      <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary ml-3 flex items-center gap-2">
                        <Building className="w-2.5 h-2.5" /> Department
                      </label>
                      <div className="relative">
                        <input
                          className="w-full bg-bg-surface/50 border border-border/40 rounded-[14px] h-11 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all font-black text-text-primary placeholder:text-text-secondary/30"
                          placeholder="Enter department name"
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Special Status Section */}
                  <div className="p-5 rounded-[20px] border border-primary/20 bg-primary/5 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden shadow-inner">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                      <CreditCard className="w-24 h-24 text-primary" />
                    </div>
                    <div className="flex items-center gap-4 z-10">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-lg">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-black text-text-primary">Free Exam Access</h4>
                        <p className="text-text-secondary text-[10px] font-medium leading-none">You still have free exams left in your account.</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-center sm:items-end gap-0 z-10">
                      <span className="text-3xl font-display font-black text-primary leading-none">{profile?.student?.freeExamsRemaining ?? 0}</span>
                      <span className="text-[9px] font-black text-text-secondary uppercase tracking-[0.2em] mt-1">Exams Left</span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-border/20">
                    <Button 
                      className="w-full sm:w-auto bg-primary hover:bg-primary-light text-white font-black px-10 h-12 rounded-xl shadow-xl shadow-primary/20 transition-all active:scale-95 text-xs uppercase tracking-widest group"
                      onClick={() => updateProfileMutation.mutate()} 
                      disabled={updateProfileMutation.isPending || isUploading}
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" /> saving...
                        </>
                      ) : (
                        <span className="flex items-center gap-2">
                          Save Changes <CheckCircle2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
