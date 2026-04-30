'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Mail, Lock, User, Eye, EyeOff, Loader2, GraduationCap, Users } from 'lucide-react';
import Link from 'next/link';
import { useAppDispatch } from '@/store/hooks';
import { setAuth } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { cn } from '@/lib/utils';

const registerSchema = z.object({
  name: z.string().min(2, 'নাম অন্তত ২ অক্ষরের হতে হবে'),
  email: z.string().email('সঠিক ইমেইল দিন'),
  password: z.string().min(6, 'পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে'),
  confirmPassword: z.string(),
  role: z.enum(['student', 'teacher'], {
    errorMap: () => ({ message: 'একটি রোল সিলেক্ট করুন' }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "পাসওয়ার্ড ম্যাচ করেনি",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
      role: 'student',
    }
  });

  const selectedRole = watch('role');
  const password = watch('password', '');

  // Simple password strength calculation
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
      // Simulation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      dispatch(setAuth({
        user: { id: '2', email: data.email, name: data.name, role: data.role },
        accessToken: 'mock-jwt-token-new',
        role: data.role
      }));
      
      toast.success('রেজিস্ট্রেশন সফল হয়েছে!');
      router.push(`/${data.role}/dashboard`);
    } catch (error: any) {
      toast.error('রেজিস্ট্রেশন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout tagline="আমাদের সাথে যোগ দিন! 🚀">
      <div className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-4xl font-display font-bold text-text-primary">একাউন্ট তৈরি করুন</h2>
          <p className="text-text-secondary">শুরু করতে নিচের ফরমটি পূরণ করুন</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            {/* Name Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary ml-1">Full Name</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors">
                  <User className="w-5 h-5" />
                </div>
                <input
                  {...register('name')}
                  type="text"
                  placeholder="আপনার নাম"
                  className="w-full bg-bg-surface border border-border rounded-2xl py-3.5 pl-12 pr-4 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
              {errors.name && <p className="text-xs text-danger ml-1">{errors.name.message}</p>}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary ml-1">Email</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="example@mail.com"
                  className="w-full bg-bg-surface border border-border rounded-2xl py-3.5 pl-12 pr-4 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
              {errors.email && <p className="text-xs text-danger ml-1">{errors.email.message}</p>}
            </div>

            {/* Role Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-text-secondary ml-1">আপনি কি হিসেবে যোগ দিতে চান?</label>
              <div className="grid grid-cols-2 gap-4">
                <div
                  onClick={() => setValue('role', 'student')}
                  className={cn(
                    "cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                    selectedRole === 'student' 
                      ? "border-primary bg-primary/10 shadow-[0_0_15px_rgba(0,82,204,0.2)]" 
                      : "border-border bg-bg-surface hover:border-primary/50"
                  )}
                >
                  <GraduationCap className={cn("w-8 h-8", selectedRole === 'student' ? "text-primary" : "text-text-secondary")} />
                  <span className={cn("font-bold text-sm", selectedRole === 'student' ? "text-primary" : "text-text-secondary")}>Student</span>
                </div>
                <div
                  onClick={() => setValue('role', 'teacher')}
                  className={cn(
                    "cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                    selectedRole === 'teacher' 
                      ? "border-accent bg-accent/10 shadow-[0_0_15px_rgba(255,107,0,0.2)]" 
                      : "border-border bg-bg-surface hover:border-accent/50"
                  )}
                >
                  <Users className={cn("w-8 h-8", selectedRole === 'teacher' ? "text-accent" : "text-text-secondary")} />
                  <span className={cn("font-bold text-sm", selectedRole === 'teacher' ? "text-accent" : "text-text-secondary")}>Teacher</span>
                </div>
              </div>
              {errors.role && <p className="text-xs text-danger ml-1">{errors.role.message}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary ml-1">Password</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full bg-bg-surface border border-border rounded-2xl py-3.5 pl-12 pr-12 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
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
                    strength <= 25 ? "bg-danger" : strength <= 50 ? "bg-warning" : strength <= 75 ? "bg-primary" : "bg-success"
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
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  {...register('confirmPassword')}
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-bg-surface border border-border rounded-2xl py-3.5 pl-12 pr-4 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
              {errors.confirmPassword && <p className="text-xs text-danger ml-1">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary-light text-white font-bold h-14 rounded-2xl text-lg shadow-[0_10px_20px_rgba(0,82,204,0.2)] transition-all active:scale-[0.98]"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : 'Register'}
          </Button>

          <p className="text-center text-text-secondary">
            আগেই একাউন্ট আছে? {' '}
            <Link href="/login" className="text-primary hover:underline font-bold">Login করুন</Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
}
