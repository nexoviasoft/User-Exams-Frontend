'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Mail, Lock, User, Eye, EyeOff, Loader2, Phone, Building, BookOpen, Sparkles, ShieldCheck, Zap, ArrowRight, Layers } from 'lucide-react';
import Link from 'next/link';
import { useAppDispatch } from '@/store/hooks';
import { setAuth } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { cn } from '@/lib/utils';
import axiosInstance from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

const registerSchema = z.object({
  name: z.string().min(2, 'নাম অন্তত ২ অক্ষরের হতে হবে'),
  email: z.string().email('সঠিক ইমেইল দিন'),
  phone: z.string().min(11, 'সঠিক মোবাইল নাম্বার দিন'),
  institute: z.string().min(2, 'প্রতিষ্ঠানের নাম দিন'),
  department: z.string().min(2, 'ডিপার্টমেন্টের নাম দিন'),
  candidateTypes: z.array(z.string()).min(1, 'অন্তত একটি ধরন নির্বাচন করুন'),
  password: z.string().min(6, 'পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে'),
  confirmPassword: z.string(),
  role: z.literal('student'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "পাসওয়ার্ড ম্যাচ করেনি",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

type CandidateType = {
  id: string;
  name: string;
};

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'student',
      candidateTypes: [],
    }
  });

  const password = watch('password', '');
  const { data: candidateTypeOptions = [], isLoading: candidateTypesLoading } = useQuery<CandidateType[]>({
    queryKey: ['candidate-types-register'],
    queryFn: async () => (await axiosInstance.get('/candidatetype')).data,
  });

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
      const payload = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        institute: data.institute,
        department: data.department,
        candidateTypes: data.candidateTypes,
        password: data.password,
        role: data.role,
      };

      const response = await axiosInstance.post('/auth/register', payload);
      
      dispatch(setAuth({
        user: { id: '2', email: data.email, name: data.name, role: data.role },
        accessToken: response.data.accessToken,
        role: data.role
      }));
      
      toast.success('রেজিস্ট্রেশন সফল হয়েছে!');
      router.push(`/${data.role}/dashboard`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'রেজিস্ট্রেশন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout tagline="Join our elite academic community! 🚀">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8 w-full max-w-2xl mx-auto"
      >
        {/* Header Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge className="bg-primary/10 text-primary border-none font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-lg">
              Onboarding
            </Badge>
          </div>
          <h2 className="text-4xl font-display font-black text-text-primary tracking-tight leading-tight">
            Create <span className="text-primary">Account</span> ✨
          </h2>
          <p className="text-text-secondary text-sm font-medium">
            Join thousands of students achieving excellence today.
          </p>
        </div>

        {/* Premium Form Card */}
        <div className="bg-bg-card/40 backdrop-blur-2xl border-2 border-border/50 rounded-[32px] p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -mr-24 -mt-24 group-hover:bg-primary/10 transition-colors" />
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 relative z-10">
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Name Field */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Identity</label>
                  <div className="relative group/input">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within/input:text-primary transition-colors">
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      {...register('name')}
                      type="text"
                      placeholder="Full Name"
                      className="w-full bg-bg-surface/50 border border-border/40 rounded-2xl py-4 pl-12 pr-4 text-text-primary font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all placeholder:text-text-secondary/30"
                    />
                  </div>
                  {errors.name && <p className="text-[10px] font-bold text-danger ml-1 uppercase tracking-wider">{errors.name.message}</p>}
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Email</label>
                  <div className="relative group/input">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within/input:text-primary transition-colors">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="example@mail.com"
                      className="w-full bg-bg-surface/50 border border-border/40 rounded-2xl py-4 pl-12 pr-4 text-text-primary font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all placeholder:text-text-secondary/30"
                    />
                  </div>
                  {errors.email && <p className="text-[10px] font-bold text-danger ml-1 uppercase tracking-wider">{errors.email.message}</p>}
                </div>

                {/* Phone Field */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Mobile</label>
                  <div className="relative group/input">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within/input:text-primary transition-colors">
                      <Phone className="w-5 h-5" />
                    </div>
                    <input
                      {...register('phone')}
                      type="tel"
                      placeholder="01XXXXXXXXX"
                      className="w-full bg-bg-surface/50 border border-border/40 rounded-2xl py-4 pl-12 pr-4 text-text-primary font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all placeholder:text-text-secondary/30"
                    />
                  </div>
                  {errors.phone && <p className="text-[10px] font-bold text-danger ml-1 uppercase tracking-wider">{errors.phone.message}</p>}
                </div>

                {/* Institute Field */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Institution</label>
                  <div className="relative group/input">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within/input:text-primary transition-colors">
                      <Building className="w-5 h-5" />
                    </div>
                    <input
                      {...register('institute')}
                      type="text"
                      placeholder="School/College Name"
                      className="w-full bg-bg-surface/50 border border-border/40 rounded-2xl py-4 pl-12 pr-4 text-text-primary font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all placeholder:text-text-secondary/30"
                    />
                  </div>
                  {errors.institute && <p className="text-[10px] font-bold text-danger ml-1 uppercase tracking-wider">{errors.institute.message}</p>}
                </div>

                {/* Department Field */}
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Specialization</label>
                  <div className="relative group/input">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within/input:text-primary transition-colors">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <input
                      {...register('department')}
                      type="text"
                      placeholder="e.g., CSE, Science, Commerce"
                      className="w-full bg-bg-surface/50 border border-border/40 rounded-2xl py-4 pl-12 pr-4 text-text-primary font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all placeholder:text-text-secondary/30"
                    />
                  </div>
                  {errors.department && <p className="text-[10px] font-bold text-danger ml-1 uppercase tracking-wider">{errors.department.message}</p>}
                </div>
              </div>

              {/* Candidate Types (Premium Cards) */}
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Candidate Profile</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {candidateTypesLoading ? (
                    <div className="sm:col-span-3 flex items-center justify-center py-6">
                       <Loader2 className="w-6 h-6 animate-spin text-primary/40" />
                    </div>
                  ) : candidateTypeOptions.length === 0 ? (
                    <div className="sm:col-span-3 text-center py-6 opacity-40">No profiles found</div>
                  ) : (
                    candidateTypeOptions.map((type) => {
                      const isSelected = watch('candidateTypes')?.includes(type.id);
                      return (
                        <label 
                          key={type.id} 
                          className={cn(
                            "flex items-center gap-3 p-4 border-2 rounded-[20px] cursor-pointer transition-all duration-300 relative overflow-hidden group/profile",
                            isSelected ? "bg-primary/5 border-primary/40 shadow-lg shadow-primary/5" : "bg-bg-surface/30 border-border/20 hover:border-border/40 opacity-70 hover:opacity-100"
                          )}
                        >
                          <input
                            type="checkbox"
                            value={type.id}
                            {...register('candidateTypes')}
                            className="hidden"
                          />
                          <div className={cn(
                            "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
                            isSelected ? "bg-primary border-primary text-white" : "border-border/40"
                          )}>
                             {isSelected && <Zap className="w-3 h-3 fill-current" />}
                          </div>
                          <span className={cn("text-[11px] font-black uppercase tracking-widest transition-colors", isSelected ? "text-primary" : "text-text-secondary")}>
                            {type.name}
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
                {errors.candidateTypes && <p className="text-[10px] font-bold text-danger ml-1 uppercase tracking-wider">{errors.candidateTypes.message}</p>}
              </div>

              {/* Password Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Password</label>
                  <div className="relative group/input">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within/input:text-primary transition-colors">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="w-full bg-bg-surface/50 border border-border/40 rounded-2xl py-4 pl-12 pr-12 text-text-primary font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all placeholder:text-text-secondary/30"
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
                  <div className="flex gap-1.5 h-1 w-full bg-bg-surface/50 rounded-full mt-3 overflow-hidden">
                    {[1, 2, 3, 4].map((i) => (
                      <div 
                        key={i}
                        className={cn(
                          "flex-1 transition-all duration-500 rounded-full",
                          strength >= i * 25 ? (strength <= 25 ? "bg-danger" : strength <= 50 ? "bg-warning" : "bg-primary") : "bg-border/20"
                        )}
                      />
                    ))}
                  </div>
                  {errors.password && <p className="text-[10px] font-bold text-danger ml-1 uppercase tracking-wider">{errors.password.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Verify</label>
                  <div className="relative group/input">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within/input:text-primary transition-colors">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      {...register('confirmPassword')}
                      type="password"
                      placeholder="Verify Password"
                      className="w-full bg-bg-surface/50 border border-border/40 rounded-2xl py-4 pl-12 pr-4 text-text-primary font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all placeholder:text-text-secondary/30"
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-[10px] font-bold text-danger ml-1 uppercase tracking-wider">{errors.confirmPassword.message}</p>}
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary-light text-white font-black h-14 rounded-2xl text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 transition-all active:scale-[0.98] group"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> Initializing...
                </div>
              ) : (
                <div className="flex items-center">
                  Establish Account <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </Button>

            <div className="flex items-center justify-center gap-6 pt-2 border-t border-border/10 opacity-40">
                <div className="flex items-center gap-1.5">
                   <ShieldCheck className="w-4 h-4 text-success" />
                   <span className="text-[8px] font-black uppercase tracking-widest">Vault Security</span>
                </div>
                <div className="flex items-center gap-1.5">
                   <Layers className="w-4 h-4 text-accent" />
                   <span className="text-[8px] font-black uppercase tracking-widest">Multi-Profile</span>
                </div>
            </div>
          </form>
        </div>

        <p className="text-center text-text-secondary text-sm font-medium">
          Already have an account? {' '}
          <Link href="/login" className="text-primary hover:text-primary-light font-black uppercase tracking-widest text-xs ml-1 transition-colors">
            Authorize <Sparkles className="w-3.5 h-3.5 inline-block ml-1" />
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  );
}
