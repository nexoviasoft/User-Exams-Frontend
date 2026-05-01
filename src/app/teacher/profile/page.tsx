'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Camera } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';
import { useImgbbUpload } from '@/hooks/useImgbbUpload';

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
      <div className="max-w-4xl mx-auto space-y-6 pb-20">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">My Profile</h1>
          <p className="text-text-secondary mt-1">আপনার profile info update করুন।</p>
        </div>

        <Card className="border-border bg-bg-card/50">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Teacher Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profileLoading ? (
              <p className="text-sm text-text-secondary">Profile loading...</p>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <img
                    src={photo || 'https://placehold.co/120x120/png'}
                    alt="Teacher profile"
                    className="w-24 h-24 rounded-full object-cover border border-border"
                  />
                  <div className="space-y-2">
                    <label className="text-xs text-text-secondary flex items-center gap-1">
                      <Camera className="w-3 h-3" /> Upload profile image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      className="text-sm"
                      onChange={(e) => handleProfilePhotoUpload(e.target.files?.[0])}
                      disabled={isUploading}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    className="w-full bg-bg-surface border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <input
                    className="w-full bg-bg-surface border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <input
                    className="w-full bg-bg-surface border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Education"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                  />
                  <input
                    className="w-full bg-bg-surface border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Platform Name"
                    value={platformName}
                    onChange={(e) => setPlatformName(e.target.value)}
                  />
                  <input
                    className="w-full bg-bg-surface border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 md:col-span-2"
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={() => updateProfileMutation.mutate()}
                    disabled={updateProfileMutation.isPending || isUploading}
                  >
                    {updateProfileMutation.isPending ? 'Saving...' : 'Update Profile'}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
