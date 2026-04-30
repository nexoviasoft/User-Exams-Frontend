'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Mail, Lock, User, Eye, EyeOff, Loader2, BookOpen, PenTool, TrendingUp, Phone, Monitor, MapPin, Camera } from 'lucide-react';
import Link from 'next/link';
import { useAppDispatch } from '@/store/hooks';
import { setAuth } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { GraduationCap } from 'lucide-react';
import axiosInstance from '@/lib/axios';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(11, 'Enter a valid phone number'),
  education: z.string().min(2, 'Education is required'),
  platformName: z.string().min(2, 'Platform name is required'),
  location: z.string().min(2, 'Location is required'),
  photo: z.any().optional(), // In a real app you'd validate File type
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.literal('teacher'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function JoinTeacherPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'teacher',
    }
  });

  const password = watch('password', '');

  const getPasswordStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const strength = getPasswordStrength();

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post('/auth/register', data);
      
      if (response.data.isPending) {
        toast.success(response.data.message || 'Registration successful! Pending approval.');
        router.push('/login');
      } else {
        // Fallback if tokens are returned (shouldn't happen for teachers)
        dispatch(setAuth({
          user: { id: '3', email: data.email, name: data.name, role: data.role },
          accessToken: response.data.accessToken,
          role: data.role
        }));
        toast.success('Registration successful!');
        router.push(`/teacher/dashboard`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue('photo', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const steps = [
    {
      icon: BookOpen,
      title: 'Create Question Bank',
      desc: 'Add thousands of MCQs easily and categorize them.'
    },
    {
      icon: PenTool,
      title: 'Setup Exams',
      desc: 'Create live exams, set timers, and define pricing.'
    },
    {
      icon: TrendingUp,
      title: 'Earn & Analyze',
      desc: 'Students take your exams, and you earn directly to your dashboard.'
    }
  ];

  return (
    <div className="min-h-screen bg-bg-dark text-text-primary flex flex-col md:flex-row">
      {/* Left side: Steps & Info */}
      <div className="w-full md:w-5/12 lg:w-1/3 bg-bg-surface p-8 md:p-12 flex flex-col justify-center relative overflow-hidden border-b md:border-b-0 md:border-r border-border hidden md:flex">
        {/* Decorative background elements */}
        <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-accent/20 rounded-full blur-[80px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />
        
        <div className="relative z-10 max-w-lg mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 mb-12">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="text-white w-5 h-5" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">
              PolyExam<span className="text-primary">Buzz</span><span className="text-accent">.</span>
            </span>
          </Link>

          <h1 className="text-3xl md:text-5xl font-display font-bold mb-6">
            Join as a <span className="text-accent">Teacher</span>
          </h1>
          <p className="text-text-secondary text-lg mb-12">
            Empower students with your knowledge and build a new source of income. Here is how it works:
          </p>

          <div className="space-y-8">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-xl bg-bg-dark border border-border flex items-center justify-center shrink-0 shadow-sm">
                  <step.icon className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{step.title}</h3>
                  <p className="text-text-secondary">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side: Form */}
      <div className="w-full md:w-7/12 lg:w-2/3 p-4 sm:p-8 md:p-12 flex items-center justify-center h-screen overflow-y-auto">
        <div className="w-full max-w-2xl space-y-8 py-8">
          
          {/* Mobile Header (Hidden on Desktop) */}
          <div className="md:hidden flex flex-col items-center text-center space-y-4 mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <GraduationCap className="text-white w-5 h-5" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight">
                PolyExam<span className="text-primary">Buzz</span><span className="text-accent">.</span>
              </span>
            </Link>
            <h1 className="text-3xl font-display font-bold">
              Join as a <span className="text-accent">Teacher</span>
            </h1>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-display font-bold">Create Account</h2>
            <p className="text-text-secondary">Fill the form below to get started</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Photo Upload */}
            <div className="flex flex-col items-center sm:items-start space-y-3">
              <label className="text-sm font-medium text-text-secondary ml-1">Profile Photo</label>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-bg-surface relative group">
                  {previewImage ? (
                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-8 h-8 text-text-secondary" />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <div className="text-sm text-text-secondary">
                  <p>Upload a professional photo.</p>
                  <p className="text-xs mt-1">Format: JPG, PNG, max 2MB.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary ml-1">Full Name</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent transition-colors">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    {...register('name')}
                    type="text"
                    placeholder="Your Name"
                    className="w-full bg-bg-surface border border-border rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                  />
                </div>
                {errors.name && <p className="text-xs text-danger ml-1">{errors.name.message}</p>}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary ml-1">Email</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="example@mail.com"
                    className="w-full bg-bg-surface border border-border rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                  />
                </div>
                {errors.email && <p className="text-xs text-danger ml-1">{errors.email.message}</p>}
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary ml-1">Phone Number</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent transition-colors">
                    <Phone className="w-5 h-5" />
                  </div>
                  <input
                    {...register('phone')}
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    className="w-full bg-bg-surface border border-border rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                  />
                </div>
                {errors.phone && <p className="text-xs text-danger ml-1">{errors.phone.message}</p>}
              </div>

              {/* Education Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary ml-1">Education</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent transition-colors">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <input
                    {...register('education')}
                    type="text"
                    placeholder="BSc in CSE, DU"
                    className="w-full bg-bg-surface border border-border rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                  />
                </div>
                {errors.education && <p className="text-xs text-danger ml-1">{errors.education.message}</p>}
              </div>

              {/* Platform Name Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary ml-1">Platform/Organization Name</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent transition-colors">
                    <Monitor className="w-5 h-5" />
                  </div>
                  <input
                    {...register('platformName')}
                    type="text"
                    placeholder="Exam Buzz Academy"
                    className="w-full bg-bg-surface border border-border rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                  />
                </div>
                {errors.platformName && <p className="text-xs text-danger ml-1">{errors.platformName.message}</p>}
              </div>

              {/* Location Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary ml-1">Location</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent transition-colors">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <input
                    {...register('location')}
                    type="text"
                    placeholder="Dhaka, Bangladesh"
                    className="w-full bg-bg-surface border border-border rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                  />
                </div>
                {errors.location && <p className="text-xs text-danger ml-1">{errors.location.message}</p>}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full bg-bg-surface border border-border rounded-2xl py-3.5 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {/* Strength Indicator */}
                <div className="h-1.5 w-full bg-bg-surface rounded-full mt-2 overflow-hidden border border-border">
                  <div 
                    className={cn(
                      "h-full transition-all duration-500",
                      strength <= 25 ? "bg-danger" : strength <= 50 ? "bg-warning" : strength <= 75 ? "bg-accent" : "bg-success"
                    )}
                    style={{ width: `${strength}%` }}
                  />
                </div>
                {errors.password && <p className="text-xs text-danger ml-1">{errors.password.message}</p>}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary ml-1">Confirm Password</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    {...register('confirmPassword')}
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-bg-surface border border-border rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                  />
                </div>
                {errors.confirmPassword && <p className="text-xs text-danger ml-1">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-accent hover:bg-accent-light text-white font-bold h-14 rounded-2xl text-lg shadow-[0_10px_20px_rgba(255,107,0,0.2)] transition-all active:scale-[0.98] mt-4"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : 'Register as Teacher'}
            </Button>

            <p className="text-center text-text-secondary">
              Already have an account? {' '}
              <Link href="/login" className="text-accent hover:underline font-bold">Login</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
