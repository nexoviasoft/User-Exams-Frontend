'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAppDispatch } from '@/store/hooks';
import { setAuth } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AuthLayout } from '@/components/auth/AuthLayout';
import axiosInstance from '@/lib/axios';

const loginSchema = z.object({
  email: z.string().email('সঠিক ইমেইল দিন'),
  password: z.string().min(6, 'পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে'),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    }
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      // Real API call or simulation
      // const response = await axiosInstance.post('/auth/login', data);
      // const { user, accessToken, role } = response.data;
      
      // Simulating API call for demonstration
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockRole = data.email.includes('admin') ? 'admin' : data.email.includes('teacher') ? 'teacher' : 'student';
      
      dispatch(setAuth({
        user: { id: '1', email: data.email, name: 'John Doe', role: mockRole as any },
        accessToken: 'mock-jwt-token',
        role: mockRole as any
      }));
      
      toast.success('সফলভাবে লগইন হয়েছে!');
      router.push(`/${mockRole}/dashboard`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'লগইন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout tagline="আবার স্বাগতম! 👋">
      <div className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-4xl font-display font-bold text-text-primary">Login করুন</h2>
          <p className="text-text-secondary">আপনার একাউন্টে প্রবেশ করতে নিচের তথ্যগুলো দিন</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
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
                  className="w-full bg-bg-surface border border-border rounded-2xl py-3.5 pl-12 pr-4 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
              {errors.email && <p className="text-xs text-danger ml-1">{errors.email.message}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-medium text-text-secondary">Password</label>
                <Link href="#" className="text-xs text-primary hover:underline font-medium">পাসওয়ার্ড ভুলে গেছেন?</Link>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full bg-bg-surface border border-border rounded-2xl py-3.5 pl-12 pr-12 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-danger ml-1">{errors.password.message}</p>}
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2 ml-1">
              <input
                {...register('rememberMe')}
                type="checkbox"
                id="rememberMe"
                className="w-4 h-4 rounded border-border bg-bg-surface text-primary focus:ring-primary/50"
              />
              <label htmlFor="rememberMe" className="text-sm text-text-secondary cursor-pointer select-none">মনে রাখো</label>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-accent hover:bg-accent-light text-white font-bold h-14 rounded-2xl text-lg shadow-[0_10px_20px_rgba(255,107,0,0.2)] transition-all active:scale-[0.98]"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : 'Login'}
          </Button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-bg-dark px-4 text-text-secondary font-medium tracking-widest">— অথবা —</span>
            </div>
          </div>

          <p className="text-center text-text-secondary">
            নতুন account? {' '}
            <Link href="/register" className="text-primary hover:underline font-bold">Register করুন</Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
}
