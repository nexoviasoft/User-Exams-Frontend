'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Camera, User, Phone, GraduationCap, MapPin, Globe, Loader2, Sparkles, CheckCircle2, Save, Info, BadgeCheck } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';
import { useImgbbUpload } from '@/hooks/useImgbbUpload';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

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

type TeacherProfileResponse = {
  id: string;
  name: string;
  email: string;
  teacher?: {
    phone?: string;
    education?: string;
    platformName?: string;
    location?: string;
    photo?: string;
  } | null;
};

export default function TeacherProfilePage() {
  const { uploadImage, isUploading } = useImgbbUpload();
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useQuery<TeacherProfileResponse>({
    queryKey: ['teacher-profile'],
    queryFn: async () => (await axiosInstance.get('/auth/me')).data,
  });

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [education, setEducation] = useState('');
  const [platformName, setPlatformName] = useState('');
  const [location, setLocation] = useState('');
  const [photo, setPhoto] = useState('');

  useEffect(() => {
    if (!profile) return;
    setName(profile.name || '');
    setPhone(profile.teacher?.phone || '');
    setEducation(profile.teacher?.education || '');
    setPlatformName(profile.teacher?.platformName || '');
    setLocation(profile.teacher?.location || '');
    setPhoto(profile.teacher?.photo || '');
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: async () =>
      (
        await axiosInstance.patch('/auth/teacher/profile', {
          name,
          phone,
          education,
          platformName,
          location,
          photo,
        })
      ).data,
    onSuccess: async () => {
      toast.success('Professional profile updated successfully');
      await refetchProfile();
    },
    onError: () => toast.error('Failed to update profile. Please check your network.'),
  });

  const handleProfilePhotoUpload = async (file?: File) => {
    if (!file) return;
    try {
      const uploadedUrl = await uploadImage(file);
      setPhoto(uploadedUrl);
      toast.success('Professional portrait uploaded');
    } catch (error: any) {
      toast.error(error?.message || 'Media upload failed');
    }
  };

  return (
    <DashboardLayout>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto space-y-10 relative px-4 pb-20"
      >
        {/* Background Decorative Glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col items-center text-center space-y-2 relative z-10">
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black px-4 py-1 rounded-xl uppercase tracking-[0.3em] text-[9px]">
            Account Management
          </Badge>
          <h1 className="text-3xl md:text-5xl font-display font-black tracking-tight text-text-primary leading-tight">
            Professional <span className="text-primary">Profile</span> 👤
          </h1>
          <p className="text-text-secondary text-lg max-w-xl font-medium">
            Maintain your identity and professional credentials within the platform.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="relative z-10">
          <Card className="border-border/50 bg-bg-card/40 backdrop-blur-xl rounded-[28px] overflow-hidden border-2 shadow-2xl">
            <CardHeader className="p-6 pb-2 border-b border-border/20">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <BadgeCheck className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-display font-black text-text-primary">Teacher Credentials</CardTitle>
                  <p className="text-[9px] font-black uppercase tracking-widest text-text-secondary opacity-60">Verified Instructor Profile</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              {profileLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="w-12 h-12 animate-spin text-primary opacity-20" />
                  <p className="text-text-secondary font-black animate-pulse uppercase tracking-widest text-xs">Accessing profile data...</p>
                </div>
              ) : (
                <div className="space-y-12">
                  {/* Photo Section */}
                  <div className="flex flex-col md:flex-row items-center gap-10">
                    <div className="relative group">
                       <div className="absolute -inset-1 bg-gradient-to-tr from-primary to-accent rounded-full blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                       <div className="relative w-32 h-32 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-bg-surface">
                          <img
                            src={photo || 'https://placehold.co/256x256/0052cc/ffffff?text=Profile'}
                            alt="Teacher portrait"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          {isUploading && (
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                              <Loader2 className="w-8 h-8 animate-spin text-white" />
                            </div>
                          )}
                       </div>
                       <label className="absolute bottom-1 right-1 w-10 h-10 bg-primary hover:bg-primary-light text-white rounded-2xl shadow-xl flex items-center justify-center cursor-pointer transition-all active:scale-90 border-2 border-white">
                          <Camera className="w-4 h-4" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleProfilePhotoUpload(e.target.files?.[0])}
                            disabled={isUploading}
                          />
                       </label>
                    </div>
                    <div className="flex-1 text-center md:text-left space-y-2">
                       <h3 className="text-2xl font-display font-black text-text-primary">{name || 'Instructor Name'}</h3>
                       <p className="text-sm font-bold text-text-secondary flex items-center justify-center md:justify-start gap-2">
                         <span className="w-2 h-2 rounded-full bg-success animate-pulse" /> Account Status: Active Instructor
                       </p>
                       <p className="text-xs text-text-secondary max-w-sm opacity-60">Upload a professional portrait for better trust with students.</p>
                    </div>
                  </div>

                  {/* Form Grid */}
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary ml-1">Full Legal Name</label>
                      <div className="relative group">
                         <User className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary group-focus-within:text-primary transition-colors" />
                         <input
                          className="w-full bg-bg-surface/50 border border-border/40 rounded-[14px] h-12 pl-12 pr-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-text-primary shadow-inner"
                          placeholder="Your full name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary ml-1">Contact Number</label>
                      <div className="relative group">
                         <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary group-focus-within:text-primary transition-colors" />
                         <input
                          className="w-full bg-bg-surface/50 border border-border/40 rounded-[14px] h-12 pl-12 pr-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-text-primary shadow-inner"
                          placeholder="Phone number"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary ml-1">Education Background</label>
                      <div className="relative group">
                         <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary group-focus-within:text-primary transition-colors" />
                         <input
                          className="w-full bg-bg-surface/50 border border-border/40 rounded-[14px] h-12 pl-12 pr-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-text-primary shadow-inner"
                          placeholder="Degree / Specialization"
                          value={education}
                          onChange={(e) => setEducation(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary ml-1">Platform Alias</label>
                      <div className="relative group">
                         <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary group-focus-within:text-primary transition-colors" />
                         <input
                          className="w-full bg-bg-surface/50 border border-border/40 rounded-[14px] h-12 pl-12 pr-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-text-primary shadow-inner"
                          placeholder="Public brand name"
                          value={platformName}
                          onChange={(e) => setPlatformName(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-text-secondary ml-1">Current Residence / Location</label>
                      <div className="relative group">
                         <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary group-focus-within:text-primary transition-colors" />
                         <input
                          className="w-full bg-bg-surface/50 border border-border/40 rounded-[14px] h-12 pl-12 pr-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-text-primary shadow-inner"
                          placeholder="City / Region"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t border-border/20">
                    <div className="flex items-start gap-4 max-w-sm">
                      <Info className="w-5 h-5 text-primary opacity-40 mt-1 shrink-0" />
                      <p className="text-[11px] font-medium text-text-secondary leading-relaxed">
                        Changes to your professional profile are reflected platform-wide. Ensure your credentials are accurate for student verification.
                      </p>
                    </div>
                    <Button
                      onClick={() => updateProfileMutation.mutate()}
                      disabled={updateProfileMutation.isPending || isUploading}
                      className="w-full md:w-auto bg-primary hover:bg-primary-light text-white font-black rounded-2xl h-14 px-12 shadow-2xl shadow-primary/30 transition-all hover:-translate-y-1 uppercase tracking-widest text-xs"
                    >
                      {updateProfileMutation.isPending ? (
                        <Loader2 className="w-5 h-5 animate-spin mr-3" />
                      ) : (
                        <span className="flex items-center gap-3">
                          <Save className="w-4 h-4" /> Save Professional Changes
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
